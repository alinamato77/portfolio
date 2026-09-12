const cursor = document.getElementById('cursor');
document.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';
});
document.querySelectorAll('a, button').forEach(el => {
  el.addEventListener('mouseenter', () => cursor.classList.add('expand'));
  el.addEventListener('mouseleave', () => cursor.classList.remove('expand'));
});

// Cursor-tracking tilt on the hero mockups
const mockupWrap = document.getElementById('mockupWrap');
if (mockupWrap) {
  const mockups = mockupWrap.querySelectorAll('.mockup');
  mockupWrap.addEventListener('mousemove', (e) => {
    const rect = mockupWrap.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mockups.forEach(m => {
      const baseDeg = m.classList.contains('mockup-back') ? -4 : 4;
      m.style.transform = `rotate(${baseDeg + x * 10}deg) translateY(${y * -16}px)`;
    });
  });
  mockupWrap.addEventListener('mouseleave', () => {
    mockups.forEach(m => { m.style.transform = ''; });
  });
}

// "Time lost" ring fills in once it scrolls into view
const hydrationCard = document.getElementById('hydrationCard');
const hydrationRingFg = document.getElementById('hydrationRingFg');
if (hydrationCard && hydrationRingFg) {
  const ringObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        hydrationRingFg.style.strokeDashoffset = 68; // ~51% filled
        ringObserver.disconnect();
      }
    });
  }, { threshold: 0.4 });
  ringObserver.observe(hydrationCard);
}

// Screen gallery — click a thumbnail to feature it in the stage; videos pause when
// switched away and resume playing whenever they become the active item again
const galleryStage = document.getElementById('galleryStage');
const galleryThumbs = document.getElementById('galleryThumbs');
const galleryCaption = document.getElementById('galleryCaption');
if (galleryStage && galleryThumbs && galleryCaption) {
  const stageItems = [...galleryStage.querySelectorAll('img, video')];
  const thumbs = [...galleryThumbs.querySelectorAll('.clean-gallery-thumb')];
  const captionTitle = galleryCaption.querySelector('h3');
  const captionDesc = galleryCaption.querySelector('p');
  thumbs.forEach((thumb, i) => {
    thumb.addEventListener('click', () => {
      thumbs.forEach(t => t.classList.remove('active'));
      stageItems.forEach(s => {
        s.classList.remove('active');
        if (s.tagName === 'VIDEO') s.pause();
      });
      thumb.classList.add('active');
      stageItems[i].classList.add('active');
      if (stageItems[i].tagName === 'VIDEO') stageItems[i].play().catch(() => {});
      galleryStage.classList.toggle('wide', thumb.dataset.wide === 'true');
      captionTitle.textContent = thumb.dataset.title;
      captionDesc.textContent = thumb.dataset.desc;
    });
  });
}

// Scroll-reveal — fade + rise each section in once it enters the viewport,
// staggering any marked child items for a smarter, cascading feel
const revealEls = [...document.querySelectorAll('[data-reveal]')];
if (revealEls.length) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        const items = [...entry.target.querySelectorAll('[data-reveal-item]')];
        items.forEach((item, i) => {
          setTimeout(() => item.classList.add('revealed'), i * 120);
        });
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  revealEls.forEach(el => revealObserver.observe(el));
}

// Side navigation — highlights the section currently in view, and switches
// instantly on click instead of waiting on scroll to catch up
const sideNav = document.getElementById('sideNav');
if (sideNav) {
  const sideLinks = [...sideNav.querySelectorAll('.side-nav-link')];
  const sections = sideLinks
    .map(link => document.getElementById(link.dataset.target))
    .filter(Boolean);

  function setActiveLink(link) {
    if (!link || link.classList.contains('active')) return;
    sideLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
  }

  let suppressObserverUntil = 0;

  sideLinks.forEach((link) => {
    link.addEventListener('click', () => {
      setActiveLink(link);
      // Ignore scroll-spy updates while the smooth-scroll from this click is still in flight,
      // so it can't flip the highlight to a section the scroll is only passing through.
      suppressObserverUntil = Date.now() + 800;
    });
  });

  const sideNavObserver = new IntersectionObserver((entries) => {
    if (Date.now() < suppressObserverUntil) return;
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      setActiveLink(sideNav.querySelector(`[data-target="${entry.target.id}"]`));
    });
  }, { threshold: 0.3, rootMargin: '-35% 0px -35% 0px' });

  sections.forEach(section => sideNavObserver.observe(section));
}
