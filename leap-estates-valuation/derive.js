// Every string and every figure the screen shows is computed here, from the API response objects
// in fixtures.js and the matter's own record. Nothing is hardcoded for display.
//
// The bottom half of this file is the part worth reading. It is the estate calculation, and it
// exists to make one thing visible: every line of it moves when the property figure moves. That
// is why a valuation belongs at Assets → Properties rather than three steps later.

// ---------------------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------------------

const gbp = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0
});

// Monetary values cross the API in pence. Never store a formatted string.
export function poundsFromPence(pence) {
    if (pence === null || pence === undefined) return "—";
    return gbp.format(pence / 100);
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function longDate(iso) {
    if (!iso) return "—";
    const [year, month, day] = iso.split("-").map(Number);
    if (!year || !month || !day) return iso;
    return `${day} ${MONTHS[month - 1]} ${year}`;
}

// LEAP's own field format is dd/mm/yyyy, so dates inside their chrome use it rather than prose.
export function shortDate(iso) {
    if (!iso) return "";
    const [year, month, day] = iso.split("-");
    return `${day}/${month}/${year}`;
}

const ACRONYMS = new Set(["UK", "PLC", "LTD", "LLP", "LP", "CIC", "CIO", "NHS", "TSB", "RBS", "HSBC", "AIB", "BSOC"]);

// HMLR returns proprietor names shouted: "SAMUEL OLUWASEUN ADEYEMI". Left raw they look like a
// rendering bug, so title-case them for display while keeping the register text verbatim.
export function titleCaseName(name) {
    return name
        .split(/(\s+|-)/)
        .map((part) => {
            if (!/^[A-Za-z]/.test(part)) return part;
            if (ACRONYMS.has(part.toUpperCase())) return part.toUpperCase();
            return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
        })
        .join("");
}

export function joinNames(names) {
    if (names.length === 0) return "No registered proprietor";
    if (names.length === 1) return names[0];
    return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

export function deceasedName(matter) {
    const { firstName, middleName, lastName } = matter.deceased;
    return `${firstName} ${middleName ? `${middleName} ` : ""}${lastName}`;
}

export function fullAddress(matter) {
    return `${matter.property.addressLine1}, ${matter.property.town}, ${matter.property.postcode}`;
}

// ---------------------------------------------------------------------------------------
// The co-ownership derivation
// ---------------------------------------------------------------------------------------

// A Form A restriction is the Land Registry's marker of a tenancy in common. Its ABSENCE is strong
// evidence of a joint tenancy but is not proof: a severance that was never protected by a
// restriction leaves no trace on the register. Every caller must show `basis` alongside
// `headline`, never the headline alone.
export function coOwnership(titleCheck) {
    const count = titleCheck.proprietors.length;
    const formA = titleCheck.flags.has_form_a_restriction;

    if (count === 1) {
        return {
            headline: "Sole owner",
            tone: "neutral",
            consequence: "The whole beneficial interest is an asset of the estate.",
            basis: "One registered proprietor on the Proprietorship Register.",
            estateShare: 100,
            shareIsAssumed: false,
            passesBySurvivorship: false
        };
    }

    if (formA === "yes") {
        return {
            headline: "Tenants in common",
            tone: "attention",
            consequence: "Only the deceased's share is an asset of the estate, and it passes under the will.",
            basis: "A Form A restriction is registered, which is how the Land Registry records a tenancy in common.",
            // The register records THAT the property is held in common. It does not record the
            // shares. An equal split is the starting assumption and every caller must label it as
            // one — a declaration of trust or the transfer deed is what settles it.
            estateShare: Math.round(100 / count),
            shareIsAssumed: true,
            passesBySurvivorship: false
        };
    }

    if (formA === "no") {
        return {
            headline: "Joint tenants",
            tone: "clear",
            consequence: "The deceased's share passes to the surviving proprietor by survivorship, outside the will.",
            basis: "No Form A restriction is registered. A severance that was never protected by one would not appear here, so we confirm it in the valuation.",
            estateShare: Math.round(100 / count),
            shareIsAssumed: true,
            passesBySurvivorship: true
        };
    }

    return {
        headline: "Not determinable",
        tone: "neutral",
        consequence: "How the property was held cannot be read from the register. We confirm it as part of the valuation.",
        basis: "The Form A detector returned unknown for this title.",
        estateShare: 100,
        shareIsAssumed: true,
        passesBySurvivorship: false
    };
}

// ---------------------------------------------------------------------------------------
// Charges and restrictions
// ---------------------------------------------------------------------------------------

const CHARGE_ENTRY_TYPES = ["REGISTERED_CHARGE", "NOTED_CHARGE", "EQUITABLE_CHARGE", "SUB_CHARGE", "DISCOUNT_CHARGE"];
const RESTRICTION_ENTRY_TYPES = ["RESTRICTION_FORM_A", "RESTRICTION_CHARGE", "RESTRICTION_OTHER", "RESTRICTION_CHARGE_RELATED"];

export function charges(titleCheck) {
    const found = titleCheck.entries.filter(
        (entry) => entry.sub_register === "C" && CHARGE_ENTRY_TYPES.includes(entry.canonical_type)
    );

    if (titleCheck.flags.has_charge !== "yes" || found.length === 0) {
        return {
            headline: "No charges",
            tone: "clear",
            consequence: "No secured lending to deduct as a liability of the estate.",
            basis: "The Charges Register contains no registered charge.",
            items: []
        };
    }

    const lenders = [...new Set(found.map((entry) => entry.beneficiary).filter(Boolean).map(titleCaseName))];
    const plural = found.length > 1;

    return {
        headline: lenders.length === 1 ? lenders[0] : `${found.length} charges`,
        tone: "attention",
        consequence: plural
            ? "Each is a liability of the estate. Redemption statements needed before the IHT400."
            : "A liability of the estate. A redemption statement is needed before the IHT400.",
        basis: `${found.length} charge ${plural ? "entries" : "entry"} on the Charges Register.`,
        items: found.map((entry) => ({
            lender: entry.beneficiary ? titleCaseName(entry.beneficiary) : "Lender not named on the register",
            registeredOn: longDate(entry.registration_date),
            text: entry.text
        }))
    };
}

export function restrictions(titleCheck) {
    const found = titleCheck.entries.filter((entry) => RESTRICTION_ENTRY_TYPES.includes(entry.canonical_type));

    if (found.length === 0) {
        return {
            headline: "No restrictions",
            tone: "clear",
            consequence: "Nothing on the register holds up a disposition by the personal representatives.",
            basis: "No restriction entries on the Proprietorship Register.",
            items: []
        };
    }

    // A charge restriction is the one that actually bites on a sale, so lead with it.
    const chargeRestriction = found.find((entry) => entry.canonical_type === "RESTRICTION_CHARGE");

    return {
        headline: found.length === 1 ? "1 restriction" : `${found.length} restrictions`,
        tone: "attention",
        consequence: chargeRestriction
            ? "The lender's written consent is needed before any disposition can be registered."
            : "These need clearing before a disposition can be registered.",
        basis: `${found.length} restriction ${found.length === 1 ? "entry" : "entries"} on the Proprietorship Register.`,
        items: found.map((entry) => ({
            kind: entry.canonical_type === "RESTRICTION_FORM_A" ? "Form A restriction" : "Restriction",
            beneficiary: entry.beneficiary ? titleCaseName(entry.beneficiary) : null,
            registeredOn: longDate(entry.registration_date),
            text: entry.text
        }))
    };
}

// With one proprietor the headline is already the name, so repeating it underneath reads as a
// rendering bug. The line below the headline earns its place or it does not appear.
export function owners(titleCheck) {
    const names = titleCheck.proprietors.map((proprietor) => titleCaseName(proprietor.name));
    const single = names.length === 1;

    return {
        headline: single ? names[0] : `${names.length} proprietors`,
        tone: "neutral",
        consequence: single ? "The only name on the register." : joinNames(names),
        basis: "Registered proprietors as recorded at HM Land Registry.",
        names
    };
}

export function tenure(titleCheck) {
    const label = titleCheck.tenure.charAt(0).toUpperCase() + titleCheck.tenure.slice(1);
    if (titleCheck.tenure === "leasehold" && titleCheck.lease_years_remaining !== null) {
        return `${label} · ${titleCheck.lease_years_remaining} years remaining`;
    }
    return label;
}

// ---------------------------------------------------------------------------------------
// Valuation
// ---------------------------------------------------------------------------------------

const CONFIDENCE_COPY = {
    HIGH: "Backed by close comparable sales.",
    MEDIUM: "Add what you know about the property to narrow this.",
    LOW: "Too little recent evidence nearby to be precise."
};

export function valuation(instant) {
    // Branch on the discriminator, never on whether `prices` happens to be truthy.
    if (!instant) return null;

    if (instant.status === "INELIGIBLE_FOR_INSTANT") {
        return {
            eligible: false,
            headline: "No automated figure",
            consequence: "There is not enough evidence to price this address automatically. Order the full valuation instead.",
            reason: instant.reason
        };
    }

    return {
        eligible: true,
        pricePence: instant.prices.market_price_pence,
        lowPence: instant.prices.low_range_pence,
        highPence: instant.prices.high_range_pence,
        headline: poundsFromPence(instant.prices.market_price_pence),
        rangeLow: poundsFromPence(instant.prices.low_range_pence),
        rangeHigh: poundsFromPence(instant.prices.high_range_pence),
        valuationDate: longDate(instant.valuation_date),
        band: instant.confidence.band,
        bandLabel: instant.confidence.band.charAt(0) + instant.confidence.band.slice(1).toLowerCase(),
        bandCopy: CONFIDENCE_COPY[instant.confidence.band] || "",
        score: Math.round(instant.confidence.score * 100),
        compsCount: instant.basis.comps_count,
        lastSold: instant.basis.last_sold_price_pounds
            ? `${gbp.format(instant.basis.last_sold_price_pounds)} in ${instant.basis.last_sold_date.slice(0, 4)}`
            : null
    };
}

const SUBJECT_LABELS = {
    property_type: "Type",
    bedrooms: "Bedrooms",
    bathrooms: "Bathrooms",
    receptions: "Receptions",
    floor_area_sqm: "Floor area",
    condition: "Condition"
};

const CONDITION_LABELS = {
    EXCELLENT: "Excellent",
    GOOD: "Good",
    AVERAGE: "Needs modernising",
    POOR: "Poor",
    REFURB_REQUIRED: "Needs full refurbishment"
};

// `subject` tells you which facts came from the matter and which we filled in. It is what makes
// the refine step legible rather than magic — the badges come straight from source.
export function subjectFacts(instant) {
    return Object.entries(SUBJECT_LABELS)
        .map(([key, label]) => {
            const fact = instant.subject[key];
            if (!fact || fact.value === null || fact.value === undefined) return null;
            let value = fact.value;
            if (key === "condition") value = CONDITION_LABELS[fact.value] || fact.value;
            if (key === "floor_area_sqm") value = `${fact.value} m²`;
            return { key, label, value: String(value), source: fact.source };
        })
        .filter(Boolean);
}

export function findingsBySentiment(titleCheck) {
    const order = { negative: 0, neutral: 1, positive: 2 };
    return [...titleCheck.findings].sort((a, b) => order[a.sentiment] - order[b.sentiment]);
}

// How many detector flags came back conclusive, and how many of those were clear. This is what
// stops an all-clear title reading as "we found nothing" — it read the register and it is telling
// you the title is clean.
export function checksSummary(titleCheck) {
    const concerning = [
        "has_form_a_restriction",
        "has_charge",
        "has_multiple_charges",
        "has_charge_restriction",
        "has_non_charge_restriction",
        "has_bankruptcy_entry",
        "has_caution_entry",
        "has_unilateral_notice",
        "has_home_rights",
        "has_possessory_title",
        "is_flying_freehold",
        "has_rent_charge",
        "title_defects_that_require_indemnification"
    ];
    const run = concerning.filter((key) => titleCheck.flags[key] !== "unknown");
    const raised = run.filter((key) => titleCheck.flags[key] === "yes");
    return { run: run.length, raised: raised.length, clear: run.length - raised.length };
}

// ---------------------------------------------------------------------------------------
// What the title check pushes into the rest of the matter
// ---------------------------------------------------------------------------------------

// A registered charge is a liability of the estate, so it belongs on the Debts page — but the
// register never states the amount outstanding. Returning a row with no figure and a plain
// instruction is the honest result; inventing a balance from the register would be a fabrication
// that ends up on an IHT400.
export function chargeDebtRows(titleCheck) {
    if (!titleCheck) return [];
    // `registration_date` is the date the charge was REGISTERED, which is not the date on the deed
    // — the register entry text carries that, and the two are usually days or weeks apart. Labelling
    // it "dated" would put a wrong date in front of a solicitor.
    return charges(titleCheck).items.map((item) => ({
        name: `${item.lender} — charge registered ${item.registeredOn}`,
        valuePence: null,
        note: "Redemption statement required",
        fromTitle: true
    }));
}

// ---------------------------------------------------------------------------------------
// The estate calculation
// ---------------------------------------------------------------------------------------

const NIL_RATE_BAND_PENCE = 32500000;
const RESIDENCE_NIL_RATE_BAND_PENCE = 17500000;
const IHT_RATE = 0.4;

// The threshold below which an estate is a low-value excepted estate for a death on or after
// 1 January 2022. It doubles where the whole of a predeceased spouse's nil rate band is
// available to transfer — which is why a widowed client and a married one land in different
// places on the same numbers.
const EXCEPTED_THRESHOLD_PENCE = NIL_RATE_BAND_PENCE;
const EXCEPTED_THRESHOLD_WITH_TNRB_PENCE = NIL_RATE_BAND_PENCE * 2;

export function otherAssetsTotalPence(matter) {
    return matter.otherAssets.reduce((total, asset) => total + asset.valuePence, 0);
}

export function debtsTotalPence(matter) {
    return matter.debts.reduce((total, debt) => total + debt.valuePence, 0);
}

// The deceased's share of the property, in pence. Before a title check has run the share is
// whatever the matter recorded; afterwards it is what the register implies.
export function propertySharePence(matter, instant, titleCheck) {
    if (!instant || instant.status !== "COMPLETED") return null;
    const share = titleCheck ? coOwnership(titleCheck).estateShare : matter.property.sharePercent;
    return Math.round(instant.prices.market_price_pence * (share / 100));
}

// The whole calculation, from one property figure. `pricePence` is a parameter rather than being
// read off the instant valuation so the same function can price the low and high ends of the
// range — which is how the tax exposure below is worked out.
export function estateCalculation(matter, pricePence, titleCheck) {
    const share = titleCheck ? coOwnership(titleCheck).estateShare : matter.property.sharePercent;
    const propertyPence = Math.round(pricePence * (share / 100));
    const otherPence = otherAssetsTotalPence(matter);
    const grossPence = propertyPence + otherPence;
    const knownDebtsPence = debtsTotalPence(matter);
    const netPence = grossPence - knownDebtsPence;

    // A transferable nil rate band is available where the client was widowed and their spouse's
    // band was unused. Married clients have a living spouse, so there is nothing to transfer yet.
    const hasTransferableNrb = matter.deceased.maritalStatus === "Widowed";
    const nrbPence = NIL_RATE_BAND_PENCE * (hasTransferableNrb ? 2 : 1);

    // The residence nil rate band is capped at the value of the residential interest actually
    // passing to a direct descendant, so a small share cannot claim the whole band.
    const rnrbClaimable = matter.residencePassesToDescendants;
    const rnrbPence = rnrbClaimable ? Math.min(RESIDENCE_NIL_RATE_BAND_PENCE, propertyPence) : 0;

    const chargeablePence = Math.max(0, netPence - nrbPence - rnrbPence);
    const taxPence = Math.round(chargeablePence * IHT_RATE);

    // Excepted-estate test is on the GROSS value, and the residence band never makes an estate
    // excepted — only the transferable nil rate band doubles the threshold.
    const exceptedThresholdPence = hasTransferableNrb ? EXCEPTED_THRESHOLD_WITH_TNRB_PENCE : EXCEPTED_THRESHOLD_PENCE;
    const isExcepted = grossPence <= exceptedThresholdPence && taxPence === 0;

    return {
        share,
        shareIsAssumed: titleCheck ? coOwnership(titleCheck).shareIsAssumed : true,
        propertyPence,
        otherPence,
        grossPence,
        knownDebtsPence,
        // A charge on the register is a debt we know exists but cannot yet size.
        unsizedDebts: chargeDebtRows(titleCheck),
        netPence,
        hasTransferableNrb,
        nrbPence,
        rnrbClaimable,
        rnrbPence,
        chargeablePence,
        taxPence,
        exceptedThresholdPence,
        isExcepted
    };
}

// The reason a MEDIUM band matters on a taxable estate: the same range that looks like a
// rounding error on the property is five figures of tax. Returns null when there is no tax to be
// uncertain about.
export function taxExposure(matter, instant, titleCheck) {
    if (!instant || instant.status !== "COMPLETED") return null;

    const low = estateCalculation(matter, instant.prices.low_range_pence, titleCheck);
    const high = estateCalculation(matter, instant.prices.high_range_pence, titleCheck);

    if (low.taxPence === 0 && high.taxPence === 0) return null;

    return {
        lowTaxPence: low.taxPence,
        highTaxPence: high.taxPence,
        spreadPence: high.taxPence - low.taxPence
    };
}

// Step 8 of LEAP's own Estate Administration curriculum is "Creating Submission Forms". Which
// forms those are is a function of the estate, and two of the four here are decided by the title
// check rather than by anything the practitioner typed.
export function submissionForms(matter, calculation, titleCheck) {
    if (!calculation) return null;

    if (calculation.isExcepted) {
        return {
            required: false,
            headline: "Excepted estate — no IHT400 required",
            reason: `The gross estate is ${poundsFromPence(calculation.grossPence)}, within the ${poundsFromPence(
                calculation.exceptedThresholdPence
            )} threshold${calculation.hasTransferableNrb ? " available with the transferable nil rate band" : ""}. The values are declared on the grant application instead.`,
            forms: []
        };
    }

    const co = titleCheck ? coOwnership(titleCheck) : null;
    const forms = [
        { code: "IHT400", name: "Inheritance Tax account", why: "The estate is neither excepted nor exempt." },
        { code: "IHT405", name: "Houses, land, buildings and interests in land", why: "There is a residential property in the estate." }
    ];

    if (co && co.estateShare < 100) {
        forms.push({ code: "IHT404", name: "Jointly owned assets", why: `The property was held as ${co.headline.toLowerCase()}.`, fromTitle: true });
    }
    if (calculation.hasTransferableNrb) {
        forms.push({ code: "IHT402", name: "Claim to transfer unused nil rate band", why: "The client was widowed." });
    }
    if (calculation.rnrbPence > 0) {
        forms.push({ code: "IHT435", name: "Claim for residence nil rate band", why: "The residence passes to a direct descendant." });
    }

    return {
        required: true,
        headline: `IHT400 required · ${poundsFromPence(calculation.taxPence)} payable`,
        reason: `The chargeable estate is ${poundsFromPence(calculation.chargeablePence)} after reliefs, taxed at 40%.`,
        forms
    };
}

// ---------------------------------------------------------------------------------------
// Ancillary property services
// ---------------------------------------------------------------------------------------

// One row per service in the catalogue, merging what was already on the matter with whatever the
// practitioner has done on this screen. Runtime state wins, because the whole point of the screen
// is that ordering something changes it.
export function serviceRows(catalogue, seeded, ordered) {
    return catalogue.map((service) => {
        const record = { ...(seeded[service.id] || {}), ...(ordered[service.id] || {}) };
        const status = record.status || "available";
        const isQuoted = service.pricing === "quoted";

        // A fixed-fee job has a published price before anyone touches it, so there is nothing to
        // ask for and the row goes straight to Instruct. Clearance and refurbishment cannot be
        // priced off a postcode, so those two ask first.
        const pricePence = record.agreedPence ?? record.quotedPence ?? (isQuoted ? null : service.fixedPence);

        return {
            ...service,
            status,
            isQuoted,
            quotedPence: record.quotedPence ?? null,
            agreedPence: record.agreedPence ?? null,
            quotedOn: record.quotedOn ?? null,
            instructedOn: record.instructedOn ?? null,
            bookedFor: record.bookedFor ?? null,
            completedOn: record.completedOn ?? null,
            statusLabel: serviceStatusLabel(status, record),
            timeline: serviceTimeline(record),
            pricePence,
            // "Fixed fee" is a claim about the price, not about whether we have given one yet.
            priceIsFirm: record.agreedPence != null || record.quotedPence != null || !isQuoted
        };
    });
}

const SERVICE_STATUS_LABELS = {
    done: "Completed",
    booked: "Booked in",
    instructed: "Instructed",
    quoted: "Priced",
    available: "Not ordered"
};

function serviceStatusLabel(status) {
    return SERVICE_STATUS_LABELS[status] || SERVICE_STATUS_LABELS.available;
}

// The dates behind the badge. A fee earner asked "where is the clearance up to" wants the answer
// without opening anything, and "Instructed" on its own is not an answer.
function serviceTimeline(record) {
    return [
        record.quotedOn ? ["Priced", record.quotedOn] : null,
        record.instructedOn ? ["Instructed", record.instructedOn] : null,
        // A job attended on the day it was booked would otherwise print the same date twice.
        record.bookedFor && record.bookedFor !== record.completedOn
            ? [record.completedOn ? "Attended" : "Booked for", record.bookedFor]
            : null,
        record.completedOn ? ["Completed", record.completedOn] : null
    ]
        .filter(Boolean)
        .map(([label, date]) => [label, shortDate(date)]);
}

// The line at the top of the screen. It has to answer the only question a fee earner has about a
// list of chargeable work on a file with no money in it: who is paying, and when.
export function servicesSummary(rows) {
    const live = rows.filter((row) => ["instructed", "booked", "done"].includes(row.status));
    const quoted = rows.filter((row) => row.status === "quoted");
    const committedPence = live.reduce((total, row) => total + (row.pricePence || 0), 0);

    return {
        liveCount: live.length,
        quotedCount: quoted.length,
        committedPence,
        // Nothing is drawn from the estate: Sail funds the work and recovers it from the sale
        // proceeds, which is why this can be ordered before the grant releases any money.
        estateOutlayPence: 0
    };
}

// ---------------------------------------------------------------------------------------
// Loss on sale of land — IHTA 1984 s.191
// ---------------------------------------------------------------------------------------

// The relief only bites if the shortfall clears the statutory floor: s.191(2) disapplies it where
// the difference is less than the LOWER of £1,000 and 5% of the death value. Modelled rather than
// asserted so the panel cannot claim a claim that would not be allowed.
const S191_FLOOR_PENCE = 100000;
const S191_FLOOR_FRACTION = 0.05;

export function lossOnSale(deathValuePence, salePricePence) {
    if (deathValuePence === null || salePricePence === null) return null;

    const shortfallPence = deathValuePence - salePricePence;
    const floorPence = Math.min(S191_FLOOR_PENCE, Math.round(deathValuePence * S191_FLOOR_FRACTION));

    if (shortfallPence <= 0) {
        return { qualifies: false, reason: "sold_at_or_above", shortfallPence, floorPence, reliefPence: 0 };
    }
    if (shortfallPence < floorPence) {
        return { qualifies: false, reason: "below_floor", shortfallPence, floorPence, reliefPence: 0 };
    }

    // The claim substitutes the sale price for the death value, so the tax saved is the shortfall
    // at 40% — for an estate already paying at the full rate.
    return { qualifies: true, reason: "qualifies", shortfallPence, floorPence, reliefPence: Math.round(shortfallPence * 0.4) };
}
