/* ═══════════════════════════════════════════════
   ui.js — Premium UI Enhancements
   (Loading screen, sparkle trail, confetti,
    background particles, button ripple)
   All original functionality fully preserved.
═══════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ──────────────────────────────
     1. LOADING SCREEN DISMISS
  ────────────────────────────── */
  var loadingScreen = document.getElementById('loadingScreen');

  // Dismiss after 2.8s (matches loader-bar animation)
  setTimeout(function () {
    if (loadingScreen) {
      loadingScreen.classList.add('fade-out');
      // Remove from DOM after transition ends
      loadingScreen.addEventListener('transitionend', function () {
        loadingScreen.remove();
      }, { once: true });
    }
  }, 2800);


  /* ──────────────────────────────
     2. SPARKLE CURSOR TRAIL
  ────────────────────────────── */
  var sparkleContainer = document.getElementById('cursor-sparkles');
  var sparkleColors = [
    '#f5c842', '#e91e8c', '#9b59b6', '#fff', '#ff6b9d', '#00ffcc', '#1e7fff'
  ];
  var sparkleShapes = ['★', '✦', '•', '◆', '✿', '❋'];
  var lastSparkle = 0;

  function createSparkle(x, y) {
    var el = document.createElement('span');
    el.classList.add('sparkle-dot');
    var size   = Math.random() * 10 + 6;
    var color  = sparkleColors[Math.floor(Math.random() * sparkleColors.length)];
    var shape  = sparkleShapes[Math.floor(Math.random() * sparkleShapes.length)];
    var dx     = (Math.random() - 0.5) * 24;
    var dy     = (Math.random() - 0.5) * 24;

    el.textContent = shape;
    el.style.cssText = [
      'left:'       + (x + dx - size / 2) + 'px',
      'top:'        + (y + dy - size / 2) + 'px',
      'font-size:'  + size + 'px',
      'color:'      + color,
      'text-shadow: 0 0 6px ' + color,
      'width:'      + size + 'px',
      'height:'     + size + 'px',
      'line-height:' + size + 'px',
      'text-align: center'
    ].join(';');

    sparkleContainer.appendChild(el);

    // Remove after animation
    setTimeout(function () { el.remove(); }, 700);
  }

  document.addEventListener('mousemove', function (e) {
    var now = Date.now();
    if (now - lastSparkle < 40) return; // throttle ~25fps
    lastSparkle = now;
    createSparkle(e.clientX, e.clientY);
  });

  // Touch support for mobile sparkles
  document.addEventListener('touchmove', function (e) {
    var now = Date.now();
    if (now - lastSparkle < 60) return;
    lastSparkle = now;
    var t = e.touches[0];
    createSparkle(t.clientX, t.clientY);
  }, { passive: true });


  /* ──────────────────────────────
     3. ANIMATED STAR PARTICLES (background)
  ────────────────────────────── */
  var particlesBg = document.getElementById('particles-bg');

  function createStarParticle() {
    var el = document.createElement('div');
    var size = Math.random() * 3 + 1;
    var x    = Math.random() * 100;
    var y    = Math.random() * 100;
    var dur  = Math.random() * 4 + 2;
    var del  = Math.random() * 5;

    el.style.cssText = [
      'position:absolute',
      'border-radius:50%',
      'left:' + x + '%',
      'top:'  + y + '%',
      'width:'  + size + 'px',
      'height:' + size + 'px',
      'background:' + (Math.random() < 0.5 ? '#fff' : (Math.random() < 0.5 ? '#f5c842' : '#e91e8c')),
      'opacity:' + (Math.random() * 0.6 + 0.2),
      'animation: twinkle ' + dur + 's ease-in-out ' + del + 's infinite',
      'box-shadow: 0 0 ' + (size * 2) + 'px currentColor'
    ].join(';');

    particlesBg.appendChild(el);
  }

  // Generate 60 star particles
  for (var s = 0; s < 60; s++) {
    createStarParticle();
  }

  // Inject twinkle keyframe if not already in page CSS
  var styleTag = document.createElement('style');
  styleTag.textContent = '@keyframes twinkle{0%,100%{opacity:.2;transform:scale(.8)}50%{opacity:1;transform:scale(1.2)}}';
  document.head.appendChild(styleTag);


  /* ──────────────────────────────
     4. PREMIUM CONFETTI TRIGGER
  ────────────────────────────── */
  window.triggerConfetti = function () {
    // Burst 1: colour spray
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#9b59b6', '#e91e8c', '#f5c842', '#fff', '#ff6b9d', '#00ffcc'],
      scalar: 1.1
    });

    // Burst 2: side cannons
    setTimeout(function () {
      confetti({ particleCount: 60, angle: 60,  spread: 55, origin: { x: 0, y: 0.6 } });
      confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1, y: 0.6 } });
    }, 200);

    // Burst 3: stars
    setTimeout(function () {
      confetti({
        particleCount: 50,
        spread: 360,
        startVelocity: 30,
        shapes: ['star'],
        colors: ['#f5c842', '#fff'],
        origin: { y: 0.4 }
      });
    }, 500);
  };


  /* ──────────────────────────────
     5. CTA BUTTON — RIPPLE EFFECT
  ────────────────────────────── */
  var ctaBtn = document.getElementById('ctaBtn');

  if (ctaBtn) {
    ctaBtn.addEventListener('click', function (e) {
      var ripple = ctaBtn.querySelector('.btn-ripple');
      if (!ripple) return;

      var rect = ctaBtn.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height);
      var x    = e.clientX - rect.left - size / 2;
      var y    = e.clientY - rect.top  - size / 2;

      ripple.style.cssText = [
        'width:'  + size + 'px',
        'height:' + size + 'px',
        'left:'   + x   + 'px',
        'top:'    + y   + 'px'
      ].join(';');

      ripple.classList.remove('ripple-active');
      // Force reflow
      void ripple.offsetWidth;
      ripple.classList.add('ripple-active');
    });
  }


  /* ──────────────────────────────
     6. MUSIC BUTTON — icon swap on play/pause
     (Adds/removes fa-music / fa-pause icon)
  ────────────────────────────── */
  var musicControlEl = document.getElementById('musicControl');
  var musicAudio     = document.getElementById('bgMusic');

  if (musicControlEl && musicAudio) {
    // Watch for paused state changes
    musicAudio.addEventListener('play', function () {
      musicControlEl.classList.remove('paused');
      var icon = musicControlEl.querySelector('.music-icon');
      if (icon) {
        icon.classList.remove('fa-pause');
        icon.classList.add('fa-music');
      }
    });

    musicAudio.addEventListener('pause', function () {
      musicControlEl.classList.add('paused');
      var icon = musicControlEl.querySelector('.music-icon');
      if (icon) {
        icon.classList.remove('fa-music');
        icon.classList.add('fa-pause');
      }
    });
  }


  /* ──────────────────────────────
     7. KEYBOARD SUPPORT (musicControl)
  ────────────────────────────── */
  if (musicControlEl) {
    musicControlEl.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        musicControlEl.click();
      }
    });
  }


  /* ──────────────────────────────
     8. RESPONSIVE CAROUSEL IMG SIZE
     (Update imgWidth/imgHeight on resize)
  ────────────────────────────── */
  function updateCarouselSize() {
    var vw = window.innerWidth;
    var newW = Math.min(Math.max(Math.round(vw * 0.10), 80), 140);
    var newH = Math.round(newW * 1.4);

    var spinContainer = document.getElementById('spin-container');
    if (spinContainer) {
      spinContainer.style.width  = newW + 'px';
      spinContainer.style.height = newH + 'px';
    }
  }

  window.addEventListener('resize', updateCarouselSize);
  updateCarouselSize();


  /* ──────────────────────────────
     9. PAGE ENTER ANIMATION
     Fade in the main page content
  ────────────────────────────── */
  var mainContent = document.getElementById('drag-container');
  var header      = document.getElementById('siteHeader');

  function revealMainContent() {
    [mainContent, header].forEach(function (el) {
      if (!el) return;
      el.style.opacity   = '0';
      el.style.transform = el === header
        ? 'translateY(-20px)'
        : 'scale(0.95)';
      el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';

      setTimeout(function () {
        el.style.opacity   = '1';
        el.style.transform = el === header ? 'translateY(0)' : 'scale(1)';
      }, 100);
    });
  }

  // Run reveal after loading screen fades (2.8s + 0.3s buffer)
  setTimeout(revealMainContent, 3100);

})();
