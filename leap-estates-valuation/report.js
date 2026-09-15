// The valuation report itself, as the practitioner receives it.
//
// LEAP's reading of the concept was that "order a valuation" produced a number. It produces a
// document — and on a taxable estate the document is the point, because the s.160 declaration is
// the thing he said he would not promote the valuation without.
//
// So this mirrors `app/api/src/views/valuationReport/ValuationReport.tsx` section for section:
// the same cards in the same order, the same Sail palette, the same declaration wording. What is
// live today is at https://sailvaluations.com/r/<token>; the only thing invented here is the
// subject property, which is the concept's own Adeyemi matter so the figures agree with the rest
// of the prototype.
//
// Everything is derived from the fixtures. Change the valuation and the report changes with it.

import { MATTERS, PRESENT_DAY, REPORT_NARRATIVE } from "./fixtures.js?v=20260915m";
import { sailMark } from "./icons.js?v=20260915m";

const REPORT_DATE = "12 September 2026";
const VALUER = "Sail Homes";

function poundsFromPence(pence) {
    return `£${Math.round(pence / 100).toLocaleString("en-GB")}`;
}

function longDate(iso) {
    const [y, m, d] = iso.split("-").map(Number);
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    return `${d} ${months[m - 1]} ${y}`;
}

function fact(label, value) {
    return `<div class="vr-fact"><div class="vr-key">${label}</div><div class="vr-value">${value}</div></div>`;
}

function price(label, pence, note, isLead) {
    return `<div class="vr-price${isLead ? " vr-price--lead" : ""}">
        <div class="vr-key">${label}</div>
        <div class="vr-price-figure">${poundsFromPence(pence)}</div>
        <p class="vr-price-note">${note}</p>
    </div>`;
}

// Emerald above 70%, amber below — the same threshold the live report uses.
function matchBar(score) {
    const pct = Math.round(score * 100);
    return `<div class="vr-match">
        <span class="vr-match-track"><span class="vr-match-fill${pct >= 70 ? " is-strong" : ""}" style="width:${pct}%"></span></span>
        <span class="vr-match-label">${pct}%</span>
    </div>`;
}

// Distance and floor area drive the score, so a comparable two doors down at the same size reads
// as a strong match without anyone scoring it by hand.
function relevance(comp, subject) {
    const sizeGap = Math.abs(comp.floor_area_sqm - subject.floor_area_sqm.value) / subject.floor_area_sqm.value;
    const distanceGap = Math.min(comp.distance_km / 1.5, 1);
    return Math.max(0.35, 0.82 - sizeGap * 1.2 - distanceGap * 0.35);
}

const PHOTO_SLOTS = [
    "Front elevation", "Hallway", "Living room", "Kitchen",
    "Principal bedroom", "Bathroom", "Rear garden", "Garage"
];

export function reportPage(matterId) {
    const matter = MATTERS[matterId] || MATTERS.adeyemi;
    const valuation = matter.api.instantRefined || matter.api.instant;
    const subject = valuation.subject;
    const deceased = matter.deceased;
    const compsCount = valuation.basis.comps_count;
    const today = PRESENT_DAY[matter.id];
    const narrative = REPORT_NARRATIVE[matter.id];

    // The comparable method, shown rather than asserted. A practitioner who has to defend the
    // figure to the Valuation Office should be able to follow it from the table to the answer.
    const avgPrice = valuation.basis.comps_average_price_pounds;
    const avgSqm = Math.round(
        valuation.comparables.reduce((total, item) => total + item.floor_area_sqm, 0) /
        valuation.comparables.length
    );
    const perSqm = Math.round(avgPrice / avgSqm);
    const indicated = Math.round((perSqm * subject.floor_area_sqm.value) / 1000) * 1000;

    const address = `${matter.property.addressLine1}, ${matter.property.town}, ${matter.property.postcode}`;
    const dateOfDeath = longDate(deceased.dateOfDeath);

    return `<div class="vr-page">

        <!-- In a deck frame the report looks like a static image of a first page, and LEAP's
             whole question is what the document says further down. The cue clears itself the
             moment anyone scrolls a pixel. -->
        <div class="vr-scroll-cue" aria-hidden="true">
            <span>Scroll &mdash; the section 160 declaration is just below</span>
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6" /></svg>
        </div>

        <div class="vr-inner">

            <div class="vr-brandbar">
                <span class="vr-logo">${sailMark(30)}</span>
                <span class="vr-logo-word">Sail Valuations</span>
            </div>

            <section class="vr-card">
                <p class="vr-eyebrow">Property valuation report</p>
                <h1 class="vr-h1">${address}</h1>
                <p class="vr-lead">The open market value at the date of death for the inheritance tax account, with the evidence it was reached from.</p>
                <p class="vr-meta">${REPORT_DATE} · Prepared by ${VALUER}</p>
                <div class="vr-grid">
                    ${fact("Client", `${matter.client.firstName} ${matter.client.lastName}, ${matter.client.relationship.toLowerCase()} and executor`)}
                    ${fact("Matter", matter.number)}
                    ${fact("Estate of", `${deceased.firstName} ${deceased.lastName}`)}
                    ${fact("Instructed by", `${matter.feeEarner.firstName} ${matter.feeEarner.lastName}`)}
                </div>
            </section>

            <section class="vr-card">
                <h2 class="vr-h2">Property Summary</h2>
                <div class="vr-grid">
                    ${fact("Property type", subject.property_type.value)}
                    ${fact("Bedrooms", String(subject.bedrooms.value))}
                    ${fact("Bathrooms", String(subject.bathrooms.value))}
                    ${fact("Receptions", String(subject.receptions.value))}
                    ${fact("Floor area", `${subject.floor_area_sqm.value} sqm (${Math.round(subject.floor_area_sqm.value * 10.764).toLocaleString("en-GB")} sqft)`)}
                    ${fact("Tenure", narrative.tenure)}
                    ${fact("Reason for sale", "Probate")}
                    ${fact("Council tax band", narrative.councilTaxBand)}
                    ${fact("EPC rating", narrative.epcRating)}
                    ${fact("Approximate year built", narrative.yearBuilt)}
                    ${fact("Parking", narrative.parking)}
                    ${fact("Heating", narrative.heating)}
                </div>
            </section>

            <!-- The card LEAP would not promote the valuation without. -->
            <section class="vr-card">
                <h2 class="vr-h2">Probate Valuation</h2>
                <div class="vr-probate">
                    <div class="vr-key">Open market value at the date of death</div>
                    <div class="vr-probate-figure">${poundsFromPence(valuation.prices.market_price_pence)}</div>
                    <div class="vr-price-note">As at ${dateOfDeath}, the date of death</div>
                </div>

                <h3 class="vr-legal-h">Basis of valuation</h3>
                <p class="vr-legal">
                    This valuation is prepared on the basis of market value as defined by
                    section 160 of the Inheritance Tax Act 1984 &mdash; the price the property
                    might reasonably be expected to fetch if sold in the open market at that
                    date. No reduction has been made on the grounds that the whole of the
                    property is to be placed on the market at one and the same time.
                </p>
                <h3 class="vr-legal-h">How we reached the figure</h3>
                <p class="vr-legal">
                    The figure is reached by the comparable method, from ${compsCount} recent sales of
                    similar properties adjusted for size, condition, location and date of sale. Those
                    sales are listed below. This is the basis HM Revenue &amp; Customs applies to land
                    and property for inheritance tax.
                </p>
                <h3 class="vr-legal-h">If the figure is questioned</h3>
                <p class="vr-legal">
                    If HM Revenue &amp; Customs or the Valuation Office Agency question this
                    figure, we will deal with it. You do not need to.
                </p>
            </section>

            <!-- Two different questions, and the gap between them is the point. The date-of-death
                 figure is what the IHT400 asks for; today's is what the estate would actually get.
                 Where today's is materially lower, s.191 lets the personal representatives
                 substitute the sale price and reclaim the difference — and we are the only party
                 holding both numbers. -->
            <section class="vr-card">
                <h2 class="vr-h2">What the property would sell for today</h2>
                <p class="vr-prose">A different question from the one above, and kept separate from it. The date-of-death figure is the one the IHT400 asks for. These are what the executors would be advised to market at now.</p>
                <div class="vr-price-row">
                    ${price("Marketing price", today.market_price_pence, "Our recommended asking price to generate maximum interest", true)}
                    ${price("Estimated achievable price", today.to_achieve_pence, "What we believe the property will sell for", false)}
                </div>
                <h3 class="vr-legal-h">If it sells for less than the date-of-death figure</h3>
                <p class="vr-legal">
                    Where land is sold within four years of death for less than the value reported
                    for inheritance tax, section 191 of the Inheritance Tax Act 1984 allows the
                    personal representatives to substitute the sale price and reclaim the difference
                    on form IHT38. We hold both figures on this property, so we will tell you if a
                    claim becomes available rather than leaving it to be noticed.
                </p>
            </section>

            <section class="vr-card">
                <h2 class="vr-h2">The Property</h2>
                <h3 class="vr-legal-h">Interior</h3>
                <p class="vr-prose">${narrative.interior}</p>
                <h3 class="vr-legal-h">Exterior</h3>
                <p class="vr-prose">${narrative.exterior}</p>
            </section>

            <section class="vr-card">
                <h2 class="vr-h2">Property Photos</h2>
                ${narrative.photos
                    ? `<div class="vr-photos">
                        ${narrative.photos.map(([file, caption], index) => `<figure class="vr-photo${index === 0 ? " vr-photo--wide" : ""}">
                            <img src="./report-shots/${file}" alt="${caption}" loading="lazy">
                            <figcaption>${caption}</figcaption>
                        </figure>`).join("")}
                    </div>`
                    : `<div class="vr-photos">
                        ${PHOTO_SLOTS.map((slot) => `<figure class="vr-photo vr-photo--empty"><span>${slot}</span></figure>`).join("")}
                    </div>
                    <p class="vr-small">Photographs for this matter are not in the concept. On a live report each tile is the photograph itself.</p>`
                }
            </section>

            ${narrative.floorplan
                ? `<section class="vr-card">
                    <h2 class="vr-h2">Floorplan</h2>
                    <img class="vr-floorplan" src="./report-shots/${narrative.floorplan}" alt="Floorplan of the property, ground and first floor" loading="lazy">
                    <p class="vr-small">Measurements are approximate and taken at their widest points. Not to scale.</p>
                </section>`
                : ""
            }

            <section class="vr-card">
                <h2 class="vr-h2">Local Area</h2>
                ${narrative.area.map((para) => `<p class="vr-prose">${para}</p>`).join("")}
            </section>

            <section class="vr-card">
                <h2 class="vr-h2">Property Assessment</h2>
                <div class="vr-assess">
                    <div class="vr-assess-box vr-assess-box--good">
                        <h3 class="vr-legal-h">Key selling points</h3>
                        <ul class="vr-list">${narrative.strengths.map((item) => `<li>${item}</li>`).join("")}</ul>
                    </div>
                    <div class="vr-assess-box vr-assess-box--watch">
                        <h3 class="vr-legal-h">Things to be aware of</h3>
                        <ul class="vr-list">${narrative.watchpoints.map((item) => `<li>${item}</li>`).join("")}</ul>
                    </div>
                </div>
            </section>

            <section class="vr-card">
                <h2 class="vr-h2">Comparable Properties</h2>
                <p class="vr-prose">The properties below are the evidence base for the valuation. Each was selected for its relevance to the subject in location, size and type.</p>
                <table class="vr-table">
                    <thead>
                        <tr>
                            <th>Address</th><th>Price</th><th>Beds</th><th>Sqm</th>
                            <th>Distance</th><th>Match</th><th>Sold</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${valuation.comparables.map((comp) => `<tr>
                            <td class="vr-td-lead">${comp.address}, ${comp.postcode}</td>
                            <td>£${comp.price_pounds.toLocaleString("en-GB")}</td>
                            <td>${comp.bedrooms}</td>
                            <td>${comp.floor_area_sqm}</td>
                            <td>${comp.distance_km} km</td>
                            <td>${matchBar(relevance(comp, subject))}</td>
                            <td>${longDate(comp.date)}</td>
                        </tr>`).join("")}
                    </tbody>
                </table>
                <p class="vr-small">All ${compsCount} sales relied on, most recent first. Match is scored on proximity and floor area against the subject.</p>

                <h3 class="vr-legal-h">The working</h3>
                <p class="vr-legal">
                    Those sales average <strong>£${avgPrice.toLocaleString("en-GB")}</strong>, or
                    <strong>£${perSqm.toLocaleString("en-GB")} per square metre</strong>. Applied to
                    the subject's ${subject.floor_area_sqm.value} sqm that indicates
                    <strong>£${Math.round(indicated / 1000) * 1000 === indicated ? indicated.toLocaleString("en-GB") : indicated.toLocaleString("en-GB")}</strong>,
                    which is then adjusted for condition, plot and position to reach the figure above.
                </p>

                <h3 class="vr-legal-h">Currently on the market</h3>
                <p class="vr-legal">
                    Asking prices are not evidence of value, but they show what the estate would be
                    competing against. Grouped by condition relative to the subject.
                </p>
                <table class="vr-table vr-table--market">
                    <thead>
                        <tr>
                            <th>Address</th><th>Asking</th><th>Beds</th><th>Sqm</th>
                            <th>Distance</th><th>Condition</th><th>On the market</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${narrative.onMarket.map((item) => `<tr>
                            <td class="vr-td-lead">${item.address}, ${item.postcode}</td>
                            <td>£${item.price_pounds.toLocaleString("en-GB")}</td>
                            <td>${item.bedrooms}</td>
                            <td>${item.floor_area_sqm}</td>
                            <td>${item.distance_km} km</td>
                            <td>${item.condition}</td>
                            <td>${item.listed}</td>
                        </tr>`).join("")}
                    </tbody>
                </table>
            </section>

            <section class="vr-card">
                <h2 class="vr-h2">Important Information</h2>
                <h3 class="vr-legal-h">Validity</h3>
                <p class="vr-legal">This valuation is valid for a period of six months from the date of inspection or report, whichever is earlier. Market conditions may change, and a revaluation may be necessary if circumstances alter significantly.</p>
                <h3 class="vr-legal-h">Assumptions</h3>
                <p class="vr-legal">This valuation assumes good and marketable title, no undisclosed encumbrances, and that the property is free from structural defect unless otherwise noted. We have not carried out a structural survey and cannot comment on the condition of uninspected parts of the property.</p>
                <h3 class="vr-legal-h">Valuation Method</h3>
                <p class="vr-legal">Our valuation is based on the comparable method, analysing recent sales of similar properties in the local area, adjusted for differences in size, condition, location and other relevant factors.</p>
                <h3 class="vr-legal-h">Who can rely on this report</h3>
                <p class="vr-legal">This report is prepared for the personal representatives of the estate. It may also be relied upon by their legal advisers, and by HM Revenue &amp; Customs and the Valuation Office Agency, for the purpose of the inheritance tax account. It is not prepared for lending, insurance or any other purpose, and should not be relied upon by anyone else without our written consent.</p>
            </section>

            <!-- No signature. What valuation practice means by "signed" is attributable to an
                 identified valuer, and a name, a date and a reference do that. -->
            <section class="vr-card">
                <h2 class="vr-h2">About this valuation</h2>
                <div class="vr-grid">
                    ${fact("Prepared by", VALUER)}
                    ${fact("Report date", REPORT_DATE)}
                    ${fact("Valuation date", `${dateOfDeath}, the date of death`)}
                    ${fact("Basis", "Open market value under section 160, Inheritance Tax Act 1984")}
                    ${fact("Inspection", "Internal and external inspection")}
                    ${fact("Evidence", `${compsCount} comparable sales`)}
                    ${fact("Reference", narrative.reference)}
                </div>
            </section>

            <div class="vr-footer">
                <div>© 2026 Sail Homes Ltd. All rights reserved.</div>
                <div>This report is confidential and intended for the named recipient only.</div>
            </div>

        </div>
    </div>`;
}
