import { boardColumns, getCardsForColumn, getCoverageSummary, screenCards, sourceSnapshot } from "./board-data.mjs";

const app = document.querySelector("#app");
const state = {
  activeColumn: "all",
  selectedCardId: "home",
};

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function selectedCard() {
  return screenCards.find((card) => card.id === state.selectedCardId) ?? screenCards[0];
}

function visibleColumns() {
  if (state.activeColumn === "all") return boardColumns;
  return boardColumns.filter((column) => column.id === state.activeColumn);
}

function render() {
  const summary = getCoverageSummary();
  const activeCard = selectedCard();

  app.innerHTML = `
    <main class="page-shell">
      <section class="hero">
        <div class="hero-copy">
          <p class="eyebrow">Figma wireframe card board</p>
          <h1>SilverCare Partner Console, organized as a design deck</h1>
          <p class="subtitle">The current running homepage is broken down into card-game style wireframes. Each card captures a screen, its route, core blocks, and privacy guardrails.</p>
          <div class="stat-row">
            ${renderStat("Columns", summary.columns)}
            ${renderStat("Cards", summary.cards)}
            ${renderStat("Guardrails", summary.guardrails)}
          </div>
        </div>
        <figure class="source-shot">
          <img src="${escapeHtml(sourceSnapshot)}" alt="Captured SilverCare Partner Console homepage" />
          <figcaption>Source capture from http://localhost:4173/#/console</figcaption>
        </figure>
      </section>

      <section class="toolbar" aria-label="Board filters">
        <button class="filter ${state.activeColumn === "all" ? "active" : ""}" data-column="all">All cards</button>
        ${boardColumns.map((column) => `<button class="filter ${state.activeColumn === column.id ? "active" : ""}" data-column="${escapeHtml(column.id)}">${escapeHtml(column.title)}</button>`).join("")}
      </section>

      <section class="board">
        ${visibleColumns().map(renderColumn).join("")}
      </section>

      <section class="detail-panel">
        <div>
          <p class="eyebrow">Selected card</p>
          <h2>${escapeHtml(activeCard.title)}</h2>
          <p>${escapeHtml(activeCard.purpose)}</p>
        </div>
        <div class="detail-grid">
          ${renderDetailBlock("Route", [activeCard.route])}
          ${renderDetailBlock("Primary user", [activeCard.primaryUser])}
          ${renderDetailBlock("Core blocks", activeCard.components)}
          ${renderDetailBlock("Guardrails", activeCard.guardrails)}
        </div>
      </section>
    </main>
  `;
}

function renderStat(label, value) {
  return `
    <div class="stat-card">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </div>
  `;
}

function renderColumn(column) {
  const cards = getCardsForColumn(column.id);
  return `
    <article class="column">
      <header class="column-header">
        <div>
          <h2>${escapeHtml(column.title)}</h2>
          <p>${escapeHtml(column.subtitle)}</p>
        </div>
        <span class="count">${cards.length}</span>
      </header>
      <div class="card-stack">
        ${cards.map(renderCard).join("")}
      </div>
    </article>
  `;
}

function renderCard(card) {
  const selected = card.id === state.selectedCardId;
  return `
    <button class="wire-card ${selected ? "selected" : ""}" data-card="${escapeHtml(card.id)}">
      <div class="card-topline">
        <span>${escapeHtml(card.route)}</span>
        <strong>${escapeHtml(card.primaryUser)}</strong>
      </div>
      ${renderWireframe(card)}
      <div class="card-body">
        <h3>${escapeHtml(card.title)}</h3>
        <p>${escapeHtml(card.purpose)}</p>
        <div class="chip-row">
          ${card.guardrails.slice(0, 3).map((guardrail) => `<span>${escapeHtml(guardrail)}</span>`).join("")}
        </div>
      </div>
    </button>
  `;
}

function renderWireframe(card) {
  const body = {
    dashboard: `
      <div class="wf-grid two"><i></i><i></i></div>
      <div class="wf-grid three"><i></i><i></i><i></i><i></i><i></i><i></i></div>
    `,
    table: `
      <div class="wf-toolbar"><i></i><b></b></div>
      <div class="wf-table"><i></i><i></i><i></i><i></i></div>
    `,
    docs: `
      <div class="wf-doc"><i></i><i></i><i></i></div>
      <div class="wf-code"></div>
    `,
    split: `
      <div class="wf-split"><i></i><b></b></div>
      <div class="wf-code"></div>
    `,
    metrics: `
      <div class="wf-grid three"><i></i><i></i><i></i><i></i><i></i><i></i></div>
      <div class="wf-toolbar"><i></i><i></i></div>
    `,
    ops: `
      <div class="wf-toolbar"><i></i><i></i><i></i></div>
      <div class="wf-table"><i></i><i></i><i></i></div>
    `,
    queue: `
      <div class="wf-grid two"><i></i><i></i><i></i><i></i></div>
    `,
    consent: `
      <div class="wf-table"><i></i><i></i><i></i></div>
      <div class="wf-toolbar"><b></b><i></i></div>
    `,
    inventory: `
      <div class="wf-table"><i></i><i></i><i></i><i></i></div>
    `,
  }[card.imageType];

  return `
    <div class="wire-image" aria-hidden="true">
      <div class="wire-sidebar"></div>
      <div class="wire-main">
        <div class="wire-header"><i></i><i></i><i></i></div>
        ${body}
      </div>
    </div>
  `;
}

function renderDetailBlock(label, items) {
  return `
    <div class="detail-block">
      <h3>${escapeHtml(label)}</h3>
      <ul>
        ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    </div>
  `;
}

document.addEventListener("click", (event) => {
  const card = event.target.closest("[data-card]");
  if (card) {
    state.selectedCardId = card.dataset.card;
    render();
    return;
  }

  const filter = event.target.closest("[data-column]");
  if (filter) {
    state.activeColumn = filter.dataset.column;
    render();
  }
});

render();
