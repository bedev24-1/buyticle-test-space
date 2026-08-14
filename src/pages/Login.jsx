import { useState } from 'react';
import { useAuth } from '../auth.jsx';
import { IcLock } from '../icons.jsx';

export default function Login() {
  const { login } = useAuth();
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const [err, setErr] = useState('');

  const go = (ev) => {
    ev.preventDefault();
    if (!login(u, p)) setErr("Identifiant ou mot de passe incorrect.");
  };

  return (
    <div className="login">
      <form className="lbox" onSubmit={go}>
        <span className="rbtn on" style={{ width: 40, height: 40 }}><IcLock w={19} /></span>
        <h1>Salle de simulation</h1>
        <p>Outil interne Buyticle. Accès réservé à l'équipe.</p>

        <div className="field">
          <label htmlFor="u">Identifiant</label>
          <input id="u" value={u} autoComplete="username" autoFocus
                 onChange={(e) => { setU(e.target.value); setErr(''); }} />
        </div>
        <div className="field">
          <label htmlFor="p">Mot de passe</label>
          <input id="p" type="password" value={p} autoComplete="current-password"
                 onChange={(e) => { setP(e.target.value); setErr(''); }} />
        </div>

        {err && <div className="lerr">{err}</div>}
        <button className="lsub" type="submit">Entrer</button>

        <div className="lfoot">
          Les identifiants sont écrits en dur dans le code et la session ne dure
          que le temps de l'onglet. Cette porte écarte un visiteur de passage,
          rien de plus : ne déposez ici aucune donnée qui ne puisse pas être vue.
        </div>
      </form>
    </div>
  );
}
