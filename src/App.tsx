import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { letterAudio } from './lib/audio/engine';
import Home from './screens/Home';
import Session from './screens/Session';
import Summary from './screens/Summary';
import Stats from './screens/Stats';

export default function App() {
  useEffect(() => {
    // Warm the letter clips so the first listening round starts instantly.
    void letterAudio.preload();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/train" element={<Session />} />
      <Route path="/summary" element={<Summary />} />
      <Route path="/stats" element={<Stats />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
