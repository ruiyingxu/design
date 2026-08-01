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

const normalizeCollectionEntry = (entry) => {
  if (!entry) return null;

  if (Array.isArray(entry)) {
    return { group: entry };
  }

  if (typeof entry === "string") {
    return { id: entry };
  }

  if (typeof entry === "object") {
    return entry;
  }

  return null;
};

const getProjectCollection = (collectionId) => {
  const collection = window.PORTFOLIO_COLLECTIONS?.[collectionId];
  return Array.isArray(collection) ? collection : [];
};

const buildHomeCard = (entry, number) => {
  const id = entry?.id;
  const project = window.PORTFOLIO_PROJECTS?.[id];
  if (!project) return "";
  const feature = entry?.feature ? " feature" : "";
  const eager = entry?.eager ? " eager" : "";
  const safeNumber = String(number).padStart(2, "0");
  return `<project-card project="${id}" variant="home" number="${safeNumber}"${feature}${eager}></project-card>`;
};

const buildListingCard = (entry, eager = false) => {
  const id = entry?.id;
  const project = window.PORTFOLIO_PROJECTS?.[id];
  if (!project) return "";
  return `<project-card project="${id}" variant="listing"${eager ? " eager" : ""}></project-card>`;
};

class ProjectCollection extends HTMLElement {
  connectedCallback() {
    const source = this.getAttribute("source");
    const variant = this.getAttribute("variant") || "listing";
    const entries = getProjectCollection(source);

    if (!source) {
      return;
    }

    if (!entries.length) {
      console.warn(`Unknown portfolio collection: ${source}`);
      return;
    }

    let number = 1;
    const cards = [];
    entries.forEach((rawEntry, index) => {
      const item = normalizeCollectionEntry(rawEntry);
      if (!item) return;

      if (item.group && Array.isArray(item.group)) {
        const children = item.group
          .map((groupEntry) => normalizeCollectionEntry(groupEntry))
          .filter(Boolean)
          .map((subItem, childIndex) => ({
            ...subItem,
            id: subItem.id || subItem.group,
            _index: childIndex
          }));

        const pairCards = children
          .map((child, childIndex) => {
            if (!child.id || !window.PORTFOLIO_PROJECTS?.[child.id]) return "";
            const card = buildHomeCard(
              { id: child.id, feature: child.feature, eager: child.eager },
              number + childIndex
            );
            return card;
          })
          .join("");

        if (variant === "home") {
          cards.push(`<div class="project-pair">${pairCards}</div>`);
        } else {
          cards.push(
            children
              .filter((child) => child.id && window.PORTFOLIO_PROJECTS?.[child.id])
              .map((child) => buildListingCard(child))
              .join("")
          );
        }
        number += children.length;
        return;
      }

      if (variant === "home") {
        cards.push(buildHomeCard(item, number));
        number += 1;
        return;
      }

      const card = buildListingCard(item, index === 0);
      if (card) cards.push(card);
    });

    this.innerHTML = cards.join("");
  }
}

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

customElements.define("project-collection", ProjectCollection);

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
        <a class="wordmark brand-name" href="${isHome ? "#top" : "./index.html"}" aria-label="Ruiying Xu home">Ruiying Xu</a>
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
        <a class="wordmark brand-name" href="./index.html">Ruiying Xu</a>
        <nav class="contact-footer-nav" aria-label="Footer">
          <a class="footer-swap-link" href="./index.html"><span>Home</span><span aria-hidden="true">Home</span></a>
          <a class="footer-swap-link" href="./about.html"><span>About</span><span aria-hidden="true">About</span></a>
          <a class="footer-swap-link" href="./works.html"><span>Art Works</span><span aria-hidden="true">Art Works</span></a>
          <a class="footer-swap-link" href="./contact.html"><span>Contact</span><span aria-hidden="true">Contact</span></a>
        </nav>
        <div class="contact-footer-socials">
          <a class="footer-swap-icon" href="https://www.instagram.com/yingingxu_/" target="_blank" rel="noreferrer" aria-label="Instagram"><span>${instagramIcon}</span><span aria-hidden="true">${instagramIcon}</span></a>
          <a class="footer-swap-icon" href="https://www.linkedin.com/in/ruiyingxu22" target="_blank" rel="noreferrer" aria-label="LinkedIn"><span>${linkedinIcon}</span><span aria-hidden="true">${linkedinIcon}</span></a>
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

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const buildVideoFallbackLabel = (video, index) => {
  if (video.getAttribute("aria-label")) {
    return video.getAttribute("aria-label");
  }
  const nearestHeading = video.closest("section")?.querySelector("h2, h3, h4, p");
  const headingText = nearestHeading?.textContent?.trim() || `Project media ${index + 1}`;
  return `${headingText.replace(/\s+/g, " ")} media`;
};

const normalizeMediaPolicy = () => {
  const videos = [...document.querySelectorAll("video")];
  videos.forEach((video) => {
    if (!video.hasAttribute("playsinline")) {
      video.setAttribute("playsinline", "");
    }
    if (!video.hasAttribute("preload")) {
      video.setAttribute("preload", "metadata");
    }

    const fallbackLabel = buildVideoFallbackLabel(video, videos.indexOf(video));
    if (!video.getAttribute("aria-label")) {
      video.setAttribute("aria-label", fallbackLabel);
    }

    if (video.hasAttribute("autoplay")) {
      video.setAttribute("muted", "");
      video.muted = true;
      video.setAttribute("loop", "");
      video.setAttribute("preload", "none");
      video.dataset.mediaMode = "autoplay";
      video.classList.add("deferred-video");
      const preserveControls = video.hasAttribute("controls");
      if (!preserveControls) {
        video.removeAttribute("controls");
      }

      if (prefersReducedMotion()) {
        video.removeAttribute("autoplay");
        if (!preserveControls) {
          video.setAttribute("controls", "");
        }
        video.dataset.mediaMode = "respect-reduced-motion";
        video.setAttribute("preload", "metadata");
      }

      if (!video.closest("figure")?.querySelector(".sr-only")) {
        const note = document.createElement("span");
        note.className = "sr-only";
        note.textContent = "Autoplay media is muted and looped. Use manual controls when available.";
        video.closest("figure")?.appendChild(note);
      }
      return;
    }

    if (!video.hasAttribute("controls")) {
      video.setAttribute("controls", "");
    }
    if (!video.src && !video.querySelector("source")) {
      video.classList.add("deferred-video");
      video.dataset.mediaMode = "defer";
      return;
    }

    if (!video.hasAttribute("poster")) {
      video.dataset.mediaMode = video.dataset.mediaMode || "no-poster";
    }
  });
};

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
    if (video.dataset.mediaMode === "autoplay" && !prefersReducedMotion()) {
      video.play().catch(() => {});
    }
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

const runA11yScan = () => {
  const headings = [...document.querySelectorAll("h1, h2, h3, h4, h5, h6")];
  let prevLevel = 0;
  const headingIssues = [];
  const emptyHeadings = [];
  headings.forEach((heading) => {
    const level = Number(heading.tagName.slice(1));
    if (prevLevel && level - prevLevel > 1) {
      headingIssues.push(`${heading.tagName}跳过级别: ${heading.textContent.trim().slice(0, 30)}`);
    }
    if (!heading.textContent?.trim()) {
      emptyHeadings.push(heading);
    }
    prevLevel = level;
  });

  const iconOnlyControls = [...document.querySelectorAll("button")].filter((button) => {
    const text = button.textContent?.trim();
    const label = button.getAttribute("aria-label");
    return !text && !label && button.querySelector("span, svg");
  });
  iconOnlyControls.forEach((button) => {
    button.setAttribute("aria-label", "Action button");
  });

  const videos = [...document.querySelectorAll("video")];
  const videosMissingControls = videos.filter((video) => !video.hasAttribute("autoplay") && !video.hasAttribute("controls"));
  const videosWithoutLabel = videos.filter((video) => !video.getAttribute("aria-label"));
  const autoplayVideos = videos.filter((video) => video.hasAttribute("autoplay"));

  if (headingIssues.length || iconOnlyControls.length || videosMissingControls.length || videosWithoutLabel.length || emptyHeadings.length) {
    console.info("[a11y] Accessibility scan summary:", {
      headingLevelSkips: headingIssues,
      iconOnlyButtons: iconOnlyControls.length,
      emptyHeadings: emptyHeadings.length,
      videosMissingControls: videosMissingControls.length,
      videosWithoutLabel: videosWithoutLabel.length,
      autoplayVideos: autoplayVideos.length
    });
  }
};

normalizeMediaPolicy();
runA11yScan();
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

if (window.matchMedia("(pointer: fine)").matches && !prefersReducedMotion()) {
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

if (window.matchMedia("(pointer: fine)").matches && !prefersReducedMotion() && cursor) {
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

const initContactQa = () => {
  const scope = document.querySelector("[data-contact-page-stage], [data-contact-qa-stage]");
  if (!scope) return;

  const items = [...scope.querySelectorAll(".contact-faq-item")];
  const triggers = [...scope.querySelectorAll(".contact-faq-trigger")];

  const setItemState = (item, isOpen) => {
    const trigger = item.querySelector(".contact-faq-trigger");
    const answer = item.querySelector(".contact-faq-answer");
    item.classList.toggle("is-open", isOpen);
    trigger?.setAttribute("aria-expanded", String(isOpen));
    answer?.setAttribute("aria-hidden", String(!isOpen));
  };

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const selectedItem = trigger.closest(".contact-faq-item");
      const shouldOpen = !selectedItem.classList.contains("is-open");

      items.forEach((item) => {
        setItemState(item, item === selectedItem && shouldOpen);
      });
    });
  });

  const stage = scope.matches("[data-contact-qa-stage]") ? scope : null;
  if (!stage) return;

  const desktopQuery = window.matchMedia("(min-width: 901px)");
  let qaIsActive = false;
  let scrollTicking = false;

  const updateStage = () => {
    scrollTicking = false;

    if (!desktopQuery.matches) {
      qaIsActive = false;
      stage.classList.remove("is-qa-active");
      return;
    }

    const rect = stage.getBoundingClientRect();
    const scrollDistance = Math.max(stage.offsetHeight - window.innerHeight, 1);
    const progress = Math.min(Math.max(-rect.top / scrollDistance, 0), 1);
    const nextState = qaIsActive ? progress > .38 : progress > .52;

    if (nextState !== qaIsActive) {
      qaIsActive = nextState;
      stage.classList.toggle("is-qa-active", qaIsActive);
    }
  };

  const requestStageUpdate = () => {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(updateStage);
  };

  window.addEventListener("scroll", requestStageUpdate, { passive: true });
  window.addEventListener("resize", requestStageUpdate);
  desktopQuery.addEventListener?.("change", requestStageUpdate);
  updateStage();
};

initContactQa();

const initAboutIntroStage = () => {
  const stage = document.querySelector("[data-about-intro-stage]");
  if (!stage) return;

  const desktopQuery = window.matchMedia("(min-width: 901px)");
  let philosophyIsActive = false;
  let scrollTicking = false;

  const updateStage = () => {
    scrollTicking = false;

    if (!desktopQuery.matches) {
      philosophyIsActive = false;
      stage.classList.remove("is-philosophy-active");
      return;
    }

    const rect = stage.getBoundingClientRect();
    const scrollDistance = Math.max(stage.offsetHeight - window.innerHeight, 1);
    const progress = Math.min(Math.max(-rect.top / scrollDistance, 0), 1);
    const nextState = philosophyIsActive ? progress > .38 : progress > .52;

    if (nextState !== philosophyIsActive) {
      philosophyIsActive = nextState;
      stage.classList.toggle("is-philosophy-active", philosophyIsActive);
    }
  };

  const requestStageUpdate = () => {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(updateStage);
  };

  window.addEventListener("scroll", requestStageUpdate, { passive: true });
  window.addEventListener("resize", requestStageUpdate);
  desktopQuery.addEventListener?.("change", requestStageUpdate);
  updateStage();
};

initAboutIntroStage();

const initContactHeadingLens = () => {
  const heading = document.querySelector(".contact-lens-heading");
  const supportsLens = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (!heading || !supportsLens || prefersReducedMotion()) return;

  let currentX = heading.clientWidth / 2;
  let currentY = heading.clientHeight / 2;
  let targetX = currentX;
  let targetY = currentY;
  let currentStrength = 0;
  let targetStrength = 0;
  let animationFrame = 0;

  const renderLens = () => {
    currentX += (targetX - currentX) * .16;
    currentY += (targetY - currentY) * .16;
    currentStrength += (targetStrength - currentStrength) * .14;

    heading.style.setProperty("--lens-x", `${currentX.toFixed(2)}px`);
    heading.style.setProperty("--lens-y", `${currentY.toFixed(2)}px`);
    heading.style.setProperty("--lens-opacity", currentStrength.toFixed(3));
    heading.style.setProperty("--lens-scale", (1 + currentStrength * .14).toFixed(4));

    const isMoving = Math.abs(targetX - currentX) > .1 || Math.abs(targetY - currentY) > .1;
    const isFading = Math.abs(targetStrength - currentStrength) > .005;

    if (isMoving || isFading) {
      animationFrame = window.requestAnimationFrame(renderLens);
    } else {
      animationFrame = 0;
    }
  };

  const requestLensFrame = () => {
    if (!animationFrame) {
      animationFrame = window.requestAnimationFrame(renderLens);
    }
  };

  const trackPointer = (event) => {
    const rect = heading.getBoundingClientRect();
    const isInside = event.clientX >= rect.left && event.clientX <= rect.right
      && event.clientY >= rect.top && event.clientY <= rect.bottom;

    if (isInside) {
      targetX = event.clientX - rect.left;
      targetY = event.clientY - rect.top;

      if (currentStrength < .01) {
        currentX = targetX;
        currentY = targetY;
      }
    }

    targetStrength = isInside ? 1 : 0;
    requestLensFrame();
  };

  window.addEventListener("pointermove", trackPointer, { passive: true });
};

initContactHeadingLens();

const initAboutPageSlides = () => {
  const stage = document.querySelector("[data-about-page-stage]");
  if (!stage) return;

  const sticky = stage.querySelector(".about-page-sticky");
  const slides = [...sticky.children].filter((element) => element.tagName === "SECTION");
  const desktopQuery = window.matchMedia("(min-width: 901px)");
  let activeIndex = -1;
  let scrollTicking = false;

  stage.style.setProperty("--about-slide-count", String(slides.length));

  const setActiveSlide = (nextIndex) => {
    if (nextIndex === activeIndex) return;
    activeIndex = nextIndex;

    slides.forEach((slide, index) => {
      const isActive = index === activeIndex;
      slide.classList.toggle("is-about-slide-active", isActive);
      slide.classList.toggle("is-about-slide-before", index < activeIndex);
      slide.classList.toggle("is-about-slide-after", index > activeIndex);
      slide.setAttribute("aria-hidden", String(!isActive));
    });
  };

  const clearSlideState = () => {
    activeIndex = -1;
    slides.forEach((slide) => {
      slide.classList.remove("is-about-slide-active", "is-about-slide-before", "is-about-slide-after");
      slide.removeAttribute("aria-hidden");
    });
  };

  const updateSlides = () => {
    scrollTicking = false;

    if (!desktopQuery.matches) {
      clearSlideState();
      return;
    }

    const rect = stage.getBoundingClientRect();
    const scrollDistance = Math.max(stage.offsetHeight - window.innerHeight, 1);
    const progress = Math.min(Math.max(-rect.top / scrollDistance, 0), 1);
    const nextIndex = Math.min(Math.round(progress * (slides.length - 1)), slides.length - 1);
    setActiveSlide(nextIndex);
  };

  const requestSlideUpdate = () => {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(updateSlides);
  };

  window.addEventListener("scroll", requestSlideUpdate, { passive: true });
  window.addEventListener("resize", requestSlideUpdate);
  desktopQuery.addEventListener?.("change", requestSlideUpdate);
  updateSlides();
};

initAboutPageSlides();

const initHomePageSlides = () => {
  const stage = document.querySelector("[data-home-page-stage]");
  if (!stage) return;

  const sticky = stage.querySelector(".home-page-sticky");
  const slides = [...sticky.children].filter((element) => element.tagName === "SECTION");
  const desktopQuery = window.matchMedia("(min-width: 901px)");
  let activeIndex = -1;
  let scrollTicking = false;

  stage.style.setProperty("--home-slide-count", String(slides.length));

  const setActiveSlide = (nextIndex) => {
    if (nextIndex === activeIndex) return;
    activeIndex = nextIndex;

    slides.forEach((slide, index) => {
      const isActive = index === activeIndex;
      slide.classList.toggle("is-home-slide-active", isActive);
      slide.classList.toggle("is-home-slide-before", index < activeIndex);
      slide.classList.toggle("is-home-slide-after", index > activeIndex);
      slide.setAttribute("aria-hidden", String(!isActive));
    });
  };

  const clearSlideState = () => {
    activeIndex = -1;
    slides.forEach((slide) => {
      slide.classList.remove("is-home-slide-active", "is-home-slide-before", "is-home-slide-after");
      slide.removeAttribute("aria-hidden");
    });
  };

  const updateSlides = () => {
    scrollTicking = false;

    if (!desktopQuery.matches) {
      clearSlideState();
      return;
    }

    const rect = stage.getBoundingClientRect();
    const scrollDistance = Math.max(stage.offsetHeight - window.innerHeight, 1);
    const progress = Math.min(Math.max(-rect.top / scrollDistance, 0), 1);
    const nextIndex = Math.min(Math.round(progress * (slides.length - 1)), slides.length - 1);
    setActiveSlide(nextIndex);
  };

  const requestSlideUpdate = () => {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(updateSlides);
  };

  window.addEventListener("scroll", requestSlideUpdate, { passive: true });
  window.addEventListener("resize", requestSlideUpdate);
  desktopQuery.addEventListener?.("change", requestSlideUpdate);
  updateSlides();
};

initHomePageSlides();

const initListingPageSlides = () => {
  const stage = document.querySelector("[data-listing-page-stage]");
  if (!stage) return;

  const sticky = stage.querySelector(".listing-page-sticky");
  const slides = [...sticky.children].filter((element) => element.tagName === "SECTION");
  const desktopQuery = window.matchMedia("(min-width: 901px)");
  let activeIndex = -1;
  let scrollTicking = false;

  stage.style.setProperty("--listing-slide-count", String(slides.length));

  const setActiveSlide = (nextIndex) => {
    if (nextIndex === activeIndex) return;
    activeIndex = nextIndex;
    slides.forEach((slide, index) => {
      const isActive = index === activeIndex;
      slide.classList.toggle("is-listing-slide-active", isActive);
      slide.classList.toggle("is-listing-slide-before", index < activeIndex);
      slide.classList.toggle("is-listing-slide-after", index > activeIndex);
      slide.setAttribute("aria-hidden", String(!isActive));
    });
  };

  const updateSlides = () => {
    scrollTicking = false;
    if (!desktopQuery.matches) {
      activeIndex = -1;
      slides.forEach((slide) => {
        slide.classList.remove("is-listing-slide-active", "is-listing-slide-before", "is-listing-slide-after");
        slide.removeAttribute("aria-hidden");
      });
      return;
    }
    const rect = stage.getBoundingClientRect();
    const distance = Math.max(stage.offsetHeight - window.innerHeight, 1);
    const progress = Math.min(Math.max(-rect.top / distance, 0), 1);
    setActiveSlide(Math.min(Math.round(progress * (slides.length - 1)), slides.length - 1));
  };

  const requestUpdate = () => {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(updateSlides);
  };

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  desktopQuery.addEventListener?.("change", requestUpdate);
  updateSlides();
};

initListingPageSlides();

const initContactPageSlides = () => {
  const stage = document.querySelector("[data-contact-page-stage]");
  if (!stage) return;

  const sticky = stage.querySelector(".contact-page-sticky");
  const slides = [".contact-hero", ".contact-main", ".contact-qa-faq", ".contact-qa-contact"]
    .map((selector) => sticky.querySelector(selector))
    .filter(Boolean);
  const desktopQuery = window.matchMedia("(min-width: 901px)");
  let activeIndex = -1;
  let scrollTicking = false;

  stage.style.setProperty("--contact-slide-count", String(slides.length));

  const setActiveSlide = (nextIndex) => {
    if (nextIndex === activeIndex) return;
    activeIndex = nextIndex;
    slides.forEach((slide, index) => {
      const isActive = index === activeIndex;
      slide.classList.toggle("is-contact-slide-active", isActive);
      slide.classList.toggle("is-contact-slide-before", index < activeIndex);
      slide.classList.toggle("is-contact-slide-after", index > activeIndex);
      slide.setAttribute("aria-hidden", String(!isActive));
    });
  };

  const updateSlides = () => {
    scrollTicking = false;
    if (!desktopQuery.matches) {
      activeIndex = -1;
      slides.forEach((slide) => {
        slide.classList.remove("is-contact-slide-active", "is-contact-slide-before", "is-contact-slide-after");
        slide.removeAttribute("aria-hidden");
      });
      return;
    }
    const rect = stage.getBoundingClientRect();
    const distance = Math.max(stage.offsetHeight - window.innerHeight, 1);
    const progress = Math.min(Math.max(-rect.top / distance, 0), 1);
    setActiveSlide(Math.min(Math.round(progress * (slides.length - 1)), slides.length - 1));
  };

  const requestUpdate = () => {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(updateSlides);
  };

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  desktopQuery.addEventListener?.("change", requestUpdate);
  updateSlides();
};

initContactPageSlides();
/* Keep the closing CTA typography and vertical hover swap consistent site-wide. */
(() => {
  const initSiteWideCtaHeadings = () => {
    document.querySelectorAll('.contact-cta-headline').forEach((heading) => {
      heading.classList.add('site-wide-cta-heading-swap');

      if (heading.children.length >= 2) return;

      const label = heading.textContent.trim();
      const primary = document.createElement('span');
      const duplicate = document.createElement('span');

      primary.textContent = label;
      duplicate.textContent = label;
      duplicate.setAttribute('aria-hidden', 'true');
      heading.setAttribute('aria-label', label);
      heading.replaceChildren(primary, duplicate);
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSiteWideCtaHeadings, { once: true });
  } else {
    initSiteWideCtaHeadings();
  }
})();
