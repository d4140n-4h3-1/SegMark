// markdown_reader/uploader/agnostic_folder_uploader.js
// Truly agnostic folder uploader - doesn't care about folder names or structure
// Just detects folders and passes them through

(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.AgnosticUploader = factory();
    }
}(typeof self !== 'undefined' ? self : this, function() {
    'use strict';

    // ===== SUPPORT DETECTION =====
    const supportsFileSystemAccess = 'getAsFileSystemHandle' in DataTransferItem.prototype;
    const supportsWebkitGetAsEntry = 'webkitGetAsEntry' in DataTransferItem.prototype;
    const supportsDirectory = 'webkitdirectory' in document.createElement('input');

    // ===== STATE =====
    let uploadCallbacks = new Map();

    // ===== EVENT SYSTEM =====
    function on(event, callback) {
        if (!uploadCallbacks.has(event)) {
            uploadCallbacks.set(event, []);
        }
        uploadCallbacks.get(event).push(callback);
    }

    function off(event, callback) {
        if (!uploadCallbacks.has(event)) return;
        const callbacks = uploadCallbacks.get(event);
        const index = callbacks.indexOf(callback);
        if (index > -1) callbacks.splice(index, 1);
    }

    function emit(event, data) {
        if (!uploadCallbacks.has(event)) return;
        uploadCallbacks.get(event).forEach(callback => {
            try {
                callback(data);
            } catch (e) {
                console.error(`Error in ${event} handler:`, e);
            }
        });
    }

    // ===== MODERN API =====
    async function processModernHandle(handle) {
        const files = [];
        
        async function traverse(currentHandle, path = '') {
            if (currentHandle.kind === 'file') {
                const file = await currentHandle.getFile();
                files.push({
                    file,
                    path: path + file.name,
                    handle: currentHandle,
                    isFile: true,
                    isFolder: false
                });
            } else if (currentHandle.kind === 'directory') {
                const folderPath = path + currentHandle.name + '/';
                files.push({
                    name: currentHandle.name,
                    path: folderPath,
                    handle: currentHandle,
                    isFile: false,
                    isFolder: true
                });
                
                for await (const entry of currentHandle.values()) {
                    await traverse(entry, folderPath);
                }
            }
        }
        
        await traverse(handle);
        return files;
    }

    async function handleDropModern(e) {
        e.preventDefault();
        
        const items = Array.from(e.dataTransfer.items);
        const results = [];
        
        emit('start', { method: 'modern', count: items.length });
        
        for (const item of items) {
            if (item.kind === 'file') {
                try {
                    const handle = await item.getAsFileSystemHandle();
                    const files = await processModernHandle(handle);
                    results.push(...files);
                } catch (err) {
                    emit('error', { error: err, item });
                }
            }
        }
        
        emit('complete', { 
            method: 'modern', 
            files: results,
            folders: results.filter(f => f.isFolder),
            totalFiles: results.filter(f => f.isFile).length
        });
        
        return results;
    }

    // ===== LEGACY API =====
    function processLegacyEntry(entry, path = '') {
        return new Promise((resolve) => {
            const results = [];
            
            if (entry.isFile) {
                entry.file(file => {
                    results.push({
                        file,
                        path: path + file.name,
                        entry,
                        isFile: true,
                        isFolder: false
                    });
                    resolve(results);
                }, error => {
                    emit('error', { error, entry });
                    resolve([]);
                });
                
            } else if (entry.isDirectory) {
                const folderPath = path + entry.name + '/';
                results.push({
                    name: entry.name,
                    path: folderPath,
                    entry,
                    isFile: false,
                    isFolder: true
                });
                
                const reader = entry.createReader();
                const readAll = () => {
                    reader.readEntries(async entries => {
                        if (entries.length === 0) {
                            resolve(results);
                            return;
                        }
                        
                        const promises = entries.map(subEntry => 
                            processLegacyEntry(subEntry, folderPath)
                        );
                        
                        const subResults = await Promise.all(promises);
                        subResults.flat().forEach(item => results.push(item));
                        
                        // Keep reading until no more entries
                        readAll();
                    });
                };
                
                readAll();
            } else {
                resolve([]);
            }
        });
    }

    async function handleDropLegacy(e) {
        e.preventDefault();
        
        const items = Array.from(e.dataTransfer.items);
        const results = [];
        
        emit('start', { method: 'legacy', count: items.length });
        
        for (const item of items) {
            if (item.kind === 'file') {
                const entry = item.webkitGetAsEntry();
                if (entry) {
                    const files = await processLegacyEntry(entry);
                    results.push(...files);
                }
            }
        }
        
        emit('complete', { 
            method: 'legacy', 
            files: results,
            folders: results.filter(f => f.isFolder),
            totalFiles: results.filter(f => f.isFile).length
        });
        
        return results;
    }

    // ===== FOLDER PICKER =====
    function setupFolderPicker(inputElement) {
        if (!inputElement) return;
        
        inputElement.setAttribute('webkitdirectory', '');
        inputElement.setAttribute('directory', '');
        
        inputElement.addEventListener('change', async (e) => {
            const files = Array.from(e.target.files);
            if (files.length === 0) return;
            
            emit('start', { method: 'picker', count: files.length });
            
            // Get the root folder name from the first file's path
            const firstFile = files[0];
            const pathParts = (firstFile.webkitRelativePath || firstFile.name).split('/');
            const rootFolder = pathParts[0];
            
            const results = [];
            
            // Add folder entry
            results.push({
                name: rootFolder,
                path: rootFolder + '/',
                isFile: false,
                isFolder: true,
                files: files.map(f => ({
                    file: f,
                    path: f.webkitRelativePath || f.name,
                    isFile: true,
                    isFolder: false
                }))
            });
            
            // Add all files
            files.forEach(file => {
                results.push({
                    file,
                    path: file.webkitRelativePath || file.name,
                    isFile: true,
                    isFolder: false
                });
            });
            
            emit('complete', {
                method: 'picker',
                files: results,
                folders: results.filter(f => f.isFolder),
                totalFiles: files.length
            });
            
            e.target.value = ''; // Reset
        });
    }

    // ===== MAIN DROP HANDLER =====
    async function handleDrop(e) {
        e.preventDefault();
        
        if (supportsFileSystemAccess) {
            return handleDropModern(e);
        } else if (supportsWebkitGetAsEntry) {
            return handleDropLegacy(e);
        } else {
            // Fallback to files only
            const files = Array.from(e.dataTransfer.files);
            emit('start', { method: 'fallback', count: files.length });
            
            const results = files.map(file => ({
                file,
                path: file.name,
                isFile: true,
                isFolder: false
            }));
            
            emit('complete', {
                method: 'fallback',
                files: results,
                folders: [],
                totalFiles: files.length
            });
            
            return results;
        }
    }

    // ===== DRAG AND DROP SETUP =====
    function setupDropZone(element) {
        if (!element) return;
        
        element.addEventListener('dragover', (e) => {
            e.preventDefault();
            element.classList.add('drag-over');
        });
        
        element.addEventListener('dragleave', (e) => {
            e.preventDefault();
            element.classList.remove('drag-over');
        });
        
        element.addEventListener('drop', async (e) => {
            element.classList.remove('drag-over');
            await handleDrop(e);
        });
    }

    // ===== PUBLIC API =====
    return {
        // Event system
        on,
        off,
        
        // Setup functions
        setupDropZone,
        setupFolderPicker,
        
        // Manual processing
        processDrop: handleDrop,
        
        // Feature detection
        supports: {
            fileSystemAccess: supportsFileSystemAccess,
            webkitGetAsEntry: supportsWebkitGetAsEntry,
            directoryPicker: supportsDirectory
        },
        
        // Version
        VERSION: '1.0.0'
    };
}));