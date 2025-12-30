import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import christmasStory from '../data/christmasStory';
import { QRCodeSVG } from 'qrcode.react';
import CircularTimer from '../components/CircularTimer';
import ProgressBar from '../components/ProgressBar';
import SnakeGameBoard from '../components/SnakeGameBoard';

function CoordinatorScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { roomCode, coordinatorName } = location.state || {};

  const [gameState, setGameState] = useState('LOBBY');
  const [players, setPlayers] = useState([]);
  const [scores, setScores] = useState({});
  const [currentRound, setCurrentRound] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [results, setResults] = useState([]);
  const [sectionStars, setSectionStars] = useState(0);
  const [timerKey, setTimerKey] = useState(0); // Force timer reset on state change

  // Spelling Bee audio state (TV plays audio for everyone)
  const [spellingPhase, setSpellingPhase] = useState(null); // 'listen', 'pause', 'answer'
  const [spellingTimeRemaining, setSpellingTimeRemaining] = useState(0);
  const [currentListeningTier, setCurrentListeningTier] = useState(null);

  // Connect 4 game state
  const [connect4Board, setConnect4Board] = useState(null);
  const [connect4CurrentPlayer, setConnect4CurrentPlayer] = useState(null);
  const [connect4Winner, setConnect4Winner] = useState(null);
  const [connect4WinningCells, setConnect4WinningCells] = useState([]);
  const [connect4IsDraw, setConnect4IsDraw] = useState(false);
  const [connect4Teams, setConnect4Teams] = useState(null);

  // Snake game state
  const [snakeGameState, setSnakeGameState] = useState(null);

  // Word Scramble hint delay (show after 30 seconds)
  const [showWordScrambleHint, setShowWordScrambleHint] = useState(false);

  useEffect(() => {
    if (!socket || !roomCode) return;

    socket.on('game-state-update', (data) => {
      setGameState(data.state);
      setCurrentRound(data.round || 0);
      setCurrentSection(data.section || 0);
      setTimerKey(prev => prev + 1);

      // Reset submissions on new challenge
      if (data.state === 'CHALLENGE_ACTIVE') {
        setSubmissions([]);
        setResults([]);
      }
    });

    socket.on('player-joined', (data) => {
      setPlayers(data.players);
    });

    socket.on('game-started', (data) => {
      // Don't set gameState here - game-state-update will handle it immediately after
      setPlayers(data.game.players);
      setScores(data.game.scores);
    });

    socket.on('challenge-started', (data) => {
      setCurrentChallenge(data.challenge);
      setShowWordScrambleHint(false); // Reset hint visibility for new challenge
      console.log('[Coordinator] Received challenge with', data.challenge.questions?.length, 'age tiers');
    });

    socket.on('answer-submitted', (data) => {
      setSubmissions(prev => [...prev, data.playerId]);
    });

    socket.on('challenge-results', (data) => {
      setScores(data.scores);
      setResults(data.results || []);
    });

    socket.on('section-stars', (data) => {
      console.log('Received section-stars:', data);
      console.log('Updated scores from section-stars:', data.scores);
      setSectionStars(data.stars || 0);
      // Update scores immediately with bonus/penalty
      if (data.scores) {
        setScores(data.scores);
        console.log('Scores state updated to:', data.scores);
      }
    });

    socket.on('scores-updated', (data) => {
      console.log('Scores updated:', data.reason, data.scores);
      setScores(data.scores);
    });

    socket.on('connect4-update', (data) => {
      console.log('[Connect4] Board updated:', data);
      setConnect4Board(data.board);
      setConnect4CurrentPlayer(data.currentPlayer);
      setConnect4Winner(data.winner);
      setConnect4WinningCells(data.winningCells || []);
      setConnect4IsDraw(data.isDraw || false);
      setConnect4Teams(data.teams);
      if (data.scores) {
        setScores(data.scores);
      }
    });

    // Snake game events
    socket.on('snake-game-start', (data) => {
      console.log('[Snake] Game started:', data);
      setSnakeGameState(data.gameState);
    });

    socket.on('snake-game-tick', (data) => {
      setSnakeGameState(data);
    });

    socket.on('snake-game-end', (data) => {
      console.log('[Snake] Game ended:', data);
      if (data.finalScores) {
        setScores(data.finalScores);
      }
    });

    return () => {
      socket.off('game-state-update');
      socket.off('player-joined');
      socket.off('game-started');
      socket.off('challenge-data');
      socket.off('answer-submitted');
      socket.off('challenge-results');
      socket.off('section-stars');
      socket.off('scores-updated');
      socket.off('connect4-update');
      socket.off('snake-game-start');
      socket.off('snake-game-tick');
      socket.off('snake-game-end');
    };
  }, [socket, roomCode]);

  // Word Scramble: Show hint after 30 seconds
  useEffect(() => {
    if (!currentChallenge || currentChallenge.gameType !== 'word-scramble' || gameState !== 'CHALLENGE_ACTIVE') {
      return;
    }

    const timer = setTimeout(() => {
      setShowWordScrambleHint(true);
    }, 30000); // 30 seconds

    return () => clearTimeout(timer);
  }, [currentChallenge, gameState]);

  // Spelling Bee Audio Flow: TV plays audio for everyone to hear
  useEffect(() => {
    console.log('[SpellingBee TV] useEffect triggered - currentChallenge:', currentChallenge?.gameType, 'has phases:', !!currentChallenge?.phases);

    if (!currentChallenge || currentChallenge.gameType !== 'spelling' || !currentChallenge.phases) {
      console.log('[SpellingBee TV] Skipping - not a spelling bee or no phases');
      return;
    }

    console.log('[SpellingBee TV] Starting 3-phase flow');
    console.log('[SpellingBee TV] Questions:', currentChallenge.questions);
    console.log('[SpellingBee TV] Phases:', currentChallenge.phases);

    const phases = currentChallenge.phases;
    const tierOrder = phases.listen.tierOrder;

    // Wait for voices to be loaded
    const loadVoices = () => {
      return new Promise((resolve) => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          console.log('[SpellingBee TV] Voices loaded:', voices.length);
          resolve(voices);
        } else {
          console.log('[SpellingBee TV] Waiting for voices...');
          window.speechSynthesis.onvoiceschanged = () => {
            const newVoices = window.speechSynthesis.getVoices();
            console.log('[SpellingBee TV] Voices loaded:', newVoices.length);
            resolve(newVoices);
          };
        }
      });
    };

    // Helper function to speak a word
    const speakWord = (word, rate = 0.85) => {
      return new Promise((resolve) => {
        console.log(`[SpellingBee TV] Speaking: "${word}" at rate ${rate}`);
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.rate = rate;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        utterance.onstart = () => console.log(`[SpellingBee TV] Started: "${word}"`);
        utterance.onend = () => {
          console.log(`[SpellingBee TV] Finished: "${word}"`);
          resolve();
        };
        utterance.onerror = (event) => {
          console.error('[SpellingBee TV] Error:', event);
          resolve();
        };
        window.speechSynthesis.speak(utterance);
      });
    };

    // Phase 1: LISTEN - Sequential pronunciation by tier
    const runListenPhase = async () => {
      setSpellingPhase('listen');
      console.log('[SpellingBee TV] Phase 1: LISTEN');

      // Broadcast phase change to players
      console.log('[SpellingBee TV] Emitting phase change: listen to room:', roomCode);
      socket.emit('spelling-phase-change', { roomCode, phase: 'listen' });

      await loadVoices();

      for (const tier of tierOrder) {
        setCurrentListeningTier(tier);
        console.log(`[SpellingBee TV] Now playing: ${tier} tier`);

        const tierData = currentChallenge.questions.find(q => q.tier === tier);
        if (tierData && tierData.word) {
          console.log(`[SpellingBee TV] Word for ${tier}: "${tierData.word}"`);
          await speakWord(tierData.word, tierData.speechRate || 0.85);
          await new Promise(resolve => setTimeout(resolve, 800));
          await speakWord(tierData.word, tierData.speechRate || 0.85);
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }

      setCurrentListeningTier(null);
      runPausePhase();
    };

    // Phase 2: PAUSE - 10 second thinking time
    const runPausePhase = () => {
      setSpellingPhase('pause');
      console.log('[SpellingBee TV] Phase 2: PAUSE (10s)');

      // Broadcast phase change to players
      console.log('[SpellingBee TV] Emitting phase change: pause (10s) to room:', roomCode);
      socket.emit('spelling-phase-change', { roomCode, phase: 'pause', duration: 10 });

      let remaining = 10;
      setSpellingTimeRemaining(remaining);

      const pauseInterval = setInterval(() => {
        remaining--;
        setSpellingTimeRemaining(remaining);
        if (remaining <= 0) {
          clearInterval(pauseInterval);
          runAnswerPhase();
        }
      }, 1000);
    };

    // Phase 3: ANSWER - 30 seconds to type and submit
    const runAnswerPhase = () => {
      setSpellingPhase('answer');
      console.log('[SpellingBee TV] Phase 3: ANSWER (30s)');

      // Broadcast phase change to players
      console.log('[SpellingBee TV] Emitting phase change: answer (30s) to room:', roomCode);
      socket.emit('spelling-phase-change', { roomCode, phase: 'answer', duration: 30 });

      let remaining = 30;
      setSpellingTimeRemaining(remaining);

      const answerInterval = setInterval(() => {
        remaining--;
        setSpellingTimeRemaining(remaining);
        if (remaining <= 0) {
          clearInterval(answerInterval);
        }
      }, 1000);
    };

    runListenPhase();

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [currentChallenge]);

  // Initialize Connect 4 state when challenge starts
  useEffect(() => {
    if (currentChallenge && currentChallenge.gameType === 'connect4') {
      console.log('[Connect4] Initializing Connect 4 game state');
      setConnect4Board(currentChallenge.board);
      setConnect4CurrentPlayer(currentChallenge.currentPlayer);
      setConnect4Winner(null);
      setConnect4WinningCells([]);
      setConnect4IsDraw(false);
      setConnect4Teams(currentChallenge.teams);
    }
  }, [currentChallenge]);

  const handleStartGame = () => {
    if (!socket || players.length === 0) {
      alert('Need at least one player to start!');
      return;
    }
    socket.emit('start-game', { roomCode });
  };

  const getBackgroundImage = () => {
    if (currentSection === 0) return null;
    const backgrounds = [
      null,
      '/images/bg-toy-machine.png',
      '/images/bg-reindeer-stable.png',
      '/images/bg-gift-wrap.png',
      '/images/bg-cookie-kitchen.png',
      '/images/bg-sleigh-launch.png'
    ];
    return backgrounds[currentSection];
  };

  const getCharacterImage = () => {
    if (currentSection === 0) return '/images/santa-character.png';
    const characters = [
      null,
      '/images/elf-character.png',      // Toy Machine
      '/images/reindeer-character.png', // Reindeer Stable
      '/images/santa-character.png',    // Gift Wrap
      '/images/elf-character.png',      // Cookie Kitchen
      '/images/reindeer-character.png'  // Sleigh Launch
    ];
    return characters[currentSection];
  };

  const getSectionData = () => {
    if (currentSection === 0) return null;
    return christmasStory.sections[currentSection - 1];
  };

  // LOBBY STATE - Room code display
  if (gameState === 'LOBBY') {
    return (
      <div
        className="fixed inset-0 w-screen h-screen overflow-hidden"
        style={{
          backgroundImage: 'url(/images/home-background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Subtle gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30 pointer-events-none"></div>

        {/* Content Container - Using grid for better layout control */}
        <div className="relative z-10 h-full grid grid-rows-[auto_1fr_auto] gap-2 md:gap-4 p-4 md:p-6">
          {/* Header Section - Logo and Room Code */}
          <div className="text-center">
            <img
              src="/images/game-logo.png"
              alt="iParty Logo"
              className="w-full max-w-xs md:max-w-md lg:max-w-lg mx-auto mb-2 md:mb-3 drop-shadow-2xl"
            />

            {/* Room Code and QR Code Display */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
              {/* QR Code */}
              <div className="bg-white rounded-2xl p-4 shadow-2xl border-4 border-blue-500">
                <QRCodeSVG
                  value={`${window.location.origin}/?join=${roomCode}`}
                  size={120}
                  level="M"
                  includeMargin={true}
                />
                <p className="text-xs font-bold text-gray-600 mt-2">Scan to Join</p>
              </div>

              {/* Room Code */}
              <div className="bg-white rounded-2xl md:rounded-3xl px-6 md:px-10 py-3 md:py-5 shadow-2xl border-4 border-yellow-400">
                <p className="text-sm md:text-xl lg:text-2xl font-bold text-gray-700 mb-1">Join at iparty.com</p>
                <p className="text-xs md:text-lg lg:text-xl font-semibold text-gray-600 mb-1">Room Code:</p>
                <p className="text-4xl md:text-6xl lg:text-7xl font-black text-red-600 tracking-widest font-mono">
                  {roomCode}
                </p>
              </div>
            </div>
          </div>

          {/* Players Section - Takes available space */}
          <div className="flex flex-col max-w-7xl mx-auto w-full min-h-0">
            <div className="bg-white bg-opacity-90 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-2xl border-4 border-white h-full flex flex-col">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-gray-800 mb-3 md:mb-4 text-center">
                Players Ready: {players.length}
              </h2>

              {players.length === 0 ? (
                <div className="flex-1 flex items-center justify-center min-h-0">
                  <div className="text-center">
                    <div className="text-5xl md:text-7xl lg:text-8xl mb-3 md:mb-5 animate-pulse">⏳</div>
                    <p className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-700 mb-2">
                      Waiting for players...
                    </p>
                    <p className="text-sm md:text-lg lg:text-xl text-gray-600">
                      Players will join using the room code above
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3 overflow-auto">
                  {players.map((player) => (
                    <div
                      key={player.id}
                      className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl md:rounded-2xl p-2 md:p-3 shadow-xl border-2 md:border-4 border-white"
                    >
                      <div className="text-4xl md:text-5xl lg:text-6xl text-center mb-1 md:mb-2">🎮</div>
                      <div className="text-center">
                        <div className="text-sm md:text-lg lg:text-xl font-bold text-white drop-shadow-lg mb-1">
                          {player.name}
                        </div>
                        <div className="text-xs md:text-sm text-white text-opacity-90">
                          Age {player.age}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Start Button */}
          {players.length > 0 && (
            <div className="text-center">
              <button
                onClick={handleStartGame}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-2xl md:text-3xl lg:text-4xl font-black px-10 md:px-16 py-4 md:py-5 rounded-full shadow-2xl border-4 md:border-6 border-white transition-all hover:scale-105 active:scale-95 animate-pulse"
                style={{ textShadow: '0 4px 8px rgba(0,0,0,0.5)' }}
              >
                🚀 START ADVENTURE!
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // INTRODUCTION STATE
  if (gameState === 'INTRODUCTION') {
    return (
      <div
        className="fixed inset-0 w-screen h-screen overflow-hidden"
        style={{
          backgroundImage: 'url(/images/home-background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <style>{`
          @keyframes circle {
            0% { transform: translate(0, -20px); }
            12.5% { transform: translate(14px, -14px); }
            25% { transform: translate(20px, 0); }
            37.5% { transform: translate(14px, 14px); }
            50% { transform: translate(0, 20px); }
            62.5% { transform: translate(-14px, 14px); }
            75% { transform: translate(-20px, 0); }
            87.5% { transform: translate(-14px, -14px); }
            100% { transform: translate(0, -20px); }
          }
          .animate-circle {
            animation: circle 5s linear infinite;
          }
        `}</style>
        <div className="absolute inset-0 bg-black bg-opacity-50 pointer-events-none"></div>
        <div className="relative z-10 h-full w-full flex flex-col justify-center items-center px-8 md:px-12 lg:px-16 py-[2vh] overflow-y-auto">
          <div className="w-full max-w-7xl flex flex-col items-center" style={{maxHeight: '96vh', gap: 'clamp(0.5rem, 1.5vh, 1.5rem)'}}>
            {/* Santa Character with circle + wiggle animation */}
            <div className="animate-circle mx-auto flex-shrink-0" style={{width: 'clamp(6rem, 15vh, 16rem)', height: 'clamp(6rem, 15vh, 16rem)'}}>
              <img
                src="/images/santa-character.png"
                alt="Santa"
                className="animate-wiggle object-contain drop-shadow-2xl"
                style={{width: '100%', height: '100%'}}
              />
            </div>

            {/* Title with Strong Outline */}
            <h1 className="font-black text-yellow-300 drop-shadow-2xl text-center px-4 flex-shrink-0"
                style={{
                  fontSize: 'clamp(1.5rem, 5vh, 5rem)',
                  WebkitTextStroke: '2px #991b1b',
                  paintOrder: 'stroke fill',
                  textShadow: '3px 3px 0px rgba(0,0,0,0.5), 0 0 20px rgba(255,255,255,0.8)'
                }}>
              {christmasStory.title}
            </h1>

            {/* Story Card with Glassmorphism */}
            <div className="relative w-full flex-1 min-h-0 overflow-y-auto">
              <div className="relative bg-white/30 backdrop-blur-xl rounded-3xl h-full flex flex-col justify-center border border-white/40"
                   style={{
                     padding: 'clamp(1.5rem, 4vh, 3.5rem)',
                     boxShadow: `
                       inset 0 1px 1px 0 rgba(255, 255, 255, 0.6),
                       inset 0 -1px 1px 0 rgba(255, 255, 255, 0.2),
                       0 20px 40px rgba(0, 0, 0, 0.3),
                       0 10px 20px rgba(0, 0, 0, 0.2),
                       0 0 100px rgba(255, 255, 255, 0.1)
                     `,
                     background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.2) 100%)'
                   }}>
                <div className="absolute inset-0 rounded-3xl"
                     style={{
                       background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.3) 0%, transparent 50%, rgba(0, 0, 0, 0.05) 100%)',
                       pointerEvents: 'none'
                     }}></div>
                <div className="relative z-10">
                  {christmasStory.introduction.narrative.map((line, i) => (
                    <p key={i} className="text-gray-900 font-black leading-relaxed" style={{fontSize: 'clamp(1rem, 2.5vh, 2rem)', marginBottom: 'clamp(0.75rem, 2vh, 1.75rem)', textShadow: '0 2px 4px rgba(255,255,255,0.9)'}}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* Progress bar at bottom */}
          <div className="absolute bottom-0 left-0 right-0 px-8">
            <ProgressBar key={`intro-${timerKey}`} duration={12} color="blue" />
          </div>
        </div>
      </div>
    );
  }

  // SECTION_INTRO STATE
  if (gameState === 'SECTION_INTRO') {
    const section = getSectionData();
    if (!section) return null;

    return (
      <div
        className="fixed inset-0 w-screen h-screen overflow-hidden"
        style={{
          backgroundImage: `url(${getBackgroundImage()})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <style>{`
          @keyframes circle {
            0% { transform: translate(0, -20px); }
            12.5% { transform: translate(14px, -14px); }
            25% { transform: translate(20px, 0); }
            37.5% { transform: translate(14px, 14px); }
            50% { transform: translate(0, 20px); }
            62.5% { transform: translate(-14px, 14px); }
            75% { transform: translate(-20px, 0); }
            87.5% { transform: translate(-14px, -14px); }
            100% { transform: translate(0, -20px); }
          }
          .animate-circle {
            animation: circle 5s linear infinite;
          }
        `}</style>
        <div className="absolute inset-0 bg-black bg-opacity-50 pointer-events-none"></div>
        <div className="relative z-10 h-full w-full flex flex-col justify-center items-center px-8 md:px-12 lg:px-16 py-[2vh] overflow-y-auto">
          <div className="w-full max-w-7xl flex flex-col items-center" style={{maxHeight: '96vh', gap: 'clamp(0.5rem, 1.5vh, 1.5rem)'}}>
            {/* Character with Circle + Wiggle */}
            <div className="animate-circle mx-auto flex-shrink-0" style={{width: 'clamp(6rem, 15vh, 16rem)', height: 'clamp(6rem, 15vh, 16rem)'}}>
              <img
                src={getCharacterImage()}
                alt="Character"
                className="animate-wiggle object-contain drop-shadow-2xl"
                style={{width: '100%', height: '100%'}}
              />
            </div>

            {/* Title with Strong Outline */}
            <h1 className="font-black text-yellow-300 drop-shadow-2xl text-center px-4 flex-shrink-0"
                style={{
                  fontSize: 'clamp(1.5rem, 5vh, 5rem)',
                  WebkitTextStroke: '2px #1e40af',
                  paintOrder: 'stroke fill',
                  textShadow: '3px 3px 0px rgba(0,0,0,0.5), 0 0 20px rgba(255,255,255,0.8)'
                }}>
              {section.emoji} {section.name}
            </h1>

            {/* Story Card with Glassmorphism */}
            <div className="relative w-full flex-1 min-h-0 overflow-y-auto">
              <div className="relative bg-white/30 backdrop-blur-xl rounded-3xl h-full flex flex-col justify-center border border-white/40"
                   style={{
                     padding: 'clamp(1.5rem, 4vh, 3.5rem)',
                     boxShadow: `
                       inset 0 1px 1px 0 rgba(255, 255, 255, 0.6),
                       inset 0 -1px 1px 0 rgba(255, 255, 255, 0.2),
                       0 20px 40px rgba(0, 0, 0, 0.3),
                       0 10px 20px rgba(0, 0, 0, 0.2),
                       0 0 100px rgba(255, 255, 255, 0.1)
                     `,
                     background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.2) 100%)'
                   }}>
                <div className="absolute inset-0 rounded-3xl"
                     style={{
                       background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.3) 0%, transparent 50%, rgba(0, 0, 0, 0.05) 100%)',
                       pointerEvents: 'none'
                     }}></div>
                <div className="relative z-10">
                  <h2 className="font-black text-purple-600" style={{fontSize: 'clamp(1.25rem, 3vh, 3rem)', marginBottom: 'clamp(1rem, 2vh, 2rem)', textShadow: '0 2px 4px rgba(255,255,255,0.9)'}}>
                    {section.storyIntro.title}
                  </h2>
                  {section.storyIntro.narrative.map((line, i) => (
                    <p key={i} className="text-gray-900 font-black leading-relaxed" style={{fontSize: 'clamp(1rem, 2.5vh, 2rem)', marginBottom: 'clamp(0.75rem, 2vh, 1.75rem)', textShadow: '0 2px 4px rgba(255,255,255,0.9)'}}>
                      {line}
                    </p>
                  ))}
                  <div style={{marginTop: 'clamp(1.5rem, 3vh, 3.5rem)'}}>
                    <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-full inline-block shadow-2xl border-4 border-white"
                      style={{padding: 'clamp(1rem, 2.5vh, 1.75rem) clamp(1.5rem, 4vh, 3rem)'}}>
                      <div className="font-black text-white drop-shadow-xl" style={{fontSize: 'clamp(1rem, 2.5vh, 3rem)'}}>
                        Section {currentSection}/5 • ⭐⭐⭐⭐⭐ Required!
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Progress bar at bottom */}
          <div className="absolute bottom-0 left-0 right-0 px-8">
            <ProgressBar key={`section-intro-${timerKey}`} duration={8} color="blue" />
          </div>
        </div>
      </div>
    );
  }

  // CHALLENGE_ACTIVE STATE - Main game screen
  if (gameState === 'CHALLENGE_ACTIVE') {
    const section = getSectionData();

    return (
      <div
        className="fixed inset-0 w-screen h-screen overflow-hidden flex flex-col"
        style={{
          backgroundImage: `url(${getBackgroundImage()})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50 pointer-events-none"></div>
        <div className="relative z-10 h-full w-full flex flex-col justify-center items-center px-8 md:px-12 lg:px-16 py-[2vh] overflow-y-auto">
          <div className="w-full max-w-7xl flex flex-col" style={{maxHeight: '96vh', gap: 'clamp(1.5rem, 3vh, 3rem)'}}>
            {/* Header with Gradient Border - flex-shrink-0 */}
            <div className="relative bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 rounded-2xl shadow-2xl flex-shrink-0" style={{padding: 'clamp(0.125rem, 0.25vh, 0.5rem)'}}>
              <div className="bg-gray-900 rounded-2xl" style={{padding: 'clamp(0.5rem, 1.5vh, 1.5rem)'}}>
                <div className="flex justify-between items-center gap-2">
                  <div className="font-black text-yellow-300 drop-shadow-lg" style={{fontSize: 'clamp(0.875rem, 2vh, 2rem)'}}>
                    {section?.emoji} {section?.name} • Round {currentRound}
                  </div>
                  {/* Only show timer for non-Connect4/Snake games */}
                  {currentChallenge?.gameType !== 'connect4' && currentChallenge?.gameType !== 'snake' && (
                    <CircularTimer key={`challenge-${timerKey}`} duration={60} size="medium" />
                  )}
                  <div className="font-black text-white drop-shadow-lg" style={{fontSize: 'clamp(0.875rem, 2vh, 2rem)'}}>
                    Section {currentSection}/5
                  </div>
                </div>
              </div>
            </div>

            {/* Challenge Area with Glassmorphism - flex-1 */}
            <div className="relative flex-1 min-h-0">
              <div className={`relative bg-white/30 backdrop-blur-xl rounded-3xl h-full flex flex-col justify-center border border-white/40 ${
                currentChallenge?.gameType === 'connect4' ? 'overflow-hidden' : 'overflow-y-auto'
              }`}
                   style={{
                     padding: currentChallenge?.gameType === 'connect4' ? 'clamp(0.5rem, 1.5vh, 2rem)' : 'clamp(1rem, 3vh, 4rem)',
                     boxShadow: `
                       inset 0 1px 1px 0 rgba(255, 255, 255, 0.6),
                       inset 0 -1px 1px 0 rgba(255, 255, 255, 0.2),
                       0 20px 40px rgba(0, 0, 0, 0.3),
                       0 10px 20px rgba(0, 0, 0, 0.2),
                       0 0 100px rgba(255, 255, 255, 0.1)
                     `,
                     background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.2) 100%)'
                   }}>
                <div className="absolute inset-0 rounded-3xl"
                     style={{
                       background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.3) 0%, transparent 50%, rgba(0, 0, 0, 0.05) 100%)',
                       pointerEvents: 'none'
                     }}></div>
                <div className="relative z-10 text-center">
                  {currentChallenge ? (
                    <>
                      {/* Game Title and Icon - Only for non-Connect4/Snake games */}
                      {currentChallenge.gameType !== 'connect4' && currentChallenge.gameType !== 'snake' && (
                        <>
                          <div style={{fontSize: 'clamp(2rem, 6vh, 4rem)', marginBottom: 'clamp(0.5rem, 1vh, 1.5rem)'}}>
                            {currentChallenge.gameType === 'speed-math' && '🧮'}
                            {currentChallenge.gameType === 'true-false' && '✅'}
                            {currentChallenge.gameType === 'trivia' && '🎯'}
                            {currentChallenge.gameType === 'spelling' && '✏️'}
                            {currentChallenge.gameType === 'word-scramble' && '🔤'}
                          </div>
                          <h3 className="font-black text-gray-900 leading-tight px-2 mb-4"
                              style={{
                                fontSize: 'clamp(1rem, 3vh, 2.5rem)',
                                textShadow: '0 2px 4px rgba(255,255,255,0.9)'
                              }}>
                            {currentChallenge.gameType === 'speed-math' && `Speed Math - ${currentChallenge.operation?.charAt(0).toUpperCase() + currentChallenge.operation?.slice(1)}`}
                            {currentChallenge.gameType === 'true-false' && 'True or False'}
                            {currentChallenge.gameType === 'trivia' && 'Christmas Trivia'}
                            {currentChallenge.gameType === 'spelling' && 'Spelling Bee'}
                            {currentChallenge.gameType === 'word-scramble' && 'Word Scramble'}
                          </h3>
                        </>
                      )}

                      {/* CONNECT 4 GAME */}
                      {currentChallenge.gameType === 'connect4' && connect4Board ? (
                        <div className="w-full h-full flex flex-col" style={{gap: 'clamp(0.25rem, 0.5vh, 0.5rem)'}}>
                          {/* Compact Header: Icon + Title + Teams in one row */}
                          <div className="flex items-center justify-between" style={{gap: 'clamp(0.5rem, 1vh, 1rem)'}}>
                            {/* Icon + Title */}
                            <div className="flex items-center" style={{gap: 'clamp(0.25rem, 0.5vh, 0.5rem)'}}>
                              <div style={{fontSize: 'clamp(1.5rem, 3vh, 2.5rem)'}}>🔴</div>
                              <h3 className="font-black text-gray-900"
                                  style={{fontSize: 'clamp(1rem, 2vh, 1.5rem)', textShadow: '0 2px 4px rgba(255,255,255,0.9)'}}>
                                Connect 4
                              </h3>
                            </div>

                            {/* Inline Team Rosters */}
                            <div className="flex" style={{gap: 'clamp(0.25rem, 0.5vh, 0.5rem)'}}>
                              {/* Red Team - Compact */}
                              <div className="bg-gradient-to-br from-red-500 to-red-700 rounded-lg"
                                   style={{padding: 'clamp(0.25rem, 0.5vh, 0.5rem)'}}>
                                <div className="font-bold text-white text-center"
                                     style={{fontSize: 'clamp(0.75rem, 1.25vh, 1rem)'}}>
                                  🔴 {connect4Teams?.red.map(p => p.name).join(', ')}
                                </div>
                              </div>

                              {/* Blue Team - Compact */}
                              <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg"
                                   style={{padding: 'clamp(0.25rem, 0.5vh, 0.5rem)'}}>
                                <div className="font-bold text-white text-center"
                                     style={{fontSize: 'clamp(0.75rem, 1.25vh, 1rem)'}}>
                                  🔵 {connect4Teams?.blue.map(p => p.name).join(', ')}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Current Turn or Winner Display */}
                          {connect4Winner ? (
                            <div className={`rounded-xl text-center ${connect4Winner === 'red' ? 'bg-red-500' : 'bg-blue-500'}`}
                                 style={{padding: 'clamp(0.75rem, 1.5vh, 1.5rem)'}}>
                              <div className="font-black text-white"
                                   style={{fontSize: 'clamp(1.5rem, 3vh, 2.5rem)'}}>
                                {connect4Winner === 'red' ? '🔴' : '🔵'} {connect4Winner.toUpperCase()} WINS!
                              </div>
                            </div>
                          ) : connect4IsDraw ? (
                            <div className="bg-yellow-500 rounded-xl text-center"
                                 style={{padding: 'clamp(0.75rem, 1.5vh, 1.5rem)'}}>
                              <div className="font-black text-white"
                                   style={{fontSize: 'clamp(1.5rem, 3vh, 2.5rem)'}}>
                                🤝 DRAW!
                              </div>
                            </div>
                          ) : connect4CurrentPlayer ? (
                            <div className={`rounded-xl text-center ${connect4CurrentPlayer.team === 'red' ? 'bg-red-500' : 'bg-blue-500'}`}
                                 style={{padding: 'clamp(0.5rem, 1vh, 1rem)'}}>
                              <div className="font-black text-white"
                                   style={{fontSize: 'clamp(1.25rem, 2.5vh, 2rem)'}}>
                                {connect4CurrentPlayer.team === 'red' ? '🔴' : '🔵'} {connect4CurrentPlayer.playerName}'s Turn
                              </div>
                            </div>
                          ) : null}

                          {/* Connect 4 Board */}
                          <div className="flex justify-center items-center flex-1">
                            <div className="bg-blue-900 rounded-2xl shadow-2xl"
                                 style={{padding: 'clamp(0.5rem, 1vh, 1rem)'}}>
                              <div className="grid grid-cols-7" style={{gap: 'clamp(0.25rem, 0.5vh, 0.5rem)'}}>
                                {connect4Board.map((row, rowIdx) => (
                                  row.map((cell, colIdx) => {
                                    const isWinningCell = connect4WinningCells.some(([r, c]) => r === rowIdx && c === colIdx);
                                    return (
                                      <div
                                        key={`${rowIdx}-${colIdx}`}
                                        className={`rounded-full border-2 ${
                                          cell === 'red' ? 'bg-red-500 border-red-700' :
                                          cell === 'blue' ? 'bg-blue-500 border-blue-700' :
                                          'bg-white border-gray-300'
                                        } ${isWinningCell ? 'animate-pulse ring-2 ring-yellow-400' : ''}`}
                                        style={{
                                          width: 'clamp(2rem, 5vh, 4rem)',
                                          height: 'clamp(2rem, 5vh, 4rem)'
                                        }}
                                      ></div>
                                    );
                                  })
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : currentChallenge.gameType === 'snake' && snakeGameState ? (
                        /* SNAKE GAME */
                        <SnakeGameBoard
                          snakes={snakeGameState.snakes}
                          food={snakeGameState.food}
                          board={snakeGameState.board}
                          timeRemaining={snakeGameState.timeRemaining}
                        />
                      ) : currentChallenge.questions && currentChallenge.questions.length > 0 ? (
                        <>
                          {/* SPELLING BEE: Single unified panel (not per-tier) */}
                          {currentChallenge.gameType === 'spelling' ? (
                            <div className="max-w-6xl mx-auto">
                              <div className="bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-3xl border-2 border-white/60 p-6 md:p-8 shadow-lg">
                                <div className="text-center">
                                  {/* Phase 1: LISTEN */}
                                  {spellingPhase === 'listen' && (
                                    <>
                                      <div className="font-black text-blue-600 mb-4 animate-pulse"
                                           style={{fontSize: 'clamp(2rem, 5vh, 4rem)', textShadow: '0 2px 4px rgba(255,255,255,0.9)'}}>
                                        🎧 LISTEN CAREFULLY
                                      </div>
                                      {currentListeningTier && (
                                        <>
                                          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 mb-4">
                                            <div className="text-white font-bold mb-2"
                                                 style={{fontSize: 'clamp(1.25rem, 3vh, 2.5rem)'}}>
                                              This word is for:
                                            </div>
                                            <div className="text-yellow-300 font-black"
                                                 style={{fontSize: 'clamp(1.75rem, 4.5vh, 3.5rem)'}}>
                                              {currentChallenge.questions
                                                .find(q => q.tier === currentListeningTier)
                                                ?.players.map(p => p.name).join(', ') || currentListeningTier.toUpperCase()}
                                            </div>
                                          </div>
                                          <div className="text-gray-800 font-bold"
                                               style={{fontSize: 'clamp(1.25rem, 3vh, 2.5rem)'}}>
                                            Hear the word twice, then next group
                                          </div>
                                        </>
                                      )}
                                    </>
                                  )}

                                  {/* Phase 2: PAUSE */}
                                  {spellingPhase === 'pause' && (
                                    <>
                                      <div className="font-black text-yellow-600 mb-4"
                                           style={{fontSize: 'clamp(2rem, 5vh, 4rem)', textShadow: '0 2px 4px rgba(255,255,255,0.9)'}}>
                                        ⏸️ THINK TIME
                                      </div>
                                      <div className="bg-gradient-to-br from-yellow-300 to-orange-400 rounded-3xl p-8 mb-4">
                                        <div className="text-gray-900 font-black"
                                             style={{fontSize: 'clamp(4rem, 10vh, 8rem)'}}>
                                          {spellingTimeRemaining}s
                                        </div>
                                      </div>
                                      <div className="text-gray-800 font-bold"
                                           style={{fontSize: 'clamp(1.25rem, 3vh, 2.5rem)'}}>
                                        You have 10 seconds to think about your spelling
                                      </div>
                                    </>
                                  )}

                                  {/* Phase 3: ANSWER */}
                                  {spellingPhase === 'answer' && (
                                    <>
                                      <div className="font-black text-green-600 mb-4"
                                           style={{fontSize: 'clamp(2rem, 5vh, 4rem)', textShadow: '0 2px 4px rgba(255,255,255,0.9)'}}>
                                        ✏️ SPELL IT NOW!
                                      </div>
                                      <div className="bg-gradient-to-br from-blue-400 to-purple-400 rounded-2xl p-8 mb-4">
                                        <div className="text-white font-black"
                                             style={{fontSize: 'clamp(4rem, 10vh, 8rem)'}}>
                                          {spellingTimeRemaining}s
                                        </div>
                                      </div>
                                      <div className="text-gray-800 font-bold"
                                           style={{fontSize: 'clamp(1.25rem, 3vh, 2.5rem)'}}>
                                        You have 30 seconds to type your answer on your device!
                                      </div>
                                    </>
                                  )}

                                  {/* Default: No phase yet */}
                                  {!spellingPhase && (
                                    <>
                                      <div className="font-black text-blue-600 mb-2"
                                           style={{fontSize: 'clamp(1.5rem, 4vh, 3.5rem)', textShadow: '0 2px 4px rgba(255,255,255,0.9)'}}>
                                        🎤 SPELLING BEE
                                      </div>
                                      <div className="text-gray-700 font-bold"
                                           style={{fontSize: 'clamp(1rem, 2.5vh, 2rem)'}}>
                                        Listen → Think → Spell
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* OTHER GAME TYPES: Per-tier cards */
                            <div className="space-y-3 md:space-y-4 max-w-6xl mx-auto">
                              {currentChallenge.questions.map((tierData, idx) => (
                                <div
                                  key={idx}
                                  className="bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-2xl border-2 border-white/60 p-3 md:p-4 shadow-lg"
                                >
                                  <div className="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4">
                                    {/* Player Names */}
                                    <div className="flex flex-wrap justify-center md:justify-start gap-1 md:gap-2 min-w-[30%]">
                                      {tierData.players.map((player, pIdx) => (
                                        <span
                                          key={pIdx}
                                          className="bg-yellow-400 text-gray-900 font-bold px-2 md:px-3 py-1 rounded-full shadow-md"
                                          style={{fontSize: 'clamp(0.75rem, 1.5vh, 1.25rem)'}}
                                        >
                                          {player.name}
                                        </span>
                                      ))}
                                    </div>

                                    {/* Question Display - varies by game type */}
                                    <div className="flex-1 text-center">
                                      {/* Speed Math: show equation */}
                                      {currentChallenge.gameType === 'speed-math' && (
                                    <div className="font-black text-gray-900"
                                         style={{
                                           fontSize: 'clamp(1.5rem, 4vh, 3.5rem)',
                                           textShadow: '0 2px 4px rgba(255,255,255,0.9)'
                                         }}>
                                      {tierData.question} = ?
                                    </div>
                                  )}

                                  {/* True/False: show statement */}
                                  {currentChallenge.gameType === 'true-false' && (
                                    <div className="font-black text-gray-900"
                                         style={{
                                           fontSize: 'clamp(1.25rem, 3.5vh, 3rem)',
                                           textShadow: '0 2px 4px rgba(255,255,255,0.9)'
                                         }}>
                                      {tierData.question}
                                    </div>
                                  )}

                                  {/* Trivia: show question + options */}
                                  {currentChallenge.gameType === 'trivia' && (
                                    <div>
                                      <div className="font-black text-gray-900 mb-2"
                                           style={{
                                             fontSize: 'clamp(1rem, 2.5vh, 2rem)',
                                             textShadow: '0 2px 4px rgba(255,255,255,0.9)'
                                           }}>
                                        {tierData.question}
                                      </div>
                                      <div className="grid grid-cols-2 gap-2 mt-2">
                                        {tierData.options?.map((opt, i) => (
                                          <div key={i} className="bg-white/40 rounded-lg px-2 py-1 font-semibold text-gray-900"
                                               style={{fontSize: 'clamp(0.875rem, 1.5vh, 1.25rem)'}}>
                                            {String.fromCharCode(65 + i)}. {opt}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Word Scramble: show scrambled letters + hint */}
                                  {currentChallenge.gameType === 'word-scramble' && (
                                    <div>
                                      <div className="flex justify-center items-center flex-wrap gap-1 md:gap-2 mb-2">
                                        {tierData.question.split('').map((letter, idx) => (
                                          <div
                                            key={idx}
                                            className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-lg border-2 border-white flex items-center justify-center"
                                            style={{
                                              width: 'clamp(2rem, 5vh, 4rem)',
                                              height: 'clamp(2rem, 5vh, 4rem)',
                                            }}
                                          >
                                            <span className="font-black text-white"
                                                  style={{fontSize: 'clamp(1rem, 3vh, 2.5rem)', textShadow: '1px 1px 2px rgba(0,0,0,0.3)'}}>
                                              {letter}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                      {tierData.hint && showWordScrambleHint && (
                                        <div className="text-yellow-700 font-bold animate-pulse"
                                             style={{fontSize: 'clamp(0.875rem, 1.5vh, 1.25rem)'}}>
                                          💡 {tierData.hint}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="font-bold text-gray-900" style={{fontSize: 'clamp(1.25rem, 3vh, 2.5rem)'}}>Loading questions...</div>
                      )}
                    </>
                  ) : (
                    <div className="font-bold text-gray-900" style={{fontSize: 'clamp(1.25rem, 3vh, 2.5rem)'}}>Loading challenge...</div>
                  )}
                </div>
              </div>
            </div>

            {/* Player Submissions - Compact - flex-shrink-0 */}
            <div className="bg-gray-900 bg-opacity-90 rounded-2xl shadow-xl border-yellow-400 flex-shrink-0" style={{padding: 'clamp(0.5rem, 1.5vh, 1.5rem)', borderWidth: 'clamp(2px, 0.5vh, 6px)'}}>
              <div className="grid grid-cols-4 md:grid-cols-6" style={{gap: 'clamp(0.25rem, 0.5vh, 0.75rem)'}}>
                {players.map((player, idx) => {
                  const hasSubmitted = submissions.includes(player.id);
                  return (
                    <div
                      key={player.id}
                      className={`rounded-xl text-center ${
                        hasSubmitted
                          ? 'bg-green-500 border-green-300'
                          : 'bg-gray-600 border-gray-500'
                      }`}
                      style={{
                        padding: 'clamp(0.25rem, 0.75vh, 0.75rem)',
                        borderWidth: 'clamp(2px, 0.4vh, 4px)'
                      }}
                    >
                      <div style={{fontSize: 'clamp(1rem, 2.5vh, 2.5rem)'}}>
                        {hasSubmitted ? '✅' : '⏳'}
                      </div>
                      <div className="font-bold text-white truncate" style={{fontSize: 'clamp(0.625rem, 1vh, 1rem)'}}>{player.name}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // CHALLENGE_RESULTS STATE
  if (gameState === 'CHALLENGE_RESULTS') {
    const section = getSectionData();

    return (
      <div
        className="fixed inset-0 w-screen h-screen overflow-hidden flex flex-col"
        style={{
          backgroundImage: `url(${getBackgroundImage()})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50 pointer-events-none"></div>
        <div className="relative z-10 h-full w-full flex flex-col justify-center items-center px-8 md:px-12 lg:px-16 py-[2vh] overflow-y-auto">
          <div className="w-full max-w-7xl flex flex-col" style={{maxHeight: '96vh', gap: 'clamp(0.5rem, 1vh, 1.5rem)'}}>
            {/* Title */}
            <h1 className="font-black text-yellow-300 text-center drop-shadow-2xl flex-shrink-0"
                style={{
                  fontSize: 'clamp(1.5rem, 4.5vh, 4rem)',
                  WebkitTextStroke: '2px #991b1b',
                  paintOrder: 'stroke fill',
                  textShadow: '3px 3px 0px rgba(0,0,0,0.5)'
                }}>
              📊 Round {currentRound} Results
            </h1>

            {/* Single unified results panel */}
            <div className="relative flex-1 min-h-0 overflow-y-auto">
              <div className="relative bg-white/30 backdrop-blur-xl rounded-3xl h-full border border-white/40"
                   style={{
                     padding: 'clamp(1.5rem, 3vh, 3rem)',
                     boxShadow: `
                       inset 0 1px 1px 0 rgba(255, 255, 255, 0.6),
                       inset 0 -1px 1px 0 rgba(255, 255, 255, 0.2),
                       0 20px 40px rgba(0, 0, 0, 0.3),
                       0 10px 20px rgba(0, 0, 0, 0.2),
                       0 0 100px rgba(255, 255, 255, 0.1)
                     `,
                     background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.2) 100%)'
                   }}>
                <div className="absolute inset-0 rounded-3xl"
                     style={{
                       background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.3) 0%, transparent 50%, rgba(0, 0, 0, 0.05) 100%)',
                       pointerEvents: 'none'
                     }}></div>
                <div className="relative z-10 h-full flex flex-col" style={{gap: 'clamp(1.5rem, 3vh, 3rem)'}}>

                  {/* Round Results */}
                  <div style={{display: 'flex', flexDirection: 'column', gap: 'clamp(0.5rem, 1vh, 1rem)'}}>
                    {results.map((result) => {
                      const player = players.find(p => p.id === result.playerId);
                      if (!player) return null;
                      return (
                        <div
                          key={result.playerId}
                          className={`rounded-2xl flex justify-between items-center shadow-lg ${
                            result.isCorrect
                              ? 'bg-gradient-to-r from-green-400 to-green-500'
                              : 'bg-gradient-to-r from-red-400 to-red-500'
                          }`}
                          style={{padding: 'clamp(0.75rem, 2vh, 2rem)'}}
                        >
                          <div className="flex items-center" style={{gap: 'clamp(0.75rem, 1.5vh, 2rem)'}}>
                            <div style={{fontSize: 'clamp(2rem, 4vh, 5rem)'}}>
                              {result.isCorrect ? '✅' : '❌'}
                            </div>
                            <div>
                              <div className="font-black text-white drop-shadow-xl" style={{fontSize: 'clamp(1rem, 2.5vh, 2.5rem)'}}>{player.name}</div>
                              <div className="text-white font-bold opacity-90" style={{fontSize: 'clamp(0.875rem, 1.75vh, 1.5rem)'}}>"{result.answer || 'No answer'}"</div>
                            </div>
                          </div>
                          <div className="font-black text-white drop-shadow-xl" style={{fontSize: 'clamp(1.5rem, 4vh, 5rem)'}}>
                            +{result.points}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Divider */}
                  <div className="border-t-2 border-white/40"></div>

                  {/* Top Scores */}
                  <div>
                    <h2 className="font-black text-yellow-300 text-center drop-shadow-xl" style={{fontSize: 'clamp(1.25rem, 3vh, 3rem)', marginBottom: 'clamp(1rem, 2vh, 2rem)', textShadow: '2px 2px 4px rgba(0,0,0,0.5)'}}>
                      🏆 TOP SCORES 🏆
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4" style={{gap: 'clamp(0.75rem, 1.5vh, 1.5rem)'}}>
                      {[...players]
                        .sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0))
                        .map((player, index) => (
                          <div
                            key={player.id}
                            className={`rounded-2xl text-center shadow-xl border-4 ${
                              index === 0 ? 'bg-gradient-to-br from-yellow-300 to-yellow-500 border-yellow-600' :
                              index === 1 ? 'bg-gradient-to-br from-gray-200 to-gray-400 border-gray-500' :
                              index === 2 ? 'bg-gradient-to-br from-orange-300 to-orange-500 border-orange-600' :
                              'bg-gradient-to-br from-blue-300 to-blue-500 border-blue-600'
                            }`}
                            style={{padding: 'clamp(0.75rem, 1.5vh, 2rem)'}}
                          >
                            <div style={{fontSize: 'clamp(2rem, 4vh, 4rem)', marginBottom: 'clamp(0.25rem, 0.5vh, 0.75rem)'}}>
                              {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🎯'}
                            </div>
                            <div className="font-black text-gray-900 truncate" style={{fontSize: 'clamp(0.875rem, 1.75vh, 1.75rem)'}}>{player.name}</div>
                            <div className="font-black text-gray-900" style={{fontSize: 'clamp(1.25rem, 2.5vh, 3rem)'}}>
                              {scores[player.id] || 0}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
          {/* Progress bar at bottom */}
          <div className="absolute bottom-0 left-0 right-0 px-8">
            <ProgressBar key={`results-${timerKey}`} duration={5} color="green" />
          </div>
        </div>
      </div>
    );
  }

  // SECTION_COMPLETE STATE
  if (gameState === 'SECTION_COMPLETE') {
    const section = getSectionData();
    if (!section) return null;

    return (
      <div className="fixed inset-0 w-screen h-screen overflow-hidden"
        style={{backgroundImage: `url(${getBackgroundImage()})`, backgroundSize: 'cover', backgroundPosition: 'center'}}>
        <style>{`
          @keyframes starburst {
            0% {
              transform: scale(0.7) rotate(0deg);
              opacity: 0.4;
            }
            50% {
              transform: scale(1.15) rotate(180deg);
              opacity: 1;
            }
            100% {
              transform: scale(0.7) rotate(360deg);
              opacity: 0.4;
            }
          }
          .animate-starburst {
            animation: starburst 4s ease-in-out infinite;
          }
          @keyframes starPulse {
            0%, 100% {
              transform: scale(1);
              filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.8));
            }
            50% {
              transform: scale(1.1);
              filter: drop-shadow(0 0 30px rgba(255, 215, 0, 1));
            }
          }
          .star-earned {
            animation: starPulse 2s ease-in-out infinite;
          }
        `}</style>
        <div className="absolute inset-0 bg-black bg-opacity-50 pointer-events-none"></div>
        <div className="relative z-10 h-full w-full flex flex-col justify-center items-center px-8 md:px-12 lg:px-16 py-[2vh] overflow-y-auto">
          <div className="w-full max-w-7xl text-center flex flex-col items-center" style={{maxHeight: '96vh', gap: 'clamp(0.5rem, 1.5vh, 1.5rem)'}}>
            {/* Celebration burst with scale, fade, rotate animation */}
            <div className="mx-auto flex-shrink-0" style={{width: 'clamp(6rem, 15vh, 16rem)', height: 'clamp(6rem, 15vh, 16rem)'}}>
              <img src="/images/celebration-burst.png" alt="Celebration"
                className="animate-starburst object-contain drop-shadow-2xl"
                style={{width: '100%', height: '100%'}} />
            </div>

            <h1 className="font-black text-yellow-300 drop-shadow-2xl flex-shrink-0"
              style={{
                fontSize: 'clamp(1.5rem, 5vh, 5rem)',
                WebkitTextStroke: '2px #15803d',
                paintOrder: 'stroke fill',
                textShadow: '3px 3px 0px rgba(0,0,0,0.5), 0 0 20px rgba(255,255,255,0.8)'
              }}>
              SECTION COMPLETE! 🎯
            </h1>

            <div className="flex justify-center items-center flex-shrink-0" style={{gap: 'clamp(1rem, 3vh, 3rem)'}}>
              {sectionStars >= 1 && (
                <img
                  src="/images/star-icon.png"
                  alt="Star"
                  className="star-earned"
                  style={{
                    width: 'clamp(4rem, 12vh, 12rem)',
                    height: 'clamp(4rem, 12vh, 12rem)',
                    animationDelay: '0s'
                  }}
                />
              )}
              {sectionStars >= 2 && (
                <img
                  src="/images/star-icon.png"
                  alt="Star"
                  className="star-earned"
                  style={{
                    width: 'clamp(4rem, 12vh, 12rem)',
                    height: 'clamp(4rem, 12vh, 12rem)',
                    animationDelay: '0.2s'
                  }}
                />
              )}
              {sectionStars >= 3 && (
                <img
                  src="/images/star-icon.png"
                  alt="Star"
                  className="star-earned"
                  style={{
                    width: 'clamp(4rem, 12vh, 12rem)',
                    height: 'clamp(4rem, 12vh, 12rem)',
                    animationDelay: '0.4s'
                  }}
                />
              )}
              {sectionStars >= 4 && (
                <img
                  src="/images/star-icon.png"
                  alt="Star"
                  className="star-earned"
                  style={{
                    width: 'clamp(4rem, 12vh, 12rem)',
                    height: 'clamp(4rem, 12vh, 12rem)',
                    animationDelay: '0.6s'
                  }}
                />
              )}
              {sectionStars >= 5 && (
                <img
                  src="/images/star-icon.png"
                  alt="Star"
                  className="star-earned"
                  style={{
                    width: 'clamp(4rem, 12vh, 12rem)',
                    height: 'clamp(4rem, 12vh, 12rem)',
                    animationDelay: '0.8s'
                  }}
                />
              )}
            </div>

            {/* Glassmorphism panel */}
            <div className="relative w-full flex-1 min-h-0 overflow-y-auto">
              <div className="relative bg-white/30 backdrop-blur-xl rounded-3xl h-full flex flex-col justify-center border border-white/40"
                   style={{
                     padding: 'clamp(1.5rem, 4vh, 3.5rem)',
                     boxShadow: `
                       inset 0 1px 1px 0 rgba(255, 255, 255, 0.6),
                       inset 0 -1px 1px 0 rgba(255, 255, 255, 0.2),
                       0 20px 40px rgba(0, 0, 0, 0.3),
                       0 10px 20px rgba(0, 0, 0, 0.2),
                       0 0 100px rgba(255, 255, 255, 0.1)
                     `,
                     background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.2) 100%)'
                   }}>
                <div className="absolute inset-0 rounded-3xl"
                     style={{
                       background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.3) 0%, transparent 50%, rgba(0, 0, 0, 0.05) 100%)',
                       pointerEvents: 'none'
                     }}></div>
                <div className="relative z-10">
                  {sectionStars >= 5 ? (
                    <>
                      <h2 className="font-black text-green-600" style={{fontSize: 'clamp(1.25rem, 3vh, 3rem)', marginBottom: 'clamp(1rem, 2vh, 2rem)', textShadow: '0 2px 4px rgba(255,255,255,0.9)'}}>
                        {section.successMessage.title}
                      </h2>
                      {section.successMessage.narrative.map((line, i) => (
                        <p key={i} className="text-gray-900 font-black leading-relaxed" style={{fontSize: 'clamp(1rem, 2.5vh, 2rem)', marginBottom: 'clamp(0.75rem, 2vh, 1.75rem)', textShadow: '0 2px 4px rgba(255,255,255,0.9)'}}>
                          {line}
                        </p>
                      ))}
                    </>
                  ) : (
                    <>
                      <h2 className="font-black text-red-600" style={{fontSize: 'clamp(1.25rem, 3vh, 3rem)', marginBottom: 'clamp(1rem, 2vh, 2rem)', textShadow: '0 2px 4px rgba(255,255,255,0.9)'}}>
                        {section.retryMessage.title}
                      </h2>
                      {section.retryMessage.narrative.map((line, i) => (
                        <p key={i} className="text-gray-900 font-black leading-relaxed" style={{fontSize: 'clamp(1rem, 2.5vh, 2rem)', marginBottom: 'clamp(0.75rem, 2vh, 1.75rem)', textShadow: '0 2px 4px rgba(255,255,255,0.9)'}}>
                          {line}
                        </p>
                      ))}
                    </>
                  )}

                  {sectionStars < 5 && (
                    <div style={{marginTop: 'clamp(1.5rem, 3vh, 3.5rem)'}}>
                      <div className="bg-gradient-to-r from-red-400 via-red-500 to-red-600 rounded-full inline-block shadow-xl mx-auto animate-pulse"
                           style={{padding: 'clamp(0.75rem, 2vh, 2rem) clamp(1.5rem, 4vh, 4rem)', border: '4px solid white'}}>
                        <div className="font-black text-white drop-shadow-lg" style={{fontSize: 'clamp(1rem, 2.5vh, 2.5rem)'}}>
                          NEED 5 STARS! RETRYING... 🔄
                        </div>
                      </div>
                    </div>
                  )}

                  {sectionStars >= 5 && (
                    <div style={{marginTop: 'clamp(1.5rem, 3vh, 3.5rem)'}}>
                      <div className="bg-gradient-to-r from-orange-400 via-pink-500 to-blue-500 rounded-full inline-block shadow-xl mx-auto"
                           style={{padding: 'clamp(0.75rem, 2vh, 2rem) clamp(1.5rem, 4vh, 4rem)', border: '4px solid white'}}>
                        <div className="font-black text-white drop-shadow-lg" style={{fontSize: 'clamp(1rem, 2.5vh, 2.5rem)'}}>
                          NEXT SECTION LOADING... 🚀
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Progress bar at bottom */}
          <div className="absolute bottom-0 left-0 right-0 px-8">
            <ProgressBar key={`section-complete-${timerKey}`} duration={5} color="yellow" />
          </div>
        </div>
      </div>
    );
  }

  // MAP_TRANSITION STATE
  if (gameState === 'MAP_TRANSITION') {
    return (
      <div className="fixed inset-0 w-screen h-screen overflow-hidden"
        style={{backgroundImage: 'url(/images/home-background.png)', backgroundSize: 'cover', backgroundPosition: 'center'}}>
        <div className="absolute inset-0 bg-black bg-opacity-50 pointer-events-none"></div>
        <div className="relative z-10 h-full w-full flex flex-col justify-center items-center px-8 md:px-12 lg:px-16 py-[2vh] overflow-y-auto">
          <div className="w-full max-w-7xl flex flex-col" style={{maxHeight: '96vh', gap: 'clamp(0.5rem, 1.5vh, 1.5rem)'}}>
            {/* Title */}
            <h1 className="font-black text-yellow-300 drop-shadow-2xl text-center px-4 flex-shrink-0"
              style={{
                fontSize: 'clamp(1.5rem, 5vh, 5rem)',
                WebkitTextStroke: '2px #1e40af',
                paintOrder: 'stroke fill',
                textShadow: '3px 3px 0px rgba(0,0,0,0.5), 0 0 20px rgba(255,255,255,0.8)'
              }}>
              🗺️ CHRISTMAS VILLAGE JOURNEY
            </h1>

            {/* Map with Glassmorphism */}
            <div className="relative flex-1 min-h-0">
              <div className="relative bg-white/30 backdrop-blur-xl rounded-3xl h-full border border-white/40"
                   style={{
                     padding: 'clamp(1rem, 2vh, 2rem)',
                     boxShadow: `
                       inset 0 1px 1px 0 rgba(255, 255, 255, 0.6),
                       inset 0 -1px 1px 0 rgba(255, 255, 255, 0.2),
                       0 20px 40px rgba(0, 0, 0, 0.3),
                       0 10px 20px rgba(0, 0, 0, 0.2),
                       0 0 100px rgba(255, 255, 255, 0.1)
                     `,
                     background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.2) 100%)'
                   }}>
                <div className="absolute inset-0 rounded-3xl"
                     style={{
                       background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.3) 0%, transparent 50%, rgba(0, 0, 0, 0.05) 100%)',
                       pointerEvents: 'none'
                     }}></div>
                <div className="relative z-10 h-full">
                  <img src="/images/village-map.png" alt="Village Map"
                    className="w-full h-full object-contain rounded-2xl" />
                </div>
              </div>
            </div>

            {/* Progress with Glassmorphism */}
            <div className="relative flex-shrink-0">
              <div className="relative bg-white/30 backdrop-blur-xl rounded-3xl border border-white/40"
                   style={{
                     padding: 'clamp(1rem, 2vh, 2rem)',
                     boxShadow: `
                       inset 0 1px 1px 0 rgba(255, 255, 255, 0.6),
                       inset 0 -1px 1px 0 rgba(255, 255, 255, 0.2),
                       0 20px 40px rgba(0, 0, 0, 0.3),
                       0 10px 20px rgba(0, 0, 0, 0.2),
                       0 0 100px rgba(255, 255, 255, 0.1)
                     `,
                     background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.2) 100%)'
                   }}>
                <div className="absolute inset-0 rounded-3xl"
                     style={{
                       background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.3) 0%, transparent 50%, rgba(0, 0, 0, 0.05) 100%)',
                       pointerEvents: 'none'
                     }}></div>
                <div className="relative z-10">
                  <div className="font-black text-purple-600 text-center"
                    style={{
                      fontSize: 'clamp(1.25rem, 3vh, 3rem)',
                      marginBottom: 'clamp(0.5rem, 1.5vh, 1.5rem)',
                      textShadow: '0 2px 4px rgba(255,255,255,0.9)'
                    }}>
                    PROGRESS: {currentSection}/5 SECTIONS 🎯
                  </div>
                  <div className="flex justify-center items-center"
                    style={{gap: 'clamp(0.5rem, 1.5vh, 1.5rem)'}}>
                    {[1, 2, 3, 4, 5].map(section => (
                      <div key={section}
                        className={`transform transition-all ${section <= currentSection ? 'scale-110 opacity-100' : 'scale-75 opacity-30'}`}
                        style={{
                          fontSize: 'clamp(2rem, 5vh, 5rem)',
                          filter: section <= currentSection ? 'drop-shadow(0 0 10px gold)' : 'none'
                        }}>
                        ⭐
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Progress bar at bottom */}
          <div className="absolute bottom-0 left-0 right-0 px-8">
            <ProgressBar key={`map-${timerKey}`} duration={3} color="blue" />
          </div>
        </div>
      </div>
    );
  }

  // VICTORY STATE
  if (gameState === 'VICTORY') {
    return (
      <div className="fixed inset-0 w-screen h-screen overflow-hidden"
        style={{backgroundImage: 'url(/images/victory-scene.png)', backgroundSize: 'cover', backgroundPosition: 'center'}}>
        <style>{`
          @keyframes circle {
            0% { transform: translate(0, -20px); }
            12.5% { transform: translate(14px, -14px); }
            25% { transform: translate(20px, 0); }
            37.5% { transform: translate(14px, 14px); }
            50% { transform: translate(0, 20px); }
            62.5% { transform: translate(-14px, 14px); }
            75% { transform: translate(-20px, 0); }
            87.5% { transform: translate(-14px, -14px); }
            100% { transform: translate(0, -20px); }
          }
          .animate-circle {
            animation: circle 5s linear infinite;
          }
          @keyframes fadeInUp {
            0% {
              opacity: 0;
              transform: translateY(20px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes pulseOpacity {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.6;
            }
          }
          .fade-in-narrative {
            opacity: 0;
            animation:
              fadeInUp 0.8s ease-out 2s forwards,
              pulseOpacity 4s ease-in-out 2.8s infinite;
          }
          .fade-in-champions {
            opacity: 0;
            animation:
              fadeInUp 0.8s ease-out 2.5s forwards,
              pulseOpacity 4s ease-in-out 3.3s infinite;
          }
        `}</style>
        <div className="absolute inset-0 bg-black bg-opacity-50 pointer-events-none"></div>
        <div className="relative z-10 h-full w-full flex flex-col justify-center items-center px-8 md:px-12 lg:px-16 py-[2vh] overflow-y-auto">
          <div className="w-full max-w-7xl flex flex-col" style={{maxHeight: '96vh', gap: 'clamp(0.5rem, 1.5vh, 1.5rem)'}}>
            {/* Characters with circle + wiggle animation */}
            <div className="flex justify-center items-center flex-shrink-0" style={{gap: 'clamp(1rem, 2vh, 3rem)'}}>
              <div className="animate-circle" style={{width: 'clamp(4rem, 10vh, 12rem)', height: 'clamp(4rem, 10vh, 12rem)'}}>
                <img src="/images/santa-character.png" alt="Santa"
                  className="object-contain animate-wiggle drop-shadow-2xl"
                  style={{width: '100%', height: '100%'}} />
              </div>
              <div className="animate-circle" style={{width: 'clamp(4rem, 10vh, 12rem)', height: 'clamp(4rem, 10vh, 12rem)', animationDelay: '0.2s'}}>
                <img src="/images/elf-character.png" alt="Elf"
                  className="object-contain animate-wiggle drop-shadow-2xl"
                  style={{width: '100%', height: '100%'}} />
              </div>
              <div className="animate-circle" style={{width: 'clamp(4rem, 10vh, 12rem)', height: 'clamp(4rem, 10vh, 12rem)', animationDelay: '0.4s'}}>
                <img src="/images/reindeer-character.png" alt="Reindeer"
                  className="object-contain animate-wiggle drop-shadow-2xl"
                  style={{width: '100%', height: '100%'}} />
              </div>
            </div>

            {/* Title */}
            <h1 className="font-black text-yellow-300 drop-shadow-2xl text-center flex-shrink-0"
              style={{
                fontSize: 'clamp(1.5rem, 5vh, 5rem)',
                WebkitTextStroke: '2px #15803d',
                paintOrder: 'stroke fill',
                textShadow: '3px 3px 0px rgba(0,0,0,0.5), 0 0 20px rgba(255,255,255,0.8)'
              }}>
              CHRISTMAS IS SAVED! 🎯
            </h1>

            {/* Narrative with Glassmorphism */}
            <div className="relative flex-shrink-0 fade-in-narrative">
              <div className="relative bg-white/30 backdrop-blur-xl rounded-3xl border border-white/40"
                   style={{
                     padding: 'clamp(1.5rem, 3vh, 3rem)',
                     boxShadow: `
                       inset 0 1px 1px 0 rgba(255, 255, 255, 0.6),
                       inset 0 -1px 1px 0 rgba(255, 255, 255, 0.2),
                       0 20px 40px rgba(0, 0, 0, 0.3),
                       0 10px 20px rgba(0, 0, 0, 0.2),
                       0 0 100px rgba(255, 255, 255, 0.1)
                     `,
                     background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.2) 100%)'
                   }}>
                <div className="absolute inset-0 rounded-3xl"
                     style={{
                       background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.3) 0%, transparent 50%, rgba(0, 0, 0, 0.05) 100%)',
                       pointerEvents: 'none'
                     }}></div>
                <div className="relative z-10">
                  {christmasStory.victory.narrative.map((line, i) => (
                    <p key={i} className="text-gray-900 font-black leading-relaxed" style={{fontSize: 'clamp(1rem, 2.5vh, 2rem)', marginBottom: 'clamp(0.75rem, 2vh, 1.75rem)', textShadow: '0 2px 4px rgba(255,255,255,0.9)'}}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* Champions with Glassmorphism */}
            <div className="relative flex-1 min-h-0 fade-in-champions">
              <div className="relative bg-white/30 backdrop-blur-xl rounded-3xl h-full flex flex-col border border-white/40"
                   style={{
                     padding: 'clamp(1.5rem, 2vh, 2rem)',
                     boxShadow: `
                       inset 0 1px 1px 0 rgba(255, 255, 255, 0.6),
                       inset 0 -1px 1px 0 rgba(255, 255, 255, 0.2),
                       0 20px 40px rgba(0, 0, 0, 0.3),
                       0 10px 20px rgba(0, 0, 0, 0.2),
                       0 0 100px rgba(255, 255, 255, 0.1)
                     `,
                     background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.2) 100%)'
                   }}>
                <div className="absolute inset-0 rounded-3xl"
                     style={{
                       background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.3) 0%, transparent 50%, rgba(0, 0, 0, 0.05) 100%)',
                       pointerEvents: 'none'
                     }}></div>
                <div className="relative z-10 h-full flex flex-col">
                  <h2 className="font-black text-purple-600 text-center flex-shrink-0" style={{fontSize: 'clamp(1.25rem, 3vh, 3rem)', marginBottom: 'clamp(0.5rem, 1vh, 1.5rem)', textShadow: '0 2px 4px rgba(255,255,255,0.9)'}}>
                    🏆 FINAL CHAMPIONS 🏆
                  </h2>
                  <div className="flex-1 flex flex-col justify-center" style={{gap: 'clamp(0.25rem, 0.75vh, 0.75rem)'}}>
                    {[...players].sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0)).map((player, index) => (
                      <div key={player.id}
                        className={`rounded-2xl flex justify-between items-center shadow-lg ${
                          index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                          index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                          index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-500' :
                          'bg-gradient-to-r from-blue-400 to-blue-500'
                        }`}
                        style={{padding: 'clamp(0.5rem, 1vh, 1rem)', border: '3px solid white'}}>
                        <div className="flex items-center" style={{gap: 'clamp(0.5rem, 1vh, 1rem)'}}>
                          <div style={{fontSize: 'clamp(1.25rem, 3vh, 3rem)'}}>
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🎯'}
                          </div>
                          <div className="font-bold text-white drop-shadow-lg" style={{fontSize: 'clamp(0.875rem, 2vh, 2rem)'}}>{player.name}</div>
                        </div>
                        <div className="font-black text-white drop-shadow-lg" style={{fontSize: 'clamp(1rem, 2.5vh, 3rem)'}}>
                          {scores[player.id] || 0}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default/Loading
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="text-4xl text-white">{gameState}</div>
    </div>
  );
}

export default CoordinatorScreen;
