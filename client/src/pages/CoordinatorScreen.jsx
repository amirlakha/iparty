import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import christmasStory from '../data/christmasStory';
import { QRCodeSVG } from 'qrcode.react';

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

  useEffect(() => {
    if (!socket || !roomCode) return;

    socket.on('game-state-update', (data) => {
      setGameState(data.state);
      setCurrentRound(data.round || 0);
      setCurrentSection(data.section || 0);

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
      setGameState('INTRODUCTION');
      setPlayers(data.game.players);
      setScores(data.game.scores);
    });

    socket.on('challenge-data', (data) => {
      setCurrentChallenge(data.challenge);
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

    return () => {
      socket.off('game-state-update');
      socket.off('player-joined');
      socket.off('game-started');
      socket.off('challenge-data');
      socket.off('answer-submitted');
      socket.off('challenge-results');
      socket.off('section-stars');
      socket.off('scores-updated');
    };
  }, [socket, roomCode]);

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
      '/src/assets/images/bg-toy-machine.png',
      '/src/assets/images/bg-reindeer-stable.png',
      '/src/assets/images/bg-gift-wrap.png',
      '/src/assets/images/bg-cookie-kitchen.png',
      '/src/assets/images/bg-sleigh-launch.png'
    ];
    return backgrounds[currentSection];
  };

  const getCharacterImage = () => {
    if (currentSection === 0) return '/src/assets/images/santa-character.png';
    const characters = [
      null,
      '/src/assets/images/elf-character.png',      // Toy Machine
      '/src/assets/images/reindeer-character.png', // Reindeer Stable
      '/src/assets/images/santa-character.png',    // Gift Wrap
      '/src/assets/images/elf-character.png',      // Cookie Kitchen
      '/src/assets/images/reindeer-character.png'  // Sleigh Launch
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
          backgroundImage: 'url(/src/assets/images/home-background.png)',
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
              src="/src/assets/images/game-logo.png"
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
        className="fixed inset-0 w-screen h-screen overflow-hidden flex items-center justify-center"
        style={{
          backgroundImage: 'url(/src/assets/images/home-background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Darker overlay for story readability */}
        <div className="absolute inset-0 bg-black bg-opacity-40 pointer-events-none"></div>

        <div className="relative z-10 max-w-5xl text-center px-12">
          {/* Santa Character Image - Larger and more prominent */}
          <img
            src="/src/assets/images/santa-character.png"
            alt="Santa"
            className="w-80 h-80 mx-auto mb-8 animate-bounce object-contain drop-shadow-2xl"
          />

          <h1 className="text-8xl font-black text-white mb-12 drop-shadow-2xl">
            {christmasStory.title}
          </h1>

          <div className="bg-white bg-opacity-95 rounded-3xl p-12 shadow-2xl border-4 border-red-500">
            {christmasStory.introduction.narrative.map((line, i) => (
              <p key={i} className="text-3xl text-gray-800 font-semibold mb-6 leading-relaxed">
                {line}
              </p>
            ))}

            <div className="mt-12 bg-gradient-to-r from-red-600 to-green-600 rounded-2xl py-6 px-8 inline-block shadow-xl">
              <div className="text-5xl font-black text-white animate-pulse">
                Get Ready to Save Christmas!
              </div>
            </div>
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
        className="fixed inset-0 w-screen h-screen overflow-hidden flex items-center justify-center"
        style={{
          backgroundImage: `url(${getBackgroundImage()})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Medium overlay for readability */}
        <div className="absolute inset-0 bg-black bg-opacity-30 pointer-events-none"></div>

        <div className="max-w-5xl text-center relative z-10 px-12">
          {/* Character Image - Larger */}
          <img
            src={getCharacterImage()}
            alt="Character"
            className="w-72 h-72 mx-auto mb-8 object-contain drop-shadow-2xl animate-bounce"
          />

          <h1 className="text-8xl font-black text-white mb-10 drop-shadow-2xl">
            {section.emoji} {section.name}
          </h1>

          <div className="bg-white bg-opacity-95 rounded-3xl p-12 shadow-2xl border-4 border-blue-500">
            <h2 className="text-5xl font-black text-blue-600 mb-8">
              {section.storyIntro.title}
            </h2>
            {section.storyIntro.narrative.map((line, i) => (
              <p key={i} className="text-3xl text-gray-800 font-semibold mb-6 leading-relaxed">
                {line}
              </p>
            ))}

            <div className="mt-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl py-4 px-8 inline-block shadow-lg">
              <div className="text-3xl font-black text-white">
                Section {currentSection} of 5 • Need ⭐⭐⭐ to pass
              </div>
            </div>
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
        {/* Medium overlay for readability */}
        <div className="absolute inset-0 bg-black bg-opacity-35 pointer-events-none"></div>

        <div className="relative z-10 flex-1 flex flex-col p-8">
          {/* Header */}
          <div className="bg-white rounded-2xl p-6 mb-6 shadow-xl border-4 border-purple-500">
            <div className="flex justify-between items-center">
              <div className="text-3xl font-black text-purple-600">
                {section?.emoji} {section?.name} • Round {currentRound}
              </div>
              <div className="text-3xl font-black text-gray-700">
                Section {currentSection} of 5
              </div>
            </div>
          </div>

          {/* Main Question Card */}
          <div className="bg-white bg-opacity-95 rounded-3xl p-16 mb-6 shadow-2xl border-4 border-blue-500 flex-1 flex flex-col justify-center">
            <div className="text-center">
              {currentChallenge ? (
                <>
                  <div className="text-9xl mb-8">{currentChallenge.emoji || '🎮'}</div>
                  <h2 className="text-7xl font-black text-gray-900 mb-12 leading-tight">
                    {currentChallenge.question}
                  </h2>

                  {currentChallenge.options && (
                    <div className="grid grid-cols-2 gap-6 max-w-5xl mx-auto">
                      {currentChallenge.options.map((option, i) => {
                        const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500'];
                        return (
                          <div
                            key={i}
                            className={`${colors[i]} rounded-2xl p-8 border-4 border-white shadow-xl`}
                          >
                            <div className="text-5xl font-black text-white">{option}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-5xl font-bold text-gray-700">Loading challenge...</div>
              )}
            </div>
          </div>

          {/* Submissions Progress */}
          <div className="bg-white bg-opacity-95 rounded-2xl p-6 shadow-xl border-4 border-green-500">
            <h3 className="text-3xl font-bold text-gray-800 mb-4 text-center">
              Player Submissions ({submissions.length}/{players.length})
            </h3>
            <div className="grid grid-cols-6 gap-3">
              {players.map((player) => {
                const hasSubmitted = submissions.includes(player.id);
                return (
                  <div
                    key={player.id}
                    className={`rounded-xl p-3 text-center border-4 ${
                      hasSubmitted
                        ? 'bg-green-500 border-green-300'
                        : 'bg-gray-300 border-gray-400'
                    }`}
                  >
                    <div className="text-4xl mb-1">
                      {hasSubmitted ? '✅' : '⏳'}
                    </div>
                    <div className="text-lg font-bold text-white">{player.name}</div>
                  </div>
                );
              })}
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
        {/* Medium overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-35 pointer-events-none"></div>

        <div className="relative z-10 flex-1 flex flex-col p-8 overflow-y-auto">
          <h1 className="text-7xl font-black text-white text-center mb-8 drop-shadow-2xl">
            📊 Round {currentRound} Results
          </h1>

          {/* Results Table */}
          <div className="bg-white bg-opacity-95 rounded-3xl p-8 mb-6 shadow-2xl border-4 border-purple-500">
            <div className="space-y-3">
              {results.map((result) => {
                const player = players.find(p => p.id === result.playerId);
                if (!player) return null;

                return (
                  <div
                    key={result.playerId}
                    className={`rounded-2xl p-6 flex justify-between items-center border-4 ${
                      result.isCorrect
                        ? 'bg-green-500 border-green-300'
                        : 'bg-red-500 border-red-300'
                    }`}
                  >
                    <div className="flex items-center gap-6">
                      <div className="text-6xl">
                        {result.isCorrect ? '✅' : '❌'}
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-white">{player.name}</div>
                        <div className="text-xl text-white text-opacity-90">{result.answer || 'No answer'}</div>
                      </div>
                    </div>
                    <div className="text-5xl font-black text-white">
                      +{result.points} pts
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current Scoreboard */}
          <div className="bg-white bg-opacity-95 rounded-3xl p-8 shadow-2xl border-4 border-yellow-500">
            <h2 className="text-5xl font-black text-gray-800 mb-6 text-center">
              🏆 Current Scores
            </h2>
            <div className="grid grid-cols-4 gap-4">
              {[...players]
                .sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0))
                .map((player, index) => (
                  <div
                    key={player.id}
                    className={`rounded-xl p-6 text-center border-4 ${
                      index === 0
                        ? 'bg-yellow-400 border-yellow-600'
                        : index === 1
                        ? 'bg-gray-300 border-gray-500'
                        : index === 2
                        ? 'bg-orange-400 border-orange-600'
                        : 'bg-blue-400 border-blue-600'
                    }`}
                  >
                    <div className="text-5xl mb-2">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🎯'}
                    </div>
                    <div className="text-2xl font-bold text-white">{player.name}</div>
                    <div className="text-4xl font-black text-white">
                      {scores[player.id] || 0}
                    </div>
                  </div>
                ))}
            </div>
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
      <div
        className="fixed inset-0 w-screen h-screen overflow-hidden flex items-center justify-center"
        style={{
          backgroundImage: `url(${getBackgroundImage()})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Celebration overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/30 via-green-500/30 to-blue-500/30 pointer-events-none"></div>

        <div className="relative z-10 max-w-5xl text-center px-12">
          {/* Celebration burst image */}
          <img
            src="/src/assets/images/celebration-burst.png"
            alt="Celebration"
            className="w-64 h-64 mx-auto mb-6 animate-pulse"
          />

          <h1 className="text-9xl font-black text-white mb-8 drop-shadow-2xl">
            Section Complete!
          </h1>

          {/* Stars Display - Large and prominent */}
          <div className="text-9xl mb-8 animate-bounce">
            {sectionStars >= 3 ? '⭐⭐⭐' : sectionStars === 2 ? '⭐⭐' : '⭐'}
          </div>

          <div className="bg-white bg-opacity-95 rounded-3xl p-12 shadow-2xl border-4 border-green-500">
            <h2 className="text-5xl font-black text-green-600 mb-8">
              {section.successMessage.title}
            </h2>
            {section.successMessage.narrative.map((line, i) => (
              <p key={i} className="text-3xl text-gray-800 font-semibold mb-6 leading-relaxed">
                {line}
              </p>
            ))}

            {sectionStars < 3 && (
              <div className="mt-8 bg-red-500 rounded-2xl py-4 px-8 inline-block">
                <div className="text-4xl font-black text-white animate-pulse">
                  Need 3 stars to continue! Retrying section...
                </div>
              </div>
            )}

            {sectionStars >= 3 && (
              <div className="mt-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl py-4 px-8 inline-block">
                <div className="text-4xl font-black text-white">
                  Moving to next section! 🎉
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // MAP_TRANSITION STATE
  if (gameState === 'MAP_TRANSITION') {
    return (
      <div
        className="fixed inset-0 w-screen h-screen overflow-hidden flex items-center justify-center"
        style={{
          backgroundImage: 'url(/src/assets/images/home-background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Dark overlay for contrast */}
        <div className="absolute inset-0 bg-black bg-opacity-50 pointer-events-none"></div>

        <div className="relative z-10 max-w-6xl text-center px-12">
          <h1 className="text-8xl font-black text-white mb-12 drop-shadow-2xl">
            🗺️ Journey Through Christmas Village
          </h1>

          {/* Village Map */}
          <div className="bg-white bg-opacity-95 rounded-3xl p-8 mb-8 shadow-2xl border-4 border-blue-500">
            <img
              src="/src/assets/images/village-map.png"
              alt="Village Map"
              className="w-full max-w-5xl mx-auto rounded-2xl shadow-lg"
            />
          </div>

          {/* Progress Indicator */}
          <div className="bg-white bg-opacity-95 rounded-2xl p-8 shadow-2xl border-4 border-yellow-500">
            <div className="text-5xl font-black text-gray-800 mb-6">
              Progress: {currentSection} of 5 Sections Complete
            </div>
            <div className="flex justify-center gap-6 text-8xl">
              {[1, 2, 3, 4, 5].map(section => (
                <div
                  key={section}
                  className={`transform transition-all ${
                    section <= currentSection ? 'scale-100 opacity-100' : 'scale-75 opacity-30'
                  }`}
                >
                  ⭐
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // VICTORY STATE
  if (gameState === 'VICTORY') {
    return (
      <div
        className="fixed inset-0 w-screen h-screen overflow-hidden flex items-center justify-center"
        style={{
          backgroundImage: 'url(/src/assets/images/victory-scene.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Medium overlay for readability */}
        <div className="absolute inset-0 bg-black bg-opacity-40 pointer-events-none"></div>

        <div className="relative z-10 max-w-6xl text-center px-12">
          {/* All Three Characters - Larger */}
          <div className="flex justify-center gap-12 mb-10">
            <img src="/src/assets/images/santa-character.png" alt="Santa" className="w-48 h-48 object-contain animate-bounce drop-shadow-2xl" style={{ animationDelay: '0s' }} />
            <img src="/src/assets/images/elf-character.png" alt="Elf" className="w-48 h-48 object-contain animate-bounce drop-shadow-2xl" style={{ animationDelay: '0.2s' }} />
            <img src="/src/assets/images/reindeer-character.png" alt="Reindeer" className="w-48 h-48 object-contain animate-bounce drop-shadow-2xl" style={{ animationDelay: '0.4s' }} />
          </div>

          <h1 className="text-9xl font-black text-white mb-12 drop-shadow-2xl">
            CHRISTMAS IS SAVED!
          </h1>

          <div className="bg-white bg-opacity-95 rounded-3xl p-12 mb-8 shadow-2xl border-4 border-green-500">
            {christmasStory.victory.narrative.map((line, i) => (
              <p key={i} className="text-4xl text-gray-800 font-semibold mb-6 leading-relaxed">
                {line}
              </p>
            ))}
          </div>

          {/* Final Scoreboard */}
          <div className="bg-white bg-opacity-95 rounded-3xl p-8 shadow-2xl border-4 border-yellow-500">
            <h2 className="text-6xl font-black text-gray-800 mb-8">
              🏆 Final Champions
            </h2>
            <div className="space-y-4">
              {[...players]
                .sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0))
                .map((player, index) => (
                  <div
                    key={player.id}
                    className={`rounded-2xl p-6 flex justify-between items-center border-4 ${
                      index === 0
                        ? 'bg-yellow-400 border-yellow-600 transform scale-105'
                        : index === 1
                        ? 'bg-gray-300 border-gray-500'
                        : index === 2
                        ? 'bg-orange-400 border-orange-600'
                        : 'bg-blue-400 border-blue-600'
                    }`}
                  >
                    <div className="flex items-center gap-6">
                      <div className="text-7xl">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🎯'}
                      </div>
                      <div className="text-4xl font-bold text-white">{player.name}</div>
                    </div>
                    <div className="text-6xl font-black text-white">
                      {scores[player.id] || 0} pts
                    </div>
                  </div>
                ))}
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
