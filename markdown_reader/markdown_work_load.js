// Smart Markdown Loader with Embedded Worker
(function() {
    const CONFIG = {
        WORKER_THRESHOLD: 100 * 1024, // 100KB
        USE_CACHE: true,
        MAX_CACHE_SIZE: 50,
        WORKER_TIMEOUT: 10000,
        FALLBACK_TO_SYNC: true,
        DEBUG_CACHE: true // Enable cache debugging
    };

    // Expose config for debugging
    window.CONFIG = CONFIG;

    // ==================================================================
    // CACHE MANAGEMENT with Debugging
    // ==================================================================
    
    const parseCache = new Map();
    const cacheKeys = [];
    let cacheHits = 0;
    let cacheMisses = 0;
    
    // Store last few cache keys for debugging
    const lastKeys = [];

    function generateCacheKey(text) {
        // Use a more reliable cache key
        // First, normalize the text to ensure consistency
        const normalized = text.replace(/\r\n/g, '\n'); // Normalize line endings
        
        // Use first 200 chars + length + simple hash
        const sample = normalized.substring(0, 200);
        const len = normalized.length;
        
        let hash1 = 0;
        let hash2 = 0;
        
        for (let i = 0; i < sample.length; i++) {
            hash1 = ((hash1 << 5) - hash1) + sample.charCodeAt(i);
            hash1 |= 0;
        }
        
        // Add a second hash from the end of the file for better distribution
        const endSample = normalized.substring(Math.max(0, len - 200));
        for (let i = 0; i < endSample.length; i++) {
            hash2 = ((hash2 << 5) - hash2) + endSample.charCodeAt(i);
            hash2 |= 0;
        }
        
        return `${hash1.toString(36)}_${hash2.toString(36)}_${len}`;
    }

    function getFromCache(text) {
        if (!CONFIG.USE_CACHE) return null;
        
        const key = generateCacheKey(text);
        const cached = parseCache.get(key);
        
        // Store for debugging
        lastKeys.unshift({ key, found: !!cached, time: Date.now() });
        if (lastKeys.length > 10) lastKeys.pop();
        
        if (cached) {
            cacheHits++;
            if (CONFIG.DEBUG_CACHE) {
                console.log(`🔴 Cache HIT - Key: ${key.substring(0, 20)}... (${cacheHits} hits, ${cacheMisses} misses)`);
            }
            return cached;
        } else {
            cacheMisses++;
            if (CONFIG.DEBUG_CACHE) {
                console.log(`🔴 Cache MISS - Key: ${key.substring(0, 20)}... (${cacheHits} hits, ${cacheMisses} misses)`);
                // Show existing keys for comparison
                console.log('🔴 Existing keys:', Array.from(parseCache.keys()).map(k => k.substring(0, 20) + '...'));
            }
            return null;
        }
    }

    function saveToCache(text, html) {
        if (!CONFIG.USE_CACHE) return;
        
        const key = generateCacheKey(text);
        
        if (parseCache.size >= CONFIG.MAX_CACHE_SIZE) {
            const oldestKey = cacheKeys.shift();
            parseCache.delete(oldestKey);
            if (CONFIG.DEBUG_CACHE) {
                console.log(`🔴 Cache evicted: ${oldestKey.substring(0, 20)}...`);
            }
        }
        
        parseCache.set(key, html);
        cacheKeys.push(key);
        
        if (CONFIG.DEBUG_CACHE) {
            console.log(`🔴 Cached - Key: ${key.substring(0, 20)}... (${parseCache.size}/${CONFIG.MAX_CACHE_SIZE} entries)`);
        }
    }

    // Expose cache controls with debugging
    window.clearMarkdownCache = function() {
        parseCache.clear();
        cacheKeys.length = 0;
        cacheHits = 0;
        cacheMisses = 0;
        lastKeys.length = 0;
        console.log('🔴 Cache cleared');
    };

    window.getCacheStats = function() {
        return {
            size: parseCache.size,
            maxSize: CONFIG.MAX_CACHE_SIZE,
            hits: cacheHits,
            misses: cacheMisses,
            hitRate: cacheHits + cacheMisses > 0 
                ? (cacheHits / (cacheHits + cacheMisses) * 100).toFixed(1) + '%'
                : '0%',
            keys: Array.from(parseCache.keys()).map(k => k.substring(0, 20) + '...'),
            recentKeys: lastKeys
        };
    };

    window.inspectCacheKey = function(text) {
        const key = generateCacheKey(text);
        console.log('Generated key:', key);
        console.log('Exists in cache:', parseCache.has(key));
        console.log('All keys:', Array.from(parseCache.keys()));
        return key;
    };

    // ==================================================================
    // WORKER MANAGEMENT (Embedded)
    // ==================================================================
    
    let worker = null;
    let workerBirthTime = Date.now();

    // Worker code as a string
    const WORKER_CODE = `
        self.onmessage = function(e) {
            const { text, taskId } = e.data;
            
            try {
                // Import the parser
                importScripts('markdown_reader/markdown_standard.js');
                
                const html = self.parseMarkdown(text);
                
                self.postMessage({
                    html,
                    taskId,
                    success: true
                });
                
            } catch (error) {
                self.postMessage({
                    error: error.message,
                    taskId,
                    success: false
                });
            }
        };
        
        self.postMessage({ type: 'ready' });
    `;

    function getWorker() {
        if (!window.Worker) return null;
        
        if (Date.now() - workerBirthTime > 60000) {
            if (worker) {
                try { worker.terminate(); } catch (e) {}
                worker = null;
            }
            workerBirthTime = Date.now();
        }
        
        if (!worker) {
            try {
                const blob = new Blob([WORKER_CODE], { type: 'application/javascript' });
                worker = new Worker(URL.createObjectURL(blob));
                
                worker.onerror = (error) => {
                    console.error('🔴 Worker error:', error);
                    worker = null;
                };
            } catch (e) {
                console.error('🔴 Failed to create worker:', e);
                return null;
            }
        }
        
        return worker;
    }

    // ==================================================================
    // PARSING FUNCTIONS
    // ==================================================================
    
    function parseWithWorker(text) {
        return new Promise((resolve, reject) => {
            const worker = getWorker();
            
            if (!worker) {
                try {
                    const startTime = performance.now();
                    const html = window.parseMarkdown(text);
                    const parseTime = performance.now() - startTime;
                    resolve({ html, parseTime, usedWorker: false });
                } catch (e) {
                    reject(e);
                }
                return;
            }
            
            const taskId = Date.now() + Math.random();
            const startTime = performance.now();
            
            const timeout = setTimeout(() => {
                if (CONFIG.FALLBACK_TO_SYNC) {
                    try {
                        const html = window.parseMarkdown(text);
                        const parseTime = performance.now() - startTime;
                        resolve({ html, parseTime, usedWorker: false, fallback: true });
                    } catch (e) {
                        reject(e);
                    }
                } else {
                    reject(new Error('Worker timeout'));
                }
            }, CONFIG.WORKER_TIMEOUT);
            
            const messageHandler = (e) => {
                if (e.data.type === 'ready') return;
                
                if (e.data.taskId === taskId) {
                    clearTimeout(timeout);
                    worker.removeEventListener('message', messageHandler);
                    
                    const parseTime = performance.now() - startTime;
                    
                    if (e.data.error) {
                        reject(new Error(e.data.error));
                    } else {
                        resolve({ 
                            html: e.data.html, 
                            parseTime, 
                            usedWorker: true 
                        });
                    }
                }
            };
            
            worker.addEventListener('message', messageHandler);
            worker.postMessage({ text, taskId });
        });
    }

    // ==================================================================
    // MAIN API
    // ==================================================================
    
    window.parseMarkdownSmart = async function(text, options = {}) {
        const startTime = performance.now();
        const stats = {
            size: text.length,
            usedCache: false,
            usedWorker: false,
            parseTime: 0
        };
        
        try {
            // Check cache first
            const cached = getFromCache(text);
            if (cached) {
                stats.usedCache = true;
                stats.parseTime = 0;
                
                if (CONFIG.DEBUG_CACHE) {
                    console.log(`🔴 Serving from cache - size: ${(text.length/1024).toFixed(1)}KB`);
                }
                
                return { html: cached, stats };
            }
            
            if (CONFIG.DEBUG_CACHE) {
                console.log(`🔴 Cache miss - parsing ${(text.length/1024).toFixed(1)}KB...`);
            }
            
            // Choose parsing method
            const useWorker = (text.length > CONFIG.WORKER_THRESHOLD || options.forceWorker) && 
                             window.Worker !== undefined;
            
            let html;
            let parseTime;
            
            if (useWorker) {
                stats.usedWorker = true;
                if (CONFIG.DEBUG_CACHE) console.log('🔴 Using worker for parsing');
                const result = await parseWithWorker(text);
                html = result.html;
                parseTime = result.parseTime;
            } else {
                if (CONFIG.DEBUG_CACHE) console.log('🔴 Using sync parsing');
                const syncStart = performance.now();
                html = window.parseMarkdown(text);
                parseTime = performance.now() - syncStart;
            }
            
            // Cache result
            saveToCache(text, html);
            
            stats.parseTime = parseTime;
            stats.totalTime = performance.now() - startTime;
            
            if (CONFIG.DEBUG_CACHE) {
                console.log(`🔴 Parse complete in ${parseTime.toFixed(2)}ms`);
            }
            
            return { html, stats };
            
        } catch (error) {
            console.error('🔴 Parse error:', error);
            
            if (CONFIG.FALLBACK_TO_SYNC && window.parseMarkdown) {
                console.log('🔴 Falling back to sync after error');
                const syncStart = performance.now();
                const html = window.parseMarkdown(text);
                const parseTime = performance.now() - syncStart;
                
                return { 
                    html, 
                    stats: { 
                        ...stats, 
                        parseTime,
                        fallback: true 
                    } 
                };
            }
            
            throw error;
        }
    };

    // Feature detection
    window.supportsWorkers = !!window.Worker;
    
    // Log initialization
    console.log('🔴 Markdown loader initialized', {
        workers: window.supportsWorkers ? 'supported' : 'not supported',
        cacheSize: CONFIG.MAX_CACHE_SIZE,
        threshold: CONFIG.WORKER_THRESHOLD,
        debug: CONFIG.DEBUG_CACHE
    });

    // Add test function for cache verification
    window.testCache = async function() {
        console.log('🔴 Testing cache with sample text...');
        const sample = '# Test\nThis is a test file.\n';
        
        console.log('First parse (should miss):');
        const result1 = await window.parseMarkdownSmart(sample);
        console.log('Stats:', result1.stats);
        
        console.log('Second parse (should hit):');
        const result2 = await window.parseMarkdownSmart(sample);
        console.log('Stats:', result2.stats);
        
        console.log('Final cache stats:', window.getCacheStats());
    };
})();