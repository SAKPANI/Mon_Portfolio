// ---------- Injection des données de profil ----------
function renderProfile() {
  document.title = `${PROFILE.name} — ${PROFILE.role}`;

  document.getElementById("navbar").innerHTML = `
    <div class="navbar__brand">${PROFILE.name}</div>
    <ul class="navbar__links" id="navLinks">
      <li><a href="#home" class="is-active">Accueil</a></li>
      <li><a href="#about">À propos</a></li>
      <li><a href="#journey">Parcours</a></li>
      <li><a href="#projects">Projets</a></li>
      <li><a href="#skills">Compétences</a></li>
      <li><a href="#education">Formation</a></li>
      <li><a href="#contact">Contact</a></li>
    </ul>
    <button class="navbar__toggle" id="navToggle" aria-label="Ouvrir le menu">
      <span></span><span></span><span></span>
    </button>
  `;

  document.getElementById("home").innerHTML = `
    <div class="hero">
      <canvas class="hero__canvas" id="heroCanvas"></canvas>
      <div class="hero__content">
        <div class="hero__eyebrow">Portfolio</div>
        <h1 class="hero__name">${PROFILE.name}</h1>
        <p class="hero__role">${PROFILE.role}</p>
        <p class="hero__tagline">${PROFILE.tagline}</p>
        <div class="hero__actions">
          <a href="#projects" class="btn btn--primary">Voir les projets</a>
          <a href="${PROFILE.github}" target="_blank" rel="noopener" class="btn btn--ghost">GitHub</a>
        </div>
      </div>
    </div>
  `;

  document.getElementById("about").innerHTML = `
    <div class="section-heading">
      <div class="section-heading__label">À propos</div>
      <h2>Du code à l'intelligence artificielle</h2>
    </div>
    <div class="about__grid">
      <div class="about__text">
        ${PROFILE.about.map(p => `<p>${p}</p>`).join("")}
      </div>
      <div class="card">
        <p style="color: var(--text)"><strong>${PROFILE.school}</strong></p>
        <p>${PROFILE.program}</p>
        <p>${PROFILE.status}</p>
      </div>
    </div>
  `;
}

// ---------- Navbar : scroll state + menu mobile + lien actif ----------
function initNavbar() {
  const navbar = document.getElementById("navbar");
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");

  window.addEventListener("scroll", () => {
    navbar.classList.toggle("is-scrolled", window.scrollY > 20);
  });

  toggle.addEventListener("click", () => {
    links.classList.toggle("is-open");
  });

  const sections = document.querySelectorAll("main > section");
  const navAnchors = links.querySelectorAll("a");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navAnchors.forEach((a) => a.classList.remove("is-active"));
          const active = links.querySelector(`a[href="#${entry.target.id}"]`);
          if (active) active.classList.add("is-active");
        }
      });
    },
    { rootMargin: "-50% 0px -50% 0px" }
  );

  sections.forEach((s) => observer.observe(s));

  navAnchors.forEach((a) =>
    a.addEventListener("click", () => links.classList.remove("is-open"))
  );
}

// ---------- Apparition progressive au scroll ----------
function initReveal() {
  const targets = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  targets.forEach((t) => observer.observe(t));
}

// ---------- Fond animé léger du hero (canvas 2D, pas de dépendance) ----------
function initHeroCanvas() {
  const canvas = document.getElementById("heroCanvas");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isSmallScreen = window.innerWidth < 700;
  if (reduceMotion) return; // fond statique, pas d'animation

  const ctx = canvas.getContext("2d");
  let width, height;
  const pointCount = isSmallScreen ? 25 : 55;
  let points = [];

  function resize() {
    width = canvas.width = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
  }

  function createPoints() {
    points = Array.from({ length: pointCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "rgba(79, 209, 255, 0.5)";

    points.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.strokeStyle = "rgba(167, 139, 250, 0.15)";
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const dx = points[i].x - points[j].x;
        const dy = points[i].y - points[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(points[i].x, points[i].y);
          ctx.lineTo(points[j].x, points[j].y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  resize();
  createPoints();
  draw();

  window.addEventListener("resize", () => {
    resize();
    createPoints();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderProfile();
  initNavbar();
  initReveal();
  initHeroCanvas();
});
