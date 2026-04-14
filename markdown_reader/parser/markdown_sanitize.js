// markdown_sanitize.js
// HTML Sanitizer for Markdown - BLOCKS ALL SCRIPT TAGS AND DANGEROUS HTML
// Automatically enables on load - ZERO TOLERANCE for scripts
(function() {
    'use strict';

    const CONFIG = {
        // Mode: 'strip' (remove tags completely) or 'escape' (convert < to &lt;)
        mode: 'strip', // STRIP by default for maximum security
        // Block these completely (removed with their content)
        blockedTags: ['script', 'iframe', 'object', 'embed', 'applet', 'frame', 'frameset'],
        // Strip event handlers even in escape mode
        stripEventHandlers: true,
        // Preserve HTML comments?
        stripComments: true
    };

    // Expose config (read-only for security - changes require page reload)
    window.htmlSanitizerConfig = Object.freeze({...CONFIG});

    // ==================================================================
    // AGGRESSIVE SCRIPT BLOCKING REGEX
    // ==================================================================
    
    // Script tags - catch all variations
    const scriptRegex = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
    const scriptShortRegex = /<script[^>]*\/>/gi; // Self-closing script tags
    const scriptSrcRegex = /<script[^>]*src=["'][^"']*["'][^>]*>/gi; // Scripts with src
    
    // Dangerous tags that can execute code or embed external content
    const dangerousTags = [
        'iframe', 'object', 'embed', 'applet', 'frame', 'frameset',
        'video', 'audio', 'source', 'track' // Media elements can have scripts in URLs
    ].join('|');
    const dangerousTagRegex = new RegExp(`<(\/?)(${dangerousTags})\\b[^>]*>`, 'gi');
    
    // Event handlers (onclick, onload, onerror, etc.)
    const eventHandlerRegex = /\s+on\w+\s*=\s*(["'])[^"']*\1/gi;
    
    // javascript: URLs in attributes
    const javascriptUrlRegex = /\s+(href|src|action|formaction|data)\s*=\s*(["'])\s*javascript:[^"']*\2/gi;
    
    // data: URLs that could contain scripts
    const dataUrlRegex = /\s+(href|src|action|formaction|data)\s*=\s*(["'])\s*data:text\/html[^"']*\2/gi;
    
    // Base64 encoded content that might contain scripts
    const base64ScriptRegex = /<[^>]*src=["'][^"']*base64[^"']*["'][^>]*>/gi;
    
    // HTML comments (can hide malicious content)
    const commentRegex = /<!--[\s\S]*?-->/g;
    
    // Doctype (can trigger quirks mode)
    const doctypeRegex = /<!doctype[^>]*>/gi;
    
    // Meta tags (can redirect, set cookies, etc.)
    const metaRegex = /<meta\b[^>]*>/gi;
    
    // Link tags (can import stylesheets with scripts)
    const linkRegex = /<link\b[^>]*>/gi;
    
    // Style tags (can contain expressions in IE)
    const styleRegex = /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi;

    // ==================================================================
    // HELPER FUNCTIONS
    // ==================================================================
    
    function escapeHtml(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Completely remove tags and their content
    function removeTagWithContent(text, tagName) {
        const regex = new RegExp(`<${tagName}\\b[^<]*(?:(?!<\\/${tagName}>)<[^<]*)*<\\/${tagName}>`, 'gi');
        return text.replace(regex, '');
    }

    // ==================================================================
    // MAIN SANITIZATION
    // ==================================================================
    
    function sanitizeHtml(html) {
        if (!html) return html;

        let sanitized = html;

        // ===== STAGE 1: REMOVE DANGEROUS TAGS AND THEIR CONTENTS =====
        
        // Remove ALL script tags and their contents (multiple patterns)
        sanitized = sanitized.replace(scriptRegex, ''); // Standard script tags
        sanitized = sanitized.replace(scriptShortRegex, ''); // Self-closing scripts
        sanitized = sanitized.replace(scriptSrcRegex, ''); // Scripts with src
        
        // Remove iframes and other dangerous embedding tags
        sanitized = sanitized.replace(dangerousTagRegex, (match, closing, tag) => {
            // If it's a closing tag, just remove it
            if (closing) return '';
            // For opening tags, we need to find and remove the entire element
            const tagName = tag;
            return removeTagWithContent(sanitized, tagName);
        });
        
        // Remove meta tags (can do redirects)
        sanitized = sanitized.replace(metaRegex, '');
        
        // Remove link tags (can import malicious resources)
        sanitized = sanitized.replace(linkRegex, '');
        
        // Remove style tags (CSS expressions can execute code in old IE)
        sanitized = sanitized.replace(styleRegex, '');

        // ===== STAGE 2: STRIP DANGEROUS ATTRIBUTES =====
        
        // Remove all event handlers (onclick, onload, onerror, etc.)
        sanitized = sanitized.replace(eventHandlerRegex, '');
        
        // Remove javascript: URLs
        sanitized = sanitized.replace(javascriptUrlRegex, (match, attr, quote) => {
            return ` ${attr}=${quote}#blocked-javascript-url${quote}`;
        });
        
        // Remove data:text/html URLs
        sanitized = sanitized.replace(dataUrlRegex, (match, attr, quote) => {
            return ` ${attr}=${quote}#blocked-data-url${quote}`;
        });

        // ===== STAGE 3: REMOVE COMMENTS AND DOCTYPE =====
        
        if (CONFIG.stripComments) {
            sanitized = sanitized.replace(commentRegex, '');
        }
        
        sanitized = sanitized.replace(doctypeRegex, '');

        // ===== STAGE 4: HANDLE REMAINING TAGS BASED ON MODE =====
        
        // Final pass: catch any remaining tags with javascript:
        const remainingJsUrls = /\s+(href|src|action|formaction|data)\s*=\s*(["'])[^"']*javascript:[^"']*\2/gi;
        sanitized = sanitized.replace(remainingJsUrls, (match, attr, quote) => {
            return ` ${attr}=${quote}#blocked${quote}`;
        });

        // Apply main sanitization based on mode
        switch (CONFIG.mode) {
            case 'escape':
                // Escape all remaining HTML tags
                sanitized = sanitized.replace(/<[^>]*>/g, (match) => {
                    return escapeHtml(match);
                });
                break;
                
            case 'strip':
                // Strip all remaining HTML tags
                sanitized = sanitized.replace(/<[^>]*>/g, '');
                break;
                
            default:
                // Default to strip for maximum security
                sanitized = sanitized.replace(/<[^>]*>/g, '');
        }

        return sanitized;
    }

    // ==================================================================
    // MARKDOWN PRE-PROCESSING
    // ==================================================================
    
    function sanitizeMarkdown(markdown) {
        if (!markdown) return markdown;
        
        // First, protect code blocks (don't sanitize inside them)
        const codeBlocks = [];
        let processed = markdown.replace(/(`{3,}|~{3,})([^\n]*)\n([\s\S]*?)\n\1/g, (match, fences, lang, code) => {
            codeBlocks.push(match);
            return `!!SANITIZE_CODE_${codeBlocks.length - 1}!!`;
        });
        
        // Also protect inline code
        processed = processed.replace(/`([^`]+)`/g, (match, code) => {
            codeBlocks.push(match);
            return `!!SANITIZE_CODE_${codeBlocks.length - 1}!!`;
        });
        
        // Sanitize the rest aggressively
        processed = sanitizeHtml(processed);
        
        // Restore code blocks (they were already safe)
        processed = processed.replace(/!!SANITIZE_CODE_(\d+)!!/g, (_, index) => {
            return codeBlocks[parseInt(index)] || '';
        });
        
        return processed;
    }

    // ==================================================================
    // PARSER WRAPPING
    // ==================================================================
    
    function enableSanitizer() {
        if (!window.parseMarkdown) {
            console.error('🔒 HTML Sanitizer: parseMarkdown not found - retrying...');
            setTimeout(enableSanitizer, 100);
            return false;
        }
        
        // Store original if not already stored
        if (!window._originalParseMarkdown) {
            window._originalParseMarkdown = window.parseMarkdown;
        } else {
            return true; // Already enabled
        }
        
        // Replace with safe version
        window.parseMarkdown = function(text) {
            const sanitized = sanitizeMarkdown(text);
            return window._originalParseMarkdown(sanitized);
        };
        
        console.log('🔒 HTML Sanitizer ENABLED - ALL script tags blocked');
        console.log('🔒 Mode:', CONFIG.mode, '| Event handlers stripped:', CONFIG.stripEventHandlers);
        return true;
    }

    // ==================================================================
    // PUBLIC API
    // ==================================================================
    
    window.disableHtmlSanitizer = function() {
        if (window._originalParseMarkdown) {
            window.parseMarkdown = window._originalParseMarkdown;
            window._originalParseMarkdown = null;
            console.log('🔒 HTML Sanitizer DISABLED - UNSAFE MODE');
            return true;
        }
        return false;
    };

    window.sanitizeHtml = sanitizeHtml;
    window.sanitizeMarkdown = sanitizeMarkdown;
    
    // Test function to verify security
    window.testSanitizer = function() {
        const tests = [
            '<script>alert("xss")</script>',
            '<script src="http://evil.com/xss.js"></script>',
            '<img src=x onerror=alert(1)>',
            '<iframe src="http://evil.com"></iframe>',
            '<div onclick="alert(1)">click</div>',
            '<a href="javascript:alert(1)">click</a>',
            '<meta http-equiv="refresh" content="0;url=http://evil.com">',
            '<link rel="stylesheet" href="http://evil.com/style.css">',
            '<!-- <script>alert(1)</script> -->',
            '<?php echo "evil"; ?>',
            '<applet code="evil.class"></applet>',
            '<embed src="evil.swf"></embed>',
            '<object data="evil.swf"></object>',
            '<base href="http://evil.com">',
            '<math href="javascript:alert(1)">click</math>'
        ];
        
        console.log('🔒 Testing sanitizer:');
        tests.forEach(test => {
            const result = sanitizeHtml(test);
            console.log(`  Input:  ${test}`);
            console.log(`  Output: ${result}`);
            console.log(`  Safe:   ${!result.includes('script') && !result.includes('javascript:') ? '✅' : '❌'}`);
        });
    };

    // ==================================================================
    // AUTO-ENABLE
    // ==================================================================
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(enableSanitizer, 50);
        });
    } else {
        setTimeout(enableSanitizer, 50);
    }
    
    // Also try immediately
    setTimeout(enableSanitizer, 100);

    console.log('🔒 HTML Sanitizer loaded - ZERO TOLERANCE script blocking enabled');
    console.log('🔒 Test with testSanitizer() to verify security');
})();