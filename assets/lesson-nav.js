(() => {
  const links = Array.from(document.querySelectorAll(".lesson-toc a"));
  const headings = Array.from(document.querySelectorAll(".original-lecture > h2[id], .original-lecture > h3[id]"));
  const byId = new Map();
  for (const link of links) {
    const id = link.getAttribute("href").slice(1);
    if (!byId.has(id)) byId.set(id, []);
    byId.get(id).push(link);
  }
  let current = null;
  let pending = false;

  function select(id, reveal = false) {
    if (id !== current) {
      for (const link of byId.get(current) || []) link.removeAttribute("aria-current");
      for (const link of byId.get(id) || []) link.setAttribute("aria-current", "location");
      current = id;
    }
    if (reveal) {
      for (const link of byId.get(id) || []) {
        const group = link.closest(".toc-group");
        if (group) group.open = true;
      }
    }
  }

  function trackReading() {
    pending = false;
    let id = null;
    for (const heading of headings) {
      if (heading.getBoundingClientRect().top > 96) break;
      id = heading.id;
    }
    select(id);
  }

  function scheduleReading() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(trackReading);
  }

  function followHash() {
    const id = location.hash.slice(1);
    if (byId.has(id)) select(id, true);
    else scheduleReading();
  }

  window.addEventListener("scroll", scheduleReading, { passive: true });
  window.addEventListener("resize", scheduleReading);
  window.addEventListener("hashchange", followHash);
  window.addEventListener("load", followHash, { once: true });
  followHash();
})();
