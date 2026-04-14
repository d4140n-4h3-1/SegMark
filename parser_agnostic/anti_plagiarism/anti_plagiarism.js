/**
 * ============================================
 * ANTI-PLAGIARISM SYSTEM - JAVASCRIPT COMPONENT
 * Behavioral Protection & Event Handling
 * Version: 2.0
 * ============================================
 */

class AntiPlagiarismSystem {
    constructor(config = {}) {
        this.config = {
            protectedSelector: '.protected-content',
            enableClipboardProtection: true,
            enableContextMenu: true,
            enableKeyboardProtection: true,
            enableDevToolsDetection: true,
            enableScreenshotWarning: true,
            enableDynamicWatermark: true,
            maxCopyAttempts: 3,
            warningMessage: '⚠️ Copying is disabled on this content.',
            ...config
        };
        
        this.copyAttempts = 0;
        this.sessionId = this.generateSessionId();
        this.userId = this.getUserId();
        this.init();
    }
    
    init() {
        this.protectClipboard();
        this.protectKeyboard();
        this.protectContextMenu();
        this.detectDevTools();
        this.addDynamicWatermark();
        this.protectScreenshots();
        this.addFingerprinting();
        this.protectPrinting();
        this.protectMobileGestures();
        
        console.log('🔒 Anti-plagiarism system activated');
    }
    
    /**
     * Clipboard Protection
     */
    protectClipboard() {
        if (!this.config.enableClipboardProtection) return;
        
        // Prevent copy/cut events
        document.addEventListener('copy', (e) => this.handleCopy(e));
        document.addEventListener('cut', (e) => this.handleCut(e));
        document.addEventListener('paste', (e) => this.handlePaste(e));
        
        // Override clipboard API
        this.overrideClipboardAPI();
        
        // Monitor for copy attempts
        document.addEventListener('selectionchange', () => {
            const selection = window.getSelection().toString();
            if (selection.length > 20) {
                this.logAttempt('selection', selection.length);
            }
        });
    }
    
    handleCopy(e) {
        const target = e.target.closest(this.config.protectedSelector);
        if (target) {
            e.preventDefault();
            this.copyAttempts++;
            
            // Add visual feedback
            target.classList.add('copy-attempt');
            setTimeout(() => target.classList.remove('copy-attempt'), 300);
            
            // Show warning
            this.showWarning(this.config.warningMessage);
            
            // Log attempt
            this.logAttempt('copy', {
                target: target.tagName,
                path: this.getDomPath(target)
            });
            
            // Take action after max attempts
            if (this.copyAttempts >= this.config.maxCopyAttempts) {
                this.escalateProtection();
            }
            
            return false;
        }
    }
    
    handleCut(e) {
        const target = e.target.closest(this.config.protectedSelector);
        if (target) {
            e.preventDefault();
            this.showWarning('Cutting is disabled');
            return false;
        }
    }
    
    handlePaste(e) {
        const target = e.target.closest(this.config.protectedSelector);
        if (target && !target.classList.contains('allow-paste')) {
            e.preventDefault();
            this.showWarning('Pasting is disabled in protected areas');
            return false;
        }
    }
    
    overrideClipboardAPI() {
        // Override navigator.clipboard
        if (navigator.clipboard && navigator.clipboard.write) {
            const originalWrite = navigator.clipboard.write;
            navigator.clipboard.write = (data) => {
                this.logAttempt('clipboard-api', { type: 'write' });
                return Promise.reject(new Error('Clipboard access denied'));
            };
        }
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
            const originalWriteText = navigator.clipboard.writeText;
            navigator.clipboard.writeText = (text) => {
                this.logAttempt('clipboard-api', { type: 'writeText' });
                return Promise.reject(new Error('Clipboard access denied'));
            };
        }
    }
    
    /**
     * Keyboard Protection
     */
    protectKeyboard() {
        if (!this.config.enableKeyboardProtection) return;
        
        document.addEventListener('keydown', (e) => {
            const target = e.target.closest(this.config.protectedSelector);
            if (!target) return;
            
            // Block Ctrl+C, Ctrl+X, Ctrl+V, Ctrl+P, Ctrl+S, Ctrl+A
            if (e.ctrlKey || e.metaKey) {
                switch(e.key.toLowerCase()) {
                    case 'c':
                    case 'x':
                    case 'v':
                    case 'p':
                    case 's':
                    case 'a':
                        e.preventDefault();
                        this.showWarning(`Ctrl+${e.key.toUpperCase()} is disabled`);
                        this.logAttempt('keyboard-shortcut', { key: e.key });
                        break;
                        
                    case 'u': // View source
                    case 'shift': // For Ctrl+Shift+ shortcuts
                        if (e.shiftKey) {
                            e.preventDefault();
                            this.logAttempt('dev-shortcut', { key: e.key });
                        }
                        break;
                }
            }
            
            // Block F12, PrintScreen, F5
            if ([112, 113, 114, 115, 116, 123, 44].includes(e.keyCode)) {
                e.preventDefault();
                this.logAttempt('function-key', { keyCode: e.keyCode });
                
                if (e.keyCode === 44) { // PrintScreen
                    this.handlePrintScreen();
                }
            }
        });
    }
    
    /**
     * Context Menu Protection
     */
    protectContextMenu() {
        if (!this.config.enableContextMenu) return;
        
        document.addEventListener('contextmenu', (e) => {
            const target = e.target.closest(this.config.protectedSelector);
            if (target) {
                e.preventDefault();
                this.showCustomContextMenu(e);
                this.logAttempt('context-menu', {
                    x: e.clientX,
                    y: e.clientY
                });
                return false;
            }
        });
    }
    
    showCustomContextMenu(e) {
        // Create custom menu (optional)
        const menu = document.createElement('div');
        menu.className = 'custom-context-menu';
        menu.innerHTML = `
            <div class="menu-header">⚠️ Actions Disabled</div>
            <div class="menu-item">📋 Copy: Not allowed</div>
            <div class="menu-item">📎 Paste: Not allowed</div>
            <div class="menu-item">🖨️ Print: Restricted</div>
            <div class="menu-footer">Protected Content</div>
        `;
        
        menu.style.cssText = `
            position: fixed;
            left: ${e.clientX}px;
            top: ${e.clientY}px;
            background: white;
            border: 1px solid #ccc;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            padding: 8px;
            z-index: 10000;
            font-family: Arial, sans-serif;
            font-size: 12px;
            border-radius: 4px;
        `;
        
        document.body.appendChild(menu);
        setTimeout(() => menu.remove(), 2000);
    }
    
    /**
     * DevTools Detection
     */
    detectDevTools() {
        if (!this.config.enableDevToolsDetection) return;
        
        // Detect DevTools via console
        let devToolsOpen = false;
        const element = new Image();
        
        Object.defineProperty(element, 'id', {
            get: () => {
                devToolsOpen = true;
                this.handleDevToolsOpen();
                return '';
            }
        });
        
        setInterval(() => {
            console.log(element);
            console.clear();
            
            if (devToolsOpen) {
                this.handleDevToolsOpen();
            }
        }, 1000);
        
        // Detect window size changes (DevTools docked)
        window.addEventListener('resize', () => {
            if (window.outerWidth - window.innerWidth > 100) {
                this.handleDevToolsOpen();
            }
        });
        
        // Detect debugger statements
        setInterval(() => {
            const start = performance.now();
            debugger;
            const end = performance.now();
            
            if (end - start > 100) {
                this.handleDevToolsOpen();
            }
        }, 1000);
    }
    
    handleDevToolsOpen() {
        if (this.devToolsWarningShown) return;
        
        this.devToolsWarningShown = true;
        this.showWarning('⚠️ Developer tools detected. Access is logged.', 5000);
        this.logAttempt('devtools-opened');
        
        // Optional: Redirect or clear content
        // window.location.href = 'about:blank';
    }
    
    /**
     * Screenshot Protection
     */
    protectScreenshots() {
        if (!this.config.enableScreenshotWarning) return;
        
        // Detect PrintScreen
        document.addEventListener('keyup', (e) => {
            if (e.keyCode === 44) {
                this.handlePrintScreen();
            }
        });
        
        // Detect visibility change (possible screenshot apps)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.logAttempt('visibility-change', { hidden: true });
            }
        });
        
        // Add dynamic overlay that changes frequently
        setInterval(() => {
            const watermark = document.querySelector('.dynamic-watermark');
            if (watermark) {
                watermark.style.opacity = 0.02 + Math.random() * 0.03;
            }
        }, 5000);
    }
    
    handlePrintScreen() {
        this.showWarning('📸 Screenshot detected. This action has been logged.', 3000);
        this.logAttempt('printscreen');
        
        // Add temporary overlay to obscure content
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255,255,255,0.9);
            z-index: 99999;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            color: red;
            pointer-events: none;
        `;
        overlay.innerHTML = '⚠️ SCREENSHOT DETECTED';
        document.body.appendChild(overlay);
        setTimeout(() => overlay.remove(), 500);
    }
    
    /**
     * Dynamic Watermarking
     */
    addDynamicWatermark() {
        if (!this.config.enableDynamicWatermark) return;
        
        const watermark = document.createElement('div');
        watermark.className = 'dynamic-watermark';
        watermark.style.cssText = `
            position: fixed;
            bottom: 5px;
            right: 5px;
            font-size: 10px;
            color: rgba(0,0,0,0.1);
            z-index: 9999;
            pointer-events: none;
            font-family: monospace;
            white-space: pre;
        `;
        
        this.updateWatermark(watermark);
        document.body.appendChild(watermark);
        
        // Update watermark periodically
        setInterval(() => this.updateWatermark(watermark), 60000);
    }
    
    updateWatermark(element) {
        const date = new Date();
        element.textContent = [
            `ID: ${this.sessionId.substring(0, 8)}`,
            `User: ${this.userId}`,
            `Time: ${date.toLocaleTimeString()}`,
            `IP: ${this.getClientIp() || 'unknown'}`,
            `Agent: ${navigator.userAgent.substring(0, 30)}`
        ].join(' | ');
    }
    
    /**
     * Fingerprinting
     */
    addFingerprinting() {
        // Add invisible tracking pixels
        const pixel = document.createElement('img');
        pixel.style.cssText = 'position: absolute; width: 1px; height: 1px; opacity: 0;';
        pixel.src = `https://tracking.example.com/pixel.gif?session=${this.sessionId}&time=${Date.now()}`;
        document.body.appendChild(pixel);
        
        // Add meta tags to prevent caching
        const meta = document.createElement('meta');
        meta.httpEquiv = 'Cache-Control';
        meta.content = 'no-cache, no-store, must-revalidate';
        document.head.appendChild(meta);
    }
    
    /**
     * Print Protection
     */
    protectPrinting() {
        window.addEventListener('beforeprint', () => {
            this.logAttempt('print-attempt');
            
            // Add print-specific data attributes
            document.querySelectorAll(this.config.protectedSelector).forEach(el => {
                el.setAttribute('data-print-date', new Date().toISOString());
                el.setAttribute('data-doc-id', this.sessionId);
            });
        });
        
        window.addEventListener('afterprint', () => {
            this.logAttempt('print-completed');
        });
    }
    
    /**
     * Mobile Gesture Protection
     */
    protectMobileGestures() {
        let touchStartTime = 0;
        let touchStartX = 0;
        let touchStartY = 0;
        
        document.addEventListener('touchstart', (e) => {
            touchStartTime = Date.now();
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchend', (e) => {
            const touchEndTime = Date.now();
            const touchDuration = touchEndTime - touchStartTime;
            
            // Detect long press (potential copy attempt)
            if (touchDuration > 800) {
                const target = e.target.closest(this.config.protectedSelector);
                if (target) {
                    e.preventDefault();
                    this.showWarning('Long press disabled');
                    this.logAttempt('mobile-long-press');
                }
            }
        });
        
        // Detect 3D touch (iPhone)
        document.addEventListener('touchforcechange', (e) => {
            if (e.touches[0].force > 0.5) {
                e.preventDefault();
                this.logAttempt('3d-touch');
            }
        });
    }
    
    /**
     * Utility Functions
     */
    showWarning(message, duration = 2000) {
        const warning = document.createElement('div');
        warning.className = 'anti-plagiarism-warning';
        warning.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff4444;
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            z-index: 999999;
            font-family: Arial, sans-serif;
            font-size: 14px;
            animation: slideIn 0.3s ease;
        `;
        warning.textContent = message;
        
        document.body.appendChild(warning);
        
        setTimeout(() => {
            warning.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => warning.remove(), 300);
        }, duration);
    }
    
    logAttempt(action, details = {}) {
        const log = {
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId,
            userId: this.userId,
            action: action,
            details: details,
            url: window.location.href,
            userAgent: navigator.userAgent,
            screenSize: `${window.screen.width}x${window.screen.height}`
        };
        
        console.log('📝 Anti-plagiarism log:', log);
        
        // Send to server (optional)
        this.sendToServer('/api/log-plagiarism-attempt', log);
    }
    
    escalateProtection() {
        // Increase protection after multiple attempts
        this.showWarning('⚠️ Multiple copy attempts detected. Content protection increased.');
        
        // Add more aggressive obfuscation
        document.querySelectorAll(this.config.protectedSelector).forEach(el => {
            el.style.filter = 'blur(1px)';
            el.style.opacity = '0.9';
        });
        
        // Disable all interactions temporarily
        document.body.style.pointerEvents = 'none';
        setTimeout(() => {
            document.body.style.pointerEvents = '';
        }, 5000);
    }
    
    generateSessionId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    
    getUserId() {
        // Try to get from localStorage or generate new
        let userId = localStorage.getItem('aps_user_id');
        if (!userId) {
            userId = 'user_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('aps_user_id', userId);
        }
        return userId;
    }
    
    getClientIp() {
        // This would typically come from server
        return null;
    }
    
    getDomPath(el) {
        if (!el) return '';
        let stack = [];
        while (el.parentNode !== null) {
            let sibCount = 0;
            let sibIndex = 0;
            for (let i = 0; i < el.parentNode.childNodes.length; i++) {
                let sib = el.parentNode.childNodes[i];
                if (sib.nodeName === el.nodeName) {
                    if (sib === el) {
                        sibIndex = sibCount;
                    }
                    sibCount++;
                }
            }
            if (el.hasAttribute('id') && el.id !== '') {
                stack.unshift(el.nodeName.toLowerCase() + '#' + el.id);
            } else if (el.hasAttribute('class') && el.className !== '') {
                stack.unshift(el.nodeName.toLowerCase() + '.' + el.className.split(' ').join('.'));
            } else {
                stack.unshift(el.nodeName.toLowerCase() + (sibCount > 1 ? ':eq(' + sibIndex + ')' : ''));
            }
            el = el.parentNode;
        }
        return stack.slice(1).join(' > ');
    }
    
    async sendToServer(url, data) {
        try {
            if (navigator.sendBeacon) {
                navigator.sendBeacon(url, JSON.stringify(data));
            } else {
                await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                    keepalive: true
                });
            }
        } catch (error) {
            // Fail silently
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        .custom-context-menu {
            animation: slideIn 0.2s ease;
        }
    `;
    document.head.appendChild(style);
    
    // Initialize the system
    window.antiPlagiarism = new AntiPlagiarismSystem({
        protectedSelector: '.protected-content',
        enableClipboardProtection: true,
        enableContextMenu: true,
        enableKeyboardProtection: true,
        enableDevToolsDetection: true,
        enableScreenshotWarning: true,
        enableDynamicWatermark: true,
        maxCopyAttempts: 3
    });
});