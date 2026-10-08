// Keeps every heading on a single row by shrinking its type until it fits.
// If a heading can't fit even at the smallest size it is allowed to wrap.
(function () {
  const FLOOR = 14;
  const SELECTOR = 'h1, h2, h3, .cta-text';

  function availableWidth(el) {
    const parent = el.parentElement;
    const cs = getComputedStyle(parent);
    return parent.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  }

  function fit(el) {
    if (!el.parentElement || el.parentElement.clientWidth === 0) return;

    el.classList.remove('fit-wrap');
    el.style.fontSize = '';

    // The hero headline types different words; size it for the longest one.
    const rotator = el.querySelector('#heroRotator');
    const saved = rotator ? rotator.textContent : null;
    if (rotator) rotator.textContent = 'feel better';

    const avail = availableWidth(el);
    const fits = () => el.scrollWidth <= avail + 1;
    const max = parseFloat(getComputedStyle(el).fontSize);

    if (!fits()) {
      el.style.fontSize = FLOOR + 'px';
      if (!fits()) {
        el.style.fontSize = '';
        el.classList.add('fit-wrap');
      } else {
        let lo = FLOOR;
        let hi = max;
        for (let i = 0; i < 12; i++) {
          const mid = (lo + hi) / 2;
          el.style.fontSize = mid + 'px';
          if (fits()) lo = mid; else hi = mid;
        }
        el.style.fontSize = lo.toFixed(2) + 'px';
      }
    }

    if (rotator) rotator.textContent = saved;
  }

  function fitAll() {
    document.querySelectorAll(SELECTOR).forEach(fit);
  }

  let timer;
  window.addEventListener('resize', () => {
    clearTimeout(timer);
    timer = setTimeout(fitAll, 120);
  });

  fitAll();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitAll);
  window.addEventListener('load', fitAll);
})();
