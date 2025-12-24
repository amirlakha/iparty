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
      <div className="fixed inset-0 w-screen h-screen overflow-hidden flex items-center justify-center"
        style={{backgroundImage: 'url(/src/assets/images/home-background.png)', backgroundSize: 'cover', backgroundPosition: 'center'}}>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative z-10 text-center">
          <div className="font-black text-white drop-shadow-2xl" style={{fontSize: 'clamp(1.5rem, 4vh, 3rem)'}}>
            Connecting...
          </div>
        </div>
      </div>
    );
  }

  // CHALLENGE_ACTIVE - Show input controller
  if (gameState === 'CHALLENGE_ACTIVE' && !submitted) {
    return (
      <div className="fixed inset-0 w-screen h-screen overflow-hidden"
        style={{backgroundImage: 'url(/src/assets/images/home-background.png)', backgroundSize: 'cover', backgroundPosition: 'center'}}>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>

        <div className="relative z-10 h-full w-full flex flex-col justify-center items-center px-4 md:px-8 py-4">
          <div className="w-full max-w-2xl flex flex-col" style={{maxHeight: '96vh', gap: 'clamp(1rem, 2vh, 2rem)'}}>

            {/* Header with glassmorphism */}
            <div className="relative bg-white/30 backdrop-blur-xl rounded-2xl border border-white/40 flex-shrink-0"
                 style={{
                   padding: 'clamp(1rem, 2vh, 1.5rem)',
                   boxShadow: `
                     inset 0 1px 1px 0 rgba(255, 255, 255, 0.6),
                     0 10px 20px rgba(0, 0, 0, 0.3)
                   `
                 }}>
              <div className="flex justify-between items-center">
                <div className="font-black text-white drop-shadow-lg" style={{fontSize: 'clamp(1.25rem, 3vh, 2rem)'}}>
                  {playerName}
                </div>
                <div className="font-black text-yellow-300 drop-shadow-lg" style={{fontSize: 'clamp(1.5rem, 3.5vh, 2.5rem)'}}>
                  ⭐ {myScore}
                </div>
              </div>
            </div>

            {/* Main content card */}
            <div className="relative flex-1 min-h-0 overflow-y-auto">
              <div className="relative bg-white/30 backdrop-blur-xl rounded-3xl h-full flex flex-col justify-center border border-white/40"
                   style={{
                     padding: 'clamp(1.5rem, 4vh, 3rem)',
                     boxShadow: `
                       inset 0 1px 1px 0 rgba(255, 255, 255, 0.6),
                       inset 0 -1px 1px 0 rgba(255, 255, 255, 0.2),
                       0 20px 40px rgba(0, 0, 0, 0.3),
                       0 10px 20px rgba(0, 0, 0, 0.2)
                     `,
                     background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.2) 100%)'
                   }}>
                <div className="absolute inset-0 rounded-3xl"
                     style={{
                       background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.3) 0%, transparent 50%, rgba(0, 0, 0, 0.05) 100%)',
                       pointerEvents: 'none'
                     }}></div>

                <div className="relative z-10">
                  {/* Instruction */}
                  <div className="text-center" style={{marginBottom: 'clamp(1.5rem, 3vh, 3rem)'}}>
                    <div style={{fontSize: 'clamp(3rem, 8vh, 6rem)', marginBottom: 'clamp(0.5rem, 1vh, 1rem)'}}>📺</div>
                    <h2 className="font-black text-purple-600" style={{fontSize: 'clamp(1.5rem, 3.5vh, 3rem)', marginBottom: 'clamp(0.5rem, 1vh, 1rem)', textShadow: '0 2px 4px rgba(255,255,255,0.9)'}}>
                      Watch the TV!
                    </h2>
                    <p className="text-gray-900 font-bold" style={{fontSize: 'clamp(1rem, 2vh, 1.5rem)', textShadow: '0 1px 2px rgba(255,255,255,0.9)'}}>
                      Answer the question below
                    </p>
                  </div>

                  {/* Answer Input */}
                  <div style={{display: 'flex', flexDirection: 'column', gap: 'clamp(0.75rem, 1.5vh, 1.5rem)'}}>
                    <input
                      type="text"
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="Type your answer..."
                      className="w-full bg-white rounded-2xl border-4 border-blue-400 focus:border-blue-600 focus:outline-none shadow-lg"
                      style={{padding: 'clamp(1rem, 2vh, 1.5rem)', fontSize: 'clamp(1.25rem, 2.5vh, 2rem)'}}
                      onKeyPress={(e) => e.key === 'Enter' && handleSubmitAnswer()}
                      autoFocus
                    />

                    <button
                      onClick={handleSubmitAnswer}
                      disabled={!answer.trim()}
                      className={`w-full rounded-2xl font-black shadow-2xl border-4 border-white transition-all ${
                        !answer.trim()
                          ? 'bg-gray-400 cursor-not-allowed opacity-50'
                          : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white active:scale-95'
                      }`}
                      style={{padding: 'clamp(1.25rem, 3vh, 2rem)', fontSize: 'clamp(1.5rem, 3vh, 2.5rem)'}}
                    >
                      Submit Answer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // CHALLENGE_ACTIVE - After submission (waiting for results)
  if (gameState === 'CHALLENGE_ACTIVE' && submitted) {
    return (
      <div className="fixed inset-0 w-screen h-screen overflow-hidden"
        style={{backgroundImage: 'url(/src/assets/images/home-background.png)', backgroundSize: 'cover', backgroundPosition: 'center'}}>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>

        <div className="relative z-10 h-full w-full flex flex-col justify-center items-center px-4 md:px-8 py-4">
          <div className="w-full max-w-2xl">
            {/* Header */}
            <div className="relative bg-white/30 backdrop-blur-xl rounded-2xl border border-white/40"
                 style={{
                   padding: 'clamp(1rem, 2vh, 1.5rem)',
                   marginBottom: 'clamp(1rem, 2vh, 2rem)',
                   boxShadow: 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.6), 0 10px 20px rgba(0, 0, 0, 0.3)'
                 }}>
              <div className="flex justify-between items-center">
                <div className="font-black text-white drop-shadow-lg" style={{fontSize: 'clamp(1.25rem, 3vh, 2rem)'}}>
                  {playerName}
                </div>
                <div className="font-black text-yellow-300 drop-shadow-lg" style={{fontSize: 'clamp(1.5rem, 3.5vh, 2.5rem)'}}>
                  ⭐ {myScore}
                </div>
              </div>
            </div>

            {/* Submitted confirmation */}
            <div className="relative bg-white/30 backdrop-blur-xl rounded-3xl border border-white/40"
                 style={{
                   padding: 'clamp(2rem, 6vh, 4rem)',
                   boxShadow: `
                     inset 0 1px 1px 0 rgba(255, 255, 255, 0.6),
                     0 20px 40px rgba(0, 0, 0, 0.3)
                   `,
                   background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.2) 100%)'
                 }}>
              <div className="text-center">
                <div className="animate-bounce" style={{fontSize: 'clamp(4rem, 12vh, 8rem)', marginBottom: 'clamp(1rem, 2vh, 2rem)'}}>✅</div>
                <h2 className="font-black text-green-600" style={{fontSize: 'clamp(2rem, 5vh, 4rem)', marginBottom: 'clamp(1rem, 2vh, 2rem)', textShadow: '0 2px 4px rgba(255,255,255,0.9)'}}>
                  Submitted!
                </h2>
                <p className="text-gray-900 font-bold" style={{fontSize: 'clamp(1.25rem, 2.5vh, 2rem)', marginBottom: 'clamp(1rem, 2vh, 1.5rem)', textShadow: '0 1px 2px rgba(255,255,255,0.9)'}}>
                  Your answer: <span className="text-blue-600">{answer}</span>
                </p>
                <p className="text-gray-800 font-semibold" style={{fontSize: 'clamp(1rem, 2vh, 1.5rem)', textShadow: '0 1px 2px rgba(255,255,255,0.9)'}}>
                  Waiting for other players...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // CHALLENGE_RESULTS - Show personal result
  if (gameState === 'CHALLENGE_RESULTS' && result) {
    return (
      <div className="fixed inset-0 w-screen h-screen overflow-hidden"
        style={{backgroundImage: 'url(/src/assets/images/home-background.png)', backgroundSize: 'cover', backgroundPosition: 'center'}}>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>

        <div className="relative z-10 h-full w-full flex flex-col justify-center items-center px-4 md:px-8 py-4">
          <div className="w-full max-w-2xl">
            {/* Header */}
            <div className="relative bg-white/30 backdrop-blur-xl rounded-2xl border border-white/40"
                 style={{
                   padding: 'clamp(1rem, 2vh, 1.5rem)',
                   marginBottom: 'clamp(1rem, 2vh, 2rem)',
                   boxShadow: 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.6), 0 10px 20px rgba(0, 0, 0, 0.3)'
                 }}>
              <div className="flex justify-between items-center">
                <div className="font-black text-white drop-shadow-lg" style={{fontSize: 'clamp(1.25rem, 3vh, 2rem)'}}>
                  {playerName}
                </div>
                <div className="font-black text-yellow-300 drop-shadow-lg" style={{fontSize: 'clamp(1.5rem, 3.5vh, 2.5rem)'}}>
                  ⭐ {myScore}
                </div>
              </div>
            </div>

            {/* Result card */}
            <div className="relative bg-white/30 backdrop-blur-xl rounded-3xl border border-white/40"
                 style={{
                   padding: 'clamp(2rem, 6vh, 4rem)',
                   boxShadow: `
                     inset 0 1px 1px 0 rgba(255, 255, 255, 0.6),
                     0 20px 40px rgba(0, 0, 0, 0.3)
                   `,
                   background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.2) 100%)'
                 }}>
              <div className="text-center">
                <div className={result.isCorrect ? 'animate-bounce' : ''} style={{fontSize: 'clamp(4rem, 12vh, 8rem)', marginBottom: 'clamp(1rem, 2vh, 2rem)'}}>
                  {result.isCorrect ? '✅' : '❌'}
                </div>
                <h2 className={`font-black ${result.isCorrect ? 'text-green-600' : 'text-red-600'}`}
                    style={{fontSize: 'clamp(2rem, 6vh, 5rem)', marginBottom: 'clamp(1.5rem, 3vh, 3rem)', textShadow: '0 2px 4px rgba(255,255,255,0.9)'}}>
                  {result.isCorrect ? 'Correct!' : 'Incorrect'}
                </h2>

                <div className="bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl shadow-xl border-4 border-white"
                     style={{padding: 'clamp(1.5rem, 3vh, 2.5rem)', marginBottom: 'clamp(1.5rem, 3vh, 2rem)'}}>
                  <div className="text-white font-bold" style={{fontSize: 'clamp(1.25rem, 2.5vh, 2rem)', marginBottom: 'clamp(0.5rem, 1vh, 1rem)'}}>You earned:</div>
                  <div className="font-black text-white drop-shadow-xl" style={{fontSize: 'clamp(3rem, 8vh, 6rem)'}}>
                    +{result.points}
                  </div>
                  <div className="text-white font-semibold" style={{fontSize: 'clamp(1rem, 2vh, 1.5rem)'}}>points</div>
                </div>

                {result.placement && result.placement <= 3 && (
                  <div className="bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-2xl shadow-xl border-4 border-white"
                       style={{padding: 'clamp(1rem, 2vh, 1.5rem)', marginBottom: 'clamp(1rem, 2vh, 1.5rem)'}}>
                    <div style={{fontSize: 'clamp(3rem, 6vh, 5rem)', marginBottom: 'clamp(0.5rem, 1vh, 1rem)'}}>
                      {result.placement === 1 ? '🥇' : result.placement === 2 ? '🥈' : '🥉'}
                    </div>
                    <div className="font-black text-gray-900" style={{fontSize: 'clamp(1.25rem, 2.5vh, 2rem)'}}>
                      {result.placement === 1 ? '1st' : result.placement === 2 ? '2nd' : '3rd'} Place!
                    </div>
                  </div>
                )}

                <p className="text-gray-800 font-bold" style={{fontSize: 'clamp(1rem, 2vh, 1.25rem)', textShadow: '0 1px 2px rgba(255,255,255,0.9)'}}>
                  Watch the TV for full results!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // DEFAULT - "Watch the TV" for all other states
  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden"
      style={{backgroundImage: 'url(/src/assets/images/home-background.png)', backgroundSize: 'cover', backgroundPosition: 'center'}}>
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      <div className="relative z-10 h-full w-full flex flex-col justify-center items-center px-4 md:px-8 py-4">
        <div className="w-full max-w-2xl flex flex-col" style={{gap: 'clamp(1rem, 2vh, 2rem)'}}>
          {/* Header */}
          <div className="relative bg-white/30 backdrop-blur-xl rounded-2xl border border-white/40 flex-shrink-0"
               style={{
                 padding: 'clamp(1rem, 2vh, 1.5rem)',
                 boxShadow: 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.6), 0 10px 20px rgba(0, 0, 0, 0.3)'
               }}>
            <div className="flex justify-between items-center">
              <div className="font-black text-white drop-shadow-lg" style={{fontSize: 'clamp(1.25rem, 3vh, 2rem)'}}>
                {playerName}
              </div>
              <div className="font-black text-yellow-300 drop-shadow-lg" style={{fontSize: 'clamp(1.5rem, 3.5vh, 2.5rem)'}}>
                ⭐ {myScore}
              </div>
            </div>
          </div>

          {/* Watch TV message */}
          <div className="text-center">
            <div className="animate-pulse" style={{fontSize: 'clamp(4rem, 10vh, 8rem)', marginBottom: 'clamp(1rem, 2vh, 2rem)'}}>📺</div>
            <h2 className="font-black text-yellow-300 drop-shadow-2xl"
                style={{
                  fontSize: 'clamp(2rem, 6vh, 5rem)',
                  marginBottom: 'clamp(1.5rem, 3vh, 3rem)',
                  WebkitTextStroke: '2px #1e40af',
                  paintOrder: 'stroke fill',
                  textShadow: '3px 3px 0px rgba(0,0,0,0.5)'
                }}>
              Watch the TV!
            </h2>

            <div className="relative bg-white/30 backdrop-blur-xl rounded-3xl border border-white/40"
                 style={{
                   padding: 'clamp(1.5rem, 4vh, 3rem)',
                   boxShadow: `
                     inset 0 1px 1px 0 rgba(255, 255, 255, 0.6),
                     0 20px 40px rgba(0, 0, 0, 0.3)
                   `,
                   background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.2) 100%)'
                 }}>
              {gameState === 'LOBBY' && (
                <div className="text-center">
                  <div style={{fontSize: 'clamp(3rem, 6vh, 5rem)', marginBottom: 'clamp(0.75rem, 1.5vh, 1.5rem)'}}>⏳</div>
                  <p className="font-black text-gray-900" style={{fontSize: 'clamp(1.5rem, 3vh, 2.5rem)', marginBottom: 'clamp(0.5rem, 1vh, 1rem)', textShadow: '0 2px 4px rgba(255,255,255,0.9)'}}>Waiting in Lobby</p>
                  <p className="font-bold text-gray-800" style={{fontSize: 'clamp(1rem, 2vh, 1.5rem)', marginBottom: 'clamp(0.5rem, 1vh, 1rem)', textShadow: '0 1px 2px rgba(255,255,255,0.9)'}}>Room: {roomCode}</p>
                  <p className="text-gray-700 font-semibold" style={{fontSize: 'clamp(0.875rem, 1.75vh, 1.25rem)', textShadow: '0 1px 2px rgba(255,255,255,0.9)'}}>The host will start the game soon...</p>
                </div>
              )}

              {gameState === 'INTRODUCTION' && (
                <div className="text-center">
                  <div style={{fontSize: 'clamp(3rem, 6vh, 5rem)', marginBottom: 'clamp(0.75rem, 1.5vh, 1.5rem)'}}>🎅</div>
                  <p className="font-black text-gray-900" style={{fontSize: 'clamp(1.5rem, 3vh, 2.5rem)', textShadow: '0 2px 4px rgba(255,255,255,0.9)'}}>Story Starting...</p>
                </div>
              )}

              {gameState === 'SECTION_INTRO' && (
                <div className="text-center">
                  <div style={{fontSize: 'clamp(3rem, 6vh, 5rem)', marginBottom: 'clamp(0.75rem, 1.5vh, 1.5rem)'}}>🎯</div>
                  <p className="font-black text-gray-900" style={{fontSize: 'clamp(1.5rem, 3vh, 2.5rem)', textShadow: '0 2px 4px rgba(255,255,255,0.9)'}}>New Section!</p>
                </div>
              )}

              {gameState === 'SECTION_COMPLETE' && (
                <div className="text-center">
                  <div style={{fontSize: 'clamp(3rem, 6vh, 6rem)', marginBottom: 'clamp(0.75rem, 1.5vh, 1.5rem)'}}>🎉</div>
                  <p className="font-black text-gray-900" style={{fontSize: 'clamp(1.5rem, 3vh, 2.5rem)', textShadow: '0 2px 4px rgba(255,255,255,0.9)'}}>Section Complete!</p>
                </div>
              )}

              {gameState === 'VICTORY' && (
                <div className="text-center">
                  <div style={{fontSize: 'clamp(4rem, 8vh, 7rem)', marginBottom: 'clamp(1rem, 2vh, 2rem)'}}>🏆</div>
                  <h3 className="font-black text-purple-600" style={{fontSize: 'clamp(2rem, 4vh, 3rem)', marginBottom: 'clamp(1rem, 2vh, 1.5rem)', textShadow: '0 2px 4px rgba(255,255,255,0.9)'}}>
                    You Win!
                  </h3>
                  <div className="font-black text-blue-600" style={{fontSize: 'clamp(3rem, 6vh, 6rem)', marginBottom: 'clamp(0.5rem, 1vh, 1rem)', textShadow: '0 2px 4px rgba(255,255,255,0.9)'}}>
                    {myScore}
                  </div>
                  <p className="text-gray-800 font-bold" style={{fontSize: 'clamp(1rem, 2vh, 1.5rem)', textShadow: '0 1px 2px rgba(255,255,255,0.9)'}}>Final Score</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlayerStoryScreen;
