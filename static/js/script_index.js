// static/js/script.js
"use strict";

// ── State ────────────────────────────────────────────────
const state = {
  periode: "all_periods",
  trendSaham: "bbri",
  periodType: "monthly",
};

// ── Chart instances ──────────────────────────────────────
let trendChart = null;
let comparisonChart = null;
let uploadChart = null;
let uploadTrendChart = null;

// ── Chart.js default theme ───────────────────────────────
Chart.defaults.color = "#8b949e";
Chart.defaults.borderColor = "#30363d";
Chart.defaults.font.family = "'Plus Jakarta Sans', system-ui, sans-serif";
Chart.defaults.font.size = 12;

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
  const from = 0;
  const to = parseInt(target, 10);
  const tick = () => {
    const elapsed = Date.now() - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = fmt(Math.round(from + (to - from) * ease));
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
    animateCount(document.getElementById("total-tweet"), data.total);

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
  const labels = Object.values(distribusi).map(d => d.label);
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
          label: "Positif",
          data: positifs,
          backgroundColor: "rgba(63,185,80,.75)",
          borderColor: "#3fb950",
          borderWidth: 1,
          borderRadius: 4,
        },
        {
          label: "Negatif",
          data: negatifs,
          backgroundColor: "rgba(248,81,73,.75)",
          borderColor: "#f85149",
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
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
        x: { grid: { color: "#e6ecf5" } },
        y: {
          grid: { color: "#e6ecf5" },
          ticks: {
            callback: v => (v >= 1000 ? (v / 1000).toFixed(1) + "K" : v),
          },
        },
      }
    },
  });
}

// ══════════════════════════════════════════════════════════
//  TREND CHART — TradingView-like zoom & pan
// ══════════════════════════════════════════════════════════
let trendBaseData = null;
let trendView = {
  start: 0,
  end: 0,
};

let trendDrag = {
  active: false,
  startX: 0,
  startStart: 0,
  startEnd: 0,
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getInitialTrendWindowSize(totalPoints) {
  if (state.periodType === "daily") return Math.min(totalPoints, 120);
  if (state.periodType === "weekly") return Math.min(totalPoints, 60);
  return Math.min(totalPoints, 24);
}

function setInitialTrendWindow(totalPoints) {
  const windowSize = getInitialTrendWindowSize(totalPoints);
  trendView.start = Math.max(0, totalPoints - windowSize);
  trendView.end = totalPoints - 1;
}

function getVisibleTrendCount() {
  return trendView.end - trendView.start + 1;
}

function getTrendSlice() {
  if (!trendBaseData) return null;

  const s = trendView.start;
  const e = trendView.end + 1;

  return {
    labels: trendBaseData.labels.slice(s, e),
    positifs: trendBaseData.positifs.slice(s, e),
    negatifs: trendBaseData.negatifs.slice(s, e),
  };
}

function syncTrendChart() {
  if (!trendChart || !trendBaseData) return;

  const slice = getTrendSlice();
  if (!slice) return;

  trendChart.data.labels = slice.labels;
  trendChart.data.datasets[0].data = slice.positifs;
  trendChart.data.datasets[1].data = slice.negatifs;

  const visibleCount = slice.labels.length;
  const xTicks = trendChart.options.scales.x.ticks;

  if (visibleCount <= 12) {
    xTicks.autoSkip = false;
    xTicks.maxTicksLimit = visibleCount;
    xTicks.maxRotation = 0;
  } else if (visibleCount <= 30) {
    xTicks.autoSkip = true;
    xTicks.maxTicksLimit = 12;
    xTicks.maxRotation = 30;
  } else {
    xTicks.autoSkip = true;
    xTicks.maxTicksLimit = 12;
    xTicks.maxRotation = 45;
  }

  trendChart.update("none");
}

function zoomTrendAt(clientX, zoomFactor) {
  if (!trendBaseData) return;

  const total = trendBaseData.labels.length;
  const currentSize = getVisibleTrendCount();
  const nextSize = clamp(Math.round(currentSize * zoomFactor), 5, total);

  const canvas = document.getElementById("trend-chart");
  const rect = canvas.getBoundingClientRect();
  const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);

  const anchorIndex = trendView.start + Math.round(ratio * Math.max(currentSize - 1, 1));
  let newStart = anchorIndex - Math.floor(nextSize / 2);
  let newEnd = newStart + nextSize - 1;

  if (newStart < 0) {
    newEnd += -newStart;
    newStart = 0;
  }
  if (newEnd > total - 1) {
    const shift = newEnd - (total - 1);
    newStart = Math.max(0, newStart - shift);
    newEnd = total - 1;
  }

  trendView.start = clamp(newStart, 0, total - 1);
  trendView.end = clamp(newEnd, trendView.start, total - 1);

  syncTrendChart();
}

function panTrendByPixels(deltaX) {
  if (!trendBaseData) return;

  const total = trendBaseData.labels.length;
  const visibleCount = getVisibleTrendCount();
  const canvas = document.getElementById("trend-chart");
  const rect = canvas.getBoundingClientRect();

  const pixelsPerPoint = rect.width / Math.max(visibleCount, 1);
  const pointsShift = Math.round(-deltaX / pixelsPerPoint);

  let newStart = trendDrag.startStart + pointsShift;
  let newEnd = trendDrag.startEnd + pointsShift;

  if (newStart < 0) {
    newEnd += -newStart;
    newStart = 0;
  }
  if (newEnd > total - 1) {
    const overflow = newEnd - (total - 1);
    newStart = Math.max(0, newStart - overflow);
    newEnd = total - 1;
  }

  trendView.start = clamp(newStart, 0, total - 1);
  trendView.end = clamp(newEnd, trendView.start, total - 1);

  syncTrendChart();
}

function panTrendBySteps(direction) {
  if (!trendBaseData) return;

  const total = trendBaseData.labels.length;
  const visibleCount = getVisibleTrendCount();

  // semakin besar chart yang terlihat, semakin besar langkah gesernya
  const stepSize = Math.max(1, Math.round(visibleCount / 20));
  const shift = direction * stepSize;

  let newStart = trendView.start + shift;
  let newEnd = trendView.end + shift;

  if (newStart < 0) {
    newEnd += -newStart;
    newStart = 0;
  }

  if (newEnd > total - 1) {
    const overflow = newEnd - (total - 1);
    newStart = Math.max(0, newStart - overflow);
    newEnd = total - 1;
  }

  trendView.start = clamp(newStart, 0, total - 1);
  trendView.end = clamp(newEnd, trendView.start, total - 1);

  syncTrendChart();
}

function bindTrendInteractions() {
  const canvas = document.getElementById("trend-chart");
  if (!canvas || canvas.dataset.bound === "1") return;

  const wrapper = document.querySelector(".trend-chart-wrapper");

  canvas.addEventListener(
    "wheel",
    (e) => {
      // Ctrl + scroll = zoom
      if (e.ctrlKey) {
        e.preventDefault();
        const zoomFactor = e.deltaY < 0 ? 0.85 : 1.18;
        zoomTrendAt(e.clientX, zoomFactor);
        return;
      }

      // Shift + scroll = geser horizontal
      if (e.shiftKey) {
        e.preventDefault();

        // scroll ke bawah -> geser ke kanan
        // scroll ke atas  -> geser ke kiri
        const direction = e.deltaY > 0 ? -1 : 1;
        panTrendBySteps(direction);
      }
    },
    { passive: false }
  );

  canvas.addEventListener("mousedown", (e) => {
    if (!trendBaseData) return;

    trendDrag.active = true;
    trendDrag.startX = e.clientX;
    trendDrag.startStart = trendView.start;
    trendDrag.startEnd = trendView.end;

    canvas.classList.add("is-dragging");
    canvas.style.cursor = "grabbing";
  });

  window.addEventListener("mousemove", (e) => {
    if (!trendDrag.active) return;
    panTrendByPixels(e.clientX - trendDrag.startX);
  });

  window.addEventListener("mouseup", () => {
    trendDrag.active = false;
    canvas.classList.remove("is-dragging");
    canvas.style.cursor = "grab";
  });

  canvas.addEventListener("mouseleave", () => {
    if (!trendDrag.active) return;
    trendDrag.active = false;
    canvas.classList.remove("is-dragging");
    canvas.style.cursor = "grab";
  });

  canvas.addEventListener("dblclick", () => {
    if (!trendBaseData) return;
    trendView.start = 0;
    trendView.end = trendBaseData.labels.length - 1;
    syncTrendChart();
  });

  // ═══════════════════════════════════════
  // MOBILE TOUCH SUPPORT
  // pinch zoom + swipe pan
  // ═══════════════════════════════════════

  let touchStartDistance = null;
  let touchStartWindow = null;

  canvas.addEventListener(
    "touchstart",
    (e) => {

      // PAN 1 JARI
      if (e.touches.length === 1) {
        trendDrag.active = true;
        trendDrag.startX = e.touches[0].clientX;
        trendDrag.startStart = trendView.start;
        trendDrag.startEnd = trendView.end;
      }

      // PINCH 2 JARI
      if (e.touches.length === 2) {
        trendDrag.active = false;

        const dx =
          e.touches[0].clientX - e.touches[1].clientX;

        const dy =
          e.touches[0].clientY - e.touches[1].clientY;

        touchStartDistance = Math.sqrt(dx * dx + dy * dy);

        touchStartWindow = {
          start: trendView.start,
          end: trendView.end,
        };
      }
    },
    { passive: false }
  );

  canvas.addEventListener(
    "touchmove",
    (e) => {

      // PAN
      if (e.touches.length === 1 && trendDrag.active) {

        const currentX = e.touches[0].clientX;

        panTrendByPixels(currentX - trendDrag.startX);
      }

      // PINCH ZOOM
      if (
        e.touches.length === 2 &&
        touchStartDistance &&
        touchStartWindow
      ) {

        e.preventDefault();

        const dx =
          e.touches[0].clientX - e.touches[1].clientX;

        const dy =
          e.touches[0].clientY - e.touches[1].clientY;

        const currentDistance = Math.sqrt(dx * dx + dy * dy);

        const scale =
          touchStartDistance / currentDistance;

        const total = trendBaseData.labels.length;

        const originalSize =
          touchStartWindow.end -
          touchStartWindow.start +
          1;

        const newSize = clamp(
          Math.round(originalSize * scale),
          5,
          total
        );

        const center =
          Math.round(
            (touchStartWindow.start +
              touchStartWindow.end) / 2
          );

        let newStart =
          center - Math.floor(newSize / 2);

        let newEnd =
          newStart + newSize - 1;

        if (newStart < 0) {
          newEnd += -newStart;
          newStart = 0;
        }

        if (newEnd > total - 1) {
          const overflow = newEnd - (total - 1);
          newStart = Math.max(
            0,
            newStart - overflow
          );
          newEnd = total - 1;
        }

        trendView.start = newStart;
        trendView.end = newEnd;

        syncTrendChart();
      }
    },
    { passive: false }
  );

  canvas.addEventListener("touchend", () => {
    trendDrag.active = false;
    touchStartDistance = null;
    touchStartWindow = null;
  });

  canvas.dataset.bound = "1";
}

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
  const labels = data.data.map(d => d.label);
  const positifs = data.data.map(d => d.positif);
  const negatifs = data.data.map(d => d.negatif);

  trendBaseData = { labels, positifs, negatifs };

  if (trendChart) trendChart.destroy();

  const totalPoints = labels.length;
  setInitialTrendWindow(totalPoints);

  const ctx = document.getElementById("trend-chart").getContext("2d");

  trendChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Positif",
          data: [],
          borderColor: "#3fb950",
          backgroundColor: "rgba(63,185,80,.1)",
          fill: true,
          tension: 0.35,
          pointRadius: 3,
          pointHoverRadius: 6,
          borderWidth: 2,
        },
        {
          label: "Negatif",
          data: [],
          borderColor: "#f85149",
          backgroundColor: "rgba(248,81,73,.08)",
          fill: true,
          tension: 0.35,
          pointRadius: 3,
          pointHoverRadius: 6,
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      animation: false,
      plugins: {
        legend: { position: "top" },
        tooltip: {
          callbacks: {
            title: items => items[0].label,
            label: ctx => ` ${ctx.dataset.label}: ${fmt(ctx.parsed.y)}`,
          },
        },
      },
      scales: {
        x: {
          grid: { color: "#e6ecf5" },
          ticks: {
            autoSkip: true,
            maxTicksLimit: 12,
            maxRotation: 45,
          },
        },
        y: {
          grid: { color: "#e6ecf5" },
          ticks: {
            callback: v => (v >= 1000 ? (v / 1000).toFixed(1) + "K" : v),
          },
        },
      },
    },
  });

  bindTrendInteractions();
  syncTrendChart();

  const resetBtn = document.getElementById("resetTrendZoom");
  if (resetBtn && !resetBtn.dataset.bound) {
    resetBtn.addEventListener("click", () => {
      if (!trendBaseData) return;
      trendView.start = 0;
      trendView.end = trendBaseData.labels.length - 1;
      syncTrendChart();
    });
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
document.getElementById("upload-form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const fileInput = document.getElementById("upload-file");
  const periodeVal = document.getElementById("upload-periode").value;
  const btn = document.getElementById("upload-btn");

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
  formData.append("file", fileInput.files[0]);
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
        labels: ["Positif", "Negatif"],
        datasets: [{
          data: [data.positif, data.negatif],
          backgroundColor: ["rgba(63,185,80,.8)", "rgba(248,81,73,.8)"],
          borderColor: ["#3fb950", "#f85149"],
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "65%",
        plugins: {
          legend: { position: "right" },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.label}: ${fmt(ctx.raw)} (${((ctx.raw / data.total) * 100).toFixed(1)}%)`
            }
          },
        },
      },
    });

    // Preview table
    // Preview table
    const tbody = document.querySelector("#upload-table tbody");
    tbody.innerHTML = data.preview.map(row => {
      const tweetKey = Object.keys(row).find(k =>
        ["tweet", "text", "teks"].includes(k.toLowerCase())
      ) || Object.keys(row)[0];
      const sent = row.sentiment_hasil || "";
      return `<tr>
    <td style="max-width:320px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${row[tweetKey] || "—"}</td>
    <td><span class="${sent === "positif" ? "badge-pos" : "badge-neg"}">${sent}</span></td>
  </tr>`;
    }).join("");

    // Trend chart hasil upload
    const uploadTrendSection = document.getElementById("upload-trend-section");
    const uploadTrendEmpty = document.getElementById("upload-trend-empty");

    if (uploadTrendChart) {
      uploadTrendChart.destroy();
      uploadTrendChart = null;
    }

    if (data.trend_upload && data.trend_upload.length > 0) {
      uploadTrendSection.classList.remove("d-none");
      uploadTrendEmpty.classList.add("d-none");

      const trendLabels = data.trend_upload.map(x => x.label);
      const trendPos = data.trend_upload.map(x => x.positif);
      const trendNeg = data.trend_upload.map(x => x.negatif);

      const trendCtx = document.getElementById("upload-trend-chart").getContext("2d");
      uploadTrendChart = new Chart(trendCtx, {
        type: "line",
        data: {
          labels: trendLabels,
          datasets: [
            {
              label: "Positif",
              data: trendPos,
              borderColor: "#3fb950",
              backgroundColor: "rgba(63,185,80,.12)",
              fill: true,
              tension: 0.35,
              pointRadius: 3,
              pointHoverRadius: 6,
              borderWidth: 2,
            },
            {
              label: "Negatif",
              data: trendNeg,
              borderColor: "#f85149",
              backgroundColor: "rgba(248,81,73,.08)",
              fill: true,
              tension: 0.35,
              pointRadius: 3,
              pointHoverRadius: 6,
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: "index", intersect: false },
          plugins: {
            legend: { position: "top" },
            tooltip: {
              callbacks: {
                title: items => items[0].label,
                label: ctx => ` ${ctx.dataset.label}: ${fmt(ctx.parsed.y)}`,
              },
            },
          },
          scales: {
            x: {
              grid: { color: "#e6ecf5" },
              ticks: {
                autoSkip: true,
                maxTicksLimit: 10,
                maxRotation: 45,
              },
            },
            y: {
              beginAtZero: true,
              grid: { color: "#e6ecf5" },
              ticks: {
                callback: v => (v >= 1000 ? (v / 1000).toFixed(1) + "K" : v),
              },
            },
          },
        },
      });
    } else {
      uploadTrendSection.classList.add("d-none");
      uploadTrendEmpty.classList.remove("d-none");
    }

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

  // ambil tombol periode yang aktif
  const activePeriodeBtn = document.querySelector(
    "#filter-periode .btn-filter.active"
  );

  // sinkronkan state dengan tombol aktif
  if (activePeriodeBtn) {
    state.periode = activePeriodeBtn.dataset.value;
  }

  // load data awal
  loadDashboard();
  loadTrend();

});