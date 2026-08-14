import { useParams, useNavigate, Navigate } from 'react-router-dom';
import Shell from '../components/Shell.jsx';
import { bySlug, fichierUrl } from '../simulations/index.js';
import { IcPlay, IcDown } from '../icons.jsx';

const dateFR = (d) =>
  new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

export default function Dossier() {
  const { slug } = useParams();
  const nav = useNavigate();
  const s = bySlug(slug);
  if (!s) return <Navigate to="/simulations" replace />;
  const d = s.dossier;

  return (
    <Shell
      crumb={['Buyticle', 'Simulations', s.nom, 'Dossier']}
      action={
        <button className="btn-v" onClick={() => nav(`/simulations/${s.slug}/live`)}>
          <IcPlay w={13} />Voir en direct
        </button>
      }
    >
      <div className="page-h">
        <h1>{s.nom}</h1>
        <p>#{s.ref} · version {s.version} · créée le {dateFR(s.cree)} par {s.auteur}</p>
      </div>

      <div className="doc">
        <h2>Objectif stratégique</h2>
        <p>{s.objectif}</p>

        <h2>Cadre</h2>
        <table>
          <tbody>
            <tr><th>Marché</th><td>{s.marche}</td></tr>
            <tr><th>Rayon</th><td>{s.rayon}</td></tr>
            <tr><th>Périmètre</th><td>{s.perimetre}</td></tr>
            <tr><th>Boutiques</th><td>{s.boutiques}</td></tr>
            <tr><th>Période simulée</th><td>{s.periode}</td></tr>
            <tr><th>Public visé</th><td>{s.public.join(' · ')}</td></tr>
            <tr><th>Statut</th><td>{s.statut}</td></tr>
          </tbody>
        </table>

        <h2>Ce que la simulation joue</h2>
        <p>{d.resume}</p>

        <h2>Résultats</h2>
        <table>
          <tbody>
            {d.resultats.map(([k, v]) => (
              <tr key={k}><th>{k}</th><td className="n">{v}</td></tr>
            ))}
          </tbody>
        </table>

        <h2>Ce qu'on en retient</h2>
        <ul>{d.conclusions.map((c) => <li key={c}>{c}</li>)}</ul>

        <h2>Hypothèses du modèle</h2>
        <p>Aucun de ces chiffres n'est mesuré sur le terrain. Ils fixent tous les
        autres résultats — c'est la première chose à vérifier avant d'engager quoi que ce soit.</p>
        <table>
          <thead><tr><th>Hypothèse</th><th>Valeur</th><th>État</th></tr></thead>
          <tbody>
            {d.hypotheses.map(([k, v, e]) => (
              <tr key={k}><td>{k}</td><td className="n">{v}</td><td>{e}</td></tr>
            ))}
          </tbody>
        </table>

        <h2>Fichiers du dossier</h2>
        <table>
          <thead><tr><th>Fichier</th><th>Format</th><th>Taille</th><th></th></tr></thead>
          <tbody>
            {s.fichiers.map((f) => (
              <tr key={f.f}>
                <td>{f.nom}</td><td>{f.type}</td><td className="n">{f.taille}</td>
                <td style={{ textAlign: 'right' }}>
                  <a className="btn-o" style={{ display: 'inline-flex' }}
                     href={fichierUrl(s, f.f)} download>
                    <IcDown w={13} />Télécharger
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
