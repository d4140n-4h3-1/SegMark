// markdown_reader/parser/front-matter.js
// Parser-agnostic front matter handling module with metadata.md support

(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.FrontMatter = factory();
    }
}(typeof self !== 'undefined' ? self : this, function() {
    'use strict';

    /**
     * Extract metadata from markdown content
     * Handles various line ending patterns
     */
    function extractMetadata(content) {
        const result = {
            metadata: {},
            content: content
        };

        if (!content) return result;

        // Check for front matter with various line ending patterns
        // This regex handles:
        // ---\n...\n---\n  (Unix)
        // ---\r\n...\r\n---\r\n  (Windows)
        // ---\n...\n---  (no trailing newline)
        const frontMatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;
        const match = content.match(frontMatterRegex);
        
        if (match) {
            const yamlBlock = match[1].trim();
            const metadata = parseYAML(yamlBlock);
            const remainingContent = content.substring(match[0].length);
            
            return {
                metadata: metadata,
                content: remainingContent
            };
        }

        return result;
    }

    /**
     * Parse YAML-like syntax
     */
    function parseYAML(yamlBlock) {
        const metadata = {};
        const lines = yamlBlock.split('\n');
        
        let currentKey = null;
        let multilineValue = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();
            
            if (trimmed === '') continue;

            const colonIndex = line.indexOf(':');
            
            if (colonIndex !== -1 && (line[0] !== ' ' && line[0] !== '\t')) {
                // Save any previous multiline value
                if (currentKey && multilineValue.length > 0) {
                    metadata[currentKey] = multilineValue.join(' ').trim();
                    multilineValue = [];
                }
                
                const key = line.substring(0, colonIndex).trim();
                let value = line.substring(colonIndex + 1).trim();
                
                // Check if this is a multiline indicator
                if (value === '|' || value === '>' || value === '|-') {
                    currentKey = key;
                    multilineValue = [];
                } else {
                    // Regular key-value pair
                    currentKey = null;
                    
                    // Remove quotes if present
                    if ((value.startsWith('"') && value.endsWith('"')) || 
                        (value.startsWith("'") && value.endsWith("'"))) {
                        value = value.substring(1, value.length - 1);
                    }
                    
                    // Handle arrays (comma-separated values)
                    if (value.includes(',')) {
                        value = value.split(',').map(item => item.trim());
                    }
                    
                    metadata[key] = value;
                }
            } else if (currentKey) {
                // Continuation of multiline value
                multilineValue.push(trimmed);
            }
        }
        
        // Save any remaining multiline value
        if (currentKey && multilineValue.length > 0) {
            metadata[currentKey] = multilineValue.join(' ').trim();
        }

        return metadata;
    }

    /**
     * Load metadata from a separate metadata.md file
     * @param {File} metadataFile - The metadata.md file object
     * @returns {Promise<Object>} - Parsed metadata
     */
    async function loadMetadataFromFile(metadataFile) {
        if (!metadataFile) return {};
        
        try {
            const text = await metadataFile.text();
            const { metadata } = extractMetadata(text);
            return metadata;
        } catch (error) {
            return {};
        }
    }

    /**
     * Find metadata.md file in a list of files
     * @param {Array<File>} files - Array of file objects
     * @returns {File|null} - The metadata.md file or null
     */
    function findMetadataFile(files) {
        if (!files || !Array.isArray(files)) return null;
        
        // Look for metadata.md (case insensitive)
        return files.find(file => 
            file.name.toLowerCase() === 'metadata.md' || 
            file.name.toLowerCase() === 'metadata.markdown'
        ) || null;
    }

    /**
     * Extract metadata from either inline front matter or separate metadata.md
     * @param {string} content - The markdown file content
     * @param {Array<File>} allFiles - All files in the folder (for metadata.md lookup)
     * @returns {Promise<Object>} - { metadata: Object, content: string }
     */
    async function extractMetadataWithExternal(content, allFiles = []) {
        // First try inline front matter
        const inlineResult = extractMetadata(content);
        
        // If we have inline metadata, use it
        if (Object.keys(inlineResult.metadata).length > 0) {
            return inlineResult;
        }
        
        // Otherwise, look for metadata.md
        const metadataFile = findMetadataFile(allFiles);
        if (metadataFile) {
            const externalMetadata = await loadMetadataFromFile(metadataFile);
            return {
                metadata: externalMetadata,
                content: content // Original content unchanged
            };
        }
        
        // No metadata found
        return {
            metadata: {},
            content: content
        };
    }

    /**
     * Get display title from metadata
     */
    function getDisplayTitle(metadata, filename) {
        if (metadata.display_title) {
            let title = metadata.display_title;
            if ((title.startsWith('"') && title.endsWith('"')) || 
                (title.startsWith("'") && title.endsWith("'"))) {
                title = title.substring(1, title.length - 1);
            }
            return title;
        }
        if (metadata.title) {
            let title = metadata.title;
            if ((title.startsWith('"') && title.endsWith('"')) || 
                (title.startsWith("'") && title.endsWith("'"))) {
                title = title.substring(1, title.length - 1);
            }
            return title;
        }
        return filename.replace(/\.[^/.]+$/, '');
    }

    /**
     * Format metadata as HTML
     */
    function formatMetadataHTML(metadata) {
        if (!metadata || Object.keys(metadata).length === 0) {
            return '';
        }

        let html = '<div class="metadata-panel">';
        
        // Title
        if (metadata.display_title || metadata.title) {
            let title = metadata.display_title || metadata.title;
            if ((title.startsWith('"') && title.endsWith('"')) || 
                (title.startsWith("'") && title.endsWith("'"))) {
                title = title.substring(1, title.length - 1);
            }
            html += `<div class="metadata-title">${title}</div>`;
        }
        
        // Author and date
        if (metadata.author || metadata.published || metadata.date) {
            html += '<div class="metadata-row">';
            if (metadata.author) {
                html += `<span class="metadata-author">✍️ ${metadata.author}</span>`;
            }
            const date = metadata.published || metadata.date;
            if (date) {
                html += `<span class="metadata-date">📅 ${date}</span>`;
            }
            html += '</div>';
        }
        
        // Genre
        if (metadata.genre && typeof metadata.genre === 'string') {
            html += '<div class="metadata-genre">';
            html += `<span class="metadata-genre-tag">${metadata.genre}</span>`;
            html += '</div>';
        }
        
        // Tags
        if (metadata.tags) {
            html += '<div class="metadata-tags">';
            let tags = metadata.tags;
            
            if (typeof tags === 'string') {
                tags = tags.split(',').map(tag => tag.trim());
            }
            
            if (Array.isArray(tags)) {
                tags.forEach(tag => {
                    if (tag && tag.trim()) {
                        html += `<span class="metadata-tag">${tag.trim()}</span>`;
                    }
                });
            } else if (tags) {
                html += `<span class="metadata-tag">${tags}</span>`;
            }
            html += '</div>';
        }
        
        // Summary
        if (metadata.summary) {
            let summary = metadata.summary;
            summary = summary.replace(/\s+/g, ' ').trim();
            html += `<div class="metadata-summary">${summary}</div>`;
        }
        
        // External metadata indicator (optional)
        if (metadata._external) {
            html += `<div class="metadata-external-note">📁 Metadata from metadata.md</div>`;
        }
        
        html += '</div>';
        return html;
    }

    /**
     * Create and inject metadata panel
     */
    function createMetadataPanel(metadata, container) {
        if (!metadata || Object.keys(metadata).length === 0 || !container) {
            return null;
        }

        const metadataHTML = formatMetadataHTML(metadata);
        if (!metadataHTML) {
            return null;
        }

        let panel = document.getElementById('metadata-panel');
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'metadata-panel';
            container.parentNode.insertBefore(panel, container);
        }

        panel.innerHTML = metadataHTML;
        panel.style.display = 'block';
        return panel;
    }

    function hideMetadataPanel() {
        const panel = document.getElementById('metadata-panel');
        if (panel) {
            panel.style.display = 'none';
        }
    }

    function removeMetadataPanel() {
        const panel = document.getElementById('metadata-panel');
        if (panel) {
            panel.remove();
        }
    }

    return {
        extract: extractMetadata,
        extractWithExternal: extractMetadataWithExternal,
        parseYAML: parseYAML,
        findMetadataFile: findMetadataFile,
        loadMetadataFromFile: loadMetadataFromFile,
        getTitle: getDisplayTitle,
        formatHTML: formatMetadataHTML,
        createPanel: createMetadataPanel,
        hidePanel: hideMetadataPanel,
        removePanel: removeMetadataPanel,
        VERSION: '1.1.0'
    };
}));