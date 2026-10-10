
const grid = document.getElementById("productGrid");
const filterButtons = document.querySelectorAll(".filter");

let currentFilter = "all";
let observer = null;

// Safely display product information in HTML
function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

// Keep category matching consistent
function normalizeCategory(value) {
  return String(value ?? "").trim().toLowerCase();
}

// Premium empty state
function renderEmptyState() {
  grid.innerHTML = `
    <div class="catalogue-empty">
      <span class="catalogue-empty-icon">✦</span>
      <p class="catalogue-empty-label">TRADE HUB COLLECTION</p>
      <h3>New selections are on their way.</h3>
      <p>There are currently no published products in this category.
      Please explore another collection or contact us for wholesale enquiries.</p>
      <a href="contact.html" class="catalogue-empty-link">
        Enquire with our team <span>↗</span>
      </a>
    </div>
  `;
}

// Add animation observer to newly rendered cards
function setupCardAnimations() {
  if (observer) observer.disconnect();

  const cards = grid.querySelectorAll(".product-card");

  if (!("IntersectionObserver" in window)) {
    cards.forEach(card => card.classList.add("catalogue-visible"));
    return;
  }

  observer = new IntersectionObserver((entries, activeObserver) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("catalogue-visible");
        activeObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: "0px 0px 35px 0px"
  });

  cards.forEach((card, index) => {
    card.style.setProperty(
      "--card-delay",
      `${Math.min(index % 4, 3) * 90}ms`
    );
    observer.observe(card);
  });
}

// Render product catalogue
function render(filter = "all") {
  if (!grid) return;

  currentFilter = normalizeCategory(filter) || "all";

  const products = Array.isArray(PRODUCTS) ? PRODUCTS : [];

  const items = products.filter(product => {
    return currentFilter === "all" ||
      normalizeCategory(product.category) === currentFilter;
  });

  filterButtons.forEach(button => {
    const active = normalizeCategory(button.dataset.filter) === currentFilter;

    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  if (!items.length) {
    if (observer) observer.disconnect();
    renderEmptyState();
    return;
  }

  grid.innerHTML = items.map(product => {
    const id = escapeHTML(product.id);
    const name = escapeHTML(product.name || "Wholesale Product");
    const description = escapeHTML(product.desc || product.description || "Contact us for product details and wholesale availability.");
    const category = escapeHTML(product.category || "Collection");
    const label = escapeHTML(product.label || "WHOLESALE");
    const moq = escapeHTML(product.moq || "On request");
    const image = escapeHTML(product.image || product.image_url || "product-placeholder.svg");

    return `
      <article class="product-card catalogue-reveal">
        <a href="product.html?id=${encodeURIComponent(String(product.id ?? ""))}"
           class="product-image"
           aria-label="View ${name}">
          <img
            src="${image}"
            alt="${name}"
            loading="lazy"
            decoding="async"
          >
          <span class="catalogue-product-label">${label}</span>
          <span class="catalogue-image-arrow" aria-hidden="true">↗</span>
        </a>

        <div class="product-info">
          <div class="catalogue-product-meta">
            <small>${category}</small>
            <span>TRADE HUB</span>
          </div>

          <h3>${name}</h3>
          <p>${description}</p>

          <div class="product-bottom">
            <strong>MOQ: ${moq}</strong>
            <a href="product.html?id=${encodeURIComponent(String(product.id ?? ""))}">
              View details <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </article>
    `;
  }).join("");

  // Replace unavailable product images with the local placeholder
  grid.querySelectorAll(".product-image img").forEach(img => {
    img.addEventListener("error", () => {
      if (!img.src.endsWith("/product-placeholder.svg")) {
        img.src = "product-placeholder.svg";
      }
    }, { once: true });
  });

  setupCardAnimations();
}

// Category filter interactions
filterButtons.forEach(button => {
  button.type = "button";

  button.addEventListener("click", () => {
    const selectedCategory = normalizeCategory(button.dataset.filter) || "all";

    if (selectedCategory === currentFilter) return;

    render(selectedCategory);
  });
});

// Read an optional category from the URL
function renderCatalogue() {
  const params = new URLSearchParams(window.location.search);
  const requestedCategory = params.get("category") || "all";

  const availableCategories = Array.from(filterButtons)
    .map(button => normalizeCategory(button.dataset.filter));

  const category = availableCategories.includes(normalizeCategory(requestedCategory))
    ? normalizeCategory(requestedCategory)
    : "all";

  render(category);
}

// Keep compatibility with the existing products.js event
window.addEventListener("productsLoaded", renderCatalogue);

// Render immediately if products are already available
if (Array.isArray(PRODUCTS) && PRODUCTS.length > 0) {
  renderCatalogue();
} else {
  renderEmptyState();
}

// Page-specific styling; does not modify the shared style.css
(function addCatalogueStyles() {
  if (document.getElementById("catalogue-js-styles")) return;

  const style = document.createElement("style");
  style.id = "catalogue-js-styles";

  style.textContent = `
    #productGrid .product-card {
      opacity: 0;
      transform: translateY(24px);
      transition:
        opacity 650ms ease,
        transform 650ms cubic-bezier(.2,.7,.2,1),
        box-shadow 350ms ease;
      transition-delay: var(--card-delay, 0ms);
      overflow: hidden;
    }

    #productGrid .product-card.catalogue-visible {
      opacity: 1;
      transform: translateY(0);
    }

    #productGrid .product-card:hover {
      transform: translateY(-5px);
    }

    #productGrid .product-image {
      position: relative;
      display: block;
      overflow: hidden;
      background: #eeeae2;
    }

    #productGrid .product-image img {
      display: block;
      width: 100%;
      transition: transform 700ms cubic-bezier(.2,.7,.2,1);
    }

    #productGrid .product-card:hover .product-image img {
      transform: scale(1.045);
    }

    #productGrid .catalogue-product-label {
      position: absolute;
      top: 14px;
      left: 14px;
      padding: 8px 10px;
      color: #f8f4eb;
      background: rgba(19, 19, 17, .88);
      font-size: 9px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
    }

    #productGrid .catalogue-image-arrow {
      position: absolute;
      right: 14px;
      bottom: 14px;
      display: grid;
      width: 35px;
      height: 35px;
      place-items: center;
      border-radius: 50%;
      color: #171714;
      background: #d4bd8a;
      opacity: 0;
      transform: translateY(5px);
      transition: opacity 250ms ease, transform 250ms ease;
    }

    #productGrid .product-card:hover .catalogue-image-arrow {
      opacity: 1;
      transform: translateY(0);
    }

    #productGrid .catalogue-product-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 12px;
    }

    #productGrid .catalogue-product-meta small {
      color: #a58a55;
      font-size: 10px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
    }

    #productGrid .catalogue-product-meta span {
      color: #88857e;
      font-size: 9px;
      letter-spacing: 1.3px;
    }

    #productGrid .product-info h3 {
      transition: color 250ms ease;
    }

    #productGrid .product-card:hover .product-info h3 {
      color: #a58a55;
    }

    .catalogue-empty {
      grid-column: 1 / -1;
      padding: clamp(45px, 8vw, 100px) 24px;
      text-align: center;
      border: 1px solid rgba(165, 138, 85, .28);
      background: linear-gradient(135deg, #f7f4ed, #eeebe3);
    }

    .catalogue-empty-icon {
      color: #a58a55;
      font-size: 30px;
    }

    .catalogue-empty-label {
      margin: 15px 0;
      color: #a58a55;
      font-size: 10px;
      letter-spacing: 2.5px;
    }

    .catalogue-empty h3 {
      margin: 0 auto 12px;
      color: #22211e;
      font-family: Georgia, serif;
      font-size: clamp(23px, 4vw, 35px);
      font-weight: 400;
    }

    .catalogue-empty > p:not(.catalogue-empty-label) {
      max-width: 510px;
      margin: 0 auto 22px;
      color: #68645c;
      line-height: 1.8;
    }

    .catalogue-empty-link {
      display: inline-flex;
      gap: 12px;
      align-items: center;
      color: #22211e;
      text-decoration: none;
      border-bottom: 1px solid #a58a55;
      padding-bottom: 7px;
    }

    @media (prefers-reduced-motion: reduce) {
      #productGrid .product-card,
      #productGrid .product-image img,
      #productGrid .catalogue-image-arrow {
        transition: none !important;
        transform: none !important;
      }
    }
  `;

  document.head.appendChild(style);
})();
