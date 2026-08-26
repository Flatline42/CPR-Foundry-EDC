/*
=====================================
CYBERPUNK RED CHARACTER CREATION WIZARD
=====================================
Author: Flatline's EDC
Version: 1.0.0
Description: Step-by-step character creation wizard for Cyberpunk RED
             Foundry VTT System v0.92.4 / Foundry v12
Features:
  - Character method selection (Streetrat / Edgerunner / Complete Package)
  - Role selection with special ability preview
  - Stat generation: Point Buy, Random (Streetrat), or Fast & Dirty (Edgerunner)
  - Full skill allocation with +/- controls, categories, search
  - General + Role-Specific Lifepath with Generate buttons for every table
  - Starting funds based on chosen method
  - Clones blank template actor, assigns ownership to running user
=====================================
*/

// ============================================================
// CONFIGURATION — Set your blank template actor ID here
// ============================================================
const CHARGEN_TEMPLATE_ACTOR_ID = "Actor.2KZebpNL5EG1BNEL";

// ============================================================
// COLOR CONFIGURATION
// ============================================================
const CHARGEN_COLORS = {
  primary:    "#FFD700",
  secondary:  "#F65261",
  background: "#2e2e2e",
};

// ============================================================
// GAME DATA — All sourced from CPR Core Rulebook
// ============================================================

// --- ROLES ---
const ROLES = {
  rockerboy: {
    displayName: "Rockerboy",
    ability: "Charismatic Impact",
    abilityDesc: "Influence crowds through performance, art, or sheer presence. Converts bystanders to fans and calls on them for favors.",
    icon: "fas fa-guitar",
  },
  solo: {
    displayName: "Solo",
    ability: "Combat Awareness",
    abilityDesc: "Tactical superiority in combat. Grants bonuses to initiative, awareness, defense, and special combat maneuvers.",
    icon: "fas fa-crosshairs",
  },
  netrunner: {
    displayName: "Netrunner",
    ability: "Interface",
    abilityDesc: "Hack into systems, run the NET, deploy programs, and breach ICE. The only one who can fight in cyberspace.",
    icon: "fas fa-network-wired",
  },
  tech: {
    displayName: "Tech",
    ability: "Maker",
    abilityDesc: "Build, repair, and upgrade weapons, vehicles, and cyberware. Field expertise, fabrication, and invention.",
    icon: "fas fa-tools",
  },
  medtech: {
    displayName: "Medtech",
    ability: "Medicine",
    abilityDesc: "Advanced medical care: surgery, cryosystems, pharmaceuticals. Keeps the crew alive when First Aid isn't enough.",
    icon: "fas fa-first-aid",
  },
  media: {
    displayName: "Media",
    ability: "Credibility",
    abilityDesc: "Shape public opinion and uncover the truth. Higher credibility means bigger impact and wider reach.",
    icon: "fas fa-bullhorn",
  },
  lawman: {
    displayName: "Lawman",
    ability: "Backup",
    abilityDesc: "Call in reinforcements from your unit. Higher rank means faster response and heavier backup.",
    icon: "fas fa-shield-alt",
  },
  exec: {
    displayName: "Exec",
    ability: "Teamwork",
    abilityDesc: "Build and direct a corporate team. Assign tasks, get corporate perks, and leverage resources.",
    icon: "fas fa-briefcase",
  },
  fixer: {
    displayName: "Fixer",
    ability: "Operator",
    abilityDesc: "Source anything on the black market, set up contacts, and negotiate deals. The ultimate middleman.",
    icon: "fas fa-handshake",
  },
  nomad: {
    displayName: "Nomad",
    ability: "Moto",
    abilityDesc: "Master of vehicles and the open road. Adds Moto rank to all vehicle skills and builds a Family motorpool.",
    icon: "fas fa-motorcycle",
  },
};

// --- STAT TEMPLATES (CRB p.74-77, Streetrat = read one row, Edgerunner = roll per stat) ---
// Order: INT, REF, DEX, TECH, COOL, WILL, LUCK, MOVE, BODY, EMP
const STAT_TEMPLATES = {
  rockerboy: [
    [7,6,6,5,6,8,7,7,3,8],[3,7,7,7,7,6,7,7,5,8],[4,5,7,7,6,6,7,7,5,8],
    [4,5,7,7,6,8,7,6,3,8],[3,7,7,7,6,8,6,5,4,7],[5,6,7,5,7,8,5,7,3,7],
    [5,6,6,7,7,8,7,6,3,6],[5,7,7,5,6,6,6,6,4,8],[3,5,5,6,7,8,7,5,5,7],
    [4,5,6,5,8,8,7,6,4,7],
  ],
  solo: [
    [6,7,7,3,8,6,5,5,6,5],[7,8,6,3,6,6,7,5,6,6],[5,8,7,4,7,7,6,7,8,5],
    [5,8,6,4,6,7,6,5,7,6],[6,6,7,5,7,6,7,6,8,4],[7,7,6,5,7,6,6,7,7,5],
    [7,7,6,5,6,7,7,6,6,6],[7,8,7,5,6,6,5,6,8,4],[7,7,6,4,6,6,6,5,6,5],
    [6,6,8,5,6,6,5,6,6,5],
  ],
  netrunner: [
    [5,8,7,7,7,4,8,7,7,4],[5,6,7,5,8,3,8,7,5,5],[5,6,8,6,6,4,7,6,7,4],
    [5,7,7,7,7,5,8,6,5,5],[5,8,8,5,7,3,7,5,5,6],[6,6,6,7,8,4,7,7,6,6],
    [6,6,6,7,6,5,7,7,7,6],[5,7,8,6,8,4,8,5,7,4],[7,6,7,7,6,3,6,5,6,5],
    [7,8,6,6,6,4,7,7,5,6],
  ],
  tech: [
    [6,7,7,8,4,4,5,5,7,6],[7,6,6,7,5,3,7,7,5,5],[8,6,5,7,5,4,7,7,5,7],
    [7,8,7,8,4,4,6,5,6,7],[6,6,7,6,4,3,7,7,6,6],[8,7,5,6,3,3,7,6,6,7],
    [8,6,7,8,4,4,7,6,7,6],[8,8,7,8,5,4,6,5,6,6],[6,6,7,8,3,3,5,7,7,7],
    [8,8,5,6,4,4,6,5,6,6],
  ],
  medtech: [
    [7,5,6,7,5,3,8,5,5,7],[6,7,7,7,4,4,6,7,7,7],[6,5,5,8,5,3,8,5,7,8],
    [8,7,6,8,3,5,6,6,5,7],[6,7,5,7,5,5,8,7,6,8],[8,5,5,8,5,5,6,6,5,6],
    [8,6,5,8,5,4,8,5,7,7],[6,5,7,7,3,5,8,5,5,8],[6,6,7,7,5,4,6,6,5,6],
    [8,7,6,6,3,4,8,7,6,7],
  ],
  media: [
    [6,6,5,5,8,7,5,7,5,7],[8,7,7,3,6,6,6,5,6,8],[6,7,7,5,6,8,5,5,5,7],
    [6,5,7,5,6,7,5,5,6,6],[6,6,7,4,8,7,6,7,5,8],[7,5,5,4,8,7,6,7,5,8],
    [8,5,6,3,7,6,6,5,6,7],[6,5,6,5,6,8,6,6,7,8],[7,7,5,4,6,7,6,5,6,7],
    [7,6,6,3,7,6,7,6,7,6],
  ],
  lawman: [
    [5,6,7,5,7,8,5,6,5,6],[6,6,6,5,6,8,5,7,5,5],[5,7,7,7,6,7,5,5,7,6],
    [6,6,7,6,6,8,5,7,7,6],[6,6,7,6,7,7,6,5,5,6],[7,6,5,5,7,8,5,6,7,4],
    [7,8,7,5,6,8,7,6,5,4],[5,6,6,5,6,8,5,7,6,4],[7,7,5,5,7,7,6,5,5,6],
    [6,6,5,6,8,7,5,7,6,6],
  ],
  exec: [
    [8,5,5,3,8,6,6,5,5,7],[8,6,6,4,7,6,7,7,5,7],[8,7,6,3,8,6,7,6,4,5],
    [8,5,7,5,6,5,6,5,5,7],[7,7,6,5,8,5,7,7,5,6],[5,7,7,3,6,7,6,5,5,7],
    [6,6,7,5,8,7,6,7,4,6],[6,7,7,3,7,5,7,5,5,7],[7,6,7,5,7,5,7,6,5,5],
    [7,7,5,5,8,6,6,7,4,7],
  ],
  fixer: [
    [8,5,7,4,6,5,8,5,5,8],[8,5,5,5,6,7,8,7,5,7],[6,6,6,4,5,6,8,6,3,8],
    [7,7,5,5,7,6,7,7,5,8],[8,6,6,3,6,5,8,7,5,6],[8,7,5,5,6,7,7,5,3,6],
    [8,6,6,5,6,5,6,7,5,8],[6,6,7,4,7,6,7,7,4,7],[8,7,7,5,5,5,7,6,5,7],
    [6,5,6,5,5,6,8,6,4,7],
  ],
  nomad: [
    [6,6,8,3,6,7,6,6,6,4],[5,7,6,5,8,8,8,7,5,4],[5,8,6,3,8,7,6,5,6,5],
    [5,8,7,4,8,6,7,7,7,5],[6,6,6,3,6,7,6,7,7,4],[7,6,8,4,6,7,6,5,6,5],
    [6,7,8,4,6,6,7,5,7,5],[5,7,8,3,8,6,7,5,5,5],[6,7,6,4,8,6,6,6,6,6],
    [5,6,7,4,7,8,7,7,7,4],
  ],
};

const STAT_KEYS  = ["int","ref","dex","tech","cool","will","luck","move","body","emp"];
const STAT_NAMES = ["INT","REF","DEX","TECH","COOL","WILL","LUCK","MOVE","BODY","EMP"];

// --- SKILL CATEGORIES (from IP script, authoritative) ---
const SKILL_CATEGORIES = {
  "Awareness Skills":     ["Conceal/Reveal Object","Concentration","Lip Reading","Perception","Tracking"],
  "Body Skills":          ["Athletics","Contortionist","Dance","Endurance","Resist Torture/Drugs","Stealth"],
  "Control Skills":       ["Drive Land Vehicle","Pilot Air Vehicle","Pilot Sea Vehicle","Riding"],
  "Education Skills":     ["Accounting","Animal Handling","Bureaucracy","Business","Composition","Criminology","Cryptography","Deduction","Education","Gamble","Library Search","Local Expert","Science","Tactics","Wilderness Survival"],
  "Fighting Skills":      ["Brawling","Evasion","Martial Arts","Melee Weapon"],
  "Performance Skills":   ["Acting","Play Instrument"],
  "Ranged Weapon Skills": ["Archery","Autofire","Handgun","Heavy Weapons","Shoulder Arms"],
  "Social Skills":        ["Bribery","Conversation","Human Perception","Interrogation","Personal Grooming","Persuasion","Streetwise","Trading","Wardrobe & Style"],
  "Technique Skills":     ["Air Vehicle Tech","Basic Tech","Cybertech","Demolitions","Electronics/Security Tech","First Aid","Forgery","Land Vehicle Tech","Paint/Draw/Sculpt","Paramedic","Photography/Film","Pick Lock","Pick Pocket","Sea Vehicle Tech","Weaponstech"],
};

// Basic Skills that must be >= 2 (CRB p.90)
const BASIC_SKILLS = new Set([
  "Athletics","Brawling","Concentration","Conversation","Education","Evasion",
  "First Aid","Human Perception","Local Expert","Perception","Persuasion","Stealth",
]);

// x2 cost skills (CRB p.88)
const DIFFICULT_SKILLS = new Set([
  "Autofire","Heavy Weapons","Demolitions","Electronics/Security Tech","Paramedic","Pilot Air Vehicle","Martial Arts",
]);

const CATEGORY_ICONS = {
  "Awareness Skills":     "fas fa-eye",
  "Body Skills":          "fas fa-running",
  "Control Skills":       "fas fa-car",
  "Education Skills":     "fas fa-book",
  "Fighting Skills":      "fas fa-fist-raised",
  "Performance Skills":   "fas fa-theater-masks",
  "Ranged Weapon Skills": "fas fa-crosshairs",
  "Social Skills":        "fas fa-comments",
  "Technique Skills":     "fas fa-tools",
};

// Flat list for iteration
const ALL_SKILLS = Object.values(SKILL_CATEGORIES).flat();

// --- STARTING FUNDS (CRB p.41-42, p.98) ---
const STARTING_FUNDS = {
  streetrat:  500,
  edgerunner: 500,
  complete:   2550,
};

// --- GENERAL LIFEPATH TABLES (CRB p.45-53) ---
const LIFEPATH_TABLES = {
  culturalOrigin: {
    label: "Cultural Origin",
    die: 10,
    entries: [
      "North American","South/Central American","Western European","Eastern European",
      "Middle Eastern/North African","Sub-Saharan African","South Asian","South East Asian",
      "East Asian","Oceania/Pacific Islander",
    ],
  },
  personality: {
    label: "Personality",
    die: 10,
    entries: [
      "Shy and secretive","Rebellious, antisocial, and violent","Arrogant, proud, and aloof",
      "Moody, rash, and headstrong","Picky, fussy, and nervous","Stable and serious",
      "Silly and fluff-headed","Sneaky and deceptive","Intellectual and detached",
      "Friendly and outgoing",
    ],
  },
  clothingStyle: {
    label: "Clothing Style",
    die: 10,
    entries: [
      "Generic Chic (Standard, Colorful, Modular)","Leisurewear (Comfort, Agility, Athleticism)",
      "Urban Flash (Flashy, Technological, Streetwear)","Businesswear (Leadership, Presence, Authority)",
      "High Fashion (Exclusive, Designer, Couture)","Bohemian (Folksy, Retro, Free-spirited)",
      "Bag Lady Chic (Homeless, Ragged, Vagrant)","Gang Colors (Dangerous, Violent, Rebellious)",
      "Nomad Leathers (Western, Rugged, Tribal)","Asia Pop (Bright, Costume-like, Youthful)",
    ],
  },
  hairstyle: {
    label: "Hairstyle",
    die: 10,
    entries: [
      "Mohawk","Long and ratty","Short and spiked","Wild and all over","Bald",
      "Striped","Wild colors","Neat and short","Short and curly","Long and straight",
    ],
  },
  affectation: {
    label: "Affectation (Never Without)",
    die: 10,
    entries: [
      "Tattoos","Mirrorshades","Ritual scars","Spiked gloves","Nose rings",
      "Tongue or other piercings","Strange fingernail implants","Spiked boots or heels",
      "Fingerless gloves","Strange contacts",
    ],
  },
  valueMost: {
    label: "What You Value Most",
    die: 10,
    entries: [
      "Money","Honor","Your word","Honesty","Knowledge",
      "Vengeance","Love","Power","Family","Friendship",
    ],
  },
  feelingsAboutPeople: {
    label: "Feelings About People",
    die: 10,
    entries: [
      "I stay neutral.","I stay neutral.","I like almost everyone.","I hate almost everyone.",
      "People are tools. Use them then discard them.",
      "Every person is a valuable individual.",
      "People are obstacles to be destroyed if they cross me.",
      "People are untrustworthy. Don't depend on anyone.",
      "Wipe 'em all out and let the cockroaches take over.",
      "People are wonderful!",
    ],
  },
  mostValuedPerson: {
    label: "Most Valued Person",
    die: 10,
    entries: [
      "A parent","A brother or sister","A lover","A friend","Yourself",
      "A pet","A teacher or mentor","A public figure","A personal hero","No one",
    ],
  },
  mostValuedPossession: {
    label: "Most Valued Possession",
    die: 10,
    entries: [
      "A weapon","A tool","A piece of clothing","A photograph","A book or diary",
      "A recording","A musical instrument","A piece of jewelry","A toy","A letter",
    ],
  },
  familyBackground: {
    label: "Original Family Background",
    die: 10,
    entries: [
      "Corporate Execs — Wealthy, powerful, private security and big-name school.",
      "Corporate Managers — Well to do, mix of private and corporate education.",
      "Corporate Technicians — Middle class, comfortable conapts, corporate-run technical schools.",
      "Nomad Pack — Rugged trailers and kombis; learned to drive and fight early.",
      "Ganger \"Family\" — Savage, violent; the gang taught you to fight, kill, and steal.",
      "Combat Zoners — Decaying fortified building in the 'Zone'; hungry at times but surviving.",
      "Urban Homeless — Cars, dumpsters, shipping modules. School of Hard Knocks.",
      "Megastructure Warren Rats — Tiny conapt, kibble and scop, mostly warm bed.",
      "Reclaimers — On the road then into a ghost town to rebuild it. Pioneer life.",
      "Edgerunners — Always changing based on parents' current job.",
    ],
  },
  childhoodEnvironment: {
    label: "Childhood Environment",
    die: 10,
    entries: [
      "Ran on The Street, with no adult supervision.",
      "Spent in a safe Corp Zone walled off from the rest of the City.",
      "In a Nomad pack moving from place to place.",
      "In a Nomad pack with roots in transport (ships, planes, caravans).",
      "In a decaying, once upscale neighborhood, now holding off the boosters to survive.",
      "In the heart of the Combat Zone, living in a wrecked building or other squat.",
      "In a huge \"megastructure\" building controlled by a Corp or the City.",
      "In the ruins of a deserted town or city taken over by Reclaimers.",
      "In a Drift Nation (a floating offshore city) — meeting place for all kinds of people.",
      "In a Corporate luxury \"starscraper,\" high above the rest of the teeming rabble.",
    ],
  },
  familyCrisis: {
    label: "Family Crisis",
    die: 10,
    entries: [
      "Your family lost everything through betrayal.",
      "Your family lost everything through bad management.",
      "Your family was exiled or driven from their original home/nation/Corporation.",
      "Your family is imprisoned, and you alone escaped.",
      "Your family vanished. You are the only remaining member.",
      "Your family was killed, and you were the only survivor.",
      "Your family is involved in a long-term conspiracy or criminal organization.",
      "Your family was scattered to the winds due to misfortune.",
      "Your family is cursed with a hereditary feud that has lasted for generations.",
      "You are the inheritor of a family debt you must honor before moving on.",
    ],
  },
  lifeGoals: {
    label: "Life Goals",
    die: 10,
    entries: [
      "Get rid of a bad reputation.",
      "Gain power and control.",
      "Get off The Street no matter what it takes.",
      "Cause pain and suffering to anyone who crosses you.",
      "Live down your past life and try to forget it.",
      "Hunt down those responsible for your miserable life and make them pay.",
      "Get what's rightfully yours.",
      "Save, if possible, anyone else involved in your background.",
      "Gain fame and recognition.",
      "Become feared and respected.",
    ],
  },
  // Variable-count tables (friends/enemies/love affairs) handled separately
  friendType: {
    label: "Friend's Relationship",
    die: 10,
    entries: [
      "Like an older sibling to you.","Like a younger sibling to you.",
      "A teacher or mentor.","A partner or coworker.","A former lover.",
      "An old enemy.","Like a parent to you.","An old childhood friend.",
      "Someone you know from The Street.","Someone with a common interest or goal.",
    ],
  },
  enemyType: {
    label: "Enemy Type",
    die: 10,
    entries: [
      "Ex-friend","Ex-lover","Estranged relative","Childhood enemy",
      "Person working for you","Person you work for","Partner or coworker",
      "Corporate exec","Government official","Boosterganger",
    ],
  },
  enemyCause: {
    label: "What Caused the Beef",
    die: 10,
    entries: [
      "Caused the other to lose face or status.",
      "Caused the loss of lover, friend, or relative.",
      "Caused a major public humiliation.",
      "Accused the other of cowardice or a major personal flaw.",
      "Deserted or betrayed the other.",
      "Turned down their offer of a job or romantic involvement.",
      "You just don't like each other.",
      "One of you was a romantic rival.",
      "One of you was a business rival.",
      "One of you set the other up for a crime they didn't commit.",
    ],
  },
  enemyResources: {
    label: "What They Can Throw at You",
    die: 10,
    entries: [
      "Just themselves and even they won't go out of their way.",
      "Just themselves.",
      "Themselves and a close friend.",
      "Themselves and a few (1d6/2) friends.",
      "Themselves and a few (1d10/2) friends.",
      "An entire gang (at least 1d10 + 5 people).",
      "The local cops or other Lawmen.",
      "A powerful gang lord or small Corporation.",
      "A powerful Corporation.",
      "An entire city or government agency.",
    ],
  },
  enemyRevenge: {
    label: "What They'll Do When You Meet",
    die: 10,
    entries: [
      "Avoid the scum.","Avoid the scum.",
      "Go into a murderous rage and try to rip your face off.",
      "Go into a murderous rage and try to rip your face off.",
      "Backstab you indirectly.","Backstab you indirectly.",
      "Verbally attack you.","Verbally attack you.",
      "Set you up for a crime or transgression you didn't commit.",
      "Set out to murder or maim you.",
    ],
  },
  loveAffairOutcome: {
    label: "Tragic Love Affair — What Happened",
    die: 10,
    entries: [
      "Your lover died in an accident.",
      "Your lover mysteriously vanished.",
      "It just didn't work out.",
      "A personal goal or vendetta came between you.",
      "Your lover was kidnapped.",
      "Your lover went insane or cyberpsycho.",
      "Your lover committed suicide.",
      "Your lover was killed in a fight.",
      "A rival cut you out of the action.",
      "Your lover is imprisoned or exiled.",
    ],
  },
};

// --- ROLE-SPECIFIC LIFEPATH TABLES (CRB p.54-69) ---
const ROLE_LIFEPATHS = {
  rockerboy: [
    { label: "What Kind of Rockerboy Are You?", die: 10, entries: ["Musician","Slam Poet","Street Artist","Performance Artist","Comedian","Orator","Politico","Rap Artist","DJ","Idoru"] },
    { label: "Where Do You Perform?", die: 6, entries: ["Alternative Cafes","Private Clubs","Seedy Dive Bars","Guerrilla Performances","Nightclubs Around the City","On the Data Pool"] },
    { label: "Who's Gunning for You/Your Group?", die: 6, entries: ["Old group member who thinks you did them dirty.","Rival group or artist trying to steal market share.","Corporate enemies who don't like your message.","Critic or other \"influencer\" trying to bring you down.","Older media star who feels threatened by your rising fame.","Romantic interest or media figure who wants revenge for personal reasons."] },
    { label: "If You Were in a Group — Why Did You Leave?", die: 6, entries: ["You were a jerk and the rest of the group voted you out.","You got caught sleeping around with another member's mainline.","The rest of the group was killed in a tragic \"accident.\"","The rest of the group was murdered or broken up by external enemies.","The group broke up over \"creative differences.\"","You decided to go solo."] },
  ],
  solo: [
    { label: "What Kind of Solo Are You?", die: 6, entries: ["Bodyguard","Street Muscle for Hire","Corporate Enforcer who takes jobs on the side","Corporate or Freelance Black Ops Agent","Local Vigilante for Hire","Assassin/Hitman for Hire"] },
    { label: "What's Your Operational Territory?", die: 6, entries: ["A Corporate Zone","Combat Zones","The whole City","The territory of a single Corporation","The territory of a particular Fixer or contact","Wherever the money takes you"] },
    { label: "Who's Gunning for You?", die: 6, entries: ["A Corporation you may have angered.","A boostergang you may have tackled earlier.","Corrupt Lawmen or Lawmen who mistakenly think you're guilty of something.","A rival Solo from another Corp.","A Fixer who sees you as a threat.","A rival Solo who sees you as their nemesis."] },
    { label: "What's Your Moral Compass Like?", die: 6, entries: ["Always working for good, trying to take out the \"bad guys.\"","Always spare the innocent (elderly, women, children, pets).","Will occasionally slip and do unethical or bad things, but it's rare.","Ruthless and profit centered; you will work for anyone, take any job for the money.","Willing to bend the rules (and the law) to get the job done.","Totally evil. You engage in illegal, unethical work all the time; in fact, you enjoy it."] },
    { label: "If You Have a Partner — Who Are They?", die: 6, entries: ["Family member","Old friend","Possible romantic partner as well","Secret partner who might be a rogue AI. Might.","Secret partner with mob/gang connections","Secret partner with Corporate connections"] },
  ],
  netrunner: [
    { label: "What Kind of Runner Are You?", die: 6, entries: ["Freelancer who will hack for hire.","Corporate \"clone runner\" who hacks for the Man.","Hacktivist interested in cracking systems and exposing bad guys.","Just like to crack systems for the fun of it.","Part of a regular team of freelancers.","Hack for a Media, politico, or Lawman who hires you as needed."] },
    { label: "What's Your Workspace Like?", die: 6, entries: ["There are screens everywhere.","It looks better in Virtuality, you swear.","It's a filthy bed covered in wires.","Corporate, modular, and utilitarian.","Minimalist, clean, and organized.","It's taken over your entire living space."] },
    { label: "Who Are Some of Your Other Clients?", die: 6, entries: ["Local Fixers who send you clients.","Local gangers who also protect your work area while you sweep for NET threats.","Corporate Execs who use you for \"black project\" work.","Local Solos or combat types who use you to keep their personal systems secure.","Local Nomads and Fixers who use you to keep their family systems secure.","You work for yourself and sell whatever data you can find on the NET."] },
    { label: "Where Do You Get Your Programs?", die: 6, entries: ["Dig around in old abandoned City Zones.","Steal them from other Netrunners you brain-burn.","Have a local Fixer supply programs in exchange for hack work.","Corporate Execs supply you with programs in exchange for your services.","You have backdoors into a few Corporate warehouses.","You hit the Night Markets and score programs whenever you can."] },
    { label: "Who's Gunning for You?", die: 6, entries: ["You think it might be a rogue AI or a NET Ghost. Either way, it's bad news.","Rival Netrunners who just don't like you.","Corporates who want you to work for them exclusively.","Lawmen who consider you an illegal \"black hat\" and want to bust you.","Old clients who think you screwed them over.","Fixer or another client who wants your services exclusively."] },
    { label: "If You Have a Partner — Who Are They?", die: 6, entries: ["Family member","Old friend","Possible romantic partner as well","Secret partner who might be a rogue AI. Might.","Secret partner with mob/gang connections","Secret partner with Corporate connections"] },
  ],
  tech: [
    { label: "What Kind of Tech Are You?", die: 10, entries: ["Cyberware Technician","Vehicle Mechanic","Jack of All Trades","Small Electronics Technician","Weaponsmith","Crazy Inventor","Robot and Drone Mechanic","Heavy Machinery Mechanic","Scavenger","Nautical Mechanic"] },
    { label: "What's Your Workspace Like?", die: 6, entries: ["A mess strewn with blueprint paper.","Everything is color coded, but it's still a nightmare.","Totally digital and obsessively backed up every day.","You design everything on your Agent.","You keep everything just in case you need it later.","Only you understand your filing system."] },
    { label: "Who Are Your Main Clients?", die: 6, entries: ["Local Fixers who send you clients.","Local gangers who also protect your work area or home.","Corporate Execs who use you for \"black project\" work.","Local Solos or combat types who use you for weapon upkeep.","Local Nomads and Fixers who bring you \"found\" tech to repair.","You work for yourself and sell what you invent/repair."] },
    { label: "Where Do You Get Your Supplies?", die: 6, entries: ["Scavenge the wreckage in abandoned City Zones.","Strip gear from bodies after firefights.","Have a local Fixer bring supplies in exchange for work.","Corporate Execs supply you in exchange for your services.","You have a backdoor into a few Corporate warehouses.","You hit the Night Markets and score deals whenever you can."] },
    { label: "If You Have a Partner — Who Are They?", die: 6, entries: ["Family member","Old friend","Possible romantic partner as well","Mentor","Secret partner with mob/gang connections","Secret partner with Corporate connections"] },
  ],
  medtech: [
    { label: "What Kind of Medtech Are You?", die: 10, entries: ["Surgeon","General Practitioner","Trauma Medic","Psychiatrist","Cyberpsycho Therapist","Ripperdoc","Cryosystems Operator","Pharmacist","Bodysculptor","Forensic Pathologist"] },
    { label: "What's Your Workspace Like?", die: 6, entries: ["Sterilized daily in the morning like clockwork.","It's not state-of-the-art anymore, but it's comfortable to you.","Your cryo equipment is also used to cool drinks.","Everything possible is single-use and stored compacted until needed.","Not as clean as many of your patients may have hoped.","Meticulously organized, sharpened, and sterilized."] },
    { label: "Who Are Your Main Clients?", die: 6, entries: ["Local Fixers who send you clients.","Local gangers who also protect your work area in exchange for medical help.","Corporate Execs who use you for \"black project\" medical work.","Local Solos or combat types who use you for medical help.","Local Nomads and Fixers who bring you wounded clients.","Trauma Team paramedical work."] },
    { label: "Where Do You Get Your Supplies?", die: 6, entries: ["Scavenge stashes of medical supplies in abandoned City Zones.","Strip parts from bodies after firefights.","Have a local Fixer bring supplies in exchange for medical work.","Corporate Execs or Trauma Team supply you in exchange for your services.","You have a backdoor into a few Corporate or Hospital warehouses.","You hit the Night Markets and score deals whenever you can."] },
    { label: "If You Have a Partner — Who Are They?", die: 6, entries: ["Trauma Team group","Old friend","Possible romantic partner as well","Family member","Secret partner with mob/gang connections","Secret partner with Corporate connections"] },
  ],
  media: [
    { label: "What Kind of Media Are You?", die: 6, entries: ["Blogger","Writer (Books)","Videographer","Documentarian","Investigative Reporter","Street Scribe"] },
    { label: "How Ethical Are You?", die: 6, entries: ["Fair, honest reporting, strong ethical practices. Only report the verifiable truth.","Fair and honest, but willing to go on hearsay if that's what it takes.","Will occasionally slip and do unethical things, but it's rare. Some standards.","Willing to bend any rules to get the bad guys. But only the bad guys.","Ruthless and determined to make it big, even if it means breaking the law.","Totally corrupt. You take bribes and engage in illegal, unethical reporting."] },
    { label: "How Does Your Work Reach the Public?", die: 6, entries: ["Monthly magazine","Blog","Mainstream vid feed","News channel","\"Book\" sales","Screamsheets"] },
    { label: "What Types of Stories Do You Want to Tell?", die: 6, entries: ["Political Intrigue","Ecological Impact","Celebrity News","Corporate Takedowns","Editorials","Propaganda"] },
  ],
  lawman: [
    { label: "What is Your Position on the Force?", die: 6, entries: ["Guard","Standard Beat or Patrol","Criminal Investigation","Special Weapons and Tactics","Motor Patrol","Internal Affairs"] },
    { label: "How Wide is Your Group's Jurisdiction?", die: 6, entries: ["Corporate Zones","Standard City Patrol Zone","Combat Zones","Outer City","Recovery Zones","Open Highways"] },
    { label: "How Corrupt is Your Group?", die: 6, entries: ["Fair, honest policing, strong ethical practices.","Fair and honest policing, but hard on lawbreakers.","Will occasionally slip and do unethical things, but it's rare.","Willing to bend any rules to get the bad guys.","Ruthless and determined to control The Street, even if it means breaking the law.","Totally corrupt. You take bribes and engage in illegal business all the time."] },
    { label: "Who's Gunning for Your Group?", die: 6, entries: ["Organized Crime","Boostergangs","Police Accountability Group","Dirty Politicians","Smugglers","Street Criminals"] },
    { label: "Who is Your Group's Major Target?", die: 6, entries: ["Organized Crime","Boostergangs","Drug Runners","Dirty Politicians","Smugglers","Street Crime"] },
  ],
  exec: [
    { label: "What Kind of Corp Do You Work For?", die: 10, entries: ["Financial","Media and Communications","Cybertech and Medical Technologies","Pharmaceuticals and Biotech","Food, Clothing, or other General Consumables","Energy Production","Personal Electronics and Robotics","Corporate Services","Consumer Services","Real Estate and Construction"] },
    { label: "What Division Do You Work In?", die: 6, entries: ["Procurement","Manufacturing","Research and Development","Human Resources","Public Affairs/Publicity/Advertising","Mergers and Acquisitions"] },
    { label: "How Good/Bad is Your Corp?", die: 6, entries: ["Always working for good, fully supporting ethical practices.","Operates as a fair and honest business all the time.","Will occasionally slip and do unethical things, but it's rare.","Willing to bend the rules to get what it needs.","Ruthless and profit-centered, willing to do some bad things.","Totally evil. Will engage in illegal, unethical business all the time."] },
    { label: "Current State With Your Boss", die: 6, entries: ["Your Boss mentors you but watch out for their enemies.","Your Boss gives you a free hand and doesn't want to know what you're up to.","Your Boss is a micromanager who tries to meddle in your work.","Your Boss is a psycho whose unpredictable outbursts are offset by quiet paranoia.","Your Boss is cool and watches your back against rivals.","Your Boss is threatened by your meteoric rise and is planning to knife you."] },
    { label: "Where is Your Corp Based?", die: 6, entries: ["One city","Several cities","Statewide","National","International, offices in a few major cities","International, offices everywhere"] },
    { label: "Who's Gunning for Your Group?", die: 6, entries: ["Rival Corp in the same industry.","Law enforcement is watching you.","Local Media wants to bring you down.","Different divisions in your own company are feuding.","Local government doesn't like your Corp.","International Corporations are eyeing you for a hostile takeover."] },
  ],
  fixer: [
    { label: "What Kind of Fixer Are You?", die: 6, entries: ["Street-level dealer and trader.","Mid-level broker who deals in information.","Professional with a network of contacts in multiple cities.","Corporate Fixer working to keep a Corporation competitive.","Highly connected, shadowy figure with resources everywhere.","Criminal Fixer with deep ties to the underworld."] },
    { label: "What's Your Specialty?", die: 6, entries: ["Weapons and Military Hardware","Cyberware","Pharmaceuticals and Drugs","Stolen or Black Market Tech","Information and Secrets","People (finding talent, placing personnel)"] },
    { label: "Who Are Your Main Clients?", die: 6, entries: ["Local gangers who protect your work area while you source goods for them.","Local Solos and Medtechs who use you to source gear and info.","Corporate Execs who use you for \"deniable\" operations and sourcing.","Local Nomads and Fixers who use you to supply their operations.","A mix of anyone and everyone — you'll deal with anyone if the price is right.","Local Fixers who send you clients."] },
    { label: "Who's Gunning for You?", die: 6, entries: ["Combat Zone gangers who want you to work for them exclusively.","Rival Fixers trying to steal your clients.","Execs who want you to work for them exclusively.","Enemy of a former client who wants to clean up \"loose ends\" — like you.","Old client who thinks you screwed them over.","Rival Fixer trying to beat you out for resources and parts."] },
  ],
  nomad: [
    { label: "How Big is Your Pack?", die: 6, entries: ["A single extended tribe or family","A couple dozen members","Forty or fifty members","A hundred or more members","A Blood Family (hundreds of members)","An Affiliated Family (made of several Blood Families)"] },
    { label: "If on Land — What Do They Do?", die: 10, entries: ["Gogang","Passenger transport","Chautauqua/school","Traveling show/carnival","Migrant farmers","Cargo transport","Shipment protection","Smuggling","Mercenary army","Construction work gang"] },
    { label: "What Do You Do for Your Pack?", die: 6, entries: ["You're the Pack's primary mechanic and driver.","You're a scout and advance rider.","You're security and muscle.","You're a medic for the Pack.","You handle the Pack's communications and logistics.","You're a trader who finds buyers and sellers for the Pack's work."] },
    { label: "What's Your Pack's Philosophy?", die: 6, entries: ["Family above all. Outsiders are always suspect.","Live and let live — we just want to be left alone.","Freedom of the road is worth any price.","We serve whoever pays us and keep our heads down.","We're at war with the Corporations and proud of it.","We rebuild the world, one job at a time."] },
    { label: "Who's Gunning for Your Pack?", die: 6, entries: ["Rival Nomad family trying to take your routes.","A Corporation whose shipments you've been raiding.","Lawmen who consider your Pack criminals.","A boostergang that wants your vehicles.","An old enemy your Pack wronged years ago.","Corrupt local government officials who want a cut of your work."] },
  ],
};

// ============================================================
// CSS
// ============================================================
const CHARGEN_STYLE = `
<style>
  :root {
    --cp-primary:    ${CHARGEN_COLORS.primary};
    --cp-secondary:  ${CHARGEN_COLORS.secondary};
    --cp-background: ${CHARGEN_COLORS.background};
  }

  /* === APP SHELL === */
  #cpr-chargen.window-app .window-content { padding: 0 !important; }

  .cg-wrapper {
    background: #1b1b1b; color: #fff;
    display: flex; flex-direction: column; height: 100%; overflow: hidden;
  }
  .cg-content {
    flex: 1; overflow-y: auto; padding: 10px;
    scrollbar-width: thin; scrollbar-color: var(--cp-primary) #111;
  }
  .cg-footer {
    display: flex; gap: 6px; justify-content: center; align-items: center;
    padding: 8px; background: var(--cp-background);
    border-top: 2px solid var(--cp-primary); flex-shrink: 0;
  }
  .cg-footer button {
    flex: 1; max-width: 160px; min-width: 90px; padding: 8px 12px;
    background: var(--cp-background) !important; color: var(--cp-primary) !important;
    border: 1px solid var(--cp-primary) !important; border-radius: 3px !important;
    font-weight: bold !important; font-size: 0.8em !important;
    text-transform: uppercase !important; letter-spacing: 0.3px !important;
    cursor: pointer !important; transition: all 0.2s ease !important;
    font-family: inherit !important;
  }
  .cg-footer button:hover {
    background: var(--cp-primary) !important; color: #000 !important;
    transform: scale(1.03) !important; box-shadow: 0 0 6px var(--cp-primary) !important;
  }
  .cg-footer button:disabled {
    opacity: 0.35 !important; cursor: not-allowed !important; transform: none !important;
    box-shadow: none !important;
  }
  .cg-footer button.btn-create {
    background: var(--cp-primary) !important; color: #000 !important;
    font-size: 0.9em !important;
  }
  .cg-footer button.btn-create:disabled {
    background: var(--cp-background) !important; color: var(--cp-primary) !important;
    opacity: 0.35 !important;
  }

  /* === STEP INDICATOR === */
  .cg-steps {
    display: flex; justify-content: center; gap: 6px; margin-bottom: 12px;
    padding: 8px 0; border-bottom: 1px solid rgba(255,215,0,0.2);
  }
  .cg-step-dot {
    width: 28px; height: 28px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.7em; font-weight: bold;
    border: 2px solid rgba(255,215,0,0.3); color: rgba(255,215,0,0.4);
    background: var(--cp-background);
  }
  .cg-step-dot.active {
    border-color: var(--cp-primary); color: #000; background: var(--cp-primary);
  }
  .cg-step-dot.done {
    border-color: var(--cp-primary); color: var(--cp-primary);
    background: rgba(255,215,0,0.15);
  }

  /* === SECTION HEADERS === */
  .cg-section-title {
    font-size: 1.3em; font-weight: bold; color: #000;
    background: linear-gradient(135deg, var(--cp-primary), #ffa500);
    text-align: center; padding: 10px; margin-bottom: 14px;
    border-radius: 5px; text-transform: uppercase; letter-spacing: 2px;
    border: 2px solid var(--cp-primary); box-shadow: 0 4px 8px rgba(255,215,0,0.3);
  }

  /* === IDENTITY STEP === */
  .cg-field-row { display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px; }
  .cg-field-row label { color: var(--cp-primary); font-weight: bold; font-size: 0.85em; text-transform: uppercase; }
  .cg-field-row input[type="text"] {
    background: var(--cp-background); border: 1px solid var(--cp-primary);
    color: #fff; border-radius: 3px; padding: 8px; font-family: inherit;
    font-size: 0.95em;
  }
  .cg-field-row input[type="text"]:focus { outline: none; box-shadow: 0 0 5px var(--cp-primary); }

  /* === METHOD CARDS === */
  .cg-method-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 14px; }
  .cg-method-card {
    background: var(--cp-background); border: 2px solid rgba(255,215,0,0.3);
    border-radius: 6px; padding: 14px; cursor: pointer; transition: all 0.2s;
    display: flex; flex-direction: column; gap: 6px;
  }
  .cg-method-card:hover { border-color: var(--cp-primary); box-shadow: 0 0 8px rgba(255,215,0,0.3); }
  .cg-method-card.selected { border-color: var(--cp-primary); box-shadow: 0 0 12px #00ff00; border-color: #00ff00; }
  .cg-method-card .mc-title { font-weight: bold; font-size: 1em; color: var(--cp-primary); }
  .cg-method-card .mc-subtitle { font-size: 0.75em; color: var(--cp-secondary); font-weight: bold; }
  .cg-method-card .mc-desc { font-size: 0.78em; color: #bbb; line-height: 1.4; }

  /* === ROLE GRID === */
  .cg-role-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 10px; margin-bottom: 14px;
  }
  .cg-role-card {
    background: var(--cp-background); border: 1px solid rgba(255,215,0,0.3);
    border-radius: 5px; padding: 12px; cursor: pointer; transition: all 0.2s;
    display: flex; align-items: flex-start; gap: 12px;
  }
  .cg-role-card:hover { border-color: var(--cp-primary); box-shadow: 0 0 8px rgba(255,215,0,0.3); }
  .cg-role-card.selected { border: 2px solid #00ff00; box-shadow: 0 0 12px #00ff00; }
  .cg-role-card .rc-icon { font-size: 2em; color: var(--cp-secondary); width: 40px; text-align: center; flex-shrink: 0; }
  .cg-role-card .rc-info .rc-name { font-weight: bold; color: var(--cp-primary); }
  .cg-role-card .rc-info .rc-ability { font-size: 0.8em; color: var(--cp-secondary); font-style: italic; }
  .cg-role-card .rc-info .rc-desc { font-size: 0.75em; color: #bbb; margin-top: 4px; line-height: 1.3; }

  /* === STATS STEP === */
  .cg-points-bar {
    text-align: center; font-size: 1em; color: var(--cp-primary);
    padding: 6px; margin-bottom: 12px;
    background: rgba(255,215,0,0.05); border: 1px solid rgba(255,215,0,0.2); border-radius: 3px;
  }
  .cg-points-bar.sticky {
    position: sticky; top: 0; z-index: 10;
    background: #1b1b1b; border-bottom: 2px solid var(--cp-primary);
    margin-bottom: 0; border-radius: 0; padding: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.6);
  }
  .cg-points-bar span { font-weight: bold; color: var(--cp-secondary); font-size: 1.1em; }
  .cg-points-bar span.ok { color: var(--cp-primary); }
  .cg-stat-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-bottom: 10px; }
  .cg-stat-card {
    background: var(--cp-background); border: 1px solid rgba(255,215,0,0.3);
    border-radius: 5px; padding: 8px; display: flex; flex-direction: column;
    align-items: center; gap: 4px;
  }
  .cg-stat-card .sc-name { font-size: 0.7em; color: var(--cp-primary); font-weight: bold; text-transform: uppercase; }
  .cg-stat-card .sc-controls { display: flex; align-items: center; gap: 6px; }
  .cg-stat-card .sc-controls button {
    width: 24px; height: 24px; border: 1px solid var(--cp-primary) !important;
    background: var(--cp-background) !important; color: var(--cp-primary) !important;
    border-radius: 3px !important; cursor: pointer !important; font-size: 1em !important;
    display: flex; align-items: center; justify-content: center;
    padding: 0 !important; min-width: unset !important; max-width: unset !important; flex: unset !important;
  }
  .cg-stat-card .sc-controls button:hover { background: var(--cp-primary) !important; color: #000 !important; }
  .cg-stat-card .sc-val { font-size: 1.3em; font-weight: bold; color: #fff; min-width: 22px; text-align: center; }

  /* === SKILLS STEP === */
  .cg-skill-toolbar {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 8px; padding: 6px;
    background: rgba(255,215,0,0.05); border: 1px solid rgba(255,215,0,0.2); border-radius: 3px;
  }
  .cg-skill-search {
    background: var(--cp-background); border: 1px solid var(--cp-primary);
    color: var(--cp-primary); border-radius: 3px; padding: 5px 10px;
    font-size: 0.8em; width: 160px; font-family: inherit;
  }
  .cg-skill-search:focus { outline: none; box-shadow: 0 0 4px var(--cp-primary); }
  .cg-skill-nav { display: flex; flex-wrap: wrap; gap: 4px; }
  .cg-skill-nav button {
    font-size: 0.65em !important; padding: 4px 6px !important;
    min-width: unset !important; max-width: unset !important; flex: unset !important;
  }
  .cg-cat-header {
    background: var(--cp-primary); color: #000; font-weight: bold; padding: 7px 10px;
    cursor: pointer; border-radius: 4px; margin-top: 6px; margin-bottom: 2px;
    display: flex; align-items: center; gap: 8px; user-select: none;
    position: relative;
  }
  .cg-cat-header::after { content: "▼"; position: absolute; right: 12px; font-size: 0.8em; transition: transform 0.2s; }
  .cg-cat-header.collapsed::after { transform: rotate(-90deg); }
  .cg-cat-header.collapsed { background: #b8860b; }
  .cg-skill-grid {
    display: flex; flex-wrap: wrap; gap: 5px; padding: 4px 2px;
    transition: all 0.3s ease;
  }
  .cg-skill-grid.collapsed { display: none; }
  .cg-skill-card {
    background: var(--cp-background); border: 1px solid var(--cp-primary);
    border-radius: 5px; padding: 7px 8px; width: 158px;
    display: flex; flex-direction: column; align-items: center; gap: 2px;
  }
  .cg-skill-card .sk-name { font-size: 0.75em; font-weight: bold; text-align: center; color: #fff; }
  .cg-skill-card .sk-controls { display: flex; align-items: center; gap: 6px; margin-top: 2px; }
  .cg-skill-card .sk-controls button {
    width: 22px; height: 22px; border: 1px solid var(--cp-primary) !important;
    background: var(--cp-background) !important; color: var(--cp-primary) !important;
    border-radius: 3px !important; cursor: pointer !important; font-size: 0.9em !important;
    padding: 0 !important; min-width: unset !important; max-width: unset !important; flex: unset !important;
  }
  .cg-skill-card .sk-controls button:hover { background: var(--cp-primary) !important; color: #000 !important; }
  .cg-skill-card .sk-val { font-weight: bold; color: var(--cp-primary); font-size: 1.1em; min-width: 18px; text-align: center; }
  .cg-skill-card .sk-badge {
    font-size: 0.6em; color: var(--cp-secondary); font-style: italic; text-align: center;
  }
  .cg-skill-card[data-basic="true"] { border-color: rgba(255,165,0,0.6); }
  .cg-skill-card[data-x2="true"] .sk-name::after { content: " ×2"; color: var(--cp-secondary); }
  .cg-skill-card.hidden { display: none; }

  /* === LIFEPATH STEP === */
  .cg-lp-section { margin-bottom: 10px; }
  .cg-lp-label {
    font-size: 0.8em; font-weight: bold; color: var(--cp-primary);
    text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px;
    display: flex; align-items: center; gap: 6px;
  }
  .cg-lp-die { font-size: 0.75em; color: #888; font-weight: normal; }
  .cg-lp-row { display: flex; gap: 6px; }
  .cg-lp-row textarea {
    flex: 1; background: var(--cp-background); border: 1px solid rgba(255,215,0,0.3);
    color: #fff; border-radius: 3px; padding: 6px; font-family: inherit;
    font-size: 0.85em; resize: vertical; min-height: 38px;
  }
  .cg-lp-row textarea:focus { outline: none; border-color: var(--cp-primary); }
  .cg-lp-row button.btn-gen {
    width: 80px; flex-shrink: 0; font-size: 0.7em !important; padding: 4px 6px !important;
    min-width: unset !important; max-width: unset !important; flex: unset !important;
    height: 38px;
  }
  .cg-lp-sub-header {
    font-size: 1em; font-weight: bold; color: var(--cp-primary);
    border-bottom: 1px solid rgba(255,215,0,0.3); padding-bottom: 4px;
    margin: 16px 0 8px; text-transform: uppercase; letter-spacing: 1px;
  }
  .cg-lp-variable {
    background: rgba(255,215,0,0.04); border: 1px dashed rgba(255,215,0,0.25);
    border-radius: 4px; padding: 8px; margin-bottom: 8px;
  }
  .cg-lp-variable-header {
    display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;
  }
  .cg-lp-variable-header span { font-size: 0.8em; color: var(--cp-primary); font-weight: bold; }
  .cg-lp-variable-header button {
    font-size: 0.65em !important; padding: 3px 7px !important;
    min-width: unset !important; max-width: unset !important; flex: unset !important;
  }
  .cg-lp-entry { margin-bottom: 6px; padding-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.05); }

  /* === FUNDS STEP === */
  .cg-funds-box {
    background: rgba(255,215,0,0.06); border: 1px solid rgba(255,215,0,0.3);
    border-radius: 5px; padding: 16px; text-align: center; margin-bottom: 14px;
  }
  .cg-funds-amount {
    font-size: 2.5em; font-weight: bold; color: var(--cp-primary); margin: 6px 0;
  }
  .cg-funds-note {
    font-size: 0.8em; color: #bbb; margin-top: 8px; line-height: 1.5;
    border-top: 1px solid rgba(255,215,0,0.2); padding-top: 8px;
  }
  .cg-funds-note.complete-package-note { color: var(--cp-secondary); font-weight: bold; }

  /* === REVIEW STEP === */
  .cg-review-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .cg-review-block {
    background: rgba(255,215,0,0.05); border: 1px solid rgba(255,215,0,0.2);
    border-radius: 4px; padding: 10px;
  }
  .cg-review-block h3 { color: var(--cp-primary); font-size: 0.85em; text-transform: uppercase; margin: 0 0 6px; }
  .cg-review-block .rv-row { font-size: 0.8em; color: #ccc; margin-bottom: 3px; display: flex; justify-content: space-between; }
  .cg-review-block .rv-row span { color: #fff; font-weight: bold; }
  .cg-review-stat-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 4px; }
  .cg-review-stat { text-align: center; }
  .cg-review-stat .rs-name { font-size: 0.65em; color: var(--cp-primary); }
  .cg-review-stat .rs-val  { font-size: 1.1em; font-weight: bold; color: #fff; }
  .cg-create-name-row { margin-bottom: 12px; }
  .cg-create-name-row label { color: var(--cp-primary); font-weight: bold; font-size: 0.85em; text-transform: uppercase; display: block; margin-bottom: 4px; }
  .cg-create-name-row input {
    background: var(--cp-background); border: 1px solid var(--cp-primary);
    color: #fff; border-radius: 3px; padding: 8px; font-family: inherit;
    font-size: 0.95em; width: 100%; box-sizing: border-box;
  }
</style>
`;

// ============================================================
// WIZARD APP
// ============================================================
class CPRChargenWizard extends Application {
  constructor(options = {}) {
    super(options);

    // Step: 1=Method/Role, 2=Stats, 3=Skills, 4=Lifepath, 5=Funds/Review
    this.step = 1;
    this.TOTAL_STEPS = 5;

    // Chargen state
    this.charName  = "";
    this.handle    = "";
    this.method    = null;  // "streetrat" | "edgerunner" | "complete"
    this.roleKey   = null;

    // Stats: object keyed by stat key
    this.stats = Object.fromEntries(STAT_KEYS.map(k => [k, 2]));

    // Skills: object keyed by skill name -> level
    this.skills = Object.fromEntries(ALL_SKILLS.map(n => [n, BASIC_SKILLS.has(n) ? 2 : 0]));

    // Lifepath: keyed by table key -> string
    this.lifepath = {};

    // Dynamic lifepath arrays
    this.friends     = [];  // array of strings
    this.enemies     = [];  // array of {type, cause, resources, revenge}
    this.loveAffairs = [];  // array of strings

    // Role-specific lifepath: array of {label, value}
    this.roleLifepath = [];
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "cpr-chargen",
      title: "CPR Character Creation",
      template: null,
      classes: ["cpr-chargen-wizard"],
      width: 920,
      height: 720,
      resizable: true,
    });
  }

  get template() { return null; }

  async _renderInner() {
    return $(this._buildHTML());
  }

  _buildHTML() {
    const stepContent = this[`_buildStep${this.step}`]();
    const canNext   = this._canProceed();
    const isFirst   = this.step === 1;
    const isFinal   = this.step === this.TOTAL_STEPS;
    const stepLabels = ["Method & Role","Stats","Skills","Lifepath","Funds & Review"];

    const dots = stepLabels.map((lbl, i) => {
      const n = i + 1;
      const cls = n < this.step ? "done" : n === this.step ? "active" : "";
      return `<div class="cg-step-dot ${cls}" title="${lbl}">${n}</div>`;
    }).join("");

    return `
      ${CHARGEN_STYLE}
      <div class="cg-wrapper">
        <div class="cg-content">
          <div class="cg-steps">${dots}</div>
          ${stepContent}
        </div>
        <div class="cg-footer">
          <button type="button" data-action="back" ${isFirst ? "disabled" : ""}>◀ Back</button>
          <button type="button" data-action="next" ${isFinal || !canNext ? "disabled" : ""}>${isFinal ? "" : "Next ▶"}</button>
          <button type="button" data-action="create" class="btn-create" ${!isFinal || !canNext ? "disabled" : ""}>
            <i class="fas fa-user-plus"></i> Create Character
          </button>
        </div>
      </div>
    `;
  }

  // ---- STEP 1: Method + Role ----
  _buildStep1() {
    const methodCards = [
      {
        key: "streetrat",
        title: "Streetrat",
        subtitle: "Template Method",
        desc: "Roll 1d10 once — read across the entire row for all stats. Simple and fast. Starts with 500eb.",
      },
      {
        key: "edgerunner",
        title: "Edgerunner",
        subtitle: "Fast & Dirty Method",
        desc: "Roll 1d10 separately for each of the 10 stats from your role's template. More variation. Starts with 500eb.",
      },
      {
        key: "complete",
        title: "Complete Package",
        subtitle: "Calculated Method",
        desc: "Point-buy 62 points distributed freely. No stat below 2 or above 8. Most flexible. Starts with 2,550eb.",
      },
    ].map(m => `
      <div class="cg-method-card ${this.method === m.key ? "selected" : ""}" data-method="${m.key}">
        <div class="mc-title">${m.title}</div>
        <div class="mc-subtitle">${m.subtitle}</div>
        <div class="mc-desc">${m.desc}</div>
      </div>
    `).join("");

    const roleCards = Object.entries(ROLES).map(([key, role]) => `
      <div class="cg-role-card ${this.roleKey === key ? "selected" : ""}" data-role="${key}">
        <div class="rc-icon"><i class="${role.icon}"></i></div>
        <div class="rc-info">
          <div class="rc-name">${role.displayName}</div>
          <div class="rc-ability">${role.ability}</div>
          <div class="rc-desc">${role.abilityDesc}</div>
        </div>
      </div>
    `).join("");

    return `
      <div class="cg-section-title"><i class="fas fa-id-card"></i> Identity, Method & Role</div>

      <div class="cg-field-row">
        <label>Character Name</label>
        <input type="text" id="cg-name" value="${this.charName}" placeholder="Full Name">
      </div>
      <div class="cg-field-row">
        <label>Handle / Street Name</label>
        <input type="text" id="cg-handle" value="${this.handle}" placeholder="What the street calls you">
      </div>

      <div class="cg-section-title" style="font-size:1em;margin-top:10px;">Choose Your Character Method</div>
      <div class="cg-method-grid">${methodCards}</div>

      <div class="cg-section-title" style="font-size:1em;margin-top:10px;">Choose Your Role</div>
      <div class="cg-role-grid">${roleCards}</div>
    `;
  }

  // ---- STEP 2: Stats ----
  _buildStep2() {
    const spent = this._statsSpent();
    const budget = this.method === "complete" ? 62 : null;
    const isPointBuy = this.method === "complete";

    let modeNote = "";
    if (this.method === "streetrat") {
      modeNote = `<p style="color:#bbb;font-size:0.8em;text-align:center;margin-bottom:8px;">
        <strong style="color:var(--cp-primary)">Streetrat:</strong>
        Roll 1d10 to pick a row — all 10 stats come from that single roll. Use the Generate button or set manually.
      </p>`;
    } else if (this.method === "edgerunner") {
      modeNote = `<p style="color:#bbb;font-size:0.8em;text-align:center;margin-bottom:8px;">
        <strong style="color:var(--cp-primary)">Edgerunner:</strong>
        Roll 1d10 separately for each stat. Use Generate All or roll per stat manually.
      </p>`;
    } else {
      modeNote = `<p style="color:#bbb;font-size:0.8em;text-align:center;margin-bottom:8px;">
        <strong style="color:var(--cp-primary)">Complete Package:</strong>
        Distribute 62 points freely. No stat below 2 or above 8.
      </p>`;
    }

    const pointsDisplay = isPointBuy
      ? `<div class="cg-points-bar">Stats Budget: <span class="${spent <= 62 ? "ok" : ""}">${spent}</span> / 62 points spent</div>`
      : `<div class="cg-points-bar">Stats set from <strong style="color:var(--cp-primary)">${ROLES[this.roleKey].displayName}</strong> template. Edit freely if desired. <span style="color:#888">(min 2, max 8)</span></div>`;

    const statCards = STAT_KEYS.map((key, i) => `
      <div class="cg-stat-card">
        <div class="sc-name">${STAT_NAMES[i]}</div>
        <div class="sc-controls">
          <button type="button" data-stat-dec="${key}">−</button>
          <div class="sc-val" id="sv-${key}">${this.stats[key]}</div>
          <button type="button" data-stat-inc="${key}">+</button>
        </div>
      </div>
    `).join("");

    const genBtns = this.method !== "complete" ? `
      <div style="display:flex;gap:8px;justify-content:center;margin-bottom:12px;">
        <button type="button" class="cg-footer button" data-action="genAllStats"
          style="background:var(--cp-background);color:var(--cp-primary);border:1px solid var(--cp-primary);
                 border-radius:3px;padding:6px 14px;font-size:0.8em;font-weight:bold;cursor:pointer;
                 text-transform:uppercase;font-family:inherit;">
          <i class="fas fa-dice"></i> ${this.method === "streetrat" ? "Roll One Row (All Stats)" : "Roll All Stats Individually"}
        </button>
      </div>
    ` : "";

    return `
      <div class="cg-section-title"><i class="fas fa-chart-bar"></i> Statistics</div>
      ${modeNote}
      ${pointsDisplay}
      ${genBtns}
      <div class="cg-stat-grid">${statCards}</div>
    `;
  }

  // ---- STEP 3: Skills ----
  _buildStep3() {
    const spent = this._skillsSpent();
    const skillRows = Object.entries(SKILL_CATEGORIES).map(([cat, skillNames]) => {
      const icon = CATEGORY_ICONS[cat] || "fas fa-circle";
      const cards = skillNames.map(name => {
        const val = this.skills[name] ?? 0;
        const isBasic = BASIC_SKILLS.has(name);
        const isX2    = DIFFICULT_SKILLS.has(name);
        return `
          <div class="cg-skill-card ${isBasic ? "" : ""}" data-basic="${isBasic}" data-x2="${isX2}" data-skill="${name}">
            <div class="sk-name">${name}</div>
            <div class="sk-controls">
              <button type="button" data-skill-dec="${name}">−</button>
              <div class="sk-val" id="skv-${name.replace(/[^a-zA-Z0-9]/g,"_")}">${val}</div>
              <button type="button" data-skill-inc="${name}">+</button>
            </div>
            ${isBasic ? '<div class="sk-badge">Basic (min 2)</div>' : ""}
            ${isX2    ? '<div class="sk-badge" style="color:var(--cp-secondary)">Difficult (×2 cost)</div>' : ""}
          </div>
        `;
      }).join("");

      return `
        <div class="cg-cat-header" data-cat="${cat}">
          <i class="${icon}"></i> ${cat}
        </div>
        <div class="cg-skill-grid" data-cat="${cat}">${cards}</div>
      `;
    }).join("");

    const navBtns = Object.keys(SKILL_CATEGORIES).map(cat =>
      `<button type="button" class="cg-footer button" data-scroll-cat="${cat}"
        style="font-size:0.65em;padding:3px 6px;background:var(--cp-background);color:var(--cp-primary);
               border:1px solid var(--cp-primary);border-radius:3px;cursor:pointer;font-family:inherit;
               text-transform:uppercase;">
         ${cat.replace(" Skills","")}
       </button>`
    ).join("");

    return `
      <div class="cg-section-title"><i class="fas fa-list-ul"></i> Skills</div>
      <div class="cg-points-bar sticky">
        Skill Points Spent: <span class="${spent <= 86 ? "ok" : ""}">${spent}</span> / 86
        &nbsp;|&nbsp; <span style="font-size:0.85em;color:#888">Basic skills min 2 · Max any skill 6 · Difficult skills cost ×2</span>
      </div>
      <div class="cg-skill-toolbar">
        <input type="text" class="cg-skill-search" id="cg-skill-search" placeholder="Search skills…">
        <div class="cg-skill-nav">${navBtns}</div>
      </div>
      ${skillRows}
    `;
  }

  // ---- STEP 4: Lifepath ----
  _buildStep4() {
    // General lifepath fixed tables
    const fixedKeys = [
      "culturalOrigin","personality","clothingStyle","hairstyle","affectation",
      "valueMost","feelingsAboutPeople","mostValuedPerson","mostValuedPossession",
      "familyBackground","childhoodEnvironment","familyCrisis","lifeGoals",
    ];

    const fixedRows = fixedKeys.map(key => {
      const tbl = LIFEPATH_TABLES[key];
      const val = this.lifepath[key] || "";
      return `
        <div class="cg-lp-section">
          <div class="cg-lp-label">
            ${tbl.label}
            <span class="cg-lp-die">[1d${tbl.die}]</span>
          </div>
          <div class="cg-lp-row">
            <textarea id="lp-${key}" rows="1" placeholder="Type or generate…">${val}</textarea>
            <button type="button" class="btn-gen cg-footer button" data-gen-table="${key}">
              <i class="fas fa-dice"></i> Generate
            </button>
          </div>
        </div>
      `;
    }).join("");

    // Variable-count sections
    const friendsSection = this._buildVariableSection("friends","Friends","lp-friend-","1d10 − 7 (min 0) friends",
      this.friends, (entry, i) => `
        <div class="cg-lp-entry" id="lp-friend-${i}">
          <div class="cg-lp-label" style="margin-bottom:3px;">Friend ${i+1}</div>
          <div class="cg-lp-row">
            <textarea rows="1" id="lpf-${i}" placeholder="Friend relationship…">${entry}</textarea>
            <button type="button" class="btn-gen cg-footer button" data-gen-friend="${i}"><i class="fas fa-dice"></i></button>
          </div>
        </div>
      `
    );

    const enemiesSection = this._buildEnemiesSection();

    const loveSection = this._buildVariableSection("loveAffairs","Tragic Love Affairs","lp-love-","1d10 − 7 (min 0) affairs",
      this.loveAffairs, (entry, i) => `
        <div class="cg-lp-entry" id="lp-love-${i}">
          <div class="cg-lp-label" style="margin-bottom:3px;">Love Affair ${i+1}</div>
          <div class="cg-lp-row">
            <textarea rows="1" id="lpl-${i}" placeholder="What happened…">${entry}</textarea>
            <button type="button" class="btn-gen cg-footer button" data-gen-love="${i}"><i class="fas fa-dice"></i></button>
          </div>
        </div>
      `
    );

    // Role-specific lifepath
    const roleTables = (ROLE_LIFEPATHS[this.roleKey] || []);
    if (this.roleLifepath.length !== roleTables.length) {
      this.roleLifepath = roleTables.map((_, i) => this.roleLifepath[i] || "");
    }
    const roleRows = roleTables.map((tbl, i) => `
      <div class="cg-lp-section">
        <div class="cg-lp-label">
          ${tbl.label}
          <span class="cg-lp-die">[1d${tbl.die}]</span>
        </div>
        <div class="cg-lp-row">
          <textarea id="lp-role-${i}" rows="1" placeholder="Type or generate…">${this.roleLifepath[i] || ""}</textarea>
          <button type="button" class="btn-gen cg-footer button" data-gen-role="${i}">
            <i class="fas fa-dice"></i> Generate
          </button>
        </div>
      </div>
    `).join("");

    return `
      <div class="cg-section-title"><i class="fas fa-scroll"></i> Lifepath</div>
      <p style="color:#888;font-size:0.78em;text-align:center;margin-bottom:10px;">
        Type your own answers or click Generate to roll from the official table. All fields are optional flavor.
      </p>

      <div class="cg-lp-sub-header">The Personals</div>
      ${fixedRows}

      <div class="cg-lp-sub-header">Friends, Enemies & Love Affairs</div>
      ${friendsSection}
      ${enemiesSection}
      ${loveSection}

      <div class="cg-lp-sub-header"><i class="${ROLES[this.roleKey]?.icon || "fas fa-star"}"></i> ${ROLES[this.roleKey]?.displayName || ""} Role-Specific Lifepath</div>
      ${roleRows}
    `;
  }

  _buildFriendRow(entry, i) {
    return `
      <div class="cg-lp-entry" id="lp-friend-${i}">
        <div class="cg-lp-label" style="margin-bottom:3px;">Friend ${i+1}</div>
        <div class="cg-lp-row">
          <textarea rows="1" id="lpf-${i}" placeholder="Friend relationship…">${entry}</textarea>
          <button type="button" class="btn-gen cg-footer button" data-gen-friend="${i}"><i class="fas fa-dice"></i></button>
        </div>
      </div>`;
  }

  _buildLoveRow(entry, i) {
    return `
      <div class="cg-lp-entry" id="lp-love-${i}">
        <div class="cg-lp-label" style="margin-bottom:3px;">Love Affair ${i+1}</div>
        <div class="cg-lp-row">
          <textarea rows="1" id="lpl-${i}" placeholder="What happened…">${entry}</textarea>
          <button type="button" class="btn-gen cg-footer button" data-gen-love="${i}"><i class="fas fa-dice"></i></button>
        </div>
      </div>`;
  }

  _buildEnemyRow(e, i) {
    const fieldRows = ["type","cause","resources","revenge"].map(f => {
      const tableKey = "enemy" + f.charAt(0).toUpperCase() + f.slice(1);
      const tbl = LIFEPATH_TABLES[tableKey];
      const label = tbl ? tbl.label : f;
      const die   = tbl ? tbl.die : 10;
      const val   = e[f] || "";
      return '<div class="cg-lp-section" style="margin-bottom:4px;">'
        + '<div class="cg-lp-label" style="font-size:0.7em;">' + label + ' [1d' + die + ']</div>'
        + '<div class="cg-lp-row">'
        + '<textarea rows="1" id="lpe-' + i + '-' + f + '" placeholder="' + label + '\u2026">' + val + '</textarea>'
        + '<button type="button" class="btn-gen cg-footer button" data-gen-enemy="' + i + '" data-enemy-field="' + f + '"><i class="fas fa-dice"></i></button>'
        + '</div></div>';
    }).join("");
    return '<div class="cg-lp-entry" id="lp-enemy-' + i + '">'
      + '<div class="cg-lp-label" style="margin-bottom:3px;">Enemy ' + (i+1) + '</div>'
      + fieldRows
      + '</div>';
  }

  // Attach listeners to a freshly-injected variable entry (avoids full re-render)
  _bindVarEntryListeners(html, field, i) {
    if (field === "friends") {
      html.find(`[data-gen-friend="${i}"]`).on("click", e => {
        const tbl = LIFEPATH_TABLES.friendType;
        const val = tbl.entries[Math.floor(Math.random() * tbl.die)];
        this.friends[i] = val;
        html.find(`#lpf-${i}`).val(val);
      });
      html.find(`#lpf-${i}`).on("input", e => { this.friends[i] = e.target.value; });
    }
    if (field === "loveAffairs") {
      html.find(`[data-gen-love="${i}"]`).on("click", e => {
        const tbl = LIFEPATH_TABLES.loveAffairOutcome;
        const val = tbl.entries[Math.floor(Math.random() * tbl.die)];
        this.loveAffairs[i] = val;
        html.find(`#lpl-${i}`).val(val);
      });
      html.find(`#lpl-${i}`).on("input", e => { this.loveAffairs[i] = e.target.value; });
    }
    if (field === "enemies") {
      ["type","cause","resources","revenge"].forEach(ef => {
        html.find(`[data-gen-enemy="${i}"][data-enemy-field="${ef}"]`).on("click", () => {
          const tableKey = "enemy" + ef.charAt(0).toUpperCase() + ef.slice(1);
          const tbl = LIFEPATH_TABLES[tableKey];
          if (!tbl) return;
          const val = tbl.entries[Math.floor(Math.random() * tbl.die)];
          if (!this.enemies[i]) this.enemies[i] = {type:"",cause:"",resources:"",revenge:""};
          this.enemies[i][ef] = val;
          html.find(`#lpe-${i}-${ef}`).val(val);
        });
        html.find(`#lpe-${i}-${ef}`).on("input", e => {
          if (!this.enemies[i]) this.enemies[i] = {type:"",cause:"",resources:"",revenge:""};
          this.enemies[i][ef] = e.target.value;
        });
      });
    }
  }

  _buildVariableSection(field, label, idPrefix, diceNote, arr, rowFn) {
    const rows = arr.map((entry, i) => {
      if (field === "friends")     return this._buildFriendRow(entry, i);
      if (field === "loveAffairs") return this._buildLoveRow(entry, i);
      return rowFn(entry, i);
    }).join("");
    return `
      <div class="cg-lp-variable">
        <div class="cg-lp-variable-header">
          <span>${label} &nbsp;<em style="color:#888;font-weight:normal;">(${diceNote})</em></span>
          <div style="display:flex;gap:4px;">
            <button type="button" class="cg-footer button" data-add-var="${field}">+ Add</button>
            <button type="button" class="cg-footer button" data-roll-var="${field}"><i class="fas fa-dice"></i> Roll Count</button>
          </div>
        </div>
        <div id="var-section-${field}">${rows}</div>
      </div>
    `;
  }

  _buildEnemiesSection() {
    const rows = this.enemies.map((e, i) => this._buildEnemyRow(e, i)).join("");

    return `
      <div class="cg-lp-variable">
        <div class="cg-lp-variable-header">
          <span>Enemies &nbsp;<em style="color:#888;font-weight:normal;">(1d10 − 7, min 0)</em></span>
          <div style="display:flex;gap:4px;">
            <button type="button" class="cg-footer button" data-add-var="enemies">+ Add</button>
            <button type="button" class="cg-footer button" data-roll-var="enemies"><i class="fas fa-dice"></i> Roll Count</button>
          </div>
        </div>
        <div id="var-section-enemies">${rows}</div>
      </div>
    `;
  }

  // ---- STEP 5: Funds & Review ----
  _buildStep5() {
    const funds = STARTING_FUNDS[this.method] ?? 500;
    const role  = ROLES[this.roleKey];

    const statRows = STAT_KEYS.map((key, i) => `
      <div class="cg-review-stat">
        <div class="rs-name">${STAT_NAMES[i]}</div>
        <div class="rs-val">${this.stats[key]}</div>
      </div>
    `).join("");

    const topSkills = Object.entries(this.skills)
      .filter(([,v]) => v > 0)
      .sort(([,a],[,b]) => b - a)
      .slice(0, 8)
      .map(([n,v]) => `<div class="rv-row">${n}<span>${v}</span></div>`)
      .join("");

    const noteExtra = this.method === "complete"
      ? `<div class="cg-funds-note complete-package-note">
           Complete Package characters also receive 800eb specifically for fashion and fashionware.<br>
           Total available: 3,350eb
         </div>`
      : `<div class="cg-funds-note">Streetrat and Edgerunner characters also receive a role-specific starting weapon/armor package. Add those items manually from CRB p.98.</div>`;

    const lpSummary = Object.entries(this.lifepath)
      .filter(([,v]) => v)
      .slice(0,6)
      .map(([k,v]) => {
        const lbl = LIFEPATH_TABLES[k]?.label || k;
        const short = v.length > 40 ? v.slice(0,40)+"…" : v;
        return `<div class="rv-row" style="font-size:0.75em;">${lbl}<span style="font-size:0.9em;">${short}</span></div>`;
      }).join("") || '<div style="color:#666;font-size:0.8em;">No lifepath entries filled.</div>';

    return `
      <div class="cg-section-title"><i class="fas fa-coins"></i> Funds & Final Review</div>

      <div style="display:flex;gap:10px;margin-bottom:12px;">
        <div class="cg-create-name-row" style="flex:1">
          <label>Character Name</label>
          <input type="text" id="cg-final-name" value="${this.charName}" placeholder="Full Name">
        </div>
        <div class="cg-create-name-row" style="flex:1">
          <label>Handle</label>
          <input type="text" id="cg-final-handle" value="${this.handle}" placeholder="Street Name">
        </div>
      </div>

      <div class="cg-funds-box">
        <div style="color:var(--cp-primary);font-weight:bold;font-size:0.9em;text-transform:uppercase;">Starting Funds</div>
        <div class="cg-funds-amount">${funds.toLocaleString()}eb</div>
        <div style="color:#888;font-size:0.8em;">${role?.displayName || ""} · ${this.method === "streetrat" ? "Streetrat" : this.method === "edgerunner" ? "Edgerunner" : "Complete Package"}</div>
        ${noteExtra}
      </div>

      <div class="cg-review-grid">
        <div class="cg-review-block">
          <h3>Identity</h3>
          <div class="rv-row">Name<span>${this.charName || "—"}</span></div>
          <div class="rv-row">Handle<span>${this.handle || "—"}</span></div>
          <div class="rv-row">Role<span>${role?.displayName || "—"}</span></div>
          <div class="rv-row">Role Ability<span>${role?.ability || "—"}</span></div>
          <div class="rv-row">Method<span>${this.method === "streetrat" ? "Streetrat" : this.method === "edgerunner" ? "Edgerunner" : "Complete Pkg"}</span></div>
        </div>
        <div class="cg-review-block">
          <h3>Statistics</h3>
          <div class="cg-review-stat-grid">${statRows}</div>
        </div>
        <div class="cg-review-block">
          <h3>Top Skills (by level)</h3>
          ${topSkills || '<div style="color:#666;font-size:0.8em;">No skills above 0.</div>'}
        </div>
        <div class="cg-review-block">
          <h3>Lifepath Highlights</h3>
          ${lpSummary}
        </div>
      </div>
    `;
  }

  // ============================================================
  // LISTENERS
  // ============================================================
  activateListeners(html) {
    super.activateListeners(html);

    // Footer nav
    html.find("[data-action='back']").on("click",   () => this._stepBack());
    html.find("[data-action='next']").on("click",   () => this._stepNext());
    html.find("[data-action='create']").on("click", () => this._createCharacter());

    if (this.step === 1) {
      html.find("#cg-name").on("input", e => {
        this.charName = e.target.value;
        this._refreshFooter(html);
      });
      html.find("#cg-handle").on("input", e => {
        this.handle = e.target.value;
      });
      html.find(".cg-method-card").on("click", e => {
        const key = $(e.currentTarget).data("method");
        this.method = key;
        html.find(".cg-method-card").removeClass("selected");
        $(e.currentTarget).addClass("selected");
        this._refreshFooter(html);
      });
      html.find(".cg-role-card").on("click", e => {
        const key = $(e.currentTarget).data("role");
        this.roleKey = key;
        html.find(".cg-role-card").removeClass("selected");
        $(e.currentTarget).addClass("selected");
        this._refreshFooter(html);
      });
    }

    if (this.step === 2) {
      html.find("[data-stat-inc]").on("click", e => {
        const k = $(e.currentTarget).data("stat-inc");
        if (this.stats[k] < 8) {
          this.stats[k]++;
          this._refreshStat(html, k);
          this._refreshPointsBar(html);
        }
      });
      html.find("[data-stat-dec]").on("click", e => {
        const k = $(e.currentTarget).data("stat-dec");
        if (this.stats[k] > 2) {
          this.stats[k]--;
          this._refreshStat(html, k);
          this._refreshPointsBar(html);
        }
      });
      html.find("[data-action='genAllStats']").on("click", () => this._generateStats(html));
    }

    if (this.step === 3) {
      html.find("[data-skill-inc]").on("click", e => {
        const name = $(e.currentTarget).data("skill-inc");
        const cur  = this.skills[name] ?? 0;
        const spent = this._skillsSpent();
        const cost  = DIFFICULT_SKILLS.has(name) ? 2 : 1;
        if (cur < 6 && spent + cost <= 86) {
          this.skills[name] = cur + 1;
          this._refreshSkill(html, name);
          this._refreshSkillsBar(html);
        }
      });
      html.find("[data-skill-dec]").on("click", e => {
        const name = $(e.currentTarget).data("skill-dec");
        const cur  = this.skills[name] ?? 0;
        const minVal = BASIC_SKILLS.has(name) ? 2 : 0;
        if (cur > minVal) {
          this.skills[name] = cur - 1;
          this._refreshSkill(html, name);
          this._refreshSkillsBar(html);
        }
      });
      html.find(".cg-cat-header").on("click", e => {
        const cat = $(e.currentTarget).data("cat");
        $(e.currentTarget).toggleClass("collapsed");
        html.find(`.cg-skill-grid[data-cat="${cat}"]`).toggleClass("collapsed");
      });
      html.find("#cg-skill-search").on("input", e => this._filterSkills(html, e.target.value));
      html.find("[data-scroll-cat]").on("click", e => {
        const cat = $(e.currentTarget).data("scroll-cat");
        const hdr = html.find(`.cg-cat-header[data-cat="${cat}"]`);
        const grid = html.find(`.cg-skill-grid[data-cat="${cat}"]`);
        hdr.removeClass("collapsed"); grid.removeClass("collapsed");
        hdr[0]?.scrollIntoView({ behavior: "smooth" });
      });
    }

    if (this.step === 4) {
      // Fixed table generates
      html.find("[data-gen-table]").on("click", e => {
        const key = $(e.currentTarget).data("gen-table");
        const tbl = LIFEPATH_TABLES[key];
        if (!tbl) return;
        const roll = Math.floor(Math.random() * tbl.die);
        const val  = tbl.entries[roll];
        this.lifepath[key] = val;
        html.find(`#lp-${key}`).val(val);
      });
      html.find("textarea[id^='lp-']").on("input", e => {
        const id  = e.target.id.replace("lp-","");
        this.lifepath[id] = e.target.value;
      });

      // Variable: add / roll count
      html.find("[data-add-var]").on("click", e => {
        const field = $(e.currentTarget).data("add-var");
        this._addVarEntry(field);
        const arr = field === "friends" ? this.friends : field === "loveAffairs" ? this.loveAffairs : this.enemies;
        const i   = arr.length - 1;
        let rowHtml = "";
        if (field === "friends")     rowHtml = this._buildFriendRow("", i);
        if (field === "loveAffairs") rowHtml = this._buildLoveRow("", i);
        if (field === "enemies")     rowHtml = this._buildEnemyRow({type:"",cause:"",resources:"",revenge:""}, i);
        html.find(`#var-section-${field}`).append(rowHtml);
        this._bindVarEntryListeners(html, field, i);
      });
      html.find("[data-roll-var]").on("click", e => {
        const field = $(e.currentTarget).data("roll-var");
        // CRB: roll 1d10, subtract 7, minimum 0
        const roll  = Math.ceil(Math.random() * 10);
        const count = Math.max(0, roll - 7);
        if (field === "friends")     this.friends     = Array.from({length: count}, () => "");
        if (field === "loveAffairs") this.loveAffairs = Array.from({length: count}, () => "");
        if (field === "enemies")     this.enemies     = Array.from({length: count}, () => ({type:"",cause:"",resources:"",revenge:""}));
        const msg = count === 0
          ? `Rolled ${roll} — no ${field === "loveAffairs" ? "tragic love affairs" : field} this time.`
          : `Rolled ${roll} — ${count} ${field === "loveAffairs" ? "tragic love affair(s)" : field} added.`;
        ui.notifications.info(msg);
        // Replace container contents without full re-render (preserves scroll position)
        const container = html.find(`#var-section-${field}`);
        const arr = field === "friends" ? this.friends : field === "loveAffairs" ? this.loveAffairs : this.enemies;
        let newHtml = "";
        arr.forEach((entry, i) => {
          if (field === "friends")     newHtml += this._buildFriendRow(entry, i);
          if (field === "loveAffairs") newHtml += this._buildLoveRow(entry, i);
          if (field === "enemies")     newHtml += this._buildEnemyRow(entry, i);
        });
        container.html(newHtml);
        arr.forEach((_, i) => this._bindVarEntryListeners(html, field, i));
      });

      // Friends, enemies, love affairs — listeners bound via _bindVarEntryListeners
      // Called at render time for any pre-existing entries
      this.friends.forEach((_,i)     => this._bindVarEntryListeners(html, "friends",     i));
      this.loveAffairs.forEach((_,i) => this._bindVarEntryListeners(html, "loveAffairs", i));
      this.enemies.forEach((_,i)     => this._bindVarEntryListeners(html, "enemies",     i));

      // Role-specific lifepath
      html.find("[data-gen-role]").on("click", e => {
        const i   = parseInt($(e.currentTarget).data("gen-role"));
        const tbl = (ROLE_LIFEPATHS[this.roleKey] || [])[i];
        if (!tbl) return;
        const val = tbl.entries[Math.floor(Math.random() * tbl.die)];
        this.roleLifepath[i] = val;
        html.find(`#lp-role-${i}`).val(val);
      });
      html.find("textarea[id^='lp-role-']").on("input", e => {
        const i = parseInt(e.target.id.replace("lp-role-",""));
        this.roleLifepath[i] = e.target.value;
      });
    }

    if (this.step === 5) {
      html.find("#cg-final-name").on("input",   e => { this.charName = e.target.value; });
      html.find("#cg-final-handle").on("input", e => { this.handle   = e.target.value; });
    }
  }

  // ============================================================
  // HELPERS
  // ============================================================
  _statsSpent()  { return Object.values(this.stats).reduce((a,b) => a+b, 0); }
  _skillsSpent() {
    return Object.entries(this.skills).reduce((total, [name, val]) => {
      const cost = DIFFICULT_SKILLS.has(name) ? 2 : 1;
      return total + val * cost;
    }, 0);
  }

  _canProceed() {
    if (this.step === 1) return !!(this.method && this.roleKey && this.charName.trim());
    if (this.step === 2) {
      if (this.method === "complete") return this._statsSpent() <= 62;
      return true;
    }
    if (this.step === 3) return this._skillsSpent() <= 86;
    if (this.step === 4) return true;
    if (this.step === 5) return !!(this.charName.trim());
    return true;
  }

  _stepNext() {
    if (!this._canProceed()) return;
    if (this.step < this.TOTAL_STEPS) { this.step++; this.render(true); }
  }

  _stepBack() {
    if (this.step > 1) { this.step--; this.render(true); }
  }

  _addVarEntry(field) {
    if (field === "friends")     this.friends.push("");
    if (field === "loveAffairs") this.loveAffairs.push("");
    if (field === "enemies")     this.enemies.push({type:"",cause:"",resources:"",revenge:""});
  }


  _refreshFooter(html) {
    const canNext = this._canProceed();
    const isFinal = this.step === this.TOTAL_STEPS;
    html.find("[data-action='next']").prop("disabled", isFinal || !canNext);
    html.find("[data-action='create']").prop("disabled", !isFinal || !canNext);
  }

  _refreshStat(html, key) {
    html.find(`#sv-${key}`).text(this.stats[key]);
  }

  _refreshPointsBar(html) {
    const spent = this._statsSpent();
    html.find(".cg-points-bar span").text(spent).toggleClass("ok", spent <= 62);
  }

  _refreshSkill(html, name) {
    const safeId = name.replace(/[^a-zA-Z0-9]/g,"_");
    html.find(`#skv-${safeId}`).text(this.skills[name] ?? 0);
  }

  _refreshSkillsBar(html) {
    const spent = this._skillsSpent();
    html.find(".cg-points-bar span").first().text(spent).toggleClass("ok", spent <= 86);
  }

  _filterSkills(html, term) {
    const t = term.toLowerCase().trim();
    html.find(".cg-skill-card").each((_, el) => {
      const name = $(el).data("skill")?.toLowerCase() || "";
      $(el).toggleClass("hidden", !!t && !name.includes(t));
    });
  }

  _generateStats(html) {
    const tpl = STAT_TEMPLATES[this.roleKey];
    if (!tpl) return;

    if (this.method === "streetrat") {
      // One roll, read the whole row
      const row = tpl[Math.floor(Math.random() * 10)];
      STAT_KEYS.forEach((k, i) => { this.stats[k] = row[i]; });
    } else {
      // Edgerunner: roll per stat individually
      STAT_KEYS.forEach((k, i) => {
        const roll = Math.floor(Math.random() * 10);
        this.stats[k] = tpl[roll][i];
      });
    }

    STAT_KEYS.forEach(k => this._refreshStat(html, k));
    this._refreshPointsBar(html);
  }

  // ============================================================
  // CREATE CHARACTER
  // ============================================================
  async _createCharacter() {
    if (!this.charName.trim()) { ui.notifications.warn("Please enter a character name."); return; }

    const templateActor = game.actors.get(CHARGEN_TEMPLATE_ACTOR_ID.replace("Actor.",""));
    if (!templateActor) {
      ui.notifications.error(`Template actor not found: ${CHARGEN_TEMPLATE_ACTOR_ID}. Check CHARGEN_TEMPLATE_ACTOR_ID at the top of the script.`);
      return;
    }

    ui.notifications.info("Creating character…");

    try {
      // Clone template data
      const templateData = templateActor.toObject();
      delete templateData._id;

      // Basic identity
      templateData.name = this.charName.trim();
      templateData.type = "character";

      // Ownership — full owner for running user
      templateData.ownership = templateData.ownership || {};
      templateData.ownership[game.user.id] = 3;

      // Stats
      if (!templateData.system) templateData.system = {};
      if (!templateData.system.stats) templateData.system.stats = {};
      STAT_KEYS.forEach(k => {
        if (!templateData.system.stats[k]) templateData.system.stats[k] = {};
        templateData.system.stats[k].value = this.stats[k];
      });

      // Handle → system.information.alias
      if (!templateData.system.information) templateData.system.information = {};
      templateData.system.information.alias = this.handle || "";

      // Role ability rank = 4 (standard starting rank per CRB p.42)
      // Role is set via embedded item — handled below after creation

      // Starting funds
      templateData.system.wealth = templateData.system.wealth || {};
      templateData.system.wealth.value = STARTING_FUNDS[this.method] ?? 500;

      // Lifepath → write to system.lifepath (dedicated CPR fields)
      if (!templateData.system.lifepath) templateData.system.lifepath = {};
      const lp = templateData.system.lifepath;

      // Fixed fields — map our internal keys to CPR system keys
      const lpKeyMap = {
        culturalOrigin:      "culturalOrigin",
        personality:         "personality",
        clothingStyle:       "clothingStyle",
        hairstyle:           "hairStyle",        // capital S
        affectation:         "affectations",     // plural
        valueMost:           "valueMost",
        feelingsAboutPeople: "aboutPeople",
        mostValuedPerson:    "valuedPerson",
        mostValuedPossession:"valuedPossession",
        familyBackground:    "familyBackground",
        childhoodEnvironment:"childhoodEnvironment",
        familyCrisis:        "familyCrisis",
        lifeGoals:           "lifeGoals",
      };
      for (const [ourKey, sysKey] of Object.entries(lpKeyMap)) {
        if (this.lifepath[ourKey]) lp[sysKey] = this.lifepath[ourKey];
      }

      // Variable fields — join arrays into plain strings
      lp.friends = this.friends.filter(Boolean).join("\n") || "";
      lp.enemies = this.enemies
        .filter(e => e.type || e.cause)
        .map(e => `${e.type || "?"}; Cause: ${e.cause || "?"}; Resources: ${e.resources || "?"}; Revenge: ${e.revenge || "?"}`)
        .join("\n") || "";
      lp.tragicLoveAffairs = this.loveAffairs.filter(Boolean).join("\n") || "";

      // Role-specific lifepath → roleLifepath as HTML-ish string
      const roleTables = ROLE_LIFEPATHS[this.roleKey] || [];
      const roleLines = this.roleLifepath
        .map((val, i) => val ? `${roleTables[i]?.label || `Entry ${i+1}`}: ${val}` : null)
        .filter(Boolean);
      lp.roleLifepath = roleLines.join("<br>") || "";

      // Extra notes (non-lifepath text) → system.information.notes
      if (!templateData.system.information) templateData.system.information = {};
      templateData.system.information.notes =
        templateData.system.information.notes || "";

      // Create the actor
      const newActor = await Actor.create(templateData);

      // Update skills via embedded documents
      const skillItems = newActor.items.filter(i => i.type === "skill");
      const skillUpdates = [];
      for (const item of skillItems) {
        const level = this.skills[item.name];
        if (level !== undefined) {
          skillUpdates.push({ _id: item._id, "system.level": level });
        }
      }
      if (skillUpdates.length) {
        await newActor.updateEmbeddedDocuments("Item", skillUpdates);
      }

      // Set role rank to 4 via embedded role item
      const roleDisplayName = ROLES[this.roleKey]?.displayName;
      const roleItem = newActor.items.find(i => i.type === "role" &&
        i.name.toLowerCase() === roleDisplayName?.toLowerCase());
      if (roleItem) {
        await newActor.updateEmbeddedDocuments("Item", [{ _id: roleItem._id, "system.rank": 4 }]);
      } else {
        // Try to add from compendium
        const roleCompendium = game.packs.find(p =>
          p.documentName === "Item" &&
          (p.metadata.label?.toLowerCase().includes("role") || p.metadata.name?.toLowerCase().includes("role"))
        );
        if (roleCompendium) {
          const items = await roleCompendium.getDocuments();
          const match = items.find(i => i.name.toLowerCase() === roleDisplayName?.toLowerCase());
          if (match) {
            const obj = match.toObject();
            if (obj.system) obj.system.rank = 4;
            await newActor.createEmbeddedDocuments("Item", [obj]);
          }
        }
      }

      this.close();
      newActor.sheet.render(true);
      ui.notifications.info(`Character "${newActor.name}" created successfully!`);

    } catch (err) {
      console.error("CPR Chargen | Error creating character:", err);
      ui.notifications.error(`Failed to create character: ${err.message}`);
    }
  }
}

// ============================================================
// LAUNCH
// ============================================================
new CPRChargenWizard().render(true);