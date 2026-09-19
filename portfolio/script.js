/* =========================================================
   0) Effet machine à écrire (rôle dans le hero)
   ========================================================= */
(function initTypewriter() {
  const el = document.getElementById('typewriter-text');
  if (!el) return;
  const text = 'IA / ML / Data Scientist en devenir';
  let i = 0;
  function type() {
    if (i <= text.length) {
      el.textContent = text.slice(0, i);
      i++;
      setTimeout(type, 55);
    }
  }
  type();
})();


/* =========================================================
   1) THREE.JS — réseau de particules animé (fond du hero)
   ========================================================= */
(function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const hero = document.querySelector('.hero');
  let width = hero.clientWidth;
  let height = hero.clientHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
  camera.position.z = 60;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const accentColor = hero.classList.contains('hero-blue')
    ? '#FFFFFF'
    : (getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#B4791F');

  const PARTICLE_COUNT = 70;
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const velocities = [];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 100;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
    velocities.push({
      x: (Math.random() - 0.5) * 0.03,
      y: (Math.random() - 0.5) * 0.03,
      z: (Math.random() - 0.5) * 0.02
    });
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: accentColor,
    size: 1.4,
    transparent: true,
    opacity: 0.8
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  const lineMaterial = new THREE.LineBasicMaterial({
    color: accentColor,
    transparent: true,
    opacity: 0.15
  });
  const lineGeometry = new THREE.BufferGeometry();
  const lineSegments = new THREE.LineSegments(lineGeometry, lineMaterial);
  scene.add(lineSegments);

  const MAX_DIST = 22;

  function updateLines() {
    const linePositions = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      for (let j = i + 1; j < PARTICLE_COUNT; j++) {
        const dx = positions[i * 3] - positions[j * 3];
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < MAX_DIST) {
          linePositions.push(
            positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
            positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]
          );
        }
      }
    }
    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
  }

  let frame = 0;
  function animate() {
    requestAnimationFrame(animate);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3] += velocities[i].x;
      positions[i * 3 + 1] += velocities[i].y;
      positions[i * 3 + 2] += velocities[i].z;

      if (Math.abs(positions[i * 3]) > 50) velocities[i].x *= -1;
      if (Math.abs(positions[i * 3 + 1]) > 30) velocities[i].y *= -1;
      if (Math.abs(positions[i * 3 + 2]) > 20) velocities[i].z *= -1;
    }
    geometry.attributes.position.needsUpdate = true;

    if (frame % 3 === 0) updateLines();
    frame++;

    scene.rotation.y += 0.0009;
    renderer.render(scene, camera);
  }

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    animate();
  } else {
    updateLines();
    renderer.render(scene, camera);
  }

  window.addEventListener('resize', () => {
    width = hero.clientWidth;
    height = hero.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });
})();


/* =========================================================
   2) GSAP — animations d'entrée et au scroll
   ========================================================= */
(function initGsapAnimations() {
  if (typeof gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  heroTl
    .from('.hero-blue-label', { opacity: 0, y: 12, duration: 0.5 })
    .from('.hero-blue-name', { opacity: 0, y: 24, duration: 0.7 }, '-=0.25')
    .from('.hero-blue-role', { opacity: 0, duration: 0.5 }, '-=0.2')
    .from('.hero-blue-btn', { opacity: 0, y: 14, duration: 0.5 }, '-=0.2');

  // Gentle floating loop on the orbit icons
  gsap.utils.toArray('.orbit-icon').forEach((icon, i) => {
    gsap.to(icon, {
      y: '+=8',
      duration: 1.8 + i * 0.2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: i * 0.15
    });
  });

  document.querySelectorAll('.reveal').forEach((section) => {
    gsap.set(section, { y: 30 });
    gsap.to(section, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: section,
        start: 'top 82%',
        toggleActions: 'play none none none'
      }
    });
  });

  document.querySelectorAll('.tech-pills').forEach((grid) => {
    const items = grid.children;
    gsap.set(items, { opacity: 0, y: 14 });
    gsap.to(items, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      stagger: 0.05,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: grid,
        start: 'top 85%',
        toggleActions: 'play none none none'
      }
    });
  });

  gsap.utils.toArray('.timeline-item').forEach((item, i) => {
    gsap.from(item, {
      opacity: 0,
      x: -24,
      duration: 0.6,
      delay: i * 0.08,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: item,
        start: 'top 88%',
        toggleActions: 'play none none none'
      }
    });
  });
})();


/* =========================================================
   3) Navigation : lien actif selon la section visible
   ========================================================= */
const navLinks = document.querySelectorAll('nav a[href^="#"]');
const sections = document.querySelectorAll('section[id], header[id]');

if ('IntersectionObserver' in window) {
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const id = entry.target.getAttribute('id');
      const link = document.querySelector(`nav a[href="#${id}"]`);
      if (!link) return;
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(sec => navObserver.observe(sec));
}

/* =========================================================
   5) Copier l'email
   ========================================================= */
function setupCopyEmail(button, email, targetSelector) {
  if (!button) return;
  button.addEventListener('click', () => {
    navigator.clipboard.writeText(email).then(() => {
      const label = targetSelector ? button.querySelector(targetSelector) : button;
      const original = label.textContent;
      label.textContent = 'Copié !';
      setTimeout(() => { label.textContent = original; }, 1800);
    });
  });
}
setupCopyEmail(document.getElementById('copy-email-btn'), 'ton.email@exemple.com');
const copyCard = document.getElementById('copy-email-card');
if (copyCard) {
  setupCopyEmail(copyCard, copyCard.dataset.email, 'strong');
}

/* =========================================================
   6) Bouton retour en haut
   ========================================================= */
const backToTop = document.getElementById('back-to-top');
if (backToTop) {
  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('visible', window.scrollY > 500);
  });
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* =========================================================
   7) Formulaire de contact : petit retour visuel
   ========================================================= */
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', () => {
    const btn = contactForm.querySelector('button[type="submit"]');
    if (btn) {
      btn.textContent = 'Envoi...';
      btn.disabled = true;
    }
  });
}

/* =========================================================
   8) Bascule du thème clair / sombre
   ========================================================= */
(function initThemeToggle() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;
  const root = document.documentElement;
  const saved = localStorage.getItem('portfolio-theme');
  if (saved === 'dark') root.setAttribute('data-theme', 'dark');

  toggle.addEventListener('click', () => {
    const isDark = root.getAttribute('data-theme') === 'dark';
    if (isDark) {
      root.removeAttribute('data-theme');
      localStorage.setItem('portfolio-theme', 'light');
    } else {
      root.setAttribute('data-theme', 'dark');
      localStorage.setItem('portfolio-theme', 'dark');
    }
  });
})();

/* =========================================================
   9) Étoiles scintillantes + ballons flottants en fond
   ========================================================= */
(function initBgDecor() {
  const container = document.getElementById('bg-decor');
  if (!container) return;

  const STAR_COUNT = 55;
  for (let i = 0; i < STAR_COUNT; i++) {
    const star = document.createElement('div');
    star.className = 'bg-star';
    const size = 2 + Math.random() * 3;
    star.style.width = size + 'px';
    star.style.height = size + 'px';
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    star.style.animationDelay = (Math.random() * 3.5) + 's';
    star.style.animationDuration = (2.5 + Math.random() * 3) + 's';
    container.appendChild(star);
  }

  const balloonColors = ['#D9531E', '#E8794A', '#F0A868', '#2D9DA8', '#6C8CD5', '#B47CC7', '#5FB876', '#E0C158'];
  const BALLOON_COUNT = 10;
  for (let i = 0; i < BALLOON_COUNT; i++) {
    const balloon = document.createElement('div');
    balloon.className = 'bg-balloon';
    const size = 26 + Math.random() * 24;
    balloon.style.width = size + 'px';
    balloon.style.height = (size * 1.3) + 'px';
    balloon.style.left = (Math.random() * 90 + 2) + '%';
    balloon.style.color = balloonColors[i % balloonColors.length];
    balloon.style.background = balloonColors[i % balloonColors.length];
    balloon.style.opacity = (0.12 + Math.random() * 0.14).toFixed(2);
    balloon.style.animationDuration = (14 + Math.random() * 16) + 's';
    balloon.style.animationDelay = (Math.random() * -25) + 's';
    container.appendChild(balloon);
  }
})();