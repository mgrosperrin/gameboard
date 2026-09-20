import { Navigate, Route, Routes } from 'react-router-dom';

import { AppLayout } from './components/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { MatchPage } from './pages/MatchPage';
import { NewMatchPage } from './pages/NewMatchPage';
import { PlayersPage } from './pages/PlayersPage';

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/players" element={<PlayersPage />} />
        <Route path="/matches/new" element={<NewMatchPage />} />
        <Route path="/matches/:matchId" element={<MatchPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
