// A fake transport standing in for the Sail calls behind the two buttons on the Properties card.
//
// Nothing here reaches the network. What it does do is build the REAL request bodies from the
// matter's own record — which is the part worth looking at, because every field the API requires
// was collected at step 1 of LEAP's Estate Administration curriculum, long before the practitioner
// reaches step 4.
//
// Two buttons, two call plans:
//
//   Get an instant valuation      POST /properties         "Matching the address"
//                                 POST /valuations/instant "Valuing at the date of death"
//
//   Upgrade to a full valuation   POST /valuations/full    "Reading the register" -> title_check
//
// A full valuation returns no price and an instant valuation returns no title data. That is why
// there are two of them, and why the upgrade is a genuine upgrade rather than a rerun.

import { MATTERS } from "./fixtures.js?v=20260915m";

export const BASE_URL = "https://api.sailhomes-staging.co.uk/api/v1";

// The token lives on LEAP's servers and never reaches the desktop client. Rendering a
// realistic-looking secret here would teach exactly the wrong lesson, so we render the rule.
export const AUTH_HEADER = "Bearer ‹held server-side›";

const LATENCY_MS = {
    properties: 190,
    instant: 900,
    full: 1500,
    quote: 620,
    instruct: 480
};

// ---------------------------------------------------------------------------------------
// Request bodies — built from the matter, not typed by the practitioner
// ---------------------------------------------------------------------------------------

export function registerPropertyBody(matter) {
    return {
        address_line_1: matter.property.addressLine1,
        postcode: matter.property.postcode,
        uprn: null,
        client_reference: matter.number
    };
}

// `valuation_date` is the date of death, so the figure is the one the IHT400 asks for rather than
// today's price. Property facts are sent only where the matter already holds them; nulls are fine
// everywhere else.
export function instantValuationBody(matter, facts) {
    return {
        property_id: matter.api.propertyId,
        address_line_1: null,
        postcode: null,
        uprn: null,
        property_type: facts ? facts.propertyType : null,
        bedrooms: facts ? facts.bedrooms : null,
        bathrooms: null,
        receptions: null,
        floor_area_sqm: null,
        condition: facts ? facts.condition : null,
        last_known_purchase: null,
        valuation_date: matter.deceased.dateOfDeath,
        client_reference: matter.number
    };
}

// The smallest thing that works: one call, an inline address and a date of death. No property
// registration, no facts. Everything beyond this is opt-in.
export function minimalInstantValuationBody(matter) {
    return {
        address_line_1: matter.property.addressLine1,
        postcode: matter.property.postcode,
        valuation_date: matter.deceased.dateOfDeath
    };
}

export function fullValuationBody(matter) {
    const { deceased, client, feeEarner } = matter;
    return {
        property_id: matter.api.propertyId,
        deceased_name: `${deceased.firstName} ${deceased.middleName ? `${deceased.middleName} ` : ""}${deceased.lastName}`,
        date_of_death: deceased.dateOfDeath,
        transaction_type: "unknown",
        introducer_contact: {
            first_name: feeEarner.firstName,
            last_name: feeEarner.lastName,
            email: feeEarner.email,
            phone_number: feeEarner.phoneNumber
        },
        introducer_external_reference_id: matter.number,
        introducer_notes: "Requested from LEAP Estate Administration, Assets → Properties.",
        executor_or_beneficiary: {
            first_name: client.firstName,
            last_name: client.lastName,
            email: client.email,
            phone_number: client.phoneNumber,
            is_executor: client.isExecutor
        },
        title_number: null
    };
}

// Phase two: the Sale of Estate matter. `price_pence` is the valued figure, so the quote is priced
// off the same number the IHT400 was.
export function quoteBody(matter, pricePence) {
    return {
        property_id: matter.api.propertyId,
        transaction_type: "sale",
        price_pence: pricePence,
        tenure: "freehold",
        number_of_clients: 1,
        residential_commercial: "residential",
        client_reference: matter.number
    };
}

export function instructBody(quoteId) {
    return {
        quote_id: quoteId,
        instruct_agency: true
    };
}

// ---------------------------------------------------------------------------------------
// The call plans
// ---------------------------------------------------------------------------------------

export function instantValuationPlan(matterId) {
    const matter = MATTERS[matterId];
    const known = matter.property.knownFacts;

    return [
        {
            id: `${matterId}-properties`,
            stage: "Matching the address at HM Land Registry",
            done: "Address matched",
            method: "POST",
            path: "/properties",
            latency: LATENCY_MS.properties,
            status: 201,
            body: registerPropertyBody(matter),
            response: {
                property_id: matter.api.propertyId,
                address_line_1: matter.property.addressLine1,
                postcode: matter.property.postcode,
                uprn: null,
                client_reference: matter.number
            }
        },
        {
            id: `${matterId}-instant`,
            stage: known ? "Valuing at the date of death, using the details on the matter" : "Valuing at the date of death",
            done: `Valued as at ${matter.deceased.dateOfDeath.split("-").reverse().join("/")}`,
            method: "POST",
            path: "/valuations/instant",
            latency: LATENCY_MS.instant,
            status: 200,
            body: instantValuationBody(matter, known),
            response: matter.api.instant
        }
    ];
}

// Refining is one more instant valuation against the same property_id, carrying the facts the
// practitioner picked up from the executor. The response differs in prices, confidence AND
// subject.*.source — so the Medium to High move is real, not a UI flag.
export function refineValuationCall(matterId) {
    const matter = MATTERS[matterId];
    return {
        id: `${matterId}-instant-refined`,
        stage: "Re-valuing with the details you added",
        done: "Re-valued",
        method: "POST",
        path: "/valuations/instant",
        latency: LATENCY_MS.instant,
        status: 200,
        body: instantValuationBody(matter, matter.refinement),
        response: matter.api.instantRefined
    };
}

export function fullValuationCall(matterId) {
    const matter = MATTERS[matterId];
    return {
        id: `${matterId}-full`,
        stage: "Reading the title register",
        done: "Register read — valuation booked on the s.160 basis",
        method: "POST",
        path: "/valuations/full",
        latency: LATENCY_MS.full,
        status: 201,
        body: fullValuationBody(matter),
        response: matter.api.full
    };
}

// Phase two. Two calls, and the second one is the point of no return.
export function saleOfEstatePlan(matterId, pricePence) {
    const matter = MATTERS[matterId];
    const quoteId = matterId === "hollis" ? "8f2c1a05-6d37-4e92-b148-05a7c3e69140" : "3b0d7e46-9c81-4a25-8f70-6e14d2b0537c";
    const caseId = matterId === "hollis" ? "a47e0d92-3c19-4b86-9d52-71f0ae358c4d" : "62f9b1c8-0a45-4d73-8e16-9c30bd7a2f51";

    // Line items come back priced per item with their own VAT — the response is the quote, not a
    // total to be re-derived on the client.
    const items = [
        { display_name: "Legal fee", rate_type: "legal_fee", category: "fee", quantity: 1, has_vat: true, fee_pence_excluding_vat: 99500, vat_pence: 19900, fee_pence_total: 119400 },
        { display_name: "Sale pack", rate_type: "sale_pack", category: "disbursement", quantity: 1, has_vat: false, fee_pence_excluding_vat: 8500, vat_pence: 0, fee_pence_total: 8500 },
        { display_name: "Official copies", rate_type: "official_copies", category: "disbursement", quantity: 2, has_vat: false, fee_pence_excluding_vat: 700, vat_pence: 0, fee_pence_total: 700 },
        { display_name: "Bank transfer fee", rate_type: "bank_transfer", category: "disbursement", quantity: 1, has_vat: true, fee_pence_excluding_vat: 3000, vat_pence: 600, fee_pence_total: 3600 }
    ];
    const totalPence = items.reduce((total, item) => total + item.fee_pence_total, 0);

    return [
        {
            id: `${matterId}-quote`,
            stage: "Pricing the conveyancing",
            done: "Quote returned",
            method: "POST",
            path: "/quotes",
            latency: LATENCY_MS.quote,
            status: 201,
            body: quoteBody(matter, pricePence),
            response: {
                quote_id: quoteId,
                case_id: caseId,
                property_id: matter.api.propertyId,
                transaction_type: "sale",
                total_pence: totalPence,
                total_fee_pence: 119400,
                total_exc_fees_and_tax_pence: 12800,
                total_exc_tax_pence: totalPence,
                total_tax_pence: 0,
                referral_fee_pence: 0,
                items
            }
        },
        {
            id: `${matterId}-instruct`,
            stage: "Instructing",
            done: "Instructed — Sale of Estate matter opened",
            method: "POST",
            path: "/instruct",
            latency: LATENCY_MS.instruct,
            status: 201,
            body: instructBody(quoteId),
            response: {
                status: "instructed",
                case_id: caseId,
                client_onboarding_url: `https://portal.sailhomes.co.uk/client/cases/${caseId}`,
                agency_instructed: true
            }
        }
    ];
}

// ---------------------------------------------------------------------------------------
// Ancillary property services
// ---------------------------------------------------------------------------------------
//
// A service row, a price against it, and an instruction date. The price comes back on the same
// request because we hold standing rates for this work, and that is what makes ordering
// from one screen possible at all.
//
// `billing` is the field worth reading: `on_job_completion` invoices when the job finishes,
// `on_sale_completion` defers to the sale. The second is only offered where Sail is marketing the
// property, so the screen asks rather than assuming.

export function serviceQuoteCall(matterId, service, billingMode = "on_sale_completion") {
    const matter = MATTERS[matterId];
    const vatPence = Math.round(service.indicativePence * 0.2);

    return {
        id: `${matterId}-service-quote-${service.id}`,
        stage: `Quoting ${service.label.toLowerCase()}`,
        done: "Quoted",
        method: "POST",
        path: `/properties/${matter.api.propertyId}/services`,
        latency: LATENCY_MS.quote,
        status: 201,
        body: {
            service_type: service.id,
            client_reference: matter.number,
            access_notes: null,
            billing: billingMode
        },
        response: {
            service_id: `svc_${service.id}`,
            service_type: service.id,
            status: "quoted",
            quote: {
                pricing: service.pricing,
                net_pence: service.indicativePence,
                vat_pence: vatPence,
                total_pence: service.indicativePence + vatPence
            },
            estimated_turnaround: service.turnaround,
            billing: {
                mode: billingMode,
                payable_before_grant_pence: billingMode === "on_sale_completion" ? 0 : service.indicativePence
            }
        }
    };
}

export function serviceInstructCall(matterId, service, instructedOn, bookedFor) {
    const matter = MATTERS[matterId];

    return {
        id: `${matterId}-service-instruct-${service.id}`,
        stage: `Instructing ${service.label.toLowerCase()}`,
        done: "Instructed",
        method: "POST",
        path: `/properties/${matter.api.propertyId}/services/svc_${service.id}/instruct`,
        latency: LATENCY_MS.instruct,
        status: 200,
        body: { accepted_quote: true },
        response: {
            service_id: `svc_${service.id}`,
            service_type: service.id,
            status: "instructed",
            instructed_on: instructedOn,
            booked_for: bookedFor,
            estimated_turnaround: service.turnaround
        }
    };
}
