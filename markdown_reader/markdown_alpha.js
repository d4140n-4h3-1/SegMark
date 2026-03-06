// Combined Markdown Parser with Image Path Resolution - DEBUG VERSION
(function() {
    // ==================================================================
    // IMAGE PATH RESOLUTION - ADD THIS AT THE TOP
    // ==================================================================
    
    // Store the base path for images
    window.markdownBasePath = '';

    // Simple function to set the base path
    window.setMarkdownBasePath = function(path) {
        window.markdownBasePath = path;
        console.log('%c🔴 IMAGE BASE PATH SET TO:', 'background: #d63031; color: white; padding: 2px 5px;', path);
    };

    // ==================================================================
    // CODEBLOCKS MODULE (unchanged)
    // ==================================================================
    
    // Cache
    const c_c = new Map();  // codeblocks cache
    const CS = 200;
    
    function c_g(h) {
        if (!h) return undefined;
        return c_c.get(h);
    }
    
    function c_s(h, r) {
        if (!h || !r) return;
        if (c_c.size >= CS) {
            const f = c_c.keys().next().value;
            c_c.delete(f);
        }
        c_c.set(h, r);
    }

    function c_h(s) {
        let hash = 0;
        for (let i = 0; i < s.length; i++) {
            hash = ((hash << 5) - hash) + s.charCodeAt(i);
            hash |= 0;
        }
        return hash.toString(36);
    }

    // Regex
    const rF = /(^|\n)(`{3,}|~{3,})([^\n]*)\n([\s\S]*?)\n\2(\n|$)/gm;
    const rI = /`([^`]+)`/g;
    const rFP = /!!CODEBLOCK_(\d+)!!/g;
    const rIP = /!!INLINECODE_(\d+)!!/g;

    // Storage
    const fb = [];
    const ib = [];
    let fc = 0;
    let ic = 0;

    const FP = '!!CODEBLOCK_';
    const IP = '!!INLINECODE_';

    // Extract
    function extractCodeBlocks(t) {
        fb.length = 0;
        ib.length = 0;
        fc = ic = 0;

        const twf = t.replace(rF, (m, s, f, l, c, e) => {
            fb.push({ lang: l.trim(), content: c });
            return s + FP + fc++ + '!!' + e;
        });

        const ft = twf.replace(rI, (m, c) => {
            ib.push({ content: c });
            return IP + ic++ + '!!';
        });

        return {
            text: ft,
            store: {
                fenced: fb.slice(),
                inline: ib.slice()
            }
        };
    }

    // Restore
    function restoreCodeBlocks(t, s, hf) {
        let r = t;
        const uc = !hf;
        let ck = null;
        
        if (uc) {
            ck = c_h(t + (s?.fenced?.length || 0) + (s?.inline?.length || 0));
            const ch = c_g(ck);
            if (ch !== undefined) return ch;
        }

        r = r.replace(rFP, (m, i) => {
            const b = s?.fenced?.[parseInt(i)];
            if (!b) return m;
            let cnt = b.content || '';
            if (hf) cnt = hf(cnt, b.lang || '');
            return '<pre><code>' + cnt + '</code></pre>';
        });

        r = r.replace(rIP, (m, i) => {
            const sp = s?.inline?.[parseInt(i)];
            if (!sp) return m;
            let cnt = sp.content || '';
            if (hf) cnt = hf(cnt, 'inline');
            return '<code>' + cnt + '</code>';
        });

        if (uc && ck) c_s(ck, r);
        return r;
    }

    // ==================================================================
    // MARKDOWN STANDARD MODULE
    // ==================================================================
    
    // Cache
    const c_m = new Map();
    const CS_M = 500;
    const MINL = 5;
    const MAXL = 200;
    
    function g(md) {
        if (!md || md.length < MINL || md.length > MAXL || md.match(/^!!(TABLE|CODE|BR|LINK)_\d+!!$/)) {
            return undefined;
        }
        return c_m.get(md);
    }
    
    function s(md, r) {
        if (!md || !r || md.length < MINL || md.length > MAXL) return;
        if (c_m.size >= CS_M) {
            const f = c_m.keys().next().value;
            c_m.delete(f);
        }
        c_m.set(md, r);
    }

    // Regex
    const rB = /(\*\*|__)(.*?)\1/g;
    const rI_ = /(\*|_)(.*?)\1/g;
    const rC = /(~~|==|~|\^)(.*?)\1/g;
    const rM = /(:)?!\[([^\]]*)\]\(([^)]+)\)(:)?/g;
    const rL = /\[([^\]]+)\]\(([^)\s]+)(?:\s+(["'][^"']*["']|\([^)]*\)))?\)/g;
    const rRL = /(?:\[([^\]]+)\]\[([^\]]*)\]|\[([^\]]+)\]\s*\[\]|\[([^\]]+)\](?!\())/g;
    const rRI = /(?:!\[([^\]]*)\]\[([^\]]*)\]|!\[([^\]]+)\]\s*\[\]|!\[([^\]]+)\](?!\())/g;
    const rH = /^[ ]{0,3}([-*_])([ \t]*\1){2,}[ \t]*$/gm;
    const rA = /^[ ]{0,3}(#{1,6})[ \t]+([^#].*?)(?:[ \t]+#+)?[ \t]*$/gm;
    const rE = /\\([\\`*_{}\[\]()#+\-.!~=^|:;@$%&])/g;
    
    const rRD = /^\s*\[([^\]]+)\]:\s+(\S+)(?:\s+(?:"([^"]*)"|'([^']*)'|\(([^)]*)\)))?\s*$/gm;
    const rF_ = /^\[(\^[^\]]+)\]:\s+(.*)$/;
    const rG = /^\s*:\s*(.*)$/;
    
    const rLB = /(<br\s*\/?>| {2}\n|\\\n)/g;
    const rTP = /!!TABLE_(\d+)!!/g;
    const rBP = /!!BR_(\d+)!!/g;
    const rEP = /!!ESC(\d+)!!/g;
    const rLP = /!!LINK_(\d+)!!/g;

    const rAU = /(?:<([^>\s]+)>|\b(https?:\/\/[^\s<]+|www\.[^\s<]+)\b|\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b)/g;

    const rLI = /^(\s*)([-*+]|\d+\.)\s/;
    const rLIC = /^([-*+]|\d+\.)\s+(.*)$/;
    const rT = /^\s*\[([ x])\]\s+(.*)$/i;
    const rS1 = /^={3,}\s*$/;
    const rS2 = /^-{3,}\s*$/;
    const rHC = /^(-{3,}|\*{3,}|_{3,})$/;
    const rBQ = /^(\s*)(>+)/;

    const rFnRef = /\[\^([^\]]+)\]/g;

    const V = new Set(['.mp4', '.webm', '.ogg', '.mov', '.mkv', '.avi']);
    const A = new Set(['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac']);

    // Character codes
    const P = 124;   // '|'
    const COL = 58;  // ':'
    const SP = 32;   // ' '
    const H = 35;    // '#'
    const D = 45;    // '-'
    const ST = 42;   // '*'
    const U = 95;    // '_'
    const E = 61;    // '='
    const GT = 62;   // '>'

    // Helper functions
    function e(s) {
        if (!s) return '';
        return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function ha(t) {
        let h = t.trim();
        let a = '';
        const f = h.charCodeAt(0);
        const l = h.charCodeAt(h.length - 1);
        
        if (f === COL && l === COL) {
            h = h.slice(1, -1).trim();
            a = ' center';
        } else if (l === COL) {
            h = h.slice(0, -1).trim();
            a = ' right';
        } else if (f === COL) {
            h = h.slice(1).trim();
            a = ' left';
        }
        return { text: h, align: a };
    }

    function pq(l) {
        const r = [];
        const st = [];

        for (let i = 0, len = l.length; i < len; i++) {
            const line = l[i];
            const m = line.match(rBQ);
            if (m) {
                const ls = m[1];
                const lvl = m[2].length;
                let c = line.slice(m[0].length);
                if (c.charCodeAt(0) === SP) c = c.slice(1);
                c = ls + c;
                const t = c.trimStart();
                const f = t.charCodeAt(0);
                if (f === H) {
                    c = c.replace(/^(#{1,6})\s+(.*)$/, (_, hs, tx) => `<h${hs.length}>${tx}</h${hs.length}>`);
                } else if (t.match(rHC)) {
                    c = '<hr>';
                }
                while (st.length > lvl) {
                    const ind = st.pop();
                    r.push(ind + '</blockquote>');
                }
                while (st.length < lvl) {
                    st.push(ls);
                    r.push(ls + '<blockquote>');
                }
                if (c !== '') r.push(c);
            } else {
                while (st.length > 0) {
                    const ind = st.pop();
                    r.push(ind + '</blockquote>');
                }
                r.push(line);
            }
        }
        while (st.length > 0) {
            const ind = st.pop();
            r.push(ind + '</blockquote>');
        }
        return r;
    }

    function ps(l) {
        const r = [];
        for (let i = 0, len = l.length; i < len; i++) {
            const c = l[i];
            const n = l[i + 1] || '';
            const tn = n.replace(/^\s+/, '');
            const l1 = rS1.test(tn);
            const l2 = rS2.test(tn);
            const ct = c.trim();
            const cu = rS1.test(ct) || rS2.test(ct);
            if ((l1 || l2) && ct !== '' && !cu) {
                const lvl = l1 ? 1 : 2;
                const { text: ht, align: a } = ha(ct);
                const aa = a ? ` align="${a.trim()}"` : '';
                r.push(`<h${lvl}${aa}>${ht}</h${lvl}>`);
                i++;
            } else {
                r.push(c);
            }
        }
        return r;
    }

    function pg(l) {
        const r = [];
        
        for (let i = 0, len = l.length; i < len; i++) {
            const cl = l[i];
            const nl = l[i + 1] || '';
            
            const tn = nl.trimStart();
            if (tn.charCodeAt(0) === COL && cl.trim() !== '') {
                r.push('<div class="g">');
                
                const term = cl.trim();
                r.push(`<p class="gt"><strong>${term}</strong></p>`);
                i++;
                
                while (i < len) {
                    const dl = l[i];
                    const td = dl.trimStart();
                    if (td.charCodeAt(0) === COL) {
                        const def = td.substring(1).trim();
                        if (def !== '') {
                            r.push(`<p class="gd">${def}</p>`);
                        }
                        i++;
                    } else {
                        i--;
                        break;
                    }
                }
                
                r.push('</div>');
            } else {
                r.push(cl);
            }
        }
        
        return r;
    }

    function isBL(l) {
        const t = l.trim();
        if (/^<h[1-6]>.*<\/h[1-6]>$/.test(t)) return true;
        if (t === '<hr>') return true;
        if (t === '<blockquote>' || t === '</blockquote>') return true;
        if (/^<(video|audio)/.test(t)) return true;
        return false;
    }

    // Main render function
    function ri(md, rm, fd, fn, fro, frc) {
        if (!md) return '';
        
        const cached = g(md);
        if (cached !== undefined) return cached;
        
        if (md.match(/^!!(TABLE|CODE|BR)_\d+!!$/)) return md;
        let res = md;

        if (window.replaceEmojis) res = window.replaceEmojis(res);

        // Auto-bold footnote references
        res = res.replace(/(\w+)(\[\^[^\]]+\])/g, '<strong>$1</strong>$2');
        res = res.replace(/(\w+)\s+(\[\^[^\]]+\])/g, '<strong>$1</strong> $2');

        // Process footnotes
        res = res.replace(rFnRef, (m, id) => {
            if (fd && fd[id] !== undefined) {
                if (fn && fn[id] === undefined) {
                    fn[id] = ++frc;
                    if (fro) fro.push(id);
                }
                const num = fn ? fn[id] : 0;
                return `<sup id="fnref-${num}"><a href="#fn-${num}">${num}</a></sup>`;
            }
            return m;
        });

        // Process other inline formatting
        res = res.replace(rB, '<strong>$2</strong>');
        res = res.replace(rI_, '<em>$2</em>');
        res = res.replace(rC, (m, d, c) => {
            switch (d) {
                case '~~': return `<del>${c}</del>`;
                case '==': return `<mark>${c}</mark>`;
                case '~':  return `<sub>${c}</sub>`;
                case '^':  return `<sup>${c}</sup>`;
                default: return m;
            }
        });

        const lph = [];
        let lc = 0;
        const pt = res
            .replace(rL, (m) => {
                const pl = `!!LINK_${lc}!!`;
                lph.push(m);
                lc++;
                return pl;
            })
            .replace(rM, (m) => {
                const pl = `!!LINK_${lc}!!`;
                lph.push(m);
                lc++;
                return pl;
            });

        const wa = pt.replace(rAU, (m, au, pu, em) => {
            if (au) {
                if (au.match(/^https?:\/\//i) || au.match(/^www\./i)) {
                    const href = e(au.match(/^www\./i) ? 'http://' + au : au);
                    return `<a href="${href}">${au}</a>`;
                } else if (au.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
                    return `<a href="mailto:${e(au)}">${au}</a>`;
                }
                return m;
            }
            if (pu) {
                let url = pu;
                if (url.startsWith('www.')) url = 'http://' + url;
                return `<a href="${e(url)}">${pu}</a>`;
            }
            if (em) {
                return `<a href="mailto:${e(em)}">${em}</a>`;
            }
            return m;
        });

        res = wa.replace(rLP, (m, i) => lph[parseInt(i)]);

        // ==================================================================
        // MODIFIED: Image handling with base path resolution and DEBUG
        // ==================================================================
        res = res.replace(rM, (m, lc, alt, url, rc) => {
            const su = e(url);
            const sa = e(alt);
            let ac = '';
            
            if (lc && rc) ac = ' c';
            else if (rc) ac = ' r';
            else if (lc) ac = ' l';
            
            // DEBUG: Log the original image reference
            console.log('%c🔍 IMAGE FOUND:', 'background: #d63031; color: white; padding: 2px 5px;', {
                url: url,
                alt: alt,
                basePath: window.markdownBasePath
            });
            
            // Add the base path if it exists and the URL isn't absolute/external
            let finalUrl = su;
            if (window.markdownBasePath && !su.startsWith('http') && !su.startsWith('//') && !su.startsWith('/') && !su.startsWith('data:')) {
                finalUrl = window.markdownBasePath + su;
                console.log('%c✅ BASE PATH APPLIED:', 'background: #28a745; color: white; padding: 2px 5px;', {
                    original: su,
                    basePath: window.markdownBasePath,
                    final: finalUrl
                });
            } else {
                console.log('%c⚠️ NO BASE PATH APPLIED:', 'background: #ffc107; color: black; padding: 2px 5px;', {
                    reason: !window.markdownBasePath ? 'No base path set' : 'URL is absolute/external',
                    url: su
                });
            }
            
            const em = url.match(/\.([^.]+)$/);
            if (em) {
                const ext = '.' + em[1].toLowerCase();
                if (V.has(ext)) {
                    console.log('%c🎥 VIDEO TAG:', 'background: #17a2b8; color: white; padding: 2px 5px;', finalUrl);
                    return `<video src="${finalUrl}" controls preload="metadata" alt="${sa}" class="m${ac}"></video>`;
                }
                if (A.has(ext)) {
                    console.log('%c🎵 AUDIO TAG:', 'background: #17a2b8; color: white; padding: 2px 5px;', finalUrl);
                    return `<audio src="${finalUrl}" controls preload="metadata" alt="${sa}" class="m${ac}"></audio>`;
                }
            }
            console.log('%c🖼️ IMAGE TAG:', 'background: #6f42c1; color: white; padding: 2px 5px;', finalUrl);
            return `<img src="${finalUrl}" alt="${sa}" class="m${ac}">`;
        });

        res = res.replace(rL, (m, t, u, ti) => {
            const su = e(u);
            let ta = '';
            if (ti) {
                const rt = ti.replace(/^["'(]|["')]$/g, '');
                ta = ` title="${e(rt)}"`;
            }
            return `<a href="${su}"${ta}>${t}</a>`;
        });

        res = res.replace(rRL, (m, et, ei, ct, st) => {
            const t = et || ct || st;
            const id = ei || t;
            const rid = id.toLowerCase();
            const def = rm ? rm[rid] : null;
            if (def) {
                const su = e(def.url);
                const ta = def.title ? ` title="${e(def.title)}"` : '';
                return `<a href="${su}"${ta}>${t}</a>`;
            }
            return m;
        });

        // ==================================================================
        // MODIFIED: Reference image handling with base path resolution and DEBUG
        // ==================================================================
        res = res.replace(rRI, (m, ea, ei, ca, sa) => {
            const alt = ea || ca || sa;
            const id = ei || alt;
            const rid = id.toLowerCase();
            const def = rm ? rm[rid] : null;
            if (def) {
                const su = e(def.url);
                // DEBUG: Log the reference image
                console.log('%c🔍 REFERENCE IMAGE FOUND:', 'background: #d63031; color: white; padding: 2px 5px;', {
                    id: id,
                    url: def.url,
                    basePath: window.markdownBasePath
                });
                
                // Add the base path if it exists and the URL isn't absolute/external
                let finalUrl = su;
                if (window.markdownBasePath && !su.startsWith('http') && !su.startsWith('//') && !su.startsWith('/') && !su.startsWith('data:')) {
                    finalUrl = window.markdownBasePath + su;
                    console.log('%c✅ BASE PATH APPLIED:', 'background: #28a745; color: white; padding: 2px 5px;', finalUrl);
                }
                
                const ta = def.title ? ` title="${e(def.title)}"` : '';
                const sa = e(alt);
                return `<img src="${finalUrl}" alt="${sa}"${ta}>`;
            }
            return m;
        });

        s(md, res);
        return res;
    }

    // Main parser function
    function parseMarkdown(text) {
        console.log('%c📄 PARSING MARKDOWN', 'background: #d63031; color: white; padding: 2px 5px;', 'Length: ' + text.length);
        let html = text;

        // Protect escaped characters
        const ec = [];
        html = html.replace(rE, (m, ch) => {
            ec.push(ch);
            return '!!ESC' + (ec.length - 1) + '!!';
        });

        // Split once
        let lines = html.split('\n');

        // Process blockquotes
        lines = pq(lines);
        html = lines.join('\n');
        lines = html.split('\n');

        // Extract code blocks
        const { text: twc, store: cs } = extractCodeBlocks(html);
        html = twc;
        lines = html.split('\n');

        // Extract reference link definitions
        const rm = {};
        
        const lwr = [];
        const rdr = /^\s*\[([^\]]+)\]:\s+(\S+)(?:\s+(?:"([^"]*)"|'([^']*)'|\(([^)]*)\)))?\s*$/;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const m = line.match(rdr);
            
            if (m) {
                const id = m[1].toLowerCase();
                const url = m[2];
                const title = m[3] || m[4] || m[5] || '';
                
                rm[id] = { url, title };
            } else {
                lwr.push(line);
            }
        }

        html = lwr.join('\n');
        lines = html.split('\n');

        // Extract footnotes
        const fd = {};
        const fn = {};
        const fro = [];
        let frc = 0;

        function ef(l) {
            const r = [];
            let i = 0;
            const len = l.length;
            while (i < len) {
                const line = l[i];
                const m = line.match(rF_);
                if (m) {
                    const id = m[1].slice(1);
                    const fl = m[2];
                    const cl = [fl];
                    i++;
                    while (i < len && /^\s/.test(l[i])) {
                        cl.push(l[i]);
                        i++;
                    }
                    fd[id] = cl;
                } else {
                    r.push(line);
                    i++;
                }
            }
            return r;
        }

        const lwf = ef(lines);
        html = lwf.join('\n');
        lines = html.split('\n');

        // Extract tables
        const tbls = [];
        let tc = 0;

        function its(l) {
            const t = l.trim();
            if (t.charCodeAt(0) !== P && !t.includes('|')) return false;
            if (!t.includes('-')) return false;
            const seg = t.split('|').map(s => s.trim()).filter(s => s !== '');
            if (seg.length === 0) return false;
            for (let s of seg) {
                if (!/^[\s\-:]+$/.test(s)) return false;
                if (!s.includes('-')) return false;
            }
            return true;
        }

        function ct(l, si) {
            let i = si;
            const hr = l[i];
            const sr = l[i + 1];
            const dr = [];
            let j = i + 2;
            const len = l.length;
            while (j < len) {
                const line = l[j];
                if (line.trim() === '' || !line.includes('|')) break;
                dr.push(line);
                j++;
            }
            return { header: hr, separator: sr, rows: dr, nextIndex: j };
        }

        const wtp = [];
        let idx = 0;
        const len = lines.length;
        while (idx < len) {
            const line = lines[idx];
            if (line.includes('|') && idx + 1 < len && its(lines[idx + 1])) {
                const td = ct(lines, idx);
                const pl = `!!TABLE_${tc}!!`;
                tbls.push(td);
                tc++;
                wtp.push(pl);
                idx = td.nextIndex;
            } else {
                wtp.push(line);
                idx++;
            }
        }
        html = wtp.join('\n');
        lines = html.split('\n');

        // Process setext headings
        lines = ps(lines);
        html = lines.join('\n');

        // Horizontal rules
        html = html.replace(rH, '<hr>');

        // Process ATX headings
        function pa(s) {
            return s.replace(rA, (m, h, c) => {
                const lvl = h.length;
                const { text: ht, align: a } = ha(c);
                const aa = a ? ` align="${a.trim()}"` : '';
                return `<h${lvl}${aa}>${ht}</h${lvl}>`;
            });
        }
        html = pa(html);
        lines = html.split('\n');

        // Process glossary definitions
        lines = pg(lines);
        html = lines.join('\n');
        lines = html.split('\n');

        // Apply inline rendering to entire document
        html = ri(html, rm, fd, fn, fro, frc);
        lines = html.split('\n');

        // Process lists and paragraphs - WITH FIRST-LINE INDENTATION
        const lr_ = [];
        const lst = [];

        const lii = [];
        for (let i = 0, len = lines.length; i < len; i++) {
            const line = lines[i];
            const lm = line.match(rLI);
            if (lm) {
                const ind = lm[1].length;
                lii.push(ind);
            }
        }

        const ui = [...new Set(lii)].sort((a,b) => a - b);
        const i2l = {};
        for (let idx = 0; idx < ui.length; idx++) {
            i2l[ui[idx]] = idx + 1;
        }

        // Capture original indentation for paragraphs
        const nl = lines.map((line) => {
            if (line.trim() === '') return { text: '', ri: 0, nl: 0, ie: true };
            const im = line.match(/^(\s*)/);
            const ri = im ? im[1].length : 0;
            return {
                text: line.trim(),
                rawIndent: im ? im[1] : '',
                ri: ri,
                nl: i2l[ri] || 0,
                ie: false
            };
        });

        const nlen = nl.length;
        const nne = new Array(nlen);
        let nxt = nlen;
        for (let i = nlen - 1; i >= 0; i--) {
            nne[i] = nxt;
            if (!nl[i].ie) nxt = i;
        }

        // Helper function to create paragraph with indentation
        function createParagraph(text, indent) {
            if (indent && indent.length > 0) {
                let tabCount = 0, spaceCount = 0;
                for (let j = 0; j < indent.length; j++) {
                    if (indent[j] === '\t') tabCount++;
                    else spaceCount++;
                }
                const totalIndent = (tabCount * 2) + (spaceCount * 0.5);
                return `<p style="text-indent: ${totalIndent}em;">${text}</p>`;
            } else {
                return `<p>${text}</p>`;
            }
        }

        for (let i = 0; i < nlen; i++) {
            const it = nl[i];
            if (it.ie) continue;

            const line = it.text;
            const ri = it.ri;
            const rawIndent = it.rawIndent || '';

            const lm = line.match(rLIC);
            if (lm) {
                let c = lm[2];
                const mk = lm[1];
                const ord = mk.match(/^\d/);
                const lt = ord ? 'ol' : 'ul';
                let sn = null;
                if (ord) sn = parseInt(mk, 10);

                let ts = null;
                const tm = c.match(rT);
                if (tm) {
                    ts = tm[1].toLowerCase() === 'x' ? 'checked' : 'unchecked';
                    c = tm[2];
                }

                let lo = '<li';
                if (ts) lo += ' class="t"';
                lo += '>';

                let lic = '';
                if (ts) {
                    const ca = ts === 'checked' ? ' checked' : '';
                    lic += `<input type="checkbox" disabled${ca}> `;
                }
                lic += c;

                while (lst.length > 0 && lst[lst.length - 1].ri > ri) {
                    lr_.push('</li>');
                    const cl = lst.pop();
                    lr_.push('</' + cl.t + '>');
                }

                if (lst.length > 0 && lst[lst.length - 1].ri === ri) {
                    if (lst[lst.length - 1].t === lt) {
                        lr_.push('</li>');
                    } else {
                        lr_.push('</li>');
                        lr_.push('</' + lst.pop().t + '>');
                        const sa = (lt === 'ol' && sn && sn !== 1) ? ` start="${sn}"` : '';
                        lr_.push(lt === 'ol' ? `<ol${sa}>` : '<ul>');
                        lst.push({ t: lt, ri: ri, s: sn });
                    }
                } else if (lst.length === 0 || lst[lst.length - 1].ri < ri) {
                    const sa = (lt === 'ol' && sn && sn !== 1) ? ` start="${sn}"` : '';
                    lr_.push(lt === 'ol' ? `<ol${sa}>` : '<ul>');
                    lst.push({ t: lt, ri: ri, s: sn });
                }

                lr_.push(lo + lic);

                const j = nne[i];
                let nli = false, nd = false, nlc = false;
                if (j < nlen) {
                    const nl_ = nl[j].text;
                    const nlm = nl_.match(/^([-*+]|\d+\.)\s/);
                    if (nlm) {
                        nli = true;
                        const nri = nl[j].ri;
                        if (nri > ri) nd = true;
                    } else {
                        nlc = true;
                    }
                }

                if (!nli && !nlc) {
                    lr_.push('</li>');
                } else if (nli && !nd) {
                    lr_.push('</li>');
                }
                continue;
            }

            if (isBL(line)) {
                if (line.trim() === '<blockquote>') {
                    if (lst.length > 0) {
                        const tri = lst[lst.length - 1].ri;
                        if (it.ri <= tri) {
                            while (lst.length > 0 && lst[lst.length - 1].ri >= it.ri) {
                                const cl = lst.pop();
                                lr_.push('</li>');
                                lr_.push('</' + cl.t + '>');
                            }
                            lr_.push(line);
                            continue;
                        }
                    }
                    lr_.push(line);
                    continue;
                } else if (line.trim() === '</blockquote>') {
                    lr_.push(line);
                    continue;
                }

                while (lst.length > 0) {
                    const cl = lst.pop();
                    lr_.push('</li>');
                    lr_.push('</' + cl.t + '>');
                }
                lr_.push(line);
                continue;
            }

            if (lst.length > 0) {
                const tri = lst[lst.length - 1].ri;
                if (it.ri > tri) {
                    let pl = [line];
                    let firstIndent = rawIndent;
                    let j = i + 1;
                    
                    while (j < nlen) {
                        const nit = nl[j];
                        if (nit.ie) break;
                        const nl_ = nit.text;
                        const np = !nl_.match(/^([-*+]|\d+\.)\s/) && !isBL(nl_);
                        if (!np) break;
                        if (nit.ri <= tri) break;
                        pl.push(nl_);
                        j++;
                    }
                    
                    const pt = pl.join(' ');
                    lr_.push(createParagraph(pt, firstIndent));
                    i = j - 1;
                    continue;
                } else {
                    while (lst.length > 0) {
                        const cl = lst.pop();
                        lr_.push('</li>');
                        lr_.push('</' + cl.t + '>');
                    }
                    lr_.push(createParagraph(line, rawIndent));
                }
            } else {
                let pl = [line];
                let firstIndent = rawIndent;
                let j = i + 1;
                
                while (j < nlen) {
                    const nit = nl[j];
                    if (nit.ie) break;
                    const nl_ = nit.text;
                    if (nl_.match(/^([-*+]|\d+\.)\s/) || isBL(nl_)) break;
                    pl.push(nl_);
                    j++;
                }
                
                const pt = pl.join(' ');
                lr_.push(createParagraph(pt, firstIndent));
                i = j - 1;
            }
        }

        while (lst.length > 0) {
            const cl = lst.pop();
            lr_.push('</li>');
            lr_.push('</' + cl.t + '>');
        }

        html = lr_.join('\n');
        html = html.replace(/<\/li>\s*<\/li>/g, '</li>');
        html = html.replace(/<\/ol>\s*<ol>/g, '</ol><ol>');
        html = html.replace(/<\/ul>\s*<ul>/g, '</ul><ul>');

        // Restore tables
        function bth(td) {
            const hr = td.header.trim();
            const sr = td.separator.trim();

            let sc = sr;
            if (sc.charCodeAt(0) === P) sc = sc.slice(1);
            if (sc.charCodeAt(sc.length - 1) === P) sc = sc.slice(0, -1);
            const sc_ = sc.split('|').map(s => s.trim());

            const al = [];
            for (let idx = 0; idx < sc_.length; idx++) {
                let cell = sc_[idx].trim();
                const f = cell.charCodeAt(0);
                const l = cell.charCodeAt(cell.length - 1);
                
                if (f === COL && l === COL) al.push('center');
                else if (l === COL) al.push('right');
                else al.push('left');
            }

            let hc = hr;
            if (hc.charCodeAt(0) === P) hc = hc.slice(1);
            if (hc.charCodeAt(hc.length - 1) === P) hc = hc.slice(0, -1);
            const rhc = hc.split('|').map(s => s.trim());

            const rdr_ = td.rows.map(row => {
                let rc = row.trim();
                if (rc.charCodeAt(0) === P) rc = rc.slice(1);
                if (rc.charCodeAt(rc.length - 1) === P) rc = rc.slice(0, -1);
                return rc.split('|').map(s => s.trim());
            });

            const tc_ = rhc.length + rdr_.reduce((s, r) => s + r.length, 0);
            
            if (tc_ < 10) {
                const hc_ = rhc.map(cell => ri(cell, rm, fd, fn, fro, frc));
                const dr_ = rdr_.map(row => row.map(cell => ri(cell, rm, fd, fn, fro, frc)));
                return bfc(hc_, dr_, al);
            }

            const ac = new Set();
            for (let idx = 0; idx < rhc.length; idx++) ac.add(rhc[idx]);
            for (let ridx = 0; ridx < rdr_.length; ridx++) {
                const row = rdr_[ridx];
                for (let cidx = 0; cidx < row.length; cidx++) ac.add(row[cidx]);
            }

            const rc_ = {};
            for (const cell of ac) {
                rc_[cell] = ri(cell, rm, fd, fn, fro, frc);
            }

            const hc_ = rhc.map(cell => rc_[cell]);
            const dr_ = rdr_.map(row => row.map(cell => rc_[cell]));

            return bfc(hc_, dr_, al);
        }

        function bfc(hc, dr, al) {
            let th = '<table>\n';
            if (hc.length > 0) {
                th += '<thead>\n<tr>\n';
                for (let c = 0, clen = hc.length; c < clen; c++) {
                    const a = al[c] ? ` align="${al[c]}"` : '';
                    th += `<th${a}>${hc[c]}</th>\n`;
                }
                th += '</tr>\n</thead>\n';
            }
            if (dr.length > 0) {
                th += '<tbody>\n';
                for (let ridx = 0; ridx < dr.length; ridx++) {
                    const row = dr[ridx];
                    th += '<tr>\n';
                    for (let c = 0, clen = row.length; c < clen; c++) {
                        const a = al[c] ? ` align="${al[c]}"` : '';
                        th += `<td${a}>${row[c]}</td>\n`;
                    }
                    th += '</tr>\n';
                }
                th += '</tbody>\n';
            }
            th += '</table>';
            return th;
        }

        html = html.replace(rTP, (m, i) => {
            const td = tbls[parseInt(i)];
            return td ? bth(td) : m;
        });

        // Append footnotes section
        if (fro.length > 0) {
            let fh = '<div class="f">\n<hr>\n<ol>\n';
            for (let i = 0, len = fro.length; i < len; i++) {
                const id = fro[i];
                const l_ = fd[id];
                
                const pl = [];
                for (let j = 0; j < l_.length; j++) {
                    pl.push(ri(l_[j], rm, fd, fn, fro, frc));
                }
                
                let fc = '';
                let cp = [];
                
                for (let j = 0; j < pl.length; j++) {
                    const line = pl[j].trim();
                    
                    if (line === '') {
                        if (cp.length > 0) {
                            fc += '<p>' + cp.join('<br>') + '</p>';
                            cp = [];
                        }
                    } else {
                        cp.push(line);
                    }
                }
                
                if (cp.length > 0) {
                    const num = i + 1;
                    fc += '<p>' + cp.join('<br>') + ' <a href="#fnref-' + num + '" class="b">↩</a></p>';
                }
                
                const num = i + 1;
                fh += `<li id="fn-${num}">${fc}</li>\n`;
            }
            fh += '</ol>\n</div>\n';
            html += fh;
        }

        // Handle line breaks
        const lbp = [];
        let lbc = 0;
        html = html.replace(rLB, (m) => {
            const pl = `!!BR_${lbc}!!`;
            lbp.push('<br>');
            lbc++;
            return (m === '<br>' || m.startsWith('<br')) ? pl : pl + '\n';
        });

        // Restore code blocks and final placeholders
        html = restoreCodeBlocks(html, cs);
        html = html.replace(rBP, (m, i) => lbp[parseInt(i)] || '<br>');
        html = html.replace(rEP, (m, i) => ec[parseInt(i)]);

        return html;
    }

    // Export functions
    window.parseMarkdown = parseMarkdown;
})();