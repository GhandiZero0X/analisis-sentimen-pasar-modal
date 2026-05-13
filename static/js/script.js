// static/js/script.js
"use strict";

// ── State ────────────────────────────────────────────────
const state = {
  periode    : "all_periods",
  trendSaham : "bbri",
  periodType : "monthly",
};

// ── Chart instances ──────────────────────────────────────
let trendChart      = null;
let comparisonChart = null;
let uploadChart     = null;

// ── Chart.js default theme ───────────────────────────────
Chart.defaults.color          = "#8b949e";
Chart.defaults.borderColor    = "#30363d";
Chart.defaults.font.family    = "'Plus Jakarta Sans', system-ui, sans-serif";
Chart.defaults.font.size      = 12;

// ── Helpers ──────────────────────────────────────────────
function fmt(n) {
  if (n === null || n === undefined || n === "—") return "—";
  return Number(n).toLocaleString("id-ID");
}

function showLoading(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove("d-none");
}
function hideLoading(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add("d-none");
}

async function apiFetch(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Gagal memuat data");
  }
  return res.json();
}

// ── Number counter animation ─────────────────────────────
function animateCount(el, target, duration = 800) {
  const start = Date.now();
  const from  = 0;
  const to    = parseInt(target, 10);
  const tick  = () => {
    const elapsed = Date.now() - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease     = 1 - Math.pow(1 - progress, 3);
    el.textContent = fmt(Math.round(from + (to - from) * ease));
    if (progress < 1) requestAnimationFrame(tick);
  };
  tick();
}

// ── Hero saham rotation ──────────────────────────────────
const sahamNames = ["BBRI","BMRI","TLKM","ISAT","ICBP","UNVR"];
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

// ══════════════════════════════════════════════════════════
//  DASHBOARD DATA
// ══════════════════════════════════════════════════════════
async function loadDashboard() {
  showLoading("filter-loading");

  try {
    const data = await apiFetch(`/api/dashboard?periode=${state.periode}`);

    // Update summary cards
    animateCount(document.getElementById("total-positif"), data.positif);
    animateCount(document.getElementById("total-negatif"), data.negatif);
    animateCount(document.getElementById("total-tweet"),   data.total);

    // Render saham cards
    renderSahamCards(data.distribusi);

    // Update comparison chart
    renderComparisonChart(data.distribusi);

  } catch (e) {
    document.getElementById("saham-cards").innerHTML =
      `<div class="col-12"><div class="alert-danger-dark">${e.message}</div></div>`;
  } finally {
    hideLoading("filter-loading");
  }
}

// ── Saham Cards ──────────────────────────────────────────
function renderSahamCards(distribusi) {
  const container = document.getElementById("saham-cards");
  container.innerHTML = "";

  Object.entries(distribusi).forEach(([saham, d]) => {
    const pct = d.pct_positif || 0;
    const col = document.createElement("div");
    col.className = "col-6 col-md-4 col-lg-2";
    col.innerHTML = `
      <div class="saham-card" onclick="openSahamDetail('${saham}')">
        <div class="saham-ticker">${saham.toUpperCase()}</div>
        <div class="saham-name">${d.label}</div>
        <div class="saham-bar">
          <div class="saham-bar-inner" style="width:0%" data-target="${pct}"></div>
        </div>
        <div class="saham-stats">
          <span class="pos"><i class="bi bi-arrow-up-short"></i>${d.pct_positif}%</span>
          <span class="neg"><i class="bi bi-arrow-down-short"></i>${d.pct_negatif}%</span>
          <span class="tot">${fmt(d.total)}</span>
        </div>
      </div>`;
    container.appendChild(col);
  });

  // Animate bars setelah render
  requestAnimationFrame(() => {
    document.querySelectorAll(".saham-bar-inner").forEach(bar => {
      const target = bar.dataset.target;
      setTimeout(() => { bar.style.width = target + "%"; }, 100);
    });
  });
}

// ── Comparison Chart ─────────────────────────────────────
function renderComparisonChart(distribusi) {
  const labels   = Object.values(distribusi).map(d => d.label);
  const positifs = Object.values(distribusi).map(d => d.positif);
  const negatifs = Object.values(distribusi).map(d => d.negatif);

  if (comparisonChart) comparisonChart.destroy();

  const ctx = document.getElementById("comparison-chart").getContext("2d");
  comparisonChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label          : "Positif",
          data           : positifs,
          backgroundColor: "rgba(63,185,80,.75)",
          borderColor    : "#3fb950",
          borderWidth    : 1,
          borderRadius   : 4,
        },
        {
          label          : "Negatif",
          data           : negatifs,
          backgroundColor: "rgba(248,81,73,.75)",
          borderColor    : "#f85149",
          borderWidth    : 1,
          borderRadius   : 4,
        },
      ],
    },
    options: {
      responsive       : true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "top" },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.dataset.label}: ${fmt(ctx.parsed.y)}`,
          },
        },
      },
      scales: {
        x: { grid: { color: "#21262d" } },
        y: {
          grid   : { color: "#21262d" },
          ticks  : {
            callback: v => (v >= 1000 ? (v/1000).toFixed(1)+"K" : v),
          },
        },
      },
    },
  });
}

// ══════════════════════════════════════════════════════════
//  TREND CHART
// ══════════════════════════════════════════════════════════
async function loadTrend() {
  showLoading("trend-loading");
  try {
    const data = await apiFetch(
      `/api/trend?saham=${state.trendSaham}&periode=${state.periode}&period_type=${state.periodType}`
    );
    renderTrendChart(data);
  } catch (e) {
    console.error("Gagal load trend:", e.message);
  } finally {
    hideLoading("trend-loading");
  }
}

function renderTrendChart(data) {
  const labels   = data.data.map(d => d.label);
  const positifs = data.data.map(d => d.positif);
  const negatifs = data.data.map(d => d.negatif);

  if (trendChart) trendChart.destroy();

  const ctx = document.getElementById("trend-chart").getContext("2d");
  trendChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label          : "Positif",
          data           : positifs,
          borderColor    : "#3fb950",
          backgroundColor: "rgba(63,185,80,.1)",
          fill           : true,
          tension        : 0.4,
          pointRadius    : 3,
          pointHoverRadius: 6,
          borderWidth    : 2,
        },
        {
          label          : "Negatif",
          data           : negatifs,
          borderColor    : "#f85149",
          backgroundColor: "rgba(248,81,73,.08)",
          fill           : true,
          tension        : 0.4,
          pointRadius    : 3,
          pointHoverRadius: 6,
          borderWidth    : 2,
        },
      ],
    },
    options: {
      responsive        : true,
      maintainAspectRatio: false,
      interaction       : { mode: "index", intersect: false },
      plugins: {
        legend: { position: "top" },
        tooltip: {
          callbacks: {
            title: items => items[0].label,
            label: ctx  => ` ${ctx.dataset.label}: ${fmt(ctx.parsed.y)}`,
          },
        },
      },
      scales: {
        x: {
          grid : { color: "#21262d" },
          ticks: { maxTicksLimit: 12, maxRotation: 45 },
        },
        y: {
          grid : { color: "#21262d" },
          ticks: { callback: v => (v >= 1000 ? (v/1000).toFixed(1)+"K" : v) },
        },
      },
    },
  });
}

// ══════════════════════════════════════════════════════════
//  MODAL DETAIL SAHAM
// ══════════════════════════════════════════════════════════
window.openSahamDetail = async function(saham) {
  const modal = new bootstrap.Modal(document.getElementById("saham-modal"));
  document.getElementById("modal-title").textContent = saham.toUpperCase();
  document.getElementById("modal-body").innerHTML =
    `<div class="text-center py-4"><div class="spinner-border text-accent"></div></div>`;
  modal.show();

  try {
    const d = await apiFetch(`/api/saham?saham=${saham}&periode=${state.periode}`);

    document.getElementById("modal-title").textContent =
      `${d.saham_label} (${d.saham.toUpperCase()})`;

    const sampleRows = d.sample.map(s => `
      <tr>
        <td class="text-muted" style="width:90px;font-size:.75rem">${s.date || "—"}</td>
        <td style="font-size:.82rem">${s.tweet}</td>
        <td><span class="${s.sentiment === "positif" ? "badge-pos" : "badge-neg"}">${s.sentiment}</span></td>
      </tr>`).join("");

    document.getElementById("modal-body").innerHTML = `
      <div class="row g-3 mb-4">
        <div class="col-4 text-center">
          <div class="stat-value text-success">${fmt(d.positif)}</div>
          <div class="stat-label">Positif (${d.pct_positif}%)</div>
        </div>
        <div class="col-4 text-center">
          <div class="stat-value text-danger">${fmt(d.negatif)}</div>
          <div class="stat-label">Negatif (${d.pct_negatif}%)</div>
        </div>
        <div class="col-4 text-center">
          <div class="stat-value">${fmt(d.total)}</div>
          <div class="stat-label">Total</div>
        </div>
      </div>
      <div class="saham-bar mb-4" style="height:8px">
        <div class="saham-bar-inner" style="width:${d.pct_positif}%"></div>
      </div>
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
//  UPLOAD CSV
// ══════════════════════════════════════════════════════════
document.getElementById("upload-form").addEventListener("submit", async function(e) {
  e.preventDefault();

  const fileInput  = document.getElementById("upload-file");
  const periodeVal = document.getElementById("upload-periode").value;
  const btn        = document.getElementById("upload-btn");

  if (!fileInput.files.length) {
    fileInput.classList.add("is-invalid");
    return;
  }
  fileInput.classList.remove("is-invalid");

  // Toggle loading state
  btn.querySelector(".btn-text").classList.add("d-none");
  btn.querySelector(".btn-loading").classList.remove("d-none");
  btn.disabled = true;

  const formData = new FormData();
  formData.append("file",    fileInput.files[0]);
  formData.append("periode", periodeVal);

  try {
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Upload gagal");

    // Show result
    document.getElementById("upload-placeholder").classList.add("d-none");
    document.getElementById("upload-result").classList.remove("d-none");

    // Summary stats
    document.getElementById("upload-summary").innerHTML = `
      <div class="col-4">
        <div class="stat-card">
          <div class="stat-value">${fmt(data.total)}</div>
          <div class="stat-label">Total</div>
        </div>
      </div>
      <div class="col-4">
        <div class="stat-card">
          <div class="stat-value" style="color:var(--positive)">${fmt(data.positif)}</div>
          <div class="stat-label">Positif (${data.pct_positif}%)</div>
        </div>
      </div>
      <div class="col-4">
        <div class="stat-card">
          <div class="stat-value" style="color:var(--negative)">${fmt(data.negatif)}</div>
          <div class="stat-label">Negatif (${data.pct_negatif}%)</div>
        </div>
      </div>`;

    // Doughnut chart
    if (uploadChart) uploadChart.destroy();
    const ctx = document.getElementById("upload-chart").getContext("2d");
    uploadChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels  : ["Positif", "Negatif"],
        datasets: [{
          data           : [data.positif, data.negatif],
          backgroundColor: ["rgba(63,185,80,.8)", "rgba(248,81,73,.8)"],
          borderColor    : ["#3fb950", "#f85149"],
          borderWidth    : 2,
        }],
      },
      options: {
        responsive       : true,
        maintainAspectRatio: false,
        cutout           : "65%",
        plugins: {
          legend  : { position: "right" },
          tooltip : {
            callbacks: {
              label: ctx => ` ${ctx.label}: ${fmt(ctx.raw)} (${((ctx.raw/data.total)*100).toFixed(1)}%)`
            }
          },
        },
      },
    });

    // Preview table
    const tbody = document.querySelector("#upload-table tbody");
    tbody.innerHTML = data.preview.map(row => {
      const tweetKey = Object.keys(row).find(k =>
        ["tweet","text","teks"].includes(k.toLowerCase())
      ) || Object.keys(row)[0];
      const sent = row.sentiment_hasil || "";
      return `<tr>
        <td style="max-width:320px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${row[tweetKey] || "—"}</td>
        <td><span class="${sent === "positif" ? "badge-pos" : "badge-neg"}">${sent}</span></td>
      </tr>`;
    }).join("");

  } catch (err) {
    document.getElementById("upload-placeholder").classList.remove("d-none");
    document.getElementById("upload-result").classList.add("d-none");
    document.getElementById("upload-placeholder").innerHTML =
      `<i class="bi bi-exclamation-triangle" style="color:var(--negative)"></i>
       <p class="text-danger">${err.message}</p>`;
  } finally {
    btn.querySelector(".btn-text").classList.remove("d-none");
    btn.querySelector(".btn-loading").classList.add("d-none");
    btn.disabled = false;
  }
});

// ══════════════════════════════════════════════════════════
//  EVENT LISTENERS
// ══════════════════════════════════════════════════════════

// Filter periode
document.getElementById("filter-periode").addEventListener("click", e => {
  const btn = e.target.closest("[data-value]");
  if (!btn) return;
  document.querySelectorAll("#filter-periode .btn-filter")
          .forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  state.periode = btn.dataset.value;
  loadDashboard();
  loadTrend();
});

// Trend saham selector
document.getElementById("trend-saham").addEventListener("change", e => {
  state.trendSaham = e.target.value;
  loadTrend();
});

// Trend period type
document.getElementById("trend-period-type").addEventListener("click", e => {
  const btn = e.target.closest("[data-value]");
  if (!btn) return;
  document.querySelectorAll("#trend-period-type .btn-filter-sm")
          .forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  state.periodType = btn.dataset.value;
  loadTrend();
});

// ── Init ─────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  loadDashboard();
  loadTrend();
});