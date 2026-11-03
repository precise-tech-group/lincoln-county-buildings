/* ==========================================================================
   animations.js — Lenis smooth scroll, GSAP reveals, parallax, counters,
   and the Three.js blueprint/steel-frame hero scene.
   Loaded after GSAP/ScrollTrigger/Lenis/Three CDN scripts.
   ========================================================================== */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- GSAP setup ---------------- */
  if (!window.gsap) return;
  gsap.registerPlugin(ScrollTrigger);

  /* ---------------- Lenis smooth scroll (drives native window scroll) ---------------- */
  if (window.Lenis && !reduceMotion) {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* ---------------- Hero entrance ---------------- */
  const heroTitle = document.querySelector("[data-hero-split]");
  if (heroTitle) {
    const lines = heroTitle.querySelectorAll(".js-split-line > span");
    gsap.set(lines, { yPercent: 110 });
    gsap.to(lines, {
      yPercent: 0,
      duration: 1.1,
      ease: "expo.out",
      stagger: 0.09,
      delay: 0.25,
    });
  }

  gsap.utils.toArray("[data-hero-fade]").forEach((el, i) => {
    gsap.from(el, {
      opacity: 0,
      y: 24,
      duration: 0.9,
      ease: "power3.out",
      delay: 0.5 + i * 0.12,
    });
  });

  /* ---------------- Scroll reveals ---------------- */
  gsap.utils.toArray(".reveal").forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 36 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 85%" },
      }
    );
  });

  gsap.utils.toArray("[data-reveal-group]").forEach((group) => {
    const items = group.querySelectorAll("[data-reveal-item]");
    gsap.fromTo(
      items,
      { opacity: 0, y: 28 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.1,
        scrollTrigger: { trigger: group, start: "top 80%" },
      }
    );
  });

  /* ---------------- Split heading reveal (non-hero) ---------------- */
  gsap.utils.toArray("[data-split-reveal]").forEach((el) => {
    const lines = el.querySelectorAll(".js-split-line > span");
    if (!lines.length) return;
    gsap.set(lines, { yPercent: 110 });
    gsap.to(lines, {
      yPercent: 0,
      duration: 0.9,
      ease: "expo.out",
      stagger: 0.07,
      scrollTrigger: { trigger: el, start: "top 85%" },
    });
  });

  /* ---------------- Parallax images ---------------- */
  gsap.utils.toArray("[data-parallax]").forEach((el) => {
    const strength = parseFloat(el.dataset.parallax) || 60;
    gsap.to(el, {
      yPercent: strength / 10,
      ease: "none",
      scrollTrigger: { trigger: el.closest("[data-parallax-wrap]") || el, start: "top bottom", end: "bottom top", scrub: true },
    });
  });

  /* ---------------- Animated stat counters ---------------- */
  gsap.utils.toArray("[data-counter]").forEach((el) => {
    const target = parseFloat(el.dataset.counter) || 0;
    const suffix = el.dataset.counterSuffix || "";
    const decimals = (el.dataset.counter.split(".")[1] || "").length;
    const counterObj = { val: 0 };
    ScrollTrigger.create({
      trigger: el,
      start: "top 90%",
      once: true,
      onEnter: () => {
        gsap.to(counterObj, {
          val: target,
          duration: 1.6,
          ease: "power2.out",
          onUpdate: () => { el.textContent = counterObj.val.toFixed(decimals) + suffix; },
        });
      },
    });
  });

  /* ---------------- Horizontal scroll showcase ---------------- */
  const hScroll = document.querySelector("[data-horizontal-scroll]");
  if (hScroll && window.innerWidth > 900) {
    const track = hScroll.querySelector("[data-horizontal-track]");
    if (track) {
      const getDistance = () => track.scrollWidth - hScroll.clientWidth;
      gsap.to(track, {
        x: () => -getDistance(),
        ease: "none",
        scrollTrigger: {
          trigger: hScroll,
          start: "top top",
          end: () => "+=" + getDistance(),
          scrub: true,
          pin: true,
          invalidateOnRefresh: true,
        },
      });
    }
  }

  /* ---------------- Perspective tilt cards ---------------- */
  if (window.matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll("[data-tilt]").forEach((card) => {
      const strength = 10;
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        gsap.to(card, { rotateY: x * strength, rotateX: -y * strength, duration: 0.4, ease: "power2.out", transformPerspective: 900 });
      });
      card.addEventListener("mouseleave", () => {
        gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.6, ease: "power3.out" });
      });
    });
  }

  /* ---------------- Clip-path image entrances ---------------- */
  gsap.utils.toArray("[data-clip-reveal]").forEach((el) => {
    gsap.fromTo(
      el,
      { clipPath: "inset(12% 12% 12% 12% round 2px)", opacity: 0.4 },
      {
        clipPath: "inset(0% 0% 0% 0% round 2px)",
        opacity: 1,
        duration: 1.1,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 82%" },
      }
    );
  });

  window.addEventListener("load", () => ScrollTrigger.refresh());

  /* ==================================================================
     Three.js blueprint / steel-frame hero scene
     ================================================================== */
  const canvas = document.getElementById("hero-3d-canvas");
  if (canvas && window.THREE && !reduceMotion) {
    initHeroScene(canvas);
  }

  function initHeroScene(canvas) {
    const THREE = window.THREE;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.set(0, 1.6, 9.5);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

    const goldColor = 0xecbc54;
    const lineColor = 0xbcdce9;

    /* Blueprint ground grid */
    const grid = new THREE.GridHelper(40, 40, 0x2a89b3, 0x145c7c);
    grid.position.y = -2.2;
    grid.material.transparent = true;
    grid.material.opacity = 0.3;
    scene.add(grid);

    /* Procedural gable-frame building skeleton (wireframe blueprint) */
    const frameGroup = new THREE.Group();
    const beamMat = new THREE.LineBasicMaterial({ color: lineColor, transparent: true, opacity: 0.8 });
    const accentMat = new THREE.LineBasicMaterial({ color: goldColor, transparent: true, opacity: 0.95 });

    const bays = 5;
    const width = 6;
    const height = 3.2;
    const depth = 7;
    const peak = 1.6;

    function addLine(points, material) {
      const geo = new THREE.BufferGeometry().setFromPoints(points.map((p) => new THREE.Vector3(...p)));
      frameGroup.add(new THREE.Line(geo, material));
    }

    for (let i = 0; i <= bays; i++) {
      const z = -depth / 2 + (depth / bays) * i;
      const mat = i === 0 || i === bays ? accentMat : beamMat;
      /* vertical posts */
      addLine([[-width / 2, -height / 2, z], [-width / 2, height / 2, z]], mat);
      addLine([[width / 2, -height / 2, z], [width / 2, height / 2, z]], mat);
      /* rafters to peak */
      addLine([[-width / 2, height / 2, z], [0, height / 2 + peak, z]], mat);
      addLine([[width / 2, height / 2, z], [0, height / 2 + peak, z]], mat);
      /* base */
      addLine([[-width / 2, -height / 2, z], [width / 2, -height / 2, z]], mat);
    }
    /* purlins / longitudinal lines connecting bays */
    for (let corner = 0; corner < 3; corner++) {
      const pts = [];
      for (let i = 0; i <= bays; i++) {
        const z = -depth / 2 + (depth / bays) * i;
        if (corner === 0) pts.push([-width / 2, height / 2, z]);
        if (corner === 1) pts.push([0, height / 2 + peak, z]);
        if (corner === 2) pts.push([width / 2, height / 2, z]);
      }
      addLine(pts, beamMat);
    }

    frameGroup.position.y = -0.4;
    scene.add(frameGroup);

    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);

    let targetRotX = 0, targetRotY = 0;
    let curRotX = 0, curRotY = 0;

    function onPointerMove(e) {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      targetRotY = nx * 0.35;
      targetRotX = ny * 0.12;
    }
    window.addEventListener("pointermove", onPointerMove);

    let autoRot = 0;
    function animate() {
      requestAnimationFrame(animate);
      autoRot += 0.0012;
      curRotX += (targetRotX - curRotX) * 0.04;
      curRotY += (targetRotY - curRotY) * 0.04;
      frameGroup.rotation.y = autoRot + curRotY;
      frameGroup.rotation.x = curRotX * -1;
      grid.rotation.y = autoRot * 0.6;
      renderer.render(scene, camera);
    }
    animate();

    function onResize() {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    }
    window.addEventListener("resize", onResize);
  }
})();
