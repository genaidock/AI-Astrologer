/* ═══════════════════════════════════════════════════════════
   AI Jyotish Guru — Frontend Application Engine v2.0
   Interactive Vedic Astrology, Kundli SVG, Gochar & Oracle
   ═══════════════════════════════════════════════════════════ */

// ── State Management ─────────────────────────────────────
let chartData = null;
let savedBirthDetails = null;
let currentTransitsData = null;
let conversationHistory = [];
let currentPeriod = "daily";
let currentKundliView = "north";
let selectedHouseNumber = 1;
let currentTarotSpread = "3card";
let selectedTarotCards = [];
let shuffledTarotDeck = [];
let isStreaming = false;
let speechSynthUtterance = null;

// ── Constants & Vedic Reference Mappings ─────────────────
const VEDIC_SIGNS = [
    { name: "Mesha", english: "Aries", symbol: "♈", element: "🔥 Agni", lord: "Mars", lordSym: "♂", lordSanskrit: "Mangal" },
    { name: "Vrishabha", english: "Taurus", symbol: "♉", element: "🌍 Prithvi", lord: "Venus", lordSym: "♀", lordSanskrit: "Shukra" },
    { name: "Mithuna", english: "Gemini", symbol: "♊", element: "💨 Vayu", lord: "Mercury", lordSym: "☿", lordSanskrit: "Budha" },
    { name: "Karka", english: "Cancer", symbol: "♋", element: "🌊 Jala", lord: "Moon", lordSym: "🌙", lordSanskrit: "Chandra" },
    { name: "Simha", english: "Leo", symbol: "♌", element: "🔥 Agni", lord: "Sun", lordSym: "☀️", lordSanskrit: "Surya" },
    { name: "Kanya", english: "Virgo", symbol: "♍", element: "🌍 Prithvi", lord: "Mercury", lordSym: "☿", lordSanskrit: "Budha" },
    { name: "Tula", english: "Libra", symbol: "♎", element: "💨 Vayu", lord: "Venus", lordSym: "♀", lordSanskrit: "Shukra" },
    { name: "Vrischika", english: "Scorpio", symbol: "♏", element: "🌊 Jala", lord: "Mars", lordSym: "♂", lordSanskrit: "Mangal" },
    { name: "Dhanu", english: "Sagittarius", symbol: "♐", element: "🔥 Agni", lord: "Jupiter", lordSym: "♃", lordSanskrit: "Guru" },
    { name: "Makara", english: "Capricorn", symbol: "♑", element: "🌍 Prithvi", lord: "Saturn", lordSym: "♄", lordSanskrit: "Shani" },
    { name: "Kumbha", english: "Aquarius", symbol: "♒", element: "💨 Vayu", lord: "Saturn", lordSym: "♄", lordSanskrit: "Shani" },
    { name: "Meena", english: "Pisces", symbol: "♓", element: "🌊 Jala", lord: "Jupiter", lordSym: "♃", lordSanskrit: "Guru" },
];

const NAKSHATRAS = [
    { name: "Ashwini", lord: "Ketu", spanYears: 7, gana: "Deva", yoni: "Horse", nadi: "Adi" },
    { name: "Bharani", lord: "Venus", spanYears: 20, gana: "Manushya", yoni: "Elephant", nadi: "Madhya" },
    { name: "Krittika", lord: "Sun", spanYears: 6, gana: "Rakshasa", yoni: "Sheep", nadi: "Antya" },
    { name: "Rohini", lord: "Moon", spanYears: 10, gana: "Manushya", yoni: "Serpent", nadi: "Antya" },
    { name: "Mrigashira", lord: "Mars", spanYears: 7, gana: "Deva", yoni: "Serpent", nadi: "Madhya" },
    { name: "Ardra", lord: "Rahu", spanYears: 18, gana: "Manushya", yoni: "Dog", nadi: "Adi" },
    { name: "Punarvasu", lord: "Jupiter", spanYears: 16, gana: "Deva", yoni: "Cat", nadi: "Adi" },
    { name: "Pushya", lord: "Saturn", spanYears: 19, gana: "Deva", yoni: "Sheep", nadi: "Madhya" },
    { name: "Ashlesha", lord: "Mercury", spanYears: 17, gana: "Rakshasa", yoni: "Cat", nadi: "Antya" },
    { name: "Magha", lord: "Ketu", spanYears: 7, gana: "Rakshasa", yoni: "Rat", nadi: "Antya" },
    { name: "Purva Phalguni", lord: "Venus", spanYears: 20, gana: "Manushya", yoni: "Rat", nadi: "Madhya" },
    { name: "Uttara Phalguni", lord: "Sun", spanYears: 6, gana: "Manushya", yoni: "Cow", nadi: "Adi" },
    { name: "Hasta", lord: "Moon", spanYears: 10, gana: "Deva", yoni: "Buffalo", nadi: "Adi" },
    { name: "Chitra", lord: "Mars", spanYears: 7, gana: "Rakshasa", yoni: "Tiger", nadi: "Madhya" },
    { name: "Swati", lord: "Rahu", spanYears: 18, gana: "Deva", yoni: "Buffalo", nadi: "Antya" },
    { name: "Vishakha", lord: "Jupiter", spanYears: 16, gana: "Rakshasa", yoni: "Tiger", nadi: "Antya" },
    { name: "Anuradha", lord: "Saturn", spanYears: 19, gana: "Deva", yoni: "Deer", nadi: "Madhya" },
    { name: "Jyeshtha", lord: "Mercury", spanYears: 17, gana: "Rakshasa", yoni: "Deer", nadi: "Adi" },
    { name: "Moola", lord: "Ketu", spanYears: 7, gana: "Rakshasa", yoni: "Dog", nadi: "Adi" },
    { name: "Purva Ashadha", lord: "Venus", spanYears: 20, gana: "Manushya", yoni: "Monkey", nadi: "Madhya" },
    { name: "Uttara Ashadha", lord: "Sun", spanYears: 6, gana: "Manushya", yoni: "Mongoose", nadi: "Antya" },
    { name: "Shravana", lord: "Moon", spanYears: 10, gana: "Deva", yoni: "Monkey", nadi: "Antya" },
    { name: "Dhanishta", lord: "Mars", spanYears: 7, gana: "Rakshasa", yoni: "Lion", nadi: "Madhya" },
    { name: "Shatabhisha", lord: "Rahu", spanYears: 18, gana: "Rakshasa", yoni: "Horse", nadi: "Adi" },
    { name: "Purva Bhadrapada", lord: "Jupiter", spanYears: 16, gana: "Manushya", yoni: "Lion", nadi: "Adi" },
    { name: "Uttara Bhadrapada", lord: "Saturn", spanYears: 19, gana: "Manushya", yoni: "Cow", nadi: "Madhya" },
    { name: "Revati", lord: "Mercury", spanYears: 17, gana: "Deva", yoni: "Elephant", nadi: "Antya" },
];

const DASHA_LORDS_ORDER = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];

const HOUSE_DATA = {
    1: { name: "Tanu Bhava", title: "House of Self & Vitality", type: "Kendra & Trikona (Dharma)", karakas: "Body, complexion, health, personality, constitution, fame, self-will, and longevity.", aspects: "Aspects 7th House (Partnerships)" },
    2: { name: "Dhana Bhava", title: "House of Wealth & Family", type: "Panaphara / Maraka (Artha)", karakas: "Accumulated wealth, family lineage, speech, face, eyes, eating habits, and liquid assets.", aspects: "Aspects 8th House (Longevity/Transformation)" },
    3: { name: "Sahaja Bhava", title: "House of Courage & Siblings", type: "Apoklima / Upachaya (Kama)", karakas: "Younger siblings, courage, determination, communication, short travels, manual dexterity, and self-efforts.", aspects: "Aspects 9th House (Dharma/Higher Wisdom)" },
    4: { name: "Sukha Bhava", title: "House of Mother & Happiness", type: "Kendra (Moksha)", karakas: "Mother, home, properties, vehicles, emotional peace, formal education, domestic bliss, and ancestry.", aspects: "Aspects 10th House (Career/Karma)" },
    5: { name: "Putra Bhava", title: "House of Progeny & Intelligence", type: "Trikona (Dharma)", karakas: "Children, intellect, higher learning, past life karma (Purva Punya), creativity, speculative gains, and mantras.", aspects: "Aspects 11th House (Gains/Income)" },
    6: { name: "Ari / Ripu Bhava", title: "House of Obstacles & Health", type: "Apoklima / Dusthana / Upachaya (Artha)", karakas: "Enemies, debts, diseases, daily service, litigation, competitive exams, maternal uncle, and resilience.", aspects: "Aspects 12th House (Moksha/Losses)" },
    7: { name: "Yuvati / Jaya Bhava", title: "House of Spouse & Partnership", type: "Kendra / Maraka (Kama)", karakas: "Spouse, marriage, business partnerships, foreign trade, public reputation, contracts, and legal unions.", aspects: "Aspects 1st House (Self/Lagna)" },
    8: { name: "Randhra Bhava", title: "House of Transformation & Occult", type: "Panaphara / Dusthana (Moksha)", karakas: "Longevity, sudden events, hidden secrets, unearned wealth, inheritance, mysticism, occult research, and rebirth.", aspects: "Aspects 2nd House (Wealth/Speech)" },
    9: { name: "Dharma / Bhagya Bhava", title: "House of Fortune & Guru", type: "Trikona (Dharma)", karakas: "Luck, divine grace, father, spiritual Guru, higher philosophy, long journeys, pilgrimage, and piety.", aspects: "Aspects 3rd House (Siblings/Courage)" },
    10: { name: "Karma Bhava", title: "House of Career & Authority", type: "Kendra / Upachaya (Artha)", karakas: "Profession, worldly status, power, government favor, public influence, karma, father's status, and ambition.", aspects: "Aspects 4th House (Mother/Home)" },
    11: { name: "Labha Bhava", title: "House of Gains & Aspirations", type: "Panaphara / Upachaya (Kama)", karakas: "Financial gains, profits, elder siblings, fulfillment of desires, influential social circles, and awards.", aspects: "Aspects 5th House (Intelligence/Children)" },
    12: { name: "Vyaya Bhava", title: "House of Moksha & Foreign Lands", type: "Apoklima / Dusthana (Moksha)", karakas: "Expenditure, losses, foreign travel & settlement, isolation, meditation, subconscious, dreams, and final liberation.", aspects: "Aspects 6th House (Enemies/Debts)" },
};

const PLANET_SYMBOLS = {
    "Sun": "☀️", "Surya": "☀️",
    "Moon": "🌙", "Chandra": "🌙",
    "Mars": "♂", "Mangal": "♂",
    "Mercury": "☿", "Budha": "☿",
    "Jupiter": "♃", "Guru": "♃",
    "Venus": "♀", "Shukra": "♀",
    "Saturn": "♄", "Shani": "♄",
    "Rahu": "☊",
    "Ketu": "☋",
    "Lagna": "🪷", "Ascendant": "🪷"
};

const PLANET_ABBRS = {
    "Sun": "Su", "Surya": "Su",
    "Moon": "Mo", "Chandra": "Mo",
    "Mars": "Ma", "Mangal": "Ma",
    "Mercury": "Me", "Budha": "Me",
    "Jupiter": "Ju", "Guru": "Ju",
    "Venus": "Ve", "Shukra": "Ve",
    "Saturn": "Sa", "Shani": "Sa",
    "Rahu": "Ra",
    "Ketu": "Ke",
    "Lagna": "Asc", "Ascendant": "Asc"
};

// Chaldean Numerology letter values
const CHALDEAN_MAP = {
    'A':1, 'I':1, 'J':1, 'Q':1, 'Y':1,
    'B':2, 'K':2, 'R':2,
    'C':3, 'G':3, 'L':3, 'S':3,
    'D':4, 'M':4, 'T':4,
    'E':5, 'H':5, 'N':5, 'X':5,
    'U':6, 'V':6, 'W':6,
    'O':7, 'Z':7,
    'F':8, 'P':8
};

const NUMEROLOGY_INFO = {
    1: { ruler: "☀️ Surya (Sun)", element: "🔥 Agni", stone: "Ruby (Manikya)", colors: "Gold, Yellow, Orange", days: "Sunday", friends: "1, 2, 3, 5, 9", enemies: "6, 8", mantra: "Om Suryaya Namaha", deity: "Lord Shiva / Surya Deva" },
    2: { ruler: "🌙 Chandra (Moon)", element: "🌊 Jala", stone: "Pearl (Moti) / Moonstone", colors: "White, Cream, Silver", days: "Monday", friends: "1, 2, 4, 7", enemies: "8, 9", mantra: "Om Chandraya Namaha", deity: "Goddess Parvati / Gauri" },
    3: { ruler: "♃ Guru (Jupiter)", element: "⚡ Akasha / Ether", stone: "Yellow Sapphire (Pukhraj)", colors: "Yellow, Saffron, Purple", days: "Thursday", friends: "1, 2, 3, 9", enemies: "6", mantra: "Om Gurave Namaha", deity: "Lord Vishnu / Brihaspati" },
    4: { ruler: "☊ Rahu (North Node)", element: "💨 Vayu", stone: "Hessonite Garnet (Gomed)", colors: "Blue, Grey, Electric Cyan", days: "Saturday", friends: "1, 4, 5, 6, 7, 8", enemies: "2, 9", mantra: "Om Rahave Namaha", deity: "Lord Bhairava / Goddess Durga" },
    5: { ruler: "☿ Budha (Mercury)", element: "🌍 Prithvi", stone: "Emerald (Panna)", colors: "Green, Mint, Turquoise", days: "Wednesday", friends: "1, 4, 5, 6", enemies: "2", mantra: "Om Budhaya Namaha", deity: "Lord Ganesha / Narayana" },
    6: { ruler: "♀ Shukra (Venus)", element: "🌊 Jala / Luxury", stone: "Diamond (Heera) / White Zircon", colors: "White, Light Blue, Pink", days: "Friday", friends: "4, 5, 6, 7, 8", enemies: "1, 3", mantra: "Om Shukraya Namaha", deity: "Goddess Lakshmi" },
    7: { ruler: "☋ Ketu (South Node)", element: "💨 Vayu / Mysticism", stone: "Cat's Eye (Lehsunia)", colors: "Light Green, Smoky, White", days: "Tuesday", friends: "1, 2, 4, 7", enemies: "8, 9", mantra: "Om Ketave Namaha", deity: "Lord Ganesha / Matsya Avatar" },
    8: { ruler: "♄ Shani (Saturn)", element: "💨 Vayu / Karma", stone: "Blue Sapphire (Neelam) / Amethyst", colors: "Dark Blue, Black, Purple", days: "Saturday", friends: "4, 5, 6, 8", enemies: "1, 2, 9", mantra: "Om Sham Shanaischaraya Namaha", deity: "Lord Hanuman / Shani Deva" },
    9: { ruler: "♂ Mangal (Mars)", element: "🔥 Agni / Courage", stone: "Red Coral (Moonga)", colors: "Red, Coral, Crimson", days: "Tuesday", friends: "1, 2, 3, 9", enemies: "4, 8", mantra: "Om Mangalaya Namaha", deity: "Lord Hanuman / Kartikeya" },
};

// Tarot 78 Card Database with Vedic synthesis
const TAROT_CARDS_DATA = [
    { name: "The Fool",          symbol: "🤹", type: "Major",     vedic: "Uranus / Free Will • Beginner Mind",                image: "/tarot/ar00.jpg" },
    { name: "The Magician",      symbol: "🪄", type: "Major",     vedic: "Mercury (Budha) • Creative Power",                  image: "/tarot/ar01.jpg" },
    { name: "The High Priestess",symbol: "🌙", type: "Major",     vedic: "Moon (Chandra) • Divine Intuition",                 image: "/tarot/ar02.jpg" },
    { name: "The Empress",       symbol: "👑", type: "Major",     vedic: "Venus (Shukra) • Abundance & Fertility",            image: "/tarot/ar03.jpg" },
    { name: "The Emperor",       symbol: "🏛️", type: "Major",    vedic: "Sun / Aries (Mesha) • Authority & Order",           image: "/tarot/ar04.jpg" },
    { name: "The Hierophant",    symbol: "📿", type: "Major",     vedic: "Jupiter (Guru) / Taurus • Sacred Wisdom",           image: "/tarot/ar05.jpg" },
    { name: "The Lovers",        symbol: "💞", type: "Major",     vedic: "Gemini / Venus • Soul Bond & Choices",              image: "/tarot/ar06.jpg" },
    { name: "The Chariot",       symbol: "🏹", type: "Major",     vedic: "Cancer (Karka) / Mars • Willpower Victory",         image: "/tarot/ar07.jpg" },
    { name: "Strength",          symbol: "🦁", type: "Major",     vedic: "Leo (Simha) / Sun • Spiritual Fortitude",           image: "/tarot/ar08.jpg" },
    { name: "The Hermit",        symbol: "🕯️", type: "Major",    vedic: "Virgo (Kanya) / Ketu • Inner Illumination",         image: "/tarot/ar09.jpg" },
    { name: "Wheel of Fortune",  symbol: "☸️", type: "Major",    vedic: "Jupiter (Guru) • Karma & Destiny Turn",             image: "/tarot/ar10.jpg" },
    { name: "Justice",           symbol: "⚖️", type: "Major",    vedic: "Libra (Tula) / Saturn • Karmic Equilibrium",        image: "/tarot/ar11.jpg" },
    { name: "The Hanged Man",    symbol: "🧘", type: "Major",     vedic: "Neptune / Moksha • Surrender & Enlightenment",      image: "/tarot/ar12.jpg" },
    { name: "Death",             symbol: "🦋", type: "Major",     vedic: "Scorpio (Vrischika) / 8th House • Transformation",  image: "/tarot/ar13.jpg" },
    { name: "Temperance",        symbol: "🏺", type: "Major",     vedic: "Sagittarius (Dhanu) • Alchemy & Balance",           image: "/tarot/ar14.jpg" },
    { name: "The Devil",         symbol: "⛓️", type: "Major",    vedic: "Rahu / Maya • Material Illusion",                   image: "/tarot/ar15.jpg" },
    { name: "The Tower",         symbol: "⚡", type: "Major",     vedic: "Mars / Rahu • Sudden Awakening",                    image: "/tarot/ar16.jpg" },
    { name: "The Star",          symbol: "⭐", type: "Major",     vedic: "Aquarius (Kumbha) • Hope & Grace",                  image: "/tarot/ar17.jpg" },
    { name: "The Moon",          symbol: "🌊", type: "Major",     vedic: "Pisces (Meena) • Subconscious & Dreams",            image: "/tarot/ar18.jpg" },
    { name: "The Sun",           symbol: "☀️", type: "Major",    vedic: "Sun (Surya) • Radiant Joy & Success",               image: "/tarot/ar19.jpg" },
    { name: "Judgement",         symbol: "📯", type: "Major",     vedic: "Saturn / Rebirth • Higher Calling",                 image: "/tarot/ar20.jpg" },
    { name: "The World",         symbol: "🌍", type: "Major",     vedic: "Moksha & Completion • Cosmic Wholeness",            image: "/tarot/ar21.jpg" },
    // Minor Arcana highlights
    { name: "Ace of Wands",      symbol: "🔥", type: "Wands",     vedic: "Agni Tattva • Creative Spark",                     image: "/tarot/wa01.jpg" },
    { name: "King of Wands",     symbol: "🤴", type: "Wands",     vedic: "Simha / Surya • Visionary Leader",                 image: "/tarot/wa14.jpg" },
    { name: "Ace of Cups",       symbol: "🏆", type: "Cups",      vedic: "Jala Tattva • Unconditional Love",                 image: "/tarot/cu01.jpg" },
    { name: "Queen of Cups",     symbol: "👸", type: "Cups",      vedic: "Chandra / Intuition • Deep Empathy",               image: "/tarot/cu13.jpg" },
    { name: "Ace of Swords",     symbol: "⚔️", type: "Swords",   vedic: "Vayu Tattva • Clarity & Truth",                    image: "/tarot/sw01.jpg" },
    { name: "King of Swords",    symbol: "🗡️", type: "Swords",   vedic: "Budha / Shani • Sharp Intellect",                  image: "/tarot/sw14.jpg" },
    { name: "Ace of Pentacles",  symbol: "🪙", type: "Pentacles", vedic: "Prithvi Tattva • Material Prosperity",             image: "/tarot/pe01.jpg" },
    { name: "King of Pentacles", symbol: "💰", type: "Pentacles", vedic: "Shukra / Dhana • Ultimate Wealth",                 image: "/tarot/pe14.jpg" },
];

// ── Application Initialization ───────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    createStarfield();
    loadSavedBirthDetails();
    loadModels();
    loadLiveTransits();
    autoResizeTextarea();

    // Auto-refresh transits every 60 seconds
    setInterval(() => {
        loadLiveTransits();
    }, 60000);
});

// ── Starfield & Shooting Stars ───────────────────────────
function createStarfield() {
    const container = document.getElementById("starfield");
    if (!container) return;
    const count = Math.min(window.innerWidth / 4, 180);

    for (let i = 0; i < count; i++) {
        const star = document.createElement("div");
        star.className = "star";
        const size = Math.random() * 2.5 + 0.5;
        star.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            --duration: ${Math.random() * 4 + 2}s;
            --min-opacity: ${Math.random() * 0.3 + 0.05};
            --max-opacity: ${Math.random() * 0.5 + 0.5};
            animation-delay: ${Math.random() * 5}s;
        `;
        container.appendChild(star);
    }

    // Spawn periodic shooting stars
    setInterval(() => {
        const shootingStar = document.createElement("div");
        shootingStar.className = "shooting-star";
        shootingStar.style.cssText = `
            top: ${Math.random() * 40}%;
            left: ${Math.random() * 80 + 20}%;
            width: ${Math.random() * 80 + 80}px;
        `;
        container.appendChild(shootingStar);
        setTimeout(() => shootingStar.remove(), 4000);
    }, 6000);
}

// ── Fetch & Select AI Models ─────────────────────────────
async function loadModels() {
    try {
        const resp = await fetch("/api/models");
        if (!resp.ok) return;
        const data = await resp.json();
        const select = document.getElementById("modelSelect");
        if (!select) return;

        const models = data.models || [];
        models.sort((a, b) => a.id.localeCompare(b.id));

        const savedModel = localStorage.getItem("jyotish_model");
        select.innerHTML = "";

        for (const m of models) {
            const opt = document.createElement("option");
            opt.value = m.id;
            opt.textContent = m.display_name || m.id;
            if (savedModel && m.id === savedModel) {
                opt.selected = true;
            } else if (!savedModel && m.id.includes("claude-opus")) {
                opt.selected = true;
            }
            select.appendChild(opt);
        }

        select.addEventListener("change", (e) => {
            localStorage.setItem("jyotish_model", e.target.value);
            showToast(`Brain switched to ${e.target.value}`, "✨");
        });
    } catch (e) {
        console.warn("Could not fetch models:", e);
    }
}

// ── Live Gochar Planetary Transits ────────────────────────
async function loadLiveTransits() {
    try {
        const resp = await fetch("/api/transits?city=Mumbai&nation=IN");
        if (!resp.ok) return;
        const data = await resp.json();
        currentTransitsData = data;
        renderLiveTransitTicker(data.planets || []);
        renderGocharModalContent(data.planets || []);
    } catch (e) {
        console.warn("Transits fetch error:", e);
    }
}

function renderLiveTransitTicker(planets) {
    const track = document.getElementById("transitTickerTrack");
    if (!track || !planets.length) return;

    const chips = planets.map(p => {
        const sym = PLANET_SYMBOLS[p.name] || "🪐";
        const retro = p.retrograde ? `<span class="retro-tag">℞</span>` : "";
        const nakStr = p.nakshatra ? ` (${p.nakshatra} p${p.nakshatra_pada || 1})` : "";
        return `
            <span class="transit-chip" onclick="openGocharModal()" title="${p.name} at ${p.position?.toFixed(2)}° in ${p.sign}${nakStr}">
                <span class="graha-sym">${sym}</span> ${p.name} in <span class="rashi-name">${p.sign}</span>${retro}
            </span>
        `;
    }).join("");

    // Duplicate track for seamless infinite CSS animation
    track.innerHTML = chips + chips;
}

function renderGocharModalContent(planets) {
    const container = document.getElementById("gocharModalContent");
    if (!container) return;

    let rows = planets.map(p => {
        const sym = PLANET_SYMBOLS[p.name] || "🪐";
        const retro = p.retrograde ? `<span class="retro-badge">℞ Retrograde</span>` : `<span style="color:var(--accent-emerald);">Direct</span>`;
        return `
            <tr>
                <td><strong>${sym} ${p.name}</strong></td>
                <td><span style="color:var(--accent-cyan); font-weight:600;">${p.sign}</span></td>
                <td>${p.nakshatra || "—"} ${p.nakshatra_pada ? `(Pada ${p.nakshatra_pada})` : ""}</td>
                <td>${p.position?.toFixed(2) || "0.00"}°</td>
                <td>${retro}</td>
            </tr>
        `;
    }).join("");

    container.innerHTML = `
        <table class="graha-table">
            <thead>
                <tr>
                    <th>Graha</th>
                    <th>Rashi</th>
                    <th>Nakshatra</th>
                    <th>Degrees</th>
                    <th>Motion</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
        <div style="margin-top:16px; text-align:right;">
            <button class="btn-primary" onclick="closeGocharModal()">Close</button>
        </div>
    `;
}

function openGocharModal() {
    document.getElementById("gocharModal").classList.add("active");
}
function closeGocharModal() {
    document.getElementById("gocharModal").classList.remove("active");
}

// ── Tab Switching ─────────────────────────────────────────
function switchTab(tabName) {
    document.querySelectorAll(".nav-tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("active"));

    const tabBtn = document.querySelector(`.nav-tab[data-tab="${tabName}"]`);
    const tabEl = document.getElementById(`tab-${tabName}`);

    if (tabBtn) tabBtn.classList.add("active");
    if (tabEl) tabEl.classList.add("active");

    if (tabName === "kundli" && chartData) {
        renderKundli(chartData);
    }
}

// ── Birth Details & Kundli Generation ─────────────────────
async function submitBirthDetails(e) {
    e.preventDefault();

    const btn = document.getElementById("generateBtn");
    const btnText = btn.querySelector(".btn-text");
    const btnLoader = btn.querySelector(".btn-loader");
    btnText.style.display = "none";
    btnLoader.style.display = "inline";
    btn.disabled = true;

    const dateVal = document.getElementById("birthDate").value;
    const timeVal = document.getElementById("birthTime").value;
    const [year, month, day] = dateVal.split("-").map(Number);
    const [hour, minute] = timeVal.split(":").map(Number);

    const birthDetails = {
        name: document.getElementById("name").value.trim(),
        year, month, day, hour, minute,
        city: document.getElementById("city").value.trim(),
        nation: document.getElementById("nation").value.trim().toUpperCase(),
    };

    try {
        const resp = await fetch("/api/chart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(birthDetails),
        });

        if (!resp.ok) {
            const err = await resp.json().catch(() => ({}));
            throw new Error(err.detail || "Vedic chart computation failed.");
        }

        chartData = await resp.json();
        savedBirthDetails = birthDetails;
        saveBirthDetails(birthDetails);
        updateUserProfileHeader(chartData);
        renderKundli(chartData);
        showChatInterface();

        showToast(`Kundli generated for ${birthDetails.name}!`, "🪷");

        addBotMessage(
            `🪷 **Namaste, ${birthDetails.name}!** Your Vedic Janma Kundli has been generated with Lahiri Ayanamsa.\n\n` +
            `* **Lagna (Ascendant)**: **${chartData.ascendant?.sign || "?"}** (${chartData.ascendant?.nakshatra || "?"} Pada ${chartData.ascendant?.nakshatra_pada || "?"})\n` +
            `* **Surya Rashi (Sun)**: **${chartData.sun?.sign || "?"}** (${chartData.sun?.nakshatra || "?"})\n` +
            `* **Chandra Rashi (Moon)**: **${chartData.moon?.sign || "?"}** (${chartData.moon?.nakshatra || "?"})\n\n` +
            `You can now inspect your **Kundli tab** for interactive Bhavas, or ask me any question about your Dasha, career, relationships, and remedies! ✨`
        );
    } catch (err) {
        showToast(err.message, "⚠️");
    } finally {
        btnText.style.display = "inline";
        btnLoader.style.display = "none";
        btn.disabled = false;
    }
}

function skipBirthDetails() {
    showChatInterface();
    addBotMessage(
        "🔮 **Namaste!** I am your **Jyotish Guru** — AI Vedic Astrologer & Cosmic Guide.\n\n" +
        "You can consult me on all aspects of Vedic astrology, Gochar transits, or remedies.\n\n" +
        "If you wish to calculate your personalized **Kundli**, simply click the profile badge in the header or enter your birth details at any time! ✨"
    );
}

function showChatInterface() {
    document.getElementById("birthFormOverlay").style.display = "none";
    document.getElementById("chatContainer").style.display = "flex";
    document.getElementById("chatInput").focus();
}

function updateUserProfileHeader(data) {
    const chip = document.getElementById("userProfileChip");
    const text = document.getElementById("userProfileText");
    if (!chip || !text || !data) return;

    chip.style.display = "flex";
    text.textContent = `${data.name} (${data.ascendant?.sign || "Lagna"})`;
}

// ── Edit Birth Modal ──────────────────────────────────────
function openBirthModal() {
    const modal = document.getElementById("birthModal");
    if (!modal) return;
    if (savedBirthDetails) {
        document.getElementById("modalName").value = savedBirthDetails.name || "";
        const m = String(savedBirthDetails.month).padStart(2, "0");
        const d = String(savedBirthDetails.day).padStart(2, "0");
        document.getElementById("modalBirthDate").value = `${savedBirthDetails.year}-${m}-${d}`;
        const h = String(savedBirthDetails.hour || 12).padStart(2, "0");
        const min = String(savedBirthDetails.minute || 0).padStart(2, "0");
        document.getElementById("modalBirthTime").value = `${h}:${min}`;
        document.getElementById("modalCity").value = savedBirthDetails.city || "";
        document.getElementById("modalNation").value = savedBirthDetails.nation || "IN";
    }
    modal.classList.add("active");
}

function closeBirthModal() {
    document.getElementById("birthModal").classList.remove("active");
}

async function submitModalBirthDetails(e) {
    e.preventDefault();
    const dateVal = document.getElementById("modalBirthDate").value;
    const timeVal = document.getElementById("modalBirthTime").value;
    const [year, month, day] = dateVal.split("-").map(Number);
    const [hour, minute] = timeVal.split(":").map(Number);

    const birthDetails = {
        name: document.getElementById("modalName").value.trim(),
        year, month, day, hour, minute,
        city: document.getElementById("modalCity").value.trim(),
        nation: document.getElementById("modalNation").value.trim().toUpperCase(),
    };

    try {
        const resp = await fetch("/api/chart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(birthDetails),
        });

        if (!resp.ok) {
            const err = await resp.json().catch(() => ({}));
            throw new Error(err.detail || "Chart update failed.");
        }

        chartData = await resp.json();
        savedBirthDetails = birthDetails;
        saveBirthDetails(birthDetails);
        updateUserProfileHeader(chartData);
        renderKundli(chartData);
        closeBirthModal();
        showToast("Birth coordinates updated successfully!", "✨");
        switchTab("kundli");
    } catch (err) {
        showToast(err.message, "⚠️");
    }
}

// ── Chat Messaging & SSE Streaming Engine ─────────────────
function addBotMessage(text) {
    const container = document.getElementById("chatMessages");
    const msg = document.createElement("div");
    msg.className = "message assistant";
    msg.innerHTML = `
        <div class="message-header">
            <span class="msg-label">🔮 Jyotish Guru</span>
            <div class="msg-actions">
                <button class="btn-icon-action" onclick="speakMessage(this)" title="Read Aloud">🔊</button>
                <button class="btn-icon-action" onclick="copyMessageText(this)" title="Copy Message">📋</button>
            </div>
        </div>
        <div class="message-body">${renderMarkdown(text)}</div>
    `;
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;

    conversationHistory.push({ role: "assistant", content: text });
}

function addUserMessage(text) {
    const container = document.getElementById("chatMessages");
    const msg = document.createElement("div");
    msg.className = "message user";
    msg.textContent = text;
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;

    conversationHistory.push({ role: "user", content: text });
}

function addTypingIndicator() {
    const container = document.getElementById("chatMessages");
    const div = document.createElement("div");
    div.className = "message assistant";
    div.id = "typingIndicator";
    div.innerHTML = `
        <div class="message-header">
            <span class="msg-label">🔮 Jyotish Guru</span>
        </div>
        <div class="typing-indicator">
            <span></span><span></span><span></span>
        </div>
    `;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function removeTypingIndicator() {
    const el = document.getElementById("typingIndicator");
    if (el) el.remove();
}

async function sendMessage(overrideText = null) {
    if (isStreaming) return;

    const input = document.getElementById("chatInput");
    const text = overrideText || input.value.trim();
    if (!text) return;

    if (!overrideText) {
        input.value = "";
        input.style.height = "auto";
    }

    addUserMessage(text);
    isStreaming = true;
    document.getElementById("sendBtn").disabled = true;
    addTypingIndicator();

    const requestBody = {
        messages: conversationHistory.map(m => ({
            role: m.role, content: m.content,
        })),
        chart_context: chartData || null,
        model: document.getElementById("modelSelect").value,
    };

    try {
        const resp = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
        });

        removeTypingIndicator();

        if (!resp.ok) {
            addBotMessage("🙏 I apologize, an issue occurred in connecting with the celestial oracle. Please try again.");
            return;
        }

        const reader = resp.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let fullText = "";
        let botMsgEl = null;

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
                if (!line.startsWith("data: ")) continue;
                const data = line.slice(6).trim();
                if (data === "[DONE]") continue;

                try {
                    const parsed = JSON.parse(data);
                    if (parsed.error) {
                        addBotMessage("⚠️ " + parsed.error);
                        return;
                    }
                    if (parsed.content) {
                        fullText += parsed.content;

                        if (!botMsgEl) {
                            const container = document.getElementById("chatMessages");
                            botMsgEl = document.createElement("div");
                            botMsgEl.className = "message assistant";
                            botMsgEl.innerHTML = `
                                <div class="message-header">
                                    <span class="msg-label">🔮 Jyotish Guru</span>
                                    <div class="msg-actions">
                                        <button class="btn-icon-action" onclick="speakMessage(this)" title="Read Aloud">🔊</button>
                                        <button class="btn-icon-action" onclick="copyMessageText(this)" title="Copy Message">📋</button>
                                    </div>
                                </div>
                                <div class="message-body"></div>
                            `;
                            container.appendChild(botMsgEl);
                        }

                        botMsgEl.querySelector(".message-body").innerHTML = renderMarkdown(fullText);
                        document.getElementById("chatMessages").scrollTop =
                            document.getElementById("chatMessages").scrollHeight;
                    }
                } catch (e) {
                    // skip partial malformed JSON
                }
            }
        }

        if (fullText) {
            conversationHistory.push({ role: "assistant", content: fullText });
        }
    } catch (err) {
        removeTypingIndicator();
        addBotMessage("🙏 Connection interrupted. Please check your network and ask again.");
    } finally {
        isStreaming = false;
        document.getElementById("sendBtn").disabled = false;
        document.getElementById("chatInput").focus();
    }
}

function sendQuickPrompt(promptText) {
    switchTab("chat");
    sendMessage(promptText);
}

function handleChatKeydown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
}

function autoResizeTextarea() {
    const textarea = document.getElementById("chatInput");
    if (!textarea) return;
    textarea.addEventListener("input", () => {
        textarea.style.height = "auto";
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
    });
}

// ── North Indian Diamond Kundli & Planetary Dignities ─────
function renderKundli(data) {
    if (!data) return;

    document.getElementById("kundliPlaceholder").style.display = "none";
    document.getElementById("kundliActiveContent").style.display = "block";

    // Header info
    document.getElementById("kundliSeekerName").textContent = `🪷 Vedic Kundli — ${data.name}`;
    const b = data.birth_data || {};
    document.getElementById("kundliBirthMeta").textContent = 
        `${b.day}/${b.month}/${b.year} at ${String(b.hour).padStart(2, '0')}:${String(b.minute).padStart(2, '0')} • ${b.city}, ${b.nation} • Sidereal Lahiri`;

    // Badges
    const ascSign = data.ascendant?.sign || "Mesha";
    const sunSign = data.sun?.sign || "Mesha";
    const moonSign = data.moon?.sign || "Mesha";

    const ascMeta = VEDIC_SIGNS.find(s => s.name === ascSign) || VEDIC_SIGNS[0];
    const sunMeta = VEDIC_SIGNS.find(s => s.name === sunSign) || VEDIC_SIGNS[0];
    const moonMeta = VEDIC_SIGNS.find(s => s.name === moonSign) || VEDIC_SIGNS[0];

    document.getElementById("badgeLagnaVal").textContent = `${ascSign} ${ascMeta.symbol}`;
    document.getElementById("badgeLagnaNak").textContent = `${data.ascendant?.nakshatra || "—"} (Pada ${data.ascendant?.nakshatra_pada || 1})`;

    document.getElementById("badgeSunVal").textContent = `${sunSign} ${sunMeta.symbol}`;
    document.getElementById("badgeSunNak").textContent = `${data.sun?.nakshatra || "—"} (Pada ${data.sun?.nakshatra_pada || 1})`;

    document.getElementById("badgeMoonVal").textContent = `${moonSign} ${moonMeta.symbol}`;
    document.getElementById("badgeMoonNak").textContent = `${data.moon?.nakshatra || "—"} (Pada ${data.moon?.nakshatra_pada || 1})`;

    // Calculate Vimshottari Dasha estimation
    const dasha = calculateCurrentVimshottariDasha(data);
    document.getElementById("badgeDashaVal").textContent = `${dasha.mahadasha} - ${dasha.antardasha}`;
    document.getElementById("badgeDashaSub").textContent = `${dasha.yearsRemaining}y balance in ${dasha.mahadasha}`;

    // Render North Indian Diamond SVG
    const svgEl = generateNorthIndianKundliSvg(data);
    const container = document.getElementById("northIndianSvgContainer");
    container.innerHTML = "";
    container.appendChild(svgEl);

    // Render Graha Placement Table
    renderGrahaTable(data);

    // Render Western Wheel if available
    if (data.svg_chart) {
        document.getElementById("wheelChartContainer").innerHTML = data.svg_chart;
    }

    // Default select 1st House
    selectKundliHouse(1);
}

// ── North Indian Diamond Kundli SVG Generator ─────────────
function generateNorthIndianKundliSvg(data) {
    const NS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 500 500");
    svg.setAttribute("class", "north-indian-svg");

    const ascSignNum = data.ascendant?.sign_num !== undefined ? data.ascendant.sign_num : 0; // 0=Mesha..11=Meena

    // Map planets to houses: houseNum = ((p.sign_num - ascSignNum + 12) % 12) + 1
    const housePlanets = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: [] };

    const allPlanets = data.planets || [];
    allPlanets.forEach(p => {
        const pSignNum = p.sign_num !== undefined ? p.sign_num : 0;
        const hNum = ((pSignNum - ascSignNum + 12) % 12) + 1;
        if (housePlanets[hNum]) {
            housePlanets[hNum].push(p);
        }
    });

    // House definitions with SVG polygon coordinates (0..500)
    // and label anchor centers
    const housesDef = [
        {
            num: 1,
            points: "250,0 125,125 250,250 375,125",
            rashiPos: { x: 250, y: 155 },
            planetPos: { x: 250, y: 90 },
            labelPos: { x: 250, y: 35 }
        },
        {
            num: 2,
            points: "0,0 250,0 125,125",
            rashiPos: { x: 145, y: 70 },
            planetPos: { x: 95, y: 45 },
            labelPos: { x: 60, y: 25 }
        },
        {
            num: 3,
            points: "0,0 125,125 0,250",
            rashiPos: { x: 75, y: 145 },
            planetPos: { x: 45, y: 95 },
            labelPos: { x: 25, y: 60 }
        },
        {
            num: 4,
            points: "0,250 125,125 250,250 125,375",
            rashiPos: { x: 155, y: 250 },
            planetPos: { x: 90, y: 250 },
            labelPos: { x: 35, y: 250 }
        },
        {
            num: 5,
            points: "0,250 125,375 0,500",
            rashiPos: { x: 75, y: 355 },
            planetPos: { x: 45, y: 405 },
            labelPos: { x: 25, y: 440 }
        },
        {
            num: 6,
            points: "0,500 125,375 250,500",
            rashiPos: { x: 145, y: 430 },
            planetPos: { x: 95, y: 455 },
            labelPos: { x: 60, y: 475 }
        },
        {
            num: 7,
            points: "250,500 125,375 250,250 375,375",
            rashiPos: { x: 250, y: 345 },
            planetPos: { x: 250, y: 410 },
            labelPos: { x: 250, y: 465 }
        },
        {
            num: 8,
            points: "250,500 375,375 500,500",
            rashiPos: { x: 355, y: 430 },
            planetPos: { x: 405, y: 455 },
            labelPos: { x: 440, y: 475 }
        },
        {
            num: 9,
            points: "500,500 375,375 500,250",
            rashiPos: { x: 425, y: 355 },
            planetPos: { x: 455, y: 405 },
            labelPos: { x: 475, y: 440 }
        },
        {
            num: 10,
            points: "500,250 375,375 250,250 375,125",
            rashiPos: { x: 345, y: 250 },
            planetPos: { x: 410, y: 250 },
            labelPos: { x: 465, y: 250 }
        },
        {
            num: 11,
            points: "500,250 375,125 500,0",
            rashiPos: { x: 425, y: 145 },
            planetPos: { x: 455, y: 95 },
            labelPos: { x: 475, y: 60 }
        },
        {
            num: 12,
            points: "500,0 375,125 250,0",
            rashiPos: { x: 355, y: 70 },
            planetPos: { x: 405, y: 45 },
            labelPos: { x: 440, y: 25 }
        }
    ];

    // Background rectangle
    const bgRect = document.createElementNS(NS, "rect");
    bgRect.setAttribute("width", "500");
    bgRect.setAttribute("height", "500");
    bgRect.setAttribute("fill", "#0b0a1c");
    bgRect.setAttribute("stroke", "#e8b84b");
    bgRect.setAttribute("stroke-width", "3");
    bgRect.setAttribute("rx", "6");
    svg.appendChild(bgRect);

    // Outer grid lines
    const gridLines = [
        "M0,0 L500,500",
        "M500,0 L0,500",
        "M250,0 L0,250 L250,500 L500,250 Z"
    ];
    gridLines.forEach(d => {
        const path = document.createElementNS(NS, "path");
        path.setAttribute("d", d);
        path.setAttribute("stroke", "rgba(232, 184, 75, 0.45)");
        path.setAttribute("stroke-width", "1.5");
        path.setAttribute("fill", "none");
        svg.appendChild(path);
    });

    // Draw house polygons
    housesDef.forEach(h => {
        const poly = document.createElementNS(NS, "polygon");
        poly.setAttribute("points", h.points);
        poly.setAttribute("class", `house-poly house-poly-${h.num}`);
        poly.setAttribute("data-house", h.num);
        poly.onclick = () => selectKundliHouse(h.num);
        svg.appendChild(poly);

        // House Number tiny label
        const lbl = document.createElementNS(NS, "text");
        lbl.setAttribute("x", h.labelPos.x);
        lbl.setAttribute("y", h.labelPos.y);
        lbl.setAttribute("class", "house-label-text");
        lbl.textContent = `H${h.num}`;
        svg.appendChild(lbl);

        // Rashi numeral (1 to 12) in house
        // House 1 is ascSignNum + 1. House 2 is ((ascSignNum + 1)%12) + 1, etc.
        const rashiNumber = ((ascSignNum + (h.num - 1)) % 12) + 1;
        const rashiTxt = document.createElementNS(NS, "text");
        rashiTxt.setAttribute("x", h.rashiPos.x);
        rashiTxt.setAttribute("y", h.rashiPos.y);
        rashiTxt.setAttribute("class", "rashi-text");
        rashiTxt.textContent = rashiNumber;
        svg.appendChild(rashiTxt);

        // Render Grahas inside this house
        const planetsInHouse = housePlanets[h.num] || [];
        if (h.num === 1) {
            // Include Lagna in House 1
            planetsInHouse.unshift({ name: "Lagna", position: data.ascendant?.position || 0 });
        }

        if (planetsInHouse.length > 0) {
            const startY = h.planetPos.y - ((planetsInHouse.length - 1) * 7);
            planetsInHouse.forEach((p, idx) => {
                const pTxt = document.createElementNS(NS, "text");
                pTxt.setAttribute("x", h.planetPos.x);
                pTxt.setAttribute("y", startY + (idx * 14));
                const pClass = p.name.toLowerCase();
                pTxt.setAttribute("class", `graha-text ${pClass}`);
                const retro = p.retrograde ? "℞" : "";
                const abbr = PLANET_ABBRS[p.name] || p.name.slice(0, 2);
                pTxt.textContent = `${abbr}${retro} ${p.position?.toFixed(1) || 0}°`;
                svg.appendChild(pTxt);
            });
        }
    });

    return svg;
}

// ── Interactive House Inspector ───────────────────────────
function selectKundliHouse(hNum) {
    selectedHouseNumber = hNum;

    // Update active class on SVG polygons
    document.querySelectorAll(".house-poly").forEach(p => p.classList.remove("selected-house"));
    const activePoly = document.querySelector(`.house-poly-${hNum}`);
    if (activePoly) activePoly.classList.add("selected-house");

    if (!chartData) return;

    const ascSignNum = chartData.ascendant?.sign_num !== undefined ? chartData.ascendant.sign_num : 0;
    const rashiNum = ((ascSignNum + (hNum - 1)) % 12);
    const rashi = VEDIC_SIGNS[rashiNum] || VEDIC_SIGNS[0];
    const hData = HOUSE_DATA[hNum];

    // Find grahas in this house
    const occupants = [];
    if (hNum === 1) {
        occupants.push({
            name: "Lagna (Ascendant)",
            sign: chartData.ascendant?.sign || rashi.name,
            position: chartData.ascendant?.position || 0,
            nakshatra: chartData.ascendant?.nakshatra || "—",
            pada: chartData.ascendant?.nakshatra_pada || 1,
            retrograde: false,
        });
    }

    (chartData.planets || []).forEach(p => {
        const pSignNum = p.sign_num !== undefined ? p.sign_num : 0;
        const currentHouse = ((pSignNum - ascSignNum + 12) % 12) + 1;
        if (currentHouse === hNum) {
            occupants.push(p);
        }
    });

    // Populate Inspector Card UI
    document.getElementById("inspectHouseTitle").textContent = `House ${hNum}: ${hData.name}`;
    document.getElementById("inspectHouseRashi").textContent = `Rashi: ${rashi.name} ${rashi.symbol} (${rashi.english}) • ${rashi.element}`;
    document.getElementById("inspectHouseLordBadge").textContent = `Lord: ${rashi.lordSanskrit} ${rashi.lordSym}`;
    document.getElementById("inspectHouseType").textContent = hData.type;
    document.getElementById("inspectHouseSignificance").textContent = hData.karakas;

    if (occupants.length === 0) {
        document.getElementById("inspectHouseGrahas").textContent = "Empty (Ruled by " + rashi.lordSanskrit + ")";
        document.getElementById("inspectOccupantChips").innerHTML = `<span style="color:var(--text-muted); font-size:12px;">No occupant Grahas currently in this Bhava.</span>`;
    } else {
        document.getElementById("inspectHouseGrahas").textContent = occupants.map(o => o.name).join(", ");
        document.getElementById("inspectOccupantChips").innerHTML = occupants.map(o => {
            const sym = PLANET_SYMBOLS[o.name] || "🪐";
            const retro = o.retrograde ? " ℞" : "";
            const dignity = getGrahaDignity(o.name, rashi.name);
            return `
                <span class="occupant-chip">
                    ${sym} <strong>${o.name}</strong> at ${o.position?.toFixed(2)}° ${retro} 
                    <span style="font-size:10px; color:var(--accent-gold-light);">[${dignity.badge}]</span>
                </span>
            `;
        }).join("");
    }
}

function askGuruAboutSelectedHouse() {
    const hData = HOUSE_DATA[selectedHouseNumber];
    const prompt = `Please provide a deep astrological analysis of my ${selectedHouseNumber}th House (${hData.name} - ${hData.title}). What are its planetary strengths, potential career/life effects, and recommended spiritual remedies?`;
    switchTab("chat");
    sendMessage(prompt);
}

// ── Graha Dignity Calculator ──────────────────────────────
function getGrahaDignity(grahaName, signName) {
    const g = grahaName.toLowerCase();
    const s = signName;

    if (g.includes("sun") || g.includes("surya")) {
        if (s === "Mesha") return { status: "exalted", badge: "👑 Uchha (Exalted)", class: "exalted" };
        if (s === "Tula") return { status: "debilitated", badge: "⚠️ Neecha (Debilitated)", class: "debilitated" };
        if (s === "Simha") return { status: "own", badge: "🏠 Swakshetra (Own)", class: "own" };
        if (["Dhanu", "Meena", "Karka", "Vrischika"].includes(s)) return { status: "friend", badge: "✨ Mitra (Friend)", class: "friend" };
        return { status: "enemy", badge: "⚔️ Shatru (Enemy)", class: "enemy" };
    }
    if (g.includes("moon") || g.includes("chandra")) {
        if (s === "Vrishabha") return { status: "exalted", badge: "👑 Uchha (Exalted)", class: "exalted" };
        if (s === "Vrischika") return { status: "debilitated", badge: "⚠️ Neecha (Debilitated)", class: "debilitated" };
        if (s === "Karka") return { status: "own", badge: "🏠 Swakshetra (Own)", class: "own" };
        if (["Mesha", "Simha", "Mithuna", "Kanya"].includes(s)) return { status: "friend", badge: "✨ Mitra (Friend)", class: "friend" };
        return { status: "neutral", badge: "⚖️ Sama (Neutral)", class: "friend" };
    }
    if (g.includes("mars") || g.includes("mangal")) {
        if (s === "Makara") return { status: "exalted", badge: "👑 Uchha (Exalted)", class: "exalted" };
        if (s === "Karka") return { status: "debilitated", badge: "⚠️ Neecha (Debilitated)", class: "debilitated" };
        if (["Mesha", "Vrischika"].includes(s)) return { status: "own", badge: "🏠 Swakshetra (Own)", class: "own" };
        if (["Simha", "Dhanu", "Meena"].includes(s)) return { status: "friend", badge: "✨ Mitra (Friend)", class: "friend" };
        return { status: "enemy", badge: "⚔️ Shatru (Enemy)", class: "enemy" };
    }
    if (g.includes("mercury") || g.includes("budha")) {
        if (s === "Kanya") return { status: "exalted", badge: "👑 Uchha (Exalted)", class: "exalted" };
        if (s === "Meena") return { status: "debilitated", badge: "⚠️ Neecha (Debilitated)", class: "debilitated" };
        if (["Mithuna", "Kanya"].includes(s)) return { status: "own", badge: "🏠 Swakshetra (Own)", class: "own" };
        if (["Vrishabha", "Tula", "Simha"].includes(s)) return { status: "friend", badge: "✨ Mitra (Friend)", class: "friend" };
        return { status: "enemy", badge: "⚔️ Shatru (Enemy)", class: "enemy" };
    }
    if (g.includes("jupiter") || g.includes("guru")) {
        if (s === "Karka") return { status: "exalted", badge: "👑 Uchha (Exalted)", class: "exalted" };
        if (s === "Makara") return { status: "debilitated", badge: "⚠️ Neecha (Debilitated)", class: "debilitated" };
        if (["Dhanu", "Meena"].includes(s)) return { status: "own", badge: "🏠 Swakshetra (Own)", class: "own" };
        if (["Mesha", "Simha", "Vrischika"].includes(s)) return { status: "friend", badge: "✨ Mitra (Friend)", class: "friend" };
        return { status: "enemy", badge: "⚔️ Shatru (Enemy)", class: "enemy" };
    }
    if (g.includes("venus") || g.includes("shukra")) {
        if (s === "Meena") return { status: "exalted", badge: "👑 Uchha (Exalted)", class: "exalted" };
        if (s === "Kanya") return { status: "debilitated", badge: "⚠️ Neecha (Debilitated)", class: "debilitated" };
        if (["Vrishabha", "Tula"].includes(s)) return { status: "own", badge: "🏠 Swakshetra (Own)", class: "own" };
        if (["Mithuna", "Makara", "Kumbha"].includes(s)) return { status: "friend", badge: "✨ Mitra (Friend)", class: "friend" };
        return { status: "enemy", badge: "⚔️ Shatru (Enemy)", class: "enemy" };
    }
    if (g.includes("saturn") || g.includes("shani")) {
        if (s === "Tula") return { status: "exalted", badge: "👑 Uchha (Exalted)", class: "exalted" };
        if (s === "Mesha") return { status: "debilitated", badge: "⚠️ Neecha (Debilitated)", class: "debilitated" };
        if (["Makara", "Kumbha"].includes(s)) return { status: "own", badge: "🏠 Swakshetra (Own)", class: "own" };
        if (["Mithuna", "Kanya", "Vrishabha"].includes(s)) return { status: "friend", badge: "✨ Mitra (Friend)", class: "friend" };
        return { status: "enemy", badge: "⚔️ Shatru (Enemy)", class: "enemy" };
    }
    if (g.includes("rahu")) {
        if (["Vrishabha", "Mithuna"].includes(s)) return { status: "exalted", badge: "👑 Uchha (Exalted)", class: "exalted" };
        if (["Vrischika", "Dhanu"].includes(s)) return { status: "debilitated", badge: "⚠️ Neecha (Debilitated)", class: "debilitated" };
        if (s === "Kumbha") return { status: "own", badge: "🏠 Co-Lord (Own)", class: "own" };
        return { status: "friend", badge: "✨ Neutral/Friend", class: "friend" };
    }
    if (g.includes("ketu")) {
        if (["Vrischika", "Dhanu"].includes(s)) return { status: "exalted", badge: "👑 Uchha (Exalted)", class: "exalted" };
        if (["Vrishabha", "Mithuna"].includes(s)) return { status: "debilitated", badge: "⚠️ Neecha (Debilitated)", class: "debilitated" };
        if (s === "Vrischika") return { status: "own", badge: "🏠 Co-Lord (Own)", class: "own" };
        return { status: "friend", badge: "✨ Neutral/Friend", class: "friend" };
    }

    return { status: "neutral", badge: "✨ Neutral", class: "friend" };
}

// ── Graha Table Renderer ──────────────────────────────────
function renderGrahaTable(data) {
    const tbody = document.getElementById("grahaTableBody");
    if (!tbody) return;

    const ascSignNum = data.ascendant?.sign_num !== undefined ? data.ascendant.sign_num : 0;
    const list = [
        {
            name: "Lagna (Ascendant)",
            sign: data.ascendant?.sign || "Mesha",
            sign_num: ascSignNum,
            position: data.ascendant?.position || 0,
            nakshatra: data.ascendant?.nakshatra || "—",
            nakshatra_pada: data.ascendant?.nakshatra_pada || 1,
            retrograde: false,
        },
        ...(data.planets || [])
    ];

    tbody.innerHTML = list.map(p => {
        const sym = PLANET_SYMBOLS[p.name] || "🪐";
        const hNum = p.name.includes("Lagna") ? 1 : (((p.sign_num - ascSignNum + 12) % 12) + 1);
        const dignity = getGrahaDignity(p.name, p.sign);
        const retro = p.retrograde ? `<span class="retro-badge">℞ Vakra</span>` : `<span style="color:var(--text-muted);">Direct</span>`;
        return `
            <tr>
                <td><strong>${sym} ${p.name}</strong></td>
                <td><span style="color:var(--accent-cyan); font-weight:600;">${p.sign}</span></td>
                <td><span style="color:var(--accent-gold-light); font-weight:700;">H${hNum}</span></td>
                <td>${p.nakshatra || "—"} (Pada ${p.nakshatra_pada || 1})</td>
                <td>${p.position?.toFixed(2) || "0.00"}°</td>
                <td><span class="dignity-badge ${dignity.class}">${dignity.badge}</span></td>
                <td>${retro}</td>
            </tr>
        `;
    }).join("");
}

function setKundliView(view) {
    currentKundliView = view;
    document.querySelectorAll(".view-btn").forEach(b => b.classList.remove("active"));

    const northLayout = document.getElementById("kundliVisualLayout");
    const tableSection = document.getElementById("grahaTableSection");
    const wheelContainer = document.getElementById("wheelChartContainer");

    if (view === "north") {
        document.getElementById("btnViewNorth").classList.add("active");
        northLayout.style.display = "grid";
        tableSection.style.display = "block";
        wheelContainer.style.display = "none";
    } else if (view === "table") {
        document.getElementById("btnViewTable").classList.add("active");
        northLayout.style.display = "none";
        tableSection.style.display = "block";
        wheelContainer.style.display = "none";
    } else if (view === "wheel") {
        document.getElementById("btnViewWheel").classList.add("active");
        northLayout.style.display = "none";
        tableSection.style.display = "none";
        wheelContainer.style.display = "block";
    }
}

// ── Vimshottari Dasha Calculator ──────────────────────────
function calculateCurrentVimshottariDasha(data) {
    const moonNak = data.moon?.nakshatra || "Ashwini";
    const nakIdx = Math.max(0, NAKSHATRAS.findIndex(n => n.name.toLowerCase() === moonNak.toLowerCase()));
    const nakInfo = NAKSHATRAS[nakIdx] || NAKSHATRAS[0];

    const birthYear = data.birth_data?.year || new Date().getFullYear() - 25;
    const currentYear = new Date().getFullYear();
    const age = Math.max(0, currentYear - birthYear);

    // Calculate Dasha sequence from starting lord
    const dashaYears = { "Ketu": 7, "Venus": 20, "Sun": 6, "Moon": 10, "Mars": 7, "Rahu": 18, "Jupiter": 16, "Saturn": 19, "Mercury": 17 };
    const order = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];

    let startIndex = order.indexOf(nakInfo.lord);
    if (startIndex === -1) startIndex = 0;

    // Approximate balance at birth
    const pada = data.moon?.nakshatra_pada || 1;
    const fractionElapsed = (pada - 0.5) / 4.0;
    let balanceFirstDasha = (1 - fractionElapsed) * dashaYears[order[startIndex]];

    let accumulatedYears = balanceFirstDasha;
    let currentLordIndex = startIndex;

    if (age <= balanceFirstDasha) {
        return {
            mahadasha: order[startIndex],
            antardasha: order[(startIndex + 1) % 9],
            yearsRemaining: Math.max(1, Math.round(balanceFirstDasha - age))
        };
    }

    currentLordIndex = (currentLordIndex + 1) % 9;
    while (accumulatedYears < age) {
        const span = dashaYears[order[currentLordIndex]];
        if (accumulatedYears + span >= age) {
            const rem = (accumulatedYears + span) - age;
            return {
                mahadasha: order[currentLordIndex],
                antardasha: order[(currentLordIndex + 2) % 9],
                yearsRemaining: Math.max(1, Math.round(rem))
            };
        }
        accumulatedYears += span;
        currentLordIndex = (currentLordIndex + 1) % 9;
    }

    return { mahadasha: "Jupiter", antardasha: "Saturn", yearsRemaining: 4 };
}

// ── Rashifal (Horoscope) Engine ───────────────────────────
function setPeriod(period) {
    currentPeriod = period;
    document.querySelectorAll(".period-pill").forEach(b => b.classList.remove("active"));
    const activeBtn = document.querySelector(`.period-pill[data-period="${period}"]`);
    if (activeBtn) activeBtn.classList.add("active");
}

async function getHoroscope(rashi, el) {
    document.querySelectorAll(".rashi-card").forEach(c => c.classList.remove("active"));
    if (el) el.classList.add("active");

    const readingCard = document.getElementById("horoscopeReading");
    const contentEl = document.getElementById("horoscopeContent");
    const titleEl = document.getElementById("horoscopeReadingTitle");

    readingCard.style.display = "block";
    titleEl.textContent = `🔮 ${currentPeriod.toUpperCase()} Vedic Forecast for ${rashi}`;
    contentEl.innerHTML = `<div class="typing-indicator"><span></span><span></span><span></span></div>`;

    const requestBody = {
        sun_sign: rashi,
        moon_sign: chartData?.moon?.sign || null,
        period: currentPeriod,
        model: document.getElementById("modelSelect").value,
    };

    try {
        const resp = await fetch("/api/horoscope", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
        });

        if (!resp.ok) {
            const errData = await resp.json().catch(() => ({}));
            contentEl.textContent = `⚠️ Error: ${errData.detail || "Failed to generate horoscope."}`;
            return;
        }

        const reader = resp.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let fullText = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
                if (!line.startsWith("data: ")) continue;
                const data = line.slice(6).trim();
                if (data === "[DONE]") continue;

                try {
                    const parsed = JSON.parse(data);
                    if (parsed.content) {
                        fullText += parsed.content;
                        contentEl.innerHTML = renderMarkdown(fullText);
                    }
                } catch (e) {}
            }
        }
    } catch (err) {
        contentEl.textContent = "🙏 Connection error while retrieving horoscope. Please try again.";
    }
}

// ── Milan (Kundli Matching) & Ashtakoot Guna Engine ───────
function autofillPerson1() {
    if (!savedBirthDetails) {
        showToast("Please generate your chart in Chat tab first!", "⚠️");
        return;
    }
    document.getElementById("p1Name").value = savedBirthDetails.name || "";
    const m = String(savedBirthDetails.month).padStart(2, "0");
    const d = String(savedBirthDetails.day).padStart(2, "0");
    document.getElementById("p1Date").value = `${savedBirthDetails.year}-${m}-${d}`;
    const h = String(savedBirthDetails.hour || 12).padStart(2, "0");
    const min = String(savedBirthDetails.minute || 0).padStart(2, "0");
    document.getElementById("p1Time").value = `${h}:${min}`;
    document.getElementById("p1City").value = savedBirthDetails.city || "";
    document.getElementById("p1Nation").value = savedBirthDetails.nation || "IN";
    showToast("Person 1 filled from your profile!", "✨");
}

function calculateAshtakootGuna(p1MoonSign, p1Nakshatra, p2MoonSign, p2Nakshatra) {
    // 8 Kootas: Varna(1), Vashya(2), Tara(3), Yoni(4), Graha Maitri(5), Gana(6), Bhakoot(7), Nadi(8) = 36 Max
    const nak1 = NAKSHATRAS.find(n => n.name.toLowerCase() === (p1Nakshatra || "").toLowerCase()) || NAKSHATRAS[0];
    const nak2 = NAKSHATRAS.find(n => n.name.toLowerCase() === (p2Nakshatra || "").toLowerCase()) || NAKSHATRAS[1];

    let varnaScore = 1;
    let vashyaScore = (p1MoonSign === p2MoonSign) ? 2 : 1.5;
    let taraScore = (nak1.lord === nak2.lord) ? 3 : 2;
    let yoniScore = (nak1.yoni === nak2.yoni) ? 4 : 2.5;
    let grahaMaitriScore = (p1MoonSign === p2MoonSign) ? 5 : 4;
    let ganaScore = (nak1.gana === nak2.gana) ? 6 : (nak1.gana !== "Rakshasa" && nak2.gana !== "Rakshasa" ? 5 : 1);
    let bhakootScore = (p1MoonSign === p2MoonSign) ? 7 : 6;
    let nadiScore = (nak1.nadi !== nak2.nadi) ? 8 : 0; // Nadi dosha if same

    const total = Math.min(36, Math.round(varnaScore + vashyaScore + taraScore + yoniScore + grahaMaitriScore + ganaScore + bhakootScore + nadiScore));

    return {
        total,
        kootas: [
            { name: "1. Varna (Work & Spiritual Ego)", score: varnaScore, max: 1, desc: "Spiritual harmony and vocational temperament." },
            { name: "2. Vashya (Mutual Attraction & Harmony)", score: vashyaScore, max: 2, desc: "Degree of natural magnetism and equality." },
            { name: "3. Tara (Birth Star & Destiny)", score: taraScore, max: 3, desc: "Longevity, health, and mutual auspiciousness." },
            { name: "4. Yoni (Biological & Instinctive Affinity)", score: yoniScore, max: 4, desc: "Physical intimacy, vitality, and genetic nature." },
            { name: "5. Graha Maitri (Mental Harmony & Friendship)", score: grahaMaitriScore, max: 5, desc: "Psychological friendship and planetary rapport." },
            { name: "6. Gana (Temperament & Behavioral Alignment)", score: ganaScore, max: 6, desc: "Deva, Manushya, or Rakshasa constitution harmony." },
            { name: "7. Bhakoot (Emotional Resonance & Prosperity)", score: bhakootScore, max: 7, desc: "Family welfare, emotional bonding, and growth." },
            { name: "8. Nadi (Genetic Health & Spiritual Wavelength)", score: nadiScore, max: 8, desc: nadiScore === 8 ? "Excellent: Different Nadis (No Nadi Dosha)." : "⚠️ Nadi Dosha Detected: Same Nadi (Remedies Advised)." }
        ]
    };
}

async function checkCompatibility(e) {
    e.preventDefault();

    const submitBtn = document.getElementById("milanSubmitBtn");
    const btnText = submitBtn.querySelector(".btn-text");
    const btnLoader = submitBtn.querySelector(".btn-loader");
    btnText.style.display = "none";
    btnLoader.style.display = "inline";
    submitBtn.disabled = true;

    const parseDatetime = (dateId, timeId) => {
        const [y, m, d] = document.getElementById(dateId).value.split("-").map(Number);
        const [h, min] = document.getElementById(timeId).value.split(":").map(Number);
        return { year: y, month: m, day: d, hour: h, minute: min };
    };

    const person1 = {
        name: document.getElementById("p1Name").value.trim(),
        ...parseDatetime("p1Date", "p1Time"),
        city: document.getElementById("p1City").value.trim(),
        nation: document.getElementById("p1Nation").value.trim().toUpperCase(),
    };

    const person2 = {
        name: document.getElementById("p2Name").value.trim(),
        ...parseDatetime("p2Date", "p2Time"),
        city: document.getElementById("p2City").value.trim(),
        nation: document.getElementById("p2Nation").value.trim().toUpperCase(),
    };

    const resultsCard = document.getElementById("compatResults");
    const contentEl = document.getElementById("compatContent");
    resultsCard.style.display = "block";
    contentEl.innerHTML = `<div class="typing-indicator"><span></span><span></span><span></span></div>`;

    try {
        // Step 1: Compute synastry
        const synResp = await fetch("/api/synastry", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ person1, person2 }),
        });

        if (!synResp.ok) {
            const err = await synResp.json().catch(() => ({}));
            throw new Error(err.detail || "Compatibility computation failed.");
        }

        const synData = await synResp.json();
        const p1Chart = synData.person1;
        const p2Chart = synData.person2;

        // Step 2: Compute Ashtakoot 36-Guna Match
        const ashtakoot = calculateAshtakootGuna(
            p1Chart?.moon?.sign, p1Chart?.moon?.nakshatra,
            p2Chart?.moon?.sign, p2Chart?.moon?.nakshatra
        );

        // Update circular score gauge
        const score = ashtakoot.total;
        document.getElementById("milanScoreNum").textContent = score;

        const maxCircumference = 345.57; // 2 * pi * 55
        const offset = maxCircumference - (score / 36.0) * maxCircumference;
        document.getElementById("milanMeterCircle").style.strokeDashoffset = offset;

        // Score verdict
        const verdictTitle = document.getElementById("milanVerdictTitle");
        const verdictDesc = document.getElementById("milanVerdictDesc");
        if (score >= 28) {
            verdictTitle.textContent = "🌟 Uttam Milan (Outstanding Match)";
            verdictTitle.style.color = "var(--accent-emerald)";
            verdictDesc.textContent = "Exceptional astrological harmony across mental, emotional, and physical dimensions. Highly auspicious for marriage and long-term partnership.";
        } else if (score >= 18) {
            verdictTitle.textContent = "✅ Madhyam Milan (Favorable Match)";
            verdictTitle.style.color = "var(--accent-gold)";
            verdictDesc.textContent = "Meets the classical 18-Guna threshold with strong planetary friendship. Mutual communication and understanding will cultivate a fulfilling bond.";
        } else {
            verdictTitle.textContent = "⚠️ Alp Milan (Low Compatibility)";
            verdictTitle.style.color = "var(--accent-rose)";
            verdictDesc.textContent = "Below the traditional 18-Guna threshold. Astrological remedies (Mantra Japa, Daan, or Kumbha Vivaha if Manglik) are recommended.";
        }

        // Manglik analysis
        const p1MarsHouse = p1Chart?.planets?.find(p => p.name === "Mars")?.house || "";
        const p2MarsHouse = p2Chart?.planets?.find(p => p.name === "Mars")?.house || "";
        document.getElementById("manglikDetailsText").innerHTML = `
            <strong>${person1.name}</strong>: Mars in ${p1MarsHouse || "Neutral"} • 
            <strong>${person2.name}</strong>: Mars in ${p2MarsHouse || "Neutral"}.<br>
            <em>${(p1MarsHouse.includes("Seventh") || p2MarsHouse.includes("Seventh")) ? "Kuja Dosha present in 7th house — partner balance and mutual understanding recommended." : "No severe Manglik obstruction detected."}</em>
        `;

        // Render 8 Kootas grid
        const kootasContainer = document.getElementById("kootasGridContainer");
        kootasContainer.innerHTML = ashtakoot.kootas.map(k => `
            <div class="koota-card">
                <div class="koota-title-row">
                    <span class="koota-name">${k.name}</span>
                    <span class="koota-score-pill">${k.score} / ${k.max}</span>
                </div>
                <div class="koota-progress-bar">
                    <div class="koota-progress-fill" style="width: ${(k.score / k.max) * 100}%;"></div>
                </div>
                <div class="koota-desc">${k.desc}</div>
            </div>
        `).join("");

        // Step 3: Stream AI Synastry Reading
        const chatReq = {
            messages: [
                {
                    role: "user",
                    content: `Please provide an in-depth Vedic Kundli Milan (compatibility analysis) for ${person1.name} and ${person2.name}.\n\n` +
                        `• ${person1.name}: Lagna=${p1Chart?.ascendant?.sign}, Moon=${p1Chart?.moon?.sign} (${p1Chart?.moon?.nakshatra})\n` +
                        `• ${person2.name}: Lagna=${p2Chart?.ascendant?.sign}, Moon=${p2Chart?.moon?.sign} (${p2Chart?.moon?.nakshatra})\n` +
                        `• Ashtakoot Score: ${score}/36 Gunas\n\n` +
                        `Please evaluate emotional connection, financial prospects, marriage longevity, and any recommended remedies.`
                }
            ],
            chart_context: p1Chart,
            model: document.getElementById("modelSelect").value,
        };

        const chatResp = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(chatReq),
        });

        if (!chatResp.ok) {
            contentEl.textContent = "Synastry metrics computed above. AI interpretation failed to stream.";
            return;
        }

        const reader = chatResp.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let fullText = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
                if (!line.startsWith("data: ")) continue;
                const data = line.slice(6).trim();
                if (data === "[DONE]") continue;

                try {
                    const parsed = JSON.parse(data);
                    if (parsed.content) {
                        fullText += parsed.content;
                        contentEl.innerHTML = renderMarkdown(fullText);
                    }
                } catch (e) {}
            }
        }
    } catch (err) {
        contentEl.textContent = `⚠️ Error: ${err.message}`;
    } finally {
        btnText.style.display = "inline";
        btnLoader.style.display = "none";
        submitBtn.disabled = false;
    }
}

// ── Ank Jyotish (Numerology) Engine ───────────────────────
function autofillNumerology() {
    if (!savedBirthDetails) {
        showToast("Please generate your chart first!", "⚠️");
        return;
    }
    document.getElementById("numName").value = savedBirthDetails.name || "";
    const m = String(savedBirthDetails.month).padStart(2, "0");
    const d = String(savedBirthDetails.day).padStart(2, "0");
    document.getElementById("numDate").value = `${savedBirthDetails.year}-${m}-${d}`;
    showToast("Profile details loaded!", "✨");
}

function calculateSingleDigit(num) {
    let sum = num;
    while (sum > 9) {
        sum = String(sum).split("").reduce((acc, digit) => acc + Number(digit), 0);
    }
    return sum === 0 ? 9 : sum;
}

function calculateMoolank(day) {
    return calculateSingleDigit(day);
}

function calculateBhagyank(year, month, day) {
    const sumDigits = `${year}${month}${day}`.split("").reduce((acc, d) => acc + Number(d), 0);
    return calculateSingleDigit(sumDigits);
}

function calculateNamank(name) {
    const clean = name.toUpperCase().replace(/[^A-Z]/g, "");
    let total = 0;
    for (let char of clean) {
        total += (CHALDEAN_MAP[char] || 0);
    }
    return calculateSingleDigit(total);
}

async function calculateAndGenerateNumerology() {
    const name = document.getElementById("numName").value.trim();
    const dateVal = document.getElementById("numDate").value;

    if (!name || !dateVal) {
        showToast("Please enter your Full Name and Date of Birth.", "⚠️");
        return;
    }

    const [year, month, day] = dateVal.split("-").map(Number);

    const moolank = calculateMoolank(day);
    const bhagyank = calculateBhagyank(year, month, day);
    const namank = calculateNamank(name);

    const mInfo = NUMEROLOGY_INFO[moolank];
    const bInfo = NUMEROLOGY_INFO[bhagyank];
    const nInfo = NUMEROLOGY_INFO[namank];

    // Show visual summary cards
    document.getElementById("numSummaryGrid").style.display = "grid";
    document.getElementById("moolankOrb").textContent = moolank;
    document.getElementById("moolankRuler").textContent = `Ruler: ${mInfo.ruler}`;

    document.getElementById("bhagyankOrb").textContent = bhagyank;
    document.getElementById("bhagyankRuler").textContent = `Life Path: ${bInfo.ruler}`;

    document.getElementById("namankOrb").textContent = namank;
    document.getElementById("namankRuler").textContent = `Expression: ${nInfo.ruler}`;

    // Attributes matrix
    const attrCard = document.getElementById("numAttributesCard");
    const attrGrid = document.getElementById("numAttributesGrid");
    attrCard.style.display = "block";
    attrGrid.innerHTML = `
        <div class="num-attr-card">
            <div class="attr-label">Primary Element</div>
            <div class="attr-val">${mInfo.element}</div>
        </div>
        <div class="num-attr-card">
            <div class="attr-label">Auspicious Gemstone</div>
            <div class="attr-val">${mInfo.stone}</div>
        </div>
        <div class="num-attr-card">
            <div class="attr-label">Favorable Colors</div>
            <div class="attr-val">${mInfo.colors}</div>
        </div>
        <div class="num-attr-card">
            <div class="attr-label">Auspicious Days</div>
            <div class="attr-val">${mInfo.days}</div>
        </div>
        <div class="num-attr-card">
            <div class="attr-label">Harmonic Numbers</div>
            <div class="attr-val">${mInfo.friends}</div>
        </div>
        <div class="num-attr-card">
            <div class="attr-label">Vedic Deity & Mantra</div>
            <div class="attr-val">${mInfo.deity} (${mInfo.mantra})</div>
        </div>
    `;

    // Stream AI Reading
    const resultCard = document.getElementById("numerologyResultCard");
    const contentEl = document.getElementById("numerologyContent");
    resultCard.style.display = "block";
    contentEl.innerHTML = `<div class="typing-indicator"><span></span><span></span><span></span></div>`;

    const chatReq = {
        messages: [
            {
                role: "system",
                content: "You are an expert Vedic Numerologist (Ank Jyotishi). Synthesize the user's Moolank (Root Number), Bhagyank (Destiny Number), and Namank (Name Vibration) with Vedic astrological wisdom. Cover character strengths, career alignment, relationship harmony, and auspicious remedies."
            },
            {
                role: "user",
                content: `Name: ${name}\nDate of Birth: ${dateVal}\n\nCalculated Numbers:\n• Moolank: ${moolank} (${mInfo.ruler})\n• Bhagyank: ${bhagyank} (${bInfo.ruler})\n• Namank: ${namank} (${nInfo.ruler})\n\nPlease provide my full Ank Jyotish reading.`
            }
        ],
        model: document.getElementById("modelSelect").value,
    };

    try {
        const resp = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(chatReq),
        });

        if (!resp.ok) {
            contentEl.textContent = "Calculated metrics shown above. AI interpretation failed to load.";
            return;
        }

        const reader = resp.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let fullText = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
                if (!line.startsWith("data: ")) continue;
                const data = line.slice(6).trim();
                if (data === "[DONE]") continue;

                try {
                    const parsed = JSON.parse(data);
                    if (parsed.content) {
                        fullText += parsed.content;
                        contentEl.innerHTML = renderMarkdown(fullText);
                    }
                } catch (e) {}
            }
        }
    } catch (e) {
        contentEl.textContent = `Error generating reading: ${e.message}`;
    }
}

// ── Tarot & Vedic Prashna 3D Engine ───────────────────────
function setTarotSpread(spread) {
    currentTarotSpread = spread;
    document.querySelectorAll(".spread-pill").forEach(b => b.classList.remove("active"));
    const btn = document.querySelector(`.spread-pill[data-spread="${spread}"]`);
    if (btn) btn.classList.add("active");
    setupTarotDeck();
}

function setTarotQuery(q) {
    document.getElementById("tarotQuestion").value = q;
}

function setupTarotDeck() {
    selectedTarotCards = [];
    shuffledTarotDeck = [...TAROT_CARDS_DATA].sort(() => Math.random() - 0.5);

    const targetCount = currentTarotSpread === "1card" ? 1 : (currentTarotSpread === "5card" ? 5 : 3);

    const displayEl = document.getElementById("tarotCardsDisplay");
    const instructionsEl = document.getElementById("tarotInstructions");
    const proceedBtnWrap = document.getElementById("proceedTarotBtnWrap");
    const drawnDisplay = document.getElementById("tarotRevealedDrawnDisplay");
    const resultCard = document.getElementById("tarotResultCard");

    resultCard.style.display = "none";
    drawnDisplay.innerHTML = "";
    proceedBtnWrap.style.display = "none";

    instructionsEl.style.display = "block";
    instructionsEl.textContent = `Select ${targetCount} cards from the gilded cosmic fan below (0/${targetCount} selected):`;

    let html = "";
    for (let i = 0; i < 22; i++) {
        html += `
            <div class="tarot-card-fanned" onclick="selectFannedCard(${i}, this)" title="Card #${i + 1}">
                <span>✨</span>
            </div>
        `;
    }
    displayEl.innerHTML = html;
}

function selectFannedCard(index, el) {
    const targetCount = currentTarotSpread === "1card" ? 1 : (currentTarotSpread === "5card" ? 5 : 3);
    if (selectedTarotCards.length >= targetCount || el.classList.contains("selected")) return;

    el.classList.add("selected");
    const isReversed = Math.random() > 0.75; // 25% reversed
    const cardData = shuffledTarotDeck[index % shuffledTarotDeck.length];

    selectedTarotCards.push({
        ...cardData,
        reversed: isReversed
    });

    const instructionsEl = document.getElementById("tarotInstructions");
    instructionsEl.textContent = `Select ${targetCount} cards from the gilded cosmic fan below (${selectedTarotCards.length}/${targetCount} selected):`;

    if (selectedTarotCards.length === targetCount) {
        document.getElementById("proceedTarotBtnWrap").style.display = "block";
        showToast(`${targetCount} cards chosen! Click Reveal below.`, "🃏");
    }
}

async function revealAndReadTarot() {
    const question = document.getElementById("tarotQuestion").value.trim() || "What energies and guidance surround my current life path?";
    const drawnDisplay = document.getElementById("tarotRevealedDrawnDisplay");
    const resultCard = document.getElementById("tarotResultCard");
    const contentEl = document.getElementById("tarotContent");

    document.getElementById("tarotInstructions").style.display = "none";
    document.getElementById("proceedTarotBtnWrap").style.display = "none";

    const slotLabels = {
        "3card": ["1. Past (Purva Sanchita)", "2. Present (Vartamana)", "3. Future (Bhavishya)"],
        "1card": ["Prashna Oracle (Divine Guidance)"],
        "5card": ["1. Agni (Action)", "2. Prithvi (Wealth)", "3. Vayu (Mind)", "4. Jala (Emotions)", "5. Akasha (Destiny)"]
    };

    const slots = slotLabels[currentTarotSpread] || slotLabels["3card"];

    // Render 3D Gilded Cards
    drawnDisplay.innerHTML = selectedTarotCards.map((card, idx) => `
        <div class="gilded-tarot-card" id="drawnCard_${idx}">
            <div class="card-face card-back">
                <div class="card-back-pattern">
                    <span>🕉️</span>
                    <span style="font-size:10px; margin-top:4px; letter-spacing:1px;">JYOTISH</span>
                </div>
            </div>
            <div class="card-face card-front">
                <span class="card-slot-label">${slots[idx] || `Card ${idx + 1}`}</span>
                ${card.image
                    ? `<div class="card-image-frame ${card.reversed ? 'card-reversed' : ''}">
                        <img src="${card.image}" alt="${card.name}" class="card-artwork"
                             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                        <div class="card-symbol-frame" style="display:none;">
                            <span class="card-icon">${card.symbol}</span>
                        </div>
                       </div>`
                    : `<div class="card-symbol-frame">
                        <span class="card-icon">${card.symbol}</span>
                       </div>`
                }
                <div class="card-name-title">${card.name}</div>
                <div class="card-vedic-tag">${card.vedic}</div>
                ${card.reversed ? '<span class="card-status-tag">℞ Reversed</span>' : '<span class="card-status-tag" style="color:var(--accent-emerald); background:rgba(16,185,129,0.1); border-color:rgba(16,185,129,0.3);">✨ Upright</span>'}
            </div>
        </div>
    `).join("");

    // Trigger flip animation with staggered delays
    selectedTarotCards.forEach((_, idx) => {
        setTimeout(() => {
            const cardEl = document.getElementById(`drawnCard_${idx}`);
            if (cardEl) cardEl.classList.add("flipped");
        }, (idx + 1) * 350);
    });

    resultCard.style.display = "block";
    contentEl.innerHTML = `<div class="typing-indicator"><span></span><span></span><span></span></div>`;

    const cardsDescription = selectedTarotCards.map((c, i) => 
        `Position [${slots[i] || i + 1}]: ${c.name} (${c.reversed ? 'Reversed' : 'Upright'}) — Vedic: ${c.vedic}`
    ).join("\n");

    const chatReq = {
        messages: [
            {
                role: "system",
                content: "You are an enlightened Tarot & Vedic Prashna Oracle. Synthesize Tarot archetypes with Vedic astrology (Karmic principles, Grahas, Bhavas, and Remedial Mantras). Deliver a clear, mystical, yet practically grounded reading."
            },
            {
                role: "user",
                content: `Prashna Question: "${question}"\nSpread Type: ${currentTarotSpread}\n\nDrawn Gilded Cards:\n${cardsDescription}\n\nPlease interpret this spread with Vedic synthesis and remedial wisdom.`
            }
        ],
        model: document.getElementById("modelSelect").value,
    };

    const MAX_RETRIES = 3;
    let attempt = 0;

    const doFetch = async () => {
        attempt++;
        contentEl.innerHTML = `<div class="typing-indicator"><span></span><span></span><span></span></div>`;

        let resp;
        try {
            resp = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(chatReq),
            });
        } catch (e) {
            contentEl.innerHTML = `<div style="color:var(--accent-rose);padding:12px;border-radius:8px;background:rgba(244,63,94,0.1);border:1px solid rgba(244,63,94,0.3);">
                ⚠️ Network error: ${e.message}
                <br><button onclick="revealAndReadTarot()" style="margin-top:10px;padding:6px 16px;background:var(--accent-gold);color:#000;border:none;border-radius:20px;cursor:pointer;font-weight:600;">🔄 Retry</button>
            </div>`;
            return;
        }

        if (resp.status === 429) {
            const waitSec = attempt < MAX_RETRIES ? attempt * 5 : null;
            if (waitSec) {
                contentEl.innerHTML = `<div style="color:var(--accent-gold);padding:12px;border-radius:8px;background:rgba(212,175,55,0.1);border:1px solid rgba(212,175,55,0.3);">
                    ⏳ API rate limit reached. Auto-retrying in ${waitSec}s (attempt ${attempt}/${MAX_RETRIES})…
                </div>`;
                await new Promise(r => setTimeout(r, waitSec * 1000));
                return doFetch();
            }
            contentEl.innerHTML = `<div style="color:var(--accent-rose);padding:12px;border-radius:8px;background:rgba(244,63,94,0.1);border:1px solid rgba(244,63,94,0.3);">
                🚦 <strong>API Rate Limit (429)</strong> — The AI model is temporarily overloaded. Please wait a moment and try again.
                <br><small style="opacity:0.7;">Tip: Try switching to a faster model like <em>claude-haiku</em> in the model selector above.</small>
                <br><button onclick="revealAndReadTarot()" style="margin-top:10px;padding:6px 16px;background:var(--accent-gold);color:#000;border:none;border-radius:20px;cursor:pointer;font-weight:600;">🔄 Retry Reading</button>
            </div>`;
            return;
        }

        if (!resp.ok) {
            contentEl.innerHTML = `<div style="color:var(--accent-rose);padding:12px;border-radius:8px;background:rgba(244,63,94,0.1);border:1px solid rgba(244,63,94,0.3);">
                ⚠️ API error ${resp.status} — ${resp.statusText}
                <br><button onclick="revealAndReadTarot()" style="margin-top:10px;padding:6px 16px;background:var(--accent-gold);color:#000;border:none;border-radius:20px;cursor:pointer;font-weight:600;">🔄 Retry</button>
            </div>`;
            return;
        }

        const reader = resp.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let fullText = "";

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split("\n");

                for (const line of lines) {
                    if (!line.startsWith("data: ")) continue;
                    const data = line.slice(6).trim();
                    if (data === "[DONE]") continue;

                    try {
                        const parsed = JSON.parse(data);
                        if (parsed.content) {
                            fullText += parsed.content;
                            contentEl.innerHTML = renderMarkdown(fullText);
                        }
                    } catch (e) {}
                }
            }
        } catch (e) {
            contentEl.innerHTML = `<div style="color:var(--accent-rose);padding:12px;border-radius:8px;background:rgba(244,63,94,0.1);">
                ⚠️ Stream interrupted: ${e.message}
                <br><button onclick="revealAndReadTarot()" style="margin-top:10px;padding:6px 16px;background:var(--accent-gold);color:#000;border:none;border-radius:20px;cursor:pointer;font-weight:600;">🔄 Retry</button>
            </div>`;
        }
    };

    await doFetch();
}

// ── Audio Text-to-Speech & Clipboard Utilities ────────────
function speakText(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const text = el.innerText || el.textContent;
    speakRawText(text);
}

function speakMessage(btn) {
    const body = btn.closest(".message")?.querySelector(".message-body");
    if (!body) return;
    speakRawText(body.innerText || body.textContent);
}

function speakRawText(text) {
    if (!("speechSynthesis" in window)) {
        showToast("Speech synthesis not supported on this browser.", "⚠️");
        return;
    }

    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        showToast("Speech stopped.", "🔇");
        return;
    }

    const clean = text.replace(/[*#_`>]/g, "").slice(0, 1000);
    speechSynthUtterance = new SpeechSynthesisUtterance(clean);
    speechSynthUtterance.rate = 1.0;
    speechSynthUtterance.pitch = 1.05;
    window.speechSynthesis.speak(speechSynthUtterance);
    showToast("Reading aloud...", "🔊");
}

function copyElementText(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const text = el.innerText || el.textContent;
    navigator.clipboard.writeText(text).then(() => {
        showToast("Copied to clipboard!", "📋");
    });
}

function copyMessageText(btn) {
    const body = btn.closest(".message")?.querySelector(".message-body");
    if (!body) return;
    navigator.clipboard.writeText(body.innerText || body.textContent).then(() => {
        showToast("Message copied!", "📋");
    });
}

// ── Toast System ──────────────────────────────────────────
function showToast(message, icon = "✨") {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<span>${icon}</span> <span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3500);
}

// ── Local Storage Management ──────────────────────────────
const _LS_KEY = "jyotish_birth_v2";

function saveBirthDetails(details) {
    try {
        localStorage.setItem(_LS_KEY, JSON.stringify({ ...details, _saved: Date.now() }));
    } catch (e) {}
}

function loadSavedBirthDetails() {
    try {
        const saved = localStorage.getItem(_LS_KEY) || localStorage.getItem("jyotish_birth");
        if (!saved) return;

        const d = JSON.parse(saved);
        savedBirthDetails = d;

        if (d.name) document.getElementById("name").value = d.name;
        if (d.year && d.month && d.day) {
            const m = String(d.month).padStart(2, "0");
            const dd = String(d.day).padStart(2, "0");
            document.getElementById("birthDate").value = `${d.year}-${m}-${dd}`;
        }
        if (d.hour !== undefined && d.minute !== undefined) {
            const h = String(d.hour).padStart(2, "0");
            const min = String(d.minute).padStart(2, "0");
            document.getElementById("birthTime").value = `${h}:${min}`;
        }
        if (d.city) document.getElementById("city").value = d.city;
        if (d.nation) document.getElementById("nation").value = d.nation;

        // Auto calculate chart on load if saved
        if (d.name && d.year && d.city) {
            fetch("/api/chart", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(d),
            })
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (data) {
                    chartData = data;
                    updateUserProfileHeader(data);
                    renderKundli(data);
                }
            })
            .catch(() => {});
        }
    } catch (e) {}
}

// ── Utilities & Markdown Sanitization ─────────────────────
function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

function renderMarkdown(text) {
    if (typeof marked !== "undefined" && typeof DOMPurify !== "undefined") {
        return DOMPurify.sanitize(marked.parse(text));
    }
    if (typeof marked !== "undefined") {
        return marked.parse(text);
    }
    return escapeHtml(text).replace(/\n/g, "<br>");
}
