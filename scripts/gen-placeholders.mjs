/**
 * プレースホルダー立ち絵SVG生成スクリプト。
 * 外注イラスト(PNG)が届いたら public/characters/<id>/<emotion>.png を置くだけで差し替わる。
 * 実行: node scripts/gen-placeholders.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const OUT = path.join(process.cwd(), "public", "characters");
const EMOTIONS = ["normal", "annoyed", "angry", "smug", "furious", "defeated"];

const CHARACTERS = {
  kessaisha: {
    skin: "#e8b98a",
    hair: "#9ca3af",
    hairStyle: "slickback",
    suit: "#1e3a8a",
    shirt: "#f8fafc",
    tie: "#b45309",
    glasses: false,
    mustache: true,
    crossedArms: true,
  },
  client: {
    skin: "#f0c495",
    hair: "#7c4a21",
    hairStyle: "messy",
    suit: "#c2410c",
    shirt: "#fffbeb",
    tie: null,
    glasses: false,
    mustache: false,
    crossedArms: false,
  },
  keiri: {
    skin: "#f5d0a9",
    hair: "#27272a",
    hairStyle: "bob",
    suit: "#0f766e",
    shirt: "#f0fdfa",
    tie: null,
    glasses: true,
    mustache: false,
    crossedArms: false,
  },
};

// 顔の中心 (512, 360)、頭半径 ~210
const CX = 512;
const FACE_Y = 380;

function hairSvg(c) {
  switch (c.hairStyle) {
    case "slickback":
      return `
        <path d="M ${CX - 215} ${FACE_Y - 40} Q ${CX - 210} ${FACE_Y - 230} ${CX} ${FACE_Y - 235} Q ${CX + 210} ${FACE_Y - 230} ${CX + 215} ${FACE_Y - 40} Q ${CX + 160} ${FACE_Y - 150} ${CX} ${FACE_Y - 160} Q ${CX - 160} ${FACE_Y - 150} ${CX - 215} ${FACE_Y - 40} Z" fill="${c.hair}"/>
        <path d="M ${CX - 40} ${FACE_Y - 232} L ${CX - 20} ${FACE_Y - 260} L ${CX} ${FACE_Y - 234} L ${CX + 20} ${FACE_Y - 258} L ${CX + 40} ${FACE_Y - 232} Z" fill="${c.hair}"/>`;
    case "messy":
      return `
        <path d="M ${CX - 218} ${FACE_Y - 20} Q ${CX - 230} ${FACE_Y - 200} ${CX - 90} ${FACE_Y - 225} L ${CX - 110} ${FACE_Y - 185} L ${CX - 30} ${FACE_Y - 235} L ${CX - 35} ${FACE_Y - 190} L ${CX + 45} ${FACE_Y - 238} L ${CX + 35} ${FACE_Y - 188} L ${CX + 120} ${FACE_Y - 220} L ${CX + 100} ${FACE_Y - 175} Q ${CX + 228} ${FACE_Y - 190} ${CX + 218} ${FACE_Y - 20} Q ${CX + 150} ${FACE_Y - 130} ${CX} ${FACE_Y - 140} Q ${CX - 150} ${FACE_Y - 130} ${CX - 218} ${FACE_Y - 20} Z" fill="${c.hair}"/>`;
    case "bob":
      return `
        <path d="M ${CX - 225} ${FACE_Y + 130} L ${CX - 225} ${FACE_Y - 60} Q ${CX - 215} ${FACE_Y - 235} ${CX} ${FACE_Y - 240} Q ${CX + 215} ${FACE_Y - 235} ${CX + 225} ${FACE_Y - 60} L ${CX + 225} ${FACE_Y + 130} L ${CX + 165} ${FACE_Y + 110} Q ${CX + 185} ${FACE_Y - 60} ${CX + 130} ${FACE_Y - 145} Q ${CX + 40} ${FACE_Y - 175} ${CX - 60} ${FACE_Y - 160} Q ${CX - 175} ${FACE_Y - 120} ${CX - 165} ${FACE_Y + 110} Z" fill="${c.hair}"/>`;
  }
}

function browsAndEyes(c, emotion) {
  const eyeY = FACE_Y - 20;
  const L = CX - 85; // 左目中心
  const R = CX + 85;
  const browY = eyeY - 55;
  const brow = (cx, angle) =>
    `<rect x="${cx - 45}" y="${browY - 9}" width="90" height="18" rx="9" fill="#3f3f46" transform="rotate(${angle} ${cx} ${browY})"/>`;

  let brows = "";
  let eyes = "";
  switch (emotion) {
    case "normal":
      brows = brow(L, -4) + brow(R, 4);
      eyes = `<circle cx="${L}" cy="${eyeY}" r="16" fill="#27272a"/><circle cx="${R}" cy="${eyeY}" r="16" fill="#27272a"/>`;
      break;
    case "annoyed":
      brows = brow(L, 18) + brow(R, -18);
      eyes = `
        <path d="M ${L - 30} ${eyeY - 6} Q ${L} ${eyeY - 18} ${L + 30} ${eyeY - 6}" stroke="#27272a" stroke-width="10" fill="none" stroke-linecap="round"/>
        <path d="M ${R - 30} ${eyeY - 6} Q ${R} ${eyeY - 18} ${R + 30} ${eyeY - 6}" stroke="#27272a" stroke-width="10" fill="none" stroke-linecap="round"/>
        <circle cx="${L}" cy="${eyeY + 2}" r="10" fill="#27272a"/><circle cx="${R}" cy="${eyeY + 2}" r="10" fill="#27272a"/>`;
      break;
    case "angry":
      brows = brow(L, 26) + brow(R, -26);
      eyes = `
        <circle cx="${L}" cy="${eyeY}" r="18" fill="#ffffff" stroke="#27272a" stroke-width="6"/>
        <circle cx="${R}" cy="${eyeY}" r="18" fill="#ffffff" stroke="#27272a" stroke-width="6"/>
        <circle cx="${L}" cy="${eyeY}" r="8" fill="#27272a"/><circle cx="${R}" cy="${eyeY}" r="8" fill="#27272a"/>`;
      break;
    case "smug":
      brows = brow(L, -14) + brow(R, 14);
      eyes = `
        <path d="M ${L - 30} ${eyeY} Q ${L} ${eyeY - 26} ${L + 30} ${eyeY}" stroke="#27272a" stroke-width="11" fill="none" stroke-linecap="round"/>
        <path d="M ${R - 30} ${eyeY} Q ${R} ${eyeY - 26} ${R + 30} ${eyeY}" stroke="#27272a" stroke-width="11" fill="none" stroke-linecap="round"/>`;
      break;
    case "furious":
      brows = brow(L, 34) + brow(R, -34);
      eyes = `
        <circle cx="${L}" cy="${eyeY}" r="24" fill="#ffffff" stroke="#dc2626" stroke-width="7"/>
        <circle cx="${R}" cy="${eyeY}" r="24" fill="#ffffff" stroke="#dc2626" stroke-width="7"/>
        <circle cx="${L}" cy="${eyeY}" r="6" fill="#dc2626"/><circle cx="${R}" cy="${eyeY}" r="6" fill="#dc2626"/>`;
      break;
    case "defeated":
      brows = brow(L, -20) + brow(R, 20);
      const x = (cx) => `
        <line x1="${cx - 20}" y1="${eyeY - 20}" x2="${cx + 20}" y2="${eyeY + 20}" stroke="#27272a" stroke-width="11" stroke-linecap="round"/>
        <line x1="${cx + 20}" y1="${eyeY - 20}" x2="${cx - 20}" y2="${eyeY + 20}" stroke="#27272a" stroke-width="11" stroke-linecap="round"/>`;
      eyes = x(L) + x(R);
      break;
  }

  const glasses = c.glasses
    ? `<g stroke="#3f3f46" stroke-width="8" fill="none">
        <rect x="${L - 48}" y="${eyeY - 34}" width="96" height="68" rx="14"/>
        <rect x="${R - 48}" y="${eyeY - 34}" width="96" height="68" rx="14"/>
        <line x1="${L + 48}" y1="${eyeY - 6}" x2="${R - 48}" y2="${eyeY - 6}"/>
      </g>`
    : "";
  return brows + eyes + glasses;
}

function mouth(c, emotion) {
  const y = FACE_Y + 105;
  let m = "";
  switch (emotion) {
    case "normal":
      m = `<path d="M ${CX - 38} ${y} Q ${CX} ${y + 8} ${CX + 38} ${y}" stroke="#7f1d1d" stroke-width="11" fill="none" stroke-linecap="round"/>`;
      break;
    case "annoyed":
      m = `<path d="M ${CX - 42} ${y + 12} Q ${CX} ${y - 16} ${CX + 42} ${y + 12}" stroke="#7f1d1d" stroke-width="11" fill="none" stroke-linecap="round"/>`;
      break;
    case "angry":
      m = `<path d="M ${CX - 50} ${y + 14} Q ${CX} ${y - 26} ${CX + 50} ${y + 14} Q ${CX} ${y + 34} ${CX - 50} ${y + 14} Z" fill="#7f1d1d"/>`;
      break;
    case "smug":
      m = `<path d="M ${CX - 30} ${y + 6} Q ${CX + 14} ${y + 18} ${CX + 44} ${y - 14}" stroke="#7f1d1d" stroke-width="11" fill="none" stroke-linecap="round"/>`;
      break;
    case "furious":
      m = `<path d="M ${CX - 62} ${y - 6} L ${CX - 34} ${y + 6} L ${CX - 8} ${y - 8} L ${CX + 20} ${y + 6} L ${CX + 48} ${y - 8} L ${CX + 62} ${y + 2} Q ${CX} ${y + 62} ${CX - 62} ${y - 6} Z" fill="#7f1d1d"/>
           <path d="M ${CX - 40} ${y + 26} Q ${CX} ${y + 44} ${CX + 40} ${y + 24}" stroke="#fecaca" stroke-width="8" fill="none"/>`;
      break;
    case "defeated":
      m = `<path d="M ${CX - 44} ${y + 6} Q ${CX - 22} ${y - 10} ${CX} ${y + 6} Q ${CX + 22} ${y + 22} ${CX + 44} ${y + 6}" stroke="#7f1d1d" stroke-width="11" fill="none" stroke-linecap="round"/>`;
      break;
  }
  if (c.mustache && emotion !== "defeated") {
    m = `<path d="M ${CX - 70} ${y - 24} Q ${CX} ${y - 52} ${CX + 70} ${y - 24} Q ${CX} ${y - 34} ${CX - 70} ${y - 24} Z" fill="${c.hair}"/>` + m;
  }
  return m;
}

function extras(emotion) {
  const veinX = CX + 168;
  const veinY = FACE_Y - 130;
  const vein = `<g stroke="#dc2626" stroke-width="10" stroke-linecap="round">
      <path d="M ${veinX - 22} ${veinY} q 11 -11 22 0 q 11 11 22 0" fill="none"/>
      <path d="M ${veinX - 22} ${veinY + 22} q 11 -11 22 0 q 11 11 22 0" fill="none"/>
    </g>`;
  const steam = `<g fill="#e5e7eb" opacity="0.9">
      <path d="M ${CX - 240} ${FACE_Y - 150} q -20 -30 5 -55 q -30 5 -25 -30" stroke="#e5e7eb" stroke-width="14" fill="none" stroke-linecap="round"/>
      <path d="M ${CX + 240} ${FACE_Y - 150} q 20 -30 -5 -55 q 30 5 25 -30" stroke="#e5e7eb" stroke-width="14" fill="none" stroke-linecap="round"/>
    </g>`;
  const sparkle = `<g fill="#fbbf24">
      <path d="M ${CX + 200} ${FACE_Y - 170} l 8 22 22 8 -22 8 -8 22 -8 -22 -22 -8 22 -8 Z"/>
      <path d="M ${CX - 220} ${FACE_Y - 120} l 5 14 14 5 -14 5 -5 14 -5 -14 -14 -5 14 -5 Z"/>
    </g>`;
  const sweat = `<path d="M ${CX + 190} ${FACE_Y - 60} q 22 34 0 52 q -22 -18 0 -52 Z" fill="#7dd3fc"/>`;
  const dizzy = `<g stroke="#a1a1aa" stroke-width="8" fill="none" stroke-linecap="round">
      <path d="M ${CX - 10} ${FACE_Y - 265} a 26 26 0 1 1 26 -26 a 18 18 0 1 0 -40 12"/>
    </g>`;
  switch (emotion) {
    case "angry": return vein;
    case "furious": return vein + steam;
    case "smug": return sparkle;
    case "defeated": return sweat + dizzy;
    default: return "";
  }
}

function bodySvg(c, emotion) {
  const topY = FACE_Y + 195;
  const tie = c.tie
    ? `<path d="M ${CX} ${topY + 10} L ${CX - 26} ${topY + 46} L ${CX} ${topY + 170} L ${CX + 26} ${topY + 46} Z" fill="${c.tie}"/>
       <rect x="${CX - 20}" y="${topY}" width="40" height="26" rx="6" fill="${c.tie}"/>`
    : "";
  const arms = c.crossedArms
    ? `<path d="M ${CX - 250} ${topY + 190} Q ${CX} ${topY + 110} ${CX + 250} ${topY + 190} L ${CX + 250} ${topY + 260} Q ${CX} ${topY + 190} ${CX - 250} ${topY + 260} Z" fill="${darken(c.suit)}"/>
       <circle cx="${CX - 190}" cy="${topY + 218}" r="34" fill="${c.skin}"/>
       <circle cx="${CX + 190}" cy="${topY + 218}" r="34" fill="${c.skin}"/>`
    : "";
  // defeatedは全体を傾けて吹っ飛び感を出す
  return `
    <path d="M ${CX - 300} 1024 Q ${CX - 290} ${topY + 60} ${CX - 120} ${topY + 10} L ${CX - 60} ${topY - 40} L ${CX + 60} ${topY - 40} L ${CX + 120} ${topY + 10} Q ${CX + 290} ${topY + 60} ${CX + 300} 1024 Z" fill="${c.suit}"/>
    <path d="M ${CX - 60} ${topY - 40} L ${CX} ${topY + 60} L ${CX + 60} ${topY - 40} L ${CX + 40} ${topY - 46} L ${CX} ${topY + 10} L ${CX - 40} ${topY - 46} Z" fill="${c.shirt}"/>
    ${tie}
    ${arms}`;
}

function darken(hex) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v) => Math.max(0, Math.round(v * 0.75));
  const r = f((n >> 16) & 255), g = f((n >> 8) & 255), b = f(n & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

function generate(id, c, emotion) {
  const neckY = FACE_Y + 150;
  const tilt = emotion === "defeated" ? `transform="rotate(-9 512 512)"` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <g ${tilt}>
    ${bodySvg(c, emotion)}
    <rect x="${CX - 55}" y="${neckY - 30}" width="110" height="90" fill="${c.skin}"/>
    <ellipse cx="${CX - 205}" cy="${FACE_Y + 10}" rx="28" ry="40" fill="${c.skin}"/>
    <ellipse cx="${CX + 205}" cy="${FACE_Y + 10}" rx="28" ry="40" fill="${c.skin}"/>
    <ellipse cx="${CX}" cy="${FACE_Y}" rx="210" ry="225" fill="${c.skin}"/>
    ${hairSvg(c)}
    ${browsAndEyes(c, emotion)}
    <ellipse cx="${CX}" cy="${FACE_Y + 45}" rx="16" ry="22" fill="${darkenSkin(c.skin)}"/>
    ${mouth(c, emotion)}
    ${extras(emotion)}
  </g>
</svg>`;
}

function darkenSkin(hex) {
  return darken(hex);
}

for (const [id, c] of Object.entries(CHARACTERS)) {
  const dir = path.join(OUT, id);
  mkdirSync(dir, { recursive: true });
  for (const emotion of EMOTIONS) {
    writeFileSync(path.join(dir, `${emotion}.svg`), generate(id, c, emotion));
  }
  console.log(`✅ ${id}: ${EMOTIONS.length}枚生成`);
}
