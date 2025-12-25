import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const { socket, connected } = useSocket();
  const [mode, setMode] = useState(null); // 'coordinator' or 'join'
  const [coordinatorName, setCoordinatorName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [playerAge, setPlayerAge] = useState('');

  // Check for QR code join parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const joinCode = params.get('join');
    if (joinCode) {
      setRoomCode(joinCode.toUpperCase());
      setMode('join');
    }
  }, [location]);

  const handleCreateGame = () => {
    if (!coordinatorName.trim()) return;

    socket.emit('create-game', { coordinatorName });
    socket.once('game-created', ({ roomCode, game }) => {
      navigate('/coordinator', { state: { roomCode, coordinatorName } });
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
      <div className="fixed inset-0 w-screen h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-red-900">
        <div className="bg-white bg-opacity-20 backdrop-blur-xl rounded-3xl p-12 text-center border-2 border-white border-opacity-40">
          <div className="text-8xl mb-6 animate-pulse">🎮</div>
          <h2 className="text-3xl font-bold text-white drop-shadow-lg">Connecting to server...</h2>
        </div>
      </div>
    );
  }

  // INITIAL CHOICE SCREEN - Main home screen
  if (!mode) {
    return (
      <div
        className="fixed inset-0 w-screen h-screen overflow-hidden flex items-end justify-center pb-16"
        style={{
          backgroundImage: 'url(/images/home-background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Subtle dark overlay at bottom for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none"></div>

        {/* Content */}
        <div className="relative z-10 max-w-2xl w-full px-8 text-center">
          {/* Game Logo */}
          <img
            src="/images/game-logo.png"
            alt="iParty Logo"
            className="w-full max-w-xl mx-auto mb-8 drop-shadow-2xl"
          />

          {/* Buttons - Large and prominent with better styling */}
          <div className="space-y-8">
            <button
              onClick={() => setMode('coordinator')}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-5xl font-black py-10 rounded-full shadow-2xl border-8 border-white transition-all hover:scale-105 active:scale-95 transform"
              style={{ textShadow: '0 4px 8px rgba(0,0,0,0.5)' }}
            >
              🎯 Host Game
            </button>

            <button
              onClick={() => setMode('join')}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-5xl font-black py-10 rounded-full shadow-2xl border-8 border-white transition-all hover:scale-105 active:scale-95 transform"
              style={{ textShadow: '0 4px 8px rgba(0,0,0,0.5)' }}
            >
              🎮 Join Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  // COORDINATOR FORM SCREEN
  if (mode === 'coordinator') {
    return (
      <div
        className="fixed inset-0 w-screen h-screen overflow-hidden flex items-center justify-center"
        style={{
          backgroundImage: 'url(/images/home-background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>

        {/* Content */}
        <div className="relative z-10 max-w-2xl w-full px-4 md:px-6 py-4">
          {/* Back Button */}
          <button
            onClick={() => setMode(null)}
            className="mb-4 md:mb-6 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-800 text-lg md:text-xl font-bold px-6 md:px-8 py-3 md:py-4 rounded-full shadow-xl hover:scale-105 transition-all border-4 border-white"
          >
            ← Back
          </button>

          {/* Form Card */}
          <div className="bg-white bg-opacity-95 backdrop-blur-xl rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-2xl border-4 border-red-500">
            <div className="text-center mb-6 md:mb-8">
              <div className="text-6xl md:text-7xl mb-3 md:mb-4">🎯</div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-800 mb-2 md:mb-4">Host a Game</h2>
              <p className="text-lg md:text-xl lg:text-2xl text-gray-600">You'll display the game on your TV/screen</p>
            </div>

            <div className="space-y-4 md:space-y-5">
              <div>
                <label className="block text-lg md:text-xl font-bold text-gray-800 mb-2 md:mb-3">
                  Your Name
                </label>
                <input
                  type="text"
                  value={coordinatorName}
                  onChange={(e) => setCoordinatorName(e.target.value)}
                  className="w-full text-xl md:text-2xl lg:text-3xl p-4 md:p-5 border-4 border-gray-300 rounded-xl md:rounded-2xl focus:border-red-500 focus:outline-none"
                  placeholder="Enter your name"
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateGame()}
                  autoFocus
                />
              </div>

              <button
                onClick={handleCreateGame}
                disabled={!coordinatorName.trim()}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-400 disabled:to-gray-500 text-white text-2xl md:text-3xl lg:text-4xl font-black py-5 md:py-7 rounded-full shadow-2xl border-6 md:border-8 border-white transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:hover:scale-100 transform"
                style={{ textShadow: '0 4px 8px rgba(0,0,0,0.5)' }}
              >
                🚀 Create Game Room
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // JOIN GAME FORM SCREEN
  return (
    <div
      className="fixed inset-0 w-screen h-screen overflow-hidden flex items-center justify-center"
      style={{
        backgroundImage: 'url(/images/home-background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-30"></div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl w-full px-4 md:px-6 py-4">
        {/* Back Button */}
        <button
          onClick={() => setMode(null)}
          className="mb-4 md:mb-6 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-800 text-lg md:text-xl font-bold px-6 md:px-8 py-3 md:py-4 rounded-full shadow-xl hover:scale-105 transition-all border-4 border-white"
        >
          ← Back
        </button>

        {/* Form Card */}
        <div className="bg-white bg-opacity-95 backdrop-blur-xl rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-2xl border-4 border-green-500">
          <div className="text-center mb-6 md:mb-8">
            <div className="text-6xl md:text-7xl mb-3 md:mb-4">🎮</div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-800 mb-2 md:mb-4">Join a Game</h2>
            <p className="text-lg md:text-xl lg:text-2xl text-gray-600">Enter the room code from the TV</p>
          </div>

          <div className="space-y-4 md:space-y-5">
            <div>
              <label className="block text-lg md:text-xl font-bold text-gray-800 mb-2 md:mb-3">
                Room Code
              </label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="w-full text-3xl md:text-4xl lg:text-5xl p-4 md:p-5 border-4 border-gray-300 rounded-xl md:rounded-2xl focus:border-green-500 focus:outline-none text-center tracking-widest font-mono font-bold"
                placeholder="XXXXX"
                maxLength={6}
                autoFocus
              />
            </div>

            <div>
              <label className="block text-lg md:text-xl font-bold text-gray-800 mb-2 md:mb-3">
                Your Name
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full text-xl md:text-2xl lg:text-3xl p-4 md:p-5 border-4 border-gray-300 rounded-xl md:rounded-2xl focus:border-green-500 focus:outline-none"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-lg md:text-xl font-bold text-gray-800 mb-2 md:mb-3">
                Your Age
              </label>
              <input
                type="number"
                value={playerAge}
                onChange={(e) => setPlayerAge(e.target.value)}
                className="w-full text-xl md:text-2xl lg:text-3xl p-4 md:p-5 border-4 border-gray-300 rounded-xl md:rounded-2xl focus:border-green-500 focus:outline-none"
                placeholder="Enter your age"
                min="5"
                max="100"
                onKeyPress={(e) => e.key === 'Enter' && handleJoinGame()}
              />
            </div>

            <button
              onClick={handleJoinGame}
              disabled={!playerName.trim() || !roomCode.trim() || !playerAge}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 text-white text-2xl md:text-3xl lg:text-4xl font-black py-5 md:py-7 rounded-full shadow-2xl border-6 md:border-8 border-white transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:hover:scale-100 transform"
              style={{ textShadow: '0 4px 8px rgba(0,0,0,0.5)' }}
            >
              🎮 Join Game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
