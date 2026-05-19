const header = document.querySelector("[data-header]");
const navToggle = document.querySelector("[data-nav-toggle]");
const navPanel = document.querySelector("[data-nav-panel]");
const navLinks = document.querySelectorAll(".nav-panel a");
const revealItems = document.querySelectorAll(".reveal");
const counters = document.querySelectorAll("[data-counter]");
const tiltItems = document.querySelectorAll("[data-tilt]");
const progressBar = document.querySelector("[data-scroll-progress]");
const crosshair = document.querySelector("[data-crosshair]");
const navPills = document.querySelectorAll("[data-nav-pill]");
const textType = document.querySelector("[data-text-type]");
const glowCards = document.querySelectorAll("[data-border-glow]");
const stackCards = document.querySelectorAll("[data-stack-card]");
const cardSwaps = document.querySelectorAll("[data-card-swap]");
const motionAllowed = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const closeMenu = () => {
  if (!navToggle || !navPanel) return;
  navToggle.setAttribute("aria-expanded", "false");
  navPanel.classList.remove("is-open");
  document.body.classList.remove("nav-open");
  header?.classList.remove("is-open");
};

const updateHeader = () => {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 12);
};

const updateProgress = () => {
  if (!progressBar) return;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
  progressBar.style.transform = `scaleX(${Math.min(progress, 1)})`;
};

const updateStackCards = () => {
  if (!stackCards.length || !motionAllowed) return;
  const trigger = window.innerHeight * 0.62;

  stackCards.forEach((card, index) => {
    const rect = card.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, (trigger - rect.top) / Math.max(rect.height, 1)));
    const scale = 1 - progress * 0.018 * index;
    const lift = progress * index * -5;
    card.style.transform = `translateY(${lift}px) scale(${scale})`;
    card.style.filter = "";
  });
};

navToggle?.addEventListener("click", () => {
  const isOpen = navToggle.getAttribute("aria-expanded") === "true";
  navToggle.setAttribute("aria-expanded", String(!isOpen));
  navPanel?.classList.toggle("is-open", !isOpen);
  document.body.classList.toggle("nav-open", !isOpen);
  header?.classList.toggle("is-open", !isOpen);
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    closeMenu();
  });
});

navPills.forEach((pill) => {
  pill.addEventListener("click", () => {
    navPills.forEach((item) => item.classList.remove("is-active"));
    pill.classList.add("is-active");
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
  }
});

window.addEventListener(
  "scroll",
  () => {
    updateHeader();
    updateProgress();
    updateStackCards();
  },
  { passive: true }
);
updateHeader();
updateProgress();
updateStackCards();

if (crosshair && motionAllowed && window.matchMedia("(pointer: fine)").matches) {
  document.body.classList.add("has-crosshair");
  let crosshairX = window.innerWidth / 2;
  let crosshairY = window.innerHeight / 2;
  let renderedX = crosshairX;
  let renderedY = crosshairY;

  const moveCrosshair = () => {
    renderedX += (crosshairX - renderedX) * 0.14;
    renderedY += (crosshairY - renderedY) * 0.14;
    document.documentElement.style.setProperty("--cross-x", `${renderedX}px`);
    document.documentElement.style.setProperty("--cross-y", `${renderedY}px`);
    requestAnimationFrame(moveCrosshair);
  };

  requestAnimationFrame(moveCrosshair);

  window.addEventListener(
    "pointermove",
    (event) => {
      crosshairX = event.clientX;
      crosshairY = event.clientY;
      document.body.classList.add("is-crosshair-ready");
    },
    { passive: true }
  );

  document.querySelectorAll("a, button, [data-tilt], [data-border-glow]").forEach((item) => {
    item.addEventListener("pointerenter", () => document.body.classList.add("is-crosshair-hovering"));
    item.addEventListener("pointerleave", () => document.body.classList.remove("is-crosshair-hovering"));
  });
}

if (textType) {
  const phrases = (textType.dataset.texts || textType.textContent || "")
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
  let phraseIndex = 0;
  let charIndex = 0;
  let deleting = false;

  const typeLoop = () => {
    const phrase = phrases[phraseIndex] || "";
    textType.textContent = phrase.slice(0, charIndex);

    if (!deleting && charIndex < phrase.length) {
      charIndex += 1;
      window.setTimeout(typeLoop, 58 + Math.random() * 42);
      return;
    }

    if (!deleting && charIndex >= phrase.length) {
      deleting = true;
      window.setTimeout(typeLoop, 1350);
      return;
    }

    if (deleting && charIndex > 0) {
      charIndex -= 1;
      window.setTimeout(typeLoop, 26);
      return;
    }

    deleting = false;
    phraseIndex = (phraseIndex + 1) % phrases.length;
    window.setTimeout(typeLoop, 220);
  };

  if (phrases.length) {
    textType.textContent = "";
    window.setTimeout(typeLoop, 450);
  }
}

const animateCounter = (counter) => {
  const target = Number(counter.dataset.target || "0");
  const duration = Number(counter.dataset.duration || "3600");
  const start = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 0.5 - Math.cos(progress * Math.PI) / 2;
    counter.textContent = Math.round(target * eased).toString();
    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  };

  requestAnimationFrame(tick);
};

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -70px 0px",
    }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

if ("IntersectionObserver" in window) {
  const counterObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || entry.target.dataset.counted) return;
        entry.target.dataset.counted = "true";
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.6 }
  );

  counters.forEach((counter) => counterObserver.observe(counter));
} else {
  counters.forEach((counter) => {
    counter.textContent = counter.dataset.target || "0";
  });
}

if (motionAllowed && window.matchMedia("(pointer: fine)").matches) {
  tiltItems.forEach((item) => {
    item.addEventListener("pointermove", (event) => {
      const rect = item.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      item.style.transform = `translate3d(${x * 3}px, ${y * 3}px, 0)`;
    });

    item.addEventListener("pointerleave", () => {
      item.style.transform = "";
    });
  });

  glowCards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const dx = x - centerX;
      const dy = y - centerY;
      const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
      const edge = Math.max(Math.abs(dx) / centerX, Math.abs(dy) / centerY);
      card.style.setProperty("--cursor-angle", `${angle}deg`);
      card.style.setProperty("--edge-proximity", `${Math.min(100, Math.max(0, edge * 100))}`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--edge-proximity", "0");
    });
  });
}

cardSwaps.forEach((swap) => {
  const cards = Array.from(swap.querySelectorAll(".swap-card"));
  const indicatorItems = Array.from(swap.parentElement?.querySelectorAll("[data-swap-indicator] span") || []);
  if (cards.length < 2) return;
  let active = 0;

  const render = () => {
    cards.forEach((card, index) => {
      card.classList.toggle("is-active", index === active);
      card.classList.toggle("is-next", index === (active + 1) % cards.length);
    });
    indicatorItems.forEach((item, index) => {
      item.classList.toggle("is-active", index === active);
    });
  };

  render();
  window.setInterval(() => {
    active = (active + 1) % cards.length;
    render();
  }, 4800);
});
