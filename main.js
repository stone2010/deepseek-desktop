const { app, BrowserWindow, ipcMain, shell, Menu, session } = require('electron');
const path = require('path');
const fs = require('fs');

const START_URL = process.env.DS_URL || 'https://chat.deepseek.com';
const DEBUG = process.env.DS_DEBUG === '1';
const LOG = (m) => {
  if (!DEBUG) return;
  try { fs.appendFileSync(path.join(__dirname, 'debug-log.txt'), new Date().toISOString() + ' ' + m + '\n'); } catch (e) {}
};

// userData: 打包版 → 便携（exe 同级 userdata，随 U 盘移动，任何电脑登录态一致）；
// 开发版 → 本机 AppData（便于调试共用会话）
if (app.isPackaged) {
  try { fs.mkdirSync(path.join(path.dirname(app.getPath('exe')), 'userdata'), { recursive: true }); } catch (e) {}
  app.setPath('userData', path.join(path.dirname(app.getPath('exe')), 'userdata'));
} else {
  app.setPath('userData', path.join(app.getPath('appData'), 'deepseek-desktop'));
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

let mainWindow = null;
let probeRegistered = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: DEBUG ? 1680 : 1280,
    height: DEBUG ? 1000 : 820,
    minWidth: 960,
    minHeight: 640,
    frame: false,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#0d0d14',
      symbolColor: '#7b95ff',
      height: 40,
    },
    backgroundColor: '#0a0a0a',
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      spellcheck: false,
    },
  });

  mainWindow.loadURL(START_URL);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (e, url) => {
    if (!/^https:\/\/(chat|auth)\.deepseek\.com/.test(url)) {
      e.preventDefault();
      shell.openExternal(url);
    }
  });

  // right-click context menu for usability
  mainWindow.webContents.on('context-menu', (e, params) => {
    const isLink = !!params.linkURL;
    const isEditable = params.isEditable;
    const isSelection = params.selectionText.trim().length > 0;
    const template = [];
    if (isLink) {
      template.push({ label: '在新窗口打开链接', click: () => shell.openExternal(params.linkURL) });
      template.push({ type: 'separator' });
    }
    if (isEditable) {
      template.push(
        { label: '撤销', role: 'undo', enabled: params.editFlags.canUndo },
        { label: '重做', role: 'redo', enabled: params.editFlags.canRedo },
        { type: 'separator' },
        { label: '剪切', role: 'cut', enabled: params.editFlags.canCut },
        { label: '复制', role: 'copy', enabled: params.editFlags.canCopy },
        { label: '粘贴', role: 'paste', enabled: params.editFlags.canPaste },
        { label: '全选', role: 'selectAll' },
        { type: 'separator' }
      );
    } else if (isSelection) {
      template.push({ label: '复制', role: 'copy' });
      template.push({ type: 'separator' });
    }
    template.push(
      { label: '后退', click: () => mainWindow.webContents.navigationHistory.canGoBack() && mainWindow.webContents.navigationHistory.goBack() },
      { label: '前进', click: () => mainWindow.webContents.navigationHistory.canGoForward() && mainWindow.webContents.navigationHistory.goForward() },
      { label: '刷新', role: 'reload' }
    );
    if (DEBUG) {
      template.push({ type: 'separator' });
      template.push({ label: '检查元素', click: () => mainWindow.webContents.openDevTools({ mode: 'detach' }) });
    }
    Menu.buildFromTemplate(template).popup({ window: mainWindow });
  });

  mainWindow.webContents.on('did-finish-load', () => {
    LOG('[did-finish-load] ' + mainWindow.webContents.getURL());
    if (DEBUG && !probeRegistered) {
      probeRegistered = true;
      // one-time interaction probe: inspect toggle buttons before/after click
      setTimeout(async () => {
        try {
          // 0) 思考 vs 输出样式验证
          const nav = await mainWindow.webContents.executeJavaScript(`
            (() => {
              const items = [...document.querySelectorAll('._546d736')];
              if (!items.length) return 'no-conv';
              items[0].click();
              return 'clicked';
            })()
          `);
          await new Promise(r => setTimeout(r, 4000));
          const thinkDump = await mainWindow.webContents.executeJavaScript(`
            (() => {
              const c = document.querySelector('.ds-think-content');
              if (!c) return JSON.stringify({ count: 0 });
              const cs = getComputedStyle(c);
              const label = document.querySelector('.cbx-think-label');
              const ls = label ? getComputedStyle(label) : null;
              const out = document.querySelector('.ds-assistant-message-main-content');
              const os = out ? getComputedStyle(out) : null;
              return JSON.stringify({
                thinkColor: cs.color, thinkSize: cs.fontSize, thinkBorderLeft: cs.borderLeftWidth + ' ' + cs.borderLeftColor,
                thinkBg: cs.backgroundImage.slice(0, 60),
                labelFound: !!label, labelText: label ? (label.textContent||'').trim().slice(0, 14) : null,
                labelPill: ls ? { color: ls.color, bg: ls.backgroundColor, radius: ls.borderRadius, pad: ls.padding } : null,
                outputColor: os ? os.color : null, outputSize: os ? os.fontSize : null
              });
            })()
          `);
          LOG('[think-style] ' + thinkDump);
          // 1) 打开设置面板
          const openPanel = async () => {
            await mainWindow.webContents.executeJavaScript(`
              (() => {
                const sb = document.querySelector('.dc04ec1d');
                if (sb) {
                  const scrollables = [...sb.querySelectorAll('*')].filter(el => el.scrollHeight > el.clientHeight + 40).sort((a,b) => b.scrollHeight - a.scrollHeight);
                  if (scrollables.length) scrollables[0].scrollTop = scrollables[0].scrollHeight;
                }
                const stone = [...document.querySelectorAll('[class]')].find(el => {
                  const t = (el.textContent||'').trim(); const r = el.getBoundingClientRect();
                  return t === 'Stone' && r.width > 30 && r.height < 60;
                });
                if (stone) (stone.closest('[role="button"],button,a') || stone).click();
              })()
            `);
            await new Promise(r => setTimeout(r, 1200));
            await mainWindow.webContents.executeJavaScript(`
              (() => {
                const item = [...document.querySelectorAll('[class]')].find(el => (el.textContent||'').trim() === '系统设置' && el.getBoundingClientRect().width > 30 && el.getBoundingClientRect().height < 70);
                if (item) (item.closest('[role="button"],button,a') || item).click();
              })()
            `);
            await new Promise(r => setTimeout(r, 2200));
          };
          await openPanel();
          let panelCheck = await mainWindow.webContents.executeJavaScript(`
            (() => !!([...document.querySelectorAll('[class]')].find(el => { const t = el.textContent || ''; return t.includes('通用设置') && t.includes('账号管理') && el.getBoundingClientRect().width > 300; })))()
          `);
          if (!panelCheck) { await openPanel(); panelCheck = true; }
          LOG('[panel-check] ' + panelCheck);
          // 2) 个性化区块：五组控件 + 滑杆
          const persDump = await mainWindow.webContents.executeJavaScript(`
            (() => {
              const p = document.getElementById('cbx-personal');
              if (!p) return 'no-personal';
              const vis = id => { const el = document.getElementById(id); if (!el) return false; const r = el.getBoundingClientRect(); return r.width > 40 && r.bottom > 0; };
              const opts = id => [...document.querySelectorAll('#' + id + ' .cbx-skin-opt, #' + id + ' .cbx-think-opt')].map(b => b.textContent + (b.classList.contains('cbx-on') ? '*' : ''));
              return JSON.stringify({
                secTitle: (p.querySelector('.cbx-sec-title')||{}).textContent,
                skin: vis('cbx-skin-row') ? opts('cbx-skin-row') : null,
                glass: vis('cbx-glass-row') ? { range: !!document.getElementById('cbx-alpha-range'), val: (document.getElementById('cbx-alpha-val')||{}).textContent } : null,
                flow: vis('cbx-flow-row') ? opts('cbx-flow-row') : null,
                speed: vis('cbx-speed-row') ? opts('cbx-speed-row') : null,
                think: vis('cbx-think-row') ? opts('cbx-think-row') : null
              });
            })()
          `);
          LOG('[personal] ' + persDump);
          // 3) 流动效果 关/开
          const flowOff = await mainWindow.webContents.executeJavaScript(`
            (() => {
              const b = document.querySelector('#cbx-flow-row [data-flow="off"]');
              if (!b) return 'no-flow-btn';
              b.click();
              return 'clicked';
            })()
          `);
          await new Promise(r => setTimeout(r, 600));
          const flowState = await mainWindow.webContents.executeJavaScript(`
            (() => {
              const au = document.getElementById('cbx-aurora');
              return JSON.stringify({ flowOff: document.body.classList.contains('cbx-flow-off'), anim: au ? getComputedStyle(au).animationName : null, dur: getComputedStyle(document.documentElement).getPropertyValue('--cbx-flow-dur').trim() });
            })()
          `);
          LOG('[flow-off] ' + flowOff + ' -> ' + flowState);
          await mainWindow.webContents.executeJavaScript(`
            (() => { const b = document.querySelector('#cbx-flow-row [data-flow="on"]'); if (b) b.click(); return 1; })()
          `);
          await new Promise(r => setTimeout(r, 400));
          // 4) 透明度滑杆 → 80
          const alphaSet = await mainWindow.webContents.executeJavaScript(`
            (() => {
              const r = document.getElementById('cbx-alpha-range');
              if (!r) return 'no-range';
              r.value = '80';
              r.dispatchEvent(new Event('input', { bubbles: true }));
              return 'set';
            })()
          `);
          await new Promise(r => setTimeout(r, 400));
          const alphaState = await mainWindow.webContents.executeJavaScript(`
            (() => {
              const de = document.documentElement;
              const cs = getComputedStyle(de);
              return JSON.stringify({ alpha: cs.getPropertyValue('--glass-alpha').trim(), alpha2: cs.getPropertyValue('--glass-alpha2').trim(), label: (document.getElementById('cbx-alpha-val')||{}).textContent });
            })()
          `);
          LOG('[alpha-80] ' + alphaSet + ' -> ' + alphaState);
          // 5) 原生切浅色 → 检测 body.light + 主题联动
          const lightClick = await mainWindow.webContents.executeJavaScript(`
            (() => {
              const f = [...document.querySelectorAll('[class]')].find(el => {
                const t = (el.textContent||'').trim(); const r = el.getBoundingClientRect();
                return t === '跟随系统' && r.width > 30 && r.width < 150 && r.height < 70;
              });
              if (!f) return 'no-follow';
              let w = f.parentElement;
              for (let i = 0; i < 3 && w; i++) {
                const kids = [...w.children];
                const light = kids.find(k => (k.textContent||'').trim() === '浅色');
                if (light) { (light.closest('[role="button"],button,[class]') || light).click(); return 'clicked-light'; }
                w = w.parentElement;
              }
              return 'no-light-in-row';
            })()
          `);
          LOG('[light-click] ' + lightClick);
          await new Promise(r => setTimeout(r, 3000));
          const lightDump = await mainWindow.webContents.executeJavaScript(`
            (() => {
              const cs = getComputedStyle(document.body);
              const de = document.documentElement;
              return JSON.stringify({
                bodyLight: document.body.classList.contains('light'),
                bodyBg: cs.backgroundColor,
                bodyColor: cs.color,
                aurora: !!document.getElementById('cbx-aurora'),
                alpha: getComputedStyle(de).getPropertyValue('--glass-alpha').trim(),
                thinkLabel: (() => { const el = document.querySelector('.cbx-think-label'); return el ? getComputedStyle(el).color : null; })()
              });
            })()
          `);
          LOG('[light-dump] ' + lightDump);
          // 6) 切回深色 + 恢复用户设置
          await mainWindow.webContents.executeJavaScript(`
            (() => {
              const f = [...document.querySelectorAll('[class]')].find(el => {
                const t = (el.textContent||'').trim(); const r = el.getBoundingClientRect();
                return t === '跟随系统' && r.width > 30 && r.width < 150 && r.height < 70;
              });
              if (f) {
                let w = f.parentElement;
                for (let i = 0; i < 3 && w; i++) {
                  const kids = [...w.children];
                  const dark = kids.find(k => (k.textContent||'').trim() === '深色');
                  if (dark) { (dark.closest('[role="button"],button,[class]') || dark).click(); break; }
                  w = w.parentElement;
                }
              }
              try {
                localStorage.setItem('ds-codex-theme', 'glass');
                localStorage.setItem('ds-codex-think-mode', 'full');
                localStorage.setItem('ds-codex-glass-flow', 'on');
                localStorage.setItem('ds-codex-glass-speed', 'medium');
                localStorage.setItem('ds-codex-glass-alpha', '50');
              } catch(e) {}
              return 1;
            })()
          `);
          await new Promise(r => setTimeout(r, 2000));
          LOG('[probe-done] back-to-dark + defaults restored');
        } catch (e) { LOG('[probe error] ' + e.message); }
      }, 12000);
      let count = 0;
      const timer = setInterval(async () => {
        count += 1;
        try {
          const dump = await mainWindow.webContents.executeJavaScript(`
            (() => {
              const classes = {};
              document.querySelectorAll('[class]').forEach(el => {
                (el.className && el.className.split ? el.className.split(/\\s+/) : []).forEach(c => {
                  if (c.startsWith('ds-')) classes[c] = (classes[c] || 0) + 1;
                });
              });
              const isOrange = (s) => {
                const m = s && s.match(/rgba?\\(([\\d.]+),\\s*([\\d.]+),\\s*([\\d.]+)/);
                if (!m) return false;
                const r = +m[1], g = +m[2], b = +m[3];
                return r > 175 && g > 55 && g < 180 && b < 110;
              };
              const orangeEls = [];
              document.querySelectorAll('*').forEach(el => {
                if (el.getBoundingClientRect().width < 2 || el.getBoundingClientRect().height < 2) return;
                const cs = getComputedStyle(el);
                const hits = [];
                if (isOrange(cs.backgroundColor)) hits.push('bg:' + cs.backgroundColor);
                if (isOrange(cs.color)) hits.push('color:' + cs.color);
                if (isOrange(cs.borderTopColor) || isOrange(cs.borderLeftColor)) hits.push('border:' + cs.borderTopColor);
                if (hits.length) {
                  orangeEls.push({ tag: el.tagName, cls: String(el.className).slice(0, 70), hits: hits.slice(0, 2) });
                }
              });
              const tokens = {};
              (getComputedStyle(document.documentElement) || {}).length && [...(getComputedStyle(document.documentElement))].forEach(p => {
                if (/accent|primary|brand|color/i.test(p)) tokens[p] = getComputedStyle(document.documentElement).getPropertyValue(p).trim();
              });
              const top = [...document.querySelectorAll('div,aside,header,nav,main')]
                .filter(el => { const r = el.getBoundingClientRect(); return r.width > 150 && r.height > 40; })
                .slice(0, 40)
                .map(el => {
                  const r = el.getBoundingClientRect();
                  return { tag: el.tagName, cls: String(el.className).slice(0, 80), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
                });
              return JSON.stringify({ url: location.href, dsClasses: Object.entries(classes).sort((a,b)=>b[1]-a[1]).slice(0, 60), orangeEls: orangeEls.slice(0, 25), tokens, regions: top });
            })()
          `);
          fs.writeFileSync(path.join(__dirname, 'debug-dom.json'), dump);
          const img = await mainWindow.webContents.capturePage();
          fs.writeFileSync(path.join(__dirname, 'debug-shot.png'), img.toPNG());
          LOG('[dump #' + count + '] url=' + JSON.parse(dump).url);
        } catch (e) { LOG('[dump error] ' + e.message); }
        if (count >= 20) clearInterval(timer);
      }, 15000);
    }
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

let CBX_AUTH = null;
const CBX_AUTH_KEYS = ['authorization', 'x-device-id', 'x-client-bundle-id', 'x-client-version', 'x-client-platform', 'x-client-locale', 'x-client-timezone-offset', 'x-device-model', 'content-type', 'accept', 'user-agent'];

function cbxInstallAuthCapture() {
  try {
    session.defaultSession.webRequest.onBeforeSendHeaders({ urls: ['*://chat.deepseek.com/*'] }, (details, callback) => {
      try {
        const h = details.requestHeaders || {};
        const keys = Object.keys(h);
        const authKey = keys.find(k => k.toLowerCase() === 'authorization');
        if (authKey && h[authKey]) {
          const out = {};
          CBX_AUTH_KEYS.forEach(k => {
            const hit = keys.find(x => x.toLowerCase() === k);
            if (hit && h[hit]) out[k] = h[hit];
          });
          out.authorization = h[authKey];
          CBX_AUTH = out;
        }
      } catch (e) { LOG('[auth-capture] ' + e.message); }
      callback({ requestHeaders: details.requestHeaders });
    });
    LOG('[auth-capture] installed');
  } catch (e) { LOG('[auth-capture] ' + e.message); }
}

app.whenReady().then(() => {
  LOG('[userData] ' + app.getPath('userData'));
  LOG('[name] ' + app.getName());
  cbxInstallAuthCapture();
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('cbx-auth-get', () => CBX_AUTH);

const TOKEN_STATS_FILE = path.join(app.getPath('userData'), 'token-stats.json');
ipcMain.handle('cbx-tokens-load', () => {
  try {
    return JSON.parse(fs.readFileSync(TOKEN_STATS_FILE, 'utf8'));
  } catch (e) {
    return null;
  }
});
ipcMain.handle('cbx-tokens-save', (_e, data) => {
  try {
    const json = JSON.stringify(data || {});
    const tmp = TOKEN_STATS_FILE + '.tmp';
    fs.writeFileSync(tmp, json);
    try { fs.renameSync(tmp, TOKEN_STATS_FILE); } catch (e) {
      fs.writeFileSync(TOKEN_STATS_FILE, json);
      try { fs.unlinkSync(tmp); } catch (e2) {}
    }
    return { ok: true, bytes: Buffer.byteLength(json) };
  } catch (e) {
    LOG('[tokens-save] ' + e.message);
    return { ok: false, error: e.message };
  }
});

ipcMain.handle('cbx-tokens-export', (_e, payload) => {
  try {
    const p = payload || {};
    const safe = String(p.name || 'token-export.txt').replace(/[\\/:*?"<>|]/g, '_');
    const dir = app.getPath('downloads');
    try { fs.mkdirSync(dir, { recursive: true }); } catch (e) {}
    let file = path.join(dir, safe);
    if (fs.existsSync(file)) {
      const ext = path.extname(safe);
      file = path.join(dir, safe.slice(0, safe.length - ext.length) + '-' + Date.now() + ext);
    }
    fs.writeFileSync(file, String(p.content == null ? '' : p.content), 'utf8');
    try { shell.showItemInFolder(file); } catch (e) {}
    return { ok: true, file };
  } catch (e) {
    LOG('[tokens-export] ' + e.message);
    return { ok: false, error: e.message };
  }
});

ipcMain.on('win-min', () => mainWindow && mainWindow.minimize());
ipcMain.on('win-max', () => {
  if (!mainWindow) return;
  if (mainWindow.isMaximized()) mainWindow.unmaximize(); else mainWindow.maximize();
});
ipcMain.on('win-close', () => mainWindow && mainWindow.close());
ipcMain.on('cbx-titlebar', (_e, mode) => {
  try {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.setTitleBarOverlay({
        color: mode === 'light' ? '#f3f4f8' : '#0d0d14',
        symbolColor: mode === 'light' ? '#4d6bfe' : '#7b95ff',
        height: 40,
      });
    }
  } catch (e) {}
});
