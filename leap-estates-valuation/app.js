import { MATTERS, OTHER_MATTERS, SERVICE_CATALOGUE, MATTER_SERVICES, PRESENT_DAY } from "./fixtures.js?v=20260915m";
import {
    instantValuationPlan,
    refineValuationCall,
    fullValuationCall,
    saleOfEstatePlan,
    serviceQuoteCall,
    serviceInstructCall,
    BASE_URL,
    AUTH_HEADER
} from "./api.js?v=20260915m";
import { guidePage } from "./guide.js?v=20260915m";
import { reportPage } from "./report.js?v=20260915m";
import { icon, leapMark, sailMark } from "./icons.js?v=20260915m";
import {
    poundsFromPence,
    longDate,
    shortDate,
    deceasedName,
    fullAddress,
    coOwnership,
    charges,
    restrictions,
    owners,
    tenure,
    valuation,
    subjectFacts,
    findingsBySentiment,
    checksSummary,
    otherAssetsTotalPence,
    debtsTotalPence,
    chargeDebtRows,
    estateCalculation,
    taxExposure,
    submissionForms,
    serviceRows,
    servicesSummary,
    lossOnSale
} from "./derive.js?v=20260915m";

const root = document.getElementById("app");
const drawerRoot = document.getElementById("api-panel");

const SAIL_DOCS_URL = "../sail-api-docs/";

// ?embed=1 strips the prototype's own chrome so the concept can be dropped straight into a deck
// slide as a live frame. Everything else behaves identically — it is the same running app, not a
// cut-down copy, so anything driveable here is driveable there.
const IS_EMBED = new URLSearchParams(window.location.search).has("embed");

if (IS_EMBED) document.body.classList.add("is-embed");

// Renders immediately before the button it points at, so it travels with whatever the next action
// happens to be rather than being positioned against the frame.
function coach(label) {
    if (!IS_EMBED) return "";
    return `<span class="coach-tip">${escapeHtml(label)}<span class="coach-arrow">${icon("arrowRight", 13, 2)}</span></span>`;
}

function coached() {
    return IS_EMBED ? " is-coached" : "";
}

// Named per screen, because "this is a demo" is a weaker instruction than the one thing the
// viewer is supposed to do on the screen in front of them.
const DEMO_INSTRUCTION = {
    properties: "This screen is live &mdash; <strong>press the ringed button</strong>",
    services: "This screen is live &mdash; <strong>follow the two markers</strong>",
    report: "This is the real document &mdash; <strong>scroll it</strong>"
};

function demoBanner(key) {
    if (!IS_EMBED) return "";
    const instruction = DEMO_INSTRUCTION[key] || "This screen is live &mdash; <strong>it is clickable</strong>";
    return `<div class="demo-banner"><span class="demo-banner-dot"></span>${instruction}</div>`;
}

// ---------------------------------------------------------------------------------------
// The Estate Administration tree
// ---------------------------------------------------------------------------------------

// LEAP's own left-hand tree, in their order. `Properties` is where the practitioner is going and
// where the address already is; `Calculations` and `Submission forms` are what a property figure
// unblocks. The pages that are not driveable are still listed, because a tree with four items in
// it would not look like their software.
const TREE = [
    {
        group: "Deceased information",
        items: [
            { id: "deceased", label: "About the deceased", icon: "person" },
            { id: "will", label: "Will details", icon: "scroll" }
        ]
    },
    {
        group: "Assets",
        items: [
            { id: "properties", label: "Properties", icon: "building" },
            { id: "services", label: "Property services", icon: "tools" },
            { id: "financials", label: "Financials", icon: "coins" },
            { id: "gifts", label: "Gifts and transfer values", icon: "gift" },
            { id: "household", label: "Household and personal goods", icon: "sofa" },
            { id: "stocks", label: "Stocks and shares", icon: "chart" },
            { id: "assurance", label: "Life assurance and annuities", icon: "shield" },
            { id: "pensions", label: "Pensions", icon: "piggy" },
            { id: "business", label: "Business/ partnership interests", icon: "briefcase" }
        ]
    },
    {
        group: "Liabilities",
        items: [{ id: "debts", label: "Debts", icon: "minus" }]
    },
    {
        group: "Tax",
        items: [
            { id: "calculations", label: "Calculations", icon: "calculator" },
            { id: "forms", label: "Submission forms", icon: "forms" }
        ]
    }
];

// The pages this prototype actually renders. Everything else in the tree opens a "not in this
// prototype" note rather than a blank panel, which is more honest than a dead click.
const DRIVEABLE = new Set(["deceased", "properties", "services", "debts", "calculations", "forms"]);

const TAB_STRIP = [
    "Details & Correspondence",
    "Calendar & Tasks",
    "Financial Summary",
    "Time & Fees",
    "Office Accounting",
    "Client Funds",
    "Registers"
];

// ---------------------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------------------

// Valuation state is keyed by matter, never held as a top-level flag. With two matters a shared
// flag would mean valuing one visibly "values" the other — the kind of thing that only shows up in
// front of the audience.
const freshValuation = () => ({ phase: "idle", instant: null, refined: false, full: null, ordering: false });
const freshSale = () => ({ phase: "idle", quote: null, instruct: null });

const state = {
    screen: "matter",
    matterId: "adeyemi",
    page: "properties",
    addressDraft: "",
    addressError: null,
    addressEditing: false,
    toast: "",
    progress: null,
    linkedKey: null,
    modal: null,
    apiPanel: { open: false, entries: [], expanded: new Set() },
    valuations: { hollis: freshValuation(), adeyemi: freshValuation() },
    sales: { hollis: freshSale(), adeyemi: freshSale() },
    // Services ordered on this screen, keyed by matter then by service id. Seeded state lives in
    // MATTER_SERVICES and is merged underneath, so ordering something never rewrites the fixture.
    services: { hollis: {}, adeyemi: {} },
    servicePending: null,
    // Which of the two billing routes the practitioner has picked. Deferring to completion is only
    // available where Sail is marketing the property, so the screen has to ask rather than assume.
    billing: { hollis: "job", adeyemi: "completion" }
};

// A selector, not the node itself: closing the modal re-renders #app, so the element that opened it
// no longer exists and focusing the stale node would silently drop focus to <body>.
let returnFocusTo = null;
let modalJustOpened = false;

function currentMatter() {
    return MATTERS[state.matterId];
}

function currentInstant() {
    const valuationState = state.valuations[state.matterId];
    if (!valuationState.instant) return null;
    return valuationState.refined ? currentMatter().api.instantRefined : valuationState.instant;
}

function currentTitleCheck() {
    const valuationState = state.valuations[state.matterId];
    return valuationState.full ? valuationState.full.title_check : null;
}

// The calculation every page below the Properties card depends on. Null until there is a figure,
// which is exactly the state the practitioner is stuck in today.
// Seeded state merged with whatever has been ordered on this screen. Never the fixture alone,
// or pressing a button would appear to do nothing.
function currentServices() {
    return serviceRows(SERVICE_CATALOGUE, MATTER_SERVICES[state.matterId] || {}, state.services[state.matterId] || {});
}

function currentCalculation() {
    const instant = currentInstant();
    if (!instant || instant.status !== "COMPLETED") return null;
    return estateCalculation(currentMatter(), instant.prices.market_price_pence, currentTitleCheck());
}

// ---------------------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------------------

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

// Tokenise a line of JSON, escaping as we go. The order matters: escaping the whole line first
// would turn every `"` into `&quot;` and the string patterns below would stop matching, leaving
// flat text with only punctuation coloured. So we match on the raw line and escape each piece as it
// is emitted — including the gaps between matches, so nothing reaches innerHTML unescaped.
function highlightLine(line) {
    const tokens = /("(?:[^"\\]|\\.)*")(\s*:)|("(?:[^"\\]|\\.)*")|\b(true|false)\b|\b(null)\b|(-?\d+(?:\.\d+)?)|([{}[\],])/g;
    let out = "";
    let cursor = 0;
    let match;

    while ((match = tokens.exec(line)) !== null) {
        const [whole, keyStr, colon, str, bool, nul, num, punct] = match;
        out += escapeHtml(line.slice(cursor, match.index));

        if (keyStr) out += `<span class="tok-key">${escapeHtml(keyStr)}</span><span class="tok-punct">${escapeHtml(colon)}</span>`;
        else if (str) out += `<span class="tok-string">${escapeHtml(str)}</span>`;
        else if (bool) out += `<span class="tok-bool">${escapeHtml(bool)}</span>`;
        else if (nul) out += `<span class="tok-null">${escapeHtml(nul)}</span>`;
        else if (num) out += `<span class="tok-number">${escapeHtml(num)}</span>`;
        else if (punct) out += `<span class="tok-punct">${escapeHtml(punct)}</span>`;
        else out += escapeHtml(whole);

        cursor = match.index + whole.length;
    }

    return out + escapeHtml(line.slice(cursor));
}

// Renders JSON one <span> per line, each carrying its key and depth so the panel can highlight the
// exact block a figure on screen came from.
function highlightJson(value) {
    return JSON.stringify(value, null, 2)
        .split("\n")
        .map((line) => {
            const depth = Math.floor((line.length - line.trimStart().length) / 2);
            const keyMatch = line.match(/^\s*"([^"]+)"\s*:/);
            const key = keyMatch ? keyMatch[1] : "";
            const body = highlightLine(line);
            return `<span class="json-line" data-key="${escapeHtml(key)}" data-depth="${depth}">${body || "&nbsp;"}</span>`;
        })
        .join("");
}

// ---------------------------------------------------------------------------------------
// Prototype chrome — the bits that are not pretending to be theirs
// ---------------------------------------------------------------------------------------

const DEMO_TABS = [
    ["matter", "1. Estate Administration"],
    ["sale", "2. The Sale of Estate matter"],
    ["guide", "3. How to integrate it"]
];

function demoNav() {
    return `<nav class="demo-nav" aria-label="Prototype">
        <span class="demo-nav-label">LEAP × Sail — concept</span>
        <div class="demo-nav-items">
            ${DEMO_TABS.map(
                ([value, label]) => `<button type="button" data-screen="${value}" class="${state.screen === value ? "active" : ""}">${label}</button>`
            ).join("")}
            <a href="${SAIL_DOCS_URL}" target="_blank" rel="noreferrer">Sail API docs ${icon("arrowUpRight", 12)}</a>
        </div>
        <div class="demo-nav-right">
            <div class="matter-switch" role="group" aria-label="Matter">
                ${Object.values(MATTERS)
                    .map(
                        (matter) => `<button type="button" data-matter="${matter.id}" class="${matter.id === state.matterId ? "active" : ""}">${escapeHtml(matter.deceased.lastName)}</button>`
                    )
                    .join("")}
            </div>
            <button type="button" class="api-toggle" data-action="toggle-api" aria-expanded="${state.apiPanel.open}" aria-controls="api-panel">
                ${sailMark()} Show the API${state.apiPanel.entries.length ? `<span class="count">${state.apiPanel.entries.length}</span>` : ""}
            </button>
        </div>
    </nav>`;
}

function disclaimer() {
    return `<p class="demo-disclaimer">A <strong>concept built by Sail</strong> — not a LEAP product. The chrome, the Estate Administration tree and the matter numbering are drawn from LEAP's own published screens; everything inside them is invented. Every person, address, title number, matter and figure is fictional. LEAP's brand fonts are not publicly licensed, so system faces stand in.</p>`;
}

// ---------------------------------------------------------------------------------------
// LEAP's chrome
// ---------------------------------------------------------------------------------------

function windowControls() {
    return `<span class="win-controls">
        <button type="button" data-action="inert" aria-label="Minimise">${icon("minimise", 13, 1.4)}</button>
        <button type="button" data-action="inert" aria-label="Maximise">${icon("maximise", 12, 1.4)}</button>
        <button type="button" data-action="inert" aria-label="Close">${icon("close", 13, 1.4)}</button>
    </span>`;
}

function appChrome() {
    const matter = currentMatter();

    return `<div class="app-titlebar">
            <span class="titlebar-left">
                <button type="button" class="chrome-button" data-action="inert">${icon("menu", 14, 1.6)} Menu</button>
                <button type="button" class="chrome-icon" data-action="inert" aria-label="Print">${icon("print", 14, 1.4)}</button>
                <button type="button" class="chrome-icon" data-action="inert" aria-label="Refresh">${icon("refresh", 14, 1.4)}</button>
                <button type="button" class="chrome-icon" data-action="inert" aria-label="Email">${icon("mail", 14, 1.4)}</button>
            </span>
            <span class="titlebar-title">Matter List — ${OTHER_MATTERS.length + 2} Matters</span>
            <span class="titlebar-right">
                <span class="chrome-user">${escapeHtml(matter.feeEarner.firstName)} ${escapeHtml(matter.feeEarner.lastName)}</span>
                <button type="button" class="chrome-icon" data-action="inert" aria-label="Notifications">${icon("bell", 14, 1.4)}</button>
                <button type="button" class="chrome-icon" data-action="inert" aria-label="More">${icon("ellipsis", 14, 1.4)}</button>
                <button type="button" class="chrome-icon" data-action="inert" aria-label="Help">${icon("help", 14, 1.4)}</button>
                ${windowControls()}
            </span>
        </div>
        <div class="app-toolbar">
            ${leapMark(26)}
            <span class="toolbar-search">${icon("search", 14, 1.5)} Search matters</span>
            <span class="toolbar-link">Advanced Search</span>
            <span class="toolbar-actions">
                <button type="button" class="leap-button leap-button--primary" data-action="inert">New Matter ${icon("caret", 12, 1.6)}</button>
                <button type="button" class="leap-button" data-action="inert">${icon("filter", 12, 1.5)} Current Matters ${icon("caret", 12, 1.6)}</button>
            </span>
        </div>`;
}

// The matter list sits behind the open windows, exactly as it does in their screens. It is not
// driveable — its job is to make the two windows in front of it read as windows.
function matterListBackdrop() {
    const rows = [
        ...Object.values(MATTERS).map((matter) => ({
            number: matter.number,
            description: matter.description,
            type: matter.matterType,
            updated: "Today",
            active: matter.id === state.matterId
        })),
        ...OTHER_MATTERS
    ];

    return `<table class="matter-list" aria-hidden="true">
        <thead><tr><th>No.</th><th>Description</th><th>Type</th><th>Updated</th></tr></thead>
        <tbody>
            ${rows
                .map(
                    (row) => `<tr class="${row.active ? "is-active" : ""}">
                        <td>${escapeHtml(row.number)}</td>
                        <td>${escapeHtml(row.description)}</td>
                        <td>${escapeHtml(row.type)}</td>
                        <td>${escapeHtml(row.updated)}</td>
                    </tr>`
                )
                .join("")}
        </tbody>
    </table>`;
}

function matterWindow(inner) {
    const matter = currentMatter();

    return `<section class="leap-window leap-window--matter">
        <div class="window-titlebar">
            <span class="window-nav">
                <button type="button" class="chrome-icon" data-action="inert" aria-label="Back">${icon("chevronLeft", 12, 1.6)}</button>
                <button type="button" class="chrome-icon" data-action="inert" aria-label="Forward">${icon("chevronRight", 12, 1.6)}</button>
            </span>
            <span class="window-title">${escapeHtml(matter.number)} ${escapeHtml(matter.description)}</span>
            ${windowControls()}
        </div>
        <div class="window-tabs" role="tablist">
            ${TAB_STRIP.map(
                (tab, index) => `<button type="button" class="${index === 0 ? "active" : ""}" role="tab" aria-selected="${index === 0}" ${index === 0 ? "" : 'data-action="inert"'}>${tab}</button>`
            ).join("")}
        </div>
        ${inner}
    </section>`;
}

// ---------------------------------------------------------------------------------------
// The Estate Administration window
// ---------------------------------------------------------------------------------------

// Pages that gain something once the property has a figure carry a badge in the tree. Before the
// valuation runs, three of them read "Blocked" — which is the practitioner's actual Tuesday.
function treeBadge(id) {
    const calculation = currentCalculation();
    if (id === "properties") {
        return currentInstant() ? `<span class="tree-badge tree-badge--done">${icon("check", 10, 2.2)}</span>` : `<span class="tree-badge tree-badge--wait">1</span>`;
    }
    if (id === "calculations" || id === "forms") {
        return calculation ? `<span class="tree-badge tree-badge--done">${icon("check", 10, 2.2)}</span>` : `<span class="tree-badge tree-badge--blocked" title="Needs a property value">!</span>`;
    }
    if (id === "services") {
        const live = currentServices().filter((row) => row.status === "instructed" || row.status === "quoted").length;
        return live > 0 ? `<span class="tree-badge tree-badge--new">${live}</span>` : "";
    }
    if (id === "debts") {
        const fromTitle = chargeDebtRows(currentTitleCheck()).length;
        return fromTitle > 0 ? `<span class="tree-badge tree-badge--new">+${fromTitle}</span>` : "";
    }
    return "";
}

function estateTree() {
    return `<nav class="ea-tree" aria-label="Estate administration">
        ${TREE.map(
            (section) => `<div class="tree-group">
                <button type="button" class="tree-group-head" data-action="inert">${icon("caret", 12, 1.7)} ${escapeHtml(section.group)}</button>
                ${section.items
                    .map(
                        (item) => `<button type="button" class="tree-item ${item.id === state.page ? "active" : ""} ${DRIVEABLE.has(item.id) ? "" : "tree-item--inert"}" data-page="${item.id}">
                            <span class="tree-icon">${icon(item.icon, 15, 1.4)}</span>
                            <span class="tree-label">${escapeHtml(item.label)}</span>
                            ${treeBadge(item.id)}
                        </button>`
                    )
                    .join("")}
            </div>`
        ).join("")}
    </nav>`;
}

function panelHeading(text) {
    return `<h2 class="panel-heading">${escapeHtml(text)}</h2>`;
}

function field(label, value, options) {
    const wide = options && options.wide;
    return `<div class="ea-field ${wide ? "ea-field--wide" : ""}">
        <span class="ea-label">${escapeHtml(label)}</span>
        <span class="ea-input ${options && options.readOnly ? "ea-input--readonly" : ""}">${escapeHtml(value ?? "")}</span>
    </div>`;
}

function yesNo(label, isYes) {
    return `<div class="ea-check">
        <span class="ea-check-label">${escapeHtml(label)}</span>
        <span class="ea-check-boxes">
            <span class="ea-box ${isYes ? "checked" : ""}">${isYes ? icon("check", 10, 2.6) : ""}</span> Yes
            <span class="ea-box ${isYes ? "" : "checked"}">${isYes ? "" : icon("check", 10, 2.6)}</span> No
        </span>
    </div>`;
}

// Step 1 of their curriculum, and the reason the pitch is a button rather than a form: the address
// the valuation needs is already sitting in this panel, under a question that asks whether the
// deceased owned it.
function pageDeceased() {
    const matter = currentMatter();
    const { deceased } = matter;

    return `${panelHeading("About the deceased")}
        <div class="ea-grid">
            ${field("Date of application", shortDate(deceased.dateOfApplication))}
            ${field("Date of death", shortDate(deceased.dateOfDeath))}
            ${field(`${deceased.firstName}'s domicile at date of death`, deceased.domicile)}
            ${field("IHT reference no.", "—")}
            ${field("Marital status at death", deceased.maritalStatus)}
            ${field("Date of marriage / civil partnership", "—")}
        </div>

        ${yesNo(`Did ${deceased.firstName} leave a will?`, deceased.leftWill)}

        <div class="ea-check">
            <span class="ea-check-label">Are there relatives that survived ${escapeHtml(deceased.firstName)}?</span>
            <span class="ea-survivors">
                <span class="ea-box ${deceased.survivedBy.spouse ? "checked" : ""}">${deceased.survivedBy.spouse ? icon("check", 10, 2.6) : ""}</span> Spouse or civil partner
                <span class="ea-box ${deceased.survivedBy.siblings ? "checked" : ""}">${deceased.survivedBy.siblings ? icon("check", 10, 2.6) : ""}</span> Brothers or sisters
                <span class="ea-box checked">${icon("check", 10, 2.6)}</span> Children <span class="ea-count">${deceased.survivedBy.children}</span>
                <span class="ea-box ${deceased.survivedBy.parents ? "checked" : ""}">${deceased.survivedBy.parents ? icon("check", 10, 2.6) : ""}</span> Parents
                <span class="ea-box checked">${icon("check", 10, 2.6)}</span> Grandchildren <span class="ea-count">${deceased.survivedBy.grandchildren}</span>
            </span>
        </div>

        <div class="ea-address" data-link-key="address_line_1">
            <span class="ea-label">Last known permanent address</span>
            <div class="ea-textarea">${escapeHtml(deceased.lastKnownAddress.line1)}<br />${escapeHtml(deceased.lastKnownAddress.town)}<br /><br />${escapeHtml(deceased.lastKnownAddress.postcode)}</div>
        </div>

        ${yesNo(`Was the property above owned / part-owned by ${deceased.firstName}?`, deceased.ownedTheAboveProperty)}
        ${yesNo(`Did anyone act under a power of attorney granted during ${deceased.firstName}'s lifetime?`, false)}

        <p class="ea-note">${sailMark(12)} <span>Every field the valuation request needs is on this page, three steps before the practitioner reaches Assets. That is the whole pitch: <strong>it is a button, not a data-entry ask.</strong></span></p>`;
}

// ---------------------------------------------------------------------------------------
// Assets → Properties: the screen this whole prototype exists for
// ---------------------------------------------------------------------------------------

function propertyRow() {
    const matter = currentMatter();
    const instant = currentInstant();
    const titleCheck = currentTitleCheck();
    const val = valuation(instant);
    const co = titleCheck ? coOwnership(titleCheck) : null;
    const calculation = currentCalculation();

    const ownershipCell = co
        ? `<span class="from-title">${escapeHtml(co.headline)}${co.estateShare < 100 ? ` · ${co.estateShare}%` : ""}</span>`
        : `<span class="cell-empty">Not known</span>`;

    const valueCell = val
        ? `<span data-link-key="prices">${escapeHtml(val.headline)}</span>`
        : `<span class="cell-empty">Required for IHT400</span>`;

    const shareCell = calculation ? poundsFromPence(calculation.propertyPence) : "—";

    return `<tr class="is-selected">
        <td>${escapeHtml(fullAddress(matter))}</td>
        <td>${ownershipCell}</td>
        <td class="num">${valueCell}</td>
        <td class="num">${shareCell}</td>
        <td>${val ? `<span class="source-pill">${sailMark(10)} Sail</span>` : `<span class="cell-empty">—</span>`}</td>
    </tr>`;
}

function valuationStages() {
    const progress = state.progress;
    if (!progress) return "";
    return `<div class="stages" role="status" aria-live="polite">
        ${progress.stages
            .map((stage, index) => {
                const status = index < progress.index ? "done" : index === progress.index ? "active" : "";
                const label = status === "done" ? stage.done : stage.stage;
                return `<div class="stage ${status}"><span class="stage-marker">${status === "done" ? icon("check", 10, 2.4) : ""}</span>${escapeHtml(label)}${status === "done" ? "" : "…"}</div>`;
            })
            .join("")}
    </div>`;
}

// The invitation to narrow the estimate. It has to be an invitation and not a statement, because
// the practitioner has NOT asked the executor anything yet — copy that reads like we already hold
// the answers is worse than no copy at all. So it is derived from `subject.*.source`: the response
// tells us which facts we looked up and which came off the matter, and the sentence follows.
function refinePrompt(instant) {
    const supplied = subjectFacts(instant).filter((fact) => fact.source === "client_supplied").length;

    const copy =
        supplied === 0
            ? "Nothing about the building was on the matter, so this ran on looked-up data alone. Bedrooms and condition are what move it most."
            : "This used the details already on the matter. Correct any of them and the range narrows.";

    return `<div class="side-refine">
        <p>${copy}</p>
        <button type="button" class="leap-button side-card-action" data-action="open-refine">Add what the executor tells you</button>
    </div>`;
}

// Actions in LEAP hang off sidebar cards, not hero buttons. This card is where the whole
// integration lives, and it has exactly two states worth designing: get a figure, then upgrade it.
function sailCard() {
    const matter = currentMatter();
    const valuationState = state.valuations[matter.id];
    const instant = currentInstant();
    const val = valuation(instant);
    const exposure = taxExposure(matter, instant, currentTitleCheck());

    if (valuationState.phase === "requesting") {
        return `<aside class="side-card side-card--sail">
            <div class="side-card-head">${sailMark(13)} Sail Homes</div>
            <div class="side-card-body">${valuationStages()}</div>
        </aside>`;
    }

    const ordering = valuationState.ordering;
    const booked = Boolean(valuationState.full);
    const today = PRESENT_DAY[matter.id];

    // The full valuation leads. A practitioner wants the figure they can file, and offering the
    // automated estimate first invites them to put a number on an IHT400 that was never meant for
    // one. The estimate stays available underneath for anyone who just wants to know today whether
    // the estate is even taxable.
    if (!instant && !booked) {
        return `<aside class="side-card side-card--sail">
            <div class="side-card-head">${sailMark(13)} Sail Homes</div>
            <div class="side-card-body">
                <p class="side-card-lede">Value this property <strong>as at the date of death</strong>. Free to the estate.</p>
                ${
                    ordering
                        ? `<p class="side-upgrade-wait">Reading the title register…</p>`
                        : `${coach("Press this")}<button type="button" class="leap-button leap-button--primary side-card-action${coached()}" data-action="order-full">Get an HMRC-compliant valuation</button>
                            <p class="side-card-note">A valuer visits and writes it up, in three to four days. The registered title comes back straight away.</p>
                            <div class="side-alt">
                                <button type="button" class="leap-button side-card-action" data-action="run-instant">Get an estimate instead</button>
                                <p class="side-card-note">Automated, back in about a second. Enough to see whether the estate is taxable — not a figure to file.</p>
                            </div>`
                }
            </div>
        </aside>`;
    }

    // Booked without an estimate: the valuer is on the way, and the practitioner can still take a
    // number today if they want one.
    if (!instant) {
        return `<aside class="side-card side-card--sail">
            <div class="side-card-head">${sailMark(13)} Sail Homes</div>
            <div class="side-card-body">
                <div class="side-booked">
                    ${icon("check", 12, 2.2)} <strong>Valuation booked.</strong> A valuer will call ${escapeHtml(matter.client.firstName)} within one working day, and the written valuation follows in three to four days.
                </div>
                <button type="button" class="leap-button side-card-action side-report-link" data-screen="report">See the report it produces</button>
                <div class="side-alt">
                    ${coach("Or try this")}<button type="button" class="leap-button side-card-action${coached()}" data-action="run-instant">Get an estimate in the meantime</button>
                    <p class="side-card-note">Automated, back in about a second. Enough to see whether the estate is taxable.</p>
                </div>
            </div>
        </aside>`;
    }


    return `<aside class="side-card side-card--sail">
        <div class="side-card-head">${sailMark(13)} Sail Homes</div>
        <div class="side-card-body">
            <div class="side-figure side-figure--lead" data-link-key="prices">
                <span class="side-figure-label">Value at date of death</span>
                <strong>${escapeHtml(val.headline)}</strong>
                <span class="side-figure-range">${escapeHtml(shortDate(matter.deceased.dateOfDeath))} · the figure for the IHT400</span>
            </div>

            <div class="side-figure">
                <span class="side-figure-label">Marketing price today</span>
                <strong>${escapeHtml(poundsFromPence(today.market_price_pence))}</strong>
                <span class="side-figure-range">Likely to achieve ${escapeHtml(poundsFromPence(today.to_achieve_pence))}</span>
            </div>

            <div class="side-upgrade">
                <span class="side-upgrade-head">The valuation you can file</span>
                ${
                    booked
                        ? `<p class="side-upgrade-done">${icon("check", 12, 2.2)} Booked. <strong>A valuer will call ${escapeHtml(matter.client.firstName)} within one working day.</strong></p>
                            <button type="button" class="leap-button side-card-action side-report-link" data-screen="report">See the report it produces</button>`
                        : ordering
                          ? `<p class="side-upgrade-wait">Reading the title register…</p>`
                          : `<p class="side-upgrade-copy">A valuer visits and writes it up, in three to four days. <strong>It's free to the estate</strong>, and the register comes back with it.</p>
                            <button type="button" class="leap-button leap-button--primary side-card-action" data-action="order-full">Get an HMRC-compliant valuation</button>`
                }
            </div>
        </div>
    </aside>`;
}

function tile({ label, value, consequence, tone, linkKey }) {
    const toneClass = tone === "clear" ? "tile--clear" : tone === "attention" ? "tile--attention" : "";
    return `<div class="tile ${toneClass}" data-link-key="${linkKey || ""}">
        <span class="tile-label">${escapeHtml(label)}</span>
        <span class="tile-value">${escapeHtml(value)}</span>
        <span class="tile-consequence">${escapeHtml(consequence)}</span>
    </div>`;
}

// What the practitioner has just set in motion. It runs across the panel rather than down the
// sidebar because it is the answer to "so what have I just committed my client to?", and that
// question deserves the width. The closing line is the whole reason to press the button.
function whatHappensNext(matter) {
    const client = escapeHtml(matter.client.firstName);

    const steps = [
        ["We call", `We ring ${client} within one working day and book a time that suits.`],
        ["We visit", "A local valuer looks round the property and photographs it. Under an hour."],
        ["We write it up", `A full valuation as at ${escapeHtml(longDate(matter.deceased.dateOfDeath))}, with the sales it is built on.`],
        ["It lands here", `Sent to you and to ${client}. Nothing for you to chase.`]
    ];

    return `<div class="next-block">
        <h3 class="next-heading">What happens now</h3>
        <ol class="next-steps">
            ${steps
                .map(
                    ([title, copy], index) => `<li>
                        <span class="next-number">${index + 1}</span>
                        <div><strong>${escapeHtml(title)}</strong><p>${copy}</p></div>
                    </li>`
                )
                .join("")}
        </ol>
        <p class="next-close"><strong>If HMRC asks how you reached the figure, the answer is in the report.</strong> That is the difference between a number on a form and a number you can stand behind.</p>
    </div>`;
}




function titleCheckBlock() {
    const titleCheck = currentTitleCheck();
    if (!titleCheck) return "";

    const matter = currentMatter();
    const co = coOwnership(titleCheck);
    const ch = charges(titleCheck);
    const re = restrictions(titleCheck);
    const ow = owners(titleCheck);
    const checks = checksSummary(titleCheck);
    const findings = findingsBySentiment(titleCheck);
    const needsAction = findings.filter((finding) => finding.sentiment === "negative").length;

    // Counted from the tiles themselves rather than hardcoded, so a clean title says so instead of
    // claiming a finding it does not have.
    const material = [co, ch, re].filter((part) => part.tone === "attention").length;
    const summary = material === 0
        ? "Nothing on the Land Registry title changes this estate"
        : `${material} thing${material === 1 ? "" : "s"} on the Land Registry title affect${material === 1 ? "s" : ""} this estate`;

    return `<div class="title-result">
        ${whatHappensNext(matter)}

        <details class="title-fold" data-disclosure="title"${state.apiPanel.expanded.has("title") ? " open" : ""}>
            <summary>
                <span class="title-fold-lead">${escapeHtml(summary)}</span>
                <span class="checks-run ${checks.raised > 0 ? "has-raised" : ""}">${checks.run} checks run · ${checks.raised > 0 ? `${checks.raised} to look at` : "all clear"}</span>
                <span class="title-fold-chevron">${icon("caret", 14, 1.8)}</span>
            </summary>

        <div class="title-head">
            <h3>Registered title ${escapeHtml(titleCheck.title_number)} · ${escapeHtml(tenure(titleCheck))}</h3>
        </div>
        <p class="title-basis">${escapeHtml(co.basis)}</p>
        <div class="tiles">
            ${tile({ label: "Registered proprietors", value: ow.headline, consequence: ow.consequence, tone: "neutral", linkKey: "proprietors" })}
            ${tile({ label: "How it was held", value: co.headline, consequence: co.consequence, tone: co.tone, linkKey: "has_form_a_restriction" })}
            ${tile({ label: "Charges", value: ch.headline, consequence: ch.consequence, tone: ch.tone, linkKey: "has_charge" })}
            ${tile({ label: "Restrictions", value: re.headline, consequence: re.consequence, tone: re.tone, linkKey: "entries" })}
        </div>

        ${
            co.shareIsAssumed && co.estateShare < 100
                ? `<p class="assumption">${icon("warning", 14, 1.7)} <span><strong>${co.estateShare}% is an assumption, not a fact from the register.</strong> A Form A restriction records that the property was held in common; it does not record the shares. Check the declaration of trust or the transfer before the IHT404 goes anywhere.</span></p>`
                : ""
        }

        <details class="disclosure" data-disclosure="findings"${state.apiPanel.expanded.has("findings") ? " open" : ""}>
            <summary>Findings <span class="summary-provenance">${findings.length} findings${needsAction > 0 ? ` · ${needsAction} need${needsAction === 1 ? "s" : ""} action` : " · nothing needing action"}</span></summary>
            <div class="findings">
                ${findings
                    .map(
                        (finding) => `<div class="finding finding--${finding.sentiment}">
                            <span class="finding-mark" aria-hidden="true"></span>
                            <span><span class="finding-category">${escapeHtml(finding.category)}</span>${escapeHtml(finding.text)}</span>
                        </div>`
                    )
                    .join("")}
            </div>
        </details>

        <details class="disclosure" data-disclosure="register"${state.apiPanel.expanded.has("register") ? " open" : ""}>
            <summary>Register entries <span class="summary-provenance">${titleCheck.entries.length} entries · HM Land Registry</span></summary>
            <div class="register-group">
                ${[
                    ["A", "Property Register"],
                    ["B", "Proprietorship Register"],
                    ["C", "Charges Register"]
                ]
                    .map(([code, name]) => {
                        const entries = titleCheck.entries.filter((entry) => entry.sub_register === code);
                        if (entries.length === 0) {
                            return `<h4>${name}</h4><p class="register-entry register-entry--empty">No entries on this register.</p>`;
                        }
                        return `<h4>${name}</h4>${entries
                            .map(
                                (entry) => `<div class="register-entry">
                                    <span class="entry-number">${entry.entry_number}.</span>
                                    <span>${escapeHtml(entry.text)}${entry.beneficiary ? `<span class="entry-beneficiary">${escapeHtml(entry.beneficiary)}</span>` : ""}</span>
                                </div>`
                            )
                            .join("")}`;
                    })
                    .join("")}
                <a class="register-link" href="${escapeHtml(titleCheck.title_register_url)}" target="_blank" rel="noreferrer">Open the title register at HM Land Registry ${icon("arrowUpRight", 11, 1.7)}</a>
            </div>
        </details>
        </details>
    </div>`;
}

function pageProperties() {
    const matter = currentMatter();
    const instant = currentInstant();

    // The address is confirmed, not typed: it came off "About the deceased". Editing exists for the
    // case where the estate's property is not the deceased's last address — a rental, or a second
    // property — which is common enough that removing the affordance would be wrong.
    const addressBlock = state.addressEditing
        ? `<div class="ea-field ea-field--wide">
                <span class="ea-label"><label for="address">Address</label></span>
                <span class="ea-input ea-input--editing">
                    <input id="address" type="text" value="${escapeHtml(state.addressDraft)}" autocomplete="off" data-1p-ignore data-lpignore="true" aria-describedby="address-error" ${state.addressError ? 'aria-invalid="true"' : ""} />
                </span>
            </div>
            <span class="field-error" id="address-error" role="alert">${state.addressError ? escapeHtml(state.addressError) : ""}</span>`
        : `<div class="ea-field ea-field--wide">
                <span class="ea-label">Address</span>
                <span class="ea-input ea-input--readonly">${escapeHtml(state.addressDraft)}
                    <button type="button" class="inline-edit" data-action="edit-address">Change</button>
                </span>
            </div>
            <p class="carried-from">${icon("arrowRight", 12, 1.7)} <span>Carried from <strong>About the deceased</strong> → last known permanent address, where "${escapeHtml(`Was the property above owned / part-owned by ${matter.deceased.firstName}?`)}" is ticked Yes.</span></p>`;

    return `${panelHeading("Properties")}
        <div class="ea-split">
            <div class="ea-main">
                <table class="ea-table">
                    <thead><tr>
                        <th scope="col">Address</th>
                        <th scope="col">How held</th>
                        <th scope="col" class="num">Value at date of death</th>
                        <th scope="col" class="num">Estate's share</th>
                        <th scope="col">Source</th>
                    </tr></thead>
                    <tbody>${propertyRow()}</tbody>
                </table>

                <div class="ea-detail">
                    <h3 class="detail-heading">Property details</h3>
                    ${addressBlock}
                    ${
                        instant
                            ? `<div class="facts">
                                    ${subjectFacts(instant)
                                        .map(
                                            (fact) => `<span class="fact ${fact.source === "client_supplied" ? "fact--supplied" : ""}">
                                                ${escapeHtml(fact.label)} <strong>${escapeHtml(fact.value)}</strong>
                                                <span class="fact-source">${fact.source === "client_supplied" ? "you told us" : "looked up"}</span>
                                            </span>`
                                        )
                                        .join("")}
                                </div>`
                            : `<p class="ea-empty">No value recorded. <strong>The IHT400 cannot be produced until this property has a figure against it</strong>, and neither can the excepted-estate test.</p>`
                    }
                    ${titleCheckBlock()}
                </div>
            </div>
            ${sailCard()}
        </div>`;
}


// ---------------------------------------------------------------------------------------
// Assets -> Property services: the one view LEAP asked for
// ---------------------------------------------------------------------------------------

// Every service here is one Sail already runs, with a supplier panel, quoting, instruction and
// billing behind it. The billing choice at the top is the part that matters: deferring to
// completion is only on the table where Sail is marketing the property, so the screen asks.
function serviceCard(row) {
    const pending = state.servicePending === row.id;
    const isLive = ["instructed", "booked", "done"].includes(row.status);

    // Fixed-fee work skips the quote step entirely — the price is already on the card, so asking
    // for one would be theatre. Only clearance and refurbishment have anything to find out.
    const action = pending
        ? `<span class="svc-pending">${icon("clock", 12, 1.7)} Working…</span>`
        : row.status === "available"
          ? row.isQuoted
            ? `<button type="button" class="leap-button leap-button--primary svc-action" data-service-quote="${row.id}">Get a price</button>`
            : `<button type="button" class="leap-button leap-button--primary svc-action${row.id === "lock_change" ? coached() : ""}" data-service-instruct="${row.id}">Instruct &mdash; ${escapeHtml(poundsFromPence(row.pricePence))}</button>`
          : row.status === "quoted"
            ? `<button type="button" class="leap-button leap-button--primary svc-action" data-service-instruct="${row.id}">Instruct at ${escapeHtml(poundsFromPence(row.pricePence))}</button>`
            : "";

    const priceText = row.pricePence === null
        ? escapeHtml(row.priceNote)
        : `${escapeHtml(poundsFromPence(row.pricePence))} + VAT &middot; ${row.isQuoted ? "quoted for this house" : "fixed fee"}`;

    return `<div class="svc ${isLive ? "svc--live" : ""} ${row.status === "quoted" ? "svc--quoted" : ""}">
        <div class="svc-head">
            <span class="svc-label">${escapeHtml(row.label)}</span>
            <span class="svc-status svc-status--${row.status}">${escapeHtml(row.statusLabel)}</span>
        </div>
        <p class="svc-problem">${escapeHtml(row.estateProblem)}</p>
        <div class="svc-meta">
            <span>${icon("clock", 11, 1.7)} ${escapeHtml(row.turnaround)}</span>
            <span class="svc-price">${priceText}</span>
        </div>
        ${
            row.timeline.length > 0
                ? `<ol class="svc-timeline">${row.timeline
                      .map(([label, date], index) => `<li class="${index === row.timeline.length - 1 ? "is-now" : ""}">
                          <span class="svc-timeline-label">${label}</span>
                          <span class="svc-timeline-date">${escapeHtml(date)}</span>
                      </li>`)
                      .join("")}</ol>`
                : ""
        }
        ${action}
    </div>`;
}

function pageServices() {
    const matter = currentMatter();
    const rows = currentServices();
    const summary = servicesSummary(rows);
    const billing = state.billing[state.matterId];
    const onProperty = rows.filter((row) => row.status !== "available");
    const available = rows.filter((row) => row.status === "available");

    return `${panelHeading("Property services")}
        <div class="svc-provenance">
            ${sailMark(13)}
            <span>Ordered from <strong>Sail</strong>, against this matter's property. One supplier for every job on the list, one invoice, and the status of each on the page &mdash; the same panel that runs clearances and drain-downs on Sail's own probate sales.</span>
        </div>

        <div class="svc-billing">
            <span class="svc-billing-head">Bill this to</span>
            ${coach("Switch this")}
            <div class="svc-billing-choices">
                <button type="button" class="svc-choice${coached()} ${billing === "job" ? "svc-choice--on" : ""}" data-billing="job">
                    The estate, when each job is done
                </button>
                <button type="button" class="svc-choice ${billing === "completion" ? "svc-choice--on" : ""}" data-billing="completion">
                    Completion of the sale
                </button>
            </div>
            <p class="svc-billing-note">${
                billing === "completion"
                    ? `<strong>Sail carries the cost and bills on completion.</strong> Nothing leaves client account before the grant. This route asks you to instruct Sail to market the property — the estate is free to sell elsewhere, and if it does, the jobs are invoiced then.`
                    : `<strong>We invoice the estate as each job is finished</strong>, and it is settled in the ordinary way. Available whoever ends up selling the property.`
            }</p>
        </div>

        <div class="svc-summary">
            <div class="svc-stat">
                <span class="svc-stat-label">On this property</span>
                <strong>${summary.liveCount + summary.quotedCount}</strong>
                <span class="svc-stat-note">${summary.quotedCount > 0 ? `${summary.quotedCount} awaiting your go-ahead` : "nothing waiting on you"}</span>
            </div>
            <div class="svc-stat">
                <span class="svc-stat-label">Committed</span>
                <strong>${escapeHtml(poundsFromPence(summary.committedPence))}</strong>
                <span class="svc-stat-note">across ${summary.liveCount} instructed ${summary.liveCount === 1 ? "job" : "jobs"}</span>
            </div>
            <div class="svc-stat ${billing === "completion" ? "svc-stat--hero" : ""}">
                <span class="svc-stat-label">Payable before the grant</span>
                <strong>${escapeHtml(poundsFromPence(billing === "completion" ? 0 : summary.committedPence))}</strong>
                <span class="svc-stat-note">${billing === "completion" ? "Settled out of the sale proceeds" : "Invoiced as each job finishes"}</span>
            </div>
        </div>

        ${
            onProperty.length > 0
                ? `<h3 class="svc-group-heading">On ${escapeHtml(matter.property.addressLine1)}</h3>
                    <div class="svc-grid">${onProperty.map(serviceCard).join("")}</div>`
                : ""
        }

        <h3 class="svc-group-heading">Available</h3>
        <div class="svc-grid">${available.map(serviceCard).join("")}</div>

        <div class="svc-gap">
            <p>Every job on this page is priced, instructed, tracked and invoiced by Sail &mdash; one supplier, one invoice. <code>POST /properties/{id}/services</code> returns the price on the request, so a panel like this needs one call to draw and one to order.</p>
            <a class="leap-button" href="${SAIL_DOCS_URL}">Read the API reference ${icon("arrowRight", 12, 1.7)}</a>
        </div>`;
}

// ---------------------------------------------------------------------------------------
// Debts, Calculations and Submission forms — the pages a property figure unblocks
// ---------------------------------------------------------------------------------------

function pageDebts() {
    const matter = currentMatter();
    const fromTitle = chargeDebtRows(currentTitleCheck());

    return `${panelHeading("Debts")}
        <table class="ea-table">
            <thead><tr><th scope="col">Description</th><th scope="col" class="num">Amount</th><th scope="col">Source</th></tr></thead>
            <tbody>
                ${matter.debts
                    .map(
                        (debt) => `<tr><td>${escapeHtml(debt.name)}</td><td class="num">${escapeHtml(poundsFromPence(debt.valuePence))}</td><td><span class="cell-empty">Entered</span></td></tr>`
                    )
                    .join("")}
                ${fromTitle
                    .map(
                        (debt) => `<tr class="is-new" data-link-key="has_charge">
                            <td>${escapeHtml(debt.name)}</td>
                            <td class="num"><span class="cell-empty">${escapeHtml(debt.note)}</span></td>
                            <td><span class="source-pill">${sailMark(10)} Title register</span></td>
                        </tr>`
                    )
                    .join("")}
                <tr class="is-total"><td>Total entered</td><td class="num">${escapeHtml(poundsFromPence(debtsTotalPence(matter)))}</td><td></td></tr>
            </tbody>
        </table>

        ${
            fromTitle.length > 0
                ? `<p class="ea-note">${icon("info", 14, 1.7)} <span>The charge came off the title register, so the liability is on the file the moment the full valuation returns. <strong>We deliberately do not put a number against it.</strong> The register records that a charge exists and who holds it; it never records the balance. That comes from a redemption statement — and a figure invented here would end up on an IHT400.</span></p>`
                : `<p class="ea-note">${icon("info", 14, 1.7)} <span>Order the full valuation on the Properties page and any registered charge is added here automatically, named and dated.</span></p>`
        }`;
}

function calcRow(label, value, options) {
    const modifiers = [options && options.negative ? "is-negative" : "", options && options.total ? "is-total" : "", options && options.grand ? "is-grand" : ""]
        .filter(Boolean)
        .join(" ");
    return `<div class="calc-row ${modifiers}">
        <span>${label}</span>
        <strong>${escapeHtml(value)}</strong>
    </div>`;
}

function pageCalculations() {
    const matter = currentMatter();
    const calculation = currentCalculation();
    const instant = currentInstant();

    if (!calculation) {
        return `${panelHeading("Calculations")}
            <div class="blocked-panel">
                <span class="blocked-flag">${icon("warning", 15, 1.7)} Cannot be calculated</span>
                <p>The property is almost always the largest thing in an estate, and there is no figure against it. Every line below depends on it — the gross estate, the nil rate bands, whether this estate is excepted at all, and the tax.</p>
                <p><strong>Today this is where the file sits for a fortnight</strong> while the executor finds an estate agent who will come out and give an opinion in writing.</p>
                <button type="button" class="leap-button leap-button--primary" data-page="properties">Go to Assets → Properties</button>
            </div>`;
    }

    const exposure = taxExposure(matter, instant, currentTitleCheck());
    const co = currentTitleCheck() ? coOwnership(currentTitleCheck()) : null;

    return `${panelHeading("Calculations")}
        <div class="calc-panel">
            ${calcRow(
                `Property — ${escapeHtml(fullAddress(matter))}${calculation.share < 100 ? ` <em>(${calculation.share}% share)</em>` : ""}`,
                poundsFromPence(calculation.propertyPence)
            )}
            ${calcRow("All other assets", poundsFromPence(calculation.otherPence))}
            ${calcRow("Gross estate", poundsFromPence(calculation.grossPence), { total: true })}
            ${calcRow("Less debts and liabilities", `(${poundsFromPence(calculation.knownDebtsPence)})`, { negative: true })}
            ${calculation.unsizedDebts
                .map((debt) => calcRow(`Less ${escapeHtml(debt.name)}`, `(${debt.note})`, { negative: true }))
                .join("")}
            ${calcRow("Net estate", poundsFromPence(calculation.netPence), { total: true })}
            ${calcRow(
                `Less nil rate band${calculation.hasTransferableNrb ? " <em>(doubled — transferable band available)</em>" : ""}`,
                `(${poundsFromPence(calculation.nrbPence)})`,
                { negative: true }
            )}
            ${
                calculation.rnrbPence > 0
                    ? calcRow("Less residence nil rate band", `(${poundsFromPence(calculation.rnrbPence)})`, { negative: true })
                    : ""
            }
            ${calcRow("Chargeable estate", poundsFromPence(calculation.chargeablePence), { total: true })}
            ${calcRow("Inheritance tax at 40%", poundsFromPence(calculation.taxPence), { grand: true })}
        </div>

        <p class="calc-caption">${sailMark(12)} <span><strong>Every line above moves with the property figure.</strong> That is why the valuation belongs at Assets → Properties and not three steps later.</span></p>

        ${
            exposure
                ? `<div class="exposure-panel ${valuation(instant).band === "HIGH" ? "" : "exposure-panel--wide"}">
                        <h3>What the estimate's range is worth in tax</h3>
                        <div class="exposure-bar">
                            <span><em>At ${escapeHtml(valuation(instant).rangeLow)}</em><strong>${escapeHtml(poundsFromPence(exposure.lowTaxPence))}</strong></span>
                            <span class="exposure-spread">${escapeHtml(poundsFromPence(exposure.spreadPence))} apart</span>
                            <span><em>At ${escapeHtml(valuation(instant).rangeHigh)}</em><strong>${escapeHtml(poundsFromPence(exposure.highTaxPence))}</strong></span>
                        </div>
                        <p>An automated estimate is the right tool for triage and for the excepted-estate test. It is <strong>not</strong> the valuation you file on a taxable estate — s.160 IHTA 1984 asks for open market value, and the District Valuer will look at how it was arrived at. That is what the full valuation is for, and it is what closes this gap.</p>
                    </div>`
                : `<div class="exposure-panel exposure-panel--clear">
                        <h3>No tax on these figures</h3>
                        <p>Nothing turns on the width of the estimate, because the estate falls inside the nil rate bands either way. Order the full valuation anyway if you want a written valuation on the file evidencing the excepted position${co ? "" : " and the ownership"}.</p>
                    </div>`
        }`;
}

function pageForms() {
    const matter = currentMatter();
    const calculation = currentCalculation();
    const titleCheck = currentTitleCheck();

    if (!calculation) {
        return `${panelHeading("Submission forms")}
            <div class="blocked-panel">
                <span class="blocked-flag">${icon("warning", 15, 1.7)} Cannot be determined</span>
                <p>Which forms this estate needs — and whether it needs an IHT400 at all — is decided by the gross estate, and the gross estate is unknown until the property is valued.</p>
                <button type="button" class="leap-button leap-button--primary" data-page="properties">Go to Assets → Properties</button>
            </div>`;
    }

    const result = submissionForms(matter, calculation, titleCheck);

    return `${panelHeading("Submission forms")}
        <div class="forms-verdict ${result.required ? "forms-verdict--required" : "forms-verdict--excepted"}">
            <strong>${escapeHtml(result.headline)}</strong>
            <p>${escapeHtml(result.reason)}</p>
        </div>

        ${
            result.forms.length > 0
                ? `<table class="ea-table">
                        <thead><tr><th scope="col">Form</th><th scope="col">Name</th><th scope="col">Why</th></tr></thead>
                        <tbody>
                            ${result.forms
                                .map(
                                    (form) => `<tr class="${form.fromTitle ? "is-new" : ""}">
                                        <td><code>${escapeHtml(form.code)}</code></td>
                                        <td>${escapeHtml(form.name)}</td>
                                        <td>${escapeHtml(form.why)}${form.fromTitle ? ` <span class="source-pill">${sailMark(10)} Title register</span>` : ""}</td>
                                    </tr>`
                                )
                                .join("")}
                        </tbody>
                    </table>
                    <p class="ea-note">${icon("info", 14, 1.7)} <span>The <code>IHT404</code> is on this list because the register said the property was held as tenants in common. Nobody typed that in.</span></p>`
                : `<p class="ea-note">${icon("check", 14, 1.9)} <span>No inheritance tax account to prepare. The values are declared on the grant application, and the whole IHT400 exercise disappears — <strong>which you can only say with confidence once the property has been valued.</strong></span></p>`
        }

        <div class="sale-prompt">
            <div>
                <h3>The property is being sold</h3>
                <p>LEAP's Estates matter types include <strong>Sale of Estate</strong>. The same <code>property_id</code> carries into a conveyancing quote and an instruction, so the sale opens as a matter without anyone re-keying the address.</p>
            </div>
            <button type="button" class="leap-button leap-button--primary" data-screen="sale">Open the Sale of Estate matter ${icon("arrowRight", 12, 1.7)}</button>
        </div>`;
}

function pageInert(label) {
    return `${panelHeading(label)}
        <div class="blocked-panel blocked-panel--quiet">
            <p><strong>Not in this prototype.</strong> This page exists in LEAP Estate Administration and is listed here so the tree looks like the real one. The pages that matter to the integration are <strong>About the deceased</strong>, <strong>Properties</strong>, <strong>Debts</strong>, <strong>Calculations</strong> and <strong>Submission forms</strong>.</p>
            <button type="button" class="leap-button leap-button--primary" data-page="properties">Go to Assets → Properties</button>
        </div>`;
}

function estatePanel() {
    switch (state.page) {
        case "deceased":
            return pageDeceased();
        case "properties":
            return pageProperties();
        case "services":
            return pageServices();
        case "debts":
            return pageDebts();
        case "calculations":
            return pageCalculations();
        case "forms":
            return pageForms();
        default: {
            const item = TREE.flatMap((section) => section.items).find((candidate) => candidate.id === state.page);
            return pageInert(item ? item.label : "Estate administration");
        }
    }
}

function estateWindow() {
    return `<section class="leap-window leap-window--ea">
        <div class="window-titlebar window-titlebar--modal">
            <span class="window-nav">
                <button type="button" class="chrome-icon" data-action="inert" aria-label="Back">${icon("chevronLeft", 12, 1.6)}</button>
            </span>
            <span class="window-title">Estate Administration</span>
            ${windowControls()}
        </div>
        <div class="ea-body">
            ${estateTree()}
            <div class="ea-panel">${estatePanel()}</div>
        </div>
        <div class="ea-footer">
            <button type="button" class="leap-button leap-button--primary" data-action="inert">Save</button>
            <button type="button" class="leap-button" data-action="inert">Close</button>
        </div>
    </section>`;
}

function matterScreen() {
    return `<div class="leap-desktop">
        ${appChrome()}
        <div class="desktop-body">
            ${matterListBackdrop()}
            ${matterWindow(estateWindow())}
        </div>
    </div>`;
}

// ---------------------------------------------------------------------------------------
// Phase two — the Sale of Estate matter
// ---------------------------------------------------------------------------------------

function salePage() {
    const matter = currentMatter();
    const instant = currentInstant();
    const sale = state.sales[matter.id];
    const val = valuation(instant);

    if (!instant) {
        return `<div class="leap-desktop">
            ${appChrome()}
            <div class="desktop-body">
                ${matterListBackdrop()}
                ${matterWindow(`<div class="sale-window">
                    <div class="blocked-panel">
                        <span class="blocked-flag">${icon("warning", 15, 1.7)} Nothing to quote on</span>
                        <p>A conveyancing quote is priced off the property's value, and there is not one yet. Value the property first.</p>
                        <button type="button" class="leap-button leap-button--primary" data-screen="matter">Go to Estate Administration</button>
                    </div>
                </div>`)}
            </div>
        </div>`;
    }

    const quote = sale.quote;

    return `<div class="leap-desktop">
        ${appChrome()}
        <div class="desktop-body">
            ${matterListBackdrop()}
            ${matterWindow(`<div class="sale-window">
                ${panelHeading("Sale of Estate")}
                <p class="sale-lede">One of LEAP's own Estates matter types. The property is already registered with Sail from the valuation, so the quote and the instruction reuse the same <code>property_id</code> — the address is never re-keyed.</p>

                <div class="sale-summary">
                    <div><span class="label">Property</span><strong>${escapeHtml(fullAddress(matter))}</strong></div>
                    <div><span class="label">Sale price used</span><strong data-link-key="price_pence">${escapeHtml(val.headline)}</strong><span class="cell-ref">The valued figure, carried straight over</span></div>
                    <div><span class="label">Executor</span><strong>${escapeHtml(matter.client.firstName)} ${escapeHtml(matter.client.lastName)}</strong></div>
                    <div><span class="label">Probate matter</span><strong>${escapeHtml(matter.number)}</strong></div>
                </div>

                ${
                    sale.phase === "requesting"
                        ? `<div class="sale-progress">${valuationStages()}</div>`
                        : quote
                          ? `<div class="quote-panel">
                                <table class="ea-table">
                                    <thead><tr><th scope="col">Item</th><th scope="col">Category</th><th scope="col" class="num">Excl. VAT</th><th scope="col" class="num">VAT</th><th scope="col" class="num">Total</th></tr></thead>
                                    <tbody>
                                        ${quote.items
                                            .map(
                                                (item) => `<tr>
                                                    <td>${escapeHtml(item.display_name)}${item.quantity > 1 ? ` × ${item.quantity}` : ""}</td>
                                                    <td>${escapeHtml(item.category)}</td>
                                                    <td class="num">${escapeHtml(poundsFromPence(item.fee_pence_excluding_vat))}</td>
                                                    <td class="num">${item.has_vat ? escapeHtml(poundsFromPence(item.vat_pence)) : "—"}</td>
                                                    <td class="num">${escapeHtml(poundsFromPence(item.fee_pence_total))}</td>
                                                </tr>`
                                            )
                                            .join("")}
                                        <tr class="is-total"><td colspan="4">Total</td><td class="num">${escapeHtml(poundsFromPence(quote.total_pence))}</td></tr>
                                    </tbody>
                                </table>
                                ${
                                    sale.instruct
                                        ? `<div class="instructed">
                                                <strong>${icon("check", 13, 2.2)} Instructed — Sale of Estate matter opened</strong>
                                                <p>The conveyancing has started. ${escapeHtml(matter.client.firstName)} gets a link to complete ID checks, terms of engagement and the initial payment.</p>
                                                <code class="onboarding-url">${escapeHtml(sale.instruct.client_onboarding_url)}</code>
                                            </div>`
                                        : `<button type="button" class="leap-button leap-button--primary" data-action="instruct">Instruct the sale</button>`
                                }
                            </div>`
                          : `<div class="sale-cta">
                                <p>Price the conveyancing off the valued figure and open the matter.</p>
                                <button type="button" class="leap-button leap-button--primary" data-action="run-sale">Quote the conveyancing</button>
                            </div>`
                }

                <p class="ea-note">${icon("info", 14, 1.7)} <span>Phase two, and not needed to launch phase one. It is here because <strong>Sale of Estate is already a matter type in LEAP</strong>, so the downstream is a small addition rather than a second integration.</span></p>
            </div>`)}
        </div>
    </div>`;
}

// ---------------------------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------------------------

function refineModal() {
    const refinement = currentMatter().refinement;

    return `<div class="modal-header">
            <h2 id="modal-title">Add property details</h2>
            <button type="button" class="close-button" data-action="close-modal" aria-label="Close">×</button>
        </div>
        <div class="modal-body">
            <p class="modal-lede">None of this is required. It narrows the range, and on a taxable estate the range is what the tax uncertainty is made of.</p>
            <div class="ea-grid">
                <div class="ea-field">
                    <span class="ea-label"><label for="refine-type">Property type</label></span>
                    <span class="ea-input ea-input--editing"><select id="refine-type"><option selected>${escapeHtml(refinement.propertyType)}</option><option>Semi-detached</option><option>Terraced</option><option>Flat</option></select></span>
                </div>
                <div class="ea-field">
                    <span class="ea-label"><label for="refine-beds">Bedrooms</label></span>
                    <span class="ea-input ea-input--editing"><select id="refine-beds"><option>3</option><option>4</option><option selected>${refinement.bedrooms}</option></select></span>
                </div>
                <div class="ea-field ea-field--wide">
                    <span class="ea-label"><label for="refine-condition">Condition</label></span>
                    <span class="ea-input ea-input--editing"><select id="refine-condition"><option selected>${escapeHtml(refinement.conditionLabel)}</option><option>Good</option><option>Needs modernising</option><option>Needs full refurbishment</option></select></span>
                </div>
            </div>
        </div>
        <div class="modal-actions">
            <button type="button" class="leap-button" data-action="close-modal">Cancel</button>
            <button type="button" class="leap-button leap-button--primary" data-action="submit-refine">Re-value</button>
        </div>`;
}

function modal() {
    if (!state.modal) return "";
    return `<div class="modal-backdrop" data-backdrop>
        <section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">${refineModal()}</section>
    </div>`;
}

// ---------------------------------------------------------------------------------------
// API panel — rendered separately so streamed entries don't reset its scroll
// ---------------------------------------------------------------------------------------

function apiCall(entry) {
    const requestOpen = state.apiPanel.expanded.has(`${entry.id}-req`);
    const responseOpen = state.apiPanel.expanded.has(`${entry.id}-res`);

    return `<article class="api-call">
        <div class="api-call-head">
            <span class="api-method">${entry.method}</span><span>${entry.path}</span>
            <span class="api-status"><span class="api-status-dot" aria-hidden="true"></span>${entry.status} · ${entry.latency} ms</span>
        </div>
        <details class="api-block" data-disclosure="${entry.id}-req"${requestOpen ? " open" : ""}>
            <summary>Request body</summary>
            <pre>${highlightJson(entry.body)}</pre>
        </details>
        <details class="api-block" data-disclosure="${entry.id}-res"${responseOpen ? " open" : ""}>
            <summary>Response</summary>
            <pre>${highlightJson(entry.response)}</pre>
        </details>
    </article>`;
}

function renderApiPanel() {
    if (!state.apiPanel.open) {
        drawerRoot.innerHTML = "";
        return;
    }

    const entries = state.apiPanel.entries;

    // No scrim. The panel overlays without pushing, so the window never reflows mid-demo, but it
    // leaves the page interactive — a scrim would swallow every mouse event and kill the whole
    // point of the panel, which is hovering a figure to highlight the field it came from.
    drawerRoot.innerHTML = `<aside class="api-drawer" aria-label="Sail API calls">
            <div class="drawer-head">
                <div class="drawer-head-top">
                    <h2>LEAP's server calls Sail, never the client</h2>
                    <button type="button" class="drawer-close" data-action="toggle-api" aria-label="Close the API panel">×</button>
                </div>
                <p class="drawer-route">Every call below is <strong>made server-side</strong>, from the same place your other marketplace integrations sit.</p>
                <p class="drawer-auth">${BASE_URL}<br />Authorization: ${AUTH_HEADER}</p>
            </div>
            <div class="drawer-body">
                ${
                    entries.length === 0
                        ? `<p class="drawer-empty">Nothing sent yet. Open Assets → Properties and ask for an instant valuation — the calls appear here as they fire.</p>`
                        : entries.map(apiCall).join("")
                }
                ${
                    entries.length > 0
                        ? `<p class="drawer-note"><strong>Hover a figure on the page to highlight the field it came from.</strong> Nothing on screen is hardcoded — every value, including every line of the estate calculation, is derived from these payloads.</p>`
                        : ""
                }
            </div>
        </aside>`;
}

// ---------------------------------------------------------------------------------------
// Render
// ---------------------------------------------------------------------------------------

function render() {
    const toast = state.toast ? `<div class="toast" role="status">${escapeHtml(state.toast)}</div>` : "";

    let body;
    if (state.screen === "guide") body = `<main class="guide-shell">${guidePage()}</main>`;
    else if (state.screen === "report") body = reportPage(state.matterId);
    else if (state.screen === "sale") body = salePage();
    else body = matterScreen();

    const bannerKey = state.screen === "report" ? "report" : state.page;

    root.innerHTML = IS_EMBED
        ? `${demoBanner(bannerKey)}${body}${modal()}${toast}`
        : `${demoNav()}${disclaimer()}${body}${modal()}${toast}`;

    document.body.classList.toggle("modal-open", Boolean(state.modal));
    renderApiPanel();

    if (state.screen === "report") armReportScrollCue();

    if (modalJustOpened) {
        modalJustOpened = false;
        root.querySelector(".modal select, .modal input")?.focus();
    }
}

// The scroll cue on the report is an instruction, and an instruction that stays on screen after
// it has been followed reads as a decoration. One pixel of movement retires it.
let reportScrollCueArmed = false;

function armReportScrollCue() {
    document.body.classList.remove("has-scrolled");
    if (reportScrollCueArmed) return;
    reportScrollCueArmed = true;

    window.addEventListener(
        "scroll",
        () => {
            if (window.scrollY > 0) document.body.classList.add("has-scrolled");
        },
        { passive: true }
    );
}

function showToast(message) {
    state.toast = message;
    render();
    window.setTimeout(() => {
        state.toast = "";
        render();
    }, 3600);
}

// ---------------------------------------------------------------------------------------
// The request flows
// ---------------------------------------------------------------------------------------

// Walks a plan of calls, feeding each response into state as it lands, so the stages on screen and
// the entries in the panel stay in step by construction.
function runPlan(plan, matterId, onCall, onDone) {
    state.progress = { matterId, stages: plan, index: 0 };
    render();

    let elapsed = 0;
    plan.forEach((call, index) => {
        elapsed += call.latency;
        window.setTimeout(() => {
            // Guard: the user may have switched matter or screen mid-flight.
            if (!state.progress || state.progress.matterId !== matterId) return;

            state.apiPanel.entries = [...state.apiPanel.entries, call];
            onCall(call);

            const isLast = index === plan.length - 1;
            state.progress.index = isLast ? plan.length : index + 1;

            if (isLast) {
                state.progress = null;
                onDone();
            } else {
                render();
            }
        }, elapsed);
    });
}

function runInstant(matterId) {
    const valuationState = state.valuations[matterId];
    valuationState.phase = "requesting";

    runPlan(
        instantValuationPlan(matterId),
        matterId,
        (call) => {
            if (call.path === "/valuations/instant") valuationState.instant = call.response;
        },
        () => {
            valuationState.phase = "result";
            render();
            showToast("Valued at the date of death — Calculations has unblocked");
        }
    );
}

function runRefinement(matterId) {
    const call = refineValuationCall(matterId);
    state.apiPanel.entries = [...state.apiPanel.entries, call];
    state.valuations[matterId].refined = true;
    render();
    showToast("Re-valued — the range has narrowed");
}

function orderFullValuation(matterId) {
    const call = fullValuationCall(matterId);
    const valuationState = state.valuations[matterId];

    valuationState.ordering = true;
    render();

    window.setTimeout(() => {
        valuationState.ordering = false;
        valuationState.full = call.response;
        state.apiPanel.entries = [...state.apiPanel.entries, call];
        render();
        showToast("Valuation booked — the register came back with it");
    }, call.latency);
}

function quoteService(matterId, serviceId) {
    const service = SERVICE_CATALOGUE.find((candidate) => candidate.id === serviceId);
    if (!service) return;

    const call = serviceQuoteCall(matterId, service, state.billing[matterId] === "completion" ? "on_sale_completion" : "on_job_completion");
    state.servicePending = serviceId;
    render();

    window.setTimeout(() => {
        state.servicePending = null;
        state.services[matterId] = {
            ...state.services[matterId],
            [serviceId]: { status: "quoted", quotedOn: new Date().toISOString().slice(0, 10), quotedPence: call.response.quote.net_pence }
        };
        state.apiPanel.entries = [...state.apiPanel.entries, call];
        render();
        showToast(`${service.label} priced — ${poundsFromPence(call.response.quote.net_pence)} + VAT, nothing payable now`);
    }, call.latency);
}

function addWorkingDays(iso, days) {
    const date = new Date(`${iso}T00:00:00Z`);
    let added = 0;
    while (added < days) {
        date.setUTCDate(date.getUTCDate() + 1);
        const day = date.getUTCDay();
        if (day !== 0 && day !== 6) added += 1;
    }
    return date.toISOString().slice(0, 10);
}

function instructService(matterId, serviceId) {
    const service = SERVICE_CATALOGUE.find((candidate) => candidate.id === serviceId);
    if (!service) return;

    const today = new Date().toISOString().slice(0, 10);
    // Instructing gives back a date, not just an acknowledgement — the first thing anyone asks
    // after ordering a job is when somebody is turning up.
    const bookedFor = addWorkingDays(today, service.pricing === "quoted" ? 10 : 3);
    const call = serviceInstructCall(matterId, service, today, bookedFor);
    state.servicePending = serviceId;
    render();

    window.setTimeout(() => {
        state.servicePending = null;
        state.services[matterId] = {
            ...state.services[matterId],
            [serviceId]: {
                ...(state.services[matterId] || {})[serviceId],
                status: "booked",
                instructedOn: today,
                bookedFor,
                agreedPence: service.pricing === "quoted" ? undefined : service.fixedPence
            }
        };
        state.apiPanel.entries = [...state.apiPanel.entries, call];
        render();
        showToast(`${service.label} booked for ${shortDate(bookedFor)}`);
    }, call.latency);
}

function runSale(matterId) {
    const instant = currentInstant();
    const sale = state.sales[matterId];
    sale.phase = "requesting";

    // Only the quote runs on this button. Instructing is the point of no return, so it stays a
    // second, deliberate press.
    const plan = saleOfEstatePlan(matterId, instant.prices.market_price_pence).slice(0, 1);

    runPlan(
        plan,
        matterId,
        (call) => {
            if (call.path === "/quotes") sale.quote = call.response;
        },
        () => {
            sale.phase = "quoted";
            render();
        }
    );
}

function instructSale(matterId) {
    const instant = currentInstant();
    const call = saleOfEstatePlan(matterId, instant.prices.market_price_pence)[1];
    const sale = state.sales[matterId];

    state.apiPanel.entries = [...state.apiPanel.entries, call];
    sale.instruct = call.response;
    render();
    showToast("Instructed — the Sale of Estate matter is open");
}

// ---------------------------------------------------------------------------------------
// Routing
// ---------------------------------------------------------------------------------------

function applyHash() {
    const hash = window.location.hash.replace("#", "");

    const reportMatch = hash.match(/^report(?:\/(\w+))?$/);
    if (reportMatch) {
        state.screen = "report";
        if (reportMatch[1] && MATTERS[reportMatch[1]]) state.matterId = reportMatch[1];
        // The report is our document, not theirs. A panel of LEAP-facing API payloads over the
        // top of it would only say the practitioner is still inside the integration.
        state.apiPanel.open = false;
        return;
    }

    if (hash === "guide") {
        state.screen = "guide";
        // The guide carries its own payload examples, so a live panel over the top would only
        // cover them up.
        state.apiPanel.open = false;
        return;
    }

    const saleMatch = hash.match(/^sale(?:\/(\w+))?$/);
    if (saleMatch) {
        state.screen = "sale";
        if (saleMatch[1] && MATTERS[saleMatch[1]]) state.matterId = saleMatch[1];
        return;
    }

    const matterMatch = hash.match(/^matter\/(\w+)(?:\/([\w-]+))?$/);
    if (matterMatch && MATTERS[matterMatch[1]]) {
        state.screen = "matter";
        state.matterId = matterMatch[1];
        state.page = matterMatch[2] || "properties";
        return;
    }

    state.screen = "matter";
    state.page = "properties";
}

function navigate(hash) {
    state.modal = null;
    state.addressError = null;
    state.addressEditing = false;
    if (window.location.hash.replace("#", "") === hash) {
        applyHash();
        render();
        return;
    }
    window.location.hash = hash;
}

// ---------------------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------------------

const POSTCODE = /[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}/i;

function startInstant() {
    const input = root.querySelector("#address");
    // Read the field on submit — it is uncontrolled, so it survives re-renders untouched. When the
    // row is not being edited the value is the one carried from About the deceased.
    const value = input ? input.value.trim() : state.addressDraft.trim();

    if (!value || !POSTCODE.test(value)) {
        state.addressError = value ? "Include the postcode so the address can be matched to a title." : "An address is required.";
        state.addressDraft = value;
        state.addressEditing = true;
        render();
        root.querySelector("#address")?.focus();
        return;
    }

    state.addressDraft = value;
    state.addressError = null;
    state.addressEditing = false;
    runInstant(state.matterId);
}

function selectMatter(matterId) {
    state.matterId = matterId;
    state.addressDraft = fullAddress(MATTERS[matterId]);
    state.addressError = null;
    state.addressEditing = false;
}

document.addEventListener("click", (event) => {
    const matterButton = event.target.closest("[data-matter]");
    if (matterButton) {
        selectMatter(matterButton.dataset.matter);
        navigate(state.screen === "sale" ? `sale/${state.matterId}` : `matter/${state.matterId}/${state.page}`);
        return;
    }

    const screenButton = event.target.closest("[data-screen]");
    if (screenButton) {
        const screen = screenButton.dataset.screen;
        navigate(screen === "matter" ? `matter/${state.matterId}/${state.page}` : screen === "sale" ? `sale/${state.matterId}` : screen);
        return;
    }

    const pageButton = event.target.closest("[data-page]");
    if (pageButton) {
        navigate(`matter/${state.matterId}/${pageButton.dataset.page}`);
        return;
    }

    const billingButton = event.target.closest("[data-billing]");
    if (billingButton) {
        state.billing[state.matterId] = billingButton.dataset.billing;
        render();
        return;
    }

    const quoteButton = event.target.closest("[data-service-quote]");
    if (quoteButton) {
        quoteService(state.matterId, quoteButton.dataset.serviceQuote);
        return;
    }

    const instructButton = event.target.closest("[data-service-instruct]");
    if (instructButton) {
        instructService(state.matterId, instructButton.dataset.serviceInstruct);
        return;
    }

    const actionEl = event.target.closest("[data-action]");
    if (!actionEl) return;

    switch (actionEl.dataset.action) {
        case "inert":
            return;
        case "toggle-api":
            state.apiPanel.open = !state.apiPanel.open;
            render();
            return;
        case "edit-address":
            state.addressEditing = true;
            modalJustOpened = false;
            render();
            root.querySelector("#address")?.focus();
            return;
        case "run-instant":
            startInstant();
            return;
        case "open-refine":
            returnFocusTo = '[data-action="open-refine"]';
            state.modal = "refine";
            modalJustOpened = true;
            render();
            return;
        case "close-modal":
            closeModal();
            return;
        case "submit-refine":
            state.modal = null;
            returnFocusTo = null;
            runRefinement(state.matterId);
            return;
        case "order-full":
            orderFullValuation(state.matterId);
            return;
        case "run-sale":
            runSale(state.matterId);
            return;
        case "instruct":
            instructSale(state.matterId);
            return;
        default:
    }
});

function closeModal() {
    state.modal = null;
    render();
    // Re-query after the render — the original node is gone.
    if (returnFocusTo) root.querySelector(returnFocusTo)?.focus();
    returnFocusTo = null;
}

// Backdrop click closes the modal, but only when the click started on the backdrop itself.
document.addEventListener("mousedown", (event) => {
    if (state.modal && event.target.matches("[data-backdrop]")) closeModal();
});

// <details> open state must survive the next re-render.
document.addEventListener(
    "toggle",
    (event) => {
        const key = event.target.dataset?.disclosure;
        if (!key) return;
        if (event.target.open) state.apiPanel.expanded.add(key);
        else state.apiPanel.expanded.delete(key);
    },
    true
);

// Hovering a figure highlights the payload it was derived from. This is what stops the panel
// reading as debug output.
function setLink(key) {
    if (state.linkedKey === key) return;
    state.linkedKey = key;

    root.querySelectorAll("[data-link-key]").forEach((el) => {
        el.classList.toggle("linked", Boolean(key) && el.dataset.linkKey === key);
    });

    drawerRoot.querySelectorAll(".json-line").forEach((el) => el.classList.remove("linked"));
    if (!key) return;

    drawerRoot.querySelectorAll("pre").forEach((pre) => {
        const lines = [...pre.querySelectorAll(".json-line")];
        lines.forEach((line, index) => {
            if (line.dataset.key !== key) return;
            const depth = Number(line.dataset.depth);
            line.classList.add("linked");
            // Highlight the whole block this key opens, not just its first line.
            for (let next = index + 1; next < lines.length; next += 1) {
                if (Number(lines[next].dataset.depth) <= depth) break;
                lines[next].classList.add("linked");
            }
        });
    });
}

document.addEventListener("mouseover", (event) => {
    const linked = event.target.closest("[data-link-key]");
    if (linked && linked.dataset.linkKey) setLink(linked.dataset.linkKey);
});

document.addEventListener("mouseout", (event) => {
    if (event.target.closest("[data-link-key]")) setLink(null);
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        if (state.modal) {
            closeModal();
            return;
        }
        if (state.apiPanel.open) {
            state.apiPanel.open = false;
            render();
        }
        return;
    }

    if (event.key === "Enter" && event.target.matches("#address")) {
        event.preventDefault();
        startInstant();
        return;
    }

    // Keep Tab inside the dialog while it is open.
    if (event.key === "Tab" && state.modal) {
        const focusable = root.querySelectorAll(".modal button, .modal input, .modal select, .modal a[href]");
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }
});

window.addEventListener("hashchange", () => {
    applyHash();
    render();
});

applyHash();
state.addressDraft = fullAddress(currentMatter());
render();
