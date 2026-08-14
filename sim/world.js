import * as THREE from 'three';
import * as T from './textures.js';

/* ══════════════════════════════════════════════════════════════════════════
   LE MARCHÉ
   Quatorze échoppes de part et d'autre d'une allée de six mètres. Chaque
   échoppe est un vrai volume : murs, toit de tôle, auvent de bâche, comptoir,
   marchandise, enseigne peinte. Derrière, une ligne de bâtiments hauts pour
   fermer l'horizon — sans elle on voit le vide et l'illusion tombe.
   ══════════════════════════════════════════════════════════════════════════ */

export const BOUTIQUES = [
  { n: 'Étoile du Sud',       cote: -1, i: 0 },
  { n: 'Maison Ngando',       cote: -1, i: 1 },
  { n: 'Sneaker Palace',      cote: -1, i: 2 },
  { n: 'Kicks Douala',        cote: -1, i: 3 },
  { n: 'Fitness Corner',      cote: -1, i: 4 },
  { n: 'Maillots 237',        cote: -1, i: 5 },
  { n: 'Cordonnerie Moderne', cote: -1, i: 6 },
  { n: 'Boutique Essomba',    cote:  1, i: 0, moi: true },
  { n: 'Tati Sport',          cote:  1, i: 1 },
  { n: 'Petits Pas',          cote:  1, i: 2 },
  { n: 'Chez Mama Rose',      cote:  1, i: 3 },
  { n: 'Second Life',         cote:  1, i: 4 },
  { n: 'Élégance Bonapriso',  cote:  1, i: 5 },
  { n: 'Sandales du Wouri',   cote:  1, i: 6 },
];

export const PAS = 7.2;        // entre deux échoppes
export const ALLEE = 3.4;      // demi-largeur de l'allée
export const X0 = -4;

export const posBoutique = (b) => ({ x: X0 + b.i * PAS, z: b.cote * (ALLEE + 2.6) });
export const devant   = (b) => ({ x: X0 + b.i * PAS, z: b.cote * 4.30 });   // au comptoir
export const comptoir = (b) => ({ x: X0 + b.i * PAS, z: b.cote * 5.45 });   // le plan de vente
export const enAllee  = (b, dz = 0) => ({ x: X0 + b.i * PAS, z: b.cote * (1.1 + dz) });

const MURS = ['#d3c6ad', '#c8b79a', '#bfae96', '#d8cdb4', '#c2b49c', '#cdbda2', '#b9a98e'];
const TOLES = ['#8d9298', '#7f858c', '#98999a', '#868d94'];
const BACHES = ['#1f7f96', '#1a6f86', '#256f8e', '#1b8090', '#2a6d80'];

export function construire(scene, renderer) {
  const G = new THREE.Group();
  const cache = {};
  const M = (f, ...a) => {
    const k = f + a.join('|');
    return (cache[k] ||= T[f](...a));
  };

  /* ── sol ── */
  const solT = M('ground');
  const sol = new THREE.Mesh(
    new THREE.PlaneGeometry(220, 160),
    new THREE.MeshStandardMaterial({ ...solT, roughness: 1, metalness: 0 })
  );
  sol.rotation.x = -Math.PI / 2;
  sol.receiveShadow = true;
  G.add(sol);

  /* ── une échoppe ── */
  const echoppe = (b) => {
    const g = new THREE.Group();
    const p = posBoutique(b);
    g.position.set(p.x, 0, p.z);
    g.rotation.y = b.cote > 0 ? Math.PI : 0;   // la façade regarde l'allée

    const L = 6.0, P = 4.6, H = 3.9;
    const murT = M('plaster', MURS[b.i % MURS.length], .4 + (b.i % 3) * .3);
    const murM = new THREE.MeshStandardMaterial({ ...murT, roughness: .95, metalness: 0 });

    // corps du bâtiment
    const corps = new THREE.Mesh(new THREE.BoxGeometry(L, H, P), murM);
    corps.position.set(0, H / 2, -P / 2 - 0.3);
    corps.castShadow = corps.receiveShadow = true;
    g.add(corps);

    // toit de tôle, légèrement débordant
    const toleT = M('corrugated', TOLES[b.i % TOLES.length]);
    const tole = new THREE.Mesh(
      new THREE.BoxGeometry(L + .5, .12, P + .6),
      new THREE.MeshStandardMaterial({ ...toleT, roughness: .58, metalness: .55 })
    );
    tole.position.set(0, H + .06, -P / 2 - 0.3);
    tole.rotation.x = -.045;
    tole.castShadow = true;
    g.add(tole);

    // ouverture sombre de la boutique
    const trou = new THREE.Mesh(
      new THREE.PlaneGeometry(L - 1.1, H - 1.2),
      new THREE.MeshStandardMaterial({ color: '#3a3128', roughness: 1 })
    );
    trou.position.set(0, (H - 1.2) / 2 + .15, -0.28);
    g.add(trou);

    // auvent de bâche, incliné vers l'allée
    const bacheT = M('tarp', BACHES[b.i % BACHES.length]);
    const bache = new THREE.Mesh(
      new THREE.BoxGeometry(L + .3, .05, 2.5),
      new THREE.MeshStandardMaterial({ ...bacheT, roughness: .85, metalness: 0,
        side: THREE.DoubleSide })
    );
    bache.position.set(0, 2.92, 1.05);
    bache.rotation.x = .13;
    bache.castShadow = true;
    g.add(bache);

    // poteaux
    const boisT = M('wood');
    const boisM = new THREE.MeshStandardMaterial({ ...boisT, roughness: .92 });
    for (const dx of [-L / 2 - .05, L / 2 + .05]) {
      const po = new THREE.Mesh(new THREE.CylinderGeometry(.055, .07, 2.75, 8), boisM);
      po.position.set(dx, 1.38, 2.1);
      po.castShadow = true;
      g.add(po);
    }

    // comptoir
    const cpt = new THREE.Mesh(new THREE.BoxGeometry(L - .6, .95, 1.0), boisM);
    cpt.position.set(0, .48, .55);
    cpt.castShadow = cpt.receiveShadow = true;
    g.add(cpt);

    // marchandise : boîtes à chaussures empilées
    const cols = ['#c2410c', '#b91c1c', '#155e75', '#4d7c0f', '#7c3aed', '#0f766e'];
    for (let i = 0; i < 9; i++) {
      const bx = new THREE.Mesh(
        new THREE.BoxGeometry(.34, .17, .24),
        new THREE.MeshStandardMaterial({ color: cols[(i + b.i) % cols.length], roughness: .85 })
      );
      bx.position.set(-L / 2 + .8 + (i % 5) * .95, .95 + .175 + Math.floor(i / 5) * .18,
                      .5 + ((i % 2) - .5) * .18);
      bx.rotation.y = (Math.random() - .5) * .3;
      bx.castShadow = true;
      g.add(bx);
    }
    // quelques paires posées debout
    for (let i = 0; i < 4; i++) {
      const ch = new THREE.Mesh(
        new THREE.BoxGeometry(.11, .09, .27),
        new THREE.MeshStandardMaterial({ color: cols[(i * 2) % cols.length], roughness: .7 })
      );
      ch.position.set(-1.6 + i * 1.05, 1.0, .12);
      ch.rotation.y = .4 + Math.random() * .5;
      ch.castShadow = true;
      g.add(ch);
    }

    // enseigne
    const ens = new THREE.Mesh(
      new THREE.PlaneGeometry(L - .4, (L - .4) * 224 / 1024),
      new THREE.MeshStandardMaterial({ map: M('sign', b.n), roughness: .78 })
    );
    ens.position.set(0, 3.28, .30);
    g.add(ens);
    const cadre = new THREE.Mesh(
      new THREE.BoxGeometry(L - .3, (L - .4) * 224 / 1024 + .12, .07),
      new THREE.MeshStandardMaterial({ color: '#0d2029', roughness: .8 })
    );
    cadre.position.set(0, 3.28, .25);
    cadre.castShadow = true;
    g.add(cadre);

    // caisses au sol
    for (let i = 0; i < 2; i++) {
      const ca = new THREE.Mesh(new THREE.BoxGeometry(.62, .44, .5), boisM);
      ca.position.set(-L / 2 + .5 + i * (L - 1.2), .22, 1.5);
      ca.rotation.y = Math.random() * .6;
      ca.castShadow = ca.receiveShadow = true;
      g.add(ca);
    }

    b.groupe = g;
    b.marque = new THREE.Vector3(p.x, 0, p.z);
    G.add(g);
    return g;
  };

  BOUTIQUES.forEach(echoppe);

  /* ── immeubles de fond, pour fermer l'horizon ── */
  const fond = new THREE.Group();
  for (let i = -6; i < 16; i++) {
    for (const cote of [-1, 1]) {
      const h = 6 + Math.random() * 12;
      const w = 7 + Math.random() * 7;
      const base = M('plaster', MURS[(i + 3) % MURS.length], 1);
      const map = base.map.clone(); map.needsUpdate = true;
      map.repeat.set(w / 5, h / 5);
      const rgh = base.roughnessMap.clone(); rgh.needsUpdate = true;
      rgh.repeat.set(w / 5, h / 5);
      const m = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, 9),
        new THREE.MeshStandardMaterial({ map, roughnessMap: rgh, roughness: .97 })
      );
      m.position.set(X0 + i * 7.4 + Math.random() * 3, h / 2, cote * (32 + Math.random() * 22));
      m.castShadow = m.receiveShadow = true;
      fond.add(m);
    }
  }
  G.add(fond);

  /* ── poteaux électriques et câbles ── */
  const boisT2 = M('wood', '#4b3a28');
  const poteauM = new THREE.MeshStandardMaterial({ ...boisT2, roughness: .95 });
  const cableM = new THREE.LineBasicMaterial({ color: '#1a1a1a' });
  for (let i = 0; i < 8; i++) {
    const x = X0 - 3 + i * 7.2;
    const po = new THREE.Mesh(new THREE.CylinderGeometry(.10, .14, 7.2, 8), poteauM);
    po.position.set(x, 3.6, ALLEE + .5);
    po.castShadow = true;
    G.add(po);
    if (i) {
      const g = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x - 7.2, 6.9, ALLEE + .5),
        new THREE.Vector3(x - 3.6, 6.35, ALLEE + .5),
        new THREE.Vector3(x, 6.9, ALLEE + .5),
      ]);
      G.add(new THREE.Line(g, cableM));
    }
  }

  scene.add(G);
  return { racine: G };
}

/* Halo posé au sol sous une boutique : c'est ainsi qu'on désigne les
   boutiques qui répondent, sans écrire de texte dans la scène. */
export function halo(couleur = 0x3ddc97) {
  const g = new THREE.Mesh(
    new THREE.RingGeometry(1.5, 2.15, 48),
    new THREE.MeshBasicMaterial({ color: couleur, transparent: true, opacity: .0,
      side: THREE.DoubleSide, depthWrite: false })
  );
  g.rotation.x = -Math.PI / 2;
  g.position.y = .04;
  return g;
}

/* Faisceau vertical : la boutique choisie. */
export function faisceau(couleur = 0x7c5cff) {
  const g = new THREE.Mesh(
    new THREE.CylinderGeometry(.55, 1.5, 9, 20, 1, true),
    new THREE.MeshBasicMaterial({ color: couleur, transparent: true, opacity: 0,
      side: THREE.DoubleSide, depthWrite: false })
  );
  g.position.y = 4.5;
  return g;
}
