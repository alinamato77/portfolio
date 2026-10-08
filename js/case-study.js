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

// Floating ring in the hero fills once it scrolls into view (target set via data-offset)
const ringCard = document.getElementById('hydrationCard');
const ringFg = document.getElementById('hydrationRingFg');
if (ringCard && ringFg) {
  const ringObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        ringFg.style.strokeDashoffset = ringFg.dataset.offset;
        ringObserver.disconnect();
      }
    });
  }, { threshold: 0.4 });
  ringObserver.observe(ringCard);
}

// Scroll-reveal - fade + rise each block in once it enters the viewport,
// staggering any marked child items
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

// Prototype videos play only while on screen
const autoVideos = [...document.querySelectorAll('video[data-autoplay]')];
if (autoVideos.length) {
  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.play().catch(() => {});
      else entry.target.pause();
    });
  }, { threshold: 0.35 });
  autoVideos.forEach(v => videoObserver.observe(v));
}

// Prototype lineup: every clip sits in one row. The current clip stands out and plays;
// when it finishes, the next one takes over. Clips waiting their turn are a little darker.
document.querySelectorAll('[data-stage]').forEach((stage) => {
  const items = [...stage.querySelectorAll('[data-item]')].map((el) => ({ ...el.dataset }));
  if (!items.length) return;

  const IMAGE_DWELL = 4500;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  stage.style.setProperty('--ar', stage.dataset.ar || '1 / 2');
  stage.style.setProperty('--dwell', IMAGE_DWELL + 'ms');
  stage.innerHTML = '<div class="ds-lane"></div>';
  const lane = stage.firstElementChild;

  let current = 0;
  let inView = false;
  let timer;

  const clips = items.map((it, i) => {
    const el = document.createElement('article');
    el.className = 'ds-clip';
    el.tabIndex = 0;
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', 'Play ' + it.title);
    el.innerHTML = `
      <div class="ds-phone ds-clip-phone"><div class="ds-clip-media"></div></div>
      <div class="ds-clip-bar"><i></i></div>
      <div class="ds-clip-text">
        <p class="ds-clip-no"></p>
        <p class="ds-clip-title"></p>
        <p class="ds-clip-desc"></p>
      </div>`;
    el.querySelector('.ds-clip-no').textContent = String(i + 1).padStart(2, '0');
    el.querySelector('.ds-clip-title').textContent = it.title;
    el.querySelector('.ds-clip-desc').textContent = it.text;

    const clip = { el, bar: el.querySelector('.ds-clip-bar'), fill: el.querySelector('.ds-clip-bar i'), video: null };
    const box = el.querySelector('.ds-clip-media');
    if (it.kind === 'video') {
      const v = document.createElement('video');
      v.src = it.src + '#t=0.1';
      if (it.poster) v.poster = it.poster;
      v.muted = true;
      v.setAttribute('muted', '');
      v.loop = false;
      v.playsInline = true;
      v.preload = i === 0 ? 'auto' : 'metadata';
      v.addEventListener('timeupdate', () => {
        if (clips[current] === clip && v.duration) clip.fill.style.width = (v.currentTime / v.duration * 100) + '%';
      });
      v.addEventListener('ended', () => { if (clips[current] === clip) next(); });
      box.appendChild(v);
      clip.video = v;
    } else {
      const img = document.createElement('img');
      img.src = it.src;
      img.alt = it.title;
      box.appendChild(img);
    }
    el.addEventListener('click', () => show(i));
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(i); }
    });
    lane.appendChild(el);
    return clip;
  });

  function next() { show((current + 1) % items.length); }

  // Brings the current clip to the middle of the row when the row scrolls (phones)
  function centre(clip) {
    if (lane.scrollWidth <= lane.clientWidth) return;
    lane.scrollTo({ left: clip.el.offsetLeft - (lane.clientWidth - clip.el.clientWidth) / 2, behavior: 'smooth' });
  }

  function show(i) {
    clearTimeout(timer);
    current = i;
    clips.forEach((c, k) => {
      c.el.classList.toggle('is-active', k === i);
      c.bar.classList.remove('run');
      c.fill.style.width = '0%';
      if (c.video) {
        c.video.pause();
        if (k !== i) c.video.currentTime = 0.1;
      }
    });
    const active = clips[i];
    centre(active);
    const upcoming = clips[(i + 1) % items.length];
    if (upcoming.video) upcoming.video.preload = 'auto';
    if (!inView || reduceMotion) return;

    if (active.video) {
      active.video.currentTime = 0;
      active.video.play().catch(() => {});
      timer = setTimeout(next, 45000); // safety net if a video can't play
    } else {
      void active.bar.offsetWidth;
      active.bar.classList.add('run');
      timer = setTimeout(next, IMAGE_DWELL);
    }
  }

  show(0);

  new IntersectionObserver((entries) => {
    inView = entries[0].isIntersecting;
    if (inView) {
      show(current);
    } else {
      clearTimeout(timer);
      clips.forEach((c) => { c.bar.classList.remove('run'); if (c.video) c.video.pause(); });
    }
  }, { threshold: 0.4 }).observe(stage);
});
