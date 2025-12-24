import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

function CoordinatorScreen() {
  console.log('[CoordinatorScreen] COMPONENT MOUNTING');

  const location = useLocation();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { roomCode, coordinatorName } = location.state || {};

  console.log('[CoordinatorScreen] Props:', { roomCode, coordinatorName, hasSocket: !!socket });

  const [gameState, setGameState] = useState('LOBBY');
  const [players, setPlayers] = useState([]);
  const [scores, setScores] = useState({});
  const [currentRound, setCurrentRound] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);
  const [stateData, setStateData] = useState({});

  useEffect(() => {
    if (!socket || !roomCode) return;

    console.log('[Coordinator] useEffect - Room:', roomCode, 'Socket ID:', socket?.id);

    // Listen for game state updates
    socket.on('game-state-update', (data) => {
      console.log('[Coordinator] Game state update:', data);
      setGameState(data.state);
      setCurrentRound(data.round);
      setCurrentSection(data.section);
      setStateData(data);
    });

    // Listen for player joined
    socket.on('player-joined', (data) => {
      console.log('[Coordinator] Player joined:', data);
      setPlayers(data.players);
    });

    // Listen for game started
    socket.on('game-started', (data) => {
      console.log('[Coordinator] Game started:', data);
      setGameState('INTRODUCTION');
      setPlayers(data.game.players);
      setScores(data.game.scores);
    });

    // Listen for challenge results
    socket.on('challenge-results', (data) => {
      console.log('[Coordinator] Challenge results:', data);
      setScores(data.scores);
    });

    // Listen for answer submissions
    socket.on('answer-submitted', (data) => {
      console.log('[Coordinator] Answer submitted:', data);
    });

    return () => {
      socket.off('game-state-update');
      socket.off('player-joined');
      socket.off('game-started');
      socket.off('challenge-results');
      socket.off('answer-submitted');
    };
  }, [socket, roomCode]);

  const handleStartGame = () => {
    if (!socket || players.length === 0) {
      alert('Need at least one player to start!');
      return;
    }

    console.log('[Coordinator] Starting game...');
    socket.emit('start-game', { roomCode });
  };

  const getStateDisplay = () => {
    const stateNames = {
      'LOBBY': 'Waiting in Lobby',
      'INTRODUCTION': '🎄 Game Introduction',
      'SECTION_INTRO': `📖 Section ${currentSection} Story`,
      'CHALLENGE_ACTIVE': `🎮 Challenge ${currentRound} Active`,
      'CHALLENGE_RESULTS': `📊 Results - Round ${currentRound}`,
      'SECTION_COMPLETE': `✅ Section ${currentSection} Complete!`,
      'MAP_TRANSITION': '🗺️ Moving to Next Section',
      'VICTORY': '🎉 VICTORY! Christmas Saved!',
      'GAME_COMPLETE': '✨ Game Complete'
    };
    return stateNames[gameState] || gameState;
  };

  const getSectionName = () => {
    const sections = [
      '',
      '🎁 Toy Machine Workshop',
      '🦌 Reindeer Stable',
      '🎀 Gift Wrapping Station',
      '🍪 Cookie Kitchen',
      '🛷 Sleigh Launch Pad'
    ];
    return sections[currentSection] || '';
  };

  // Show loading states
  if (!roomCode) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-2xl text-white">No room code - please start from home</div>
      </div>
    );
  }

  if (!socket) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-2xl text-white">Connecting to server...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-green-600 to-blue-600 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-2xl p-6 mb-6">
          <h1 className="text-4xl font-bold text-center text-gray-800 mb-2">
            🎄 iParty - Coordinator View
          </h1>
          <div className="text-center">
            <span className="text-2xl font-mono bg-yellow-200 px-4 py-2 rounded">
              Room Code: {roomCode}
            </span>
          </div>
        </div>

        {/* Game State Display */}
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {getStateDisplay()}
            </h2>
            {currentSection > 0 && (
              <p className="text-xl text-gray-600">{getSectionName()}</p>
            )}
            {currentRound > 0 && (
              <p className="text-lg text-gray-500">
                Round {currentRound} of 15 • Progress: {Math.round((currentRound / 15) * 100)}%
              </p>
            )}
          </div>
        </div>

        {/* Players and Scores */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Players List */}
          <div className="bg-white rounded-lg shadow-xl p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Players ({players.length})
            </h3>
            {players.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Waiting for players to join...
              </p>
            ) : (
              <div className="space-y-2">
                {players.map((player) => (
                  <div
                    key={player.id}
                    className="flex justify-between items-center bg-gray-100 rounded p-3"
                  >
                    <div>
                      <span className="font-semibold">{player.name}</span>
                      <span className="text-gray-500 text-sm ml-2">
                        (Age {player.age})
                      </span>
                    </div>
                    <div className="text-lg font-bold text-blue-600">
                      {scores[player.id] || 0} pts
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Scoreboard */}
          <div className="bg-white rounded-lg shadow-xl p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              🏆 Scoreboard
            </h3>
            {players.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No scores yet
              </p>
            ) : (
              <div className="space-y-2">
                {[...players]
                  .sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0))
                  .map((player, index) => (
                    <div
                      key={player.id}
                      className={`flex justify-between items-center rounded p-3 ${
                        index === 0
                          ? 'bg-yellow-200'
                          : index === 1
                          ? 'bg-gray-300'
                          : index === 2
                          ? 'bg-orange-200'
                          : 'bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="text-2xl mr-2">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                        </span>
                        <span className="font-semibold">{player.name}</span>
                      </div>
                      <div className="text-xl font-bold text-blue-600">
                        {scores[player.id] || 0}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Start Game Button (only in lobby) */}
        {gameState === 'LOBBY' && (
          <div className="bg-white rounded-lg shadow-xl p-6 text-center">
            <button
              onClick={handleStartGame}
              disabled={players.length === 0}
              className={`text-2xl font-bold px-12 py-4 rounded-lg ${
                players.length === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              🎮 Start Game
            </button>
            {players.length === 0 && (
              <p className="text-gray-500 mt-4">
                Waiting for at least one player to join...
              </p>
            )}
          </div>
        )}

        {/* Debug Info */}
        <details className="bg-gray-800 text-white rounded-lg p-4 mt-6">
          <summary className="cursor-pointer font-bold">Debug Info</summary>
          <pre className="mt-2 text-xs overflow-auto">
            {JSON.stringify({ gameState, currentRound, currentSection, stateData, scores }, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}

export default CoordinatorScreen;
