import { createContext, useContext, useState, useCallback } from 'react';

/* Outil interne, identifiants en dur — c'est assumé et c'est écrit sur
   l'écran de connexion. Ça ne protège de rien d'autre que d'un visiteur de
   passage : la page est publique sur Vercel, et tout ce qu'elle sert l'est
   aussi. On n'y met donc rien qui ne puisse pas être vu par quelqu'un qui
   connaît l'URL des fichiers. */
const COMPTES = [
  { u: 'buyticle', p: 'Relais2026!', nom: 'Direction', ini: 'BT' },
  { u: 'terrain',  p: 'Mboppi2026!', nom: 'Équipe terrain', ini: 'ET' },
];

const CLE = 'bts_session';
const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(CLE)) || null; } catch { return null; }
  });

  const login = useCallback((u, p) => {
    const c = COMPTES.find(
      (c) => c.u === String(u).trim().toLowerCase() && c.p === p
    );
    if (!c) return false;
    const s = { u: c.u, nom: c.nom, ini: c.ini, at: Date.now() };
    sessionStorage.setItem(CLE, JSON.stringify(s));
    setUser(s);
    return true;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(CLE);
    setUser(null);
  }, []);

  return <Ctx.Provider value={{ user, login, logout }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
