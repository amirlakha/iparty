import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { generateRounds } from '../utils/roundGenerator';

function HostScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [game, setGame] = useState(location.state?.game);
  const [roomCode, setRoomCode] = useState(location.state?.roomCode);
  const [gameState, setGameState] = useState('lobby'); // lobby, playing, finished
  const [currentRound, setCurrentRound] = useState(null);
  const [roundNumber, setRoundNumber] = useState(0);
  const [scores, setScores] = useState({});
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    if (!socket || !roomCode) {
      navigate('/');
      return;
    }

    socket.on('player-joined', ({ player, players }) => {
      setGame(prev => ({ ...prev, players }));
    });

    socket.on('player-left', ({ players }) => {
      setGame(prev => ({ ...prev, players }));
    });

    socket.on('answer-submitted', ({ playerId, totalSubmissions }) => {
      setSubmissions(prev => [...prev, playerId]);
    });

    socket.on('points-awarded', ({ scores: newScores }) => {
      setScores(newScores);
    });

    return () => {
      socket.off('player-joined');
      socket.off('player-left');
      socket.off('answer-submitted');
      socket.off('points-awarded');
    };
  }, [socket, navigate, roomCode]);

  const assignRandomTeams = () => {
    const players = [...game.players];
    const shuffled = players.sort(() => Math.random() - 0.5);
    const midpoint = Math.ceil(shuffled.length / 2);
    const teams = [
      shuffled.slice(0, midpoint).map(p => p.id),
      shuffled.slice(midpoint).map(p => p.id)
    ];

    socket.emit('assign-teams', { roomCode, teams });
  };

  const startGame = () => {
    const rounds = generateRounds(game.players);
    socket.emit('start-game', { roomCode, rounds });

    setGameState('playing');
    setTimeout(() => {
      setCurrentRound(rounds[0]);
      setRoundNumber(0);
    }, 3000);

    // Initialize scores
    const initialScores = {};
    game.players.forEach(p => {
      initialScores[p.id] = 0;
    });
    setScores(initialScores);
  };

  const awardPoints = (pointsArray) => {
    socket.emit('award-points', { roomCode, points: pointsArray });
  };

  const nextRound = () => {
    setSubmissions([]);
    socket.emit('next-round', { roomCode });
  };

  const handleRoundComplete = (winners) => {
    // Award participation points to everyone
    const pointsArray = game.players.map(p => ({
      playerId: p.id,
      amount: 10,
      reason: 'participation'
    }));

    // Award completion points
    game.players.forEach(p => {
      pointsArray.push({
        playerId: p.id,
        amount: 15,
        reason: 'completion'
      });
    });

    // Award winner bonus
    winners.forEach(winnerId => {
      pointsArray.push({
        playerId: winnerId,
        amount: 25,
        reason: 'winner'
      });
    });

    awardPoints(pointsArray);

    setTimeout(() => {
      nextRound();
    }, 4000);
  };

  if (!game) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (gameState === 'lobby') {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="text-9xl mb-4 animate-bounce">🎉</div>
            <h1 className="text-7xl font-black text-white mb-4 drop-shadow-lg">
              iParty!
            </h1>
            <div className="bg-white rounded-3xl p-6 inline-block shadow-2xl">
              <p className="text-3xl font-bold text-gray-700 mb-2">Room Code:</p>
              <p className="text-8xl font-black text-primary tracking-wider">{roomCode}</p>
            </div>
          </div>

          <div className="card mb-8">
            <h2 className="text-4xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <span>👥</span> Players ({game.players?.length || 0})
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {game.players?.map((p) => (
                <div
                  key={p.id}
                  className="bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-xl border-4 border-purple-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-5xl">👤</div>
                    <div>
                      <div className="font-bold text-2xl text-gray-800">{p.name}</div>
                      <div className="text-lg text-gray-600">Age: {p.age}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {game.players?.length >= 2 && (
              <div className="space-y-4">
                <button
                  onClick={assignRandomTeams}
                  className="w-full btn-secondary text-2xl py-4"
                >
                  🎲 Randomly Assign Teams
                </button>
                <button
                  onClick={startGame}
                  className="w-full btn-primary text-3xl py-6 animate-pulse"
                >
                  🚀 START GAME!
                </button>
              </div>
            )}

            {game.players?.length < 2 && (
              <div className="text-center text-xl text-gray-500 p-8 bg-gray-100 rounded-xl">
                Waiting for at least 2 players to join...
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'playing' && currentRound) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header with scores */}
          <div className="bg-white rounded-3xl p-6 mb-8 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-3xl font-bold text-gray-800">
                Round {roundNumber + 1}
              </h2>
              <div className="text-2xl font-bold text-primary">
                {currentRound.type}
              </div>
            </div>

            {/* Scoreboard */}
            <div className="grid grid-cols-4 gap-4">
              {game.players.map(p => (
                <div key={p.id} className="text-center p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                  <div className="text-2xl font-bold text-gray-800">{p.name}</div>
                  <div className="text-4xl font-black text-primary">{scores[p.id] || 0}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Round Content */}
          <div className="card text-center">
            <div className="text-7xl mb-6">{currentRound.emoji}</div>
            <h3 className="text-5xl font-bold text-gray-800 mb-4">
              {currentRound.title}
            </h3>
            <p className="text-3xl text-gray-600 mb-8">
              {currentRound.description}
            </p>

            {/* Challenge-specific display would go here */}
            <div className="bg-gray-100 rounded-xl p-8 mb-6">
              <p className="text-2xl font-bold text-gray-700 mb-4">
                {currentRound.question || currentRound.prompt}
              </p>

              {submissions.length > 0 && (
                <div className="text-xl text-gray-600">
                  {submissions.length} / {currentRound.participants?.length || game.players.length} submitted
                </div>
              )}
            </div>

            <button
              onClick={() => handleRoundComplete([])}
              className="btn-primary text-2xl px-12 py-4"
            >
              Complete Round & Award Points
            </button>
          </div>
        </div>
      </div>
    );
  }

  const POINTS_TO_CASH = 0.10; // $0.10 per point - adjust as needed

  return (
    <div className="flex items-center justify-center min-h-screen p-8">
      <div className="card text-center max-w-4xl w-full">
        <div className="text-9xl mb-6 animate-bounce">🎊</div>
        <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4">
          Game Over!
        </h1>
        <p className="text-3xl text-gray-600 mb-8">
          🎄 Merry Christmas! Here are your presents! 🎁
        </p>

        <div className="bg-gradient-to-br from-green-50 to-red-50 rounded-2xl p-8 mb-8 border-4 border-green-300">
          <div className="text-2xl font-bold text-gray-700 mb-4">
            💰 Points to Cash Conversion: ${POINTS_TO_CASH.toFixed(2)} per point
          </div>
        </div>

        <div className="space-y-4 mb-8">
          {game.players
            .sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0))
            .map((p, index) => {
              const points = scores[p.id] || 0;
              const cash = (points * POINTS_TO_CASH).toFixed(2);
              return (
                <div
                  key={p.id}
                  className={`p-8 rounded-2xl ${
                    index === 0
                      ? 'bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-300 border-4 border-yellow-600 shadow-2xl scale-105'
                      : 'bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-6xl">
                        {index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🎯'}
                      </div>
                      <div>
                        <div className="text-4xl font-bold text-gray-800">{p.name}</div>
                        <div className="text-xl text-gray-600">Age {p.age}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-5xl font-black text-primary mb-2">
                        {points} pts
                      </div>
                      <div className="text-6xl font-black text-green-600">
                        ${cash}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl p-8">
          <div className="text-5xl mb-4">🎉🎊🎁</div>
          <p className="text-3xl font-bold">
            Total Christmas Money: ${game.players.reduce((total, p) => total + (scores[p.id] || 0) * POINTS_TO_CASH, 0).toFixed(2)}
          </p>
          <p className="text-xl mt-4">
            Thanks for playing iParty! 🎮
          </p>
        </div>
      </div>
    </div>
  );
}

export default HostScreen;
