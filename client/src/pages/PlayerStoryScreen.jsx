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
  const [currentQuestion, setCurrentQuestion] = useState(null); // Store player's specific question
  const [challengeData, setChallengeData] = useState(null); // Store full challenge data (for options, gameType, etc.)

  // Spelling bee audio state
  const [spellingPhase, setSpellingPhase] = useState(null); // 'listen', 'pause', 'answer'
  const [spellingTimeRemaining, setSpellingTimeRemaining] = useState(0);
  const [currentListeningTier, setCurrentListeningTier] = useState(null);

  // Connect 4 state
  const [connect4MyTeam, setConnect4MyTeam] = useState(null); // 'red' or 'blue'
  const [connect4CurrentPlayer, setConnect4CurrentPlayer] = useState(null);
  const [connect4Winner, setConnect4Winner] = useState(null);
  const [connect4IsDraw, setConnect4IsDraw] = useState(false);
  const [connect4Teams, setConnect4Teams] = useState(null);

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
        setCurrentQuestion(null);
        setChallengeData(null);
        setStartTime(Date.now());
      }
    });

    socket.on('game-started', (data) => {
      console.log('[PlayerStoryScreen] Game started!');
      setGameState('INTRODUCTION');
    });

    socket.on('challenge-data', (data) => {
      console.log('[PlayerStoryScreen] Challenge received:', data.question, 'Type:', data.operation || 'other');
      setCurrentQuestion(data.question);
      setChallengeData(data); // Store full data for options, hints, etc.
      setStartTime(Date.now());

      // Initialize spelling bee phase if it's a spelling challenge
      if (data.hint && data.phases) {
        console.log('[PlayerStoryScreen] Spelling bee detected, initializing to listen phase');
        setSpellingPhase('listen');
      } else {
        setSpellingPhase(null);
      }
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

    socket.on('challenge-started', (data) => {
      // Initialize Connect 4 state when game starts
      if (data.challenge && data.challenge.gameType === 'connect4') {
        console.log('[PlayerStoryScreen] Connect 4 challenge started');
        const teams = data.challenge.teams;
        // Determine which team this player is on
        const isRed = teams.red.some(p => p.id === socket.id);
        const myTeam = isRed ? 'red' : 'blue';
        console.log(`[PlayerStoryScreen] I am on ${myTeam} team`);

        setConnect4MyTeam(myTeam);
        setConnect4CurrentPlayer(data.challenge.currentPlayer);
        setConnect4Winner(null);
        setConnect4IsDraw(false);
        setConnect4Teams(teams);
        setChallengeData(data.challenge); // Store challenge data
      }
    });

    socket.on('connect4-update', (data) => {
      console.log('[PlayerStoryScreen] Connect 4 board updated');
      setConnect4CurrentPlayer(data.currentPlayer);
      setConnect4Winner(data.winner);
      setConnect4IsDraw(data.isDraw);
      setConnect4Teams(data.teams);
      if (data.scores) {
        setMyScore(data.scores[socket.id] || 0);
      }
    });

    return () => {
      socket.off('game-state-update');
      socket.off('game-started');
      socket.off('challenge-data');
      socket.off('challenge-results');
      socket.off('scores-updated');
      socket.off('challenge-started');
      socket.off('connect4-update');
    };
  }, [socket, roomCode]);

  // Spelling Bee Phase Sync: Listen for phase changes from Coordinator (TV)
  useEffect(() => {
    if (!socket || !challengeData || challengeData.gameType !== 'spelling') return;

    let countdownInterval = null;

    const handlePhaseChange = ({ phase, duration }) => {
      console.log(`[SpellingBee Player] Phase change from TV: ${phase}${duration ? ` (${duration}s)` : ''}`);

      // Clear any existing countdown
      if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
      }

      // Update phase
      setSpellingPhase(phase);

      // Start countdown if duration provided
      if (duration) {
        let remaining = duration;
        setSpellingTimeRemaining(remaining);

        // Start answer timer when entering answer phase
        if (phase === 'answer') {
          setStartTime(Date.now());
        }

        countdownInterval = setInterval(() => {
          remaining--;
          setSpellingTimeRemaining(remaining);

          if (remaining <= 0) {
            clearInterval(countdownInterval);
            countdownInterval = null;

            // Auto-submit if time runs out in answer phase
            if (phase === 'answer' && !submitted && answer.trim()) {
              handleSubmitAnswer();
            }
          }
        }, 1000);
      }
    };

    socket.on('spelling-phase-change', handlePhaseChange);

    return () => {
      socket.off('spelling-phase-change', handlePhaseChange);
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
  }, [socket, challengeData, submitted, answer]);

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

  const handleConnect4Move = (column) => {
    if (!socket) return;

    console.log(`[PlayerStoryScreen] Placing piece in column ${column}`);

    socket.emit('connect4-move', {
      roomCode,
      column
    });
  };

  if (!roomCode || !socket) {
    return (
      <div className="fixed inset-0 w-screen h-screen overflow-hidden flex items-center justify-center"
        style={{backgroundImage: 'url(/images/home-background.png)', backgroundSize: 'cover', backgroundPosition: 'center'}}>
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
        style={{backgroundImage: 'url(/images/home-background.png)', backgroundSize: 'cover', backgroundPosition: 'center'}}>
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
                  {/* CONNECT 4 GAME */}
                  {challengeData?.gameType === 'connect4' ? (
                    <div className="text-center">
                      {/* Icon */}
                      <div style={{fontSize: 'clamp(2rem, 6vh, 4rem)', marginBottom: 'clamp(0.5rem, 1vh, 1rem)'}}>
                        {connect4MyTeam === 'red' ? '🔴' : '🔵'}
                      </div>

                      {/* Team Assignment */}
                      <div className={`rounded-2xl p-4 mb-6 ${connect4MyTeam === 'red' ? 'bg-red-500' : 'bg-blue-500'}`}>
                        <div className="font-black text-white" style={{fontSize: 'clamp(1.5rem, 4vh, 3rem)'}}>
                          You are on {connect4MyTeam?.toUpperCase()} TEAM
                        </div>
                      </div>

                      {/* Game Status */}
                      {connect4Winner ? (
                        <div className={`rounded-2xl p-6 mb-6 ${
                          connect4Winner === connect4MyTeam ? 'bg-green-500' : 'bg-gray-500'
                        }`}>
                          <div className="font-black text-white" style={{fontSize: 'clamp(1.75rem, 4.5vh, 3.5rem)'}}>
                            {connect4Winner === connect4MyTeam ? '🎉 YOUR TEAM WINS! 🎉' : 'You Lost'}
                          </div>
                          <div className="text-white font-bold mt-2" style={{fontSize: 'clamp(1rem, 2vh, 1.5rem)'}}>
                            {connect4Winner === connect4MyTeam ? '+30 points' : '0 points'}
                          </div>
                        </div>
                      ) : connect4IsDraw ? (
                        <div className="bg-yellow-500 rounded-2xl p-6 mb-6">
                          <div className="font-black text-white" style={{fontSize: 'clamp(1.75rem, 4.5vh, 3.5rem)'}}>
                            🤝 IT'S A DRAW!
                          </div>
                          <div className="text-white font-bold mt-2" style={{fontSize: 'clamp(1rem, 2vh, 1.5rem)'}}>
                            +10 points
                          </div>
                        </div>
                      ) : connect4CurrentPlayer ? (
                        <>
                          {connect4CurrentPlayer.playerId === socket?.id ? (
                            /* It's my turn */
                            <div className="bg-green-500 rounded-2xl p-4 mb-4">
                              <div className="font-black text-white animate-pulse" style={{fontSize: 'clamp(1.5rem, 4vh, 3rem)'}}>
                                YOUR TURN!
                              </div>
                              <div className="text-white font-bold mt-2" style={{fontSize: 'clamp(0.875rem, 1.5vh, 1.25rem)'}}>
                                Choose a column
                              </div>
                            </div>
                          ) : (
                            /* Waiting for other player */
                            <div className="bg-gray-600 rounded-2xl p-4 mb-4">
                              <div className="font-black text-white" style={{fontSize: 'clamp(1.25rem, 3.5vh, 2.5rem)'}}>
                                {connect4CurrentPlayer.playerName}'s Turn
                              </div>
                              <div className="text-white font-bold mt-2" style={{fontSize: 'clamp(0.875rem, 1.5vh, 1.25rem)'}}>
                                Wait for your turn...
                              </div>
                            </div>
                          )}
                        </>
                      ) : null}

                      {/* Column Selector - Only show if it's my turn and game not ended */}
                      {!connect4Winner && !connect4IsDraw && connect4CurrentPlayer?.playerId === socket?.id && (
                        <div className="grid grid-cols-7 gap-2">
                          {[0, 1, 2, 3, 4, 5, 6].map(col => (
                            <button
                              key={col}
                              onClick={() => handleConnect4Move(col)}
                              className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-black rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all"
                              style={{
                                padding: 'clamp(1rem, 3vh, 2rem)',
                                fontSize: 'clamp(1.5rem, 4vh, 3rem)'
                              }}
                            >
                              {col + 1}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Watch TV message if waiting */}
                      {!connect4Winner && !connect4IsDraw && connect4CurrentPlayer?.playerId !== socket?.id && (
                        <div className="text-gray-800 font-bold mt-6" style={{fontSize: 'clamp(1rem, 2vh, 1.5rem)', textShadow: '0 1px 2px rgba(255,255,255,0.9)'}}>
                          Watch the TV screen to see the game!
                        </div>
                      )}
                    </div>
                  ) : (
                    /* OTHER GAME TYPES */
                    <>
                      {/* Question Display */}
                      <div className="text-center" style={{marginBottom: 'clamp(1.5rem, 3vh, 3rem)'}}>
                        {/* Icon based on game type */}
                        <div style={{fontSize: 'clamp(2rem, 6vh, 4rem)', marginBottom: 'clamp(0.5rem, 1vh, 1rem)'}}>
                          {challengeData?.operation && '🧮'}
                          {challengeData?.options && '🎯'}
                          {challengeData?.hint && '✏️'}
                          {(!challengeData?.operation && !challengeData?.options && !challengeData?.hint && currentQuestion) && '✅'}
                          {!currentQuestion && '📺'}
                        </div>

                        {currentQuestion ? (
                      <>
                        {/* Speed Math: show equation */}
                        {challengeData?.operation && (
                          <>
                            <h2 className="font-black text-gray-900" style={{fontSize: 'clamp(2rem, 5vh, 4rem)', marginBottom: 'clamp(0.5rem, 1vh, 1rem)', textShadow: '0 2px 4px rgba(255,255,255,0.9)'}}>
                              {currentQuestion} = ?
                            </h2>
                            <p className="text-purple-600 font-bold" style={{fontSize: 'clamp(0.875rem, 1.5vh, 1.25rem)', textShadow: '0 1px 2px rgba(255,255,255,0.9)'}}>
                              Enter your answer
                            </p>
                          </>
                        )}

                        {/* Trivia: show question + options */}
                        {challengeData?.options && (
                          <>
                            <h2 className="font-black text-gray-900 mb-3" style={{fontSize: 'clamp(1.25rem, 3vh, 2.5rem)', textShadow: '0 2px 4px rgba(255,255,255,0.9)'}}>
                              {currentQuestion}
                            </h2>
                            <div className="space-y-2 mb-3">
                              {challengeData.options.map((opt, i) => (
                                <button
                                  key={i}
                                  onClick={() => setAnswer(opt)}
                                  className={`w-full rounded-xl font-bold px-3 py-2 transition-all ${
                                    answer === opt
                                      ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white scale-105 shadow-xl'
                                      : 'bg-white/60 text-gray-900 hover:bg-white/80'
                                  }`}
                                  style={{fontSize: 'clamp(1rem, 2vh, 1.5rem)'}}
                                >
                                  {String.fromCharCode(65 + i)}. {opt}
                                </button>
                              ))}
                            </div>
                            <p className="text-purple-600 font-bold" style={{fontSize: 'clamp(0.75rem, 1.25vh, 1rem)', textShadow: '0 1px 2px rgba(255,255,255,0.9)'}}>
                              Tap an option, then submit
                            </p>
                          </>
                        )}

                        {/* Spelling Bee: Audio-based with 3 phases */}
                        {challengeData?.hint && challengeData?.phases && (
                          <>
                            {/* PHASE 1: LISTEN */}
                            {spellingPhase === 'listen' && (
                              <>
                                <h2 className="font-black text-blue-600" style={{fontSize: 'clamp(2rem, 5vh, 4rem)', marginBottom: 'clamp(1rem, 2vh, 2rem)', textShadow: '0 2px 4px rgba(255,255,255,0.9)'}}>
                                  🎧 LISTEN
                                </h2>
                                <div className="animate-pulse bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl p-4 mb-3">
                                  <p className="text-white font-black" style={{fontSize: 'clamp(1.5rem, 3vh, 2.5rem)'}}>
                                    {currentListeningTier ? `${currentListeningTier.toUpperCase()} TIER` : 'Listen carefully...'}
                                  </p>
                                </div>
                                <p className="text-gray-800 font-bold" style={{fontSize: 'clamp(1rem, 2vh, 1.5rem)', textShadow: '0 1px 2px rgba(255,255,255,0.9)'}}>
                                  Each group hears their word twice
                                </p>
                              </>
                            )}

                            {/* PHASE 2: PAUSE */}
                            {spellingPhase === 'pause' && (
                              <>
                                <h2 className="font-black text-yellow-600" style={{fontSize: 'clamp(2rem, 5vh, 4rem)', marginBottom: 'clamp(1rem, 2vh, 2rem)', textShadow: '0 2px 4px rgba(255,255,255,0.9)'}}>
                                  ⏸️ THINK
                                </h2>
                                <div className="bg-gradient-to-br from-yellow-300 to-orange-400 rounded-2xl p-6 mb-3">
                                  <p className="text-gray-900 font-black" style={{fontSize: 'clamp(3rem, 8vh, 6rem)'}}>
                                    {spellingTimeRemaining}
                                  </p>
                                </div>
                                <p className="text-gray-800 font-bold" style={{fontSize: 'clamp(1rem, 2vh, 1.5rem)', textShadow: '0 1px 2px rgba(255,255,255,0.9)'}}>
                                  Remember the word you heard!
                                </p>
                              </>
                            )}

                            {/* PHASE 3: ANSWER */}
                            {spellingPhase === 'answer' && (
                              <>
                                <h2 className="font-black text-green-600" style={{fontSize: 'clamp(1.75rem, 4.5vh, 3.5rem)', marginBottom: 'clamp(0.5rem, 1vh, 1rem)', textShadow: '0 2px 4px rgba(255,255,255,0.9)'}}>
                                  ✏️ Spell the Word
                                </h2>
                                <div className="bg-gradient-to-br from-blue-400 to-purple-400 rounded-xl p-3 mb-3">
                                  <p className="text-white font-black" style={{fontSize: 'clamp(2rem, 4vh, 3rem)'}}>
                                    ⏱️ {spellingTimeRemaining}s
                                  </p>
                                </div>
                                <p className="text-purple-600 font-bold mb-2" style={{fontSize: 'clamp(1rem, 2vh, 1.5rem)', textShadow: '0 1px 2px rgba(255,255,255,0.9)'}}>
                                  Hint: {challengeData.hint}
                                </p>
                                <p className="text-gray-700 font-semibold" style={{fontSize: 'clamp(0.875rem, 1.5vh, 1.25rem)', textShadow: '0 1px 2px rgba(255,255,255,0.9)'}}>
                                  Type the spelling below
                                </p>
                              </>
                            )}
                          </>
                        )}

                        {/* True/False: show statement */}
                        {!challengeData?.operation && !challengeData?.options && !challengeData?.hint && (
                          <>
                            <h2 className="font-black text-gray-900 mb-4" style={{fontSize: 'clamp(1.5rem, 4vh, 3rem)', textShadow: '0 2px 4px rgba(255,255,255,0.9)'}}>
                              {currentQuestion}
                            </h2>
                            <div className="flex gap-3 justify-center mb-3">
                              <button
                                onClick={() => setAnswer('true')}
                                className={`rounded-xl font-black px-6 py-3 transition-all ${
                                  answer === 'true'
                                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white scale-110 shadow-2xl'
                                    : 'bg-white/60 text-green-700 hover:bg-white/80'
                                }`}
                                style={{fontSize: 'clamp(1.25rem, 2.5vh, 2rem)'}}
                              >
                                ✓ TRUE
                              </button>
                              <button
                                onClick={() => setAnswer('false')}
                                className={`rounded-xl font-black px-6 py-3 transition-all ${
                                  answer === 'false'
                                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white scale-110 shadow-2xl'
                                    : 'bg-white/60 text-red-700 hover:bg-white/80'
                                }`}
                                style={{fontSize: 'clamp(1.25rem, 2.5vh, 2rem)'}}
                              >
                                ✗ FALSE
                              </button>
                            </div>
                            <p className="text-purple-600 font-bold" style={{fontSize: 'clamp(0.75rem, 1.25vh, 1rem)', textShadow: '0 1px 2px rgba(255,255,255,0.9)'}}>
                              Tap your answer, then submit
                            </p>
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        <h2 className="font-black text-purple-600" style={{fontSize: 'clamp(1.5rem, 3.5vh, 3rem)', marginBottom: 'clamp(0.5rem, 1vh, 1rem)', textShadow: '0 2px 4px rgba(255,255,255,0.9)'}}>
                          Watch the TV!
                        </h2>
                        <p className="text-gray-900 font-bold" style={{fontSize: 'clamp(1rem, 2vh, 1.5rem)', textShadow: '0 1px 2px rgba(255,255,255,0.9)'}}>
                          Loading question...
                        </p>
                      </>
                    )}
                  </div>

                  {/* Answer Input - only for Speed Math and Spelling (answer phase only) */}
                  {(challengeData?.operation || (challengeData?.hint && spellingPhase === 'answer')) && (
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
                        disabled={challengeData?.hint && spellingPhase !== 'answer'}
                        autocomplete="off"
                        autocorrect="off"
                        autocapitalize="off"
                        spellcheck="false"
                      />
                    </div>
                  )}

                  {/* Submit Button - disabled during listen/pause phases - Only for non-Connect4 games */}
                  {challengeData?.gameType !== 'connect4' && (
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={
                        !answer ||
                        (typeof answer === 'string' && !answer.trim()) ||
                        (challengeData?.hint && spellingPhase !== 'answer')
                      }
                      className={`w-full rounded-2xl font-black shadow-2xl border-4 border-white transition-all ${
                        (!answer || (typeof answer === 'string' && !answer.trim()) || (challengeData?.hint && spellingPhase !== 'answer'))
                          ? 'bg-gray-400 cursor-not-allowed opacity-50'
                          : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white active:scale-95'
                      }`}
                      style={{padding: 'clamp(1.25rem, 3vh, 2rem)', fontSize: 'clamp(1.5rem, 3vh, 2.5rem)'}}
                    >
                      {challengeData?.hint && spellingPhase === 'listen' ? '🎧 Listening...' :
                       challengeData?.hint && spellingPhase === 'pause' ? '⏸️ Get Ready...' :
                       'Submit Answer'}
                    </button>
                  )}
                    </>
                  )}
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
        style={{backgroundImage: 'url(/images/home-background.png)', backgroundSize: 'cover', backgroundPosition: 'center'}}>
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
        style={{backgroundImage: 'url(/images/home-background.png)', backgroundSize: 'cover', backgroundPosition: 'center'}}>
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
      style={{backgroundImage: 'url(/images/home-background.png)', backgroundSize: 'cover', backgroundPosition: 'center'}}>
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
                    You have saved Christmas
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
