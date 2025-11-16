/* ================================
   CONFIG
=================================== */

// 🔁 Render backend base URL
const API_ANALYZE = "https://backend-ok0x.onrender.com/verify";


// ---------- FIREBASE CONFIG ----------


let firebaseApp = null;
let auth = null;
let db = null;
let currentUser = null;

// Keeps last analysis for reporting
let latestAnalysis = null;
let latestTextHash = null;

/* ================================
   DOM HELPERS
=================================== */
const $ = (sel) => document.querySelector(sel);

function showToast(message) {
  const toast = $("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove("hidden");
  setTimeout(() => {
    toast.classList.add("hidden");
  }, 4000);
}

/* ================================
   PRELOADER
=================================== */
let preloaderInterval = null;

function showPreloader() {
  const el = $("#preloader");
  if (!el) return;
  el.classList.remove("hidden");
  const steps = el.querySelectorAll(".preloader-step");
  const progressEl = $("#preloader-progress");
  const percentEl = $("#preloader-percent");
  let stepIndex = 0;
  let progress = 0;

  steps.forEach((s) => s.classList.remove("active"));
  if (steps[0]) steps[0].classList.add("active");
  if (progressEl) progressEl.style.width = "0%";
  if (percentEl) percentEl.textContent = "0%";

  if (preloaderInterval) clearInterval(preloaderInterval);

  preloaderInterval = setInterval(() => {
    progress += 2;
    if (progress > 100) progress = 100;
    if (progressEl) progressEl.style.width = progress + "%";
    if (percentEl) percentEl.textContent = Math.round(progress) + "%";

    const stepSize = steps.length ? 100 / steps.length : 100;
    const newIndex = Math.min(
      steps.length - 1,
      Math.floor(progress / stepSize)
    );

    if (newIndex !== stepIndex) {
      steps.forEach((s) => s.classList.remove("active"));
      if (steps[newIndex]) steps[newIndex].classList.add("active");
      stepIndex = newIndex;
    }
  }, 80);
}

function hidePreloader() {
  const el = $("#preloader");
  if (!el) return;
  setTimeout(() => {
    el.classList.add("hidden");
    if (preloaderInterval) clearInterval(preloaderInterval);
  }, 300);
}

/* ================================
   NAVBAR
=================================== */
function initNavbar() {
  const navToggle = $("#nav-toggle");
  const mobileMenu = $("#mobile-menu");
  if (navToggle && mobileMenu) {
    navToggle.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
    });

    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileMenu.classList.add("hidden");
      });
    });
  }

  const navbar = $("#navbar");
  window.addEventListener("scroll", () => {
    if (!navbar) return;
    if (window.scrollY > 20) {
      navbar.style.background = "rgba(15,23,42,0.92)";
      navbar.style.borderBottom = "1px solid rgba(30,64,175,0.8)";
      navbar.style.boxShadow = "0 10px 30px rgba(15,23,42,0.8)";
    } else {
      navbar.style.background =
        "linear-gradient(to bottom, rgba(15,23,42,0.9), transparent)";
      navbar.style.borderBottom = "none";
      navbar.style.boxShadow = "none";
    }
  });
}

/* ================================
   FAQ
=================================== */
function initFAQ() {
  document.querySelectorAll(".faq-item").forEach((item) => {
    const button = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");
    if (!button || !answer) return;

    button.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item").forEach((it) =>
        it.classList.remove("open")
      );
      if (!isOpen) item.classList.add("open");
    });
  });
}

/* ================================
   SCROLL ANIMATIONS
=================================== */
function initScrollAnimations() {
  const elements = document.querySelectorAll("[data-animate]");
  if (!("IntersectionObserver" in window)) {
    elements.forEach((el) => el.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  elements.forEach((el) => observer.observe(el));
}

/* ================================
   FIREBASE AUTH + DB
=================================== */
function initFirebase() {
  try {
    if (!firebase.apps.length) {
      firebaseApp = firebase.initializeApp(firebaseConfig);
    } else {
      firebaseApp = firebase.app();
    }
    auth = firebase.auth();
    db = firebase.database();

    auth.onAuthStateChanged((user) => {
      currentUser = user || null;
      handleAuthStateChange();
    });
  } catch (err) {
    console.error("Firebase init error", err);
    showToast("Unable to connect to account services right now.");
  }
}

function handleAuthStateChange() {
  updateAuthLinks();
  if (currentUser) {
    loadCommunityScamStats();
  } else {
    clearCommunityScamStats();
  }
}

function getUserInitial() {
  if (!currentUser) return "U";
  const name = currentUser.displayName || currentUser.email || "U";
  return name.charAt(0).toUpperCase();
}

function updateAuthLinks() {
  const loginBtn = $("#login-link");
  const mobileLoginBtn = $("#mobile-login-link");
  const profileMenu = $("#profile-menu");
  const profileButton = $("#profile-button");

  if (currentUser) {
    const letter = getUserInitial();
    if (profileButton) {
      profileButton.textContent = letter;
    }

    if (loginBtn) {
      loginBtn.classList.add("hidden");
    }
    if (profileMenu) {
      profileMenu.classList.remove("hidden");
    }

    if (mobileLoginBtn) {
      mobileLoginBtn.textContent = "Log out";
    }
  } else {
    if (profileMenu) {
      profileMenu.classList.add("hidden");
    }
    if (loginBtn) {
      loginBtn.textContent = "Log in";
      loginBtn.classList.remove("hidden");
    }
    if (mobileLoginBtn) {
      mobileLoginBtn.textContent = "Log in";
    }
  }
}

function initAuthLinks() {
  const loginBtn = $("#login-link");
  const mobileLoginBtn = $("#mobile-login-link");

  const handleAuthClick = () => {
    if (currentUser && auth) {
      auth
        .signOut()
        .then(() => {
          showToast("Signed out.");
        })
        .catch((err) => {
          console.error(err);
          showToast("Error signing out.");
        });
    } else {
      window.location.href = "login.html";
    }
  };

  if (loginBtn) loginBtn.addEventListener("click", handleAuthClick);
  if (mobileLoginBtn) mobileLoginBtn.addEventListener("click", handleAuthClick);
}

function initProfileMenu() {
  const profileButton = $("#profile-button");
  const dropdown = $("#profile-dropdown");
  const logoutBtn = $("#logout-button");

  if (!profileButton || !dropdown) return;

  profileButton.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("hidden");
  });

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      if (!auth) return;
      auth
        .signOut()
        .then(() => {
          showToast("Signed out.");
          dropdown.classList.add("hidden");
        })
        .catch((err) => {
          console.error(err);
          showToast("Error signing out.");
        });
    });
  }

  document.addEventListener("click", (e) => {
    if (dropdown.classList.contains("hidden")) return;
    const within =
      dropdown.contains(e.target) || profileButton.contains(e.target);
    if (!within) {
      dropdown.classList.add("hidden");
    }
  });
}

/* ================================
   COMMUNITY SCAM STATS (feature #7)
=================================== */

function clearCommunityScamStats() {
  const section = $("#saved-envs-section");
  const listEl = $("#saved-envs-list");
  if (listEl) listEl.innerHTML = "";
  if (section) section.classList.add("hidden");
}

function loadCommunityScamStats() {
  const section = $("#saved-envs-section");
  const listEl = $("#saved-envs-list");
  if (!db || !section || !listEl) return;

  db.ref("scam_reports")
    .orderByChild("count")
    .limitToLast(5)
    .on("value", (snapshot) => {
      const data = snapshot.val() || {};
      const entries = Object.entries(data)
        .map(([hash, val]) => ({ hash, ...(val || {}) }))
        .sort((a, b) => (b.count || 0) - (a.count || 0));

      if (!entries.length) {
        listEl.innerHTML =
          '<p class="section-subtitle">No scam reports yet. Be the first to flag a fake offer.</p>';
        section.classList.remove("hidden");
        return;
      }

      listEl.innerHTML = entries
        .map((item) => {
          const count = item.count || 0;
          const last = item.lastReportedAt
            ? new Date(item.lastReportedAt).toLocaleString()
            : "Not mentioned";
          return `
          <div class="glass-card" style="margin-bottom: 0.75rem;">
            <div class="analysis-meta">
              <div>
                <div class="analysis-label">Offer fingerprint</div>
                <div class="analysis-value" style="font-size:0.8rem; word-break:break-all;">
                  ${escapeHtml(item.hash || "").slice(0, 32)}…
                </div>
              </div>
              <div>
                <div class="analysis-label">Reports</div>
                <div class="analysis-value">${count} user${count === 1 ? "" : "s"} flagged this</div>
              </div>
              <div>
                <div class="analysis-label">Last reported</div>
                <div class="analysis-value">${escapeHtml(last)}</div>
              </div>
            </div>
          </div>`;
        })
        .join("");

      section.classList.remove("hidden");
    });
}

/* Hash helper for scam fingerprint (client-side) */
function hashString(str) {
  if (!str) return "";
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
}

/* ================================
   FILE → DATA URL
=================================== */
function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ================================
   LIGHT OFFER-LETTER VALIDATION
   (strict: only job / internship offers)
=================================== */
function looksLikeOfferLetter(text) {
  if (!text) return false;
  const clean = text.toLowerCase().replace(/\s+/g, " ");

  // Extremely short texts are almost never real offers
  if (clean.length < 120) return false;

  const strongOfferPhrases = [
    "offer letter",
    "job offer",
    "employment offer",
    "internship offer",
    "letter of appointment",
    "appointment letter",
    "offer of employment",
    "offer of internship",
    "we are pleased to offer you",
    "we are happy to offer you",
    "we are delighted to offer you",
    "we are pleased to make you an offer",
    "we are pleased to extend this offer",
  ];

  const offerHints = [
    "date of joining",
    "joining date",
    "your employment with",
    "your internship with",
    "position of",
    "role of",
    "in the role of",
    "annual ctc",
    "ctc of",
    "cost to company",
    "remuneration",
    "probation period",
    "reporting to",
    "reporting manager",
    "salary of",
    "monthly stipend",
    "stipend",
  ];

  const resumeSignals = [
    "curriculum vitae",
    "resume",
    "profile summary",
    "career objective",
    "objective",
    "skills",
    "technical skills",
    "projects",
    "academic projects",
    "education",
    "work experience",
    "professional experience",
    "experience summary",
    "cgpa",
    "gpa",
    "certifications",
    "languages known",
    "hobbies",
    "linkedin.com",
    "github.com",
  ];

  const hasStrongOffer = strongOfferPhrases.some((k) => clean.includes(k));
  const hasOfferHints = offerHints.some((k) => clean.includes(k));
  const resumeSignalCount = resumeSignals.filter((k) =>
    clean.includes(k)
  ).length;

  // If it clearly looks like a resume (many resume signals, no strong offer words) → reject
  if (!hasStrongOffer && resumeSignalCount >= 3) {
    return false;
  }

  // If there is a strong explicit offer phrase → accept
  if (hasStrongOffer) return true;

  // Otherwise, require both greeting and offer hints
  const hasGreeting = clean.includes("dear ") || clean.includes("to,");
  if (hasGreeting && hasOfferHints) return true;

  return false;
}

/* ================================
   OPENAI TEXT-ONLY FALLBACK
=================================== */

/**
 * Fallback: direct text-only risk check with OpenAI
 * Used when backend /verify fails.
 */
async function openaiClientSideRiskAnalysis(rawText) {
  if (!OPENAI_API_KEY) return null;

  try {
    const prompt = `
You are OfferShield, an AI that checks job and internship offer letters for scam risk.

If the text clearly looks like a CV/resume, college project, or any document that is NOT a job/internship offer letter, respond with JSON:

{
  "final_score": 50,
  "label": "Needs Verification",
  "summary": "This does not look like a job or internship offer letter. Please upload the actual offer document.",
  "reasons": [
    "The text looks more like a resume/profile or some other document, not a formal offer letter."
  ]
}

Otherwise, analyze the offer letter and respond ONLY with JSON:

{
  "final_score": 0-100,
  "label": "Likely Genuine" | "Needs Verification" | "High Scam Risk",
  "summary": "short explanation",
  "reasons": ["reason 1", "reason 2", "..."]
}

Offer letter text:
------
${rawText}
------`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 600,
        temperature: 0.1,
      }),
    });

    if (!res.ok) {
      console.error("OpenAI text risk error", res.status);
      return null;
    }
    const json = await res.json();
    const raw = json.choices?.[0]?.message?.content || "";
    const trimmed = String(raw).trim();

    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start === -1 || end === -1) return null;
    const jsonString = trimmed.slice(start, end + 1);
    return JSON.parse(jsonString);
  } catch (err) {
    console.error("OpenAI client-side risk error", err);
    return null;
  }
}

/* ================================
   FILE TEXT EXTRACTION PIPELINE
   (PDF.js + Tesseract.js – NO OpenAI vision)
=================================== */

async function extractTextFromFile(file) {
  if (!file) return "";
  const type = (file.type || "").toLowerCase();

  // PDF → PDF.js
  if (type === "application/pdf") {
    return await extractTextFromPDF(file);
  }

  // Images → Tesseract OCR
  if (type.startsWith("image/")) {
    return await extractTextFromImage(file);
  }

  throw new Error(
    "Unsupported file format. Upload a PDF or image of a job or internship offer."
  );
}

// PDF extraction
async function extractTextFromPDF(file) {
  try {
    if (typeof pdfjsLib === "undefined") {
      console.error("pdfjsLib not loaded.");
      return "";
    }

    // Optionally configure worker if needed:
    // pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

    const dataUrl = await fileToDataURL(file);
    const pdf = await pdfjsLib.getDocument({ url: dataUrl }).promise;

    let finalText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map((item) => item.str);
      finalText += strings.join(" ") + "\n";
    }
    return finalText;
  } catch (e) {
    console.error("pdf.js error", e);
    return "";
  }
}

// Image extraction
async function extractTextFromImage(file) {
  try {
    if (typeof Tesseract === "undefined") {
      console.error("Tesseract not loaded.");
      return "";
    }
    const {
      data: { text },
    } = await Tesseract.recognize(file, "eng");
    return text || "";
  } catch (e) {
    console.error("Tesseract error", e);
    return "";
  }
}

/* ================================
   BACKEND INTEGRATION: ANALYZE OFFER
=================================== */

async function analyzeOffer({ text, file }) {
  showPreloader();
  latestAnalysis = null;
  latestTextHash = null;

  try {
    let rawText = (text || "").trim();

    // Step 1: If file is present, extract text via PDF.js / Tesseract
    if (file) {
      const extracted = await extractTextFromFile(file);
      if (!extracted.trim()) {
        throw new Error(
          "We couldn’t read any text from this file. Please try a clearer scan or paste the offer text."
        );
      }

      if (rawText) {
        rawText = `${rawText.trim()}\n\n---\n(Extracted from file)\n${extracted.trim()}`;
      } else {
        rawText = extracted.trim();
      }
    }

    // Step 2: If still nothing, error
    if (!rawText) {
      hidePreloader();
      showToast("Paste the offer text or upload a valid offer PDF/image first.");
      return;
    }

    // Step 3: sanity-check that this is really an offer letter (not resume/photo/etc.)
    if (!looksLikeOfferLetter(rawText)) {
      hidePreloader();
      showToast(
        "This doesn’t look like a job or internship offer letter. Please upload the actual offer (with company, role, salary, joining date)."
      );
      return;
    }

    // Step 4: call backend /verify with raw_text (no file – pure text)
    let backendPayload = null;
    try {
      const res = await fetch(API_ANALYZE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raw_text: rawText,
        }),
      });

      if (res.ok) {
        backendPayload = await res.json();
      } else {
        console.error("Backend error:", res.status);
      }
    } catch (e) {
      console.error("Backend /verify failed:", e);
    }

    hidePreloader();

    const normalizedText = rawText.trim();
    const clientHash = hashString(normalizedText.toLowerCase());

    if (backendPayload && backendPayload.analysis) {
      // Full 15-feature backend path
      latestAnalysis = {
        mode: "backend",
        backend: backendPayload,
        raw_text: normalizedText,
      };
      latestTextHash = backendPayload.offer_hash || clientHash;

      renderBackendAnalysis(backendPayload, normalizedText);

      // Check community reports (Firebase)
      if (latestTextHash && db) {
        checkPastReports(latestTextHash);
      }

      showToast("Offer analyzed with full 15-layer checks.");
    } else {
      // Fallback: client-side OpenAI risk analysis only
      const fallback = await openaiClientSideRiskAnalysis(normalizedText);
      if (!fallback) {
        showToast(
          "Backend and AI fallback both failed. Try again later or paste the text more clearly."
        );
        return;
      }

      latestAnalysis = {
        mode: "client-only",
        client: fallback,
        raw_text: normalizedText,
      };
      latestTextHash = clientHash;

      renderClientOnlyAnalysis(fallback, normalizedText);

      if (latestTextHash && db) {
        checkPastReports(latestTextHash);
      }

      showToast(
        "Offer analyzed with AI fallback (without full backend checks)."
      );
    }
  } catch (err) {
    console.error(err);
    hidePreloader();
    const msg =
      err && err.message
        ? err.message
        : "Failed to analyze offer. Try a clearer file or paste the full text.";
    showToast(msg);
  }
}

/* ================================
   COMMUNITY REPORT LOOKUP
=================================== */

function checkPastReports(hash) {
  const labelEl = $("#community-reports-label");
  if (!db || !hash || !labelEl) return;

  db.ref("scam_reports/" + hash + "/count")
    .once("value")
    .then((snap) => {
      const count = snap.val() || 0;
      if (count <= 0) {
        labelEl.textContent =
          "No one has reported this exact offer as a scam yet.";
      } else {
        labelEl.textContent = `${count} user${
          count === 1 ? "" : "s"
        } reported an identical offer as a scam.`;
      }
    })
    .catch((err) => {
      console.error("checkPastReports error", err);
    });
}

/* Report this offer as scam (feature #7) – client-side Firebase */
function reportCurrentScanAsScam() {
  if (!latestAnalysis) {
    showToast("Run a scan first before reporting.");
    return;
  }
  if (!db) {
    showToast("Reporting is offline right now.");
    return;
  }

  const rawText =
    latestAnalysis.raw_text ||
    latestAnalysis.plain_text ||
    latestAnalysis.offer_text ||
    latestAnalysis.normalized_text ||
    "";
  if (!rawText) {
    showToast("No offer content available to fingerprint.");
    return;
  }

  const hash =
    latestTextHash || hashString(rawText.toLowerCase().trim() || "");
  if (!hash) {
    showToast("Could not generate fingerprint for this offer.");
    return;
  }

  const now = Date.now();
  const scanId =
    (latestAnalysis.backend && latestAnalysis.backend.offer_hash) ||
    latestAnalysis.scan_id ||
    hash;

  db.ref("scam_reports/" + hash)
    .transaction((current) => {
      if (current) {
        return {
          ...current,
          count: (current.count || 0) + 1,
          lastReportedAt: now,
          lastScanId: scanId,
        };
      }
      return {
        count: 1,
        firstReportedAt: now,
        lastReportedAt: now,
        lastScanId: scanId,
      };
    })
    .then(() => {
      if (currentUser) {
        const uid = currentUser.uid;
        db.ref("user_reports/" + uid + "/" + scanId).set({
          hash,
          reportedAt: now,
        });
      }
      showToast("Thanks. This offer is now recorded as a scam pattern.");
      if (hash) checkPastReports(hash);
    })
    .catch((err) => {
      console.error("reportCurrentScanAsScam error", err);
      showToast("Failed to report scam. Try again later.");
    });
}

/* ================================
   RENDER – BACKEND (FULL 15 FEATURES)
=================================== */

function renderBackendAnalysis(payload, rawText) {
  const section = $("#analysis");
  const container = $("#analysis-content");
  if (!section || !container) return;

  const analysis = payload.analysis || {};
  const final = analysis.final_trust || {};
  const scamStats = payload.scam_reports || {};

  const finalScore =
    typeof final.score === "number" ? Math.round(final.score) : null;
  const verdict = final.verdict || "Review carefully";
  const verdictColor = final.verdict_color || "yellow";

  const companyAuth = analysis.company_authenticity || {};
  const docIntegrity = analysis.document_integrity || {};
  const langRisk = analysis.language_risk || {};
  const salary = analysis.salary_plausibility || {};
  const compExist = analysis.company_existence || {};
  const linkRisk = analysis.link_risk || {};
  const interview = analysis.interview_plausibility || {};
  const structure = analysis.offer_structure || {};
  const roleCons = analysis.role_consistency || {};

  // These are shown as "Not mentioned" so the blame is on the letter, not the app
  const company = payload.company_name || "Not mentioned in this offer";
  const role = payload.job_role || "Not mentioned in this offer";
  const email = payload.hr_email || "Not mentioned in this offer";
  const domain = companyAuth.domain || "Not mentioned in this offer";

  const summary =
    docIntegrity.summary ||
    "OfferShield combined document quality, company checks, language risk, salary realism, interview flow and more into this trust score.";

  const pastBackendReports = scamStats.reports_count || 0;

  const riskLevel =
    verdictColor === "green"
      ? "high"
      : verdictColor === "red"
      ? "low"
      : "medium";

  const reasons = final.reasons || [];

  container.innerHTML = `
    <div class="analysis-meta">
      <div class="score-header">
        <div class="score-circle ${scoreCircleClass(riskLevel)}">
          ${finalScore != null ? escapeHtml(String(finalScore)) : "?"}
        </div>
        <div>
          <div class="analysis-label">Final verdict</div>
          <div class="analysis-value">
            <span class="score-pill ${scorePillClass(riskLevel)}">
              <span class="score-pill-dot"></span>
              <span>${escapeHtml(verdict)}</span>
            </span>
          </div>
        </div>
      </div>

      <div>
        <div class="analysis-label">Summary</div>
        <div class="analysis-value">
          ${escapeHtml(summary)}
        </div>
      </div>

      <div>
        <div class="analysis-label">Offer details (as written in your letter)</div>
        <div class="analysis-value">
          <div><strong>Company:</strong> ${escapeHtml(company)}</div>
          <div><strong>Role:</strong> ${escapeHtml(role)}</div>
          <div><strong>From email:</strong> ${escapeHtml(email)}</div>
          <div><strong>Domain:</strong> ${escapeHtml(domain)}</div>
        </div>
      </div>

      <div>
        <div class="analysis-label">Community scam reports</div>
        <div class="analysis-value community-reports" id="community-reports-label">
          ${
            pastBackendReports > 0
              ? `${pastBackendReports} user${
                  pastBackendReports === 1 ? "" : "s"
                } reported this offer pattern as a scam (backend store).`
              : "No one has reported this offer pattern as a scam on the backend yet."
          }
        </div>
      </div>

      <div class="analysis-actions">
        <button id="report-scam-btn" class="btn btn-outline">
          🚩 Report as scam
        </button>
        <button id="copy-summary-btn" class="btn btn-ghost">
          Copy AI explanation
        </button>
      </div>
    </div>

    <div>
      <div class="analysis-extra-grid">
        <div class="analysis-column">
          <h3 class="analysis-subtitle">Company & document</h3>
          ${renderSimpleSectionCard(
            "Company authenticity",
            companyAuth.score,
            companyAuth.flags || []
          )}
          ${renderSimpleSectionCard(
            "Document integrity",
            docIntegrity.score,
            docIntegrity.summary ? docIntegrity.summary.split("\n") : []
          )}
          ${renderSimpleSectionCard(
            "Company existence",
            compExist.score,
            compExist.flags || []
          )}
        </div>

        <div class="analysis-column">
          <h3 class="analysis-subtitle">Language, money & flow</h3>
          ${renderSimpleSectionCard(
            "Language risk",
            langRisk.score,
            [
              langRisk.risk_phrases && langRisk.risk_phrases.length
                ? "High-risk language patterns: " +
                  langRisk.risk_phrases.join(", ")
                : null,
              langRisk.whatsapp_telegram_mentions &&
              langRisk.whatsapp_telegram_mentions.length
                ? "Mentions of WhatsApp/Telegram/Signal for hiring."
                : null,
            ].filter(Boolean)
          )}
          ${renderSimpleSectionCard(
            "Compensation realism",
            salary.score,
            salary.flags || []
          )}
          ${renderSimpleSectionCard(
            "Interview plausibility",
            interview.score,
            interview.flags || []
          )}
        </div>

        <div class="analysis-column">
          <h3 class="analysis-subtitle">Links, structure & role</h3>
          ${renderSimpleSectionCard(
            "Link safety",
            linkRisk.score,
            [
              linkRisk.suspicious_links && linkRisk.suspicious_links.length
                ? "Suspicious links: " +
                  linkRisk.suspicious_links.join(", ")
                : null,
              linkRisk.short_links && linkRisk.short_links.length
                ? "Shortened links: " + linkRisk.short_links.join(", ")
                : null,
            ].filter(Boolean)
          )}
          ${renderSimpleSectionCard(
            "Offer structure",
            structure.score,
            [
              structure.missing_sections &&
              structure.missing_sections.length
                ? "Missing sections: " +
                  structure.missing_sections.join(", ")
                : "Most key sections appear present.",
            ]
          )}
          ${renderSimpleSectionCard(
            "Role & process consistency",
            roleCons.score,
            roleCons.summary ? roleCons.summary.split("\n") : []
          )}
        </div>
      </div>

      <div style="margin-top:1.2rem;">
        <div class="analysis-label">Why OfferShield thinks this</div>
        <pre class="analysis-guide" id="offer-explanation">
${escapeHtml(
  reasons && reasons.length
    ? "Top reasons:\n- " + reasons.join("\n- ")
    : "Backend did not return explicit reasons. Add more flags to final_trust.reasons to make this richer."
)}
        </pre>
      </div>

      <div style="margin-top:0.8rem;">
       
        
      </div>
    </div>
  `;

  section.classList.remove("hidden");

  const copyBtn = $("#copy-summary-btn");
  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      const explanation = $("#offer-explanation");
      const content = explanation ? explanation.textContent || "" : summary;
      navigator.clipboard
        .writeText(content.trim())
        .then(() => showToast("Explanation copied to clipboard."))
        .catch(() => showToast("Unable to copy explanation."));
    });
  }

  const reportBtn = $("#report-scam-btn");
  if (reportBtn) {
    reportBtn.addEventListener("click", reportCurrentScanAsScam);
  }

  section.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ================================
   RENDER – CLIENT-ONLY FALLBACK
=================================== */

function renderClientOnlyAnalysis(result, rawText) {
  const section = $("#analysis");
  const container = $("#analysis-content");
  if (!section || !container) return;

  const score =
    typeof result.final_score === "number"
      ? Math.round(result.final_score)
      : null;
  const label = result.label || "Review carefully";
  const summary =
    result.summary ||
    "Client-side AI fallback: this is a heuristic opinion and not the full 15-layer backend check.";
  const reasons = result.reasons || [];
  const riskLevel =
    score == null
      ? "unknown"
      : score >= 80
      ? "high"
      : score >= 60
      ? "medium"
      : "low";

  container.innerHTML = `
    <div class="analysis-meta">
      <div class="score-header">
        <div class="score-circle ${scoreCircleClass(riskLevel)}">
          ${score != null ? escapeHtml(String(score)) : "?"}
        </div>
        <div>
          <div class="analysis-label">Final verdict (fallback mode)</div>
          <div class="analysis-value">
            <span class="score-pill ${scorePillClass(riskLevel)}">
              <span class="score-pill-dot"></span>
              <span>${escapeHtml(label)}</span>
            </span>
          </div>
        </div>
      </div>

      <div>
        <div class="analysis-label">Summary</div>
        <div class="analysis-value">
          ${escapeHtml(summary)}
        </div>
      </div>

      <div>
        <div class="analysis-label">Community scam reports</div>
        <div class="analysis-value community-reports" id="community-reports-label">
          No previous scam reports loaded yet.
        </div>
      </div>

      <div class="analysis-actions">
        <button id="report-scam-btn" class="btn btn-outline">
          🚩 Report as scam
        </button>
        <button id="copy-summary-btn" class="btn btn-ghost">
          Copy AI explanation
        </button>
      </div>
    </div>

    <div>
      <div style="margin-top:1.2rem;">
        <div class="analysis-label">Why OfferShield thinks this</div>
        <pre class="analysis-guide" id="offer-explanation">
${escapeHtml(
  reasons && reasons.length
    ? "Top reasons:\n- " + reasons.join("\n- ")
    : "No detailed reasons returned from AI fallback."
)}
        </pre>
      </div>

      <div style="margin-top:0.8rem;">
        <div class="analysis-label">Extracted offer text (sanitized)</div>
        <pre class="analysis-guide" id="offer-plain-text">
${escapeHtml(rawText || "")}
        </pre>
      </div>
    </div>
  `;

  section.classList.remove("hidden");

  const copyBtn = $("#copy-summary-btn");
  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      const explanation = $("#offer-explanation");
      const content = explanation ? explanation.textContent || "" : summary;
      navigator.clipboard
        .writeText(content.trim())
        .then(() => showToast("Explanation copied to clipboard."))
        .catch(() => showToast("Unable to copy explanation."));
    });
  }

  const reportBtn = $("#report-scam-btn");
  if (reportBtn) {
    reportBtn.addEventListener("click", reportCurrentScanAsScam);
  }

  section.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ================================
   RENDER UTILITIES
=================================== */

function inferRiskLevel(score) {
  if (score == null) return "unknown";
  if (score >= 80) return "high";
  if (score >= 60) return "medium";
  return "low";
}

function scoreCircleClass(level) {
  if (level === "high") return "score-circle--high";
  if (level === "medium") return "score-circle--medium";
  if (level === "low") return "score-circle--low";
  return "";
}

function scorePillClass(level) {
  if (level === "high") return "score-pill--high";
  if (level === "medium") return "score-pill--medium";
  if (level === "low") return "score-pill--low";
  return "";
}

function renderSimpleSectionCard(title, score, bullets) {
  const level = score != null ? inferRiskLevel(score) : "unknown";
  const safeBullets = (bullets || []).filter(
    (b) => b && String(b).trim().length > 0
  );

  return `
    <div class="glass-card" style="padding:0.7rem 0.8rem;">
      <div class="analysis-label">${escapeHtml(title)}</div>
      <div class="analysis-value" style="margin-top:0.25rem;">
        ${
          score != null
            ? `<span class="badge-soft">Score: ${escapeHtml(
                String(score)
              )}/100</span>`
            : `<span class="badge-soft">Score: N/A</span>`
        }
      </div>
      ${
        safeBullets.length
          ? `<ul class="risk-list">
               ${safeBullets
                 .slice(0, 5)
                 .map(
                   (b) =>
                     `<li><span class="risk-dot">•</span><span>${escapeHtml(
                       String(b)
                     )}</span></li>`
                 )
                 .join("")}
             </ul>`
          : `<p style="font-size:0.82rem; color:var(--muted); margin-top:0.3rem;">
               No detailed bullets provided for this check.
             </p>`
      }
    </div>
  `;
}

/* Escape HTML helper */
function escapeHtml(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ================================
   HERO INPUT
=================================== */
function initHero() {
  const textArea = $("#offer-text");
  const fileInput = $("#file-input");
  const analyzeBtn = $("#analyze-button");
  const dropzone = $("#upload-dropzone");
  const filenameEl = $("#upload-filename");

  if (!analyzeBtn) return;

  const updateFilename = () => {
    if (!fileInput || !filenameEl) return;
    const file = fileInput.files && fileInput.files[0];
    filenameEl.textContent = file ? file.name : "No file selected";
  };

  // ❌ REMOVE dropzone click → fileInput.click()
  // The label already handles clicking.

  if (dropzone && fileInput) {
    // REMOVE click handler completely
    // dropzone.addEventListener("click", () => fileInput.click());

    dropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropzone.classList.add("dragover");
    });

    dropzone.addEventListener("dragleave", (e) => {
      e.preventDefault();
      dropzone.classList.remove("dragover");
    });

    dropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropzone.classList.remove("dragover");
      if (e.dataTransfer?.files?.[0]) {
        fileInput.files = e.dataTransfer.files;
        updateFilename();
      }
    });

    fileInput.addEventListener("change", updateFilename);
  }

  const triggerAnalyze = () => {
    const text = textArea?.value.trim() || "";
    const file = fileInput?.files?.[0];

    if (!text && !file) {
      showToast("Upload a PDF/image or paste the offer text first.");
      textArea?.focus();
      return;
    }

    if (!currentUser) {
      showToast("You are not logged in — analysis still works, but scam reports won’t be tied to an account.");
    }

    analyzeOffer({ text, file });
  };

  analyzeBtn.addEventListener("click", triggerAnalyze);

  textArea?.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      triggerAnalyze();
    }
  });
}


/* ================================
   INIT
=================================== */
document.addEventListener("DOMContentLoaded", () => {
  initNavbar();
  initFAQ();
  initScrollAnimations();
  initHero();
  initAuthLinks();
  initProfileMenu();
  initFirebase();
});
