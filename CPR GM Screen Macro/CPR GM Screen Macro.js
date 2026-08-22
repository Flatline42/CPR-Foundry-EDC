/*
=====================================
CYBERPUNK RED - GM SCREEN
=====================================
Tabbed macro launcher with persistent world settings.

FIRST RUN: Migrates your existing tabs automatically.
EDIT MODE: Click the ⚙ gear icon in the header to enter edit mode.

In edit mode:
  - Use the folder icon (left of title) to add a new tab
  - Use the + icon (left of title) to add a macro to the current tab
  - Drag tabs or macros to reorder
  - Click a tab name to rename it inline
  - Click ✕ on a tab to remove it
  - Click ✕ on a macro card to remove it
  - Click Save to persist, Cancel to discard

=====================================
*/

// =====================================
// DEFAULT CONFIGURATION (used on first run / migration)
// =====================================
const ML_DEFAULTS = {
  title: "CPR GM Screen",
  subtitle: "Style Over Substance",
  tabs: [
    {
      id: "tab-advancement",
      name: "Advancement",
      note: "Select player token(s) before running these macros",
      macros: [
        { uuid: "Macro.3wzdmCApHhVsnsUC" },
        { uuid: "Macro.c8SDjsoAEg26VNMz" },
        { uuid: "Macro.wCC2V4QQkTj05SKw" },
        { uuid: "Macro.x3POE6rCnWbpu8Hu" }
      ]
    },
    {
      id: "tab-combat",
      name: "Combat",
      note: "",
      macros: [
        { uuid: "Macro.EISr7iELNZ8wEm1E" },
        { uuid: "Macro.LeedYWzdrPUaOV8d" },
        { uuid: "Macro.QUDHNk8W17U0vJuZ" },
        { uuid: "Macro.WEg5IzEIYzC0FL84" },
        { uuid: "Macro.PyokWrdpBpIf7QP7" },
        { uuid: "Macro.RewfRYvSIvjQPAge" },
        { uuid: "Macro.faw1us3XjzaKkSBq" }
      ]
    },
    {
      id: "tab-encounter",
      name: "Encounter Generator",
      note: "",
      macros: [
        { uuid: "Macro.PPMiwJ44a4eZsbMw" },
        { uuid: "Macro.uYPdTSUkCCd4pmqf" },
        { uuid: "Macro.wmDuhpVMKmopYVIj" }
      ]
    },
    {
      id: "tab-world",
      name: "World Macros",
      note: "",
      macros: [
        { uuid: "Macro.igSbVDVaOFFnd1yV" },
        { uuid: "Macro.JXLfeRpfLntGYQjw" },
        { uuid: "Macro.C7FgvczrtHjCmmRF" },
        { uuid: "Macro.QLjbEazPSpL19SAE" },
        { uuid: "Macro.jwryvYGuZ4yM0O7W" },
        { uuid: "Macro.WsQDGhqgnHJ7hn7e" }
      ]
    },
    {
      id: "tab-generators",
      name: "Generators",
      note: "",
      macros: [
        { uuid: "Macro.62UE3uvcw1erJMyF" },
        { uuid: "Macro.DOfRjvzAvCoB8eku" },
        { uuid: "Macro.oqzPQR3TTmHldFTk" },
        { uuid: "Macro.Y0DmGEPdPNIB9UeZ" }
      ]
    },
    {
      id: "tab-utilities",
      name: "Utilities",
      note: "",
      macros: [
        { uuid: "Macro.Fo5QjRn3zFmpyIxh" },
        { uuid: "Macro.4Fv93LoAZZnFIurP" },
        { uuid: "Macro.nMO0AuXzQNXNrdaY" }
      ]
    }
  ]
};

// =====================================
// SETTINGS REGISTRATION
// =====================================
const SETTING_KEY = "config";
const MODULE_KEY = "cpr-gm-screen";

if (!game.settings.settings.has(`${MODULE_KEY}.${SETTING_KEY}`)) {
  game.settings.register(MODULE_KEY, SETTING_KEY, {
    scope: "world",
    config: false,
    type: Object,
    default: ML_DEFAULTS
  });
}

let mlConfig = game.settings.get(MODULE_KEY, SETTING_KEY);
if (!mlConfig || !mlConfig._initialized) {
  mlConfig = { ...foundry.utils.deepClone(ML_DEFAULTS), _initialized: true };
  await game.settings.set(MODULE_KEY, SETTING_KEY, mlConfig);
}

// =====================================
// CSS
// =====================================
const mlStyle = `
<style>
  .ml-wrapper {
    --ml-samurai: #ED2E28;
    --ml-biz: #D7818F;
    --ml-chinotto: #544942;
    --ml-asphalt: #100B08;
    --ml-bg: #0a0908;
    --ml-border: #2a1f1c;
    --ml-morel: #9A6E80;
    --ml-blood: #C52D29;
    --ml-edit: #b87333;
    --ml-edit-dim: #7a4d22;
    background: var(--ml-asphalt);
    color: #fff;
    padding: 0;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    font-family: inherit;
  }

  /* ---- Header ---- */
  .ml-header {
    padding: 10px 16px;
    background: linear-gradient(135deg, var(--ml-bg), var(--ml-asphalt));
    border-bottom: 2px solid var(--ml-samurai);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .ml-header-left {
    display: flex;
    gap: 4px;
    width: 60px;
    align-items: center;
  }
  .ml-header-right {
    width: 60px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }
  .ml-header-text { flex: 1; text-align: center; }
  .ml-title {
    font-size: 1.2em;
    font-weight: bold;
    color: var(--ml-samurai);
    text-transform: uppercase;
    letter-spacing: 2px;
    text-shadow: 0 0 10px var(--ml-samurai);
  }
  .ml-subtitle {
    font-size: 0.75em;
    color: var(--ml-biz);
    font-style: italic;
    opacity: 0.9;
  }
  .ml-edit-badge {
    font-size: 0.6em;
    color: var(--ml-edit);
    text-transform: uppercase;
    letter-spacing: 2px;
    border: 1px solid var(--ml-edit);
    padding: 2px 6px;
    border-radius: 3px;
    margin-top: 3px;
    display: inline-block;
  }

  /* ---- Header icon buttons (gear, add-tab, add-macro) ---- */
  .ml-hdr-btn {
    background: none;
    border: 1px solid var(--ml-border);
    border-radius: 3px;
    color: var(--ml-morel);
    cursor: pointer;
    width: 26px;
    height: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8em;
    transition: all 0.2s;
    flex-shrink: 0;
    padding: 0;
  }
  .ml-hdr-btn:hover { border-color: var(--ml-samurai); color: var(--ml-samurai); }
  .ml-hdr-btn.active { border-color: var(--ml-edit); color: var(--ml-edit); }
  .ml-hdr-btn.edit-add { border-color: var(--ml-edit-dim); color: var(--ml-edit-dim); }
  .ml-hdr-btn.edit-add:hover { border-color: var(--ml-edit); color: var(--ml-edit); }

  /* ---- Tab bar ---- */
  .ml-tab-bar {
    display: flex;
    align-items: flex-end;
    gap: 2px;
    background: var(--ml-bg);
    padding: 8px 8px 0 8px;
    border-bottom: 2px solid var(--ml-border);
    flex-wrap: wrap;
    min-height: 46px;
  }
  .ml-tab {
    flex: 1;
    min-width: 100px;
    padding: 8px 12px;
    background: var(--ml-chinotto);
    color: var(--ml-morel);
    border: none;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
    font-weight: bold;
    font-size: 0.8em;
    text-transform: uppercase;
    letter-spacing: 1px;
    cursor: pointer;
    transition: all 0.2s;
    border-bottom: 3px solid transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    position: relative;
    user-select: none;
    text-align: center;
  }
  .ml-tab:hover { background: var(--ml-border); color: var(--ml-biz); }
  .ml-tab.active {
    background: var(--ml-asphalt);
    color: var(--ml-samurai);
    border-bottom: 3px solid var(--ml-samurai);
    box-shadow: 0 0 10px rgba(237,46,40,0.3);
  }
  .ml-tab.drag-over { background: rgba(184,115,51,0.25); border-bottom-color: var(--ml-edit) !important; }
  .ml-tab-label { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: center; }
  .ml-tab-rename {
    flex: 1;
    background: transparent;
    border: none;
    border-bottom: 1px solid var(--ml-edit);
    color: var(--ml-edit);
    font: inherit;
    font-size: 0.95em;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 1px;
    outline: none;
    text-align: center;
    min-width: 40px;
  }
  .ml-tab-drag-handle {
    cursor: grab;
    color: var(--ml-morel);
    font-size: 0.75em;
    flex-shrink: 0;
    opacity: 0.6;
  }
  .ml-tab-delete {
    background: none;
    border: 1px solid var(--ml-border);
    border-radius: 3px;
    color: var(--ml-morel);
    cursor: pointer;
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7em;
    flex-shrink: 0;
    line-height: 1;
    padding: 0;
    transition: all 0.15s;
  }
  .ml-tab-delete:hover { color: var(--ml-samurai); border-color: var(--ml-samurai); }

  /* ---- Content ---- */
  .ml-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    background: var(--ml-asphalt);
  }
  .ml-tab-panel { display: none; }
  .ml-tab-panel.active { display: block; }

  /* ---- Note banner ---- */
  .ml-note {
    background: linear-gradient(135deg, rgba(237,46,40,0.12), rgba(237,46,40,0.04));
    border: 1px solid var(--ml-samurai);
    border-left: 4px solid var(--ml-samurai);
    border-radius: 4px;
    padding: 10px 14px;
    margin-bottom: 14px;
    display: flex;
    align-items: center;
    gap: 10px;
    color: var(--ml-biz);
    font-size: 0.88em;
  }
  .ml-note i { color: var(--ml-samurai); flex-shrink: 0; }
  .ml-note-input {
    width: 100%;
    background: rgba(237,46,40,0.07);
    border: 1px solid var(--ml-edit-dim);
    border-radius: 3px;
    color: var(--ml-biz);
    font: inherit;
    font-size: 0.88em;
    padding: 8px 12px;
    margin-bottom: 14px;
    outline: none;
    box-sizing: border-box;
  }
  .ml-note-input:focus { border-color: var(--ml-edit); }
  .ml-note-input::placeholder { color: var(--ml-morel); opacity: 0.6; }

  /* ---- Macro grid ---- */
  .ml-macro-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 10px;
  }
  .ml-macro-btn {
    background: var(--ml-chinotto);
    border: 2px solid var(--ml-border);
    border-radius: 6px;
    padding: 12px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 7px;
    min-height: 95px;
    justify-content: center;
    position: relative;
    user-select: none;
  }
  .ml-macro-btn.clickable:hover {
    background: var(--ml-border);
    border-color: var(--ml-samurai);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(237,46,40,0.35);
  }
  .ml-macro-btn.clickable:active { transform: translateY(0); }
  .ml-macro-btn.editable { cursor: default; }
  .ml-macro-btn.drag-over { border-color: var(--ml-edit) !important; background: rgba(184,115,51,0.15) !important; }
  .ml-macro-btn.dragging { opacity: 0.35; }
  .ml-macro-icon {
    width: 44px;
    height: 44px;
    object-fit: contain;
    filter: drop-shadow(0 0 3px rgba(237,46,40,0.3));
  }
  .ml-macro-name {
    font-size: 0.8em;
    font-weight: bold;
    color: var(--ml-biz);
    text-align: center;
    line-height: 1.2;
    word-break: break-word;
  }
  .ml-macro-delete {
    position: absolute;
    top: 4px;
    right: 4px;
    background: rgba(16,11,8,0.85);
    border: 1px solid var(--ml-border);
    border-radius: 3px;
    color: var(--ml-morel);
    cursor: pointer;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7em;
    padding: 0;
    transition: all 0.15s;
  }
  .ml-macro-delete:hover { color: var(--ml-samurai); border-color: var(--ml-samurai); }
  .ml-macro-drag-handle {
    position: absolute;
    top: 4px;
    left: 5px;
    color: var(--ml-morel);
    font-size: 0.7em;
    cursor: grab;
    opacity: 0.5;
    line-height: 1;
  }

  /* ---- Add macro placeholder card ---- */
  .ml-add-macro-card {
    background: none;
    border: 2px dashed var(--ml-edit-dim);
    border-radius: 6px;
    color: var(--ml-edit-dim);
    cursor: pointer;
    min-height: 95px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-size: 0.8em;
    font-weight: bold;
    letter-spacing: 1px;
    transition: all 0.2s;
  }
  .ml-add-macro-card:hover { border-color: var(--ml-edit); color: var(--ml-edit); }
  .ml-add-macro-card i { font-size: 1.3em; }

  /* ---- Empty state ---- */
  .ml-empty {
    text-align: center;
    padding: 30px 20px;
    color: var(--ml-morel);
    font-style: italic;
    font-size: 0.9em;
  }

  /* ---- Footer ---- */
  .ml-footer {
    padding: 10px 16px;
    background: var(--ml-bg);
    border-top: 2px solid var(--ml-border);
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }
  .ml-btn {
    padding: 7px 18px;
    border-radius: 4px;
    font-weight: bold;
    font-size: 0.85em;
    cursor: pointer;
    letter-spacing: 0.5px;
    border: none;
    transition: all 0.2s;
  }
  .ml-btn-save { background: var(--ml-samurai); color: #fff; }
  .ml-btn-save:hover { background: var(--ml-blood); }
  .ml-btn-cancel { background: var(--ml-chinotto); color: var(--ml-morel); border: 1px solid var(--ml-border); }
  .ml-btn-cancel:hover { color: #fff; border-color: var(--ml-morel); }

  /* ---- Not found ---- */
  .ml-macro-notfound { border-color: var(--ml-blood) !important; opacity: 0.55; }

  /* ---- Scrollbar ---- */
  .ml-content::-webkit-scrollbar { width: 6px; }
  .ml-content::-webkit-scrollbar-track { background: var(--ml-bg); }
  .ml-content::-webkit-scrollbar-thumb { background: var(--ml-chinotto); border-radius: 3px; }
  .ml-content::-webkit-scrollbar-thumb:hover { background: var(--ml-border); }

  /* ---- App window ---- */
  #cpr-gm-screen.window-app .window-content {
    padding: 0 !important;
    background: #100B08;
  }
  #cpr-gm-screen.window-app .window-header {
    background: linear-gradient(135deg, #0a0908, #100B08);
    border-bottom: 2px solid #ED2E28;
  }

  /* ---- Macro picker ---- */
  .ml-picker-wrap { display: flex; flex-direction: column; height: 400px; }
  .ml-picker-search {
    padding: 7px 10px;
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 3px;
    color: #1afe49;
    font: inherit;
    margin-bottom: 8px;
    outline: none;
    width: 100%;
    box-sizing: border-box;
    font-size: 0.9em;
  }
  .ml-picker-search:focus { border-color: #1afe49; }
  .ml-picker-tree {
    flex: 1;
    overflow-y: auto;
    border: 1px solid #222;
    border-radius: 3px;
    background: #0d0d0d;
  }
  .ml-picker-folder { border-bottom: 1px solid #111; }
  .ml-picker-folder-header {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 7px 10px;
    cursor: pointer;
    color: #aaa;
    font-size: 0.85em;
    font-weight: bold;
    background: #1a1a1a;
    user-select: none;
  }
  .ml-picker-folder-header:hover { background: #222; color: #fff; }
  .ml-picker-folder-items { display: none; }
  .ml-picker-folder.open .ml-picker-folder-items { display: block; }
  .ml-picker-folder.open .ml-picker-chevron { transform: rotate(90deg); }
  .ml-picker-chevron { transition: transform 0.15s; display: inline-block; font-style: normal; }
  .ml-picker-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px 6px 26px;
    cursor: pointer;
    border-bottom: 1px solid #111;
    font-size: 0.85em;
    color: #bbb;
    transition: background 0.1s;
  }
  .ml-picker-item:hover { background: rgba(26,254,73,0.08); color: #1afe49; }
  .ml-picker-item img { width: 20px; height: 20px; object-fit: contain; flex-shrink: 0; }
  .ml-picker-unfoldered { padding-left: 12px; }
  .ml-picker-empty { padding: 20px; text-align: center; color: #444; font-size: 0.85em; }
</style>`;

// =====================================
// UTILITY
// =====================================
function generateId() {
  return "tab-" + Math.random().toString(36).substr(2, 9);
}

// =====================================
// MACRO PICKER
// =====================================
function showMacroPicker(onPick) {
  const macroFolders = game.folders.filter(f => f.type === "Macro");
  const allMacros = game.macros.contents;

  function buildTree(search = "") {
    const sl = search.toLowerCase();
    const match = (m) => !sl || m.name.toLowerCase().includes(sl);

    function renderFolder(folder) {
      const children = macroFolders.filter(f => f.folder?.id === folder.id);
      const macros = allMacros.filter(m => m.folder?.id === folder.id && match(m));
      const childrenHTML = children.map(c => renderFolder(c)).filter(Boolean).join("");
      if (!macros.length && !childrenHTML) return "";
      const macrosHTML = macros.map(m => `
        <div class="ml-picker-item" data-uuid="Macro.${m.id}">
          <img src="${m.img || 'icons/svg/dice-target.svg'}" alt="">
          ${m.name}
        </div>`).join("");
      return `
        <div class="ml-picker-folder open">
          <div class="ml-picker-folder-header">
            <span class="ml-picker-chevron">▶</span>
            <i class="fas fa-folder fa-sm"></i>
            ${folder.name}
          </div>
          <div class="ml-picker-folder-items">${childrenHTML}${macrosHTML}</div>
        </div>`;
    }

    const rootFolders = macroFolders.filter(f => !f.folder);
    const rootMacros = allMacros.filter(m => !m.folder && match(m));
    const html = rootFolders.map(f => renderFolder(f)).filter(Boolean).join("")
      + rootMacros.map(m => `
        <div class="ml-picker-item ml-picker-unfoldered" data-uuid="Macro.${m.id}">
          <img src="${m.img || 'icons/svg/dice-target.svg'}" alt="">
          ${m.name}
        </div>`).join("");
    return html || `<div class="ml-picker-empty">No macros found</div>`;
  }

  const dialog = new Dialog({
    title: "Add Macro",
    content: `
      <div class="ml-picker-wrap">
        <input type="text" class="ml-picker-search" placeholder="Search macros..." id="ml-picker-search">
        <div class="ml-picker-tree" id="ml-picker-tree">${buildTree()}</div>
      </div>`,
    buttons: { cancel: { label: "Cancel" } },
    default: "cancel",
    render: (html) => {
      html.on("click", ".ml-picker-folder-header", (e) => {
        $(e.currentTarget).closest(".ml-picker-folder").toggleClass("open");
      });
      html.on("click", ".ml-picker-item", (e) => {
        const uuid = $(e.currentTarget).data("uuid");
        dialog.close();
        onPick({ uuid });
      });
      html.find("#ml-picker-search").on("input", (e) => {
        const s = e.currentTarget.value;
        html.find("#ml-picker-tree").html(buildTree(s));
        if (s) html.find(".ml-picker-folder").addClass("open");
      });
    }
  }, { width: 380, height: 520 });

  dialog.render(true);
}

// =====================================
// MAIN APP
// =====================================
class CPRGMScreen extends Application {
  constructor(options = {}) {
    super(options);
    this.config = foundry.utils.deepClone(mlConfig);
    this.editMode = false;
    this.activeTabId = this.config.tabs[0]?.id ?? null;
    this.macroData = {};
    this._dragSrcTabId = null;
    this._dragSrcMacroIdx = null;
    this._dragSrcTabIdForMacro = null;
  }

  static get defaultOptions() {
    // Load saved position/size if available
    const saved = game.settings.get(MODULE_KEY, SETTING_KEY);
    const pos = saved?._windowPos ?? {};
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "cpr-gm-screen",
      title: "CPR GM Screen",
      template: null,
      classes: ["cpr-gm-screen"],
      width: pos.width ?? 700,
      height: pos.height ?? 540,
      top: pos.top ?? undefined,
      left: pos.left ?? undefined,
      resizable: true
    });
  }

  get template() { return null; }

  async close(options = {}) {
    // Save window position and size before closing
    try {
      const pos = {
        width: this.position.width,
        height: this.position.height,
        top: this.position.top,
        left: this.position.left
      };
      const current = game.settings.get(MODULE_KEY, SETTING_KEY);
      await game.settings.set(MODULE_KEY, SETTING_KEY, { ...current, _windowPos: pos });
      mlConfig = game.settings.get(MODULE_KEY, SETTING_KEY);
    } catch (e) { /* don't block close on error */ }
    return super.close(options);
  }

  async _loadMacroData() {
    for (const tab of this.config.tabs) {
      for (const m of tab.macros) {
        if (this.macroData[m.uuid] !== undefined) continue;
        try {
          const macro = await fromUuid(m.uuid);
          this.macroData[m.uuid] = macro
            ? { name: macro.name, icon: macro.img, macro }
            : null;
        } catch { this.macroData[m.uuid] = null; }
      }
    }
  }

  async _renderInner() {
    await this._loadMacroData();
    return $(this._buildHTML());
  }

  // ---- Builders ----

  _buildHTML() {
    return `
      ${mlStyle}
      <div class="ml-wrapper" id="ml-wrapper">
        ${this._buildHeader()}
        ${this._buildTabBar()}
        <div class="ml-content" id="ml-content">
          ${this._buildPanels()}
        </div>
        ${this._buildFooter()}
      </div>`;
  }

  _buildHeader() {
    const E = this.editMode;
    const leftBtns = E ? `
      <button class="ml-hdr-btn edit-add" id="ml-add-tab-btn" title="Add new tab">
        <i class="fas fa-folder-plus"></i>
      </button>` : `<span></span>`;

    return `
      <div class="ml-header">
        <div class="ml-header-left">${leftBtns}</div>
        <div class="ml-header-text">
          <div class="ml-title">${this.config.title}</div>
          <div class="ml-subtitle">${this.config.subtitle}</div>
          ${E ? '<div class="ml-edit-badge">— Editing —</div>' : ''}
        </div>
        <div class="ml-header-right">
          <button class="ml-hdr-btn ${E ? 'active' : ''}" id="ml-gear-btn" title="${E ? 'Exit edit mode' : 'Edit layout'}">
            <i class="fas fa-cog"></i>
          </button>
        </div>
      </div>`;
  }

  _buildTabBar() {
    const E = this.editMode;
    const tabs = this.config.tabs.map(tab => {
      const isActive = tab.id === this.activeTabId;
      const label = E
        ? `<input class="ml-tab-rename" type="text" value="${tab.name}" data-tab-id="${tab.id}">`
        : `<span class="ml-tab-label">${tab.name}</span>`;
      const editControls = E ? `
        <span class="ml-tab-drag-handle" title="Drag to reorder">⠿</span>
        <button class="ml-tab-delete" data-tab-id="${tab.id}" title="Remove tab">✕</button>` : '';
      return `
        <div class="ml-tab ${isActive ? 'active' : ''}"
             data-tab-id="${tab.id}"
             title="${tab.name}"
             draggable="${E}">
          ${editControls}
          ${label}
        </div>`;
    }).join("");

    return `<div class="ml-tab-bar" id="ml-tab-bar">${tabs}</div>`;
  }

  _buildPanels() {
    return this.config.tabs.map(tab => `
      <div class="ml-tab-panel ${tab.id === this.activeTabId ? 'active' : ''}" data-panel-id="${tab.id}">
        ${this._buildPanel(tab)}
      </div>`).join("");
  }

  _buildPanel(tab) {
    const E = this.editMode;

    // Note
    let noteHTML = "";
    if (E) {
      noteHTML = `<input type="text" class="ml-note-input" data-tab-id="${tab.id}"
        value="${tab.note || ''}" placeholder="Tab note — shown as an info banner when populated">`;
    } else if (tab.note) {
      noteHTML = `<div class="ml-note"><i class="fas fa-info-circle"></i>${tab.note}</div>`;
    }

    // Macro cards
    const cards = tab.macros.map((m, idx) => {
      const data = this.macroData[m.uuid];
      const editAttrs = E ? `draggable="true" data-macro-idx="${idx}" data-tab-id="${tab.id}"` : '';
      const editControls = E ? `
        <span class="ml-macro-drag-handle">⠿</span>
        <button class="ml-macro-delete" data-tab-id="${tab.id}" data-macro-idx="${idx}" title="Remove">✕</button>` : '';

      if (!data) {
        return `
          <div class="ml-macro-btn ml-macro-notfound ${E ? 'editable' : 'clickable'}" ${editAttrs} data-uuid="${m.uuid}">
            ${editControls}
            <i class="fas fa-exclamation-triangle" style="color:#ED2E28;font-size:1.4em;"></i>
            <span class="ml-macro-name" style="color:#9A6E80;">Not Found</span>
          </div>`;
      }

      return `
        <div class="ml-macro-btn ${E ? 'editable' : 'clickable'}" ${editAttrs} data-uuid="${m.uuid}" title="${data.name}">
          ${editControls}
          <img src="${data.icon || 'icons/svg/dice-target.svg'}" class="ml-macro-icon" alt="">
          <span class="ml-macro-name">${data.name}</span>
        </div>`;
    }).join("");

    // Add macro card (edit mode only)
    const addCard = E ? `
      <div class="ml-add-macro-card" data-tab-id="${tab.id}" title="Add macro to this tab">
        <i class="fas fa-plus"></i>
        <span>Add Macro</span>
      </div>` : '';

    const grid = (tab.macros.length === 0 && !E)
      ? `<div class="ml-empty">No macros in this tab.</div>`
      : `<div class="ml-macro-grid">${cards}${addCard}</div>`;

    return noteHTML + grid;
  }

  _buildFooter() {
    const display = this.editMode ? 'flex' : 'none';
    return `
      <div class="ml-footer" id="ml-footer" style="display:${display}">
        <button class="ml-btn ml-btn-cancel" id="ml-cancel-btn">Cancel</button>
        <button class="ml-btn ml-btn-save" id="ml-save-btn">Save</button>
      </div>`;
  }

  // ---- Refresh ----
  _refreshAll(html) {
    html.find("#ml-wrapper").replaceWith(this._buildHTML().replace(mlStyle, ''));
    // Re-inject style only if not present
    if (!html.find('style').length) html.prepend(mlStyle);
    this._attachListeners(html);
  }

  _refreshHeader(html) {
    html.find(".ml-header").replaceWith(this._buildHeader());
  }

  _refreshTabBar(html) {
    html.find("#ml-tab-bar").replaceWith(this._buildTabBar());
  }

  _refreshContent(html) {
    html.find("#ml-content").html(this._buildPanels());
    html.find("#ml-footer").css("display", this.editMode ? "flex" : "none");
  }

  _fullRefresh(html) {
    html.find(".ml-header").replaceWith(this._buildHeader());
    html.find("#ml-tab-bar").replaceWith(this._buildTabBar());
    html.find("#ml-content").html(this._buildPanels());
    html.find("#ml-footer").css("display", this.editMode ? "flex" : "none");
    this._attachListeners(html);
  }

  _switchTab(tabId, html) {
    this.activeTabId = tabId;
    html.find(".ml-tab").removeClass("active");
    html.find(`.ml-tab[data-tab-id="${tabId}"]`).addClass("active");
    html.find(".ml-tab-panel").removeClass("active");
    html.find(`.ml-tab-panel[data-panel-id="${tabId}"]`).addClass("active");
  }

  // ---- Listeners ----
  activateListeners(html) {
    super.activateListeners(html);
    this._attachListeners(html);
  }

  _attachListeners(html) {
    const self = this;

    // Gear
    html.off("click", "#ml-gear-btn").on("click", "#ml-gear-btn", () => {
      if (self.editMode) {
        // Exit without saving — discard
        self.config = foundry.utils.deepClone(mlConfig);
        self.editMode = false;
      } else {
        self.editMode = true;
      }
      self._fullRefresh(html);
    });

    // Tab click — switch in both modes
    html.off("click", ".ml-tab").on("click", ".ml-tab", (e) => {
      if ($(e.target).hasClass("ml-tab-delete")
        || $(e.target).hasClass("ml-tab-drag-handle")
        || $(e.target).hasClass("ml-tab-rename")) return;
      const tabId = $(e.currentTarget).data("tab-id");
      if (tabId) {
        self._switchTab(tabId, html);
        // Refresh content in edit mode so note input updates
        if (self.editMode) self._refreshContent(html);
      }
    });

    // Tab rename
    html.off("input", ".ml-tab-rename").on("input", ".ml-tab-rename", (e) => {
      const tabId = $(e.currentTarget).data("tab-id");
      const tab = self.config.tabs.find(t => t.id === tabId);
      if (tab) tab.name = e.currentTarget.value;
    });

    // Note input
    html.off("input", ".ml-note-input").on("input", ".ml-note-input", (e) => {
      const tabId = $(e.currentTarget).data("tab-id");
      const tab = self.config.tabs.find(t => t.id === tabId);
      if (tab) tab.note = e.currentTarget.value;
    });

    // Tab delete
    html.off("click", ".ml-tab-delete").on("click", ".ml-tab-delete", (e) => {
      e.stopPropagation();
      const tabId = $(e.currentTarget).data("tab-id");
      self.config.tabs = self.config.tabs.filter(t => t.id !== tabId);
      if (self.activeTabId === tabId) self.activeTabId = self.config.tabs[0]?.id ?? null;
      self._fullRefresh(html);
    });

    // Add tab (header button)
    html.off("click", "#ml-add-tab-btn").on("click", "#ml-add-tab-btn", () => {
      const newTab = { id: generateId(), name: "New Tab", note: "", macros: [] };
      self.config.tabs.push(newTab);
      self.activeTabId = newTab.id;
      self._fullRefresh(html);
      setTimeout(() => html.find(`.ml-tab-rename[data-tab-id="${newTab.id}"]`).focus().select(), 50);
    });

    // Add macro (header + button)
    const addMacroPicker = () => {
      const tabId = self.activeTabId;
      showMacroPicker(async (picked) => {
        const tab = self.config.tabs.find(t => t.id === tabId);
        if (!tab) return;
        if (tab.macros.some(m => m.uuid === picked.uuid)) {
          ui.notifications.warn("That macro is already in this tab.");
          return;
        }
        tab.macros.push({ uuid: picked.uuid });
        if (self.macroData[picked.uuid] === undefined) {
          try {
            const macro = await fromUuid(picked.uuid);
            self.macroData[picked.uuid] = macro
              ? { name: macro.name, icon: macro.img, macro }
              : null;
          } catch { self.macroData[picked.uuid] = null; }
        }
        self._fullRefresh(html);
      });
    };

    html.off("click", ".ml-add-macro-card").on("click", ".ml-add-macro-card", addMacroPicker);

    // Macro execute (normal mode)
    html.off("click", ".ml-macro-btn.clickable").on("click", ".ml-macro-btn.clickable", async (e) => {
      const uuid = $(e.currentTarget).data("uuid");
      const data = self.macroData[uuid];
      if (!data?.macro) { ui.notifications.warn("Macro not found."); return; }
      try { await data.macro.execute(); }
      catch (err) { ui.notifications.error(`Failed: ${data.name}`); console.error(err); }
    });

    // Macro delete
    html.off("click", ".ml-macro-delete").on("click", ".ml-macro-delete", (e) => {
      e.stopPropagation();
      const tabId = $(e.currentTarget).data("tab-id");
      const idx = parseInt($(e.currentTarget).data("macro-idx"));
      const tab = self.config.tabs.find(t => t.id === tabId);
      if (tab) { tab.macros.splice(idx, 1); self._fullRefresh(html); }
    });

    // Save
    html.off("click", "#ml-save-btn").on("click", "#ml-save-btn", async () => {
      await game.settings.set(MODULE_KEY, SETTING_KEY, self.config);
      mlConfig = foundry.utils.deepClone(self.config);
      self.editMode = false;
      self._fullRefresh(html);
      ui.notifications.info("GM Screen saved.");
    });

    // Cancel
    html.off("click", "#ml-cancel-btn").on("click", "#ml-cancel-btn", () => {
      self.config = foundry.utils.deepClone(mlConfig);
      self.editMode = false;
      self._fullRefresh(html);
    });

    // ---- Drag: tabs ----
    html.off("dragstart", ".ml-tab[draggable='true']")
      .on("dragstart", ".ml-tab[draggable='true']", (e) => {
        self._dragSrcTabId = $(e.currentTarget).data("tab-id");
        e.originalEvent.dataTransfer.effectAllowed = "move";
      });
    html.off("dragover", ".ml-tab[draggable='true']")
      .on("dragover", ".ml-tab[draggable='true']", (e) => {
        e.preventDefault();
        html.find(".ml-tab").removeClass("drag-over");
        $(e.currentTarget).addClass("drag-over");
      });
    html.off("dragleave", ".ml-tab")
      .on("dragleave", ".ml-tab", (e) => { $(e.currentTarget).removeClass("drag-over"); });
    html.off("drop", ".ml-tab[draggable='true']")
      .on("drop", ".ml-tab[draggable='true']", (e) => {
        e.preventDefault();
        html.find(".ml-tab").removeClass("drag-over");
        const srcId = self._dragSrcTabId;
        const tgtId = $(e.currentTarget).data("tab-id");
        if (!srcId || srcId === tgtId) return;
        const tabs = self.config.tabs;
        const [moved] = tabs.splice(tabs.findIndex(t => t.id === srcId), 1);
        tabs.splice(tabs.findIndex(t => t.id === tgtId), 0, moved);
        self._dragSrcTabId = null;
        self._fullRefresh(html);
      });

    // ---- Drag: macros ----
    html.off("dragstart", ".ml-macro-btn[draggable='true']")
      .on("dragstart", ".ml-macro-btn[draggable='true']", (e) => {
        e.stopPropagation();
        self._dragSrcMacroIdx = parseInt($(e.currentTarget).data("macro-idx"));
        self._dragSrcTabIdForMacro = $(e.currentTarget).data("tab-id");
        $(e.currentTarget).addClass("dragging");
        e.originalEvent.dataTransfer.effectAllowed = "move";
      });
    html.off("dragend", ".ml-macro-btn")
      .on("dragend", ".ml-macro-btn", (e) => {
        $(e.currentTarget).removeClass("dragging");
        html.find(".ml-macro-btn").removeClass("drag-over");
      });
    html.off("dragover", ".ml-macro-btn[draggable='true']")
      .on("dragover", ".ml-macro-btn[draggable='true']", (e) => {
        e.preventDefault();
        e.stopPropagation();
        html.find(".ml-macro-btn").removeClass("drag-over");
        $(e.currentTarget).addClass("drag-over");
      });
    html.off("drop", ".ml-macro-btn[draggable='true']")
      .on("drop", ".ml-macro-btn[draggable='true']", (e) => {
        e.preventDefault();
        e.stopPropagation();
        html.find(".ml-macro-btn").removeClass("drag-over");
        const srcTabId = self._dragSrcTabIdForMacro;
        const srcIdx = self._dragSrcMacroIdx;
        const tgtTabId = $(e.currentTarget).data("tab-id");
        const tgtIdx = parseInt($(e.currentTarget).data("macro-idx"));
        if (srcIdx === null || isNaN(tgtIdx)) return;
        const srcTab = self.config.tabs.find(t => t.id === srcTabId);
        const tgtTab = self.config.tabs.find(t => t.id === tgtTabId);
        if (!srcTab || !tgtTab) return;
        const [moved] = srcTab.macros.splice(srcIdx, 1);
        tgtTab.macros.splice(tgtIdx, 0, moved);
        self._dragSrcMacroIdx = null;
        self._dragSrcTabIdForMacro = null;
        self._fullRefresh(html);
      });
  }
}

// =====================================
// LAUNCH
// =====================================
const existing = Object.values(ui.windows).find(w => w.id === "cpr-gm-screen");
if (existing) { existing.bringToTop(); }
else { new CPRGMScreen().render(true); }
