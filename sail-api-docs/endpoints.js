// The Sail Property API reference, as data.
//
// Everything the LEAP integration touches, in the order a developer meets it: authenticate, put a
// property in, value it, then look after it. Request and response bodies are the real shapes — the
// same ones the concept next door builds and renders — so a payload here and a payload in the
// mockup's API panel cannot drift apart.

export const BASE_URL = "https://api.sailhomes.co.uk/api/v1";

export const AUTH = {
    header: "Authorization: Bearer <your key>",
    note:
        "One key per firm, issued to you, held on your servers. It must never reach a desktop client."
        + " Every response is scoped to the firm the key belongs to, so a practice only ever sees its"
        + " own properties."
};

export const GROUPS = [
    {
        name: "Properties",
        blurb: "A property is the thing everything else hangs off. Register it once and reuse the id.",
        endpoints: [
            {
                id: "post-properties",
                method: "POST",
                path: "/properties",
                title: "Register a property",
                body:
                    "Deduplicated on the address, so calling it twice with the same matter returns the"
                    + " same property rather than creating a second one. Nothing is ordered and nothing"
                    + " is charged.",
                request: {
                    address_line_1: "7 Kelvedon Court",
                    postcode: "CM2 6XG",
                    uprn: null,
                    client_reference: "JL/0264/2026"
                },
                status: 201,
                response: {
                    property_id: "b83f27d4-6a09-45c1-9e72-1d40b6ca8305",
                    address_line_1: "7 Kelvedon Court",
                    postcode: "CM2 6XG",
                    uprn: null,
                    client_reference: "JL/0264/2026"
                }
            },
            {
                id: "get-property",
                method: "GET",
                path: "/properties/{property_id}",
                title: "Everything on one property",
                body: "The property, every valuation against it, the title check and the services. One call for a whole panel.",
                status: 200,
                response: {
                    property_id: "b83f27d4-6a09-45c1-9e72-1d40b6ca8305",
                    address_line_1: "7 Kelvedon Court",
                    postcode: "CM2 6XG",
                    valuations: ["…"],
                    title_check: "…",
                    services: ["…"]
                }
            }
        ]
    },
    {
        name: "Valuations",
        blurb: "Two kinds, and they do different jobs. Read the note before you pick one.",
        endpoints: [
            {
                id: "post-instant",
                method: "POST",
                path: "/valuations/instant",
                title: "An instant valuation",
                body:
                    "Automated and synchronous — back in about a second. Send <code>valuation_date</code>"
                    + " as the date of death and the figure is adjusted back to it, which is the number"
                    + " the IHT400 asks for rather than today's price. Every property field is optional;"
                    + " each one you send narrows the range.",
                request: {
                    property_id: "b83f27d4-6a09-45c1-9e72-1d40b6ca8305",
                    valuation_date: "2026-06-08",
                    property_type: "detached",
                    bedrooms: 4,
                    condition: "average"
                },
                status: 200,
                response: {
                    valuation_id: "9f14c7e2-4b83-4a17-9d52-3e08f1a6b204",
                    property_id: "b83f27d4-6a09-45c1-9e72-1d40b6ca8305",
                    status: "COMPLETED",
                    valuation_date: "2026-06-08",
                    prices: {
                        market_price_pence: 56500000,
                        to_achieve_pence: 54900000,
                        date_of_death_value_pence: 56500000
                    },
                    range: { low_pence: 52200000, high_pence: 60900000 },
                    confidence: { band: "MEDIUM", score: 61 },
                    basis: { comps_count: 7 }
                }
            },
            {
                id: "post-full",
                method: "POST",
                path: "/valuations/full",
                title: "A full valuation",
                body:
                    "A valuer visits the property and writes it up on the section 160 basis. It returns"
                    + " no price, because the price arrives with the report a few days later. What it"
                    + " does return, synchronously, is the registered title.",
                request: {
                    property_id: "b83f27d4-6a09-45c1-9e72-1d40b6ca8305",
                    valuation_date: "2026-06-08",
                    deceased_name: "Samuel Adeyemi",
                    executor: { first_name: "Bisi", last_name: "Adeyemi", email: "b.adeyemi@example.com", phone_number: "07700900118" }
                },
                status: 201,
                response: {
                    valuation_id: "d92e5a01-7c36-4b84-a1f5-60d3819ce472",
                    property_id: "b83f27d4-6a09-45c1-9e72-1d40b6ca8305",
                    status: "booked",
                    title_check: {
                        title_number: "EX611430",
                        tenure: "freehold",
                        proprietors: ["…"],
                        flags: { has_form_a_restriction: "yes", has_charge: "yes" },
                        entries: ["…"],
                        findings: ["…"]
                    }
                }
            },
            {
                id: "get-valuation",
                method: "GET",
                path: "/valuations/{valuation_id}",
                title: "Read a valuation back",
                body: "Poll this for the written valuation. Ready when <code>status</code> is <code>completed</code>.",
                status: 200,
                response: {
                    valuation_id: "d92e5a01-7c36-4b84-a1f5-60d3819ce472",
                    status: "completed",
                    report_url: "https://api.sailhomes.co.uk/r/<token>",
                    prices: { date_of_death_value_pence: 56500000 }
                }
            }
        ]
    },
    {
        name: "Property services",
        blurb:
            "An empty house is a set of liabilities that start the day the owner dies. These are the"
            + " jobs that deal with them, and Sail pays for every one of them up front.",
        endpoints: [
            {
                id: "post-service",
                method: "POST",
                path: "/properties/{property_id}/services",
                title: "Order a service, and get the price back on the same call",
                body:
                    "Our supplier panel holds standing rates, so the quote comes back on the request"
                    + " rather than a day later. Ordering does not commit anyone — the job is not booked"
                    + " until it is instructed. <code>billing</code> takes"
                    + " <code>on_job_completion</code> or <code>on_sale_completion</code>."
                    + " <code>service_type</code> is one of"
                    + " <code>clearance</code>, <code>drain_down</code>, <code>lock_change</code>,"
                    + " <code>key_safe</code>, <code>epc</code>, <code>garden_tidy</code>,"
                    + " <code>cleaning</code>, <code>property_inspection</code>,"
                    + " <code>property_inventory</code>, <code>electrical_test</code>,"
                    + " <code>heating_service</code>.",
                request: {
                    service_type: "clearance",
                    client_reference: "JL/0264/2026",
                    access_notes: null,
                    billing: "on_sale_completion"
                },
                status: 201,
                response: {
                    service_id: "svc_clearance_5f21",
                    service_type: "clearance",
                    status: "quoted",
                    quote: {
                        supplier_name: "Northgate Clearance Ltd",
                        net_pence: 145000,
                        vat_pence: 29000,
                        total_pence: 174000
                    },
                    estimated_turnaround: "5–10 working days",
                    billing: {
                        mode: "on_sale_completion",
                        payable_before_grant_pence: 0
                    }
                },
                highlight: "billing"
            },
            {
                id: "post-instruct",
                method: "POST",
                path: "/properties/{property_id}/services/{service_id}/instruct",
                title: "Accept the quote",
                body:
                    "Books the supplier. This is the committing call, so keep it behind a second,"
                    + " deliberate press rather than folding it into the first.",
                request: { accepted_quote: true },
                status: 200,
                response: {
                    service_id: "svc_clearance_5f21",
                    service_type: "clearance",
                    status: "instructed",
                    supplier_name: "Northgate Clearance Ltd",
                    instructed_on: "2026-09-03",
                    estimated_turnaround: "5–10 working days"
                }
            },
            {
                id: "get-services",
                method: "GET",
                path: "/properties/{property_id}/services",
                title: "Everything on the property",
                body: "Every job against the property whatever state it is in. This is the call a services panel is built on.",
                status: 200,
                response: {
                    property_id: "b83f27d4-6a09-45c1-9e72-1d40b6ca8305",
                    services: [
                        { service_id: "svc_clearance_5f21", service_type: "clearance", status: "instructed", instructed_on: "2026-07-29" },
                        { service_id: "svc_drain_down_1c08", service_type: "drain_down", status: "quoted", quote: { net_pence: 32000 } }
                    ],
                    totals: { committed_pence: 138000, payable_before_grant_pence: 0 }
                }
            }
        ]
    }
];

// The four responses worth writing a branch for. Everything else is an ordinary 200.
export const STATES = [
    ["<code>COMPLETED</code>", "The normal instant result. Read <code>prices</code> and <code>confidence</code>. Money is in pence."],
    ["<code>INELIGIBLE</code>", "We cannot value it automatically — a flat with no comparables, a plot, a listed oddity. Comes back 200, not an error. Offer the full valuation instead."],
    ["<code>MULTIPLE_TITLES</code>", "The address matches more than one registered title. Show the choices and send back the one the practitioner picks."],
    ["<code>NOT_FOUND</code>", "No registered title at that address. Unregistered land is roughly one property in seven, and the valuation still runs."]
];
