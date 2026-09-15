// Every number on the stage. Nothing in slides.js writes a figure, so a value cannot be corrected
// here and left stale on a slide.
//
// TRADING FIGURES ARE LIVE. Pulled from the production database on 3 September 2026 — the query is
// recorded next to each block so any of them can be re-run before this is sent again. The first
// version of this deck asserted "best in class" and proved nothing, which is the fastest way to
// lose a room of software people. Everything here is countable.
//
// STATUTORY FIGURES carry their source too. LEAP sells to solicitors, and a deck that gets a
// section number wrong is worse than one that omits it.

export const AS_AT = "3 September 2026";

export const LINKS = {
    demo: "../leap-estates-valuation/",
    properties: "../leap-estates-valuation/#matter/adeyemi/properties",
    services: "../leap-estates-valuation/#matter/adeyemi/services",
    hollis: "../leap-estates-valuation/#matter/hollis/properties",
    guide: "../leap-estates-valuation/#guide",
    docs: "../sail-api-docs/"
};

// Who we are. This slide did not exist in the first version, and eight cold readers of the L&C deck
// all failed the same way: nobody could say what Sail was. Same mistake, so it is fixed the same way.
export const SAIL = {
    oneLine: "We are an estate agent built around probate property.",
    founded: "2019",
    coverage: "England and Wales",
    unusual: "We might end up selling the house. That is what pays for the valuation, so nobody else has to."
};

// SELECT COUNT(*) FROM listings WHERE reason_for_sale = 'probate' ...
// SELECT COUNT(DISTINCT introducer_id) FROM cases WHERE has_introducer ...
// SELECT COUNT(*) FROM cases WHERE is_instructed IS NOT NULL
export const PROOF = [
    { figure: "822", label: "probate properties handled", note: "in the last year" },
    { figure: "1,856", label: "probate properties in all", note: "since we started" },
    { figure: "31", label: "law firms use us for probate valuations", note: "we cannot tell which use LEAP — you can" },
    { figure: "563", label: "empty houses looked after", note: "locks, drain-downs, clearances" }
];

// SELECT type, COUNT(*), COUNT(DISTINCT listing_id) FROM retool.listing_service GROUP BY type
// The point of this block is that it is a count of work done, not a list of things we offer.
// The last 250 properties we were instructed to sell. Instructed is the honest denominator —
// services only happen on a property we are actually selling — and the most recent 250 reflects
// how the operation runs now rather than averaging in its first year.
//
// WITH last_250 AS (SELECT id FROM listings WHERE instructed_date IS NOT NULL
//                   ORDER BY instructed_date DESC LIMIT 250)
// 186 of 250 needed at least one job.
export const SERVICES_PROOF = {
    jobs: "1,109",
    window: 250,
    needed: 186,
    pct: "74%",
    since: "June 2024",
    mostRecent: "today",
    // Refurb and minor refurbishment are one line, because to a practitioner they are one job.
    mix: [
        ["EPC", 132],
        ["House clearance", 88],
        ["Drain down", 20],
        ["Refurbishment", 19],
        ["Lock change", 11],
        ["Property inspection", 10],
        ["Garden tidy", 7],
        ["Property inventory", 6]
    ]
};

// The problem, in the practitioner's own week. LEAP University teaches Estate Administration in
// eight steps; step 4 is Adding Assets and its first sub-page is Properties.
export const PROBLEM = {
    step: "Step 4 of eight",
    page: "Assets → Properties",
    blocked: ["Calculations", "The nil rate band", "The IHT400"],
    line: "The practitioner types the address, and then has nowhere to get a value from."
};

// What it costs to leave it. Each of these is a real route a firm takes today, with its real cost.
export const TODAY = [
    { route: "Three high-street agents", cost: "Free", problem: "Valuing to win the instruction, not to be filed. Three numbers that rarely agree." },
    { route: "A surveyor's report", cost: "£500+", problem: "Payable now, from an estate with no money in it yet." }
];

// The stack. Hormozi's rule and the only honest way to price at zero: show everything included, then
// show the price. If the list is long enough, free stops sounding like a catch.
export const STACK = [
    ["An estimate, straight away", "So the file can move today"],
    ["A full valuation, in a few days", "A valuer visits and writes it up"],
    ["Who owned it, and what is owed", "Read off the title. Nobody types it in"],
    ["Any mortgage on the property", "Lands on the Debts page, named and dated"],
    ["The house looked after", "Locks, drain-down, clearance, EPC"],
    ["HMRC questions answered", "If they query the figure, we argue it"],
    ["Conveyancing, if you want it", "Keep your own and the sale still reaches you in better shape"]
];

export const VALUERS = [
    ["An experienced team", "Not a panel we buy in from. Thousands of valuations between them."],
    ["Trained where it counts", "They came from valuing for banks and building societies on repossessions, where a figure has to hold up."],
    ["Probate is the day job", "Not an occasional instruction. It is what they do."]
];

export const PRICE = { estate: "£0", firm: "£0" };

// Two ways to be billed for the property services. The second is the one that solves the pre-grant
// cash problem, and it is conditional — say so, because a practitioner who finds out later has been
// misled.
export const BILLING = [
    {
        name: "When the job is done",
        body: "The supplier finishes. We invoice. The estate settles it in the ordinary way.",
        when: "On every job",
        condition: null
    },
    {
        name: "When the house sells",
        body: "We pay the supplier now and invoice on completion, so nothing leaves client account before the grant.",
        when: "Out of the sale proceeds",
        condition: "Needs our agency agreement signed by the executors first."
    }
];

// The deferred route needs an agency agreement in place, and a matter can reach that point from
// two directions. Worth drawing, because "who signs what, and when" is the first thing a
// practitioner's compliance officer asks — and it is the executors who sign, never the firm.
export const BILLING_PATHS = [
    {
        name: "Already with us",
        body: "The executors took a valuation earlier and appointed us to sell. The agreement is signed, so deferred billing is available the moment a job is ordered.",
        step: "Nothing more to do"
    },
    {
        name: "Deciding here",
        body: "The practitioner wants a clearance now and the estate has not appointed an agent yet. We send the agency agreement to the executors, and jobs can be deferred once it is back.",
        step: "One signature, from the executors"
    }
];

// Risk reversal. These are real undertakings we already make, and the first version buried all three
// as features. A guarantee named as a guarantee does more work than the same sentence as a bullet.
export const GUARANTEES = [
    {
        name: "It costs nothing",
        body: "Both valuations, free. No tie-in. The estate can still sell with anyone."
    },
    {
        name: "We answer HMRC, not you",
        body: "If the Valuation Office queries the figure, we argue it and we pay for it."
    },
    {
        name: "Your firm can rely on it",
        body: "The report names the executors, their solicitor and HMRC as people who can rely on the figure."
    }
];

// Time to value, and effort to get it. The two denominators.
export const SPEED = [
    ["Straight away", "An estimate, while they are still on the page."],
    ["Next working day", "A valuer rings the executor and books a time."],
    ["Three to four days", "The visit happens. The written valuation lands."],
    ["Whenever it suits", "The practitioner can order it, ignore it, or come back later."]
];

export const EFFORT = [
    ["Two API requests", "One registers the property. One values it. That is the release."],
    ["No new fields", "LEAP already collects every one of them at steps 1 and 2."],
    ["An app, not a build", "It sits in your marketplace like any other third-party app."],
    ["Nothing to switch off", "Ignore the card and nothing about the matter changes."]
];

// One claim, three supports. The earlier version was six rows of benefits with no through-line,
// which is a list rather than a message.
export const FOR_THE_FIRM = [
    {
        claim: "A figure the day they ask",
        detail: "An estimate now. The written valuation in three to four days.",
        where: "Assets → Properties"
    },
    {
        claim: "The title, written onto the matter",
        detail: "Owners and any mortgage arrive with it, so nobody has to go looking.",
        where: "Liabilities → Debts"
    },
    {
        claim: "The house looked after until it sells",
        detail: "Locks, drain-down, clearance, EPC. Ordered from the file.",
        where: "Assets → Property services"
    }
];

// Why us. The first version asserted nothing here, which meant "best in class" was left for the
// reader to assume. Each row is a thing a competitor structurally cannot do.
export const WHY_US = [
    { claim: "Probate is the whole business", body: "Not a market we serve. The thing we are built around." },
    { claim: "We value it because we might sell it", body: "That is what pays for all of this." },
    { claim: "We hold the sale price too", body: "Which is the half of a s.191 claim nobody else sees." },
    { claim: "The suppliers are ours", body: "1,109 jobs on 563 empty houses, and it runs every day." },
    { claim: "We are still there afterwards", body: "A valuer files the report and leaves. The house still has to be secured, cleared and sold." }
];




// IHTA 1984 s.160, quoted in full. legislation.gov.uk/ukpga/1984/51/section/160
export const S160 =
    "Except as otherwise provided by this Act, the value at any time of any property shall for the "
    + "purposes of this Act be the price which the property might reasonably be expected to fetch if "
    + "sold in the open market at that time; but that price shall not be assumed to be reduced on the "
    + "ground that the whole property is to be placed on the market at one and the same time.";

export const HMRC = [
    {
        ref: "IHTM36275",
        quote: "an open market valuation in accordance with s.160",
        gloss: "What HMRC tells its own staff executors should ask a valuer for."
    },
    {
        ref: "IHTM21011",
        quote: "which states that it has been prepared on the basis of the open market value and/or in the terms of S160",
        gloss: "A professional valuation saying that will usually be accepted. So the test is what the report says about itself."
    }
];

// The declaration as it now prints, verbatim from ValuationReport.tsx.
export const DECLARATION =
    "This valuation is prepared on the basis of market value as defined by section 160 of the "
    + "Inheritance Tax Act 1984 — the price the property might reasonably be expected to fetch if "
    + "sold in the open market at that date. No reduction has been made on the grounds that the whole "
    + "of the property is to be placed on the market at one and the same time.";

export const RELIANCE =
    "This report is prepared for the personal representatives of the estate. It may also be relied "
    + "upon by their legal advisers, and by HM Revenue & Customs and the Valuation Office Agency, for "
    + "the purpose of the inheritance tax account.";

export const ABOUT_FIELDS = [
    ["Prepared by", "Sail Homes"],
    ["Valuation date", "The date of death, not the date we valued"],
    ["Basis", "Open market value, s.160 IHTA 1984"],
    ["Inspection", "Whether we went inside, outside, or worked from records"],
    ["Evidence", "Every comparable sale, listed"],
    ["Reference", "So it can be quoted back at us, or at the Valuation Office"]
];

// s.191 / s.197A / IHT38. Statutory, not ours.
export const S191 = [
    ["Window", "Three years from the death. A fourth under s.197A."],
    ["Claimed on", "Form IHT38."],
    ["Floor", "The lower of £1,000 and 5% of the death value."],
    ["All or none", "Every piece of land sold in the window goes in."],
    ["Not to family", "A sale to a beneficiary kills the claim."]
];



export const PHASES = [
    ["1", "The card, and the estimate", "A card on Assets → Properties and two API requests. On its own this is a useful release.", "next"],
    ["2", "The full valuation, writing back", "The same card orders it. Owners and any mortgage land on the Debts page when it returns.", ""],
    ["3", "The property services panel", "A second page under Assets, reading and ordering against the services endpoints.", ""]
];

export const PHASES_NOTE =
    "Sale of Estate — quoting and instructing the conveyancing — already runs on our side and needs"
    + " no build from you. It stays switched off until you want it.";

// A referral fee of 0.1% of the sale price, paid on completion. The average sale price is an
// ASSUMPTION and is labelled as one on the slide — swap in LEAP's own and the table moves.
export const REFERRAL = {
    rate: "0.2%",
    basis: "of the sale price, paid on completion",
    agencyFee: "1.5%",
    conversion: "26%",
    assumedPrice: 300000,
    perSale: 600,
    // Valuations first, because that is the number LEAP can estimate from its own probate volume.
    // Sales are those valuations at our live conversion rate; the fee follows.
    volumes: [
        [500, 130, 78000],
        [1000, 260, 156000],
        [2000, 520, 312000]
    ]
};

export const ASKS = [
    ["Twenty minutes with your product team", "To agree exactly where the card sits on the Properties page. Ours is a best guess from your public screens."],
    ["Three firms to pilot it", "We know this is your relationship we are borrowing. Pick practices with probate volume, we onboard them, and you see how it goes before anyone commits."],
    ["A date", "When this could be in front of your users."]
];

// ---------------------------------------------------------------------------------------
// Why now
// ---------------------------------------------------------------------------------------

// Two costs, both of them the practitioner's problem. The firm's is margin, because time spent on
// property admin under a fixed fee is unbilled. The estate's is a bill that grows on a published
// timetable. Neither needs manufactured urgency — both are running today.

export const COST_TO_FIRM = {
    headline: "Every hour on property admin comes out of the fee",
    body:
        "Probate is quoted fixed-fee more often than not. Chasing three agents for three valuations"
        + " that disagree, then sourcing a clearance, then chasing the clearance, is not billable."
        + " It is margin.",
    jobs: [
        "Find and chase three agents for a valuation",
        "Reconcile three figures that do not agree",
        "Order a title check and read it",
        "Source three suppliers for a clearance",
        "Chase the suppliers, then the invoices"
    ]
};

// Council tax on a probate property runs to a published timetable — Class F covers it for six
// months after the grant, the standard empty charge follows, and the long-term empty premium can
// be added from twelve months. Since April 2024 that premium bites at one year rather than two.
export const EMPTY_HOUSE_CLOCK = [
    ["Grant of probate", "Nothing", "Class F exemption covers the first six months", "free"],
    ["Six months on", "Full council tax", "The exemption ends. The bill starts", "full"],
    ["Twelve months on", "Double", "The long-term empty premium can be added on top", "double"]
];

// Council tax is only the part with a published date on it. These are the rest, and together they
// are why a slow property is the most expensive thing in the estate.
export const EMPTY_HOUSE_ALSO = [
    ["Interest on the charge", "A mortgage on the property keeps accruing until it is redeemed"],
    ["Insurance", "Unoccupied cover costs more and carries inspection and drain-down conditions"],
    ["Damage", "Burst pipes, damp, a leak nobody finds for a month"],
    ["Break-ins", "Empty houses attract them. One of ours had repeated ones"],
    ["Deterioration", "The garden tells the street it is empty, and the photographs show it"],
    ["Standing charges", "Utilities nobody has closed"]
];

export const LEAK_HEADLINE = "The most expensive thing in the estate loses money every week it sits";

// ---------------------------------------------------------------------------------------
// Proof of demand — three real matters
// ---------------------------------------------------------------------------------------

// Written up from live files. Deliberately not chosen for the money: every one of them is a week
// of somebody's life that did not land on the practitioner's desk.
// Whatever the property throws up, it is already priced. A rate card is the answer to "how much
// is this going to cost me" before anyone has to ask.
// Every figure here is the median of what we actually charged, off `retool.listing_service` on
// 15 September 2026, with the job count beside it. The invented rate card this replaces had a
// clearance at £1,380 flat, which was wrong twice over: a clearance is not a fixed fee, and the
// real median is £2,500.
export const RATE_CARD = [
    ["EPC", "£100", "329 jobs"],
    ["Drain down", "£320", "47 jobs"],
    ["Lock change", "£450", "34 jobs"],
    ["Property inspection", "£100", "23 jobs"],
    ["Property inventory", "£399", "21 jobs"],
    ["Deep clean", "£550", "14 jobs"]
];

// The three that cannot be a fixed fee, and are not pretended to be. The spread is the argument:
// nobody can publish a price for clearing a house they have not been inside.
export const RATE_CARD_QUOTED = [
    ["House clearance", "£1,800 – £3,100", "typically £2,500", "303 jobs"],
    ["Refurbishment", "£2,000 – £11,900", "typically £3,450", "62 jobs"],
    ["Garden clearance", "£580 – £2,000", "typically £1,600", "22 jobs"]
];

export const RATE_CARD_NOTE =
    "Published, and the same on every matter. The three on the right depend on what is inside the"
    + " house, so they are quoted on the property rather than guessed at &mdash; and the range is"
    + " what we have actually charged, not a bracket we invented. Medians and quartiles from our"
    + " own job history.";

export const CASE_STUDIES = [
    {
        place: "Follett Drive, Abbots Langley",
        photo: "./shots/case-follett-drive.jpg",
        line: "Spotted a renovation at the valuation",
        body:
            "We proposed it, the estate agreed, and we ran eleven weeks of work from asbestos removal"
            + " to redecoration.",
        numbers: [["Valued for auction", "£200,000"], ["Refurbishment", "£100,000"], ["Sold for", "£500,000"]],
        outcome: "About £170,000 more for the estate, after costs."
    },
    {
        place: "Colney Hatch Lane, London",
        photo: "./shots/case-colney-hatch.jpg",
        line: "An intestacy with sixteen beneficiaries and repeated break-ins",
        body:
            "Two houses. We organised urgent boarding-up and inspections, dealt with the police, and"
            + " provided revised date-of-death valuations along with cleaning and maintenance quotes.",
        numbers: [["Marketing price", "£550,000"], ["Achieved", "£540,000"]],
        outcome: "None of the security, the police or the quotes went near the fee earner."
    },
    {
        place: "Risborough Close, Coventry",
        photo: "./shots/case-risborough-close.jpg",
        line: "A family with special needs, and a ceiling that came down",
        body:
            "We agreed an early valuation and a plan so everyone knew the route. Our team worked with"
            + " the council on rehousing a family member, and ran an insurance claim for ceiling repairs"
            + " while the grant was still outstanding.",
        numbers: [["Offers opened at", "£150,000"], ["Closed at", "£183,000"], ["Guide", "£185,000"]],
        outcome: "Thirty-plus enquiries, handled by us."
    }
];

// ---------------------------------------------------------------------------------------
// The value stack
// ---------------------------------------------------------------------------------------

// The honest version. Most of these are chargeable and the estate pays either way — what changes
// is who does the finding, the chasing and the reconciling. So the stack is priced in the
// practitioner's time, not in money saved.
//
// HOURS ARE AN ESTIMATE and are labelled as such on the slide. Swap in real ones and it moves.
export const VALUE_STACK = [
    ["A date-of-death figure", "Chase three agents, reconcile three answers", "£500+ or three favours", "Free, on the page", 3],
    ["A figure you can file", "Instruct a valuer, wait, chase", "£500+", "Ordered from the same panel", 2],
    ["The title read", "Order it, wait, read it", "£3 and an afternoon", "Arrives with the valuation", 1],
    ["Locks and a drain-down", "Find suppliers, take quotes, chase", "Estate pays either way", "Two clicks", 2],
    ["A clearance", "Find suppliers, take quotes, chase", "Estate pays either way", "Two clicks", 3],
    ["Paying for all of it", "Estate money, before the grant", "Pre-grant cash", "Or defer it to the sale", 1]
];

export const VALUE_STACK_NOTE =
    "Most of this is chargeable work and the estate pays for it either way. What changes is who does"
    + " the finding, the chasing and the reconciling — and that is the part that is not billable.";

// ---------------------------------------------------------------------------------------
// Handled in-house, versus handled by us
// ---------------------------------------------------------------------------------------

// Everyone the fee earner ends up holding a thread with when the property is run from the desk.
// The executor is in this list deliberately: today the firm relays between the executor and every
// supplier, and that relaying is most of the work.
export const CHAOS_PARTIES = [
    "Agent one",
    "Agent two",
    "Agent three",
    "A surveyor",
    "Clearance firm",
    "Locksmith",
    "EPC assessor",
    "Insurer",
    "The executor"
];

// The cross-traffic. The locksmith needs access from the executor, the agent needs the keys, the
// insurer wants the inspection — and none of them can talk to each other, so it all routes through
// the fee earner. These pairs are drawn as the lines that make the left panel look like it feels.
export const CHAOS_CROSS = [[0, 8], [4, 5], [5, 8], [6, 4], [7, 5], [3, 8], [1, 8]];

export const CHAOS_NOTE = "Nine threads, and not one of them can talk to another without you.";

// One relationship, and we take the executor conversation too.
export const CONTAINED = [
    ["You", "Press the button on the matter"],
    ["Sail", "Values it, then holds every other thread"],
    ["The executor", "We call them. You are copied, not chasing"]
];

export const CONTAINED_NOTE = "One thread. The nine above still happen — they just happen to us.";
