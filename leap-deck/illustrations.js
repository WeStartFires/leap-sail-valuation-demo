// The drawn parts of the deck. Four of them, each doing a job a paragraph could not.
//
// They render from figures.js rather than holding their own numbers, so a bar cannot disagree with
// the sentence next to it. The first version of this deck had none of these and read as a wall of
// cards; the L&C deck's illustration module is the precedent.

import { PROBLEM, TODAY, SERVICES_PROOF, PRICE, BILLING_PATHS, REFERRAL, RATE_CARD, RATE_CARD_QUOTED, RATE_CARD_NOTE, LEAK_HEADLINE, CHAOS_PARTIES, CHAOS_CROSS, CHAOS_NOTE, CONTAINED, CONTAINED_NOTE, VALUE_STACK, VALUE_STACK_NOTE, EMPTY_HOUSE_CLOCK, EMPTY_HOUSE_ALSO, CASE_STUDIES } from "./figures.js?v=20260915m";

// A real capture of the Estate Administration recreation next door, rather than our diagram of it.
// Recapture with: open the concept at #matter/adeyemi/properties and screenshot `.leap-window--ea`.
// The badges in the tree are the argument — one page has no value on it, two more are waiting.
export function estateAdminShot() {
    return `<figure class="ill ill--shot">
        <img src="./shots/estate-admin-before.png" alt="LEAP Estate Administration, Assets then Properties. The value at date of death reads Required for IHT400, and Calculations and Submission forms are flagged in the tree." />
        <figcaption>${PROBLEM.line}</figcaption>
    </figure>`;
}


export function servicesShot() {
    return `<figure class="ill ill--shot">
        <img src="./shots/property-services.png" alt="The Property services page on the matter, showing the billing choice and the jobs against the property." />
    </figure>`;
}

// The three routes a firm takes today, priced. This is the anchor: it has to be on screen before
// the word "free" is, or free reads as cheap rather than as a saving.
export function priceLadder() {
    const rows = [
        ...TODAY.map((item) => ({ ...item, ours: false })),
        { route: "Sail", cost: PRICE.estate, problem: "One figure, with the evidence written underneath it.", ours: true }
    ];

    return `<div class="ill ill--ladder" role="img" aria-label="Four routes to a probate valuation and what each costs">
        ${rows
            .map(
                (row) => `<div class="ladder-row ${row.ours ? "ladder-row--ours" : ""}">
                    <span class="ladder-route">${row.route}</span>
                    <span class="ladder-cost">${row.cost}</span>
                    <span class="ladder-problem">${row.problem}</span>
                </div>`
            )
            .join("")}
    </div>`;
}

// The real service mix. Bars are scaled off the largest job type, so the shape is the data's and
// not a designer's — and the two that dominate are the two an empty probate house always needs.
export function serviceMix() {
    const total = SERVICES_PROOF.window;
    const ranked = [...SERVICES_PROOF.mix]
        .sort((a, b) => b[1] - a[1])
        .map(([label, properties]) => [label, properties, Math.round((properties / total) * 100)]);

    return `<div class="ill ill--mix" role="img" aria-label="How often each job was needed across the last 250 properties Sail was instructed to sell">
        <p class="mix-head">Of the last <strong>${total} properties we were instructed to sell</strong>, how many needed each job</p>
        ${ranked
            .map(
                ([label, properties, percent]) => `<div class="mix-row">
                    <span class="mix-label">${label}</span>
                    <span class="mix-track"><span class="mix-fill" style="width:${percent}%"></span></span>
                    <span class="mix-count">${percent}%</span>
                </div>`
            )
            .join("")}
        <p class="mix-caption"><strong>${SERVICES_PROOF.needed} of ${total} needed at least one job.</strong> Nearly three in four, and every one of them is work that would otherwise land on a fee earner.</p>
    </div>`;
}

// What one property picks up as it moves through us. Drawn as a run rather than a list because the
// point is that it is one thread — the same property_id carries the whole way.
export function propertyRun() {
    const steps = [
        ["Register", "The address off the matter", "1 second"],
        ["Value it", "Date-of-death figure and a range", "1 second"],
        ["Read the title", "Owners, charges, restrictions", "Same call"],
        ["Secure it", "Locks, drain-down, clearance", "Next day"],
        ["Sell it", "Marketing, viewings, offers", "Weeks"]
    ];

    return `<div class="ill ill--run" role="img" aria-label="What one property picks up as it moves through Sail, from registering the address to the sale">
        ${steps
            .map(
                ([title, body, when], index) => `<div class="run-step">
                    <span class="run-index">${index + 1}</span>
                    <strong>${title}</strong>
                    <p>${body}</p>
                    <span class="run-when">${when}</span>
                </div>`
            )
            .join("")}
    </div>`;
}

// ---------------------------------------------------------------------------------------
// Mock screens
// ---------------------------------------------------------------------------------------
//
// The deck was describing a product it never showed. These draw the actual thing, in LEAP's own
// grey chrome, sitting as a small window on our navy — which is the whole proposition in one
// picture: our card, inside their software.
//
// They are drawn from the same fixtures the working concept uses, so a figure here and a figure
// there cannot disagree.

function screen(title, inner, modifier) {
    return `<div class="scr ${modifier || ""}">
        <div class="scr-bar"><span class="scr-dots"><i></i><i></i><i></i></span>${title}</div>
        <div class="scr-body">${inner}</div>
    </div>`;
}

// The card, in the two states that matter: before anyone has pressed it, and after. Everything the
// pitch turns on is in the gap between these two panes.
export function sailCardMock() {
    const before = `
        <div class="mk-row"><span class="mk-label">Address</span><span class="mk-field">7 Kelvedon Court, Chelmsford, CM2 6XG</span></div>
        <div class="mk-row"><span class="mk-label">Value at date of death</span><span class="mk-field mk-field--empty">Required for IHT400</span></div>
        <div class="mk-card">
            <span class="mk-card-head">Sail Homes</span>
            <p class="mk-card-lede">Value this property <strong>as at the date of death</strong>. Free to the estate.</p>
            <span class="mk-btn">Get an HMRC-compliant valuation</span>
            <p class="mk-card-note">A valuer visits and writes it up, in three to four days. The registered title comes back straight away.</p>
            <div class="mk-alt">
                <span class="mk-btn mk-btn--ghost">Get an estimate instead</span>
                <p class="mk-card-note">Automated, about a second. Enough to see whether the estate is taxable.</p>
            </div>
        </div>`;

    const after = `
        <div class="mk-row"><span class="mk-label">Address</span><span class="mk-field">7 Kelvedon Court, Chelmsford, CM2 6XG</span></div>
        <div class="mk-row"><span class="mk-label">Value at date of death</span><span class="mk-field mk-field--filled">£565,000</span></div>
        <div class="mk-card mk-card--done">
            <span class="mk-card-head">Sail Homes</span>
            <div class="mk-booked">Valuation booked. A valuer calls the executor within one working day.</div>
            <div class="mk-figure">
                <span class="mk-figure-label">Value at date of death</span>
                <strong>£565,000</strong>
                <span class="mk-figure-sub">08/06/2026 · the figure for the IHT400</span>
            </div>
            <p class="mk-card-note">Owners, charges and restrictions have landed on the Debts page.</p>
        </div>`;

    return `<div class="ill ill--two">
        ${screen("Estate Administration — Assets → Properties", before)}
        ${screen("Estate Administration — Assets → Properties", after, "scr--lit")}
    </div>`;
}

// What the practitioner actually wants off this screen: the date-of-death figure for the IHT400,
// and what it would sell for. Deliberately nothing else — the earlier version buried both under a
// confidence meter, a tax-exposure panel and a relief calculator.
export function valuationMock() {
    return screen(
        "Assets → Properties — valuation",
        `<div class="mk-vals">
            <div class="mk-val mk-val--lead">
                <span>Value at date of death</span>
                <strong>£565,000</strong>
                <small>8 June 2026 · the figure for the IHT400</small>
            </div>
            <div class="mk-val">
                <span>Marketing price</span>
                <strong>£575,000</strong>
                <small>what we would list it at</small>
            </div>
            <div class="mk-val">
                <span>Likely to achieve</span>
                <strong>£549,000</strong>
                <small>what we think it sells for</small>
            </div>
        </div>
        <p class="mk-foot">Seven comparable sales behind it, listed in the report.</p>`,
        "scr--wide"
    );
}


// The two routes into deferred billing. The signature is always the executors', never the firm's,
// and the drawing exists to make that unmissable — it is the first thing a compliance officer asks.
export function billingJourney() {
    return `<div class="ill ill--paths">
        <div class="paths">
            ${BILLING_PATHS.map(
                (path, index) => `<article class="path">
                    <span class="path-index">${index + 1}</span>
                    <strong>${path.name}</strong>
                    <p>${path.body}</p>
                    <span class="path-step">${path.step}</span>
                </article>`
            ).join("")}
        </div>
        <p class="path-note">Either way the agency agreement is signed by <strong>the executors</strong>. The practitioner never instructs the sale, and the estate is free to appoint someone else — in which case the jobs are simply invoiced when they finish.</p>
    </div>`;
}


// The referral model. The average sale price is an assumption and the slide says so, because the
// table only means anything once LEAP swaps their own number in.
export function referralTable() {
    const gbp = (n) => "£" + n.toLocaleString("en-GB");

    return `<div class="ill ill--referral">
        <div class="ref-head">
            <span class="ref-rate">${REFERRAL.rate}</span>
            <span class="ref-basis">${REFERRAL.basis}<em>Our agency fee is ${REFERRAL.agencyFee}. This comes out of it.</em></span>
        </div>
        <table class="grid-table">
            <thead><tr><th>Valuations a year</th><th>Sales, at ${REFERRAL.conversion}</th><th>To LEAP</th></tr></thead>
            <tbody>
                ${REFERRAL.volumes
                    .map(([vals, sales, total]) => `<tr><td>${vals.toLocaleString("en-GB")}</td><td>${sales}</td><td><strong>${gbp(total)}</strong></td></tr>`)
                    .join("")}
            </tbody>
        </table>
        <p class="ref-note"><strong>${REFERRAL.conversion} is our live conversion</strong> from valuation to a sale we handle. Worked at an average sale price of ${gbp(REFERRAL.assumedPrice)} — ${gbp(REFERRAL.perSale)} a sale. Put your own volume and average in and the table moves.</p>
    </div>`;
}

// ---------------------------------------------------------------------------------------
// The value stack
// ---------------------------------------------------------------------------------------

// Hormozi's stack, priced in the currency that actually changes hands here. The estate pays for the
// work either way, so totalling money would be dishonest — what the practitioner gets back is the
// finding, chasing and reconciling, and that is measured in hours.
export function valueStack() {
    const hours = VALUE_STACK.reduce((total, row) => total + row[4], 0);

    return `<div class="ill ill--stack">
        <table class="stack-table">
            <thead>
                <tr><th>What the file needs</th><th>Handled from the desk</th><th>Handled by Sail</th><th class="num">Hours back</th></tr>
            </thead>
            <tbody>
                ${VALUE_STACK.map(
                    ([need, today, , withUs, hrs]) => `<tr>
                        <td><strong>${need}</strong></td>
                        <td class="dim">${today}</td>
                        <td class="win">${withUs}</td>
                        <td class="num"><strong>${hrs}</strong></td>
                    </tr>`
                ).join("")}
            </tbody>
            <tfoot>
                <tr><td colspan="3">Per matter, on a property that behaves</td><td class="num"><strong>${hours} hrs</strong></td></tr>
            </tfoot>
        </table>
        <p class="stack-note">${VALUE_STACK_NOTE} <em>Hours are our estimate — put your own in.</em></p>
    </div>`;
}

// ---------------------------------------------------------------------------------------
// What it costs to do nothing
// ---------------------------------------------------------------------------------------

// Council tax on an empty probate property runs to a published timetable, so the cost of a slow
// start is not a matter of opinion. Drawn as a clock because the point is that it is already
// running.
export function emptyHouseClock() {
    return `<div class="ill ill--clock">
        <div class="clock-row">
            ${EMPTY_HOUSE_CLOCK.map(
                ([when, what, why, tone]) => `<article class="tick tick--${tone}">
                    <span class="tick-when">${when}</span>
                    <strong>${what}</strong>
                    <p>${why}</p>
                </article>`
            ).join("")}
        </div>
        <p class="clock-lead">Council tax is only the part with a published date on it.</p>
        <div class="clock-also">
            ${EMPTY_HOUSE_ALSO.map(([name, body]) => `<div class="leak"><strong>${name}</strong><span>${body}</span></div>`).join("")}
        </div>
    </div>`;
}

// Whatever the property throws up, the price is already set. This is the answer to the question a
// fee earner asks before they will order anything: what is this going to cost.
export function rateCard() {
    return `<div class="ill ill--rates">
        <div class="rates-split">
            <section class="rates-col">
                <h3 class="rates-head">Fixed fee, published</h3>
                <div class="rates">
                    ${RATE_CARD.map(
                        ([job, price, count]) => `<div class="rate">
                            <span>${job}<em>${count}</em></span>
                            <strong>${price}</strong>
                        </div>`
                    ).join("")}
                </div>
            </section>
            <section class="rates-col rates-col--quoted">
                <h3 class="rates-head">Quoted on the property</h3>
                <div class="rates">
                    ${RATE_CARD_QUOTED.map(
                        ([job, range, typical, count]) => `<div class="rate rate--quoted">
                            <span>${job}<em>${count}</em></span>
                            <strong>${range}<em>${typical}</em></strong>
                        </div>`
                    ).join("")}
                </div>
            </section>
        </div>
        <p class="rates-note">${RATE_CARD_NOTE}</p>
    </div>`;
}

// ---------------------------------------------------------------------------------------
// Proof of demand
// ---------------------------------------------------------------------------------------

// Three real matters, chosen for the chaos rather than the money. A practitioner reads these and
// recognises a fortnight of their own life in each one.
export function caseStudies() {
    return `<div class="ill ill--cases">
        ${CASE_STUDIES.map(
            (study) => `<article class="case">
                <img class="case-photo" src="${study.photo}" alt="${study.place}" loading="lazy" />
                <span class="case-place">${study.place}</span>
                <strong>${study.line}</strong>
                <p>${study.body}</p>
                <div class="case-numbers">
                    ${study.numbers.map(([label, value]) => `<span><em>${label}</em>${value}</span>`).join("")}
                </div>
                <p class="case-outcome">${study.outcome}</p>
            </article>`
        ).join("")}
    </div>`;
}

// ---------------------------------------------------------------------------------------
// The concept, live in the slide
// ---------------------------------------------------------------------------------------

// Not a screenshot. The working concept, running in an iframe, so the reader can press the button
// and watch the file unblock without leaving the deck.
//
// Two things this has to solve. The concept is laid out for a desktop window, so it renders at full
// width and is scaled down with a transform rather than squashed. And a click inside an iframe
// never reaches the parent document, so the deck's arrow keys stop working the moment someone
// interacts — hence the hint, and the click-catcher in deck.js that takes focus back.
export function liveFrame(hash, hint, height = 660) {
    // Same reasoning as the report frame: the concept is laid out for a desktop window and is
    // scaled down rather than squashed, and the scale is a media query rather than a number baked
    // in here — a 1280x800 laptop cannot give this the height a 1440x900 can, and the hint
    // underneath has to stay on screen either way.
    const width = 1280;

    return `<figure class="ill ill--live">
        <div class="live-shell live-shell--app">
            <iframe
                class="live-frame live-frame--app"
                src="../leap-estates-valuation/?embed=1&v=20260915m#${hash}"
                title="The Sail card on LEAP's Assets, Properties page — live and clickable"
                loading="lazy"
                style="width:${width}px;height:${height}px"
            ></iframe>
        </div>
        <figcaption class="live-hint">
            <span class="live-dot"></span>
            <strong>This one is live.</strong> ${hint}
            <em>Click the dark area to get the arrow keys back.</em>
        </figcaption>
    </figure>`;
}

// ---------------------------------------------------------------------------------------
// The report itself
// ---------------------------------------------------------------------------------------

// LEAP's reading of the demo was that ordering a valuation produced a number. It produces a
// document, and on a taxable estate the document is the argument — so this frame is the real
// thing, scrollable, rather than three figures in a box. The declaration he asked for is four
// scrolls down, which is why the hint points at it.
export function reportFrame() {
    // Rendered at desktop width and scaled down in CSS, so the document keeps its real
    // proportions. The scale is a media query rather than a number baked in here, because a
    // 1280x800 laptop cannot give this the height a 1440x900 can and the hint underneath has to
    // stay on screen either way.
    const width = 1060;
    const height = 850;

    return `<figure class="ill ill--live ill--report">
        <div class="live-shell live-shell--report">
            <iframe
                class="live-frame live-frame--report"
                src="../leap-estates-valuation/?embed=1&v=20260915m#report/adeyemi"
                title="A Sail probate valuation report, as the practitioner receives it"
                loading="lazy"
                style="width:${width}px;height:${height}px"
            ></iframe>
        </div>
        <figcaption class="live-hint">
            <span class="live-dot"></span>
            <strong>Scroll this one.</strong> It is the document, not a picture of one.
            <em>Click the dark area to get the arrow keys back.</em>
        </figcaption>
    </figure>`;
}

// ---------------------------------------------------------------------------------------
// Handled in-house, versus handled by us
// ---------------------------------------------------------------------------------------

// The one picture that carries the whole practitioner argument: on the left, every thread the fee
// earner is holding; on the right, one. Drawn as SVG because the point of the left panel is the
// crossing lines, and crossing lines are the one thing a list of bullets cannot show.
//
// The right panel deliberately keeps all nine parties visible rather than hiding them — the work
// does not vanish, it moves. Claiming it disappears would be the kind of thing a practitioner
// disbelieves on sight.
export function chaosVersusContained() {
    const cx = 250;
    const cy = 196;
    const radius = 152;

    const nodes = CHAOS_PARTIES.map((label, i) => {
        const angle = (-90 + i * (360 / CHAOS_PARTIES.length)) * (Math.PI / 180);
        return { label, x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
    });

    const spokes = nodes
        .map((n) => `<line x1="${cx}" y1="${cy}" x2="${n.x.toFixed(1)}" y2="${n.y.toFixed(1)}" class="wire" />`)
        .join("");

    const cross = CHAOS_CROSS.map(([a, b]) =>
        `<line x1="${nodes[a].x.toFixed(1)}" y1="${nodes[a].y.toFixed(1)}" x2="${nodes[b].x.toFixed(1)}" y2="${nodes[b].y.toFixed(1)}" class="wire wire--cross" />`
    ).join("");

    const pins = nodes
        .map(
            (n) => `<g class="pin" transform="translate(${n.x.toFixed(1)},${n.y.toFixed(1)})">
                <circle r="5" />
                <text y="${n.y < cy ? -12 : 20}" text-anchor="middle">${n.label}</text>
            </g>`
        )
        .join("");

    const left = `<svg viewBox="0 0 500 400" class="wires" role="img" aria-label="A fee earner at the centre of nine separate threads — three agents, a surveyor, a clearance firm, a locksmith, an EPC assessor, an insurer and the executor — with traffic crossing between them">
        ${spokes}${cross}
        <circle cx="${cx}" cy="${cy}" r="42" class="hub" />
        <text x="${cx}" y="${cy - 4}" class="hub-label" text-anchor="middle">Fee</text>
        <text x="${cx}" y="${cy + 13}" class="hub-label" text-anchor="middle">earner</text>
        ${pins}
    </svg>`;

    const right = `<div class="contained">
        ${CONTAINED.map(
            (step, i) => `<div class="step ${i === 1 ? "step--ours" : ""}">
                <strong>${step[0]}</strong>
                <p>${step[1]}</p>
            </div>${i < CONTAINED.length - 1 ? '<span class="step-arrow" aria-hidden="true"></span>' : ""}`
        ).join("")}
        <div class="step-fan">
            ${CHAOS_PARTIES.filter((p) => p !== "The executor").map((p) => `<span>${p}</span>`).join("")}
        </div>
    </div>`;

    return `<div class="ill ill--chaos">
        <figure class="panel panel--chaos">
            <figcaption><span class="panel-tag panel-tag--bad">Handled in-house</span></figcaption>
            ${left}
            <p class="panel-note">${CHAOS_NOTE}</p>
        </figure>
        <figure class="panel panel--calm">
            <figcaption><span class="panel-tag panel-tag--good">Handled by us</span></figcaption>
            ${right}
            <p class="panel-note">${CONTAINED_NOTE}</p>
        </figure>
    </div>`;
}
