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

  const accentColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--accent').trim() || '#B4791F';

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
    .from('.hero-badge', { opacity: 0, y: 12, duration: 0.5 })
    .from('.hero-title', { opacity: 0, y: 24, duration: 0.7 }, '-=0.25')
    .from('.hero-bio', { opacity: 0, y: 16, duration: 0.6 }, '-=0.35')
    .from('.hero-actions-row .btn', { opacity: 0, y: 14, duration: 0.5, stagger: 0.1 }, '-=0.3')
    .from('.profile-card', { opacity: 0, y: 20, duration: 0.7 }, '-=0.5');

  // Photo + orbit icons animate in when the profile card reveals
  gsap.from('.profile-card-photo', {
    opacity: 0, scale: 0.9, duration: 0.7, ease: 'power2.out'
  });

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

  document.querySelectorAll('.skills-grid, .tools-grid').forEach((grid) => {
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
const copyEmailBtn = document.getElementById('copy-email-btn');
if (copyEmailBtn) {
  copyEmailBtn.addEventListener('click', () => {
    navigator.clipboard.writeText('ton.email@exemple.com').then(() => {
      const original = copyEmailBtn.textContent;
      copyEmailBtn.textContent = 'Email copié !';
      setTimeout(() => { copyEmailBtn.textContent = original; }, 2000);
    });
  });
}

/* =========================================================
   6) Formulaire de contact : petit retour visuel
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