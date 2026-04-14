// emoji-processor.js
// A simple, parser‑agnostic emoji processor that replaces text emoticons (e.g., ":)") with Unicode emoji.
// Extend or modify the emoticon map to suit your needs.

(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD (RequireJS)
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node.js / CommonJS
        module.exports = factory();
    } else {
        // Browser global
        root.processEmojis = factory();
    }
}(typeof self !== 'undefined' ? self : this, function() {

    'use strict';

    /**
     * Default emoticon to Unicode emoji mapping.
     * Add or remove entries as needed.
     */
    const defaultMap = {
        // Smiles
        ':)': '😊',
        ':-)': '😊',
        ':D': '😃',
        ':-D': '😃',
        ':d': '😃',
        ':-d': '😃',
        '=)': '😊',
        // Sad / frowning
        ':(': '☹️',
        ':-(': '☹️',
        '=(': '☹️',
        // Winking
        ';)': '😉',
        ';-)': '😉',
        // Tongue out
        ':P': '😛',
        ':-P': '😛',
        ':p': '😛',
        ':-p': '😛',
        '=P': '😛',
        '=p': '😛',
        // Surprised
        ':O': '😮',
        ':-O': '😮',
        ':o': '😮',
        ':-o': '😮',
        // Kiss
        ':*': '😘',
        ':-*': '😘',
        // Confused
        ':/': '😕',
        ':-/': '😕',
        ':\\': '😕',
        ':-\\': '😕',
        // Evil / grinning
        '>:)': '😈',
        '>:-)': '😈',
        '>=)': '😈',
        // Cool
        'B)': '😎',
        'B-)': '😎',
        '8)': '😎',
        '8-)': '😎',
        // Crying
        ":'(": '😢',
        ":'-(": '😢',
        // Heart
        '<3': '❤️',
        '</3': '💔',
        // Shrug (text-based, not a true emoji but included for completeness)
        // You can add more as needed
    };

    /**
     * Escape special regex characters in a string.
     * @param {string} str - The string to escape.
     * @returns {string} Escaped string safe for RegExp.
     */
    function escapeRegExp(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    /**
     * Process a string by replacing emoticons with Unicode emoji.
     * @param {string} text - The input text.
     * @param {Object} [customMap] - Optional custom mapping (extends/replaces default).
     * @param {boolean} [extend=true] - If true, customMap extends default; if false, replaces it.
     * @returns {string} Text with emoticons replaced.
     */
    function processEmojis(text, customMap, extend = true) {
        if (typeof text !== 'string') return text;

        // Merge maps
        let map = defaultMap;
        if (customMap) {
            if (extend) {
                map = { ...defaultMap, ...customMap };
            } else {
                map = customMap;
            }
        }

        // Build a single regex that matches any of the emoticons
        const emoticons = Object.keys(map);
        if (emoticons.length === 0) return text;

        // Sort by length descending to avoid partial matches (e.g., ':)' inside ':-)')
        emoticons.sort((a, b) => b.length - a.length);

        const pattern = emoticons.map(escapeRegExp).join('|');
        const regex = new RegExp(pattern, 'g');

        return text.replace(regex, (match) => map[match] || match);
    }

    return processEmojis;
}));