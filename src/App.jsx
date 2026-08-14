import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Simulations from './pages/Simulations.jsx';
import Dossier from './pages/Dossier.jsx';
import Live from './pages/Live.jsx';
import Vide from './pages/Vide.jsx';

function Routeur() {
  const { user } = useAuth();
  if (!user) return <Login />;
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/simulations" element={<Simulations />} />
      <Route path="/simulations/:slug" element={<Dossier />} />
      <Route path="/simulations/:slug/live" element={<Live />} />
      <Route path="/resultats" element={<Vide titre="Résultats" quoi="Comparaison entre simulations." />} />
      <Route path="/modele" element={<Vide titre="Le modèle" quoi="Les règles communes à toutes les simulations." />} />
      <Route path="/hypotheses" element={<Vide titre="Hypothèses" quoi="Ce qui n'est pas mesuré, et ce que ça casse." />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter><Routeur /></BrowserRouter>
    </AuthProvider>
  );
}
