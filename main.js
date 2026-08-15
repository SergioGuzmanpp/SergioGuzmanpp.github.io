(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasFinePointer = window.matchMedia('(pointer: fine)').matches;

  /* ---------- Año en el footer ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Menú responsive ---------- */
  var toggle = document.getElementById('navToggle');
  var navEl = document.querySelector('.navbar__inner nav');

  if (toggle && navEl) {
    toggle.addEventListener('click', function () {
      var isOpen = navEl.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
    navEl.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navEl.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Enlace activo según la sección visible ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll('.navlink'));
  var sections = links
    .map(function (link) { return document.getElementById(link.getAttribute('href').replace('#', '')); })
    .filter(Boolean);

  function setActiveLink(id) {
    links.forEach(function (link) {
      link.classList.toggle('is-active', link.getAttribute('href') === '#' + id);
    });
  }

  if ('IntersectionObserver' in window && sections.length) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActiveLink(entry.target.id);
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach(function (section) { navObserver.observe(section); });
  }

  /* ---------- Animación de aparición al hacer scroll ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Efecto de escritura en el hero ---------- */
  var typedEl = document.getElementById('typedLine');
  var phrases = [
    'Aprendiendo a construir con código, un proyecto a la vez.',
    'Convirtiendo curiosidad en habilidades reales.',
    'Cada error es parte del aprendizaje.'
  ];

  function typeLoop() {
    if (!typedEl) return;
    if (prefersReducedMotion) { typedEl.textContent = phrases[0]; return; }

    var phraseIndex = 0, charIndex = 0, deleting = false;
    function tick() {
      var current = phrases[phraseIndex];
      if (!deleting) {
        charIndex++;
        typedEl.textContent = current.slice(0, charIndex);
        if (charIndex === current.length) { deleting = true; return setTimeout(tick, 1800); }
      } else {
        charIndex--;
        typedEl.textContent = current.slice(0, charIndex);
        if (charIndex === 0) { deleting = false; phraseIndex = (phraseIndex + 1) % phrases.length; }
      }
      setTimeout(tick, deleting ? 28 : 42);
    }
    tick();
  }
  typeLoop();

  /* ---------- Cursor personalizado ---------- */
  var cursorDot = document.getElementById('cursorDot');
  if (cursorDot && hasFinePointer && !prefersReducedMotion) {
    cursorDot.classList.add('is-active');
    window.addEventListener('mousemove', function (e) {
      cursorDot.style.left = e.clientX + 'px';
      cursorDot.style.top = e.clientY + 'px';
    });
    document.querySelectorAll('[data-cursor="hover"]').forEach(function (el) {
      el.addEventListener('mouseenter', function () { cursorDot.classList.add('is-hover'); });
      el.addEventListener('mouseleave', function () { cursorDot.classList.remove('is-hover'); });
    });
  }

  /* ---------- Tilt 3D en tarjetas ---------- */
  if (hasFinePointer && !prefersReducedMotion) {
    document.querySelectorAll('.tilt').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = 'perspective(700px) rotateY(' + (x * 6) + 'deg) rotateX(' + (y * -6) + 'deg) translateY(-4px)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
      });
    });
  }

  /* ---------- Ripple en botones ---------- */
  document.querySelectorAll('.btn').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      if (btn.hasAttribute('disabled')) return;
      var rect = btn.getBoundingClientRect();
      var span = document.createElement('span');
      var size = Math.max(rect.width, rect.height);
      span.className = 'ripple';
      span.style.width = span.style.height = size + 'px';
      span.style.left = (e.clientX - rect.left - size / 2) + 'px';
      span.style.top = (e.clientY - rect.top - size / 2) + 'px';
      btn.appendChild(span);
      setTimeout(function () { span.remove(); }, 650);
    });
  });

  /* ---------- Contadores animados ---------- */
  var statNums = document.querySelectorAll('.stats__num');
  if (statNums.length) {
    var animateCount = function (el) {
      var target = parseInt(el.getAttribute('data-count'), 10) || 0;
      if (prefersReducedMotion) { el.textContent = target; return; }
      var start = 0;
      var duration = 1100;
      var startTime = null;
      function step(ts) {
        if (!startTime) startTime = ts;
        var progress = Math.min((ts - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(start + (target - start) * eased);
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target;
      }
      requestAnimationFrame(step);
    };

    if ('IntersectionObserver' in window) {
      var statsObserver = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      statNums.forEach(function (el) { statsObserver.observe(el); });
    } else {
      statNums.forEach(animateCount);
    }
  }

  /* ---------- Acordeón FAQ ---------- */
  document.querySelectorAll('.faq-item__q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      document.querySelectorAll('.faq-item__q').forEach(function (other) {
        if (other !== btn) other.setAttribute('aria-expanded', 'false');
      });
      btn.setAttribute('aria-expanded', String(!expanded));
    });
  });

  /* ---------- Copiar al portapapeles ---------- */
  var toast = document.getElementById('toast');
  var toastTimer;
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('is-visible'); }, 2200);
  }

  document.querySelectorAll('.copy-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var value = btn.getAttribute('data-copy');
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(function () {
          showToast('Copiado: ' + value);
        }).catch(function () {
          showToast('No se pudo copiar');
        });
      } else {
        showToast(value);
      }
    });
  });

})();
