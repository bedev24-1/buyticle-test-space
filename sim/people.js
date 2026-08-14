import * as THREE from 'three';

/* ══════════════════════════════════════════════════════════════════════════
   LES GENS
   Un squelette réel : bassin → torse → tête, et quatre membres articulés en
   deux segments. La marche n'est pas une image qui défile, c'est une rotation
   calculée à chaque frame — hanches et genoux en opposition, épaules en
   contre-balancement, tronc qui roule un peu. C'est ce décalage entre les
   articulations qui fait qu'on lit « quelqu'un qui marche » et pas « un objet
   qui glisse ».
   ══════════════════════════════════════════════════════════════════════════ */

const PEAUX = ['#8d5524', '#7a4a1e', '#a06a35', '#6b3d16', '#95602c'];
const HAUTS = ['#2d4a7c', '#7c2d2d', '#1f5c46', '#5a3c78', '#b4651f',
               '#2b6c7a', '#8a2f52', '#3d3d46', '#c9a227', '#215e34'];
const BAS   = ['#26303f', '#3a3226', '#1e1e26', '#40332c', '#2c3b34'];

const mat = (c, r = .82) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: .02 });

function seg(l, r1, r2, m) {
  const g = new THREE.CylinderGeometry(r1, r2, l, 10, 1);
  g.translate(0, -l / 2, 0);                       // pivot en haut du segment
  const me = new THREE.Mesh(g, m);
  me.castShadow = true;
  return me;
}

export class Personne {
  constructor({ taille = 1.72, haut, bas, peau, sac = false } = {}) {
    const k = taille / 1.72;
    this.k = k;
    this.taille = taille;
    const mPeau = mat(peau || PEAUX[(Math.random() * PEAUX.length) | 0], .74);
    const mHaut = mat(haut || HAUTS[(Math.random() * HAUTS.length) | 0]);
    const mBas  = mat(bas  || BAS[(Math.random() * BAS.length) | 0]);
    const mPied = mat('#1b1b1f', .6);

    this.root = new THREE.Group();

    // ── bassin ──
    this.hips = new THREE.Group();
    this.hips.position.y = 0.92 * k;
    this.root.add(this.hips);

    const bassin = new THREE.Mesh(new THREE.CapsuleGeometry(.15 * k, .1 * k, 4, 12), mBas);
    bassin.castShadow = true; this.hips.add(bassin);

    // ── tronc ──
    this.torso = new THREE.Group();
    this.hips.add(this.torso);
    const buste = new THREE.Mesh(new THREE.CapsuleGeometry(.185 * k, .34 * k, 5, 14), mHaut);
    buste.position.y = .27 * k; buste.castShadow = true; this.torso.add(buste);
    const epaules = new THREE.Mesh(new THREE.CapsuleGeometry(.10 * k, .34 * k, 4, 10), mHaut);
    epaules.rotation.z = Math.PI / 2; epaules.position.y = .45 * k;
    epaules.castShadow = true; this.torso.add(epaules);

    // ── tête ──
    this.neck = new THREE.Group();
    this.neck.position.y = .52 * k; this.torso.add(this.neck);
    const cou = new THREE.Mesh(new THREE.CylinderGeometry(.055 * k, .065 * k, .09 * k, 8), mPeau);
    cou.position.y = .045 * k; this.neck.add(cou);
    const tete = new THREE.Mesh(new THREE.SphereGeometry(.115 * k, 16, 14), mPeau);
    tete.position.y = .19 * k; tete.scale.set(1, 1.12, .94); tete.castShadow = true;
    this.neck.add(tete);
    const cheveux = new THREE.Mesh(new THREE.SphereGeometry(.118 * k, 14, 12,
      0, Math.PI * 2, 0, Math.PI * .62), mat('#141014', .95));
    cheveux.position.y = .205 * k; cheveux.scale.set(1, 1.06, .96);
    this.neck.add(cheveux);

    // ── bras ──
    const bras = (cote) => {
      const ep = new THREE.Group();
      ep.position.set(cote * .21 * k, .45 * k, 0);
      this.torso.add(ep);
      const hb = seg(.27 * k, .052 * k, .045 * k, mHaut); ep.add(hb);
      const co = new THREE.Group(); co.position.y = -.27 * k; ep.add(co);
      const ab = seg(.25 * k, .045 * k, .038 * k, mPeau); co.add(ab);
      const main = new THREE.Mesh(new THREE.SphereGeometry(.05 * k, 8, 6), mPeau);
      main.position.y = -.25 * k; main.scale.set(.8, 1.1, .6); co.add(main);
      return { ep, co, main };
    };
    this.brasG = bras(-1); this.brasD = bras(1);

    // ── jambes ──
    const jambe = (cote) => {
      const ha = new THREE.Group();
      ha.position.set(cote * .095 * k, -.02 * k, 0);
      this.hips.add(ha);
      const cu = seg(.44 * k, .078 * k, .062 * k, mBas); ha.add(cu);
      const ge = new THREE.Group(); ge.position.y = -.44 * k; ha.add(ge);
      const ti = seg(.42 * k, .06 * k, .048 * k, mBas); ge.add(ti);
      const pied = new THREE.Mesh(new THREE.BoxGeometry(.10 * k, .06 * k, .24 * k), mPied);
      pied.position.set(0, -.44 * k, .05 * k); pied.castShadow = true; ge.add(pied);
      return { ha, ge, pied };
    };
    this.jambeG = jambe(-1); this.jambeD = jambe(1);

    // ── le téléphone, dans la main droite ──
    this.tel = new THREE.Group();
    const coque = new THREE.Mesh(new THREE.BoxGeometry(.075 * k, .152 * k, .010 * k),
      mat('#0d0d10', .5));
    const ecran = new THREE.Mesh(new THREE.PlaneGeometry(.064 * k, .134 * k),
      new THREE.MeshBasicMaterial({ color: '#7fd6ff' }));
    ecran.position.z = .006 * k;
    this.ecranTel = ecran;
    this.tel.add(coque, ecran);
    this.tel.position.set(0, -.30 * k, .04 * k);
    this.tel.rotation.x = -.5;
    this.tel.visible = false;
    this.brasD.co.add(this.tel);

    if (sac) {
      const s = new THREE.Mesh(new THREE.BoxGeometry(.20 * k, .26 * k, .10 * k),
        mat('#c98a2e', .9));
      s.position.set(0, -.34 * k, 0); s.castShadow = true;
      this.brasG.co.add(s);
      this.sac = s;
    }

    // état
    this.phase = Math.random() * 6.28;
    this.vitesse = 0;
    this.chemin = [];
    this.telLeve = 0;      // 0 → 1, montée du bras
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
    // ── déplacement le long du chemin ──
    let marche = 0;
    if (this.chemin.length) {
      const cible = this.chemin[0];
      const d = cible.clone().sub(this.root.position); d.y = 0;
      const dist = d.length();
      if (dist < .12) {
        this.chemin.shift();
      } else {
        const pas = Math.min(dist, this.vitesse * dt);
        this.root.position.addScaledVector(d.normalize(), pas);
        const cap = Math.atan2(d.x, d.z);
        // rotation amortie : on ne pivote pas d'un bloc
        let dr = cap - this.root.rotation.y;
        while (dr > Math.PI) dr -= Math.PI * 2;
        while (dr < -Math.PI) dr += Math.PI * 2;
        this.root.rotation.y += dr * Math.min(1, dt * 7);
        marche = 1;
      }
    }

    // ── cycle de marche ──
    const cad = this.vitesse / 0.375;   // un pas de ~0,75 m
    this.phase += dt * cad * (marche ? 1 : 0);
    const p = this.phase, A = marche ? 1 : 0;

    const sw = Math.sin(p), sw2 = Math.sin(p + Math.PI);
    // hanches
    this.jambeG.ha.rotation.x = sw * .45 * A;
    this.jambeD.ha.rotation.x = sw2 * .45 * A;
    // genoux : ne plient que sur la phase arrière, comme une vraie foulée
    const flex = (a) => -Math.max(0, -Math.sin(a + .95)) * .72 * A;
    this.jambeG.ge.rotation.x = flex(p);
    this.jambeD.ge.rotation.x = flex(p + Math.PI);
    // chevilles
    this.jambeG.pied.rotation.x = -this.jambeG.ge.rotation.x * .55 - sw * .16 * A;
    this.jambeD.pied.rotation.x = -this.jambeD.ge.rotation.x * .55 - sw2 * .16 * A;

    // bras en opposition
    const telUp = this.telLeve;
    this.brasG.ep.rotation.x = sw2 * .36 * A;
    this.brasG.co.rotation.x = -Math.max(0, sw2) * .5 * A - .12;
    if (telUp < .02) {
      this.brasD.ep.rotation.x = sw * .36 * A;
      this.brasD.co.rotation.x = -Math.max(0, sw) * .5 * A - .12;
      this.brasD.ep.rotation.z = 0;
    }

    // bassin : montée-descente et roulis
    this.hips.position.y = (.92 - .022 + Math.abs(Math.sin(p)) * .030 * A) * this.k;
    this.hips.rotation.z = Math.sin(p) * .05 * A;
    this.torso.rotation.y = -Math.sin(p) * .10 * A;
    this.torso.rotation.x = marche ? .06 : .02;

    // ── téléphone : le bras monte devant le visage ──
    const vise = this.telViser || 0;
    this.telLeve += (vise - this.telLeve) * Math.min(1, dt * 6);
    if (this.telLeve > .02) {
      const t = this.telLeve;
      this.brasD.ep.rotation.x = THREE.MathUtils.lerp(sw * .36 * A, -1.15, t);
      this.brasD.ep.rotation.z = THREE.MathUtils.lerp(0, -.42, t);
      this.brasD.co.rotation.x = THREE.MathUtils.lerp(-.12, -1.25, t);
      this.tel.visible = true;
      this.ecranTel.material.opacity = t;
      this.neck.rotation.x = THREE.MathUtils.lerp(0, .34, t);   // il baisse les yeux dessus
    } else {
      this.tel.visible = false;
      this.neck.rotation.x *= .85;
    }

    // ── regard ──
    if (this.regard) {
      const d = this.regard.clone().sub(this.root.position);
      const cap = Math.atan2(d.x, d.z);
      let dr = cap - this.root.rotation.y;
      while (dr > Math.PI) dr -= Math.PI * 2;
      while (dr < -Math.PI) dr += Math.PI * 2;
      this.neck.rotation.y = THREE.MathUtils.clamp(dr, -.7, .7) * .55;
    }
  }
}

/* Une foule de fond : des gens qui traversent l'allée sans jouer de rôle.
   Un marché vide ne ressemble pas à un marché. */
export class Foule {
  constructor(scene, n, x0, x1, z) {
    this.gens = [];
    for (let i = 0; i < n; i++) {
      const p = new Personne({ taille: 1.6 + Math.random() * .22 });
      const sens = Math.random() > .5 ? 1 : -1;
      p.root.position.set(x0 + Math.random() * (x1 - x0), 0, z + (Math.random() - .5) * 3.2);
      p.sens = sens;
      p.aller([{ x: sens > 0 ? x1 + 6 : x0 - 6, z: p.root.position.z }],
              1.0 + Math.random() * .5);
      scene.add(p.root);
      this.gens.push(p);
    }
    this.x0 = x0; this.x1 = x1; this.z = z;
  }
  update(dt) {
    for (const p of this.gens) {
      p.update(dt);
      if (p.arrive) {
        p.sens *= -1;
        p.root.position.x = p.sens > 0 ? this.x0 - 4 : this.x1 + 4;
        p.root.position.z = this.z + (Math.random() - .5) * 3.2;
        p.aller([{ x: p.sens > 0 ? this.x1 + 6 : this.x0 - 6, z: p.root.position.z }],
                1.0 + Math.random() * .5);
      }
    }
  }
}
