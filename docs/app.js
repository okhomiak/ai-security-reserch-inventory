/* AI Security Research Inventory - static dashboard over docs/data/*.json.
   No framework, no build. Everything here reads committed JSON and draws it. */

const FILES = ['papers', 'taxonomy', 'companies', 'gaps', 'derived', 'runs', 'review_queue'];

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
   `style="background:${colour}"` produces - verified in a browser, not assumed.

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
const kindBadge = (p) => (p.kind && p.kind !== 'paper'
  ? `<span class="badge kind-${esc(p.kind)}">${esc(p.kind)}</span>` : '');
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
const paperLink = (id) => {
  const p = PAPER[id];
  return p ? `<a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(shortTitle(p.title, 84))}</a>` : esc(id);
};

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
  renderHead();
  renderOverlaps();
  renderTree();
  renderDemand();
  renderGaps();
  renderPapers();
  renderPipeline();
  openFromHash();
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

function initTabs() {
  $$('#tabs .tab').forEach((t) => t.addEventListener('click', () => show(t.dataset.view)));
  addEventListener('hashchange', openFromHash);
}
function show(view) {
  $$('#tabs .tab').forEach((t) => t.setAttribute('aria-selected', String(t.dataset.view === view)));
  $$('section.view').forEach((s) => s.classList.toggle('active', s.id === `view-${view}`));
  if (location.hash.slice(1) !== view) history.replaceState(null, '', `#${view}`);
  redrawCanvases();
}
const openFromHash = () => {
  const v = location.hash.slice(1);
  show($(`#view-${v}`) ? v : 'overlaps');
};
/* SVG that needs measured width redrawn after a layout or theme change */
function redrawCanvases() {
  if ($('#view-overlaps').classList.contains('active')) {
    if ($('#ov-tree-wrap').hidden) drawGraph(); else drawOverlapTree();
  }
  if ($('#view-tree').classList.contains('active')) drawTree();
  if ($('#view-gaps').classList.contains('active')) drawGapTree();
}
let resizeT;
addEventListener('resize', () => { clearTimeout(resizeT); resizeT = setTimeout(redrawCanvases, 180); });

function renderHead() {
  const n = D.papers.papers.length;
  const latest = D.runs?.latest;
  const when = latest?.finished?.slice(0, 10) || D.papers.updated;
  $('#head-sub').innerHTML = `${n} papers · ${D.derived.pairs.length} overlapping pairs · ${Object.keys(LEAF).length} categories · updated ${esc(when)}`;
  $('#foot-updated').innerHTML = `Inventory updated ${esc(D.papers.updated)}. Derived figures generated ${esc(D.derived.generated || '—')}.`;

  const fresh = D.papers.papers.filter(isNew);
  $('#new-pill').innerHTML = fresh.length
    ? `${fresh.length} new since ${esc(NEW_SINCE)}`
    : '';

  $('#contrib-legend').innerHTML = CONTRIB.map((t) => {
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
      <div class="meta">${c.size} papers · mean overlap ${c.mean_score} · shares
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

  const ROW = 22, X0 = 16, X1 = 250, X2 = 300, BARW = 54, TOP = 24;
  const rows = [];
  groups.forEach((g) => { rows.push(g); g.papers.forEach((id) => rows.push(id)); });
  const H = TOP + rows.length * ROW + 30;
  const W = 980;
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
    const first = y + ROW / 2;
    const childY = g.papers.map((_, i) => first + (i + 1) * ROW);
    const gy = childY.length ? (childY[0] + childY[childY.length - 1]) / 2 : first;
    groupY.push(gy);

    g.papers.forEach((id, i) => {
      gLink.append(svgEl('path', { d: curve(X1 + 8, gy, X2 - 7, childY[i]), class: 'link' }));
    });

    // cluster node
    const cg = svgEl('g', { class: 'node-c' });
    const colour = g.slot ? `var(--s${g.slot})` : 'var(--axis)';
    cg.append(svgEl('circle', { cx: X1, cy: gy, r: 7, fill: colour, stroke: 'var(--surface-1)', 'stroke-width': 2 }));
    const lt = svgEl('text', { x: X1 - 13, y: gy + 4, 'text-anchor': 'end', 'font-size': 12.5, 'font-weight': 600, fill: 'var(--ink)' });
    lt.textContent = g.label.length > 34 ? g.label.slice(0, 33) + '…' : g.label;
    cg.append(lt);
    const ct = svgEl('text', { x: X1 - 13, y: gy + 17, 'text-anchor': 'end', 'font-size': 10.5, fill: 'var(--ink-3)' });
    ct.textContent = `${g.papers.length} papers`;
    cg.append(ct);
    const members = g.papers.map((id) => PAPER[id]).filter(Boolean);
    bindCard(cg, () => `
      <div class="hd"><h4>${esc(g.label)}</h4><div class="path">research cluster</div></div>
      <div class="bd">
        <div class="nums"><div><b>${g.papers.length}</b><span>papers</span></div>
          <div><b>${g.shared.length}</b><span>shared categories</span></div>
          <div><b>${members.filter(isNew).length}</b><span>new</span></div></div>
        <p>${esc(g.shared.slice(0, 4).map((c) => TAX[c]?.label || c).join(' · ')) || 'No single shared category.'}</p>
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
      pg.addEventListener('click', () => window.open(p.url, '_blank', 'noopener'));
      bindCard(pg, () => paperCard(p, bound[id] || 0));
      gNode.append(pg);
    });
    y += ROW * (g.papers.length + 1);
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
      <div class="hint">Click to open on arXiv.</div>
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
    g.addEventListener('click', () => window.open(n.p.url, '_blank', 'noopener'));
    bindTip(g, `<b>${esc(shortTitle(n.p.title, 92))}</b>
      <span class="r">${esc(n.p.organisations.slice(0, 3).join(', '))} · ${esc(n.p.date)}</span>
      <span class="r">${esc(catLabel(n.p.primary_category))} · ${deg[n.id] || 0} overlaps</span>
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
      <p>${esc(node.blurb || '')}</p>
      <div class="nums">
        <div><b>${papers.length}</b><span>papers${isLeaf ? '' : ' in branch'}</span></div>
        <div><b>${demand ? demand.toFixed(1) : '—'}</b><span>peak demand /5</span></div>
        ${fresh.length ? `<div><b data-sty="color:var(--good)">${fresh.length}</b><span>new</span></div>` : ''}
      </div>
      ${papers.length
        ? `<div>${mixBar(papers, 180)}</div>
           <div class="hint">${CONTRIB.filter((t) => papers.some((p) => p.contribution_type === t)).join(' · ')}</div>`
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
    $('#tree-panel').innerHTML = `<p class="note">${esc(n.blurb || '')}</p>
      <p class="empty">Nothing filed here yet — an empty leaf is a coverage hole, not a mistake in the tree.</p>`;
    return;
  }
  $('#tree-panel').innerHTML = `<p class="note">${esc(n.blurb || '')}</p>` + ids.map((pid) => {
    const p = PAPER[pid];
    if (!p) return '';
    return `<div data-sty="border-top:1px solid var(--grid);padding:10px 0">
      <div><a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.title)}</a></div>
      <div class="sub" data-sty="margin:3px 0 5px">${esc(p.organisations.slice(0, 3).join(', '))} · ${esc(p.venue)} · ${esc(p.date)}
        ${tierBadge(p.trust.tier)} ${contribBadge(p.contribution_type)} ${kindBadge(p)} ${newBadge(p)}</div>
      <div data-sty="font-size:12.5px">${esc(p.what_its_about)}</div></div>`;
  }).join('');
  $('#tree-panel-card').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ===================================================================== DEMAND */
function renderDemand() {
  $('#demand-basis').textContent = D.companies.basis || '';
  $$('#hm-sort button').forEach((b) => b.addEventListener('click', () => {
    $$('#hm-sort button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    drawHeatmap(b.dataset.s);
  }));
  drawHeatmap('demand');
  drawPressure();
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
      `${esc(c.label)}<div class="sub" data-sty="font-size:10.5px;font-weight:400">${showType || sort !== 'type' ? esc(c.region) : esc(c.type)}</div>`));
    cols.forEach((n) => {
      const cell = c.cells[n.id] || { score: 0, evidence: [] };
      const ev = cell.evidence || [];
      const td = el('td', { class: 'cell hm' + (ev.length ? ' sourced' : '') + (cell.score ? '' : ' zero') });
      td.style.background = ramp(cell.score, 5);
      td.style.color = rampInk(cell.score, 5);
      td.innerHTML = `<span>${cell.score || '·'}</span>`;
      const scale = (D.companies.scale || []).find((s) => s.v === cell.score);
      bindTip(td, `<b>${esc(c.label)} · ${esc(n.label)}</b>
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
    bindTip(td, `<b>${esc(n.label)}</b><span class="r">${k.papers} paper(s) in the inventory · mean demand ${k.mean_demand}/5</span>
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
  t.innerHTML = `<thead><tr><th>Need</th><th>Mean demand</th><th class="num">4+ orgs</th>
    <th class="num">Papers</th><th class="num">Defence</th><th class="num">Attack</th>
    <th>Demand per paper</th></tr></thead>`;
  const tb = el('tbody');
  rows.forEach((r) => {
    const tr = el('tr');
    tr.innerHTML = `
      <td><b>${esc(r.n.label)}</b><div class="sub" data-sty="font-size:11px">${esc(r.n.blurb)}</div></td>
      <td class="num"><span data-sty="display:inline-flex;align-items:center;gap:7px">
        ${r.mean_demand.toFixed(2)}
        <i data-sty="display:block;width:${Math.round((r.mean_demand / 5) * 76)}px;height:7px;border-radius:0 3px 3px 0;background:${ramp(r.mean_demand, 5)}"></i></span></td>
      <td class="num">${r.companies_at_4plus}</td>
      <td class="num">${r.papers}</td>
      <td class="num">${r.defensive}</td>
      <td class="num">${r.offensive}</td>
      <td class="num"><span data-sty="display:inline-flex;align-items:center;gap:7px">
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
    return p ? `<a href="${esc(p.url)}" target="_blank" rel="noopener" title="${esc(p.title)}">${esc(shortTitle(p.title, 44))}</a>`
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
    '<span class="li"><span class="swatch" data-sty="background:transparent;box-shadow:0 0 0 1.5px var(--axis) inset"></span>empty — missing literature</span>';

  const ROW = 21, X0 = 18, X1 = 330, X2 = 392, TOP = 24;
  const rows = [];
  gaps.forEach((g) => {
    const cats = (g.categories || []).filter((c) => TAX[c]);
    rows.push({ g, cats });
  });
  const count = rows.reduce((a, r) => a + 1 + r.cats.length, 0);
  const H = TOP + count * ROW + 26;
  const W = 980;
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
  const anchors = [];
  rows.forEach(({ g, cats }) => {
    const first = y + ROW / 2;
    const childY = cats.map((_, i) => first + (i + 1) * ROW);
    const gy = childY.length ? (childY[0] + childY[childY.length - 1]) / 2 : first;
    anchors.push(gy);
    const sev = g.severity === 'high' ? 'var(--critical)' : 'var(--serious)';

    cats.forEach((c, i) => gLink.append(svgEl('path', { d: curve(X1 + 8, gy, X2 - 7, childY[i]), class: 'link' })));

    const node = svgEl('g', { class: 'node-c' });
    node.append(svgEl('circle', { cx: X1, cy: gy, r: 7, fill: sev, stroke: 'var(--surface-1)', 'stroke-width': 2 }));
    const t = svgEl('text', { x: X1 - 13, y: gy + 4, 'text-anchor': 'end', 'font-size': 12, 'font-weight': 600, fill: 'var(--ink)' });
    t.textContent = g.title.length > 48 ? g.title.slice(0, 47) + '…' : g.title;
    node.append(t);
    const sub = svgEl('text', { x: X1 - 13, y: gy + 16, 'text-anchor': 'end', 'font-size': 10, fill: 'var(--ink-3)' });
    sub.textContent = `${g.severity} · ${g.confidence || '?'} confidence · ${g.status}`;
    node.append(sub);

    const held = cats.reduce((acc, c) => acc + (total[c] || 0), 0);
    const empties = cats.filter((c) => !(total[c] || 0)).length;
    bindCard(node, () => `
      <div class="hd"><h4>${esc(g.title)}</h4>
        <div class="path">${esc(g.severity)} severity · ${esc(g.confidence || 'unrated')} confidence</div></div>
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
    node.addEventListener('click', () => {
      const el2 = document.getElementById(g.id);
      if (el2) el2.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
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
    y += ROW * (cats.length + 1);
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
      + kinds.map((k) => `<option value="${esc(k)}">${esc(k === 'paper' ? 'papers only' : k + 's only')}</option>`).join(''));
    $('#p-contrib').after(sel);
    sel.addEventListener('input', drawPapers);
  }

  $$('#p-table thead th').forEach((th) => th.addEventListener('click', () => {
    const k = th.dataset.sort;
    P_SORT = { key: k, dir: P_SORT.key === k ? -P_SORT.dir : 1 };
    drawPapers();
  }));
  ['#p-q', '#p-branch', '#p-tier', '#p-contrib'].forEach((s) =>
    $(s).addEventListener('input', drawPapers));
  drawPapers();
}

function drawPapers() {
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
  const tb = $('#p-table tbody');
  tb.innerHTML = '';
  rows.forEach((p) => {
    const tr = el('tr', { class: 'row' });
    tr.innerHTML = `
      <td class="num">${esc(p.date)}</td>
      <td><a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.title)}</a> ${kindBadge(p)} ${newBadge(p)}</td>
      <td class="num">${esc(p.organisations.slice(0, 2).join(', '))}${p.organisations.length > 2 ? ' +' + (p.organisations.length - 2) : ''}</td>
      <td class="num">${esc(p.venue)}<br>${tierBadge(p.trust.tier)}</td>
      <td class="num">${esc(catLabel(p.primary_category))}</td>
      <td class="num">${contribBadge(p.contribution_type)}</td>`;
    const det = el('tr', { class: 'detail', hidden: '' });
    det.innerHTML = `<td colspan="6"><div class="detail-in">
      <div data-sty="font-size:13px">${esc(p.what_its_about)}</div>
      <dl>
        <dt>Threat model</dt><dd>${esc(p.threat_model)}</dd>
        <dt>Methods</dt><dd>${p.methods.map((m) => `<span class="badge">${esc(m)}</span>`).join(' ')}</dd>
        <dt>Categories</dt><dd>${p.categories.map((c) => `<span class="badge">${esc(catLabel(c))}</span>`).join(' ')}</dd>
        <dt>Company needs</dt><dd>${p.addresses_needs.map((n) => `<span class="badge">${esc(NEED[n]?.label || n)}</span>`).join(' ') || '<span class="sub">none recorded</span>'}</dd>
        <dt>Leaves open</dt><dd>${esc(p.gap_signal || '—')}</dd>
        <dt>Overlaps</dt><dd>${(p.overlaps_with || []).map((o) =>
          `<div data-sty="margin-bottom:4px">${paperLink(o.id)}<div class="sub" data-sty="font-size:11.5px">${esc(o.shared)}</div></div>`).join('') || '<span class="sub">none recorded</span>'}</dd>
        <dt>Provenance</dt><dd>${tierBadge(p.trust.tier)} ${esc(p.trust.justification)}
          ${p.venue_source === 'curator' ? '<span class="sub">(venue stated by the curator, not read off arXiv)</span>' : ''}</dd>
        <dt>Authors</dt><dd class="sub">${esc(p.authors.join(', '))}</dd>
        <dt>Record</dt><dd class="sub">${esc(p.curation)} · classified by ${esc(p.classified_by)} · added ${esc(p.added)}
          ${p.confidence < 1 ? ` · confidence ${p.confidence}` : ''}</dd>
      </dl></div></td>`;
    tr.addEventListener('click', (e) => { if (e.target.tagName !== 'A') det.hidden = !det.hidden; });
    tb.append(tr, det);
  });
  if (!rows.length) tb.innerHTML = '<tr><td colspan="6" class="empty">Nothing matches those filters.</td></tr>';
}

/* =================================================================== PIPELINE */
function renderPipeline() {
  const r = D.runs?.latest;
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
      <div><a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.title)}</a></div>
      <div class="sub" data-sty="margin:3px 0">${esc(p.date)} · ${esc((p.organisations || []).join(', ') || 'organisations unknown')}
        ${p.agent_verdict ? `<span class="badge">tier ${esc(p.agent_verdict.tier)}</span>
        <span class="badge">confidence ${esc(p.agent_verdict.confidence)}</span>` : ''}</div>
      <div data-sty="font-size:12.5px">${esc(p.queued_because || '')}</div>
    </div>`).join('')
    : '<p class="empty">Queue is empty.</p>';
}

boot();
