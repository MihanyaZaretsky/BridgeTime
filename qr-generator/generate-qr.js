import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import QRCode from "qrcode";
import { CARDS_DATA } from "./cards-data.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUT_DIR = path.join(__dirname, "qrcodes");
const QR_SIZE = 300;

const QR_PAYLOAD_MODE = (process.env.QR_PAYLOAD_MODE ?? "bridgetime_number").toLowerCase();

function pad3(n) {
  return String(n).padStart(3, "0");
}

function typeLabel(type) {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function questionIdFromCardId(cardId) {
  const m = String(cardId).match(/(\d+)$/);
  if (!m?.[1]) return null;
  const n = parseInt(m[1], 10);
  if (!Number.isFinite(n)) return null;
  return String(n);
}

function makeQrPayload(card) {
  if (QR_PAYLOAD_MODE === "bridgetime_url") {
    const qid = questionIdFromCardId(card.id);
    return qid ? `bridgetime://question?questionId=${qid}` : card.id;
  }

  if (QR_PAYLOAD_MODE === "web_url") {
    const qid = questionIdFromCardId(card.id);
    const base = (process.env.WEB_BASE_URL ?? "https://mihanyazaretsky-bridgetime-dc55.twc1.net").replace(/\/$/, "");
    return qid ? `${base}/question?questionId=${qid}` : card.id;
  }

  if (QR_PAYLOAD_MODE === "bridgetime_number") {
    const qid = questionIdFromCardId(card.id);
    return qid ?? card.id;
  }

  if (QR_PAYLOAD_MODE === "id_only") {
    return { id: card.id };
  }

  // Default: compact JSON payload for offline flashcard apps
  return {
    id: card.id,
    t: card.type,
    r: card.contentRef,
    q: card.question,
    o: card.options,
    c: card.correctAnswer
  };
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function generatePngQrs() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  for (const card of CARDS_DATA) {
    const payload = makeQrPayload(card);
    const filePath = path.join(OUT_DIR, `${card.id}.png`);

    const qrText = typeof payload === "string" ? payload : JSON.stringify(payload);

    await QRCode.toFile(filePath, qrText, {
      errorCorrectionLevel: "M",
      width: QR_SIZE,
      margin: 4,
      color: {
        dark: "#000000",
        light: "#FFFFFF"
      }
    });
  }
}

function buildPrintSheetHtml() {
  const items = CARDS_DATA.map((card, idx) => {
    const n = pad3(idx + 1);
    const label = `Card #${n} - ${typeLabel(card.type)}`;
    const title = card.title;

    return `
      <div class="cell">
        <div class="qr-wrap">
          <img class="qr" src="./qrcodes/${card.id}.png" alt="${escapeHtml(card.id)}" />
        </div>
        <div class="label">${escapeHtml(label)}</div>
        <div class="title">${escapeHtml(title)}</div>
      </div>
    `;
  }).join("\n");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>QR Print Sheet (25)</title>
  <style>
    @page {
      size: A4;
      margin: 10mm;
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
      color: #111;
    }

    .sheet {
      width: 100%;
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 6mm;
      padding: 10mm;
    }

    .cell {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      padding: 3mm;
      border: 1px solid #bdbdbd;
    }

    .cell::before,
    .cell::after {
      content: "";
      position: absolute;
      inset: -2mm;
      pointer-events: none;
      background:
        linear-gradient(#000, #000) left top / 8mm 0.3mm no-repeat,
        linear-gradient(#000, #000) left top / 0.3mm 8mm no-repeat,
        linear-gradient(#000, #000) right top / 8mm 0.3mm no-repeat,
        linear-gradient(#000, #000) right top / 0.3mm 8mm no-repeat,
        linear-gradient(#000, #000) left bottom / 8mm 0.3mm no-repeat,
        linear-gradient(#000, #000) left bottom / 0.3mm 8mm no-repeat,
        linear-gradient(#000, #000) right bottom / 8mm 0.3mm no-repeat,
        linear-gradient(#000, #000) right bottom / 0.3mm 8mm no-repeat;
      opacity: 0.35;
    }

    .qr-wrap {
      padding: 3mm;
      background: #fff;
    }

    .qr {
      width: 35mm;
      height: 35mm;
      image-rendering: pixelated;
      display: block;
    }

    .label {
      margin-top: 2mm;
      font-size: 10px;
      font-weight: 700;
      text-align: center;
      white-space: nowrap;
    }

    .title {
      margin-top: 1mm;
      font-size: 9px;
      text-align: center;
      line-height: 1.2;
      min-height: 20px;
    }

    @media screen {
      body { background: #f3f3f3; }
      .sheet { max-width: 900px; margin: 0 auto; background: #fff; }
    }
  </style>
</head>
<body>
  <div class="sheet">
    ${items}
  </div>
</body>
</html>`;
}

function buildPreviewHtml() {
  const cardsJson = JSON.stringify(CARDS_DATA);

  const grid = CARDS_DATA.map((card, idx) => {
    const n = pad3(idx + 1);
    const label = `#${n} ${typeLabel(card.type)}`;
    return `
      <button class="card" data-id="${escapeHtml(card.id)}" type="button">
        <img class="qr" src="./qrcodes/${card.id}.png" alt="${escapeHtml(card.id)}" />
        <div class="meta">
          <div class="label">${escapeHtml(label)}</div>
          <div class="title">${escapeHtml(card.title)}</div>
        </div>
      </button>
    `;
  }).join("\n");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>QR Preview (Offline)</title>
  <style>
    * { box-sizing: border-box; }

    body {
      margin: 0;
      font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
      color: #111;
      background: #0b1220;
    }

    .wrap {
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      gap: 16px;
      padding: 16px;
      min-height: 100vh;
    }

    .panel {
      background: #121a2b;
      border: 1px solid rgba(255,255,255,0.10);
      border-radius: 12px;
      padding: 14px;
    }

    .topbar {
      display: flex;
      gap: 10px;
      align-items: center;
      margin-bottom: 12px;
    }

    input {
      width: 100%;
      padding: 10px 12px;
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.14);
      background: rgba(0,0,0,0.25);
      color: #fff;
      outline: none;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 10px;
    }

    .card {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 10px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.10);
      border-radius: 12px;
      cursor: pointer;
      text-align: left;
      color: inherit;
    }

    .card:focus {
      outline: 2px solid rgba(64, 140, 255, 0.8);
      outline-offset: 2px;
    }

    .qr {
      width: 100%;
      aspect-ratio: 1 / 1;
      background: #fff;
      border-radius: 10px;
      padding: 8px;
      object-fit: contain;
    }

    .label {
      color: rgba(255,255,255,0.75);
      font-size: 12px;
      font-weight: 700;
    }

    .title {
      color: rgba(255,255,255,0.95);
      font-size: 12px;
      line-height: 1.2;
      min-height: 28px;
    }

    pre {
      margin: 0;
      padding: 12px;
      border-radius: 12px;
      background: rgba(0,0,0,0.35);
      border: 1px solid rgba(255,255,255,0.10);
      color: #eaf2ff;
      overflow: auto;
      max-height: calc(100vh - 120px);
      font-size: 12px;
    }

    .details h2 {
      margin: 0 0 10px 0;
      font-size: 14px;
      color: #fff;
    }

    .hint {
      margin: 0 0 10px 0;
      color: rgba(255,255,255,0.75);
      font-size: 12px;
      line-height: 1.4;
    }

    @media (max-width: 1100px) {
      .wrap { grid-template-columns: 1fr; }
      .grid { grid-template-columns: repeat(3, 1fr); }
      pre { max-height: 45vh; }
    }

    @media (max-width: 650px) {
      .grid { grid-template-columns: repeat(2, 1fr); }
    }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="panel">
      <div class="topbar">
        <input id="search" placeholder="Search by id/title/type/subject (e.g. card_007, react, math)" />
      </div>
      <div id="grid" class="grid">
        ${grid}
      </div>
    </div>

    <div class="panel details">
      <h2 id="detailsTitle">Select a card</h2>
      <p class="hint">This preview works offline. Click a card to see both the full card object and the compact QR payload that is encoded in the QR image.</p>
      <pre id="details"></pre>
    </div>
  </div>

  <script>
    const CARDS = ${cardsJson};

    function typeLabel(type) {
      return type.charAt(0).toUpperCase() + type.slice(1);
    }

    function makeQrPayload(card) {
      return {
        id: card.id,
        t: card.type,
        r: card.contentRef,
        q: card.question,
        o: card.options,
        c: card.correctAnswer
      };
    }

    const detailsEl = document.getElementById("details");
    const detailsTitleEl = document.getElementById("detailsTitle");

    function show(id) {
      const card = CARDS.find(c => c.id === id);
      if (!card) return;

      const idx = CARDS.findIndex(c => c.id === id);
      const n = String(idx + 1).padStart(3, "0");

      const payload = makeQrPayload(card);
      detailsTitleEl.textContent = "Card #" + n + " - " + typeLabel(card.type) + " - " + card.title;
      detailsEl.textContent = JSON.stringify({ card, qrPayload: payload }, null, 2);
    }

    document.getElementById("grid").addEventListener("click", (e) => {
      const btn = e.target.closest(".card");
      if (!btn) return;
      show(btn.dataset.id);
    });

    const searchEl = document.getElementById("search");
    searchEl.addEventListener("input", () => {
      const q = searchEl.value.trim().toLowerCase();
      document.querySelectorAll(".card").forEach((el) => {
        const id = el.dataset.id;
        const card = CARDS.find(c => c.id === id);
        const hay = (card.id + " " + card.title + " " + card.type + " " + card.subject).toLowerCase();
        el.style.display = hay.includes(q) ? "flex" : "none";
      });
    });

    show("card_001");
  </script>
</body>
</html>`;
}

async function writeHtmlFiles() {
  const printHtml = buildPrintSheetHtml();
  const previewHtml = buildPreviewHtml();

  await fs.writeFile(path.join(__dirname, "print-sheet.html"), printHtml, "utf8");
  await fs.writeFile(path.join(__dirname, "preview.html"), previewHtml, "utf8");
}

async function main() {
  await generatePngQrs();
  await writeHtmlFiles();
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
