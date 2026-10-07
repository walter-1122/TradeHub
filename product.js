function renderProductPage() {
  const id = new URLSearchParams(location.search).get("id");

  const product = PRODUCTS.find(p => String(p.id) === String(id));

  if (!product) {
    document.getElementById("productDetail").innerHTML = `
      <div style="padding:60px 0;">
        <h2>Product not found</h2>
        <p>Please return to the catalogue and select a product.</p>
        <a class="btn btn-gold" href="catalogue.html">
          Back to Catalogue
        </a>
      </div>
    `;
    return;
  }

  const relatedProducts = PRODUCTS
    .filter(p => p.id !== product.id)
    .slice(0, 4);

  document.getElementById("productDetail").innerHTML = `

    <div class="product-detail-image">
      <img src="${product.image}" alt="${product.name}">
    </div>

    <div class="product-detail-copy">

      <p class="eyebrow">
        ${product.label} • WHOLESALE
      </p>

      <h1>${product.name}</h1>

      <p>${product.desc || ""}</p>

      <div class="moq-box">
        <small>MINIMUM ORDER QUANTITY</small>
        <strong>${product.moq}</strong>
      </div>

      <p>
        Public pricing is not displayed. Contact Trade Hub for
        availability, wholesale terms and your order requirement.
      </p>

      <a class="btn btn-gold" href="contact.html">
        Request Wholesale Quote
      </a>

      <a class="back-link" href="catalogue.html">
        ← Back to Catalogue
      </a>

    </div>

    <div style="
      grid-column:1/-1;
      margin-top:60px;
      padding:35px 0;
      border-top:1px solid #ddd8ce;
      border-bottom:1px solid #ddd8ce;
    ">

      <p class="eyebrow">WHOLESALE SHIPPING</p>

      <h2 style="margin-bottom:15px;">
        Worldwide wholesale delivery
      </h2>

      <p style="max-width:750px;color:#77736b;line-height:1.8;">
        Trade Hub supplies wholesale buyers in the UAE and international
        markets. Products can be prepared for container-based and
        international wholesale shipments. Shipping arrangements,
        destination, quantity and delivery terms are confirmed according
        to each order.
      </p>

      <a class="back-link" href="shipping.html">
        View Wholesale & Shipping →
      </a>

    </div>

    <div style="
      grid-column:1/-1;
      margin-top:60px;
    ">

      <p class="eyebrow">MORE FROM TRADE HUB</p>

      <h2 style="margin-bottom:30px;">
        Other Products
      </h2>

      <div class="product-grid">

        ${
          relatedProducts.length
            ? relatedProducts.map(p => `
              <article class="product-card">

                <a href="product.html?id=${p.id}" class="product-image">
                  <img src="${p.image}" alt="${p.name}">
                  <span>${p.label}</span>
                </a>

                <div class="product-info">

                  <small>WHOLESALE</small>

                  <h3>${p.name}</h3>

                  <p>${p.desc || ""}</p>

                  <div class="product-bottom">
                    <strong>MOQ: ${p.moq}</strong>

                    <a href="product.html?id=${p.id}">
                      View →
                    </a>
                  </div>

                </div>

              </article>
            `).join("")
            : `
              <p>No other products available.</p>
            `
        }

      </div>

    </div>
  `;
}


/*
  Products are loaded from Supabase.
  Wait until products.js finishes loading.
*/
window.addEventListener("productsLoaded", renderProductPage);


/*
  Safety check in case products are already loaded
  before this script runs.
*/
if (PRODUCTS.length > 0) {
  renderProductPage();
}
