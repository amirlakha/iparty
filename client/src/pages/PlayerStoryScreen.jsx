import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import christmasStory from '../data/christmasStory';

function PlayerStoryScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { roomCode, playerName, playerAge } = location.state || {};

  const [gameState, setGameState] = useState('LOBBY');
  const [currentRound, setCurrentRound] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);
  const [myScore, setMyScore] = useState(0);
  const [stateData, setStateData] = useState({});

  // Challenge state
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!socket || !roomCode) return;

    console.log('[Player] useEffect - Room:', roomCode, 'Socket ID:', socket?.id);

    // Request current game state when component mounts (in case we missed initial events)
    socket.emit('request-game-state', { roomCode });

    // Listen for game state updates
    socket.on('game-state-update', (data) => {
      console.log('[Player] Game state update:', data);
      setGameState(data.state);
      setCurrentRound(data.round);
      setCurrentSection(data.section);
      setStateData(data);

      // Reset challenge state on new challenge
      if (data.state === 'CHALLENGE_ACTIVE') {
        setSubmitted(false);
        setAnswer('');
        setResult(null);
        setStartTime(Date.now());
        // TODO: Request challenge data from server
      }
    });

    // Listen for game started
    socket.on('game-started', (data) => {
      console.log('[Player] Game started:', data);
      setGameState('INTRODUCTION');
    });

    // Listen for challenge results
    socket.on('challenge-results', (data) => {
      console.log('[Player] Challenge results:', data);
      const myResult = data.results.find(r => r.playerId === socket.id);
      if (myResult) {
        setResult(myResult);
        setMyScore(data.scores[socket.id] || 0);
      }
    });

    // Listen for answer submitted confirmation
    socket.on('answer-submitted', (data) => {
      console.log('[Player] Answer submitted confirmation:', data);
    });

    // Listen for challenge data
    socket.on('challenge-data', (data) => {
      console.log('[Player] Challenge data received:', data);
      setCurrentChallenge(data.challenge);
      setStartTime(Date.now());
      setSubmitted(false);
      setAnswer('');
      setResult(null);
    });

    return () => {
      socket.off('game-state-update');
      socket.off('game-started');
      socket.off('challenge-results');
      socket.off('answer-submitted');
      socket.off('challenge-data');
    };
  }, [socket, roomCode]);

  const handleSubmitAnswer = () => {
    if (!socket || submitted || !answer) return;

    const timeSpent = Date.now() - startTime;

    console.log('[Player] Submitting answer:', answer);
    socket.emit('submit-answer', {
      roomCode,
      answer,
      timeSpent
    });

    setSubmitted(true);
  };

  const getStateDisplay = () => {
    const section = christmasStory.sections[currentSection - 1];

    switch (gameState) {
      case 'LOBBY':
        return (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Waiting for game to start...
            </h2>
            <div className="text-xl text-white">
              Room: <span className="font-mono bg-white text-gray-800 px-3 py-1 rounded">{roomCode}</span>
            </div>
          </div>
        );

      case 'INTRODUCTION':
        return (
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white mb-4">
              🎄 {christmasStory.title}
            </h2>
            <div className="bg-white bg-opacity-90 rounded-lg p-6 max-w-2xl mx-auto">
              {christmasStory.introduction.narrative.map((line, i) => (
                <p key={i} className="text-lg text-gray-800 mb-2">
                  {line}
                </p>
              ))}
            </div>
          </div>
        );

      case 'SECTION_INTRO':
        return section ? (
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white mb-4">
              {section.emoji} {section.name}
            </h2>
            <div className="bg-white bg-opacity-90 rounded-lg p-6 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                {section.storyIntro.title}
              </h3>
              {section.storyIntro.narrative.map((line, i) => (
                <p key={i} className="text-lg text-gray-700 mb-2">
                  {line}
                </p>
              ))}
            </div>
          </div>
        ) : null;

      case 'CHALLENGE_ACTIVE':
        return (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              🎮 Challenge {currentRound}
            </h2>
            <div className="bg-white rounded-lg p-8 max-w-2xl mx-auto">
              <div className="mb-6">
                <p className="text-2xl font-bold text-gray-800 mb-4">
                  {currentChallenge ? currentChallenge.question : 'Loading challenge...'}
                </p>
                {!currentChallenge && (
                  <p className="text-gray-600">
                    Please wait...
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Your answer..."
                  disabled={submitted}
                  className="w-full text-xl p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none disabled:bg-gray-200"
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmitAnswer()}
                />

                <button
                  onClick={handleSubmitAnswer}
                  disabled={submitted || !answer}
                  className={`w-full text-xl font-bold py-4 rounded-lg ${
                    submitted || !answer
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {submitted ? '✓ Submitted!' : 'Submit Answer'}
                </button>
              </div>
            </div>
          </div>
        );

      case 'CHALLENGE_RESULTS':
        return (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              📊 Results - Round {currentRound}
            </h2>
            <div className="bg-white rounded-lg p-8 max-w-2xl mx-auto">
              {result ? (
                <div>
                  <div className={`text-6xl mb-4 ${result.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    {result.isCorrect ? '✓' : '✗'}
                  </div>
                  <p className="text-2xl font-bold text-gray-800 mb-2">
                    {result.isCorrect ? 'Correct!' : 'Incorrect'}
                  </p>
                  <p className="text-3xl font-bold text-blue-600 mb-4">
                    +{result.points} points
                  </p>
                  {result.placement && result.placement <= 3 && (
                    <p className="text-xl text-gray-700">
                      {result.placement === 1 ? '🥇' : result.placement === 2 ? '🥈' : '🥉'}
                      {' '}
                      {result.placement === 1 ? '1st' : result.placement === 2 ? '2nd' : '3rd'} place!
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xl text-gray-600">Waiting for results...</p>
              )}
            </div>
          </div>
        );

      case 'SECTION_COMPLETE':
        return section ? (
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white mb-4">
              ✅ {section.name} Complete!
            </h2>
            <div className="bg-white bg-opacity-90 rounded-lg p-6 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                {section.successMessage.title}
              </h3>
              {section.successMessage.narrative.map((line, i) => (
                <p key={i} className="text-lg text-gray-700 mb-2">
                  {line}
                </p>
              ))}
            </div>
          </div>
        ) : null;

      case 'MAP_TRANSITION':
        return (
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white mb-4">
              🗺️ Moving to Next Section...
            </h2>
            <div className="text-xl text-white">
              Progress: {Math.round((currentRound / 15) * 100)}%
            </div>
          </div>
        );

      case 'VICTORY':
        return (
          <div className="text-center">
            <h2 className="text-5xl font-bold text-white mb-4">
              🎉 CHRISTMAS IS SAVED! 🎉
            </h2>
            <div className="bg-white bg-opacity-90 rounded-lg p-8 max-w-2xl mx-auto">
              <p className="text-3xl font-bold text-gray-800 mb-4">
                Congratulations!
              </p>
              <p className="text-2xl text-blue-600 mb-4">
                Final Score: {myScore} points
              </p>
              {christmasStory.victory.narrative.map((line, i) => (
                <p key={i} className="text-lg text-gray-700 mb-2">
                  {line}
                </p>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center text-white">
            <p className="text-2xl">{gameState}</p>
          </div>
        );
    }
  };

  // Show loading states
  if (!roomCode) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-2xl text-white">No room code - please join from home</div>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Player Info Header */}
        <div className="bg-white bg-opacity-20 backdrop-blur rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center text-white">
            <div className="text-xl font-bold">{playerName}</div>
            <div className="text-2xl font-bold">⭐ {myScore}</div>
          </div>
        </div>

        {/* Main Content */}
        <div className="min-h-[500px] flex items-center justify-center">
          {getStateDisplay()}
        </div>

        {/* Debug Info */}
        <details className="bg-gray-800 text-white rounded-lg p-4 mt-6">
          <summary className="cursor-pointer font-bold">Debug Info</summary>
          <pre className="mt-2 text-xs overflow-auto">
            {JSON.stringify({ gameState, currentRound, currentSection, myScore, submitted, result }, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}

export default PlayerStoryScreen;
