// ══════════════════════════════════════════════════════════════
//  FITUR: Analisis Sentimen Kalimat Tunggal
//  static/js/script.js
// ══════════════════════════════════════════════════════════════

// ── State kalimat ─────────────────────────────────────────────
const kalimatState = {
    model: "dl",   // "dl" | "svm"
    periode: "after" // selalu after COVID
};

// Kata kunci saham yang wajib ada
const SAHAM_KEYWORDS = ["bbri", "bmri", "tlkm", "isat", "icbp", "unvr"];

// Label nama lengkap
const SAHAM_FULL_LABEL = {
    bbri: "BBRI — Bank BRI",
    bmri: "BMRI — Bank Mandiri",
    tlkm: "TLKM — Telkom",
    isat: "ISAT — Indosat",
    icbp: "ICBP — Indofood CBP",
    unvr: "UNVR — Unilever",
};

// ── Pilih model ───────────────────────────────────────────────
window.selectKalimatModel = function (modelKey, btnEl) {
    kalimatState.model = modelKey;
    document.querySelectorAll("#kalimat-model-selector .btn-kalimat-model").forEach(b => {
        b.classList.remove("active");
    });
    if (btnEl) btnEl.classList.add("active");
};

// ── Live keyword highlighting ─────────────────────────────────
(function bindKalimatLiveKeywords() {
    const textarea = document.getElementById("kalimat-input");
    const charCountEl = document.getElementById("kalimat-char-count");
    if (!textarea) return;

    textarea.addEventListener("input", () => {
        const val = textarea.value;
        const len = val.length;

        // Update char count
        if (charCountEl) {
            charCountEl.textContent = len;
            charCountEl.className =
                len >= 1000 ? "at-limit" : len >= 850 ? "near-limit" : "";
        }

        // Highlight keyword chips
        const lower = val.toLowerCase();
        SAHAM_KEYWORDS.forEach(k => {
            const chip = document.getElementById(`chip-${k}`);
            if (!chip) return;
            chip.classList.toggle("detected", lower.includes(k));
        });

        // Reset error state when user types
        textarea.classList.remove("is-invalid");
        const errEl = document.getElementById("kalimat-error-text");
        if (errEl) { errEl.textContent = ""; errEl.classList.add("d-none"); }
    });
})();

// ── Deteksi saham dari teks ───────────────────────────────────
function detectSahamFromText(text) {
    const lower = text.toLowerCase();
    return SAHAM_KEYWORDS.filter(k => lower.includes(k));
}

// ── Validasi input ────────────────────────────────────────────
function validateKalimatInput(text) {
    const textarea = document.getElementById("kalimat-input");
    const errEl = document.getElementById("kalimat-error-text");

    function showError(msg) {
        textarea.classList.add("is-invalid");
        if (errEl) { errEl.textContent = msg; errEl.classList.remove("d-none"); }
        return false;
    }

    if (!text || text.trim().length === 0) {
        return showError("Kalimat tidak boleh kosong.");
    }
    if (text.trim().length < 5) {
        return showError("Kalimat terlalu pendek, minimal 5 karakter.");
    }

    const detected = detectSahamFromText(text);
    if (detected.length === 0) {
        return showError(
            "Kalimat harus mengandung minimal satu kata kunci saham: " +
            SAHAM_KEYWORDS.map(k => k.toUpperCase()).join(", ") + "."
        );
    }

    return true;
}

// ── Render hasil sentimen ─────────────────────────────────────
function renderKalimatResult(data, inputText) {
    const resultEl = document.getElementById("kalimat-result");
    const placeholderEl = document.getElementById("kalimat-placeholder");
    if (!resultEl || !placeholderEl) return;

    placeholderEl.classList.add("d-none");
    resultEl.classList.remove("d-none");

    const sentiment = (data.sentiment || "").toLowerCase();
    const isSVM = kalimatState.model === "svm";

    // ── Badge model ───────────────────────────────────────────
    const modelBadge = document.getElementById("kalimat-model-badge");
    if (modelBadge) {
        const icon = isSVM ? "bi-diagram-3" : "bi-cpu";
        const name = isSVM ? "SVM" : "IndoBERTweet";
        modelBadge.innerHTML = `<i class="bi ${icon} me-1"></i>${name} · After COVID`;
    }

    // ── Badge saham yang terdeteksi ───────────────────────────
    const sahamBadge = document.getElementById("kalimat-detected-saham");
    if (sahamBadge) {
        const detected = detectSahamFromText(inputText);
        if (detected.length > 0) {
            const labels = detected.map(k => k.toUpperCase()).join(", ");
            sahamBadge.innerHTML = `<i class="bi bi-buildings me-1"></i>${labels}`;
            sahamBadge.classList.remove("d-none");
        } else {
            sahamBadge.classList.add("d-none");
        }
    }

    // ── Teks preview ──────────────────────────────────────────
    const previewEl = document.getElementById("kalimat-preview-text");
    if (previewEl) previewEl.textContent = inputText.trim();

    // ── Sentiment card ────────────────────────────────────────
    const card = document.getElementById("kalimat-sentiment-display");
    const iconEl = document.getElementById("kalimat-sent-icon");
    const labelEl = document.getElementById("kalimat-sent-label");
    const subEl = document.getElementById("kalimat-sent-sublabel");

    if (card) {
        card.classList.remove("sent-positif", "sent-negatif", "sent-netral");
        card.classList.add(`sent-${sentiment}`);
    }

    const sentIcons = {
        positif: '<i class="bi bi-emoji-smile-fill"></i>',
        negatif: '<i class="bi bi-emoji-frown-fill"></i>',
        netral: '<i class="bi bi-dash-circle-fill"></i>',
    };
    if (iconEl) iconEl.innerHTML = sentIcons[sentiment] || '<i class="bi bi-question-circle"></i>';
    if (labelEl) labelEl.textContent = sentiment.charAt(0).toUpperCase() + sentiment.slice(1);
    if (subEl) subEl.textContent = isSVM
        ? "Hasil Klasifikasi SVM (3 Label)"
        : "Hasil Klasifikasi IndoBERTweet (2 Label)";

    // ── Confidence bars (jika probabilities tersedia) ─────────
    const confSection = document.getElementById("kalimat-confidence-section");
    const confBarsEl = document.getElementById("kalimat-confidence-bars");

    if (data.probabilities && Object.keys(data.probabilities).length > 0 && confSection && confBarsEl) {
        confSection.classList.remove("d-none");
        const probs = data.probabilities;
        confBarsEl.innerHTML = Object.entries(probs)
            .sort(([, a], [, b]) => b - a) // urut dari tertinggi
            .map(([label, prob]) => {
                const pct = Math.round(prob * 100);
                const clsName = label.toLowerCase();
                return `
          <div class="confidence-bar-row">
            <div class="confidence-bar-label">${label.charAt(0).toUpperCase() + label.slice(1)}</div>
            <div class="confidence-bar-track">
              <div
                class="confidence-bar-fill conf-${clsName}"
                style="width: ${pct}%"
              ></div>
            </div>
            <div class="confidence-bar-pct">${pct}%</div>
          </div>`;
            }).join("");
    } else if (confSection) {
        confSection.classList.add("d-none");
    }

    // ── Preprocessed text ─────────────────────────────────────
    const prepEl = document.getElementById("kalimat-preprocessed-text");
    if (prepEl) {
        prepEl.textContent = data.preprocessed_text || "(tidak tersedia)";
    }
}

// ── Submit utama ──────────────────────────────────────────────
window.submitKalimat = async function () {
    const textarea = document.getElementById("kalimat-input");
    const submitBtn = document.getElementById("kalimat-submit-btn");
    if (!textarea || !submitBtn) return;

    const inputText = textarea.value;

    // Validasi
    if (!validateKalimatInput(inputText)) return;

    // Loading state
    submitBtn.querySelector(".btn-text").classList.add("d-none");
    submitBtn.querySelector(".btn-loading").classList.remove("d-none");
    submitBtn.disabled = true;

    // Reset result
    document.getElementById("kalimat-result")?.classList.add("d-none");
    document.getElementById("kalimat-placeholder")?.classList.remove("d-none");

    try {
        const res = await fetch("/api/kalimat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                text: inputText,
                model: kalimatState.model,
                periode: kalimatState.periode,
            }),
        });

        let data;
        try { data = await res.json(); }
        catch { throw new Error("Server tidak mengembalikan JSON yang valid."); }

        if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

        renderKalimatResult(data, inputText);

    } catch (err) {
        console.error("Kalimat analysis error:", err);

        // Tampilkan error di placeholder
        const ph = document.getElementById("kalimat-placeholder");
        if (ph) {
            ph.classList.remove("d-none");
            ph.innerHTML = `
        <i class="bi bi-exclamation-triangle" style="font-size:2rem;color:var(--negative,#f85149)"></i>
        <p class="text-danger mt-2 mb-0 small">${err.message}</p>`;
        }
        document.getElementById("kalimat-result")?.classList.add("d-none");

    } finally {
        submitBtn.querySelector(".btn-text").classList.remove("d-none");
        submitBtn.querySelector(".btn-loading").classList.add("d-none");
        submitBtn.disabled = false;
    }
};

// ── Keyboard shortcut: Ctrl+Enter / Cmd+Enter ─────────────────
document.addEventListener("DOMContentLoaded", () => {
    const textarea = document.getElementById("kalimat-input");
    if (!textarea) return;
    textarea.addEventListener("keydown", e => {
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
            e.preventDefault();
            submitKalimat();
        }
    });
});