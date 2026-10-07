const grid = document.getElementById("productGrid");

function render(filter = "all") {
  const items = PRODUCTS.filter(
    p => filter === "all" || p.category === filter
  );

  if (!items.length) {
    grid.innerHTML = `
      <div style="padding:40px 0;">
        <p>No products available in this category.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = items.map(p => `
    <article class="product-card">
      <a href="product.html?id=${p.id}" class="product-image">
        <img src="${p.image}" alt="${p.name}">
        <span>${p.label}</span>
      </a>

      <div class="product-info">
        <small>WHOLESALE</small>
        <h3>${p.name}</h3>
        <p>${p.desc}</p>

        <div class="product-bottom">
          <strong>MOQ: ${p.moq}</strong>
          <a href="product.html?id=${p.id}">View →</a>
        </div>
      </div>
    </article>
  `).join("");
}

document.querySelectorAll(".filter").forEach(btn => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".filter")
      .forEach(x => x.classList.remove("active"));

    btn.classList.add("active");
    render(btn.dataset.filter);
  });
});

function renderCatalogue() {
  const category =
    new URLSearchParams(location.search).get("category") || "all";

  render(category);
}

window.addEventListener("productsLoaded", renderCatalogue);

if (PRODUCTS.length > 0) {
  renderCatalogue();
}
