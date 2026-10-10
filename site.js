
/* =========================================
   TRADE HUB — WHATSAPP QUOTE FORM
========================================= */

document.getElementById('quoteForm')?.addEventListener('submit', function (e) {
  e.preventDefault();

  const f = new FormData(this);

  const lines = [
    'Trade Hub Wholesale Enquiry',
    `Name: ${f.get('name') || ''}`,
    `Business: ${f.get('company') || ''}`,
    `Country: ${f.get('country') || ''}`,
    `Products/Quantity: ${f.get('message') || ''}`
  ];

  const phone = '971558699837';
  const text = encodeURIComponent(lines.join('\n'));

  window.open(`https://wa.me/${phone}?text=${text}`, '_blank', 'noopener');

});


/* =========================================
   TRADE HUB — PREMIUM SCROLL ANIMATIONS
========================================= */

document.addEventListener('DOMContentLoaded', function () {

  const revealItems = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('show');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.05,
        rootMargin: '0px 0px -30px 0px'
      }
    );

    revealItems.forEach(function (item) {
      revealObserver.observe(item);
    });

  } else {
    revealItems.forEach(function (item) {
      item.classList.add('show');
    });
  }


  /* CATEGORY CARDS */

  const cards = document.querySelectorAll('.category-card');

  if ('IntersectionObserver' in window) {
    const cardObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const card = entry.target;
            const index = Array.from(cards).indexOf(card);

            setTimeout(function () {
              card.classList.add('show');
            }, Math.max(0, index * 100));

            observer.unobserve(card);
          }
        });
      },
      {
        threshold: 0.05,
        rootMargin: '0px 0px -30px 0px'
      }
    );

    cards.forEach(function (card) {
      card.classList.add('reveal-card');
      cardObserver.observe(card);
    });

  } else {
    cards.forEach(function (card) {
      card.classList.add('show');
    });
  }


  /* HERO STATS */

  const stats = document.querySelectorAll('.hero-stats > div');

  stats.forEach(function (stat, index) {
    stat.classList.add('stat-reveal');

    setTimeout(function () {
      stat.classList.add('show');
    }, 400 + (index * 150));
  });

});


/* =========================================
   HOME PAGE — CATEGORY-WISE PRODUCTS
========================================= */

async function loadHomeProducts() {

  const grid = document.getElementById('homeProductGrid');

  if (!grid) return;

  const SUPABASE_URL =
    'https://cgclqejzzlrxkuksqgav.supabase.co';

  const SUPABASE_KEY =
    'sb_publishable_BI34HY1C7-HR9ZzDrXuabQ_QtTRwbBx';

  /*
    Map homepage sections to your Supabase category names.
    Add alternative spellings to each list if your admin
    uses different category names.
  */

  const categoryGroups = [
    {
      title: 'Perfumes',
      names: ['perfumes', 'perfume', 'fragrance', 'fragrances']
    },
    {
      title: 'Trousers & Fashion',
      names: ['fashion', 'trousers', 'trouser', 'clothing', 'apparel']
    },
    {
      title: 'Premium Bags',
      names: ['bags', 'bag', 'handbags', 'handbag']
    },
    {
      title: 'Shoes & Sneakers',
      names: ['shoes', 'shoe', 'footwear', 'sneakers', 'sneaker']
    },
    {
      title: 'Skincare',
      names: ['skincare', 'skin care']
    },
    {
      title: 'Makeup',
      names: ['makeup', 'cosmetics', 'beauty']
    }
  ];

  try {

    grid.innerHTML = `
      <p style="color:#77736b;">Loading wholesale products...</p>
    `;

    /*
      Fetch published products without a tiny limit so we can
      choose products from each category.
    */

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/products?select=*&published=eq.true&order=created_at.desc`,
      {
        method: 'GET',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Products request failed: ${response.status}`);
    }

    const products = await response.json();

    if (!Array.isArray(products) || products.length === 0) {
      grid.innerHTML = `
        <p style="color:#77736b;">
          Products are being prepared. Contact us for wholesale availability.
        </p>
      `;
      return;
    }

    /*
      Normalize categories so capitalization and extra spaces
      do not cause products to disappear.
    */

    function normalize(value) {
      return String(value || '')
        .trim()
        .toLowerCase()
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9]+/g, '');
    }

    const usedIds = new Set();
    const selectedProducts = [];

    /*
      Pick up to two products per category.
    */

    categoryGroups.forEach(function (group) {

      const acceptedNames = group.names.map(normalize);

      const matchingProducts = products.filter(function (product) {
        const productCategory = normalize(product.category);

        return acceptedNames.includes(productCategory);
      });

      matchingProducts.slice(0, 2).forEach(function (product) {
        const id = String(product.id);

        if (!usedIds.has(id)) {
          usedIds.add(id);
          selectedProducts.push(product);
        }
      });

    });

    /*
      If some categories have no products, fill remaining slots
      with the newest products not already selected.
      This keeps the homepage useful while categories are added.
    */

    if (selectedProducts.length < 6) {
      products.forEach(function (product) {
        if (selectedProducts.length >= 6) return;

        const id = String(product.id);

        if (!usedIds.has(id)) {
          usedIds.add(id);
          selectedProducts.push(product);
        }
      });
    }

    if (selectedProducts.length === 0) {
      grid.innerHTML = `
        <p style="color:#77736b;">
          No products available yet. Please check back soon.
        </p>
      `;
      return;
    }

    /*
      Render product cards using the existing CSS classes
      and product.html detail links.
    */

    grid.innerHTML = selectedProducts.map(function (product, index) {

      const image =
        product.image_url || 'product-placeholder.svg';

      const name =
        product.name || 'Wholesale Product';

      const category =
        product.category || 'Wholesale';

      const description =
        product.description || 'Contact Trade Hub for product details.';

      const moq =
        product.moq || 'Contact us';

      const safeId = encodeURIComponent(product.id);

      return `
        <article class="product-card reveal-card" style="--card-index:${index};">

          <a
            href="product.html?id=${safeId}"
            class="product-image"
            aria-label="View ${escapeHtml(name)}"
          >
            <img
              src="${escapeHtml(image)}"
              alt="${escapeHtml(name)}"
              loading="lazy"
              onerror="this.onerror=null;this.src='product-placeholder.svg';"
            >
            <span>${escapeHtml(category)}</span>
          </a>

          <div class="product-info">
            <small>WHOLESALE</small>

            <h3>${escapeHtml(name)}</h3>

            <p>${escapeHtml(description)}</p>

            <div class="product-bottom">
              <strong>MOQ: ${escapeHtml(moq)}</strong>

              <a href="product.html?id=${safeId}">
                View →
              </a>
            </div>
          </div>

        </article>
      `;

    }).join('');

    /*
      Reveal cards safely after rendering.
    */

    grid.querySelectorAll('.product-card').forEach(function (card, index) {
      setTimeout(function () {
        card.classList.add('show');
      }, 80 + (index * 100));
    });

  } catch (error) {

    console.error('Trade Hub Home Products Error:', error);

    grid.innerHTML = `
      <p style="color:#77736b;">
        Products are temporarily unavailable.
        Please explore the full catalogue or contact us on WhatsApp.
      </p>
    `;
  }
}


/* Escape database content before inserting it into HTML. */

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, function (char) {
    const entities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };

    return entities[char];
  });
}


/* =========================================
   LOAD HOME PRODUCTS
========================================= */

loadHomeProducts();

