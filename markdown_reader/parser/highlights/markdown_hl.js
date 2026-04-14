// markdown_hl.js - True Markdown Syntax Highlighter
// Adds colors to raw markdown without changing its structure
(function() {
    'use strict';

    const MarkdownSyntaxHighlighter = {
        highlight: function(text) {
            if (!text) return '';
            
            // First, escape HTML to prevent injection
            let result = this.escapeHtml(text);
            
            // Apply colors using spans - preserve all original characters
            result = this.highlightCodeBlocks(result);
            result = this.highlightHeaders(result);
            result = this.highlightEmphasis(result);
            result = this.highlightLinks(result);
            result = this.highlightImages(result);
            result = this.highlightLists(result);
            result = this.highlightHorizontalRules(result);
            result = this.highlightCode(result);
            
            return result;
        },

        highlightCodeBlocks: function(text) {
            // Protect code blocks from other highlighting
            const blocks = [];
            let result = text.replace(/^(`{3,}|~{3,})([^\n]*)\n([\s\S]*?)\n\1$/gm, (match, fence, lang, code) => {
                const index = blocks.length;
                blocks.push({ fence, lang: lang.trim(), code });
                return `!!CODEBLOCK_${index}!!`;
            });
            
            result = result.replace(/!!CODEBLOCK_(\d+)!!/g, (match, index) => {
                const block = blocks[parseInt(index)];
                return `<div class="md-code-block">` +
                       `<span class="md-marker">${block.fence}${block.lang ? ' ' + block.lang : ''}</span>\n` +
                       `<span class="md-code-content">${this.escapeHtml(block.code)}</span>\n` +
                       `<span class="md-marker">${block.fence}</span>` +
                       `</div>`;
            });
            
            return result;
        },

        highlightHeaders: function(text) {
            // ATX headers: # Heading
            text = text.replace(/^(#{1,6})\s+(.*?)$/gm, (match, hashes, content) => {
                return `<span class="md-header"><span class="md-marker">${hashes}</span> <span class="md-header-text">${content}</span></span>`;
            });
            
            // Setext headers: Heading\n==== or Heading\n----
            text = text.replace(/^(.+)\n(={3,}|-{3,})\s*$/gm, (match, content, underline) => {
                return `<div class="md-setext"><span class="md-setext-text">${content}</span>\n<span class="md-setext-underline">${underline}</span></div>`;
            });
            
            return text;
        },

        highlightEmphasis: function(text) {
            // Bold italic: ***text*** - markers and text all purple
            text = text.replace(/(\*\*\*|___)(.*?)\1/g, (match, marker, content) => {
                return `<span class="md-bold-italic"><span class="md-marker">${marker}</span>${content}<span class="md-marker">${marker}</span></span>`;
            });
            
            // Bold: **text** or __text__ - markers and text all purple
            text = text.replace(/(\*\*|__)(.*?)\1/g, (match, marker, content) => {
                return `<span class="md-bold"><span class="md-marker">${marker}</span>${content}<span class="md-marker">${marker}</span></span>`;
            });
            
            // Italic: *text* or _text_ (with word boundaries) - markers and text all purple
            text = text.replace(/(?<=^|\s)\*([^*\n]+?)\*(?=\s|$)/g, (match, content) => {
                const space = match[0] === ' ' ? ' ' : '';
                return space + `<span class="md-italic"><span class="md-marker">*</span>${content}<span class="md-marker">*</span></span>`;
            });
            
            text = text.replace(/(?<=^|\s)_([^_\n]+?)_(?=\s|$)/g, (match, content) => {
                const space = match[0] === ' ' ? ' ' : '';
                return space + `<span class="md-italic"><span class="md-marker">_</span>${content}<span class="md-marker">_</span></span>`;
            });
            
            // Strikethrough: ~~text~~ - markers and text all purple
            text = text.replace(/~~(.*?)~~/g, (match, content) => {
                return `<span class="md-strikethrough"><span class="md-marker">~~</span>${content}<span class="md-marker">~~</span></span>`;
            });
            
            return text;
        },

        highlightLinks: function(text) {
            // Links with titles: [text](url "title")
            text = text.replace(/\[([^\]]+)\]\(([^)\s]+)\s+(["'][^"']*["']|\([^)]*\))\)/g, (match, linkText, url, title) => {
                return `<span class="md-link-with-title">` +
                       `<span class="md-marker">[</span>` +
                       `<span class="md-link-text">${linkText}</span>` +
                       `<span class="md-marker">](</span>` +
                       `<span class="md-url">${url}</span>` +
                       ` <span class="md-title">${title}</span>` +
                       `<span class="md-marker">)</span>` +
                       `</span>`;
            });
            
            // Regular links: [text](url)
            text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, linkText, url) => {
                return `<span class="md-link">` +
                       `<span class="md-marker">[</span>` +
                       `<span class="md-link-text">${linkText}</span>` +
                       `<span class="md-marker">](</span>` +
                       `<span class="md-url">${url}</span>` +
                       `<span class="md-marker">)</span>` +
                       `</span>`;
            });
            
            // Reference links: [text][id]
            text = text.replace(/\[([^\]]+)\]\[([^\]]*)\]/g, (match, linkText, id) => {
                return `<span class="md-ref-link">` +
                       `<span class="md-marker">[</span>` +
                       `<span class="md-link-text">${linkText}</span>` +
                       `<span class="md-marker">][</span>` +
                       (id ? `<span class="md-ref-id">${id}</span>` : '') +
                       `<span class="md-marker">]</span>` +
                       `</span>`;
            });
            
            // Implicit reference links: [text][]
            text = text.replace(/\[([^\]]+)\]\s*\[\]/g, (match, linkText) => {
                return `<span class="md-ref-link md-implicit">` +
                       `<span class="md-marker">[</span>` +
                       `<span class="md-link-text">${linkText}</span>` +
                       `<span class="md-marker">][]</span>` +
                       `</span>`;
            });
            
            // Reference definitions: [id]: url "title"
            text = text.replace(/^\[([^\]]+)\]:\s+(\S+)(?:\s+(.*?))?\s*$/gm, (match, id, url, title) => {
                let result = `<div class="md-ref-def">` +
                            `<span class="md-marker">[</span>` +
                            `<span class="md-ref-id">${id}</span>` +
                            `<span class="md-marker">]:</span> ` +
                            `<span class="md-url">${url}</span>`;
                if (title) {
                    result += ` <span class="md-title">${title}</span>`;
                }
                result += `</div>`;
                return result;
            });
            
            return text;
        },

        highlightImages: function(text) {
            // Images: ![alt](url)
            return text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, url) => {
                return `<span class="md-image">` +
                       `<span class="md-image-exclamation">!</span>` +
                       `<span class="md-marker">[</span>` +
                       `<span class="md-image-alt">${alt || ''}</span>` +
                       `<span class="md-marker">](</span>` +
                       `<span class="md-url">${url}</span>` +
                       `<span class="md-marker">)</span>` +
                       `</span>`;
            });
        },

        highlightLists: function(text) {
            // Unordered lists
            text = text.replace(/^(\s*)([*+-])\s+(.*)$/gm, (match, indent, marker, content) => {
                const level = Math.floor(indent.length / 2) + 1;
                if (indent && indent.length > 0) {
                    return `<div class="md-list-item md-level-${level}">` +
                           `<span class="md-indent">${indent}</span>` +
                           `<span class="md-marker md-marker-${level}">${marker}</span>` +
                           `<span class="md-list-content"> ${content}</span>` +
                           `</div>`;
                } else {
                    return `<div class="md-list-item md-level-${level}">` +
                           `<span class="md-marker md-marker-${level}">${marker}</span>` +
                           `<span class="md-list-content"> ${content}</span>` +
                           `</div>`;
                }
            });
            
            // Ordered lists
            text = text.replace(/^(\s*)(\d+\.)\s+(.*)$/gm, (match, indent, marker, content) => {
                const level = Math.floor(indent.length / 2) + 1;
                if (indent && indent.length > 0) {
                    return `<div class="md-list-item md-level-${level} md-ordered">` +
                           `<span class="md-indent">${indent}</span>` +
                           `<span class="md-marker md-marker-${level}">${marker}</span>` +
                           `<span class="md-list-content"> ${content}</span>` +
                           `</div>`;
                } else {
                    return `<div class="md-list-item md-level-${level} md-ordered">` +
                           `<span class="md-marker md-marker-${level}">${marker}</span>` +
                           `<span class="md-list-content"> ${content}</span>` +
                           `</div>`;
                }
            });
            
            // Task lists
            text = text.replace(/^(\s*)[*+-]\s+\[([ x])\]\s+(.*)$/gm, (match, indent, checked, content) => {
                const level = Math.floor(indent.length / 2) + 1;
                const checkedClass = checked === 'x' ? 'checked' : 'unchecked';
                
                if (indent && indent.length > 0) {
                    return `<div class="md-list-item md-level-${level} md-task">` +
                           `<span class="md-indent">${indent}</span>` +
                           `<span class="md-marker md-marker-${level}">-</span>` +
                           `<span class="md-checkbox ${checkedClass}"> [${checked}]</span>` +
                           `<span class="md-list-content"> ${content}</span>` +
                           `</div>`;
                } else {
                    return `<div class="md-list-item md-level-${level} md-task">` +
                           `<span class="md-marker md-marker-${level}">-</span>` +
                           `<span class="md-checkbox ${checkedClass}"> [${checked}]</span>` +
                           `<span class="md-list-content"> ${content}</span>` +
                           `</div>`;
                }
            });
            
            return text;
        },

        highlightHorizontalRules: function(text) {
            return text.replace(/^(\s*)([-*_])\2\2(?:\2*)\s*$/gm, (match, indent, char) => {
                return `<div class="md-hr"><span class="md-indent">${indent}</span><span class="md-content">${char.repeat(3)}</span></div>`;
            });
        },

        highlightCode: function(text) {
            // Inline code
            text = text.replace(/`([^`\n]+)`/g, (match, content) => {
                return `<span class="md-inline-code"><span class="md-marker">\`</span>${content}<span class="md-marker">\`</span></span>`;
            });
            
            return text;
        },

        escapeHtml: function(text) {
            return text.replace(/&/g, '&amp;')
                       .replace(/</g, '&lt;')
                       .replace(/>/g, '&gt;')
                       .replace(/"/g, '&quot;')
                       .replace(/'/g, '&#39;');
        },

        highlightElement: function(element) {
            if (!element) return;
            const text = element.textContent || element.innerText;
            element.innerHTML = this.highlight(text);
            element.classList.add('md-highlighted');
        }
    };

    window.MarkdownSyntaxHighlighter = MarkdownSyntaxHighlighter;
    console.log('✓ True Markdown Syntax Highlighter loaded');
})();