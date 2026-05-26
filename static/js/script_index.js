// static/js/script_index.js
"use strict";

// ── State ────────────────────────────────────────────────
const state = {
  periode: "before",
  trendSaham: "bbri",
  periodType: "monthly",
  model: "dl",
  // Upload trend state
  uploadPeriodType: "monthly",
  uploadSaham: "bbri",
};

// ── Chart instances ──────────────────────────────────────
let trendChart = null;
let comparisonChart = null;
let uploadChart = null;
let uploadTrendChart = null;

// ── Upload trend raw data (semua saham, semua interval) ──
// Struktur: { tweet: [...], date: [...], sentiment_hasil: [...], saham: [...] }
let uploadRawRows = [];

// ── Hasil upload lengkap untuk download ──────────────────
let uploadFullData = [];
let uploadFileName = "hasil_analisis";

// ── Chart.js defaults ────────────────────────────────────
Chart.defaults.color = "#8b949e";
Chart.defaults.borderColor = "#30363d";
Chart.defaults.font.family = "'Plus Jakarta Sans', system-ui, sans-serif";
Chart.defaults.font.size = 12;

// ── Warna sentimen ───────────────────────────────────────
const COLOR = {
  positif: { line: "#3fb950", bg: "rgba(63,185,80,.75)", fill: "rgba(63,185,80,.10)" },
  negatif: { line: "#f85149", bg: "rgba(248,81,73,.75)", fill: "rgba(248,81,73,.08)" },
  netral: { line: "#e3b341", bg: "rgba(227,179,65,.75)", fill: "rgba(227,179,65,.08)" },
};

// ── Helpers ──────────────────────────────────────────────
function fmt(n) {
  if (n === null || n === undefined || n === "—") return "—";
  return Number(n).toLocaleString("id-ID");
}
function showLoading(id) { document.getElementById(id)?.classList.remove("d-none"); }
function hideLoading(id) { document.getElementById(id)?.classList.add("d-none"); }

async function apiFetch(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Gagal memuat data");
  }
  return res.json();
}

// ── Number counter ───────────────────────────────────────
function animateCount(el, target, duration = 800) {
  if (!el) return;
  const start = Date.now();
  const to = parseInt(target, 10) || 0;
  const tick = () => {
    const elapsed = Date.now() - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = fmt(Math.round(to * ease));
    if (progress < 1) requestAnimationFrame(tick);
  };
  tick();
}

// ── Hero saham rotation ──────────────────────────────────
const sahamNames = ["BBRI", "BMRI", "TLKM", "ISAT", "ICBP", "UNVR"];
let heroIdx = 0;
setInterval(() => {
  const el = document.getElementById("hero-saham-rotate");
  if (!el) return;
  el.style.opacity = "0";
  setTimeout(() => {
    heroIdx = (heroIdx + 1) % sahamNames.length;
    el.textContent = sahamNames[heroIdx];
    el.style.opacity = "1";
    el.style.transition = "opacity .4s";
  }, 250);
}, 2200);

// ── Model switcher ────────────────────────────────────────
function changeModel(modelKey, linkEl) {
  state.model = modelKey.toLowerCase() === "svm" ? "svm" : "dl";

  // ── Tambahkan ini ──────────────────────────────────────
  const heroSection = document.querySelector(".hero-section");
  if (heroSection) {
    heroSection.classList.toggle("svm-active", state.model === "svm");
  }
  
  const badge = document.getElementById("selectedModel");
  if (badge) {
    const icon = state.model === "svm"
      ? '<i class="bi bi-diagram-3 me-1"></i>'
      : '<i class="bi bi-cpu me-1"></i>';
    badge.innerHTML = icon + (state.model === "svm" ? "SVM" : "IndoBERTTweet");
  }

  document.querySelectorAll(".dropdown-item").forEach(el => el.classList.remove("active"));
  if (linkEl) linkEl.classList.add("active");

  const netralCard = document.getElementById("stat-card-netral");
  if (netralCard) netralCard.style.display = state.model === "svm" ? "" : "none";

  loadDashboard();
  loadTrend();
}

// ══════════════════════════════════════════════════════════
//  DASHBOARD
// ══════════════════════════════════════════════════════════
async function loadDashboard() {
  showLoading("filter-loading");
  try {
    const data = await apiFetch(
      `/api/dashboard?periode=${state.periode}&model=${state.model}`
    );

    animateCount(document.getElementById("total-positif"), data.positif);
    animateCount(document.getElementById("total-negatif"), data.negatif);
    animateCount(document.getElementById("total-tweet"), data.total);

    if (state.model === "svm") {
      const el = document.getElementById("total-netral");
      if (el) animateCount(el, data.netral || 0);
    }

    renderSahamCards(data.distribusi);
    renderComparisonChart(data.distribusi);

  } catch (e) {
    const c = document.getElementById("saham-cards");
    if (c) c.innerHTML = `<div class="col-12"><div class="alert-danger-dark">${e.message}</div></div>`;
  } finally {
    hideLoading("filter-loading");
  }
}

// ── Saham Cards ──────────────────────────────────────────
function renderSahamCards(distribusi) {
  const container = document.getElementById("saham-cards");
  if (!container) return;
  container.innerHTML = "";

  const isSVM = state.model === "svm";

  Object.entries(distribusi).forEach(([saham, d]) => {
    const pctPos = d.pct_positif || 0;
    const pctNeg = d.pct_negatif || 0;
    const pctNet = d.pct_netral || 0;

    const barInner = isSVM
      ? `<div class="saham-bar-pos" style="width:0%" data-target="${pctPos}"></div>
         <div class="saham-bar-net" style="width:0%" data-target="${pctNet}"></div>
         <div class="saham-bar-neg" style="width:0%" data-target="${pctNeg}"></div>`
      : `<div class="saham-bar-inner" style="width:0%" data-target="${pctPos}"></div>`;

    const statsExtra = isSVM
      ? `<span class="net"><i class="bi bi-dash-circle"></i>${d.pct_netral}%</span>` : "";

    const col = document.createElement("div");
    col.className = "col-6 col-md-4 col-lg-2";
    col.innerHTML = `
      <div class="saham-card" onclick="openSahamDetail('${saham}')">
        <div class="saham-ticker">${saham.toUpperCase()}</div>
        <div class="saham-name">${d.label}</div>
        <div class="saham-bar saham-bar-multi">${barInner}</div>
        <div class="saham-stats">
          <span class="pos"><i class="bi bi-arrow-up-short"></i>${d.pct_positif}%</span>
          ${statsExtra}
          <span class="neg"><i class="bi bi-arrow-down-short"></i>${d.pct_negatif}%</span>
          <span class="tot">${fmt(d.total)}</span>
        </div>
      </div>`;
    container.appendChild(col);
  });

  requestAnimationFrame(() => {
    document.querySelectorAll(".saham-bar-inner").forEach(bar => {
      setTimeout(() => { bar.style.width = bar.dataset.target + "%"; }, 100);
    });
    document.querySelectorAll(".saham-bar-pos,.saham-bar-net,.saham-bar-neg").forEach(bar => {
      setTimeout(() => { bar.style.width = bar.dataset.target + "%"; }, 100);
    });
  });
}

// ── Comparison Chart ─────────────────────────────────────
function renderComparisonChart(distribusi) {
  const labels = Object.values(distribusi).map(d => d.label);
  const positifs = Object.values(distribusi).map(d => d.positif);
  const negatifs = Object.values(distribusi).map(d => d.negatif);
  const netrals = Object.values(distribusi).map(d => d.netral || 0);

  if (comparisonChart) comparisonChart.destroy();

  const datasets = [
    { label: "Positif", data: positifs, backgroundColor: COLOR.positif.bg, borderColor: COLOR.positif.line, borderWidth: 1, borderRadius: 4 },
    { label: "Negatif", data: negatifs, backgroundColor: COLOR.negatif.bg, borderColor: COLOR.negatif.line, borderWidth: 1, borderRadius: 4 },
  ];

  if (state.model === "svm") {
    datasets.push({
      label: "Netral", data: netrals, backgroundColor: COLOR.netral.bg, borderColor: COLOR.netral.line, borderWidth: 1, borderRadius: 4,
    });
  }

  const ctx = document.getElementById("comparison-chart");
  if (!ctx) return;
  comparisonChart = new Chart(ctx.getContext("2d"), {
    type: "bar",
    data: { labels, datasets },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: "top" },
        tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label}: ${fmt(ctx.parsed.y)}` } },
      },
      scales: {
        x: { grid: { color: "#e6ecf5" } },
        y: { grid: { color: "#e6ecf5" }, ticks: { callback: v => v >= 1000 ? (v / 1000).toFixed(1) + "K" : v } },
      },
    },
  });
}

// ══════════════════════════════════════════════════════════
//  ZOOM / PAN ENGINE (reusable)
//  Dipakai oleh chart tren utama DAN chart tren upload.
// ══════════════════════════════════════════════════════════
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }

/**
 * Buat satu instance zoom+pan state untuk sebuah chart.
 * @param {string} canvasId  — id elemen <canvas>
 * @param {Function} getBase — fungsi yang return { labels, datasets[] }
 * @param {Function} getChart— fungsi yang return instance Chart.js
 * @param {Function} onSync  — dipanggil setelah view berubah (opsional)
 */
function createZoomPanEngine(canvasId, getBase, getChart) {
  const view = { start: 0, end: 0 };
  const drag = { active: false, startX: 0, startStart: 0, startEnd: 0 };

  function getVisibleCount() { return view.end - view.start + 1; }

  function sync() {
    const base = getBase();
    const chart = getChart();
    if (!base || !chart) return;

    const s = view.start, e = view.end + 1;
    chart.data.labels = base.labels.slice(s, e);
    base.datasets.forEach((ds, i) => {
      if (chart.data.datasets[i]) {
        chart.data.datasets[i].data = ds.data.slice(s, e);
      }
    });

    const vc = chart.data.labels.length;
    const xt = chart.options.scales.x.ticks;
    if (vc <= 12) { xt.autoSkip = false; xt.maxTicksLimit = vc; xt.maxRotation = 0; }
    else if (vc <= 30) { xt.autoSkip = true; xt.maxTicksLimit = 12; xt.maxRotation = 30; }
    else { xt.autoSkip = true; xt.maxTicksLimit = 12; xt.maxRotation = 45; }

    chart.update("none");
  }

  function setWindow(total, windowSize) {
    const w = windowSize !== undefined ? windowSize : Math.min(total, 24);
    view.start = Math.max(0, total - w);
    view.end = total - 1;
  }

  function zoomAt(clientX, factor) {
    const base = getBase();
    if (!base) return;
    const total = base.labels.length;
    const currentSize = getVisibleCount();
    const nextSize = clamp(Math.round(currentSize * factor), 5, total);
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
    const anchor = view.start + Math.round(ratio * Math.max(currentSize - 1, 1));

    let ns = anchor - Math.floor(nextSize / 2);
    let ne = ns + nextSize - 1;
    if (ns < 0) { ne += -ns; ns = 0; }
    if (ne > total - 1) { const sh = ne - (total - 1); ns = Math.max(0, ns - sh); ne = total - 1; }

    view.start = clamp(ns, 0, total - 1);
    view.end = clamp(ne, view.start, total - 1);
    sync();
  }

  function panByPixels(deltaX) {
    const base = getBase();
    if (!base) return;
    const total = base.labels.length;
    const visibleCount = getVisibleCount();
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ppp = rect.width / Math.max(visibleCount, 1);
    const shift = Math.round(-deltaX / ppp);

    let ns = drag.startStart + shift;
    let ne = drag.startEnd + shift;
    if (ns < 0) { ne += -ns; ns = 0; }
    if (ne > total - 1) { const ov = ne - (total - 1); ns = Math.max(0, ns - ov); ne = total - 1; }

    view.start = clamp(ns, 0, total - 1);
    view.end = clamp(ne, view.start, total - 1);
    sync();
  }

  function panBySteps(direction) {
    const base = getBase();
    if (!base) return;
    const total = base.labels.length;
    const visibleCount = getVisibleCount();
    const step = Math.max(1, Math.round(visibleCount / 20));

    let ns = view.start + direction * step;
    let ne = view.end + direction * step;
    if (ns < 0) { ne += -ns; ns = 0; }
    if (ne > total - 1) { const ov = ne - (total - 1); ns = Math.max(0, ns - ov); ne = total - 1; }

    view.start = clamp(ns, 0, total - 1);
    view.end = clamp(ne, view.start, total - 1);
    sync();
  }

  function resetView() {
    const base = getBase();
    if (!base) return;
    view.start = 0;
    view.end = base.labels.length - 1;
    sync();
  }

  function bind() {
    const canvas = document.getElementById(canvasId);
    if (!canvas || canvas.dataset.zoomBound === "1") return;

    canvas.addEventListener("wheel", (e) => {
      if (e.ctrlKey) { e.preventDefault(); zoomAt(e.clientX, e.deltaY < 0 ? 0.85 : 1.18); return; }
      if (e.shiftKey) { e.preventDefault(); panBySteps(e.deltaY > 0 ? -1 : 1); }
    }, { passive: false });

    canvas.addEventListener("mousedown", (e) => {
      if (!getBase()) return;
      Object.assign(drag, { active: true, startX: e.clientX, startStart: view.start, startEnd: view.end });
      canvas.classList.add("is-dragging");
      canvas.style.cursor = "grabbing";
    });

    window.addEventListener("mousemove", (e) => {
      if (!drag.active) return;
      panByPixels(e.clientX - drag.startX);
    });

    window.addEventListener("mouseup", () => {
      drag.active = false;
      canvas.classList.remove("is-dragging");
      canvas.style.cursor = "grab";
    });

    canvas.addEventListener("mouseleave", () => {
      if (!drag.active) return;
      drag.active = false;
      canvas.classList.remove("is-dragging");
      canvas.style.cursor = "grab";
    });

    canvas.addEventListener("dblclick", resetView);

    // Touch
    let touchStartDist = null;
    let touchStartWindow = null;

    canvas.addEventListener("touchstart", (e) => {
      if (e.touches.length === 1) {
        Object.assign(drag, { active: true, startX: e.touches[0].clientX, startStart: view.start, startEnd: view.end });
      }
      if (e.touches.length === 2) {
        drag.active = false;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        touchStartDist = Math.sqrt(dx * dx + dy * dy);
        touchStartWindow = { start: view.start, end: view.end };
      }
    }, { passive: false });

    canvas.addEventListener("touchmove", (e) => {
      if (e.touches.length === 1 && drag.active) {
        panByPixels(e.touches[0].clientX - drag.startX);
      }
      if (e.touches.length === 2 && touchStartDist && touchStartWindow) {
        e.preventDefault();
        const base = getBase();
        if (!base) return;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const scale = touchStartDist / dist;
        const total = base.labels.length;
        const origSize = touchStartWindow.end - touchStartWindow.start + 1;
        const newSize = clamp(Math.round(origSize * scale), 5, total);
        const center = Math.round((touchStartWindow.start + touchStartWindow.end) / 2);

        let ns = center - Math.floor(newSize / 2);
        let ne = ns + newSize - 1;
        if (ns < 0) { ne += -ns; ns = 0; }
        if (ne > total - 1) { const ov = ne - (total - 1); ns = Math.max(0, ns - ov); ne = total - 1; }

        view.start = ns; view.end = ne;
        sync();
      }
    }, { passive: false });

    canvas.addEventListener("touchend", () => {
      drag.active = false;
      touchStartDist = null;
      touchStartWindow = null;
    });

    canvas.dataset.zoomBound = "1";
  }

  return { view, setWindow, sync, resetView, bind };
}

// ══════════════════════════════════════════════════════════
//  TREND CHART UTAMA
// ══════════════════════════════════════════════════════════
let trendBaseData = null;   // { labels, datasets: [{data},...] }
let trendZoomEngine = null;

async function loadTrend() {
  showLoading("trend-loading");
  try {
    const data = await apiFetch(
      `/api/trend?saham=${state.trendSaham}&periode=${state.periode}&period_type=${state.periodType}&model=${state.model}`
    );
    renderTrendChart(data);
  } catch (e) {
    console.error("Gagal load trend:", e.message);
  } finally {
    hideLoading("trend-loading");
  }
}

function renderTrendChart(data) {
  const isSVM = state.model === "svm";
  const labels = data.data.map(d => d.label);
  const positifs = data.data.map(d => d.positif);
  const negatifs = data.data.map(d => d.negatif);
  const netrals = isSVM ? data.data.map(d => d.netral || 0) : [];

  // Simpan base data dalam format yang dimengerti engine
  const dsBase = [
    { data: positifs },
    { data: negatifs },
  ];
  if (isSVM) dsBase.push({ data: netrals });
  trendBaseData = { labels, datasets: dsBase };

  if (trendChart) trendChart.destroy();

  const chartDatasets = [
    { label: "Positif", data: [], borderColor: COLOR.positif.line, backgroundColor: COLOR.positif.fill, fill: true, tension: 0.35, pointRadius: 3, pointHoverRadius: 6, borderWidth: 2 },
    { label: "Negatif", data: [], borderColor: COLOR.negatif.line, backgroundColor: COLOR.negatif.fill, fill: true, tension: 0.35, pointRadius: 3, pointHoverRadius: 6, borderWidth: 2 },
  ];
  if (isSVM) {
    chartDatasets.push({ label: "Netral", data: [], borderColor: COLOR.netral.line, backgroundColor: COLOR.netral.fill, fill: true, tension: 0.35, pointRadius: 3, pointHoverRadius: 6, borderWidth: 2 });
  }

  const canvas = document.getElementById("trend-chart");
  if (!canvas) return;
  canvas.dataset.zoomBound = "0";

  trendChart = new Chart(canvas.getContext("2d"), {
    type: "line",
    data: { labels: [], datasets: chartDatasets },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      animation: false,
      plugins: {
        legend: { position: "top" },
        tooltip: { callbacks: { title: items => items[0].label, label: ctx => ` ${ctx.dataset.label}: ${fmt(ctx.parsed.y)}` } },
      },
      scales: {
        x: { grid: { color: "#e6ecf5" }, ticks: { autoSkip: true, maxTicksLimit: 12, maxRotation: 45 } },
        y: { grid: { color: "#e6ecf5" }, ticks: { callback: v => v >= 1000 ? (v / 1000).toFixed(1) + "K" : v } },
      },
    },
  });

  trendZoomEngine = createZoomPanEngine(
    "trend-chart",
    () => trendBaseData,
    () => trendChart
  );

  const total = labels.length;
  const w = state.periodType === "daily" ? Math.min(total, 120)
    : state.periodType === "weekly" ? Math.min(total, 60)
      : Math.min(total, 24);
  trendZoomEngine.setWindow(total, w);
  trendZoomEngine.bind();
  trendZoomEngine.sync();

  const resetBtn = document.getElementById("resetTrendZoom");
  if (resetBtn && !resetBtn.dataset.bound) {
    resetBtn.addEventListener("click", () => trendZoomEngine?.resetView());
    resetBtn.dataset.bound = "1";
  }
}

// ══════════════════════════════════════════════════════════
//  MODAL DETAIL SAHAM
// ══════════════════════════════════════════════════════════
window.openSahamDetail = async function (saham) {
  const modal = new bootstrap.Modal(document.getElementById("saham-modal"));
  document.getElementById("modal-title").textContent = saham.toUpperCase();
  document.getElementById("modal-body").innerHTML =
    `<div class="text-center py-4"><div class="spinner-border text-accent"></div></div>`;
  modal.show();

  try {
    const d = await apiFetch(`/api/saham?saham=${saham}&periode=${state.periode}&model=${state.model}`);
    const isSVM = state.model === "svm";

    document.getElementById("modal-title").textContent =
      `${d.saham_label} (${d.saham.toUpperCase()})`;

    const sentClass = s => s === "positif" ? "badge-pos" : s === "negatif" ? "badge-neg" : "badge-net";

    const sampleRows = d.sample.map(s => `
      <tr>
        <td class="text-muted" style="width:90px;font-size:.75rem">${s.date || "—"}</td>
        <td style="font-size:.82rem">${s.tweet}</td>
        <td><span class="${sentClass(s.sentiment)}">${s.sentiment}</span></td>
      </tr>`).join("");

    const netralBlock = isSVM ? `
      <div class="col-4 text-center">
        <div class="stat-value" style="color:#e3b341">${fmt(d.netral)}</div>
        <div class="stat-label">Netral (${d.pct_netral}%)</div>
      </div>` : "";

    const barContent = isSVM
      ? `<div class="saham-bar-pos" style="width:${d.pct_positif}%"></div>
         <div class="saham-bar-net" style="width:${d.pct_netral}%"></div>
         <div class="saham-bar-neg" style="width:${d.pct_negatif}%"></div>`
      : `<div class="saham-bar-inner" style="width:${d.pct_positif}%"></div>`;

    document.getElementById("modal-body").innerHTML = `
      <div class="row g-3 mb-4">
        <div class="col-4 text-center">
          <div class="stat-value text-success">${fmt(d.positif)}</div>
          <div class="stat-label">Positif (${d.pct_positif}%)</div>
        </div>
        ${netralBlock}
        <div class="col-4 text-center">
          <div class="stat-value text-danger">${fmt(d.negatif)}</div>
          <div class="stat-label">Negatif (${d.pct_negatif}%)</div>
        </div>
        <div class="col-4 text-center">
          <div class="stat-value">${fmt(d.total)}</div>
          <div class="stat-label">Total</div>
        </div>
      </div>
      <div class="saham-bar saham-bar-multi mb-4" style="height:8px">${barContent}</div>
      <h6 class="mb-2 small text-muted">Tweet Terbaru</h6>
      <div class="table-responsive">
        <table class="table table-sm mb-0">
          <thead><tr><th>Tanggal</th><th>Tweet</th><th>Sentimen</th></tr></thead>
          <tbody>${sampleRows || "<tr><td colspan='3' class='text-muted'>Tidak ada data</td></tr>"}</tbody>
        </table>
      </div>`;
  } catch (e) {
    document.getElementById("modal-body").innerHTML =
      `<div class="alert-danger-dark">${e.message}</div>`;
  }
};

// ══════════════════════════════════════════════════════════
//  UPLOAD TREND ENGINE
// ══════════════════════════════════════════════════════════
let uploadTrendBaseData = null;   // { labels, datasets: [{data},...] }
let uploadTrendZoomEngine = null;

/**
 * Agregasi uploadRawRows → trendBaseData berdasarkan filter saham & period_type.
 * uploadRawRows: array of { date, sentiment_hasil, saham (opsional) }
 */
function buildUploadTrendData(rows, sahamFilter, periodType, isSVM) {
  if (!rows || rows.length === 0) return null;

  let filtered = rows;
  if (sahamFilter && sahamFilter !== "all") {
    filtered = rows.filter(
      (r) => (r.saham || "").toLowerCase() === sahamFilter.toLowerCase()
    );
  }
  if (filtered.length === 0) return null;

  const groups = {};

  filtered.forEach((r) => {
    let raw = (r.date || "").trim();
    if (!raw) return;

    // Buang bagian jam jika ada
    raw = raw.split(" ")[0].split("T")[0];

    // Parse berbagai format tanggal
    let d;
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) {
      const [dd, mm, yyyy] = raw.split("/");
      d = new Date(`${yyyy}-${mm}-${dd}`);
    } else if (/^\d{2}-\d{2}-\d{4}$/.test(raw)) {
      const [dd, mm, yyyy] = raw.split("-");
      d = new Date(`${yyyy}-${mm}-${dd}`);
    } else {
      d = new Date(raw);
    }

    if (isNaN(d.getTime())) return;

    let key;
    if (periodType === "daily") {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      key = `${y}-${m}-${dd}`;
    } else if (periodType === "weekly") {
      const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
      const dayNum = tmp.getUTCDay() || 7;
      tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
      const weekNum = Math.ceil((((tmp - yearStart) / 86400000) + 1) / 7);
      key = `${tmp.getUTCFullYear()}-W${String(weekNum).padStart(2, "0")}`;
    } else {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      key = `${y}-${m}`;
    }

    if (!groups[key]) groups[key] = { positif: 0, negatif: 0, netral: 0 };
    const s = (r.sentiment_hasil || "").toLowerCase();
    if (s === "positif") groups[key].positif++;
    else if (s === "negatif") groups[key].negatif++;
    else groups[key].netral++;
  });

  const keys = Object.keys(groups).sort();
  if (keys.length === 0) return null;

  const datasets = [
    { data: keys.map((k) => groups[k].positif) },
    { data: keys.map((k) => groups[k].negatif) },
  ];
  if (isSVM) datasets.push({ data: keys.map((k) => groups[k].netral) });

  return { labels: keys, datasets };
}

function renderUploadTrendChart(isSVM) {
  const base = buildUploadTrendData(
    uploadRawRows,
    state.uploadSaham,
    state.uploadPeriodType,
    isSVM
  );

  if (!base) {
    document.getElementById("upload-trend-section").classList.add("d-none");
    document.getElementById("upload-trend-empty").classList.remove("d-none");
    return;
  }

  uploadTrendBaseData = base;

  if (uploadTrendChart) uploadTrendChart.destroy();

  const chartDatasets = [
    { label: "Positif", data: [], borderColor: COLOR.positif.line, backgroundColor: COLOR.positif.fill, fill: true, tension: 0.35, pointRadius: 3, pointHoverRadius: 6, borderWidth: 2 },
    { label: "Negatif", data: [], borderColor: COLOR.negatif.line, backgroundColor: COLOR.negatif.fill, fill: true, tension: 0.35, pointRadius: 3, pointHoverRadius: 6, borderWidth: 2 },
  ];
  if (isSVM) {
    chartDatasets.push({ label: "Netral", data: [], borderColor: COLOR.netral.line, backgroundColor: COLOR.netral.fill, fill: true, tension: 0.35, pointRadius: 3, pointHoverRadius: 6, borderWidth: 2 });
  }

  const canvas = document.getElementById("upload-trend-chart");
  if (!canvas) return;
  canvas.dataset.zoomBound = "0";

  uploadTrendChart = new Chart(canvas.getContext("2d"), {
    type: "line",
    data: { labels: [], datasets: chartDatasets },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      animation: false,
      plugins: {
        legend: { position: "top" },
        tooltip: { callbacks: { title: items => items[0].label, label: ctx => ` ${ctx.dataset.label}: ${fmt(ctx.parsed.y)}` } },
      },
      scales: {
        x: { grid: { color: "#e6ecf5" }, ticks: { autoSkip: true, maxTicksLimit: 12, maxRotation: 45 } },
        y: { beginAtZero: true, grid: { color: "#e6ecf5" }, ticks: { callback: v => v >= 1000 ? (v / 1000).toFixed(1) + "K" : v } },
      },
    },
  });

  uploadTrendZoomEngine = createZoomPanEngine(
    "upload-trend-chart",
    () => uploadTrendBaseData,
    () => uploadTrendChart
  );

  const total = base.labels.length;
  const w = state.uploadPeriodType === "daily" ? Math.min(total, 120)
    : state.uploadPeriodType === "weekly" ? Math.min(total, 60)
      : Math.min(total, 24);
  uploadTrendZoomEngine.setWindow(total, w);
  uploadTrendZoomEngine.bind();
  uploadTrendZoomEngine.sync();

  document.getElementById("upload-trend-section").classList.remove("d-none");
  document.getElementById("upload-trend-empty").classList.add("d-none");
}

// ── Bind filter events untuk upload trend ────────────────
function bindUploadTrendFilters(isSVM) {
  // Filter saham
  const sahamSel = document.getElementById("upload-trend-saham");
  if (sahamSel) {
    // Hapus listener lama dengan clone
    const newSahamSel = sahamSel.cloneNode(true);
    sahamSel.parentNode.replaceChild(newSahamSel, sahamSel);
    newSahamSel.addEventListener("change", (e) => {
      state.uploadSaham = e.target.value;
      renderUploadTrendChart(isSVM);
    });
  }

  // Filter interval
  const periodGroup = document.getElementById("upload-trend-period-type");
  if (periodGroup) {
    const newPG = periodGroup.cloneNode(true);
    periodGroup.parentNode.replaceChild(newPG, periodGroup);
    newPG.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-value]");
      if (!btn) return;
      newPG.querySelectorAll(".btn-filter-sm").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.uploadPeriodType = btn.dataset.value;
      renderUploadTrendChart(isSVM);
    });
  }

  // Reset zoom
  const resetBtn = document.getElementById("resetUploadTrendZoom");
  if (resetBtn) {
    const newResetBtn = resetBtn.cloneNode(true);
    resetBtn.parentNode.replaceChild(newResetBtn, resetBtn);
    newResetBtn.addEventListener("click", () => uploadTrendZoomEngine?.resetView());
  }
}

/**
 * Populate dropdown saham dari data yang ada di CSV upload.
 * Kalau CSV punya kolom 'saham', tampilkan opsi per saham.
 * Kalau tidak, tampilkan hanya "Semua Saham".
 */
function populateUploadSahamFilter(rows) {
  const sel = document.getElementById("upload-trend-saham");
  if (!sel) return;

  const labelEl = sel.previousElementSibling;

  const sahamSet = new Set();
  rows.forEach((r) => {
    if (r.saham && r.saham.trim()) sahamSet.add(r.saham.trim().toLowerCase());
  });

  sel.innerHTML = `<option value="all">Semua Saham</option>`;

  if (sahamSet.size > 0) {
    Array.from(sahamSet).sort().forEach((s) => {
      const opt = document.createElement("option");
      opt.value = s;
      opt.textContent = s.toUpperCase();
      sel.appendChild(opt);
    });
    sel.style.display = "";
    if (labelEl) labelEl.style.display = "";
  } else {
    // Sembunyikan SELECT + label saja — wrapper tetap tampil
    sel.style.display = "none";
    if (labelEl) labelEl.style.display = "none";
  }

  state.uploadSaham = "all";
  sel.value = "all";
}

// ══════════════════════════════════════════════════════════
//  UPLOAD CSV
// ══════════════════════════════════════════════════════════
window.submitUpload = async function () {
  const fileInput = document.getElementById("upload-file");
  const modelVal = document.getElementById("upload-model").value;
  const periodeVal = document.getElementById("upload-periode").value;
  const btn = document.getElementById("upload-btn");

  if (!fileInput.files || !fileInput.files.length) {
    fileInput.classList.add("is-invalid");
    return;
  }
  fileInput.classList.remove("is-invalid");

  btn.querySelector(".btn-text").classList.add("d-none");
  btn.querySelector(".btn-loading").classList.remove("d-none");
  btn.disabled = true;

  document.getElementById("upload-result").classList.add("d-none");
  document.getElementById("upload-trend-section").classList.add("d-none");
  document.getElementById("upload-trend-empty").classList.add("d-none");
  const placeholder = document.getElementById("upload-placeholder");
  placeholder.classList.remove("d-none");
  placeholder.innerHTML = `<i class="bi bi-file-earmark-bar-graph"></i><p>Hasil analisis akan tampil di sini</p>`;

  // Reset state filter upload
  state.uploadPeriodType = "monthly";
  state.uploadSaham = "all";

  // Reset interval button aktif ke "Bulanan"
  document.querySelectorAll("#upload-trend-period-type .btn-filter-sm").forEach(b => {
    b.classList.toggle("active", b.dataset.value === "monthly");
  });

  const formData = new FormData();
  formData.append("file", fileInput.files[0]);
  formData.append("model", modelVal);
  formData.append("periode", periodeVal);

  try {
    const res = await fetch("/api/upload", { method: "POST", body: formData });

    let data;
    try { data = await res.json(); }
    catch { throw new Error("Server tidak mengembalikan JSON yang valid. Cek log Flask."); }

    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

    const isSVM = data.model === "svm";

    console.log("full_data length:", data.full_data?.length);
    console.log("full_data sample:", data.full_data?.[0]);

    console.log("raw_rows length:", data.raw_rows?.length);
    console.log("trend_upload length:", data.trend_upload?.length);
    console.log("sample raw_rows[0]:", data.raw_rows?.[0]);

    placeholder.classList.add("d-none");
    document.getElementById("upload-result").classList.remove("d-none");

    // Label model
    const modelUsedEl = document.getElementById("upload-model-used");
    if (modelUsedEl) modelUsedEl.textContent = `Model: ${data.model_used}`;

    // Summary cards
    const netralCard = isSVM
      ? `<div class="col-6 col-sm-3"><div class="stat-card text-center">
           <div class="stat-value" style="color:#e3b341">${fmt(data.netral || 0)}</div>
           <div class="stat-label">Netral<br><small>${data.pct_netral || 0}%</small></div>
         </div></div>` : "";
    const colClass = isSVM ? "col-6 col-sm-3" : "col-6 col-sm-4";
    document.getElementById("upload-summary").innerHTML = `
      <div class="${colClass}"><div class="stat-card text-center">
        <div class="stat-value">${fmt(data.total)}</div>
        <div class="stat-label">Total</div>
      </div></div>
      <div class="${colClass}"><div class="stat-card text-center">
        <div class="stat-value" style="color:var(--positive)">${fmt(data.positif)}</div>
        <div class="stat-label">Positif<br><small>${data.pct_positif}%</small></div>
      </div></div>
      ${netralCard}
      <div class="${colClass}"><div class="stat-card text-center">
        <div class="stat-value" style="color:var(--negative)">${fmt(data.negatif)}</div>
        <div class="stat-label">Negatif<br><small>${data.pct_negatif}%</small></div>
      </div></div>`;

    // Doughnut chart
    if (uploadChart) uploadChart.destroy();
    const dLabels = isSVM ? ["Positif", "Negatif", "Netral"] : ["Positif", "Negatif"];
    const dData = isSVM ? [data.positif, data.negatif, data.netral || 0] : [data.positif, data.negatif];
    const dBg = isSVM ? [COLOR.positif.bg, COLOR.negatif.bg, COLOR.netral.bg] : [COLOR.positif.bg, COLOR.negatif.bg];
    const dBorder = isSVM ? [COLOR.positif.line, COLOR.negatif.line, COLOR.netral.line] : [COLOR.positif.line, COLOR.negatif.line];

    const uploadCtx = document.getElementById("upload-chart");
    if (uploadCtx) {
      uploadChart = new Chart(uploadCtx.getContext("2d"), {
        type: "doughnut",
        data: { labels: dLabels, datasets: [{ data: dData, backgroundColor: dBg, borderColor: dBorder, borderWidth: 2 }] },
        options: {
          responsive: true, maintainAspectRatio: false, cutout: "65%",
          plugins: {
            legend: { position: "right" },
            tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${fmt(ctx.raw)} (${((ctx.raw / data.total) * 100).toFixed(1)}%)` } },
          },
        },
      });
    }

    // Preview table
    const tbody = document.querySelector("#upload-table tbody");
    if (tbody) {
      tbody.innerHTML = data.preview.map(row => {
        const tweetKey = Object.keys(row).find(k => ["tweet", "text", "teks"].includes(k.toLowerCase())) || Object.keys(row)[0];
        const sent = (row.sentiment_hasil || "").toLowerCase();
        const badgeCls = sent === "positif" ? "badge-pos" : sent === "negatif" ? "badge-neg" : "badge-net";
        return `<tr>
          <td style="max-width:320px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${row[tweetKey] || "—"}</td>
          <td><span class="${badgeCls}">${sent || "—"}</span></td>
        </tr>`;
      }).join("");
    }

    // ── Tren upload ───────────────────────────────────────
    uploadRawRows = data.raw_rows || [];

    // Simpan full data & nama file untuk download
    uploadFullData = data.full_data || [];
    uploadFileName = `hasil_sentimen_${periodeVal}_${modelVal}`;

    const hasTrendUpload =
      Array.isArray(data.trend_upload) && data.trend_upload.length > 0;

    if (uploadRawRows.length > 0) {
      // raw_rows ada → agregasi dilakukan di frontend (bisa ganti interval & saham)
      populateUploadSahamFilter(uploadRawRows);
      bindUploadTrendFilters(isSVM);
      renderUploadTrendChart(isSVM);

    } else if (hasTrendUpload) {
      // Fallback: pakai trend_upload dari backend (interval tidak bisa diganti)
      const sahamSel = document.getElementById("upload-trend-saham");
      if (sahamSel) { sahamSel.style.display = "none"; if (sahamSel.previousElementSibling) sahamSel.previousElementSibling.style.display = "none"; }

      uploadTrendBaseData = {
        labels: data.trend_upload.map((x) => x.label),
        datasets: [
          { data: data.trend_upload.map((x) => x.positif) },
          { data: data.trend_upload.map((x) => x.negatif) },
          ...(isSVM ? [{ data: data.trend_upload.map((x) => x.netral || 0) }] : []),
        ],
      };

      if (uploadTrendChart) uploadTrendChart.destroy();
      const chartDs = [
        { label: "Positif", data: [], borderColor: COLOR.positif.line, backgroundColor: COLOR.positif.fill, fill: true, tension: 0.35, pointRadius: 3, pointHoverRadius: 6, borderWidth: 2 },
        { label: "Negatif", data: [], borderColor: COLOR.negatif.line, backgroundColor: COLOR.negatif.fill, fill: true, tension: 0.35, pointRadius: 3, pointHoverRadius: 6, borderWidth: 2 },
      ];
      if (isSVM) chartDs.push({ label: "Netral", data: [], borderColor: COLOR.netral.line, backgroundColor: COLOR.netral.fill, fill: true, tension: 0.35, pointRadius: 3, pointHoverRadius: 6, borderWidth: 2 });

      const tCanvas = document.getElementById("upload-trend-chart");
      if (tCanvas) {
        tCanvas.dataset.zoomBound = "0";
        uploadTrendChart = new Chart(tCanvas.getContext("2d"), {
          type: "line", data: { labels: [], datasets: chartDs },
          options: {
            responsive: true, maintainAspectRatio: false, interaction: { mode: "index", intersect: false }, animation: false,
            plugins: { legend: { position: "top" }, tooltip: { callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ${fmt(ctx.parsed.y)}` } } },
            scales: { x: { grid: { color: "#e6ecf5" }, ticks: { autoSkip: true, maxTicksLimit: 12, maxRotation: 45 } }, y: { beginAtZero: true, grid: { color: "#e6ecf5" }, ticks: { callback: (v) => v >= 1000 ? (v / 1000).toFixed(1) + "K" : v } } },
          },
        });
        uploadTrendZoomEngine = createZoomPanEngine("upload-trend-chart", () => uploadTrendBaseData, () => uploadTrendChart);
        const tot = uploadTrendBaseData.labels.length;
        uploadTrendZoomEngine.setWindow(tot, Math.min(tot, 24));
        uploadTrendZoomEngine.bind();
        uploadTrendZoomEngine.sync();
        bindUploadTrendFilters(isSVM);
      }
      document.getElementById("upload-trend-section").classList.remove("d-none");
      document.getElementById("upload-trend-empty").classList.add("d-none");

    } else {
      document.getElementById("upload-trend-section").classList.add("d-none");
      document.getElementById("upload-trend-empty").classList.remove("d-none");
    }

  } catch (err) {
    console.error("Upload error:", err);
    placeholder.classList.remove("d-none");
    document.getElementById("upload-result").classList.add("d-none");
    placeholder.innerHTML = `
      <i class="bi bi-exclamation-triangle" style="color:var(--negative)"></i>
      <p class="text-danger mt-2">${err.message}</p>`;
  } finally {
    btn.querySelector(".btn-text").classList.remove("d-none");
    btn.querySelector(".btn-loading").classList.add("d-none");
    btn.disabled = false;
  }
};

// ══════════════════════════════════════════════════════════
//  DOWNLOAD HASIL ANALISIS
// ══════════════════════════════════════════════════════════
window.downloadHasil = function (format) {
  // Prioritas: full_data → bangun dari raw_rows → kosong
  let dataToDownload = uploadFullData;

  if (!dataToDownload || dataToDownload.length === 0) {
    // Fallback: pakai raw_rows jika full_data tidak tersedia
    if (uploadRawRows && uploadRawRows.length > 0) {
      dataToDownload = uploadRawRows;
    } else {
      alert("Tidak ada data untuk diunduh. Silakan upload CSV terlebih dahulu.");
      return;
    }
  }

  const filename = uploadFileName || "hasil_analisis";

  if (format === "csv") {
    const headers = Object.keys(dataToDownload[0]);
    const rows = dataToDownload.map(row =>
      headers.map(h => {
        const val = String(row[h] ?? "").replace(/"/g, '""');
        return /[",\n\r]/.test(val) ? `"${val}"` : val;
      }).join(",")
    );
    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    _triggerDownload(blob, `${filename}.csv`);

  } else if (format === "xlsx") {
    // Simpan referensi data untuk dipakai di callback async
    window._xlsxDataToDownload = dataToDownload;
    if (typeof XLSX === "undefined") {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
      script.onload = () => _buildAndDownloadXlsx(filename, window._xlsxDataToDownload);
      script.onerror = () => alert("Gagal memuat library Excel. Coba download CSV.");
      document.head.appendChild(script);
    } else {
      _buildAndDownloadXlsx(filename, dataToDownload);
    }
  }
};

function _buildAndDownloadXlsx(filename, data) {
  // Gunakan parameter data, bukan uploadFullData langsung
  const ws = XLSX.utils.json_to_sheet(data);
  const cols = Object.keys(data[0]);
  ws["!cols"] = cols.map(key => ({
    wch: Math.max(
      key.length,
      ...data.slice(0, 100).map(r => String(r[key] ?? "").length)
    ) + 2,
  }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Hasil Sentimen");
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

function _triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ══════════════════════════════════════════════════════════
//  EVENT LISTENERS UTAMA
// ══════════════════════════════════════════════════════════

document.getElementById("filter-periode")?.addEventListener("click", e => {
  const btn = e.target.closest("[data-value]");
  if (!btn) return;
  document.querySelectorAll("#filter-periode .btn-filter").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  state.periode = btn.dataset.value;
  loadDashboard();
  loadTrend();
});

document.getElementById("trend-saham")?.addEventListener("change", e => {
  state.trendSaham = e.target.value;
  loadTrend();
});

document.getElementById("trend-period-type")?.addEventListener("click", e => {
  const btn = e.target.closest("[data-value]");
  if (!btn) return;
  document.querySelectorAll("#trend-period-type .btn-filter-sm").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  state.periodType = btn.dataset.value;
  loadTrend();
});

// ── Init ─────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const activePeriodeBtn = document.querySelector("#filter-periode .btn-filter.active");
  if (activePeriodeBtn) state.periode = activePeriodeBtn.dataset.value;

  const netralCard = document.getElementById("stat-card-netral");
  if (netralCard) netralCard.style.display = "none";

  loadDashboard();
  loadTrend();
});