import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

function PlayerScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [player] = useState(location.state?.player);
  const [roomCode] = useState(location.state?.roomCode);
  const [currentRound, setCurrentRound] = useState(null);
  const [roundNumber, setRoundNumber] = useState(0);
  const [myScore, setMyScore] = useState(0);
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [gameState, setGameState] = useState('waiting'); // waiting, active, finished

  useEffect(() => {
    if (!socket || !player || !roomCode) {
      navigate('/');
      return;
    }

    socket.on('round-started', ({ round, roundNumber: rNum }) => {
      setCurrentRound(round);
      setRoundNumber(rNum);
      setGameState('active');
      setSubmitted(false);
      setAnswer('');
    });

    socket.on('points-awarded', ({ scores }) => {
      setMyScore(scores[player.id] || 0);
      setGameState('waiting');
    });

    socket.on('game-finished', ({ scores }) => {
      setMyScore(scores[player.id] || 0);
      setGameState('finished');
    });

    socket.on('host-disconnected', () => {
      alert('Host disconnected. Game ended.');
      navigate('/');
    });

    return () => {
      socket.off('round-started');
      socket.off('points-awarded');
      socket.off('game-finished');
      socket.off('host-disconnected');
    };
  }, [socket, navigate, player, roomCode]);

  const handleSubmit = () => {
    if (!answer.trim()) return;

    socket.emit('submit-answer', {
      roomCode,
      answer,
      timeSpent: 0
    });

    setSubmitted(true);
  };

  if (!player) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (gameState === 'waiting') {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="card max-w-md w-full text-center">
          <div className="text-8xl mb-6 animate-bounce">⏳</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Get Ready!
          </h2>
          <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl p-6 mb-6">
            <div className="text-lg font-bold text-gray-700 mb-2">Your Score</div>
            <div className="text-6xl font-black text-primary">{myScore}</div>
          </div>
          <p className="text-xl text-gray-600">
            Waiting for the next round...
          </p>
        </div>
      </div>
    );
  }

  if (gameState === 'finished') {
    const POINTS_TO_CASH = 0.10; // Match the host screen conversion rate
    const cashEarned = (myScore * POINTS_TO_CASH).toFixed(2);

    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="card max-w-md w-full text-center">
          <div className="text-9xl mb-6 animate-bounce">🎉</div>
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Game Over!
          </h2>
          <div className="bg-gradient-to-r from-yellow-200 to-yellow-300 rounded-2xl p-8 mb-6 border-4 border-yellow-400">
            <div className="text-2xl font-bold text-gray-700 mb-2">Final Score</div>
            <div className="text-8xl font-black text-purple-600 mb-4">{myScore}</div>
            <div className="text-xl font-bold text-gray-700">points!</div>
          </div>

          <div className="bg-gradient-to-r from-green-100 to-green-200 rounded-2xl p-8 mb-6 border-4 border-green-400">
            <div className="text-2xl font-bold text-gray-700 mb-2">🎄 Your Christmas Present</div>
            <div className="text-8xl font-black text-green-600 mb-2">${cashEarned}</div>
            <div className="text-lg text-gray-600">({myScore} points × ${POINTS_TO_CASH.toFixed(2)})</div>
          </div>

          <p className="text-2xl text-gray-600 font-bold">
            Awesome job, {player.name}! 🎊
          </p>
        </div>
      </div>
    );
  }

  if (gameState === 'active' && currentRound) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="card max-w-md w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl p-4 mb-6 -mx-6 -mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold">Round {roundNumber + 1}</span>
              <span className="text-2xl font-black">{myScore} pts</span>
            </div>
            <div className="text-lg font-bold">{player.name}</div>
          </div>

          {/* Round Info */}
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">{currentRound.emoji}</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {currentRound.title}
            </h3>
            <p className="text-gray-600">
              {currentRound.description}
            </p>
          </div>

          {/* Challenge */}
          {!submitted ? (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
                <p className="text-xl font-bold text-gray-800 mb-4">
                  {currentRound.question || currentRound.prompt}
                </p>

                {currentRound.type === 'multiple-choice' && currentRound.options ? (
                  <div className="space-y-3">
                    {currentRound.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => setAnswer(option)}
                        className={`w-full p-4 rounded-lg font-bold text-lg transition-all ${
                          answer === option
                            ? 'bg-primary text-white scale-105'
                            : 'bg-white text-gray-700 hover:scale-105'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                ) : (
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    className="input-field resize-none h-32"
                    placeholder="Type your answer here..."
                  />
                )}
              </div>

              <button
                onClick={handleSubmit}
                disabled={!answer.trim()}
                className="w-full btn-primary text-xl py-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Answer
              </button>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-8xl mb-4 animate-bounce">✅</div>
              <h3 className="text-3xl font-bold text-green-600 mb-2">
                Submitted!
              </h3>
              <p className="text-xl text-gray-600">
                Waiting for other players...
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="card text-center">
        <div className="text-6xl mb-4 animate-spin">⏳</div>
        <p className="text-xl text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

export default PlayerScreen;
