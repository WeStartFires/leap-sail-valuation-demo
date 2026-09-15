// Canned Sail Introducer API responses, plus the two LEAP matters the prototype can be driven on.
//
// The response objects are REAL shapes, taken from app/api/src/introducerApi/openapi.yml (v1.1).
// Nothing the screen shows is stored as a display string — every figure, every ownership verdict,
// every line of the IHT calculation is derived from these objects by derive.js. The payload panel
// therefore shows the same object the screen was built from, and the two cannot disagree.
//
// The two matters differ on the axes that change what a practitioner has to do next:
//
//                      | Hollis                            | Adeyemi
//   -------------------|-----------------------------------|---------------------------------
//   Ownership          | Sole owner                        | Tenants in common — Form A present
//   Charge             | None                              | Barclays, still outstanding
//   Instant confidence | HIGH first time                   | MEDIUM until the facts are added
//   Estate outcome     | Excepted — no IHT400 at all       | Taxable — IHT400 and a cheque
//   Why upgrade        | To evidence the excepted position | Because the estimate's range moves
//                      |                                   | the tax by five figures
//
// Every person, address, title number, matter number and figure is invented.

// The API returns all 42 detector flags on every title check. Defaulting them to "no" keeps the
// fixture readable while the emitted object stays complete — which is what a partner's developer
// needs to see in the payload panel.
const flags = (overrides) => ({
    has_form_a_restriction: "no",
    mines_minerals_excepted: "no",
    has_restrictive_covenants: "no",
    has_possessory_title: "no",
    has_recent_proprietor_transfer: "no",
    title_or_deed_obtained: "yes",
    is_flying_freehold: "no",
    properties_more_than_10_years_old: "yes",
    has_charge: "no",
    has_chargee: "no",
    has_sub_charge: "no",
    has_multiple_charges: "no",
    has_noted_charge: "no",
    has_discount_charge: "no",
    has_equitable_charge: "no",
    has_charge_restriction: "no",
    has_charge_related_restriction: "no",
    has_deed_of_postponement: "no",
    has_agreed_notice: "no",
    has_unilateral_notice: "no",
    has_right_of_pre_emption: "no",
    has_creditors_notice: "no",
    has_caution_entry: "no",
    has_ccbi_entry: "no",
    has_bankruptcy_entry: "no",
    has_home_rights: "no",
    has_home_rights_change_of_address: "no",
    has_death_of_proprietor: "no",
    has_non_charge_restriction: "no",
    has_rent_charge: "no",
    has_vendors_lien: "no",
    has_price_paid_entry: "yes",
    has_green_out: "no",
    has_schedule_of_leases: "no",
    has_property_description_note: "no",
    has_unidentified_entry: "no",
    has_scheme_title: "no",
    has_caution_against_first_registration: "no",
    title_defects_that_require_indemnification: "no",
    reconstituting_title: "no",
    can_epitome_of_title_be_drafted: "yes",
    right_of_way_acceptable: "yes",
    registered_proprietors_names_match_sellers: "yes",
    ...overrides
});

// ---------------------------------------------------------------------------------------
// Hollis — 41 Ryecroft Lane, Harrogate. Sole owner, clean title, excepted estate.
// ---------------------------------------------------------------------------------------

const hollisTitleCheck = {
    title_number: "NYK209118",
    tenure: "freehold",
    title_class: "absolute",
    is_registered: true,
    last_price_paid: { amount_pence: 18750000, date: "2003-05-16" },
    lease_years_remaining: null,
    proprietors: [{ name: "EILEEN MARGARET HOLLIS" }],
    entry_types_present: ["PROPERTY_DESCRIPTION", "PROPRIETOR", "PRICE_PAID"],
    entries: [
        {
            canonical_type: "PROPERTY_DESCRIPTION",
            sub_register: "A",
            entry_number: 1,
            registration_date: "1990-10-04",
            text: "The Freehold land shown edged with red on the plan of the above title filed at the Registry and being 41 Ryecroft Lane, Harrogate (HG2 8LP).",
            beneficiary: ""
        },
        {
            canonical_type: "PROPRIETOR",
            sub_register: "B",
            entry_number: 1,
            registration_date: "2003-06-02",
            text: "PROPRIETOR: EILEEN MARGARET HOLLIS of 41 Ryecroft Lane, Harrogate HG2 8LP.",
            beneficiary: ""
        },
        {
            canonical_type: "PRICE_PAID",
            sub_register: "B",
            entry_number: 2,
            registration_date: "2003-06-02",
            text: "The price stated to have been paid on 16 May 2003 was £187,500.",
            beneficiary: ""
        }
    ],
    flags: flags({}),
    findings: [
        {
            category: "proprietor",
            sentiment: "neutral",
            text: "The registered proprietor is Eileen Margaret Hollis."
        },
        {
            category: "proprietor",
            sentiment: "positive",
            text: "There is a single registered proprietor and no Form A restriction. The whole beneficial interest forms part of the estate and passes under the will."
        },
        {
            category: "charge",
            sentiment: "positive",
            text: "The Charges Register contains no registered charges. There is no secured lending to deduct as a liability of the estate."
        },
        {
            category: "property",
            sentiment: "positive",
            text: "The title is registered with absolute freehold title, the best class of title the Land Registry grants."
        },
        {
            category: "property",
            sentiment: "positive",
            text: "No restrictions are registered against the title, so nothing on the register holds up a disposition by the personal representatives."
        }
    ],
    title_register_url: "https://eservices.landregistry.gov.uk/title/NYK209118"
};

// The practitioner had the property details on the matter already, taken at the first appointment,
// so they ride along with the very first request — which is why this one comes back HIGH.
const hollisInstant = {
    valuation_id: "2b7e4a19-0c53-4f86-9d24-6a1b8e075c3f",
    version_id: "e408d217-53b9-4c60-8a17-2f95cb60d481",
    property_id: "7d15c908-4e26-4b73-a5f1-093ce8461b27",
    valuation_date: "2026-03-14",
    status: "COMPLETED",
    prices: {
        market_price_pence: 41200000,
        to_achieve_pence: 42100000,
        low_range_pence: 40100000,
        high_range_pence: 42400000,
        auction_price_pence: 35000000,
        refurbished_pence: 47300000
    },
    recommended_tier: "marketValue",
    confidence: { score: 0.9, band: "HIGH" },
    basis: {
        method: "WEIGHTED_MULTI_SIGNAL",
        last_sold_price_pounds: 187500,
        last_sold_date: "2003-05-16",
        last_sold_source: "looked_up",
        signal_breakdown: [
            { kind: "looked_up_transaction", value_pence: 40780000, weight: 0.3 },
            { kind: "comp_per_sqm", value_pence: 41460000, weight: 0.4 },
            { kind: "comp_avg", value_pence: 41210000, weight: 0.3 }
        ],
        hpi_uplift_pct: 117.5,
        hpi_from_index: 116.1,
        hpi_to_index: 252.5,
        hpi_la_code: "E07000165",
        fell_back_to_national_hpi: false,
        multipliers_version: "2026.06",
        comps_count: 15,
        comps_average_price_pounds: 404900
    },
    address: {
        normalised: "41 Ryecroft Lane, Harrogate, HG2 8LP",
        uprn: "100050338217",
        verified: true,
        latitude: 53.9832,
        longitude: -1.5312
    },
    subject: {
        property_type: { value: "Detached", source: "client_supplied" },
        bedrooms: { value: 4, source: "client_supplied" },
        bathrooms: { value: 2, source: "online" },
        receptions: { value: 2, source: "online" },
        floor_area_sqm: { value: 132, source: "online" },
        condition: { value: "GOOD", source: "client_supplied" }
    },
    comparables: [
        { address: "18 Ryecroft Lane", postcode: "HG2 8LP", price_pounds: 425000, date: "2026-02-06", property_type: "Detached", bedrooms: 4, bathrooms: 2, receptions: 2, total_rooms: 8, distance_km: 0.05, floor_area_sqm: 136, garden: true, epc_rating: "C" },
        { address: "3 Wetherby Close", postcode: "HG2 9AR", price_pounds: 402000, date: "2025-12-12", property_type: "Detached", bedrooms: 4, bathrooms: 1, receptions: 2, total_rooms: 7, distance_km: 0.31, floor_area_sqm: 128, garden: true, epc_rating: "D" },
        { address: "56 Ryecroft Lane", postcode: "HG2 8LP", price_pounds: 409500, date: "2025-10-24", property_type: "Detached", bedrooms: 4, bathrooms: 2, receptions: 2, total_rooms: 8, distance_km: 0.08, floor_area_sqm: 130, garden: true, epc_rating: "D" },
        { address: "22 Leadhall Lane", postcode: "HG2 9NQ", price_pounds: 378000, date: "2026-01-19", property_type: "Detached", bedrooms: 4, bathrooms: 1, receptions: 2, total_rooms: 7, distance_km: 0.42, floor_area_sqm: 121, garden: true, epc_rating: "E" },
        { address: "7 Slingsby Walk", postcode: "HG2 8QD", price_pounds: 366000, date: "2025-11-28", property_type: "Semi-detached", bedrooms: 3, bathrooms: 1, receptions: 2, total_rooms: 6, distance_km: 0.27, floor_area_sqm: 114, garden: true, epc_rating: "D" },
        { address: "14 Stray Rein", postcode: "HG2 8NL", price_pounds: 441000, date: "2026-02-17", property_type: "Detached", bedrooms: 4, bathrooms: 2, receptions: 2, total_rooms: 8, distance_km: 0.19, floor_area_sqm: 143, garden: true, epc_rating: "C" },
        { address: "31 Hookstone Drive", postcode: "HG2 8AQ", price_pounds: 352000, date: "2025-09-30", property_type: "Semi-detached", bedrooms: 3, bathrooms: 1, receptions: 1, total_rooms: 6, distance_km: 0.55, floor_area_sqm: 108, garden: true, epc_rating: "E" },
        { address: "9 Almsford Road", postcode: "HG2 8DR", price_pounds: 418500, date: "2026-01-08", property_type: "Detached", bedrooms: 4, bathrooms: 2, receptions: 2, total_rooms: 8, distance_km: 0.36, floor_area_sqm: 134, garden: true, epc_rating: "D" },
        { address: "45 St Winifreds Avenue", postcode: "HG2 8LS", price_pounds: 395000, date: "2025-12-03", property_type: "Detached", bedrooms: 4, bathrooms: 1, receptions: 2, total_rooms: 7, distance_km: 0.12, floor_area_sqm: 126, garden: true, epc_rating: "D" },
        { address: "2 Fulwith Mill Lane", postcode: "HG2 8HJ", price_pounds: 487000, date: "2026-02-24", property_type: "Detached", bedrooms: 5, bathrooms: 3, receptions: 3, total_rooms: 10, distance_km: 0.61, floor_area_sqm: 163, garden: true, epc_rating: "C" },
        { address: "28 Wheatlands Road", postcode: "HG2 8BB", price_pounds: 371500, date: "2025-11-06", property_type: "Semi-detached", bedrooms: 3, bathrooms: 1, receptions: 2, total_rooms: 6, distance_km: 0.48, floor_area_sqm: 117, garden: true, epc_rating: "D" },
        { address: "16 Oatlands Drive", postcode: "HG2 8JX", price_pounds: 433000, date: "2026-01-30", property_type: "Detached", bedrooms: 4, bathrooms: 2, receptions: 2, total_rooms: 8, distance_km: 0.33, floor_area_sqm: 139, garden: true, epc_rating: "C" },
        { address: "5 Hookstone Chase", postcode: "HG2 7HW", price_pounds: 344000, date: "2025-10-09", property_type: "Semi-detached", bedrooms: 3, bathrooms: 1, receptions: 1, total_rooms: 5, distance_km: 0.74, floor_area_sqm: 105, garden: true, epc_rating: "E" },
        { address: "40 Green Lane", postcode: "HG2 9LN", price_pounds: 462000, date: "2026-02-02", property_type: "Detached", bedrooms: 5, bathrooms: 2, receptions: 3, total_rooms: 9, distance_km: 0.68, floor_area_sqm: 155, garden: true, epc_rating: "C" },
        { address: "11 Pannal Ash Road", postcode: "HG2 9AB", price_pounds: 389000, date: "2025-12-18", property_type: "Detached", bedrooms: 4, bathrooms: 1, receptions: 2, total_rooms: 7, distance_km: 0.52, floor_area_sqm: 124, garden: true, epc_rating: "D" }
    ]
};

// The son mentions on the phone that the boiler and the wiring are original. The figure comes down
// and the range tightens — and on this estate that still leaves it comfortably excepted, which is
// the point: the practitioner can now say so rather than hope.
const hollisInstantRefined = {
    ...hollisInstant,
    version_id: "9a2f6c30-71d4-48e5-b063-8c1a54e2f907",
    prices: {
        market_price_pence: 39600000,
        to_achieve_pence: 40400000,
        low_range_pence: 38900000,
        high_range_pence: 40300000,
        auction_price_pence: 33700000,
        refurbished_pence: 47300000
    },
    confidence: { score: 0.93, band: "HIGH" },
    basis: {
        ...hollisInstant.basis,
        comps_count: 18,
        comps_average_price_pounds: 403800
    },
    subject: {
        property_type: { value: "Detached", source: "client_supplied" },
        bedrooms: { value: 4, source: "client_supplied" },
        bathrooms: { value: 2, source: "online" },
        receptions: { value: 2, source: "online" },
        floor_area_sqm: { value: 132, source: "online" },
        condition: { value: "AVERAGE", source: "client_supplied" }
    },
    comparables: [
        { address: "18 Ryecroft Lane", postcode: "HG2 8LP", price_pounds: 425000, date: "2026-02-06", property_type: "Detached", bedrooms: 4, bathrooms: 2, receptions: 2, total_rooms: 8, distance_km: 0.05, floor_area_sqm: 136, garden: true, epc_rating: "C" },
        { address: "3 Wetherby Close", postcode: "HG2 9AR", price_pounds: 402000, date: "2025-12-12", property_type: "Detached", bedrooms: 4, bathrooms: 1, receptions: 2, total_rooms: 7, distance_km: 0.31, floor_area_sqm: 128, garden: true, epc_rating: "D" },
        { address: "56 Ryecroft Lane", postcode: "HG2 8LP", price_pounds: 409500, date: "2025-10-24", property_type: "Detached", bedrooms: 4, bathrooms: 2, receptions: 2, total_rooms: 8, distance_km: 0.08, floor_area_sqm: 130, garden: true, epc_rating: "D" },
        { address: "22 Leadhall Lane", postcode: "HG2 9NQ", price_pounds: 378000, date: "2026-01-19", property_type: "Detached", bedrooms: 4, bathrooms: 1, receptions: 2, total_rooms: 7, distance_km: 0.42, floor_area_sqm: 121, garden: true, epc_rating: "E" },
        { address: "7 Slingsby Walk", postcode: "HG2 8QD", price_pounds: 366000, date: "2025-11-28", property_type: "Semi-detached", bedrooms: 3, bathrooms: 1, receptions: 2, total_rooms: 6, distance_km: 0.27, floor_area_sqm: 114, garden: true, epc_rating: "D" },
        { address: "14 Stray Rein", postcode: "HG2 8NL", price_pounds: 441000, date: "2026-02-17", property_type: "Detached", bedrooms: 4, bathrooms: 2, receptions: 2, total_rooms: 8, distance_km: 0.19, floor_area_sqm: 143, garden: true, epc_rating: "C" },
        { address: "31 Hookstone Drive", postcode: "HG2 8AQ", price_pounds: 352000, date: "2025-09-30", property_type: "Semi-detached", bedrooms: 3, bathrooms: 1, receptions: 1, total_rooms: 6, distance_km: 0.55, floor_area_sqm: 108, garden: true, epc_rating: "E" },
        { address: "9 Almsford Road", postcode: "HG2 8DR", price_pounds: 418500, date: "2026-01-08", property_type: "Detached", bedrooms: 4, bathrooms: 2, receptions: 2, total_rooms: 8, distance_km: 0.36, floor_area_sqm: 134, garden: true, epc_rating: "D" },
        { address: "45 St Winifreds Avenue", postcode: "HG2 8LS", price_pounds: 395000, date: "2025-12-03", property_type: "Detached", bedrooms: 4, bathrooms: 1, receptions: 2, total_rooms: 7, distance_km: 0.12, floor_area_sqm: 126, garden: true, epc_rating: "D" },
        { address: "2 Fulwith Mill Lane", postcode: "HG2 8HJ", price_pounds: 487000, date: "2026-02-24", property_type: "Detached", bedrooms: 5, bathrooms: 3, receptions: 3, total_rooms: 10, distance_km: 0.61, floor_area_sqm: 163, garden: true, epc_rating: "C" },
        { address: "28 Wheatlands Road", postcode: "HG2 8BB", price_pounds: 371500, date: "2025-11-06", property_type: "Semi-detached", bedrooms: 3, bathrooms: 1, receptions: 2, total_rooms: 6, distance_km: 0.48, floor_area_sqm: 117, garden: true, epc_rating: "D" },
        { address: "16 Oatlands Drive", postcode: "HG2 8JX", price_pounds: 433000, date: "2026-01-30", property_type: "Detached", bedrooms: 4, bathrooms: 2, receptions: 2, total_rooms: 8, distance_km: 0.33, floor_area_sqm: 139, garden: true, epc_rating: "C" },
        { address: "5 Hookstone Chase", postcode: "HG2 7HW", price_pounds: 344000, date: "2025-10-09", property_type: "Semi-detached", bedrooms: 3, bathrooms: 1, receptions: 1, total_rooms: 5, distance_km: 0.74, floor_area_sqm: 105, garden: true, epc_rating: "E" },
        { address: "40 Green Lane", postcode: "HG2 9LN", price_pounds: 462000, date: "2026-02-02", property_type: "Detached", bedrooms: 5, bathrooms: 2, receptions: 3, total_rooms: 9, distance_km: 0.68, floor_area_sqm: 155, garden: true, epc_rating: "C" },
        { address: "11 Pannal Ash Road", postcode: "HG2 9AB", price_pounds: 389000, date: "2025-12-18", property_type: "Detached", bedrooms: 4, bathrooms: 1, receptions: 2, total_rooms: 7, distance_km: 0.52, floor_area_sqm: 124, garden: true, epc_rating: "D" },
        { address: "23 Leadhall Crescent", postcode: "HG2 9NW", price_pounds: 358500, date: "2026-01-26", property_type: "Semi-detached", bedrooms: 3, bathrooms: 1, receptions: 2, total_rooms: 6, distance_km: 0.46, floor_area_sqm: 111, garden: true, epc_rating: "D" },
        { address: "8 Harlow Moor Drive", postcode: "HG2 0JX", price_pounds: 455000, date: "2026-02-20", property_type: "Detached", bedrooms: 4, bathrooms: 2, receptions: 3, total_rooms: 9, distance_km: 0.83, floor_area_sqm: 148, garden: true, epc_rating: "C" },
        { address: "34 Cornwall Road", postcode: "HG2 0AF", price_pounds: 381400, date: "2025-11-21", property_type: "Detached", bedrooms: 4, bathrooms: 1, receptions: 2, total_rooms: 7, distance_km: 0.91, floor_area_sqm: 122, garden: true, epc_rating: "E" }
    ]
};

// ---------------------------------------------------------------------------------------
// Adeyemi — 7 Kelvedon Court, Chelmsford. Tenants in common, and a Barclays charge.
// ---------------------------------------------------------------------------------------

const adeyemiTitleCheck = {
    title_number: "EX611430",
    tenure: "freehold",
    title_class: "absolute",
    is_registered: true,
    last_price_paid: { amount_pence: 31500000, date: "2016-09-30" },
    lease_years_remaining: null,
    proprietors: [{ name: "SAMUEL OLUWASEUN ADEYEMI" }, { name: "FOLAKE ADEYEMI" }],
    entry_types_present: [
        "PROPERTY_DESCRIPTION",
        "PROPRIETOR",
        "PRICE_PAID",
        "RESTRICTION_FORM_A",
        "RESTRICTION_CHARGE",
        "REGISTERED_CHARGE",
        "CHARGE_PROPRIETOR"
    ],
    entries: [
        {
            canonical_type: "PROPERTY_DESCRIPTION",
            sub_register: "A",
            entry_number: 1,
            registration_date: "2004-06-18",
            text: "The Freehold land shown edged with red on the plan of the above title filed at the Registry and being 7 Kelvedon Court, Chelmsford (CM2 6XG).",
            beneficiary: ""
        },
        {
            canonical_type: "PROPRIETOR",
            sub_register: "B",
            entry_number: 1,
            registration_date: "2016-10-14",
            text: "PROPRIETOR: SAMUEL OLUWASEUN ADEYEMI and FOLAKE ADEYEMI of 7 Kelvedon Court, Chelmsford CM2 6XG.",
            beneficiary: ""
        },
        {
            canonical_type: "PRICE_PAID",
            sub_register: "B",
            entry_number: 2,
            registration_date: "2016-10-14",
            text: "The price stated to have been paid on 30 September 2016 was £315,000.",
            beneficiary: ""
        },
        {
            canonical_type: "RESTRICTION_FORM_A",
            sub_register: "B",
            entry_number: 3,
            registration_date: "2016-10-14",
            text: "RESTRICTION: No disposition by a sole proprietor of the registered estate (except a trust corporation) under which capital money arises is to be registered unless authorised by an order of the court.",
            beneficiary: ""
        },
        {
            canonical_type: "RESTRICTION_CHARGE",
            sub_register: "B",
            entry_number: 4,
            registration_date: "2016-10-14",
            text: "RESTRICTION: No disposition of the registered estate by the proprietor of the registered estate is to be registered without a written consent signed by the proprietor for the time being of the Charge dated 30 September 2016 in favour of Barclays Bank UK PLC referred to in the Charges Register.",
            beneficiary: "BARCLAYS BANK UK PLC"
        },
        {
            canonical_type: "REGISTERED_CHARGE",
            sub_register: "C",
            entry_number: 1,
            registration_date: "2016-10-14",
            text: "REGISTERED CHARGE dated 30 September 2016 to secure the moneys including the further advances therein mentioned.",
            beneficiary: "BARCLAYS BANK UK PLC"
        },
        {
            canonical_type: "CHARGE_PROPRIETOR",
            sub_register: "C",
            entry_number: 2,
            registration_date: "2016-10-14",
            text: "Proprietor: BARCLAYS BANK UK PLC (Co. Regn. No. 09740322) of 1 Churchill Place, London E14 5HP.",
            beneficiary: "BARCLAYS BANK UK PLC"
        }
    ],
    flags: flags({
        has_form_a_restriction: "yes",
        has_non_charge_restriction: "yes",
        has_charge_restriction: "yes",
        has_charge: "yes",
        has_chargee: "yes"
    }),
    findings: [
        {
            category: "proprietor",
            sentiment: "neutral",
            text: "The registered proprietors are Samuel Oluwaseun Adeyemi and Folake Adeyemi."
        },
        {
            category: "proprietor",
            sentiment: "negative",
            text: "A Form A restriction is registered. The proprietors held the property as tenants in common, so only the deceased's share forms part of the estate and it passes under the will rather than by survivorship."
        },
        {
            category: "charge",
            sentiment: "negative",
            text: "There is a registered charge in favour of Barclays Bank UK PLC dated 30 September 2016. The register does not state the amount outstanding — a redemption statement is needed before the liability can be entered on the IHT400."
        },
        {
            category: "issue",
            sentiment: "negative",
            text: "A restriction protects the Barclays charge. No disposition can be registered without the lender's written consent, so the lender must be engaged early if the property is to be sold or transferred."
        },
        {
            category: "property",
            sentiment: "positive",
            text: "The title is registered with absolute freehold title, the best class of title the Land Registry grants."
        }
    ],
    title_register_url: "https://eservices.landregistry.gov.uk/title/EX611430"
};

// Nothing about the building was on the matter, so the first estimate runs on looked-up data only.
// MEDIUM confidence on a taxable estate is the whole argument for the upgrade: the range is wide
// enough to move the tax by five figures.
const adeyemiInstant = {
    valuation_id: "c50a8f26-3b41-4d97-8e05-71fa2c6304bd",
    version_id: "46e1b73f-9d28-4a50-b6c1-05837ef2a914",
    property_id: "b83f27d4-6a09-45c1-9e72-1d40b6ca8305",
    valuation_date: "2026-06-08",
    status: "COMPLETED",
    prices: {
        market_price_pence: 56500000,
        to_achieve_pence: 57800000,
        low_range_pence: 52200000,
        high_range_pence: 60900000,
        auction_price_pence: 48000000,
        refurbished_pence: 65400000
    },
    recommended_tier: "marketValue",
    confidence: { score: 0.58, band: "MEDIUM" },
    basis: {
        method: "WEIGHTED_MULTI_SIGNAL",
        last_sold_price_pounds: 315000,
        last_sold_date: "2016-09-30",
        last_sold_source: "looked_up",
        signal_breakdown: [
            { kind: "looked_up_transaction", value_pence: 56980000, weight: 0.45 },
            { kind: "automated_estimate", value_pence: 56100000, weight: 0.3 },
            { kind: "comp_avg", value_pence: 56320000, weight: 0.25 }
        ],
        hpi_uplift_pct: 80.9,
        hpi_from_index: 139.6,
        hpi_to_index: 252.5,
        hpi_la_code: "E07000070",
        fell_back_to_national_hpi: false,
        multipliers_version: "2026.06",
        comps_count: 7,
        comps_average_price_pounds: 575900
    },
    address: {
        normalised: "7 Kelvedon Court, Chelmsford, CM2 6XG",
        uprn: "100091277640",
        verified: true,
        latitude: 51.7205,
        longitude: 0.4761
    },
    subject: {
        property_type: { value: "Detached", source: "online" },
        bedrooms: { value: 4, source: "online" },
        bathrooms: { value: 3, source: "online" },
        receptions: { value: 3, source: "online" },
        floor_area_sqm: { value: 158, source: "online" },
        condition: { value: null, source: null }
    },
    comparables: [
        { address: "12 Kelvedon Court", postcode: "CM2 6XG", price_pounds: 589000, date: "2026-04-30", property_type: "Detached", bedrooms: 5, bathrooms: 2, receptions: 2, total_rooms: 9, distance_km: 0.04, floor_area_sqm: 171, garden: true, epc_rating: "C" },
        { address: "24 Baddow Hall Avenue", postcode: "CM2 7BS", price_pounds: 548000, date: "2026-01-22", property_type: "Detached", bedrooms: 4, bathrooms: 2, receptions: 2, total_rooms: 8, distance_km: 0.52, floor_area_sqm: 154, garden: true, epc_rating: "D" },
        { address: "3 Kelvedon Court", postcode: "CM2 6XG", price_pounds: 552500, date: "2025-11-14", property_type: "Detached", bedrooms: 4, bathrooms: 2, receptions: 2, total_rooms: 8, distance_km: 0.02, floor_area_sqm: 156, garden: true, epc_rating: "D" },
        { address: "8 Pypers Hatch", postcode: "CM2 6XJ", price_pounds: 615000, date: "2026-05-18", property_type: "Detached", bedrooms: 4, bathrooms: 2, receptions: 3, total_rooms: 9, distance_km: 0.11, floor_area_sqm: 165, garden: true, epc_rating: "C" },
        { address: "41 Beehive Lane", postcode: "CM2 9RX", price_pounds: 570000, date: "2026-03-09", property_type: "Detached", bedrooms: 4, bathrooms: 1, receptions: 2, total_rooms: 8, distance_km: 0.63, floor_area_sqm: 149, garden: true, epc_rating: "D" },
        { address: "17 Vicarage Lane", postcode: "CM2 7HW", price_pounds: 635000, date: "2026-02-27", property_type: "Detached", bedrooms: 5, bathrooms: 3, receptions: 2, total_rooms: 10, distance_km: 0.38, floor_area_sqm: 178, garden: true, epc_rating: "C" },
        { address: "2 Molrams Lane", postcode: "CM2 7EL", price_pounds: 521800, date: "2025-12-05", property_type: "Detached", bedrooms: 4, bathrooms: 1, receptions: 2, total_rooms: 7, distance_km: 0.71, floor_area_sqm: 141, garden: true, epc_rating: "E" }
    ]
};

// What the figure becomes once the practitioner has asked the executor about the property and
// entered what they said. The number goes UP, the range narrows sharply, and — because this estate
// is taxable — the tax exposure spread collapses with it.
const adeyemiInstantRefined = {
    ...adeyemiInstant,
    version_id: "1f7d0c94-8b25-4e63-a017-3d59642bcf80",
    prices: {
        market_price_pence: 59800000,
        to_achieve_pence: 61200000,
        low_range_pence: 58400000,
        high_range_pence: 61300000,
        auction_price_pence: 50800000,
        refurbished_pence: 66900000
    },
    recommended_tier: "marketValue",
    confidence: { score: 0.88, band: "HIGH" },
    basis: {
        ...adeyemiInstant.basis,
        signal_breakdown: [
            { kind: "looked_up_transaction", value_pence: 56980000, weight: 0.2 },
            { kind: "comp_per_sqm", value_pence: 60340000, weight: 0.5 },
            { kind: "comp_avg", value_pence: 59120000, weight: 0.3 }
        ],
        comps_count: 13,
        comps_average_price_pounds: 591200
    },
    subject: {
        property_type: { value: "Detached", source: "client_supplied" },
        bedrooms: { value: 4, source: "client_supplied" },
        bathrooms: { value: 3, source: "online" },
        receptions: { value: 3, source: "online" },
        floor_area_sqm: { value: 158, source: "online" },
        condition: { value: "EXCELLENT", source: "client_supplied" }
    },
    comparables: [
        { address: "12 Kelvedon Court", postcode: "CM2 6XG", price_pounds: 589000, date: "2026-04-30", property_type: "Detached", bedrooms: 5, bathrooms: 2, receptions: 2, total_rooms: 9, distance_km: 0.04, floor_area_sqm: 171, garden: true, epc_rating: "C" },
        { address: "24 Baddow Hall Avenue", postcode: "CM2 7BS", price_pounds: 548000, date: "2026-01-22", property_type: "Detached", bedrooms: 4, bathrooms: 2, receptions: 2, total_rooms: 8, distance_km: 0.52, floor_area_sqm: 154, garden: true, epc_rating: "D" },
        { address: "3 Kelvedon Court", postcode: "CM2 6XG", price_pounds: 552500, date: "2025-11-14", property_type: "Detached", bedrooms: 4, bathrooms: 2, receptions: 2, total_rooms: 8, distance_km: 0.02, floor_area_sqm: 156, garden: true, epc_rating: "D" },
        { address: "8 Pypers Hatch", postcode: "CM2 6XJ", price_pounds: 615000, date: "2026-05-18", property_type: "Detached", bedrooms: 4, bathrooms: 2, receptions: 3, total_rooms: 9, distance_km: 0.11, floor_area_sqm: 165, garden: true, epc_rating: "C" },
        { address: "41 Beehive Lane", postcode: "CM2 9RX", price_pounds: 570000, date: "2026-03-09", property_type: "Detached", bedrooms: 4, bathrooms: 1, receptions: 2, total_rooms: 8, distance_km: 0.63, floor_area_sqm: 149, garden: true, epc_rating: "D" },
        { address: "17 Vicarage Lane", postcode: "CM2 7HW", price_pounds: 635000, date: "2026-02-27", property_type: "Detached", bedrooms: 5, bathrooms: 3, receptions: 2, total_rooms: 10, distance_km: 0.38, floor_area_sqm: 178, garden: true, epc_rating: "C" },
        { address: "2 Molrams Lane", postcode: "CM2 7EL", price_pounds: 521800, date: "2025-12-05", property_type: "Detached", bedrooms: 4, bathrooms: 1, receptions: 2, total_rooms: 7, distance_km: 0.71, floor_area_sqm: 141, garden: true, epc_rating: "E" },
        { address: "55 Longstomps Avenue", postcode: "CM2 9BX", price_pounds: 604000, date: "2026-04-02", property_type: "Detached", bedrooms: 4, bathrooms: 2, receptions: 2, total_rooms: 8, distance_km: 0.84, floor_area_sqm: 160, garden: true, epc_rating: "C" },
        { address: "9 Meadgate Avenue", postcode: "CM2 7LS", price_pounds: 561000, date: "2026-01-15", property_type: "Detached", bedrooms: 4, bathrooms: 2, receptions: 2, total_rooms: 8, distance_km: 0.44, floor_area_sqm: 147, garden: true, epc_rating: "D" },
        { address: "30 Baddow Hall Crescent", postcode: "CM2 7BU", price_pounds: 592500, date: "2026-03-24", property_type: "Detached", bedrooms: 4, bathrooms: 2, receptions: 2, total_rooms: 8, distance_km: 0.49, floor_area_sqm: 158, garden: true, epc_rating: "C" },
        { address: "6 Rothmans Avenue", postcode: "CM2 7BJ", price_pounds: 648000, date: "2026-05-06", property_type: "Detached", bedrooms: 5, bathrooms: 2, receptions: 3, total_rooms: 10, distance_km: 0.57, floor_area_sqm: 182, garden: true, epc_rating: "C" },
        { address: "21 Galleywood Road", postcode: "CM2 8BX", price_pounds: 675000, date: "2026-02-11", property_type: "Detached", bedrooms: 5, bathrooms: 3, receptions: 3, total_rooms: 11, distance_km: 0.92, floor_area_sqm: 190, garden: true, epc_rating: "B" },
        { address: "7 Church Street, Great Baddow", postcode: "CM2 7HY", price_pounds: 573800, date: "2025-10-30", property_type: "Detached", bedrooms: 4, bathrooms: 2, receptions: 2, total_rooms: 8, distance_km: 0.29, floor_area_sqm: 152, garden: true, epc_rating: "D" }
    ]
};

// ---------------------------------------------------------------------------------------
// The matters themselves — LEAP's own records, before Sail is involved at all
// ---------------------------------------------------------------------------------------

// Everything under `deceased` is what "About the deceased" collected at step 1 of their Estate
// Administration curriculum. Everything under `client` is on the client card. Both are populated
// long before the practitioner reaches Assets, which is the whole point of the pitch: this is a
// button, not a data-entry ask.
export const MATTERS = {
    hollis: {
        id: "hollis",
        number: "JL/0217/2026",
        description: "Hollis, Probate; Estate of Eileen Hollis; Harrogate",
        matterType: "Probate",
        deceased: {
            firstName: "Eileen",
            middleName: "Margaret",
            lastName: "Hollis",
            dateOfDeath: "2026-03-14",
            dateOfApplication: "2026-04-02",
            domicile: "England and Wales",
            leftWill: true,
            maritalStatus: "Widowed",
            lastKnownAddress: {
                line1: "41 Ryecroft Lane",
                town: "Harrogate",
                postcode: "HG2 8LP"
            },
            // The question that makes the address usable — it is on their own "About the deceased"
            // screen, right under the address box.
            ownedTheAboveProperty: true,
            survivedBy: { spouse: false, children: 2, grandchildren: 3, siblings: true, parents: false }
        },
        // The executor, from the client card.
        client: {
            firstName: "David",
            lastName: "Hollis",
            relationship: "Son",
            email: "d.hollis@example.com",
            phoneNumber: "07700900233",
            isExecutor: true
        },
        feeEarner: {
            firstName: "James",
            lastName: "Levington",
            initials: "JL",
            email: "j.levington@example-solicitors.co.uk",
            phoneNumber: "01245660118"
        },
        property: {
            addressLine1: "41 Ryecroft Lane",
            town: "Harrogate",
            postcode: "HG2 8LP",
            // Filled in from the title check once a full valuation has run.
            sharePercent: 100,
            // Details already on the matter, taken at the first appointment.
            knownFacts: {
                propertyType: "Detached",
                bedrooms: 4,
                condition: "GOOD",
                conditionLabel: "Good"
            }
        },
        // The other Assets sub-pages, as the practitioner recorded them.
        otherAssets: [
            { category: "Financials", name: "Yorkshire Building Society — saver", valuePence: 4180000 },
            { category: "Financials", name: "NatWest current account", valuePence: 730000 },
            { category: "Stocks and shares", name: "Aviva investment account", valuePence: 1620000 },
            { category: "Household and personal goods", name: "Chattels, as valued", valuePence: 280000 }
        ],
        debts: [{ name: "Funeral account — Dignity Funerals", valuePence: 398000 }],
        // Whether the residence passes to a direct descendant, which is what the residence nil
        // rate band turns on. It is a matter fact, never something the title check can tell you.
        residencePassesToDescendants: true,
        refinement: {
            propertyType: "Detached",
            bedrooms: 4,
            condition: "AVERAGE",
            conditionLabel: "Needs modernising"
        },
        api: {
            propertyId: hollisInstant.property_id,
            full: {
                status: "booked",
                valuation_id: "5c8b1d70-2a49-4e13-9f06-84b7c25de1a3",
                property_id: hollisInstant.property_id,
                title_check: hollisTitleCheck
            },
            instant: hollisInstant,
            instantRefined: hollisInstantRefined
        }
    },

    adeyemi: {
        id: "adeyemi",
        number: "JL/0264/2026",
        description: "Adeyemi, Probate; Estate of Samuel Adeyemi; Chelmsford",
        matterType: "Probate",
        deceased: {
            firstName: "Samuel",
            middleName: "Oluwaseun",
            lastName: "Adeyemi",
            dateOfDeath: "2026-06-08",
            dateOfApplication: "2026-07-01",
            domicile: "England and Wales",
            leftWill: true,
            maritalStatus: "Married",
            lastKnownAddress: {
                line1: "7 Kelvedon Court",
                town: "Chelmsford",
                postcode: "CM2 6XG"
            },
            ownedTheAboveProperty: true,
            survivedBy: { spouse: true, children: 3, grandchildren: 1, siblings: true, parents: false }
        },
        client: {
            firstName: "Bisi",
            lastName: "Adeyemi",
            relationship: "Daughter",
            email: "bisi.adeyemi@example.com",
            phoneNumber: "07700900742",
            isExecutor: true
        },
        feeEarner: {
            firstName: "James",
            lastName: "Levington",
            initials: "JL",
            email: "j.levington@example-solicitors.co.uk",
            phoneNumber: "01245660118"
        },
        property: {
            addressLine1: "7 Kelvedon Court",
            town: "Chelmsford",
            postcode: "CM2 6XG",
            sharePercent: 50,
            knownFacts: null
        },
        otherAssets: [
            { category: "Stocks and shares", name: "Hargreaves Lansdown portfolio", valuePence: 28100000 },
            { category: "Financials", name: "Barclays current account", valuePence: 6420000 },
            { category: "Financials", name: "Santander eSaver", valuePence: 4900000 },
            { category: "Household and personal goods", name: "Chattels, as valued", valuePence: 610000 }
        ],
        debts: [
            { name: "Funeral account", valuePence: 512000 },
            { name: "Credit card — Amex", valuePence: 348000 }
        ],
        residencePassesToDescendants: true,
        refinement: {
            propertyType: "Detached",
            bedrooms: 4,
            condition: "EXCELLENT",
            conditionLabel: "Excellent"
        },
        api: {
            propertyId: adeyemiInstant.property_id,
            full: {
                status: "booked",
                valuation_id: "d92e5a01-7c36-4b84-a1f5-60d3819ce472",
                property_id: adeyemiInstant.property_id,
                title_check: adeyemiTitleCheck
            },
            instant: adeyemiInstant,
            instantRefined: adeyemiInstantRefined
        }
    }
};

// Filler for the matter list. Not driveable — they exist so the list looks like a working
// caseload rather than a two-row demo. Matter numbers follow LEAP's fee-earner/sequence/year
// format, and the types are LEAP's own Estates matter types.
export const OTHER_MATTERS = [
    { number: "NO/0024/2026", description: "Jones, Purchase; Purchase of 21 Sycamore Terrace; Hetherton", type: "Purchase", updated: "12 Aug 2026" },
    { number: "KF/0092/2026", description: "Pryce, Estate Dispute; Estate of Wilfred Pryce", type: "Estate Dispute", updated: "11 Aug 2026" },
    { number: "MN/0075/2026", description: "Ivory, Letters of Administration; Estate of Nancy Ivory", type: "Letters of Administration", updated: "9 Aug 2026" },
    { number: "JMF/0037/2026", description: "Halloran, Probate; Estate of Brendan Halloran", type: "Probate", updated: "8 Aug 2026" },
    { number: "ATC/0101/2026", description: "Sandhu, Variation; Estate of Harjit Sandhu", type: "Variation", updated: "6 Aug 2026" },
    { number: "JL/0141/2026", description: "Marchetti, Sale of Estate; Sale of 8 Foxglove Rise", type: "Sale of Estate", updated: "4 Aug 2026" },
    { number: "MN/0247/2026", description: "Bowen, Probate; Estate of Emily Bowen", type: "Probate", updated: "1 Aug 2026" },
    { number: "KF/0954/2026", description: "Turnbull, Letters of Administration; Estate of Robert Turnbull", type: "Letters of Administration", updated: "28 Jul 2026" },
    { number: "JMF/0046/2026", description: "Ashbey, Probate; Estate of Ivor Ashbey", type: "Probate", updated: "24 Jul 2026" }
];

// LEAP's Estates matter types, from their own probate product page. "Sale of Estate" being one of
// them is the reason the second frame of this prototype exists.
export const MATTER_TYPES = ["Estate Dispute", "Letters of Administration", "Probate", "Sale of Estate", "Variation"];

// What the same property is worth TODAY, as opposed to at the date of death. It is a second call to
// the same endpoint with no `valuation_date`, and it is the number the executor asks about first.
// The written parts of the valuation report. Held here rather than in report.js for the same
// reason every other display string is derived: the report has to describe the property the rest
// of the prototype is talking about, and a Harrogate bungalow must not inherit Chelmsford's prose.
export const REPORT_NARRATIVE = {
    adeyemi: {
        councilTaxBand: "F",
        tenure: "Freehold",
        epcRating: "E",
        yearBuilt: "c.1720, with later additions",
        parking: "Driveway and detached garage",
        heating: "Gas central heating",
        photos: [
            ["photo-1.jpg", "Front elevation from the road"],
            ["photo-2.jpg", "Sitting room, with the original beams"],
            ["photo-3.jpg", "Dining room"],
            ["photo-4.jpg", "Kitchen"],
            ["photo-5.jpg", "Garden room"],
            ["photo-6.jpg", "Principal bedroom"],
            ["photo-7.jpg", "Shower room"],
            ["photo-8.jpg", "Rear elevation and garden"]
        ],
        floorplan: "floorplan.jpg",
        onMarket: [
            { address: "19 Pypers Hatch", postcode: "CM2 6XJ", price_pounds: 640000, bedrooms: 5, floor_area_sqm: 174, distance_km: "0.14", condition: "Similar condition", listed: "Listed 3 weeks" },
            { address: "12 Baddow Hall Avenue", postcode: "CM2 7BS", price_pounds: 599950, bedrooms: 4, floor_area_sqm: 161, distance_km: "0.48", condition: "Similar condition", listed: "Listed 7 weeks" },
            { address: "4 Meadgate Avenue", postcode: "CM2 7LS", price_pounds: 565000, bedrooms: 4, floor_area_sqm: 150, distance_km: "0.41", condition: "Needs updating", listed: "Listed 11 weeks" },
            { address: "26 Vicarage Lane", postcode: "CM2 7HW", price_pounds: 695000, bedrooms: 5, floor_area_sqm: 186, distance_km: "0.35", condition: "Recently improved", listed: "Listed 2 weeks" }
        ],
        interior: "A characterful four-bedroom period house arranged over two floors and presented in good decorative order throughout. The accommodation runs the depth of the plot: a heavily beamed sitting room with an open fireplace, a separate dining room, a shaker kitchen with a stone-topped island, and a glazed garden room opening onto the terrace. Two of the bedrooms are en-suite. Ceiling heights are low under the beams in places, as is usual for the age. No damp, movement or disrepair was apparent at the extent of our inspection.",
        exterior: "Rendered elevations under a thatched roof, with a brick chimney stack and casement windows. Thatch of this kind is typically re-ridged every ten to fifteen years and fully re-coated at longer intervals; we have assumed it to be sound and within its serviceable life, and recommend the executors obtain a thatcher\u2019s report before exchange. A gravelled driveway to the side provides off-street parking, with a detached garage beyond. The rear garden is stone-flagged nearest the house and then mainly laid to lawn, with mature trees to the boundaries.",
        area: [
            "Kelvedon Court sits at the older end of Great Baddow, about a mile and a half south-east of Chelmsford city centre, among a mix of period cottages and later detached family housing. The village offers day-to-day shopping, and Chelmsford station provides a fast service into London Liverpool Street in around thirty-five minutes.",
            "The local market is steady and driven by family buyers, with well-presented detached houses in this pocket typically finding a buyer within six to eight weeks. Period houses of this character are scarce and attract a narrower but more determined field &mdash; buyers who want thatch tend to be looking for it specifically, while others discount it for the upkeep and the insurance. Catchment for the Baddow secondary schools supports values across the area."
        ],
        strengths: [
            "Period character &mdash; beams, inglenook and thatch",
            "Four bedrooms, two of them en-suite",
            "Garden room opening to a stone terrace",
            "Mature garden with established trees",
            "Driveway and detached garage",
            "Well-regarded school catchment"
        ],
        watchpoints: [
            "Held as tenants in common &mdash; a half share forms the estate",
            "Registered charge outstanding to Barclays",
            "Charge restriction on the title",
            "Property currently unoccupied",
            "Thatch condition to be confirmed by a thatcher&rsquo;s report",
            "Likely listed &mdash; consent needed for alterations",
            "Buildings insurance for thatch narrows the buyer pool"
        ],
        reference: "SH-B83F27D4"
    },
    hollis: {
        councilTaxBand: "E",
        tenure: "Freehold",
        epcRating: "D",
        yearBuilt: "1936",
        parking: "Driveway and detached garage",
        heating: "Gas central heating",
        onMarket: [
            { address: "27 Ryecroft Lane", postcode: "HG2 8LP", price_pounds: 435000, bedrooms: 4, floor_area_sqm: 138, distance_km: "0.06", condition: "Recently improved", listed: "Listed 4 weeks" },
            { address: "15 St Winifreds Avenue", postcode: "HG2 8LS", price_pounds: 399950, bedrooms: 4, floor_area_sqm: 129, distance_km: "0.15", condition: "Similar condition", listed: "Listed 6 weeks" },
            { address: "3 Almsford Road", postcode: "HG2 8DR", price_pounds: 379500, bedrooms: 4, floor_area_sqm: 123, distance_km: "0.38", condition: "Needs updating", listed: "Listed 13 weeks" }
        ],
        interior: "A four-bedroom detached house in traditional order throughout. The accommodation is well proportioned and dry, though the kitchen and bathroom are original to the last refurbishment and a buyer would expect to update both. No damp, movement or disrepair was apparent at the extent of our inspection.",
        exterior: "Stone-built under a slate roof, with a tarmac driveway to the side and a detached single garage. The rear garden is generous, mainly laid to lawn with mature planting, and enclosed by stone walling in sound condition.",
        area: [
            "Ryecroft Lane sits in a settled residential pocket of south Harrogate, within walking distance of the Stray and about a mile from the town centre. Local shopping is on Leeds Road, and Harrogate station gives a direct service to Leeds and York.",
            "Demand in this part of Harrogate is consistent and led by family buyers and downsizers. Detached houses of this size are not often available and typically sell within four to six weeks of coming to the market."
        ],
        strengths: [
            "Sought-after south Harrogate address",
            "Four bedrooms with generous proportions",
            "Large mature garden",
            "Driveway and detached garage",
            "Walking distance to the Stray"
        ],
        watchpoints: [
            "Kitchen and bathroom would benefit from updating",
            "Property currently unoccupied",
            "No lift or level-access accommodation"
        ],
        reference: "SH-4C1E90A7"
    }
};

export const PRESENT_DAY = {
    hollis: { market_price_pence: 43500000, to_achieve_pence: 42200000 },
    adeyemi: { market_price_pence: 57500000, to_achieve_pence: 54900000 }
};

// ---------------------------------------------------------------------------------------
// Ancillary property services
// ---------------------------------------------------------------------------------------

// Every service below is one Sail already runs. `ListingServiceType` in the PropertyBid codebase
// carries Clearance, Draindown, Lock change, Key safe, EPC, Electrical test, Heating service,
// Garden tidy, Cleaning, Property inspection and Property inventory, and behind each of them sits
// supplier quoting, instruction, a Xero bill and invoice reconciliation. So this screen is not a
// new capability — it is an existing operation with no API in front of it. The guide page says so.
//
// `estateProblem` is the field that makes this a probate product rather than a supplier list: an
// empty house is a set of liabilities that accrue from the date of death, and the practitioner is
// the one who gets blamed for them.
// Every job on this list is delivered by Sail. We hold the trade relationships, we do the quoting
// and the instructing, and one invoice comes back with our name on it — so no supplier is named
// anywhere in here. That is the offer: the practitioner rings one number.
//
// `pricing` is the important field. Most of these are a known job on a known property and carry a
// published fixed fee, so the price is on screen before anything is pressed. Clearance and
// refurbishment cannot be: what they cost depends on what is in the house and what state it is in,
// so those two ask for a price first.
export const SERVICE_CATALOGUE = [
    {
        id: "clearance",
        label: "House clearance",
        estateProblem: "Nothing can be marketed, photographed or valued properly until the contents are out.",
        turnaround: "5–10 working days",
        pricing: "quoted",
        priceNote: "Priced on the contents and the access",
        indicativePence: 250000
    },
    {
        id: "refurbishment",
        label: "Refurbishment",
        estateProblem: "A house that will not pass a survey sells to cash buyers at a discount far bigger than the work costs.",
        turnaround: "Scoped, then 3–8 weeks",
        pricing: "quoted",
        priceNote: "Priced on a schedule of works",
        indicativePence: 0
    },
    {
        id: "drain_down",
        label: "Drain down",
        estateProblem: "An unheated empty house through one winter is a burst pipe and an insurance argument about whether it was occupied.",
        turnaround: "2–3 working days",
        pricing: "fixed",
        fixedPence: 32000
    },
    {
        id: "lock_change",
        label: "Lock change",
        estateProblem: "Nobody knows how many keys are out. Most unoccupied policies require the executor to be able to say who holds one.",
        turnaround: "Next working day",
        pricing: "fixed",
        fixedPence: 45000
    },
    {
        id: "key_safe",
        label: "Key safe",
        estateProblem: "Every visit — valuer, clearance, viewings — otherwise needs somebody to drive over and open the door.",
        turnaround: "Next working day",
        pricing: "fixed",
        fixedPence: 9500
    },
    {
        id: "epc",
        label: "EPC",
        estateProblem: "Required before the property can be marketed. Frequently found to be missing on the day it goes live.",
        turnaround: "3–5 working days",
        pricing: "fixed",
        fixedPence: 10000
    },
    {
        id: "garden_tidy",
        label: "Garden clearance",
        estateProblem: "An overgrown front garden tells the street the house is empty, and it is the first photograph a buyer sees.",
        turnaround: "5 working days",
        pricing: "quoted",
        priceNote: "Priced on the size and the state of it",
        indicativePence: 160000
    },
    {
        id: "cleaning",
        label: "Deep clean",
        estateProblem: "After a clearance the house shows badly. It is the cheapest thing on this list that moves the price.",
        turnaround: "2–3 working days",
        pricing: "fixed",
        fixedPence: 55000
    },
    {
        id: "property_inspection",
        label: "Property inspection",
        estateProblem: "Most unoccupied property policies require a documented inspection every 7 to 14 days, or cover lapses.",
        turnaround: "Fortnightly, ongoing",
        pricing: "fixed",
        fixedPence: 10000
    },
    {
        id: "property_inventory",
        label: "Property inventory",
        estateProblem: "Chattels have to be valued for the IHT407, and a beneficiary dispute about what was in the house is unanswerable without a list.",
        turnaround: "3–5 working days",
        pricing: "fixed",
        fixedPence: 39900
    },
    {
        id: "electrical_test",
        label: "Electrical test",
        estateProblem: "An EICR is needed if the property will be let rather than sold, and buyers' surveyors ask for it either way.",
        turnaround: "5 working days",
        pricing: "fixed",
        fixedPence: 19500
    },
    {
        id: "heating_service",
        label: "Heating service",
        estateProblem: "A boiler that has not run since the date of death is a cold house at every viewing and a renegotiation after the survey.",
        turnaround: "5 working days",
        pricing: "fixed",
        fixedPence: 14500
    }
];

// What is already on each matter before the practitioner touches this screen. Two different
// pictures on purpose: Hollis is an occupied-looking house in a village where the son lives nearby,
// so only the keys are a problem. Adeyemi is empty, in poor condition, and the file has been open
// since March — which is what the taxable estate looks like.
export const MATTER_SERVICES = {
    hollis: {
        lock_change: { status: "done", instructedOn: "2026-04-02", bookedFor: "2026-04-08", completedOn: "2026-04-08", agreedPence: 45000 },
        key_safe: { status: "booked", instructedOn: "2026-04-08", bookedFor: "2026-04-16", agreedPence: 9500 }
    },
    adeyemi: {
        clearance: { status: "booked", quotedOn: "2026-07-24", instructedOn: "2026-07-29", bookedFor: "2026-08-12", agreedPence: 252000 },
        drain_down: { status: "instructed", instructedOn: "2026-08-04", agreedPence: 32000 },
        property_inspection: { status: "done", instructedOn: "2026-07-10", bookedFor: "2026-07-15", completedOn: "2026-07-15", agreedPence: 10000 }
    }
};
