// ============================================================
//  CYBERPUNK RED — HQ WORKSHEET MACRO
//  Foundry VTT v12 | No Place Like Home (RTG, 2024)
//  ============================================================
//  CONFIGURATION — edit UUIDs here to match your world or
//  future compendium entries. Swap JournalEntry.XXX paths
//  for Compendium.your-module.folder.XXX when ready.
// ============================================================

const HQ_CONFIG = {
  // World setting key — change only if you have a conflict
  settingKey: "cyberpunk-hq-worksheet",

  // The journal entry to overwrite when "Export to Journal" is clicked.
  // Set to the UUID of your HQ journal entry (the parent, not a page).
  // Example: "JournalEntry.YtHMR08IO46NOheA"
  // Leave as null to create a new journal entry on first export.
  summaryJournalUUID: null,

  // The page within that journal to update. Leave null to update first page.
  summaryPageUUID: null,

  // UUID for the No Place Like Home rulebook reference (optional, shown at top of export).
  // Set to null to omit the link.
  rulebookUUID: null,

  // Per-improvement journal page UUIDs for clickable links in the export.
  improvements: {
    evidenceWall:  { label: "Evidence Wall",  uuid: "JournalEntry.YtHMR08IO46NOheA.JournalEntryPage.PlNKaeRP93fnw6FU" },
    garage:        { label: "Garage",         uuid: "JournalEntry.YtHMR08IO46NOheA.JournalEntryPage.gnimzNwn82Q2HhcA" },
    lockup:        { label: "Lockup",         uuid: "JournalEntry.YtHMR08IO46NOheA.JournalEntryPage.coanL02laKfPNr7j" },
    lounge:        { label: "Lounge",         uuid: "JournalEntry.YtHMR08IO46NOheA.JournalEntryPage.1zedsikdOe6PgZyq" },
    medbay:        { label: "Medbay",         uuid: "JournalEntry.YtHMR08IO46NOheA.JournalEntryPage.Y5EjZycCfCNTnhrI" },
    moraleBoost:   { label: "Morale Boost",   uuid: "JournalEntry.YtHMR08IO46NOheA.JournalEntryPage.JocBM3fWRQwM0wly" },
    rentReduction: { label: "Rent Reduction", uuid: "JournalEntry.YtHMR08IO46NOheA.JournalEntryPage.aWCEHOL7z4feK1hx" },
    serverRoom:    { label: "Server Room",    uuid: "JournalEntry.YtHMR08IO46NOheA.JournalEntryPage.bpTbZCoZmkFTA1SQ" },
    studio:        { label: "Studio",         uuid: "JournalEntry.YtHMR08IO46NOheA.JournalEntryPage.wlsHXxRKrp3doNpt" },
    trainingArea:  { label: "Training Area",  uuid: "JournalEntry.YtHMR08IO46NOheA.JournalEntryPage.xX50WzGQ5KFlSTzJ" },
    workshop:      { label: "Workshop",       uuid: "JournalEntry.YtHMR08IO46NOheA.JournalEntryPage.atZZ2tkTYKTvhxhr" },
    workstation:   { label: "Workstation",    uuid: "JournalEntry.YtHMR08IO46NOheA.JournalEntryPage.ZHRyeenPcgUlbZ9x" },
  }
};

// ============================================================
//  CONSTANTS
// ============================================================

const IP_COST = 40;
const SETTING_NAMESPACE = "world";

// Which improvements support multiple upgrade levels (RAW)
const MULTI_LEVEL = {
  moraleBoost:   { max: 10, label: "Level" },
  rentReduction: { max: 8,  label: "Level" }, // RAW cap varies by housing; 8 is safe ceiling
};

// Improvements that have an upgrade option at all
const HAS_UPGRADE = [
  "evidenceWall","garage","lockup","lounge","medbay",
  "moraleBoost","rentReduction","serverRoom","studio",
  "trainingArea","workshop","workstation"
];

// ============================================================
//  SETTING REGISTRATION & HELPERS
// ============================================================

function ensureSetting() {
  if (!game.settings.settings.has(`${SETTING_NAMESPACE}.${HQ_CONFIG.settingKey}`)) {
    game.settings.register(SETTING_NAMESPACE, HQ_CONFIG.settingKey, {
      name: "HQ Worksheet Data",
      scope: "world",
      config: false,
      type: Object,
      default: getDefaultData(),
    });
  }
}

function getDefaultData() {
  const improvements = {};
  for (const key of Object.keys(HQ_CONFIG.improvements)) {
    improvements[key] = { improved: false, upgraded: false, upgradeLevel: 0 };
  }
  return {
    name: "",
    location: "",
    monthlyRent: "",
    hqIP: 0,
    description: "",
    notes: "",
    improvements,
    _journalUUID: null,
    _pageUUID: null,
  };
}

function loadData() {
  ensureSetting();
  const saved = game.settings.get(SETTING_NAMESPACE, HQ_CONFIG.settingKey);
  // Merge with defaults to handle any missing keys from older saves
  const defaults = getDefaultData();
  const data = foundry.utils.mergeObject(defaults, saved, { inplace: false });
  // Restore any previously generated journal UUIDs into HQ_CONFIG
  // so they survive macro re-runs without needing a manual config edit
  if (data._journalUUID) HQ_CONFIG.summaryJournalUUID = data._journalUUID;
  if (data._pageUUID)    HQ_CONFIG.summaryPageUUID    = data._pageUUID;
  return data;
}

async function saveData(data) {
  ensureSetting();
  await game.settings.set(SETTING_NAMESPACE, HQ_CONFIG.settingKey, data);
}

// ============================================================
//  COMPUTED TOTALS
// ============================================================

function computeSpent(improvements) {
  let spent = 0;
  for (const [key, val] of Object.entries(improvements)) {
    if (val.improved) spent += IP_COST;
    if (MULTI_LEVEL[key]) {
      spent += val.upgradeLevel * IP_COST;
    } else {
      if (val.upgraded) spent += IP_COST;
    }
  }
  return spent;
}

// ============================================================
//  DIALOG HTML BUILDER
// ============================================================

function buildDialogHTML(data) {
  const spent = computeSpent(data.improvements);

  // Two-column auto-flow grid: each card has name, improve toggle, upgrade control
  const improvementCards = Object.entries(HQ_CONFIG.improvements).map(([key, cfg]) => {
    const state  = data.improvements[key];
    const isMulti = !!MULTI_LEVEL[key];
    const hasUpg  = HAS_UPGRADE.includes(key);

    // Upgrade control
    let upgradeControl = "";
    if (!hasUpg) {
      upgradeControl = `<span class="hq-upg-none">—</span>`;
    } else if (isMulti) {
      const max = MULTI_LEVEL[key].max;
      const options = Array.from({ length: max + 1 }, (_, i) =>
        `<option value="${i}" ${state.upgradeLevel === i ? "selected" : ""}>${i === 0 ? "—" : `Lvl ${i}`}</option>`
      ).join("");
      upgradeControl = `
        <select class="hq-upgrade-select" data-key="${key}" ${!state.improved ? "disabled" : ""}>
          ${options}
        </select>`;
    } else {
      upgradeControl = `
        <label class="hq-toggle ${!state.improved ? "hq-toggle-disabled" : ""}">
          <input type="checkbox" class="hq-upgrade-check" data-key="${key}"
            ${state.upgraded ? "checked" : ""}
            ${!state.improved ? "disabled" : ""}>
          <span class="hq-toggle-track"><span class="hq-toggle-thumb"></span></span>
        </label>`;
    }

    // Name is a link if a UUID is configured, plain text otherwise
    const nameHTML = cfg.uuid
      ? `<a class="hq-card-link" data-uuid="${cfg.uuid}" title="Open journal entry">${cfg.label}</a>`
      : `<span>${cfg.label}</span>`;

    return `
      <div class="hq-card ${state.improved ? "hq-card-active" : ""}" data-card="${key}">
        <div class="hq-card-name">${nameHTML}</div>
        <div class="hq-card-controls">
          <div class="hq-card-ctrl">
            <span class="hq-ctrl-label">Improved</span>
            <label class="hq-toggle">
              <input type="checkbox" class="hq-improve-check" data-key="${key}"
                ${state.improved ? "checked" : ""}>
              <span class="hq-toggle-track"><span class="hq-toggle-thumb"></span></span>
            </label>
          </div>
          <div class="hq-card-ctrl hq-card-ctrl-upg">
            <span class="hq-ctrl-label">Upgraded</span>
            ${upgradeControl}
          </div>
        </div>
      </div>`;
  }).join("");

  return `
<div id="hq-worksheet">

<style>
  #hq-worksheet {
    font-family: 'Rajdhani', 'Share Tech Mono', monospace, sans-serif;
    background: #1B1F21;
    color: #E8E8E8;
    margin: -8px;
    display: flex;
    flex-direction: column;
    /* Fill whatever height Foundry gives the dialog content area */
    height: calc(100vh - 160px);
    min-height: 420px;
    max-height: 620px;
  }
  #hq-worksheet * { box-sizing: border-box; }

  /* ── Header ── */
  .hq-header {
    background: #E64539;
    padding: 8px 14px;
    display: flex;
    align-items: center;
    gap: 10px;
    border-bottom: 3px solid #111;
    flex-shrink: 0;
  }
  .hq-header-icon {
    width: 28px; height: 28px;
    display: flex; align-items: center; justify-content: center;
    background: #1B1F21;
    color: #E64539;
    font-size: 16px;
    font-weight: 900;
    border: 2px solid rgba(255,255,255,0.3);
    flex-shrink: 0;
  }
  .hq-header h1 {
    margin: 0; padding: 0;
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: #1B1F21;
  }

  /* ── Scrollable body ── */
  .hq-body {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: thin;
    scrollbar-color: #3A3F5E #12151A;
  }
  .hq-body::-webkit-scrollbar { width: 6px; }
  .hq-body::-webkit-scrollbar-track { background: #12151A; }
  .hq-body::-webkit-scrollbar-thumb { background: #3A3F5E; border-radius: 3px; }

  /* ── Sections ── */
  .hq-section {
    padding: 8px 12px 6px;
    border-bottom: 1px solid #252930;
  }
  .hq-section-title {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: #E64539;
    margin: 0 0 6px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .hq-section-title::after {
    content: "";
    flex: 1;
    height: 1px;
    background: #E64539;
    opacity: 0.35;
  }
  .hq-section-title .hq-title-note {
    font-size: 8px;
    color: #6B7280;
    font-weight: 400;
    letter-spacing: 1px;
    text-transform: none;
  }

  /* ── Field grid ── */
  .hq-field-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 5px 10px;
  }
  .hq-field { display: flex; flex-direction: column; gap: 2px; }
  .hq-field-full { grid-column: 1 / -1; }
  .hq-label {
    font-size: 8px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #9BA4B4;
    font-weight: 600;
  }
  .hq-input {
    background: #12151A;
    border: 1px solid #3A3F5E;
    color: #E8E8E8;
    padding: 4px 7px;
    font-size: 12px;
    font-family: inherit;
    width: 100%;
    transition: border-color 0.15s;
  }
  .hq-input:focus { outline: none; border-color: #E64539; }

  /* ── IP bar ── */
  .hq-ip-row {
    display: flex;
    gap: 8px;
    align-items: flex-end;
  }
  .hq-ip-field { width: 110px; flex-shrink: 0; }
  .hq-ip-input-row { display: flex; gap: 4px; align-items: stretch; }
  .hq-ip-add-btn {
    background: #3A3F5E;
    border: 1px solid #4A5070;
    color: #E8E8E8;
    font-size: 16px;
    font-weight: 700;
    line-height: 1;
    width: 26px;
    cursor: pointer;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s, border-color 0.15s;
    padding: 0;
  }
  .hq-ip-add-btn:hover { background: #E64539; border-color: #E64539; }
  .hq-ip-bar {
    flex: 1;
    background: #12151A;
    border: 1px solid #3A3F5E;
    padding: 5px 10px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .hq-ip-remaining {
    font-size: 17px;
    font-weight: 700;
    color: #E64539;
    min-width: 36px;
    text-align: right;
    flex-shrink: 0;
  }
  .hq-ip-remaining.hq-ip-low  { color: #D4A017; }
  .hq-ip-remaining.hq-ip-zero { color: #555; }
  .hq-ip-track {
    flex: 1;
    height: 3px;
    background: #3A3F5E;
    border-radius: 2px;
    overflow: hidden;
  }
  .hq-ip-fill {
    height: 100%;
    background: #E64539;
    transition: width 0.3s ease;
  }
  .hq-ip-spent { font-size: 9px; color: #6B7280; flex-shrink: 0; }

  /* ── Improvements two-column card grid ── */
  .hq-card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 4px;
  }
  .hq-card {
    background: #1E2329;
    border: 1px solid #2a2f38;
    padding: 6px 8px;
    display: flex;
    flex-direction: column;
    gap: 5px;
    transition: border-color 0.15s, background 0.15s;
  }
  .hq-card:hover { background: #222830; border-color: #3A3F5E; }
  .hq-card-active {
    background: #1A2824 !important;
    border-color: #2a4a40 !important;
    border-left: 2px solid #E64539 !important;
  }
  .hq-card-name {
    font-size: 12px;
    font-weight: 700;
    color: #D0D6DF;
    letter-spacing: 0.5px;
  }
  .hq-card-active .hq-card-name { color: #E8E8E8; }
  .hq-card-link {
    color: inherit;
    text-decoration: underline;
    text-decoration-color: #3A3F5E;
    text-underline-offset: 2px;
    cursor: pointer;
    transition: color 0.15s, text-decoration-color 0.15s;
  }
  .hq-card-link:hover {
    color: #E64539;
    text-decoration-color: #E64539;
  }
  .hq-card-controls {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .hq-card-ctrl {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .hq-ctrl-label {
    font-size: 8px;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: #6B7280;
    white-space: nowrap;
  }
  .hq-upg-none { font-size: 11px; color: #3A3F5E; }

  /* ── Toggle ── */
  .hq-toggle { display: inline-flex; align-items: center; cursor: pointer; }
  .hq-toggle input { display: none; }
  .hq-toggle-track {
    width: 28px; height: 14px;
    background: #2e3440;
    border: 1px solid #3A3F5E;
    border-radius: 7px;
    position: relative;
    transition: background 0.2s, border-color 0.2s;
  }
  .hq-toggle input:checked + .hq-toggle-track {
    background: #E64539;
    border-color: #E64539;
  }
  .hq-toggle-thumb {
    position: absolute;
    top: 1px; left: 1px;
    width: 10px; height: 10px;
    background: #9BA4B4;
    border-radius: 50%;
    transition: left 0.2s, background 0.2s;
  }
  .hq-toggle input:checked + .hq-toggle-track .hq-toggle-thumb {
    left: 15px;
    background: #fff;
  }
  .hq-toggle-disabled { opacity: 0.3; cursor: not-allowed; }

  /* ── Upgrade select ── */
  .hq-upgrade-select {
    background: #12151A;
    border: 1px solid #3A3F5E;
    color: #E8E8E8;
    padding: 1px 3px;
    font-size: 10px;
    font-family: inherit;
    width: 62px;
    cursor: pointer;
  }
  .hq-upgrade-select:disabled { opacity: 0.3; cursor: not-allowed; }
  .hq-upgrade-select:focus { outline: none; border-color: #E64539; }

  /* ── Textarea ── */
  .hq-textarea {
    background: #12151A;
    border: 1px solid #3A3F5E;
    color: #E8E8E8;
    padding: 5px 7px;
    font-size: 12px;
    font-family: inherit;
    width: 100%;
    resize: vertical;
    min-height: 48px;
    line-height: 1.5;
  }
  .hq-textarea:focus { outline: none; border-color: #E64539; }

  /* ── Footer buttons — pinned inside content, never clipped ── */
  .hq-footer {
    display: flex;
    gap: 6px;
    padding: 8px 12px;
    background: #13161A;
    border-top: 2px solid #E64539;
    justify-content: flex-end;
    flex-shrink: 0;
  }
  .hq-btn {
    padding: 5px 14px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    font-family: inherit;
    border: none;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
    white-space: nowrap;
  }
  .hq-btn-primary   { background: #E64539; color: #fff; }
  .hq-btn-primary:hover { background: #FF5549; }
  .hq-btn-secondary { background: #3A3F5E; color: #C8CFD8; }
  .hq-btn-secondary:hover { background: #4A5070; color: #fff; }
  .hq-btn-ghost     { background: transparent; color: #6B7280; border: 1px solid #3A3F5E; }
  .hq-btn-ghost:hover { color: #E8E8E8; border-color: #6B7280; }
</style>

<!-- HEADER (fixed) -->
<div class="hq-header">
  <div class="hq-header-icon">H</div>
  <h1>HQ Worksheet</h1>
</div>

<!-- SCROLLABLE BODY -->
<div class="hq-body">

  <!-- IDENTITY -->
  <div class="hq-section">
    <div class="hq-section-title">Identity</div>
    <div class="hq-field-grid">
      <div class="hq-field">
        <span class="hq-label">Name</span>
        <input class="hq-input" type="text" id="hq-name" value="${escHtml(data.name)}" placeholder="e.g. Zenith's Rooftop Grow">
      </div>
      <div class="hq-field">
        <span class="hq-label">Monthly Rent</span>
        <input class="hq-input" type="text" id="hq-rent" value="${escHtml(data.monthlyRent)}" placeholder="e.g. 2000eb / crew">
      </div>
      <div class="hq-field hq-field-full">
        <span class="hq-label">Location</span>
        <input class="hq-input" type="text" id="hq-location" value="${escHtml(data.location)}" placeholder="e.g. Main building of Zenith's Grow">
      </div>
      <div class="hq-field hq-field-full">
        <span class="hq-label">Description</span>
        <textarea class="hq-textarea" id="hq-description" rows="2">${escHtml(data.description)}</textarea>
      </div>
    </div>
  </div>

  <!-- HQ IP -->
  <div class="hq-section">
    <div class="hq-section-title">HQ Improvement Points</div>
    <div class="hq-ip-row">
      <div class="hq-field hq-ip-field">
        <span class="hq-label">Total IP Earned</span>
        <div class="hq-ip-input-row">
          <input class="hq-input" type="number" id="hq-ip" value="${data.hqIP}" min="0" step="10">
          <button class="hq-ip-add-btn" id="hq-btn-add-ip" title="Add IP from a completed mission">+</button>
        </div>
      </div>
      <div class="hq-field" style="flex:1;">
        <span class="hq-label">IP Remaining</span>
        <div class="hq-ip-bar">
          <span class="hq-ip-remaining ${getIPClass(data.hqIP, spent)}" id="hq-ip-remaining">${Math.max(0, data.hqIP - spent)}</span>
          <div class="hq-ip-track">
            <div class="hq-ip-fill" id="hq-ip-fill" style="width:${getIPFillPct(data.hqIP, spent)}%"></div>
          </div>
          <span class="hq-ip-spent" id="hq-ip-spent">${spent} spent</span>
        </div>
      </div>
    </div>
  </div>

  <!-- IMPROVEMENTS -->
  <div class="hq-section">
    <div class="hq-section-title">
      Improvements &amp; Upgrades
      <span class="hq-title-note">40 IP per step</span>
    </div>
    <div class="hq-card-grid" id="hq-improvements-body">
      ${improvementCards}
    </div>
  </div>

  <!-- NOTES -->
  <div class="hq-section" style="border-bottom:none;">
    <div class="hq-section-title">Notes</div>
    <textarea class="hq-textarea" id="hq-notes" rows="2"
      placeholder="e.g. Morale Boosts: Home Theater, Upgraded Kitchen">${escHtml(data.notes)}</textarea>
  </div>

</div><!-- end .hq-body -->

<!-- FOOTER BUTTONS (pinned, never clipped) -->
<div class="hq-footer">
  <button class="hq-btn hq-btn-ghost"      id="hq-btn-cancel">Cancel</button>
  <button class="hq-btn hq-btn-secondary"  id="hq-btn-export">Export to Journal</button>
  <button class="hq-btn hq-btn-primary"    id="hq-btn-save">Save</button>
</div>

</div>`;
}

// ============================================================
//  HELPERS
// ============================================================

function escHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getIPClass(total, spent) {
  const rem = total - spent;
  if (rem <= 0) return "hq-ip-zero";
  if (rem < 80) return "hq-ip-low";
  return "";
}

function getIPFillPct(total, spent) {
  if (!total || total <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((spent / total) * 100)));
}

// ============================================================
//  JOURNAL EXPORT HTML BUILDER
// ============================================================

function buildJournalHTML(data) {
  const improvements = HQ_CONFIG.improvements;
  const imp = data.improvements;

  const rulebookLink = HQ_CONFIG.rulebookUUID
    ? `<p>@UUID[${HQ_CONFIG.rulebookUUID}]{No Place Like Home}</p>`
    : `<p><em>No Place Like Home</em> — R. Talsorian Games, 2024</p>`;

  // Build improvement rows
  const leftKeys  = ["evidenceWall","garage","lockup","lounge","medbay","moraleBoost"];
  const rightKeys = ["rentReduction","serverRoom","studio","trainingArea","workshop","workstation"];

  function impCell(key) {
    const state = imp[key];
    if (!state.improved) return { name: improvements[key].label, improve: "", upgrade: "" };
    const uuid = improvements[key].uuid;
    const link = uuid ? `@UUID[${uuid}]{${improvements[key].label}}` : improvements[key].label;
    let upgrade = "";
    if (MULTI_LEVEL[key]) {
      upgrade = state.upgradeLevel > 0 ? `Level ${state.upgradeLevel}` : "";
    } else {
      upgrade = state.upgraded ? "Yes" : "";
    }
    return { name: link, improve: "Yes", upgrade };
  }

  function tableRow(lKey, rKey) {
    const l = impCell(lKey);
    const r = impCell(rKey);
    return `
    <tr>
      <td data-colwidth="188"><p>${l.name}</p></td>
      <td data-colwidth="71"><p>${l.improve}</p></td>
      <td data-colwidth="75"><p>${l.upgrade}</p></td>
      <td data-colwidth="203"><p>${r.name}</p></td>
      <td data-colwidth="68"><p>${r.improve}</p></td>
      <td><p>${r.upgrade}</p></td>
    </tr>`;
  }

  const rows = leftKeys.map((lKey, i) => tableRow(lKey, rightKeys[i])).join("");

  const timestamp = new Date().toLocaleString(undefined, {
    dateStyle: "medium", timeStyle: "short"
  });
  const exportedBy = game.user?.name ?? "Unknown";

  return `${rulebookLink}
<h3>Name: ${escHtml(data.name) || "—"}</h3>
<h3>Location: ${escHtml(data.location) || "—"}</h3>
<h3>Monthly Rent: ${escHtml(data.monthlyRent) || "—"}</h3>
<h3>HQ IP: ${data.hqIP} (${computeSpent(data.improvements)} spent / ${Math.max(0, data.hqIP - computeSpent(data.improvements))} remaining)</h3>
<h3>Description</h3>
<p>${escHtml(data.description).replace(/\n/g, "</p><p>") || "—"}</p>
<h3>Improvements &amp; Upgrades</h3>
<p>All Improvements &amp; Upgrades cost 40 IP per level. Morale Boost &amp; Rent Reduction upgrades have multiple levels.</p>
<table>
  <tbody>
    <tr>
      <td data-colwidth="188"><p style="text-align:center">Add-on</p></td>
      <td data-colwidth="71"><p style="text-align:center">Improve</p></td>
      <td data-colwidth="75"><p style="text-align:center">Upgrade</p></td>
      <td data-colwidth="203"><p style="text-align:center">Add-on</p></td>
      <td data-colwidth="68"><p style="text-align:center">Improve</p></td>
      <td><p style="text-align:center">Upgrade</p></td>
    </tr>
    ${rows}
  </tbody>
</table>
<h3>Notes</h3>
<p>${escHtml(data.notes).replace(/\n/g, "</p><p>") || "—"}</p>
<p><em>Last exported: ${timestamp} by ${escHtml(exportedBy)}</em></p>`;
}

// ============================================================
//  CONFIRMATION DIALOG HELPER
// ============================================================

async function confirmDialog(title, content) {
  return new Promise((resolve) => {
    new Dialog({
      title,
      content: `<div style="padding:8px;font-family:inherit;">${content}</div>`,
      buttons: {
        yes: {
          icon: '<i class="fas fa-check"></i>',
          label: "Confirm",
          callback: () => resolve(true),
        },
        no: {
          icon: '<i class="fas fa-times"></i>',
          label: "Cancel",
          callback: () => resolve(false),
        },
      },
      default: "no",
    }).render(true);
  });
}

// ============================================================
//  MAIN DIALOG
// ============================================================

async function openHQWorksheet() {
  let data = loadData();

  const dialog = new Dialog({
    title: "HQ Worksheet",
    content: buildDialogHTML(data),
    buttons: {},
    render: (html) => {
      // ── Collect current form values into data object ──
      function readFormIntoData() {
        data.name        = html.find("#hq-name").val();
        data.location    = html.find("#hq-location").val();
        data.monthlyRent = html.find("#hq-rent").val();
        data.hqIP        = parseInt(html.find("#hq-ip").val()) || 0;
        data.description = html.find("#hq-description").val();
        data.notes       = html.find("#hq-notes").val();
      }

      // ── Update IP display bar ──
      function refreshIPBar() {
        const total = parseInt(html.find("#hq-ip").val()) || 0;
        const spent = computeSpent(data.improvements);
        const rem   = Math.max(0, total - spent);
        html.find("#hq-ip-remaining")
          .text(rem)
          .removeClass("hq-ip-low hq-ip-zero")
          .addClass(getIPClass(total, spent));
        html.find("#hq-ip-fill").css("width", getIPFillPct(total, spent) + "%");
        html.find("#hq-ip-spent").text(`${spent} spent`);
      }

      // ── Re-render improvement cards without full dialog rebuild ──
      function refreshRow(key) {
        const state = data.improvements[key];
        const card  = html.find(`.hq-card[data-card="${key}"]`);

        // Toggle active class on card
        if (state.improved) {
          card.addClass("hq-card-active");
        } else {
          card.removeClass("hq-card-active");
        }

        // Enable/disable upgrade control
        const isMulti = !!MULTI_LEVEL[key];
        if (isMulti) {
          const sel = html.find(`.hq-upgrade-select[data-key="${key}"]`);
          sel.prop("disabled", !state.improved);
          if (!state.improved) {
            sel.val(0);
            data.improvements[key].upgradeLevel = 0;
          }
        } else {
          const upgCheck = html.find(`.hq-upgrade-check[data-key="${key}"]`);
          const upgLabel = upgCheck.closest(".hq-toggle");
          if (!state.improved) {
            upgCheck.prop("checked", false).prop("disabled", true);
            data.improvements[key].upgraded = false;
            upgLabel.addClass("hq-toggle-disabled");
          } else {
            upgCheck.prop("disabled", false);
            upgLabel.removeClass("hq-toggle-disabled");
          }
        }
      }

      // ── Improve checkbox handler ──
      html.on("change", ".hq-improve-check", async (e) => {
        const key     = e.currentTarget.dataset.key;
        const checked = e.currentTarget.checked;
        const total   = parseInt(html.find("#hq-ip").val()) || 0;
        const spent   = computeSpent(data.improvements);

        if (checked) {
          // Purchasing
          const remaining = total - spent;
          if (remaining < IP_COST) {
            e.currentTarget.checked = false;
            ui.notifications.warn(`Not enough HQ IP. Need ${IP_COST}, have ${remaining}.`);
            return;
          }
          const ok = await confirmDialog(
            "Purchase Improvement",
            `<strong>Buy ${HQ_CONFIG.improvements[key].label} (Improvement)</strong> for <strong>${IP_COST} HQ IP</strong>?<br><br>
             Remaining after purchase: <strong>${remaining - IP_COST}</strong>`
          );
          if (!ok) { e.currentTarget.checked = false; return; }
          data.improvements[key].improved = true;

        } else {
          // Removing — RAW: no IP refund
          const ok = await confirmDialog(
            "Remove Improvement",
            `<strong>Remove ${HQ_CONFIG.improvements[key].label}?</strong><br><br>
             ⚠️ <em>RAW (No Place Like Home, p.3): HQ IP spent on improvements is not refunded.</em><br><br>
             This is for record-keeping only. No IP will be returned.`
          );
          if (!ok) { e.currentTarget.checked = true; return; }
          data.improvements[key].improved  = false;
          data.improvements[key].upgraded  = false;
          data.improvements[key].upgradeLevel = 0;
        }

        refreshRow(key);
        refreshIPBar();
      });

      // ── Upgrade checkbox handler ──
      html.on("change", ".hq-upgrade-check", async (e) => {
        const key     = e.currentTarget.dataset.key;
        const checked = e.currentTarget.checked;
        const total   = parseInt(html.find("#hq-ip").val()) || 0;
        const spent   = computeSpent(data.improvements);

        if (checked) {
          const remaining = total - spent;
          if (remaining < IP_COST) {
            e.currentTarget.checked = false;
            ui.notifications.warn(`Not enough HQ IP. Need ${IP_COST}, have ${remaining}.`);
            return;
          }
          const ok = await confirmDialog(
            "Purchase Upgrade",
            `<strong>Buy ${HQ_CONFIG.improvements[key].label} (Upgrade)</strong> for <strong>${IP_COST} HQ IP</strong>?<br><br>
             Remaining after purchase: <strong>${remaining - IP_COST}</strong>`
          );
          if (!ok) { e.currentTarget.checked = false; return; }
          data.improvements[key].upgraded = true;

        } else {
          const ok = await confirmDialog(
            "Remove Upgrade",
            `<strong>Remove ${HQ_CONFIG.improvements[key].label} upgrade?</strong><br><br>
             ⚠️ <em>RAW (No Place Like Home, p.3): HQ IP spent on upgrades is not refunded.</em><br><br>
             This is for record-keeping only. No IP will be returned.`
          );
          if (!ok) { e.currentTarget.checked = true; return; }
          data.improvements[key].upgraded = false;
        }

        refreshIPBar();
      });

      // ── Multi-level upgrade select handler ──
      html.on("change", ".hq-upgrade-select", async (e) => {
        const key      = e.currentTarget.dataset.key;
        const newLevel = parseInt(e.currentTarget.value);
        const oldLevel = data.improvements[key].upgradeLevel;
        const total    = parseInt(html.find("#hq-ip").val()) || 0;
        const spent    = computeSpent(data.improvements);

        if (newLevel > oldLevel) {
          // Buying levels
          const levelsAdded = newLevel - oldLevel;
          const cost        = levelsAdded * IP_COST;
          const remaining   = total - spent;
          if (remaining < cost) {
            e.currentTarget.value = oldLevel;
            ui.notifications.warn(`Not enough HQ IP. Need ${cost}, have ${remaining}.`);
            return;
          }
          const ok = await confirmDialog(
            `Upgrade ${HQ_CONFIG.improvements[key].label}`,
            `<strong>Increase ${HQ_CONFIG.improvements[key].label} to Level ${newLevel}</strong>
             (+${levelsAdded} level${levelsAdded > 1 ? "s" : ""}) for <strong>${cost} HQ IP</strong>?<br><br>
             Remaining after purchase: <strong>${remaining - cost}</strong>`
          );
          if (!ok) { e.currentTarget.value = oldLevel; return; }
          data.improvements[key].upgradeLevel = newLevel;

        } else if (newLevel < oldLevel) {
          // Reducing levels — RAW: no refund
          const ok = await confirmDialog(
            `Reduce ${HQ_CONFIG.improvements[key].label}`,
            `<strong>Reduce ${HQ_CONFIG.improvements[key].label} from Level ${oldLevel} to Level ${newLevel}?</strong><br><br>
             ⚠️ <em>RAW (No Place Like Home, p.3): HQ IP spent is not refunded.</em><br><br>
             This is for record-keeping only. No IP will be returned.`
          );
          if (!ok) { e.currentTarget.value = oldLevel; return; }
          data.improvements[key].upgradeLevel = newLevel;
        }

        refreshIPBar();
      });

      // ── Add IP button ──
      html.on("click", "#hq-btn-add-ip", () => {
        const addDialog = new Dialog({
          title: "Add HQ IP",
          content: `
            <div style="padding:8px;font-family:inherit;">
              <p style="margin:0 0 8px;font-size:12px;color:#9BA4B4;">
                How many HQ IP did the crew earn?
              </p>
              <input id="hq-add-ip-amount" type="number" min="0" step="10" value="40"
                style="background:#12151A;border:1px solid #3A3F5E;color:#E8E8E8;
                       padding:5px 8px;font-size:14px;width:100%;box-sizing:border-box;">
            </div>`,
          buttons: {
            confirm: {
              label: "Add IP",
              callback: (addHtml) => {
                const amount = parseInt(addHtml.find("#hq-add-ip-amount").val()) || 0;
                if (amount <= 0) return;
                const current = parseInt(html.find("#hq-ip").val()) || 0;
                const newTotal = current + amount;
                html.find("#hq-ip").val(newTotal);
                refreshIPBar();
                ui.notifications.info(`Added ${amount} HQ IP. Total: ${newTotal}.`);
              }
            },
            cancel: { label: "Cancel" }
          },
          default: "confirm",
          render: (addHtml) => {
            // Select the value on open so user can just type immediately
            addHtml.find("#hq-add-ip-amount").select();
          }
        });
        addDialog.render(true);
      });

      // ── IP field change ──
      html.on("change input", "#hq-ip", () => refreshIPBar());

      // ── Journal link clicks ──
      html.on("click", ".hq-card-link", async (e) => {
        e.preventDefault();
        const uuid = e.currentTarget.dataset.uuid;
        if (!uuid) return;
        try {
          const doc = await fromUuid(uuid);
          if (doc?.sheet) {
            doc.sheet.render(true);
          } else {
            ui.notifications.warn(`Could not open journal entry. Check UUID in HQ_CONFIG.`);
          }
        } catch (err) {
          console.error("HQ Worksheet | Failed to open journal link:", err);
          ui.notifications.warn(`Could not open journal entry. Check UUID in HQ_CONFIG.`);
        }
      });

      // ── Save button ──
      html.on("click", "#hq-btn-save", async () => {
        readFormIntoData();
        await saveData(data);
        ui.notifications.info("HQ Worksheet saved.");
        dialog.close();
      });

      // ── Export button ──
      html.on("click", "#hq-btn-export", async () => {
        readFormIntoData();
        await saveData(data);

        const journalHTML = buildJournalHTML(data);

        try {
          // Resolve the page UUID
          const page = await fromUuid(HQ_CONFIG.summaryPageUUID);
          if (page) {
            await page.update({ "text.content": journalHTML });
            ui.notifications.info("Journal entry updated.");
            page.parent.sheet.render(true, { pageId: page.id });
          } else {
            // Fallback: resolve parent journal and update first page
            const journal = await fromUuid(HQ_CONFIG.summaryJournalUUID);
            if (journal && journal.pages.size > 0) {
              const firstPage = journal.pages.contents[0];
              await firstPage.update({ "text.content": journalHTML });
              // Persist the page UUID so future exports hit it directly
              HQ_CONFIG.summaryPageUUID = firstPage.uuid;
              data._journalUUID = journal.uuid;
              data._pageUUID    = firstPage.uuid;
              await saveData(data);
              ui.notifications.info("Journal entry updated (first page).");
              journal.sheet.render(true, { pageId: firstPage.id });
            } else {
              // Create a brand new journal entry and persist its UUIDs
              const newJournal = await JournalEntry.create({
                name: data.name || "HQ Worksheet",
                pages: [{ name: "HQ Summary", type: "text", text: { content: journalHTML, format: 1 } }]
              });
              const newPage = newJournal.pages.contents[0];
              HQ_CONFIG.summaryJournalUUID = newJournal.uuid;
              HQ_CONFIG.summaryPageUUID    = newPage.uuid;
              data._journalUUID = newJournal.uuid;
              data._pageUUID    = newPage.uuid;
              await saveData(data);
              ui.notifications.info(`Created new journal entry: "${newJournal.name}". Future exports will update it automatically.`);
              newJournal.sheet.render(true, { pageId: newPage.id });
            }
          }
        } catch (err) {
          console.error("HQ Worksheet | Export error:", err);
          ui.notifications.error("Export failed — check console for details.");
        }
      });

      // ── Cancel button ──
      html.on("click", "#hq-btn-cancel", () => dialog.close());
    },
    options: {
      width: 700,
      height: 640,
      resizable: true,
      classes: ["hq-worksheet-dialog"],
    },
  }, {
    jQuery: true,
  });

  dialog.render(true);
}

// ============================================================
//  ENTRY POINT
// ============================================================

openHQWorksheet();