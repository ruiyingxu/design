const instagramIcon = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.8A3.95 3.95 0 0 0 3.8 7.75v8.5a3.95 3.95 0 0 0 3.95 3.95h8.5a3.95 3.95 0 0 0 3.95-3.95v-8.5a3.95 3.95 0 0 0-3.95-3.95h-8.5Zm8.93 1.35a1.12 1.12 0 1 1 0 2.24 1.12 1.12 0 0 1 0-2.24ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.8A3.2 3.2 0 1 0 12 15.2 3.2 3.2 0 0 0 12 8.8Z" fill="currentColor"/></svg>`;
const linkedinIcon = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.98 3.5a1.74 1.74 0 1 1 0 3.48 1.74 1.74 0 0 1 0-3.48ZM3.5 8.75h2.96V20.5H3.5V8.75Zm5.1 0h2.84v1.6h.04c.4-.75 1.36-1.84 2.8-1.84 2.99 0 3.54 1.97 3.54 4.53v7.46h-2.96v-6.61c0-1.58-.03-3.62-2.21-3.62-2.22 0-2.56 1.73-2.56 3.51v6.72H8.6V8.75Z" fill="currentColor"/></svg>`;

const projectImage = (project, { eager = false, sizes = "100vw" } = {}) => `
  <img
    src="${project.imageBase}-2400.webp"
    srcset="${project.imageBase}-640.webp 640w, ${project.imageBase}-1280.webp 1280w, ${project.imageBase}-2400.webp 2400w"
    sizes="${sizes}"
    width="${project.imageWidth}"
    height="${project.imageHeight}"
    alt="${project.alt}"
    loading="${eager ? "eager" : "lazy"}"
    decoding="async"${eager ? ' fetchpriority="high"' : ""}
  >`;

class ProjectCard extends HTMLElement {
  connectedCallback() {
    const project = window.PORTFOLIO_PROJECTS?.[this.getAttribute("project")];
    if (!project) {
      console.warn(`Unknown portfolio project: ${this.getAttribute("project")}`);
      return;
    }

    const variant = this.getAttribute("variant") || "more";
    const eager = this.hasAttribute("eager");
    if (variant === "home") {
      const featureClass = this.hasAttribute("feature") ? " feature" : "";
      this.innerHTML = `
        <article class="project-card${featureClass} reveal">
          <a href="${project.href}" class="project-image ${project.imageClass || ""}">
            ${projectImage(project, { sizes: this.getAttribute("sizes") || "100vw" })}
            <span class="project-arrow">↗</span>
          </a>
          <div class="project-meta">
            <div><p>${this.getAttribute("number") || ""}</p><h2>${project.title}</h2></div>
            <p>${project.homeMeta}</p>
          </div>
        </article>`;
      return;
    }

    if (variant === "listing") {
      this.innerHTML = `
        <article class="works-project-card works-project-card--compact reveal">
          <a class="works-project-link" href="${project.href}">
            <figure class="works-project-figure">${projectImage(project, { eager, sizes: "(max-width: 900px) 100vw, 33vw" })}</figure>
            <div class="works-project-footer">
              <div class="works-project-meta"><h3>${project.title}</h3><p>${project.listingMeta}</p></div>
              <span class="works-project-cta">View Project <span>→</span></span>
            </div>
          </a>
        </article>`;
      return;
    }

    if (variant === "allerpal") {
      this.innerHTML = `
        <a class="allerpal-more-card reveal" href="${project.href}">
          <figure>${projectImage(project, { sizes: "(max-width: 900px) 100vw, 50vw" })}</figure>
          <div><h3>${project.shortTitle || project.title}</h3><p>${project.moreMeta}</p></div>
        </a>`;
      return;
    }

    this.innerHTML = `
      <a class="project-detail-more-card reveal" href="${project.href}">
        <figure${project.figureClass ? ` class="${project.figureClass}"` : ""}>${projectImage(project, { sizes: "(max-width: 900px) 100vw, 33vw" })}</figure>
        <h3>${project.shortTitle || project.title}</h3>
        <p>${project.moreMeta}</p>
      </a>`;
  }
}

class ProjectRecommendations extends HTMLElement {
  connectedCallback() {
    const project = window.PORTFOLIO_PROJECTS?.[this.getAttribute("project")];
    const related = project?.related || (this.getAttribute("projects") || "").split(",").filter(Boolean);
    this.innerHTML = `
      <section class="panel">
        <div class="project-detail-more-heading reveal">
          <h2>More Projects</h2>
          <a class="project-detail-more-link" href="./product-designs.html">See all projects</a>
        </div>
        <div class="project-detail-more-grid">
          ${related.map((id) => `<project-card project="${id}" variant="more"></project-card>`).join("")}
        </div>
      </section>`;
  }
}

class SiteHeader extends HTMLElement {
  connectedCallback() {
    const isHome = document.body.dataset.page === "home";
    this.innerHTML = `
      <header class="site-header${isHome ? "" : " site-header--subpage"}">
        <a class="nav-link desktop-link" href="./about.html"><span>About</span><span aria-hidden="true">About</span></a>
        <a class="nav-link desktop-link" href="./works.html"><span>Art Works</span><span aria-hidden="true">Art Works</span></a>
        <a class="wordmark" href="${isHome ? "#top" : "./index.html"}" aria-label="Ruiying Xu home">Ruiying Xu</a>
        <a class="nav-link desktop-link" href="./product-designs.html"><span>Product Designs</span><span aria-hidden="true">Product Designs</span></a>
        <a class="nav-link desktop-link" href="./contact.html"><span>Contact</span><span aria-hidden="true">Contact</span></a>
        <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-navigation" aria-label="Open menu"><span></span><span></span></button>
      </header>
      <nav class="mobile-menu" id="mobile-navigation" aria-label="Mobile navigation">
        <a href="./about.html">About</a>
        <a href="./works.html">Art Works</a>
        <a href="./product-designs.html">Product Designs</a>
        <a href="./contact.html">Contact</a>
      </nav>`;
  }
}

class SiteFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <footer class="site-footer site-footer--subpage contact-footer">
        <a class="wordmark" href="./index.html">Ruiying Xu</a>
        <nav class="contact-footer-nav" aria-label="Footer">
          <a href="./index.html">Home</a><a href="./about.html">About</a><a href="./works.html">Art Works</a><a href="./contact.html">Contact</a>
        </nav>
        <div class="contact-footer-socials">
          <a href="https://www.instagram.com/yingingxu_/" target="_blank" rel="noreferrer" aria-label="Instagram">${instagramIcon}</a>
          <a href="https://www.linkedin.com/in/ruiyingxu22" target="_blank" rel="noreferrer" aria-label="LinkedIn">${linkedinIcon}</a>
        </div>
      </footer>`;
  }
}

customElements.define("site-header", SiteHeader);
customElements.define("site-footer", SiteFooter);
customElements.define("project-card", ProjectCard);
customElements.define("project-recommendations", ProjectRecommendations);

const menuButton = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector(".mobile-menu");
const cursor = document.querySelector(".cursor");
const cursorDot = document.querySelector(".cursor-dot");
const cursorRing = document.querySelector(".cursor-ring");
const cursorLabel = document.querySelector(".cursor-label");
const intro = document.querySelector(".intro");
const cursorGallery = document.querySelector(".cursor-gallery");
const heroSection = document.querySelector(".hero");

menuButton?.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "Open menu" : "Close menu");
  mobileMenu.classList.toggle("is-open", !isOpen);
});

mobileMenu?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open menu");
    mobileMenu.classList.remove("is-open");
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || menuButton?.getAttribute("aria-expanded") !== "true") return;
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Open menu");
  mobileMenu?.classList.remove("is-open");
  menuButton.focus();
});

const replaceProjectPanel = (markers, src, alt) => {
  const panels = [...document.querySelectorAll("main.project-detail-page > section.panel")];
  const panel = panels.find((candidate) => markers.some((marker) => candidate.textContent.includes(marker)));
  if (!panel) return;
  const base = src.replace(/-2400\.webp$/, "");
  const srcset = `${base}-640.webp 640w, ${base}-1280.webp 1280w, ${base}-2400.webp 2400w`;
  panel.classList.add("pdf-replacement-panel");
  panel.innerHTML = `<figure class="pdf-replacement-figure"><img src="${src}" srcset="${srcset}" sizes="100vw" alt="${alt}" loading="lazy" decoding="async"></figure>`;
};

const initNowAssistPage = () => {
  if (!document.body.classList.contains("now-assist-page")) return;
  const getPanels = () => [...document.querySelectorAll("main.project-detail-page > section.panel")];
  const heroPanel = getPanels().find((panel) => panel.classList.contains("project-detail-hero"));
  if (heroPanel) {
    heroPanel.classList.add("project-detail-panel-ready");
  }
};

const initDwPage = () => {
  if (!document.body.classList.contains("dw-page")) return;
  const getPanels = () => [...document.querySelectorAll("main.project-detail-page > section.panel")];
  const heroPanel = getPanels().find((panel) => panel.classList.contains("project-detail-hero"));
  if (heroPanel) {
    heroPanel.classList.add("project-detail-panel-ready");
  }
};

initNowAssistPage();
initDwPage();

const initDeferredVideos = () => {
  const videos = document.querySelectorAll("video.deferred-video");
  if (!videos.length) return;

  const loadVideo = (video) => {
    if (video.dataset.src) {
      video.src = video.dataset.src;
      video.removeAttribute("data-src");
    }
    video.querySelectorAll("source[data-src]").forEach((source) => {
      source.src = source.dataset.src;
      source.removeAttribute("data-src");
    });
    video.load();
    video.play().catch(() => {});
  };

  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      loadVideo(entry.target);
      videoObserver.unobserve(entry.target);
    });
  }, { rootMargin: "300px 0px" });

  videos.forEach((video) => videoObserver.observe(video));
};

initDeferredVideos();

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
const yearElement = document.querySelector("#year");
if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

const initBorderGlowCards = (selector) => {
  const cards = document.querySelectorAll(selector);

  const getEdgeProximity = (element, x, y) => {
    const width = element.clientWidth;
    const height = element.clientHeight;
    const centerX = width / 2;
    const centerY = height / 2;
    const dx = x - centerX;
    const dy = y - centerY;
    let kx = Infinity;
    let ky = Infinity;

    if (dx !== 0) {
      kx = centerX / Math.abs(dx);
    }

    if (dy !== 0) {
      ky = centerY / Math.abs(dy);
    }

    return Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
  };

  const getCursorAngle = (element, x, y) => {
    const centerX = element.clientWidth / 2;
    const centerY = element.clientHeight / 2;
    const dx = x - centerX;
    const dy = y - centerY;

    if (dx === 0 && dy === 0) {
      return 45;
    }

    let degrees = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    if (degrees < 0) {
      degrees += 360;
    }

    return degrees;
  };

  cards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const edge = getEdgeProximity(card, x, y);
      const angle = getCursorAngle(card, x, y);

      card.style.setProperty("--edge-proximity", `${(edge * 100).toFixed(3)}`);
      card.style.setProperty("--cursor-angle", `${angle.toFixed(3)}deg`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--edge-proximity", "0");
    });
  });
};

if (window.matchMedia("(pointer: fine)").matches) {
  initBorderGlowCards(".about-fact-card");
  initBorderGlowCards(".about-tool-pill");
  initBorderGlowCards(".contact-form-card");
}

const initProcessStickyReveal = () => {
  const layouts = document.querySelectorAll(".process-sticky-layout");

  layouts.forEach((layout) => {
    const steps = [...layout.querySelectorAll(".process-step")];
    const visuals = [...layout.querySelectorAll(".process-visual-card")];

    if (!steps.length || !visuals.length) {
      return;
    }

    const setActive = (index) => {
      steps.forEach((step, stepIndex) => {
        step.classList.toggle("is-active", stepIndex === index);
      });

      visuals.forEach((visual, visualIndex) => {
        visual.classList.toggle("is-active", visualIndex === index);
      });
    };

    setActive(0);

    if (window.matchMedia("(max-width: 900px)").matches) {
      return;
    }

    const stepObserver = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (!visibleEntries.length) {
          return;
        }

        const activeIndex = steps.indexOf(visibleEntries[0].target);
        if (activeIndex >= 0) {
          setActive(activeIndex);
        }
      },
      {
        threshold: [0.35, 0.55, 0.75],
        rootMargin: "-12% 0px -28% 0px"
      }
    );

    steps.forEach((step) => stepObserver.observe(step));
  });
};

initProcessStickyReveal();

window.addEventListener("load", () => {
  const isHomePage = document.body.dataset.page === "home";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const readyDelay = isHomePage && !reduceMotion ? 280 : 0;
  const introHideDelay = isHomePage && !reduceMotion ? 480 : 0;

  window.setTimeout(() => document.body.classList.replace("is-loading", "is-ready"), readyDelay);
  window.setTimeout(() => {
    if (intro) {
      intro.style.display = "none";
    }
  }, introHideDelay);
});

if (window.matchMedia("(pointer: fine)").matches && cursor) {
  let mouseX = -100;
  let mouseY = -100;
  let ringX = -100;
  let ringY = -100;
  let lastTrailX = -1000;
  let lastTrailY = -1000;
  let trailIndex = 0;
  let trailTicking = false;

  const parseColor = (value) => {
    if (!value || value === "transparent") {
      return null;
    }

    const rgbaMatch = value.match(/rgba?\(([^)]+)\)/i);
    if (rgbaMatch) {
      const channels = rgbaMatch[1]
        .replace(/\//g, " ")
        .replace(/,/g, " ")
        .split(/\s+/)
        .filter(Boolean)
        .map((channel, index) => {
          if (channel.endsWith("%")) {
            const percentage = Number.parseFloat(channel);
            return index < 3 ? percentage * 2.55 : percentage / 100;
          }
          return Number(channel);
        });
      if (channels.slice(0, 3).some(Number.isNaN)) {
        return null;
      }
      const alphaValue = channels[3];
      const alpha = alphaValue === undefined ? 1 : alphaValue > 1 ? alphaValue / 100 : alphaValue;
      return alpha > 0.08 ? channels.slice(0, 3) : null;
    }

    const hexMatch = value.trim().match(/^#([0-9a-f]{3,8})$/i);
    if (!hexMatch) {
      return null;
    }

    const hex = hexMatch[1];
    const expanded = hex.length <= 4 ? [...hex].map((part) => part + part).join("") : hex;
    const alpha = expanded.length === 8 ? parseInt(expanded.slice(6), 16) / 255 : 1;
    if (alpha <= 0.08) {
      return null;
    }

    return [
      parseInt(expanded.slice(0, 2), 16),
      parseInt(expanded.slice(2, 4), 16),
      parseInt(expanded.slice(4, 6), 16)
    ];
  };

  const getLuminance = ([red, green, blue]) => {
    const channel = (value) => {
      const normalized = value / 255;
      return normalized <= 0.03928
        ? normalized / 12.92
        : ((normalized + 0.055) / 1.055) ** 2.4;
    };

    return 0.2126 * channel(red) + 0.7152 * channel(green) + 0.0722 * channel(blue);
  };

  const getCursorTone = (x, y) => {
    if (x < 0 || y < 0) {
      return "dark";
    }

    const elements = document.elementsFromPoint(Math.round(x), Math.round(y));
    for (const element of elements) {
      if (element.closest(".cursor, .cursor-gallery")) {
        continue;
      }

      let current = element;
      while (current && current !== document.documentElement) {
        const computed = window.getComputedStyle(current);
        const background = parseColor(computed.backgroundColor);
        if (background) {
          return getLuminance(background) > 0.62 ? "light" : "dark";
        }

        const backgroundImage = computed.backgroundImage;
        const colors = backgroundImage && backgroundImage !== "none"
          ? [...backgroundImage.matchAll(/rgba?\([^)]*\)|#[0-9a-f]{3,8}/gi)]
            .map(([match]) => parseColor(match))
            .filter(Boolean)
          : [];
        if (colors.length) {
          const average = colors.reduce((total, color) => total + getLuminance(color), 0) / colors.length;
          return average > 0.62 ? "light" : "dark";
        }

        current = current.parentElement;
      }
    }

    return "dark";
  };

  const updateCursorTone = () => {
    cursor.classList.toggle("is-light", getCursorTone(mouseX, mouseY) === "light");
  };

  const trailSources = [
    { src: "./assets/home-gallery/home-gallery-spring-2400.webp", alt: "Spring record cover artwork" },
    { src: "./assets/home-gallery/home-gallery-harmoni-1595.webp", alt: "Harmoni vehicle mockup" },
    { src: "./assets/home-gallery/home-gallery-exhibit-2400.webp", alt: "Exhibit poster installation" },
    { src: "./assets/home-gallery/home-gallery-autumn-2400.webp", alt: "Autumn record cover artwork" },
    { src: "./assets/home-gallery/home-gallery-record-2400.webp", alt: "Record and album artwork" },
    { src: "./assets/home-gallery/home-gallery-type-poster-2400.webp", alt: "Typography poster artwork" },
    { src: "./assets/home-gallery/home-gallery-th-2400.webp", alt: "Green record cover artwork" },
    { src: "./assets/home-gallery/home-gallery-allerpal-1594.webp", alt: "AllerPal mobile interface" },
    { src: "./assets/home-gallery/home-gallery-botanical-2400.webp", alt: "Botanical typography poster" },
    { src: "./assets/home-gallery/home-gallery-forma-package-2400.webp", alt: "Forma package design" }
  ];

  const canSpawnTrail = () => {
    if (document.body.dataset.page !== "home" || !cursorGallery || trailSources.length === 0) {
      return false;
    }
    if (document.body.classList.contains("is-loading")) {
      return false;
    }
    if (!heroSection) {
      return true;
    }

    const bounds = heroSection.getBoundingClientRect();
    return mouseY >= bounds.top && mouseY <= bounds.bottom;
  };

  const spawnTrailCard = () => {
    const distance = Math.hypot(mouseX - lastTrailX, mouseY - lastTrailY);
    if (distance < 78 || !canSpawnTrail()) {
      trailTicking = false;
      return;
    }

    const source = trailSources[trailIndex % trailSources.length];
    const card = document.createElement("figure");
    const image = document.createElement("img");
    const directionX = (trailIndex % 2 === 0 ? -1 : 1) * (26 + Math.random() * 44);
    const directionY = -22 - Math.random() * 40;
    const rotation = (Math.random() * 18 - 9).toFixed(2);

    card.className = "cursor-gallery-card";
    card.style.left = `${mouseX}px`;
    card.style.top = `${mouseY}px`;
    card.style.setProperty("--offset-x", `${directionX}px`);
    card.style.setProperty("--offset-y", `${directionY}px`);
    card.style.setProperty("--rotation", `${rotation}deg`);

    image.src = source.src;
    image.alt = source.alt;
    image.loading = "eager";

    card.append(image);
    cursorGallery.append(card);

    lastTrailX = mouseX;
    lastTrailY = mouseY;
    trailIndex += 1;

    window.setTimeout(() => card.remove(), 1650);
    if (cursorGallery.childElementCount > 12) {
      cursorGallery.firstElementChild?.remove();
    }

    trailTicking = false;
  };

  const renderCursor = () => {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
    cursorLabel.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
    window.requestAnimationFrame(renderCursor);
  };

  window.addEventListener("pointermove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    cursor.classList.remove("is-hidden");
    updateCursorTone();

    if (!trailTicking) {
      trailTicking = true;
      window.requestAnimationFrame(spawnTrailCard);
    }
  });
  window.addEventListener("scroll", updateCursorTone, { passive: true });
  window.addEventListener("resize", updateCursorTone);
  document.addEventListener("pointerleave", () => cursor.classList.add("is-hidden"));
  document.addEventListener("pointerenter", () => cursor.classList.remove("is-hidden"));

  document.querySelectorAll("a, button").forEach((element) => {
    const viewTarget = element.classList.contains("project-image") || element.classList.contains("contact-title");
    element.addEventListener("pointerenter", () => {
      const isEmailTarget = element.classList.contains("contact-title");
      cursor.classList.add("is-hovering");
      cursor.classList.toggle("is-viewing", viewTarget);
      cursor.classList.toggle("is-email", isEmailTarget);
      cursorLabel.textContent = isEmailTarget ? "Email" : "View";
    });
    element.addEventListener("pointerleave", () => cursor.classList.remove("is-hovering", "is-viewing", "is-email"));
  });

  renderCursor();
}
