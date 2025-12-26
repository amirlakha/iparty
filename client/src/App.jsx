import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Lobby from './pages/Lobby';
import CoordinatorScreen from './pages/CoordinatorScreen';
import PlayerStoryScreen from './pages/PlayerStoryScreen';
import ScreenPreview from './pages/ScreenPreview';
import PreviewGame from './pages/PreviewGame';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lobby" element={<Lobby />} />
          <Route path="/coordinator" element={<CoordinatorScreen />} />
          <Route path="/play" element={<PlayerStoryScreen />} />
          <Route path="/preview" element={<ScreenPreview />} />
          <Route path="/preview/:screen" element={<ScreenPreview />} />
          <Route path="/preview-game/:gameType" element={<PreviewGame />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
