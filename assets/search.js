// 双索引检索：支持多关键词空格组合（AND）、课号过滤、假名同形折叠与实时计数。
const form = document.querySelector(".lookup");
const input = document.getElementById("query");
const empty = document.getElementById("empty");
const groups = Array.from(document.querySelectorAll(".group"));

// 片假名折叠为平假名，长音与拗音保持；便于「カクジョシ」与「かくじょし」互搜
const foldKana = (text) => text.replace(/[ァ-ヶ]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60));
const normalize = (text) =>
  foldKana(text.normalize("NFKC").toLowerCase()).replace(/[\s「」『』（）()［］〜~・、，。：；：!?！？*]/g, "");

const searchText = new Map();
let totalRows = 0;
for (const element of document.querySelectorAll(".group h2, .group li")) {
  const copy = element.cloneNode(true);
  for (const reading of copy.querySelectorAll("rt, rp")) reading.remove();
  searchText.set(element, copy.textContent);
  if (element.tagName === "LI") totalRows++;
}

let meta = document.getElementById("lookup-count");
if (!meta && form) {
  meta = document.createElement("p");
  meta.id = "lookup-count";
  meta.className = "lookup-meta";
  meta.setAttribute("aria-live", "polite");
  form.append(meta);
}

function updateMeta(matches, hasQuery, lesson) {
  if (!meta) return;
  if (!hasQuery) {
    meta.textContent = `共收录 ${groups.length} 课 · ${totalRows} 个可检索小节与核心表达`;
    return;
  }
  const scope = lesson ? `第 ${lesson} 课内` : "全库";
  meta.textContent = `匹配 ${matches} / ${totalRows} 个小节条目（${scope}）`;
}

function parseQuery(raw) {
  let lesson = null;
  const tokens = [];
  for (const part of raw.trim().split(/\s+/).filter(Boolean)) {
    const m = part.normalize("NFKC").match(/^(?:第)?0*(\d{1,2})(?:课|課|単元|单元|lesson)?$/i);
    if (m && lesson === null) {
      lesson = Number(m[1]);
      continue;
    }
    const norm = normalize(part);
    if (norm) tokens.push(norm);
  }
  return { lesson, tokens };
}

function filterIndex() {
  const { lesson, tokens } = parseQuery(input.value);
  let matches = 0;
  for (const group of groups) {
    const heading = group.querySelector("h2");
    const num = Number(heading.querySelector("b")?.textContent || 0);
    if (lesson !== null && num !== lesson) {
      group.hidden = true;
      continue;
    }
    const headingHay = normalize(searchText.get(heading) + " " + (group.dataset.topic || ""));
    let rows = 0;
    for (const row of group.querySelectorAll("li")) {
      const rowHay = headingHay + " " + normalize(searchText.get(row) + " " + (row.dataset.terms || "") + " " + (row.dataset.reading || ""));
      row.hidden = tokens.some((token) => !rowHay.includes(token));
      if (!row.hidden) rows++;
    }
    group.hidden = rows === 0;
    matches += rows;
  }
  if (empty) empty.hidden = matches > 0;
  updateMeta(matches, tokens.length > 0 || lesson !== null, lesson);
}

if (form && input) {
  form.hidden = false;
  form.addEventListener("submit", (event) => event.preventDefault());
  input.addEventListener("input", filterIndex);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      input.value = "";
      filterIndex();
    }
  });
  const params = new URLSearchParams(location.search);
  const initial = params.get("q");
  if (initial) input.value = initial;
  filterIndex();
}

document.addEventListener("keydown", (event) => {
  if (event.key === "/" && input && document.activeElement !== input) {
    event.preventDefault();
    input.focus();
  }
});
