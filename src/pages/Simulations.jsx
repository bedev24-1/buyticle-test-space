import { useNavigate } from 'react-router-dom';
import Shell from '../components/Shell.jsx';
import { SIMULATIONS, fichierUrl } from '../simulations/index.js';
import { IcPlay, IcDown } from '../icons.jsx';

const dateFR = (d) =>
  new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

export default function Simulations() {
  const nav = useNavigate();
  return (
    <Shell crumb={['Buyticle', 'Simulations']}>
      <div className="page-h">
        <h1>Toutes les simulations</h1>
        <p>{SIMULATIONS.length} dossier{SIMULATIONS.length > 1 ? 's' : ''} · une simulation = un dossier de fichiers, sans base de données.</p>
      </div>

      <div className="simgrid">
        {SIMULATIONS.map((s) => (
          <article className="simcard" key={s.slug}>
            <div className="top">
              <div className="thumb">{s.emoji}</div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <h3>{s.nom}</h3>
                <div className="ref num">#{s.ref} · v{s.version}</div>
              </div>
              <span className="tag g">{s.statut}</span>
            </div>

            <div className="ob">{s.objectif}</div>

            <div className="meta">
              <div><div className="k">Créée le</div><div className="v">{dateFR(s.cree)}</div></div>
              <div><div className="k">Période</div><div className="v">{s.periode}</div></div>
              <div><div className="k">Marché</div><div className="v">{s.marche}</div></div>
              <div><div className="k">Public</div><div className="v">{s.public.join(', ')}</div></div>
            </div>

            <div className="acts">
              <button className="btn-v" onClick={() => nav(`/simulations/${s.slug}/live`)}>
                <IcPlay w={13} />Voir en direct
              </button>
              <button className="btn-o" onClick={() => nav(`/simulations/${s.slug}`)}>
                Dossier
              </button>
              <a className="btn-o" href={fichierUrl(s, s.fichiers[1].f)} download>
                <IcDown w={13} />Document
              </a>
            </div>
          </article>
        ))}
      </div>
    </Shell>
  );
}
