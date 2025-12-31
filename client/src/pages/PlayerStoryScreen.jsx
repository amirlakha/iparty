import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import SnakeController from '../components/SnakeController';

console.log('[PlayerStoryScreen] FILE LOADED - v3');

function PlayerStoryScreen() {
  console.log('[PlayerStoryScreen] COMPONENT RENDERING');
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

  // Snake game state
  const [snakePlayerState, setSnakePlayerState] = useState(null);
  const [snakeRespawnCountdown, setSnakeRespawnCountdown] = useState(0);

  // Memory Match game state
  const [memoryMatchPlayerState, setMemoryMatchPlayerState] = useState(null);

  // Word Scramble state
  const [showWordScrambleHint, setShowWordScrambleHint] = useState(false);
  const [displayedScramble, setDisplayedScramble] = useState('');

  useEffect(() => {
    console.log('[PlayerStoryScreen] useEffect triggered');
    console.log('[PlayerStoryScreen] Socket:', socket?.id, 'Room:', roomCode);

    if (!socket) {
      console.log('[PlayerStoryScreen] No socket, returning early');
      return;
    }
    if (!roomCode) {
      console.log('[PlayerStoryScreen] No roomCode, returning early');
      return;
    }

    console.log('[PlayerStoryScreen] Setting up socket listeners...');

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

      // Initialize word scramble state
      if (data.gameType === 'word-scramble') {
        setDisplayedScramble(data.question); // Start with server's scramble
        setShowWordScrambleHint(false); // Reset hint visibility
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

      // Initialize Snake state when game starts
      if (data.challenge && data.challenge.gameType === 'snake') {
        console.log('[PlayerStoryScreen] Snake challenge started');
        const mySnake = data.challenge.snakes[socket.id];
        if (mySnake) {
          console.log(`[PlayerStoryScreen] I am ${mySnake.colorName} snake`);
          setSnakePlayerState(mySnake);
        }
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

    // Snake game events
    socket.on('snake-game-start', (data) => {
      console.log('[PlayerStoryScreen] Snake game started');
      const mySnake = data.gameState.snakes[socket.id];
      if (mySnake) {
        setSnakePlayerState(mySnake);
        setChallengeData({ gameType: 'snake' });
      }
    });

    socket.on('snake-player-init', (data) => {
      console.log('[PlayerStoryScreen] Snake player init:', data);
      setSnakePlayerState(prev => prev ? { ...prev, ...data } : data);
    });

    socket.on('snake-game-tick', (data) => {
      const mySnake = data.snakes[socket.id];
      if (mySnake) {
        setSnakePlayerState(mySnake);

        // Update respawn countdown
        if (!mySnake.isAlive && mySnake.respawnAt) {
          const countdown = mySnake.respawnAt - Date.now();
          setSnakeRespawnCountdown(countdown > 0 ? countdown : 0);
        } else {
          setSnakeRespawnCountdown(0);
        }
      }
    });

    socket.on('snake-game-end', (data) => {
      console.log('[PlayerStoryScreen] Snake game ended');
      if (data.finalScores) {
        setMyScore(data.finalScores[socket.id] || 0);
      }
      // Clear snake state
      setSnakePlayerState(null);
    });

    // Memory Match events
    socket.on('memory-match-player-state', (data) => {
      console.log('[PlayerStoryScreen] Memory Match player state:', data);
      setMemoryMatchPlayerState(data);
      setChallengeData({ gameType: 'memory-match' });
    });

    socket.on('memory-match-complete', (data) => {
      console.log('[PlayerStoryScreen] Memory Match game ended');
      if (data.finalScores) {
        setMyScore(data.finalScores[socket.id] || 0);
      }
      // Clear memory match state
      setMemoryMatchPlayerState(null);
    });

    return () => {
      socket.off('game-state-update');
      socket.off('game-started');
      socket.off('challenge-data');
      socket.off('challenge-results');
      socket.off('scores-updated');
      socket.off('challenge-started');
      socket.off('connect4-update');
      socket.off('snake-game-start');
      socket.off('snake-player-init');
      socket.off('snake-game-tick');
      socket.off('snake-game-end');
      socket.off('memory-match-player-state');
      socket.off('memory-match-complete');
    };
  }, [socket, roomCode]);

  // Debug: Log state changes
  useEffect(() => {
    console.log('[PlayerStoryScreen] State:', { gameState, challengeData: challengeData?.gameType, snakePlayerState: !!snakePlayerState });
  }, [gameState, challengeData, snakePlayerState]);

  // Word Scramble: Show hint after 30 seconds
  useEffect(() => {
    if (!challengeData || challengeData.gameType !== 'word-scramble' || gameState !== 'CHALLENGE_ACTIVE') {
      return;
    }

    const timer = setTimeout(() => {
      setShowWordScrambleHint(true);
    }, 30000); // 30 seconds

    return () => clearTimeout(timer);
  }, [challengeData, gameState]);

  // Memory Match: Keyboard controls for desktop testing
  useEffect(() => {
    if (!socket || !roomCode) return;
    if (challengeData?.gameType !== 'memory-match') return;
    if (!memoryMatchPlayerState?.isYourTurn) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          socket.emit('memory-match-move', { roomCode, direction: 'up' });
          break;
        case 'ArrowDown':
          e.preventDefault();
          socket.emit('memory-match-move', { roomCode, direction: 'down' });
          break;
        case 'ArrowLeft':
          e.preventDefault();
          socket.emit('memory-match-move', { roomCode, direction: 'left' });
          break;
        case 'ArrowRight':
          e.preventDefault();
          socket.emit('memory-match-move', { roomCode, direction: 'right' });
          break;
        case ' ':
        case 'Enter':
          e.preventDefault();
          socket.emit('memory-match-select', { roomCode });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [socket, roomCode, challengeData, memoryMatchPlayerState?.isYourTurn]);

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

  // Word Scramble: Re-shuffle the displayed letters
  const handleRescramble = () => {
    if (!displayedScramble) return;

    const letters = displayedScramble.split('');
    // Fisher-Yates shuffle
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    setDisplayedScramble(letters.join(''));
  };

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

  const handleSnakeDirection = (direction) => {
    if (!socket) return;

    socket.emit('snake-direction', {
      roomCode,
      direction
    });
  };

  const handleMemoryMatchMove = (direction) => {
    if (!socket) return;

    socket.emit('memory-match-move', {
      roomCode,
      direction
    });
  };

  const handleMemoryMatchSelect = () => {
    if (!socket) return;

    socket.emit('memory-match-select', {
      roomCode
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

                <div className="relative z-10 h-full flex flex-col">
                  {/* SNAKE GAME */}
                  {challengeData?.gameType === 'snake' && snakePlayerState ? (
                    <SnakeController
                      onDirectionChange={handleSnakeDirection}
                      playerScore={snakePlayerState.score}
                      playerColor={snakePlayerState.color}
                      colorName={snakePlayerState.colorName}
                      isAlive={snakePlayerState.isAlive}
                      respawnCountdown={snakeRespawnCountdown}
                      isInvincible={snakePlayerState.isInvincible}
                    />
                  ) : challengeData?.gameType === 'memory-match' && memoryMatchPlayerState ? (
                    /* MEMORY MATCH GAME */
                    <div className="text-center flex flex-col items-center justify-center h-full px-4">
                      {memoryMatchPlayerState.isYourTurn ? (
                        /* It's my turn - show controls */
                        <>
                          <div className="font-black text-green-400 mb-4 animate-pulse"
                               style={{fontSize: 'clamp(1.5rem, 4vh, 3rem)', textShadow: '0 2px 10px rgba(0,0,0,0.5)'}}>
                            YOUR TURN!
                          </div>
                          <div className="text-white/80 mb-4" style={{fontSize: 'clamp(0.875rem, 2vh, 1.25rem)'}}>
                            Use arrows to move cursor, then SELECT
                          </div>

                          {/* Arrow controls */}
                          <div className="flex flex-col items-center gap-2 mb-6">
                            {/* Up arrow */}
                            <button
                              onClick={() => handleMemoryMatchMove('up')}
                              className="w-16 h-16 bg-gradient-to-b from-purple-500 to-purple-700 rounded-xl text-white font-bold text-3xl shadow-lg active:scale-95 transition-transform"
                            >
                              ↑
                            </button>
                            {/* Left, Right arrows */}
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleMemoryMatchMove('left')}
                                className="w-16 h-16 bg-gradient-to-b from-purple-500 to-purple-700 rounded-xl text-white font-bold text-3xl shadow-lg active:scale-95 transition-transform"
                              >
                                ←
                              </button>
                              <div className="w-16 h-16"></div>
                              <button
                                onClick={() => handleMemoryMatchMove('right')}
                                className="w-16 h-16 bg-gradient-to-b from-purple-500 to-purple-700 rounded-xl text-white font-bold text-3xl shadow-lg active:scale-95 transition-transform"
                              >
                                →
                              </button>
                            </div>
                            {/* Down arrow */}
                            <button
                              onClick={() => handleMemoryMatchMove('down')}
                              className="w-16 h-16 bg-gradient-to-b from-purple-500 to-purple-700 rounded-xl text-white font-bold text-3xl shadow-lg active:scale-95 transition-transform"
                            >
                              ↓
                            </button>
                          </div>

                          {/* SELECT button */}
                          <button
                            onClick={handleMemoryMatchSelect}
                            className="w-48 py-4 bg-gradient-to-b from-green-500 to-green-700 rounded-xl text-white font-black text-2xl shadow-lg active:scale-95 transition-transform"
                          >
                            SELECT
                          </button>

                          {/* Score */}
                          <div className="mt-4 text-white/80" style={{fontSize: 'clamp(0.875rem, 2vh, 1.25rem)'}}>
                            Your score: {memoryMatchPlayerState.yourScore} pts
                          </div>
                        </>
                      ) : (
                        /* Waiting for other player */
                        <>
                          <div className="font-bold text-yellow-300 mb-4"
                               style={{fontSize: 'clamp(1.25rem, 3vh, 2rem)', textShadow: '0 2px 10px rgba(0,0,0,0.5)'}}>
                            {memoryMatchPlayerState.currentPlayerName}'s turn...
                          </div>
                          <div className="text-white/80 mb-6" style={{fontSize: 'clamp(1rem, 2vh, 1.5rem)'}}>
                            Watch the TV screen
                          </div>
                          <div className="bg-white/10 rounded-xl p-4">
                            <div className="text-white/60" style={{fontSize: 'clamp(0.875rem, 1.5vh, 1rem)'}}>
                              Pairs found
                            </div>
                            <div className="text-white font-bold" style={{fontSize: 'clamp(1.5rem, 3vh, 2rem)'}}>
                              {memoryMatchPlayerState.pairsFound} / {memoryMatchPlayerState.totalPairs}
                            </div>
                          </div>
                          <div className="mt-4 text-white/80" style={{fontSize: 'clamp(0.875rem, 2vh, 1.25rem)'}}>
                            Your score: {memoryMatchPlayerState.yourScore} pts
                          </div>
                        </>
                      )}
                    </div>
                  ) : challengeData?.gameType === 'connect4' ? (
                  /* CONNECT 4 GAME */
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
                          {challengeData?.gameType === 'word-scramble' && '🔤'}
                          {challengeData?.hint && challengeData?.phases && '✏️'}
                          {(!challengeData?.operation && !challengeData?.options && challengeData?.gameType !== 'word-scramble' && !challengeData?.phases && currentQuestion) && '✅'}
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

                        {/* Word Scramble: show scrambled letters */}
                        {challengeData?.gameType === 'word-scramble' && (
                          <>
                            <h2 className="font-black text-purple-600" style={{fontSize: 'clamp(1.5rem, 4vh, 3rem)', marginBottom: 'clamp(0.5rem, 1vh, 1rem)', textShadow: '0 2px 4px rgba(255,255,255,0.9)'}}>
                              Unscramble:
                            </h2>
                            <div className="flex justify-center items-center flex-wrap gap-1 md:gap-2 mb-3">
                              {(displayedScramble || currentQuestion).split('').map((letter, idx) => (
                                <div
                                  key={idx}
                                  className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-lg border-2 border-white flex items-center justify-center"
                                  style={{
                                    width: 'clamp(2rem, 6vh, 3.5rem)',
                                    height: 'clamp(2rem, 6vh, 3.5rem)',
                                  }}
                                >
                                  <span className="font-black text-white"
                                        style={{fontSize: 'clamp(1rem, 3vh, 2rem)', textShadow: '1px 1px 2px rgba(0,0,0,0.3)'}}>
                                    {letter}
                                  </span>
                                </div>
                              ))}
                            </div>
                            {/* Scramble button */}
                            <button
                              onClick={handleRescramble}
                              className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-xl px-4 py-2 mb-3 shadow-lg hover:from-indigo-600 hover:to-purple-600 active:scale-95 transition-all"
                              style={{fontSize: 'clamp(0.875rem, 1.5vh, 1.25rem)'}}
                            >
                              🔀 Shuffle Letters
                            </button>
                            {/* Hint - only shown after 30 seconds */}
                            {challengeData.hint && showWordScrambleHint && (
                              <p className="text-yellow-600 font-bold mb-2 animate-pulse" style={{fontSize: 'clamp(1rem, 2vh, 1.5rem)', textShadow: '0 1px 2px rgba(255,255,255,0.9)'}}>
                                💡 Hint: {challengeData.hint}
                              </p>
                            )}
                            <p className="text-purple-600 font-bold" style={{fontSize: 'clamp(0.875rem, 1.5vh, 1.25rem)', textShadow: '0 1px 2px rgba(255,255,255,0.9)'}}>
                              Type the word below
                            </p>
                          </>
                        )}

                        {/* True/False: show statement */}
                        {challengeData?.gameType === 'true-false' && (
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

                  {/* Answer Input - for Speed Math, Spelling (answer phase only), and Word Scramble */}
                  {(challengeData?.operation || (challengeData?.hint && challengeData?.phases && spellingPhase === 'answer') || challengeData?.gameType === 'word-scramble') && (
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
                        disabled={challengeData?.hint && challengeData?.phases && spellingPhase !== 'answer'}
                        autocomplete="off"
                        autocorrect="off"
                        autocapitalize="off"
                        spellcheck="false"
                      />
                    </div>
                  )}

                  {/* Submit Button - disabled during listen/pause phases - Only for non-Connect4/Snake games */}
                  {challengeData?.gameType !== 'connect4' && challengeData?.gameType !== 'snake' && (
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={
                        !answer ||
                        (typeof answer === 'string' && !answer.trim()) ||
                        (challengeData?.hint && challengeData?.phases && spellingPhase !== 'answer')
                      }
                      className={`w-full rounded-2xl font-black shadow-2xl border-4 border-white transition-all ${
                        (!answer || (typeof answer === 'string' && !answer.trim()) || (challengeData?.hint && challengeData?.phases && spellingPhase !== 'answer'))
                          ? 'bg-gray-400 cursor-not-allowed opacity-50'
                          : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white active:scale-95'
                      }`}
                      style={{padding: 'clamp(1.25rem, 3vh, 2rem)', fontSize: 'clamp(1.5rem, 3vh, 2.5rem)'}}
                    >
                      {challengeData?.hint && challengeData?.phases && spellingPhase === 'listen' ? '🎧 Listening...' :
                       challengeData?.hint && challengeData?.phases && spellingPhase === 'pause' ? '⏸️ Get Ready...' :
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
