/**
 * Main App Component
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import TeamsPage from '@/pages/TeamsPage';
import PredictionsPage from '@/pages/PredictionsPage';
import '@/styles/index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/teams" element={<TeamsPage />} />
        <Route path="/predictions" element={<PredictionsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
