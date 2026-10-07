document.getElementById('quoteForm')?.addEventListener('submit', function(e) {
  e.preventDefault();

  const f = new FormData(this);

  const text = `Trade Hub Wholesale Enquiry%0AName: ${f.get('name')}%0ABusiness: ${f.get('company')}%0ACountry: ${f.get('country')}%0AProducts/Quantity: ${f.get('message')}`;

  const phone = 'YOUR_WHATSAPP_NUMBER_WITHOUT_PLUS';

  if (!phone.includes('YOUR_')) {
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  } else {
    document.getElementById('formMessage').textContent =
      'Thank you. Your enquiry form is ready. Add the final WhatsApp number to activate direct messaging.';
  }
});


/* =========================================
   TRADE HUB — PREMIUM SCROLL ANIMATIONS
========================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* Scroll reveal */
  const revealItems = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -60px 0px'
    }
  );

  revealItems.forEach(item => {
    revealObserver.observe(item);
  });


  /* Category cards — elegant stagger */
  const cards = document.querySelectorAll('.category-card');

  const cardObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const card = entry.target;
          const index = [...cards].indexOf(card);

          setTimeout(() => {
            card.classList.add('show');
          }, index * 100);

          observer.unobserve(card);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }
  );

  cards.forEach(card => {
    card.classList.add('reveal-card');
    cardObserver.observe(card);
  });


  /* Hero stats reveal */
  const stats = document.querySelectorAll('.hero-stats > div');

  stats.forEach((stat, index) => {
    stat.classList.add('stat-reveal');

    setTimeout(() => {
      stat.classList.add('show');
    }, 500 + (index * 180));
  });

});
