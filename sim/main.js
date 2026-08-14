import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
import * as T from './textures.js';
import { construire, BOUTIQUES, posBoutique, devant, comptoir, ALLEE, halo, faisceau } from './world.js';
import { Personne, Foule } from './people.js';
import { Phone } from './phone.js';

const $ = (id) => document.getElementById(id);

/* ══════════════════════════════════════════════════════════════════════════
   MOTEUR
   ══════════════════════════════════════════════════════════════════════════ */
const cv = $('scene');
const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(2, devicePixelRatio));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.52;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = T.sky();
scene.environment = scene.background;
scene.fog = new THREE.Fog(0xc8b79c, 42, 135);

const cam = new THREE.PerspectiveCamera(42, 16 / 9, .1, 400);
cam.position.set(-30, 26, 38);
cam.lookAt(8, 2.5, 0);

/* ── lumière : un soleil rasant de fin de matinée ── */
const soleil = new THREE.DirectionalLight(0xfff0d4, 3.1);
soleil.position.set(-34, 42, 26);
soleil.castShadow = true;
soleil.shadow.mapSize.set(2048, 2048);
soleil.shadow.camera.near = 1; soleil.shadow.camera.far = 160;
const d = 46;
Object.assign(soleil.shadow.camera, { left: -d, right: d, top: d, bottom: -d });
soleil.shadow.bias = -0.0006;
soleil.shadow.normalBias = 0.02;
scene.add(soleil, soleil.target);

scene.add(new THREE.HemisphereLight(0xd6e8f8, 0xa08a63, 1.85));
const appoint = new THREE.DirectionalLight(0xcfe0f5, .95);
appoint.position.set(26, 14, -34);
scene.add(appoint);

const remplissage = new THREE.PointLight(0xffe8c8, 14, 26, 2);
scene.add(remplissage);

construire(scene, renderer);

/* ── post-traitement : un léger bloom sur les hautes lumières ── */
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, cam));
const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), .26, .75, .92);
composer.addPass(bloom);
let smaa = null;

function resize() {
  const w = cv.clientWidth, h = cv.clientHeight;
  renderer.setSize(w, h, false);
  composer.setSize(w, h);
  bloom.resolution.set(w, h);
  if (!smaa) { smaa = new SMAAPass(w, h); composer.addPass(smaa); }
  else smaa.setSize(w, h);
  cam.aspect = w / h; cam.updateProjectionMatrix();
}
addEventListener('resize', resize);

/* ══════════════════════════════════════════════════════════════════════════
   CAMÉRA CINÉMATIQUE
   Un plan = une position, un point visé, une focale. On interpole entre les
   deux avec une courbe douce : c'est ce qui donne le mouvement d'appareil
   plutôt qu'un saut.
   ══════════════════════════════════════════════════════════════════════════ */
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const shot = {
  from: V(0, 22, 40), to: V(0, 3, 0), fov: 42,
  nfrom: V(0, 22, 40), nto: V(0, 3, 0), nfov: 42,
  t: 1, dur: 1, secousse: 0,
};
function plan(from, to, fov = 42, dur = 2.2) {
  shot.from = cam.position.clone();
  shot.to = shot.nto.clone();
  shot.fov = cam.fov;
  shot.nfrom = from; shot.nto = to; shot.nfov = fov;
  shot.t = 0; shot.dur = dur;
}
const doux = (t) => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

function majCam(dt) {
  shot.t = Math.min(1, shot.t + dt / shot.dur);
  const e = doux(shot.t);
  cam.position.lerpVectors(shot.from, shot.nfrom, e);
  shot.to.lerp(shot.nto, Math.min(1, dt * 4));
  const cible = shot.to.clone();
  if (shot.suivre) cible.copy(shot.suivre.root.position).add(V(0, 1.1, 0));
  if (shot.colle) {
    const p = shot.colle.root.position;
    cam.position.set(p.x + shot.colle_off.x, p.y + shot.colle_off.y, p.z + shot.colle_off.z);
  }
  cam.lookAt(cible);
  if (shot.secousse > 0) {
    cam.position.x += (Math.random() - .5) * shot.secousse;
    cam.position.y += (Math.random() - .5) * shot.secousse;
    shot.secousse *= .90;
  }
  const f = THREE.MathUtils.lerp(shot.fov, shot.nfov, e);
  if (Math.abs(cam.fov - f) > .01) { cam.fov = f; cam.updateProjectionMatrix(); }
}

/* ══════════════════════════════════════════════════════════════════════════
   PERSONNAGES
   ══════════════════════════════════════════════════════════════════════════ */
const B = Object.fromEntries(BOUTIQUES.map((b) => [b.n, b]));
const MOI = B['Boutique Essomba'];
const DEST = B['Second Life'];

// vendeurs derrière chaque comptoir
const vendeurs = BOUTIQUES.map((b) => {
  const p = new Personne({ taille: 1.68 + Math.random() * .12 });
  const q = posBoutique(b);
  p.root.position.set(q.x + (Math.random() - .5) * 1.6, 0, q.z - b.cote * 1.35);
  p.root.rotation.y = b.cote > 0 ? Math.PI : 0;
  scene.add(p.root);
  b.vendeur = p;
  return p;
});

const client = new Personne({ taille: 1.79, haut: '#1e3a8a', bas: '#20242c', peau: '#7a4a1e' });
scene.add(client.root);
const rabatteur = new Personne({ taille: 1.74, haut: '#7f1d1d', bas: '#2b2b33' });
scene.add(rabatteur.root);
rabatteur.root.position.set(12, 0, -1.4);

const foule = new Foule(scene, 16, -14, 90, 0.4);

/* halos et faisceau */
const halos = {};
['Étoile du Sud', 'Second Life', 'Élégance Bonapriso'].forEach((n) => {
  const h = halo(0x3ddc97);
  const p = posBoutique(B[n]);
  h.position.set(p.x, .04, p.z + (B[n].cote > 0 ? -2.2 : 2.2));
  scene.add(h); halos[n] = h;
});
const fx = faisceau(0x8b5cf6);
{
  const p = posBoutique(DEST);
  fx.position.set(p.x, 4.5, p.z + (DEST.cote > 0 ? -2.2 : 2.2));
  scene.add(fx);
}

/* le chemin au sol que suit le client */
const traceGeo = new THREE.BufferGeometry();
const trace = new THREE.Line(traceGeo, new THREE.LineBasicMaterial({
  color: 0x8b5cf6, transparent: true, opacity: 0,
}));
scene.add(trace);
function poserTrace(a, b) {
  const pts = [];
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    pts.push(V(THREE.MathUtils.lerp(a.x, b.x, t), .08, THREE.MathUtils.lerp(a.z, b.z, t)));
  }
  traceGeo.setFromPoints(pts);
}

/* ══════════════════════════════════════════════════════════════════════════
   INTERFACE
   ══════════════════════════════════════════════════════════════════════════ */
const phone = new Phone();
const hud = {
  jour: $('hJour'), serv: $('hServ'), env: $('hEnv'), rec: $('hRec'),
  gain: $('hGain'), perd: $('hPerd'),
  vis: $('bVis'), ret: $('bRet'), ven: $('bVen'), gmv: $('bGmv'),
};
const S = { jour: 1, serv: 0, env: 0, rec: 0, gain: 0, perd: 0 };
const BU = { vis: 0, ret: 0, ven: 0, gmv: 0 };
const fr = (n) => n.toLocaleString('fr-FR').replace(/[  ]/g, ' ');
function majHud() {
  hud.jour.textContent = S.jour; hud.serv.textContent = S.serv;
  hud.env.textContent = S.env; hud.rec.textContent = S.rec;
  hud.gain.textContent = fr(S.gain) + ' F'; hud.perd.textContent = S.perd;
  hud.vis.textContent = fr(BU.vis); hud.ret.textContent = fr(BU.ret);
  hud.ven.textContent = fr(BU.ven);
  hud.gmv.textContent = BU.gmv >= 1e6 ? (BU.gmv / 1e6).toFixed(1).replace('.', ',') + ' M' : fr(BU.gmv) + ' F';
}
function narr(k, t, s) { $('nKick').textContent = k; $('nTitre').textContent = t; $('nSous').textContent = s || ''; }

/* bulles de dialogue ancrées sur un personnage */
const bulles = [];
function dire(pers, texte, duree = 3, ton = '') {
  const el = document.createElement('div');
  el.className = 'bulle ' + ton;
  el.textContent = texte;
  $('bulles').appendChild(el);
  bulles.push({ el, pers, t: duree, off: 1.05 * pers.k });
  requestAnimationFrame(() => el.classList.add('in'));
}
function majBulles(dt) {
  for (let i = bulles.length - 1; i >= 0; i--) {
    const b = bulles[i];
    b.t -= dt;
    if (b.t <= 0) { b.el.remove(); bulles.splice(i, 1); continue; }
    const p = b.pers.root.position.clone().add(V(0, b.pers.taille + .34, 0));
    p.project(cam);
    if (p.z > 1) { b.el.style.opacity = 0; continue; }
    const w = cv.clientWidth, h = cv.clientHeight;
    b.el.style.left = `${(p.x * .5 + .5) * w}px`;
    b.el.style.top = `${(-p.y * .5 + .5) * h}px`;
    b.el.style.opacity = b.t < .4 ? b.t / .4 : 1;
  }
}

/* ══════════════════════════════════════════════════════════════════════════
   LE SCÉNARIO
   ══════════════════════════════════════════════════════════════════════════ */
const pMoi = posBoutique(MOI), dMoi = devant(MOI), cMoi = comptoir(MOI);
const pDest = posBoutique(DEST), dDest = devant(DEST), cDest = comptoir(DEST);
const ALX = 1.0;   // la ligne de circulation dans l'allée

let SC = [];
function batir() {
  client.root.position.set(pMoi.x - 16, 0, ALX);
  client.stop(); client.sortirTel(false); client.sac = null;
  rabatteur.root.position.set(11.8, 0, -1.5);
  rabatteur.root.rotation.y = -1.9;
  trace.material.opacity = 0;
  fx.material.opacity = 0;
  Object.values(halos).forEach((h) => (h.material.opacity = 0));
  phone.cacher();
  Object.assign(S, { jour: 1, serv: 0, env: 0, rec: 0, gain: 0, perd: 0 });
  Object.assign(BU, { vis: 0, ret: 0, ven: 0, gmv: 0 });
  $('buy').classList.remove('on');
  majHud();

  SC = [
  /* 1 ─ plan d'ensemble, descente sur le marché */
  { d: 8, go() {
      plan(V(pMoi.x - 22, 30, 46), V(pMoi.x + 16, 2.0, 0), 44, 7.6);
      narr('Le marché', 'Marché Mboppi, un lundi matin.',
           'Quatorze boutiques de chaussures de part et d’autre d’une seule allée.');
    } },

  /* 2 ─ on descend dans l'allée */
  { d: 7, go() {
      plan(V(pMoi.x + 34, 2.5, ALX), V(pMoi.x - 6, 2.1, ALX), 42, 6.6);
      narr('L’allée', 'Tout le monde se connaît de vue.',
           'Et personne ne sait ce que le voisin a en stock ce matin.');
    } },

  /* 3 ─ ta boutique */
  { d: 6, go() {
      plan(V(pMoi.x + 9.5, 3.0, -2.2), V(pMoi.x, 2.3, cMoi.z), 40, 5.4);
      narr('Ta boutique', 'Boutique Essomba.',
           'Du passage toute la journée. Mais le stock a des trous.');
    } },

  /* 4 ─ un client qu'on sert */
  { d: 9, go() {
      client.root.position.set(pMoi.x - 14, 0, ALX);
      client.aller([{ x: dMoi.x, z: ALX }, { x: dMoi.x, z: dMoi.z }], 1.5);
      plan(V(pMoi.x + 6.2, 1.95, -0.8), V(pMoi.x + 0.4, 1.55, 4.8), 38, 5);
      narr('Un client entre', 'Celui-là, tu peux le servir.', '');
    },
    up(t) {
      if (t > 4.4 && !this._a) { this._a = 1; dire(client, 'Les Puma Suede bleues en 43 ?', 3.2); }
      if (t > 7.0 && !this._b) { this._b = 1; dire(MOI.vendeur, 'Oui, j’ai le 43.', 2.6, 'v');
        S.serv++; majHud(); }
    } },

  /* 5 ─ celui qu'on perd */
  { d: 9, go() {
      client.root.position.set(pMoi.x - 12, 0, ALX);
      client.aller([{ x: dMoi.x, z: ALX }, { x: dMoi.x, z: dMoi.z }], 1.6);
      plan(V(pMoi.x + 4.2, 1.80, 0.6), V(pMoi.x + 0.2, 1.60, 4.9), 34, 4.4);
      narr('Celui-là, non', '« Je n’ai pas ta pointure. »',
           'Six fois par jour. Six fois zéro franc.');
    },
    up(t) {
      if (t > 3.6 && !this._a) { this._a = 1; dire(client, 'Timberland, pointure 45.', 3); }
      if (t > 6.4 && !this._b) { this._b = 1; dire(MOI.vendeur, 'Je n’ai plus le 45.', 2.8, 'v'); }
    } },

  /* 6 ─ le rabatteur */
  { d: 10, go() {
      client.aller([{ x: dMoi.x, z: ALX }, { x: 11.5, z: ALX - .3 }], 1.35);
      plan(V(7, 2.2, -6.5), V(10, 1.6, ALX), 42, 5);
      shot.suivre = client;
      narr('Dehors, on l’attend', 'Il n’a pas fait dix mètres.', '');
    },
    up(t) {
      if (t > 4.6 && !this._a) { this._a = 1;
        dire(rabatteur, 'Mon frère ! Tu cherches quoi ? J’ai ça en bas !', 3.6, 'r'); }
      if (t > 7.6 && !this._b) { this._b = 1;
        client.aller([{ x: 14, z: -26 }], 1.6);
        S.perd++; majHud(); }
    },
    out() { shot.suivre = null; } },

  /* 7 ─ le même client, mais avec Buyticle */
  { d: 8, go() {
      client.root.position.set(pMoi.x - 12, 0, ALX);
      client.aller([{ x: dMoi.x, z: ALX }, { x: dMoi.x, z: dMoi.z }], 1.6);
      plan(V(pMoi.x + 4.2, 1.80, 0.6), V(pMoi.x + 0.2, 1.60, 4.9), 34, 4.2);
      narr('Le même client', 'Cette fois, tu ne le laisses pas partir.', '');
    },
    up(t) {
      if (t > 3.4 && !this._a) { this._a = 1; dire(client, 'Timberland 45, vous avez ?', 3); }
      if (t > 6.0 && !this._b) { this._b = 1; dire(MOI.vendeur, 'Attends, je regarde.', 2.4, 'v'); }
    } },

  /* 8 ─ le commerçant sort son téléphone */
  { d: 7, go() {
      MOI.vendeur.sortirTel(true);
      plan(V(pMoi.x + 2.1, 1.78, 2.5), V(pMoi.x - .1, 1.58, 4.65), 30, 3.4);
      phone.vendeur('demande');
      narr('Il sort son téléphone', 'Il tape ce que le client cherche.',
           'Aucun stock à tenir : il demande, on lui répond.');
    } },

  /* 9 ─ l'appel à disponibilité */
  { d: 11, go() {
      phone.vendeur('appel', { sec: 30 });
      plan(V(pMoi.x + 8, 12, -12), V(pMoi.x + 15, 2, 0), 46, 4.2);
      narr('On demande à toute l’allée', 'Trente secondes pour répondre.',
           'Celles qui ont la pointure 45 se signalent.');
    },
    up(t) {
      const rep = [
        [2.6, 'Étoile du Sud', '3 paires'],
        [5.0, 'Second Life', '2 paires'],
        [7.4, 'Élégance Bonapriso', '2 paires'],
      ];
      rep.forEach(([at, nom, st], i) => {
        if (t > at && !this['_r' + i]) {
          this['_r' + i] = 1;
          phone.vendeur('repond', { nom, stock: st });
          halos[nom].material.opacity = .01;
        }
      });
      Object.values(halos).forEach((h) => {
        if (h.material.opacity > 0) h.material.opacity = Math.min(.55, h.material.opacity + dt * .9);
      });
    } },

  /* 10 ─ l'arbitrage */
  { d: 11, go() {
      phone.vendeur('choix', { cands: [
        { nom: 'Étoile du Sud', r: 5, e: 3 },
        { nom: 'Élégance Bonapriso', r: 4, e: 4 },
        { nom: 'Second Life', r: 2, e: 7, win: true },
      ] });
      plan(V(pDest.x + 5, 6.5, -9), V(pDest.x, 2.6, cDest.z), 42, 4.6);
      narr('Laquelle ?', 'Celle qui a le plus donné aux autres.',
           'Second Life a reçu 2 clients pour 7 envoyés. Le client est pour elle.');
    },
    up(t) {
      if (t > 3.2) fx.material.opacity = Math.min(.16, fx.material.opacity + dt * .12);
      if (t > 3.2) {
        halos['Étoile du Sud'].material.opacity *= .93;
        halos['Élégance Bonapriso'].material.opacity *= .93;
      }
    } },

  /* 11 ─ le client prend son téléphone */
  { d: 8, go() {
      MOI.vendeur.sortirTel(false);
      client.sortirTel(true);
      phone.vendeur('envoye', { nom: 'Second Life', m: 130 });
      plan(V(pMoi.x + 3.0, 1.72, 1.4), V(pMoi.x + 0.1, 1.52, 4.5), 32, 3.6);
      narr('Le client prend le sien', 'Il reçoit le chemin et sa remise.',
           'Second Life, à 130 mètres. Un bon de 3 %, valable 48 heures, et seulement là-bas.');
      poserTrace(dMoi, dDest);
    },
    up(t) {
      if (t > 3) trace.material.opacity = Math.min(.85, trace.material.opacity + dt * .8);
      if (t > 4 && !this._p) { this._p = 1;
        phone.client('route', { nom: 'Second Life', m: 130, code: 'BT-4471' }); }
    } },

  /* 12 ─ il marche, la caméra le suit */
  { d: 16, go() {
      client.aller([{ x: dMoi.x, z: ALX }, { x: dDest.x, z: ALX },
                    { x: dDest.x, z: dDest.z }], 1.42);
      shot.colle = client; shot.colle_off = V(-5.0, 2.25, -2.4);
      rabatteur.regard = client.root.position;
      shot.suivre = client;
      narr('Il y va', 'Et le rabatteur est toujours là.',
           'Regarde ce qui se passe cette fois.');
    },
    up(t) {
      const total = Math.abs(dDest.x - dMoi.x);
      const fait = Math.abs(client.root.position.x - dMoi.x);
      const pct = Math.max(0, Math.min(100, (fait / total) * 100));
      phone.client('avance', {
        m: Math.max(0, Math.round(130 * (1 - pct / 100))),
        pct,
        txt: pct > 74 ? 'C’est la boutique à ta droite' : 'Continue tout droit dans l’allée',
      });
      if (client.root.position.x > 9 && client.root.position.x < 14 && !this._c) {
        this._c = 1; dire(rabatteur, 'Chef ! J’ai la même chose !', 3.2, 'r');
      }
      if (t > 8.4 && !this._d) { this._d = 1;
        dire(client, 'Non, j’ai déjà mon bon. Il ne marche que là-bas.', 3.8); }
    },
    out() { shot.colle = null; shot.suivre = null; } },

  /* 13 ─ l'arrivée */
  { d: 10, go() {
      phone.client('arrive', { nom: 'Second Life', code: 'BT-4471' });
      plan(V(pDest.x + 5.0, 1.95, -0.6), V(pDest.x + 0.2, 1.60, 4.9), 36, 4.2);
      narr('Il arrive', 'Il montre son code. La vente se fait.',
           '48 000 F de Timberland, pointure 45.');
    },
    up(t) {
      if (t > 3.2 && !this._a) { this._a = 1; dire(client, 'Je viens de chez Essomba.', 3); }
      if (t > 6 && !this._b) { this._b = 1;
        dire(DEST.vendeur, 'Je te les fais à 46 560.', 3, 'v');
        client.sortirTel(false);
        S.env++; S.gain += 3360; BU.vis++; BU.ven++; BU.gmv += 48000;
        $('buy').classList.add('on');
        majHud(); shot.secousse = .06; }
    } },

  /* 14 ─ ce que ça te fait */
  { d: 9, go() {
      phone.cacher();
      trace.material.opacity = 0; fx.material.opacity = 0;
      Object.values(halos).forEach((h) => (h.material.opacity = 0));
      plan(V(pMoi.x + 8, 2.8, -3.0), V(pMoi.x, 2.1, cMoi.z), 40, 4.6);
      narr('Et toi ?', 'Tu n’as rien vendu, et tu as gagné 3 360 francs.',
           'Sur 48 000 : 3 360 F pour toi, 1 440 F de remise au client, 1 440 F pour Buyticle.');
    },
    up(t) {
      if (t > 5 && !this._a) { this._a = 1;
        narr('Ton vendeur aussi', 'Le petit au comptoir touche 500 F ce soir.',
             'C’est toi qui fixes la prime et c’est toi qui la donnes, en billets.'); }
    } },

  /* 15 ─ le mois défile */
  { d: 30, go() {
      plan(V(pMoi.x - 6, 17, -30), V(pMoi.x + 20, 2, 0), 48, 8);
      narr('Le mois passe', 'Vingt-six jours. Chacun envoie, chacun reçoit.',
           'Personne n’a changé sa boutique.');
      this.j = 1;
    },
    up(t) {
      const j = Math.min(26, 1 + Math.floor(t / 1.05));
      if (j !== S.jour) {
        S.jour = j;
        if (j % 2 === 0) { S.env++; S.gain += 1508; }
        if (j % 2 === 1) S.rec++;
        if (j % 6 === 0) S.perd++;
        S.serv += 2;
        const k = j / 26;
        BU.vis = Math.round(246 * k); BU.ret = Math.round(40 * Math.max(0, k - .35) / .65);
        BU.ven = Math.round(281 * k); BU.gmv = Math.round(6445000 * k);
        majHud();
      }
      if (t > 24 && !this._f) { this._f = 1;
        narr('Fin du mois', '259 clients ont changé de boutique sans quitter le marché.',
             '5 940 600 F de marchandise vendue, et 246 personnes qui découvrent Buyticle.'); }
    } },

  /* 16 ─ carte de fin */
  { d: 8, go() {
      $('fin').classList.add('on');
      plan(V(pMoi.x + 12, 27, 44), V(pMoi.x + 16, 2, 0), 46, 7);
      narr('Résultat', 'Toi, lundi matin. Toi, trente jours après.', '');
    } },
  ];
}

/* ══════════════════════════════════════════════════════════════════════════
   LECTURE
   ══════════════════════════════════════════════════════════════════════════ */
let idx = 0, tIn = 0, joue = true, vit = 1, dernier = performance.now(), dt = 0;
const TOTAL = () => SC.reduce((a, s) => a + s.d, 0);
const ecoule = () => SC.slice(0, idx).reduce((a, s) => a + s.d, 0) + tIn;
const mmss = (s) => { s = Math.max(0, Math.round(s)); return `${(s / 60) | 0}:${String(s % 60).padStart(2, '0')}`; };

function entrer(i) {
  if (SC[idx] && SC[idx].out) SC[idx].out();
  idx = i; tIn = 0;
  $('fin').classList.remove('on');
  const s = SC[i];
  for (const k in s) if (k[0] === '_') delete s[k];
  if (s.go) s.go();
}
function sauter(i) {
  batir();
  for (let k = 0; k < i; k++) {
    const s = SC[k];
    for (const key in s) if (key[0] === '_') delete s[key];
    if (s.go) s.go();
    let t = 0;
    while (t < s.d) {
      t += 1 / 20; dt = 1 / 20;
      if (s.up) try { s.up.call(s, t, 1 / 20); } catch (e) { /* saut rapide */ }
      client.update(1 / 20); rabatteur.update(1 / 20);
      vendeurs.forEach((v) => v.update(1 / 20));
    }
    if (s.out) s.out();
  }
  shot.t = 1; cam.position.copy(shot.nfrom); shot.to.copy(shot.nto);
  bulles.splice(0).forEach((b) => b.el.remove());
  entrer(i);
}

function boucle(now) {
  dt = Math.min(.05, (now - dernier) / 1000); dernier = now;
  const d2 = joue ? dt * vit : 0;

  if (joue) {
    tIn += d2;
    const s = SC[idx];
    if (s && s.up) try { s.up.call(s, tIn, d2); } catch (e) { console.error(e); }
    if (s && tIn >= s.d) {
      if (idx < SC.length - 1) entrer(idx + 1);
      else { joue = false; $('bJouer').textContent = 'Rejouer'; $('bJouer').classList.remove('on'); }
    }
  }

  client.update(d2); rabatteur.update(d2);
  vendeurs.forEach((v) => v.update(d2));
  foule.update(d2);
  if (!window.__fige) majCam(dt);
  majBulles(dt);

  remplissage.position.copy(cam.position).add(V(0, 1.4, 0));
  soleil.target.position.set(cam.position.x, 0, 0);
  soleil.position.set(cam.position.x - 34, 42, 26);

  composer.render();

  const e = ecoule(), T2 = TOTAL();
  $('barIn').style.width = `${Math.min(100, (e / T2) * 100)}%`;
  $('horloge').textContent = `${mmss(e)} / ${mmss(T2)}`;
  requestAnimationFrame(boucle);
}

/* ── commandes ── */
$('bJouer').onclick = () => {
  if (idx === SC.length - 1 && !joue) { sauter(0); joue = true; }
  else joue = !joue;
  $('bJouer').textContent = joue ? 'Pause' : 'Reprendre';
  $('bJouer').classList.toggle('on', joue);
};
$('bSuiv').onclick = () => idx < SC.length - 1 && sauter(idx + 1);
$('bPrec').onclick = () => idx > 0 && sauter(idx - 1);
$('bRe').onclick = () => { sauter(0); joue = true;
  $('bJouer').textContent = 'Pause'; $('bJouer').classList.add('on'); };
$('bVit').onclick = () => { vit = vit === 1 ? 2 : vit === 2 ? 4 : 1; $('bVit').textContent = 'Vitesse ×' + vit; };

window.__saut = (i) => sauter(i);
window.__cam = () => cam;
window.__client = () => client;
window.__fige = false;
window.__etat = () => ({ i: idx, n: SC.length });

resize();
batir();
entrer(0);
$('charge').classList.add('off');
requestAnimationFrame(boucle);
