
const grid = document.getElementById("voucherGrid");
const search = document.getElementById("searchInput");
const empty = document.getElementById("emptyState");

let currentFilter = "all";

function expired(v) {
  return Date.now() >
    new Date(v.expiry + "T23:59:59+07:00").getTime();
}

function render() {
  const query = search.value.toLowerCase();

  const list = VOUCHERS.filter(v => {
    const matches =
      [v.title, v.description, v.id]
      .join(" ").toLowerCase().includes(query);

    const filter =
      currentFilter === "all" ||
      (currentFilter === "active" && !v.locked) ||
      (currentFilter === "locked" && v.locked);

    return matches && filter;
  });

  document.getElementById("activeCount").textContent =
    VOUCHERS.filter(v => !expired(v)).length;

  grid.innerHTML = list.map(v => `
    <article class="voucher-card">
      <div class="card-top">
        <span>${v.locked ? "PRIVATE" : "PUBLIC"}</span>
        <span>${expired(v) ? "EXPIRED" : "AVAILABLE"}</span>
      </div>

      <div class="discount">${v.discount}</div>

      <h3>${v.title}</h3>
      <p>${v.description}</p>

      ${v.maxDiscount
        ? `<div class="max-discount">${v.maxDiscount}</div>`
        : ""}

      <div class="code-box">
        <strong>#${v.id}</strong>
        <span>${v.locked ? "🔒 LOCKED" : "PUBLIC CODE"}</span>
      </div>

      <a class="hero-cta"
         href="/code/${encodeURIComponent(v.id)}">
        ${v.locked ? "Unlock Voucher" : "View Voucher"} ↗
      </a>
    </article>
  `).join("");

  empty.classList.toggle("hidden", list.length !== 0);
}

search.addEventListener("input", render);

document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;

    document.querySelectorAll(".filter")
      .forEach(b => b.classList.toggle("active", b === button));

    render();
  });
});

render();
