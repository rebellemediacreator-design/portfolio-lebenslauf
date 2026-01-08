(() => {
  const root = document.documentElement;
  const dots = Array.from(document.querySelectorAll(".dot"));
  const panels = Array.from(document.querySelectorAll(".panel"));
  const themeBtn = document.getElementById("themeBtn");

  // Apply background images from data-bg (only if present)
  panels.forEach(panel => {
    const url = panel.getAttribute("data-bg");
    const bg = panel.querySelector(".panel__bg");
    if (bg && url) bg.style.backgroundImage = `url("${url}")`;
  });

  // Theme: default LIGHT (CH-friendly)
  const savedTheme = localStorage.getItem("rb_theme") || "light";
  root.setAttribute("data-theme", savedTheme === "dark" ? "dark" : "light");
  themeBtn.setAttribute("aria-pressed", savedTheme === "dark" ? "true" : "false");
  themeBtn.textContent = savedTheme === "dark" ? "Dark · On" : "Light · On";

  themeBtn.addEventListener("click", () => {
    const current = root.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("rb_theme", next);
    themeBtn.setAttribute("aria-pressed", next === "dark" ? "true" : "false");
    themeBtn.textContent = next === "dark" ? "Dark · On" : "Light · On";
  });

  // Scroll to panel on dot click
  dots.forEach(dot => {
    dot.addEventListener("click", () => {
      const id = dot.dataset.to;
      const target = document.getElementById(id);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  // Active dot + reveal observer
  const setActive = (id) => {
    dots.forEach(d => d.classList.toggle("is-active", d.dataset.to === id));
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      setActive(id);

      // reveal content inside current panel
      const reveals = entry.target.querySelectorAll(".reveal");
      reveals.forEach(el => el.classList.add("is-in"));
    });
  }, { threshold: 0.55 });

  panels.forEach(p => io.observe(p));

  // Reveal first panel immediately
  requestAnimationFrame(() => {
    const first = document.getElementById("panel-1");
    if (first) first.querySelectorAll(".reveal").forEach(el => el.classList.add("is-in"));
  });

  // Keyboard support: arrow up/down to move between panels
  const panelIndexById = (id) => panels.findIndex(p => p.id === id);

  const getCurrentPanelId = () => {
    const rects = panels.map(p => ({ id: p.id, top: Math.abs(p.getBoundingClientRect().top) }));
    rects.sort((a,b) => a.top - b.top);
    return rects[0]?.id || panels[0]?.id;
  };

  window.addEventListener("keydown", (e) => {
    if (!["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End"].includes(e.key)) return;
    e.preventDefault();

    const currentId = getCurrentPanelId();
    const idx = panelIndexById(currentId);
    if (idx < 0) return;

    if (e.key === "Home") {
      panels[0].scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (e.key === "End") {
      panels[panels.length - 1].scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const nextIdx =
      (e.key === "ArrowDown" || e.key === "PageDown")
        ? Math.min(panels.length - 1, idx + 1)
        : Math.max(0, idx - 1);

    panels[nextIdx].scrollIntoView({ behavior: "smooth", block: "start" });
  }, { passive: false });

})();
