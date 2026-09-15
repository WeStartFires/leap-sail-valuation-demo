// Renders the reference from endpoints.js. No framework, no build step — the same rule the rest of
// prototypes/ follows, so this opens from a plain static server like everything else.

import { BASE_URL, AUTH, GROUPS, STATES } from "./endpoints.js?v=20260907e";

const root = document.getElementById("docs");

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

// Keys and string values coloured separately, so a payload reads at a glance rather than as a wall
// of monospace. Deliberately regex rather than a tokeniser: the input is always our own JSON.
function highlight(value) {
    return escapeHtml(JSON.stringify(value, null, 2))
        .replace(/^(\s*)&quot;([^&]+)&quot;:/gm, '$1<span class="k">"$2"</span>:')
        .replace(/: &quot;([^&]*)&quot;/g, ': <span class="s">"$1"</span>')
        .replace(/: (\d+)/g, ': <span class="n">$1</span>')
        .replace(/: (true|false|null)/g, ': <span class="b">$1</span>');
}

function endpointCard(endpoint) {
    return `<article class="ep" id="${endpoint.id}">
        <div class="ep-route">
            <span class="verb verb--${endpoint.method.toLowerCase()}">${endpoint.method}</span>
            <code>${escapeHtml(endpoint.path)}</code>
        </div>
        <h3>${escapeHtml(endpoint.title)}</h3>
        <p class="ep-body">${endpoint.body}</p>
        <div class="ep-panes">
            ${
                endpoint.request
                    ? `<div class="pane">
                            <span class="pane-label">Request</span>
                            <pre><code>${highlight(endpoint.request)}</code></pre>
                        </div>`
                    : ""
            }
            <div class="pane">
                <span class="pane-label">Response <em>${endpoint.status}</em></span>
                <pre><code>${highlight(endpoint.response)}</code></pre>
            </div>
        </div>
        ${
            endpoint.highlight === "billing"
                ? `<p class="ep-note"><strong>The <code>billing</code> object is the one worth reading twice.</strong> <code>on_job_completion</code> invoices the estate as each supplier finishes. <code>on_sale_completion</code> means Sail pays the suppliers now and invoices on completion, so <code>payable_before_grant_pence</code> is <code>0</code> and nothing leaves client account before the grant — and it asks that the practitioner instructs Sail to market the property. Where the estate sells elsewhere, the jobs are invoiced at that point instead.</p>`
                : ""
        }
    </article>`;
}

function render() {
    root.innerHTML = `
        <aside class="nav">
            <a class="brand" href="../leap-index.html">
                <span class="brand-mark"></span>
                <span><strong>Sail</strong> Property API</span>
            </a>
            <span class="nav-version">v1</span>
            <nav>
                <a href="#auth">Authentication</a>
                ${GROUPS.map(
                    (group) => `<span class="nav-group">${escapeHtml(group.name)}</span>
                        ${group.endpoints
                            .map(
                                (endpoint) => `<a href="#${endpoint.id}">
                                    <span class="verb verb--${endpoint.method.toLowerCase()} verb--sm">${endpoint.method}</span>
                                    ${escapeHtml(endpoint.path.replace(/\{property_id\}/g, "…").replace(/\{[a-z_]+\}/g, "…").replace("/properties/…/", "/…/"))}
                                </a>`
                            )
                            .join("")}`
                ).join("")}
                <a href="#states">Responses to handle</a>
            </nav>
        </aside>

        <main class="body">
            <header class="head">
                <h1>Property API</h1>
                <p class="lede">Register a property, value it at the date of death, read its registered title, and look after it while the estate is being administered. Eight endpoints.</p>
                <div class="base"><span>Base URL</span><code>${escapeHtml(BASE_URL)}</code></div>
            </header>

            <section class="group" id="auth">
                <h2>Authentication</h2>
                <p class="group-blurb">${escapeHtml(AUTH.note)}</p>
                <pre class="bare"><code>${escapeHtml(AUTH.header)}</code></pre>
            </section>

            ${GROUPS.map(
                (group) => `<section class="group">
                    <h2>${escapeHtml(group.name)}</h2>
                    <p class="group-blurb">${escapeHtml(group.blurb)}</p>
                    ${group.endpoints.map(endpointCard).join("")}
                </section>`
            ).join("")}

            <section class="group" id="states">
                <h2>Responses to handle</h2>
                <p class="group-blurb">Three of these four are ordinary outcomes rather than failures, and handling them is most of the integration work.</p>
                <div class="states">
                    ${STATES.map(([state, body]) => `<div class="state"><span>${state}</span><p>${body}</p></div>`).join("")}
                </div>
            </section>

            <footer class="foot">
                <p>Money is in pence throughout. Dates are <code>YYYY-MM-DD</code>. Send <code>Idempotency-Key</code> on any request you might retry.</p>
                <p><a href="../leap-index.html">Back to the LEAP concept</a></p>
            </footer>
        </main>`;
}

render();
