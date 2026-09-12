const cursor = document.getElementById('cursor');
document.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';
});
document.querySelectorAll('a, button').forEach(el => {
  el.addEventListener('mouseenter', () => cursor.classList.add('expand'));
  el.addEventListener('mouseleave', () => cursor.classList.remove('expand'));
});
const heroRotator = document.getElementById('heroRotator');
if (heroRotator) {
  const rotatorSleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const rotatorStates = ['work well', 'feel better'];
  const typeSpeed = 70;
  const deleteSpeed = 40;
  const holdTime = 800;

  async function runRotator() {
    let stateIndex = 0;
    for (;;) {
      const word = rotatorStates[stateIndex];
      for (let i = 1; i <= word.length; i++) {
        heroRotator.textContent = word.slice(0, i);
        await rotatorSleep(typeSpeed);
      }
      await rotatorSleep(holdTime);
      for (let i = word.length; i >= 0; i--) {
        heroRotator.textContent = word.slice(0, i);
        await rotatorSleep(deleteSpeed);
      }
      stateIndex = (stateIndex + 1) % rotatorStates.length;
    }
  }
  runRotator();
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 150);
    }
  });
}, { threshold: 0.08 });
document.querySelectorAll('[data-observe]').forEach(el => observer.observe(el));

// Terminal window toggle — pops up centered, dismissed via icon, backdrop, or Escape.
// Each open plays the session like a real terminal: command types out character by
// character, Enter fires, output appears, then the next command begins.
const terminal = document.getElementById('v2Terminal');
const terminalToggle = document.getElementById('v2TerminalToggle');
const terminalBackdrop = document.getElementById('v2TerminalBackdrop');
const terminalBody = document.getElementById('v2TerminalBody');

if (terminal && terminalToggle && terminalBackdrop && terminalBody) {
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const terminalSession = [
    {
      prompt: 'MacBook-Pro:~ alinaxie$ ',
      command: [{ text: 'cd ~/' }, { text: 'About_Me', cls: 'v2-term-highlight' }],
    },
    {
      prompt: 'MacBook-Pro:About_Me alinaxie$ ',
      command: [{ text: 'whoami', cls: 'v2-term-highlight' }],
      output: ['> alina_xie — explorer'],
      strongOutput: true,
      blankAfter: true,
    },
    {
      prompt: 'MacBook-Pro:About_Me alinaxie$ ',
      command: [{ text: 'cat ' }, { text: 'journey.txt', cls: 'v2-term-highlight' }],
      output: ['> [past]     artist', '> [current]  ui&ux student', '> [future]   product designer'],
      strongOutput: true,
      blankAfter: true,
    },
    {
      prompt: 'MacBook-Pro:About_Me alinaxie$ ',
      command: [{ text: 'ls ' }, { text: 'skills/', cls: 'v2-term-highlight' }],
      output: ['design_thinking/   illustration/   prototyping/   curiosity.∞;'],
      strongOutput: true,
      blankAfter: true,
    },
    {
      prompt: 'MacBook-Pro:About_Me alinaxie$ ',
      command: [{ text: 'echo $STATUS' }],
      output: ['> still exploring... '],
      caretAfterOutput: true,
    },
  ];

  let sessionToken = 0;

  function appendLine() {
    const line = document.createElement('div');
    line.className = 'v2-term-line';
    terminalBody.appendChild(line);
    return line;
  }

  function appendBlankLine() {
    appendLine().innerHTML = '&nbsp;';
  }

  async function typeSegments(lineEl, segments, token) {
    for (const segment of segments) {
      const span = segment.cls ? document.createElement('span') : null;
      if (span) { span.className = segment.cls; lineEl.appendChild(span); }
      const target = span || lineEl;
      for (const char of segment.text) {
        if (token !== sessionToken) return false;
        target.appendChild(document.createTextNode(char));
        await sleep(8 + Math.random() * 10);
      }
    }
    return true;
  }

  async function runTerminalSession(token) {
    terminalBody.innerHTML = '';
    appendLine().textContent = 'Last login: Wed Oct 17 18:13:08 on ttys000';
    await sleep(150);

    for (const step of terminalSession) {
      if (token !== sessionToken) return;

      const commandLine = appendLine();
      commandLine.classList.add('typing');
      commandLine.appendChild(document.createTextNode(step.prompt));
      const typed = await typeSegments(commandLine, step.command, token);
      if (!typed) return;

      await sleep(140);
      if (token !== sessionToken) return;
      commandLine.classList.remove('typing');

      if (step.output && step.output.length) {
        await sleep(70);
        for (let i = 0; i < step.output.length; i++) {
          if (token !== sessionToken) return;
          const text = step.output[i];
          const outLine = appendLine();
          const holder = step.strongOutput ? document.createElement('strong') : outLine;
          if (holder !== outLine) outLine.appendChild(holder);
          holder.textContent = text;
          if (step.caretAfterOutput && i === step.output.length - 1) {
            const caret = document.createElement('span');
            caret.className = 'v2-caret';
            caret.textContent = '█';
            holder.appendChild(caret);
          }
          await sleep(40);
        }
        await sleep(110);
      }

      if (step.blankAfter) appendBlankLine();
    }
  }

  function setTerminalOpen(isOpen) {
    terminal.classList.toggle('open', isOpen);
    terminalBackdrop.classList.toggle('open', isOpen);
    terminalToggle.setAttribute('aria-pressed', String(isOpen));
    sessionToken += 1;
    if (isOpen) runTerminalSession(sessionToken);
  }

  terminalToggle.addEventListener('click', () => {
    setTerminalOpen(!terminal.classList.contains('open'));
  });
  terminalBackdrop.addEventListener('click', () => setTerminalOpen(false));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setTerminalOpen(false);
  });
}

// Hero background interaction — adapted from sky-stars-interactive.html
// Listeners live on the whole hero section (not just the sky layer) so the
// effect tracks the mouse everywhere, and stars render in front of the card.
const heroSection = document.getElementById('home');
const sky = document.getElementById('v2Sky');
const constellationLayer = document.getElementById('v2ConstellationLayer');
if (heroSection && sky && constellationLayer) {
  const constellations = [
    `+------+\n|  ✦   |\n+------*`,
    `    .---*\n   /     \\\n  ✦       ✧`,
    `+---.\n     \\---✦\n          \\---*`,
    `  ✦---✧\n  |   |\n  *---*`
  ];

  const constPositions = [
    { left: '10%', top: '18%' },
    { left: '70%', top: '12%' },
    { left: '30%', top: '68%' },
    { left: '82%', top: '55%' }
  ];

  constPositions.forEach((pos, index) => {
    const item = document.createElement('div');
    item.className = 'v2-constellation';
    item.innerText = constellations[index % constellations.length];
    item.style.left = pos.left;
    item.style.top = pos.top;
    item.style.animationDelay = `${index * 1.5}s`;
    constellationLayer.appendChild(item);
  });

  const skyColors = ['#2d3748', '#4a5568', '#2b58d5', '#d69e2e', '#805ad5', '#e53e3e'];
  const starChars = ['*', '+', '.', '✦', '✧'];
  const trailChars = ['*', '=', '-', '~', '.', '°', '✦'];

  let lastX = 0;
  let lastY = 0;
  const MIN_DISTANCE = 80;

  function createStar(x, y, char, isFade) {
    const star = document.createElement('div');
    star.className = 'v2-star-node';
    star.innerText = char;

    const size = Math.floor(Math.random() * 12) + 24;
    const color = skyColors[Math.floor(Math.random() * skyColors.length)];

    star.style.color = color;
    star.style.fontSize = `${size}px`;
    star.style.left = `${x}px`;
    star.style.top = `${y}px`;

    sky.appendChild(star);

    if (isFade) {
      setTimeout(() => {
        star.style.opacity = '0';
        star.style.transform = 'translate(-50%, -120%) scale(0.7)';
      }, 100);
      setTimeout(() => star.remove(), 1900);
    } else {
      star.classList.add('v2-twinkle');
    }
  }

  heroSection.addEventListener('click', (e) => {
    const rect = heroSection.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const char = starChars[Math.floor(Math.random() * starChars.length)];
    createStar(x, y, char, false);
  });

  heroSection.addEventListener('mousedown', (e) => {
    lastX = e.clientX;
    lastY = e.clientY;
  });

  heroSection.addEventListener('mousemove', (e) => {
    if (e.buttons !== 1) return;

    const deltaX = e.clientX - lastX;
    const deltaY = e.clientY - lastY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance > MIN_DISTANCE) {
      const rect = heroSection.getBoundingClientRect();
      const jitterX = (Math.random() - 0.5) * 30;
      const jitterY = (Math.random() - 0.5) * 30;
      const x = e.clientX - rect.left + jitterX;
      const y = e.clientY - rect.top + jitterY;
      const char = trailChars[Math.floor(Math.random() * trailChars.length)];
      createStar(x, y, char, true);

      lastX = e.clientX;
      lastY = e.clientY;
    }
  });
}

// "My Other Works" carousel — scroll-snap track synced with dot pagination
const moreWorkTrack = document.getElementById('moreWorkTrack');
const moreWorkDots = document.querySelectorAll('.more-work-dot');
if (moreWorkTrack && moreWorkDots.length) {
  const slides = [...moreWorkTrack.querySelectorAll('.more-work-slide')];

  function updateActiveDot() {
    const trackRect = moreWorkTrack.getBoundingClientRect();
    const center = trackRect.left + trackRect.width / 2;
    let closestIndex = 0;
    let closestDistance = Infinity;
    slides.forEach((slide, i) => {
      const r = slide.getBoundingClientRect();
      const slideCenter = r.left + r.width / 2;
      const distance = Math.abs(slideCenter - center);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = i;
      }
    });
    moreWorkDots.forEach((dot, i) => dot.classList.toggle('active', i === closestIndex));
    slides.forEach((slide, i) => slide.classList.toggle('active', i === closestIndex));
  }

  let scrollTimeout;
  moreWorkTrack.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(updateActiveDot, 80);
  });

  moreWorkDots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      slides[i].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    });
  });

  updateActiveDot();
}

// Signature reveal — click to grow an ASCII zodiac garden (+ - = only),
// adapted from emmiwu.com/voter-guide's ASCII flower-garden footer, then write the name
const signatureStage = document.getElementById('signatureStage');
const signatureSky = document.getElementById('signatureSky');
const signatureHint = document.getElementById('signatureHint');
const signatureEmail = document.getElementById('signatureEmail');
const signatureResume = document.getElementById('signatureResume');
const zodiacPlants = [...document.querySelectorAll('.zodiac-plant')];
if (signatureStage && signatureSky && signatureHint && signatureEmail && signatureResume) {
  const signatureLetters = [...document.querySelectorAll('.signature-letter')];
  const sparkColors = ['#2d3748', '#4a5568', '#2b58d5', '#d69e2e', '#805ad5', '#e53e3e'];
  const sparkChars = ['+', '-', '='];
  let signatureStarted = false;

  function spawnSparkBurst(x, y) {
    const count = 4;
    for (let i = 0; i < count; i++) {
      const spark = document.createElement('div');
      spark.className = 'v2-star-node v2-twinkle';
      spark.innerText = sparkChars[Math.floor(Math.random() * sparkChars.length)];
      const angle = Math.random() * Math.PI * 2;
      const dist = 16 + Math.random() * 34;
      spark.style.left = `${x + Math.cos(angle) * dist}px`;
      spark.style.top = `${y + Math.sin(angle) * dist}px`;
      spark.style.fontSize = `${14 + Math.random() * 12}px`;
      spark.style.color = sparkColors[Math.floor(Math.random() * sparkColors.length)];
      signatureSky.appendChild(spark);
      setTimeout(() => {
        spark.style.opacity = '0';
        spark.style.transform = 'translate(-50%, -140%) scale(0.6)';
      }, 700);
      setTimeout(() => spark.remove(), 2000);
    }
  }

  function playSignature() {
    if (signatureStarted) return;
    signatureStarted = true;
    signatureHint.classList.add('hidden');

    // Grow the ASCII zodiac garden, staggered like planting one at a time
    const shuffled = [...zodiacPlants].sort(() => Math.random() - 0.5);
    shuffled.forEach((plant, i) => {
      setTimeout(() => plant.classList.add('grown'), i * 110);
    });

    signatureLetters.forEach((letter, i) => {
      setTimeout(() => {
        letter.classList.add('shown');
        const stageRect = signatureStage.getBoundingClientRect();
        const letterRect = letter.getBoundingClientRect();
        spawnSparkBurst(
          letterRect.left - stageRect.left + letterRect.width / 2,
          letterRect.top - stageRect.top + letterRect.height / 2
        );
      }, i * 220);
    });

    const gardenDuration = zodiacPlants.length * 110;
    const nameDuration = signatureLetters.length * 220;
    setTimeout(() => {
      signatureEmail.classList.add('shown');
    }, Math.max(gardenDuration, nameDuration) + 300);
    setTimeout(() => {
      signatureResume.classList.add('shown');
    }, Math.max(gardenDuration, nameDuration) + 450);
  }

  signatureStage.addEventListener('click', playSignature);
}

// Video preview lightbox — shared by the Motion and Back-End cards. Each
// preview plays on hover and stops when the cursor leaves; clicking it
// expands the same blue-bordered browser-chrome window into the center of
// the screen (minus the badge), with links out to the full case study or
// site. Closed with a single click on the backdrop (or Escape).
const videoLightbox = document.getElementById('videoLightbox');
const videoLightboxBackdrop = document.getElementById('videoLightboxBackdrop');
const videoLightboxCta = document.getElementById('videoLightboxCta');
const videoPreviews = [
  { browserId: 'moreWorkBrowser', triggerId: 'moreWorkVideoTrigger', videoId: 'moreWorkVideo', links: [{ href: 'projects/motion-design.php', label: 'View Case Study →' }] },
  { browserId: 'backEndBrowser', triggerId: 'backEndVideoTrigger', videoId: 'backEndVideo', links: [{ href: 'https://alinaxdesign.com/aau/ixd608/pawland/', label: 'Visit Site ↗' }, { href: 'https://github.com/alinamato77/ixd608.git', label: 'View on GitHub ↗' }] },
  { browserId: 'timelineBrowser', triggerId: 'timelineVideoTrigger', videoId: 'timelineVideo', links: [{ href: 'https://www.figma.com/proto/WK2PX9FOJQDuT2RUWDA7Mi/timeline-website---wireframe?node-id=2-2&viewport=92%2C716%2C0.21&t=THNyTqyjMlxsMztu-1&scaling=contain&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=2%3A2', label: 'View Prototype ↗' }] },
];

if (videoLightbox && videoLightboxBackdrop) {
  let activePreview = null;

  function closeVideoLightbox() {
    if (!activePreview) return;
    videoLightbox.classList.remove('open');
    videoLightboxBackdrop.classList.remove('open');
    activePreview.video.pause();
    activePreview.video.currentTime = 0;
    activePreview.video.controls = false;
    activePreview.video.muted = true;
    activePreview.homeParent.insertBefore(activePreview.browser, activePreview.homeNextSibling);
    activePreview = null;
  }

  videoPreviews.forEach(({ browserId, triggerId, videoId, links }) => {
    const browser = document.getElementById(browserId);
    const trigger = document.getElementById(triggerId);
    const video = document.getElementById(videoId);
    if (!browser || !trigger || !video) return;

    const homeParent = browser.parentNode;
    const homeNextSibling = browser.nextSibling;

    trigger.addEventListener('mouseenter', () => {
      if (videoLightbox.classList.contains('open')) return;
      video.play().catch(() => {});
    });
    trigger.addEventListener('mouseleave', () => {
      if (videoLightbox.classList.contains('open')) return;
      video.pause();
      video.currentTime = 0;
    });

    trigger.addEventListener('click', () => {
      videoLightbox.insertBefore(browser, videoLightboxCta);
      video.controls = true;
      video.muted = false;
      if (videoLightboxCta) {
        videoLightboxCta.innerHTML = '';
        (links || []).forEach(({ href, label }) => {
          const a = document.createElement('a');
          a.href = href;
          a.textContent = label;
          if (/^https?:\/\//.test(href)) {
            a.target = '_blank';
            a.rel = 'noopener';
          }
          videoLightboxCta.appendChild(a);
        });
      }
      videoLightbox.classList.add('open');
      videoLightboxBackdrop.classList.add('open');
      video.play().catch(() => {});
      activePreview = { browser, video, homeParent, homeNextSibling };
    });
  });

  videoLightboxBackdrop.addEventListener('click', closeVideoLightbox);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && videoLightbox.classList.contains('open')) closeVideoLightbox();
  });
}

// Project preview lightbox — Izakaya, Timeline, PawLand cards.
// Click a card to open it centered with image, description, and links;
// click the backdrop, the close button, or Escape to dismiss.
const projectLightbox = document.getElementById('projectLightbox');
const projectLightboxBackdrop = document.getElementById('projectLightboxBackdrop');
const projectLightboxClose = document.getElementById('projectLightboxClose');
const projectTriggers = document.querySelectorAll('.more-work-preview-trigger');
if (projectLightbox && projectLightboxBackdrop && projectLightboxClose && projectTriggers.length) {
  const lbImg = projectLightbox.querySelector('.project-lightbox-img');
  const lbVideos = document.getElementById('projectLightboxVideos');
  const lbTitle = projectLightbox.querySelector('.project-lightbox-title');
  const lbDesc = projectLightbox.querySelector('.project-lightbox-desc');
  const lbLinks = projectLightbox.querySelector('.project-lightbox-links');
  const lbSection = document.getElementById('projectLightboxSection');

  function openProjectLightbox(trigger) {
    lbTitle.textContent = trigger.dataset.title || '';
    lbDesc.textContent = trigger.dataset.desc || '';

    lbVideos.innerHTML = '';
    const videoDefs = [1, 2]
      .map((i) => ({ src: trigger.dataset['video' + i + 'Src'], poster: trigger.dataset['video' + i + 'Poster'], label: trigger.dataset['video' + i + 'Label'] }))
      .filter((v) => v.src);

    if (videoDefs.length) {
      lbImg.style.display = 'none';
      videoDefs.forEach(({ src, poster, label }) => {
        const item = document.createElement('div');
        item.className = 'project-lightbox-video-item';
        if (label) {
          const tag = document.createElement('span');
          tag.className = 'project-lightbox-video-label';
          tag.textContent = label;
          item.appendChild(tag);
        }
        const video = document.createElement('video');
        video.src = src;
        if (poster) video.poster = poster;
        video.controls = true;
        video.playsInline = true;
        video.preload = 'metadata';
        item.appendChild(video);
        lbVideos.appendChild(item);
      });
    } else {
      lbImg.style.display = '';
      lbImg.src = trigger.dataset.img;
      lbImg.alt = trigger.dataset.title || '';
    }

    lbLinks.innerHTML = '';
    [1, 2].forEach((i) => {
      const href = trigger.dataset['link' + i + 'Href'];
      const label = trigger.dataset['link' + i + 'Label'];
      if (href && label) {
        const a = document.createElement('a');
        a.href = href;
        a.target = '_blank';
        a.rel = 'noopener';
        a.textContent = label;
        lbLinks.appendChild(a);
      }
    });

    lbSection.innerHTML = '';
    const protoLabel = trigger.dataset.protoLabel;
    const protoLinks = [1, 2]
      .map((i) => ({ href: trigger.dataset['proto' + i + 'Href'], label: trigger.dataset['proto' + i + 'Label'] }))
      .filter((p) => p.href && p.label);
    if (protoLabel && protoLinks.length) {
      const heading = document.createElement('p');
      heading.className = 'meta-label';
      heading.textContent = protoLabel;
      lbSection.appendChild(heading);
      const row = document.createElement('div');
      row.className = 'project-lightbox-links';
      protoLinks.forEach(({ href, label }) => {
        const a = document.createElement('a');
        a.href = href;
        a.target = '_blank';
        a.rel = 'noopener';
        a.textContent = label;
        row.appendChild(a);
      });
      lbSection.appendChild(row);
    }

    projectLightbox.classList.add('open');
    projectLightboxBackdrop.classList.add('open');
  }

  function closeProjectLightbox() {
    projectLightbox.classList.remove('open');
    projectLightboxBackdrop.classList.remove('open');
    lbVideos.querySelectorAll('video').forEach((v) => v.pause());
  }

  projectTriggers.forEach((trigger) => {
    trigger.addEventListener('click', () => openProjectLightbox(trigger));
  });
  projectLightboxBackdrop.addEventListener('click', closeProjectLightbox);
  projectLightboxClose.addEventListener('click', closeProjectLightbox);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && projectLightbox.classList.contains('open')) closeProjectLightbox();
  });
}
