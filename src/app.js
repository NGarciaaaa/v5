const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

/* Canva-style intro sequence: black title -> centered portrait -> hero position. */
const intro = $("#intro");
const loader = $("#intro-loader");
const stage = $("#intro-stage");
const introPerson = $("#intro-person");
const heroPerson = $("#hero-person");
const heroCopy = $(".hero-copy");

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runIntro() {
  if (!intro || !loader || !stage || !introPerson || !heroPerson) {
    document.body.classList.remove("is-loading");
    document.body.classList.add("is-ready");
    return;
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    intro.remove();
    document.body.classList.remove("is-loading");
    document.body.classList.add("is-ready");
    return;
  }

  // Give the title its intended loading-screen moment without delaying the page unnecessarily.
  await wait(780);
  loader.classList.add("is-leaving");
  stage.classList.add("is-active");
  await wait(180);

  const from = introPerson.getBoundingClientRect();
  const to = heroPerson.getBoundingClientRect();
  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);
  const scale = to.height / from.height;

  // Reveal the hero artwork underneath while the portrait travels to its final spot.
  heroPerson.style.visibility = "hidden";
  heroCopy.style.visibility = "hidden";

  const animation = introPerson.animate(
    [
      { transform: "translate3d(0,0,0) scale(1)", opacity: 1 },
      {
        transform: `translate3d(${dx}px,${dy}px,0) scale(${scale})`,
        opacity: 1,
      },
    ],
    {
      duration: 1050,
      easing: "cubic-bezier(.22,1,.36,1)",
      fill: "forwards",
    },
  );

  await animation.finished;
  heroPerson.style.visibility = "";
  heroCopy.style.visibility = "";
  document.body.classList.add("is-ready");
  intro.classList.add("is-done");
  await wait(320);
  intro.remove();
  document.body.classList.remove("is-loading");
}

// Start as soon as the DOM is ready. The hero image is preloaded by HTML, so waiting
// on every image decode only makes the intro feel slow on slower devices.
requestAnimationFrame(() => runIntro());

/* Navigation */
const menuButton = $(".menu-toggle");
const nav = $(".nav-links");
const navLinks = $$(".nav-link");
const sections = $$("main section[id]");
menuButton?.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!open));
  nav?.classList.toggle("open", !open);
});
navLinks.forEach((link) =>
  link.addEventListener("click", () => {
    menuButton?.setAttribute("aria-expanded", "false");
    nav?.classList.remove("open");
  }),
);
if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) =>
          link.classList.toggle(
            "active",
            link.getAttribute("href") === `#${entry.target.id}`,
          ),
        );
      }),
    { rootMargin: "-40% 0px -50% 0px", threshold: 0 },
  );
  sections.forEach((section) => sectionObserver.observe(section));
}

/* Reveal only when content is near the viewport. */
const revealItems = $$(".reveal");
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.03 },
  );
  revealItems.forEach((el) => revealObserver.observe(el));
} else revealItems.forEach((el) => el.classList.add("visible"));

$("#year").textContent = new Date().getFullYear();

const backToTop = $("#back-to-top");
const backToTopProgress = $("#back-to-top-progress");
const ringLength = 2 * Math.PI * 24;
if (backToTopProgress)
  backToTopProgress.style.strokeDasharray = String(ringLength);
let ticking = false;
const updateBackToTop = () => {
  const scrollableHeight =
    document.documentElement.scrollHeight - window.innerHeight;
  const progress =
    scrollableHeight > 0
      ? Math.min(1, Math.max(0, window.scrollY / scrollableHeight))
      : 0;
  if (backToTopProgress)
    backToTopProgress.style.strokeDashoffset = String(
      ringLength * (1 - progress),
    );
};
window.addEventListener(
  "scroll",
  () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateBackToTop();
      ticking = false;
    });
  },
  { passive: true },
);
updateBackToTop();
backToTop?.addEventListener("click", () =>
  window.scrollTo({ top: 0, behavior: "smooth" }),
);

/* Creation tabs */
const tabs = $$(".tab");
const panels = $$(".tab-panel");
tabs.forEach((tab) =>
  tab.addEventListener("click", () => {
    const target = tab.dataset.tab;
    tabs.forEach((item) => {
      const active = item === tab;
      item.classList.toggle("active", active);
      item.setAttribute("aria-selected", String(active));
    });
    panels.forEach((panel) =>
      panel.classList.toggle("active", panel.dataset.panel === target),
    );
    $$(`#panel-${target} .reveal`).forEach((el) => el.classList.add("visible"));
  }),
);

/* Modal buttons */
const openModal = (id) => {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  $(".modal-close", modal)?.focus();
};
const closeModal = (modal) => {
  if (!modal) return;
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
};
$$("[data-modal]").forEach((button) =>
  button.addEventListener("click", () => openModal(button.dataset.modal)),
);
$$("[data-close-modal]").forEach((button) =>
  button.addEventListener("click", () => closeModal(button.closest(".modal"))),
);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") $$(".modal.open").forEach(closeModal);
});

/* Express contact endpoint */
const form = $("#contact-form");
const status = $("#form-status");
form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = $('button[type="submit"]', form);
  const originalText = button.textContent;
  button.disabled = true;
  button.textContent = "Sending…";
  status.textContent = "";
  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(form))),
    });
    const result = await response.json();
    if (!response.ok)
      throw new Error(result.message || "Something went wrong.");
    status.textContent = result.message;
    form.reset();
  } catch (error) {
    status.textContent = error.message || "Unable to send your message.";
  } finally {
    button.disabled = false;
    button.textContent = originalText;
  }
});
