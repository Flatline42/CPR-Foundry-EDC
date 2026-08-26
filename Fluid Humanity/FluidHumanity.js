/*
==========================================================
  CYBERPUNK RED — FLUID HUMANITY TRACKER
  Edgerunner Mission Kit Rules
==========================================================
  Foundry VTT v12 | CPR System v0.92.4
  Author: Flatline's EDC

  Field paths:
    system.derivedStats.humanity.value  (writable)
    system.derivedStats.humanity.max    (read-only cap)
==========================================================
*/

// ─────────────────────────────────────────────────────────
//  DATA — Sourced directly from Edgerunner Mission Kit
// ─────────────────────────────────────────────────────────

const HUMANITY_DATA = {
  incidents: {
    loss: {
      "1": [
        "Witnessing torture.",
        "Participating in torture.",
        "Being tortured.",
        "Murderous ideation.",
        "Receiving a credible death threat for the first time.",
        "You were treated unjustly by a justice system.",
        "Being successfully robbed on the street or at home.",
      ],
      "2": [
        "Witnessing a particularly gruesome killing.",
        "Killing for the first time.",
        "Extreme Physical or Mental Trauma.",
        "A loved one dies away from your presence.",
      ],
      "3": [
        "Participating in the murder of an innocent.",
        "Witnessing the murder or violent death of a loved one.",
      ],
    },
    gain: {
      "1": [
        "Defeat a hated enemy who wronged you directly.",
        "Gain catharsis by winning a symbolic victory.",
        "Reconcile with an estranged family member.",
        "Make a true friend.",
      ],
      "2": [
        "Your actions save a life.",
        "Once per week, you and up to ten friends spend a day doing nothing but partying, communally spending at least 1,000eb. This might attract some attention.",
      ],
      "3": [
        "Experience a major life-affirming event: engagement, marriage, adoption, childbirth, or the fulfillment of a dream.",
        "Once per month, you and up to ten friends spend a day doing nothing but partying hard, communally spending at least 10,000eb. This probably attracts attention.",
      ],
    },
  },
  ltee: {
    loss: {
      "1": [
        "This month, you've chosen to live a Kibble Lifestyle.",
        "Last month, you lived a Non-Fresh Food/Good Prepak lifestyle and spent most of your time in a major city, experiencing oppressive information overload.",
        "Last month, you primarily slept in a Cube Hotel.",
        "Last month, you worked directly or indirectly for a Corp.",
      ],
      "2": [
        "Last month, a loved one died. You haven't yet held a ceremony for them.",
        "Last month, you were in the Mortally Wounded wound state once, or the Seriously Wounded wound state three or more times.",
        "Last month, you were imprisoned for more than a week.",
        "Last month, you experienced starvation.",
      ],
      "3": [
        "Last month, you were trapped in a war zone (anywhere worse than a Combat Zone) or an area experiencing devastation from a long-term disaster for more than a week.",
      ],
    },
    gain: {
      "1": [
        "You have at least one true friend and meaningfully interacted with them at least once last month.",
        "You interacted with your family (found or otherwise) at least once last month.",
        "You took at least one week off last month doing nothing but relaxing and having fun — no downtime activities, no healing HP or Critical Injuries.",
        "Last month, you spent most of your time outside soul-draining major cities without suffering environmental or lifestyle hardship.",
      ],
      "2": [
        "Last month, you lived a Fresh Food Lifestyle.",
        "Last month, you primarily slept in a Corporate Conapt or better.",
      ],
      "3": [
        "You qualified for four or more Humanity Gain Long Term Effects (not including this one) at once, while qualifying for fewer than three Humanity Loss Long Term Effects. You're living the good life!",
      ],
    },
  },
};

// ─────────────────────────────────────────────────────────
//  MENTAL CONDITION THRESHOLDS
// ─────────────────────────────────────────────────────────

function getMentalCondition(humanity) {
  if (humanity >= 30) return {
    label: "Mental Condition: Stable",
    color: "#2e7d32", icon: "✓",
  };
  if (humanity >= 20) return {
    label: "Mental Condition: Borderline Dissociative Disorder",
    color: "#f57f17", icon: "⚠",
  };
  if (humanity >= 10) return {
    label: "Mental Condition: Dissociative Disorder / Borderline Cyberpsychosis ⚠ WARNING",
    color: "#bf360c", icon: "⚠⚠",
  };
  if (humanity >= 0) return {
    label: "Mental State: Cyberpsychosis ☠ DANGER",
    color: "#b71c1c", icon: "☠",
  };
  return {
    label: "Mental Condition: Extreme Cyberpsychosis — ☠ MAXTAC Alert ☠",
    color: "#4a148c", icon: "☠☠",
  };
}

// ─────────────────────────────────────────────────────────
//  CHARACTER SELECTION
// ─────────────────────────────────────────────────────────

const HT_SELECT_STYLE = `
<style>
  .ht-select-wrap {
    background: var(--cpr-dark-bg-primary, #1a1a2e);
    color: var(--cpr-dark-text-main, #e0e0e0);
    padding: 14px;
    border: 2px solid var(--cpr-color-main, #1afe49);
    border-radius: 5px;
    max-height: 500px;
    overflow-y: auto;
    font-family: 'Rajdhani', 'Segoe UI', sans-serif;
  }
  .ht-select-tagline {
    text-align: center;
    font-size: 0.85em;
    color: var(--cpr-color-main, #1afe49);
    font-style: italic;
    margin-bottom: 12px;
    opacity: 0.85;
  }
  .ht-select-search-row {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 12px;
  }
  .ht-select-search {
    background: var(--cpr-dark-bg-secondary, #16213e);
    border: 1px solid var(--cpr-color-main, #1afe49);
    color: var(--cpr-color-main, #1afe49);
    border-radius: 3px;
    padding: 7px 32px 7px 12px;
    font-size: 0.85em;
    width: 260px;
    font-family: inherit;
    outline: none;
  }
  .ht-select-search::placeholder { color: #555; }
  .ht-select-search:focus { box-shadow: 0 0 5px var(--cpr-color-main, #1afe49); }
  .ht-select-search-icon {
    position: absolute;
    right: calc(50% - 130px + 10px);
    color: var(--cpr-color-main, #1afe49);
    font-size: 0.85em;
    pointer-events: none;
  }
  .ht-actor-list { display: flex; flex-direction: column; gap: 7px; }
  .ht-actor-card {
    background: var(--cpr-dark-bg-secondary, #16213e);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 5px;
    padding: 10px 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 12px;
    transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
  }
  .ht-actor-card:hover {
    border-color: var(--cpr-color-main, #1afe49);
    transform: scale(1.01);
    box-shadow: 0 0 6px rgba(26,254,73,0.25);
  }
  .ht-actor-card.selected {
    border: 2px solid var(--cpr-color-main, #1afe49);
    box-shadow: 0 0 10px rgba(26,254,73,0.4);
  }
  .ht-actor-portrait {
    width: 48px; height: 48px;
    border-radius: 4px;
    border: 1px solid var(--cpr-color-main, #1afe49);
    flex-shrink: 0;
    object-fit: cover;
  }
  .ht-actor-details { flex-grow: 1; }
  .ht-actor-name {
    font-weight: bold;
    color: var(--cpr-color-main, #1afe49);
    display: block;
    margin-bottom: 2px;
    font-size: 1em;
  }
  .ht-actor-meta { font-size: 0.78em; color: #888; }
  .ht-actor-hum { color: var(--cpr-color-main, #1afe49); font-weight: bold; }

  /* Dialog button overrides */
  .dialog:has(.ht-select-wrap) .dialog-buttons {
    display: flex !important;
    gap: 6px !important;
    padding: 8px !important;
    border-top: 2px solid var(--cpr-color-main, #1afe49) !important;
  }
  .dialog:has(.ht-select-wrap) .dialog-buttons button {
    flex: 1 !important;
    padding: 6px 10px !important;
    background: var(--cpr-dark-bg-primary, #1a1a2e) !important;
    color: var(--cpr-color-main, #1afe49) !important;
    border: 1px solid var(--cpr-color-main, #1afe49) !important;
    border-radius: 3px !important;
    font-weight: bold !important;
    font-size: 0.75em !important;
    text-transform: uppercase !important;
    cursor: pointer !important;
    transition: all 0.2s ease !important;
    font-family: inherit !important;
  }
  .dialog:has(.ht-select-wrap) .dialog-buttons button:hover {
    background: var(--cpr-color-main, #1afe49) !important;
    color: #000 !important;
  }
</style>`;

async function selectCharacter() {
  const isGM = game.user.isGM;
  const candidates = isGM
    ? game.actors.filter(a => a.type === "character")
    : game.actors.filter(a => a.isOwner && a.type === "character");

  if (!candidates.length) {
    ui.notifications.warn(
      isGM ? "No character actors found in this world."
           : "No owned characters found."
    );
    return null;
  }

  // Non-GM with a single character — skip the picker
  if (!isGM && candidates.length === 1) return candidates[0];

  // Non-GM with a single controlled token — skip the picker
  if (!isGM) {
    const tokenActors = (canvas.tokens?.controlled ?? [])
      .map(t => t.actor)
      .filter(a => a?.isOwner && a.type === "character");
    if (tokenActors.length === 1) return tokenActors[0];
  }

  // Build actor cards
  const actorCards = candidates.map(a => {
    const hum  = a.system?.derivedStats?.humanity;
    const hVal = hum?.value ?? "?";
    const hMax = hum?.max   ?? "?";
    return `
      <div class="ht-actor-card" data-actor-id="${a.id}"
           data-name="${a.name.toLowerCase()}">
        <img src="${a.img}" alt="${a.name}" class="ht-actor-portrait">
        <div class="ht-actor-details">
          <span class="ht-actor-name">${a.name}</span>
          <span class="ht-actor-meta">
            Humanity: <span class="ht-actor-hum">${hVal} / ${hMax}</span>
          </span>
        </div>
      </div>`;
  }).join("");

  const content = `
    ${HT_SELECT_STYLE}
    <div class="ht-select-wrap">
      <div class="ht-select-tagline">"Assess the damage. Guard your mind."</div>
      <div class="ht-select-search-row">
        <input type="text" id="ht-search" placeholder="Search characters..."
               class="ht-select-search">
        <i class="fas fa-search ht-select-search-icon"></i>
      </div>
      <div class="ht-actor-list">${actorCards}</div>
    </div>`;

  return new Promise((resolve) => {
    new Dialog({
      title: "Humanity Tracker — Select Character",
      content,
      buttons: {
        select: {
          label: "Open Tracker",
          callback: (html) => {
            const sel = html.find(".ht-actor-card.selected");
            if (!sel.length) {
              ui.notifications.warn("Please select a character first.");
              selectCharacter().then(resolve);
              return;
            }
            resolve(game.actors.get(sel.data("actor-id")));
          },
        },
        cancel: { label: "Cancel", callback: () => resolve(null) },
      },
      render: (html) => {
        // Click to select
        html.find(".ht-actor-card").on("click", function () {
          html.find(".ht-actor-card").removeClass("selected");
          $(this).addClass("selected");
        });

        // Auto-highlight controlled token if present
        const controlled = canvas?.tokens?.controlled?.[0];
        if (controlled?.actor) {
          const match = html.find(`.ht-actor-card[data-actor-id="${controlled.actor.id}"]`);
          if (match.length) match.addClass("selected");
        }

        // Search filter
        html.find("#ht-search").on("input", function () {
          const term = $(this).val().toLowerCase();
          html.find(".ht-actor-card").each(function () {
            $(this).toggle($(this).data("name").includes(term));
          });
        });
      },
      default: "select",
    }, { width: 460 }).render(true);
  });
}

// ─────────────────────────────────────────────────────────
//  APPLICATION
// ─────────────────────────────────────────────────────────

class HumanityTrackerApp extends Application {
  constructor(actor) {
    super();
    this._actor        = actor;
    this._screen       = "checklist";  // "checklist" | "rollqueue"
    this._activeTab    = "incidents";  // "incidents" | "ltee"
    this._checkedItems = [];           // ordered array
    this._orderCounter = 0;
    this._rolledItems  = new Set();

    // Per-tab custom entries — array so new blanks can be appended
    this._custom = {
      incidents: [{ id: "custom-incidents-0", label: "", dice: 1, type: "loss", checked: false }],
      ltee:      [{ id: "custom-ltee-0",      label: "", dice: 1, type: "loss", checked: false }],
    };
    this._customSeq = { incidents: 1, ltee: 1 };
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id:        "cpr-humanity-tracker",
      title:     "[ FLUID HUMANITY TRACKER ]",
      width:     600,
      height:    680,
      resizable: true,
      classes:   ["cpr-humanity-tracker"],
    });
  }

  get currentHumanity() { return this._actor.system.derivedStats.humanity.value; }
  get maxHumanity()     { return this._actor.system.derivedStats.humanity.max;   }

  // ── Render ───────────────────────────────────────────

  async _renderInner(_data) {
    const html = this._screen === "checklist"
      ? this._buildChecklistHTML()
      : this._buildRollQueueHTML();
    return $(html);
  }

  // ── CSS ──────────────────────────────────────────────

  _css() {
    return `<style>
      /* ── Base ─────────────────────────────── */
      .cpr-humanity-tracker .window-content {
        padding: 0;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        background: var(--cpr-dark-bg-primary, #1a1a2e);
        color: var(--cpr-dark-text-main, #e0e0e0);
        font-family: 'Rajdhani', 'Segoe UI', sans-serif;
      }
      .ht-wrap {
        display: flex;
        flex-direction: column;
        height: 100%;
        min-height: 0;
      }

      /* ── Header ───────────────────────────── */
      .ht-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 14px;
        background: var(--cpr-dark-bg-secondary, #16213e);
        border-bottom: 2px solid var(--cpr-color-main, #1afe49);
        flex-shrink: 0;
      }
      .ht-title {
        font-size: 1.05em;
        font-weight: 700;
        letter-spacing: 2px;
        text-transform: uppercase;
        color: var(--cpr-color-main, #1afe49);
      }
      .ht-actor-info { text-align: right; font-size: 0.82em; line-height: 1.5; }
      .ht-hum-display { font-weight: 700; color: var(--cpr-color-main, #1afe49); }

      /* ── Tabs ─────────────────────────────── */
      .ht-tabs {
        display: flex;
        background: var(--cpr-dark-bg-secondary, #16213e);
        border-bottom: 1px solid rgba(255,255,255,0.1);
        flex-shrink: 0;
      }
      .ht-tab-btn {
        flex: 1;
        padding: 8px 10px;
        background: none;
        border: none;
        border-bottom: 3px solid transparent;
        color: var(--cpr-dark-text-main, #e0e0e0);
        font-family: inherit;
        font-size: 0.78em;
        font-weight: 700;
        letter-spacing: 1.5px;
        text-transform: uppercase;
        cursor: pointer;
        opacity: 0.5;
        transition: opacity 0.15s, border-color 0.15s, color 0.15s;
      }
      .ht-tab-btn:hover { opacity: 0.85; }
      .ht-tab-btn.active {
        opacity: 1;
        color: var(--cpr-color-main, #1afe49);
        border-bottom-color: var(--cpr-color-main, #1afe49);
      }

      /* ── Panels ───────────────────────────── */
      .ht-panels { flex: 1; overflow-y: auto; padding: 0 12px 12px; min-height: 0; }
      .ht-panel { display: none; }
      .ht-panel.active { display: block; }

      /* ── Section Headers ──────────────────── */
      .ht-section-hdr {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 0 5px;
        font-size: 0.8em;
        font-weight: 700;
        letter-spacing: 2px;
        text-transform: uppercase;
        border-bottom: 1px solid;
        margin-bottom: 4px;
      }
      .ht-section-hdr.loss { color: var(--cpr-dark-red, #e03131); border-color: var(--cpr-dark-red, #e03131); }
      .ht-section-hdr.gain { color: var(--cpr-color-main, #1afe49); border-color: var(--cpr-color-main, #1afe49); }

      /* ── Tier Labels ──────────────────────── */
      .ht-tier { margin: 8px 0 2px; }
      .ht-tier-label {
        display: inline-block;
        font-size: 0.68em;
        font-weight: 700;
        letter-spacing: 1px;
        padding: 1px 8px;
        border-radius: 2px;
        margin-bottom: 3px;
        text-transform: uppercase;
      }
      .ht-tier-label.loss { background: rgba(224,49,49,0.12); color: var(--cpr-dark-red, #e03131); border: 1px solid rgba(224,49,49,0.4); }
      .ht-tier-label.gain { background: rgba(26,254,73,0.08);  color: var(--cpr-color-main, #1afe49); border: 1px solid rgba(26,254,73,0.3); }

      /* ── Checklist Items ──────────────────── */
      .ht-item {
        display: flex;
        align-items: flex-start;
        gap: 9px;
        padding: 5px 8px;
        margin-bottom: 2px;
        border-radius: 3px;
        cursor: pointer;
        border: 1px solid transparent;
        transition: background 0.1s;
      }
      .ht-item:hover { background: rgba(255,255,255,0.04); }
      .ht-item.checked.loss { background: rgba(224,49,49,0.07); border-color: rgba(224,49,49,0.18); }
      .ht-item.checked.gain { background: rgba(26,254,73,0.05); border-color: rgba(26,254,73,0.13); }
      .ht-item input[type="checkbox"] {
        margin-top: 2px; flex-shrink: 0;
        accent-color: var(--cpr-color-main, #1afe49);
        width: 13px; height: 13px; cursor: pointer;
      }
      .ht-item-text { font-size: 0.8em; line-height: 1.4; }

      /* ── Custom Entries ───────────────────── */
      .ht-custom {
        margin-top: 14px;
        padding: 10px 12px;
        border: 1px dashed rgba(255,255,255,0.18);
        border-radius: 4px;
        background: rgba(255,255,255,0.02);
      }
      .ht-custom-title {
        font-size: 0.67em; letter-spacing: 1.5px;
        text-transform: uppercase; opacity: 0.45; margin-bottom: 8px;
      }
      .ht-custom-row {
        display: flex;
        align-items: center;
        gap: 7px;
        flex-wrap: wrap;
        padding: 5px 0;
        border-bottom: 1px solid rgba(255,255,255,0.06);
        transition: opacity 0.2s;
      }
      .ht-custom-row:last-child { border-bottom: none; }
      .ht-custom-row.locked { opacity: 0.45; pointer-events: none; }
      .ht-custom input[type="text"] {
        flex: 1; min-width: 130px;
        background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15);
        border-radius: 3px; color: var(--cpr-dark-text-main, #e0e0e0);
        font-family: inherit; font-size: 0.8em; padding: 4px 8px; outline: none;
      }
      .ht-custom input[type="text"]:focus { border-color: var(--cpr-color-main, #1afe49); }
      .ht-custom input[type="number"] {
        width: 42px;
        background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15);
        border-radius: 3px; color: var(--cpr-color-main, #1afe49);
        font-family: inherit; font-size: 0.8em; padding: 4px 5px;
        text-align: center; outline: none;
      }
      .ht-custom input[type="number"]:focus { border-color: var(--cpr-color-main, #1afe49); }
      .ht-custom-dice-unit { font-size: 0.78em; opacity: 0.6; }
      .ht-custom select {
        background: var(--cpr-dark-bg-secondary, #16213e);
        border: 1px solid rgba(255,255,255,0.15); border-radius: 3px;
        color: var(--cpr-dark-text-main, #e0e0e0);
        font-family: inherit; font-size: 0.78em; padding: 4px 6px; cursor: pointer; outline: none;
      }
      .ht-custom-check-wrap {
        display: flex; align-items: center; gap: 5px;
        font-size: 0.77em; opacity: 0.8; cursor: pointer; white-space: nowrap;
        pointer-events: all;
      }
      .ht-custom-check-wrap input[type="checkbox"] {
        accent-color: var(--cpr-color-main, #1afe49);
        width: 13px; height: 13px; cursor: pointer;
      }
      .ht-custom-check-wrap input:disabled { opacity: 0.3; cursor: not-allowed; }

      /* ── Footer ───────────────────────────── */
      .ht-footer {
        display: flex; justify-content: space-between; align-items: center;
        padding: 9px 14px;
        background: var(--cpr-dark-bg-secondary, #16213e);
        border-top: 1px solid var(--cpr-color-main, #1afe49);
        flex-shrink: 0;
        box-shadow: 0 -4px 12px rgba(0,0,0,0.35);
      }
      .ht-queue-count { font-size: 0.8em; opacity: 0.65; }
      .ht-wrap .ht-build-btn {
        padding: 7px 18px;
        background: var(--cpr-color-main, #1afe49) !important;
        color: #000 !important;
        border: none; border-radius: 3px;
        font-family: inherit; font-size: 0.8em; font-weight: 700;
        letter-spacing: 1px; text-transform: uppercase; cursor: pointer;
        transition: opacity 0.15s, transform 0.1s;
      }
      .ht-wrap .ht-build-btn:hover:not(:disabled) { opacity: 0.82; transform: translateY(-1px); }
      .ht-wrap .ht-build-btn:disabled { opacity: 0.25; cursor: not-allowed; transform: none; }

      /* ── Roll Queue Screen ────────────────── */
      .ht-back-bar {
        display: flex; align-items: center; gap: 10px;
        padding: 7px 14px;
        background: var(--cpr-dark-bg-secondary, #16213e);
        border-bottom: 1px solid rgba(255,255,255,0.08);
        flex-shrink: 0;
      }
      .ht-back-btn {
        background: none; border: 1px solid rgba(255,255,255,0.2); border-radius: 3px;
        color: var(--cpr-dark-text-main, #e0e0e0);
        font-family: inherit; font-size: 0.77em; padding: 3px 10px; cursor: pointer;
        transition: border-color 0.15s, color 0.15s;
      }
      .ht-back-btn:hover { border-color: var(--cpr-color-main, #1afe49); color: var(--cpr-color-main, #1afe49); }
      .ht-back-hint { font-size: 0.72em; opacity: 0.4; letter-spacing: 1px; text-transform: uppercase; }

      .ht-roll-list { flex: 1; overflow-y: auto; padding: 12px 14px; min-height: 0; }

      /* Single-row roll item layout */
      .ht-roll-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 9px 12px;
        margin-bottom: 7px;
        border-radius: 4px;
        border: 1px solid rgba(255,255,255,0.07);
        background: rgba(255,255,255,0.02);
        transition: opacity 0.25s ease;
      }
      .ht-roll-item.rolled { opacity: 0.35; }
      .ht-roll-badge {
        flex-shrink: 0;
        min-width: 74px;
        text-align: center;
        font-size: 0.68em;
        font-weight: 700;
        letter-spacing: 1.5px;
        text-transform: uppercase;
        padding: 3px 8px;
        border-radius: 2px;
      }
      .ht-roll-badge.loss { background: rgba(224,49,49,0.14); color: var(--cpr-dark-red, #e03131); border: 1px solid rgba(224,49,49,0.35); }
      .ht-roll-badge.gain { background: rgba(26,254,73,0.09);  color: var(--cpr-color-main, #1afe49); border: 1px solid rgba(26,254,73,0.28); }
      .ht-roll-label { flex: 1 1 0; min-width: 0; font-size: 0.80em; opacity: 0.85; line-height: 1.35; }
      .ht-wrap .ht-roll-btn {
        flex: 0 0 88px !important;
        width: 88px !important;
        min-width: 88px !important;
        max-width: 88px !important;
        padding: 6px 0 !important;
        text-align: center !important;
        border: none; border-radius: 3px;
        font-family: inherit; font-size: 0.77em; font-weight: 700;
        letter-spacing: 0.5px; text-transform: uppercase; cursor: pointer;
        transition: opacity 0.15s;
      }
      .ht-wrap .ht-roll-btn.loss { background: var(--cpr-dark-red, #c0392b) !important; color: #fff !important; }
      .ht-wrap .ht-roll-btn.gain { background: var(--cpr-color-main, #1afe49) !important; color: #000 !important; }
      .ht-wrap .ht-roll-btn:hover:not(:disabled) { opacity: 0.78; }
      .ht-wrap .ht-roll-btn:disabled { opacity: 0.28; cursor: not-allowed; }

      .ht-remaining { font-size: 0.8em; opacity: 0.65; }
      .ht-done-btn {
        padding: 7px 18px;
        background: rgba(255,255,255,0.07); color: var(--cpr-dark-text-main, #e0e0e0);
        border: 1px solid rgba(255,255,255,0.2); border-radius: 3px;
        font-family: inherit; font-size: 0.8em; font-weight: 700;
        letter-spacing: 1px; text-transform: uppercase; cursor: pointer;
        transition: border-color 0.15s, color 0.15s;
      }
      .ht-done-btn:hover { border-color: var(--cpr-color-main, #1afe49); color: var(--cpr-color-main, #1afe49); }
    </style>`;
  }

  // ── HTML — Checklist Screen ───────────────────────────

  _buildChecklistHTML() {
    const count = this._checkedItems.length;
    return `
      ${this._css()}
      <div class="ht-wrap">
        ${this._headerHTML()}
        <div class="ht-tabs">
          <button class="ht-tab-btn ${this._activeTab === "incidents" ? "active" : ""}"
                  data-tab="incidents">⚡ Incidents</button>
          <button class="ht-tab-btn ${this._activeTab === "ltee" ? "active" : ""}"
                  data-tab="ltee">📅 Long Term Effects</button>
        </div>
        <div class="ht-panels">
          <div class="ht-panel ${this._activeTab === "incidents" ? "active" : ""}"
               data-panel="incidents">
            ${this._tabPanelHTML("incidents")}
          </div>
          <div class="ht-panel ${this._activeTab === "ltee" ? "active" : ""}"
               data-panel="ltee">
            ${this._tabPanelHTML("ltee")}
          </div>
        </div>
        <div class="ht-footer">
          <span class="ht-queue-count" id="ht-queue-count">
            ${count === 0 ? "No items queued" : `${count} item${count !== 1 ? "s" : ""} queued`}
          </span>
          <button class="ht-build-btn" id="ht-build-btn" ${count === 0 ? "disabled" : ""}>
            Build Roll Queue →
          </button>
        </div>
      </div>`;
  }

  _tabPanelHTML(tab) {
    const data  = HUMANITY_DATA[tab];
    const label = tab === "incidents" ? "Incident" : "Long-Term Effect";
    const customRowsHTML = this._custom[tab]
      .map(entry => this._customRowHTML(tab, entry))
      .join("");
    return `
      ${this._sectionHTML(tab, "loss", data.loss)}
      ${this._sectionHTML(tab, "gain", data.gain)}
      <div class="ht-custom">
        <div class="ht-custom-title">Custom ${label}</div>
        <div class="ht-custom-entries" data-tab="${tab}">
          ${customRowsHTML}
        </div>
      </div>`;
  }

  _customRowHTML(tab, entry) {
    const typeOpt = (val, text) =>
      `<option value="${val}" ${entry.type === val ? "selected" : ""}>${text}</option>`;
    return `
      <div class="ht-custom-row ${entry.checked ? "locked" : ""}" data-entry-id="${entry.id}">
        <input type="text" class="ht-custom-label"
          data-tab="${tab}" data-entry-id="${entry.id}"
          placeholder="Describe the event..."
          value="${this._esc(entry.label)}"
          ${entry.checked ? "readonly" : ""}>
        <input type="number" class="ht-custom-dice"
          data-tab="${tab}" data-entry-id="${entry.id}"
          min="1" max="9" value="${entry.dice}"
          ${entry.checked ? "disabled" : ""}>
        <span class="ht-custom-dice-unit">d6</span>
        <select class="ht-custom-type"
          data-tab="${tab}" data-entry-id="${entry.id}"
          ${entry.checked ? "disabled" : ""}>
          ${typeOpt("loss", "Loss")}
          ${typeOpt("gain", "Gain")}
        </select>
        <label class="ht-custom-check-wrap">
          <input type="checkbox" class="ht-custom-check"
            data-tab="${tab}" data-entry-id="${entry.id}"
            ${entry.checked ? "checked" : ""}
            ${!entry.label.trim() && !entry.checked ? "disabled" : ""}>
          Queue
        </label>
      </div>`;
  }

  _sectionHTML(tab, dir, tierData) {
    const icon  = dir === "loss" ? "▼" : "▲";
    const label = dir === "loss" ? "Humanity Loss" : "Humanity Gain";
    let tiersHTML = "";
    for (const [dice, items] of Object.entries(tierData)) {
      const itemsHTML = items.map(text => {
        const id        = this._itemId(tab, dir, dice, text);
        const isChecked = this._checkedItems.some(i => i.id === id);
        return `
          <div class="ht-item ${dir} ${isChecked ? "checked" : ""}" data-id="${id}">
            <input type="checkbox" class="ht-item-check"
              data-id="${id}" data-tab="${tab}"
              data-dir="${dir}" data-dice="${dice}"
              data-label="${this._esc(text)}"
              ${isChecked ? "checked" : ""}>
            <span class="ht-item-text">${text}</span>
          </div>`;
      }).join("");
      tiersHTML += `
        <div class="ht-tier">
          <span class="ht-tier-label ${dir}">${dice}d6</span>
          ${itemsHTML}
        </div>`;
    }
    return `
      <div class="ht-section-hdr ${dir}">${icon} ${label}</div>
      ${tiersHTML}`;
  }

  // ── HTML — Roll Queue Screen ──────────────────────────

  _buildRollQueueHTML() {
    const remaining = this._checkedItems.filter(i => !this._rolledItems.has(i.id)).length;
    const itemsHTML = this._checkedItems.map(item => {
      const rolled = this._rolledItems.has(item.id);
      return `
        <div class="ht-roll-item ${rolled ? "rolled" : ""}" data-id="${item.id}">
          <span class="ht-roll-badge ${item.type}">${item.dice}d6 ${item.type.toUpperCase()}</span>
          <span class="ht-roll-label">${item.label}</span>
          <button class="ht-roll-btn ${item.type}" data-id="${item.id}" ${rolled ? "disabled" : ""}>
            Roll ${item.dice}d6
          </button>
        </div>`;
    }).join("");
    return `
      ${this._css()}
      <div class="ht-wrap">
        ${this._headerHTML(true)}
        <div class="ht-back-bar">
          <button class="ht-back-btn" id="ht-back-btn">← Back</button>
          <span class="ht-back-hint">Roll each item in order</span>
        </div>
        <div class="ht-roll-list">${itemsHTML}</div>
        <div class="ht-footer">
          <span class="ht-remaining" id="ht-remaining">
            ${remaining} roll${remaining !== 1 ? "s" : ""} remaining
          </span>
          <button class="ht-done-btn" id="ht-done-btn">Done</button>
        </div>
      </div>`;
  }

  // ── Shared Header ─────────────────────────────────────

  _headerHTML(liveUpdate = false) {
    const humId = liveUpdate ? ' id="ht-hum-live"' : "";
    return `
      <div class="ht-header">
        <div class="ht-title">⚡ Fluid Humanity</div>
        <div class="ht-actor-info">
          <div>${this._actor.name}</div>
          <div class="ht-hum-display"${humId}>HUM ${this.currentHumanity} / ${this.maxHumanity}</div>
        </div>
      </div>`;
  }

  // ── Listeners ─────────────────────────────────────────

  activateListeners(html) {
    super.activateListeners(html);
    if (this._screen === "checklist") {
      this._bindChecklistListeners(html);
    } else {
      this._bindRollQueueListeners(html);
    }
  }

  _bindChecklistListeners(html) {
    // Tab switching — pure DOM, no re-render
    html.find(".ht-tab-btn").on("click", (e) => {
      const tab = e.currentTarget.dataset.tab;
      this._activeTab = tab;
      html.find(".ht-tab-btn").removeClass("active");
      $(e.currentTarget).addClass("active");
      html.find(".ht-panel").removeClass("active");
      html.find(`.ht-panel[data-panel="${tab}"]`).addClass("active");
    });

    // Item row click (not on the checkbox itself)
    html.find(".ht-item").on("click", (e) => {
      if (e.target.type === "checkbox") return;
      const cb = $(e.currentTarget).find("input[type='checkbox']")[0];
      if (!cb) return;
      cb.checked = !cb.checked;
      cb.dispatchEvent(new Event("change", { bubbles: true }));
    });

    // Item checkboxes
    html.find(".ht-item-check").on("change", (e) => {
      const el = e.currentTarget;
      const id = el.dataset.id;
      if (el.checked) {
        if (!this._checkedItems.find(i => i.id === id)) {
          this._checkedItems.push({
            id, label: el.dataset.label,
            dice: parseInt(el.dataset.dice), type: el.dataset.dir,
            order: this._orderCounter++,
          });
        }
      } else {
        this._checkedItems = this._checkedItems.filter(i => i.id !== id);
      }
      $(e.currentTarget).closest(".ht-item").toggleClass("checked", el.checked);
      this._refreshFooter(html);
    });

    // Custom entries — use event delegation so dynamically added rows work
    html.find(".ht-panels").on("input", ".ht-custom-label", (e) => {
      const tab     = e.currentTarget.dataset.tab;
      const entryId = e.currentTarget.dataset.entryId;
      const val     = e.currentTarget.value;
      const entry   = this._custom[tab].find(x => x.id === entryId);
      if (!entry) return;
      entry.label = val;
      const hasLabel = !!val.trim();
      html.find(`.ht-custom-check[data-entry-id="${entryId}"]`)
          .prop("disabled", !hasLabel);
      if (!hasLabel) {
        html.find(`.ht-custom-check[data-entry-id="${entryId}"]`).prop("checked", false);
        entry.checked = false;
        this._removeCustomById(entryId);
      }
      this._refreshFooter(html);
    });

    html.find(".ht-panels").on("input", ".ht-custom-dice", (e) => {
      const tab     = e.currentTarget.dataset.tab;
      const entryId = e.currentTarget.dataset.entryId;
      const val     = Math.max(1, Math.min(9, parseInt(e.currentTarget.value) || 1));
      e.currentTarget.value = val;
      const entry = this._custom[tab].find(x => x.id === entryId);
      if (!entry) return;
      entry.dice = val;
      const qi = this._checkedItems.find(i => i.id === entryId);
      if (qi) qi.dice = val;
      this._refreshFooter(html);
    });

    html.find(".ht-panels").on("change", ".ht-custom-type", (e) => {
      const tab     = e.currentTarget.dataset.tab;
      const entryId = e.currentTarget.dataset.entryId;
      const entry   = this._custom[tab].find(x => x.id === entryId);
      if (!entry) return;
      entry.type = e.currentTarget.value;
      const qi = this._checkedItems.find(i => i.id === entryId);
      if (qi) qi.type = e.currentTarget.value;
      this._refreshFooter(html);
    });

    html.find(".ht-panels").on("change", ".ht-custom-check", (e) => {
      const tab     = e.currentTarget.dataset.tab;
      const entryId = e.currentTarget.dataset.entryId;
      const checked = e.currentTarget.checked;
      const entry   = this._custom[tab].find(x => x.id === entryId);
      if (!entry) return;
      entry.checked = checked;

      if (checked) {
        // Lock the row and add to queue
        const row = html.find(`.ht-custom-row[data-entry-id="${entryId}"]`);
        row.addClass("locked");
        this._addCustomById(tab, entryId);
        // Append a fresh blank row
        this._spawnNewCustomRow(tab, html);
      } else {
        // Unlock and remove from queue
        const row = html.find(`.ht-custom-row[data-entry-id="${entryId}"]`);
        row.removeClass("locked");
        row.find("input[type='text']").prop("readonly", false);
        row.find("input[type='number'], select").prop("disabled", false);
        this._removeCustomById(entryId);
      }
      this._refreshFooter(html);
    });

    // Build Roll Queue button
    html.find("#ht-build-btn").on("click", () => {
      this._screen = "rollqueue";
      this.render(true);
    });
  }

  _bindRollQueueListeners(html) {
    html.find("#ht-back-btn").on("click", () => {
      this._screen = "checklist";
      this.render(true);
    });

    html.find(".ht-roll-btn").on("click", async (e) => {
      const btn = $(e.currentTarget);
      const id  = btn.data("id");
      if (this._rolledItems.has(id)) return;
      btn.prop("disabled", true);
      await this._executeRoll(id, html);
    });

    html.find("#ht-done-btn").on("click", () => this.close());
  }

  // ── Footer Refresh ────────────────────────────────────

  _refreshFooter(html) {
    const count = this._checkedItems.length;
    html.find("#ht-queue-count").text(
      count === 0 ? "No items queued" : `${count} item${count !== 1 ? "s" : ""} queued`
    );
    html.find("#ht-build-btn").prop("disabled", count === 0);
  }

  // ── Custom Entry Helpers ──────────────────────────────

  _addCustomById(tab, entryId) {
    const entry = this._custom[tab].find(x => x.id === entryId);
    if (!entry?.label.trim()) return;
    if (this._checkedItems.find(i => i.id === entryId)) return;
    this._checkedItems.push({
      id: entryId, label: entry.label, dice: entry.dice, type: entry.type,
      order: this._orderCounter++, isCustom: true,
    });
  }

  _removeCustomById(entryId) {
    this._checkedItems = this._checkedItems.filter(i => i.id !== entryId);
  }

  _spawnNewCustomRow(tab, html) {
    const seq   = this._customSeq[tab]++;
    const entry = { id: `custom-${tab}-${seq}`, label: "", dice: 1, type: "loss", checked: false };
    this._custom[tab].push(entry);
    html.find(`.ht-custom-entries[data-tab="${tab}"]`).append(this._customRowHTML(tab, entry));
  }

  // ── Roll Execution ────────────────────────────────────

  async _executeRoll(itemId, html) {
    const item = this._checkedItems.find(i => i.id === itemId);
    if (!item) return;

    const actor  = this._actor;
    const before = actor.system.derivedStats.humanity.value;
    const maxHum = actor.system.derivedStats.humanity.max;

    const roll = new Roll(`${item.dice}d6`);
    await roll.evaluate();
    const total = roll.total;

    let after = before;
    let atCap = false;
    if (item.type === "loss") {
      after = before - total;
    } else {
      if (before >= maxHum) {
        atCap = true;
        after = maxHum;
      } else {
        after = Math.min(before + total, maxHum);
      }
    }

    if (!atCap) {
      await actor.update({ "system.derivedStats.humanity.value": after });
    }

    // Chat flavor
    const mc         = getMentalCondition(after);
    const accentCol  = item.type === "loss" ? "#c0392b" : "#27ae60";
    const direction  = item.type === "loss" ? "▼ HUMANITY LOSS" : "▲ HUMANITY GAIN";
    let statusLine;
    if (atCap) {
      statusLine = `<span style="color:#f39c12;">⚠ ${actor.name} is already at maximum humanity — no change.</span>`;
    } else {
      const dir     = item.type === "loss" ? "dropped" : "rose";
      const capNote = (item.type === "gain" && after === maxHum)
        ? ` <span style="color:#f39c12;">(MAX)</span>` : "";
      statusLine = `${actor.name}'s humanity ${dir} from <b>${before}</b> to <b>${after}</b>${capNote}.`;
    }

    const flavor = `
      <div style="font-family:'Rajdhani','Segoe UI',sans-serif;padding:2px 0;">
        <div style="font-weight:700;font-size:0.88em;letter-spacing:1.5px;
                    text-transform:uppercase;color:${accentCol};margin-bottom:5px;">
          ${direction}
        </div>
        <div style="font-size:0.88em;font-style:italic;margin-bottom:6px;opacity:0.85;">
          "${item.label}"
        </div>
        <div style="font-size:0.84em;margin-bottom:8px;">${statusLine}</div>
        <div style="display:inline-block;background:${mc.color};color:#fff;
                    padding:3px 10px;border-radius:3px;font-size:0.78em;
                    font-weight:700;letter-spacing:1px;">
          ${mc.icon} ${mc.label}
        </div>
      </div>`;

    await roll.toMessage({
      speaker:  ChatMessage.getSpeaker({ actor }),
      flavor,
      rollMode: game.settings.get("core", "rollMode"),
    });

    // Update UI
    this._rolledItems.add(itemId);
    html.find(`.ht-roll-item[data-id="${itemId}"]`).addClass("rolled");
    const live = actor.system.derivedStats.humanity.value;
    html.find("#ht-hum-live").text(`HUM ${live} / ${maxHum}`);
    const remaining = this._checkedItems.filter(i => !this._rolledItems.has(i.id)).length;
    html.find("#ht-remaining").text(`${remaining} roll${remaining !== 1 ? "s" : ""} remaining`);
  }

  // ── Utilities ─────────────────────────────────────────

  _itemId(tab, dir, dice, text) {
    const slug = text.slice(0, 24).replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "");
    return `${tab}-${dir}-${dice}-${slug}`;
  }

  _esc(str) {
    return String(str)
      .replace(/&/g, "&amp;").replace(/"/g, "&quot;")
      .replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
}

// ─────────────────────────────────────────────────────────
//  MAIN
// ─────────────────────────────────────────────────────────

const trackedActor = await selectCharacter();
if (trackedActor) {
  const existing = Object.values(ui.windows).find(w => w.id === "cpr-humanity-tracker");
  if (existing) existing.close();
  new HumanityTrackerApp(trackedActor).render(true);
}