import * as THREE from 'three';

/* ══════════════════════════════════════════════════════════════════════════
   UN CORPS HUMAIN
   La version précédente empilait des cylindres indépendants : ça ne fera
   jamais un humain, parce qu'un corps n'a pas de coutures. Ici le corps est
   un maillage continu, tendu sur un squelette de vingt os, et chaque sommet
   est pondéré entre deux os. Quand le coude plie, la peau se plisse au lieu
   de se séparer.

   Les proportions viennent du canon anatomique réel, en têtes : un adulte
   fait 7,5 têtes de haut, l'entrejambe est à 47 % de la taille, les épaules
   font 2 têtes de large, le coude arrive à la taille, le poignet au pubis.
   ══════════════════════════════════════════════════════════════════════════ */

/* ── proportions ────────────────────────────────────────────────────────
   Toutes en fraction de la stature, d'après l'anthropométrie usuelle de
   l'adulte. La version précédente avait des rayons ~35 % trop grands : ça
   donnait des tonneaux. Ici la largeur d'épaules vaut 0,235 de la taille, le
   tour de taille 0,152, la tête 1/7,5 de la hauteur totale.
   ──────────────────────────────────────────────────────────────────────── */
const P = {
  cheville:   .040,
  genou:      .285,
  entrejambe: .468,
  hanche:     .530,
  nombril:    .620,
  poitrine:   .720,
  epaule:     .818,
  cou:        .805,
  menton:     .867,
  crane:     1.000,
  demiHanches: .048,
};

/* ══════════════════════════════════════════════════════════════════════════
   LE VISAGE
   Peint sur une texture appliquée à la tête. À trois mètres de distance,
   c'est ce qui fait la différence entre une boule et quelqu'un.
   ══════════════════════════════════════════════════════════════════════════ */
const facesCache = {};
export function visage(peau = '#8d5524', barbe = 0, sexe = 'h') {
  const cle = peau + barbe + sexe;
  if (facesCache[cle]) return facesCache[cle];

  const W = 512, H = 512;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d');
  x.fillStyle = peau; x.fillRect(0, 0, W, H);

  // la sphère est mappée u∈[0,1] autour, v∈[0,1] du sommet au bas.
  // Le visage se trouve autour de u = 0.5 (three.js place la couture en -z).
  const cx = W * .5;

  // ombrage : tempes et bas de joues plus sombres, front plus clair
  const grad = x.createRadialGradient(cx, H * .52, 10, cx, H * .52, W * .32);
  grad.addColorStop(0, 'rgba(255,235,210,.20)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = grad; x.fillRect(0, 0, W, H);

  const ombre = (px, py, r, a) => {
    const g = x.createRadialGradient(px, py, 0, px, py, r);
    g.addColorStop(0, `rgba(70,38,18,${a})`); g.addColorStop(1, 'rgba(70,38,18,0)');
    x.fillStyle = g; x.beginPath(); x.arc(px, py, r, 0, 7); x.fill();
  };

  const yOeil = H * .47, ecart = W * .072;

  // orbites
  ombre(cx - ecart, yOeil + 2, 30, .30);
  ombre(cx + ecart, yOeil + 2, 30, .30);
  // arête et ailes du nez
  ombre(cx - 11, H * .545, 15, .22);
  ombre(cx + 11, H * .545, 15, .22);
  ombre(cx, H * .512, 20, .10);

  // sourcils
  x.fillStyle = 'rgba(28,18,12,.88)';
  [-1, 1].forEach((s) => {
    x.save(); x.translate(cx + s * ecart, yOeil - 26); x.rotate(s * .09);
    x.beginPath(); x.ellipse(0, 0, 25, 5.5, 0, 0, 7); x.fill(); x.restore();
  });

  // yeux : blanc, iris, pupille, reflet, paupière
  [-1, 1].forEach((s) => {
    const ox = cx + s * ecart;
    x.fillStyle = '#efe7dd';
    x.beginPath(); x.ellipse(ox, yOeil, 17, 8.6, 0, 0, 7); x.fill();
    x.fillStyle = '#3b2412';
    x.beginPath(); x.arc(ox + s * 1.2, yOeil, 7.4, 0, 7); x.fill();
    x.fillStyle = '#100a06';
    x.beginPath(); x.arc(ox + s * 1.2, yOeil, 3.5, 0, 7); x.fill();
    x.fillStyle = 'rgba(255,255,255,.9)';
    x.beginPath(); x.arc(ox + s * 1.2 - 2.4, yOeil - 2.8, 1.9, 0, 7); x.fill();
    // paupière supérieure
    x.strokeStyle = 'rgba(40,24,14,.75)'; x.lineWidth = 2.6;
    x.beginPath(); x.ellipse(ox, yOeil, 17, 8.6, 0, Math.PI * 1.02, Math.PI * 1.98); x.stroke();
  });

  // bouche
  const yB = H * .615;
  x.fillStyle = 'rgba(96,44,36,.62)';
  x.beginPath();
  x.moveTo(cx - 22, yB);
  x.quadraticCurveTo(cx, yB - 7, cx + 22, yB);
  x.quadraticCurveTo(cx, yB + 11, cx - 22, yB);
  x.fill();
  x.strokeStyle = 'rgba(60,26,20,.55)'; x.lineWidth = 1.6;
  x.beginPath(); x.moveTo(cx - 21, yB + 1); x.quadraticCurveTo(cx, yB + 4, cx + 21, yB + 1); x.stroke();

  // barbe légère
  if (barbe > 0) {
    x.globalAlpha = barbe * .5;
    for (let i = 0; i < 2600; i++) {
      const a = (Math.random() - .5) * 108, b2 = H * .60 + Math.random() * H * .10;
      if (Math.abs(a) < 26 && b2 < H * .635) continue;
      x.fillStyle = '#241812';
      x.fillRect(cx + a, b2, 1.6, 1.6);
    }
    x.globalAlpha = 1;
  }

  // grain de peau
  for (let i = 0; i < 5000; i++) {
    x.fillStyle = `rgba(${Math.random() > .5 ? 255 : 0},${Math.random() > .5 ? 240 : 0},200,.035)`;
    x.fillRect(Math.random() * W, Math.random() * H, 1.6, 1.6);
  }

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  facesCache[cle] = t;
  return t;
}

/* ══════════════════════════════════════════════════════════════════════════
   SQUELETTE
   ══════════════════════════════════════════════════════════════════════════ */
const OS = [
  // nom,        parent,        position relative au parent
  ['hanches',    null,          [0, P.hanche, 0]],
  ['lombaires',  'hanches',     [0, .055, 0]],
  ['dorsales',   'lombaires',   [0, .070, 0]],
  ['thorax',     'dorsales',    [0, .075, 0]],
  ['cou',        'thorax',      [0, .075, 0]],
  ['tete',       'cou',         [0, .062, 0]],       // articulation au menton

  ['epauleG',    'thorax',      [-.045, .078, 0]],
  ['brasG',      'epauleG',     [-.042, -.008, 0]],  // épaule à 0,087 de l'axe
  ['avantBrasG', 'brasG',       [0, -.185, 0]],      // coude au niveau de la taille
  ['mainG',      'avantBrasG',  [0, -.150, 0]],      // poignet à hauteur du pubis
  ['epauleD',    'thorax',      [.045, .078, 0]],
  ['brasD',      'epauleD',     [.042, -.008, 0]],
  ['avantBrasD', 'brasD',       [0, -.185, 0]],
  ['mainD',      'avantBrasD',  [0, -.150, 0]],

  ['cuisseG',    'hanches',     [-P.demiHanches, -.040, 0]],
  ['jambeG',     'cuisseG',     [0, -.205, 0]],
  ['piedG',      'jambeG',      [0, -.245, 0]],
  ['cuisseD',    'hanches',     [P.demiHanches, -.040, 0]],
  ['jambeD',     'cuisseD',     [0, -.205, 0]],
  ['piedD',      'jambeD',      [0, -.245, 0]],
];

function squelette() {
  const par = {}, os = [], idx = {};
  OS.forEach(([n, p, [x, y, z]], i) => {
    const b = new THREE.Bone();
    b.name = n;
    b.position.set(x, y, z);
    idx[n] = i; os.push(b);
    if (p) os[idx[p]].add(b); else par.racine = b;
  });
  return { os, racine: par.racine, idx };
}

/* position absolue d'un os dans la pose de repos */
function posRepos(idx, nom) {
  let i = idx[nom], v = new THREE.Vector3();
  const chaine = [];
  let cur = nom;
  while (cur) {
    chaine.push(cur);
    const e = OS.find((o) => o[0] === cur);
    cur = e[1];
  }
  for (const n of chaine) {
    const e = OS.find((o) => o[0] === n);
    v.x += e[2][0]; v.y += e[2][1]; v.z += e[2][2];
  }
  return v;
}

/* ══════════════════════════════════════════════════════════════════════════
   MAILLAGE
   On tend une surface sur une suite d'anneaux. Chaque anneau connaît sa
   position, ses deux rayons, et les deux os entre lesquels ses sommets sont
   partagés. C'est ce partage qui fait la différence : au coude, les sommets
   appartiennent pour moitié au bras et pour moitié à l'avant-bras, donc la
   peau tourne au lieu de se déchirer.
   ══════════════════════════════════════════════════════════════════════════ */
function loft(anneaux, idx, seg = 14, fermerHaut = false, fermerBas = false) {
  const pos = [], nor = [], uv = [], si = [], sw = [], ind = [];
  const N = anneaux.length;

  for (let a = 0; a < N; a++) {
    const r = anneaux[a];
    for (let s = 0; s <= seg; s++) {
      const th = (s / seg) * Math.PI * 2;
      const cx = Math.cos(th), sz = Math.sin(th);
      pos.push(r.p[0] + cx * r.rx, r.p[1], r.p[2] + sz * r.rz);
      const n = new THREE.Vector3(cx * r.rz, 0, sz * r.rx).normalize();
      // inclinaison de la normale selon la variation de rayon
      if (a > 0 && a < N - 1) {
        const dy = anneaux[a + 1].p[1] - anneaux[a - 1].p[1];
        const dr = (anneaux[a + 1].rx - anneaux[a - 1].rx);
        n.y = -dr / (Math.abs(dy) + 1e-4) * .5;
        n.normalize();
      }
      nor.push(n.x, n.y, n.z);
      uv.push(s / seg, a / (N - 1));
      const b = r.os;
      si.push(idx[b[0]], b[1] !== undefined ? idx[b[1]] : 0, 0, 0);
      sw.push(r.w ? r.w[0] : 1, r.w ? r.w[1] : 0, 0, 0);
    }
  }
  for (let a = 0; a < N - 1; a++) {
    for (let s = 0; s < seg; s++) {
      const i0 = a * (seg + 1) + s, i1 = i0 + 1, i2 = i0 + seg + 1, i3 = i2 + 1;
      ind.push(i0, i2, i1, i1, i2, i3);
    }
  }
  // bouchons
  const bouchon = (a, sens) => {
    const r = anneaux[a];
    const c = pos.length / 3;
    pos.push(r.p[0], r.p[1] + sens * r.rx * .55, r.p[2]);
    nor.push(0, sens, 0); uv.push(.5, a / (N - 1));
    si.push(idx[r.os[0]], 0, 0, 0); sw.push(1, 0, 0, 0);
    for (let s = 0; s < seg; s++) {
      const i0 = a * (seg + 1) + s, i1 = i0 + 1;
      if (sens > 0) ind.push(c, i0, i1); else ind.push(c, i1, i0);
    }
  };
  if (fermerHaut) bouchon(N - 1, 1);
  if (fermerBas) bouchon(0, -1);

  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(si, 4));
  g.setAttribute('skinWeight', new THREE.Float32BufferAttribute(sw, 4));
  g.setIndex(ind);
  return g;
}

const merge = (list) => {
  // fusion simple de géométries de même attributs
  const out = new THREE.BufferGeometry();
  const clefs = ['position', 'normal', 'uv', 'skinIndex', 'skinWeight'];
  const acc = {}, ind = [];
  let base = 0;
  clefs.forEach((k) => (acc[k] = []));
  for (const g of list) {
    clefs.forEach((k) => {
      const a = g.getAttribute(k);
      for (let i = 0; i < a.array.length; i++) acc[k].push(a.array[i]);
    });
    const gi = g.getIndex();
    for (let i = 0; i < gi.array.length; i++) ind.push(gi.array[i] + base);
    base += g.getAttribute('position').count;
  }
  out.setAttribute('position', new THREE.Float32BufferAttribute(acc.position, 3));
  out.setAttribute('normal', new THREE.Float32BufferAttribute(acc.normal, 3));
  out.setAttribute('uv', new THREE.Float32BufferAttribute(acc.uv, 2));
  out.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(acc.skinIndex, 4));
  out.setAttribute('skinWeight', new THREE.Float32BufferAttribute(acc.skinWeight, 4));
  out.setIndex(ind);
  return out;
};

/* ── les pièces du corps, construites une seule fois puis partagées ────── */
let GEO = null;
function geometries() {
  if (GEO) return GEO;
  const { idx } = squelette();
  const A = (nom) => { const v = posRepos(idx, nom); return [v.x, v.y, v.z]; };

  const hanches = A('hanches'), thorax = A('thorax'), cou = A('cou');

  /* ── tronc : bassin → cou, section elliptique qui s'élargit au thorax ── */
  const tronc = loft([
    { p: [0, P.entrejambe + .016, 0], rx: .088, rz: .058, os: ['hanches'] },
    { p: [0, P.hanche, 0],            rx: .094, rz: .062, os: ['hanches'] },
    { p: [0, P.hanche + .050, 0],     rx: .090, rz: .059, os: ['hanches', 'lombaires'], w: [.55, .45] },
    { p: [0, P.nombril, 0],           rx: .082, rz: .056, os: ['lombaires', 'dorsales'], w: [.5, .5] },
    { p: [0, P.poitrine - .030, 0],   rx: .081, rz: .058, os: ['dorsales'] },
    { p: [0, P.poitrine, 0],          rx: .087, rz: .062, os: ['dorsales', 'thorax'], w: [.35, .65] },
    { p: [0, P.poitrine + .045, 0],   rx: .086, rz: .060, os: ['thorax'] },
    { p: [0, P.epaule - .023, 0],     rx: .080, rz: .056, os: ['thorax'] },
    { p: [0, P.epaule, 0],            rx: .060, rz: .048, os: ['thorax'] },
    { p: [0, P.epaule + .012, 0],     rx: .038, rz: .038, os: ['thorax', 'cou'], w: [.45, .55] },
    { p: [0, P.menton - .010, 0],     rx: .033, rz: .033, os: ['cou'] },
  ], idx, 18, false, true);

  /* ── épaules : deux bulbes qui referment le haut du tronc ── */
  const epaule = (cote) => {
    const b = cote < 0 ? 'epauleG' : 'epauleD';
    const p = A(b);
    const g = new THREE.SphereGeometry(.038, 14, 12);
    g.scale(1.16, 1.05, .98);
    g.translate(p[0] + cote * .040, p[1] - .012, p[2]);
    const n = g.getAttribute('position').count;
    g.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(new Uint16Array(n * 4).fill(0), 4));
    g.setAttribute('skinWeight', new THREE.Float32BufferAttribute(new Float32Array(n * 4), 4));
    const si = g.getAttribute('skinIndex'), sw = g.getAttribute('skinWeight');
    for (let i = 0; i < n; i++) { si.setX(i, idx[b]); sw.setX(i, 1); }
    return g;
  };

  /* ── bras : manche jusqu'au coude, avant-bras nu ── */
  const bras = (cote) => {
    const C = cote < 0 ? 'G' : 'D';
    const br = A('bras' + C), av = A('avantBras' + C), ma = A('main' + C);
    const coude = { p: [av[0], av[1] + .012, av[2]], rx: .026, rz: .026,
                    os: ['bras' + C, 'avantBras' + C], w: [.45, .55] };
    return {
      manche: loft([
        { p: [br[0], br[1] + .022, br[2]], rx: .037, rz: .037, os: ['epaule' + C, 'bras' + C], w: [.5, .5] },
        { p: [br[0], br[1] - .050, br[2]], rx: .031, rz: .031, os: ['bras' + C] },
        { p: [br[0], br[1] - .112, br[2]], rx: .029, rz: .029, os: ['bras' + C] },   // bord de manche
      ], idx, 12, false, false),
      nu: loft([
        { p: [br[0], br[1] - .114, br[2]], rx: .026, rz: .026, os: ['bras' + C] },
        coude,
        { p: [av[0], av[1] - .045, av[2]], rx: .027, rz: .027, os: ['avantBras' + C] },
        { p: [av[0], av[1] - .110, av[2]], rx: .020, rz: .020, os: ['avantBras' + C] },
        { p: [ma[0], ma[1] + .006, ma[2]], rx: .017, rz: .015, os: ['avantBras' + C, 'main' + C], w: [.4, .6] },
      ], idx, 12, false, false),
    };
  };

  /* ── main : paume aplatie, doigts suggérés ── */
  const main = (cote) => {
    const C = cote < 0 ? 'G' : 'D';
    const p = A('main' + C);
    const g = new THREE.SphereGeometry(.026, 10, 8);
    g.scale(.66, 1.35, .44);
    g.translate(p[0], p[1] - .028, p[2]);
    const n = g.getAttribute('position').count;
    g.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(new Uint16Array(n * 4), 4));
    g.setAttribute('skinWeight', new THREE.Float32BufferAttribute(new Float32Array(n * 4), 4));
    const si = g.getAttribute('skinIndex'), sw = g.getAttribute('skinWeight');
    for (let i = 0; i < n; i++) { si.setX(i, idx['main' + C]); sw.setX(i, 1); }
    return g;
  };

  /* ── jambes : hanche → cheville, avec mollet ── */
  const jambe = (cote) => {
    const C = cote < 0 ? 'G' : 'D';
    const cu = A('cuisse' + C), ja = A('jambe' + C), pi = A('pied' + C);
    return loft([
      { p: [cu[0], cu[1] + .038, cu[2]], rx: .064, rz: .064, os: ['hanches', 'cuisse' + C], w: [.45, .55] },
      { p: [cu[0], cu[1] - .045, cu[2]], rx: .057, rz: .059, os: ['cuisse' + C] },
      { p: [cu[0], cu[1] - .140, cu[2]], rx: .048, rz: .050, os: ['cuisse' + C] },
      { p: [ja[0], ja[1] + .022, ja[2]], rx: .043, rz: .045, os: ['cuisse' + C, 'jambe' + C], w: [.45, .55] },
      { p: [ja[0], ja[1] - .035, ja[2] - .005], rx: .047, rz: .051, os: ['jambe' + C] },
      { p: [ja[0], ja[1] - .130, ja[2]], rx: .033, rz: .036, os: ['jambe' + C] },
      { p: [pi[0], pi[1] + .015, pi[2]], rx: .024, rz: .026, os: ['jambe' + C, 'pied' + C], w: [.4, .6] },
    ], idx, 12);
  };

  /* ── pied : chaussure ── */
  const pied = (cote) => {
    const C = cote < 0 ? 'G' : 'D';
    const p = A('pied' + C);
    const g = new THREE.BoxGeometry(.055, .036, .150, 1, 1, 3);
    // pointe légèrement relevée
    const pa = g.getAttribute('position');
    for (let i = 0; i < pa.count; i++) {
      const z = pa.getZ(i);
      if (z > .048) pa.setY(i, pa.getY(i) + .009);
      if (z < -.055) pa.setX(i, pa.getX(i) * .80);
    }
    g.computeVertexNormals();
    g.translate(p[0], p[1] - .022, p[2] + .032);
    const n = pa.count;
    g.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(new Uint16Array(n * 4), 4));
    g.setAttribute('skinWeight', new THREE.Float32BufferAttribute(new Float32Array(n * 4), 4));
    const si = g.getAttribute('skinIndex'), sw = g.getAttribute('skinWeight');
    for (let i = 0; i < n; i++) { si.setX(i, idx['pied' + C]); sw.setX(i, 1); }
    return g;
  };

  /* ── tête : crâne sculpté, menton, nez ── */
  const tete = () => {
    const p = A('tete');
    const g = new THREE.SphereGeometry(.055, 26, 22);
    const pa = g.getAttribute('position');
    const v = new THREE.Vector3();
    for (let i = 0; i < pa.count; i++) {
      v.fromBufferAttribute(pa, i);
      // crâne plus haut que large, face aplatie, arrière bombé
      v.x *= .78; v.y *= 1.20; v.z *= .99;
      // menton : on rétrécit le bas vers l'avant
      if (v.y < -.012) {
        const t = Math.min(1, (-v.y - .012) / .055);
        v.x *= 1 - .34 * t;
        v.z *= 1 - .16 * t;
        v.y -= .007 * t;
      }
      // front un peu fuyant
      if (v.y > .030 && v.z > 0) v.z *= .94;
      // nez : on tire une petite zone vers l'avant
      const dn = Math.hypot(v.x, (v.y - .001) * 1.5);
      if (v.z > .022 && dn < .018) v.z += (.018 - dn) * 1.05;
      pa.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals();
    g.translate(p[0], p[1] + .066, p[2] + .003);
    const n = pa.count;
    g.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(new Uint16Array(n * 4), 4));
    g.setAttribute('skinWeight', new THREE.Float32BufferAttribute(new Float32Array(n * 4), 4));
    const si = g.getAttribute('skinIndex'), sw = g.getAttribute('skinWeight');
    for (let i = 0; i < n; i++) { si.setX(i, idx['tete']); sw.setX(i, 1); }
    return g;
  };

  /* ── oreilles ── */
  const oreille = (cote) => {
    const p = A('tete');
    const g = new THREE.SphereGeometry(.014, 8, 8);
    g.scale(.40, 1.05, .72);
    g.translate(p[0] + cote * .045, p[1] + .062, p[2] - .005);
    const n = g.getAttribute('position').count;
    g.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(new Uint16Array(n * 4), 4));
    g.setAttribute('skinWeight', new THREE.Float32BufferAttribute(new Float32Array(n * 4), 4));
    const si = g.getAttribute('skinIndex'), sw = g.getAttribute('skinWeight');
    for (let i = 0; i < n; i++) { si.setX(i, idx['tete']); sw.setX(i, 1); }
    return g;
  };

  /* ── cheveux : calotte courte ── */
  const cheveux = () => {
    const p = A('tete');
    const g = new THREE.SphereGeometry(.058, 20, 16, 0, Math.PI * 2, 0, Math.PI * .55);
    const pa = g.getAttribute('position');
    for (let i = 0; i < pa.count; i++) {
      pa.setX(i, pa.getX(i) * .80);
      pa.setY(i, pa.getY(i) * 1.18);
      pa.setZ(i, pa.getZ(i) * 1.00);
    }
    g.computeVertexNormals();
    g.translate(p[0], p[1] + .068, p[2] + .002);
    const n = pa.count;
    g.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(new Uint16Array(n * 4), 4));
    g.setAttribute('skinWeight', new THREE.Float32BufferAttribute(new Float32Array(n * 4), 4));
    const si = g.getAttribute('skinIndex'), sw = g.getAttribute('skinWeight');
    for (let i = 0; i < n; i++) { si.setX(i, idx['tete']); sw.setX(i, 1); }
    return g;
  };

  const brasG = bras(-1), brasD = bras(1);
  GEO = {
    haut: merge([tronc, epaule(-1), epaule(1), brasG.manche, brasD.manche]),
    peau: merge([brasG.nu, brasD.nu, main(-1), main(1)]),
    tete: tete(),
    oreilles: merge([oreille(-1), oreille(1)]),
    bas: merge([jambe(-1), jambe(1)]),
    pieds: merge([pied(-1), pied(1)]),
    cheveux: cheveux(),
  };
  return GEO;
}

/* ══════════════════════════════════════════════════════════════════════════
   L'ÊTRE HUMAIN
   ══════════════════════════════════════════════════════════════════════════ */
const PEAUX = ['#7d4a24', '#8d5524', '#6b3d18', '#a06a35', '#5e3413', '#95602c'];
const HAUTS = ['#2d4a7c', '#8c2f2f', '#1f5c46', '#5a3c78', '#b4651f', '#2b6c7a',
               '#8a2f52', '#3d3d46', '#c9a227', '#215e34', '#0f4c81', '#7a3b12'];
const BAS   = ['#26303f', '#3a3226', '#1e1e26', '#40332c', '#2c3b34', '#22242b'];

const M = (c, r = .86) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: .02 });

export class Humain {
  constructor({ taille = 1.74, haut, bas, peau, sac = false, barbe } = {}) {
    const G = geometries();
    const sq = squelette();
    this.taille = taille;
    this.k = taille / 1.74;

    this.root = new THREE.Group();
    this.root.scale.setScalar(taille);      // la géométrie est faite pour 1 m
    this.root.add(sq.racine);
    this.os = Object.fromEntries(sq.os.map((b) => [b.name, b]));

    const tPeau = peau || PEAUX[(Math.random() * PEAUX.length) | 0];
    const mPeau = M(tPeau, .78);
    const mTete = new THREE.MeshStandardMaterial({
      map: visage(tPeau, barbe ?? (Math.random() < .35 ? .8 : 0)), roughness: .76,
    });

    const pieces = [
      [G.haut, M(haut || HAUTS[(Math.random() * HAUTS.length) | 0])],
      [G.peau, mPeau],
      [G.tete, mTete],
      [G.oreilles, mPeau],
      [G.bas, M(bas || BAS[(Math.random() * BAS.length) | 0])],
      [G.pieds, M('#1a1a1e', .55)],
      [G.cheveux, M('#141014', .95)],
    ];
    this.meshes = pieces.map(([g, m]) => {
      const s = new THREE.SkinnedMesh(g, m);
      s.castShadow = true;
      s.frustumCulled = false;
      this.root.add(s);
      return s;
    });

    /* L'ORDRE EST LA CLÉ. Le squelette calcule ses matrices inverses à partir
       des matrices monde des os, et chaque maillage retient la sienne au moment
       où on le lie. Si l'on crée le squelette avant que ces matrices soient à
       jour, elles valent l'identité : l'échelle du personnage s'applique alors
       une deuxième fois au rendu, et on obtient un géant de quatre mètres.
       Donc : échelle, hiérarchie, mise à jour des matrices, PUIS liaison. */
    this.root.updateMatrixWorld(true);
    const sk = new THREE.Skeleton(sq.os);
    this.meshes.forEach((m) => m.bind(sk, m.matrixWorld));

    // téléphone dans la main droite
    this.tel = new THREE.Group();
    const ecran = new THREE.Mesh(new THREE.PlaneGeometry(.025, .053),
      new THREE.MeshBasicMaterial({ color: '#8fdcff' }));
    ecran.position.z = .004;                 // position est en lecture seule sur Object3D
    this.tel.add(new THREE.Mesh(new THREE.BoxGeometry(.030, .062, .005), M('#0c0c10', .45)), ecran);
    this.tel.position.set(0, -.046, .022);
    this.tel.rotation.x = -.55;
    this.tel.visible = false;
    this.os.mainD.add(this.tel);

    if (sac) {
      const s = new THREE.Mesh(new THREE.BoxGeometry(.13, .17, .07), M('#c98a2e', .9));
      s.position.set(0, -.10, 0); s.castShadow = true;
      this.os.mainG.add(s);
    }

    this.phase = Math.random() * 6.28;
    this.vitesse = 0;
    this.chemin = [];
    this.telLeve = 0; this.telViser = 0;
    this.regard = null;
  }

  get position() { return this.root.position; }

  aller(points, v = 1.35) {
    this.chemin = points.map((p) => new THREE.Vector3(p.x, 0, p.z));
    this.vitesse = v;
  }
  stop() { this.chemin = []; this.vitesse = 0; }
  get arrive() { return this.chemin.length === 0; }
  sortirTel(v = true) { this.telViser = v ? 1 : 0; }

  update(dt) {
    const o = this.os;
    let marche = 0;

    if (this.chemin.length) {
      const c = this.chemin[0];
      const d = c.clone().sub(this.root.position); d.y = 0;
      const dist = d.length();
      if (dist < .12) this.chemin.shift();
      else {
        this.root.position.addScaledVector(d.clone().normalize(), Math.min(dist, this.vitesse * dt));
        const cap = Math.atan2(d.x, d.z);
        let dr = cap - this.root.rotation.y;
        while (dr > Math.PI) dr -= Math.PI * 2;
        while (dr < -Math.PI) dr += Math.PI * 2;
        this.root.rotation.y += dr * Math.min(1, dt * 7);
        marche = 1;
      }
    }

    // cadence liée à la vitesse : un pas de 0,72 m
    this.phase += dt * (this.vitesse / .36) * marche;
    const p = this.phase, A = marche;
    const s1 = Math.sin(p), s2 = Math.sin(p + Math.PI);

    // hanches et genoux
    o.cuisseG.rotation.x = s1 * .44 * A;
    o.cuisseD.rotation.x = s2 * .44 * A;
    const flex = (a) => Math.max(0, -Math.sin(a + 1.0)) * .95 * A;
    o.jambeG.rotation.x = -flex(p);
    o.jambeD.rotation.x = -flex(p + Math.PI);
    o.piedG.rotation.x = flex(p) * .55 - s1 * .17 * A;
    o.piedD.rotation.x = flex(p + Math.PI) * .55 - s2 * .17 * A;
    // écartement naturel des cuisses
    o.cuisseG.rotation.z = .035; o.cuisseD.rotation.z = -.035;

    // bassin, dos
    o.hanches.position.y = P.hanche + (marche ? Math.abs(Math.sin(p)) * .013 : 0);
    o.hanches.rotation.z = s1 * .045 * A;
    o.hanches.rotation.y = -s1 * .07 * A;
    o.dorsales.rotation.y = s1 * .10 * A;
    o.dorsales.rotation.x = .045 + (marche ? .02 : 0);
    o.lombaires.rotation.x = .02;

    // bras
    o.brasG.rotation.x = s2 * .34 * A;
    o.brasG.rotation.z = .155;
    o.avantBrasG.rotation.x = -Math.max(0, s2) * .42 * A - .18;
    if (this.telLeve < .02) {
      o.brasD.rotation.x = s1 * .34 * A;
      o.brasD.rotation.z = -.155;
      o.avantBrasD.rotation.x = -Math.max(0, s1) * .42 * A - .18;
    }

    // téléphone porté devant le visage
    this.telLeve += (this.telViser - this.telLeve) * Math.min(1, dt * 6);
    const t = this.telLeve;
    if (t > .02) {
      o.brasD.rotation.x = THREE.MathUtils.lerp(s1 * .34 * A, -.72, t);
      o.brasD.rotation.z = THREE.MathUtils.lerp(-.155, -.34, t);
      o.avantBrasD.rotation.x = THREE.MathUtils.lerp(-.18, -1.42, t);
      o.mainD.rotation.z = THREE.MathUtils.lerp(0, .3, t);
      this.tel.visible = true;
      o.cou.rotation.x = THREE.MathUtils.lerp(0, .30, t);
      o.tete.rotation.x = THREE.MathUtils.lerp(0, .14, t);
    } else {
      this.tel.visible = false;
      o.cou.rotation.x *= .85; o.tete.rotation.x *= .85;
    }

    // respiration légère à l'arrêt
    if (!marche) {
      const b = Math.sin(performance.now() / 1400) * .012;
      o.dorsales.rotation.x = .045 + b;
    }

    // regard
    if (this.regard) {
      const d = this.regard.clone().sub(this.root.position);
      const cap = Math.atan2(d.x, d.z);
      let dr = cap - this.root.rotation.y;
      while (dr > Math.PI) dr -= Math.PI * 2;
      while (dr < -Math.PI) dr += Math.PI * 2;
      o.cou.rotation.y = THREE.MathUtils.clamp(dr, -.9, .9) * .45;
      o.tete.rotation.y = THREE.MathUtils.clamp(dr, -.9, .9) * .30;
    }
  }
}
