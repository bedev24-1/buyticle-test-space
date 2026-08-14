import Shell from '../components/Shell.jsx';

/* Les pages du rail qui n'ont pas encore de contenu. On le dit franchement
   plutôt que d'afficher une page qui fait semblant. */
export default function Vide({ titre, quoi }) {
  return (
    <Shell crumb={['Buyticle', titre]}>
      <div className="page-h">
        <h1>{titre}</h1>
        <p>{quoi}</p>
      </div>
      <div className="card" style={{ padding: 26, color: 'var(--faint)', fontSize: 12.5 }}>
        Rien à afficher pour l'instant. Cette page se remplira quand une deuxième
        simulation sera versée au dossier.
      </div>
    </Shell>
  );
}
