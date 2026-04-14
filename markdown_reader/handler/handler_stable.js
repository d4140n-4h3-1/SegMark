// ===== STABLE READER APPLICATION =====
// Updated to use unified MdebLoader for proper metadata.md support
// Includes cache clearing fix with raw content storage
// Fixed folder detection and metadata loading
(function() {
    'use strict';

    // Wait for DOM to be fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        
        // DOM elements
        const fileInput = document.getElementById('fileInput');
        const folderPicker = document.getElementById('folderPicker');
        const browseBtn = document.getElementById('browseBtn');
        const folderBtn = document.getElementById('folderBtn');
        const output = document.getElementById('markdown-output');
        const filenameSpan = document.getElementById('filename');
        const workerStatus = document.getElementById('worker-status');
        const perfStats = document.getElementById('perf-stats');
        const spinnerWrapper = document.getElementById('spinnerWrapper');
        const placeholderText = document.querySelector('.placeholder-text');
        const fileListDiv = document.getElementById('fileList');
        
        // Stats elements
        const statSize = document.getElementById('stat-size');
        const statTime = document.getElementById('stat-time');
        const statMethod = document.getElementById('stat-method');
        const statCache = document.getElementById('stat-cache');
        const statWorker = document.getElementById('stat-worker');
        const statMemory = document.getElementById('stat-memory');
        const statHitrate = document.getElementById('stat-hitrate');
        const statEntries = document.getElementById('stat-entries');
        const memoryBarFill = document.getElementById('memory-bar-fill');
        const cacheLevelBadge = document.getElementById('cache-level-badge');
        const cacheDetails = document.getElementById('cache-details');
        const cacheDetailsGrid = document.getElementById('cache-details-grid');
        
        // State variables
        let currentStats = null;
        let currentMdebPath = null;
        let currentChapters = [];
        let currentChapterIndex = 0;
        
        // Cache clearing state
        let __lastRawContent = null;      // Store raw markdown for cache clearing
        let __currentLoader = null;       // 'file', 'chapter', or null
        let __currentFileInfo = null;     // Store current file/chapter info

        // ===== UTILITY FUNCTIONS =====
        
        function formatFileSize(bytes) {
            if (bytes === 0) return '0 B';
            const units = ['B', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(1024));
            return (bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1) + ' ' + units[i];
        }

        // Update worker status indicator
        function updateWorkerStatus(status, message) {
            if (!workerStatus || !statWorker) return;
            
            workerStatus.className = '';
            if (status === 'active') {
                workerStatus.classList.add('worker-active');
                workerStatus.title = message || 'Worker active';
                statWorker.textContent = 'Active';
            } else if (status === 'error') {
                workerStatus.classList.add('worker-error');
                workerStatus.title = message || 'Worker error';
                statWorker.textContent = 'Error';
            } else {
                workerStatus.classList.add('worker-inactive');
                workerStatus.title = message || 'Worker inactive';
                statWorker.textContent = 'Inactive';
            }
        }

        // Show/hide centered spinner
        function setLoading(isLoading) {
            if (!spinnerWrapper) return;
            
            if (isLoading) {
                spinnerWrapper.classList.remove('hidden');
                if (placeholderText) placeholderText.style.display = 'none';
            } else {
                spinnerWrapper.classList.add('hidden');
                if (placeholderText) placeholderText.style.display = 'block';
            }
        }

        // Get cache level class
        function getCacheLevelClass(level) {
            switch(level) {
                case 'tiny': return 'cache-level tiny';
                case 'small': return 'cache-level small';
                case 'medium': return 'cache-level medium';
                case 'large': return 'cache-level large';
                case 'huge': return 'cache-level huge';
                default: return 'cache-level';
            }
        }

        // ===== CACHE STATS DISPLAY =====
        
        async function updateCacheDetails() {
            if (!window.getCacheStats || !cacheDetailsGrid) return;
            
            const stats = window.getCacheStats();
            
            let html = '';
            
            if (stats && stats.levels) {
                Object.entries(stats.levels).forEach(([level, data]) => {
                    const hitRateClass = data.hitRate > '50%' ? 'metric-good' : (data.hitRate > '20%' ? 'metric-warn' : 'metric-bad');
                    
                    html += `
                        <div class="detail-item">
                            <strong class="${getCacheLevelClass(level).replace('cache-level', '')}">${level.toUpperCase()}</strong><br>
                            <span class="detail-label">Entries:</span> <span class="detail-value">${data.entries}/${data.maxSize}</span><br>
                            <span class="detail-label">Memory:</span> <span class="detail-value">${data.memoryMB} MB</span><br>
                            <span class="detail-label">Hit Rate:</span> <span class="detail-value ${hitRateClass}">${data.hitRate}</span><br>
                            <span class="detail-label">Hits/Misses:</span> <span class="detail-value">${data.hits}/${data.misses}</span><br>
                            <span class="detail-label">TTL:</span> <span class="detail-value">${data.ttl}</span>
                        </div>
                    `;
                });
                
                if (stats.performance) {
                    html += `
                        <div class="detail-item">
                            <strong>PERFORMANCE</strong><br>
                            <span class="detail-label">Avg Parse:</span> <span class="detail-value">${stats.performance.avgParseTime}</span><br>
                            <span class="detail-label">Avg Worker:</span> <span class="detail-value">${stats.performance.avgWorkerTime}</span><br>
                        </div>
                    `;
                }
            }
            
            cacheDetailsGrid.innerHTML = html;
        }

        async function updateCacheStats() {
            if (!window.getCacheStats) return;
            
            const stats = window.getCacheStats();
            
            if (!stats || !stats.total) return;
            
            const memoryPercent = (parseFloat(stats.total.memoryMB) / parseFloat(stats.total.maxMemoryMB)) * 100;
            if (statMemory) statMemory.textContent = `${stats.total.memoryMB} MB / ${stats.total.maxMemoryMB} MB`;
            if (memoryBarFill) memoryBarFill.style.width = `${Math.min(memoryPercent, 100)}%`;
            
            if (statHitrate) {
                statHitrate.textContent = stats.total.hitRate;
                statHitrate.className = stats.total.hitRate > '50%' ? 'stat-value metric-good' : 
                                       (stats.total.hitRate > '20%' ? 'stat-value metric-warn' : 'stat-value metric-bad');
            }
            
            if (statEntries) statEntries.textContent = stats.total.entries;
            
            if (currentStats?.usedCache && currentStats?.cacheLevel) {
                cacheLevelBadge.style.display = 'inline-block';
                cacheLevelBadge.className = getCacheLevelClass(currentStats.cacheLevel);
                cacheLevelBadge.textContent = currentStats.cacheLevel;
            } else {
                cacheLevelBadge.style.display = 'none';
            }
            
            if (cacheDetails && cacheDetails.classList.contains('visible')) {
                await updateCacheDetails();
            }
        }

        function updateStats(stats) {
            currentStats = stats;
            
            if (!stats || !perfStats) {
                if (perfStats) perfStats.style.display = 'none';
                return;
            }
            
            perfStats.style.display = 'block';
            if (statSize) statSize.textContent = (stats.size / 1024).toFixed(1) + ' KB';
            if (statTime) statTime.textContent = stats.parseTime.toFixed(2) + ' ms';
            
            if (stats.usedWorker) {
                if (statMethod) statMethod.textContent = '🚀 Worker';
                updateWorkerStatus('active', 'Worker processing');
            } else {
                if (statMethod) statMethod.textContent = '⚡ Sync';
                updateWorkerStatus('inactive', 'Sync parse');
            }
            
            if (statCache) statCache.textContent = stats.usedCache ? '✅' : '❌';
            
            updateCacheStats();
        }

        // ===== CHAPTER NAVIGATION =====
        
        function renderChapterNavigation() {
            // Remove existing navigation if any
            const existingNav = document.getElementById('chapter-navigation');
            if (existingNav) existingNav.remove();
            
            if (!currentChapters || currentChapters.length === 0) return;
            
            const nav = document.createElement('div');
            nav.id = 'chapter-navigation';
            nav.className = 'chapter-navigation';
            nav.style.cssText = `
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 0;
                margin-bottom: 20px;
                border-bottom: 1px solid #e1e4e8;
                font-size: 14px;
            `;
            
            // Previous button
            const prevBtn = document.createElement('button');
            prevBtn.className = 'chapter-nav-btn';
            prevBtn.innerHTML = '← Previous';
            prevBtn.disabled = currentChapterIndex === 0;
            prevBtn.style.cssText = `
                padding: 6px 12px;
                background: ${currentChapterIndex === 0 ? '#f6f8fa' : '#0366d6'};
                color: ${currentChapterIndex === 0 ? '#6a737d' : 'white'};
                border: 1px solid ${currentChapterIndex === 0 ? '#e1e4e8' : '#0366d6'};
                border-radius: 4px;
                cursor: ${currentChapterIndex === 0 ? 'default' : 'pointer'};
                font-size: 13px;
            `;
            
            if (currentChapterIndex > 0) {
                prevBtn.addEventListener('click', () => {
                    loadChapterByIndex(currentChapterIndex - 1);
                });
            }
            
            // Chapter selector
            const selector = document.createElement('select');
            selector.className = 'chapter-selector';
            selector.style.cssText = `
                padding: 6px 12px;
                border: 1px solid #e1e4e8;
                border-radius: 4px;
                background: white;
                font-size: 13px;
                min-width: 200px;
            `;
            
            currentChapters.forEach((chapter, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = `${index + 1}. ${chapter.title || chapter.name}`;
                option.selected = index === currentChapterIndex;
                selector.appendChild(option);
            });
            
            selector.addEventListener('change', (e) => {
                loadChapterByIndex(parseInt(e.target.value, 10));
            });
            
            // Next button
            const nextBtn = document.createElement('button');
            nextBtn.className = 'chapter-nav-btn';
            nextBtn.innerHTML = 'Next →';
            nextBtn.disabled = currentChapterIndex === currentChapters.length - 1;
            nextBtn.style.cssText = `
                padding: 6px 12px;
                background: ${currentChapterIndex === currentChapters.length - 1 ? '#f6f8fa' : '#0366d6'};
                color: ${currentChapterIndex === currentChapters.length - 1 ? '#6a737d' : 'white'};
                border: 1px solid ${currentChapterIndex === currentChapters.length - 1 ? '#e1e4e8' : '#0366d6'};
                border-radius: 4px;
                cursor: ${currentChapterIndex === currentChapters.length - 1 ? 'default' : 'pointer'};
                font-size: 13px;
            `;
            
            if (currentChapterIndex < currentChapters.length - 1) {
                nextBtn.addEventListener('click', () => {
                    loadChapterByIndex(currentChapterIndex + 1);
                });
            }
            
            // Chapter indicator
            const indicator = document.createElement('span');
            indicator.className = 'chapter-indicator';
            indicator.style.cssText = `
                color: #586069;
                font-size: 12px;
            `;
            indicator.textContent = `Chapter ${currentChapterIndex + 1} of ${currentChapters.length}`;
            
            // Assemble navigation
            const leftDiv = document.createElement('div');
            leftDiv.style.cssText = 'display: flex; gap: 10px; align-items: center;';
            leftDiv.appendChild(prevBtn);
            leftDiv.appendChild(indicator);
            
            const rightDiv = document.createElement('div');
            rightDiv.style.cssText = 'display: flex; gap: 10px; align-items: center;';
            rightDiv.appendChild(selector);
            rightDiv.appendChild(nextBtn);
            
            nav.appendChild(leftDiv);
            nav.appendChild(rightDiv);
            
            // Insert after metadata panel but before content
            const metadataPanel = document.getElementById('metadata-panel');
            if (metadataPanel && metadataPanel.style.display !== 'none') {
                metadataPanel.insertAdjacentElement('afterend', nav);
            } else {
                output.parentNode.insertBefore(nav, output);
            }
        }

        async function loadChapterByIndex(index) {
            if (!currentMdebPath || !currentChapters[index]) return;
            
            setLoading(true);
            
            try {
                const chapterFile = currentChapters[index].file;
                
                const chapterData = await window.MdebLoader.loadChapter(
                    currentMdebPath, 
                    chapterFile
                );
                
                currentChapterIndex = index;
                
                // Store raw content and loader info for cache clearing
                __lastRawContent = chapterData.rawContent || chapterData.content;
                __currentLoader = 'chapter';
                __currentFileInfo = {
                    path: currentMdebPath,
                    chapter: chapterFile.name,
                    title: chapterData.chapter.title
                };
                
                // Update filename display with metadata source indicator
                const bookInfo = chapterData.mdeb.hasBookFolder ? ' 📚' : '';
                const metadataIndicator = chapterData.metadataSource === 'external' ? ' 📋' : 
                                         (chapterData.metadataSource === 'mixed' ? ' 📋✏️' : '');
                
                filenameSpan.innerHTML = `
                    📖 ${chapterData.mdeb.name}${bookInfo}${metadataIndicator}
                    <span style="color: #0366d6; font-size: 11px;">
                        ${chapterData.formattedSize} • ${chapterData.chapter.title}
                    </span>
                `;
                
                // Show metadata panel with source indicator
                if (window.FrontMatter && Object.keys(chapterData.metadata).length > 0) {
                    // Remove existing panel if any
                    const existingPanel = document.getElementById('metadata-panel');
                    if (existingPanel) existingPanel.remove();
                    
                    // Create new panel
                    window.FrontMatter.createPanel(chapterData.metadata, output);
                    
                    // Add source indicator
                    const panel = document.getElementById('metadata-panel');
                    if (panel && chapterData.metadataSource !== 'none') {
                        // Check if source note already exists
                        let sourceNote = panel.querySelector('.metadata-source-note');
                        if (!sourceNote) {
                            sourceNote = document.createElement('div');
                            sourceNote.className = 'metadata-source-note';
                            sourceNote.style.cssText = `
                                font-size: 0.8em;
                                color: #6a737d;
                                margin-top: 8px;
                                padding-top: 8px;
                                border-top: 1px dashed #e1e4e8;
                                font-style: italic;
                                text-align: right;
                            `;
                            panel.appendChild(sourceNote);
                        }
                        
                        let sourceText = '';
                        if (chapterData.metadataSource === 'external') sourceText = '📋 Metadata from metadata.md';
                        else if (chapterData.metadataSource === 'mixed') sourceText = '📋✏️ Mixed metadata (book + chapter)';
                        
                        if (sourceText) {
                            sourceNote.textContent = sourceText;
                        }
                    }
                } else {
                    if (window.FrontMatter) window.FrontMatter.hidePanel();
                }
                
                // Parse and display with raw content for cache clearing
                await parseAndDisplay(chapterData.content, chapterData.rawContent || chapterData.content);
                
                // Update navigation
                renderChapterNavigation();
                
            } catch (error) {
                output.innerHTML = `<div class="spinner-wrapper hidden" id="spinnerWrapper"><div id="spinner"></div><div class="spinner-text">Parsing markdown...</div></div><p style="color: red; text-align: center; margin-top: 100px;">Error: ${error.message}</p>`;
                updateWorkerStatus('error', error.message);
            } finally {
                setLoading(false);
            }
        }

        // ===== MAIN DISPLAY FUNCTIONS =====
        
        async function parseAndDisplay(content, rawContent = null) {
            // Store raw content for cache clearing
            __lastRawContent = rawContent || content;
            
            try {
                let result;
                if (window.parseMarkdownSmart) {
                    result = await window.parseMarkdownSmart(content, {
                        forceWorker: content.length > 500000
                    });
                } else if (window.parseMarkdown) {
                    const html = window.parseMarkdown(content);
                    result = {
                        html,
                        stats: {
                            size: content.length,
                            parseTime: 0,
                            usedCache: false,
                            usedWorker: false
                        }
                    };
                } else {
                    throw new Error('No markdown parser found');
                }
                
                // Apply media mappings to the parsed HTML using DOM manipulation
                let finalHtml = result.html;
                if (window._currentMediaMap && window._currentMediaMap.size > 0) {
                    // Create a temporary container to work with the DOM
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = finalHtml;
                    
                    // Track replacements for logging
                    let replacementCount = 0;
                    let imageCount = 0;
                    let audioCount = 0;
                    let videoCount = 0;
                    
                    // Build a map of possible path variations for flexible matching
                    const pathVariations = new Map();
                    window._currentMediaMap.forEach((url, path) => {
                        // Store the original path
                        pathVariations.set(path, url);
                        
                        // Store just the filename
                        const filename = path.split('/').pop();
                        pathVariations.set(filename, url);
                        
                        // Store path without any leading ./
                        const noDot = path.replace(/^\.\//, '');
                        if (noDot !== path) pathVariations.set(noDot, url);
                        
                        // Store path with ./ prefix
                        const withDot = './' + path;
                        pathVariations.set(withDot, url);
                        
                        // Store path without content/ prefix (if it exists)
                        const noContent = path.replace(/^content\//, '');
                        if (noContent !== path) pathVariations.set(noContent, url);
                        
                        // Store path with content/ prefix
                        const withContent = 'content/' + path.split('/').pop();
                        pathVariations.set(withContent, url);
                        
                        // Store just the filename with common image paths
                        if (path.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
                            const imgFileName = path.split('/').pop();
                            pathVariations.set('images/' + imgFileName, url);
                            pathVariations.set('./images/' + imgFileName, url);
                            pathVariations.set('../images/' + imgFileName, url);
                        }
                        
                        console.log(`Path variations for ${path}:`, {
                            original: path,
                            filename: filename,
                            noDot: noDot,
                            withDot: withDot,
                            noContent: noContent,
                            withContent: withContent
                        });
                    });
                    
                    // Find ALL elements that might have src or href attributes
                    const allElements = tempDiv.querySelectorAll('*');
                    
                    allElements.forEach(element => {
                        // Check src attribute
                        const src = element.getAttribute('src');
                        if (src) {
                            // Try to find a match in our path variations
                            let matched = false;
                            pathVariations.forEach((url, variation) => {
                                if (src.includes(variation) || variation.includes(src)) {
                                    const oldSrc = src;
                                    element.src = url;
                                    console.log(`Replaced src: ${oldSrc} -> ${element.src.substring(0, 50)}... (matched: ${variation})`);
                                    replacementCount++;
                                    matched = true;
                                    
                                    // Count by element type
                                    if (element.tagName === 'IMG') imageCount++;
                                    else if (element.tagName === 'AUDIO') audioCount++;
                                    else if (element.tagName === 'VIDEO') videoCount++;
                                }
                            });
                            if (!matched && (src.includes('image') || src.includes('jpg') || src.includes('png'))) {
                                console.log(`No match for src: ${src}`);
                            }
                        }
                        
                        // Check href attribute (for links that might be media)
                        const href = element.getAttribute('href');
                        if (href) {
                            pathVariations.forEach((url, variation) => {
                                if (href.includes(variation) || variation.includes(href)) {
                                    const oldHref = href;
                                    element.href = url;
                                    console.log(`Replaced href: ${oldHref} -> ${element.href.substring(0, 50)}... (matched: ${variation})`);
                                    replacementCount++;
                                }
                            });
                        }
                        
                        // Check data-src or other custom attributes (some players might use these)
                        const dataSrc = element.getAttribute('data-src');
                        if (dataSrc) {
                            pathVariations.forEach((url, variation) => {
                                if (dataSrc.includes(variation) || variation.includes(dataSrc)) {
                                    element.setAttribute('data-src', url);
                                    console.log(`Replaced data-src: ${dataSrc} (matched: ${variation})`);
                                    replacementCount++;
                                }
                            });
                        }
                        
                        // Check poster attribute (for video thumbnails)
                        const poster = element.getAttribute('poster');
                        if (poster) {
                            pathVariations.forEach((url, variation) => {
                                if (poster.includes(variation) || variation.includes(poster)) {
                                    element.poster = url;
                                    console.log(`Replaced poster: ${poster} (matched: ${variation})`);
                                    replacementCount++;
                                }
                            });
                        }
                    });
                    
                    // Also check for source elements inside video/audio
                    const sources = tempDiv.querySelectorAll('source');
                    sources.forEach(source => {
                        const src = source.getAttribute('src');
                        if (src) {
                            pathVariations.forEach((url, variation) => {
                                if (src.includes(variation) || variation.includes(src)) {
                                    source.src = url;
                                    console.log(`Replaced source src: ${src} (matched: ${variation})`);
                                    replacementCount++;
                                }
                            });
                        }
                    });
                    
                    console.log(`Media replacements: ${replacementCount} files processed (${imageCount} images, ${audioCount} audio, ${videoCount} video)`);
                    finalHtml = tempDiv.innerHTML;
                } else {
                    console.log('No media map found');
                }
                
                output.innerHTML = finalHtml;
                
                // Re-add spinner wrapper
                const newSpinnerWrapper = document.createElement('div');
                newSpinnerWrapper.className = 'spinner-wrapper hidden';
                newSpinnerWrapper.id = 'spinnerWrapper';
                newSpinnerWrapper.innerHTML = '<div id="spinner"></div><div class="spinner-text">Parsing markdown...</div>';
                output.appendChild(newSpinnerWrapper);
                
                updateStats(result.stats);
                
            } catch (error) {
                console.error('Parse error:', error);
                throw error;
            }
        }
        
        async function loadAndDisplayFile(file) {
            if (!file) {
                output.innerHTML = '<div class="spinner-wrapper hidden" id="spinnerWrapper"><div id="spinner"></div><div class="spinner-text">Parsing markdown...</div></div><p class="placeholder-text">Select a Markdown file to view its formatted content.</p>';
                filenameSpan.textContent = 'No file selected';
                if (window.FrontMatter) window.FrontMatter.hidePanel();
                
                // Remove navigation if exists
                const nav = document.getElementById('chapter-navigation');
                if (nav) nav.remove();
                
                currentMdebPath = null;
                currentChapters = [];
                __lastRawContent = null;
                __currentLoader = null;
                __currentFileInfo = null;
                window._currentMediaMap = null;
                
                updateStats(null);
                return;
            }

            setLoading(true);
            
            try {
                // Use MdebLoader for single files
                if (!window.MdebLoader) {
                    throw new Error('MdebLoader module not loaded');
                }
                
                const fileData = await window.MdebLoader.loadSingleFile(file);
                
                // Store raw content and loader info for cache clearing
                __lastRawContent = fileData.content;
                __currentLoader = 'file';
                __currentFileInfo = {
                    name: file.name,
                    title: fileData.displayTitle
                };
                
                // Update filename
                filenameSpan.innerHTML = `📄 ${fileData.displayTitle} <span style="color: #0366d6; font-size: 11px;">(${fileData.formattedSize})</span>`;
                
                // Remove any chapter navigation
                const nav = document.getElementById('chapter-navigation');
                if (nav) nav.remove();
                
                currentMdebPath = null;
                currentChapters = [];
                
                // Show metadata
                if (window.FrontMatter && Object.keys(fileData.metadata).length > 0) {
                    window.FrontMatter.createPanel(fileData.metadata, output);
                } else {
                    if (window.FrontMatter) window.FrontMatter.hidePanel();
                }
                
                // Parse and display with raw content for cache clearing
                await parseAndDisplay(fileData.content, fileData.content);
                
            } catch (error) {
                output.innerHTML = `<div class="spinner-wrapper hidden" id="spinnerWrapper"><div id="spinner"></div><div class="spinner-text">Parsing markdown...</div></div><p style="color: red; text-align: center; margin-top: 100px;">Error: ${error.message}</p>`;
                if (window.FrontMatter) window.FrontMatter.hidePanel();
                updateWorkerStatus('error', error.message);
            } finally {
                setLoading(false);
            }
        }
        
        async function loadAndDisplayMdeb(mdebPath) {
            setLoading(true);
            
            try {
                if (!window.MdebLoader) {
                    throw new Error('MdebLoader module not loaded');
                }
                
                // Load the entry point (first chapter)
                const mdebData = await window.MdebLoader.loadMdebEntry(mdebPath);
                
                // Get all chapters for navigation
                currentMdebPath = mdebPath;
                currentChapters = window.MdebLoader.getChapters(mdebPath);
                currentChapterIndex = mdebData.chapter.index - 1;
                
                // Store raw content and loader info for cache clearing
                __lastRawContent = mdebData.rawContent || mdebData.content;
                __currentLoader = 'chapter';
                __currentFileInfo = {
                    path: mdebPath,
                    chapter: mdebData.file.name,
                    title: mdebData.chapter.title
                };
                
                // Update filename display with metadata source indicator
                const bookInfo = mdebData.mdeb.hasBookFolder ? ' 📚 (book folder)' : '';
                const metadataIndicator = mdebData.metadataSource === 'external' ? ' 📋' : 
                                         (mdebData.metadataSource === 'mixed' ? ' 📋✏️' : '');
                
                filenameSpan.innerHTML = `
                    📖 ${mdebData.mdeb.name}${bookInfo}${metadataIndicator}
                    <span style="color: #0366d6; font-size: 11px;">
                        ${mdebData.formattedSize} / total: ${mdebData.mdeb.formattedSize}
                    </span>
                `;
                
                // Show metadata panel with source indicator
                if (window.FrontMatter && Object.keys(mdebData.metadata).length > 0) {
                    // Remove existing panel if any
                    const existingPanel = document.getElementById('metadata-panel');
                    if (existingPanel) existingPanel.remove();
                    
                    // Create new panel
                    window.FrontMatter.createPanel(mdebData.metadata, output);
                    
                    // Add source indicator
                    const panel = document.getElementById('metadata-panel');
                    if (panel && mdebData.metadataSource !== 'none') {
                        // Check if source note already exists
                        let sourceNote = panel.querySelector('.metadata-source-note');
                        if (!sourceNote) {
                            sourceNote = document.createElement('div');
                            sourceNote.className = 'metadata-source-note';
                            sourceNote.style.cssText = `
                                font-size: 0.8em;
                                color: #6a737d;
                                margin-top: 8px;
                                padding-top: 8px;
                                border-top: 1px dashed #e1e4e8;
                                font-style: italic;
                                text-align: right;
                            `;
                            panel.appendChild(sourceNote);
                        }
                        
                        let sourceText = '';
                        if (mdebData.metadataSource === 'external') sourceText = '📋 Metadata from metadata.md';
                        else if (mdebData.metadataSource === 'mixed') sourceText = '📋✏️ Mixed metadata (book + chapter)';
                        
                        if (sourceText) {
                            sourceNote.textContent = sourceText;
                        }
                    }
                } else {
                    if (window.FrontMatter) window.FrontMatter.hidePanel();
                }
                
                // Parse and display with raw content for cache clearing
                await parseAndDisplay(mdebData.content, mdebData.rawContent || mdebData.content);
                
                // Render chapter navigation
                renderChapterNavigation();
                
            } catch (error) {
                output.innerHTML = `<div class="spinner-wrapper hidden" id="spinnerWrapper"><div id="spinner"></div><div class="spinner-text">Parsing markdown...</div></div><p style="color: red; text-align: center; margin-top: 100px;">Error: ${error.message}</p>`;
                if (window.FrontMatter) window.FrontMatter.hidePanel();
                updateWorkerStatus('error', error.message);
            } finally {
                setLoading(false);
            }
        }
        
        function renderMdebList(mdebList) {
            if (mdebList.length === 0) {
                fileListDiv.style.display = 'none';
                return;
            }
            
            fileListDiv.style.display = 'block';
            
            let html = '<strong>📁 Select an ebook:</strong><br><br>';
            mdebList.forEach(mdeb => {
                const bookIcon = mdeb.hasBookFolder ? ' 📚' : ' 📖';
                const metadataIcon = mdeb.hasMetadata ? ' 📋' : '';
                const chapterInfo = mdeb.chapterCount > 0 ? ` • ${mdeb.chapterCount} chapters` : '';
                
                html += `
                    <div class="folder-item" data-path="${mdeb.path}">
                        ${bookIcon} ${mdeb.name}${metadataIcon}
                        <span style="color: #0366d6; font-size: 10px; float: right;">
                            ${mdeb.formattedSize}${chapterInfo}
                        </span>
                    </div>
                `;
            });
            
            fileListDiv.innerHTML = html;
            
            fileListDiv.querySelectorAll('.folder-item').forEach(item => {
                item.addEventListener('click', () => {
                    loadAndDisplayMdeb(item.dataset.path);
                });
            });
        }

        // ===== EVENT LISTENERS =====
        
        fileInput.addEventListener('change', (event) => {
            if (event.target.files[0]) {
                loadAndDisplayFile(event.target.files[0]);
            }
            fileInput.value = ''; // Reset so same file can be selected again
        });

        browseBtn.addEventListener('click', () => {
            fileInput.click();
        });

        folderBtn.addEventListener('click', () => {
            folderPicker.click();
        });

        folderPicker.addEventListener('change', async (event) => {
            if (!window.MdebLoader) {
                alert('MdebLoader module not loaded');
                return;
            }
            
            setLoading(true);
            
            try {
                const files = event.target.files;
                const result = await window.MdebLoader.processFiles(files);
                const mdebList = window.MdebLoader.getMdebList();
                
                filenameSpan.innerHTML = `${result.mdebCount} .mdeb ebook(s) found <span style="color: #0366d6; font-size: 11px;">(total: ${result.formattedTotalSize})</span>`;
                renderMdebList(mdebList);
                
                // If only one .mdeb, load it automatically
                if (result.mdebCount === 1 && mdebList[0]) {
                    loadAndDisplayMdeb(mdebList[0].path);
                }
            } catch (error) {
                alert('Error loading folder: ' + error.message);
            } finally {
                setLoading(false);
                folderPicker.value = '';
            }
        });

        browseBtn.addEventListener('dragover', (e) => {
            e.preventDefault();
            browseBtn.classList.add('drag-over');
        });

        browseBtn.addEventListener('dragleave', (e) => {
            e.preventDefault();
            browseBtn.classList.remove('drag-over');
        });

        browseBtn.addEventListener('drop', (e) => {
            e.preventDefault();
            browseBtn.classList.remove('drag-over');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                loadAndDisplayFile(files[0]);
            }
        });

        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
                e.preventDefault();
                fileInput.click();
            }
        });

        // Cache control buttons
        const showDetailsBtn = document.getElementById('show-details-btn');
        const clearCacheBtn = document.getElementById('clear-cache-btn');
        const refreshStatsBtn = document.getElementById('refresh-stats-btn');
        const statsBadge = document.getElementById('stats-badge');
        
        if (showDetailsBtn) {
            showDetailsBtn.addEventListener('click', async () => {
                if (cacheDetails) {
                    cacheDetails.classList.toggle('visible');
                    if (cacheDetails.classList.contains('visible')) {
                        await updateCacheDetails();
                    }
                }
            });
        }

        if (clearCacheBtn) {
            clearCacheBtn.addEventListener('click', async () => {
                // Clear markdown parser cache
                if (window.clearMarkdownCache) {
                    window.clearMarkdownCache();
                }
                
                // Clear loader cache
                if (window.MdebLoader) {
                    window.MdebLoader.clearCache();
                }
                
                // Update stats display
                updateCacheStats();
                
                // Hide details panel
                if (cacheDetails) cacheDetails.classList.remove('visible');
                
                // Show feedback to user
                const originalContent = filenameSpan.innerHTML;
                filenameSpan.innerHTML = originalContent + ' <span style="color: #28a745; font-size: 11px;">(cache cleared)</span>';
                
                // Reparse the current content if available
                if (__lastRawContent) {
                    try {
                        setLoading(true);
                        
                        // Re-parse using the stored raw content
                        await parseAndDisplay(__lastRawContent, __lastRawContent);
                        
                    } catch (error) {
                        // Show error but don't wipe content
                        const errorMsg = document.createElement('div');
                        errorMsg.style.cssText = 'position: fixed; bottom: 20px; right: 20px; background: #ff4444; color: white; padding: 10px; border-radius: 4px; z-index: 9999;';
                        errorMsg.textContent = 'Error reparsing content. Please reload the file.';
                        document.body.appendChild(errorMsg);
                        setTimeout(() => errorMsg.remove(), 3000);
                    } finally {
                        setLoading(false);
                    }
                }
                
                // Remove the feedback message after 2 seconds
                setTimeout(() => {
                    filenameSpan.innerHTML = originalContent;
                }, 2000);
            });
        }

        if (refreshStatsBtn) {
            refreshStatsBtn.addEventListener('click', () => {
                updateCacheStats();
                if (cacheDetails && cacheDetails.classList.contains('visible')) {
                    updateCacheDetails();
                }
            });
        }

        if (statsBadge) {
            statsBadge.addEventListener('click', async () => {
                if (cacheDetails) {
                    cacheDetails.classList.toggle('visible');
                    if (cacheDetails.classList.contains('visible')) {
                        await updateCacheDetails();
                    }
                }
            });
        }

        // Initialize
        window.addEventListener('load', () => {
            browseBtn.focus();
        });
    });
})();