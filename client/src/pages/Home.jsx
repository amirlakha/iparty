import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

function Home() {
  const navigate = useNavigate();
  const { socket, connected } = useSocket();
  const [mode, setMode] = useState(null); // 'host' or 'join'
  const [hostName, setHostName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [playerAge, setPlayerAge] = useState('');

  const handleCreateGame = () => {
    if (!hostName.trim()) return;

    socket.emit('create-game', { hostName });
    socket.once('game-created', ({ roomCode, game }) => {
      navigate('/host', { state: { roomCode, game } });
    });
  };

  const handleJoinGame = () => {
    if (!playerName.trim() || !roomCode.trim() || !playerAge) return;

    socket.emit('join-game', {
      roomCode: roomCode.toUpperCase(),
      playerName,
      playerAge: parseInt(playerAge)
    });

    socket.once('joined-game', ({ player, game }) => {
      navigate('/lobby', { state: { player, game, roomCode: roomCode.toUpperCase() } });
    });

    socket.once('error', ({ message }) => {
      alert(message);
    });
  };

  if (!connected) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="card text-center">
          <div className="text-6xl mb-4">🎮</div>
          <h2 className="text-2xl font-bold text-gray-700">Connecting to server...</h2>
        </div>
      </div>
    );
  }

  if (!mode) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="card text-center max-w-md w-full">
          <div className="text-8xl mb-6 animate-bounce">🎉</div>
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4">
            iParty!
          </h1>
          <p className="text-xl text-gray-600 mb-8">The Ultimate Family Party Game</p>

          <div className="space-y-4">
            <button
              onClick={() => setMode('host')}
              className="w-full btn-primary text-2xl py-4"
            >
              🎯 Host a Game
            </button>
            <button
              onClick={() => setMode('join')}
              className="w-full btn-secondary text-2xl py-4"
            >
              🎮 Join a Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'host') {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="card max-w-md w-full">
          <button
            onClick={() => setMode(null)}
            className="mb-4 text-gray-500 hover:text-gray-700"
          >
            ← Back
          </button>

          <div className="text-6xl text-center mb-4">🎯</div>
          <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Host a Game</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                className="input-field"
                placeholder="Enter your name"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateGame()}
              />
            </div>

            <button
              onClick={handleCreateGame}
              disabled={!hostName.trim()}
              className="w-full btn-primary text-xl py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Game Room
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="card max-w-md w-full">
        <button
          onClick={() => setMode(null)}
          className="mb-4 text-gray-500 hover:text-gray-700"
        >
          ← Back
        </button>

        <div className="text-6xl text-center mb-4">🎮</div>
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Join a Game</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Room Code
            </label>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              className="input-field text-center text-2xl tracking-wider"
              placeholder="XXXXX"
              maxLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="input-field"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Your Age
            </label>
            <input
              type="number"
              value={playerAge}
              onChange={(e) => setPlayerAge(e.target.value)}
              className="input-field"
              placeholder="Enter your age"
              min="5"
              max="100"
              onKeyPress={(e) => e.key === 'Enter' && handleJoinGame()}
            />
          </div>

          <button
            onClick={handleJoinGame}
            disabled={!playerName.trim() || !roomCode.trim() || !playerAge}
            className="w-full btn-secondary text-xl py-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Join Game
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
