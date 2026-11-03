/* ==========================================================================
   main.js — header, mobile nav, dropdowns, footer year, misc UI wiring
   ========================================================================== */
(function () {
  "use strict";

  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const mobileNav = document.querySelector(".mobile-nav");

  /* Sticky header state */
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 24) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");
  }
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Mobile nav toggle */
  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = mobileNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
      document.body.style.overflow = isOpen ? "hidden" : "";
    });

    mobileNav.querySelectorAll(".mobile-nav-link").forEach((link) => {
      const parentLi = link.closest("li");
      const sub = parentLi ? parentLi.querySelector(".mobile-sub") : null;
      if (sub) {
        link.addEventListener("click", (e) => {
          e.preventDefault();
          const isOpen = sub.classList.toggle("is-open");
          link.setAttribute("aria-expanded", String(isOpen));
        });
      } else {
        link.addEventListener("click", () => {
          mobileNav.classList.remove("is-open");
          navToggle.setAttribute("aria-expanded", "false");
          document.body.style.overflow = "";
        });
      }
    });
  }

  /* Desktop dropdown keyboard + touch support */
  document.querySelectorAll(".has-dropdown").forEach((item) => {
    const trigger = item.querySelector(".nav-link");
    if (!trigger) return;
    trigger.addEventListener("click", (e) => {
      if (window.matchMedia("(hover: none)").matches) {
        e.preventDefault();
        item.classList.toggle("is-open");
      }
    });
    trigger.addEventListener("focus", () => item.classList.add("is-open"));
    item.addEventListener("focusout", (e) => {
      if (!item.contains(e.relatedTarget)) item.classList.remove("is-open");
    });
  });

  /* Close mobile nav / dropdowns on Escape */
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (mobileNav && mobileNav.classList.contains("is-open")) {
        mobileNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      }
      document.querySelectorAll(".has-dropdown.is-open").forEach((el) => el.classList.remove("is-open"));
    }
  });

  /* Footer year */
  const yearEl = document.getElementById("current-year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* Magnetic buttons (desktop, fine pointer only) */
  if (window.matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll(".magnetic").forEach((el) => {
      let bounds;
      el.addEventListener("mouseenter", () => { bounds = el.getBoundingClientRect(); });
      el.addEventListener("mousemove", (e) => {
        if (!bounds) bounds = el.getBoundingClientRect();
        const relX = e.clientX - bounds.left - bounds.width / 2;
        const relY = e.clientY - bounds.top - bounds.height / 2;
        el.style.transform = `translate(${relX * 0.25}px, ${relY * 0.3}px)`;
      });
      el.addEventListener("mouseleave", () => { el.style.transform = ""; });
    });
  }

  /* Contact / quote form — client-side validation only, no backend yet */
  document.querySelectorAll("form[data-form]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const status = form.querySelector(".form-status");
      if (status) {
        status.textContent = "This form is not yet connected to a backend. Please call or email us directly to reach our team right away.";
        status.classList.add("is-visible");
      }
    });
  });
})();
