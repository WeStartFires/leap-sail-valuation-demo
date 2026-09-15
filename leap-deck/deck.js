// The runner. Index state, keyboard, and the stage — and nothing else, because every word lives in
// slides.js and every number in figures.js.
//
// Hash route per slide so any slide is directly linkable and the back button works. Deep-linking to
// slide eleven must never mean stepping through ten, which is the failure that makes a presenter
// distrust their own deck two minutes before walking in.

import { SLIDES } from "./slides.js?v=20260915m";

const root = document.getElementById("deck");

let index = 0;

function clamp(value) {
    return Math.max(0, Math.min(SLIDES.length - 1, value));
}

function applyHash() {
    const raw = (window.location.hash || "").replace(/^#/, "");
    const asNumber = parseInt(raw, 10);
    if (Number.isFinite(asNumber)) {
        index = clamp(asNumber - 1);
        return;
    }
    const found = SLIDES.findIndex((slide) => slide.key === raw);
    index = found >= 0 ? found : 0;
}

function go(next) {
    const target = clamp(next);
    if (target === index) return;
    window.location.hash = String(target + 1);
}

function render() {
    const slide = SLIDES[index];
    const progress = ((index + 1) / SLIDES.length) * 100;

    root.className = `deck deck--${slide.background || "default"}`;
    root.innerHTML = `
        <div class="deck-bg" aria-hidden="true"></div>
        <div class="deck-progress" aria-hidden="true"><span style="width:${progress}%"></span></div>

        <div class="stage stage--${slide.layout}" data-slide="${slide.key}">
            ${slide.ghost ? `<span class="ghost" aria-hidden="true">${slide.ghost}</span>` : ""}
            ${slide.badge ? `<span class="badge">${slide.badge}</span>` : ""}
            ${
                slide.shot
                    ? `<div class="stage-copy">${slide.render()}</div>
                       <div class="stage-shot stage-shot--${slide.bleed} stage-shot--fit-${slide.shotFit}"><img src="${slide.shot}" alt="${slide.shotAlt}" /></div>`
                    : slide.custom
                      ? `<div class="stage-copy">${slide.render()}</div>${slide.custom()}`
                      : `<div class="stage-copy">${slide.render()}</div>`
            }
        </div>

        <nav class="deck-controls" aria-label="Slides">
            <button type="button" class="deck-btn" data-step="-1" aria-label="Previous slide">←</button>
            <span class="deck-count">${String(index + 1).padStart(2, "0")} / ${SLIDES.length}</span>
            <button type="button" class="deck-btn" data-step="1" aria-label="Next slide">→</button>
        </nav>`;
}

document.addEventListener("keydown", (event) => {
    const advance = ["ArrowRight", "ArrowDown", " ", "Spacebar", "PageDown"];
    const back = ["ArrowLeft", "ArrowUp", "PageUp"];

    if (advance.includes(event.key)) {
        event.preventDefault();
        go(index + 1);
    } else if (back.includes(event.key)) {
        event.preventDefault();
        go(index - 1);
    } else if (event.key === "Home") {
        event.preventDefault();
        go(0);
    } else if (event.key === "End") {
        event.preventDefault();
        go(SLIDES.length - 1);
    } else if (event.key === "f" || event.key === "F") {
        if (document.fullscreenElement) document.exitFullscreen();
        else document.documentElement.requestFullscreen();
    }
});

// An iframe swallows focus, so once someone drives the live concept the deck stops answering the
// arrow keys. Clicking anywhere on the stage outside the frame hands focus back.
window.addEventListener("blur", () => {
    window.setTimeout(() => {
        if (document.activeElement?.tagName === "IFRAME") document.body.classList.add("frame-has-focus");
    }, 0);
});

document.addEventListener("click", (event) => {
    if (!event.target.closest(".live-shell")) {
        document.body.classList.remove("frame-has-focus");
        window.focus();
    }

    // The stage advances on any click, so a link inside a slide would open the demo and skip a
    // slide at the same time. Let the anchor do its job and stop there.
    if (event.target.closest("a")) {
        event.stopPropagation();
        return;
    }

    const button = event.target.closest("[data-step]");
    if (button) {
        event.stopPropagation();
        go(index + Number(button.dataset.step));
        return;
    }
    go(index + 1);
});

window.addEventListener("hashchange", () => {
    applyHash();
    render();
});

applyHash();
render();
