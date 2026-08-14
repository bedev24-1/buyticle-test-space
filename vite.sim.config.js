import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

/* La simulation se construit à part, en UN seul fichier HTML : trois.js, les
   textures et le scénario sont tous inlinés. C'est ce qui permet de la
   télécharger et de l'ouvrir hors ligne, et de la servir dans une iframe sans
   qu'elle dépende du reste de l'application. */
export default defineConfig({
  root: 'sim',
  base: './',
  plugins: [viteSingleFile({ removeViteModuleLoader: true })],
  build: {
    outDir: '../public/simulations/marche-de-mboppi',
    emptyOutDir: false,
    assetsInlineLimit: 100_000_000,
    chunkSizeWarningLimit: 8000,
    cssCodeSplit: false,
    rollupOptions: { output: { inlineDynamicImports: true } },
  },
});
