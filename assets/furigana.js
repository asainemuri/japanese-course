(() => {
  "use strict";
  const data = window.CourseFuriganaData;
  if (!data || document.querySelector(".furigana-toggle")) return;

  const preferenceKey = "japanese-course.furigana";
  let enabled = true;
  try {
    enabled = localStorage.getItem(preferenceKey) !== "off";
  } catch { /* The switch remains available when browser storage is disabled. */ }

  const control = document.createElement("button");
  control.type = "button";
  control.className = "furigana-toggle";
  control.lang = "zh-CN";
  control.title = "显示或隐藏日语汉字的平假名读音";
  const toolbar = document.querySelector(".mast nav") || document.querySelector(".mast > div");
  if (!toolbar) return;
  toolbar.append(control);

  function renderState() {
    document.documentElement.dataset.furigana = enabled ? "on" : "off";
    control.setAttribute("aria-pressed", String(enabled));
    control.textContent = "汉字注音：" + (enabled ? "开" : "关");
  }

  renderState();
  control.addEventListener("click", () => {
    enabled = !enabled;
    renderState();
    try { localStorage.setItem(preferenceKey, enabled ? "on" : "off"); } catch { /* Page-local preference. */ }
  });
  window.addEventListener("storage", (event) => {
    if (event.key === preferenceKey || event.key === null) {
      enabled = event.newValue !== "off";
      renderState();
    }
  });

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!Object.hasOwn(data, node.data) || parent.closest("ruby, script, style, textarea, code, pre, math, svg, [data-no-furigana]")) return NodeFilter.FILTER_REJECT;
      const language = parent.closest("[lang]")?.getAttribute("lang") || "";
      return /^ja(?:-|$)/i.test(language) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const node of nodes) {
    const fragment = document.createDocumentFragment();
    let cursor = 0;
    for (const [start, length, reading] of data[node.data]) {
      fragment.append(document.createTextNode(node.data.slice(cursor, start)));
      const ruby = document.createElement("ruby");
      ruby.className = "course-ruby";
      ruby.append(document.createTextNode(node.data.slice(start, start + length)));
      const rt = document.createElement("rt");
      rt.textContent = reading;
      ruby.append(rt);
      fragment.append(ruby);
      cursor = start + length;
    }
    fragment.append(document.createTextNode(node.data.slice(cursor)));
    node.replaceWith(fragment);
  }
})();
