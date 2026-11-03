/* ==========================================================================
   main.js — header, mobile nav, dropdowns, size explorer, building explorer,
   footer year, misc UI wiring
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

  /* --------------------------------------------------------------------
     Desktop dropdown navigation.
     CSS already keeps the dropdown's hit area continuous with the trigger
     (no gap), so :hover/:focus-within alone are reliable. This JS layer is
     a belt-and-suspenders enhancement on top of that: a short close delay
     so a slightly imprecise mouse path never slams the menu shut, plus
     click-to-toggle for touch/coarse-pointer devices and Escape-to-close.
     -------------------------------------------------------------------- */
  const CLOSE_DELAY = 260;
  document.querySelectorAll(".has-dropdown").forEach((item) => {
    const trigger = item.querySelector(".nav-link");
    if (!trigger) return;
    let closeTimer = null;

    function open() {
      if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
      item.classList.add("is-open");
    }
    function scheduleClose() {
      if (closeTimer) clearTimeout(closeTimer);
      closeTimer = setTimeout(() => item.classList.remove("is-open"), CLOSE_DELAY);
    }

    if (window.matchMedia("(hover: hover)").matches) {
      item.addEventListener("mouseenter", open);
      item.addEventListener("mouseleave", scheduleClose);
    }

    trigger.addEventListener("click", (e) => {
      if (window.matchMedia("(hover: none)").matches) {
        e.preventDefault();
        item.classList.toggle("is-open");
      }
    });
    trigger.addEventListener("focus", open);
    item.addEventListener("focusout", (e) => {
      if (!item.contains(e.relatedTarget)) scheduleClose();
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

  /* Close an open dropdown if the user clicks fully outside the header */
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".has-dropdown")) {
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

  /* --------------------------------------------------------------------
     Size Explorer — width on the left, matching lengths reveal on the
     right with a simple proportional scale bar. Data lives in a JSON
     blob on the component (data-sizes), e.g.:
     { "8'": ["10'","12'","16'"], "10'": ["10'","12'","14'","16'","20'"] }
     -------------------------------------------------------------------- */
  document.querySelectorAll("[data-size-explorer]").forEach((root) => {
    let sizes;
    try { sizes = JSON.parse(root.getAttribute("data-sizes")); } catch (err) { return; }
    const widths = Object.keys(sizes);
    if (!widths.length) return;

    const widthList = root.querySelector("[data-size-widths]");
    const lengthList = root.querySelector("[data-size-lengths]");
    const scaleBar = root.querySelector("[data-size-scale-bar]");
    const detailWidth = root.querySelector("[data-size-detail-width]");
    const detailCount = root.querySelector("[data-size-detail-count]");
    if (!widthList || !lengthList) return;

    const maxWidthNum = Math.max(...widths.map((w) => parseFloat(w)));

    function renderWidths(activeWidth) {
      widthList.innerHTML = "";
      widths.forEach((w) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "size-width-btn" + (w === activeWidth ? " is-active" : "");
        btn.innerHTML = `<span>${w} wide</span><svg viewBox="0 0 12 8" fill="none"><path d="M1 4h9M7 1l3 3-3 3" stroke="currentColor" stroke-width="1.6"/></svg>`;
        btn.addEventListener("click", () => selectWidth(w));
        widthList.appendChild(btn);
      });
    }

    function renderLengths(w) {
      lengthList.innerHTML = "";
      sizes[w].forEach((len, i) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "size-length-btn" + (i === 0 ? " is-active" : "");
        btn.textContent = len;
        btn.addEventListener("click", () => {
          lengthList.querySelectorAll(".size-length-btn").forEach((b) => b.classList.remove("is-active"));
          btn.classList.add("is-active");
          if (detailCount) detailCount.textContent = `${w} x ${len}`;
        });
        lengthList.appendChild(btn);
      });
      if (detailCount && sizes[w][0]) detailCount.textContent = `${w} x ${sizes[w][0]}`;
    }

    function selectWidth(w) {
      renderWidths(w);
      renderLengths(w);
      if (detailWidth) detailWidth.textContent = w + " wide buildings";
      if (scaleBar) {
        const pct = Math.max(18, Math.round((parseFloat(w) / maxWidthNum) * 100));
        scaleBar.style.width = pct + "%";
        const span = scaleBar.querySelector("span");
        if (span) span.textContent = w;
      }
    }

    selectWidth(widths[0]);
  });

  /* --------------------------------------------------------------------
     Building Explorer — hotspots on a product photo reveal a feature
     description. Each hotspot: <button class="hotspot" data-hotspot-target="id">
     Each detail panel is hidden except the active one via [data-hotspot-panel].
     -------------------------------------------------------------------- */
  document.querySelectorAll("[data-building-explorer]").forEach((root) => {
    const hotspots = root.querySelectorAll(".hotspot");
    const navButtons = root.querySelectorAll("[data-hotspot-nav] button");
    const panels = root.querySelectorAll("[data-hotspot-panel]");

    function activate(id) {
      hotspots.forEach((h) => h.classList.toggle("is-active", h.dataset.hotspotTarget === id));
      navButtons.forEach((b) => b.classList.toggle("is-active", b.dataset.hotspotTarget === id));
      panels.forEach((p) => { p.hidden = p.dataset.hotspotPanel !== id; });
    }

    hotspots.forEach((h) => {
      h.addEventListener("click", () => activate(h.dataset.hotspotTarget));
      h.addEventListener("mouseenter", () => { if (window.matchMedia("(hover: hover)").matches) activate(h.dataset.hotspotTarget); });
    });
    navButtons.forEach((b) => b.addEventListener("click", () => activate(b.dataset.hotspotTarget)));

    if (hotspots[0]) activate(hotspots[0].dataset.hotspotTarget);
  });
})();
