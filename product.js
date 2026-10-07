const PRODUCT_SUPABASE_URL =
  "https://cgclqejzzlrxkuksqgav.supabase.co";

const PRODUCT_SUPABASE_KEY =
  "sb_publishable_BI34HY1C7-HR9ZzDrXuabQ_QtTRwbBx";

const productDetail = document.getElementById("productDetail");

async function loadProductPage() {

  const id = new URLSearchParams(location.search).get("id");

  if (!id) {
    productDetail.innerHTML = `
      <h2>Product not found</h2>
      <a href="catalogue.html">Back to Catalogue</a>
    `;
    return;
  }

  const response = await fetch(
    `${PRODUCT_SUPABASE_URL}/rest/v1/products?select=*&id=eq.${encodeURIComponent(id)}&published=eq.true`,
    {
      headers: {
        apikey: PRODUCT_SUPABASE_KEY,
        Authorization: `Bearer ${PRODUCT_SUPABASE_KEY}`
      }
    }
  );

  const products = await response.json();

  if (!products.length) {
    productDetail.innerHTML = `
      <h2>Product not found</h2>
      <a href="catalogue.html">Back to Catalogue</a>
    `;
    return;
  }

  const product = products[0];

  const relatedResponse = await fetch(
    `${PRODUCT_SUPABASE_URL}/rest/v1/products?select=*&published=eq.true&id=neq.${encodeURIComponent(id)}&limit=4`,
    {
      headers: {
        apikey: PRODUCT_SUPABASE_KEY,
        Authorization: `Bearer ${PRODUCT_SUPABASE_KEY}`
      }
    }
  );

  const relatedProducts = await relatedResponse.json();

  productDetail.innerHTML = `

    <div class="product-detail-image">
      <img
        src="${product.image_url || "product-placeholder.svg"}"
        alt="${product.name}"
      >
    </div>

    <div class="product-detail-copy">

      <p class="eyebrow">
        ${product.category} • WHOLESALE
      </p>

      <h1>${product.name}</h1>

      <p>${product.description || ""}</p>

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
      padding:40px 0;
      border-top:1px solid #ddd8ce;
    ">

      <p class="eyebrow">WHOLESALE SHIPPING</p>

      <h2>Worldwide Wholesale Shipping</h2>

      <p style="max-width:750px;color:#77736b;line-height:1.8;">
        Trade Hub supplies wholesale products from the UAE to
        international markets. Shipping arrangements, destination,
        quantity and delivery terms are confirmed according to each order.
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

                <a
                  href="product.html?id=${p.id}"
                  class="product-image"
                >
                  <img
                    src="${p.image_url || "product-placeholder.svg"}"
                    alt="${p.name}"
                  >

                  <span>${p.category}</span>
                </a>

                <div class="product-info">

                  <small>WHOLESALE</small>

                  <h3>${p.name}</h3>

                  <p>${p.description || ""}</p>

                  <div class="product-bottom">
                    <strong>MOQ: ${p.moq}</strong>

                    <a href="product.html?id=${p.id}">
                      View →
                    </a>
                  </div>

                </div>

              </article>
            `).join("")
            : `<p>No other products available.</p>`
        }

      </div>

    </div>
  `;
}

loadProductPage();
