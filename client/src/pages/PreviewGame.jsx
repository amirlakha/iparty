import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { QRCodeSVG } from 'qrcode.react';
import SnakeGameBoard from '../components/SnakeGameBoard';

const GAME_TYPE_CONFIG = {
  snake: { name: 'Snake Arena', emoji: '🐍', color: 'from-green-500 to-emerald-600' },
  'connect4': { name: 'Connect 4', emoji: '🔴', color: 'from-red-500 to-blue-600' },
  trivia: { name: 'Christmas Trivia', emoji: '🎯', color: 'from-purple-500 to-pink-600' },
  'true-false': { name: 'True or False', emoji: '✅', color: 'from-green-500 to-teal-600' },
  'speed-math': { name: 'Speed Math', emoji: '🧮', color: 'from-blue-500 to-indigo-600' },
  spelling: { name: 'Spelling Bee', emoji: '✏️', color: 'from-yellow-500 to-orange-600' },
};

function PreviewGame() {
  const { gameType } = useParams();
  const { socket } = useSocket();

  const [roomCode, setRoomCode] = useState(null);
  const [players, setPlayers] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState(null);

  // Snake-specific state
  const [snakeGameState, setSnakeGameState] = useState(null);

  // Connect4-specific state
  const [connect4Board, setConnect4Board] = useState(null);
  const [connect4CurrentPlayer, setConnect4CurrentPlayer] = useState(null);
  const [connect4Winner, setConnect4Winner] = useState(null);
  const [connect4Teams, setConnect4Teams] = useState(null);

  const config = GAME_TYPE_CONFIG[gameType] || { name: gameType, emoji: '🎮', color: 'from-gray-500 to-gray-600' };

  // Generate join URL
  const getJoinUrl = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/?join=${roomCode}`;
  };

  useEffect(() => {
    if (!socket) return;

    // Create a preview room on mount
    socket.emit('create-preview-game', { gameType });

    socket.on('preview-game-created', (data) => {
      console.log('[Preview] Room created:', data.roomCode);
      setRoomCode(data.roomCode);
    });

    socket.on('player-joined', (data) => {
      console.log('[Preview] Player joined:', data.playerName);
      setPlayers(data.players);
    });

    socket.on('challenge-started', (data) => {
      console.log('[Preview] Challenge started:', data.challenge.gameType);
      console.log('[Preview] Challenge data:', data.challenge);
      setCurrentChallenge(data.challenge);
      setGameStarted(true);

      // For snake, initialize from challenge data immediately
      if (data.challenge.gameType === 'snake') {
        console.log('[Preview] Initializing snake state from challenge');
        setSnakeGameState({
          board: data.challenge.board,
          snakes: data.challenge.snakes,
          food: data.challenge.food,
          timeRemaining: data.challenge.timeLimit,
        });
      }
    });

    // Snake events
    socket.on('snake-game-start', (data) => {
      console.log('[Preview] Snake game started:', data);
      setSnakeGameState(data.gameState);
    });

    socket.on('snake-game-tick', (data) => {
      setSnakeGameState(data);
    });

    socket.on('snake-game-end', (data) => {
      console.log('[Preview] Snake game ended:', data.placements);
      // Keep showing final state for a moment
      setTimeout(() => {
        setGameStarted(false);
        setSnakeGameState(null);
        setCurrentChallenge(null);
      }, 5000);
    });

    // Connect4 events
    socket.on('connect4-update', (data) => {
      setConnect4Board(data.board);
      setConnect4CurrentPlayer(data.currentPlayer);
      setConnect4Winner(data.winner);
      setConnect4Teams(data.teams);
    });

    return () => {
      socket.off('preview-game-created');
      socket.off('player-joined');
      socket.off('challenge-started');
      socket.off('snake-game-start');
      socket.off('snake-game-tick');
      socket.off('snake-game-end');
      socket.off('connect4-update');
    };
  }, [socket, gameType]);

  const handleStartGame = () => {
    if (!socket || players.length < 1) return;
    console.log('[Preview] Starting game...');
    socket.emit('start-preview-game', { roomCode, gameType });
  };

  const handleRestartGame = () => {
    setGameStarted(false);
    setSnakeGameState(null);
    setConnect4Board(null);
    setConnect4Winner(null);
    setCurrentChallenge(null);
  };

  // Waiting for room creation
  if (!roomCode) {
    return (
      <div className="fixed inset-0 w-screen h-screen overflow-hidden flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">⏳</div>
          <div className="text-white text-2xl font-bold">Creating preview room...</div>
        </div>
      </div>
    );
  }

  // Game is running
  if (gameStarted && currentChallenge) {
    return (
      <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="h-full w-full flex flex-col p-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <div className={`px-4 py-2 rounded-xl bg-gradient-to-r ${config.color} text-white font-bold`}>
              {config.emoji} {config.name} Preview
            </div>
            <div className="text-white/60 font-mono">
              Room: {roomCode}
            </div>
            <button
              onClick={handleRestartGame}
              className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-all"
            >
              Stop Game
            </button>
          </div>

          {/* Game Content */}
          <div className="flex-1 flex items-center justify-center">
            {gameType === 'snake' && snakeGameState ? (
              <SnakeGameBoard
                snakes={snakeGameState.snakes}
                food={snakeGameState.food}
                board={snakeGameState.board}
                timeRemaining={snakeGameState.timeRemaining}
              />
            ) : (
              <div className="text-white text-2xl">
                Game type "{gameType}" display not yet implemented in preview
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Lobby - waiting for players
  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="h-full w-full flex flex-col items-center justify-center p-8">
        {/* Title */}
        <div className={`text-6xl mb-2`}>{config.emoji}</div>
        <h1 className={`text-4xl font-black mb-8 bg-gradient-to-r ${config.color} bg-clip-text text-transparent`}>
          {config.name} Preview
        </h1>

        {/* Join Section */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 mb-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="text-white/60 text-sm mb-2">Room Code</div>
            <div className="text-5xl font-black text-white tracking-widest">{roomCode}</div>
          </div>

          {/* QR Code */}
          <div className="flex justify-center mb-6">
            <div className="bg-white p-4 rounded-2xl">
              <QRCodeSVG value={getJoinUrl()} size={160} />
            </div>
          </div>

          <div className="text-center text-white/60 text-sm">
            Scan QR or go to <span className="text-white font-mono">{window.location.host}</span> and enter code
          </div>
        </div>

        {/* Players */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 mb-8 max-w-md w-full">
          <div className="text-white/60 text-sm mb-3">
            Players ({players.length})
          </div>
          {players.length === 0 ? (
            <div className="text-white/40 text-center py-4">
              Waiting for players to join...
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {players.map((player) => (
                <div
                  key={player.id}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold"
                >
                  {player.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Start Button */}
        <button
          onClick={handleStartGame}
          disabled={players.length < 1}
          className={`px-12 py-4 rounded-2xl font-black text-2xl transition-all ${
            players.length >= 1
              ? `bg-gradient-to-r ${config.color} text-white hover:scale-105 shadow-2xl`
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
        >
          {players.length < 1 ? 'Need at least 1 player' : 'Start Game'}
        </button>

        {/* Back link */}
        <a
          href="/"
          className="mt-8 text-white/40 hover:text-white/80 transition-colors"
        >
          ← Back to Home
        </a>
      </div>
    </div>
  );
}

export default PreviewGame;
