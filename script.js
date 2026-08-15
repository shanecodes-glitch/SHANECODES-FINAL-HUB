// ─────────────────────────────────────────────
//  SHANECODES TECH HUB - FINAL SCRIPT
// ─────────────────────────────────────────────

const REPO_OWNER = "shanecodes-glitch";
const REPO_NAME = "SHANECODES-FINAL-HUB";
const RAW_URL = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main`;

// ── 1. FETCH AND DISPLAY VERSION ──
async function loadVersion() {
    try {
        const res = await fetch(`${RAW_URL}/version.json`);
        const data = await res.json();
        const version = data.version || "1.0.0";

        document.getElementById("versionDisplay").textContent = version;
        document.getElementById("footerVersion").textContent = version;
    } catch (e) {
        document.getElementById("versionDisplay").textContent = "⚠️";
        console.warn("Version load failed:", e);
    }
}

// ── 2. FETCH AND DISPLAY CHANGELOG ──
async function loadChangelog() {
    const container = document.getElementById("changelogContent");
    try {
        const res = await fetch(`${RAW_URL}/CHANGELOG.md`);
        const text = await res.text();

        // Simple Markdown → HTML (just enough for our format)
        let html = text
            .replace(/^# (.*)$/gm, '<h3>$1</h3>')
            .replace(/^## (.*)$/gm, '<h4>$1</h4>')
            .replace(/^- (.*)$/gm, '<li>$1</li>')
            .replace(/\n\n/g, '</ul><ul>')
            .replace(/<li>/g, '<ul><li>')
            .replace(/<\/ul><ul>/g, '</ul><ul>');

        // Wrap in proper HTML
        container.innerHTML = `<ul>${html.replace(/<\/ul><ul>/g, '</ul><ul>')}</ul>`;
    } catch (e) {
        container.innerHTML = "<p>Changelog temporarily unavailable.</p>";
        console.warn("Changelog load failed:", e);
    }
}

// ── 3. COPY COMMAND ──
function copyCommand() {
    const codeEl = document.querySelector("#launchCommand");
    const text = codeEl.textContent;

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showCopyFeedback("✅ Copied!");
        }).catch(() => fallbackCopy(text));
    } else {
        fallbackCopy(text);
    }
}

function fallbackCopy(text) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand("copy");
        showCopyFeedback("✅ Copied!");
    } catch (e) {
        showCopyFeedback("❌ Failed to copy");
    }
    document.body.removeChild(textarea);
}

function showCopyFeedback(msg) {
    const btn = document.querySelector(".copy-btn");
    const original = btn.textContent;
    btn.textContent = msg;
    setTimeout(() => { btn.textContent = original; }, 2000);
}

// ── 4. INIT ──
loadVersion();
loadChangelog();