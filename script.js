/**
 * J1ROU // JAY'L GIMENEZ JR. — NEOBRUTALISM PORTFOLIO ENGINE
 * Interactive Features: Audio Synth, Case Study Modal, Sticker Playground,
 * Likes Engine, Canvas Export, Form Validation & Confetti, Theme Switcher.
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     1. SOUND EFFECTS SYNTHESIZER (Web Audio API)
     ========================================================================== */
  class SoundEngine {
    constructor() {
      this.audioCtx = null;
      this.enabled = localStorage.getItem('j1rou_sound_enabled') !== 'false';
      this.initContext();
    }

    initContext() {
      if (!this.audioCtx && (window.AudioContext || window.webkitAudioContext)) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContextClass();
      }
    }

    playTone(freq, type = 'square', duration = 0.08, gainVal = 0.1) {
      if (!this.enabled) return;
      try {
        if (!this.audioCtx) this.initContext();
        if (this.audioCtx.state === 'suspended') {
          this.audioCtx.resume();
        }

        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

        gain.gain.setValueAtTime(gainVal, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start();
        osc.stop(this.audioCtx.currentTime + duration);
      } catch (e) {
        // Audio fallback
      }
    }

    click() {
      this.playTone(600, 'square', 0.05, 0.08);
    }

    pop() {
      this.playTone(880, 'triangle', 0.09, 0.12);
    }

    stamp() {
      this.playTone(220, 'sawtooth', 0.12, 0.15);
    }

    success() {
      if (!this.enabled) return;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          this.playTone(freq, 'sine', 0.18, 0.15);
        }, idx * 75);
      });
    }

    toggle() {
      this.enabled = !this.enabled;
      localStorage.setItem('j1rou_sound_enabled', this.enabled);
      return this.enabled;
    }
  }

  const sounds = new SoundEngine();

  // Attach sounds to standard brutalist buttons & links
  document.querySelectorAll('.btn-brutal, .filter-btn, .like-btn, .social-btn, .theme-opt, .nav-link').forEach(elem => {
    elem.addEventListener('click', () => sounds.click());
  });

  // Sound Toggle Buttons
  const soundToggle = document.getElementById('soundToggle');
  const soundIcon = document.getElementById('soundIcon');
  const footerSoundToggle = document.getElementById('footerSoundToggle');
  const footerSoundState = document.getElementById('footerSoundState');

  function updateSoundUI(isEnabled) {
    if (soundIcon) soundIcon.textContent = isEnabled ? '🔊' : '🔇';
    if (footerSoundState) footerSoundState.innerHTML = isEnabled ? 'ON 🔊' : 'MUTED 🔇';
    const tooltip = soundToggle ? soundToggle.querySelector('.btn-tooltip') : null;
    if (tooltip) tooltip.textContent = isEnabled ? 'SOUND ON' : 'SOUND OFF';
  }

  updateSoundUI(sounds.enabled);

  if (soundToggle) {
    soundToggle.addEventListener('click', () => {
      const state = sounds.toggle();
      updateSoundUI(state);
      showToast(state ? 'Sound FX Enabled 🔊' : 'Sound FX Muted 🔇', 'info');
    });
  }

  if (footerSoundToggle) {
    footerSoundToggle.addEventListener('click', () => {
      const state = sounds.toggle();
      updateSoundUI(state);
      showToast(state ? 'Sound FX Enabled 🔊' : 'Sound FX Muted 🔇', 'info');
    });
  }

  /* ==========================================================================
     2. TOAST NOTIFICATION SYSTEM
     ========================================================================== */
  const toastContainer = document.getElementById('toastContainer');

  function showToast(message, type = 'success') {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} brutal-box`;
    
    let icon = '⚡';
    if (type === 'success') icon = '✓';
    if (type === 'info') icon = 'ℹ️';
    if (type === 'warning') icon = '⚠️';

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(120%)';
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  }

  /* ==========================================================================
     3. THEME SWITCHER & VIBE RANDOMIZER
     ========================================================================== */
  const themes = ['yellow', 'pink', 'lime', 'cyan', 'dark'];
  const themePickerBtn = document.getElementById('themePickerBtn');
  const themeMenu = document.getElementById('themeMenu');
  const themeOptions = document.querySelectorAll('.theme-opt');
  const footerThemeToggle = document.getElementById('footerThemeToggle');
  const quickVibeBtn = document.getElementById('quickVibeBtn');

  // Load saved theme
  const savedTheme = localStorage.getItem('j1rou_theme') || 'yellow';
  setTheme(savedTheme);

  function setTheme(themeName) {
    document.body.setAttribute('data-theme', themeName);
    localStorage.setItem('j1rou_theme', themeName);

    themeOptions.forEach(opt => {
      opt.classList.toggle('active', opt.getAttribute('data-set-theme') === themeName);
    });
  }

  if (themePickerBtn && themeMenu) {
    themePickerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      themeMenu.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
      if (!themePickerBtn.contains(e.target) && !themeMenu.contains(e.target)) {
        themeMenu.classList.remove('active');
      }
    });
  }

  themeOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      const theme = opt.getAttribute('data-set-theme');
      setTheme(theme);
      themeMenu.classList.remove('active');
      sounds.pop();
      showToast(`Palette switched to ${theme.toUpperCase()}! 🎨`, 'info');
    });
  });

  if (footerThemeToggle) {
    footerThemeToggle.addEventListener('click', () => {
      const current = document.body.getAttribute('data-theme') || 'yellow';
      const nextIndex = (themes.indexOf(current) + 1) % themes.length;
      const nextTheme = themes[nextIndex];
      setTheme(nextTheme);
      sounds.pop();
      showToast(`Palette: ${nextTheme.toUpperCase()}! 🎨`, 'info');
    });
  }

  if (quickVibeBtn) {
    quickVibeBtn.addEventListener('click', () => {
      const current = document.body.getAttribute('data-theme') || 'yellow';
      const available = themes.filter(t => t !== current);
      const randomTheme = available[Math.floor(Math.random() * available.length)];
      setTheme(randomTheme);
      sounds.pop();
      showToast(`Random Vibe: ${randomTheme.toUpperCase()} 🔥`, 'warning');
    });
  }

  /* ==========================================================================
     4. CUSTOM BRUTALIST CURSOR
     ========================================================================== */
  const cursorDot = document.getElementById('cursorDot');
  const cursorOutline = document.getElementById('cursorOutline');

  if (cursorDot && cursorOutline && window.matchMedia('(pointer: fine)').matches) {
    let mouseX = 0, mouseY = 0;
    let outlineX = 0, outlineY = 0;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    });

    function animateCursor() {
      outlineX += (mouseX - outlineX) * 0.15;
      outlineY += (mouseY - outlineY) * 0.15;
      cursorOutline.style.left = `${outlineX}px`;
      cursorOutline.style.top = `${outlineY}px`;
      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    const hoverables = document.querySelectorAll('a, button, input, textarea, .placed-sticker, .work-card, .swatch-item');
    hoverables.forEach(elem => {
      elem.addEventListener('mouseenter', () => cursorOutline.classList.add('cursor-hover'));
      elem.addEventListener('mouseleave', () => cursorOutline.classList.remove('cursor-hover'));
    });
  }

  /* ==========================================================================
     5. MOBILE DRAWER NAVIGATION
     ========================================================================== */
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const closeDrawerBtn = document.getElementById('closeDrawerBtn');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  if (mobileMenuBtn && mobileDrawer) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileDrawer.classList.add('open');
      mobileMenuBtn.setAttribute('aria-expanded', 'true');
      sounds.click();
    });

    if (closeDrawerBtn) {
      closeDrawerBtn.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        sounds.click();
      });
    }

    mobileNavLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ==========================================================================
     6. PORTFOLIO FILTERING & LIKES ENGINE
     ========================================================================== */
  const filterButtons = document.querySelectorAll('.filter-btn');
  const workCards = document.querySelectorAll('.work-card');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const filter = btn.getAttribute('data-filter');

      workCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category.includes(filter)) {
          card.style.display = 'flex';
          card.style.animation = 'toastSlideIn 0.3s ease';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Likes Counter Engine (LocalStorage persistent)
  const likeButtons = document.querySelectorAll('.like-btn');

  likeButtons.forEach(btn => {
    const projectId = btn.getAttribute('data-project');
    const countSpan = btn.querySelector('.like-count');
    const isLiked = localStorage.getItem(`j1rou_liked_${projectId}`) === 'true';

    let count = parseInt(countSpan.textContent, 10) || 100;
    if (isLiked) {
      btn.classList.add('liked');
      btn.querySelector('.like-heart').textContent = '❤️';
    }

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const currentLiked = btn.classList.contains('liked');

      if (!currentLiked) {
        btn.classList.add('liked');
        btn.querySelector('.like-heart').textContent = '❤️';
        count += 1;
        countSpan.textContent = count;
        localStorage.setItem(`j1rou_liked_${projectId}`, 'true');
        sounds.pop();
        showToast('Appreciation recorded! Thanks for the love 🖤', 'success');
      } else {
        btn.classList.remove('liked');
        btn.querySelector('.like-heart').textContent = '🖤';
        count -= 1;
        countSpan.textContent = count;
        localStorage.removeItem(`j1rou_liked_${projectId}`);
        sounds.click();
      }
    });
  });

  /* ==========================================================================
     7. CASE STUDY DEEP-DIVE MODAL
     ========================================================================== */
  const projectsData = {
    hyperdrive: {
      title: 'HYPERDRIVE MAGAZINE',
      tagline: 'Experimental cyber-editorial publication exploring dystopian print culture.',
      category: 'EDITORIAL / PRINT',
      image: 'assets/hyperdrive_magazine.jpg',
      client: 'Underground Press Tokyo',
      timeline: '4 Weeks',
      role: 'Lead Art Director & Layout Designer',
      tools: 'Photoshop, Illustrator, Lunacy',
      challenge: 'Underground Press wanted an unapologetic physical publication for cyberpunk culture and rave archives that felt like a tactile relic from 2099. Standard editorial templates were strictly prohibited.',
      solution: 'Crafted a custom asymmetric Swiss grid system layered with distressed photocopy grain, high-contrast monochrome spreads, and vibrant neon spot colors. Introduced custom display headline letterforms and brutalist metadata margins.',
      quote: '“Hyperdrive sold out all 3,000 physical copies within 72 hours of drop. J1rou created an editorial masterpiece.”',
      quoteAuthor: '— Kenji Sato, Editor-in-Chief',
      swatches: ['#0A0A0A', '#FFE600', '#FF2A85', '#00F0FF'],
      deliverables: [
        '120-Page Perfect Bound Magazine Dieline',
        'Custom Editorial Grid & Typography Hierarchy',
        'Limited Edition Silkscreen Poster Insert',
        'Digital PDF Distribution Package'
      ],
      displayFont: 'Syne 900 (Extra Bold)',
      bodyFont: 'Space Mono / Neue Helvetica'
    },
    aura: {
      title: 'AURA BOTANICALS',
      tagline: 'High-end sustainable skincare packaging system with organic brutalist precision.',
      category: 'PACKAGING & IDENTITY',
      image: 'assets/aura_cosmetics.jpg',
      client: 'Aura Lab Skincare',
      timeline: '5 Weeks',
      role: 'Brand & Packaging Architect',
      tools: 'Figma, Illustrator, Lunacy, Photoshop',
      challenge: 'Aura needed a luxury sustainable cosmetic line that broke away from boring neutral beige bottles. The packaging needed to feel simultaneously high-end, organic, and graphically striking on boutique retail shelves.',
      solution: 'Engineered embossed minimalist carton dielines with debossed organic geometric emblems. Paired matte earth tones with high-voltage accent ribbons and holographic foil seal stamps.',
      quote: '“Jay\'l delivered an identity that secured our placement in over 40 boutique retail stores nationwide.”',
      quoteAuthor: '— Elena Rostova, Founder',
      swatches: ['#1C1E1B', '#E3DBD2', '#00FF66', '#FF9900'],
      deliverables: [
        'Glass Bottle & Dropper Label Systems',
        'Custom Outer Box Dielines & Foil Specs',
        'Digital Packaging & Retail Collateral',
        'Complete Brand Asset Guidelines'
      ],
      displayFont: 'Cabinet Grotesk / Syne',
      bodyFont: 'Plus Jakarta Sans'
    },
    neon: {
      title: 'NEON OVERDRIVE',
      tagline: 'Comprehensive cyber brand ecosystem and streetwear apparel identity.',
      category: 'BRAND IDENTITY',
      image: 'assets/neon_branding.jpg',
      client: 'Neon Syndicate Collective',
      timeline: '6 Weeks',
      role: 'Creative Director & Brand Designer',
      tools: 'Illustrator, Photoshop, Figma',
      challenge: 'A cutting-edge nightlife and apparel brand required a modular visual ecosystem that translated effortlessly across vinyl banners, screen-printed streetwear, motion billboards, and web platforms.',
      solution: 'Created a kinetic logotype featuring customized jagged glyphs, modular acid stickers, and high-frequency color combinations. Designed tech-packs for oversized hoodies and reflective rave accessories.',
      quote: '“The visual identity J1rou developed gave us the rebellious edge our brand was desperately searching for.”',
      quoteAuthor: '— Kai Takahashi, Art Director',
      swatches: ['#000000', '#FF0055', '#00F0FF', '#FFE600'],
      deliverables: [
        'Primary Logotype, Monograms & Sub-marks',
        'Streetwear Graphic Tech-Packs (Front/Back/Sleeve)',
        'Event Billboards & Poster Graphics',
        'Comprehensive 60-Page Brand Bible'
      ],
      displayFont: 'Syne 900 / Archivo Black',
      bodyFont: 'Space Grotesk'
    },
    synapse: {
      title: 'SYNAPSE SOUND SYSTEM',
      tagline: 'Avant-garde silkscreen poster series exploring auditory frequencies.',
      category: 'POSTER ART & AUDIO',
      image: 'assets/synapse_poster.jpg',
      client: 'Sonic Lab Tokyo',
      timeline: '2 Weeks',
      role: 'Visual Poster Artist',
      tools: 'Photoshop, Illustrator',
      challenge: 'Sonic Lab needed an iconic poster series to promote their experimental electronic music lab, requiring visual representation of sound waves, distortion, and brutalist typography.',
      solution: 'Constructed multi-layered halftone frequency maps combined with extreme typographic scale contrast and Japanese Kanji accent stamps. Hand-separated layers for 3-color silkscreen printing.',
      quote: '“The prints became instant collector items. Stunning composition and sheer raw graphic power.”',
      quoteAuthor: '— DJ Synapse, Producer',
      swatches: ['#080808', '#00F0FF', '#FF2A85', '#FFFFFF'],
      deliverables: [
        'A1 & A2 Silkscreen Print Separations',
        'High-Res 300DPI Offset Files',
        'Social Media Promo Key Visuals',
        'Custom Halftone Texture Kit'
      ],
      displayFont: 'Space Grotesk Bold',
      bodyFont: 'Space Mono'
    },
    chrono: {
      title: 'CHRONO TIMELESS SOUNDS',
      tagline: 'Deluxe vinyl record sleeve, foil stamping, and gatefold merchandise design.',
      category: 'VINYL PACKAGING / MERCH',
      image: 'assets/chrono_vinyl.jpg',
      client: 'Sub-Bass Records',
      timeline: '3 Weeks',
      role: 'Album Packaging Designer',
      tools: 'Photoshop, Illustrator, Lunacy',
      challenge: 'Sub-Bass Records wanted a limited edition gatefold vinyl packaging that celebrated retro-futurism and synthwave nostalgia without falling into clichéd 80s tropes.',
      solution: 'Created a sleek chromatic foil gatefold sleeve with an embossed circular time-wheel dial. Included a 16-page visual booklet with lyric typography and studio photography.',
      quote: '“The vinyl sold out on pre-order within 2 hours. J1rou’s artwork is centerpiece worthy.”',
      quoteAuthor: '— Marcus Vance, Label Head',
      swatches: ['#0D0D11', '#FFE600', '#9D00FF', '#E0E0E0'],
      deliverables: [
        '12-Inch Gatefold Vinyl Jacket Dieline',
        'Inner Sleeve Art & Center Disc Labels',
        '16-Page Lyric & Photography Booklet',
        'Cassette Tape & Merch Package'
      ],
      displayFont: 'Syne 800',
      bodyFont: 'Space Mono'
    },
    kinetic: {
      title: 'KINETIC DIMENSIONS',
      tagline: 'Abstract surrealist key visuals, composite material textures, and spatial brand assets.',
      category: 'DIGITAL ART & KEY VISUALS',
      image: 'assets/kinetic_3d.jpg',
      client: 'Kinetic Metaverse Collective',
      timeline: '4 Weeks',
      role: 'Visual Artist & Graphic Director',
      tools: 'Photoshop, Illustrator, Lunacy, Figma',
      challenge: 'Kinetic required high-definition abstract visual environments to anchor their brand refresh and serve as hero visuals for their interactive digital platforms.',
      solution: 'Crafted intricate surreal compositions, iridescent textures, custom vector patterns, and multi-layered composite artwork using Photoshop, Lunacy, and Illustrator.',
      quote: '“Mind-blowing visuals that elevated our entire visual product to an international tier.”',
      quoteAuthor: '— Sarah Lin, Lead Designer',
      swatches: ['#060709', '#00FF66', '#00F0FF', '#FF0055'],
      deliverables: [
        '10x Ultra HD Key Visual Assets',
        'Transparent Alpha PNG Object Library',
        'Vector Pattern & Motif Library',
        'Master Composition PSD & Vector Source Files'
      ],
      displayFont: 'Syne 900',
      bodyFont: 'Plus Jakarta Sans'
    }
  };

  const caseStudyModal = document.getElementById('caseStudyModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const modalBackBtn = document.getElementById('modalBackBtn');
  const modalInquireBtn = document.getElementById('modalInquireBtn');

  function openCaseStudy(projectId) {
    const data = projectsData[projectId];
    if (!data || !caseStudyModal) return;

    document.getElementById('modalHeroImg').src = data.image;
    document.getElementById('modalHeroImg').alt = data.title;
    document.getElementById('modalCategoryBadge').textContent = data.category;
    document.getElementById('modalProjectTitle').textContent = data.title;
    document.getElementById('modalProjectTagline').textContent = data.tagline;
    document.getElementById('modalClient').textContent = data.client;
    document.getElementById('modalTimeline').textContent = data.timeline;
    document.getElementById('modalRole').textContent = data.role;
    document.getElementById('modalTools').textContent = data.tools;
    document.getElementById('modalChallengeText').textContent = data.challenge;
    document.getElementById('modalSolutionText').textContent = data.solution;
    document.getElementById('modalClientQuote').textContent = data.quote;
    document.getElementById('modalQuoteAuthor').textContent = data.quoteAuthor;
    document.getElementById('modalDisplayFont').textContent = data.displayFont;
    document.getElementById('modalBodyFont').textContent = data.bodyFont;
    document.getElementById('modalWindowTitle').textContent = `${projectId.toUpperCase()}_CASE_STUDY.RAW`;

    // Deliverables List
    const deliverablesList = document.getElementById('modalDeliverablesList');
    deliverablesList.innerHTML = '';
    data.deliverables.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      deliverablesList.appendChild(li);
    });

    // Swatches Grid
    const swatchesGrid = document.getElementById('modalSwatchesGrid');
    swatchesGrid.innerHTML = '';
    data.swatches.forEach(hex => {
      const swatch = document.createElement('div');
      swatch.className = 'swatch-item';
      swatch.style.backgroundColor = hex;
      swatch.style.color = (hex === '#FFFFFF' || hex === '#FFE600' || hex === '#00FF66' || hex === '#00F0FF' || hex === '#E3DBD2' || hex === '#E0E0E0') ? '#000' : '#FFF';
      swatch.textContent = hex;
      swatch.title = `Click to copy ${hex}`;
      swatch.addEventListener('click', () => {
        navigator.clipboard.writeText(hex);
        sounds.pop();
        showToast(`Copied ${hex} to clipboard! 🎨`, 'success');
      });
      swatchesGrid.appendChild(swatch);
    });

    caseStudyModal.showModal();
    sounds.pop();
  }

  function closeCaseStudy() {
    if (caseStudyModal) {
      caseStudyModal.close();
      sounds.click();
    }
  }

  // Trigger buttons
  document.querySelectorAll('.btn-view-case, .btn-text-action').forEach(btn => {
    btn.addEventListener('click', () => {
      const projectId = btn.getAttribute('data-project');
      openCaseStudy(projectId);
    });
  });

  if (closeModalBtn) closeModalBtn.addEventListener('click', closeCaseStudy);
  if (modalBackBtn) modalBackBtn.addEventListener('click', closeCaseStudy);

  if (caseStudyModal) {
    caseStudyModal.addEventListener('click', (e) => {
      const rect = caseStudyModal.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX && e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        closeCaseStudy();
      }
    });
  }

  if (modalInquireBtn) {
    modalInquireBtn.addEventListener('click', () => {
      closeCaseStudy();
    });
  }

  /* ==========================================================================
     8. INTERACTIVE STICKER PLAYGROUND ENGINE
     ========================================================================== */
  const stickerBoard = document.getElementById('stickerBoard');
  const stampButtons = document.querySelectorAll('.stamp-btn');
  const canvasColorButtons = document.querySelectorAll('.btn-canvas-color');
  const clearCanvasBtn = document.getElementById('clearCanvasBtn');
  const exportCanvasBtn = document.getElementById('exportCanvasBtn');
  const dropVibeBtn = document.getElementById('dropVibeBtn');

  const stickerTemplates = {
    approved: { class: 'chip-approved', text: '★ APPROVED 2026' },
    raw: { class: 'chip-raw', text: '100% UNFILTERED' },
    riot: { class: 'chip-riot', text: 'DESIGN RIOT ⚡' },
    warning: { class: 'chip-warning', text: '⚠️ HIGH VOLTAGE' },
    j1rou: { class: 'chip-j1rou', text: 'J1ROU_STUDIO' },
    smiley: { class: 'chip-smiley', text: '😎 ACID SMILE' },
    star: { class: 'chip-star', text: '✦ BRUTAL STAR' },
    barcode: { class: 'chip-barcode', text: '||| |||| || ||| 9901' }
  };

  function initStickerDraggable(sticker) {
    let isDragging = false;
    let startX = 0, startY = 0;
    let initialLeft = 0, initialTop = 0;

    const removeBtn = sticker.querySelector('.remove-sticker-btn');
    if (removeBtn) {
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        sticker.remove();
        sounds.click();
        showToast('Sticker removed 🧹', 'info');
      });
    }

    sticker.addEventListener('mousedown', (e) => {
      if (e.target.classList.contains('remove-sticker-btn')) return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      initialLeft = sticker.offsetLeft;
      initialTop = sticker.offsetTop;
      sticker.style.zIndex = '100';
      sounds.click();
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      sticker.style.left = `${initialLeft + dx}px`;
      sticker.style.top = `${initialTop + dy}px`;
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        sticker.style.zIndex = '20';
      }
    });

    // Mobile touch support
    sticker.addEventListener('touchstart', (e) => {
      if (e.target.classList.contains('remove-sticker-btn')) return;
      isDragging = true;
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      initialLeft = sticker.offsetLeft;
      initialTop = sticker.offsetTop;
      sticker.style.zIndex = '100';
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      sticker.style.left = `${initialLeft + dx}px`;
      sticker.style.top = `${initialTop + dy}px`;
    }, { passive: true });

    window.addEventListener('touchend', () => {
      if (isDragging) {
        isDragging = false;
        sticker.style.zIndex = '20';
      }
    });
  }

  // Initialize existing stickers
  document.querySelectorAll('.placed-sticker').forEach(initStickerDraggable);

  // Stamping new stickers
  function stampSticker(type) {
    if (!stickerBoard) return;
    const template = stickerTemplates[type] || stickerTemplates.approved;
    const sticker = document.createElement('div');
    sticker.className = 'placed-sticker';

    const randX = Math.floor(Math.random() * (stickerBoard.clientWidth - 160)) + 20;
    const randY = Math.floor(Math.random() * (stickerBoard.clientHeight - 80)) + 20;
    const randDeg = (Math.random() * 24 - 12).toFixed(1);

    sticker.style.left = `${Math.max(10, randX)}px`;
    sticker.style.top = `${Math.max(10, randY)}px`;
    sticker.style.transform = `rotate(${randDeg}deg)`;

    sticker.innerHTML = `
      <div class="sticker-chip ${template.class}">${template.text}</div>
      <button class="remove-sticker-btn" title="Remove">✕</button>
    `;

    stickerBoard.appendChild(sticker);
    initStickerDraggable(sticker);
    sounds.stamp();
    showToast(`Stamped ${template.text}! 💥`, 'success');
  }

  stampButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-sticker-type');
      stampSticker(type);
    });
  });

  if (dropVibeBtn) {
    dropVibeBtn.addEventListener('click', () => {
      const keys = Object.keys(stickerTemplates);
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      stampSticker(randomKey);
      
      // Smooth scroll to playground
      const playground = document.getElementById('playground');
      if (playground) {
        playground.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // Canvas Backdrop Color
  canvasColorButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      canvasColorButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const bg = btn.getAttribute('data-canvas-bg');
      if (stickerBoard) {
        stickerBoard.setAttribute('data-bg', bg);
        sounds.click();
      }
    });
  });

  // Clear Board
  if (clearCanvasBtn && stickerBoard) {
    clearCanvasBtn.addEventListener('click', () => {
      stickerBoard.querySelectorAll('.placed-sticker').forEach(st => st.remove());
      sounds.pop();
      showToast('Canvas cleared! Start fresh. 🧹', 'info');
    });
  }

  // Export Poster PNG (HTML5 Canvas Engine)
  if (exportCanvasBtn && stickerBoard) {
    exportCanvasBtn.addEventListener('click', () => {
      sounds.success();
      showToast('Generating high-res PNG export... 💾', 'info');

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const width = 1200;
      const height = 800;

      canvas.width = width;
      canvas.height = height;

      // Draw background color
      const currentBg = stickerBoard.getAttribute('data-bg') || 'yellow';
      let bgColor = '#FFE600';
      if (currentBg === 'pink') bgColor = '#FF2A85';
      if (currentBg === 'lime') bgColor = '#00FF66';
      if (currentBg === 'cyan') bgColor = '#00F0FF';
      if (currentBg === 'dark') bgColor = '#121212';
      if (currentBg === 'grid') bgColor = '#FFFFFF';

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);

      // Draw Brutalist Border
      ctx.lineWidth = 14;
      ctx.strokeStyle = currentBg === 'dark' ? '#FFFFFF' : '#000000';
      ctx.strokeRect(7, 7, width - 14, height - 14);

      // Draw Watermark
      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = currentBg === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
      ctx.font = '900 180px Syne, sans-serif';
      ctx.fillText('J1ROU', width / 2, height / 2 + 50);
      ctx.font = '700 24px "Space Mono", monospace';
      ctx.fillText('JAY\'L GIMENEZ JR. // GRAPHIC DESIGN POSTER', width / 2, height / 2 + 110);
      ctx.restore();

      // Render stickers onto canvas
      const stickers = stickerBoard.querySelectorAll('.placed-sticker');
      const boardWidth = stickerBoard.clientWidth;
      const boardHeight = stickerBoard.clientHeight;

      stickers.forEach(st => {
        const textElem = st.querySelector('.sticker-chip');
        if (!textElem) return;

        const leftPct = st.offsetLeft / boardWidth;
        const topPct = st.offsetTop / boardHeight;
        const x = leftPct * width;
        const y = topPct * height;

        ctx.save();
        ctx.translate(x + 80, y + 25);
        ctx.rotate(-4 * Math.PI / 180);

        // Chip box
        ctx.fillStyle = '#000000';
        ctx.fillRect(-70, -20, 160, 44);
        ctx.fillStyle = '#FFE600';
        ctx.fillRect(-74, -24, 160, 44);
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#000000';
        ctx.strokeRect(-74, -24, 160, 44);

        // Chip text
        ctx.fillStyle = '#000000';
        ctx.font = '700 16px "Space Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(textElem.textContent.trim(), 6, -2);

        ctx.restore();
      });

      // Trigger Download
      const link = document.createElement('a');
      link.download = `J1ROU_POSTER_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      showToast('Poster downloaded successfully! 🚀', 'success');
    });
  }

  /* ==========================================================================
     9. INQUIRY FORM & CONFETTI CELEBRATION
     ========================================================================== */
  const inquiryForm = document.getElementById('inquiryForm');
  const servicePills = document.querySelectorAll('.scope-pill');
  const budgetSlider = document.getElementById('budgetSlider');
  const budgetDisplay = document.getElementById('budgetDisplay');
  const formSuccessState = document.getElementById('formSuccessState');
  const resetFormBtn = document.getElementById('resetFormBtn');

  // Budget slider label updater
  const budgetLabels = [
    '< $1,000 (Quick Sprint)',
    '$1,000 – $2,500 (Standard)',
    '$2,500 – $5,000 (Comprehensive)',
    '$5,000 – $10,000 (Full Identity)',
    '$10,000+ (Art Direction & Systems)'
  ];

  if (budgetSlider && budgetDisplay) {
    budgetSlider.addEventListener('input', (e) => {
      const idx = parseInt(e.target.value, 10) - 1;
      budgetDisplay.textContent = budgetLabels[idx] || '$2,500 – $5,000';
      sounds.click();
    });
  }

  // Service Multi-Select Pills
  servicePills.forEach(pill => {
    pill.addEventListener('click', () => {
      pill.classList.toggle('active');
      sounds.click();
    });
  });

  // Connect Service CTA Buttons from Services Section
  document.querySelectorAll('.btn-service-cta').forEach(btn => {
    btn.addEventListener('click', () => {
      const serviceName = btn.getAttribute('data-service');
      servicePills.forEach(pill => {
        if (pill.getAttribute('data-value').includes(serviceName) || serviceName.includes(pill.getAttribute('data-value'))) {
          pill.classList.add('active');
        }
      });
    });
  });

  // Form Submit Handler
  if (inquiryForm) {
    inquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('userName');
      const emailInput = document.getElementById('userEmail');
      const messageInput = document.getElementById('userMessage');

      const nameError = document.getElementById('nameError');
      const emailError = document.getElementById('emailError');
      const messageError = document.getElementById('messageError');

      let isValid = true;

      // Validation
      if (!nameInput.value.trim()) {
        nameError.textContent = 'Please enter your name or brand.';
        nameInput.focus();
        isValid = false;
      } else {
        nameError.textContent = '';
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
        emailError.textContent = 'Please provide a valid email address.';
        if (isValid) emailInput.focus();
        isValid = false;
      } else {
        emailError.textContent = '';
      }

      if (!messageInput.value.trim() || messageInput.value.trim().length < 10) {
        messageError.textContent = 'Please write a brief summary of your project (min 10 chars).';
        if (isValid) messageInput.focus();
        isValid = false;
      } else {
        messageError.textContent = '';
      }

      if (!isValid) {
        sounds.playTone(180, 'sawtooth', 0.15, 0.2);
        showToast('Please fix the highlighted form errors ⚠️', 'warning');
        return;
      }

      // Gather project inquiry details
      const selectedServices = [];
      servicePills.forEach(pill => {
        if (pill.classList.contains('active')) {
          selectedServices.push(pill.getAttribute('data-value') || pill.textContent.trim());
        }
      });
      const selectedBudget = budgetDisplay ? budgetDisplay.textContent.trim() : 'Standard';

      const subject = `[Project Inquiry] ${nameInput.value.trim()}`;
      const body = 
`Hi Jay'l (J1rou),

I would like to discuss a design project with you:

• Name / Brand: ${nameInput.value.trim()}
• Client Email: ${emailInput.value.trim()}
• Project Scope: ${selectedServices.length ? selectedServices.join(', ') : 'General Design & Creative Direction'}
• Estimated Budget: ${selectedBudget}

Project Details:
${messageInput.value.trim()}

Best regards,
${nameInput.value.trim()}`;

      const mailtoUrl = `mailto:jazztice13jay@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      // Update direct mailto button in success state
      const directMailtoBtn = document.getElementById('directMailtoBtn');
      if (directMailtoBtn) {
        directMailtoBtn.href = mailtoUrl;
      }

      // Success sequence
      inquiryForm.style.display = 'none';
      if (formSuccessState) formSuccessState.style.display = 'block';

      sounds.success();
      fireConfetti();
      showToast('Project brief formatted for jazztice13jay@gmail.com! 🚀', 'success');

      // Launch email client
      setTimeout(() => {
        window.location.href = mailtoUrl;
      }, 500);
    });
  }

  if (resetFormBtn && inquiryForm && formSuccessState) {
    resetFormBtn.addEventListener('click', () => {
      inquiryForm.reset();
      inquiryForm.style.display = 'flex';
      formSuccessState.style.display = 'none';
      sounds.click();
    });
  }

  // Confetti Burst Simulator
  function fireConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = [];
    const colors = ['#FFE600', '#FF2A85', '#00FF66', '#00F0FF', '#9D00FF', '#000000'];

    for (let i = 0; i < 120; i++) {
      pieces.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 18,
        vy: (Math.random() - 0.8) * 20,
        size: Math.random() * 12 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vr: (Math.random() - 0.5) * 12
      });
    }

    let frames = 0;
    function renderConfetti() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.4; // gravity
        p.rotation += p.vr;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation * Math.PI / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      frames++;
      if (frames < 140) {
        requestAnimationFrame(renderConfetti);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    renderConfetti();
  }

  /* ==========================================================================
     10. DIRECT ACTIONS (Copy Email, Book Call, Resume Deck)
     ========================================================================== */
  const copyEmailBtn = document.getElementById('copyEmailBtn');
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', () => {
      const email = copyEmailBtn.getAttribute('data-email') || 'jazztice13jay@gmail.com';
      navigator.clipboard.writeText(email).then(() => {
        sounds.pop();
        showToast(`Email copied: ${email} 📋`, 'success');
      });
    });
  }

  const bookCallBtn = document.getElementById('bookCallBtn');
  if (bookCallBtn) {
    bookCallBtn.addEventListener('click', () => {
      sounds.pop();
      showToast('Opening discovery call calendar link... ⚡', 'info');
      setTimeout(() => {
        window.open('https://cal.com', '_blank');
      }, 400);
    });
  }

  const downloadDeckBtn = document.getElementById('downloadDeckBtn');
  if (downloadDeckBtn) {
    downloadDeckBtn.addEventListener('click', () => {
      sounds.success();
      showToast('Portfolio deck download initiated (PDF) 📄', 'success');
    });
  }

  /* ==========================================================================
     11. MANILA TIMEZONE CLOCK
     ========================================================================== */
  const manilaClock = document.getElementById('manilaClock');
  function updateManilaTime() {
    if (!manilaClock) return;
    try {
      const options = {
        timeZone: 'Asia/Manila',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      };
      const formatter = new Intl.DateTimeFormat([], options);
      manilaClock.textContent = formatter.format(new Date());
    } catch (e) {
      // Fallback
      manilaClock.textContent = new Date().toLocaleTimeString();
    }
  }
  updateManilaTime();
  setInterval(updateManilaTime, 1000);

  /* ==========================================================================
     12. BACK TO TOP LAUNCHER
     ========================================================================== */
  const backToTopBtn = document.getElementById('backToTopBtn');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      sounds.pop();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  console.log('%c J1ROU // JAY\'L GIMENEZ JR. %c NEOBRUTALISM PORTFOLIO ENGINE LOADED ', 'background: #FFE600; color: #000; font-weight: bold; font-size: 14px; padding: 4px;', 'background: #000; color: #FFF; font-size: 14px; padding: 4px;');

});
