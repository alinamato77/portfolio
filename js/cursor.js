// Pixel cursor that changes with what you hover:
//   default  small blue square
//   pointer  pixel hand over links and buttons
//   open     OPEN pill over expandable previews
//   view     VIEW pill over project cards
//   flip     FLIP pill over the persona card
//   drag     DRAG pill over the carousel
//   native   hidden, so an embedded iframe can show its own cursor
(function () {
  const cursor = document.getElementById('cursor');
  if (!cursor || window.matchMedia('(hover: none)').matches) return;

  // First match wins, so the specific cases come before the generic ones.
  const RULES = [
    ['iframe', 'native', ''],
    ['.more-work-video-trigger, .more-work-preview-trigger', 'open', 'OPEN'],
    ['.persona-card-stack', 'flip', 'FLIP'],
    ['a, button, summary, label, select, [role="button"], .more-work-dot, .clean-gallery-thumb', 'pointer', ''],
    ['.project-item', 'view', 'VIEW'],
    ['.more-work-track', 'drag', 'DRAG'],
  ];

  function setState(state, label) {
    if (cursor.dataset.state === state && cursor.dataset.label === label) return;
    cursor.dataset.state = state;
    cursor.dataset.label = label;
  }

  document.addEventListener('mouseover', (e) => {
    for (const [selector, state, label] of RULES) {
      if (e.target.closest && e.target.closest(selector)) {
        setState(state, label);
        return;
      }
    }
    setState('default', '');
  });

  document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
    cursor.classList.add('on');
  });

  document.addEventListener('mousedown', () => cursor.classList.add('down'));
  document.addEventListener('mouseup', () => cursor.classList.remove('down'));
  document.documentElement.addEventListener('mouseleave', () => cursor.classList.remove('on'));
})();
