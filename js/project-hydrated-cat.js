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

// Daily-goal ring fills in once it scrolls into view
const hydrationCard = document.getElementById('hydrationCard');
const hydrationRingFg = document.getElementById('hydrationRingFg');
if (hydrationCard && hydrationRingFg) {
  const ringObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        hydrationRingFg.style.strokeDashoffset = 46; // ~6/9 cups filled
        ringObserver.disconnect();
      }
    });
  }, { threshold: 0.4 });
  ringObserver.observe(hydrationCard);
}

// User testing — click the persona card to switch between Emily and Alexander
const personaToggle = document.getElementById('personaToggle');
const personaPanels = document.getElementById('personaPanels');
if (personaToggle && personaPanels) {
  const personas = [
    {
      name: 'Emily', age: 26, job: 'Product Manager', location: 'Seattle, WA', avatar: 'images/character/persona-female.png', color: 'pink',
      coreNeeds: [
        { bold: 'Sustained Vitality', text: 'Maintaining energy for work and exercise.' },
        { bold: 'Effortless consistency', text: 'Staying hydrated during busy schedules without requiring conscious effort.' },
      ],
      painPoint: [
        { bold: 'Peak Performance', text: 'Optimize her mental clarity and physical energy to handle her demanding workload.' },
        { bold: 'Decision Fatigue', text: 'Spend energy to decide "when and how much to drink."' },
        { bold: 'False Productivity', text: 'Thinks stopping to fetch water is a "waste of time," prioritizing output over her own biology.' },
      ],
      behavior: [
        { text: 'Often goes 6+ hours without a sip during back-to-back meetings, then "binge drinks" at night.' },
        { text: 'Caffeine substitution.' },
        { text: 'Abandons health apps that require too many manual inputs or interrupt her deep work flow.' },
      ],
    },
    {
      name: 'Alexander', age: 33, job: 'Banker', location: 'San Jose, CA', avatar: 'images/character/persona-male.png', color: 'blue',
      coreNeeds: [
        { text: 'Needs a psychological reward to make the boring act of drinking water feel satisfying.' },
        { text: 'Motivated by vanity and health markers (e.g. clearer skin, better metabolism) rather than just "hydration."' },
        { bold: 'Habit Anchoring', text: 'Needs help connecting hydration to his existing routines since he lacks natural thirst cues.' },
      ],
      painPoint: [
        { text: 'Feels boring to record drinking.' },
        { text: 'Experiences energy spikes from relying on sugary beverages, affecting his focus.' },
        { text: "No one notices if he skips water, so it's the easiest habit to drop when stressed." },
      ],
      behavior: [
        { text: 'Prioritizes taste over hydration — often chooses soda or flavored lattes because plain water feels "boring."' },
        { text: 'Ignores standard "drink water" alarms.' },
        { text: 'Only drinks water after feeling terrible (dizzy, dry skin), rather than proactively.' },
      ],
    },
  ];
  let personaIndex = 0;

  const personaAvatar = document.getElementById('personaAvatar');
  const personaAvatarImg = document.getElementById('personaAvatarImg');
  const personaAvatarBack = document.getElementById('personaAvatarBack');
  const personaAvatarBackImg = document.getElementById('personaAvatarBackImg');
  const personaName = document.getElementById('personaName');
  const personaAge = document.getElementById('personaAge');
  const personaJob = document.getElementById('personaJob');
  const personaLocation = document.getElementById('personaLocation');
  const personaCoreNeeds = document.getElementById('personaCoreNeeds');
  const personaPainPoint = document.getElementById('personaPainPoint');
  const personaBehavior = document.getElementById('personaBehavior');
  const personaCardFront = personaToggle.querySelector('.persona-card-front');

  function renderList(el, items) {
    el.innerHTML = '';
    items.forEach(({ bold, text }) => {
      const li = document.createElement('li');
      if (bold) {
        const strong = document.createElement('strong');
        strong.textContent = bold + ': ';
        li.appendChild(strong);
      }
      li.appendChild(document.createTextNode(text));
      el.appendChild(li);
    });
  }

  function renderPersona() {
    const p = personas[personaIndex];
    const next = personas[(personaIndex + 1) % personas.length];
    personaAvatarImg.src = p.avatar;
    personaAvatarImg.alt = p.name + ' persona illustration';
    personaAvatar.className = 'persona-avatar ' + p.color;
    personaAvatarBackImg.src = next.avatar;
    personaAvatarBack.className = 'persona-avatar-mini ' + next.color;
    personaName.textContent = p.name;
    personaAge.textContent = p.age;
    personaJob.textContent = p.job;
    personaLocation.textContent = p.location;
    renderList(personaCoreNeeds, p.coreNeeds);
    renderList(personaPainPoint, p.painPoint);
    renderList(personaBehavior, p.behavior);
  }

  renderPersona();

  personaToggle.addEventListener('click', () => {
    personaIndex = (personaIndex + 1) % personas.length;
    personaCardFront.style.opacity = '0';
    personaPanels.style.opacity = '0';
    setTimeout(() => {
      renderPersona();
      personaCardFront.style.opacity = '1';
      personaPanels.style.opacity = '1';
    }, 150);
  });
}

// Screen gallery — click a thumbnail to feature it in the stage; the video resumes
// playing whenever it becomes the active item again
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
