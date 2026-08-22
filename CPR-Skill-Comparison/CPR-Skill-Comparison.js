/*
=====================================
CYBERPUNK RED - CREW SKILL COMPARISON
=====================================
Quick reference tool for viewing party skill levels at a glance.
Shows all player characters with their skill ranks and base scores.

HOW TO USE:
1. Run the macro
2. Select a skill from the dropdown (type to filter)
3. View all PC stats for that skill instantly

Base Score = STAT + Skill Level
=====================================
*/

// =====================================
// Color Configuration - Neon Cyberpunk Palette
// =====================================
const CSC_COLORS = {
  primary: "#1afe49",      // Neon green
  secondary: "#3d43b4",    // Electric purple
  accent: "#083e12",       // Dark green
  highlight: "#041348",    // Deep blue
  background: "#0a0908",   // Pure black
  card: "#1a1a1a",         // Dark gray
  border: "#2a2a2a"        // Medium gray
};

// =====================================
// CSS Styles - Neon Cyberpunk Theme
// =====================================
const cscStyle = `
<style>
  :root {
    --csc-primary: ${CSC_COLORS.primary};
    --csc-secondary: ${CSC_COLORS.secondary};
    --csc-accent: ${CSC_COLORS.accent};
    --csc-highlight: ${CSC_COLORS.highlight};
    --csc-background: ${CSC_COLORS.background};
    --csc-card: ${CSC_COLORS.card};
    --csc-border: ${CSC_COLORS.border};
  }

  /* ---- Main wrapper ---- */
  .csc-wrapper {
    background: var(--csc-background);
    color: #ffffff;
    padding: 0;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    font-family: inherit;
  }

  .csc-header {
    padding: 12px 16px;
    background: linear-gradient(135deg, var(--csc-highlight), var(--csc-background));
    border-bottom: 2px solid var(--csc-primary);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .csc-title {
    font-size: 1.1em;
    font-weight: bold;
    color: var(--csc-primary);
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .csc-roll-btn {
    background: none;
    border: 1px solid var(--csc-primary);
    border-radius: 3px;
    color: var(--csc-primary);
    cursor: pointer;
    padding: 4px 12px;
    font-size: 0.8em;
    font-weight: bold;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    transition: all 0.15s;
  }
  .csc-roll-btn:hover {
    background: var(--csc-primary);
    color: var(--csc-background);
  }

  /* ---- Skill selector ---- */
  .csc-selector {
    padding: 12px 16px;
    background: var(--csc-card);
    border-bottom: 1px solid var(--csc-border);
  }

  .csc-search-wrapper {
    position: relative;
  }

  .csc-search-input {
    width: 100%;
    padding: 8px 12px;
    background: var(--csc-background);
    border: 1px solid var(--csc-primary);
    border-radius: 3px;
    color: var(--csc-primary);
    font-size: 0.9em;
    font-family: inherit;
  }

  .csc-search-input:focus {
    outline: none;
    box-shadow: 0 0 8px var(--csc-primary);
  }

  .csc-search-input::placeholder {
    color: #555;
  }

  .csc-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    max-height: 300px;
    overflow-y: auto;
    background: var(--csc-card);
    border: 1px solid var(--csc-primary);
    border-top: none;
    border-radius: 0 0 3px 3px;
    z-index: 1000;
    display: none;
  }

  .csc-dropdown.active {
    display: block;
  }

  .csc-dropdown-item {
    padding: 8px 12px;
    cursor: pointer;
    border-bottom: 1px solid var(--csc-border);
    transition: background 0.15s ease;
  }

  .csc-dropdown-item:hover {
    background: var(--csc-accent);
  }

  .csc-dropdown-item:last-child {
    border-bottom: none;
  }

  .csc-skill-name {
    color: var(--csc-primary);
    font-size: 0.9em;
  }

  .csc-skill-stat {
    color: #888;
    font-size: 0.75em;
    margin-left: 8px;
  }

  /* ---- Content area ---- */
  .csc-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    background: var(--csc-background);
  }

  .csc-empty-state {
    text-align: center;
    padding: 40px 20px;
    color: #666;
  }

  .csc-empty-text {
    font-size: 0.9em;
    color: #888;
  }

  /* ---- Character cards grid ---- */
  .csc-cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 12px;
  }

  .csc-card {
    background: var(--csc-card);
    border: 1px solid var(--csc-border);
    border-radius: 4px;
    padding: 12px;
    transition: all 0.2s ease;
  }

  .csc-card:hover {
    border-color: var(--csc-primary);
    box-shadow: 0 0 8px rgba(26, 254, 73, 0.3);
  }

  .csc-card-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--csc-border);
  }

  .csc-portrait {
    width: 40px;
    height: 40px;
    border-radius: 3px;
    border: 1px solid var(--csc-primary);
    flex-shrink: 0;
  }

  .csc-char-name {
    font-size: 0.9em;
    font-weight: bold;
    color: var(--csc-primary);
    flex: 1;
    line-height: 1.2;
  }

  .csc-stats {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .csc-stat-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }

  .csc-stat-label {
    font-size: 0.75em;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .csc-stat-value {
    font-size: 0.85em;
    color: #ccc;
  }

  .csc-base-score {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid var(--csc-border);
    display: flex;
    justify-content: space-around;
    align-items: flex-end;
    gap: 8px;
  }

  .csc-base-col {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .csc-base-label {
    font-size: 0.7em;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .csc-base-value {
    font-size: 1.8em;
    font-weight: bold;
    color: var(--csc-primary);
    text-shadow: 0 0 8px rgba(26, 254, 73, 0.4);
    margin-top: 2px;
  }

  .csc-base-value.highest {
    color: var(--csc-secondary);
    text-shadow: 0 0 12px rgba(61, 67, 180, 0.6);
  }

  .csc-roll-value {
    font-size: 1.8em;
    font-weight: bold;
    margin-top: 2px;
  }
  .csc-roll-value.positive {
    color: var(--csc-primary);
    text-shadow: 0 0 8px rgba(26, 254, 73, 0.4);
  }
  .csc-roll-value.negative {
    color: #e05555;
    text-shadow: 0 0 8px rgba(224, 85, 85, 0.4);
  }
  .csc-roll-value.empty {
    color: #444;
    font-size: 1.2em;
  }

  /* ---- App window override ---- */
  #crew-skill-comparison-app.window-app .window-content {
    padding: 0 !important;
    background: var(--csc-background);
  }

  #crew-skill-comparison-app.window-app .window-header {
    background: linear-gradient(135deg, var(--csc-highlight), var(--csc-background));
    border-bottom: 2px solid var(--csc-primary);
  }

  /* ---- Scrollbar styling ---- */
  .csc-content::-webkit-scrollbar,
  .csc-dropdown::-webkit-scrollbar {
    width: 6px;
  }

  .csc-content::-webkit-scrollbar-track,
  .csc-dropdown::-webkit-scrollbar-track {
    background: var(--csc-background);
  }

  .csc-content::-webkit-scrollbar-thumb,
  .csc-dropdown::-webkit-scrollbar-thumb {
    background: var(--csc-primary);
    border-radius: 3px;
  }

  .csc-content::-webkit-scrollbar-thumb:hover,
  .csc-dropdown::-webkit-scrollbar-thumb:hover {
    background: var(--csc-secondary);
  }
</style>
`;

// =====================================
// Main Application Class
// =====================================
class CrewSkillComparisonApp extends Application {
  constructor(options = {}) {
    super(options);
    this.selectedSkill = null;
    this.allSkills = [];
    this.filteredSkills = [];
    this.playerCharacters = [];
    this.rollResults = {}; // actorId → roll value, null = not rolled
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "crew-skill-comparison-app",
      title: "Crew Skill Comparison",
      template: null,
      classes: ["crew-skill-comparison"],
      width: 700,
      height: 500,
      resizable: true,
      scrollY: [".csc-content", ".csc-dropdown"]
    });
  }

  get template() { return null; }

  async getData() {
    // Get all player characters (not GM-owned)
    this.playerCharacters = game.actors.filter(actor => {
      if (actor.type !== "character") return false;
      
      // Check if owned by a player (not GM)
      const owners = Object.entries(actor.ownership || {});
      return owners.some(([userId, level]) => {
        if (userId === "default") return false;
        const user = game.users.get(userId);
        return user && !user.isGM && level === 3; // OWNER permission
      });
    });

    // Collect all unique skills from all player characters
    const skillMap = new Map();
    
    this.playerCharacters.forEach(actor => {
      const skills = actor.items.filter(item => item.type === "skill");
      skills.forEach(skill => {
        const key = skill.name.toLowerCase();
        if (!skillMap.has(key)) {
          skillMap.set(key, {
            name: skill.name,
            stat: skill.system.stat || "N/A"
          });
        }
      });
    });

    // Convert to sorted array
    this.allSkills = Array.from(skillMap.values()).sort((a, b) => 
      a.name.localeCompare(b.name)
    );
    
    this.filteredSkills = [...this.allSkills];

    return {};
  }

  async _renderInner() {
    await this.getData();
    return $(this._buildHTML());
  }

  _buildHTML() {
    return `
      ${cscStyle}
      <div class="csc-wrapper">
        <div class="csc-header">
          <div class="csc-title">Crew Skill Comparison</div>
          ${this.selectedSkill
            ? `<button class="csc-roll-btn" id="csc-roll-btn">
                 <i class="fas fa-dice-d10"></i> Roll Skill
               </button>`
            : `<span></span>`
          }
        </div>

        <div class="csc-selector">
          <div class="csc-search-wrapper">
            <input 
              type="text" 
              class="csc-search-input" 
              id="csc-skill-search"
              placeholder="Search skills..."
              autocomplete="off"
            >
            <div class="csc-dropdown" id="csc-dropdown">
              ${this._buildDropdownItems()}
            </div>
          </div>
        </div>

        <div class="csc-content" id="csc-content">
          ${this._buildEmptyState()}
        </div>
      </div>`;
  }

  _buildDropdownItems() {
    return this.filteredSkills.map(skill => `
      <div class="csc-dropdown-item" data-skill="${skill.name}">
        <span class="csc-skill-name">${skill.name}</span>
        <span class="csc-skill-stat">(${skill.stat.toUpperCase()})</span>
      </div>
    `).join("");
  }

  _buildEmptyState() {
    return `
      <div class="csc-empty-state">
        <div class="csc-empty-text">Select a skill to view crew comparison</div>
      </div>`;
  }

  _buildSkillCards(skillName) {
    const cards = [];

    this.playerCharacters.forEach(actor => {
      const skill = actor.items.find(item => 
        item.type === "skill" && item.name === skillName
      );

      if (!skill) return; // Skip if character doesn't have this skill

      const skillLevel = skill.system.level || 0;
      const statName = skill.system.stat || "";
      const statValue = actor.system.stats?.[statName]?.value || 0;
      const baseScore = statValue + skillLevel;

      cards.push({
        actor,
        skill,
        skillLevel,
        statName,
        statValue,
        baseScore
      });
    });

    // Sort by base score (highest first)
    cards.sort((a, b) => b.baseScore - a.baseScore);

    if (cards.length === 0) {
      return `
        <div class="csc-empty-state">
          <div class="csc-empty-text">No crew members have this skill</div>
        </div>`;
    }

    // Find the highest score for highlighting
    const highestScore = cards.length > 0 ? cards[0].baseScore : 0;

    return `
      <div class="csc-cards-grid">
        ${cards.map(card => `
          <div class="csc-card">
            <div class="csc-card-header">
              <img src="${card.actor.img}" alt="${card.actor.name}" class="csc-portrait">
              <div class="csc-char-name">${card.actor.name}</div>
            </div>
            <div class="csc-stats">
              <div class="csc-stat-row">
                <span class="csc-stat-label">Skill</span>
                <span class="csc-stat-value">${card.skillLevel}</span>
              </div>
              <div class="csc-stat-row">
                <span class="csc-stat-label">${card.statName.toUpperCase()}</span>
                <span class="csc-stat-value">${card.statValue}</span>
              </div>
            </div>
            <div class="csc-base-score">
              <div class="csc-base-col">
                <div class="csc-base-label">Base</div>
                <div class="csc-base-value ${card.baseScore === highestScore ? 'highest' : ''}">${card.baseScore}</div>
              </div>
              <div class="csc-base-col">
                <div class="csc-base-label">Roll</div>
                ${this._buildRollValue(card.actor.id)}
              </div>
            </div>
          </div>
        `).join("")}
      </div>`;
  }

  _rollD10() {
    const r = Math.ceil(Math.random() * 10);
    if (r === 10) return 10 + Math.ceil(Math.random() * 10); // explode once
    if (r === 1) return 1 - Math.ceil(Math.random() * 10);   // implode once
    return r;
  }

  _buildRollValue(actorId) {
    const result = this.rollResults[actorId];
    if (result === undefined || result === null) {
      return `<div class="csc-roll-value empty">—</div>`;
    }
    const prefix = result >= 0 ? "+" : "";
    const cls = result >= 0 ? "positive" : "negative";
    return `<div class="csc-roll-value ${cls}">${prefix}${result}</div>`;
  }

  activateListeners(html) {
    super.activateListeners(html);

    const searchInput = html.find('#csc-skill-search');
    const dropdown = html.find('#csc-dropdown');
    const content = html.find('#csc-content');

    // Show dropdown on focus
    searchInput.on('focus', () => {
      dropdown.addClass('active');
    });

    // Hide dropdown when clicking outside
    $(document).on('click.csc', (e) => {
      if (!$(e.target).closest('.csc-search-wrapper').length) {
        dropdown.removeClass('active');
      }
    });

    // Filter skills as user types
    searchInput.on('input', (e) => {
      const search = $(e.currentTarget).val().toLowerCase();
      
      this.filteredSkills = this.allSkills.filter(skill => 
        skill.name.toLowerCase().includes(search)
      );

      dropdown.html(this._buildDropdownItems());
      dropdown.addClass('active');
      
      // Re-attach dropdown item listeners
      this._attachDropdownListeners(html);
    });

    // Initial dropdown listeners
    this._attachDropdownListeners(html);
    this._attachRollListener(html);
  }

  _attachRollListener(html) {
    html.off('click', '#csc-roll-btn').on('click', '#csc-roll-btn', () => {
      if (!this.selectedSkill) return;
      // Roll for every visible character
      this.playerCharacters.forEach(actor => {
        const skill = actor.items.find(
          i => i.type === "skill" && i.name === this.selectedSkill
        );
        if (skill) this.rollResults[actor.id] = this._rollD10();
      });
      // Refresh content with new roll values
      html.find('#csc-content').html(this._buildSkillCards(this.selectedSkill));
    });
  }

  _attachDropdownListeners(html) {
    const dropdown = html.find('#csc-dropdown');
    const searchInput = html.find('#csc-skill-search');
    const content = html.find('#csc-content');

    html.find('.csc-dropdown-item').on('click', (e) => {
      const skillName = $(e.currentTarget).data('skill');
      this.selectedSkill = skillName;
      this.rollResults = {}; // reset rolls on skill change

      // Update search input
      searchInput.val(skillName);
      
      // Hide dropdown
      dropdown.removeClass('active');

      // Rebuild header to show Roll button
      html.find('.csc-header').replaceWith(`
        <div class="csc-header">
          <div class="csc-title">Crew Skill Comparison</div>
          <button class="csc-roll-btn" id="csc-roll-btn">
            <i class="fas fa-dice-d10"></i> Roll Skill
          </button>
        </div>`);
      this._attachRollListener(html);

      // Update content
      content.html(this._buildSkillCards(skillName));
    });
  }

  close(options) {
    // Clean up document click listener
    $(document).off('click.csc');
    return super.close(options);
  }
}

// =====================================
// Launch the Skill Comparison Tool
// =====================================
new CrewSkillComparisonApp().render(true);
