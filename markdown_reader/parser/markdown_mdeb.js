// markdown_mdeb.js
// Unified MDEB Loader - Handles file structure, metadata, and all media formats
// Media processing is left to the markdown parser

(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['./front-matter'], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('./front-matter'));
    } else {
        root.MdebLoader = factory(root.FrontMatter);
    }
}(typeof self !== 'undefined' ? self : this, function(FrontMatter) {
    'use strict';

    // ===== CONFIGURATION =====
    const CONFIG = {
        supportedExtensions: ['.md', '.markdown', '.txt', '.mdeb'],
        // Media formats supported by the parser (from markdown_stable.js)
        imageExtensions: ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.bmp'],
        videoExtensions: ['.mp4', '.webm', '.ogg', '.mov', '.mkv', '.avi'],
        audioExtensions: ['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac'],
        bookFolderNames: ['book', 'content', 'chapters', 'manuscript'],
        chapterPatterns: [
            /^\d+[A-Z]?_.*\.md$/i,           // 01A_about.md, 01B_contents.md
            /^chapter\d+\.md$/i,              // chapter1.md, chapter2.md
            /^[A-Z]\d+_.*\.md$/i,              // Z98_epilogue.md
            /^[a-z]+_\d+\.md$/i,               // prologue_01.md
            /^\d+[-_].*\.md$/i,                 // 01-about.md, 01_about.md
            /^[A-Z]{1,3}_.*\.md$/i              // TOC.md, APP_01.md
        ],
        mdebEntryPoints: ['book.md', 'index.md', 'README.md', 'content.md'],
        maxImageSize: 10 * 1024 * 1024, // 10MB - keep for backward compatibility
        debug: false // Set to false to disable internal logging
    };

    // Combine all media extensions for easy checking
    const ALL_MEDIA_EXTENSIONS = new Set([
        ...CONFIG.imageExtensions,
        ...CONFIG.videoExtensions,
        ...CONFIG.audioExtensions
    ]);

    // ===== STATE =====
    let currentMdebMap = new Map(); // Path -> MdebStructure
    let loadedMetadata = new Map();  // Cache for metadata files
    let currentFiles = [];

    // ===== DATA STRUCTURES =====

    /**
     * Represents a processed .mdeb with book structure
     */
    class MdebStructure {
        constructor(path, name) {
            this.path = path;
            this.name = name;
            this.rootFiles = [];           // Files in .mdeb root (including metadata.md)
            this.bookFolder = null;         // Book folder if found
            this.bookFiles = [];            // Files inside book folder
            this.images = [];                // Track images (for backward compatibility)
            this.videos = [];                 // Track video files
            this.audio = [];                   // Track audio files
            this.mediaFiles = [];            // Track ALL media files
            this.metadataFile = null;        // metadata.md file (from root)
            this.bookMetadata = null;        // Parsed metadata from metadata.md (LOADED ONCE)
            this.metadataLoaded = false;     // Flag to prevent multiple loads
            this.totalSize = 0;
            this.hasBookFolder = false;
            this.chapters = [];               // Sorted chapters
        }

        addFile(file) {
            const filePath = file.webkitRelativePath || file.name;
            const pathParts = filePath.replace(this.path, '').split('/').filter(p => p);
            
            // Check if this is metadata.md (in root of .mdeb)
            if ((file.name.toLowerCase() === 'metadata.md' || 
                 file.name.toLowerCase() === 'metadata.markdown') && 
                pathParts.length === 1) {  // Must be in root, not in subfolder
                this.metadataFile = file;
            }
            
            // Check if this is a media file (image, video, or audio)
            const ext = '.' + file.name.split('.').pop().toLowerCase();
            if (ALL_MEDIA_EXTENSIONS.has(ext)) {
                this.mediaFiles.push(file);
                
                // Categorize by type
                if (CONFIG.imageExtensions.includes(ext)) {
                    this.images.push(file);
                } else if (CONFIG.videoExtensions.includes(ext)) {
                    this.videos.push(file);
                } else if (CONFIG.audioExtensions.includes(ext)) {
                    this.audio.push(file);
                }
            }
            
            // Determine location
            if (pathParts.length === 1) {
                // Root of .mdeb
                this.rootFiles.push(file);
            } else if (pathParts.length >= 2) {
                // Check first directory
                const firstDir = pathParts[0].toLowerCase();
                
                if (CONFIG.bookFolderNames.includes(firstDir)) {
                    // Inside a book folder!
                    this.hasBookFolder = true;
                    this.bookFolder = pathParts[0];
                    this.bookFiles.push(file);
                    
                    // Check if it's a markdown file that might be a chapter
                    if (ext === '.md' || ext === '.markdown' || ext === '.txt') {
                        const relativePath = pathParts.slice(1).join('/');
                        const fileName = pathParts[pathParts.length - 1];
                        
                        // Determine if this is a chapter
                        if (this.isChapterFile(fileName, relativePath)) {
                            this.chapters.push({
                                file: file,
                                name: fileName,
                                path: relativePath,
                                order: this.getChapterOrder(fileName, relativePath),
                                title: this.extractTitleFromPath(fileName)
                            });
                        }
                    }
                }
            }
            
            this.totalSize += file.size;
        }

        /**
         * Check if a file should be considered a chapter
         */
        isChapterFile(fileName, relativePath) {
            // Check against patterns
            for (const pattern of CONFIG.chapterPatterns) {
                if (pattern.test(fileName)) {
                    return true;
                }
            }
            
            // Check if it's in a subdirectory (likely a chapter)
            if (relativePath.includes('/') && 
                !relativePath.startsWith('images/') && 
                !relativePath.startsWith('videos/') && 
                !relativePath.startsWith('audio/') && 
                !relativePath.startsWith('media/')) {
                return true;
            }
            
            return false;
        }

        /**
         * Get numeric order for chapter sorting
         */
        getChapterOrder(fileName, relativePath) {
            // Extract numeric order from filename
            const numMatch = fileName.match(/^(\d+)/);
            if (numMatch) {
                return parseInt(numMatch[1], 10);
            }
            
            // Extract letter-based order (A=1, B=2, etc.)
            const letterMatch = fileName.match(/^([A-Z])(\d+)?/);
            if (letterMatch) {
                const letter = letterMatch[1].toUpperCase().charCodeAt(0) - 64;
                const num = letterMatch[2] ? parseInt(letterMatch[2], 10) : 0;
                return letter * 100 + num;
            }
            
            // Default to alphabetical
            return 999 + fileName.charCodeAt(0) || 1000;
        }

        /**
         * Extract a readable title from filename
         */
        extractTitleFromPath(fileName) {
            // Remove prefix and extension
            let title = fileName.replace(/^\d+[A-Z]?_/, '')
                                .replace(/^chapter\d+_?/i, '')
                                .replace(/\.md$/, '')
                                .replace(/\.markdown$/, '')
                                .replace(/_/g, ' ')
                                .replace(/-/g, ' ');
            
            // Capitalize
            return title.split(' ').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
        }

        sortChapters() {
            this.chapters.sort((a, b) => a.order - b.order);
        }

        getEntryPoint() {
            // If we have a book folder with chapters, return the first chapter
            if (this.hasBookFolder && this.chapters.length > 0) {
                this.sortChapters();
                return this.chapters[0].file;
            }
            
            // Otherwise look for standard entry points in root
            for (const ep of CONFIG.mdebEntryPoints) {
                const found = this.rootFiles.find(f => f.name.toLowerCase() === ep);
                if (found) return found;
            }
            
            // Fallback to any .md file in root (excluding metadata.md)
            return this.rootFiles.find(f => 
                f.name.endsWith('.md') && 
                f.name.toLowerCase() !== 'metadata.md' &&
                f.name.toLowerCase() !== 'metadata.markdown'
            );
        }

        getAllChapters() {
            this.sortChapters();
            return this.chapters;
        }

        /**
         * Load book metadata ONCE and cache it for all chapters
         */
        async ensureBookMetadata() {
            if (this.metadataLoaded) {
                return this.bookMetadata;
            }
            
            this.metadataLoaded = true;
            
            if (!this.metadataFile) {
                this.bookMetadata = {};
                return {};
            }
            
            try {
                const text = await this.metadataFile.text();
                const { metadata } = FrontMatter.extract(text);
                
                // Ensure display_title is set
                if (!metadata.display_title && metadata.title) {
                    metadata.display_title = metadata.title;
                }
                
                // Mark as external metadata
                metadata._external = true;
                metadata._externalFile = 'metadata.md';
                metadata._externalPath = this.path + 'metadata.md';
                
                this.bookMetadata = metadata;
                return metadata;
            } catch (error) {
                this.bookMetadata = {};
                return {};
            }
        }
    }

    // ===== UTILITY FUNCTIONS =====

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const units = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return (bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1) + ' ' + units[i];
    }

    function calculateTotalSize(files) {
        return files.reduce((total, file) => total + file.size, 0);
    }

    /**
     * Read file as data URL (kept for backward compatibility only)
     */
    function readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    /**
     * Extract .mdeb info from file path
     * More robust detection of .mdeb folders in paths
     */
    function extractMdebInfo(filePath) {
        if (!filePath) return null;
        
        // Look for .mdeb folder at any level with more flexible matching
        const match = filePath.match(/([^\/]+\.mdeb)(\/|$)/i);
        if (!match) return null;

        const folderName = match[1];
        
        // Find the position of the .mdeb folder in the path
        const mdebIndex = filePath.indexOf(folderName);
        if (mdebIndex === -1) return null;
        
        // Path should include the folder name and trailing slash
        const fullPath = filePath.substring(0, mdebIndex + folderName.length + 1);
        
        return {
            name: folderName,
            path: fullPath
        };
    }

    /**
     * Check if a file path is inside a .mdeb folder
     */
    function isInMdebFolder(filePath) {
        return filePath && /[^\/]+\.mdeb\//i.test(filePath);
    }

    // ===== MEDIA HANDLING =====

    /**
     * Find media file by path (works for images, videos, audio)
     */
    function findMediaFile(mediaPath, fileDir, mediaFiles) {
        const fullMediaPath = fileDir + mediaPath;
        
        return mediaFiles.find(f => {
            const fPath = f.webkitRelativePath || f.name;
            return fPath === fullMediaPath || f.name === mediaPath || fPath.endsWith(mediaPath);
        });
    }

    /**
     * Create a unified media map for ALL media types using Blob URLs
     * This ensures consistent handling for images, audio, and video
     */
    async function createMediaMap(content, basePath, mediaFiles) {
        // Match ALL media syntax: ![alt](path)
        const mediaRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
        const matches = [...content.matchAll(mediaRegex)];
        const mediaMap = new Map();
        
        console.log(`Found ${matches.length} media references in content`);
        
        for (const match of matches) {
            const mediaPath = match[2];
            
            // Skip external URLs
            if (mediaPath.startsWith('http://') || mediaPath.startsWith('https://') || mediaPath.startsWith('data:')) {
                continue;
            }
            
            const mediaFile = findMediaFile(mediaPath, basePath, mediaFiles);
            
            if (mediaFile) {
                try {
                    // Use Blob URL for ALL media types - consistent approach
                    const blobUrl = URL.createObjectURL(mediaFile);
                    mediaMap.set(mediaPath, blobUrl);
                    
                    // Store for cleanup
                    if (!window._mediaObjectUrls) {
                        window._mediaObjectUrls = [];
                    }
                    window._mediaObjectUrls.push(blobUrl);
                    
                    console.log(`Created Blob URL for: ${mediaPath} -> ${blobUrl}`);
                } catch (e) {
                    console.error(`Failed to process media: ${mediaPath}`, e);
                }
            } else {
                console.warn(`Media file not found: ${mediaPath} in ${basePath}`);
            }
        }
        
        console.log(`Media map created with ${mediaMap.size} entries`);
        return mediaMap;
    }

    // ===== METADATA HANDLING =====

    /**
     * Load metadata from a file (cached)
     */
    async function loadMetadataFromFile(file) {
        if (!file) return {};
        
        const cacheKey = file.webkitRelativePath || file.name;
        if (loadedMetadata.has(cacheKey)) {
            return loadedMetadata.get(cacheKey);
        }
        
        try {
            const text = await file.text();
            const { metadata } = FrontMatter.extract(text);
            
            // Ensure display_title is set
            if (!metadata.display_title && metadata.title) {
                metadata.display_title = metadata.title;
            }
            
            loadedMetadata.set(cacheKey, metadata);
            return metadata;
        } catch (error) {
            return {};
        }
    }

    // ===== MAIN API =====

    /**
     * Process files and detect .mdeb structures
     * Includes fallback detection for .mdeb folders
     */
    async function processFiles(files) {
        if (!files || files.length === 0) {
            throw new Error('No files provided');
        }

        const fileArray = Array.from(files);
        currentFiles = fileArray;
        const mdebMap = new Map();

        // First pass: identify all .mdeb folders
        fileArray.forEach(file => {
            const path = file.webkitRelativePath || file.name;
            
            // Try standard detection
            let mdebInfo = extractMdebInfo(path);
            
            // If standard detection fails, try direct folder name detection (fallback)
            if (!mdebInfo) {
                // Check if the path contains a folder ending with .mdeb
                const pathParts = path.split('/');
                for (let i = 0; i < pathParts.length; i++) {
                    if (pathParts[i].toLowerCase().endsWith('.mdeb')) {
                        const folderName = pathParts[i];
                        // Reconstruct the full path up to and including the .mdeb folder
                        const fullPath = pathParts.slice(0, i + 1).join('/') + '/';
                        mdebInfo = {
                            name: folderName,
                            path: fullPath
                        };
                        break;
                    }
                }
            }
            
            if (mdebInfo) {
                const { path: mdebPath, name: mdebName } = mdebInfo;
                
                if (!mdebMap.has(mdebPath)) {
                    mdebMap.set(mdebPath, new MdebStructure(mdebPath, mdebName));
                }
                
                const mdeb = mdebMap.get(mdebPath);
                mdeb.addFile(file);
            }
        });

        // Sort chapters in each mdeb
        mdebMap.forEach(mdeb => mdeb.sortChapters());

        currentMdebMap = mdebMap;

        // Build result summary with all media types
        const result = {
            totalFiles: fileArray.length,
            totalSize: calculateTotalSize(fileArray),
            formattedTotalSize: formatFileSize(calculateTotalSize(fileArray)),
            mdebCount: mdebMap.size,
            mdebFolders: Array.from(mdebMap.entries()).map(([path, mdeb]) => ({
                path,
                name: mdeb.name,
                hasBookFolder: mdeb.hasBookFolder,
                bookFolderName: mdeb.bookFolder,
                rootFileCount: mdeb.rootFiles.length,
                chapterCount: mdeb.chapters.length,
                imageCount: mdeb.images.length,
                videoCount: mdeb.videos.length,
                audioCount: mdeb.audio.length,
                mediaCount: mdeb.mediaFiles.length,
                hasMetadata: !!mdeb.metadataFile,
                totalSize: mdeb.totalSize,
                formattedSize: formatFileSize(mdeb.totalSize),
                entryPoint: mdeb.getEntryPoint()?.name || null
            }))
        };

        return result;
    }

    /**
     * Load a single markdown file (no folder context)
     */
    async function loadSingleFile(file) {
        if (!file) {
            throw new Error('No file provided');
        }
        
        // Validate file type
        const ext = '.' + file.name.split('.').pop().toLowerCase();
        if (!CONFIG.supportedExtensions.includes(ext) && ext !== '.md' && ext !== '.markdown' && ext !== '.txt') {
            throw new Error(`Unsupported file type: ${ext}`);
        }
        
        // Extract metadata
        const text = await file.text();
        const { metadata, content } = FrontMatter.extract(text);
        
        // Ensure display_title
        if (!metadata.display_title && metadata.title) {
            metadata.display_title = metadata.title;
        }
        
        return {
            file,
            metadata,
            content,
            type: 'single',
            size: file.size,
            formattedSize: formatFileSize(file.size),
            displayTitle: FrontMatter.getTitle(metadata, file.name)
        };
    }

    /**
     * Load a specific chapter from a .mdeb
     */
    async function loadChapter(mdebPath, chapterFile) {
        const mdeb = currentMdebMap.get(mdebPath);
        if (!mdeb) {
            throw new Error(`Mdeb not found: ${mdebPath}`);
        }

        // First, ensure book metadata is loaded ONCE for this mdeb
        const bookMetadata = await mdeb.ensureBookMetadata();

        // Load chapter content
        const chapterText = await chapterFile.text();
        
        // Check for inline metadata in chapter
        const inlineResult = FrontMatter.extract(chapterText);
        
        let metadata = {};
        let metadataSource = 'none';
        
        // Determine metadata source and merge
        const hasBookMetadata = bookMetadata && Object.keys(bookMetadata).length > 0;
        const hasInlineMetadata = inlineResult.metadata && Object.keys(inlineResult.metadata).length > 0;
        
        if (hasBookMetadata && hasInlineMetadata) {
            // Both exist - merge with chapter taking precedence
            metadata = { 
                ...bookMetadata,
                ...inlineResult.metadata,
                display_title: inlineResult.metadata.display_title || 
                              bookMetadata.display_title || 
                              inlineResult.metadata.title ||
                              bookMetadata.title
            };
            metadataSource = 'mixed';
            metadata._external = true;
            metadata._hasInline = true;
            metadata._externalFile = 'metadata.md';
        } 
        else if (hasBookMetadata) {
            // Only book metadata from root
            metadata = { 
                ...bookMetadata,
                display_title: bookMetadata.display_title || bookMetadata.title,
                _external: true,
                _externalFile: 'metadata.md'
            };
            metadataSource = 'external';
        }
        else if (hasInlineMetadata) {
            // Only inline metadata
            metadata = {
                ...inlineResult.metadata,
                display_title: inlineResult.metadata.display_title || inlineResult.metadata.title
            };
            metadataSource = 'inline';
        }
        
        // Get base path for relative media references
        const filePath = chapterFile.webkitRelativePath || chapterFile.name;
        const lastSlash = filePath.lastIndexOf('/');
        const fileDir = lastSlash > -1 ? filePath.substring(0, lastSlash + 1) : '';
        
        // Clean up old object URLs
        if (window._mediaObjectUrls) {
            window._mediaObjectUrls.forEach(url => URL.revokeObjectURL(url));
            window._mediaObjectUrls = [];
        }
        
        // Create unified media map using Blob URLs for ALL media types
        const mediaMap = await createMediaMap(
            inlineResult.content || chapterText,
            fileDir,
            mdeb.mediaFiles  // Use all media files
        );
        
        // Store the media map globally for the handler to use after parsing
        window._currentMediaMap = mediaMap;
        
        // Log the media map for debugging
        console.log('Media map created with entries:');
        mediaMap.forEach((url, path) => {
            console.log(`  ${path} -> ${url}`);
        });
        
        // Return the raw content - DO NOT replace paths here
        // The handler will apply the mappings after the parser creates the HTML
        const rawContent = inlineResult.content || chapterText;
        
        // Find next/previous chapters
        const allChapters = mdeb.getAllChapters();
        const currentIndex = allChapters.findIndex(c => c.file === chapterFile);
        const prevChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null;
        const nextChapter = currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null;
        
        // Get chapter title from metadata or filename
        let chapterTitle = metadata.chapter_title || 
                           metadata.display_title || 
                           metadata.title || 
                           mdeb.extractTitleFromPath(chapterFile.name);
        
        // Ensure metadata has display_title
        if (!metadata.display_title && metadata.title) {
            metadata.display_title = metadata.title;
        }
        
        return {
            file: chapterFile,
            metadata: metadata,
            metadataSource: metadataSource,
            content: rawContent,  // Return raw content with original paths
            rawContent: inlineResult.content || chapterText,
            type: 'chapter',
            chapter: {
                name: chapterFile.name,
                title: chapterTitle,
                order: mdeb.getChapterOrder(chapterFile.name, ''),
                index: currentIndex + 1,
                totalChapters: allChapters.length
            },
            navigation: {
                hasPrev: !!prevChapter,
                prevChapter: prevChapter ? {
                    file: prevChapter.file,
                    name: prevChapter.name,
                    title: prevChapter.title
                } : null,
                hasNext: !!nextChapter,
                nextChapter: nextChapter ? {
                    file: nextChapter.file,
                    name: nextChapter.name,
                    title: nextChapter.title
                } : null
            },
            mdeb: {
                name: mdeb.name,
                path: mdeb.path,
                hasBookFolder: mdeb.hasBookFolder,
                bookFolderName: mdeb.bookFolder,
                totalSize: mdeb.totalSize,
                formattedSize: formatFileSize(mdeb.totalSize),
                hasMetadata: !!mdeb.metadataFile,
                imageCount: mdeb.images.length,
                videoCount: mdeb.videos.length,
                audioCount: mdeb.audio.length,
                mediaCount: mdeb.mediaFiles.length
            },
            size: chapterFile.size,
            formattedSize: formatFileSize(chapterFile.size),
            displayTitle: FrontMatter.getTitle(metadata, chapterFile.name)
        };
    }

    /**
     * Load the entry point of a .mdeb (first chapter or root file)
     */
    async function loadMdebEntry(mdebPath) {
        const mdeb = currentMdebMap.get(mdebPath);
        if (!mdeb) {
            throw new Error(`Mdeb not found: ${mdebPath}`);
        }

        const entryFile = mdeb.getEntryPoint();
        if (!entryFile) {
            throw new Error('No entry point found in .mdeb');
        }

        return loadChapter(mdebPath, entryFile);
    }

    /**
     * Get all chapters for a .mdeb
     */
    function getChapters(mdebPath) {
        const mdeb = currentMdebMap.get(mdebPath);
        if (!mdeb) return [];
        
        return mdeb.getAllChapters().map(ch => ({
            file: ch.file,
            name: ch.name,
            title: ch.title,
            order: ch.order,
            path: ch.path
        }));
    }

    /**
     * Get list of all detected .mdeb folders
     */
    function getMdebList() {
        return Array.from(currentMdebMap.entries()).map(([path, mdeb]) => ({
            path,
            name: mdeb.name,
            hasBookFolder: mdeb.hasBookFolder,
            bookFolderName: mdeb.bookFolder,
            chapterCount: mdeb.chapters.length,
            rootFileCount: mdeb.rootFiles.length,
            imageCount: mdeb.images.length,
            videoCount: mdeb.videos.length,
            audioCount: mdeb.audio.length,
            mediaCount: mdeb.mediaFiles.length,
            hasMetadata: !!mdeb.metadataFile,
            totalSize: mdeb.totalSize,
            formattedSize: formatFileSize(mdeb.totalSize)
        }));
    }

    /**
     * Clear cache
     */
    function clearCache() {
        // Clean up any object URLs
        if (window._mediaObjectUrls) {
            window._mediaObjectUrls.forEach(url => URL.revokeObjectURL(url));
            window._mediaObjectUrls = [];
        }
        
        currentMdebMap.clear();
        loadedMetadata.clear();
        currentFiles = [];
        window._currentMediaMap = null;
    }

    /**
     * Set debug mode
     */
    function setDebug(enabled) {
        CONFIG.debug = enabled;
    }

    // Create the public API object
    const MdebLoader = {
        // Core processing
        processFiles,
        loadSingleFile,
        loadMdebEntry,
        loadChapter,
        getChapters,
        
        // Queries
        getMdebList,
        
        // Utilities
        formatFileSize,
        isInMdebFolder,
        
        // Cache
        clearCache,
        
        // Configuration
        setDebug,
        getConfig: () => ({ ...CONFIG }),
        
        // Version
        VERSION: '1.3.0'  // Updated version with unified Blob URL handling for all media
    };
    
    return MdebLoader;
}));