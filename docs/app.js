/* AI Security Research Inventory - static dashboard over docs/data/*.json.
   No framework, no build. Everything here reads committed JSON and draws it. */

const FILES = ['papers', 'taxonomy', 'companies', 'gaps', 'derived', 'runs', 'review_queue', 'news', 'frameworks'];

/* Contribution types on the eight categorical slots, in the order that clears
   every adjacent-pair CVD gate in both modes. Render legends and stacks in THIS
   order - a semantic reordering was measured and fails (violet vs blue, dE 1.9
   in dark mode). See styles.css. */
const CONTRIB = ['evaluation', 'analysis', 'defence', 'dataset', 'framework', 'position', 'benchmark', 'attack'];
const contribVar = (t) => (CONTRIB.includes(t) ? `var(--c-${t})` : 'var(--ink-3)');

/* A paper is "new" if the agent imported it in the most recent batch. Seed
   entries are hand-curated and never new - nothing has been imported yet. */
let NEW_SINCE = null;
const isNew = (p) => Boolean(NEW_SINCE && p.curation === 'agent' && p.added >= NEW_SINCE);
const D = {};
let TAX = {}, LEAF = {}, BRANCH = {}, PAPER = {}, NEED = {}, CO = {};

/* ------------------------------------------------------------------ utils */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const el = (tag, attrs = {}, html = '') => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined) continue;
    if (k === 'class') n.className = v; else n.setAttribute(k, v);
  }
  if (html) n.innerHTML = html;
  return n;
};
/* SVG has no text wrapping, which is why these labels were being cut off with
   an ellipsis. Wrap by measuring words against a character budget and emitting
   one tspan per line, then size a rounded box to the result - so the label is a
   card that fits its content rather than a string trimmed to fit a gap. */
function wrapLines(text, maxChars = 30, maxLines = 4) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    if (!cur) { cur = w; continue; }
    if ((cur + ' ' + w).length <= maxChars) cur += ' ' + w;
    else { lines.push(cur); cur = w; if (lines.length === maxLines - 1) break; }
  }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) lines.length = maxLines;
  return lines;
}

const svgEl = (tag, attrs = {}) => {
  const n = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) if (v !== null && v !== undefined) n.setAttribute(k, v);
  return n;
};

/* One sequential ramp, used for every magnitude encoding on the page. */
const RAMP_STEPS = 12;
function ramp(value, max) {
  if (!value) return 'var(--q0)';
  const t = Math.min(1, value / (max || 1));
  // sqrt so the low end of a long-tailed count stays distinguishable
  const step = Math.max(1, Math.min(RAMP_STEPS, Math.ceil(Math.sqrt(t) * RAMP_STEPS)));
  return `var(--q${step})`;
}
/* Ink that stays legible on top of that ramp. The ramp inverts between light and
   dark mode, so the high end is dark in one and pale in the other - both ends are
   CSS variables rather than fixed colours. */
const rampInk = (value, max) =>
  !value ? 'var(--ink-3)'
         : (Math.sqrt(Math.min(1, value / (max || 1))) > 0.52 ? 'var(--on-ramp-hi)' : 'var(--on-ramp-lo)');

function rampLegend(label, max) {
  const cells = [0, 2, 4, 6, 8, 10, 12].map((s) => `<i data-sty="background:var(--q${s})"></i>`).join('');
  return `<span class="li">${esc(label)} <span class="ramp" aria-hidden="true">${cells}</span>
    <span class="sub">0&nbsp;→&nbsp;${max}</span></span>`;
}

/* tooltip */
const tip = $('#tip');
function showTip(e, html) {
  tip.innerHTML = html;
  tip.classList.add('on');
  moveTip(e);
}
function moveTip(e) {
  const pad = 14, r = tip.getBoundingClientRect();
  let x = e.clientX + pad, y = e.clientY + pad;
  if (x + r.width > innerWidth - 8) x = e.clientX - r.width - pad;
  if (y + r.height > innerHeight - 8) y = e.clientY - r.height - pad;
  tip.style.left = Math.max(8, x) + 'px';
  tip.style.top = Math.max(8, y) + 'px';
}
const hideTip = () => tip.classList.remove('on');
function bindTip(node, html) {
  node.addEventListener('mouseenter', (e) => showTip(e, html));
  node.addEventListener('mousemove', moveTip);
  node.addEventListener('mouseleave', hideTip);
}

/* The richer popover. #tip is for one-liners; #card is for where the hover is
   the point of the interaction, which on the research tree it is. */
/* ---------------------------------------------------------------------------
   Content-Security-Policy and data-driven colour.

   The page ships `style-src 'self'` with no 'unsafe-inline'. That blocks inline
   style attributes, which is exactly what a template emitting
   a template interpolating a colour into a style attribute produces - verified
   in a browser, not assumed.

   Weakening the policy to 'unsafe-inline' would have been the easy fix. Instead
   templates emit `data-sty` and this observer applies it through the CSSOM,
   which CSP does not govern. One hook, applied to anything added to the DOM,
   so the rule cannot be forgotten in new code.

   `cssText` only ever receives strings this file builds from palette tokens and
   computed numbers; every interpolated datum goes through esc() first.
--------------------------------------------------------------------------- */
function applySty(root) {
  const nodes = root.querySelectorAll ? root.querySelectorAll('[data-sty]') : [];
  for (const n of nodes) {
    n.style.cssText = n.getAttribute('data-sty');
    n.removeAttribute('data-sty');
  }
  if (root.hasAttribute && root.hasAttribute('data-sty')) {
    root.style.cssText = root.getAttribute('data-sty');
    root.removeAttribute('data-sty');
  }
}
new MutationObserver((records) => {
  for (const r of records) for (const n of r.addedNodes) if (n.nodeType === 1) applySty(n);
}).observe(document.documentElement, { childList: true, subtree: true });
addEventListener('DOMContentLoaded', () => applySty(document.documentElement));

const card = $('#card');
function showCard(e, html) { card.innerHTML = html; card.classList.add('on'); moveCard(e); }
function moveCard(e) {
  const pad = 16, r = card.getBoundingClientRect();
  let x = e.clientX + pad, y = e.clientY + pad;
  if (x + r.width > innerWidth - 10) x = e.clientX - r.width - pad;
  if (y + r.height > innerHeight - 10) y = Math.max(10, e.clientY - r.height - pad);
  card.style.left = Math.max(10, x) + 'px';
  card.style.top = y + 'px';
}
const hideCard = () => card.classList.remove('on');
function bindCard(node, builder) {
  node.addEventListener('mouseenter', (e) => showCard(e, builder()));
  node.addEventListener('mousemove', moveCard);
  node.addEventListener('mouseleave', hideCard);
}

const shortTitle = (t, n = 72) => (t.length > n ? t.slice(0, n - 1) + '…' : t);
const catLabel = (id) => (TAX[id] ? (TAX[id].parent ? `${TAX[TAX[id].parent].label} › ${TAX[id].label}` : TAX[id].label) : id);
const branchOf = (id) => id.split('.')[0];
const tierBadge = (t) => `<span class="badge t-${esc(t)}">${esc(t.replace(/-/g, ' '))}</span>`;
const newBadge = (p) => (isNew(p) ? '<span class="badge is-new">new</span>' : '');
/* Threat-intel reports and policy documents are not papers; the inventory holds
   them because the gap analysis leans on claims about what attackers actually
   do, and that should not rest on academic threat models alone. */
/* 'policys' is not a word. */
const plural = (w) => (w.endsWith('y') ? w.slice(0, -1) + 'ies' : w + 's');
const kindBadge = (p) => (p.kind && p.kind !== 'paper'
  ? `<span class="badge kind-${esc(p.kind)}">${esc(p.kind)}</span>` : '');
/* Metadata as one colour-coded row. Each chip's colour encodes what KIND of
   fact it is - provenance, record type, contribution, standing, recency - so
   the shape of a record registers before you read any of it. */
function metaRow(p, opts = {}) {
  const c = [];
  c.push(tierBadge(p.trust.tier));
  if (p.kind && p.kind !== 'paper') c.push(kindBadge(p));
  c.push(contribBadge(p.contribution_type));
  if (p.date) c.push(`<span class="mchip m-year"><span class="k">yr</span>${esc(p.date.slice(0, 4))}</span>`);
  if (p.citations) c.push(`<span class="mchip m-cites"><span class="d"></span>${p.citations.toLocaleString()} cited</span>`);
  if (opts.venue !== false && p.venue) {
    c.push(`<span class="mchip m-venue" title="${p.venue_source === 'curator'
      ? 'Venue stated by the curator, not verified' : 'Venue verified via Semantic Scholar'}">
      <span class="k">${p.venue_source === 'curator' ? 'unverified' : 'venue'}</span>${esc(shortTitle(p.venue, 30))}</span>`);
  }
  if (opts.orgs !== false && p.organisations?.length) {
    c.push(`<span class="mchip m-org"><span class="d"></span>${esc(p.organisations[0])}${
      p.organisations.length > 1 ? ` +${p.organisations.length - 1}` : ''}</span>`);
  }
  if (isNew(p)) c.push(newBadge(p));
  return `<div class="meta">${c.join('')}</div>`;
}

const contribBadge = (t) =>
  `<span class="badge contrib" data-sty="color:${contribVar(t)}">${esc(t)}</span>`;

/* Stacked contribution mix for a set of papers, drawn in slot order. */
function mixBar(papers, width = 86) {
  if (!papers.length) return '';
  const counts = CONTRIB.map((t) => [t, papers.filter((p) => p.contribution_type === t).length]);
  const total = counts.reduce((a, [, n]) => a + n, 0) || 1;
  const segs = counts.filter(([, n]) => n).map(([t, n]) =>
    `<i data-sty="width:${Math.max(3, (n / total) * width)}px;background:${contribVar(t)}" title="${n} ${t}"></i>`).join('');
  return `<span class="mix" data-sty="width:${width}px">${segs}</span>`;
}
/* Every reference to a paper opens the reader. Reaching the source is one more
   click from there, but the thing the inventory knows comes first. */
const paperLink = (id) => {
  const p = PAPER[id];
  return p ? `<a href="#read" class="plink" data-read="${esc(id)}">${esc(shortTitle(p.title, 84))}</a>` : esc(id);
};
document.addEventListener('click', (e) => {
  const a2 = e.target.closest?.('.plink');
  if (a2) { e.preventDefault(); openReader(a2.dataset.read); }
});

/* ------------------------------------------------------------------- boot */
async function boot() {
  const got = await Promise.all(FILES.map(async (f) => {
    try { const r = await fetch(`data/${f}.json`, { cache: 'no-cache' }); return r.ok ? await r.json() : null; }
    catch { return null; }
  }));
  FILES.forEach((f, i) => { D[f] = got[i]; });

  if (!D.papers || !D.taxonomy) {
    $('#head-sub').textContent = 'could not load data/*.json';
    return;
  }
  D.derived = D.derived || { pairs: [], clusters: [], coverage: {}, cooccurrence: { categories: [], matrix: {} }, tree: { total: {}, paper_ids: {} }, derived_gaps: [] };
  D.gaps = D.gaps || { gaps: [] };
  D.companies = D.companies || { needs: [], companies: [] };
  D.review_queue = D.review_queue || { items: [] };
  D.news = D.news || { items: [] };
  D.frameworks = D.frameworks || { frameworks: [] };

  D.taxonomy.nodes.forEach((n) => { TAX[n.id] = n; (n.parent ? LEAF : BRANCH)[n.id] = n; });
  D.papers.papers.forEach((p) => { PAPER[p.id] = p; });

  // The most recent agent import defines the "new" window: everything the agent
  // added within 10 days of its latest addition. Seed records are hand-curated
  // and excluded, so a fresh repo shows no new tags rather than tagging all 35.
  const agentDates = D.papers.papers.filter((p) => p.curation === 'agent').map((p) => p.added).sort();
  if (agentDates.length) {
    const d = new Date(agentDates[agentDates.length - 1]);
    d.setDate(d.getDate() - 10);
    NEW_SINCE = d.toISOString().slice(0, 10);
  }
  D.companies.needs.forEach((n) => { NEED[n.id] = n; });
  D.companies.companies.forEach((c) => { CO[c.id] = c; });

  initTheme();
  initTabs();
  initDensity();
  initReader();
  renderHead();
  renderOverlaps();
  renderTree();
  renderDemand();
  renderGaps();
  renderPapers();
  renderFrameworks();
  renderExplore();
  renderNews();
  renderPipeline();
  openFromHash();
}

/* Clamp long card explanations and give each a toggle. Applied after render so
   it catches every view, including the ones drawn lazily. */
function initDensity() {
  const apply = () => {
    $$('.card > .note').forEach((n) => {
      if (n.dataset.clamp === 'on') return;
      // Do NOT mark an empty note as skipped: several are filled by their
      // render function after this first pass, and a permanent skip meant they
      // never clamped. Only a note that actually has short content is skipped.
      const len = n.textContent.trim().length;
      if (len === 0) return;
      if (len < 150) { n.dataset.clamp = 'skip'; return; }
      n.dataset.clamp = 'on';
      n.classList.add('clamped');
      const btn = el('button', { class: 'note-more', type: 'button' }, 'Why this view');
      btn.addEventListener('click', () => {
        const open = !n.classList.toggle('clamped');
        btn.textContent = open ? 'Show less' : 'Why this view';
      });
      n.after(btn);
    });
  };
  apply();
  // views render on demand; re-apply when one is shown
  new MutationObserver(apply).observe($('.main'), { childList: true, subtree: true });
}

function initTheme() {
  const saved = (() => { try { return localStorage.getItem('aisec-theme'); } catch { return null; } })();
  if (saved) document.documentElement.dataset.theme = saved;
  $('#theme-btn').addEventListener('click', () => {
    const dark = matchMedia('(prefers-color-scheme: dark)').matches;
    const cur = document.documentElement.dataset.theme || (dark ? 'dark' : 'light');
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('aisec-theme', next); } catch { /* private mode */ }
    redrawCanvases();
  });
}

const VIEWS = ['news', 'overlaps', 'explore', 'tree', 'demand', 'frameworks', 'gaps', 'papers', 'pipeline'];

function initTabs() {
  $$('#tabs .nav').forEach((t) => t.addEventListener('click', () => show(t.dataset.view)));
  addEventListener('hashchange', openFromHash);
  initPalette();

  // The header condenses once you leave the top, so the tab bar stays reachable
  // without the title block eating the viewport.

  const keys = $('#keys');
  const closeKeys = () => keys.removeAttribute('open');
  $('#keys-btn').addEventListener('click', () => keys.toggleAttribute('open'));
  keys.addEventListener('click', closeKeys);

  // Anyone who reads a dashboard twice wants to stop reaching for the mouse.
  addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { openPalette(); e.preventDefault(); return; }
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || '');
    if (e.key === 'Escape') { closeKeys(); hideTip(); hideCard(); document.activeElement?.blur?.(); return; }
    if (typing) return;

    if (e.key >= '1' && e.key <= '9') { show(VIEWS[+e.key - 1]); e.preventDefault(); return; }
    if (e.key === '/') {
      const box = $('section.view.active input[type="search"]');
      if (box) { box.focus(); box.select(); e.preventDefault(); }
      return;
    }
    if (e.key === 't') { $('#theme-btn').click(); return; }
    if (e.key === '?') { keys.toggleAttribute('open'); return; }
    if (e.key === 'k' && !typing) { openPalette(); e.preventDefault(); return; }
    if (e.key === 'g' && $('#view-overlaps').classList.contains('active')) {
      const [tree, graph] = $$('#ov-mode button');
      ($('#ov-tree-wrap').hidden ? tree : graph).click();
    }
  });
  // Reveal the per-tab number hints while Alt is held.
  addEventListener('keydown', (e) => { if (e.key === 'Alt') document.body.classList.add('keys'); });
  addEventListener('keyup', (e) => { if (e.key === 'Alt') document.body.classList.remove('keys'); });
}
function show(view) {
  $$('#tabs .nav').forEach((t) => t.setAttribute('aria-selected', String(t.dataset.view === view)));
  $$('section.view').forEach((s) => s.classList.toggle('active', s.id === `view-${view}`));
  if (location.hash.slice(1) !== view) history.replaceState(null, '', `#${view}`);
  redrawCanvases();
}
const openFromHash = () => {
  const v = location.hash.slice(1);
  show($(`#view-${v}`) ? v : 'news');
};
/* SVG that needs measured width redrawn after a layout or theme change */
function redrawCanvases() {
  if ($('#view-overlaps').classList.contains('active')) {
    if ($('#ov-tree-wrap').hidden) drawGraph(); else drawOverlapTree();
  }
  if ($('#view-tree').classList.contains('active')) drawTree();
  if ($('#view-gaps').classList.contains('active')) drawGapTree();
  if ($('#view-explore').classList.contains('active')) { if (XMODE === 'matrix') drawMatrix(); else drawExplore(); }
}
let resizeT;
addEventListener('resize', () => { clearTimeout(resizeT); resizeT = setTimeout(redrawCanvases, 180); });

function renderHead() {
  const n = D.papers.papers.length;
  const latest = D.runs?.latest;
  const when = latest?.finished?.slice(0, 10) || D.papers.updated;
  $('#head-sub').innerHTML =
    `<span class="mchip m-year">${n}</span> records`
    + `<span class="mchip m-year">${D.derived.pairs.length}</span> overlaps`
    + `<span class="mchip m-year">${Object.keys(LEAF).length}</span> categories`
    + `<div class="side-when">updated ${esc(when)}</div>`;
  if ($('#foot-updated')) $('#foot-updated').innerHTML = `Inventory updated ${esc(D.papers.updated)}. Derived figures generated ${esc(D.derived.generated || '—')}.`;

  const counts = {
    news: (D.news.items || []).length,
    overlaps: D.derived.pairs.length,
    tree: Object.keys(LEAF).length,
    demand: D.companies.companies.length,
    frameworks: (D.frameworks.frameworks || []).length,
    gaps: (D.gaps.gaps || []).length,
    papers: D.papers.papers.length,
    pipeline: (D.runs?.runs || []).length,
  };
  $$('[data-count]').forEach((el2) => { el2.textContent = counts[el2.dataset.count] ?? ''; });

  const fresh = D.papers.papers.filter(isNew);
  if ($('#new-pill')) $('#new-pill').innerHTML = fresh.length
    ? `${fresh.length} new since ${esc(NEW_SINCE)}`
    : '';

  if ($('#contrib-legend')) $('#contrib-legend').innerHTML = CONTRIB.map((t) => {
    const n = D.papers.papers.filter((p) => p.contribution_type === t).length;
    return n ? `<span class="li"><span class="swatch" data-sty="background:${contribVar(t)}"></span>${esc(t)} <span class="sub">${n}</span></span>` : '';
  }).join('');
}

/* =================================================================== OVERLAPS */
function renderOverlaps() {
  const papers = D.papers.papers, pairs = D.derived.pairs, clusters = D.derived.clusters;
  const stated = pairs.filter((p) => p.declared).length;
  const clustered = clusters.reduce((a, c) => a + c.size, 0);

  $('#ov-stats').innerHTML = [
    [papers.length, 'papers in the inventory'],
    [pairs.length, 'overlapping pairs'],
    [clusters.length, 'research clusters'],
    [`${Math.round((clustered / papers.length) * 100)}%`, 'papers inside a cluster'],
    [stated, 'overlaps stated, not inferred'],
  ].map(([v, k]) => `<div class="stat"><div class="v">${esc(v)}</div><div class="k">${esc(k)}</div></div>`).join('');

  $('#ov-legend').innerHTML = clusters.map((c, i) =>
    `<span class="li"><span class="swatch" data-sty="background:var(--s${(i % 3) + 1})"></span>${esc(c.label)} <span class="sub">(${c.size})</span></span>`
  ).join('') + '<span class="li"><span class="swatch" data-sty="background:var(--axis)"></span>unclustered</span>';

  /* clusters */
  $('#ov-clusters').innerHTML = clusters.map((c, i) => `
    <div class="cl" data-sty="border-left-color:var(--s${(i % 3) + 1})">
      <h3>${esc(c.label)}</h3>
      <div class="meta">${c.size} papers, mean overlap ${c.mean_score}. Shares
        ${c.shared.slice(0, 4).map((s) => esc(TAX[s]?.label || s)).join(', ')}
        <div data-sty="margin-top:6px">${mixBar(c.papers.map((id) => PAPER[id]).filter(Boolean), 150)}</div></div>
      <ol>${c.papers.map((id) => `<li>${paperLink(id)} <span class="sub">${esc(PAPER[id]?.date?.slice(0, 4) || '')}</span>${PAPER[id] && isNew(PAPER[id]) ? ' <span class="badge is-new">new</span>' : ''}</li>`).join('')}</ol>
    </div>`).join('') || '<p class="empty">No clusters yet.</p>';

  drawOverlapTree();
  $$('#ov-mode button').forEach((b) => b.addEventListener('click', () => {
    $$('#ov-mode button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    const tree = b.dataset.m === 'tree';
    $('#ov-tree-wrap').hidden = !tree;
    $('#ov-graph-wrap').hidden = tree;
    if (tree) drawOverlapTree(); else drawGraph();
  }));
  renderMatrix('branch');
  $$('#mx-level button').forEach((b) => b.addEventListener('click', () => {
    $$('#mx-level button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    renderMatrix(b.dataset.level);
  }));

  const drawPairs = () => {
    const q = $('#pair-q').value.trim().toLowerCase();
    const only = $('#pair-declared').checked;
    const rows = pairs.filter((p) => {
      if (only && !p.declared) return false;
      if (!q) return true;
      const hay = [PAPER[p.a]?.title, PAPER[p.b]?.title, ...p.shared_categories.map(catLabel), p.note].join(' ').toLowerCase();
      return hay.includes(q);
    });
    $('#ov-pairs').innerHTML = rows.slice(0, 160).map((p) => `
      <li>
        <div class="score">${p.score.toFixed(2)}<i data-sty="width:${Math.round(p.score * 100)}%"></i></div>
        <div>
          <div class="pair-t">${paperLink(p.a)}<span class="j">↔</span>${paperLink(p.b)}
            ${p.declared ? '<span class="badge">stated</span>' : ''}</div>
          ${p.note ? `<div class="pair-why">${esc(p.note)}</div>` : ''}
          <div class="ev">${p.shared_categories.map((c) => `<span>${esc(catLabel(c))}</span>`).join('')}
            ${p.shared_methods.slice(0, 3).map((m) => `<span>${esc(m)}</span>`).join('')}</div>
        </div>
      </li>`).join('') || '<li class="empty">Nothing matches that filter.</li>';
  };
  $('#pair-q').addEventListener('input', drawPairs);
  $('#pair-declared').addEventListener('change', drawPairs);
  drawPairs();
}

/* --- overlap TREE: the same relationships, laid out so they can be read. -----
   A cluster is a research conversation; its papers hang off it ordered by how
   tightly they are bound into it (summed overlap strength). The bar beside each
   paper is that strength, so "who is central to this argument" is legible at a
   glance - which is exactly what the force layout obscures. */
function drawOverlapTree() {
  const svg = $('#overlap-tree');
  const { clusters, pairs } = D.derived;
  const papers = D.papers.papers;
  if (!papers.length) return;

  const bound = {};
  pairs.forEach((p) => {
    bound[p.a] = (bound[p.a] || 0) + p.score;
    bound[p.b] = (bound[p.b] || 0) + p.score;
  });
  const maxBound = Math.max(1, ...Object.values(bound));

  const inCluster = new Set(clusters.flatMap((c) => c.papers));
  const loose = papers.filter((p) => !inCluster.has(p.id));
  const groups = clusters.map((c, i) => ({
    label: c.label, slot: (i % 3) + 1, shared: c.shared,
    papers: [...c.papers].sort((x, y) => (bound[y] || 0) - (bound[x] || 0)),
  }));
  if (loose.length) {
    groups.push({
      label: 'Not yet overlapping anything', slot: 0, shared: [],
      papers: loose.map((p) => p.id),
    });
  }

  const ROW = 22, X0 = 16, X1 = 286, X2 = 336, BARW = 54, TOP = 28;
  // A two-paper cluster occupies 66px of rows but its label box can be taller,
  // so each group reserves whichever is larger. Without this the boxes overlap
  // exactly where the tree is sparsest.
  const LH = 15, PAD = 9;
  groups.forEach((g) => {
    g._lines = wrapLines(g.label, 30, 3);
    g._boxH = g._lines.length * LH + 16 + PAD;
    g._need = Math.max(ROW * (g.papers.length + 1), g._boxH + 16);
  });
  const H = TOP + groups.reduce((acc, g) => acc + g._need, 0) + 30;
  const W = 1040;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('width', W);
  svg.setAttribute('height', H);
  svg.textContent = '';

  const gLink = svgEl('g'), gNode = svgEl('g');
  svg.append(gLink, gNode);
  const curve = (x1, y1, x2, y2) => {
    const mx = (x1 + x2) / 2;
    return `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`;
  };

  let y = TOP;
  const groupY = [];
  groups.forEach((g) => {
    // centre the paper rows inside the space this group reserved
    const block = g.papers.length * ROW;
    const first = y + (g._need - block) / 2 - ROW / 2;
    const childY = g.papers.map((_, i) => first + (i + 1) * ROW);
    const gy = childY.length ? (childY[0] + childY[childY.length - 1]) / 2 : y + g._need / 2;
    groupY.push(gy);

    g.papers.forEach((id, i) => {
      gLink.append(svgEl('path', { d: curve(X1 + 8, gy, X2 - 7, childY[i]), class: 'link' }));
    });

    // cluster node: a boxed, wrapped label so the full name is readable
    const cg = svgEl('g', { class: 'node-c' });
    const colour = g.slot ? `var(--s${g.slot})` : 'var(--axis)';
    const lines = g._lines;
    const BOXW = 250;
    const boxH = g._boxH;
    const slotTop = y, slotBot = y + g._need;
    const boxY = Math.max(slotTop + 6, Math.min(gy - boxH / 2, slotBot - boxH - 6));
    cg.append(svgEl('rect', {
      x: X1 - 13 - BOXW, y: boxY, width: BOXW, height: boxH, rx: 9,
      fill: 'var(--page)', stroke: 'var(--ring)', 'stroke-width': 1,
    }));
    cg.append(svgEl('rect', {
      x: X1 - 13 - BOXW, y: boxY, width: 3, height: boxH, rx: 1.5, fill: colour,
    }));
    lines.forEach((ln, i) => {
      const t = svgEl('text', {
        x: X1 - 13 - BOXW + 12, y: boxY + PAD + 5 + i * LH + 6,
        'font-size': 12.5, 'font-weight': 600, fill: 'var(--ink)',
      });
      t.textContent = ln;
      cg.append(t);
    });
    const ct = svgEl('text', {
      x: X1 - 13 - BOXW + 12, y: boxY + PAD + 5 + lines.length * LH + 7,
      'font-size': 10.5, fill: 'var(--ink-3)',
    });
    ct.textContent = `${g.papers.length} papers`;
    cg.append(ct);
    cg.append(svgEl('circle', { cx: X1, cy: gy, r: 7, fill: colour, stroke: 'var(--surface-1)', 'stroke-width': 2 }));
    const members = g.papers.map((id) => PAPER[id]).filter(Boolean);
    bindCard(cg, () => `
      <div class="hd"><h4>${esc(g.label)}</h4><div class="path">research cluster</div></div>
      <div class="bd">
        <div class="nums"><div><b>${g.papers.length}</b><span>papers</span></div>
          <div><b>${g.shared.length}</b><span>shared categories</span></div>
          <div><b>${members.filter(isNew).length}</b><span>new</span></div></div>
        <p>${esc(g.shared.slice(0, 4).map((c) => TAX[c]?.label || c).join(', ')) || 'No single shared category.'}</p>
        <div>${mixBar(members, 160)}</div>
        <div class="hint">Contribution mix — attack red, defence green, evaluation blue.</div>
      </div>`);
    gNode.append(cg);

    // paper nodes
    g.papers.forEach((id, i) => {
      const p = PAPER[id];
      if (!p) return;
      const py = childY[i];
      const pg = svgEl('g', { class: 'node-c' });
      const strength = (bound[id] || 0) / maxBound;
      pg.append(svgEl('rect', {
        x: X2, y: py - 4, width: Math.max(3, strength * BARW), height: 8, rx: 3,
        fill: g.slot ? `var(--s${g.slot})` : 'var(--axis)', 'fill-opacity': 0.55,
      }));
      pg.append(svgEl('circle', {
        cx: X2 + BARW + 14, cy: py, r: 5,
        fill: contribVar(p.contribution_type),
        stroke: isNew(p) ? 'var(--good)' : 'var(--surface-1)',
        'stroke-width': isNew(p) ? 2.5 : 1.5,
      }));
      const t = svgEl('text', { x: X2 + BARW + 24, y: py + 4, 'font-size': 11.5, fill: 'var(--ink)' });
      t.textContent = (p.short || shortTitle(p.title, 52));
      pg.append(t);
      if (isNew(p)) {
        const nt = svgEl('text', { x: X2 - 8, y: py + 4, 'text-anchor': 'end', 'font-size': 9, fill: 'var(--good)', 'font-weight': 700 });
        nt.textContent = 'NEW';
        pg.append(nt);
      }
      pg.addEventListener('click', () => openReader(p.id));
      bindCard(pg, () => paperCard(p, bound[id] || 0));
      gNode.append(pg);
    });
    y += g._need;
  });
}

function paperCard(p, boundScore) {
  const overlaps = (p.overlaps_with || []).slice(0, 3);
  return `
    <div class="hd"><h4>${esc(shortTitle(p.title, 96))}</h4>
      <div class="path">${esc(catLabel(p.primary_category))}</div></div>
    <div class="bd">
      <div class="nums">
        <div><b>${(p.overlaps_with || []).length}</b><span>overlaps</span></div>
        <div><b>${p.date.slice(0, 4)}</b><span>${esc(p.trust.tier.replace(/-/g, ' '))}</span></div>
        ${boundScore ? `<div><b>${boundScore.toFixed(1)}</b><span>bound to cluster</span></div>` : ''}
      </div>
      <p>${esc(p.what_its_about.slice(0, 190))}${p.what_its_about.length > 190 ? '…' : ''}</p>
      <div>${contribBadge(p.contribution_type)} ${esc(p.organisations.slice(0, 2).join(', '))}</div>
      ${overlaps.length ? `<ul>${overlaps.map((o) =>
        `<li><b>${esc(shortTitle(PAPER[o.id]?.short || PAPER[o.id]?.title || o.id, 42))}</b><br>${esc(o.shared)}</li>`).join('')}</ul>` : ''}
      <div class="hint">Click to read it here.</div>
    </div>`;
}

/* --- force-directed overlap graph. Deterministic: same layout every load. --- */
function mulberry(seed) {
  return () => {
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function drawGraph() {
  const svg = $('#graph');
  const host = svg.parentElement;
  const W = Math.max(640, Math.min(1200, host.clientWidth || 900));
  const H = Math.round(Math.min(640, Math.max(420, W * 0.56)));
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('width', W);
  svg.setAttribute('height', H);
  svg.textContent = '';

  const pairs = D.derived.pairs, papers = D.papers.papers;
  if (!papers.length) return;

  const clusterOf = {};
  D.derived.clusters.forEach((c, i) => c.papers.forEach((id) => { clusterOf[id] = i; }));

  const deg = {};
  pairs.forEach((p) => { deg[p.a] = (deg[p.a] || 0) + 1; deg[p.b] = (deg[p.b] || 0) + 1; });
  const maxDeg = Math.max(1, ...Object.values(deg));

  const rand = mulberry(20261104);
  const nodes = papers.map((p, i) => {
    const a = (i / papers.length) * Math.PI * 2;
    return {
      id: p.id, p,
      x: W / 2 + Math.cos(a) * (W / 4) + (rand() - 0.5) * 40,
      y: H / 2 + Math.sin(a) * (H / 4) + (rand() - 0.5) * 40,
      vx: 0, vy: 0,
      r: 4.5 + 5.5 * Math.sqrt((deg[p.id] || 0) / maxDeg),
      c: clusterOf[p.id],
    };
  });
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const links = pairs.filter((p) => byId[p.a] && byId[p.b]).map((p) => ({ s: byId[p.a], t: byId[p.b], w: p.score, note: p.note }));

  /* simulation: repulsion + springs + gravity, annealed */
  const REP = 3200, SPRING = 0.030, GRAV = 0.004, PAD = 48;
  for (let step = 0; step < 420; step++) {
    const cool = 1 - step / 420;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        let dx = b.x - a.x, dy = b.y - a.y;
        let d2 = dx * dx + dy * dy;
        if (d2 < 1) { dx = (rand() - 0.5) * 2; dy = (rand() - 0.5) * 2; d2 = 1; }
        const f = REP / d2, d = Math.sqrt(d2);
        const fx = (dx / d) * f, fy = (dy / d) * f;
        a.vx -= fx; a.vy -= fy; b.vx += fx; b.vy += fy;
      }
    }
    for (const l of links) {
      const dx = l.t.x - l.s.x, dy = l.t.y - l.s.y;
      const d = Math.max(1, Math.hypot(dx, dy));
      const target = 54 + 68 * (1 - l.w);
      const f = (d - target) * SPRING * (0.5 + l.w);
      const fx = (dx / d) * f, fy = (dy / d) * f;
      l.s.vx += fx; l.s.vy += fy; l.t.vx -= fx; l.t.vy -= fy;
    }
    for (const n of nodes) {
      n.vx += (W / 2 - n.x) * GRAV; n.vy += (H / 2 - n.y) * GRAV;
      n.x += n.vx * cool * 0.5; n.y += n.vy * cool * 0.5;
      n.vx *= 0.82; n.vy *= 0.82;
      n.x = Math.max(PAD, Math.min(W - PAD, n.x));
      n.y = Math.max(PAD, Math.min(H - PAD, n.y));
    }
  }

  /* Fit the settled layout to the canvas. Positions are scaled, radii are not,
     so node size keeps meaning; edge length never encoded anything. A mild
     anisotropy cap stops a tall-thin component being stretched into a smear. */
  {
    const xs = nodes.map((n) => n.x), ys = nodes.map((n) => n.y);
    const x0 = Math.min(...xs), x1 = Math.max(...xs);
    const y0 = Math.min(...ys), y1 = Math.max(...ys);
    let sx = (W - 2 * PAD) / Math.max(1, x1 - x0);
    let sy = (H - 2 * PAD) / Math.max(1, y1 - y0);
    const lo = Math.min(sx, sy);
    sx = Math.min(sx, lo * 1.6); sy = Math.min(sy, lo * 1.6);
    const ox = (W - (x1 - x0) * sx) / 2, oy = (H - (y1 - y0) * sy) / 2;
    for (const n of nodes) { n.x = ox + (n.x - x0) * sx; n.y = oy + (n.y - y0) * sy; }
  }

  const gL = svgEl('g'), gN = svgEl('g');
  svg.append(gL, gN);
  for (const l of links) {
    const line = svgEl('line', {
      x1: l.s.x.toFixed(1), y1: l.s.y.toFixed(1), x2: l.t.x.toFixed(1), y2: l.t.y.toFixed(1),
      class: 'edge', 'stroke-width': (0.7 + l.w * 2.6).toFixed(2), 'stroke-opacity': (0.3 + l.w * 0.5).toFixed(2),
    });
    gL.append(line);
  }
  for (const n of nodes) {
    const g = svgEl('g', { class: 'node-c' });
    const fill = n.c === undefined ? 'var(--axis)' : `var(--s${(n.c % 3) + 1})`;
    const c = svgEl('circle', {
      cx: n.x.toFixed(1), cy: n.y.toFixed(1), r: n.r.toFixed(1),
      fill, stroke: 'var(--surface-1)', 'stroke-width': 2,
    });
    g.append(c);
    g.addEventListener('click', () => openReader(n.p.id));
    bindTip(g, `<b>${esc(shortTitle(n.p.title, 92))}</b>
      <span class="r">${esc(n.p.organisations.slice(0, 3).join(', '))}, ${esc(n.p.date)}</span>
      <span class="r">${esc(catLabel(n.p.primary_category))} — ${deg[n.id] || 0} overlaps</span>
      <ul><li>${esc(n.p.what_its_about.slice(0, 180))}…</li></ul>`);
    gN.append(g);
  }
  /* Direct labels on the hubs - the legend alone must not carry identity. */
  /* Papers may carry an explicit `short`; otherwise derive one from the title.
     Some titles - "Not what you've signed up for..." - do not truncate usefully. */
  const shortName = (p) => {
    if (p.short) return p.short;
    const head = p.title.split(/[:(]/)[0].trim();
    const words = head.split(/\s+/);
    let out = words.slice(0, 3).join(' ');
    if (out.length > 26) out = words.slice(0, 2).join(' ');
    if (out.length > 26) out = out.slice(0, 25) + '…';
    return out.replace(/[,.;]$/, '');
  };
  [...nodes].sort((a, b) => (deg[b.id] || 0) - (deg[a.id] || 0)).slice(0, 8).forEach((n) => {
    const right = n.x < W * 0.72;
    const t = svgEl('text', {
      x: (n.x + (right ? n.r + 6 : -n.r - 6)).toFixed(1), y: (n.y + 3.5).toFixed(1),
      'text-anchor': right ? 'start' : 'end',
      'font-size': 10.5, fill: 'var(--ink-2)', 'pointer-events': 'none',
      stroke: 'var(--surface-1)', 'stroke-width': 3, 'paint-order': 'stroke',
      'stroke-linejoin': 'round',
    });
    t.textContent = shortName(n.p);
    gN.append(t);
  });
}

/* --- co-occurrence matrix, branch level or full leaf detail --- */
function renderMatrix(level) {
  const { categories, matrix } = D.derived.cooccurrence;
  let keys, label, cells;

  if (level === 'branch') {
    keys = Object.keys(BRANCH).filter((b) => categories.some((c) => branchOf(c) === b));
    label = (b) => TAX[b].label;
    cells = {};
    keys.forEach((a) => {
      cells[a] = {};
      keys.forEach((b) => {
        if (a === b) {
          cells[a][b] = D.papers.papers.filter((p) => p.categories.some((c) => branchOf(c) === a)).length;
        } else {
          cells[a][b] = D.papers.papers.filter((p) =>
            p.categories.some((c) => branchOf(c) === a) && p.categories.some((c) => branchOf(c) === b)).length;
        }
      });
    });
  } else {
    keys = categories;
    label = (c) => TAX[c]?.label || c;
    cells = matrix;
  }

  const max = Math.max(1, ...keys.flatMap((a) => keys.map((b) => (a === b ? 0 : cells[a][b]))));
  const diagMax = Math.max(1, ...keys.map((a) => cells[a][a]));
  $('#mx-legend').innerHTML = rampLegend('papers in common', max);

  const t = el('table', { class: 'grid' });
  const head = el('tr');
  head.append(el('th'));
  keys.forEach((k) => head.append(el('th', { class: 'colh' }, `<span>${esc(label(k))}</span>`)));
  t.append(head);

  keys.forEach((a) => {
    const tr = el('tr');
    tr.append(el('th', { class: 'rowh' }, esc(label(a))));
    keys.forEach((b) => {
      const v = cells[a][b] || 0;
      const diag = a === b;
      const td = el('td', { class: 'cell' + (v ? '' : ' zero') });
      td.style.background = diag ? ramp(v, diagMax) : ramp(v, max);
      td.style.color = rampInk(v, diag ? diagMax : max);
      if (diag) td.style.boxShadow = '0 0 0 1px var(--ink-3) inset';
      td.innerHTML = v ? `<span>${v}</span>` : '';
      bindTip(td, diag
        ? `<b>${esc(label(a))}</b><span class="r">${v} paper${v === 1 ? '' : 's'} filed here</span>`
        : `<b>${esc(label(a))} ↔ ${esc(label(b))}</b><span class="r">${v} paper${v === 1 ? '' : 's'} tagged with both</span>`);
      tr.append(td);
    });
    t.append(tr);
  });
  $('#ov-matrix').innerHTML = '';
  $('#ov-matrix').append(t);
}

/* ======================================================================= TREE */
let TREE_FILTER = 'all';
function renderTree() {
  $$('#tree-filter button').forEach((b) => b.addEventListener('click', () => {
    $$('#tree-filter button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    TREE_FILTER = b.dataset.f;
    drawTree();
  }));
  drawTree();
}

function drawTree() {
  const svg = $('#tree');
  const total = D.derived.tree.total || {};
  const roots = Object.keys(BRANCH);
  const maxN = Math.max(1, ...Object.values(total));
  $('#tree-legend').innerHTML = rampLegend('papers at or under a node', maxN) +
    '<span class="li"><span class="swatch" data-sty="background:transparent;box-shadow:0 0 0 1.5px var(--axis) inset"></span>empty leaf</span>';

  /* which leaves to draw */
  const visible = (id) => {
    const n = total[id] || 0;
    if (TREE_FILTER === 'covered') return n > 0;
    if (TREE_FILTER === 'empty') return n === 0;
    return true;
  };

  const ROW = 21, X0 = 14, X1 = 232, X2 = 470, TOP = 26;
  const rows = [];
  roots.forEach((b) => {
    const kids = Object.keys(LEAF).filter((l) => TAX[l].parent === b && visible(l));
    if (!kids.length && TREE_FILTER !== 'all') return;
    rows.push({ id: b, depth: 1, kids });
    kids.forEach((k) => rows.push({ id: k, depth: 2 }));
  });

  let y = TOP;
  const pos = {};
  rows.forEach((r) => { pos[r.id] = { y, depth: r.depth }; y += ROW + (r.depth === 1 ? 5 : 0); });
  roots.forEach((b) => {
    const kids = (rows.find((r) => r.id === b) || {}).kids || [];
    if (kids.length) pos[b].y = (pos[kids[0]].y + pos[kids[kids.length - 1]].y) / 2;
  });

  const H = y + 18;
  const W = 900;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('width', W);
  svg.setAttribute('height', H);
  svg.textContent = '';

  const rootY = roots.length ? (pos[roots[0]].y + pos[roots[roots.length - 1]].y) / 2 : TOP;
  const gLink = svgEl('g'), gNode = svgEl('g');
  svg.append(gLink, gNode);

  const curve = (x1, y1, x2, y2) => {
    const mx = (x1 + x2) / 2;
    return `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`;
  };

  // root -> branches
  roots.forEach((b) => {
    if (!pos[b]) return;
    gLink.append(svgEl('path', { d: curve(X0 + 8, rootY, X1 - 7, pos[b].y), class: 'link' }));
    const kids = (rows.find((r) => r.id === b) || {}).kids || [];
    kids.forEach((k) => gLink.append(svgEl('path', { d: curve(X1 + 7, pos[b].y, X2 - 7, pos[k].y), class: 'link' })));
  });

  // root marker
  const rg = svgEl('g');
  rg.append(svgEl('circle', { cx: X0 + 8, cy: rootY, r: 6, fill: 'var(--ink)' }));
  const rt = svgEl('text', { x: X0 + 8, y: rootY - 13, 'font-size': 11, fill: 'var(--ink-2)', 'text-anchor': 'middle' });
  rt.textContent = `${D.papers.papers.length}`;
  rg.append(rt);
  gNode.append(rg);

  const node = (id, x, ny, isLeaf) => {
    const n = total[id] || 0;
    const g = svgEl('g', { class: 'node-c' });
    const r = isLeaf ? 5.5 : 7;
    const c = svgEl('circle', {
      cx: x, cy: ny, r,
      fill: n ? ramp(n, maxN) : 'none',
      stroke: n ? 'var(--surface-1)' : 'var(--axis)',
      'stroke-width': n ? 1.5 : 1.5,
      'stroke-dasharray': n ? null : '2.5 2',
    });
    g.append(c);
    const t = svgEl('text', {
      x: x + r + 7, y: ny + 3.8, 'font-size': isLeaf ? 11.5 : 12.5,
      fill: n ? 'var(--ink)' : 'var(--ink-3)',
      'font-weight': isLeaf ? 400 : 600,
    });
    t.textContent = TAX[id].label;
    g.append(t);
    gNode.append(g);
    if (n) {
      // Measure the rendered label rather than guessing from character count -
      // glyph widths vary enough that an estimate collides.
      const cnt = svgEl('text', {
        x: (x + r + 7 + t.getComputedTextLength() + 7).toFixed(1), y: ny + 3.8,
        'font-size': 10.5, fill: 'var(--ink-3)',
      });
      cnt.textContent = n;
      g.append(cnt);
    }
    g.addEventListener('click', () => treePanel(id));
    bindCard(g, () => nodeCard(id, isLeaf));
  };

  roots.forEach((b) => {
    if (!pos[b]) return;
    node(b, X1, pos[b].y, false);
    ((rows.find((r) => r.id === b) || {}).kids || []).forEach((k) => node(k, X2, pos[k].y, true));
  });
}

/* The research tree's hover is the main way people read it, so it gets the full
   card: what sits here, how much, what kind of work it is, and whether any gap
   claims this node - that last one is what turns the tree into a diagnosis
   rather than a filing cabinet. */
function nodeCard(id, isLeaf) {
  const node = TAX[id];
  const ids = (D.derived.tree.paper_ids || {})[id] || [];
  const papers = ids.map((i) => PAPER[i]).filter(Boolean);
  const maxN = Math.max(1, ...Object.values(D.derived.tree.total || {}));
  const fresh = papers.filter(isNew);

  const gaps = (D.gaps.gaps || []).filter((g) => (g.categories || []).includes(id));
  const needs = D.companies.needs.filter((n) => n.categories.includes(id));
  const demand = needs.length
    ? Math.max(...needs.map((n) => D.derived.coverage?.[n.id]?.mean_demand || 0))
    : 0;

  const recent = [...papers].sort((x, y) => y.date.localeCompare(x.date)).slice(0, 3);

  return `
    <div class="hd">
      <h4>${esc(node.label)}</h4>
      <div class="path">${esc(node.parent ? `${TAX[node.parent].label} › leaf` : 'branch')}</div>
    </div>
    <div class="bd">
      ${node.means ? `<p class="nc-means">${esc(node.means)}</p>` : `<p>${esc(node.blurb || '')}</p>`}
      ${node.example ? `<p class="nc-eg"><b>For example</b> ${esc(node.example)}</p>` : ''}
      <div class="nums">
        <div><b>${papers.length}</b><span>papers${isLeaf ? '' : ' in branch'}</span></div>
        <div><b>${demand ? demand.toFixed(1) : '—'}</b><span>peak demand /5</span></div>
        ${fresh.length ? `<div><b data-sty="color:var(--good)">${fresh.length}</b><span>new</span></div>` : ''}
      </div>
      ${papers.length
        ? `<div>${mixBar(papers, 180)}</div>
           <div class="hint">${CONTRIB.filter((t) => papers.some((p) => p.contribution_type === t)).join(', ')}</div>`
        : `<p class="warn">Nothing filed here. ${demand >= 3.5
             ? `Demand for this is ${demand.toFixed(1)}/5 — an empty leaf under real demand is the strongest kind of gap signal.`
             : 'Low measured demand, so an empty leaf here may simply be uninteresting.'}</p>`}
      ${gaps.length ? `<ul>${gaps.map((g) =>
        `<li><b>Named in a gap:</b> ${esc(g.title)}</li>`).join('')}</ul>` : ''}
      ${recent.length ? `<ul>${recent.map((p) =>
        `<li>${esc(shortTitle(p.short || p.title, 44))} <span data-sty="color:var(--ink-3)">${esc(p.date.slice(0, 4))}</span>${isNew(p) ? ' <b data-sty="color:var(--good)">NEW</b>' : ''}</li>`).join('')}</ul>` : ''}
      <div class="hint">Click to list everything here.</div>
    </div>`;
}

function treePanel(id) {
  const ids = (D.derived.tree.paper_ids || {})[id] || [];
  const n = TAX[id];
  $('#tree-panel-h').innerHTML = `${esc(n.parent ? catLabel(id) : n.label)} <span class="sub">${ids.length} paper${ids.length === 1 ? '' : 's'}</span>`;
  if (!ids.length) {
    $('#tree-panel').innerHTML = `
      ${n.means ? `<p class="cat-means">${esc(n.means)}</p>` : ''}
      ${n.example ? `<p class="cat-eg"><b>For example</b> ${esc(n.example)}</p>` : ''}
      <p class="note">${esc(n.blurb || '')}</p>
      <p class="empty">Nothing filed here yet — an empty leaf is a coverage hole, not a mistake in the tree.</p>`;
    return;
  }
  $('#tree-panel').innerHTML = `
    ${n.means ? `<p class="cat-means">${esc(n.means)}</p>` : ''}
    ${n.example ? `<p class="cat-eg"><b>For example</b> ${esc(n.example)}</p>` : ''}
    <p class="note">${esc(n.blurb || '')}</p>` + ids.map((pid) => {
    const p = PAPER[pid];
    if (!p) return '';
    return `<div data-sty="border-top:1px solid var(--grid);padding:10px 0">
      <div><a href="#read" class="plink" data-read="${esc(p.id)}">${esc(p.title)}</a></div>
      <div class="tp-meta">${metaRow(p)}</div>
      <div data-sty="font-size:12.5px">${esc(p.what_its_about)}</div></div>`;
  }).join('');
  $('#tree-panel-card').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ===================================================================== DEMAND */
function renderDemand() {
  $('#demand-basis').innerHTML = esc(D.companies.basis || '')
    + ' <a href="#methodology" class="jump">How this was scored</a>';
  $$('#hm-sort button').forEach((b) => b.addEventListener('click', () => {
    $$('#hm-sort button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    drawHeatmap(b.dataset.s);
  }));
  drawHeatmap('demand');
  drawPressure();
  drawMethodology();
}

/* A heat map is a persuasive object. If the numbers behind it are judgements,
   the artefact has to say so somewhere a reader will actually look - including
   the test that would prove it worthless. */
function drawMethodology() {
  const m = D.companies.methodology;
  if (!m) { $('#meth-body').innerHTML = ''; return; }
  const order = { high: 0, medium: 1, low: 2 };
  const conf = (c) => `<span class="badge conf-${esc(c)}">${esc(c)} confidence</span>`;
  $('#meth-body').innerHTML = `
    <p class="claim">${esc(m.what_a_score_is)}</p>

    <h3 class="sub-h">The scale</h3>
    <ul class="plain">${m.how_scored.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>

    <h3 class="sub-h">Biases pushing these numbers around</h3>
    <dl class="biases">${m.biases_to_hold_in_mind.map((b) =>
      `<dt>${esc(b.bias)}</dt><dd>${esc(b.effect)}</dd>`).join('')}</dl>

    <h3 class="sub-h">What it cannot tell you</h3>
    <ul class="plain">${m.what_it_cannot_tell_you.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>

    <h3 class="sub-h">How to use it</h3>
    <p class="claim">${esc(m.how_to_use_it)}</p>

    <h3 class="sub-h">What would prove it wrong</h3>
    <p class="claim">${esc(m.falsification)}</p>

    <h3 class="sub-h">What each row rests on</h3>
    <table class="list"><thead><tr><th>Organisation</th><th>Evidence behind its scores</th><th>Confidence</th></tr></thead>
      <tbody>${[...D.companies.companies]
        .sort((x, y) => (order[x.confidence] - order[y.confidence]) || x.label.localeCompare(y.label))
        .map((c) => `<tr><td><b>${esc(c.label)}</b><div class="sub">${esc(c.type)}</div></td>
          <td>${esc(c.basis || '')}</td><td class="num">${conf(c.confidence || 'low')}</td></tr>`).join('')}
      </tbody></table>`;
}

function drawHeatmap(sort) {
  const needs = D.companies.needs;
  const cov = D.derived.coverage || {};
  const total = (c) => needs.reduce((a, n) => a + (c.cells[n.id]?.score || 0), 0);
  let rows = [...D.companies.companies];
  if (sort === 'demand') rows.sort((a, b) => total(b) - total(a));
  else if (sort === 'name') rows.sort((a, b) => a.label.localeCompare(b.label));
  else rows.sort((a, b) => (a.type + a.label).localeCompare(b.type + b.label));

  const cols = [...needs].sort((a, b) => (cov[b.id]?.mean_demand || 0) - (cov[a.id]?.mean_demand || 0));

  $('#hm-legend').innerHTML = rampLegend('demand', 5) +
    '<span class="li"><span class="swatch sourced-key"></span>anchored to a published source — click to open it</span>' +
    '<span class="li"><span class="swatch" data-sty="background:var(--q4)"></span>seed estimate</span>';

  const t = el('table', { class: 'grid' });
  const head = el('tr');
  head.append(el('th'));
  cols.forEach((n) => head.append(el('th', { class: 'colh' }, `<span>${esc(n.label)}</span>`)));
  head.append(el('th', { class: 'colh' }, '<span>row total</span>'));
  t.append(head);

  let lastType = null;
  rows.forEach((c) => {
    const tr = el('tr');
    const showType = sort === 'type' && c.type !== lastType;
    lastType = c.type;
    tr.append(el('th', { class: 'rowh' },
      `${esc(c.label)}<div class="sub rowh-sub">${showType || sort !== 'type' ? esc(c.region) : esc(c.type)}`
      + `${c.confidence ? ` <span class="dot conf-${esc(c.confidence)}" title="${esc(c.confidence)} confidence: ${esc(c.basis || '')}"></span>` : ''}</div>`));
    cols.forEach((n) => {
      const cell = c.cells[n.id] || { score: 0, evidence: [] };
      const ev = cell.evidence || [];
      const td = el('td', { class: 'cell hm' + (ev.length ? ' sourced' : '') + (cell.score ? '' : ' zero') });
      td.style.background = ramp(cell.score, 5);
      td.style.color = rampInk(cell.score, 5);
      td.innerHTML = `<span>${cell.score || '·'}</span>`;
      const scale = (D.companies.scale || []).find((s) => s.v === cell.score);
      bindTip(td, `<b>${esc(c.label)} — ${esc(n.label)}</b>
        <span class="r">${cell.score}/5 — ${esc(scale?.label || '')}</span>
        ${ev.length
          ? `<ul>${ev.map((e) => `<li>${esc(e.q)}<br><span class="r">${esc(new URL(e.url).hostname)}</span></li>`).join('')}</ul>
             <span class="r" data-sty="display:block;margin-top:5px">click to open the source</span>`
          : '<span class="r" data-sty="display:block;margin-top:5px">seed estimate — no source attached yet</span>'}`);
      if (ev.length) {
        td.style.cursor = 'pointer';
        td.addEventListener('click', () => window.open(ev[0].url, '_blank', 'noopener'));
      }
      tr.append(td);
    });
    const tot = total(c);
    tr.append(el('td', { class: 'cell hm' }, `<span data-sty="color:var(--ink-2)">${tot}</span>`));
    t.append(tr);
  });

  const foot = el('tr', { class: 'footrow' });
  foot.append(el('th', { class: 'rowh' }, 'papers held'));
  cols.forEach((n) => {
    const k = cov[n.id] || { papers: 0 };
    const td = el('td', { class: 'cell hm' }, `<span>${k.papers}</span>`);
    bindTip(td, `<b>${esc(n.label)}</b><span class="r">${k.papers} paper(s) held, mean demand ${k.mean_demand}/5</span>
      <span class="r">covers ${esc(n.categories.map((c) => TAX[c]?.label || c).join(', '))}</span>`);
    foot.append(td);
  });
  foot.append(el('td'));
  t.append(foot);

  $('#heatmap').innerHTML = '';
  $('#heatmap').append(t);
}

function drawPressure() {
  const cov = D.derived.coverage || {};
  const rows = D.companies.needs.map((n) => ({ n, ...(cov[n.id] || { papers: 0, mean_demand: 0, pressure: 0, defensive: 0, offensive: 0, companies_at_4plus: 0 }) }))
    .sort((a, b) => b.pressure - a.pressure);
  const maxP = Math.max(0.001, ...rows.map((r) => r.pressure));

  const t = el('table', { class: 'list' });
  t.innerHTML = `<thead><tr><th>Need</th><th class="right">Mean demand</th><th class="right">4+ orgs</th>
    <th class="right">Papers</th><th class="right">Defence</th><th class="right">Attack</th>
    <th class="right">Demand per paper</th></tr></thead>`;
  const tb = el('tbody');
  rows.forEach((r) => {
    const tr = el('tr');
    tr.innerHTML = `
      <td><b>${esc(r.n.label)}</b><div class="sub" data-sty="font-size:11px">${esc(r.n.blurb)}</div></td>
      <td class="num right"><span data-sty="display:inline-flex;align-items:center;gap:7px;justify-content:flex-end;width:100%">
        ${r.mean_demand.toFixed(2)}
        <i data-sty="display:block;width:${Math.round((r.mean_demand / 5) * 76)}px;height:7px;border-radius:0 3px 3px 0;background:${ramp(r.mean_demand, 5)}"></i></span></td>
      <td class="num right">${r.companies_at_4plus}</td>
      <td class="num right">${r.papers}</td>
      <td class="num right">${r.defensive}</td>
      <td class="num right">${r.offensive}</td>
      <td class="num right"><span data-sty="display:inline-flex;align-items:center;gap:7px;justify-content:flex-end;width:100%">
        ${r.pressure.toFixed(2)}
        <i data-sty="display:block;width:${Math.round((r.pressure / maxP) * 76)}px;height:7px;border-radius:0 3px 3px 0;background:${ramp(r.pressure, maxP)}"></i></span></td>`;
    tb.append(tr);
  });
  t.append(tb);
  $('#pressure').innerHTML = '';
  $('#pressure').append(t);
}

/* ======================================================================= GAPS */
function evChip(e) {
  if (e.type === 'paper') {
    const p = PAPER[e.id];
    return p ? `<a href="#read" class="plink" data-read="${esc(p.id)}" title="${esc(p.title)}">${esc(shortTitle(p.title, 44))}</a>`
             : `<span>${esc(e.id)}</span>`;
  }
  if (e.type === 'company') {
    const c = CO[e.id];
    return `<span>${esc(c ? c.label : e.id)}</span>`;
  }
  return `<span>${esc(e.id)}</span>`;
}

function computedPills(step) {
  const c = step.computed;
  if (!c) return '';
  const pills = [];
  if (c.mean_demand !== undefined) {
    pills.push(`<span class="pill">mean demand <b>${c.mean_demand}</b>/5</span>`);
    pills.push(`<span class="pill"><b>${c.companies_at_4plus}</b> of ${c.of_companies} orgs rate it 4+</span>`);
  }
  if (c.papers !== undefined) {
    pills.push(`<span class="pill"><b>${c.papers}</b> paper${c.papers === 1 ? '' : 's'} held</span>`);
  }
  if (c.defensive !== undefined) {
    pills.push(`<span class="pill"><b>${c.defensive}</b> defence / framework</span>`);
    pills.push(`<span class="pill"><b>${c.offensive}</b> attack</span>`);
  }
  let ev = '';
  if (c.paper_ids?.length) {
    ev = `<div class="ev">${c.paper_ids.map((id) => evChip({ type: 'paper', id })).join('')}</div>`;
  }
  return `<div class="computed">${pills.join('')}</div>${ev}`;
}

function gapCard(g, auto) {
  const chain = (g.chain || []).map((s, i, arr) => `
    <li data-n="${s.step}"${i === arr.length - 1 ? ' class="concl"' : ''}>
      <div class="claim">${esc(s.claim)}</div>
      ${computedPills(s)}
      ${s.evidence?.length ? `<div class="ev">${s.evidence.map(evChip).join('')}</div>` : ''}
    </li>`).join('');
  // The critical half: the case against, the closing criterion, the falsifier.
  // Folded away by default so the argument reads first, but never omitted - a
  // gap with no falsification test is an opinion wearing a severity badge.
  const crit = (g.counter || g.closes_when) ? `
    <button class="crit-toggle" data-crit="${esc(g.id)}" aria-expanded="false">Show the case against ▾</button>
    <div class="crit" id="crit-${esc(g.id)}" hidden>
      <dl>
        ${g.counter ? `<dt>Strongest counter</dt><dd class="counter">${esc(g.counter)}</dd>` : ''}
        ${g.closes_when ? `<dt>Closes when</dt><dd>${esc(g.closes_when)}</dd>` : ''}
        ${g.blocked_by ? `<dt>Held open by</dt><dd>${esc(g.blocked_by)}</dd>` : ''}
        ${g.falsifier ? `<dt>Falsified by</dt><dd>${esc(g.falsifier)}</dd>` : ''}
      </dl>
    </div>` : '';

  return `<div class="gap ${g.severity ? 'sev-' + esc(g.severity) : ''}" id="${esc(g.id)}">
    <div class="gap-h">
      <h3>${esc(g.title)}</h3>
      ${g.severity ? `<span class="badge sev-${esc(g.severity)}">${esc(g.severity)}</span>` : ''}
      ${g.confidence ? `<span class="badge">${esc(g.confidence)} confidence</span>` : ''}
      ${g.status ? `<span class="badge">${esc(g.status)}</span>` : ''}
      ${auto ? '<span class="badge">computed</span>' : ''}
      ${g.needs?.length ? g.needs.map((n) => `<span class="badge">${esc(NEED[n]?.label || n)}</span>`).join('') : ''}
      ${g.refreshed ? `<span class="sub" data-sty="margin-left:auto">figures as of ${esc(g.refreshed)}</span>` : ''}
    </div>
    <ol class="chain">${chain}</ol>
    ${crit}
  </div>`;
}

/* --- gap tree ---------------------------------------------------------------
   Each gap over the taxonomy nodes it claims, each node filled by how much
   research sits there. The shape is the diagnosis: a gap whose branches are
   empty is missing literature; a gap over well-populated branches is missing
   synthesis. Those need different responses, and no list of gaps shows you
   which you have. */
function drawGapTree() {
  const svg = $('#gap-tree');
  const gaps = D.gaps.gaps || [];
  if (!gaps.length) return;

  const total = D.derived.tree.total || {};
  const maxN = Math.max(1, ...Object.values(total));
  $('#gap-tree-legend').innerHTML =
    '<span class="li"><span class="swatch" data-sty="background:var(--critical)"></span>high severity</span>' +
    '<span class="li"><span class="swatch" data-sty="background:var(--serious)"></span>medium</span>' +
    rampLegend('papers under a node', maxN) +
    '<span class="li"><span class="swatch hollow"></span>empty — missing literature</span>';

  const ROW = 21, X1 = 372, X2 = 434, TOP = 30, LH = 15, PAD = 9, BOXW = 336, W = 1040;

  const rows = gaps.map((g) => {
    const cats = (g.categories || []).filter((c) => TAX[c]);
    const lines = wrapLines(g.title, 38, 3);
    const boxH = lines.length * LH + 16 + PAD;
    return { g, cats, lines, boxH, need: Math.max(ROW * (cats.length + 1), boxH + 24) };
  });

  /* Two passes. The first lays everything out; the second sweeps top to bottom
     and pushes down any label box that would collide with the one above,
     moving that gap's whole subtree by the same amount.

     This replaces a single-pass slot calculation that was subtly wrong in a way
     reading it did not reveal. A layout that is only correct when the
     arithmetic is correct is the wrong shape for this - a de-collision sweep
     cannot produce an overlap, whatever feeds it. */
  let y = TOP;
  const laid = rows.map((r) => {
    const block = r.cats.length * ROW;
    const first = y + (r.need - block) / 2 - ROW / 2;
    const childY = r.cats.map((_, i) => first + (i + 1) * ROW);
    const gy = childY.length ? (childY[0] + childY[childY.length - 1]) / 2 : y + r.need / 2;
    y += r.need;
    return { ...r, gy, childY, boxY: gy - r.boxH / 2 };
  });

  const GAPPX = 12;
  for (let i = 1; i < laid.length; i++) {
    const shift = (laid[i - 1].boxY + laid[i - 1].boxH + GAPPX) - laid[i].boxY;
    if (shift > 0) {
      for (let j = i; j < laid.length; j++) {
        laid[j].boxY += shift;
        laid[j].gy += shift;
        laid[j].childY = laid[j].childY.map((v) => v + shift);
      }
    }
  }

  const H = Math.ceil(Math.max(
    ...laid.map((r) => r.boxY + r.boxH),
    ...laid.flatMap((r) => r.childY),
  )) + 26;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('width', W);
  svg.setAttribute('height', H);
  svg.textContent = '';

  const gLink = svgEl('g'), gNode = svgEl('g');
  svg.append(gLink, gNode);
  const curve = (x1, y1, x2, y2) => {
    const mx = (x1 + x2) / 2;
    return `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`;
  };

  laid.forEach(({ g, cats, lines, boxH, gy, childY, boxY }) => {
    const sev = g.severity === 'high' ? 'var(--critical)' : 'var(--serious)';
    cats.forEach((c, i) => gLink.append(svgEl('path', { d: curve(X1 + 8, gy, X2 - 7, childY[i]), class: 'link' })));

    const node = svgEl('g', { class: 'node-c' });
    node.append(svgEl('rect', {
      x: X1 - 13 - BOXW, y: boxY, width: BOXW, height: boxH, rx: 9,
      fill: 'var(--page)', stroke: 'var(--ring)', 'stroke-width': 1,
    }));
    node.append(svgEl('rect', { x: X1 - 13 - BOXW, y: boxY, width: 3, height: boxH, rx: 1.5, fill: sev }));
    lines.forEach((ln, i) => {
      const t = svgEl('text', {
        x: X1 - 13 - BOXW + 12, y: boxY + PAD + 5 + i * LH + 6,
        'font-size': 12, 'font-weight': 600, fill: 'var(--ink)',
      });
      t.textContent = ln;
      node.append(t);
    });
    const sub = svgEl('text', {
      x: X1 - 13 - BOXW + 12, y: boxY + PAD + 5 + lines.length * LH + 7,
      'font-size': 10, fill: 'var(--ink-3)',
    });
    sub.textContent = `${g.severity} severity, ${g.confidence || '?'} confidence, ${g.status}`;
    node.append(sub);
    node.append(svgEl('circle', { cx: X1, cy: gy, r: 7, fill: sev, stroke: 'var(--surface-1)', 'stroke-width': 2 }));

    const held = cats.reduce((acc, c) => acc + (total[c] || 0), 0);
    const empties = cats.filter((c) => !(total[c] || 0)).length;
    bindCard(node, () => `
      <div class="hd"><h4>${esc(g.title)}</h4>
        <div class="path">${esc(g.severity)} severity, ${esc(g.confidence || 'unrated')} confidence</div></div>
      <div class="bd">
        <div class="nums">
          <div><b>${cats.length}</b><span>categories</span></div>
          <div><b>${held}</b><span>papers across them</span></div>
          <div><b>${empties}</b><span>empty</span></div>
        </div>
        <p><b>Closes when:</b> ${esc(g.closes_when || '—')}</p>
        <p class="warn"><b>Against:</b> ${esc((g.counter || '').slice(0, 170))}${(g.counter || '').length > 170 ? '…' : ''}</p>
        <div class="hint">Click to jump to the full chain.</div>
      </div>`);
    node.addEventListener('click', () => document.getElementById(g.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    gNode.append(node);

    cats.forEach((c, i) => {
      const n = total[c] || 0;
      const cy = childY[i];
      const cg = svgEl('g', { class: 'node-c' });
      cg.append(svgEl('circle', {
        cx: X2, cy, r: 5.5,
        fill: n ? ramp(n, maxN) : 'none',
        stroke: n ? 'var(--surface-1)' : 'var(--axis)',
        'stroke-width': 1.5, 'stroke-dasharray': n ? null : '2.5 2',
      }));
      const ct = svgEl('text', { x: X2 + 12, y: cy + 4, 'font-size': 11.5, fill: n ? 'var(--ink)' : 'var(--ink-3)' });
      ct.textContent = catLabel(c);
      cg.append(ct);
      gNode.append(cg);
      if (n) {
        const cnt = svgEl('text', {
          x: (X2 + 12 + ct.getComputedTextLength() + 7).toFixed(1), y: cy + 4,
          'font-size': 10.5, fill: 'var(--ink-3)',
        });
        cnt.textContent = n;
        cg.append(cnt);
      }
      cg.addEventListener('click', () => { show('tree'); treePanel(c); });
      bindCard(cg, () => nodeCard(c, Boolean(TAX[c].parent)));
    });
  });
}

function renderGaps() {
  $('#gap-list').innerHTML = (D.gaps.gaps || []).map((g) => gapCard(g, false)).join('')
    || '<p class="empty">No authored gaps yet.</p>';
  $('#gap-derived').innerHTML = (D.derived.derived_gaps || []).map((g) => gapCard(g, true)).join('')
    || '<p class="empty">Nothing stands out from the arithmetic this run.</p>';

  $$('.crit-toggle').forEach((b) => b.addEventListener('click', () => {
    const box = $(`#crit-${CSS.escape(b.dataset.crit)}`);
    const open = !box.hidden;
    box.hidden = open;
    b.setAttribute('aria-expanded', String(!open));
    b.textContent = open ? 'Show the case against ▾' : 'Hide the case against ▴';
  }));

  drawGapTree();
}

/* ===================================================================== PAPERS */
let P_SORT = { key: 'date', dir: -1 };
let drawPapers;
function renderPapers() {
  const papers = D.papers.papers;
  $('#papers-note').textContent = D.papers.note || '';

  const branches = [...new Set(papers.flatMap((p) => p.categories.map(branchOf)))].sort();
  branches.forEach((b) => $('#p-branch').append(el('option', { value: b }, esc(TAX[b]?.label || b))));
  [...new Set(papers.map((p) => p.trust.tier))].sort().forEach((t) =>
    $('#p-tier').append(el('option', { value: t }, esc(t.replace(/-/g, ' ')))));
  [...new Set(papers.map((p) => p.contribution_type))].sort().forEach((t) =>
    $('#p-contrib').append(el('option', { value: t }, esc(t))));
  const kinds = [...new Set(papers.map((p) => p.kind || 'paper'))].sort();
  if (kinds.length > 1) {
    const sel = el('select', { id: 'p-kind' }, '<option value="">Papers and reports</option>'
      + kinds.map((k) => `<option value="${esc(k)}">${esc(plural(k) + ' only')}</option>`).join(''));
    $('#p-contrib').after(sel);
    sel.addEventListener('input', drawPapers);
  }

  $$('#p-table thead th').forEach((th) => th.addEventListener('click', () => {
    const k = th.dataset.sort;
    P_SORT = { key: k, dir: P_SORT.key === k ? -P_SORT.dir : 1 };
    drawPapers();
  }));
  // reflect sort state in the header, so the table says how it is ordered
  const markSort = () => $$('#p-table thead th').forEach((th) => {
    const on = th.dataset.sort === P_SORT.key;
    if (on) {
      th.setAttribute('aria-sort', P_SORT.dir > 0 ? 'ascending' : 'descending');
      th.dataset.arrow = P_SORT.dir > 0 ? '↑' : '↓';
    } else {
      th.removeAttribute('aria-sort');
      delete th.dataset.arrow;
    }
  });
  const _draw = drawPapers;
  drawPapers = (...a2) => { _draw(...a2); markSort(); };
  ['#p-q', '#p-branch', '#p-tier', '#p-contrib', '#p-group'].forEach((s) =>
    $(s).addEventListener('input', drawPapers));
  drawPapers();
}

/* Applied filters are shown as removable chips rather than left implicit in
   four dropdowns. On a table this size, "why am I seeing 12 rows" has to be
   answerable at a glance - the pattern every security console settles on. */
function filterChips() {
  const defs = [
    ['#p-q', 'search', (v) => `“${v}”`],
    ['#p-branch', 'branch', (v) => TAX[v]?.label || v],
    ['#p-tier', 'provenance', (v) => v.replace(/-/g, ' ')],
    ['#p-contrib', 'type', (v) => v],
    ['#p-kind', 'record', (v) => v],
  ];
  const active = defs.filter(([sel]) => $(sel)?.value);
  $('#p-chips').innerHTML = active.length
    ? active.map(([sel, label, fmt]) =>
        `<button class="chip" data-clear="${esc(sel)}">
           <span class="chip-k">${esc(label)}</span>${esc(fmt($(sel).value))}<i>✕</i></button>`).join('')
      + (active.length > 1 ? '<button class="chip chip-all" data-clear="*">Clear all</button>' : '')
    : '';
  $$('#p-chips .chip').forEach((b) => b.addEventListener('click', () => {
    if (b.dataset.clear === '*') defs.forEach(([sel]) => { if ($(sel)) $(sel).value = ''; });
    else $(b.dataset.clear).value = '';
    drawPapers();
  }));
}

const GROUPERS = {
  branch: (p) => TAX[branchOf(p.primary_category)]?.label || '—',
  tier: (p) => p.trust.tier.replace(/-/g, ' '),
  contribution_type: (p) => p.contribution_type,
  year: (p) => p.date.slice(0, 4),
};

drawPapers = function drawPapersImpl() {
  const q = $('#p-q').value.trim().toLowerCase();
  const fb = $('#p-branch').value, ft = $('#p-tier').value, fc = $('#p-contrib').value;
  let rows = D.papers.papers.filter((p) => {
    if (fb && !p.categories.some((c) => branchOf(c) === fb)) return false;
    if (ft && p.trust.tier !== ft) return false;
    if (fc && p.contribution_type !== fc) return false;
    const fk = $('#p-kind')?.value;
    if (fk && (p.kind || 'paper') !== fk) return false;
    if (!q) return true;
    return [p.title, p.authors.join(' '), p.organisations.join(' '), p.methods.join(' '),
            p.venue, p.what_its_about, p.threat_model].join(' ').toLowerCase().includes(q);
  });

  const key = (p) => ({
    date: p.date, title: p.title.toLowerCase(),
    org: (p.organisations[0] || '').toLowerCase(), venue: p.venue.toLowerCase(),
    cat: catLabel(p.primary_category), contribution_type: p.contribution_type,
  }[P_SORT.key]);
  rows.sort((a, b) => (key(a) > key(b) ? 1 : key(a) < key(b) ? -1 : 0) * P_SORT.dir);

  $('#p-count').textContent = `${rows.length} of ${D.papers.papers.length}`;
  filterChips();

  const tb = $('#p-table tbody');
  tb.innerHTML = '';

  const groupKey = $('#p-group')?.value;
  const emit = (p) => {
    const tr = el('tr', { class: `row tier-${p.trust.tier}` });
    tr.innerHTML = `
      <td class="num">${esc(p.date)}</td>
      <td><a href="#read" class="plink" data-read="${esc(p.id)}">${esc(p.title)}</a> ${kindBadge(p)} ${newBadge(p)}</td>
      <td>${esc(p.organisations.slice(0, 2).join(', ')) || '<span class="sub">—</span>'}${p.organisations.length > 2 ? ` <span class="sub">+${p.organisations.length - 2}</span>` : ''}</td>
      <td>${esc(p.venue)}<br>${tierBadge(p.trust.tier)}</td>
      <td>${esc(catLabel(p.primary_category))}</td>
      <td>${contribBadge(p.contribution_type)}</td>`;
    // The inline expander was replaced by the reader panel; building a hidden
    // duplicate of every row's detail doubled the DOM for nothing.
    tr.addEventListener('click', (e) => { if (e.target.tagName !== 'A') openReader(p.id); });
    tb.append(tr);
  };

  if (groupKey && GROUPERS[groupKey]) {
    const buckets = new Map();
    rows.forEach((p) => {
      const k = GROUPERS[groupKey](p);
      if (!buckets.has(k)) buckets.set(k, []);
      buckets.get(k).push(p);
    });
    [...buckets.entries()]
      .sort((a, b) => b[1].length - a[1].length || String(a[0]).localeCompare(String(b[0])))
      .forEach(([name, group]) => {
        const hr = el('tr', { class: 'grouprow' });
        hr.innerHTML = `<td colspan="6">
          <span class="g-name">${esc(name)}</span>
          <span class="g-n">${group.length}</span>
          ${mixBar(group, 120)}</td>`;
        tb.append(hr);
        group.forEach(emit);
      });
  } else {
    rows.forEach(emit);
  }
  if (!rows.length) tb.innerHTML = '<tr><td colspan="6" class="empty">Nothing matches those filters.</td></tr>';
}

/* ============================================================ command palette
   Everything in the inventory is reachable in two keystrokes. On a dataset this
   shape - a hundred papers, forty categories, seven frameworks, twenty-eight
   organisations - navigation by clicking through tabs is the slow path. */
let CMD_ROWS = [], CMD_SEL = 0;

function paletteIndex() {
  const rows = [];
  VIEWS.forEach((v) => rows.push({ kind: 'view', t: $(`.nav[data-view="${v}"] .nav-l`)?.textContent || v,
                                   s: 'view', go: () => show(v) }));
  D.papers.papers.forEach((p) => rows.push({
    kind: p.kind && p.kind !== 'paper' ? p.kind : 'paper',
    t: p.title, s: `${p.organisations[0] || p.source} · ${p.date.slice(0, 4)}`,
    hay: `${p.title} ${p.short || ''} ${p.organisations.join(' ')} ${p.methods.join(' ')}`,
    go: () => openReader(p.id) }));
  Object.values(LEAF).forEach((n) => rows.push({
    kind: 'category', t: `${TAX[n.parent].label} › ${n.label}`, s: `${(D.derived.tree.total || {})[n.id] || 0} papers`,
    hay: `${n.label} ${n.blurb || ''} ${n.means || ''}`,
    go: () => { show('tree'); treePanel(n.id); } }));
  (D.frameworks.frameworks || []).forEach((f) => rows.push({
    kind: 'framework', t: f.name, s: f.org, hay: `${f.name} ${f.org} ${f.short}`,
    go: () => { show('frameworks'); document.getElementById(`fw-${f.id}`)?.scrollIntoView({ behavior: 'smooth' }); } }));
  (D.gaps.gaps || []).forEach((g) => rows.push({
    kind: 'gap', t: g.title, s: `${g.severity} severity`, hay: `${g.title} ${g.closes_when || ''}`,
    go: () => { show('gaps'); document.getElementById(g.id)?.scrollIntoView({ behavior: 'smooth' }); } }));
  D.companies.companies.forEach((c) => rows.push({
    kind: 'org', t: c.label, s: `${c.type}, ${c.region}`, hay: `${c.label} ${c.type} ${c.region}`,
    go: () => show('demand') }));
  return rows;
}

function openPalette() {
  if (!CMD_ROWS.length) CMD_ROWS = paletteIndex();
  $('#cmdk').setAttribute('aria-hidden', 'false');
  const q = $('#cmd-q');
  q.value = ''; q.focus();
  drawPalette('');
}
const closePalette = () => $('#cmdk').setAttribute('aria-hidden', 'true');

function drawPalette(query) {
  const q = query.trim().toLowerCase();
  const hits = (q
    ? CMD_ROWS.filter((r) => (r.hay || r.t).toLowerCase().includes(q))
    : CMD_ROWS.filter((r) => r.kind === 'view')).slice(0, 40);
  CMD_SEL = 0;
  $('#cmd-res').innerHTML = hits.length
    ? hits.map((r, i) => `<div class="cmd-item" role="option" data-i="${i}" aria-selected="${i === 0}">
        <span class="ci-k">${esc(r.kind)}</span>
        <span class="ci-t">${esc(r.t)}</span>
        <span class="ci-s">${esc(r.s || '')}</span></div>`).join('')
    : '<div class="cmd-empty">Nothing matches that.</div>';
  $('#cmd-res').dataset.hits = hits.length;
  CMD_HITS = hits;
  $$('#cmd-res .cmd-item').forEach((el2) => {
    el2.addEventListener('mouseenter', () => selectPalette(+el2.dataset.i));
    el2.addEventListener('click', () => runPalette());
  });
}
let CMD_HITS = [];
function selectPalette(i) {
  CMD_SEL = Math.max(0, Math.min(CMD_HITS.length - 1, i));
  $$('#cmd-res .cmd-item').forEach((el2, j) => el2.setAttribute('aria-selected', String(j === CMD_SEL)));
  $$('#cmd-res .cmd-item')[CMD_SEL]?.scrollIntoView({ block: 'nearest' });
}
function runPalette() {
  const r = CMD_HITS[CMD_SEL];
  if (!r) return;
  closePalette();
  r.go();
}

function initPalette() {
  $('#cmd-btn').addEventListener('click', openPalette);
  $('#cmdk').addEventListener('click', (e) => { if (e.target.id === 'cmdk') closePalette(); });
  $('#cmd-q').addEventListener('input', (e) => drawPalette(e.target.value));
  $('#cmd-q').addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { selectPalette(CMD_SEL + 1); e.preventDefault(); }
    else if (e.key === 'ArrowUp') { selectPalette(CMD_SEL - 1); e.preventDefault(); }
    else if (e.key === 'Enter') { runPalette(); e.preventDefault(); }
    else if (e.key === 'Escape') { closePalette(); }
  });
}

/* ===================================================================== READER
   Everything the inventory holds about one record, plus the paper itself.

   arXiv's /abs/ pages set X-Frame-Options and frame-ancestors 'none', so they
   cannot be embedded - but /pdf/ sets neither, so the PDF can. The CSP is
   widened to exactly that one host and the iframe src is assigned only when
   someone opens the Full paper pane, so no request reaches arXiv unless a
   reader asked for one. */
let RD_LAST = null;

function openReader(id, pane) {
  const p = PAPER[id];
  if (!p) return;
  RD_LAST = document.activeElement;
  const rd = $('#reader');

  $('#rd-kicker').innerHTML = metaRow(p, { venue: false, orgs: false });
  $('#rd-title').textContent = p.title;
  $('#rd-meta').innerHTML =
    `<div class="meta">`
    + (p.venue ? `<span class="mchip m-venue"><span class="k">${p.venue_source === 'curator' ? 'unverified' : 'venue'}</span>${esc(p.venue)}</span>` : '')
    + (p.organisations?.length ? `<span class="mchip m-org"><span class="d"></span>${esc(p.organisations.join(', '))}</span>` : '')
    + (p.citations ? `<span class="mchip m-cites"><span class="d"></span>${p.citations.toLocaleString()} cited</span>` : '')
    + (p.addresses_needs?.length ? p.addresses_needs.map((n) =>
        `<span class="mchip m-need"><span class="d"></span>${esc(NEED[n]?.label || n)}</span>`).join('') : '')
    + `</div>`
    + `<a class="rd-src" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">Open at source</a>`;

  const row = (k, v) => v ? `<div class="rd-row"><dt>${esc(k)}</dt><dd>${v}</dd></div>` : '';
  $('#rd-summary').innerHTML = `
    <p class="rd-lead">${esc(p.what_its_about)}</p>
    <dl class="rd-dl">
      ${row('Threat model', esc(p.threat_model))}
      ${row('Leaves open', p.gap_signal ? `<span class="rd-gap">${esc(p.gap_signal)}</span>` : '')}
      ${row('Methods', (p.methods || []).map((m) => `<span class="badge">${esc(m)}</span>`).join(' '))}
      ${row('Filed under', p.categories.map((c) =>
          `<a href="#tree" class="catlink" data-cat="${esc(c)}" title="${esc(TAX[c]?.means || '')}">${esc(catLabel(c))}</a>`).join(''))}
      ${row('Company needs', (p.addresses_needs || []).map((n) =>
          `<span class="badge">${esc(NEED[n]?.label || n)}</span>`).join(' '))}
      ${row('Provenance', `${esc(p.trust.justification)}${
          p.venue_source === 'curator' ? ' <span class="sub">(venue stated by the curator, not verified)</span>' : ''}`)}
      ${row('Authors', p.authors.length ? `<span class="sub">${esc(p.authors.join(', '))}</span>` : '')}
    </dl>
    ${p.abstract ? `<h4 class="rd-h">Abstract</h4><p class="rd-abs">${esc(p.abstract)}</p>` : ''}
    ${(p.overlaps_with || []).length ? `<h4 class="rd-h">Argues with</h4>
      <ul class="rd-ov">${p.overlaps_with.map((o) => {
        const q = PAPER[o.id];
        return `<li><button class="rd-jump" data-id="${esc(o.id)}">${esc(q ? (q.short || shortTitle(q.title, 54)) : o.id)}</button>
                <span>${esc(o.shared)}</span></li>`;
      }).join('')}</ul>` : ''}
    <div class="rd-foot sub">${esc(p.curation)} record, classified by ${esc(p.classified_by)}, added ${esc(p.added)}</div>`;

  const m = /arxiv\.org\/abs\/([0-9.]+)/.exec(p.url || '');
  $('#rd-pdf').innerHTML = m
    ? `<iframe title="${esc(p.title)}" src="https://arxiv.org/pdf/${esc(m[1])}" loading="lazy"></iframe>`
    : `<div class="rd-nopdf">
         <p>No embeddable PDF for this record — it is ${esc(p.kind || 'a page')} published by ${esc(p.organisations[0] || p.source)}.</p>
         <p><a href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">Read it at ${esc(new URL(p.url).hostname)}</a></p>
       </div>`;
  $$('#rd-tabs button').forEach((b) => b.disabled = false);

  readerPane(pane || 'summary');
  rd.setAttribute('aria-hidden', 'false');
  document.body.classList.add('rd-open');
  $('#rd-close').focus();

  $$('#rd-summary .catlink').forEach((el2) => el2.addEventListener('click', (e) => {
    e.preventDefault(); closeReader(); show('tree'); treePanel(el2.dataset.cat);
  }));
  $$('#rd-summary .rd-jump').forEach((el2) =>
    el2.addEventListener('click', () => openReader(el2.dataset.id)));
}

function readerPane(which) {
  $$('#rd-tabs button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.p === which)));
  $('#rd-summary').hidden = which !== 'summary';
  $('#rd-pdf').hidden = which !== 'pdf';
}

function closeReader() {
  $('#reader').setAttribute('aria-hidden', 'true');
  document.body.classList.remove('rd-open');
  $('#rd-pdf').innerHTML = '';   // stop the embed when the reader closes
  RD_LAST?.focus?.();
}

function initReader() {
  $('#rd-close').addEventListener('click', closeReader);
  $('#reader').addEventListener('click', (e) => { if (e.target.id === 'reader') closeReader(); });
  $$('#rd-tabs button').forEach((b) => b.addEventListener('click', () => readerPane(b.dataset.p)));
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('rd-open')) closeReader();
  });
}

/* ==================================================================== EXPLORE
   A typed relationship graph over everything: papers, categories,
   organisations, company needs, gaps and frameworks.

   Deliberately focus-and-pivot rather than one picture of ~300 entities. A
   force layout of the whole thing is a hairball that answers nothing; the
   useful question is always "what touches THIS", so one entity sits at the
   centre with its neighbours grouped by what the relationship actually is, and
   clicking a neighbour walks there. A trail records the path.                */

const XTYPE = {
  paper:     { label: 'paper',        colour: 'var(--s1)' },
  category:  { label: 'category',     colour: 'var(--c-defence)' },
  org:       { label: 'organisation', colour: 'var(--c-analysis)' },
  need:      { label: 'company need', colour: 'var(--c-framework)' },
  gap:       { label: 'gap',          colour: 'var(--critical)' },
  framework: { label: 'framework',    colour: 'var(--c-benchmark)' },
};
let XFOCUS = null, XTRAIL = [], XINDEX = null;

function xIndex() {
  if (XINDEX) return XINDEX;
  const E = new Map();
  const add = (id, type, label, extra = {}) => E.set(id, { id, type, label, ...extra });

  D.papers.papers.forEach((p) => add(`p:${p.id}`, 'paper', p.short || shortTitle(p.title, 60), { ref: p }));
  Object.values(LEAF).forEach((n) => add(`c:${n.id}`, 'category', n.label, { ref: n }));
  D.companies.needs.forEach((n) => add(`n:${n.id}`, 'need', n.label, { ref: n }));
  D.companies.companies.forEach((c) => add(`o:${c.id}`, 'org', c.label, { ref: c }));
  (D.gaps.gaps || []).forEach((g) => add(`g:${g.id}`, 'gap', g.title, { ref: g }));
  (D.frameworks.frameworks || []).forEach((f) => add(`f:${f.id}`, 'framework', f.short || f.name, { ref: f }));
  // organisations that publish but are not tracked as buyers
  D.papers.papers.forEach((p) => (p.organisations || []).forEach((o) => {
    const id = `o:lab:${o.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    if (!E.has(id)) add(id, 'org', o, { publisher: true });
  }));
  XINDEX = E;
  return E;
}

/* Neighbours of one entity, grouped by what the relationship is. */
function xNeighbours(id) {
  const E = xIndex();
  const self = E.get(id);
  if (!self) return [];
  const g = [];
  const push = (rel, ids) => {
    const seen = new Set();
    const list = ids.filter((x) => E.has(x) && x !== id && !seen.has(x) && seen.add(x));
    if (list.length) g.push({ rel, ids: list });
  };
  const [kind, ...rest] = id.split(':');
  const key = rest.join(':');

  if (kind === 'p') {
    const p = self.ref;
    push('argues with', (p.overlaps_with || []).map((o) => `p:${o.id}`));
    push('filed under', p.categories.map((c) => `c:${c}`));
    push('addresses', (p.addresses_needs || []).map((n) => `n:${n}`));
    push('published by', (p.organisations || []).map((o) => `o:lab:${o.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`));
    push('cited by gap', (D.gaps.gaps || []).filter((x) =>
      (x.papers || []).includes(p.id) ||
      (x.chain || []).some((s) => (s.evidence || []).some((e) => e.id === p.id))).map((x) => `g:${x.id}`));
  } else if (kind === 'c') {
    const cid = key;
    push('papers here', ((D.derived.tree.paper_ids || {})[cid] || []).map((x) => `p:${x}`));
    push('serves need', D.companies.needs.filter((n) => n.categories.includes(cid)).map((n) => `n:${n.id}`));
    push('named by gap', (D.gaps.gaps || []).filter((x) => (x.categories || []).includes(cid)).map((x) => `g:${x.id}`));
    push('required by', (D.frameworks.frameworks || []).filter((f) =>
      f.elements.some((e) => e.cats.includes(cid))).map((f) => `f:${f.id}`));
  } else if (kind === 'n') {
    const nid = key, need = self.ref;
    push('wanted by', D.companies.companies
      .filter((c) => (c.cells[nid]?.score || 0) >= 4).map((c) => `o:${c.id}`));
    push('covered by', need.categories.map((c) => `c:${c}`));
    push('addressed by', D.papers.papers.filter((p) => (p.addresses_needs || []).includes(nid)).map((p) => `p:${p.id}`));
    push('gap names it', (D.gaps.gaps || []).filter((x) => (x.needs || []).includes(nid)).map((x) => `g:${x.id}`));
  } else if (kind === 'o') {
    if (self.publisher) {
      const name = self.label;
      push('published', D.papers.papers.filter((p) => (p.organisations || []).includes(name)).map((p) => `p:${p.id}`));
    } else {
      const c = self.ref;
      push('wants most', D.companies.needs
        .filter((n) => (c.cells[n.id]?.score || 0) >= 4)
        .sort((x, y) => c.cells[y.id].score - c.cells[x.id].score).map((n) => `n:${n.id}`));
    }
  } else if (kind === 'g') {
    const gp = self.ref;
    push('sits across', (gp.categories || []).map((c) => `c:${c}`));
    push('evidenced by', [...new Set([...(gp.papers || []),
      ...(gp.chain || []).flatMap((s) => (s.evidence || []).filter((e) => e.type === 'paper').map((e) => e.id))])]
      .map((x) => `p:${x}`));
    push('demand from', (gp.needs || []).map((n) => `n:${n}`));
  } else if (kind === 'f') {
    const fw = self.ref;
    push('requires', [...new Set(fw.elements.flatMap((e) => e.cats))].map((c) => `c:${c}`));
  }
  return g;
}

function xFocus(id, pushTrail = true) {
  if (!xIndex().has(id)) return;
  if (pushTrail && XFOCUS && XFOCUS !== id) {
    XTRAIL = [...XTRAIL.filter((x) => x !== XFOCUS), XFOCUS].slice(-6);
  }
  XFOCUS = id;
  drawExplore();
}

/* ---------------------------------------------------------------- layers
   Each layer is a function from a taxonomy leaf to a number, plus how to read
   it. Switching the layer re-colours the same grid, which is the whole idea
   borrowed from an ATT&CK Navigator: one map, several questions. */
const XLAYERS = {
  coverage: {
    label: 'papers filed here', unit: '',
    value: (c) => (D.derived.tree.total || {})[c] || 0,
    note: 'How much work the inventory holds in each category. Empty cells are where nothing has been published.',
  },
  demand: {
    label: 'peak demand /5', unit: '/5',
    value: (c) => {
      const needs = D.companies.needs.filter((n) => n.categories.includes(c));
      return needs.length ? Math.max(...needs.map((n) => D.derived.coverage?.[n.id]?.mean_demand || 0)) : 0;
    },
    note: 'The strongest company demand touching each category. Editorial estimates — read columns, not cells.',
  },
  pressure: {
    label: 'demand per paper', unit: '',
    value: (c) => {
      const needs = D.companies.needs.filter((n) => n.categories.includes(c));
      const d = needs.length ? Math.max(...needs.map((n) => D.derived.coverage?.[n.id]?.mean_demand || 0)) : 0;
      return +(d / (((D.derived.tree.total || {})[c] || 0) + 1)).toFixed(2);
    },
    note: 'Demand divided by coverage. High means the market is asking a question the literature has not answered.',
  },
  gaps: {
    label: 'gap severity', unit: '',
    value: (c) => {
      const g = (D.gaps.gaps || []).filter((x) => (x.categories || []).includes(c));
      if (!g.length) return 0;
      return Math.max(...g.map((x) => (x.severity === 'high' ? 2 : 1)));
    },
    fmt: (v) => (v === 2 ? 'high' : v === 1 ? 'med' : ''),
    note: 'Which categories an argued gap actually names, and at what severity.',
  },
  frameworks: {
    label: 'frameworks requiring it', unit: '',
    value: (c) => (D.frameworks.frameworks || [])
      .filter((f) => f.elements.some((e) => e.cats.includes(c))).length,
    note: 'How many of the seven frameworks place a named requirement on each category.',
  },
  new: {
    label: 'added in the last import', unit: '',
    value: (c) => ((D.derived.tree.paper_ids || {})[c] || [])
      .map((id) => PAPER[id]).filter((p) => p && isNew(p)).length,
    note: 'What the weekly agent added most recently. All zero until the first ingest runs.',
  },
};
let XLAYER = 'coverage', XMODE = 'matrix';

function drawMatrix() {
  const L = XLAYERS[XLAYER];
  const branches = Object.keys(BRANCH);
  const cells = Object.keys(LEAF);
  const vals = cells.map(L.value);
  const max = Math.max(1, ...vals);
  const nonZero = vals.filter((v) => v > 0).length;

  $('#x-count').textContent =
    `${nonZero} of ${cells.length} categories have a value. Highest ${Math.max(...vals)}${L.unit}`;
  $('#x-legend').innerHTML = rampLegend(L.label, max)
    + `<span class="li sub">${esc(L.note)}</span>`;

  $('#x-matrix').innerHTML = branches.map((b) => {
    const leaves = cells.filter((c) => TAX[c].parent === b);
    const sum = leaves.reduce((acc, c) => acc + L.value(c), 0);
    return `<div class="navcol">
      <div class="navhead"><span>${esc(TAX[b].label)}</span><b>${leaves.length}</b></div>
      ${leaves.map((c) => {
        const v = L.value(c);
        const txt = L.fmt ? L.fmt(v) : (v || '');
        return `<button class="navcell${v ? '' : ' nil'}" data-cat="${esc(c)}"
                  data-sty="background:${v ? ramp(v, max) : 'transparent'};color:${v ? rampInk(v, max) : 'var(--ink-3)'}">
          <span class="nc-l">${esc(TAX[c].label)}</span>
          <span class="nc-v">${esc(String(txt))}</span>
        </button>`;
      }).join('')}
    </div>`;
  }).join('');

  $$('#x-matrix .navcell').forEach((b) => {
    const c = b.dataset.cat;
    b.addEventListener('click', () => { show('tree'); treePanel(c); });
    bindCard(b, () => matrixCard(c));
  });
}

function matrixCard(c) {
  const n = TAX[c];
  const papers = ((D.derived.tree.paper_ids || {})[c] || []).map((i) => PAPER[i]).filter(Boolean);
  const gaps = (D.gaps.gaps || []).filter((g) => (g.categories || []).includes(c));
  const fws = (D.frameworks.frameworks || []).filter((f) => f.elements.some((e) => e.cats.includes(c)));
  const rows = Object.entries(XLAYERS)
    .map(([k, L]) => `<div><b>${esc(String(L.fmt ? L.fmt(L.value(c)) || '—' : L.value(c)))}</b><span>${esc(k)}</span></div>`)
    .join('');
  return `
    <div class="hd"><h4>${esc(n.label)}</h4>
      <div class="path">${esc(TAX[n.parent].label)}</div></div>
    <div class="bd">
      <p class="nc-means">${esc(n.means || n.blurb || '')}</p>
      ${n.example ? `<p class="nc-eg"><b>For example</b> ${esc(n.example)}</p>` : ''}
      <div class="nums nums-6">${rows}</div>
      ${gaps.length ? `<ul>${gaps.map((g) => `<li><b>Named in a gap:</b> ${esc(g.title)}</li>`).join('')}</ul>` : ''}
      ${fws.length ? `<div class="hint">Required by ${esc(fws.map((f) => f.short).join(', '))}</div>` : ''}
      ${papers.length ? `<div class="hint">${papers.length} paper${papers.length === 1 ? '' : 's'} — click to list them.</div>`
        : '<div class="hint warn">Nothing published here.</div>'}
    </div>`;
}

function renderExplore() {
  const E = xIndex();
  $('[data-count="explore"]').textContent = E.size;

  $$('#x-mode button').forEach((b) => b.addEventListener('click', () => {
    $$('#x-mode button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    XMODE = b.dataset.m;
    const mx = XMODE === 'matrix';
    $('#x-matrix-wrap').hidden = !mx;
    $('#x-graph-wrap').hidden = mx;
    $('#x-layer').hidden = !mx;
    if (mx) drawMatrix(); else drawExplore();
  }));
  $$('#x-layer button').forEach((b) => b.addEventListener('click', () => {
    $$('#x-layer button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    XLAYER = b.dataset.l;
    drawMatrix();
  }));

  const box = $('#x-q');
  const draw = () => {
    const q = box.value.trim().toLowerCase();
    if (!q) { $('#x-results').innerHTML = ''; return; }
    const hits = [...E.values()].filter((e) => e.label.toLowerCase().includes(q)).slice(0, 10);
    $('#x-results').innerHTML = hits.map((e) =>
      `<button class="xq" data-id="${esc(e.id)}">
         <span class="xq-t" data-sty="background:${XTYPE[e.type].colour}"></span>
         <span class="xq-l">${esc(e.label)}</span>
         <span class="xq-k">${esc(XTYPE[e.type].label)}</span></button>`).join('')
      || '<div class="cmd-empty">Nothing matches.</div>';
    $$('#x-results .xq').forEach((b) => b.addEventListener('click', () => {
      box.value = ''; $('#x-results').innerHTML = ''; xFocus(b.dataset.id);
    }));
  };
  box.addEventListener('input', draw);

  if (!XFOCUS) {
    // open on the most connected paper - the one the graph is most about
    const best = D.papers.papers
      .map((p) => [p.id, (p.overlaps_with || []).length])
      .sort((a, b) => b[1] - a[1])[0];
    XFOCUS = best ? `p:${best[0]}` : [...E.keys()][0];
  }
  drawMatrix();
}

/* The renderer. Focus at the centre; each relationship gets an angular sector;
   neighbours sit on an arc inside it. Groups are sized by how many neighbours
   they hold, so a paper with twenty overlaps and one publisher does not give
   each the same half of the circle. */
function drawExplore() {
  const svg = $('#xgraph');
  const E = xIndex();
  const self = E.get(XFOCUS);
  if (!self) return;

  const groups = xNeighbours(XFOCUS);
  const total = groups.reduce((a2, g) => a2 + Math.min(g.ids.length, 9), 0) || 1;
  const W = 1040, H = 620, CX = W / 2, CY = H / 2;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.removeAttribute('width'); svg.removeAttribute('height');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.textContent = '';

  const gLink = svgEl('g'), gNode = svgEl('g');
  svg.append(gLink, gNode);

  $('#x-count').textContent =
    `${groups.reduce((a2, g) => a2 + g.ids.length, 0)} connections across ${groups.length} relationship${groups.length === 1 ? '' : 's'}`;
  $('#x-legend').innerHTML = Object.entries(XTYPE).map(([k, v]) =>
    `<span class="li"><span class="swatch" data-sty="background:${v.colour}"></span>${esc(v.label)}</span>`).join('');

  // trail
  $('#x-trail').innerHTML = XTRAIL.length
    ? XTRAIL.map((t) => `<button class="tr" data-id="${esc(t)}">${esc(E.get(t)?.label || t)}</button>`).join('<i>›</i>')
      + `<i>›</i><span class="tr now">${esc(self.label)}</span>`
    : `<span class="tr now">${esc(self.label)}</span>`;
  $$('#x-trail .tr[data-id]').forEach((b) =>
    b.addEventListener('click', () => xFocus(b.dataset.id, false)));

  let angle = -Math.PI / 2;            // start at the top
  const GAP = 0.18;                    // breathing room between sectors

  groups.forEach((grp) => {
    const shown = grp.ids.slice(0, 9);
    const span = (Math.min(grp.ids.length, 9) / total) * (Math.PI * 2) - GAP;
    const start = angle, mid = start + span / 2;

    shown.forEach((nid, i) => {
      const t = shown.length === 1 ? 0.5 : i / (shown.length - 1);
      const a2 = start + span * t;
      // alternate radius so long labels in a dense sector do not collide
      const r = 168 + (i % 2) * 54 + (shown.length > 5 ? 10 : 0);
      const x = CX + Math.cos(a2) * r, y = CY + Math.sin(a2) * r * 0.78;
      const ent = E.get(nid);
      const col = XTYPE[ent.type].colour;

      gLink.append(svgEl('line', {
        x1: CX, y1: CY, x2: x, y2: y, stroke: col,
        'stroke-width': 1.2, 'stroke-opacity': 0.34,
      }));

      const g2 = svgEl('g', { class: 'node-c' });
      g2.append(svgEl('circle', { cx: x, cy: y, r: 6, fill: col, stroke: 'var(--surface-1)', 'stroke-width': 2 }));
      const right = x >= CX;
      const label = svgEl('text', {
        x: x + (right ? 11 : -11), y: y + 4, 'text-anchor': right ? 'start' : 'end',
        'font-size': 11, fill: 'var(--ink)',
        stroke: 'var(--surface-1)', 'stroke-width': 3, 'paint-order': 'stroke', 'stroke-linejoin': 'round',
      });
      label.textContent = ent.label.length > 30 ? ent.label.slice(0, 29) + '…' : ent.label;
      g2.append(label);
      g2.addEventListener('click', () => xFocus(nid));
      bindCard(g2, () => xCard(ent, grp.rel));
      gNode.append(g2);
    });

    // relationship label, outside the ring at the sector's midpoint
    const lr = 268;
    const lx = CX + Math.cos(mid) * lr, ly = CY + Math.sin(mid) * lr * 0.80;
    const rel = svgEl('text', {
      x: lx, y: ly, 'text-anchor': 'middle', 'font-size': 10,
      fill: 'var(--ink-3)', 'letter-spacing': '.06em',
      stroke: 'var(--surface-1)', 'stroke-width': 3, 'paint-order': 'stroke',
    });
    rel.textContent = grp.rel.toUpperCase() + (grp.ids.length > 9 ? ` +${grp.ids.length - 9}` : '');
    gNode.append(rel);

    angle = start + span + GAP;
  });

  // the focus, drawn last so it sits above every edge
  const fc = svgEl('g');
  const fcol = XTYPE[self.type].colour;
  fc.append(svgEl('circle', { cx: CX, cy: CY, r: 46, fill: 'var(--surface-1)', stroke: fcol, 'stroke-width': 2 }));
  fc.append(svgEl('circle', { cx: CX, cy: CY, r: 7, fill: fcol }));
  wrapLines(self.label, 22, 3).forEach((ln, i, arr) => {
    const t = svgEl('text', {
      x: CX, y: CY + 26 + i * 14 - (arr.length - 1) * 0, 'text-anchor': 'middle',
      'font-size': 12, 'font-weight': 600, fill: 'var(--ink)',
      stroke: 'var(--surface-1)', 'stroke-width': 4, 'paint-order': 'stroke',
    });
    t.textContent = ln;
    fc.append(t);
  });
  const kind = svgEl('text', {
    x: CX, y: CY - 22, 'text-anchor': 'middle', 'font-size': 9.5,
    fill: fcol, 'letter-spacing': '.08em',
  });
  kind.textContent = XTYPE[self.type].label.toUpperCase();
  fc.append(kind);
  gNode.append(fc);
}

function xCard(ent, rel) {
  const r = ent.ref || {};
  const bits = {
    paper: () => `${esc(r.organisations?.slice(0, 2).join(', ') || r.source || '')}, ${esc(r.date || '')}
      <p>${esc((r.what_its_about || '').slice(0, 180))}…</p>`,
    category: () => `<p>${esc(r.means || r.blurb || '')}</p>`,
    need: () => `<p>${esc(r.blurb || '')}</p>`,
    org: () => `<p>${esc(r.type ? `${r.type}, ${r.region}` : 'publisher')}</p>`,
    gap: () => `<p>${esc(r.severity || '')} severity, ${esc(r.status || '')}</p>
      <p>${esc((r.closes_when || '').slice(0, 160))}</p>`,
    framework: () => `<p>${esc(r.blurb || '')}</p>`,
  }[ent.type] || (() => '');
  return `<div class="hd"><h4>${esc(ent.label)}</h4>
      <div class="path">${esc(XTYPE[ent.type].label)} — ${esc(rel)}</div></div>
    <div class="bd">${bits()}<div class="hint">Click to centre the graph here.</div></div>`;
}

/* ================================================================= FRAMEWORKS
   A framework is a tree, not a list - OWASP has ten risks, ATLAS fourteen
   tactics, NIST twelve. Drawing each element against the research that backs it
   is what turns a compliance checklist into a diagnosis: a hollow element is a
   risk somebody is obliged to manage with nothing published to manage it with. */
let FW_FILTER = 'all';
function renderFrameworks() {
  $$('#fw-filter button').forEach((b) => b.addEventListener('click', () => {
    $$('#fw-filter button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    FW_FILTER = b.dataset.f;
    drawFrameworks();
  }));
  drawFrameworks();
}

/* An element is only as covered as its thinnest requirement.
   Counting the union of papers across all of an element's categories flatters
   it: OWASP's "Supply Chain" maps to three categories, and if two are well
   studied the union looks healthy even when the third has nothing. The weakest
   mapped category is the number that actually tells you whether the element is
   answerable, so that is what drives the colour and the score. */
function fwCoverage(el) {
  const byCat = D.derived.tree.paper_ids || {};
  const ids = new Set();
  el.cats.forEach((c) => (byCat[c] || []).forEach((p) => ids.add(p)));
  const perCat = el.cats.map((c) => ({ cat: c, n: (byCat[c] || []).length }));
  const weakest = perCat.length ? Math.min(...perCat.map((x) => x.n)) : 0;
  const thinnest = perCat.length ? perCat.reduce((a, b) => (b.n < a.n ? b : a)) : null;
  return { papers: ids.size, weakest, thinnest, perCat, ids: [...ids], cats: el.cats.length };
}

function drawFrameworks() {
  const fws = D.frameworks.frameworks || [];
  if (!fws.length) { $('#fw-list').innerHTML = '<p class="empty">No frameworks loaded.</p>'; return; }

  const all = fws.flatMap((f) => f.elements.map((e) => ({ f, e, ...fwCoverage(e) })));
  const maxN = Math.max(1, ...all.map((x) => x.weakest));
  const empty = all.filter((x) => !x.weakest).length;
  const thin = all.filter((x) => x.weakest > 0 && x.weakest <= 2).length;

  $('#fw-stats').innerHTML = [
    [fws.length, 'frameworks mapped'],
    [all.length, 'named risks and controls'],
    [empty, 'with an unstudied requirement'],
    [thin, 'whose weakest leg is 1-2 papers'],
    [`${Math.round((all.filter((x) => x.weakest >= 3).length / all.length) * 100)}%`, 'covered on every leg'],
  ].map(([v, k]) => `<div class="stat"><div class="v">${esc(v)}</div><div class="k">${esc(k)}</div></div>`).join('');

  $('#fw-legend').innerHTML = rampLegend('papers on the weakest mapped category', maxN)
    + '<span class="li"><span class="swatch hollow"></span>a requirement with nothing published</span>'
    + '<span class="li sub">bold = weakest leg, grey = total touching the element</span>';

  $('#fw-list').innerHTML = fws.map((f) => {
    const rows = f.elements
      .map((e) => ({ e, ...fwCoverage(e) }))
      .filter((r) => FW_FILTER === 'all' || r.weakest <= 2);
    if (!rows.length) return '';
    const covered = f.elements.filter((e) => fwCoverage(e).weakest >= 3).length;
    return `
      <section class="fw" id="fw-${esc(f.id)}">
        <header class="fw-h">
          <div>
            <h3>${esc(f.name)}</h3>
            <div class="fw-meta meta">
              <span class="mchip m-org">${esc(f.org)}</span>
              <span class="mchip m-year">${esc(f.version)}</span>
              <span class="mchip m-venue">${esc(f.kind)}</span>
              <a href="${esc(f.url)}" target="_blank" rel="noopener noreferrer">source</a></div>
          </div>
          <div class="fw-score" title="elements with 3+ papers behind them">
            <b>${covered}</b><span>/ ${f.elements.length} covered</span>
          </div>
        </header>
        <p class="fw-blurb">${esc(f.blurb)}</p>
        <ul class="fw-tree">${rows.map(({ e, papers, weakest, thinnest, perCat }) => `
          <li class="fw-el${weakest ? '' : ' hollow'}">
            <span class="fw-dot" data-sty="background:${weakest ? ramp(weakest, maxN) : 'transparent'}"></span>
            <span class="fw-id">${esc(e.id)}</span>
            <span class="fw-label">${esc(e.label)}${weakest === 0 && thinnest
              ? `<em class="fw-weak">nothing on ${esc(TAX[thinnest.cat]?.label || thinnest.cat)}</em>`
              : (weakest <= 2 && thinnest && perCat.length > 1
                 ? `<em class="fw-weak">thinnest leg: ${esc(TAX[thinnest.cat]?.label || thinnest.cat)} (${thinnest.n})</em>` : '')}</span>
            <span class="fw-cats">${e.cats.length
              ? perCat.map((pc) => `<a href="#tree" class="catlink${pc.n ? '' : ' nil'}" data-cat="${esc(pc.cat)}">${esc(TAX[pc.cat]?.label || pc.cat)}<b>${pc.n}</b></a>`).join('')
              : '<em>maps to nothing in the taxonomy</em>'}</span>
            <span class="fw-n${weakest ? '' : ' zero'}">${weakest || '—'}<i>${papers}</i></span>
          </li>`).join('')}</ul>
        <details class="fw-crit"><summary>The case against this framework</summary>
          <p>${esc(f.critique)}</p></details>
      </section>`;
  }).join('');

  $$('#fw-list .catlink').forEach((a2) => a2.addEventListener('click', (ev) => {
    ev.preventDefault(); show('tree'); treePanel(a2.dataset.cat);
  }));
}

/* ======================================================================= NEWS
   The early-signal layer. A lab post is not a paper - it is unreviewed, often
   the first public word on an incident, and it dates fast. Keeping it in its own
   tab is what lets the inventory hold a strict provenance bar without going
   blind to what happened this week. */
let N_SORT = 'date';
function renderNews() {
  const items = D.news.items || [];
  $('#news-note').textContent = D.news.note || '';

  // The landing view has to orient someone who arrived cold, not just list links.
  const papers = D.papers.papers;
  const cov = D.derived.coverage || {};
  const emptyLeaves = Object.keys(LEAF).filter((l) => !(D.derived.tree.total || {})[l]).length;
  const hottest = Object.entries(cov).sort((a, b) => b[1].pressure - a[1].pressure)[0];
  const week = items.filter((i) => {
    const d = new Date(i.date); const now = new Date(D.news.updated || Date.now());
    return (now - d) / 86400000 <= 7;
  }).length;

  $('#hero-stats').innerHTML = [
    [papers.length, 'papers, reports and frameworks'],
    [D.derived.pairs.length, 'overlaps between them'],
    [(D.gaps.gaps || []).length, 'gaps, each with a falsification test'],
    [D.companies.companies.length, 'organisations mapped'],
    [week, 'lab posts in the last 7 days'],
  ].map(([v, k]) => `<div class="stat"><div class="v">${esc(v)}</div><div class="k">${esc(k)}</div></div>`).join('');

  // The four link cards repeated the sidebar, which already lists every view
  // with its count. One line of signposts carries what they actually added.
  $('#hero-links').innerHTML = [
    `<a href="#overlaps" data-go="overlaps">${D.derived.clusters.length} research conversations</a>`,
    `<a href="#tree" data-go="tree">${emptyLeaves} categor${emptyLeaves === 1 ? 'y' : 'ies'} with nothing published</a>`,
    hottest ? `<a href="#demand" data-go="demand">most under-served: ${esc(NEED[hottest[0]]?.label || '')}</a>` : '',
    `<a href="#gaps" data-go="gaps">${(D.gaps.gaps || []).length} open gaps</a>`,
  ].filter(Boolean).join('<i>/</i>');

  $$('#hero-links a').forEach((el2) =>
    el2.addEventListener('click', (e) => { e.preventDefault(); show(el2.dataset.go); }));

  // Orientation is a first-visit need. Once you know what this is, it is in
  // the way - so it can be dismissed, and that choice sticks.
  const hero = $('.card.hero'), x = $('#hero-x');
  const hidden = (() => { try { return localStorage.getItem('aisec-hero') === 'off'; } catch { return false; } })();
  if (hidden) hero.classList.add('tucked');
  x.addEventListener('click', () => {
    const off = hero.classList.toggle('tucked');
    try { localStorage.setItem('aisec-hero', off ? 'off' : 'on'); } catch { /* private mode */ }
  });

  const orgs = [...new Set(items.map((i) => i.org))].sort();
  orgs.forEach((o) => $('#n-org').append(el('option', { value: o },
    `${esc(o)} (${items.filter((i) => i.org === o).length})`)));

  const tiers = [...new Set(items.map((i) => i.tier))];
  $('#news-legend').innerHTML = tiers.map((t) =>
    `<span class="li">${tierBadge(t)}${items.filter((i) => i.tier === t).length}</span>`).join('')
    + `<span class="li sub" title="Those publishers offer no feed, and the page was not fetched within the per-run budget, so the title comes from the URL slug.">`
    + `<span class="badge">approx</span> ${items.filter((i) => i.title_source === 'slug').length} titles from the URL</span>`;

  $$('#n-sort button').forEach((b) => b.addEventListener('click', () => {
    $$('#n-sort button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    N_SORT = b.dataset.s;
    drawNews();
  }));
  ['#n-q', '#n-org'].forEach((sel) => $(sel).addEventListener('input', drawNews));
  drawNews();
}

function drawNews() {
  const q = $('#n-q').value.trim().toLowerCase();
  const org = $('#n-org').value;
  let rows = (D.news.items || []).filter((i) => {
    if (org && i.org !== org) return false;
    if (!q) return true;
    return `${i.title} ${i.summary} ${i.org}`.toLowerCase().includes(q);
  });
  rows = rows.slice().sort((a, b) => N_SORT === 'date'
    ? b.date.localeCompare(a.date) || b.relevance - a.relevance
    : b.relevance - a.relevance || b.date.localeCompare(a.date));

  $('#n-count').textContent = `${rows.length} of ${(D.news.items || []).length}`;

  const today = (D.news.updated || '').slice(0, 10);
  let lastDate = null;
  $('#news-list').innerHTML = rows.map((i) => {
    const head = i.date !== lastDate ? `<div class="news-day">${esc(i.date)}${i.date === today ? ' <span class="sub">today</span>' : ''}</div>` : '';
    lastDate = i.date;
    return head + `
      <article class="news">
        <div class="news-src">${tierBadge(i.tier)}<span>${esc(i.org)}</span></div>
        <div>
          <a href="${esc(i.url)}" target="_blank" rel="noopener noreferrer">${esc(i.title)}</a>
          ${i.title_source === 'slug' ? '<span class="badge" title="Derived from the URL - the publisher offers no feed">approx</span>' : ''}
          ${i.summary ? `<p class="news-sum">${esc(i.summary.slice(0, 260))}${i.summary.length > 260 ? '…' : ''}</p>` : ''}
        </div>
      </article>`;
  }).join('') || '<p class="empty">Nothing matches that filter.</p>';
}

/* =================================================================== PIPELINE */
function renderPipeline() {
  const r = D.runs?.latest;

  // Describe what the pipeline actually did, not what the schedule says it does.
  // A run someone started by hand five minutes ago should not be reported as
  // "every Monday".
  const nextMonday = () => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() + ((8 - d.getUTCDay()) % 7 || 7));
    return d.toISOString().slice(0, 10);
  };
  $('#pl-intro').innerHTML =
    'The agent queries arXiv and ten lab and security-research feeds, drops anything off-topic with a '
    + 'mechanical gate, then asks Claude what each surviving paper is about, which branch of the tree it '
    + 'belongs on, whether its provenance meets the inclusion bar, what it overlaps, and what it leaves '
    + 'unresolved. It then re-reads the gaps against whatever it just added. Work that clears the bar is '
    + 'proposed in a pull request; the rest goes to the review queue. '
    + `Scheduled for <b>Mondays 06:17 UTC</b> — next ${esc(nextMonday())} — and runnable on demand.`;

  if (r) {
    const how = { scheduled: 'on schedule', manual: 'manually', local: 'locally' }[r.trigger];
    const when = (r.finished || r.started || '').replace('T', ' ').slice(0, 16);
    // Runs recorded before the trigger field existed say so, rather than
    // claiming an "unknown trigger" as though something went wrong.
    const discovery = r.mode === 'derive-only';
    const bits = [
      `Last run <b>${esc(when)} UTC</b>`
        + (how ? `, triggered <b>${esc(how)}</b>${r.actor ? ` by ${esc(r.actor)}` : ''}`
               : ' <span class="sub">(trigger not recorded — predates that field)</span>'),
      `mode ${esc(r.mode)}`,
      !discovery && r.discovered !== undefined ? `${r.discovered} found` : null,
      !discovery && r.added !== undefined ? `${r.added} added` : null,
      !discovery && r.queued ? `${r.queued} queued for review` : null,
      r.gaps_flagged ? `${r.gaps_flagged} gap(s) flagged` : null,
      r.news_items ? `${r.news_items} news items` : null,
      r.errors?.length ? `<span class="rd-gap">${r.errors.length} error(s)</span>` : null,
    ].filter(Boolean);
    $('#pl-last').innerHTML = bits.join('. ') + '.';
  } else {
    $('#pl-last').innerHTML = '<span class="sub">No run recorded yet.</span>';
  }

  // the agent's standing advisory on the gaps
  const la = D.gaps.last_assessment;
  const assessed = (D.gaps.gaps || []).filter((g) => g.agent_assessment);
  const proposals = D.gaps.proposed_gaps || [];
  $('#pl-gaps').innerHTML = (la || assessed.length || proposals.length) ? `
    ${la ? `<p class="claim">${esc(la.summary || '')} <span class="sub">— assessed ${esc(la.date)}</span></p>` : ''}
    ${assessed.map((g) => {
      const a2 = g.agent_assessment;
      return `<div class="pg-row${a2.verdict === 'no change' ? ' quiet' : ''}">
        <div class="pg-h"><b>${esc(g.title)}</b>
          <span class="badge">${esc(a2.verdict)}</span>
          ${a2.suggested_status ? `<span class="badge sev-medium">${esc(a2.current_status)} → ${esc(a2.suggested_status)}</span>` : ''}
          <span class="sub">${esc(a2.date)}</span></div>
        ${a2.reasoning ? `<p>${esc(a2.reasoning)}</p>` : ''}
        ${a2.papers?.length ? `<div class="ev">${a2.papers.map((id) =>
          `<a href="#read" class="plink" data-read="${esc(id)}">${esc(PAPER[id]?.short || shortTitle(PAPER[id]?.title || id, 40))}</a>`).join('')}</div>` : ''}
      </div>`;
    }).join('')}
    ${proposals.length ? `<h3 class="sub-h">Proposed gaps, unreviewed</h3>${proposals.map((p) => `
      <div class="pg-row">
        <div class="pg-h"><b>${esc(p.title)}</b><span class="badge">proposed ${esc(p.proposed)}</span></div>
        <p>${esc(p.why_now)}</p>
        <p class="sub"><b>Would close when:</b> ${esc(p.closes_when)}</p>
        <p class="sub"><b>Against it:</b> ${esc(p.counter)}</p>
        <div class="ev">${(p.supporting_papers || []).map((id) =>
          `<a href="#read" class="plink" data-read="${esc(id)}">${esc(PAPER[id]?.short || id)}</a>`).join('')}</div>
      </div>`).join('')}` : ''}`
    : '<p class="empty">No reassessment yet — it runs after an ingest that adds something.</p>';
  const q = D.review_queue.items || [];
  $('#pl-stats').innerHTML = [
    [r?.finished?.slice(0, 10) || '—', 'last run'],
    [r?.total_papers ?? D.papers.papers.length, 'papers after that run'],
    [r?.added ?? '—', 'added that run'],
    [q.length, 'in the review queue'],
    [r?.usage?.cache_read ? `${Math.round((r.usage.cache_read / Math.max(1, r.usage.cache_read + r.usage.input)) * 100)}%` : '—', 'prompt served from cache'],
  ].map(([v, k]) => `<div class="stat"><div class="v">${esc(v)}</div><div class="k">${esc(k)}</div></div>`).join('');

  const runs = D.runs?.runs || [];
  if (!runs.length) { $('#pl-runs').innerHTML = '<p class="empty">No runs recorded yet.</p>'; }
  else {
    const t = el('table', { class: 'list' });
    t.innerHTML = `<thead><tr><th>Started</th><th>Mode</th><th class="num">Found</th>
      <th class="num">Gated out</th><th class="num">Classified</th><th class="num">Added</th>
      <th class="num">Queued</th><th class="num">Tokens in / out</th><th class="num">Secs</th><th>Notes</th></tr></thead>`;
    const tb = el('tbody');
    runs.forEach((x) => {
      const tr = el('tr');
      tr.innerHTML = `<td class="num">${esc((x.started || '').replace('T', ' ').slice(0, 16))}</td>
        <td><span class="badge">${esc(x.mode)}</span></td>
        <td class="num">${x.discovered ?? '—'}</td><td class="num">${x.gated_out ?? '—'}</td>
        <td class="num">${x.classified ?? '—'}</td><td class="num">${x.added ?? '—'}</td>
        <td class="num">${x.queued ?? '—'}</td>
        <td class="num">${x.usage ? `${x.usage.input} / ${x.usage.output}` : '—'}</td>
        <td class="num">${x.seconds ?? '—'}</td>
        <td class="sub">${x.errors?.length ? esc(x.errors.length + ' error(s)') : ''}
          ${x.proposed_leaves?.length ? esc(x.proposed_leaves.length + ' proposed leaf') : ''}</td>`;
      tb.append(tr);
    });
    t.append(tb);
    $('#pl-runs').innerHTML = '';
    $('#pl-runs').append(t);
  }

  $('#pl-queue').innerHTML = q.length ? q.slice().reverse().map((p) => `
    <div data-sty="border-top:1px solid var(--grid);padding:10px 0">
      <div><a href="#read" class="plink" data-read="${esc(p.id)}">${esc(p.title)}</a></div>
      <div class="sub" data-sty="margin:3px 0">${esc(p.date)}, ${esc((p.organisations || []).join(', ') || 'organisations unknown')}
        ${p.agent_verdict ? `<span class="badge">tier ${esc(p.agent_verdict.tier)}</span>
        <span class="badge">confidence ${esc(p.agent_verdict.confidence)}</span>` : ''}</div>
      <div data-sty="font-size:12.5px">${esc(p.queued_because || '')}</div>
    </div>`).join('')
    : '<p class="empty">Queue is empty.</p>';
}

boot();
