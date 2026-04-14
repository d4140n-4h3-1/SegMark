// Smart Markdown Loader with Advanced Caching and Reliability Features
(function() {
    const CONFIG = {
        WORKER_THRESHOLD: 100 * 1024, // 100KB
        USE_CACHE: true,
        FALLBACK_TO_SYNC: true,
        WORKER_TIMEOUT: 10000,
        DEBUG_CACHE: false, // Set to false in production
        MAX_MEMORY_USAGE: 50 * 1024 * 1024, // 50MB max cache size
        COMPRESS_CACHE: false, // Enable for very large documents
        WORKER_RETRY_COUNT: 3,
        WORKER_RETRY_DELAY: 1000
    };

    // Expose config for debugging
    window.CONFIG = CONFIG;

    // ==================================================================
    // ADVANCED CACHE MANAGEMENT with Size Levels, TTL and Memory Limits
    // ==================================================================
    
    // Cache levels based on file size
    const CACHE = {
        tiny: new Map(),    // < 1KB
        small: new Map(),   // 1KB - 10KB
        medium: new Map(),  // 10KB - 50KB
        large: new Map(),   // 50KB - 250KB
        huge: new Map()     // > 250KB
    };
    
    // Size limits per cache level
    const MAX_SIZE = {
        tiny: 200,    // Keep more tiny files
        small: 150,
        medium: 75,
        large: 30,
        huge: 10      // Limit huge files to prevent memory issues
    };
    
    // TTL in milliseconds per cache level
    const TTL = {
        tiny: 10 * 60 * 1000,   // 10 minutes
        small: 5 * 60 * 1000,   // 5 minutes
        medium: 3 * 60 * 1000,  // 3 minutes
        large: 2 * 60 * 1000,   // 2 minutes
        huge: 60 * 1000         // 1 minute
    };
    
    // Cache statistics with memory tracking
    const stats = {
        tiny: { hits: 0, misses: 0, entries: 0, bytes: 0 },
        small: { hits: 0, misses: 0, entries: 0, bytes: 0 },
        medium: { hits: 0, misses: 0, entries: 0, bytes: 0 },
        large: { hits: 0, misses: 0, entries: 0, bytes: 0 },
        huge: { hits: 0, misses: 0, entries: 0, bytes: 0 },
        total: { hits: 0, misses: 0, bytes: 0 }
    };
    
    // Store timestamps and size info for TTL and memory tracking
    const metadata = new Map(); // key -> { timestamp, size, accessCount }
    
    // Track cache keys by level for LRU eviction
    const keyQueue = {
        tiny: [],
        small: [],
        medium: [],
        large: [],
        huge: []
    };

    // Performance metrics
    const perfMetrics = {
        parseTimes: [],
        cacheHitTimes: [],
        workerTimes: [],
        errors: []
    };

    function getCacheLevel(size) {
        if (size < 1 * 1024) return 'tiny';
        if (size < 10 * 1024) return 'small';
        if (size < 50 * 1024) return 'medium';
        if (size < 250 * 1024) return 'large';
        return 'huge';
    }

    function generateCacheKey(text) {
        // Normalize line endings for consistency
        const normalized = text.replace(/\r\n/g, '\n');
        
        // Use multiple samples for better distribution
        const len = normalized.length;
        const start = normalized.substring(0, Math.min(200, len));
        const end = normalized.substring(Math.max(0, len - 200));
        const middle = normalized.substring(
            Math.floor(len / 2) - 100,
            Math.floor(len / 2) + 100
        );
        
        // Combine samples for hashing
        const sample = start + '|' + middle + '|' + end;
        
        // Create hash
        let hash1 = 0, hash2 = 0, hash3 = 0;
        for (let i = 0; i < sample.length; i++) {
            hash1 = ((hash1 << 5) - hash1) + sample.charCodeAt(i);
            hash1 |= 0;
            
            if (i % 2 === 0) {
                hash2 = ((hash2 << 5) - hash2) + sample.charCodeAt(i);
                hash2 |= 0;
            }
            
            if (i % 3 === 0) {
                hash3 = ((hash3 << 5) - hash3) + sample.charCodeAt(i);
                hash3 |= 0;
            }
        }
        
        return `${hash1.toString(36)}_${hash2.toString(36)}_${hash3.toString(36)}_${len}`;
    }

    function getTotalCacheBytes() {
        return stats.total.bytes;
    }

    function evictIfNeeded(level, newEntrySize = 0) {
        const cache = CACHE[level];
        const queue = keyQueue[level];
        const maxSize = MAX_SIZE[level];
        const currentBytes = stats[level].bytes;
        
        // Check if we need to evict based on count or memory
        while (cache.size >= maxSize || 
               (getTotalCacheBytes() + newEntrySize > CONFIG.MAX_MEMORY_USAGE && cache.size > 0)) {
            
            // Remove oldest entry (LRU)
            const oldestKey = queue.shift();
            if (!oldestKey) break;
            
            const oldEntry = cache.get(oldestKey);
            const oldMeta = metadata.get(oldestKey);
            
            if (oldEntry && oldMeta) {
                // Update byte count
                stats[level].bytes -= oldMeta.size;
                stats.total.bytes -= oldMeta.size;
                
                if (CONFIG.DEBUG_CACHE) {
                    console.log(`🔷 Cache EVICT [${level}] - freed ${(oldMeta.size/1024).toFixed(1)}KB, total memory: ${(stats.total.bytes/1024/1024).toFixed(2)}MB`);
                }
            }
            
            cache.delete(oldestKey);
            metadata.delete(oldestKey);
        }
        
        stats[level].entries = cache.size;
    }

    function getFromCache(text) {
        if (!CONFIG.USE_CACHE) return null;
        
        const size = text.length;
        const level = getCacheLevel(size);
        const key = generateCacheKey(text);
        
        const cache = CACHE[level];
        const cached = cache.get(key);
        const meta = metadata.get(key);
        
        // Update stats
        stats[level].entries = cache.size;
        
        if (cached && meta) {
            // Check TTL
            if (Date.now() - meta.timestamp < TTL[level]) {
                stats[level].hits++;
                stats.total.hits++;
                
                // Update access count and timestamp for LRU
                meta.accessCount = (meta.accessCount || 0) + 1;
                meta.timestamp = Date.now(); // Refresh timestamp on access
                
                if (CONFIG.DEBUG_CACHE) {
                    console.log(`🔷 Cache HIT [${level}] - ${(size/1024).toFixed(1)}KB (${stats[level].hits}/${stats[level].misses}) - memory: ${(stats.total.bytes/1024/1024).toFixed(2)}MB`);
                }
                
                // Move to front of queue (LRU)
                const queue = keyQueue[level];
                const index = queue.indexOf(key);
                if (index > -1) {
                    queue.splice(index, 1);
                    queue.push(key);
                }
                
                // Track performance
                perfMetrics.cacheHitTimes.push(Date.now());
                if (perfMetrics.cacheHitTimes.length > 100) perfMetrics.cacheHitTimes.shift();
                
                return cached;
            } else {
                // Expired - remove it
                cache.delete(key);
                stats[level].bytes -= meta.size;
                stats.total.bytes -= meta.size;
                metadata.delete(key);
                
                const queue = keyQueue[level];
                const index = queue.indexOf(key);
                if (index > -1) queue.splice(index, 1);
                
                if (CONFIG.DEBUG_CACHE) {
                    console.log(`🔷 Cache EXPIRED [${level}] - ${(size/1024).toFixed(1)}KB`);
                }
            }
        }
        
        // Miss
        stats[level].misses++;
        stats.total.misses++;
        
        if (CONFIG.DEBUG_CACHE) {
            console.log(`🔷 Cache MISS [${level}] - ${(size/1024).toFixed(1)}KB (${stats[level].hits}/${stats[level].misses})`);
        }
        
        return null;
    }

    function saveToCache(text, html) {
        if (!CONFIG.USE_CACHE) return;
        
        const size = text.length;
        const level = getCacheLevel(size);
        const key = generateCacheKey(text);
        
        const cache = CACHE[level];
        const queue = keyQueue[level];
        
        // Check memory limits before adding
        evictIfNeeded(level, size);
        
        // If we already have this key, remove old metadata
        if (metadata.has(key)) {
            const oldMeta = metadata.get(key);
            stats[level].bytes -= oldMeta.size;
            stats.total.bytes -= oldMeta.size;
        }
        
        // Add to cache
        cache.set(key, html);
        metadata.set(key, {
            timestamp: Date.now(),
            size: size,
            accessCount: 1
        });
        
        // Update byte count
        stats[level].bytes += size;
        stats.total.bytes += size;
        
        // Add to queue if not already present
        if (!queue.includes(key)) {
            queue.push(key);
        }
        
        stats[level].entries = cache.size;
        
        if (CONFIG.DEBUG_CACHE) {
            console.log(`🔷 Cache SAVE [${level}] - ${(size/1024).toFixed(1)}KB (${cache.size}/${MAX_SIZE[level]} entries) - total memory: ${(stats.total.bytes/1024/1024).toFixed(2)}MB`);
        }
    }

    // ==================================================================
    // ENHANCED WORKER MANAGEMENT with Retry Logic
    // ==================================================================
    
    let worker = null;
    let workerBirthTime = Date.now();
    let workerErrorCount = 0;
    let workerHealthCheck = null;

    // Worker code as a string with better error handling
    const WORKER_CODE = `
        self.onmessage = function(e) {
            const { text, taskId } = e.data;
            
            try {
                // Import the parser with error handling
                try {
                    importScripts('markdown_standard.js');
                } catch (importError) {
                    self.postMessage({
                        error: 'Failed to load parser: ' + importError.message,
                        taskId,
                        success: false
                    });
                    return;
                }
                
                // Check if parser loaded successfully
                if (typeof self.parseMarkdown !== 'function') {
                    self.postMessage({
                        error: 'Parser not available after import',
                        taskId,
                        success: false
                    });
                    return;
                }
                
                // Parse with timeout protection
                const parseStart = Date.now();
                const html = self.parseMarkdown(text);
                const parseTime = Date.now() - parseStart;
                
                self.postMessage({
                    html,
                    taskId,
                    parseTime,
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

    function createWorker() {
        try {
            const blob = new Blob([WORKER_CODE], { type: 'application/javascript' });
            const newWorker = new Worker(URL.createObjectURL(blob));
            
            // Set up health check
            let ready = false;
            const readyTimeout = setTimeout(() => {
                if (!ready) {
                    console.warn('🔴 Worker ready timeout');
                    newWorker.terminate();
                }
            }, 5000);
            
            newWorker.addEventListener('message', function onReady(e) {
                if (e.data.type === 'ready') {
                    ready = true;
                    clearTimeout(readyTimeout);
                    newWorker.removeEventListener('message', onReady);
                }
            });
            
            newWorker.onerror = (error) => {
                console.error('🔴 Worker error:', error);
                workerErrorCount++;
            };
            
            return newWorker;
        } catch (e) {
            console.error('🔴 Failed to create worker:', e);
            return null;
        }
    }

    function getWorker() {
        if (!window.Worker) return null;
        
        // Reset worker if too many errors
        if (workerErrorCount > 5) {
            if (worker) {
                try { worker.terminate(); } catch (e) {}
                worker = null;
            }
            workerErrorCount = 0;
            console.warn('🔴 Worker reset due to error threshold');
        }
        
        // Recreate worker if it's more than 2 minutes old or unhealthy
        if (Date.now() - workerBirthTime > 120000) {
            if (worker) {
                try { worker.terminate(); } catch (e) {}
                worker = null;
            }
            workerBirthTime = Date.now();
        }
        
        if (!worker) {
            worker = createWorker();
            workerBirthTime = Date.now();
        }
        
        return worker;
    }

    // ==================================================================
    // PARSING FUNCTIONS with Retry Logic
    // ==================================================================
    
    async function parseWithWorker(text, retryCount = 0) {
        return new Promise((resolve, reject) => {
            const worker = getWorker();
            
            if (!worker) {
                // Fallback to sync
                try {
                    const startTime = performance.now();
                    const html = window.parseMarkdown(text);
                    const parseTime = performance.now() - startTime;
                    perfMetrics.parseTimes.push(parseTime);
                    if (perfMetrics.parseTimes.length > 100) perfMetrics.parseTimes.shift();
                    resolve({ html, parseTime, usedWorker: false });
                } catch (e) {
                    reject(e);
                }
                return;
            }
            
            const taskId = Date.now() + Math.random() + retryCount;
            const startTime = performance.now();
            
            // Set up timeout
            const timeout = setTimeout(() => {
                if (retryCount < CONFIG.WORKER_RETRY_COUNT) {
                    // Retry
                    console.warn(`🔴 Worker timeout, retrying (${retryCount + 1}/${CONFIG.WORKER_RETRY_COUNT})...`);
                    worker.removeEventListener('message', messageHandler);
                    setTimeout(() => {
                        parseWithWorker(text, retryCount + 1)
                            .then(resolve)
                            .catch(reject);
                    }, CONFIG.WORKER_RETRY_DELAY);
                } else if (CONFIG.FALLBACK_TO_SYNC) {
                    // Fallback to sync
                    try {
                        const html = window.parseMarkdown(text);
                        const parseTime = performance.now() - startTime;
                        resolve({ html, parseTime, usedWorker: false, fallback: true });
                    } catch (e) {
                        reject(e);
                    }
                } else {
                    reject(new Error('Worker timeout after retries'));
                }
            }, CONFIG.WORKER_TIMEOUT);
            
            const messageHandler = (e) => {
                if (e.data.type === 'ready') return;
                
                if (e.data.taskId === taskId) {
                    clearTimeout(timeout);
                    worker.removeEventListener('message', messageHandler);
                    
                    const parseTime = performance.now() - startTime;
                    
                    if (e.data.error) {
                        if (retryCount < CONFIG.WORKER_RETRY_COUNT) {
                            // Retry on error
                            console.warn(`🔴 Worker error, retrying (${retryCount + 1}/${CONFIG.WORKER_RETRY_COUNT}):`, e.data.error);
                            setTimeout(() => {
                                parseWithWorker(text, retryCount + 1)
                                    .then(resolve)
                                    .catch(reject);
                            }, CONFIG.WORKER_RETRY_DELAY);
                        } else {
                            reject(new Error(e.data.error));
                        }
                    } else {
                        // Track performance
                        perfMetrics.workerTimes.push(parseTime);
                        if (perfMetrics.workerTimes.length > 100) perfMetrics.workerTimes.shift();
                        
                        resolve({ 
                            html: e.data.html, 
                            parseTime, 
                            usedWorker: true,
                            workerParseTime: e.data.parseTime
                        });
                    }
                }
            };
            
            worker.addEventListener('message', messageHandler);
            
            try {
                worker.postMessage({ text, taskId });
            } catch (postError) {
                clearTimeout(timeout);
                worker.removeEventListener('message', messageHandler);
                
                if (retryCount < CONFIG.WORKER_RETRY_COUNT) {
                    // Retry on post error
                    setTimeout(() => {
                        parseWithWorker(text, retryCount + 1)
                            .then(resolve)
                            .catch(reject);
                    }, CONFIG.WORKER_RETRY_DELAY);
                } else {
                    reject(postError);
                }
            }
        });
    }

    // ==================================================================
    // PERFORMANCE MONITORING
    // ==================================================================
    
    window.getPerfMetrics = function() {
        const avg = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
        
        return {
            cache: {
                hitRate: stats.total.hits + stats.total.misses > 0 
                    ? (stats.total.hits / (stats.total.hits + stats.total.misses) * 100).toFixed(1) + '%'
                    : '0%',
                memoryUsage: (stats.total.bytes / 1024 / 1024).toFixed(2) + 'MB',
                entries: stats.total.entries || 0
            },
            performance: {
                avgParseTime: avg(perfMetrics.parseTimes).toFixed(2) + 'ms',
                avgCacheHitTime: avg(perfMetrics.cacheHitTimes.map(() => 0)).toFixed(2) + 'ms',
                avgWorkerTime: avg(perfMetrics.workerTimes).toFixed(2) + 'ms'
            },
            errors: perfMetrics.errors.length
        };
    };

    // ==================================================================
    // MAIN API
    // ==================================================================
    
    window.parseMarkdownSmart = async function(text, options = {}) {
        const startTime = performance.now();
        const stats = {
            size: text.length,
            usedCache: false,
            usedWorker: false,
            parseTime: 0,
            cacheLevel: null,
            fallback: false,
            retries: 0
        };
        
        try {
            // Validate input
            if (!text || typeof text !== 'string') {
                throw new Error('Invalid input: text must be a non-empty string');
            }
            
            // Check cache first
            const cached = getFromCache(text);
            if (cached) {
                stats.usedCache = true;
                stats.cacheLevel = getCacheLevel(text.length);
                stats.parseTime = 0;
                
                return { html: cached, stats };
            }
            
            // Choose parsing method
            const useWorker = (text.length > CONFIG.WORKER_THRESHOLD || options.forceWorker) && 
                             window.Worker !== undefined &&
                             window.parseMarkdown !== undefined;
            
            let html;
            let parseTime;
            
            if (useWorker) {
                stats.usedWorker = true;
                try {
                    const result = await parseWithWorker(text);
                    html = result.html;
                    parseTime = result.parseTime;
                    stats.fallback = result.fallback || false;
                } catch (workerError) {
                    perfMetrics.errors.push(workerError.message);
                    if (perfMetrics.errors.length > 100) perfMetrics.errors.shift();
                    
                    // Fallback to sync on worker error
                    console.warn('🔴 Worker failed, falling back to sync:', workerError.message);
                    const syncStart = performance.now();
                    html = window.parseMarkdown(text);
                    parseTime = performance.now() - syncStart;
                    stats.fallback = true;
                }
            } else {
                const syncStart = performance.now();
                html = window.parseMarkdown(text);
                parseTime = performance.now() - syncStart;
            }
            
            // Track parse time
            perfMetrics.parseTimes.push(parseTime);
            if (perfMetrics.parseTimes.length > 100) perfMetrics.parseTimes.shift();
            
            // Cache result (if not too large)
            if (text.length < 1024 * 1024) { // Don't cache files > 1MB
                saveToCache(text, html);
            }
            
            stats.parseTime = parseTime;
            stats.totalTime = performance.now() - startTime;
            
            return { html, stats };
            
        } catch (error) {
            console.error('🔴 Parse error:', error);
            perfMetrics.errors.push(error.message);
            if (perfMetrics.errors.length > 100) perfMetrics.errors.shift();
            
            // Last resort fallback
            if (CONFIG.FALLBACK_TO_SYNC && window.parseMarkdown) {
                console.warn('🔴 Falling back to sync after error');
                const syncStart = performance.now();
                const html = window.parseMarkdown(text);
                const parseTime = performance.now() - syncStart;
                
                return { 
                    html, 
                    stats: { 
                        ...stats, 
                        parseTime,
                        fallback: true,
                        error: error.message
                    } 
                };
            }
            
            throw error;
        }
    };

    // ==================================================================
    // EXPORTED UTILITIES
    // ==================================================================
    
    // Feature detection
    window.supportsWorkers = !!window.Worker;
    
    // Clear cache
    window.clearMarkdownCache = function(level) {
        if (level && CACHE[level]) {
            // Clear specific level
            CACHE[level].clear();
            keyQueue[level] = [];
            stats[level] = { hits: 0, misses: 0, entries: 0, bytes: 0 };
            console.log(`🔷 Cache cleared: ${level}`);
        } else {
            // Clear all levels
            Object.keys(CACHE).forEach(l => {
                CACHE[l].clear();
                keyQueue[l] = [];
                stats[l] = { hits: 0, misses: 0, entries: 0, bytes: 0 };
            });
            metadata.clear();
            stats.total = { hits: 0, misses: 0, bytes: 0 };
            console.log('🔷 All cache levels cleared');
        }
        
        // Recalculate total bytes
        stats.total.bytes = Object.values(CACHE).reduce((sum, cache) => {
            return sum + Array.from(cache.values()).reduce((s, v) => s + (v?.length || 0), 0);
        }, 0);
    };

    // Get cache stats
    window.getCacheStats = function() {
        const total = stats.total.hits + stats.total.misses;
        return {
            levels: Object.fromEntries(
                Object.keys(CACHE).map(level => [
                    level,
                    {
                        ...stats[level],
                        size: CACHE[level].size,
                        maxSize: MAX_SIZE[level],
                        ttl: TTL[level] / 1000 + 's',
                        memoryMB: (stats[level].bytes / 1024 / 1024).toFixed(2),
                        hitRate: stats[level].hits + stats[level].misses > 0 
                            ? (stats[level].hits / (stats[level].hits + stats[level].misses) * 100).toFixed(1) + '%'
                            : '0%'
                    }
                ])
            ),
            total: {
                hits: stats.total.hits,
                misses: stats.total.misses,
                hitRate: total > 0 ? (stats.total.hits / total * 100).toFixed(1) + '%' : '0%',
                memoryMB: (stats.total.bytes / 1024 / 1024).toFixed(2),
                maxMemoryMB: CONFIG.MAX_MEMORY_USAGE / 1024 / 1024
            },
            performance: window.getPerfMetrics().performance
        };
    };

    // Inspect cache key
    window.inspectCacheKey = function(text) {
        const size = text.length;
        const level = getCacheLevel(size);
        const key = generateCacheKey(text);
        const meta = metadata.get(key);
        
        console.log('Cache inspection:', {
            size: (size/1024).toFixed(1) + 'KB',
            level,
            key,
            exists: CACHE[level].has(key),
            metadata: meta ? {
                age: ((Date.now() - meta.timestamp) / 1000).toFixed(1) + 's',
                ttl: TTL[level] / 1000 + 's',
                accessCount: meta.accessCount
            } : null,
            memoryUsage: (stats.total.bytes / 1024 / 1024).toFixed(2) + 'MB'
        });
        
        return { level, key, exists: CACHE[level].has(key) };
    };

    // Warm up cache with frequently accessed content
    window.warmupCache = async function(urls) {
        if (!Array.isArray(urls)) return;
        
        console.log(`🔷 Warming cache with ${urls.length} URLs...`);
        
        for (const url of urls) {
            try {
                const response = await fetch(url);
                const text = await response.text();
                await window.parseMarkdownSmart(text);
                console.log(`🔷 Warmed: ${url}`);
            } catch (e) {
                console.warn(`🔷 Failed to warm ${url}:`, e.message);
            }
        }
    };

    // ==================================================================
    // AUTO-CLEANUP
    // ==================================================================
    
    // Auto-cleanup expired entries periodically
    setInterval(() => {
        const now = Date.now();
        let removedCount = 0;
        
        Object.keys(CACHE).forEach(level => {
            const cache = CACHE[level];
            const queue = keyQueue[level];
            
            // Check each entry for expiration
            for (let i = queue.length - 1; i >= 0; i--) {
                const key = queue[i];
                const meta = metadata.get(key);
                
                if (meta && now - meta.timestamp > TTL[level]) {
                    // Expired - remove it
                    stats[level].bytes -= meta.size;
                    stats.total.bytes -= meta.size;
                    cache.delete(key);
                    metadata.delete(key);
                    queue.splice(i, 1);
                    removedCount++;
                }
            }
            
            stats[level].entries = cache.size;
        });
        
        if (CONFIG.DEBUG_CACHE && removedCount > 0) {
            console.log(`🔷 Auto-cleanup removed ${removedCount} expired entries, memory: ${(stats.total.bytes/1024/1024).toFixed(2)}MB`);
        }
    }, 60000); // Run every minute
    
    // Emergency memory cleanup if we exceed limits
    setInterval(() => {
        if (stats.total.bytes > CONFIG.MAX_MEMORY_USAGE * 1.1) { // 10% over limit
            console.warn(`🔷 Emergency cache cleanup - memory exceeded: ${(stats.total.bytes/1024/1024).toFixed(2)}MB / ${(CONFIG.MAX_MEMORY_USAGE/1024/1024).toFixed(2)}MB`);
            
            // Clear least valuable entries (oldest, least accessed)
            Object.keys(CACHE).forEach(level => {
                const cache = CACHE[level];
                const queue = keyQueue[level];
                const targetSize = Math.floor(MAX_SIZE[level] * 0.7); // Reduce to 70%
                
                while (cache.size > targetSize) {
                    const oldestKey = queue.shift();
                    if (!oldestKey) break;
                    
                    const meta = metadata.get(oldestKey);
                    if (meta) {
                        stats[level].bytes -= meta.size;
                        stats.total.bytes -= meta.size;
                    }
                    
                    cache.delete(oldestKey);
                    metadata.delete(oldestKey);
                }
            });
            
            console.log(`🔷 Emergency cleanup complete - memory: ${(stats.total.bytes/1024/1024).toFixed(2)}MB`);
        }
    }, 30000); // Check every 30 seconds

    // Log initialization
    console.log('🔷 Advanced cache initialized:', {
        levels: Object.fromEntries(
            Object.keys(MAX_SIZE).map(level => [
                level,
                { maxSize: MAX_SIZE[level], ttl: TTL[level]/1000 + 's' }
            ])
        ),
        maxMemoryMB: CONFIG.MAX_MEMORY_USAGE / 1024 / 1024,
        workers: window.supportsWorkers ? 'supported' : 'not supported',
        threshold: CONFIG.WORKER_THRESHOLD
    });
})();