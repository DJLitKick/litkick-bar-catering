/* ============================================
   LitKick Bar Catering — Scroll Experience
   ============================================ */

const FRAME_COUNT = 149;
const FRAME_SPEED = 1.0;
const EARLY_FRAMES = 25;
const IMAGE_SCALE = 1.0;
const DARK_OVERLAY_ENTER = 0.50;
const DARK_OVERLAY_LEAVE = 0.63;
const MARQUEE_ENTER = 0.28;
const MARQUEE_LEAVE = 0.72;

const frames = new Array(FRAME_COUNT).fill(null);
let currentFrame = 0;
let allLoaded = false;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const canvasWrap = document.getElementById("canvas-wrap");
const scrollContainer = document.getElementById("scroll-container");
const heroSection = document.getElementById("hero");
const loader = document.getElementById("loader");
const loaderBar = document.getElementById("loader-bar");
const loaderPercent = document.getElementById("loader-percent");
const darkOverlay = document.getElementById("dark-overlay");
const marqueeWrap = document.getElementById("marquee-wrap");

/* ============================================
   CANVAS SETUP
   ============================================ */

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  ctx.scale(dpr, dpr);
  if (frames[currentFrame]) drawFrame(currentFrame);
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

let sampledBg = "#080808";

function sampleBgColor(img) {
  const tmpCanvas = document.createElement("canvas");
  tmpCanvas.width = 4;
  tmpCanvas.height = 4;
  const tmpCtx = tmpCanvas.getContext("2d");
  tmpCtx.drawImage(img, 0, 0, 4, 4);
  const data = tmpCtx.getImageData(0, 0, 1, 1).data;
  sampledBg = `rgb(${data[0]},${data[1]},${data[2]})`;
}

function drawFrame(index) {
  const img = frames[index];
  if (!img) return;
  const cw = window.innerWidth;
  const ch = window.innerHeight;
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const scale = Math.max(cw / iw, ch / ih) * IMAGE_SCALE;
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = (cw - dw) / 2;
  const dy = (ch - dh) / 2;
  ctx.fillStyle = sampledBg;
  ctx.fillRect(0, 0, cw, ch);
  ctx.drawImage(img, dx, dy, dw, dh);
}

/* ============================================
   FRAME LOADER
   ============================================ */

function frameSrc(i) {
  const n = String(i + 1).padStart(4, "0");
  return `frames/frame_${n}.webp`;
}

function loadFrames() {
  let loadedCount = 0;

  function onLoad(i, img) {
    frames[i] = img;
    loadedCount++;
    const pct = Math.round((loadedCount / FRAME_COUNT) * 100);
    loaderBar.style.width = pct + "%";
    loaderPercent.textContent = pct + "%";

    if (i === 0) {
      sampleBgColor(img);
      drawFrame(0);
    }

    if (loadedCount === FRAME_COUNT) {
      allLoaded = true;
      setTimeout(() => {
        loader.classList.add("hidden");
        initAnimations();
      }, 300);
    }
  }

  // Phase 1: first 10 frames immediately
  for (let i = 0; i < Math.min(10, FRAME_COUNT); i++) {
    const img = new Image();
    img.onload = ((idx, image) => () => onLoad(idx, image))(i, img);
    img.src = frameSrc(i);
  }

  // Phase 2: rest in background
  setTimeout(() => {
    for (let i = 10; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.onload = ((idx, image) => () => onLoad(idx, image))(i, img);
      img.src = frameSrc(i);
    }
  }, 100);
}

/* ============================================
   HERO ENTRANCE
   ============================================ */

function initHeroEntrance() {
  const words = document.querySelectorAll(".hero-heading .word");
  const tagline = document.querySelector(".hero-tagline");
  const scrollIndicator = document.querySelector(".hero-scroll-indicator");

  words.forEach((word, i) => {
    setTimeout(() => word.classList.add("visible"), 200 + i * 120);
  });

  setTimeout(() => tagline.classList.add("visible"), 900);
  setTimeout(() => scrollIndicator.classList.add("visible"), 1400);
}

/* ============================================
   LENIS SMOOTH SCROLL
   ============================================ */

let lenis;

function initLenis() {
  lenis = new Lenis({
    duration: 1.4,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* ============================================
   SECTION POSITIONING
   ============================================ */

function positionSections() {
  const totalH = scrollContainer.offsetHeight;

  document.querySelectorAll(".scroll-section").forEach((section) => {
    const enter = parseFloat(section.dataset.enter) / 100;
    const leave = parseFloat(section.dataset.leave) / 100;
    const mid = (enter + leave) / 2;
    section.style.top = mid * (totalH - window.innerHeight) + "px";
  });
}

/* ============================================
   SECTION ANIMATION SYSTEM
   ============================================ */

function setupSectionAnimation(section) {
  const type = section.dataset.animation;
  const persist = section.dataset.persist === "true";
  const enter = parseFloat(section.dataset.enter) / 100;
  const leave = parseFloat(section.dataset.leave) / 100;

  const children = section.querySelectorAll(
    ".section-label, .section-heading, .section-body, .section-note, .cta-button, .stat"
  );

  const tl = gsap.timeline({ paused: true });
  section._gsapTl = tl;

  switch (type) {
    case "fade-up":
      tl.fromTo(children,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.12, duration: 0.9, ease: "power3.out", immediateRender: false });
      break;
    case "slide-left":
      tl.fromTo(children,
        { x: -80, opacity: 0 },
        { x: 0, opacity: 1, stagger: 0.14, duration: 0.9, ease: "power3.out", immediateRender: false });
      break;
    case "slide-right":
      tl.fromTo(children,
        { x: 80, opacity: 0 },
        { x: 0, opacity: 1, stagger: 0.14, duration: 0.9, ease: "power3.out", immediateRender: false });
      break;
    case "scale-up":
      tl.fromTo(children,
        { scale: 0.88, opacity: 0 },
        { scale: 1, opacity: 1, stagger: 0.12, duration: 1.0, ease: "power2.out", immediateRender: false });
      break;
    case "rotate-in":
      tl.fromTo(children,
        { y: 40, rotation: 3, opacity: 0 },
        { y: 0, rotation: 0, opacity: 1, stagger: 0.1, duration: 0.9, ease: "power3.out", immediateRender: false });
      break;
    case "stagger-up":
      tl.fromTo(children,
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.15, duration: 0.8, ease: "power3.out", immediateRender: false });
      break;
    case "clip-reveal":
      tl.fromTo(children,
        { clipPath: "inset(100% 0 0 0)", opacity: 0 },
        { clipPath: "inset(0% 0 0 0)", opacity: 1, stagger: 0.15, duration: 1.2, ease: "power4.inOut", immediateRender: false });
      break;
  }

  let hasPlayed = false;

  ScrollTrigger.create({
    trigger: scrollContainer,
    start: "top top",
    end: "bottom bottom",
    scrub: false,
    onUpdate(self) {
      const p = self.progress;

      if (p >= enter && p < leave) {
        if (!hasPlayed) {
          section.style.opacity = "1";
          section.classList.add("is-visible");
          tl.play();
          hasPlayed = true;
          // Trigger counters inside this section when it becomes visible
          section.querySelectorAll(".stat-number").forEach(animateCounter);
        }
      } else {
        if (hasPlayed && !persist) {
          section.style.opacity = "0";
          section.classList.remove("is-visible");
          tl.reverse();
          hasPlayed = false;
        }
      }
    },
  });
}

/* ============================================
   CANVAS FRAME BINDING
   ============================================ */

function initFrameBinding() {
  ScrollTrigger.create({
    trigger: scrollContainer,
    start: "top top",
    end: "bottom bottom",
    scrub: true,
    onUpdate(self) {
      const accelerated = Math.min(self.progress * FRAME_SPEED, 1);
      const index = Math.min(
        EARLY_FRAMES + Math.floor(accelerated * (FRAME_COUNT - EARLY_FRAMES)),
        FRAME_COUNT - 1
      );
      if (index !== currentFrame) {
        currentFrame = index;
        if (index % 20 === 0 && frames[index]) sampleBgColor(frames[index]);
        requestAnimationFrame(() => drawFrame(currentFrame));
      }
    },
  });
}

/* ============================================
   HERO → CANVAS TRANSITION (circle wipe)
   ============================================ */

function initHeroTransition() {
  ScrollTrigger.create({
    trigger: heroSection,
    start: "top top",
    end: "bottom top",
    scrub: true,
    onUpdate(self) {
      const p = self.progress;
      // Hero fades over first half of scroll-off
      heroSection.style.opacity = Math.max(0, 1 - p * 2).toString();
      // Canvas wipes in: complete when hero is 50% off screen
      const wipeProgress = Math.min(1, p * 2);
      canvasWrap.style.clipPath = `circle(${wipeProgress * 150}% at 50% 50%)`;
      // After wipe (p > 0.5): advance first 25 frames
      if (p > 0.5) {
        const earlyP = (p - 0.5) * 2;
        const earlyIndex = Math.min(Math.floor(earlyP * EARLY_FRAMES), EARLY_FRAMES - 1);
        if (earlyIndex !== currentFrame) {
          currentFrame = earlyIndex;
          requestAnimationFrame(() => drawFrame(currentFrame));
        }
      }
    },
  });
}

/* ============================================
   DARK OVERLAY
   ============================================ */

function initDarkOverlay() {
  const fadeRange = 0.04;
  ScrollTrigger.create({
    trigger: scrollContainer,
    start: "top top",
    end: "bottom bottom",
    scrub: true,
    onUpdate(self) {
      const p = self.progress;
      let opacity = 0;
      const E = DARK_OVERLAY_ENTER;
      const L = DARK_OVERLAY_LEAVE;
      if (p >= E - fadeRange && p <= E) {
        opacity = (p - (E - fadeRange)) / fadeRange;
      } else if (p > E && p < L) {
        opacity = 0.9;
      } else if (p >= L && p <= L + fadeRange) {
        opacity = 0.9 * (1 - (p - L) / fadeRange);
      }
      darkOverlay.style.opacity = opacity.toString();
    },
  });
}

/* ============================================
   MARQUEE
   ============================================ */

function initMarquee() {
  const marText = marqueeWrap.querySelector(".marquee-text");
  const speed = parseFloat(marqueeWrap.dataset.scrollSpeed) || -28;
  const fadeRange = 0.04;

  gsap.to(marText, {
    xPercent: speed,
    ease: "none",
    scrollTrigger: {
      trigger: scrollContainer,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
    },
  });

  ScrollTrigger.create({
    trigger: scrollContainer,
    start: "top top",
    end: "bottom bottom",
    scrub: true,
    onUpdate(self) {
      const p = self.progress;
      let op = 0;
      if (p >= MARQUEE_ENTER && p <= MARQUEE_ENTER + fadeRange) {
        op = (p - MARQUEE_ENTER) / fadeRange;
      } else if (p > MARQUEE_ENTER + fadeRange && p < MARQUEE_LEAVE - fadeRange) {
        op = 1;
      } else if (p >= MARQUEE_LEAVE - fadeRange && p <= MARQUEE_LEAVE) {
        op = 1 - (p - (MARQUEE_LEAVE - fadeRange)) / fadeRange;
      }
      marqueeWrap.style.opacity = op.toString();
    },
  });
}

/* ============================================
   COUNTER ANIMATIONS — triggered by section visibility
   ============================================ */

function animateCounter(el) {
  const target = parseFloat(el.dataset.value);
  const decimals = parseInt(el.dataset.decimals || "0");
  el.textContent = "0";
  gsap.to(el, {
    textContent: target,
    duration: 2.2,
    ease: "power1.out",
    snap: { textContent: decimals === 0 ? 1 : 0.01 },
    onUpdate() {
      if (decimals === 0) {
        el.textContent = Math.round(parseFloat(el.textContent));
      } else {
        el.textContent = parseFloat(el.textContent).toFixed(decimals);
      }
    },
  });
}

function initCounters() {}

/* ============================================
   INTERSECTION OBSERVER FALLBACK
   Ensures sections that are data-persist="true" always show
   if the user scrolls directly to the bottom (fast scroll / reduced motion)
   ============================================ */

function initPersistFallback() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const section = entry.target;
        if (section.style.opacity === "0" || section.style.opacity === "") {
          section.style.opacity = "1";
          section.classList.add("is-visible");
          const tl = section._gsapTl;
          if (tl) tl.play();
          section.querySelectorAll(".stat-number").forEach(animateCounter);
        }
        observer.unobserve(section);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('[data-persist="true"]').forEach((s) => observer.observe(s));
}

/* ============================================
   INIT ALL ANIMATIONS
   ============================================ */

function initAnimations() {
  gsap.registerPlugin(ScrollTrigger);
  initLenis();
  positionSections();
  initHeroTransition();
  initFrameBinding();
  initDarkOverlay();
  initMarquee();
  initCounters();

  document.querySelectorAll(".scroll-section").forEach(setupSectionAnimation);
  initPersistFallback();

  window.addEventListener("resize", () => {
    positionSections();
    resizeCanvas();
    ScrollTrigger.refresh();
  });
}

/* ============================================
   BOOT
   ============================================ */

window.addEventListener("DOMContentLoaded", () => {
  initHeroEntrance();
  loadFrames();
});
