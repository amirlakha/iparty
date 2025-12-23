import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Lobby from './pages/Lobby';
import HostScreen from './pages/HostScreen';
import PlayerScreen from './pages/PlayerScreen';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lobby" element={<Lobby />} />
          <Route path="/host" element={<HostScreen />} />
          <Route path="/play" element={<PlayerScreen />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
