import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

function PlayerStoryScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { roomCode, playerName, playerAge } = location.state || {};

  const [gameState, setGameState] = useState('LOBBY');
  const [myScore, setMyScore] = useState(0);
  const [currentRound, setCurrentRound] = useState(0);

  // Challenge state
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    console.log('[PlayerStoryScreen] Component mounted/updated - VERSION 2.0');
    console.log('[PlayerStoryScreen] Socket:', socket?.id, 'Room:', roomCode);

    if (!socket || !roomCode) return;

    socket.on('game-state-update', (data) => {
      console.log('[PlayerStoryScreen] Game state update:', data.state, 'Round:', data.round);
      setGameState(data.state);
      setCurrentRound(data.round || 0);

      // Reset on new challenge
      if (data.state === 'CHALLENGE_ACTIVE') {
        console.log('[PlayerStoryScreen] Challenge starting - resetting answer state');
        setSubmitted(false);
        setAnswer('');
        setResult(null);
        setStartTime(Date.now());
      }
    });

    socket.on('game-started', (data) => {
      console.log('[PlayerStoryScreen] Game started!');
      setGameState('INTRODUCTION');
    });

    socket.on('challenge-data', (data) => {
      console.log('[PlayerStoryScreen] Challenge received:', data.challenge?.question || data.challenge?.prompt);
      setStartTime(Date.now());
    });

    socket.on('challenge-results', (data) => {
      const myResult = data.results.find(r => r.playerId === socket.id);
      console.log('[PlayerStoryScreen] Challenge results received');
      if (myResult) {
        console.log('[PlayerStoryScreen] My result:', myResult.isCorrect ? '✅ CORRECT' : '❌ WRONG',
          `+${myResult.points} points`, myResult.placement ? `(${myResult.placement}th place)` : '');
        console.log('[PlayerStoryScreen] New score:', data.scores[socket.id]);
        setResult(myResult);
        setMyScore(data.scores[socket.id] || 0);
      }
    });

    socket.on('scores-updated', (data) => {
      console.log('[PlayerStoryScreen] Score updated:', data.reason, data.scores[socket.id]);
      setMyScore(data.scores[socket.id] || 0);
    });

    return () => {
      socket.off('game-state-update');
      socket.off('game-started');
      socket.off('challenge-data');
      socket.off('challenge-results');
      socket.off('scores-updated');
    };
  }, [socket, roomCode]);

  const handleSubmitAnswer = () => {
    if (!socket || submitted || !answer.trim()) return;

    const timeSpent = Date.now() - startTime;

    console.log('[PlayerStoryScreen] Submitting answer:', answer.trim(), `(${(timeSpent/1000).toFixed(1)}s)`);

    socket.emit('submit-answer', {
      roomCode,
      answer: answer.trim(),
      timeSpent
    });

    setSubmitted(true);
  };

  if (!roomCode || !socket) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-2xl text-white">Connecting...</div>
      </div>
    );
  }

  // CHALLENGE_ACTIVE - Show input controller
  if (gameState === 'CHALLENGE_ACTIVE' && !submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 p-6 flex flex-col">
        {/* Header */}
        <div className="bg-white bg-opacity-20 backdrop-blur rounded-xl p-4 mb-4">
          <div className="flex justify-between items-center text-white">
            <div className="text-xl font-bold">{playerName}</div>
            <div className="text-2xl font-bold">⭐ {myScore}</div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            {/* Instruction */}
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">📺</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Watch the TV!
              </h2>
              <p className="text-lg text-gray-600">
                Answer the question below
              </p>
            </div>

            {/* Answer Input */}
            <div className="space-y-4">
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer..."
                className="w-full text-2xl p-6 border-4 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                onKeyPress={(e) => e.key === 'Enter' && handleSubmitAnswer()}
                autoFocus
              />

              <button
                onClick={handleSubmitAnswer}
                disabled={!answer.trim()}
                className={`w-full text-3xl font-bold py-6 rounded-xl transition-all ${
                  !answer.trim()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95'
                }`}
              >
                Submit Answer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // CHALLENGE_ACTIVE - After submission (waiting for results)
  if (gameState === 'CHALLENGE_ACTIVE' && submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 to-emerald-600 p-6 flex flex-col">
        {/* Header */}
        <div className="bg-white bg-opacity-20 backdrop-blur rounded-xl p-4 mb-4">
          <div className="flex justify-between items-center text-white">
            <div className="text-xl font-bold">{playerName}</div>
            <div className="text-2xl font-bold">⭐ {myScore}</div>
          </div>
        </div>

        {/* Submitted confirmation */}
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-12 shadow-2xl text-center">
            <div className="text-9xl mb-6 animate-bounce">✅</div>
            <h2 className="text-4xl font-bold text-green-600 mb-4">
              Submitted!
            </h2>
            <p className="text-2xl text-gray-700 mb-6">
              Your answer: <span className="font-bold">{answer}</span>
            </p>
            <p className="text-xl text-gray-600">
              Waiting for other players...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // CHALLENGE_RESULTS - Show personal result
  if (gameState === 'CHALLENGE_RESULTS' && result) {
    return (
      <div className={`min-h-screen p-6 flex flex-col ${
        result.isCorrect
          ? 'bg-gradient-to-br from-green-600 to-emerald-600'
          : 'bg-gradient-to-br from-red-600 to-orange-600'
      }`}>
        {/* Header */}
        <div className="bg-white bg-opacity-20 backdrop-blur rounded-xl p-4 mb-4">
          <div className="flex justify-between items-center text-white">
            <div className="text-xl font-bold">{playerName}</div>
            <div className="text-2xl font-bold">⭐ {myScore}</div>
          </div>
        </div>

        {/* Result */}
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-12 shadow-2xl text-center max-w-md w-full">
            <div className={`text-9xl mb-6 ${result.isCorrect ? 'animate-bounce' : 'animate-shake'}`}>
              {result.isCorrect ? '✅' : '❌'}
            </div>
            <h2 className={`text-5xl font-black mb-6 ${
              result.isCorrect ? 'text-green-600' : 'text-red-600'
            }`}>
              {result.isCorrect ? 'Correct!' : 'Incorrect'}
            </h2>

            <div className="bg-blue-100 rounded-xl p-6 mb-6">
              <div className="text-2xl text-gray-700 mb-2">You earned:</div>
              <div className="text-6xl font-black text-blue-600">
                +{result.points}
              </div>
              <div className="text-xl text-gray-600 mt-2">points</div>
            </div>

            {result.placement && result.placement <= 3 && (
              <div className="bg-yellow-100 rounded-xl p-4">
                <div className="text-5xl mb-2">
                  {result.placement === 1 ? '🥇' : result.placement === 2 ? '🥈' : '🥉'}
                </div>
                <div className="text-xl font-bold text-gray-800">
                  {result.placement === 1 ? '1st' : result.placement === 2 ? '2nd' : '3rd'} Place!
                </div>
              </div>
            )}

            <p className="text-lg text-gray-600 mt-6">
              Watch the TV for full results!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // DEFAULT - "Watch the TV" for all other states
  return (
    <div
      className="min-h-screen flex flex-col p-4"
      style={{
        backgroundImage: 'url(/src/assets/images/home-background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-30"></div>

      {/* Header */}
      <div className="relative z-10 bg-white bg-opacity-95 backdrop-blur rounded-2xl p-4 mb-4 shadow-xl border-4 border-blue-500">
        <div className="flex justify-between items-center">
          <div className="text-xl font-bold text-gray-800">{playerName}</div>
          <div className="text-2xl font-bold text-blue-600">⭐ {myScore}</div>
        </div>
      </div>

      {/* Watch TV message */}
      <div className="relative z-10 flex-1 flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="text-7xl md:text-8xl mb-6 animate-pulse">📺</div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-8 drop-shadow-2xl">
            Watch the TV!
          </h2>

          {gameState === 'LOBBY' && (
            <div className="bg-white bg-opacity-95 rounded-2xl p-6 shadow-2xl border-4 border-green-500">
              <div className="text-5xl mb-3">⏳</div>
              <p className="text-2xl font-bold text-gray-800 mb-2">Waiting in Lobby</p>
              <p className="text-lg text-gray-600 mb-4">Room: {roomCode}</p>
              <p className="text-base text-gray-600">The host will start the game soon...</p>
            </div>
          )}

          {gameState === 'INTRODUCTION' && (
            <div className="bg-white bg-opacity-95 rounded-2xl p-6 shadow-2xl border-4 border-red-500">
              <div className="text-5xl mb-3">🎅</div>
              <p className="text-2xl font-bold text-gray-800">Story Starting...</p>
            </div>
          )}

          {gameState === 'SECTION_INTRO' && (
            <div className="bg-white bg-opacity-95 rounded-2xl p-6 shadow-2xl border-4 border-purple-500">
              <div className="text-5xl mb-3">🎯</div>
              <p className="text-2xl font-bold text-gray-800">New Section!</p>
            </div>
          )}

          {gameState === 'SECTION_COMPLETE' && (
            <div className="bg-white bg-opacity-95 rounded-2xl p-6 shadow-2xl border-4 border-yellow-500">
              <div className="text-6xl mb-4">🎉</div>
              <p className="text-2xl font-bold text-gray-800">Section Complete!</p>
            </div>
          )}

          {gameState === 'VICTORY' && (
            <div className="bg-white bg-opacity-95 rounded-2xl p-8 shadow-2xl border-4 border-yellow-500">
              <div className="text-7xl mb-4">🏆</div>
              <h3 className="text-3xl font-black text-gray-800 mb-4">
                You Win!
              </h3>
              <div className="text-6xl font-black text-blue-600 mb-2">
                {myScore}
              </div>
              <p className="text-xl text-gray-600">Final Score</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PlayerStoryScreen;
