import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { bySlug, fichierUrl } from '../simulations/index.js';
import { IcBack, IcDown } from '../icons.jsx';

export default function Live() {
  const { slug } = useParams();
  const nav = useNavigate();
  const sim = bySlug(slug);
  if (!sim) return <Navigate to="/simulations" replace />;

  return (
    <div className="live">
      <header className="live-h">
        <button className="icobtn" onClick={() => nav(-1)} title="Retour"><IcBack w={15} /></button>
        <div>
          <div className="t">{sim.nom}</div>
          <div className="s">#{sim.ref} · {sim.periode}</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <a className="btn-o" href={fichierUrl(sim, sim.fichiers[0].f)} download>
            <IcDown w={13} />La simulation
          </a>
          <a className="btn-v" href={fichierUrl(sim, sim.fichiers[1].f)} download>
            <IcDown w={13} />Le document
          </a>
        </div>
      </header>
      <div className="live-b">
        <iframe title={sim.nom} src={fichierUrl(sim, sim.fichiers[0].f)} />
      </div>
    </div>
  );
}
