/* Registre des simulations.
   Aucune inscription manuelle : on ramasse tous les meta.js du dossier.
   Pour ajouter une simulation, on crée src/simulations/<slug>/meta.js et on
   dépose ses fichiers dans public/simulations/<slug>/. Rien d'autre. */
const modules = import.meta.glob('./*/meta.js', { eager: true, import: 'default' });

export const SIMULATIONS = Object.values(modules)
  .sort((a, b) => (a.ref < b.ref ? -1 : 1));

export const bySlug = (slug) => SIMULATIONS.find((s) => s.slug === slug);

export const fichierUrl = (sim, f) => `/simulations/${sim.slug}/${f}`;
