/* =========================================
   TRADE HUB — WHATSAPP QUOTE FORM
========================================= */

document.getElementById('quoteForm')?.addEventListener('submit', function (e) {
  e.preventDefault();

  const f = new FormData(this);

  const text =
    `Trade Hub Wholesale Enquiry%0A` +
    `Name: ${encodeURIComponent(f.get('name') || '')}%0A` +
    `Business: ${encodeURIComponent(f.get('company') || '')}%0A` +
    `Country: ${encodeURIComponent(f.get('country') || '')}%0A` +
    `Products/Quantity: ${encodeURIComponent(f.get('message') || '')}`;

  const phone = '971558699837';

  if (!phone.includes('YOUR_')) {
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  } else {
    const message = document.getElementById('formMessage');

    if (message) {
      message.textContent =
        'Thank you. Your enquiry form is ready. Add the final WhatsApp number to activate direct messaging.';
    }
  }
});


/* =========================================
   TRADE HUB — PREMIUM SCROLL ANIMATIONS
   SAFE VERSION
========================================= */

document.addEventListener('DOMContentLoaded', function () {

  /* -----------------------------------------
     SCROLL REVEAL
  ----------------------------------------- */

  const revealItems = document.querySelectorAll('.reveal');

  /*
    Safety:
    If IntersectionObserver is unavailable,
    immediately show everything instead of
    leaving the content invisible.
  */

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


  /* -----------------------------------------
     CATEGORY CARDS
  ----------------------------------------- */

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


  /* -----------------------------------------
     HERO STATS
  ----------------------------------------- */

  const stats = document.querySelectorAll('.hero-stats > div');

  stats.forEach(function (stat, index) {

    stat.classList.add('stat-reveal');

    setTimeout(function () {
      stat.classList.add('show');
    }, 400 + (index * 150));

  });

});


/* =========================================
   HOME PAGE — FEATURED PRODUCTS
========================================= */

async function loadHomeProducts() {

  const grid = document.getElementById('homeProductGrid');

  if (!grid) return;


  const SUPABASE_URL =
    'https://cgclqejzzlrxkuksqgav.supabase.co';

  const SUPABASE_KEY =
    'sb_publishable_BI34HY1C7-HR9ZzDrXuabQ_QtTRwbBx';


  try {

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/products?select=*&published=eq.true&order=created_at.desc&limit=4`,
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


    /* -----------------------------------------
       NO PRODUCTS
    ----------------------------------------- */

    if (!Array.isArray(products) || products.length === 0) {

      grid.innerHTML = `
        <p style="color:#77736b;">
          No products available yet.
        </p>
      `;

      return;
    }


    /* -----------------------------------------
       CREATE PRODUCT CARDS
    ----------------------------------------- */

    grid.innerHTML = products.map(function (product) {

      const image =
        product.image_url || 'product-placeholder.svg';

      const name =
        product.name || 'Wholesale Product';

      const category =
        product.category || 'Wholesale';

      const description =
        product.description || '';

      const moq =
        product.moq || 'Contact us';


      return `

        <article class="product-card reveal-card">

          <a
            href="product.html?id=${encodeURIComponent(product.id)}"
            class="product-image"
          >

            <img
              src="${image}"
              alt="${name}"
              loading="lazy"
            >

            <span>${category}</span>

          </a>


          <div class="product-info">

            <small>WHOLESALE</small>

            <h3>${name}</h3>

            <p>
              ${description}
            </p>


            <div class="product-bottom">

              <strong>
                MOQ: ${moq}
              </strong>

              <a
                href="product.html?id=${encodeURIComponent(product.id)}"
              >
                View →
              </a>

            </div>

          </div>

        </article>

      `;

    }).join('');


    /* -----------------------------------------
       PRODUCT CARD ANIMATION
    ----------------------------------------- */

    const productCards =
      grid.querySelectorAll('.product-card');


    productCards.forEach(function (card, index) {

      /*
        Small delay for premium stagger effect.
        Content is NOT removed if animation fails.
      */

      setTimeout(function () {

        card.classList.add('show');

      }, 100 + (index * 120));

    });


  } catch (error) {

    console.error('Trade Hub Home Products Error:', error);


    /*
      Do NOT leave the homepage looking broken.
    */

    grid.innerHTML = `
      <p style="color:#77736b;">
        Products are temporarily unavailable.
        Please check the full catalogue.
      </p>
    `;

  }

}


/* =========================================
   LOAD HOME PRODUCTS
========================================= */

loadHomeProducts();
