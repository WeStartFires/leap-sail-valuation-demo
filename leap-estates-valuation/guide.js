// The integration guide. Everything LEAP's engineers need that a streaming payload panel cannot
// show: where the button goes, the field mapping, the two-tier product, the states to handle, and
// the things worth being straight about.

import { MATTERS } from "./fixtures.js?v=20260915m";
import { icon, sailMark } from "./icons.js?v=20260915m";
import {
    registerPropertyBody,
    instantValuationBody,
    minimalInstantValuationBody,
    fullValuationBody,
    quoteBody,
    BASE_URL
} from "./api.js?v=20260915m";

const SAIL_DOCS_URL = "../sail-api-docs/";
const LEAP_DEV_URL = "https://developer.leap.build/";

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function payload(title, route, body, open) {
    return `<details class="code-card"${open ? " open" : ""}>
        <summary><span><strong>${title}</strong><small>${route}</small></span><span class="chevron">${icon("caret", 16)}</span></summary>
        <pre><code>${escapeHtml(JSON.stringify(body, null, 2))}</code></pre>
    </details>`;
}

function endpoint(number, method, path, title, copy) {
    return `<article class="endpoint">
        <span class="endpoint-number">${number}</span>
        <div>
            ${method ? `<div class="endpoint-route"><span>${method}</span><code>${path}</code></div>` : ""}
            <h3>${title}</h3>
            <p>${copy}</p>
        </div>
    </article>`;
}

// The whole pitch in one table. Every row on the left is a field LEAP's Estate Administration app
// collects at step 1 or 2 of its own curriculum, long before the practitioner reaches step 4.
const MAPPING = [
    ["Assets → Properties, address", "<code>address_line_1</code>, <code>postcode</code>", "Which property. Carried in from About the deceased."],
    ["About the deceased → name", "<code>deceased_name</code>", "Identifies the estate, and starts HMCTS grant monitoring"],
    ["About the deceased → date of death", "<code>date_of_death</code>, <code>valuation_date</code>", "Values the property on the day the IHT400 asks about, not today"],
    ["The client card", "<code>executor_or_beneficiary</code>", "So the valuer can arrange access and deliver the report"],
    ["The fee earner on the matter", "<code>introducer_contact</code>", "Who we keep updated"],
    ["The matter number", "<code>client_reference</code>, <code>introducer_external_reference_id</code>", "Idempotency, and matching the result back to the matter"],
    ["Anything on the property record", "<code>property_type</code>, <code>bedrooms</code>, <code>condition</code>", "Narrows the range — all optional"]
];

const STATES = [
    ["<code>COMPLETED</code>", "The normal instant result", "Read <code>prices</code> and <code>confidence</code>. Values are in pence."],
    ["<code>INELIGIBLE_FOR_INSTANT</code>", "Not enough recent evidence nearby to price the address", "A normal outcome, not an error. Common on unusual or rural property. Offer the full valuation instead."],
    ["<code>NO_HPI_DATA_FOR_DATE_RANGE</code>", "No market index for that property at that date of death", "Same handling. We would rather return nothing than a present-day price wearing a date-of-death label."],
    ["<code>booked</code>", "The normal full-valuation result", "Read <code>title_check</code> and write it into the matter. The valuation is now with our team."],
    ["<code>multiple_titles</code>", "The address matched more than one HMLR title", "<strong>Nothing was created.</strong> Show the candidates and re-send with <code>title_number</code> set. Flat conversions and split houses hit this."],
    ["<code>429</code> / <code>503</code>", "Rate limited, or HM Land Registry is throttling us", "Back off and retry. Reuse the same <code>Idempotency-Key</code> so a retry cannot double-book a valuer."]
];

export function guidePage() {
    const matter = MATTERS.adeyemi;

    return `<div class="guide">
        <section class="guide-hero">
            <div>
                <p class="guide-eyebrow">LEAP × Sail</p>
                <h1>Step 4 of your own curriculum is where estate administration stops.</h1>
                <p class="guide-hero-copy">LEAP University teaches Estate Administration in eight steps: About the Deceased, Beneficiary, Financial Institutions, <strong>Adding Assets</strong>, Debts, Nil Rate Band, Calculations, Submission Forms. The practitioner gets to Assets → Properties, types the address, and then has nowhere to get a value from. So the file waits while somebody instructs a surveyor — and Calculations, the nil rate band and the IHT400 all wait with it.</p>
                <p class="guide-hero-copy">Every field our API needs was collected at steps 1 and 2. <strong>This is a button, not a data-entry ask.</strong></p>
                <div class="guide-proof">
                    <span>One button on the Properties card</span><span>Nothing to type</span><span>Free to the estate</span><span>Instant figure, then upgrade</span>
                </div>
            </div>
        </section>

        <section class="guide-section">
            <p class="guide-eyebrow">The two-tier product</p>
            <h2>An instant figure for triage. A real valuation to file.</h2>
            <p class="guide-lede">These are two different jobs and it is worth being blunt about which is which, because getting it wrong is how a firm ends up defending an automated estimate to the District Valuer.</p>
            <div class="insertions">
                <article class="insertion">
                    <span class="insertion-step">POST /valuations/instant</span>
                    <h3>The instant valuation</h3>
                    <p>Automated, synchronous, back in about a second, and free of any Land Registry cost. It blends recent comparable sales, a provider estimate and an HPI-uplifted last transaction into a price with a confidence band.</p>
                    <p class="insertion-note">Right for: <strong>is this estate excepted?</strong>, early advice to the executor, and pricing your own work. Not right for: the figure that goes on an IHT400 for a taxable estate.</p>
                </article>
                <article class="insertion insertion--key">
                    <span class="insertion-step">POST /valuations/full</span>
                    <h3>The upgrade</h3>
                    <p>A valuer visits the property and writes it up on the s.160 basis. It also reads the registered title and returns it <em>synchronously</em> — proprietors, tenure, charges, restrictions, 42 detector flags and plain-English findings.</p>
                    <p class="insertion-note">Right for: any taxable estate, and any estate where the ownership or the charges are unknown. <strong>Also free to the estate.</strong></p>
                </article>
            </div>
            <p class="guide-lede">Drive the Adeyemi matter to see why the upgrade is not an upsell. Its instant valuation comes back <code>MEDIUM</code>, and on a taxable estate that band is worth <strong>five figures of inheritance tax</strong>. The Calculations page prices the two ends of the range and shows you the gap.</p>
        </section>

        <section class="guide-section">
            <p class="guide-eyebrow">Where the button goes</p>
            <h2>Assets → Properties, as a sidebar card</h2>
            <p class="guide-lede">Not a hero button and not a modal. Actions in LEAP hang off cards in the right-hand rail — send letter, send email — so a valuation action belongs there too, at the density everything else on the screen is drawn at.</p>
            <div class="architecture" role="img" aria-label="The practitioner's LEAP client calls the LEAP server, which calls the Sail API, which passes the booking to the Sail valuations team">
                <div class="node"><span>1</span><strong>Practitioner</strong><small>Assets → Properties</small></div>
                <div class="arrow">${icon("arrowRight", 18)}</div>
                <div class="node"><span>2</span><strong>LEAP server</strong><small>Holds the API token</small></div>
                <div class="arrow">${icon("arrowRight", 18)}</div>
                <div class="node node--sail"><span>3</span><strong>Sail API</strong><small>Price now, register now, valuer booked</small></div>
                <div class="arrow">${icon("arrowRight", 18)}</div>
                <div class="node node--human"><span>4</span><strong>Sail valuers</strong><small>Visit and write the report</small></div>
            </div>
            <p class="security-note">${icon("lock", 18)} <span>Call Sail server-side, from the same place your other marketplace integrations sit. <strong>The bearer token must never reach the desktop client.</strong> Keys are scoped per organisation, so a firm sees only its own matters.</span></p>
        </section>

        <section class="guide-section">
            <p class="guide-eyebrow">What comes back into the matter</p>
            <h2>Three things land somewhere other than the Properties card</h2>
            <p class="guide-lede">This is the part that makes it an integration rather than a price lookup. The title check answers questions that live on <em>other</em> pages of Estate Administration, and it answers them without anyone typing.</p>
            <div class="endpoints">
                ${endpoint("1", null, null, "Ownership → the Properties row, and IHT404", "A Form A restriction means the property was held as tenants in common, so only the deceased's share is an estate asset and the estate needs an <code>IHT404</code>. No Form A means joint tenants, and the share passes by survivorship. That single flag changes both the figure and the form list.")}
                ${endpoint("2", null, null, "A registered charge → the Debts page", "The charge is a liability of the estate, named and dated, on the file the moment the valuation is booked. <strong>We deliberately return no balance</strong> — the register records that a charge exists and who holds it, never what is outstanding. That comes from a redemption statement, and a number invented from the register would end up on an IHT400.")}
                ${endpoint("3", null, null, "A charge restriction → a task, early", "No disposition can be registered without the lender's written consent. Knowing that in week one rather than at exchange is worth a fortnight.")}
            </div>
            <div class="callout callout--warn">
                <strong>The one place to be careful.</strong>
                <p>A Form A restriction records <em>that</em> the property was held in common. It does not record the <em>shares</em>. An equal split is the sensible starting assumption and the prototype labels it as one on screen — a declaration of trust or the transfer deed is what settles it. Anything that writes a share straight onto an IHT404 without that flag is a bug waiting to be a complaint.</p>
            </div>
        </section>

        <section class="guide-section">
            <p class="guide-eyebrow">The derivation that matters</p>
            <h2>How to read joint tenants versus tenants in common</h2>
            <p class="guide-lede">We do not return co-ownership as a field, because it is not one thing on the register: it is the number of proprietors read together with whether a Form A restriction is present.</p>
            <pre class="code-block"><code>${escapeHtml(`const count = title_check.proprietors.length;
const formA = title_check.flags.has_form_a_restriction;   // "yes" | "no" | "unknown"

if (count === 1)        return "Sole owner";
if (formA === "yes")    return "Tenants in common";       // share passes under the will
if (formA === "no")     return "Joint tenants";           // share passes by survivorship
return "Not determinable from the register";`)}</code></pre>
            <p class="guide-lede">An absent Form A is strong evidence of a joint tenancy, not proof — a severance that was never protected by a restriction leaves no trace on the register. Show the basis alongside the answer, which is what <code>title_check.findings</code> is for.</p>
        </section>

        <section class="guide-section">
            <p class="guide-eyebrow">Field mapping</p>
            <h2>Everything the request needs, you collected at step 1</h2>
            <p class="guide-lede">This is the table worth checking against your Estates schema. If it holds all of this — and the LEAP University curriculum says it does — the practitioner types nothing at all.</p>
            <div class="table-wrap">
                <table class="guide-table">
                    <thead><tr><th scope="col">In LEAP</th><th scope="col">Sail field</th><th scope="col">What it does</th></tr></thead>
                    <tbody>${MAPPING.map(([a, b, c]) => `<tr><td>${a}</td><td>${b}</td><td>${c}</td></tr>`).join("")}</tbody>
                </table>
            </div>
        </section>

        <section class="guide-section">
            <p class="guide-eyebrow">Start here</p>
            <h2>The smallest thing that works</h2>
            <p class="guide-lede">One <code>POST</code>, three fields, no property registration and no second call. It returns the date-of-death figure, the range and the confidence band. Everything after this section is opt-in.</p>
            <div class="code-grid">
                ${payload("Minimum viable request", "POST /valuations/instant", minimalInstantValuationBody(matter), true)}
            </div>
            <div class="callout callout--warn">
                <strong>What you give up by keeping it this small.</strong>
                <p>No <code>property_id</code>, so each request re-resolves the address rather than reusing a stable id. Register the property once if you want to attach a full valuation to it later.</p>
                <p>No <code>client_reference</code>, so nothing ties the result back to the matter automatically.</p>
                <p>No property facts, so the estimate runs on looked-up data alone and is more likely to come back <code>MEDIUM</code> — which, on a taxable estate, is the expensive kind of vague.</p>
            </div>
        </section>

        <section class="guide-section">
            <p class="guide-eyebrow">The calls</p>
            <h2>Two on the first button, one on the second</h2>
            <div class="endpoints">
                ${endpoint("1", "POST", "/properties", "Register the property", "Cheap and idempotent: it records the address and nothing else — no title check, no Land Registry order. Registering the same address twice returns the same property. Store the <code>property_id</code> on the matter.")}
                ${endpoint("2", "POST", "/valuations/instant", "Get the figure", "Automated and synchronous. Pass <code>valuation_date</code> as the date of death and the figure is reverse-HPI-adjusted back to it — the value the IHT400 asks for, not today's price.")}
                ${endpoint("3", "POST", "/valuations/instant", "Narrow it, optionally", "Send the same <code>property_id</code> with bedrooms and condition once the practitioner learns them from the executor. Watch <code>confidence.band</code> and <code>subject.*.source</code> move.")}
                ${endpoint("4", "POST", "/valuations/full", "The upgrade", "Books a valuer and returns <code>title_check</code> in the same response. No figure — that one is written by a person who has been to the property.")}
            </div>
        </section>

        <section class="guide-section">
            <p class="guide-eyebrow">Request examples</p>
            <h2>The exact payloads behind the matter you just drove</h2>
            <p class="guide-lede">Base URL while you build: <code>${BASE_URL}</code>. Production uses identical paths.</p>
            <div class="code-grid">
                ${payload("1. Register the property", "POST /properties", registerPropertyBody(matter), false)}
                ${payload("2. The instant figure", "POST /valuations/instant", instantValuationBody(matter, null), true)}
                ${payload("3. Narrow it", "POST /valuations/instant", instantValuationBody(matter, matter.refinement), false)}
                ${payload("4. The upgrade", "POST /valuations/full", fullValuationBody(matter), false)}
            </div>
            <div class="auth-example">
                <span>On every request</span>
                <code>Authorization: Bearer &lt;the firm's API token&gt;</code>
                <small>A server-side secret. Send an <code>Idempotency-Key</code> header too, so a retry cannot double-book a valuer or double-charge a Land Registry read.</small>
            </div>
        </section>

        <section class="guide-section">
            <p class="guide-eyebrow">Production readiness</p>
            <h2>The responses to handle</h2>
            <p class="guide-lede">Four of these six are ordinary outcomes rather than failures. Handling them is most of the work.</p>
            <div class="table-wrap">
                <table class="guide-table">
                    <thead><tr><th scope="col">Response</th><th scope="col">What it means</th><th scope="col">What to do</th></tr></thead>
                    <tbody>${STATES.map(([a, b, c]) => `<tr><td>${a}</td><td>${b}</td><td>${c}</td></tr>`).join("")}</tbody>
                </table>
            </div>
            <div class="callout callout--warn">
                <strong>The one gap to be straight about.</strong>
                <p>The instant valuation is synchronous, so it can sit behind a button. The <em>full</em> valuation is a human booking with <strong>no webhook</strong>: today you poll <code>GET /valuations/{valuation_id}</code>, or the report arrives by email. If a callback into the matter matters to you, say so and we will scope it rather than pretend it exists.</p>
            </div>
        </section>

        <section class="guide-section">
            <p class="guide-eyebrow">How this actually gets built</p>
            <h2>The marketplace, not a bespoke build</h2>
            <p class="guide-lede">LEAP runs an App Marketplace and a developer console, and the precedent is already in Estates: <strong>WillSuite</strong> is a third-party product living inside LEAP Estates, drafting documents against matter data. We want to be the WillSuite of property valuation in the estate administration workflow — the same shape, one card further down the tree.</p>
            <div class="endpoints">
                ${endpoint("1", null, null, "Phase one — value the property", "The Properties card, the two buttons, and the title check writing into Debts and the form list. That is the whole first release.")}
                ${endpoint("2", null, null, "Phase two — Sale of Estate", "<strong>Sale of Estate is already one of your Estates matter types.</strong> The same <code>property_id</code> carries into <code>POST /quotes</code> and <code>POST /instruct</code>, so the sale opens as a matter without anyone re-keying the address. A small addition, not a second integration.")}
            </div>
            <div class="code-grid">
                ${payload("Phase two: the conveyancing quote", "POST /quotes", quoteBody(matter, 59800000), false)}
            </div>
            <div class="launch-actions">
                <a class="secondary-cta" href="${LEAP_DEV_URL}" target="_blank" rel="noreferrer">developer.leap.build ${icon("arrowUpRight", 14)}</a>
            </div>
        </section>

        <section class="guide-section">
            <p class="guide-eyebrow">The objection, answered</p>
            <h2>What the report says, and why that is the whole point</h2>
            <p class="guide-lede">A free valuation is easy to promote on an excepted estate and hard to promote on a taxable one, and the reason is not the figure. It is what the document says about itself.</p>
            <p class="guide-lede">HMRC's guidance to its own caseworkers is explicit. <strong>IHTM36275</strong> tells them personal representatives should obtain a professional opinion of value and ensure the valuer provides <em>"an open market valuation in accordance with s.160"</em>. <strong>IHTM21011</strong> puts the practice plainly: a professional valuation <em>"which states that it has been prepared on the basis of the open market value and/or in the terms of S160"</em> will usually be accepted.</p>
            <p class="guide-lede">So the load-bearing part is a sentence. Every Sail probate report now carries it:</p>
            <blockquote class="guide-quote">
                <p>This valuation is prepared on the basis of market value as defined by <strong>section 160 of the Inheritance Tax Act 1984</strong> — the price the property might reasonably be expected to fetch if sold in the open market at that date. No reduction has been made on the grounds that the whole of the property is to be placed on the market at one and the same time.</p>
            </blockquote>
            <p class="guide-lede">Underneath it the report names who prepared it, the valuation date (the date of death, not the date we valued), the basis, the extent of the inspection and every comparable sale the figure is built on.</p>
            <div class="callout callout--warn">
                <p><strong>And the line that matters most to the firm is about reliance.</strong> The standard wording on a free valuation restricts it to the named client and excludes third parties — which means the personal representatives, their solicitor and HMRC are all excluded, and a firm that relied on it has nobody to turn to. Ours names them:</p>
                <p>"It may also be relied upon by their legal advisers, and by HM Revenue &amp; Customs and the Valuation Office Agency, for the purpose of the inheritance tax account."</p>
                <p>We cannot take the personal representatives' statutory liability away — nobody can; they sign the account. What we can do is owe you a duty of care, defend the figure to the Valuation Office at our cost, and give you a document that evidences the reasonable step.</p>
            </div>
        </section>

        <section class="guide-section">
            <p class="guide-eyebrow">The relief nobody is placed to spot</p>
            <h2>Loss on sale of land, s.191</h2>
            <p class="guide-lede">If the property sells for less than the probate value, the estate has paid tax on money it never received. <strong>Section 191</strong> lets the personal representatives substitute the actual sale price, on <strong>form IHT38</strong>, for a sale within three years of death — extended to the fourth year by <strong>s.197A</strong>.</p>
            <p class="guide-lede">There is a floor: no relief unless the shortfall is at least the lower of £1,000 and 5% of the death value. You cannot cherry-pick either — IHT38 asks for every piece of land sold in the window, including anything that sold above probate value, and they are netted. And <strong>s.191(3) denies the claim on a sale to a beneficiary, spouse, child or descendant</strong>, so an open-market sale is the qualifying route.</p>
            <p class="guide-lede">The claim needs both halves: the date-of-death value <em>and</em> the completion price. In the ordinary chain nobody holds both. The valuer values and leaves. The agent sells and never saw the probate figure. The firm has to notice, chase the price and connect them, often two years later.</p>
            <p class="guide-lede"><strong>Sail holds both, on one property, in one system</strong> — so an eligible claim can be flagged rather than missed. It also reframes the risk: pitching a valuation high is recoverable for four years, and pitching it low is where penalties live.</p>
        </section>

        <section class="guide-section">
            <p class="guide-eyebrow">Property services</p>
            <h2>Ancillary services, and the endpoints behind them</h2>
            <p class="guide-lede">Everything on the <strong>Property services</strong> page is work Sail already does. <code>ListingServiceType</code> in our own codebase carries clearance, drain-down, lock change, key safe, EPC, electrical test, heating service, garden tidy, cleaning, property inspection and inventory, and behind each of them sits a supplier panel, quoting, instruction, a purchase invoice and reconciliation.</p>
            <p class="guide-lede"><strong>Two calls draw the whole panel.</strong> One returns everything on the property whatever state it is in; one orders a job and returns the supplier’s price on the same request, because the panel holds standing rates.</p>
            <div class="endpoints">
                ${endpoint("1", "POST", "/properties/{id}/services", "Order a service, and get a price back on the same call", "The supplier panel holds standing rates, so a quote comes back synchronously rather than a day later. The response carries <code>supplier_name</code>, the net and VAT figures, an estimated turnaround, and a <code>billing</code> object.")}
                ${endpoint("2", "POST", "/properties/{id}/services/{service_id}/instruct", "Accept the quote", "The point of no return, and deliberately a second press. Returns <code>instructed_on</code> and the supplier.")}
                ${endpoint("3", "GET", "/properties/{id}/services", "The one view", "Everything on the property, whatever state it is in. This is the call the page is built on.")}
            </div>
            <div class="callout">
                <p><strong>The <code>billing</code> object is the field that makes this orderable at all.</strong> It takes <code>on_job_completion</code> or <code>on_sale_completion</code>.</p>
                <p>On the second, Sail pays the suppliers up front and invoices on completion, so an empty house can be secured and cleared <em>before</em> the grant releases any money and nothing leaves client account. It asks one thing in return: that the practitioner instructs Sail to market the property. If the estate sells elsewhere, the jobs are invoiced at that point instead.</p>
                <p>That choice is the difference between a supplier directory and something a fee earner can use on a file with no cash in it.</p>
            </div>
        </section>

        <section class="guide-section">
            <p class="guide-eyebrow">What we could not see</p>
            <h2>The gap in this mockup, named</h2>
            <p class="guide-lede">The LEAP University walkthrough videos for "Adding Assets" sit behind a login, so the Properties panel here is reconstructed from your published screenshots and the curriculum rather than traced frame by frame. The chrome, the tree, the tab strip and the matter numbering are drawn from LEAP's own screens; the arrangement of the Properties table is our best reading of it.</p>
            <p class="guide-lede"><strong>A demo login or a screen-share would close that gap in twenty minutes</strong>, and we would rather ship a card that looks like it was always there than one that is nearly right.</p>
        </section>

        <section class="guide-section">
            <p class="guide-eyebrow">The deliverable</p>
            <h2>What the estate actually receives</h2>
            <p class="guide-lede">A written valuation, sent to the executor and to the firm. It sets out the property, every comparable sale it is built on, the date-of-death value and the basis it was prepared on, so the estate has a clear record if HMRC asks how the figure was reached.</p>
        </section>

        <section class="guide-section guide-launch">
            <div>
                <p class="guide-eyebrow">Getting started</p>
                <h2>A small build with a short path to live</h2>
                <p class="guide-lede">We issue staging credentials, test the first requests alongside your team, and agree the contact details valuations are booked against. ${sailMark(13)} We already run authenticated, per-partner integrations into 31 live law firms, so the plumbing is not new work for us.</p>
            </div>
            <ol class="checklist">
                <li><span>1</span>Get a staging token from Sail</li>
                <li><span>2</span>Build the two calls behind the Properties card</li>
                <li><span>3</span>Handle ineligible, multiple-titles and retry</li>
                <li><span>4</span>Write the title check into Debts and the form list</li>
            </ol>
            <div class="launch-actions">
                <a class="cta--inline" href="${SAIL_DOCS_URL}" target="_blank" rel="noreferrer">Read the full API docs ${icon("arrowUpRight", 14)}</a>
                <button type="button" class="secondary-cta" data-screen="matter">Back to the matter</button>
            </div>
        </section>
    </div>`;
}
