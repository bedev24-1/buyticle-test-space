import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import {
  IcMove, IcGrid, IcCap, IcTrend, IcTree, IcAlert, IcGear,
  IcSearch, IcChat, IcBell, IcShare, IcChev, IcOut,
} from '../icons.jsx';

/* Le rail de gauche. L'icône active porte un fond plus clair, comme dans la
   maquette : c'est le seul repère de position du produit. */
function Rail() {
  const { user, logout } = useAuth();
  const cls = ({ isActive }) => 'rbtn' + (isActive ? ' on' : '');
  return (
    <nav className="rail">
      <div className="top">
        <span className="rbtn mark"><IcMove w={19} /></span>
        <NavLink to="/" end className={cls} title="Tableau de bord"><IcGrid /></NavLink>
        <NavLink to="/simulations" className={cls} title="Toutes les simulations"><IcCap /></NavLink>
        <NavLink to="/resultats" className={cls} title="Résultats"><IcTrend /></NavLink>
        <NavLink to="/modele" className={cls} title="Le modèle"><IcTree /></NavLink>
        <NavLink to="/hypotheses" className={cls} title="Hypothèses"><IcAlert /></NavLink>
      </div>
      <div className="bottom">
        <button className="rbtn" title="Se déconnecter" onClick={logout}><IcOut /></button>
        <span className="rbtn" title="Réglages"><IcGear /></span>
        <span className="rav" title={user?.nom}>{user?.ini}</span>
      </div>
    </nav>
  );
}

function TopBar({ crumb = [], action }) {
  return (
    <header className="top">
      <div className="crumb">
        {crumb.map((c, i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {i > 0 && <IcChev w={13} />}
            <span className={i === crumb.length - 1 ? 'on' : undefined}>{c}</span>
          </span>
        ))}
      </div>

      <label className="search">
        <IcSearch w={15} />
        <input placeholder="Rechercher…" aria-label="Rechercher" />
        <span className="kbd">CMD</span>
        <span className="kbd">K</span>
      </label>

      <div className="tools">
        <button className="icobtn" title="Commentaires"><IcChat w={15} /></button>
        <button className="icobtn" title="Notifications"><IcBell w={15} /></button>
        {action ?? (
          <button className="btn-v"><IcShare w={14} />Partager</button>
        )}
      </div>
    </header>
  );
}

export default function Shell({ crumb, action, children }) {
  useNavigate(); // garde le composant sous le routeur
  return (
    <div className="shell">
      <Rail />
      <div className="main">
        <TopBar crumb={crumb} action={action} />
        <div className="scroll">{children}</div>
      </div>
    </div>
  );
}
