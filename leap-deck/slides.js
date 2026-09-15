// Every word on the stage. Numbers live in figures.js, drawn things in illustrations.js.
//
// Rebuilt to ten slides after a Hormozi read of the twenty-three-slide version. That deck was 1,973
// words with twenty-three headlines making twenty-three arguments, and the offer — "we value
// probate property free, inside LEAP, and pay you 0.2% when it sells" — appeared on none of them.
//
// Four rules came out of that read:
//
//   1. State the offer in one line, on slide one, and repeat it.
//   2. LEAP sells to probate practitioners, so the value has to be priced in THEIR currency.
//      The estate pays for the work either way; what the practitioner gets back is time and chaos.
//   3. Why now is cost of inaction, not manufactured scarcity — the firm's margin and the estate's
//      council tax bill are both running today.
//   4. The practitioner material is proof of demand, not a second argument.
//
// Mechanics that used to have slides of their own — billing routes, the services catalogue, the
// property run — now live in the working concept, which is linked from the cover.

import {
    LINKS,
    AS_AT,
    SAIL,
    PROOF,
    PROBLEM,
    COST_TO_FIRM,
    PRICE,
    REFERRAL,
    SERVICES_PROOF,
    VALUERS,
    EFFORT,
    LEAK_HEADLINE,
    PHASES,
    PHASES_NOTE,
    ASKS
} from "./figures.js?v=20260915m";
import {
    liveFrame,
    reportFrame,
    chaosVersusContained,
    valueStack,
    emptyHouseClock,
    rateCard,
    caseStudies,
    serviceMix,
    referralTable,
} from "./illustrations.js?v=20260915m";

export const SLIDES = [
    {
        key: "offer",
        layout: "cover",
        render: () => `
            <p class="eyebrow">Sail × LEAP Estates</p>
            <h1 class="mega-title">We value probate property free, inside LEAP, and pay you 0.2% when it sells.</h1>
            <p class="sub">${SAIL.oneLine} ${PROOF[2].figure} law firms already use us. This is what it looks like on the Properties page, and what it is worth to the practices using it.</p>
            <p class="micro">Every screen in here is clickable. <a href="${LINKS.demo}">Open the working concept</a> and drive it yourself.</p>
            <p class="foot">Trading figures are live, taken ${AS_AT}. Product screens are concepts and are marked as such.</p>`
    },

    {
        key: "problem",
        layout: "custom",
        render: () => `
            <p class="eyebrow">Where the file stops</p>
            <h2 class="big-title">Every probate file stops in the same place</h2>
            <p class="sub">The address is already on the matter, carried in from <em>About the deceased</em>. There is nowhere to get a value from, and the tax pages cannot be finished without one.</p>`,
        custom: () => liveFrame("matter/adeyemi/properties", "Press the highlighted button. The registered title lands straight away, the charge appears on <strong>Debts</strong>, and the warning badges clear.")
    },

    {
        key: "cost-estate",
        layout: "custom",
        render: () => `
            <p class="eyebrow">What the waiting costs</p>
            <h2 class="big-title">${LEAK_HEADLINE}</h2>`,
        custom: emptyHouseClock
    },

    {
        key: "cost-firm",
        layout: "custom",
        render: () => `
            <p class="eyebrow">What that costs the practice</p>
            <h2 class="big-title">${COST_TO_FIRM.headline}</h2>
            <p class="sub">${COST_TO_FIRM.body}</p>`,
        custom: chaosVersusContained
    },

    {
        key: "result",
        layout: "custom",
        render: () => `
            <p class="eyebrow">What comes back</p>
            <h2 class="big-title">A report that says, in terms, what basis the figure is on</h2>
            <p class="sub">Not a number in an email. The declaration under <strong>section 160 of the Inheritance Tax Act 1984</strong>, the sales it was reached from, and a named basis, date and reference at the foot.</p>`,
        custom: reportFrame
    },

    {
        key: "services",
        layout: "custom",
        render: () => `
            <p class="eyebrow">And the rest of the property</p>
            <h2 class="big-title">Clearances, drain-downs and locks, ordered from the same matter</h2>`,
        custom: () => liveFrame("matter/adeyemi/services", "Follow the two markers — switch the billing route, then instruct a <strong>lock change</strong> at the price already on the card.")
    },

    {
        key: "rates",
        layout: "custom",
        render: () => `
            <p class="eyebrow">And it is all priced already</p>
            <h2 class="big-title">Whatever the property throws up, we have already priced it a hundred times</h2>`,
        custom: rateCard
    },

    {
        key: "services-proof",
        layout: "custom",
        render: () => `
            <p class="eyebrow">And these jobs are common</p>
            <h2 class="big-title">Three in four of our last 250 properties needed work</h2>
            <p class="sub">Our own supplier panel, our own quoting and invoicing. The estate pays either way; what changes is that nobody at the firm has to find three tradesmen and chase them.</p>`,
        custom: serviceMix
    },

    {
        key: "stack",
        layout: "custom",
        render: () => `
            <p class="eyebrow">What one partner is worth</p>
            <h2 class="big-title">One supplier for the whole property, and the hours back</h2>`,
        custom: valueStack
    },

    {
        key: "cases",
        layout: "custom",
        render: () => `
            <p class="eyebrow">Three real matters</p>
            <h2 class="big-title">Common problems, and what this approach did with them</h2>`,
        custom: caseStudies
    },

    {
        key: "proof",
        layout: "stats",
        render: () => `
            <p class="eyebrow">Why you can believe it</p>
            <h2 class="big-title">Probate is not a side line for us</h2>
            <div class="stat-grid">
                ${PROOF.map(
                    (item) => `<div class="stat">
                        <span class="stat-figure">${item.figure}</span>
                        <strong>${item.label}</strong>
                        <small>${item.note}</small>
                    </div>`
                ).join("")}
            </div>
            <p class="micro">Our valuers came out of valuing for banks and building societies on repossessions, where a figure has to hold up. ${VALUERS[2][1]} Out of our own database on ${AS_AT} — happy to show you the query.</p>`
    },

    {
        key: "referral",
        layout: "custom",
        background: "paper",
        render: () => `
            <p class="eyebrow">What LEAP earns</p>
            <h2 class="big-title">${REFERRAL.rate} of every completed sale</h2>
            <p class="sub">Free to your customers and their clients — ${PRICE.estate} to the estate, ${PRICE.firm} to the firm. Paid by us, out of our own fee, when a sale completes.</p>`,
        custom: referralTable
    },

    {
        key: "build",
        layout: "table",
        render: () => `
            <p class="eyebrow">What it costs you to build</p>
            <h2 class="big-title">Two API requests for release one</h2>
            <table class="grid-table grid-table--phases">
                <tbody>
                    ${PHASES.map(
                        ([number, title, note, tone]) => `<tr class="${tone ? `phase--${tone}` : ""}">
                            <td class="phase-number">${number}</td>
                            <td><strong>${title}</strong></td>
                            <td>${note}</td>
                        </tr>`
                    ).join("")}
                </tbody>
            </table>
            <p class="micro">${EFFORT[1][1]} ${EFFORT[3][1]} ${PHASES_NOTE}</p>`
    },


    {
        key: "ask",
        layout: "list",
        render: () => `
            <p class="eyebrow">What we are asking for</p>
            <h2 class="big-title">Three things, and none of them commit you</h2>
            <div class="rows">
                ${ASKS.map(([title, copy]) => `<div class="row"><div class="row-main"><strong>${title}</strong><p>${copy}</p></div></div>`).join("")}
            </div>
            <p class="micro"><a href="${LINKS.demo}">The working concept</a> · <a href="${LINKS.docs}">The API reference</a> — billing routes, the full services list and the property journey all live in the concept.</p>`
    }
];
