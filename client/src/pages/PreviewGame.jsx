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

  // Timer and results state
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState([]);
  const [scores, setScores] = useState({});

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

      // For connect4, initialize from challenge data
      if (data.challenge.gameType === 'connect4') {
        console.log('[Preview] Initializing connect4 state from challenge');
        setConnect4Board(data.challenge.board);
        setConnect4CurrentPlayer(data.challenge.currentPlayer);
        setConnect4Teams(data.challenge.teams);
        setConnect4Winner(null);
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

    // Results events
    socket.on('challenge-results', (data) => {
      console.log('[Preview] Challenge results:', data);
      setResults(data.results || []);
      setScores(data.scores || {});
    });

    socket.on('preview-game-ended', (data) => {
      console.log('[Preview] Game ended:', data);
      setResults(data.results || []);
      setScores(data.scores || {});
      setShowResults(true);
    });

    return () => {
      socket.off('preview-game-created');
      socket.off('player-joined');
      socket.off('challenge-started');
      socket.off('snake-game-start');
      socket.off('snake-game-tick');
      socket.off('snake-game-end');
      socket.off('connect4-update');
      socket.off('challenge-results');
      socket.off('preview-game-ended');
    };
  }, [socket, gameType]);

  // Timer countdown for quick games
  useEffect(() => {
    if (!gameStarted || !currentChallenge) return;
    // Don't run timer for interactive games (snake/connect4 handle their own timing)
    if (currentChallenge.gameType === 'snake' || currentChallenge.gameType === 'connect4') return;

    setTimeRemaining(60);
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameStarted, currentChallenge]);

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
    setShowResults(false);
    setResults([]);
    setTimeRemaining(60);
  };

  const handlePlayAgain = () => {
    handleRestartGame();
    // Small delay then start again
    setTimeout(() => {
      handleStartGame();
    }, 500);
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

  // Results screen
  if (showResults) {
    return (
      <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="h-full w-full flex flex-col items-center justify-center p-8">
          <div className="text-6xl mb-4">🏆</div>
          <h1 className={`text-4xl font-black mb-8 bg-gradient-to-r ${config.color} bg-clip-text text-transparent`}>
            {config.name} Results
          </h1>

          {/* Results */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 mb-8 max-w-lg w-full">
            {results.length > 0 ? (
              <div className="space-y-3">
                {results.map((result, idx) => (
                  <div
                    key={idx}
                    className={`flex justify-between items-center p-3 rounded-xl ${
                      result.isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'
                    }`}
                  >
                    <span className="text-white font-bold">{result.playerName}</span>
                    <div className="flex items-center gap-3">
                      <span className={result.isCorrect ? 'text-green-400' : 'text-red-400'}>
                        {result.isCorrect ? '✓ Correct' : '✗ Wrong'}
                      </span>
                      {result.placement && (
                        <span className="bg-yellow-400 text-gray-900 px-2 py-1 rounded-lg font-bold text-sm">
                          #{result.placement}
                        </span>
                      )}
                      <span className="text-white/60">+{result.points} pts</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-white/60 text-center py-4">
                No submissions received
              </div>
            )}
          </div>

          {/* Scores */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 mb-8 max-w-lg w-full">
            <h3 className="text-white font-bold mb-3">Total Scores</h3>
            <div className="space-y-2">
              {players.map(player => (
                <div key={player.id} className="flex justify-between text-white">
                  <span>{player.name}</span>
                  <span className="font-bold">{scores[player.id] || 0} pts</span>
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handlePlayAgain}
              className={`px-8 py-3 rounded-xl font-bold text-lg bg-gradient-to-r ${config.color} text-white hover:scale-105 transition-all`}
            >
              Play Again
            </button>
            <button
              onClick={handleRestartGame}
              className="px-8 py-3 rounded-xl font-bold text-lg bg-gray-600 text-white hover:bg-gray-500 transition-all"
            >
              Back to Lobby
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Game is running
  if (gameStarted && currentChallenge) {
    const isQuickGame = !['snake', 'connect4'].includes(currentChallenge.gameType);

    return (
      <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="h-full w-full flex flex-col p-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <div className={`px-4 py-2 rounded-xl bg-gradient-to-r ${config.color} text-white font-bold`}>
              {config.emoji} {config.name} Preview
            </div>

            {/* Timer for quick games */}
            {isQuickGame && (
              <div className={`px-6 py-2 rounded-xl font-black text-2xl ${
                timeRemaining <= 10 ? 'bg-red-500 text-white animate-pulse' : 'bg-white/20 text-white'
              }`}>
                ⏱️ {timeRemaining}s
              </div>
            )}

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
          <div className="flex-1 flex items-center justify-center overflow-auto p-4">
            {/* SNAKE */}
            {gameType === 'snake' && snakeGameState ? (
              <SnakeGameBoard
                snakes={snakeGameState.snakes}
                food={snakeGameState.food}
                board={snakeGameState.board}
                timeRemaining={snakeGameState.timeRemaining}
              />
            ) : /* CONNECT 4 */
            gameType === 'connect4' && connect4Board ? (
              <div className="w-full max-w-4xl">
                {/* Teams */}
                <div className="flex justify-center gap-4 mb-4">
                  <div className="bg-red-500 px-6 py-2 rounded-xl text-white font-bold">
                    🔴 {connect4Teams?.red?.map(p => p.name).join(', ') || 'Red Team'}
                  </div>
                  <div className="bg-blue-500 px-6 py-2 rounded-xl text-white font-bold">
                    🔵 {connect4Teams?.blue?.map(p => p.name).join(', ') || 'Blue Team'}
                  </div>
                </div>

                {/* Current Turn / Winner */}
                {connect4Winner ? (
                  <div className={`text-center py-4 rounded-xl mb-4 ${connect4Winner === 'red' ? 'bg-red-500' : 'bg-blue-500'}`}>
                    <span className="text-white text-3xl font-black">
                      {connect4Winner === 'red' ? '🔴' : '🔵'} {connect4Winner.toUpperCase()} WINS!
                    </span>
                  </div>
                ) : connect4CurrentPlayer ? (
                  <div className={`text-center py-3 rounded-xl mb-4 ${connect4CurrentPlayer.team === 'red' ? 'bg-red-500' : 'bg-blue-500'}`}>
                    <span className="text-white text-2xl font-bold">
                      {connect4CurrentPlayer.team === 'red' ? '🔴' : '🔵'} {connect4CurrentPlayer.playerName}'s Turn
                    </span>
                  </div>
                ) : null}

                {/* Board */}
                <div className="flex justify-center">
                  <div className="bg-blue-900 p-4 rounded-2xl">
                    <div className="grid grid-cols-7 gap-2">
                      {connect4Board.map((row, rowIdx) =>
                        row.map((cell, colIdx) => (
                          <div
                            key={`${rowIdx}-${colIdx}`}
                            className={`w-12 h-12 rounded-full border-2 ${
                              cell === 'red' ? 'bg-red-500 border-red-700' :
                              cell === 'blue' ? 'bg-blue-500 border-blue-700' :
                              'bg-white border-gray-300'
                            }`}
                          />
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : /* SPEED MATH, TRUE/FALSE, TRIVIA */
            currentChallenge?.questions?.length > 0 ? (
              <div className="w-full max-w-4xl space-y-4">
                {currentChallenge.questions.map((tierData, idx) => (
                  <div
                    key={idx}
                    className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
                  >
                    {/* Players for this tier */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {tierData.players?.map((player, pIdx) => (
                        <span
                          key={pIdx}
                          className="bg-yellow-400 text-gray-900 font-bold px-3 py-1 rounded-full text-sm"
                        >
                          {player.name}
                        </span>
                      ))}
                    </div>

                    {/* Question Display */}
                    <div className="text-center">
                      {/* Speed Math */}
                      {gameType === 'speed-math' && (
                        <div className="text-white text-4xl font-black">
                          {tierData.question} = ?
                        </div>
                      )}

                      {/* True/False */}
                      {gameType === 'true-false' && (
                        <div className="text-white text-2xl font-bold">
                          {tierData.question}
                        </div>
                      )}

                      {/* Trivia */}
                      {gameType === 'trivia' && (
                        <div>
                          <div className="text-white text-xl font-bold mb-4">
                            {tierData.question}
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            {tierData.options?.map((opt, i) => (
                              <div
                                key={i}
                                className="bg-white/20 rounded-lg px-4 py-2 text-white font-semibold"
                              >
                                {String.fromCharCode(65 + i)}. {opt}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Spelling */}
                      {gameType === 'spelling' && (
                        <div className="text-white text-2xl font-bold">
                          🎧 Listen for your word on the TV!
                          <div className="text-lg text-white/60 mt-2">
                            Hint: {tierData.hint}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-white text-2xl">
                Loading {config.name}...
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
