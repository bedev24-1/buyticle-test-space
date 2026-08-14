import * as THREE from 'three';
import { Humain } from './human.js';

/* Le corps humain vit maintenant dans human.js : maillage continu tendu sur
   un squelette. Ce fichier ne garde que la figuration. */
export { Humain as Personne };

export class Foule {
  constructor(scene, n, x0, x1, z) {
    this.gens = [];
    for (let i = 0; i < n; i++) {
      const p = new Humain({ taille: 1.6 + Math.random() * .22 });
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
