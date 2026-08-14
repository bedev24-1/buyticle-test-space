import * as THREE from 'three';

/* ══════════════════════════════════════════════════════════════════════════
   TEXTURES
   Générées au canvas puis passées au GPU. On produit pour chaque matière une
   carte de couleur ET une carte de rugosité : c'est ce qui fait qu'un mur de
   béton n'a pas le même reflet qu'une bâche tendue, et c'est ce qui sépare
   une image « à plat » d'une image qui accroche la lumière.
   ══════════════════════════════════════════════════════════════════════════ */

const cv = (s = 512) => {
  const c = document.createElement('canvas');
  c.width = c.height = s;
  return c;
};

const tex = (canvas, rep = 1) => {
  const t = new THREE.CanvasTexture(canvas);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rep, rep);
  t.anisotropy = 8;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};
const lin = (canvas, rep = 1) => {
  const t = tex(canvas, rep);
  t.colorSpace = THREE.NoColorSpace;   // rugosité : données, pas couleur
  return t;
};

/* bruit à plusieurs échelles — la base de toute matière crédible */
function grain(ctx, s, n, alpha, size) {
  for (let i = 0; i < n; i++) {
    const x = Math.random() * s, y = Math.random() * s;
    const r = size * (0.4 + Math.random());
    const v = (Math.random() * 2 - 1) * 255;
    ctx.fillStyle = `rgba(${v > 0 ? 255 : 0},${v > 0 ? 255 : 0},${v > 0 ? 255 : 0},${alpha * Math.random()})`;
    ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  }
}

/* ── enduit / béton peint ─────────────────────────────────────────────── */
export function plaster(base = '#cfc3ae', sale = 0.5) {
  const s = 512, c = cv(s), x = c.getContext('2d');
  x.fillStyle = base; x.fillRect(0, 0, s, s);
  grain(x, s, 2600, 0.10, 9);
  grain(x, s, 700, 0.06, 34);
  // coulures d'eau depuis le haut
  for (let i = 0; i < 26 * sale; i++) {
    const px = Math.random() * s, w = 3 + Math.random() * 9, h = 40 + Math.random() * 300;
    const g = x.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(60,50,38,.22)'); g.addColorStop(1, 'rgba(60,50,38,0)');
    x.fillStyle = g; x.fillRect(px, 0, w, h);
  }
  // écaillage bas de mur
  const g2 = x.createLinearGradient(0, s * 0.72, 0, s);
  g2.addColorStop(0, 'rgba(40,32,24,0)'); g2.addColorStop(1, 'rgba(40,32,24,.30)');
  x.fillStyle = g2; x.fillRect(0, s * 0.72, s, s * 0.28);

  const rc = cv(s), rx = rc.getContext('2d');
  rx.fillStyle = '#b4b4b4'; rx.fillRect(0, 0, s, s);
  grain(rx, s, 2200, 0.16, 11);
  return { map: tex(c, 1), roughnessMap: lin(rc, 1) };
}

/* ── tôle ondulée ─────────────────────────────────────────────────────── */
export function corrugated(base = '#8d9298') {
  const s = 512, c = cv(s), x = c.getContext('2d');
  x.fillStyle = base; x.fillRect(0, 0, s, s);
  for (let i = 0; i < s; i += 16) {
    const g = x.createLinearGradient(i, 0, i + 16, 0);
    g.addColorStop(0, 'rgba(0,0,0,.30)');
    g.addColorStop(.45, 'rgba(255,255,255,.20)');
    g.addColorStop(1, 'rgba(0,0,0,.30)');
    x.fillStyle = g; x.fillRect(i, 0, 16, s);
  }
  // rouille
  for (let i = 0; i < 150; i++) {
    const px = Math.random() * s, py = Math.random() * s, r = 4 + Math.random() * 26;
    const g = x.createRadialGradient(px, py, 0, px, py, r);
    g.addColorStop(0, 'rgba(126,62,26,.45)'); g.addColorStop(1, 'rgba(126,62,26,0)');
    x.fillStyle = g; x.beginPath(); x.arc(px, py, r, 0, 7); x.fill();
  }
  const rc = cv(s), rx = rc.getContext('2d');
  rx.fillStyle = '#6e6e6e'; rx.fillRect(0, 0, s, s);
  grain(rx, s, 1400, 0.25, 14);
  return { map: tex(c, 1), roughnessMap: lin(rc, 1) };
}

/* ── bâche tendue (le bleu des marchés) ───────────────────────────────── */
export function tarp(base = '#1f7f96') {
  const s = 256, c = cv(s), x = c.getContext('2d');
  x.fillStyle = base; x.fillRect(0, 0, s, s);
  // trame tissée
  x.globalAlpha = .16;
  for (let i = 0; i < s; i += 3) {
    x.fillStyle = i % 6 ? '#000' : '#fff';
    x.fillRect(i, 0, 1.4, s); x.fillRect(0, i, s, 1.4);
  }
  x.globalAlpha = 1;
  grain(x, s, 900, 0.06, 5);
  // usure sur les plis
  for (let i = 0; i < 8; i++) {
    const py = Math.random() * s;
    const g = x.createLinearGradient(0, py - 6, 0, py + 6);
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(.5, 'rgba(255,255,255,.13)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.fillRect(0, py - 6, s, 12);
  }
  const rc = cv(s), rx = rc.getContext('2d');
  rx.fillStyle = '#8a8a8a'; rx.fillRect(0, 0, s, s);
  grain(rx, s, 700, 0.20, 6);
  return { map: tex(c, 1), roughnessMap: lin(rc, 1) };
}

/* ── sol : terre battue et béton usé de l'allée ───────────────────────── */
export function ground() {
  const s = 1024, c = cv(s), x = c.getContext('2d');
  x.fillStyle = '#8a7f6c'; x.fillRect(0, 0, s, s);
  grain(x, s, 9000, 0.09, 7);
  grain(x, s, 1800, 0.07, 30);
  // flaques et taches sombres
  for (let i = 0; i < 60; i++) {
    const px = Math.random() * s, py = Math.random() * s, r = 20 + Math.random() * 90;
    const g = x.createRadialGradient(px, py, 0, px, py, r);
    g.addColorStop(0, 'rgba(48,40,30,.30)'); g.addColorStop(1, 'rgba(48,40,30,0)');
    x.fillStyle = g; x.beginPath(); x.arc(px, py, r, 0, 7); x.fill();
  }
  // gravier
  for (let i = 0; i < 2400; i++) {
    x.fillStyle = `rgba(${190 + Math.random() * 50},${180 + Math.random() * 45},${160 + Math.random() * 40},${.25 + Math.random() * .35})`;
    x.beginPath(); x.arc(Math.random() * s, Math.random() * s, .8 + Math.random() * 2.2, 0, 7); x.fill();
  }
  const rc = cv(s), rx = rc.getContext('2d');
  rx.fillStyle = '#c8c8c8'; rx.fillRect(0, 0, s, s);
  grain(rx, s, 5000, 0.22, 10);
  return { map: tex(c, 26), roughnessMap: lin(rc, 26) };
}

/* ── bois d'étal ──────────────────────────────────────────────────────── */
export function wood(base = '#7d5c3a') {
  const s = 512, c = cv(s), x = c.getContext('2d');
  x.fillStyle = base; x.fillRect(0, 0, s, s);
  for (let i = 0; i < 200; i++) {
    x.strokeStyle = `rgba(${Math.random() > .5 ? 40 : 210},${Math.random() > .5 ? 26 : 180},${18},${.05 + Math.random() * .12})`;
    x.lineWidth = .6 + Math.random() * 2.4;
    x.beginPath();
    const y = Math.random() * s;
    x.moveTo(0, y);
    for (let px = 0; px <= s; px += 26) x.lineTo(px, y + Math.sin(px * .03 + i) * 3);
    x.stroke();
  }
  for (let i = 0; i < s; i += 64) {
    x.fillStyle = 'rgba(0,0,0,.16)'; x.fillRect(0, i, s, 2);
  }
  const rc = cv(s), rx = rc.getContext('2d');
  rx.fillStyle = '#a0a0a0'; rx.fillRect(0, 0, s, s);
  grain(rx, s, 1600, 0.18, 9);
  return { map: tex(c, 1), roughnessMap: lin(rc, 1) };
}

/* ── enseigne peinte : le nom de la boutique ──────────────────────────── */
export function sign(nom, fond = '#12303a', encre = '#ffd15c') {
  const w = 1024, h = 224, c = cv(); c.width = w; c.height = h;
  const x = c.getContext('2d');
  x.fillStyle = fond; x.fillRect(0, 0, w, h);
  // bord peint
  x.strokeStyle = encre; x.lineWidth = 8; x.strokeRect(14, 14, w - 28, h - 28);
  x.fillStyle = encre;
  x.font = '700 96px "Segoe UI", system-ui, sans-serif';
  x.textAlign = 'center'; x.textBaseline = 'middle';
  let t = nom, size = 96;
  while (x.measureText(t).width > w - 90 && size > 40) {
    size -= 4; x.font = `700 ${size}px "Segoe UI", system-ui, sans-serif`;
  }
  x.fillText(t, w / 2, h / 2 + 4);
  // salissure
  grain(x, h, 500, 0.07, 12);
  const t2 = new THREE.CanvasTexture(c);
  t2.colorSpace = THREE.SRGBColorSpace; t2.anisotropy = 8;
  return t2;
}

/* ── ciel : dégradé chaud de fin de matinée ───────────────────────────── */
export function sky() {
  const s = 512, c = cv(s), x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 0, s);
  g.addColorStop(0, '#2f6ea8');
  g.addColorStop(.55, '#9dc0d8');
  g.addColorStop(.80, '#e2d3bd');
  g.addColorStop(1, '#c9b79c');
  x.fillStyle = g; x.fillRect(0, 0, s, s);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.mapping = THREE.EquirectangularReflectionMapping;
  return t;
}
