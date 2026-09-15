// Inline SVG rather than Unicode symbols.
//
// Glyphs like → ↗ ✓ ⌂ ⌕ and emoji are missing from plenty of font stacks, and a tofu box in
// something we send a partner looks broken. Drawing them makes the prototype render identically
// wherever it is opened — the same reason the LEAP mark is drawn rather than set.
//
// The tree icons are deliberately thin and monochrome. LEAP's chrome is Office-like: line icons at
// 1.4px, no fills, no colour. A rounded, colourful icon set would be the single fastest way to
// make this look like it was drawn by someone who had never opened their software.

const svg = (body, size = 16, width = 1.5) =>
    `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;

const PATHS = {
    // Window and toolbar chrome
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    print: '<path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="7" rx="1.5"/><path d="M6 16h12v5H6z"/>',
    refresh: '<path d="M20 6v5h-5"/><path d="M4 18v-5h5"/><path d="M19.5 11a7.5 7.5 0 0 0-13-3.2L4 11"/><path d="M4.5 13a7.5 7.5 0 0 0 13 3.2L20 13"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="m3 7 9 6 9-6"/>',
    bell: '<path d="M18 9a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6"/><path d="M13.7 20a2 2 0 0 1-3.4 0"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.5a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.1-2.4 3.6"/><path d="M12 17.2h.01"/>',
    ellipsis: '<circle cx="5" cy="12" r="1.2" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.2" fill="currentColor" stroke="none"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    filter: '<path d="M3 5h18l-7 8v6l-4 2v-8Z"/>',
    minimise: '<path d="M5 12h14"/>',
    maximise: '<rect x="5" y="5" width="14" height="14" rx="1"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    chevronLeft: '<path d="m15 5-7 7 7 7"/>',
    chevronRight: '<path d="m9 5 7 7-7 7"/>',
    caret: '<path d="m6 9 6 6 6-6"/>',
    caretRight: '<path d="m9 6 6 6-6 6"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    arrowRight: '<path d="M4 12h16"/><path d="m14 6 6 6-6 6"/>',
    arrowUpRight: '<path d="M7 17 17 7"/><path d="M8 7h9v9"/>',
    lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 7.6h.01"/>',
    warning: '<path d="M12 4 2.5 20h19Z"/><path d="M12 10v4"/><path d="M12 17.2h.01"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',

    // The Estate Administration tree
    person: '<circle cx="12" cy="8" r="3.4"/><path d="M5 20a7 7 0 0 1 14 0"/>',
    scroll: '<path d="M6 4h11a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2Z"/><path d="M9 9h7M9 13h7M9 17h4"/>',
    building: '<path d="M4 21V6l7-3 7 3v15"/><path d="M9 21v-5h6v5"/><path d="M8 9h.01M12 9h.01M16 9h.01M8 13h.01M16 13h.01"/>',
    coins: '<ellipse cx="12" cy="6.5" rx="7" ry="3"/><path d="M5 6.5v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5"/><path d="M5 11.5v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5"/>',
    gift: '<rect x="3" y="9" width="18" height="12" rx="1.5"/><path d="M3 13h18M12 9v12"/><path d="M12 9C10 5 4 5.5 5.5 8.2 6.4 9.7 10 9.3 12 9Zm0 0c2-4 8-3.5 6.5-.8-.9 1.5-4.5 1.1-6.5.8Z"/>',
    sofa: '<path d="M4 12V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"/><path d="M3 12a2 2 0 0 1 2 2v3h14v-3a2 2 0 0 1 2-2"/><path d="M6 20v-3M18 20v-3"/>',
    chart: '<path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M22 20H2"/>',
    shield: '<path d="M12 3 5 6v6c0 4.4 3 7.7 7 9 4-1.3 7-4.6 7-9V6Z"/>',
    piggy: '<path d="M18 9a6 6 0 0 0-6-3H8a5 5 0 0 0-5 5c0 1.6.8 3 2 4v3h3v-2h4v2h3v-3c1.2-1 2-2.4 2-4h2V9Z"/><path d="M9 10h.01"/>',
    briefcase: '<rect x="3" y="7" width="18" height="13" rx="1.5"/><path d="M9 7V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v2"/><path d="M3 12h18"/>',
    minus: '<path d="M5 12h14"/>',
    calculator: '<rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M8 7h8"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01M15.5 16h.01"/>',
    forms: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z"/><path d="M14 3v5h5"/><path d="M8.5 13h7M8.5 17h4"/>',
    house: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>',
    // Assets → Property services. A spanner rather than a house: the row is about work done to
    // the property, and a second house icon under Properties would read as a duplicate.
    tools: '<path d="M14.5 6.2a3.8 3.8 0 0 0 4.9 4.9l-8 8a2.2 2.2 0 0 1-3.1-3.1Z"/><path d="M17.6 3.2 15 5.8l3.2 3.2 2.6-2.6a4.6 4.6 0 0 0-3.2-3.2Z"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.2V12l3.2 2"/>'
};

export function icon(name, size, width) {
    return svg(PATHS[name] || "", size, width);
}

// ---------------------------------------------------------------------------------------
// Brand marks
// ---------------------------------------------------------------------------------------

// The LEAP mark: an orange chevron in a navy square, with the wordmark beside it. Drawn rather
// than set because their wordmark face is not publicly licensed, and drawn as a chevron rather
// than approximated with a letterform because a wrong logo is worse than an obviously-drawn one.
export function leapMark(height = 26, withWordmark = true) {
    const square = `<svg viewBox="0 0 32 32" width="${height}" height="${height}" role="img" aria-label="LEAP" focusable="false">
        <rect width="32" height="32" fill="#1F3864"/>
        <path d="M6.6 24.4 15.9 6.9c.4-.8 1.6-.8 2 0l7.5 17.5-9.5-4.6-9.3 4.6Z" fill="#F5811F"/>
        <path d="m16.9 12.4 4.6 10.5-9.6-4.7Z" fill="#1F3864"/>
    </svg>`;

    if (!withWordmark) return square;

    return `<span class="leap-mark">${square}<span class="leap-word">LEAP</span></span>`;
}

// The Sail mark, used only to label our card and the payload panel.
export function sailMark(size = 13) {
    return `<svg viewBox="0 0 88 88" width="${size}" height="${size}" role="img" aria-hidden="true" focusable="false" style="vertical-align:-1px">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M87.3166 63.7501C81.5394 55.5253 77.1688 47.6827 74.2051 40.2219C69.3406 27.9759 65.9682 14.7688 64.0886.6006H63.851L61.9781 85.7693C66.712 84.7928 70.9021 83.9984 74.5483 83.3862L75.0654 83.3001C79.4303 82.5776 82.9934 82.1239 85.7547 81.9386C86.2739 81.9038 86.7948 81.8713 87.3166 81.8416V87.7599H.1572V.6006H87.3166V63.7501ZM30.1576 87.6506C37.5209 81.2804 43.6532 79.4471 48.5546 82.1512C53.456 84.855 56.0458 86.3744 56.3242 86.7094C53.9117 83.0058 52.474 78.3857 52.011 72.849C51.3168 64.544 51.0568 55.7725 52.7008 46.389C54.3451 37.0055 57.2159 20.3863 62.9672 9.5415C44.6126 37.3231 40.1989 55.4174 35.5925 69.8655C32.5218 79.4976 30.7101 85.4259 30.1576 87.6506Z" fill="currentColor" />
    </svg>`;
}
