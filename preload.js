const { contextBridge, ipcRenderer, webFrame } = require('electron');

contextBridge.exposeInMainWorld('codexShell', {
  minimize: () => ipcRenderer.send('win-min'),
  maximize: () => ipcRenderer.send('win-max'),
  close: () => ipcRenderer.send('win-close'),
  setTitlebar: (mode) => ipcRenderer.send('cbx-titlebar', mode),
});

contextBridge.exposeInMainWorld('codexTokens', {
  load: () => ipcRenderer.invoke('cbx-tokens-load'),
  save: (data) => ipcRenderer.invoke('cbx-tokens-save', data),
});

let tkUsageCb = null;
contextBridge.exposeInMainWorld('codexUsage', {
  report: (json) => {
    if (typeof tkUsageCb === 'function') {
      try { tkUsageCb(String(json)); } catch (e) {}
    }
  },
});

try { tkInstallUsageHook(); } catch (e) {}

/* ================= 常量 ================= */
const STYLE_ID = 'cbx-theme';
const STORAGE_KEY = 'ds-codex-theme';
const THINK_KEY = 'ds-codex-think-mode';
const FLOW_KEY = 'ds-codex-glass-flow';
const SPEED_KEY = 'ds-codex-glass-speed';
const ALPHA_KEY = 'ds-codex-glass-alpha';
const PERSONAL_ID = 'cbx-personal';

/* ================= 标准主题（深色） ================= */
const THEME_STANDARD = `
:root{
  --cbx-bg0:#0a0a0c; --cbx-bg1:#0f0f13; --cbx-bg2:#15151b; --cbx-bg3:#1d1d25;
  --cbx-line:#232329; --cbx-line2:#30303a;
  --cbx-tx0:#f2f2f4; --cbx-tx1:#9d9da8; --cbx-tx2:#6b6b76;
  --cbx-acc:#4d6bfe; --cbx-acc2:#8aa0ff;
  --cbx-font:"Segoe UI",-apple-system,"PingFang SC","Microsoft YaHei",Roboto,sans-serif;
  --cbx-mono:"Cascadia Code","JetBrains Mono",Consolas,Menlo,monospace;
  --maxWidthChats: 880px; --maxWidthTextarea: 820px; --message-list-max-width: 880px;
}
html,body{
  background:var(--cbx-bg0) !important;
  color:var(--cbx-tx0) !important;
  font-family:var(--cbx-font) !important;
}
#cbx-aurora{display:none !important;}
::selection{background:rgba(77,107,254,.3) !important;}
a{color:var(--cbx-acc2) !important;}
svg{transition:color .15s ease;}

/* 滚动条：只美化真正显示的，不强行显示被隐藏的 */
::-webkit-scrollbar{width:8px !important;height:8px !important;background:transparent !important;}
::-webkit-scrollbar-thumb{background:#2a2a31 !important;border-radius:8px !important;border:2px solid transparent !important;background-clip:padding-box !important;}
::-webkit-scrollbar-thumb:hover{background:#3d3d48 !important;background-clip:padding-box !important;}
::-webkit-scrollbar-track{background:transparent !important;}
::-webkit-scrollbar-corner{background:transparent !important;}
.ds-scroll-area{scrollbar-width:none !important;-ms-overflow-style:none !important;}
.ds-scroll-area::-webkit-scrollbar{display:none !important;width:0 !important;height:0 !important;}
.ds-scroll-area{overscroll-behavior:contain !important;}
.ds-scroll-area__vertical-bar{opacity:1 !important;}
.ds-scroll-area__vertical-bar > *, .ds-scroll-area__horizontal-bar > *{
  background:#3a3a46 !important;border-radius:8px !important;
}
.ds-scroll-area__vertical-bar > *:hover, .ds-scroll-area__horizontal-bar > *:hover{background:#4a4a58 !important;}

/* 统一"卡片"材质 */
[class*="sidebar" i],[class*="list" i],[class*="menu" i],[class*="panel" i],[class*="card" i],[class*="modal" i],[class*="dialog" i],[class*="popover" i],[class*="dropdown" i],[class*="tooltip" i],[class*="toast" i],[class*="drawer" i]{
  background-color:var(--cbx-bg1) !important;
  border-color:var(--cbx-line) !important;
}
[class*="header" i],[class*="navbar" i],[class*="topbar" i],[class*="footer" i]{
  background-color:var(--cbx-bg0) !important;
  border-color:var(--cbx-line) !important;
}
[class*="item" i]:hover,[class*="option" i]:hover,[class*="row" i]:hover{
  background-color:var(--cbx-bg3) !important;
}
[class*="input" i],[class*="search" i],textarea,input[type="text"],input[type="email"],input[type="password"],input[type="search"]{
  background-color:var(--cbx-bg2) !important;
  border-color:var(--cbx-line2) !important;
  color:var(--cbx-tx0) !important;
  caret-color:var(--cbx-acc) !important;
}
[class*="input" i]:focus,[class*="search" i]:focus,textarea:focus,input:focus{
  border-color:var(--cbx-acc) !important;
  box-shadow:0 0 0 2px rgba(77,107,254,.14) !important;
  outline:none !important;
}
button,[role="button"]{border-color:var(--cbx-line2) !important;color:var(--cbx-tx0) !important;background-color:var(--cbx-bg2) !important;}
button:hover,[role="button"]:hover{background-color:var(--cbx-bg3) !important;}
.ds-button--icon,button[class*="icon" i]{background:transparent !important;border-color:transparent !important;color:var(--cbx-tx1) !important;}
.ds-button--icon:hover,button[class*="icon" i]:hover{background:rgba(77,107,254,.12) !important;color:#fff !important;}
[class*="primary" i][class*="button" i],button[class*="primary" i]{
  background:linear-gradient(135deg,#5b7cfa,#3d5af1) !important;
  border-color:transparent !important;color:#ffffff !important;font-weight:600 !important;
}
[class*="primary" i][class*="button" i]:hover,button[class*="primary" i]:hover{filter:brightness(1.1) !important;}
button:disabled,button[disabled]{opacity:.45 !important;filter:grayscale(.5) !important;cursor:not-allowed !important;}

h1,h2,h3,h4,h5,h6{color:var(--cbx-tx0) !important;}
[class*="title" i],[class*="heading" i]{color:var(--cbx-tx0) !important;}
[class*="subtitle" i],[class*="desc" i],[class*="hint" i],[class*="placeholder" i],[class*="time" i],[class*="meta" i],[class*="count" i]{color:var(--cbx-tx2) !important;}

/* ===== 侧边栏 ===== */
.dc04ec1d{background:var(--cbx-bg1) !important;border-right:1px solid var(--cbx-line) !important;}
.dc04ec1d .b8812f16{background:var(--cbx-bg1) !important;border:none !important;}
.e066abb8{color:var(--cbx-tx0) !important;}
._546d736{color:var(--cbx-tx1) !important;border-radius:8px !important;}
._546d736:hover{background:var(--cbx-bg2) !important;}
._546d736.b64fb9ae{background:var(--cbx-bg2) !important;color:var(--cbx-tx0) !important;box-shadow:inset 0 0 0 1px rgba(77,107,254,.3) !important;}
._5a8ac7a{background:linear-gradient(135deg,#5b7cfa,#3d5af1) !important;color:#ffffff !important;border:none !important;}
._5a8ac7a:hover{filter:brightness(1.1) !important;color:#ffffff !important;background:linear-gradient(135deg,#5b7cfa,#3d5af1) !important;}

/* ===== 消息区 ===== */
.ds-virtual-list-visible-items{max-width:var(--maxWidthChats) !important;}
._871cbca{padding:0 !important;}
._77cefa5{max-width:var(--maxWidthTextarea) !important;margin:0 auto !important;background:var(--cbx-bg2) !important;border:1px solid var(--cbx-line2) !important;border-radius:14px !important;box-shadow:0 4px 24px rgba(0,0,0,.35) !important;}
._77cefa5:focus-within{border-color:rgba(77,107,254,.55) !important;box-shadow:0 0 0 2px rgba(77,107,254,.12),0 4px 24px rgba(0,0,0,.35) !important;}
#chat-input{color:var(--cbx-tx0) !important;caret-color:var(--cbx-acc) !important;font-size:15px !important;line-height:1.6 !important;}
#chat-input::placeholder{color:var(--cbx-tx2) !important;}

.ds-toggle-button{color:var(--cbx-tx1) !important;border-color:var(--cbx-line2) !important;transition:background .18s ease,color .18s ease,border-color .18s ease,box-shadow .18s ease !important;}
.ds-toggle-button:hover{color:#fff !important;background:rgba(77,107,254,.14) !important;border-color:rgba(77,107,254,.45) !important;}
.ds-toggle-button--selected,.ds-toggle-button[aria-pressed="true"]{
  background:linear-gradient(135deg,#4d6bfe,#3d5af1) !important;
  border-color:transparent !important;color:#ffffff !important;
  box-shadow:0 2px 12px rgba(77,107,254,.35) !important;
}
.ds-toggle-button--selected:hover,.ds-toggle-button[aria-pressed="true"]:hover{filter:brightness(1.1) !important;}

._7436101{background:linear-gradient(135deg,#5b7cfa,#3d5af1) !important;color:#ffffff !important;border:none !important;}
._7436101:hover{filter:brightness(1.1) !important;}

/* ===== 消息气泡 ===== */
._4f9bf79 > .ds-message{
  background:var(--cbx-bg1) !important;color:var(--cbx-tx0) !important;
  border:1px solid var(--cbx-line) !important;border-radius:14px !important;
}
.fbb737a4{background:var(--cbx-bg2) !important;color:var(--cbx-tx0) !important;border:1px solid var(--cbx-line2) !important;border-radius:14px !important;}

/* ===== 思考 vs 输出 ===== */
.ds-think-content{
  color:#78788a !important;font-size:13px !important;line-height:1.75 !important;
  background:linear-gradient(90deg,rgba(77,107,254,.10),rgba(77,107,254,.03) 26%) !important;
  border:1px solid var(--cbx-line) !important;border-left:3px solid rgba(77,107,254,.60) !important;border-radius:10px !important;
}
.cbx-think-label{
  color:#7b95ff !important;background:rgba(77,107,254,.13) !important;
  border:1px solid rgba(77,107,254,.26) !important;padding:2px 10px !important;border-radius:999px !important;
  font-size:11.5px !important;font-weight:600 !important;letter-spacing:.03em !important;display:inline-block !important;
}
.ds-assistant-message-main-content,._4f9bf79 .ds-markdown{color:var(--cbx-tx0) !important;}
.cbx-think-mode-steps .ds-think-content{
  max-height:4.4em !important;overflow:hidden !important;
  -webkit-mask-image:linear-gradient(#000 0 60%, transparent) !important;mask-image:linear-gradient(#000 0 60%, transparent) !important;
}
.cbx-think-mode-steps .cbx-think-open .ds-think-content,
.cbx-think-mode-hidden .cbx-think-open .ds-think-content{
  max-height:none !important;overflow:visible !important;
  -webkit-mask-image:none !important;mask-image:none !important;display:block !important;
}
.cbx-think-mode-hidden .ds-think-content{display:none !important;}
.cbx-think{cursor:pointer !important;}
.ds-collapsible-text{border-color:var(--cbx-line) !important;}
._965abe9,._78e0558{background:rgba(77,107,254,.12) !important;box-shadow:0 0 0 2px rgba(77,107,254,.15) !important;border-radius:50vw !important;}
._0fcaa63{color:var(--cbx-tx2) !important;}
._0e98de6{background:var(--cbx-acc) !important;color:#ffffff !important;}

/* ===== Markdown ===== */
.ds-markdown{font-size:15px !important;line-height:1.75 !important;}
.ds-markdown p,.ds-markdown li,.ds-markdown div{color:var(--cbx-tx0) !important;}
.ds-markdown h1,.ds-markdown h2,.ds-markdown h3,.ds-markdown h4{color:var(--cbx-tx0) !important;font-weight:650 !important;letter-spacing:-.01em !important;}
.ds-markdown li::marker{color:var(--cbx-acc) !important;opacity:.8 !important;}
.ds-markdown code{font-family:var(--cbx-mono) !important;background:var(--cbx-bg2) !important;border:1px solid var(--cbx-line) !important;border-radius:5px !important;color:var(--cbx-acc2) !important;padding:1px 5px !important;font-size:.9em !important;}
.ds-markdown pre{background:#0d0d11 !important;border:1px solid var(--cbx-line) !important;border-radius:10px !important;font-family:var(--cbx-mono) !important;}
.md-code-block{background:#0d0d11 !important;border:1px solid var(--cbx-line) !important;border-radius:10px !important;box-shadow:0 6px 20px rgba(0,0,0,.3) !important;}
.md-code-block-banner,.md-code-block-banner-wrap{background:#0d0d11 !important;border-radius:8px !important;}
.md-code-block-infostring{color:var(--cbx-tx2) !important;font-family:var(--cbx-mono) !important;font-weight:600 !important;}
.md-code-block code{background:transparent !important;border:none !important;color:var(--cbx-tx0) !important;}
.ds-markdown-code-copy-button{background:var(--cbx-bg2) !important;color:var(--cbx-tx1) !important;border:1px solid var(--cbx-line2) !important;border-radius:8px !important;}
.ds-markdown-code-copy-button:hover{color:var(--cbx-acc2) !important;border-color:var(--cbx-acc) !important;}
.ds-markdown hr{background:var(--cbx-line) !important;}
.ds-markdown table{border-color:var(--cbx-line) !important;background:var(--cbx-bg1) !important;border-radius:10px !important;overflow:hidden !important;}
.ds-markdown th,.ds-markdown td{border-color:var(--cbx-line) !important;padding:8px 12px !important;}
.ds-markdown th{background:var(--cbx-bg2) !important;font-weight:600 !important;}
.ds-markdown tbody tr:nth-of-type(even){background:rgba(77,107,254,.03) !important;}
blockquote{border-left:3px solid var(--cbx-acc) !important;background:rgba(77,107,254,.06) !important;color:var(--cbx-tx1) !important;border-radius:8px !important;}

/* 登录页 */
.ds-auth-form-wrapper,ds-sign-in-form-wrapper{
  background:var(--cbx-bg1) !important;border:1px solid var(--cbx-line) !important;
  border-radius:16px !important;box-shadow:0 16px 60px rgba(0,0,0,.55) !important;
}
[class*="login" i] label,[class*="auth" i] label{color:var(--cbx-tx1) !important;}
[class*="login" i] input,[class*="auth" i] input{background:var(--cbx-bg2) !important;border:1px solid var(--cbx-line2) !important;color:var(--cbx-tx0) !important;border-radius:8px !important;}

/* 顶部拖拽条 */
.cbx-topbar{-webkit-app-region: drag;background:var(--cbx-bg0) !important;border-bottom:1px solid var(--cbx-line) !important;}
.cbx-topbar button,.cbx-topbar a,.cbx-topbar input,.cbx-topbar [role="button"],.cbx-topbar select,.cbx-topbar [class*="menu" i]{-webkit-app-region: no-drag;}
`;

/* ================= 标准主题（浅色） ================= */
const THEME_STANDARD_LIGHT = `
:root{
  --cbx-bg0:#f3f4f8; --cbx-bg1:#ffffff; --cbx-bg2:#eceef5; --cbx-bg3:#e1e4ef;
  --cbx-line:#e5e7f0; --cbx-line2:#d4d8e6;
  --cbx-tx0:#1d1d26; --cbx-tx1:#5d5d6b; --cbx-tx2:#8f8f9c;
  --cbx-acc:#4d6bfe; --cbx-acc2:#4d6bfe;
  --cbx-font:"Segoe UI",-apple-system,"PingFang SC","Microsoft YaHei",Roboto,sans-serif;
  --cbx-mono:"Cascadia Code","JetBrains Mono",Consolas,Menlo,monospace;
  --maxWidthChats: 880px; --maxWidthTextarea: 820px; --message-list-max-width: 880px;
}
html,body{
  background:var(--cbx-bg0) !important;
  color:var(--cbx-tx0) !important;
  font-family:var(--cbx-font) !important;
}
#cbx-aurora{display:none !important;}
::selection{background:rgba(77,107,254,.22) !important;}
a{color:var(--cbx-acc) !important;}
svg{transition:color .15s ease;}

::-webkit-scrollbar{width:8px !important;height:8px !important;background:transparent !important;}
::-webkit-scrollbar-thumb{background:#c9ccd8 !important;border-radius:8px !important;border:2px solid transparent !important;background-clip:padding-box !important;}
::-webkit-scrollbar-thumb:hover{background:#aeb2c4 !important;background-clip:padding-box !important;}
::-webkit-scrollbar-track{background:transparent !important;}
::-webkit-scrollbar-corner{background:transparent !important;}
.ds-scroll-area{scrollbar-width:none !important;-ms-overflow-style:none !important;}
.ds-scroll-area::-webkit-scrollbar{display:none !important;width:0 !important;height:0 !important;}
.ds-scroll-area{overscroll-behavior:contain !important;}
.ds-scroll-area__vertical-bar{opacity:1 !important;}
.ds-scroll-area__vertical-bar > *, .ds-scroll-area__horizontal-bar > *{background:#bfc3d3 !important;border-radius:8px !important;}
.ds-scroll-area__vertical-bar > *:hover, .ds-scroll-area__horizontal-bar > *:hover{background:#a6abc0 !important;}

[class*="sidebar" i],[class*="list" i],[class*="menu" i],[class*="panel" i],[class*="card" i],[class*="modal" i],[class*="dialog" i],[class*="popover" i],[class*="dropdown" i],[class*="tooltip" i],[class*="toast" i],[class*="drawer" i]{
  background-color:var(--cbx-bg1) !important;
  border-color:var(--cbx-line) !important;
}
[class*="header" i],[class*="navbar" i],[class*="topbar" i],[class*="footer" i]{
  background-color:var(--cbx-bg0) !important;
  border-color:var(--cbx-line) !important;
}
[class*="item" i]:hover,[class*="option" i]:hover,[class*="row" i]:hover{background-color:var(--cbx-bg3) !important;}
[class*="input" i],[class*="search" i],textarea,input[type="text"],input[type="email"],input[type="password"],input[type="search"]{
  background-color:var(--cbx-bg2) !important;
  border-color:var(--cbx-line2) !important;
  color:var(--cbx-tx0) !important;
  caret-color:var(--cbx-acc) !important;
}
[class*="input" i]:focus,[class*="search" i]:focus,textarea:focus,input:focus{
  border-color:var(--cbx-acc) !important;
  box-shadow:0 0 0 2px rgba(77,107,254,.14) !important;
  outline:none !important;
}
button,[role="button"]{border-color:var(--cbx-line2) !important;color:var(--cbx-tx0) !important;background-color:var(--cbx-bg2) !important;}
button:hover,[role="button"]:hover{background-color:var(--cbx-bg3) !important;}
.ds-button--icon,button[class*="icon" i]{background:transparent !important;border-color:transparent !important;color:var(--cbx-tx1) !important;}
.ds-button--icon:hover,button[class*="icon" i]:hover{background:rgba(77,107,254,.12) !important;color:var(--cbx-acc) !important;}
[class*="primary" i][class*="button" i],button[class*="primary" i]{
  background:linear-gradient(135deg,#5b7cfa,#3d5af1) !important;
  border-color:transparent !important;color:#ffffff !important;font-weight:600 !important;
}
[class*="primary" i][class*="button" i]:hover,button[class*="primary" i]:hover{filter:brightness(1.1) !important;}
button:disabled,button[disabled]{opacity:.45 !important;filter:grayscale(.5) !important;cursor:not-allowed !important;}

h1,h2,h3,h4,h5,h6{color:var(--cbx-tx0) !important;}
[class*="title" i],[class*="heading" i]{color:var(--cbx-tx0) !important;}
[class*="subtitle" i],[class*="desc" i],[class*="hint" i],[class*="placeholder" i],[class*="time" i],[class*="meta" i],[class*="count" i]{color:var(--cbx-tx2) !important;}

.dc04ec1d{background:var(--cbx-bg1) !important;border-right:1px solid var(--cbx-line) !important;}
.dc04ec1d .b8812f16{background:var(--cbx-bg1) !important;border:none !important;}
.e066abb8{color:var(--cbx-tx0) !important;}
._546d736{color:var(--cbx-tx1) !important;border-radius:8px !important;}
._546d736:hover{background:var(--cbx-bg2) !important;}
._546d736.b64fb9ae{background:var(--cbx-bg2) !important;color:var(--cbx-tx0) !important;box-shadow:inset 0 0 0 1px rgba(77,107,254,.3) !important;}
._5a8ac7a{background:linear-gradient(135deg,#5b7cfa,#3d5af1) !important;color:#ffffff !important;border:none !important;}
._5a8ac7a:hover{filter:brightness(1.1) !important;color:#ffffff !important;background:linear-gradient(135deg,#5b7cfa,#3d5af1) !important;}

.ds-virtual-list-visible-items{max-width:var(--maxWidthChats) !important;}
._871cbca{padding:0 !important;}
._77cefa5{max-width:var(--maxWidthTextarea) !important;margin:0 auto !important;background:#ffffff !important;border:1px solid var(--cbx-line2) !important;border-radius:14px !important;box-shadow:0 4px 24px rgba(20,25,60,.10) !important;}
._77cefa5:focus-within{border-color:rgba(77,107,254,.55) !important;box-shadow:0 0 0 2px rgba(77,107,254,.12),0 4px 24px rgba(20,25,60,.10) !important;}
#chat-input{color:var(--cbx-tx0) !important;caret-color:var(--cbx-acc) !important;font-size:15px !important;line-height:1.6 !important;}
#chat-input::placeholder{color:var(--cbx-tx2) !important;}

.ds-toggle-button{color:var(--cbx-tx1) !important;border-color:var(--cbx-line2) !important;transition:background .18s ease,color .18s ease,border-color .18s ease,box-shadow .18s ease !important;}
.ds-toggle-button:hover{color:var(--cbx-acc) !important;background:rgba(77,107,254,.10) !important;border-color:rgba(77,107,254,.45) !important;}
.ds-toggle-button--selected,.ds-toggle-button[aria-pressed="true"]{
  background:linear-gradient(135deg,#4d6bfe,#3d5af1) !important;
  border-color:transparent !important;color:#ffffff !important;
  box-shadow:0 2px 12px rgba(77,107,254,.35) !important;
}
.ds-toggle-button--selected:hover,.ds-toggle-button[aria-pressed="true"]:hover{filter:brightness(1.1) !important;}

._7436101{background:linear-gradient(135deg,#5b7cfa,#3d5af1) !important;color:#ffffff !important;border:none !important;}
._7436101:hover{filter:brightness(1.1) !important;}

._4f9bf79 > .ds-message{
  background:var(--cbx-bg1) !important;color:var(--cbx-tx0) !important;
  border:1px solid var(--cbx-line) !important;border-radius:14px !important;
}
.fbb737a4{background:var(--cbx-bg2) !important;color:var(--cbx-tx0) !important;border:1px solid var(--cbx-line2) !important;border-radius:14px !important;}

.ds-think-content{
  color:#6a6a7c !important;font-size:13px !important;line-height:1.75 !important;
  background:linear-gradient(90deg,rgba(77,107,254,.08),rgba(77,107,254,.025) 26%) !important;
  border:1px solid var(--cbx-line) !important;border-left:3px solid rgba(77,107,254,.55) !important;border-radius:10px !important;
}
.cbx-think-label{
  color:var(--cbx-acc) !important;background:rgba(77,107,254,.10) !important;
  border:1px solid rgba(77,107,254,.22) !important;padding:2px 10px !important;border-radius:999px !important;
  font-size:11.5px !important;font-weight:600 !important;letter-spacing:.03em !important;display:inline-block !important;
}
.ds-assistant-message-main-content,._4f9bf79 .ds-markdown{color:var(--cbx-tx0) !important;}
.cbx-think-mode-steps .ds-think-content{
  max-height:4.4em !important;overflow:hidden !important;
  -webkit-mask-image:linear-gradient(#000 0 60%, transparent) !important;mask-image:linear-gradient(#000 0 60%, transparent) !important;
}
.cbx-think-mode-steps .cbx-think-open .ds-think-content,
.cbx-think-mode-hidden .cbx-think-open .ds-think-content{
  max-height:none !important;overflow:visible !important;
  -webkit-mask-image:none !important;mask-image:none !important;display:block !important;
}
.cbx-think-mode-hidden .ds-think-content{display:none !important;}
.cbx-think{cursor:pointer !important;}
.ds-collapsible-text{border-color:var(--cbx-line) !important;}
._965abe9,._78e0558{background:rgba(77,107,254,.14) !important;box-shadow:0 0 0 2px rgba(77,107,254,.18) !important;border-radius:50vw !important;}
._0fcaa63{color:var(--cbx-tx2) !important;}
._0e98de6{background:var(--cbx-acc) !important;color:#ffffff !important;}

.ds-markdown{font-size:15px !important;line-height:1.75 !important;}
.ds-markdown p,.ds-markdown li,.ds-markdown div{color:var(--cbx-tx0) !important;}
.ds-markdown h1,.ds-markdown h2,.ds-markdown h3,.ds-markdown h4{color:var(--cbx-tx0) !important;font-weight:650 !important;letter-spacing:-.01em !important;}
.ds-markdown li::marker{color:var(--cbx-acc) !important;opacity:.8 !important;}
.ds-markdown code{font-family:var(--cbx-mono) !important;background:var(--cbx-bg2) !important;border:1px solid var(--cbx-line) !important;border-radius:5px !important;color:var(--cbx-acc) !important;padding:1px 5px !important;font-size:.9em !important;}
.ds-markdown pre{background:#f7f8fb !important;border:1px solid var(--cbx-line) !important;border-radius:10px !important;font-family:var(--cbx-mono) !important;}
.md-code-block{background:#f7f8fb !important;border:1px solid var(--cbx-line) !important;border-radius:10px !important;box-shadow:0 6px 20px rgba(20,25,60,.10) !important;}
.md-code-block-banner,.md-code-block-banner-wrap{background:#f7f8fb !important;border-radius:8px !important;}
.md-code-block-infostring{color:var(--cbx-tx2) !important;font-family:var(--cbx-mono) !important;font-weight:600 !important;}
.md-code-block code{background:transparent !important;border:none !important;color:var(--cbx-tx0) !important;}
.ds-markdown-code-copy-button{background:var(--cbx-bg2) !important;color:var(--cbx-tx1) !important;border:1px solid var(--cbx-line2) !important;border-radius:8px !important;}
.ds-markdown-code-copy-button:hover{color:var(--cbx-acc) !important;border-color:var(--cbx-acc) !important;}
.ds-markdown hr{background:var(--cbx-line) !important;}
.ds-markdown table{border-color:var(--cbx-line) !important;background:var(--cbx-bg1) !important;border-radius:10px !important;overflow:hidden !important;}
.ds-markdown th,.ds-markdown td{border-color:var(--cbx-line) !important;padding:8px 12px !important;}
.ds-markdown th{background:var(--cbx-bg2) !important;font-weight:600 !important;}
.ds-markdown tbody tr:nth-of-type(even){background:rgba(77,107,254,.03) !important;}
blockquote{border-left:3px solid var(--cbx-acc) !important;background:rgba(77,107,254,.06) !important;color:var(--cbx-tx1) !important;border-radius:8px !important;}

.ds-auth-form-wrapper,ds-sign-in-form-wrapper{
  background:var(--cbx-bg1) !important;border:1px solid var(--cbx-line) !important;
  border-radius:16px !important;box-shadow:0 16px 60px rgba(20,25,60,.16) !important;
}
[class*="login" i] label,[class*="auth" i] label{color:var(--cbx-tx1) !important;}
[class*="login" i] input,[class*="auth" i] input{background:var(--cbx-bg2) !important;border:1px solid var(--cbx-line2) !important;color:var(--cbx-tx0) !important;border-radius:8px !important;}

.cbx-topbar{-webkit-app-region: drag;background:var(--cbx-bg0) !important;border-bottom:1px solid var(--cbx-line) !important;}
.cbx-topbar button,.cbx-topbar a,.cbx-topbar input,.cbx-topbar [role="button"],.cbx-topbar select,.cbx-topbar [class*="menu" i]{-webkit-app-region: no-drag;}
`;

/* ================= 液态玻璃主题（深色） ================= */
const THEME_GLASS = `
:root{
  --cbx-bg0:#0a0a12; --cbx-bg1:#0f0f18; --cbx-bg2:#15151f; --cbx-bg3:#1d1d2b;
  --cbx-line:rgba(255,255,255,.09); --cbx-line2:rgba(255,255,255,.14);
  --cbx-tx0:#f5f5f7; --cbx-tx1:#b0b0bd; --cbx-tx2:#7d7d8c;
  --cbx-acc:#4d6bfe; --cbx-acc2:#9db2ff;
  --cbx-font:"Segoe UI",-apple-system,"PingFang SC","Microsoft YaHei",Roboto,sans-serif;
  --cbx-mono:"Cascadia Code","JetBrains Mono",Consolas,Menlo,monospace;
  --maxWidthChats: 880px; --maxWidthTextarea: 820px; --message-list-max-width: 880px;
  --glass-bg: rgba(255,255,255,var(--glass-alpha,.055));
  --glass-bg2: rgba(255,255,255,var(--glass-alpha2,.085));
  --glass-bd: rgba(255,255,255,.10);
  --glass-bd2: rgba(255,255,255,.16);
  --glass-blur: blur(20px) saturate(170%);
}
html,body{
  background:
    radial-gradient(1050px 700px at 10% -8%, rgba(88,110,255,.28), transparent 62%),
    radial-gradient(820px 560px at 96% 4%, rgba(122,92,255,.16), transparent 55%),
    radial-gradient(980px 680px at 82% 102%, rgba(64,90,255,.20), transparent 58%),
    radial-gradient(560px 420px at 28% 78%, rgba(150,125,255,.10), transparent 60%),
    radial-gradient(700px 500px at 55% 35%, rgba(90,120,255,.06), transparent 65%),
    #0a0a12 !important;
  background-attachment: fixed !important;
  color:var(--cbx-tx0) !important;
  font-family:var(--cbx-font) !important;
}
::selection{background:rgba(77,107,254,.38) !important;}
a{color:var(--cbx-acc2) !important;}

/* 流动光晕层：极慢漂移，玻璃雾化后几乎无感，不干扰注意力 */
#cbx-aurora{
  position:fixed !important;inset:-6% !important;z-index:-1 !important;pointer-events:none !important;
  background:
    radial-gradient(880px 600px at 18% 10%, rgba(96,118,255,.30), transparent 60%),
    radial-gradient(720px 500px at 90% 14%, rgba(140,110,255,.20), transparent 58%),
    radial-gradient(820px 580px at 76% 94%, rgba(70,100,255,.22), transparent 60%),
    radial-gradient(520px 400px at 32% 78%, rgba(160,130,255,.12), transparent 62%) !important;
  animation:cbx-aurora-flow var(--cbx-flow-dur,55s) ease-in-out infinite alternate !important;
  will-change:transform !important;
}
@keyframes cbx-aurora-flow{
  0%{transform:translate3d(0,0,0) scale(1);}
  33%{transform:translate3d(-1.8%,1.1%,0) scale(1.045);}
  66%{transform:translate3d(1.5%,-1.1%,0) scale(1.025);}
  100%{transform:translate3d(0,0,0) scale(1);}
}
body.cbx-flow-off #cbx-aurora{animation:none !important;}
body.cbx-scrolling #cbx-aurora{animation-play-state:paused !important;}

/* 全窗口容器透明，露出极光底 */
.cb86951c,.c3ecdb44,.dc04ec1d,.b8812f16,.d1d3d5a7,.f8d1e4c0,.the-header,
._7780f2e,._765a5cd,._660ca72,._4cbcd96,._871cbca,._2be88ba,._1551317,
[class*="main" i],[class*="content" i]{
  background:transparent !important;border-color:transparent !important;
}

::-webkit-scrollbar{width:8px !important;height:8px !important;background:transparent !important;}
::-webkit-scrollbar-thumb{background:rgba(255,255,255,.16) !important;border-radius:8px !important;border:2px solid transparent !important;background-clip:padding-box !important;}
::-webkit-scrollbar-thumb:hover{background:rgba(255,255,255,.28) !important;background-clip:padding-box !important;}
.ds-scroll-area{scrollbar-width:none !important;-ms-overflow-style:none !important;}
.ds-scroll-area::-webkit-scrollbar{display:none !important;width:0 !important;height:0 !important;}
.ds-scroll-area{overscroll-behavior:contain !important;}
.ds-scroll-area__vertical-bar{opacity:1 !important;}
.ds-scroll-area__vertical-bar > *,.ds-scroll-area__horizontal-bar > *{background:rgba(255,255,255,.22) !important;border-radius:8px !important;}

.dc04ec1d,[class*="modal" i],[class*="drawer" i],[class*="dialog" i],[class*="popover" i],[class*="dropdown" i],[class*="menu" i],[class*="panel" i]{
  background:var(--glass-bg) !important;
  backdrop-filter:var(--glass-blur) !important;-webkit-backdrop-filter:var(--glass-blur) !important;
  border:1px solid var(--glass-bd) !important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.09) !important;
}
.dc04ec1d{border-right:1px solid var(--glass-bd) !important;}
.e066abb8{color:var(--cbx-tx0) !important;}
._546d736{color:var(--cbx-tx1) !important;border-radius:10px !important;transition:background .15s ease !important;}
._546d736:hover{background:rgba(255,255,255,.09) !important;}
._546d736.b64fb9ae{background:rgba(77,107,254,.26) !important;color:var(--cbx-tx0) !important;box-shadow:inset 0 0 0 1px rgba(77,107,254,.42) !important;}
._5a8ac7a{
  background:linear-gradient(135deg,#5b7cfa,#3d5af1) !important;color:#fff !important;border:none !important;
  box-shadow:0 4px 18px rgba(77,107,254,.42),inset 0 1px 0 rgba(255,255,255,.28) !important;
}
._5a8ac7a:hover{filter:brightness(1.1) !important;color:#fff !important;}

.cbx-topbar{
  -webkit-app-region: drag;
  background:rgba(255,255,255,.04) !important;
  backdrop-filter:var(--glass-blur) !important;-webkit-backdrop-filter:var(--glass-blur) !important;
  border-bottom:1px solid var(--glass-bd) !important;
}
.cbx-topbar button,.cbx-topbar a,.cbx-topbar input,.cbx-topbar [role="button"],.cbx-topbar select,.cbx-topbar [class*="menu" i]{-webkit-app-region: no-drag;}

._77cefa5{
  max-width:var(--maxWidthTextarea) !important;margin:0 auto !important;
  background:var(--glass-bg2) !important;
  backdrop-filter:var(--glass-blur) !important;-webkit-backdrop-filter:var(--glass-blur) !important;
  border:1px solid var(--glass-bd2) !important;border-radius:16px !important;
  box-shadow:0 8px 32px rgba(0,0,0,.42),inset 0 1px 0 rgba(255,255,255,.14) !important;
}
._77cefa5:focus-within{
  border-color:rgba(77,107,254,.72) !important;
  box-shadow:0 0 0 3px rgba(77,107,254,.16),0 8px 32px rgba(0,0,0,.42),inset 0 1px 0 rgba(255,255,255,.14) !important;
}
#chat-input{color:var(--cbx-tx0) !important;caret-color:var(--cbx-acc) !important;font-size:15px !important;line-height:1.6 !important;}
#chat-input::placeholder{color:var(--cbx-tx2) !important;}

.ds-toggle-button{
  background:rgba(255,255,255,.06) !important;border:1px solid var(--glass-bd2) !important;
  color:var(--cbx-tx1) !important;
  backdrop-filter:blur(14px) !important;-webkit-backdrop-filter:blur(14px) !important;
  transition:background .18s ease,color .18s ease,border-color .18s ease,box-shadow .18s ease !important;
}
.ds-toggle-button:hover{color:#fff !important;background:rgba(77,107,254,.22) !important;border-color:rgba(77,107,254,.5) !important;}
.ds-toggle-button--selected,.ds-toggle-button[aria-pressed="true"]{
  background:linear-gradient(135deg,#4d6bfe,#3d5af1) !important;
  border-color:transparent !important;color:#fff !important;
  box-shadow:0 3px 16px rgba(77,107,254,.52),inset 0 1px 0 rgba(255,255,255,.26) !important;
}
.ds-toggle-button--selected:hover,.ds-toggle-button[aria-pressed="true"]:hover{filter:brightness(1.1) !important;}

._7436101{
  background:linear-gradient(135deg,#5b7cfa,#3d5af1) !important;color:#fff !important;border:none !important;
  box-shadow:0 4px 18px rgba(77,107,254,.46),inset 0 1px 0 rgba(255,255,255,.26) !important;
}
._7436101:hover{filter:brightness(1.1) !important;}

._4f9bf79 > .ds-message{
  background:var(--glass-bg) !important;color:var(--cbx-tx0) !important;
  backdrop-filter:var(--glass-blur) !important;-webkit-backdrop-filter:var(--glass-blur) !important;
  border:1px solid var(--glass-bd) !important;border-radius:16px !important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.09) !important;
}
.fbb737a4{
  background:var(--glass-bg) !important;color:var(--cbx-tx0) !important;
  backdrop-filter:var(--glass-blur) !important;-webkit-backdrop-filter:var(--glass-blur) !important;
  border:1px solid rgba(77,107,254,.42) !important;border-radius:16px !important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.09) !important;
}
.ds-think-content{
  color:#7a7a8e !important;font-size:13px !important;line-height:1.75 !important;
  background:linear-gradient(90deg,rgba(77,107,254,.12),rgba(77,107,254,.04) 26%) !important;
  backdrop-filter:var(--glass-blur) !important;-webkit-backdrop-filter:var(--glass-blur) !important;
  border:1px solid var(--glass-bd) !important;border-left:3px solid rgba(77,107,254,.62) !important;border-radius:10px !important;
}
.cbx-think-label{
  color:var(--cbx-acc2) !important;background:rgba(77,107,254,.13) !important;
  border:1px solid rgba(77,107,254,.26) !important;padding:2px 10px !important;border-radius:999px !important;
  font-size:11.5px !important;font-weight:600 !important;letter-spacing:.03em !important;display:inline-block !important;
}
.ds-assistant-message-main-content,._4f9bf79 .ds-markdown{color:var(--cbx-tx0) !important;}
.cbx-think-mode-steps .ds-think-content{
  max-height:4.4em !important;overflow:hidden !important;
  -webkit-mask-image:linear-gradient(#000 0 60%, transparent) !important;mask-image:linear-gradient(#000 0 60%, transparent) !important;
}
.cbx-think-mode-steps .cbx-think-open .ds-think-content,
.cbx-think-mode-hidden .cbx-think-open .ds-think-content{
  max-height:none !important;overflow:visible !important;
  -webkit-mask-image:none !important;mask-image:none !important;display:block !important;
}
.cbx-think-mode-hidden .ds-think-content{display:none !important;}
.cbx-think{cursor:pointer !important;}
.ds-collapsible-text{border-color:var(--glass-bd) !important;}
._965abe9,._78e0558{background:rgba(77,107,254,.22) !important;box-shadow:0 0 0 2px rgba(77,107,254,.24) !important;border-radius:50vw !important;}

.ds-button--icon,button[class*="icon" i]{background:transparent !important;border-color:transparent !important;color:var(--cbx-tx1) !important;}
.ds-button--icon:hover,button[class*="icon" i]:hover{background:rgba(77,107,254,.18) !important;color:#fff !important;box-shadow:0 0 12px rgba(77,107,254,.25) !important;}

.md-code-block{background:rgba(0,0,0,.42) !important;backdrop-filter:blur(20px) !important;-webkit-backdrop-filter:blur(20px) !important;border:1px solid var(--glass-bd) !important;border-radius:12px !important;box-shadow:0 8px 26px rgba(0,0,0,.38) !important;}
.md-code-block-banner,.md-code-block-banner-wrap{background:transparent !important;}
.md-code-block-infostring{color:var(--cbx-tx2) !important;font-weight:600 !important;}
.md-code-block code{background:transparent !important;border:none !important;color:var(--cbx-tx0) !important;}
.ds-markdown{font-size:15px !important;line-height:1.75 !important;}
.ds-markdown p,.ds-markdown li,.ds-markdown div{color:var(--cbx-tx0) !important;}
.ds-markdown h1,.ds-markdown h2,.ds-markdown h3,.ds-markdown h4{color:var(--cbx-tx0) !important;font-weight:650 !important;}
.ds-markdown li::marker{color:var(--cbx-acc) !important;opacity:.8 !important;}
.ds-markdown code{font-family:var(--cbx-mono) !important;background:rgba(255,255,255,.10) !important;border:1px solid rgba(255,255,255,.12) !important;border-radius:5px !important;color:var(--cbx-acc2) !important;padding:1px 5px !important;font-size:.9em !important;}
blockquote{border-left:3px solid var(--cbx-acc) !important;background:rgba(77,107,254,.09) !important;color:var(--cbx-tx1) !important;border-radius:8px !important;}
.ds-markdown table{border-color:var(--glass-bd) !important;background:rgba(255,255,255,.03) !important;border-radius:12px !important;overflow:hidden !important;}
.ds-markdown th,.ds-markdown td{border-color:var(--glass-bd) !important;padding:8px 12px !important;}
.ds-markdown th{background:rgba(255,255,255,.06) !important;}
.ds-markdown tbody tr:nth-of-type(even){background:rgba(77,107,254,.04) !important;}

button:disabled,button[disabled]{opacity:.45 !important;filter:grayscale(.5) !important;cursor:not-allowed !important;}
`;

/* ================= 液态玻璃主题（浅色，苹果风柔和光晕） ================= */
const THEME_GLASS_LIGHT = `
:root{
  --cbx-bg0:#f2f3f9; --cbx-bg1:#fafbfe; --cbx-bg2:#eef0f7; --cbx-bg3:#e4e7f2;
  --cbx-line:rgba(25,30,60,.10); --cbx-line2:rgba(25,30,60,.16);
  --cbx-tx0:#1c1c26; --cbx-tx1:#5d5d70; --cbx-tx2:#90909f;
  --cbx-acc:#4d6bfe; --cbx-acc2:#4d6bfe;
  --cbx-font:"Segoe UI",-apple-system,"PingFang SC","Microsoft YaHei",Roboto,sans-serif;
  --cbx-mono:"Cascadia Code","JetBrains Mono",Consolas,Menlo,monospace;
  --maxWidthChats: 880px; --maxWidthTextarea: 820px; --message-list-max-width: 880px;
  --glass-bg: rgba(255,255,255,var(--glass-alpha,.42));
  --glass-bg2: rgba(255,255,255,var(--glass-alpha2,.50));
  --glass-bd: rgba(255,255,255,.62);
  --glass-bd2: rgba(255,255,255,.85);
  --glass-blur: blur(18px) saturate(150%);
}
html,body{
  background:
    radial-gradient(1000px 680px at 8% -6%, rgba(140,165,255,.38), transparent 60%),
    radial-gradient(780px 540px at 95% 2%, rgba(200,170,255,.26), transparent 56%),
    radial-gradient(920px 640px at 84% 100%, rgba(140,200,255,.24), transparent 58%),
    radial-gradient(520px 400px at 26% 82%, rgba(255,180,215,.18), transparent 60%),
    radial-gradient(700px 500px at 55% 40%, rgba(190,205,255,.14), transparent 62%),
    #f2f3f9 !important;
  background-attachment: fixed !important;
  color:var(--cbx-tx0) !important;
  font-family:var(--cbx-font) !important;
}
::selection{background:rgba(77,107,254,.22) !important;}
a{color:var(--cbx-acc) !important;}

#cbx-aurora{
  position:fixed !important;inset:-6% !important;z-index:-1 !important;pointer-events:none !important;
  background:
    radial-gradient(860px 580px at 20% 12%, rgba(150,175,255,.34), transparent 60%),
    radial-gradient(700px 480px at 88% 16%, rgba(205,175,255,.24), transparent 58%),
    radial-gradient(800px 560px at 74% 92%, rgba(150,205,255,.22), transparent 60%),
    radial-gradient(500px 380px at 30% 76%, rgba(255,190,220,.16), transparent 62%) !important;
  animation:cbx-aurora-flow var(--cbx-flow-dur,55s) ease-in-out infinite alternate !important;
  will-change:transform !important;
}
@keyframes cbx-aurora-flow{
  0%{transform:translate3d(0,0,0) scale(1);}
  33%{transform:translate3d(-1.8%,1.1%,0) scale(1.045);}
  66%{transform:translate3d(1.5%,-1.1%,0) scale(1.025);}
  100%{transform:translate3d(0,0,0) scale(1);}
}
body.cbx-flow-off #cbx-aurora{animation:none !important;}
body.cbx-scrolling #cbx-aurora{animation-play-state:paused !important;}

.cb86951c,.c3ecdb44,.dc04ec1d,.b8812f16,.d1d3d5a7,.f8d1e4c0,.the-header,
._7780f2e,._765a5cd,._660ca72,._4cbcd96,._871cbca,._2be88ba,._1551317,
[class*="main" i],[class*="content" i]{
  background:transparent !important;border-color:transparent !important;
}

::-webkit-scrollbar{width:8px !important;height:8px !important;background:transparent !important;}
::-webkit-scrollbar-thumb{background:rgba(25,30,60,.16) !important;border-radius:8px !important;border:2px solid transparent !important;background-clip:padding-box !important;}
::-webkit-scrollbar-thumb:hover{background:rgba(25,30,60,.26) !important;background-clip:padding-box !important;}
.ds-scroll-area{scrollbar-width:none !important;-ms-overflow-style:none !important;}
.ds-scroll-area::-webkit-scrollbar{display:none !important;width:0 !important;height:0 !important;}
.ds-scroll-area{overscroll-behavior:contain !important;}
.ds-scroll-area__vertical-bar{opacity:1 !important;}
.ds-scroll-area__vertical-bar > *,.ds-scroll-area__horizontal-bar > *{background:rgba(25,30,60,.26) !important;border-radius:8px !important;}

.dc04ec1d,[class*="modal" i],[class*="drawer" i],[class*="dialog" i],[class*="popover" i],[class*="dropdown" i],[class*="menu" i],[class*="panel" i]{
  background:var(--glass-bg) !important;
  backdrop-filter:var(--glass-blur) !important;-webkit-backdrop-filter:var(--glass-blur) !important;
  border:1px solid var(--glass-bd) !important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.85),0 8px 32px rgba(25,35,90,.08) !important;
}
.dc04ec1d{border-right:1px solid var(--glass-bd) !important;}
.e066abb8{color:var(--cbx-tx0) !important;}
._546d736{color:var(--cbx-tx1) !important;border-radius:10px !important;transition:background .15s ease !important;}
._546d736:hover{background:rgba(255,255,255,.55) !important;}
._546d736.b64fb9ae{background:rgba(77,107,254,.16) !important;color:var(--cbx-tx0) !important;box-shadow:inset 0 0 0 1px rgba(77,107,254,.38) !important;}
._5a8ac7a{
  background:linear-gradient(135deg,#5b7cfa,#3d5af1) !important;color:#fff !important;border:none !important;
  box-shadow:0 4px 18px rgba(77,107,254,.38),inset 0 1px 0 rgba(255,255,255,.28) !important;
}
._5a8ac7a:hover{filter:brightness(1.1) !important;color:#fff !important;}

.cbx-topbar{
  -webkit-app-region: drag;
  background:rgba(255,255,255,.28) !important;
  backdrop-filter:var(--glass-blur) !important;-webkit-backdrop-filter:var(--glass-blur) !important;
  border-bottom:1px solid rgba(255,255,255,.55) !important;
}
.cbx-topbar button,.cbx-topbar a,.cbx-topbar input,.cbx-topbar [role="button"],.cbx-topbar select,.cbx-topbar [class*="menu" i]{-webkit-app-region: no-drag;}

._77cefa5{
  max-width:var(--maxWidthTextarea) !important;margin:0 auto !important;
  background:var(--glass-bg2) !important;
  backdrop-filter:var(--glass-blur) !important;-webkit-backdrop-filter:var(--glass-blur) !important;
  border:1px solid var(--glass-bd2) !important;border-radius:16px !important;
  box-shadow:0 8px 32px rgba(25,35,90,.10),inset 0 1px 0 rgba(255,255,255,.85) !important;
}
._77cefa5:focus-within{
  border-color:rgba(77,107,254,.72) !important;
  box-shadow:0 0 0 3px rgba(77,107,254,.14),0 8px 32px rgba(25,35,90,.10),inset 0 1px 0 rgba(255,255,255,.85) !important;
}
#chat-input{color:var(--cbx-tx0) !important;caret-color:var(--cbx-acc) !important;font-size:15px !important;line-height:1.6 !important;}
#chat-input::placeholder{color:var(--cbx-tx2) !important;}

.ds-toggle-button{
  background:rgba(255,255,255,.40) !important;border:1px solid var(--glass-bd2) !important;
  color:var(--cbx-tx1) !important;
  backdrop-filter:blur(14px) !important;-webkit-backdrop-filter:blur(14px) !important;
  transition:background .18s ease,color .18s ease,border-color .18s ease,box-shadow .18s ease !important;
}
.ds-toggle-button:hover{color:var(--cbx-acc) !important;background:rgba(255,255,255,.75) !important;border-color:rgba(77,107,254,.5) !important;}
.ds-toggle-button--selected,.ds-toggle-button[aria-pressed="true"]{
  background:linear-gradient(135deg,#4d6bfe,#3d5af1) !important;
  border-color:transparent !important;color:#fff !important;
  box-shadow:0 3px 16px rgba(77,107,254,.42),inset 0 1px 0 rgba(255,255,255,.26) !important;
}
.ds-toggle-button--selected:hover,.ds-toggle-button[aria-pressed="true"]:hover{filter:brightness(1.1) !important;}

._7436101{
  background:linear-gradient(135deg,#5b7cfa,#3d5af1) !important;color:#fff !important;border:none !important;
  box-shadow:0 4px 18px rgba(77,107,254,.40),inset 0 1px 0 rgba(255,255,255,.26) !important;
}
._7436101:hover{filter:brightness(1.1) !important;}

._4f9bf79 > .ds-message{
  background:var(--glass-bg) !important;color:var(--cbx-tx0) !important;
  backdrop-filter:var(--glass-blur) !important;-webkit-backdrop-filter:var(--glass-blur) !important;
  border:1px solid var(--glass-bd) !important;border-radius:16px !important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.85) !important;
}
.fbb737a4{
  background:var(--glass-bg) !important;color:var(--cbx-tx0) !important;
  backdrop-filter:var(--glass-blur) !important;-webkit-backdrop-filter:var(--glass-blur) !important;
  border:1px solid rgba(77,107,254,.40) !important;border-radius:16px !important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.85) !important;
}
.ds-think-content{
  color:#66667a !important;font-size:13px !important;line-height:1.75 !important;
  background:linear-gradient(90deg,rgba(77,107,254,.10),rgba(77,107,254,.03) 26%) !important;
  backdrop-filter:var(--glass-blur) !important;-webkit-backdrop-filter:var(--glass-blur) !important;
  border:1px solid rgba(255,255,255,.70) !important;border-left:3px solid rgba(77,107,254,.55) !important;border-radius:10px !important;
}
.cbx-think-label{
  color:var(--cbx-acc) !important;background:rgba(77,107,254,.10) !important;
  border:1px solid rgba(77,107,254,.22) !important;padding:2px 10px !important;border-radius:999px !important;
  font-size:11.5px !important;font-weight:600 !important;letter-spacing:.03em !important;display:inline-block !important;
}
.ds-assistant-message-main-content,._4f9bf79 .ds-markdown{color:var(--cbx-tx0) !important;}
.cbx-think-mode-steps .ds-think-content{
  max-height:4.4em !important;overflow:hidden !important;
  -webkit-mask-image:linear-gradient(#000 0 60%, transparent) !important;mask-image:linear-gradient(#000 0 60%, transparent) !important;
}
.cbx-think-mode-steps .cbx-think-open .ds-think-content,
.cbx-think-mode-hidden .cbx-think-open .ds-think-content{
  max-height:none !important;overflow:visible !important;
  -webkit-mask-image:none !important;mask-image:none !important;display:block !important;
}
.cbx-think-mode-hidden .ds-think-content{display:none !important;}
.cbx-think{cursor:pointer !important;}
.ds-collapsible-text{border-color:var(--glass-bd) !important;}
._965abe9,._78e0558{background:rgba(77,107,254,.18) !important;box-shadow:0 0 0 2px rgba(77,107,254,.20) !important;border-radius:50vw !important;}

.ds-button--icon,button[class*="icon" i]{background:transparent !important;border-color:transparent !important;color:var(--cbx-tx1) !important;}
.ds-button--icon:hover,button[class*="icon" i]:hover{background:rgba(77,107,254,.14) !important;color:var(--cbx-acc) !important;box-shadow:0 0 12px rgba(77,107,254,.20) !important;}

.md-code-block{background:rgba(13,16,32,.88) !important;border:1px solid rgba(255,255,255,.22) !important;border-radius:12px !important;box-shadow:0 8px 26px rgba(25,35,90,.16) !important;}
.md-code-block-banner,.md-code-block-banner-wrap{background:transparent !important;}
.md-code-block-infostring{color:#aab2c8 !important;font-weight:600 !important;}
.md-code-block code{background:transparent !important;border:none !important;color:#eef0f8 !important;}
.ds-markdown{font-size:15px !important;line-height:1.75 !important;}
.ds-markdown p,.ds-markdown li,.ds-markdown div{color:var(--cbx-tx0) !important;}
.ds-markdown h1,.ds-markdown h2,.ds-markdown h3,.ds-markdown h4{color:var(--cbx-tx0) !important;font-weight:650 !important;}
.ds-markdown li::marker{color:var(--cbx-acc) !important;opacity:.8 !important;}
.ds-markdown code{font-family:var(--cbx-mono) !important;background:rgba(25,30,60,.06) !important;border:1px solid rgba(25,30,60,.12) !important;border-radius:5px !important;color:var(--cbx-acc) !important;padding:1px 5px !important;font-size:.9em !important;}
blockquote{border-left:3px solid var(--cbx-acc) !important;background:rgba(77,107,254,.08) !important;color:var(--cbx-tx1) !important;border-radius:8px !important;}
.ds-markdown table{border-color:var(--glass-bd) !important;background:rgba(255,255,255,.45) !important;border-radius:12px !important;overflow:hidden !important;}
.ds-markdown th,.ds-markdown td{border-color:var(--glass-bd) !important;padding:8px 12px !important;}
.ds-markdown th{background:rgba(255,255,255,.60) !important;}
.ds-markdown tbody tr:nth-of-type(even){background:rgba(77,107,254,.04) !important;}

button:disabled,button[disabled]{opacity:.45 !important;filter:grayscale(.5) !important;cursor:not-allowed !important;}
`;

const THEMES = {
  'standard': THEME_STANDARD,
  'standard-light': THEME_STANDARD_LIGHT,
  'glass': THEME_GLASS,
  'glass-light': THEME_GLASS_LIGHT,
};

/* ================= 设置面板"个性化"区块样式 ================= */
const PERSONAL_CSS = `
#cbx-personal{font-family:var(--cbx-font,"Segoe UI") !important;border-top:1px solid rgba(255,255,255,.08) !important;padding:12px 0 8px !important;}
body.light #cbx-personal{border-top:1px solid rgba(25,30,60,.10) !important;}
.cbx-sec-title{font-size:11.5px !important;letter-spacing:.14em !important;color:var(--cbx-tx2,#7d7d8c) !important;font-weight:700 !important;padding:4px 20px 2px !important;text-transform:uppercase !important;}
.cbx-set-row{display:flex !important;align-items:center !important;justify-content:space-between !important;gap:12px !important;padding:11px 20px !important;}
.cbx-set-row+.cbx-set-row{border-top:1px solid rgba(255,255,255,.05) !important;}
body.light .cbx-set-row+.cbx-set-row{border-top:1px solid rgba(25,30,60,.06) !important;}
.cbx-col{display:flex !important;flex-direction:column !important;gap:3px !important;min-width:0 !important;flex-shrink:1 !important;}
.cbx-set-label{font-size:14px !important;color:var(--cbx-tx0,#f5f5f7) !important;font-weight:500 !important;white-space:nowrap !important;}
.cbx-set-hint{font-size:11.5px !important;color:var(--cbx-tx2,#7d7d8c) !important;max-width:200px !important;line-height:1.45 !important;}
.cbx-skin-options,.cbx-think-options{display:flex !important;gap:6px !important;flex-wrap:wrap !important;justify-content:flex-end !important;flex-shrink:0 !important;}
.cbx-skin-opt,.cbx-think-opt{
  padding:5px 14px !important;border-radius:999px !important;font-size:13px !important;
  border:1px solid rgba(255,255,255,.13) !important;background:rgba(255,255,255,.05) !important;
  color:var(--cbx-tx1,#b0b0bd) !important;cursor:pointer !important;
  transition:all .18s ease !important;font-family:inherit !important;white-space:nowrap !important;
}
body.light .cbx-skin-opt,body.light .cbx-think-opt{border:1px solid rgba(25,30,60,.14) !important;background:rgba(255,255,255,.55) !important;color:var(--cbx-tx1,#5d5d70) !important;}
.cbx-skin-opt:hover,.cbx-think-opt:hover{background:rgba(255,255,255,.10) !important;color:#fff !important;}
body.light .cbx-skin-opt:hover,body.light .cbx-think-opt:hover{background:rgba(77,107,254,.10) !important;color:var(--cbx-acc,#4d6bfe) !important;}
.cbx-skin-opt.cbx-on,.cbx-think-opt.cbx-on{
  background:linear-gradient(135deg,#4d6bfe,#3d5af1) !important;color:#fff !important;
  border-color:transparent !important;box-shadow:0 2px 12px rgba(77,107,254,.42) !important;
}
body.light .cbx-skin-opt.cbx-on,body.light .cbx-think-opt.cbx-on{color:#fff !important;}
.cbx-glass-control{display:flex !important;align-items:center !important;gap:10px !important;flex-shrink:0 !important;}
#cbx-alpha-range{
  -webkit-appearance:none !important;appearance:none !important;width:130px !important;height:4px !important;
  border-radius:999px !important;outline:none !important;cursor:pointer !important;
  background:linear-gradient(90deg,#4d6bfe,#8aa0ff) !important;
}
#cbx-alpha-range::-webkit-slider-thumb{
  -webkit-appearance:none !important;appearance:none !important;width:16px !important;height:16px !important;
  border-radius:50% !important;background:#fff !important;border:2px solid #4d6bfe !important;
  box-shadow:0 2px 8px rgba(77,107,254,.45) !important;cursor:grab !important;
}
#cbx-alpha-val{font-size:12.5px !important;color:var(--cbx-tx1,#b0b0bd) !important;font-variant-numeric:tabular-nums !important;min-width:38px !important;text-align:right !important;}
`;

/* ================= 浅色模式检测（DeepSeek 原生 body.light） ================= */
function nativeIsLight() {
  try { return document.body.classList.contains('light'); } catch (e) { return false; }
}

function syncTitlebar() {
  try {
    window.codexShell.setTitlebar(nativeIsLight() ? 'light' : 'dark');
  } catch (e) {}
}

/* ================= 液态玻璃调节 ================= */
function getGlassFlow() {
  try { return localStorage.getItem(FLOW_KEY) === 'off' ? 'off' : 'on'; } catch (e) { return 'on'; }
}
function getGlassSpeed() {
  try {
    const s = localStorage.getItem(SPEED_KEY);
    return s === 'slow' || s === 'fast' ? s : 'medium';
  } catch (e) { return 'medium'; }
}
function getGlassAlpha() {
  try {
    const a = parseInt(localStorage.getItem(ALPHA_KEY), 10);
    return isNaN(a) ? 50 : Math.max(0, Math.min(100, a));
  } catch (e) { return 50; }
}

function applyGlassSettings() {
  const flow = getGlassFlow();
  const speed = getGlassSpeed();
  const alpha = getGlassAlpha();
  const de = document.documentElement;
  const dur = flow === 'off' ? '0s' : { slow: '90s', medium: '55s', fast: '26s' }[speed] || '55s';
  de.style.setProperty('--cbx-flow-dur', dur);
  document.body.classList.toggle('cbx-flow-off', flow === 'off');
  const light = nativeIsLight();
  const a = light ? Math.min(.66, .26 + alpha / 100 * .40) : Math.min(.18, .02 + alpha / 100 * .14);
  de.style.setProperty('--glass-alpha', String(a));
  de.style.setProperty('--glass-alpha2', String(light ? Math.min(.80, a * 1.12) : Math.min(.30, a * 1.6)));
  syncGlassRows();
}

function syncGlassRows() {
  const flow = getGlassFlow();
  const speed = getGlassSpeed();
  const alpha = getGlassAlpha();
  const p = document.getElementById(PERSONAL_ID);
  if (!p) return;
  p.querySelectorAll('[data-flow]').forEach(b => b.classList.toggle('cbx-on', b.dataset.flow === flow));
  p.querySelectorAll('[data-speed]').forEach(b => b.classList.toggle('cbx-on', b.dataset.speed === speed));
  const range = document.getElementById('cbx-alpha-range');
  const val = document.getElementById('cbx-alpha-val');
  if (range && Math.abs(parseInt(range.value, 10) - alpha) > 0) range.value = String(alpha);
  if (val) val.textContent = alpha + '%';
}

/* ================= 思考展示模式 ================= */
function getThinkMode() {
  try {
    const t = localStorage.getItem(THINK_KEY);
    return t === 'steps' || t === 'hidden' ? t : 'full';
  } catch (e) { return 'full'; }
}

function applyThinkMode() {
  const m = getThinkMode();
  const root = document.documentElement;
  root.classList.remove('cbx-think-mode-full', 'cbx-think-mode-steps', 'cbx-think-mode-hidden');
  root.classList.add('cbx-think-mode-' + m);
  syncThinkRow();
}

function syncThinkRow() {
  const m = getThinkMode();
  const p = document.getElementById(PERSONAL_ID);
  if (!p) return;
  p.querySelectorAll('.cbx-think-opt').forEach(b => b.classList.toggle('cbx-on', b.dataset.mode === m));
}

function setupThinkMode() {
  applyThinkMode();
  const mark = () => {
    document.querySelectorAll('.ds-think-content').forEach(c => {
      let w = c.parentElement, n = 0;
      while (w && n < 3 && !w.classList.contains('cbx-think')) {
        if (w.classList.contains('ds-collapsible-text')) break;
        w = w.parentElement; n += 1;
      }
      if (w && !w.classList.contains('cbx-think')) w.classList.add('cbx-think');
    });
    document.querySelectorAll('.cbx-think').forEach(w => {
      w.querySelectorAll('[class]').forEach(el => {
        if (el.classList.contains('cbx-think-label')) return;
        const t = (el.textContent || '').trim();
        if (/^已思考/.test(t) && t.length <= 16 && el.children.length <= 2) el.classList.add('cbx-think-label');
      });
    });
  };
  mark();
  try {
    new MutationObserver(() => { try { mark(); } catch (e) {} }).observe(document.body, { childList: true, subtree: true });
  } catch (e) {}
  document.addEventListener('click', (e) => {
    const hit = e.target.closest('.cbx-think');
    if (!hit) return;
    const cls = e.target.classList;
    if (!cls || (!cls.contains('cbx-think-label') && !cls.contains('ds-think-content'))) return;
    hit.classList.add('cbx-think-open');
  });
}

/* ================= 主题应用 ================= */
function getSavedTheme() {
  try { return localStorage.getItem(STORAGE_KEY) === 'glass' ? 'glass' : 'standard'; } catch (e) { return 'standard'; }
}

function effectiveThemeName() {
  return nativeIsLight() ? getSavedTheme() + '-light' : getSavedTheme();
}

function syncSkinRow() {
  const t = getSavedTheme();
  const p = document.getElementById(PERSONAL_ID);
  if (!p) return;
  p.querySelectorAll('[data-theme]').forEach(b => b.classList.toggle('cbx-on', b.dataset.theme === t));
}

function applyTheme(name) {
  const pref = THEMES[name] ? name : 'standard';
  const eff = nativeIsLight() ? pref + '-light' : pref;
  let s = document.getElementById(STYLE_ID);
  if (!s) {
    s = document.createElement('style');
    s.id = STYLE_ID;
    (document.head || document.documentElement).appendChild(s);
  }
  s.textContent = THEMES[eff];
  try { localStorage.setItem(STORAGE_KEY, pref); } catch (e) {}
  syncSkinRow();
  applyThinkMode();
  applyGlassSettings();
  syncTitlebar();
}

/* ================= 设置面板注入（个性化区块） ================= */
function setupSettingsInjection() {
  const scan = () => {
    if (document.getElementById(PERSONAL_ID)) return true;
    const cands = [...document.querySelectorAll('[class]')].filter(el => {
      const t = el.textContent || '';
      const r = el.getBoundingClientRect();
      return t.includes('通用设置') && t.includes('服务协议') && r.width > 320 && r.width < 950 && r.height > 150;
    });
    if (!cands.length) return false;
    const panel = cands.reduce((a, b) => a.getBoundingClientRect().width <= b.getBoundingClientRect().width ? a : b);
    const langRow = [...panel.querySelectorAll('[class]')].filter(el => {
      const t = (el.textContent || '').trim();
      const r = el.getBoundingClientRect();
      return t.includes('语言') && !t.includes('服务协议') && r.width > 250 && r.width < 820 && r.height > 20 && r.height < 130;
    }).sort((a, b) => b.getBoundingClientRect().width - a.getBoundingClientRect().width)[0];
    const target = langRow || panel;
    if (!document.getElementById('cbx-personal-css')) {
      const st = document.createElement('style');
      st.id = 'cbx-personal-css';
      st.textContent = PERSONAL_CSS;
      (document.head || document.documentElement).appendChild(st);
    }
    const block = document.createElement('div');
    block.id = PERSONAL_ID;
    block.innerHTML =
      '<div class="cbx-sec-title">个性化</div>' +
      '<div id="cbx-skin-row" class="cbx-set-row">' +
      '  <div class="cbx-col"><div class="cbx-set-label">外观风格</div><div class="cbx-set-hint">液态玻璃为毛玻璃质感，颜色跟随深浅色</div></div>' +
      '  <div class="cbx-skin-options">' +
      '    <button class="cbx-skin-opt" data-theme="standard">标准</button>' +
      '    <button class="cbx-skin-opt" data-theme="glass">液态玻璃</button>' +
      '  </div>' +
      '</div>' +
      '<div id="cbx-glass-row" class="cbx-set-row">' +
      '  <div class="cbx-col"><div class="cbx-set-label">玻璃透明度</div><div class="cbx-set-hint">越高越透出背景光晕</div></div>' +
      '  <div class="cbx-glass-control">' +
      '    <input type="range" id="cbx-alpha-range" min="0" max="100" value="50">' +
      '    <span id="cbx-alpha-val">50%</span>' +
      '  </div>' +
      '</div>' +
      '<div id="cbx-flow-row" class="cbx-set-row">' +
      '  <div class="cbx-col"><div class="cbx-set-label">流动效果</div><div class="cbx-set-hint">背景光晕极慢流动，不干扰阅读</div></div>' +
      '  <div class="cbx-skin-options">' +
      '    <button class="cbx-skin-opt" data-flow="on">开</button>' +
      '    <button class="cbx-skin-opt" data-flow="off">关</button>' +
      '  </div>' +
      '</div>' +
      '<div id="cbx-speed-row" class="cbx-set-row">' +
      '  <div class="cbx-col"><div class="cbx-set-label">流动速度</div><div class="cbx-set-hint">慢为 90 秒一个循环，几乎不可察觉</div></div>' +
      '  <div class="cbx-skin-options">' +
      '    <button class="cbx-skin-opt" data-speed="slow">慢</button>' +
      '    <button class="cbx-skin-opt" data-speed="medium">中</button>' +
      '    <button class="cbx-skin-opt" data-speed="fast">快</button>' +
      '  </div>' +
      '</div>' +
      '<div id="cbx-think-row" class="cbx-set-row">' +
      '  <div class="cbx-col"><div class="cbx-set-label">思考展示</div><div class="cbx-set-hint">仅提示只显示思考徽章，点击可展开</div></div>' +
      '  <div class="cbx-think-options">' +
      '    <button class="cbx-think-opt" data-mode="full">完整</button>' +
      '    <button class="cbx-think-opt" data-mode="steps">关键步骤</button>' +
      '    <button class="cbx-think-opt" data-mode="hidden">仅提示</button>' +
      '  </div>' +
      '</div>';
    block.addEventListener('click', (e) => {
      const btn = e.target.closest('.cbx-skin-opt, .cbx-think-opt');
      if (!btn) return;
      e.stopPropagation();
      if (btn.dataset.theme) {
        applyTheme(btn.dataset.theme);
      } else if (btn.dataset.flow) {
        try { localStorage.setItem(FLOW_KEY, btn.dataset.flow); } catch (err) {}
        applyGlassSettings();
      } else if (btn.dataset.speed) {
        try { localStorage.setItem(SPEED_KEY, btn.dataset.speed); } catch (err) {}
        applyGlassSettings();
      } else if (btn.dataset.mode) {
        try { localStorage.setItem(THINK_KEY, btn.dataset.mode); } catch (err) {}
        applyThinkMode();
      }
    });
    const range = block.querySelector('#cbx-alpha-range');
    if (range) {
      range.addEventListener('input', () => {
        try { localStorage.setItem(ALPHA_KEY, range.value); } catch (err) {}
        applyGlassSettings();
        e.stopPropagation();
      });
      range.addEventListener('change', (e) => e.stopPropagation());
    }
    if (langRow && langRow.parentElement) {
      langRow.parentElement.insertBefore(block, langRow.nextSibling);
    } else {
      target.appendChild(block);
    }
    syncSkinRow();
    syncThinkRow();
    syncGlassRows();
    return true;
  };
  try {
    const obs = new MutationObserver(() => { try { scan(); } catch (e) {} });
    obs.observe(document.documentElement, { childList: true, subtree: true });
  } catch (e) {}
  const iv = setInterval(() => { try { if (scan()) clearInterval(iv); } catch (e) {} }, 2500);
  setTimeout(scan, 2000);
}

/* ================= 顶部拖拽条 ================= */
function setupTopbar() {
  const mark = 'cbx-topbar-scanned';
  if (document.getElementById(mark)) return;
  const m = document.createElement('meta');
  m.id = mark;
  document.documentElement.appendChild(m);

  const tag = (el) => {
    if (el.classList.contains('cbx-topbar')) return;
    el.classList.add('cbx-topbar');
    if (!el.dataset.cbxPadded) {
      el.style.paddingRight = '140px';
      el.dataset.cbxPadded = '1';
    }
  };
  const scan = () => {
    const wide = [...document.querySelectorAll('div,header,nav')]
      .filter(el => {
        const r = el.getBoundingClientRect();
        return r.top <= 1 && r.height >= 40 && r.height <= 90 && r.width > 500;
      })
      .sort((a, b) => {
        const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
        return (ra.width * ra.height) - (rb.width * rb.height);
      });
    if (wide.length) tag(wide[0]);
    const narrow = [...document.querySelectorAll('div,header,nav')]
      .filter(el => {
        const r = el.getBoundingClientRect();
        return r.top <= 16 && r.height >= 32 && r.height <= 80 && r.width >= 150 && r.width <= 460 && r.x <= 300;
      })
      .sort((a, b) => {
        const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
        return (ra.width * ra.height) - (rb.width * rb.height);
      });
    if (narrow.length) tag(narrow[0]);
  };
  let n = 0;
  const iv = setInterval(() => { try { scan(); } catch (e) {} if (++n > 40) clearInterval(iv); }, 1000);
}

/* ================= Token 用量统计 ================= */
const TK_STYLE_ID = 'cbx-tokens-css';
const TK_NAV_ID = 'cbx-token-nav';
const TK_PANE_ID = 'cbx-token-pane';
const TK_OVR_ID = 'cbx-token-overlay';

const TK_ICON = '<div class="ds-icon"><svg viewBox="0 0 16 16" width="16" height="16" fill="none"><rect x="2" y="8.5" width="3" height="5.5" rx="1" fill="currentColor"/><rect x="6.5" y="5" width="3" height="9" rx="1" fill="currentColor"/><rect x="11" y="2" width="3" height="12" rx="1" fill="currentColor"/></svg></div>';

const TK_CSS = `
#${TK_PANE_ID}{flex:1 1 auto;min-width:0;height:100%;overflow-y:auto;overflow-x:hidden;padding:2px 4px 26px 8px;font-family:var(--cbx-font,"Segoe UI"),sans-serif;}
.cbx-tk-head{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;padding:6px 14px 12px;}
.cbx-tk-title{font-size:15px;font-weight:700;color:var(--cbx-tx0,#f5f5f7);letter-spacing:.02em;display:flex;align-items:baseline;gap:8px;}
.cbx-tk-title small{font-size:11px;font-weight:500;color:var(--cbx-tx2,#7d7d8c);letter-spacing:.05em;}
.cbx-tk-tools{display:flex;gap:6px;flex-wrap:wrap;align-items:center;}
.cbx-tk-btn{padding:5px 12px;border-radius:8px;font-size:12.5px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.06);color:var(--cbx-tx1,#b0b0bd);cursor:pointer;font-family:inherit;transition:all .15s ease;white-space:nowrap;line-height:1.5;}
body.light .cbx-tk-btn{border-color:rgba(25,30,60,.14);background:rgba(255,255,255,.72);color:var(--cbx-tx1,#5d5d70);}
.cbx-tk-btn:hover{background:rgba(77,107,254,.16)!important;color:#fff!important;border-color:rgba(77,107,254,.5)!important;}
.cbx-tk-btn.cbx-on{background:linear-gradient(135deg,#4d6bfe,#3d5af1)!important;color:#fff!important;border-color:transparent!important;box-shadow:0 2px 10px rgba(77,107,254,.35);}
.cbx-tk-btn.danger{color:#ff9b9b!important;border-color:rgba(255,110,110,.35)!important;}
body.light .cbx-tk-btn.danger{color:#d64545!important;}
.cbx-tk-cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;padding:0 14px 12px;}
.cbx-tk-card{position:relative;border:1px solid rgba(255,255,255,.10);background:linear-gradient(160deg,rgba(255,255,255,.07),rgba(255,255,255,.02));border-radius:14px;padding:12px 14px 13px;overflow:hidden;}
body.light .cbx-tk-card{border-color:rgba(25,30,60,.10);background:linear-gradient(160deg,rgba(77,107,254,.06),rgba(255,255,255,.92));}
.cbx-tk-card .k{font-size:10.5px;letter-spacing:.12em;color:var(--cbx-tx2,#7d7d8c);text-transform:uppercase;}
.cbx-tk-card .v{margin-top:7px;font-size:22px;font-weight:700;letter-spacing:-.01em;color:var(--cbx-tx0,#f5f5f7);font-variant-numeric:tabular-nums;line-height:1.15;}
.cbx-tk-card .v i{font-style:normal;font-size:12px;font-weight:600;color:var(--cbx-tx2,#7d7d8c);margin-left:4px;}
.cbx-tk-card .s{margin-top:6px;font-size:11.5px;color:var(--cbx-tx2,#7d7d8c);font-variant-numeric:tabular-nums;line-height:1.5;}
.cbx-tk-bar{display:flex;height:5px;border-radius:99px;overflow:hidden;margin-top:9px;background:rgba(255,255,255,.09);}
body.light .cbx-tk-bar{background:rgba(25,30,60,.08);}
.cbx-tk-bar span{display:block;height:100%;}
.cbx-tk-bar .b1{background:#4d6bfe;}
.cbx-tk-bar .b2{background:#8aa0ff;}
.cbx-tk-bar .b3{background:#39c6c0;}
.cbx-tk-panel{margin:0 14px 12px;border:1px solid rgba(255,255,255,.09);border-radius:14px;background:rgba(255,255,255,.035);padding:12px 14px 12px;}
body.light .cbx-tk-panel{border-color:rgba(25,30,60,.10);background:rgba(255,255,255,.78);}
.cbx-tk-panel-t{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px;flex-wrap:wrap;}
.cbx-tk-panel-t b{color:var(--cbx-tx0,#f5f5f7);font-weight:600;font-size:13px;}
.cbx-tk-panel-t span{font-size:11.5px;color:var(--cbx-tx2,#7d7d8c);}
.cbx-tk-legend{display:flex;gap:12px;font-size:11.5px;color:var(--cbx-tx2,#7d7d8c);align-items:center;flex-wrap:wrap;}
.cbx-tk-legend i{display:inline-block;width:8px;height:8px;border-radius:2px;margin-right:5px;vertical-align:middle;}
.cbx-tk-chart{display:flex;align-items:flex-end;gap:4px;box-sizing:border-box;height:176px;padding:6px 0 22px;overflow-x:auto;overflow-y:hidden;}
.cbx-tk-col{flex:1 1 0;min-width:9px;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;position:relative;}
.cbx-tk-col .stack{width:100%;max-width:32px;display:flex;flex-direction:column;justify-content:flex-end;border-radius:5px 5px 3px 3px;overflow:hidden;background:rgba(255,255,255,.06);transition:filter .15s ease;min-height:2px;}
body.light .cbx-tk-col .stack{background:rgba(25,30,60,.06);}
.cbx-tk-col:hover .stack{filter:brightness(1.4);}
.cbx-tk-col .stack i{display:block;width:100%;}
.cbx-tk-col .lb{position:absolute;bottom:-19px;font-size:10px;color:var(--cbx-tx2,#7d7d8c);white-space:nowrap;font-variant-numeric:tabular-nums;}
.cbx-tk-col .tip{display:none;}
.cbx-tk-tip{position:fixed;transform:translate(-50%,-100%);background:#12131a;border:1px solid rgba(255,255,255,.16);color:#eceff8;font-size:11px;line-height:1.65;padding:7px 10px;border-radius:8px;white-space:nowrap;z-index:10050;box-shadow:0 8px 24px rgba(0,0,0,.5);pointer-events:none;font-variant-numeric:tabular-nums;display:none;}
.cbx-tk-tip.below{transform:translate(-50%,0);}
body.light .cbx-tk-tip{background:#fff;color:#26263a;border-color:rgba(25,30,60,.16);}
.cbx-tk-tablewrap{max-height:232px;overflow:auto;margin:0 14px 12px;border:1px solid rgba(255,255,255,.09);border-radius:14px;}
body.light .cbx-tk-tablewrap{border-color:rgba(25,30,60,.10);}
.cbx-tk-table{width:100%;border-collapse:collapse;font-size:12px;font-variant-numeric:tabular-nums;}
.cbx-tk-table th{position:sticky;top:0;background:rgba(18,19,27,.97);color:var(--cbx-tx2,#8b8b9c);font-weight:600;text-align:right;padding:8px 10px;letter-spacing:.05em;font-size:11px;z-index:2;}
body.light .cbx-tk-table th{background:rgba(248,249,252,.98);}
.cbx-tk-table td{text-align:right;padding:7px 10px;color:var(--cbx-tx1,#b0b0bd);border-top:1px solid rgba(255,255,255,.06);}
body.light .cbx-tk-table td{border-top-color:rgba(25,30,60,.07);}
.cbx-tk-table th:first-child,.cbx-tk-table td:first-child{text-align:left;color:var(--cbx-tx0,#f5f5f7);}
.cbx-tk-table tr:hover td{background:rgba(77,107,254,.08);}
.cbx-tk-foot{margin:0 14px;border:1px dashed rgba(255,255,255,.13);border-radius:14px;padding:12px 14px;}
body.light .cbx-tk-foot{border-color:rgba(25,30,60,.14);}
.cbx-tk-note{font-size:11.5px;line-height:1.8;color:var(--cbx-tx2,#7d7d8c);}
.cbx-tk-note b{color:var(--cbx-tx1,#b0b0bd);font-weight:600;}
.cbx-tk-calib{display:flex;align-items:center;gap:10px;margin-top:10px;flex-wrap:wrap;}
.cbx-tk-calib label{font-size:12.5px;color:var(--cbx-tx1,#b0b0bd);}
.cbx-tk-calib input[type=range]{-webkit-appearance:none;appearance:none;width:150px;height:4px;border-radius:99px;background:linear-gradient(90deg,#4d6bfe,#8aa0ff);outline:none;cursor:pointer;}
.cbx-tk-calib input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:15px;height:15px;border-radius:50%;background:#fff;border:2px solid #4d6bfe;box-shadow:0 2px 8px rgba(77,107,254,.45);cursor:grab;}
.cbx-tk-calib .val{font-size:12.5px;color:var(--cbx-acc,#7b95ff);font-variant-numeric:tabular-nums;min-width:48px;}
.cbx-tk-empty{margin:0 14px;padding:40px 16px;text-align:center;border:1px dashed rgba(255,255,255,.13);border-radius:14px;color:var(--cbx-tx2,#7d7d8c);font-size:12.5px;line-height:2;}
body.light .cbx-tk-empty{border-color:rgba(25,30,60,.14);}
.cbx-tk-empty b{display:block;color:var(--cbx-tx0,#f5f5f7);font-size:15px;margin-bottom:6px;}
.cbx-tk-sep{display:flex;align-items:center;gap:10px;margin:2px 14px 10px;font-size:10.5px;letter-spacing:.14em;color:var(--cbx-tx2,#7d7d8c);text-transform:uppercase;}
.cbx-tk-sep::after{content:"";flex:1;height:1px;background:rgba(255,255,255,.09);}
body.light .cbx-tk-sep::after{background:rgba(25,30,60,.10);}
#${TK_OVR_ID}{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(6,7,14,.6);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);}
.cbx-tk-modal{width:min(1080px,94vw);height:min(780px,92vh);display:flex;flex-direction:column;border-radius:18px;border:1px solid rgba(255,255,255,.14);background:linear-gradient(160deg,rgba(20,22,34,.97),rgba(11,12,19,.98));box-shadow:0 30px 90px rgba(0,0,0,.6);overflow:hidden;}
body.light .cbx-tk-modal{background:linear-gradient(160deg,rgba(255,255,255,.98),rgba(240,242,249,.98));border-color:rgba(25,30,60,.12);}
.cbx-tk-modal .cbx-tk-body{flex:1;overflow:auto;padding-bottom:26px;}
.cbx-tk-modal .cbx-tk-cards{grid-template-columns:repeat(4,minmax(0,1fr));}
.cbx-tk-modal .cbx-tk-chart{height:220px;padding-bottom:20px;}
.cbx-tk-pills{display:flex;gap:6px;align-items:center;flex-wrap:wrap;}
.cbx-tk-pills .pill{font-size:10.5px;font-weight:600;letter-spacing:.04em;padding:3px 9px;border-radius:99px;color:var(--cbx-tx1,#b0b0bd);border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.05);white-space:nowrap;}
body.light .cbx-tk-pills .pill{border-color:rgba(25,30,60,.14);background:rgba(255,255,255,.75);color:var(--cbx-tx1,#5d5d70);}
.cbx-tk-pills .pill.muted{opacity:.7;}
.cbx-tk-gap{width:6px;}
.cbx-tk-btn.mini{padding:3px 10px;font-size:11.5px;border-radius:7px;}
.cbx-tk-btn[disabled]{opacity:.55;cursor:default;pointer-events:none;}
.cbx-tk-sync{display:flex;align-items:center;gap:10px;margin:0 14px 12px;padding:9px 13px;border-radius:12px;border:1px solid rgba(77,107,254,.28);background:linear-gradient(90deg,rgba(77,107,254,.14),rgba(77,107,254,.05));font-size:12px;color:var(--cbx-tx1,#b0b0bd);flex-wrap:wrap;}
body.light .cbx-tk-sync{border-color:rgba(77,107,254,.25);background:linear-gradient(90deg,rgba(77,107,254,.10),rgba(77,107,254,.03));color:var(--cbx-tx1,#5d5d70);}
.cbx-tk-sync.ok{border-color:rgba(46,204,113,.30);background:linear-gradient(90deg,rgba(46,204,113,.13),rgba(46,204,113,.04));}
.cbx-tk-sync .txt b{color:var(--cbx-tx0,#f5f5f7);font-variant-numeric:tabular-nums;}
.cbx-tk-sync .txt i{font-style:normal;color:#ff9b9b;}
.cbx-tk-sync .dot{width:7px;height:7px;border-radius:50%;background:#8aa0ff;box-shadow:0 0 0 3px rgba(138,160,255,.18);flex:none;}
.cbx-tk-sync .dot.ok{background:#2ecc71;box-shadow:0 0 0 3px rgba(46,204,113,.18);}
.cbx-tk-sync .bar{flex:1 1 120px;min-width:90px;height:5px;border-radius:99px;background:rgba(255,255,255,.14);overflow:hidden;}
body.light .cbx-tk-sync .bar{background:rgba(25,30,60,.12);}
.cbx-tk-sync .bar i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#4d6bfe,#8aa0ff);transition:width .35s ease;}
.cbx-tk-sync .sp{flex:1;}
.cbx-tk-stat{display:flex;gap:16px;flex-wrap:wrap;margin-top:14px;padding-top:11px;border-top:1px solid rgba(255,255,255,.07);font-size:11.5px;color:var(--cbx-tx2,#7d7d8c);font-variant-numeric:tabular-nums;}
body.light .cbx-tk-stat{border-top-color:rgba(25,30,60,.08);}
.cbx-tk-stat b{color:var(--cbx-tx0,#f5f5f7);font-weight:700;}
.cbx-tk-grid2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;padding:0 14px 12px;}
.cbx-tk-grid2 .cbx-tk-panel{margin:0;}
.cbx-tk-share{display:flex;height:8px;border-radius:99px;overflow:hidden;background:rgba(255,255,255,.09);margin:2px 0 12px;}
body.light .cbx-tk-share{background:rgba(25,30,60,.08);}
.cbx-tk-share i{display:block;height:100%;}
.cbx-tk-share .ex{background:linear-gradient(90deg,#2ecc71,#4d6bfe);}
.cbx-tk-share .es{background:rgba(255,255,255,.16);}
body.light .cbx-tk-share .es{background:rgba(25,30,60,.14);}
.cbx-tk-rows{display:flex;flex-direction:column;gap:7px;}
.cbx-tk-rows .row{display:flex;align-items:center;gap:9px;font-size:12px;color:var(--cbx-tx1,#b0b0bd);}
.cbx-tk-rows .k{width:9px;height:9px;border-radius:3px;flex:none;}
.cbx-tk-rows .k.ex{background:linear-gradient(135deg,#2ecc71,#4d6bfe);}
.cbx-tk-rows .k.es{background:rgba(255,255,255,.28);}
body.light .cbx-tk-rows .k.es{background:rgba(25,30,60,.24);}
.cbx-tk-rows .k.ap{background:#39c6c0;}
.cbx-tk-rows .n{flex:1;}
.cbx-tk-rows .v{font-variant-numeric:tabular-nums;color:var(--cbx-tx0,#f5f5f7);font-weight:600;}
.cbx-tk-rows .c{font-size:11px;color:var(--cbx-tx2,#7d7d8c);min-width:46px;text-align:right;font-variant-numeric:tabular-nums;}
.cbx-tk-table td.hi{color:var(--cbx-tx0,#f5f5f7);font-weight:600;}
.cbx-tk-empty .cbx-tk-btn{margin-top:6px;}
.cbx-tk-head{padding-bottom:14px;}
.cbx-tk-cards{gap:12px;padding-bottom:14px;}
.cbx-tk-card{border-radius:16px;padding:13px 15px 14px;}
.cbx-tk-panel{border-radius:16px;padding:13px 15px 14px;margin-bottom:14px;}
@media (max-width:900px){.cbx-tk-cards{grid-template-columns:repeat(2,1fr);}.cbx-tk-grid2{grid-template-columns:1fr;}}
`;

function tkIsCJK(cp) {
  return (cp >= 0x4e00 && cp <= 0x9fff) || (cp >= 0x3400 && cp <= 0x4dbf) || (cp >= 0xf900 && cp <= 0xfaff) ||
    (cp >= 0x3040 && cp <= 0x30ff) || (cp >= 0xac00 && cp <= 0xd7af) || (cp >= 0x20000 && cp <= 0x2fa1f) ||
    (cp >= 0x3000 && cp <= 0x303f);
}
function tkIsLatin(cp) {
  return (cp >= 0x41 && cp <= 0x5a) || (cp >= 0x61 && cp <= 0x7a) || (cp >= 0xc0 && cp <= 0x24f);
}
function tkIsDigit(cp) { return cp >= 0x30 && cp <= 0x39; }

function tkEstimate(text) {
  if (!text) return 0;
  let t = 0;
  let i = 0;
  const n = text.length;
  while (i < n) {
    const cp = text.codePointAt(i);
    const w = cp > 0xffff ? 2 : 1;
    if (tkIsCJK(cp)) {
      let j = i;
      while (j < n) {
        const c = text.codePointAt(j);
        if (!tkIsCJK(c)) break;
        j += c > 0xffff ? 2 : 1;
      }
      t += Math.max(1, Math.round((j - i) / 1.5));
      i = j;
      continue;
    }
    if (tkIsLatin(cp)) {
      let j = i;
      while (j < n) {
        const c = text.codePointAt(j);
        if (!tkIsLatin(c) && !tkIsDigit(c) && c !== 0x5f && c !== 0x2d) break;
        j++;
      }
      t += Math.max(1, Math.ceil((j - i) / 4));
      i = j;
      continue;
    }
    if (tkIsDigit(cp)) {
      let j = i;
      while (j < n && tkIsDigit(text.codePointAt(j))) j++;
      t += Math.max(1, Math.ceil((j - i) / 3));
      i = j;
      continue;
    }
    if (cp === 0x20 || cp === 0x09 || (cp >= 0x0a && cp <= 0x0d)) {
      let j = i;
      while (j < n) {
        const c = text.charCodeAt(j);
        if (c === 9 || c === 10 || c === 13 || c === 32) j++;
        else break;
      }
      t += Math.ceil((j - i) / 10);
      i = j;
      continue;
    }
    let j = i;
    while (j < n) {
      const c = text.codePointAt(j);
      if (tkIsCJK(c) || tkIsLatin(c) || tkIsDigit(c) || c === 32 || c === 9 || (c >= 10 && c <= 13)) break;
      j += c > 0xffff ? 2 : 1;
    }
    t += Math.max(1, Math.ceil((j - i) / 2));
    i = j;
  }
  return t;
}

function tkCleanText(el, dropSel) {
  if (!el) return '';
  const c = el.cloneNode(true);
  const drop = 'button,svg,script,style,textarea,input,[class*="button"],[class*="avatar"],[class*="toolbar"],[class*="action"],[class*="time"],[class*="footer"],[class*="copy"],[class*="retry"],[class*="regenerate"],[class*="focus-ring"]';
  try { c.querySelectorAll(drop).forEach(n => n.remove()); } catch (e) {}
  if (dropSel) { try { c.querySelectorAll(dropSel).forEach(n => n.remove()); } catch (e) {} }
  return (c.textContent || '').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
}

function tkHash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36) + str.length.toString(36);
}

const tkStore = {
  data: null,
  seen: null,
  loaded: false,
  queue: [],
  saveTimer: null,
  onChange: null,
  init() {
    this.data = { version: 1, meta: { calib: 1, created: Date.now() }, events: [] };
    this.seen = new Set();
    this.loaded = false;
    this.loadFromDisk();
  },
  async loadFromDisk() {
    let disk = null;
    try {
      disk = await ipcRenderer.invoke('cbx-tokens-load');
    } catch (e) {}
    if (disk && Array.isArray(disk.events)) {
      this.data = { version: 1, meta: Object.assign({ calib: 1, created: Date.now() }, disk.meta || {}), events: disk.events };
    }
    if (!this.data.meta || typeof this.data.meta.calib !== 'number') {
      this.data.meta = Object.assign({ calib: 1, created: Date.now() }, this.data.meta || {});
      this.data.meta.calib = 1;
    }
    this.rebuildSeen();
    this.prune();
    this.loaded = true;
    const q = this.queue;
    this.queue = [];
    q.forEach(ev => this.add(ev));
    if (this.onChange) this.onChange();
  },
  rebuildSeen() {
    this.seen = new Set(this.data.events.map(e => e.h).filter(Boolean));
  },
  prune() {
    const cut = Date.now() - 1500 * 86400000;
    const before = this.data.events.length;
    this.data.events = this.data.events.filter(e => e.t >= cut);
    if (this.data.events.length > 60000) this.data.events = this.data.events.slice(-60000);
    if (this.data.events.length !== before) this.rebuildSeen();
  },
  add(ev) {
    if (!this.loaded) { this.queue.push(ev); return; }
    if (ev.h && this.seen.has(ev.h)) return;
    this.data.events.push(ev);
    if (ev.h) this.seen.add(ev.h);
    if (this.data.events.length > 62000) this.prune();
    this.scheduleSave();
    if (this.onChange) this.onChange();
  },
  setCalib(v) {
    if (!this.data || !this.loaded) return;
    this.data.meta.calib = v;
    this.scheduleSave();
    if (this.onChange) this.onChange();
  },
  clear() {
    if (!this.data || !this.loaded) return;
    this.data.events = [];
    this.data.meta.sessions = {};
    this.seen = new Set();
    this.queue = [];
    try { tkHist.lastIngest = {}; tkCollector.covered = {}; } catch (e) {}
    this.scheduleSave();
    if (this.onChange) this.onChange();
  },
  scheduleSave() {
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => this.flush(), 1200);
  },
  flush() {
    clearTimeout(this.saveTimer);
    if (!this.data) return Promise.resolve();
    try { return ipcRenderer.invoke('cbx-tokens-save', this.data); } catch (e) { return Promise.resolve(); }
  }
};

const tkUsage = { last: null };

function tkInstallUsageHook() {
  const src = `(function(){
  if (window.__cbxUsageHooked) return 'dup';
  window.__cbxUsageHooked = 1;
  function report(obj){
    try {
      var j = (typeof obj === 'string') ? obj : JSON.stringify(obj);
      if (window.codexUsage && window.codexUsage.report) { window.codexUsage.report(j); return true; }
    } catch(e){}
    return false;
  }
  function emit(p){ report(p); }
  function compactHist(text){
    try {
      var j = JSON.parse(text);
      var bd = j && j.data && j.data.biz_data;
      if (!bd) return null;
      var sess = bd.chat_session || {};
      var list = bd.chat_messages || [];
      var out = [];
      for (var i = 0; i < list.length; i++) {
        var m = list[i] || {};
        var fr = m.fragments || [];
        var tc = 0, mc = 0;
        for (var k = 0; k < fr.length; k++) {
          var f = fr[k] || {};
          var c = (typeof f.content === 'string') ? f.content : '';
          if (!c) continue;
          if (f.type === 'THINK') tc += c.length;
          else if (f.type === 'REQUEST' || f.type === 'RESPONSE' || f.type === 'TEXT' || f.type === 'MESSAGE') mc += c.length;
        }
        out.push({ id: m.message_id | 0, role: m.role || '', at: Math.round((m.inserted_at || 0) * 1000), atu: (+m.accumulated_token_usage) || 0, tc: tc, mc: mc });
      }
      return { type: 'hist', sid: sess.id || '', title: sess.title || '', sat: Math.round((sess.inserted_at || 0) * 1000), sup: Math.round((sess.updated_at || 0) * 1000), cur: (bd.current_message_id | 0), cache: bd.cache_control || '', msgs: out };
    } catch (e) { return null; }
  }
  function scan(text, url){
    if (!text || text.length > 4000000) return;
    if (text.indexOf('prompt_tokens') < 0 && text.indexOf('completion_tokens') < 0 && text.indexOf('"usage"') < 0) return;
    var p = 0, c = 0, found = false, m;
    var re1 = /"prompt_tokens"\\s*:\\s*(\\d+)/g;
    while ((m = re1.exec(text))) { p = Math.max(p, +m[1]); found = true; }
    var re2 = /"completion_tokens"\\s*:\\s*(\\d+)/g;
    while ((m = re2.exec(text))) { c = Math.max(c, +m[1]); found = true; }
    if (found) emit({ p: p, c: c, t: Date.now(), u: String(url || '').slice(0, 140) });
  }
  try {
    var orig = window.fetch;
    if (orig) {
      window.fetch = function(){
        var args = arguments;
        var url = '';
        try { url = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url) || ''; } catch(e) {}
        var res = orig.apply(this, args);
        try {
          if (url.indexOf('/api/') >= 0 || url.indexOf('chat') >= 0 || url.indexOf('completion') >= 0) {
            Promise.resolve(res).then(function(r){
              try {
                var ct = (r && r.headers && r.headers.get) ? (r.headers.get('content-type') || '') : '';
                if (ct.indexOf('event-stream') >= 0 || ct.indexOf('json') >= 0) {
                  r.clone().text().then(function(t){
                    if (url.indexOf('history_messages') >= 0) { var hc = compactHist(t); if (hc) report(hc); return; }
                    scan(t, url);
                  }).catch(function(){});
                }
              } catch(e) {}
            }).catch(function(){});
          }
        } catch(e) {}
        return res;
      };
    }
  } catch(e) {}
  try {
    var XO = XMLHttpRequest.prototype.open;
    var XR = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function(m, u){ try { this.__cbxU = String(u || ''); } catch(e) {} return XO.apply(this, arguments); };
    XMLHttpRequest.prototype.send = function(){
      var self = this;
      try {
        self.addEventListener('load', function(){
          try {
            var u = self.__cbxU || '';
            if (u.indexOf('history_messages') < 0) return;
            if (self.responseType && self.responseType !== 'text') return;
            var hc = compactHist(self.responseText);
            if (hc) report(hc);
          } catch(e) {}
        });
      } catch(e) {}
      return XR.apply(this, arguments);
    };
  } catch(e) {}
  return 'ok';
})()`;
  try {
    const r = webFrame.executeJavaScript(src, true);
    if (r && r.catch) r.catch(() => {});
  } catch (e) {}
}

function tkListenUsage() {
  const handle = (payload) => {
    try {
      const d = typeof payload === 'string' ? JSON.parse(payload) : payload;
      if (!d) return;
      if (d.type === 'hist') { tkIngestHist(d); return; }
      if (!d || (!d.p && !d.c)) return;
      const now = Date.now();
      if (tkUsage.last && tkUsage.last.p === d.p && tkUsage.last.c === d.c && now - tkUsage.last.t < 5000) return;
      tkUsage.last = { p: d.p, c: d.c, t: now };
      if (d.p) tkStore.add({ h: 'api:' + now + ':p', r: 'in', t: now, n: d.p, ch: 0, m: 'a', c: 'api' });
      if (d.c) tkStore.add({ h: 'api:' + now + ':c', r: 'out', t: now, n: d.c, ch: 0, m: 'a', c: 'api' });
    } catch (err) { window.__cbxTkErr = 'usage:' + err; }
  };
  tkUsageCb = handle;
  window.addEventListener('cbx-usage', (e) => {
    try { handle(String(e.detail || '')); } catch (err) {}
  });
}

const tkHist = { seen: false, lastIngest: {}, lastTry: {} };

function tkIngestHist(d) {
  if (!d || !d.sid || !tkStore.loaded || !tkStore.data) return;
  const sid = d.sid;
  const c8 = sid.slice(0, 8);
  const now = Date.now();
  const meta = tkStore.data.meta;
  if (!meta.sessions) meta.sessions = {};
  const prev = meta.sessions[c8] || {};
  const msgs = d.msgs || [];
  tkHist.seen = true;
  tkHist.lastIngest[c8] = now;

  if (!msgs.length) {
    meta.sessions[c8] = Object.assign({}, prev, { sid: sid, title: d.title || prev.title || '', empty: 1, wall: now });
    tkStore.scheduleSave();
    tkBackfill.enqueue(sid);
    if (tkStore.onChange) tkStore.onChange();
    return;
  }

  let acc = 0;
  let maxMid = prev.max || 0;
  let lastAt = 0;
  const add = [];
  for (let i = 0; i < msgs.length; i++) {
    const m = msgs[i];
    if (m.id > maxMid) maxMid = m.id;
    if (m.at > lastAt) lastAt = m.at;
    const before = acc;
    if (m.atu > acc) acc = m.atu;
    const delta = acc - before;
    if (delta <= 0) continue;
    const t = m.at || now;
    const role = m.role === 'USER' ? 'in' : 'out';
    const tc = m.tc | 0;
    const mc = m.mc | 0;
    if (tc > 0 && mc > 0) {
      const tn = Math.max(0, Math.round(delta * tc / (tc + mc)));
      add.push({ h: 'h:' + sid + ':' + m.id + ':T', r: 'think', t: t, n: tn, ch: tc, m: 'a', c: c8 });
      add.push({ h: 'h:' + sid + ':' + m.id, r: role, t: t, n: Math.max(0, delta - tn), ch: mc, m: 'a', c: c8 });
    } else if (tc > 0 && !mc) {
      add.push({ h: 'h:' + sid + ':' + m.id, r: 'think', t: t, n: delta, ch: tc, m: 'a', c: c8 });
    } else {
      add.push({ h: 'h:' + sid + ':' + m.id, r: role, t: t, n: delta, ch: mc, m: 'a', c: c8 });
    }
  }

  const mark = prev.wall || 0;
  const evs = tkStore.data.events;
  let removed = 0;
  const kept = [];
  for (let i = 0; i < evs.length; i++) {
    const e = evs[i];
    if (e.c === c8 && e.m === 'e' && e.t >= mark && e.t <= now) { removed++; continue; }
    kept.push(e);
  }
  if (removed) tkStore.data.events = kept;

  let added = 0;
  for (let i = 0; i < add.length; i++) {
    const ev = add[i];
    if (ev.h && tkStore.seen.has(ev.h)) continue;
    tkStore.data.events.push(ev);
    if (ev.h) tkStore.seen.add(ev.h);
    added++;
  }
  if (removed) tkStore.rebuildSeen();
  if (tkStore.data.events.length > 62000) tkStore.prune();

  meta.sessions[c8] = { sid: sid, title: d.title || prev.title || '', max: maxMid, n: msgs.length, wall: now, sup: d.sup || 0, last: lastAt };
  tkStore.scheduleSave();
  try { tkCollector.cover(c8); } catch (e) {}
  if (added || removed) {
    tkHist.ingested = (tkHist.ingested || 0) + added;
    if (tkStore.onChange) tkStore.onChange();
  }
}

const tkBackfill = {
  running: false,
  listed: false,
  total: 0,
  done: 0,
  failed: 0,
  cur: '',
  err: null,
  queue: [],
  pending: [],
  sessions: [],
  lastRun: 0,

  authHeaders() {
    return new Promise((resolve) => {
      try {
        const p = ipcRenderer.invoke('cbx-auth-get');
        Promise.resolve(p).then((h) => {
          if (!h || !h.authorization) return resolve(null);
          const allow = ['authorization', 'x-device-id', 'x-client-bundle-id', 'x-client-version', 'x-client-platform', 'x-client-locale', 'x-client-timezone-offset', 'x-device-model', 'content-type', 'accept'];
          const out = {};
          allow.forEach((k) => { if (h[k]) out[k] = h[k]; });
          resolve(out);
        }).catch(() => resolve(null));
      } catch (e) { resolve(null); }
    });
  },

  compact(j, sidHint) {
    try {
      const bd = j && j.data && j.data.biz_data;
      if (!bd) return null;
      const sess = bd.chat_session || {};
      const list = bd.chat_messages || [];
      const out = [];
      for (let i = 0; i < list.length; i++) {
        const m = list[i] || {};
        const fr = m.fragments || [];
        let tc = 0, mc = 0;
        for (let k = 0; k < fr.length; k++) {
          const f = fr[k] || {};
          const c = typeof f.content === 'string' ? f.content : '';
          if (!c) continue;
          if (f.type === 'THINK') tc += c.length;
          else if (f.type === 'REQUEST' || f.type === 'RESPONSE' || f.type === 'TEXT' || f.type === 'MESSAGE') mc += c.length;
        }
        out.push({ id: m.message_id | 0, role: m.role || '', at: Math.round((m.inserted_at || 0) * 1000), atu: (+m.accumulated_token_usage) || 0, tc: tc, mc: mc });
      }
      return {
        type: 'hist',
        sid: sess.id || sidHint || '',
        title: sess.title || '',
        sup: Math.round((sess.updated_at || 0) * 1000),
        cur: bd.current_message_id | 0,
        cache: bd.cache_control || '',
        msgs: out
      };
    } catch (e) { return null; }
  },

  getHistory(sid, hdrs) {
    return fetch('https://chat.deepseek.com/api/v0/chat/history_messages?chat_session_id=' + encodeURIComponent(sid), { headers: hdrs, credentials: 'omit', cache: 'no-store' })
      .then((r) => r.json());
  },

  waitAuth(n) {
    const self = this;
    return this.authHeaders().then((h) => {
      if (h) return h;
      if (n <= 0) throw new Error('未捕获到登录态');
      return new Promise((r) => setTimeout(r, 1000)).then(() => self.waitAuth(n - 1));
    });
  },

  listSessions() {
    const acc = new Map();
    const self = this;
    return this.waitAuth(12).then((hdrs) => {
      const pull = (url, depth) => fetch(url, { headers: hdrs, credentials: 'omit', cache: 'no-store' })
        .then((r) => r.json())
        .then((j) => {
          const bd = j && j.data && j.data.biz_data;
          if (!bd) throw new Error('会话列表返回异常');
          (bd.chat_sessions || []).forEach((s) => { if (s && s.id) acc.set(s.id, s); });
          if (bd.has_more && depth < 30) {
            const list = bd.chat_sessions || [];
            const last = list[list.length - 1];
            if (last && last.updated_at) {
              const next = 'https://chat.deepseek.com/api/v0/chat_session/fetch_page?lte_cursor.pinned=false&lte_cursor.updated_at=' + encodeURIComponent(last.updated_at);
              return new Promise((res) => setTimeout(res, 220)).then(() => pull(next, depth + 1));
            }
          }
          return null;
        });
      return pull('https://chat.deepseek.com/api/v0/chat_session/fetch_page?lte_cursor.pinned=false', 0).then(() => [...acc.values()]);
    });
  },

  enqueue(sid) {
    if (!sid) return;
    if (this.running) {
      if (this.queue.indexOf(sid) < 0 && this.pending.indexOf(sid) < 0) this.pending.push(sid);
      return;
    }
    this.runQueue([sid]);
  },

  boot(force) {
    const now = Date.now();
    if (this.running) return Promise.resolve('busy');
    if (!force && this.lastRun && now - this.lastRun < 60000) return Promise.resolve('skip');
    this.lastRun = now;
    const self = this;
    return this.listSessions().then((list) => {
      self.sessions = list;
      self.listed = true;
      const meta = tkStore.data ? tkStore.data.meta : {};
      if (!meta.sessions) meta.sessions = {};
      const todo = [];
      list.forEach((s) => {
        const k = s.id.slice(0, 8);
        const have = meta.sessions[k];
        if (!have || !have.n) todo.push(s.id);
        if (!have) meta.sessions[k] = { sid: s.id, title: s.title || '', sup: Math.round((s.updated_at || 0) * 1000) };
        else if (!have.title && s.title) have.title = s.title;
      });
      tkStore.scheduleSave();
      self.total = list.length;
      self.todo = todo.length;
      if (!todo.length) { self.prog = { ok: 0, bad: 0, left: 0, total: 0 }; return 'empty'; }
      return self.runQueue(todo);
    }).catch((e) => {
      self.err = String((e && e.message) || e);
      self.running = false;
      return 'err';
    });
  },

  runQueue(ids) {
    if (this.running) return Promise.resolve('busy');
    this.running = true;
    this.err = null;
    const self = this;
    this.queue = ids.slice();
    const total0 = this.queue.length;
    let ok = 0, bad = 0;
    this.prog = { ok: 0, bad: 0, left: total0, total: total0 };
    const step = () => {
      if (!self.queue.length) {
        self.running = false;
        self.cur = '';
        try { tkStore.flush(); } catch (e) {}
        if (self.pending.length) {
          const p = self.pending;
          self.pending = [];
          self.runQueue(p);
          return;
        }
        if (tkStore.onChange) tkStore.onChange();
        return;
      }
      const sid = self.queue.shift();
      self.cur = sid;
      self.authHeaders().then((hdrs) => {
        if (!hdrs) { self.failed++; self.err = '缺少登录态'; self.running = false; return; }
        return self.getHistory(sid, hdrs)
          .then((j) => {
            const d = self.compact(j, sid);
            if (d) { tkIngestHist(d); ok++; }
            else bad++;
          })
          .catch((e) => { bad++; self.err = String((e && e.message) || e); })
          .then(() => {
            self.prog = { ok: ok, bad: bad, left: self.queue.length, total: total0 };
            if (tkStore.onChange) tkStore.onChange();
            setTimeout(step, 220);
          });
      });
    };
    step();
    return Promise.resolve('run');
  },

  sync() {
    return this.boot(true);
  }
};

function tkBfState() {
  const meta = tkStore.data && tkStore.data.meta ? tkStore.data.meta : {};
  const sess = meta.sessions || {};
  let covered = 0;
  Object.keys(sess).forEach(k => { if (sess[k] && sess[k].n) covered++; });
  return {
    running: !!tkBackfill.running,
    listed: !!tkBackfill.listed,
    total: tkBackfill.total || 0,
    covered: covered,
    todo: (tkBackfill.prog && tkBackfill.prog.left) || 0,
    ok: (tkBackfill.prog && tkBackfill.prog.ok) || 0,
    bad: (tkBackfill.prog && tkBackfill.prog.bad) || 0,
    cur: tkBackfill.cur || '',
    err: tkBackfill.err || null
  };
}

function tkPollTick() {
  try {
    if (!tkStore.loaded || tkBackfill.running || document.hidden) return;
    const m = location.pathname.match(/\/a\/chat\/s\/([0-9a-f-]{8,})/i);
    if (!m) return;
    const sid = m[1];
    const c8 = sid.slice(0, 8);
    const now = Date.now();
    if (tkHist.lastIngest[c8] && now - tkHist.lastIngest[c8] < 20000) return;
    if (tkHist.lastTry[c8] && now - tkHist.lastTry[c8] < 20000) return;
    tkHist.lastTry[c8] = now;
    tkBackfill.authHeaders().then((hdrs) => {
      if (!hdrs) return;
      return tkBackfill.getHistory(sid, hdrs)
        .then((j) => { const d = tkBackfill.compact(j, sid); if (d) tkIngestHist(d); })
        .catch(() => {});
    });
  } catch (e) {}
}

const tkCollector = {
  nodeState: new WeakMap(),
  pending: [],
  timer: null,
  obsTimer: null,
  started: false,
  covered: {},
  cover(c8) {
    this.covered[c8] = Date.now();
    try {
      const vl = document.querySelector('.ds-virtual-list-visible-items');
      if (!vl) return;
      const conv = this.conv();
      for (const root of vl.children) {
        if (!root || root.nodeType !== 1) continue;
        const sig = (root.textContent || '').length + ':' + root.children.length;
        this.nodeState.set(root, { sig: sig, node: root, conv: conv, seen: Date.now(), done: true });
      }
    } catch (e) {}
  },
  start() {
    if (this.started) return;
    this.started = true;
    this.scan();
    this.timer = setInterval(() => this.scan(), 1600);
    try {
      this.obs = new MutationObserver(() => {
        clearTimeout(this.obsTimer);
        this.obsTimer = setTimeout(() => this.scan(), 700);
      });
      this.obs.observe(document.body, { childList: true, subtree: true });
    } catch (e) {}
  },
  conv() {
    const m = location.pathname.match(/\/s\/([0-9a-f-]+)/i);
    return m ? m[1].slice(0, 8) : 'home';
  },
  extract(root) {
    const bubble = root.classList.contains('ds-message') ? root : root.querySelector('.ds-message');
    if (!bubble) return null;
    const isAsst = !!root.querySelector('.ds-assistant-message-main-content, ._4f9bf79, .ds-think-content');
    const thinkEl = isAsst ? root.querySelector('.ds-think-content') : null;
    const think = thinkEl ? tkCleanText(thinkEl, null) : '';
    const main = tkCleanText(bubble, isAsst ? '.ds-think-content' : null);
    if (!main && !think) return null;
    return { role: isAsst ? 'out' : 'in', main, think };
  },
  scan() {
    if (!tkStore.data || document.hidden) return;
    const vl = document.querySelector('.ds-virtual-list-visible-items');
    if (!vl) return;
    const now = Date.now();
    const conv = this.conv();
    const covered = !!this.covered[conv];
    const kids = covered ? (vl.lastElementChild ? [vl.lastElementChild] : []) : [...vl.children];
    for (const root of kids) {
      if (!root || root.nodeType !== 1) continue;
      const sig = (root.textContent || '').length + ':' + root.children.length;
      let st = this.nodeState.get(root);
      if (st && st.sig === sig) continue;
      st = { sig, node: root, conv, seen: now, done: false };
      this.nodeState.set(root, st);
      const info = this.extract(root);
      if (!info) { st.done = true; continue; }
      st.role = info.role;
      st.main = info.main;
      st.think = info.think;
      st.h = tkHash(st.role + '|' + conv + '|' + info.main + '|' + info.think);
      if (tkStore.seen.has(st.h)) { st.done = true; continue; }
      if (info.role === 'in') {
        this.commit(st);
        st.done = true;
      } else {
        this.pending.push(st);
      }
    }
    this.flushPending(now);
  },
  flushPending(now) {
    if (!this.pending.length) return;
    const keep = [];
    for (const st of this.pending) {
      const node = st.node;
      const alive = node && node.isConnected;
      if (alive) {
        const sig = (node.textContent || '').length + ':' + node.children.length;
        if (sig !== st.sig) {
          const info = this.extract(node);
          if (!info) continue;
          st.sig = sig;
          st.seen = now;
          st.main = info.main;
          st.think = info.think;
          st.role = info.role;
          st.h = tkHash(st.role + '|' + st.conv + '|' + info.main + '|' + info.think);
          if (tkStore.seen.has(st.h)) continue;
          keep.push(st);
          continue;
        }
        if (now - st.seen >= 1500) { this.commit(st); continue; }
        keep.push(st);
      } else {
        if (now - st.seen >= 2500) { this.commit(st); continue; }
        keep.push(st);
      }
    }
    this.pending = keep;
  },
  commit(st) {
    if (st.done) return;
    st.done = true;
    if (!st.h || tkStore.seen.has(st.h)) return;
    const t = st.seen;
    if (st.think) {
      const n = Math.max(1, Math.round(tkEstimate(st.think)));
      tkStore.add({ h: st.h + 'T', r: 'think', t, n, ch: st.think.length, m: 'e', c: st.conv });
    }
    if (st.main) {
      const n = Math.max(1, Math.round(tkEstimate(st.main)));
      tkStore.add({ h: st.h, r: st.role, t, n, ch: st.main.length, m: 'e', c: st.conv });
    }
  }
};

function tkPad(n) { return n < 10 ? '0' + n : String(n); }
function tkDayKey(d) { return d.getFullYear() + '-' + tkPad(d.getMonth() + 1) + '-' + tkPad(d.getDate()); }
function tkHourKey(d) { return tkPad(d.getHours()) + ':00'; }
function tkMidnight(offset) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - offset);
  return d.getTime();
}
function tkFmt(n) {
  n = Math.round(n || 0);
  if (n >= 1000000) return (n / 1000000).toFixed(2) + 'M';
  if (n >= 100000) return Math.round(n / 1000) + 'k';
  if (n >= 10000) return (n / 1000).toFixed(1) + 'k';
  return n.toLocaleString('en-US');
}
function tkFmtFull(n) { return Math.round(n || 0).toLocaleString('en-US'); }
function tkCalib() {
  const c = tkStore.data && tkStore.data.meta ? tkStore.data.meta.calib : 1;
  return typeof c === 'number' && c > 0 ? c : 1;
}
function tkTok(e) { return e.m === 'a' ? e.n : Math.round(e.n * tkCalib()); }

function tkRange(tab) {
  if (tab === 'today') return tkMidnight(0);
  if (tab === '7') return tkMidnight(6);
  if (tab === '30') return tkMidnight(29);
  const evs = tkStore.data ? tkStore.data.events : [];
  const first = evs.length ? evs[0].t : Date.now();
  return Math.max(first, tkMidnight(1499));
}

function tkSum(start, end) {
  const acc = { in: 0, out: 0, think: 0, xi: 0, xo: 0, xt: 0, xN: 0, msgs: 0, ch: 0, apiIn: 0, apiOut: 0, apiN: 0 };
  const evs = tkStore.data ? tkStore.data.events : [];
  for (const e of evs) {
    if (e.t < start || e.t >= end) continue;
    const n = tkTok(e);
    if (e.m === 'a' && e.c === 'api') {
      if (e.r === 'in') acc.apiIn += n; else acc.apiOut += n;
      acc.apiN++;
      continue;
    }
    if (e.m === 'a') {
      if (e.r === 'in') acc.xi += n;
      else if (e.r === 'out') acc.xo += n;
      else acc.xt += n;
      acc.xN++;
    } else if (e.r === 'in') {
      acc.in += n;
    } else if (e.r === 'out') {
      acc.out += n;
    } else {
      acc.think += n;
    }
    if (e.r === 'in' || e.r === 'out') acc.msgs++;
    acc.ch += e.ch || 0;
  }
  acc.exact = acc.xi + acc.xo + acc.xt;
  acc.est = acc.in + acc.out + acc.think;
  acc.total = acc.est + acc.exact;
  return acc;
}

function tkBuckets(tab) {
  const start = tkRange(tab);
  const end = Date.now() + 1;
  const mode = tab === 'today' ? 'hour' : 'day';
  const now = new Date();
  const keys = [];
  const labels = [];
  if (mode === 'hour') {
    const day = tkDayKey(now);
    for (let h = 0; h <= now.getHours(); h++) {
      keys.push(day + ' ' + tkPad(h) + ':00');
      labels.push(tkPad(h));
    }
  } else {
    const first = new Date(start);
    first.setHours(0, 0, 0, 0);
    for (let d = first.getTime(); d <= end; d += 86400000) {
      const dd = new Date(d);
      keys.push(tkDayKey(dd));
      labels.push(tkPad(dd.getMonth() + 1) + '-' + tkPad(dd.getDate()));
    }
  }
  const map = new Map();
  const blank = (key, label) => ({ key: key, label: label, in: 0, out: 0, think: 0, xi: 0, xo: 0, xt: 0, xN: 0, msgs: 0, ch: 0, apiIn: 0, apiOut: 0, apiN: 0, t: 0 });
  keys.forEach((k, i) => map.set(k, blank(k, labels[i])));
  const evs = tkStore.data ? tkStore.data.events : [];
  for (const e of evs) {
    if (e.t < start || e.t >= end) continue;
    const d = new Date(e.t);
    const k = mode === 'hour' ? (tkDayKey(d) + ' ' + tkHourKey(d)) : tkDayKey(d);
    let b = map.get(k);
    if (!b) {
      b = blank(k, mode === 'hour' ? tkHourKey(d) : (tkPad(d.getMonth() + 1) + '-' + tkPad(d.getDate())));
      map.set(k, b);
    }
    const n = tkTok(e);
    if (e.m === 'a' && e.c === 'api') {
      if (e.r === 'in') b.apiIn += n; else b.apiOut += n;
      b.apiN++;
      continue;
    }
    if (e.m === 'a') {
      if (e.r === 'in') b.xi += n;
      else if (e.r === 'out') b.xo += n;
      else b.xt += n;
      b.xN++;
    } else if (e.r === 'in') { b.in += n; }
    else if (e.r === 'out') { b.out += n; }
    else { b.think += n; }
    if (e.r === 'in' || e.r === 'out') b.msgs++;
    b.ch += e.ch || 0;
  }
  let list = keys.map(k => map.get(k));
  if (mode === 'day' && list.length > 42) {
    const grouped = [];
    for (let i = list.length - 1; i >= 0; i -= 7) {
      const chunk = list.slice(Math.max(0, i - 6), i + 1).reverse();
      const g = chunk.reduce((a, b) => {
        a.in += b.in; a.out += b.out; a.think += b.think;
        a.xi += b.xi; a.xo += b.xo; a.xt += b.xt; a.xN += b.xN;
        a.msgs += b.msgs; a.ch += b.ch;
        a.apiIn += b.apiIn; a.apiOut += b.apiOut; a.apiN += b.apiN; a.t += b.t;
        return a;
      }, blank(chunk[0].key, ''));
      g.label = chunk[0].label + (chunk.length > 1 ? '~' + chunk[chunk.length - 1].label : '');
      grouped.unshift(g);
    }
    list = grouped;
  }
  list.forEach(b => { b.exact = b.xi + b.xo + b.xt; b.total = b.in + b.out + b.think + b.exact; });
  return list;
}

const tkUI = { tab: '7', active: false, clearArm: 0, raf: 0 };

function tkSplitBar(a, b, c) {
  const s = (a || 0) + (b || 0) + (c || 0);
  if (!s) return '<div class="cbx-tk-bar"></div>';
  return '<div class="cbx-tk-bar"><span class="b1" style="width:' + (a / s * 100).toFixed(1) + '%"></span>' +
    '<span class="b2" style="width:' + (b / s * 100).toFixed(1) + '%"></span>' +
    '<span class="b3" style="width:' + (c / s * 100).toFixed(1) + '%"></span></div>';
}

function tkCard(k, v, unit, sub, split) {
  return '<div class="cbx-tk-card"><div class="k">' + k + '</div>' +
    '<div class="v">' + v + (unit ? '<i>' + unit + '</i>' : '') + '</div>' +
    (sub ? '<div class="s">' + sub + '</div>' : '') + (split || '') + '</div>';
}

function tkTabs() {
  const items = [['today', '今日'], ['7', '近 7 天'], ['30', '近 30 天'], ['all', '全部']];
  return '<div class="cbx-tk-tools">' + items.map(it =>
    '<button class="cbx-tk-btn' + (tkUI.tab === it[0] ? ' cbx-on' : '') + '" data-tk="tab" data-v="' + it[0] + '">' + it[1] + '</button>'
  ).join('') + '</div>';
}

function tkSyncState() {
  const meta = tkStore.data && tkStore.data.meta ? tkStore.data.meta : {};
  const sess = meta.sessions || {};
  const keys = Object.keys(sess);
  let covered = 0;
  keys.forEach(k => { if (sess[k] && sess[k].n) covered++; });
  const bf = tkBackfill;
  const prog = bf.prog || null;
  const left = prog ? prog.left : 0;
  const totalQ = prog && prog.total ? prog.total : 0;
  const pct = totalQ ? Math.max(0, Math.min(100, Math.round((totalQ - left) / totalQ * 100)))
    : (covered && bf.total ? Math.min(100, Math.round(covered / bf.total * 100)) : 0);
  return {
    total: bf.total || keys.length,
    covered: covered,
    known: keys.length,
    running: !!bf.running,
    pct: pct,
    err: bf.err || null,
    listed: !!bf.listed,
    cur: bf.cur || ''
  };
}

function tkSyncStrip() {
  const s = tkSyncState();
  const btn = '<button class="cbx-tk-btn mini" data-tk="sync"' + (s.running ? ' disabled' : '') + '>' +
    (s.running ? '同步中…' : (s.listed && s.total && s.covered >= s.total ? '重新同步' : '立即同步历史')) + '</button>';
  if (s.running) {
    return '<div class="cbx-tk-sync run"><span class="dot"></span><span class="txt">正在同步历史会话 <b>' + s.pct +
      '%</b>' + (s.cur ? ' · ' + s.cur.slice(0, 8) : '') + '</span><span class="bar"><i style="width:' + s.pct + '%"></i></span><span class="sp"></span>' + btn + '</div>';
  }
  const done = s.listed && s.total && s.covered >= s.total;
  const txt = done
    ? '<span class="txt"><b>' + s.covered + '/' + s.total + '</b> 个会话已同步，含历史存量</span>'
    : '<span class="txt">历史存量待同步 <b>' + s.covered + '/' + (s.total || s.known || '?') + '</b> 个会话' +
      (s.err ? ' · <i class="err">' + s.err + '</i>' : '') + '</span>';
  return '<div class="cbx-tk-sync' + (done ? ' ok' : '') + '"><span class="dot' + (done ? ' ok' : '') + '"></span>' + txt +
    '<span class="bar"><i style="width:' + s.pct + '%"></i></span><span class="sp"></span>' + btn + '</div>';
}

function tkBuildHTML(big) {
  const evs = tkStore.data ? tkStore.data.events : [];
  const has = evs.length > 0;
  const today = tkSum(tkMidnight(0), Date.now() + 1);
  const yest = tkSum(tkMidnight(1), tkMidnight(0));
  const w = tkSum(tkMidnight(6), Date.now() + 1);
  const all = tkSum(0, Date.now() + 1);
  const range = tkSum(tkRange(tkUI.tab), Date.now() + 1);
  const buckets = tkBuckets(tkUI.tab);
  const rangeName = { today: '按小时 · 今日', '7': '按天 · 近 7 天', '30': '按天 · 近 30 天', all: '按天 · 全部' }[tkUI.tab];
  const calib = Math.round(tkCalib() * 100);
  const clearLabel = tkUI.clearArm && Date.now() - tkUI.clearArm < 5000 ? '再次点击确认清空' : '清空';
  const sync = tkSyncState();
  const sessCount = sync.known;

  let html = '<div class="cbx-tk-wrap">';
  html += '<div class="cbx-tk-head"><div class="cbx-tk-title"><span>Token 用量看板</span>' +
    '<div class="cbx-tk-pills">' +
    '<span class="pill" title="服务端逐条消息返回的 accumulated_token_usage，按差分精确记账">数据源 · 服务端 usage</span>' +
    '<span class="pill' + (sync.listed ? '' : ' muted') + '" title="已同步的历史会话数 / 总会话数">会话 ' + sync.covered + '/' + (sync.total || sync.known) + '</span>' +
    '</div></div><div class="cbx-tk-tools">' +
    tkTabs() +
    '<span class="cbx-tk-gap"></span>' +
    '<button class="cbx-tk-btn" data-tk="refresh">刷新</button>' +
    '<button class="cbx-tk-btn" data-tk="sync">同步历史</button>' +
    '<button class="cbx-tk-btn" data-tk="csv">CSV</button>' +
    '<button class="cbx-tk-btn" data-tk="json">JSON</button>' +
    '<button class="cbx-tk-btn danger" data-tk="clear">' + clearLabel + '</button>' +
    (big ? '<button class="cbx-tk-btn cbx-on" data-tk="collapse">退出大屏</button>'
         : '<button class="cbx-tk-btn" data-tk="expand">大屏</button>') +
    '</div></div>';

  html += tkSyncStrip();

  if (!has) {
    html += '<div class="cbx-tk-empty"><b>还没有统计数据</b>' +
      '打开任意历史会话，或点击下方按钮同步历史存量，所有对话都会计入统计<br>' +
      '正在进行的对话先按文本估算，服务端返回 usage 后自动替换为精确值<br><br>' +
      '<button class="cbx-tk-btn" data-tk="sync">立即同步历史</button></div>';
    html += '</div>';
    return html;
  }

  const dDay = yest.total ? Math.round((today.total - yest.total) / yest.total * 100) : null;
  const dTxt = dDay === null ? '昨日无数据' : ('较昨日 ' + (dDay >= 0 ? '+' : '') + dDay + '%');
  const avg7 = Math.round(w.total / 7);
  const exactPct = all.total ? Math.round(all.exact / all.total * 100) : 0;
  const exP = all.total ? (all.exact / all.total * 100) : 0;

  html += '<div class="cbx-tk-cards">';
  html += tkCard('累计消耗', tkFmt(all.total), 'tokens', '输入 ' + tkFmt(all.in + all.xi) + ' · 回答 ' + tkFmt(all.out + all.xo) + ' · 思考 ' + tkFmt(all.think + all.xt), tkSplitBar(all.in + all.xi, all.out + all.xo, all.think + all.xt));
  html += tkCard('今日', tkFmt(today.total), 'tokens', dTxt + ' · 消息 ' + today.msgs + ' 条', tkSplitBar(today.in + today.xi, today.out + today.xo, today.think + today.xt));
  html += tkCard('近 7 天', tkFmt(w.total), 'tokens', '日均 ' + tkFmt(avg7) + ' · 文本 ' + tkFmt(w.ch) + ' 字', tkSplitBar(w.in + w.xi, w.out + w.xo, w.think + w.xt));
  html += tkCard('精确统计', tkFmt(all.exact), 'tokens', '精确率 ' + exactPct + '% · 覆盖会话 ' + sessCount + ' 个',
    '<div class="cbx-tk-bar"><span class="b1" style="width:' + exP.toFixed(1) + '%"></span><span class="b2" style="width:' + (100 - exP).toFixed(1) + '%"></span></div>');
  html += '</div>';

  const max = Math.max(1, ...buckets.map(b => b.total));
  const step = Math.ceil(buckets.length / 14);
  const cols = buckets.map((b, i) => {
    const bi = b.in + b.xi, bo = b.out + b.xo, bt = b.think + b.xt;
    const tot = bi + bo + bt;
    const h = tot ? Math.max(3, Math.round(tot / max * 100)) : 0;
    const seg = (v) => tot ? (v / tot * 100).toFixed(2) : 0;
    const tip = b.label + '<br>合计 <b>' + tkFmtFull(tot) + '</b> tokens<br>输入 ' + tkFmtFull(bi) + ' · 回答 ' + tkFmtFull(bo) +
      (bt ? '<br>思考 ' + tkFmtFull(bt) : '') + (b.msgs ? '<br>消息 ' + b.msgs + ' 条' : '') +
      (b.exact ? '<br>其中精确 ' + tkFmtFull(b.exact) : '');
    const lb = (i % step === 0 || i === buckets.length - 1) ? b.label : '';
    return '<div class="cbx-tk-col"><span class="tip">' + tip + '</span>' +
      '<div class="stack" style="height:' + h + '%">' +
      (bt ? '<i style="height:' + seg(bt) + '%;background:#39c6c0"></i>' : '') +
      (bo ? '<i style="height:' + seg(bo) + '%;background:#8aa0ff"></i>' : '') +
      (bi ? '<i style="height:' + seg(bi) + '%;background:#4d6bfe"></i>' : '') +
      '</div><span class="lb">' + lb + '</span></div>';
  }).join('');

  html += '<div class="cbx-tk-sep">分时段趋势</div>';
  html += '<div class="cbx-tk-panel"><div class="cbx-tk-panel-t"><b>' + rangeName + '</b>' +
    '<div class="cbx-tk-legend"><span><i style="background:#4d6bfe"></i>输入</span><span><i style="background:#8aa0ff"></i>回答</span><span><i style="background:#39c6c0"></i>思考</span></div></div>' +
    '<div class="cbx-tk-chart">' + cols + '</div>' +
    '<div class="cbx-tk-stat"><span>区间合计 <b>' + tkFmtFull(range.total) + '</b> tokens</span>' +
    '<span>输入 ' + tkFmtFull(range.in + range.xi) + '</span><span>回答 ' + tkFmtFull(range.out + range.xo) + '</span>' +
    '<span>思考 ' + tkFmtFull(range.think + range.xt) + '</span><span>文本 ' + tkFmtFull(range.ch) + ' 字</span>' +
    '<span>精确 ' + tkFmtFull(range.exact) + '</span></div></div>';

  const mix = range.total ? (range.exact / range.total * 100) : 0;
  html += '<div class="cbx-tk-grid2">';
  html += '<div class="cbx-tk-panel"><div class="cbx-tk-panel-t"><b>数据构成</b><span>当前区间</span></div>' +
    '<div class="cbx-tk-share"><i class="ex" style="width:' + mix.toFixed(1) + '%"></i><i class="es" style="width:' + (100 - mix).toFixed(1) + '%"></i></div>' +
    '<div class="cbx-tk-rows">' +
    '<div class="row"><span class="k ex"></span><span class="n">服务端精确</span><span class="v">' + tkFmtFull(range.exact) + '</span><span class="c">' + range.xN + ' 条</span></div>' +
    '<div class="row"><span class="k es"></span><span class="n">本地估算</span><span class="v">' + tkFmtFull(range.est) + '</span><span class="c">' + Math.max(0, range.msgs - range.xN) + ' 条</span></div>' +
    (range.apiN ? '<div class="row"><span class="k ap"></span><span class="n">接口 usage</span><span class="v">' + tkFmtFull(range.apiIn + range.apiOut) + '</span><span class="c">' + range.apiN + ' 次</span></div>' : '') +
    '</div><div class="cbx-tk-note" style="margin-top:9px">精确值来自服务端逐条消息的 <b>accumulated_token_usage</b> 差分；估算值只在服务端数据到达前占位，同步后会被精确值替换。</div></div>';

  html += '<div class="cbx-tk-panel"><div class="cbx-tk-panel-t"><b>统计口径与校准</b></div>' +
    '<div class="cbx-tk-note">按时间分段聚合：今日按小时、其余按天；同一条消息按「会话 + 消息 ID」去重，终身只计一次。<br>' +
    '估算对界面呈现文本按中 / 英 / 数字 / 符号分段换算（中文约 1.5 字≈1 token，英文约 4 字母≈1 token），误差约 ±15~20%。<br>' +
    '服务端精确值不受校准系数影响，校准只修正估算部分。</div>' +
    '<div class="cbx-tk-calib"><label>校准系数</label>' +
    '<input type="range" min="50" max="200" step="5" value="' + calib + '" data-tk="calib">' +
    '<span class="val" data-tk="calibval">' + (calib / 100).toFixed(2) + 'x</span></div></div>';
  html += '</div>';

  html += '<div class="cbx-tk-sep">分时段明细</div>';
  const rows = buckets.slice().reverse().slice(0, 80).map(b =>
    '<tr><td>' + b.label + '</td><td>' + tkFmtFull(b.in + b.xi) + '</td><td>' + tkFmtFull(b.out + b.xo) + '</td><td>' + tkFmtFull(b.think + b.xt) +
    '</td><td class="hi">' + tkFmtFull(b.total) + '</td><td>' + b.msgs + '</td><td>' + (b.exact ? tkFmtFull(b.exact) : '—') + '</td></tr>'
  ).join('');
  html += '<div class="cbx-tk-tablewrap"><table class="cbx-tk-table"><thead><tr><th>时段</th><th>输入</th><th>回答</th><th>思考</th><th>合计</th><th>消息</th><th>精确</th></tr></thead><tbody>' + rows + '</tbody></table></div>';

  html += '<div class="cbx-tk-foot"><div class="cbx-tk-note">统计事件 <b>' + evs.length + '</b> 条 · 覆盖会话 <b>' + sessCount +
    '</b> 个 · 数据仅保存在本机 token-stats.json，不会上传。</div></div>';

  html += '</div>';
  return html;
}

function tkRender(pane, big) {
  if (!pane) return;
  let host = pane;
  if (pane.id !== TK_PANE_ID && pane.id !== TK_OVR_ID) return;
  if (pane.id === TK_OVR_ID) {
    host = pane.querySelector('.cbx-tk-body') || pane;
  }
  const keepHost = host.scrollTop;
  const sc = host.querySelector('.ds-scroll-area');
  const keepSc = sc ? sc.scrollTop : 0;
  host.innerHTML = tkBuildHTML(big);
  host.scrollTop = keepHost;
  try {
    const tip0 = document.getElementById('cbx-tk-tip');
    if (tip0) tip0.style.display = 'none';
  } catch (e) {}
  if (sc) {
    const sc2 = host.querySelector('.ds-scroll-area');
    if (sc2) sc2.scrollTop = keepSc;
  }
}

function tkRefresh() {
  if (tkUI.raf) return;
  tkUI.raf = requestAnimationFrame(() => {
    tkUI.raf = 0;
    try {
      const pane = document.getElementById(TK_PANE_ID);
      if (pane && pane.style.display !== 'none') tkRender(pane, false);
      const ovr = document.getElementById(TK_OVR_ID);
      if (ovr) tkRender(ovr, true);
    } catch (e) {}
  });
}

function tkDownload(name, text, mime) {
  try {
    const r = ipcRenderer.invoke('cbx-tokens-export', { name: name, content: text });
    if (r && r.then) r.then(() => {}).catch(() => {});
    return;
  } catch (e) {}
  try {
    const blob = new Blob([text], { type: mime });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { try { URL.revokeObjectURL(a.href); a.remove(); } catch (e) {} }, 5000);
  } catch (e) {}
}

function tkExport(kind) {
  const evs = tkStore.data ? tkStore.data.events : [];
  const calib = tkCalib();
  const stamp = tkDayKey(new Date());
  if (kind === 'json') {
    tkDownload('deepseek-token-' + stamp + '.json', JSON.stringify({ exported: Date.now(), calib, meta: tkStore.data.meta, events: evs }, null, 1), 'application/json;charset=utf-8');
    return;
  }
  const q = (s) => '"' + String(s == null ? '' : s).replace(/"/g, '""') + '"';
  const rows = [['时间', '日期', '时段', '类型', '模式', 'tokens', '字符', '会话']];
  for (const e of evs) {
    const d = new Date(e.t);
    rows.push([
      new Date(e.t).toLocaleString('zh-CN'),
      tkDayKey(d),
      tkPad(d.getHours()) + ':' + tkPad(d.getMinutes()),
      e.r === 'in' ? '输入' : (e.r === 'out' ? '回答' : '思考'),
      e.m === 'a' ? (e.c === 'api' ? '接口usage' : '服务端精确') : '估算',
      tkTok(e),
      e.ch || 0,
      e.c || ''
    ]);
  }
  tkDownload('deepseek-token-' + stamp + '.csv', '\ufeff' + rows.map(r => r.map(q).join(',')).join('\r\n'), 'text/csv;charset=utf-8');
}

function tkOpenOverlay() {
  if (document.getElementById(TK_OVR_ID)) return;
  const ovr = document.createElement('div');
  ovr.id = TK_OVR_ID;
  ovr.innerHTML = '<div class="cbx-tk-modal"><div class="cbx-tk-body"></div></div>';
  ovr.addEventListener('click', (e) => {
    if (e.target === ovr) tkCloseOverlay();
  });
  document.body.appendChild(ovr);
  tkBindPane(ovr);
  tkRender(ovr, true);
}

function tkCloseOverlay() {
  const o = document.getElementById(TK_OVR_ID);
  if (o) o.remove();
}

function tkHandleAction(e) {
  const t = e && e.target;
  const btn = t && t.closest ? t.closest('[data-tk]') : null;
  if (!btn) return false;
  const act = btn.getAttribute('data-tk');
  if (act === 'tab') {
    tkUI.tab = btn.getAttribute('data-v') || '7';
    tkRefresh();
    return true;
  }
  if (act === 'refresh') { tkCollector.scan(); tkRefresh(); return true; }
  if (act === 'sync') {
    if (!tkBackfill.running) {
      tkBackfill.sync().then(() => { try { tkRefresh(); } catch (e) {} }).catch(() => {});
      tkRefresh();
    }
    return true;
  }
  if (act === 'csv') { tkExport('csv'); return true; }
  if (act === 'json') { tkExport('json'); return true; }
  if (act === 'clear') {
    if (tkUI.clearArm && Date.now() - tkUI.clearArm < 5000) {
      tkUI.clearArm = 0;
      tkStore.clear();
    } else {
      tkUI.clearArm = Date.now();
      setTimeout(() => tkRefresh(), 5200);
      tkRefresh();
    }
    return true;
  }
  if (act === 'expand') { tkOpenOverlay(); return true; }
  if (act === 'collapse') { tkCloseOverlay(); return true; }
  return false;
}

function tkBindPane(pane) {
  if (pane.dataset.tkBound) return;
  pane.dataset.tkBound = '1';
  pane.addEventListener('click', (e) => {
    const t = e.target;
    if (t && t.closest && t.closest('input')) return;
    if (tkHandleAction(e)) { e.preventDefault(); e.stopPropagation(); }
  });
  pane.addEventListener('input', (e) => {
    const el = e.target;
    if (el && el.getAttribute && el.getAttribute('data-tk') === 'calib') {
      const v = Math.max(50, Math.min(200, parseInt(el.value, 10) || 100)) / 100;
      if (tkStore.data) tkStore.data.meta.calib = v;
      const lab = pane.querySelector('[data-tk="calibval"]');
      if (lab) lab.textContent = v.toFixed(2) + 'x';
      const other = document.getElementById(TK_OVR_ID);
      if (other) {
        const oSlider = other.querySelector('[data-tk="calib"]');
        if (oSlider && oSlider !== el) oSlider.value = String(Math.round(v * 100));
        const oLab = other.querySelector('[data-tk="calibval"]');
        if (oLab) oLab.textContent = v.toFixed(2) + 'x';
      }
    }
  });
  pane.addEventListener('change', (e) => {
    const el = e.target;
    if (el && el.getAttribute && el.getAttribute('data-tk') === 'calib') {
      const v = Math.max(50, Math.min(200, parseInt(el.value, 10) || 100)) / 100;
      tkStore.setCalib(v);
    }
  });
  pane.addEventListener('mousemove', (e) => {
    const col = e.target && e.target.closest ? e.target.closest('.cbx-tk-col') : null;
    const src = col ? col.querySelector('.tip') : null;
    let tip = document.getElementById('cbx-tk-tip');
    if (!src) {
      if (tip) tip.style.display = 'none';
      return;
    }
    if (!tip) {
      tip = document.createElement('div');
      tip.id = 'cbx-tk-tip';
      tip.className = 'cbx-tk-tip';
      document.body.appendChild(tip);
    }
    tip.innerHTML = src.innerHTML;
    tip.style.display = 'block';
    const r = col.getBoundingClientRect();
    let top = r.top - 10;
    let below = false;
    if (top - tip.offsetHeight < 4) {
      top = r.bottom + 10;
      below = true;
    }
    tip.classList.toggle('below', below);
    tip.style.left = Math.round(r.left + r.width / 2) + 'px';
    tip.style.top = Math.round(top) + 'px';
  });
  pane.addEventListener('mouseleave', () => {
    const tip = document.getElementById('cbx-tk-tip');
    if (tip) tip.style.display = 'none';
  });
  pane.addEventListener('scroll', () => {
    const tip = document.getElementById('cbx-tk-tip');
    if (tip) tip.style.display = 'none';
  }, { passive: true, capture: true });
}

function tkEnsureStyle() {
  if (document.getElementById(TK_STYLE_ID)) return;
  const s = document.createElement('style');
  s.id = TK_STYLE_ID;
  s.textContent = TK_CSS;
  (document.head || document.documentElement).appendChild(s);
}

function tkActiveClass(navHost) {
  if (!navHost) return null;
  const counts = {};
  const kids = [...navHost.children].filter(b => b.classList.contains('ds-button'));
  if (kids.length < 2) return null;
  kids.forEach(b => [...b.classList].forEach(c => { counts[c] = (counts[c] || 0) + 1; }));
  const cand = Object.keys(counts).filter(c => counts[c] === 1 && /^_[0-9a-f]{5,}$/i.test(c));
  if (cand.length) return cand[0];
  const cand2 = Object.keys(counts).filter(c => counts[c] === 1 && c.indexOf('ds-') !== 0 && !/^cbx-/.test(c));
  return cand2.length ? cand2[0] : null;
}

function tkActivate(on) {
  tkUI.active = on;
  const nav = document.getElementById(TK_NAV_ID);
  const pane = document.getElementById(TK_PANE_ID);
  const body = document.querySelector('.f2ff50b5');
  const navHost = document.querySelector('.d316d158');
  const activeCls = tkActiveClass(navHost);
  if (on) {
    if (activeCls) {
      [...navHost.children].forEach(b => { if (b !== nav) b.classList.remove(activeCls); });
      if (nav) nav.classList.add(activeCls);
    }
    const scroll = body ? body.querySelector(':scope > .ds-scroll-area') : null;
    if (scroll) scroll.style.display = 'none';
    if (pane) { pane.style.display = ''; tkBindPane(pane); tkRender(pane, false); }
  } else {
    if (activeCls && nav) nav.classList.remove(activeCls);
    const scroll = body ? body.querySelector(':scope > .ds-scroll-area') : null;
    if (scroll) scroll.style.display = '';
    if (pane) pane.style.display = 'none';
    tkCloseOverlay();
  }
}

function tkInject() {
  const navHost = document.querySelector('.d316d158');
  const body = document.querySelector('.f2ff50b5');
  if (!navHost || !body) return false;
  tkEnsureStyle();
  const natives = [...navHost.children].filter(b => b.classList.contains('ds-button'));
  let nav = document.getElementById(TK_NAV_ID);
  if (!nav || nav.parentElement !== navHost) {
    if (nav) nav.remove();
    const src = natives.find(b => (b.textContent || '').indexOf('账号管理') >= 0) || natives[1] || natives[natives.length - 1];
    if (!src) return false;
    nav = src.cloneNode(true);
    nav.id = TK_NAV_ID;
    nav.removeAttribute('aria-pressed');
    nav.removeAttribute('aria-selected');
    const act0 = tkActiveClass(navHost);
    if (act0) nav.classList.remove(act0);
    const label = nav.querySelector('.ds-button__content');
    if (label) label.textContent = 'Token 用量';
    const icon = nav.querySelector('.ds-button__icon');
    if (icon) icon.innerHTML = TK_ICON;
    nav.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      tkActivate(true);
    }, true);
    navHost.insertBefore(nav, src.nextSibling);
    if (tkUI.active) tkActivate(true);
  }
  let pane = document.getElementById(TK_PANE_ID);
  if (!pane || pane.parentElement !== body) {
    if (pane) pane.remove();
    pane = document.createElement('div');
    pane.id = TK_PANE_ID;
    pane.style.display = tkUI.active ? '' : 'none';
    body.appendChild(pane);
    tkBindPane(pane);
    tkRender(pane, false);
    if (tkUI.active) tkActivate(true);
  }
  if (!navHost.dataset.tkBound) {
    navHost.dataset.tkBound = '1';
    navHost.addEventListener('click', (e) => {
      if (e.target.closest('#' + TK_NAV_ID)) return;
      if (e.target.closest('.ds-button') && tkUI.active) tkActivate(false);
    }, true);
  }
  return true;
}

let tkBooted = false;
try {
  contextBridge.exposeInMainWorld('codexTkDebug', {
    state() {
      try {
        return {
          booted: tkBooted,
          loaded: tkStore.loaded,
          events: tkStore.data ? tkStore.data.events.length : -1,
          queue: tkStore.queue.length,
          seen: tkStore.seen ? tkStore.seen.size : -1,
          started: tkCollector.started,
          pending: tkCollector.pending.length,
          hidden: document.hidden,
          active: tkUI.active,
          bf: tkBfState(),
          ingested: tkHist.ingested || 0,
          sessions: (tkStore.data && tkStore.data.meta && tkStore.data.meta.sessions) ? Object.keys(tkStore.data.meta.sessions).length : 0,
          err: window.__cbxTkErr || null
        };
      } catch (e) { return { dbgErr: String(e) }; }
    },
    inject() {
      try {
        const r = tkInject();
        return { ok: r, pane: !!document.getElementById(TK_PANE_ID), nav: !!document.getElementById(TK_NAV_ID) };
      } catch (e) { return { err: String(e), stack: String((e && e.stack) || '').split('\n').slice(0, 3).join(' | ') }; }
    },
    activate(on) {
      try { tkActivate(!!on); return { ok: true, active: tkUI.active }; }
      catch (e) { return { err: String(e), stack: String((e && e.stack) || '').split('\n').slice(0, 3).join(' | ') }; }
    }
  });
} catch (e) {}
function setupTokenStats() {
  if (tkBooted) return;
  tkBooted = true;
  try {
    window.__cbxTk = {
      state() {
        try {
          return {
            loaded: tkStore.loaded,
            events: tkStore.data ? tkStore.data.events.length : -1,
            queue: tkStore.queue.length,
            seen: tkStore.seen ? tkStore.seen.size : -1,
            started: tkCollector.started,
            pending: tkCollector.pending.length,
            hidden: document.hidden,
            calib: tkStore.data ? tkStore.data.meta.calib : null,
            bf: tkBfState(),
            err: window.__cbxTkErr || null
          };
        } catch (e2) { return { stateErr: String(e2) }; }
      }
    };
  } catch (e) {}
  try { tkEnsureStyle(); } catch (e) { window.__cbxTkErr = 'style:' + e; }
  try { tkStore.init(); } catch (e) { window.__cbxTkErr = 'init:' + e; }
  tkStore.onChange = () => { try { tkRefresh(); } catch (e) {} };
  try { tkInstallUsageHook(); } catch (e) { window.__cbxTkErr = 'hook:' + e; }
  try { tkListenUsage(); } catch (e) { window.__cbxTkErr = 'usage:' + e; }
  try { tkCollector.start(); } catch (e) { window.__cbxTkErr = 'collector:' + e; }
  try {
    const obs = new MutationObserver(() => {
      try { tkInject(); } catch (e) {}
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
  } catch (e) {}
  const iv = setInterval(() => {
    try { if (tkInject()) clearInterval(iv); } catch (e) {}
  }, 2000);
  setTimeout(() => { try { tkInject(); } catch (e) {} }, 1500);
  try {
    setInterval(() => { try { tkPollTick(); } catch (e) {} }, 15000);
    setTimeout(() => { try { tkPollTick(); } catch (e) {} }, 9000);
  } catch (e) {}
  try {
    const tryBoot = (left) => {
      if (!tkStore.loaded) {
        if (left > 0) setTimeout(() => tryBoot(left - 1), 1200);
        return;
      }
      setTimeout(() => {
        try {
          tkBackfill.boot(false).then(() => { try { tkRefresh(); } catch (e) {} }).catch(() => {});
        } catch (e) { window.__cbxTkErr = 'bf:' + e; }
      }, 3500);
    };
    tryBoot(10);
  } catch (e) {}
  window.addEventListener('beforeunload', () => { try { tkStore.flush(); } catch (e) {} });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.getElementById(TK_OVR_ID)) tkCloseOverlay();
  });
}


/* ================= 启动 ================= */
/* ================= scroll-pause ================= */
function setupScrollPause() {
  let t = null;
  const on = () => {
    document.body.classList.add('cbx-scrolling');
    clearTimeout(t);
    t = setTimeout(() => document.body.classList.remove('cbx-scrolling'), 350);
  };
  try { window.addEventListener('wheel', on, { passive: true }); } catch (e) {}
  try { window.addEventListener('touchmove', on, { passive: true }); } catch (e) {}
  try { document.addEventListener('keydown', (e) => { if (/^(Arrow|PageUp|PageDown|Home|End|Space)/.test(e.key)) on(); }, { passive: true }); } catch (e) {}
}

function ensureStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const s = document.createElement('style');
  s.id = STYLE_ID;
  s.textContent = THEMES[effectiveThemeName()];
  (document.head || document.documentElement).appendChild(s);
}

function setupNativeWatch() {
  let last = nativeIsLight();
  try {
    new MutationObserver(() => {
      const now = nativeIsLight();
      if (now !== last) {
        last = now;
        applyTheme(getSavedTheme());
      }
    }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  } catch (e) {}
}

function setupAurora() {
  if (document.getElementById('cbx-aurora')) return;
  const au = document.createElement('div');
  au.id = 'cbx-aurora';
  document.body.appendChild(au);
}

function boot() {
  ensureStyle();
  setupAurora();
  setupNativeWatch();
  setupSettingsInjection();
  setupThinkMode();
  setupTopbar();
  setupScrollPause();
  setupTokenStats();
  applyGlassSettings();
  syncTitlebar();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
window.addEventListener('load', () => {
  ensureStyle();
  setupAurora();
  setupNativeWatch();
  setupSettingsInjection();
  setupThinkMode();
  setupTopbar();
  setupScrollPause();
  setupTokenStats();
  applyGlassSettings();
  syncTitlebar();
});
