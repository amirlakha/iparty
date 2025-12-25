import { useParams } from 'react-router-dom';
import christmasStory from '../data/christmasStory';

function ScreenPreview() {
  const { screen } = useParams();
  const currentScreen = screen ? screen.toUpperCase().replace(/-/g, '_') : 'LOBBY';

  // Mock data
  const mockPlayers = [
    { id: '1', name: 'Alice', age: 12 },
    { id: '2', name: 'Bob', age: 10 },
    { id: '3', name: 'Charlie', age: 14 },
    { id: '4', name: 'Diana', age: 11 }
  ];

  const mockScores = {
    '1': 450,
    '2': 380,
    '3': 520,
    '4': 410
  };

  const mockChallenge = {
    emoji: '🎯',
    question: 'How many reindeer does Santa have?',
    options: ['6', '8', '10', '12']
  };

  const mockResults = [
    { playerId: '1', playerName: 'Alice', answer: '8', isCorrect: true, points: 150, placement: 1 },
    { playerId: '2', playerName: 'Bob', answer: '10', isCorrect: false, points: 0, placement: 4 },
    { playerId: '3', playerName: 'Charlie', answer: '8', isCorrect: true, points: 130, placement: 2 },
    { playerId: '4', playerName: 'Diana', answer: '8', isCorrect: true, points: 120, placement: 3 }
  ];

  const roomCode = 'ABC123';
  const currentSection = 1;
  const currentRound = 2;
  const sectionStars = 3;
  const sectionData = christmasStory.sections[0]; // Toy Machine

  const screens = [
    'LOBBY',
    'INTRODUCTION',
    'SECTION_INTRO',
    'CHALLENGE_ACTIVE',
    'CHALLENGE_RESULTS',
    'SECTION_COMPLETE',
    'MAP_TRANSITION',
    'VICTORY'
  ];

  const renderScreen = () => {
    switch (currentScreen) {
      case 'SANTA_ANIMATIONS':
        return (
          <div className="min-h-screen bg-gradient-to-b from-blue-900 to-purple-900 p-8">
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
            <h1 className="text-4xl font-black text-white text-center mb-12">Santa Animation Options</h1>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
              {/* Float (current) */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                <img src="/src/assets/images/santa-character.png" alt="Santa"
                     className="w-32 h-32 mx-auto mb-4 animate-float"
                     style={{animation: 'float 3s ease-in-out infinite'}} />
                <p className="text-white font-bold">Float (Current)</p>
                <p className="text-white/60 text-sm">Up & down</p>
              </div>

              {/* Wiggle */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                <img src="/src/assets/images/santa-character.png" alt="Santa" className="w-32 h-32 mx-auto mb-4 animate-wiggle" />
                <p className="text-white font-bold">Wiggle</p>
                <p className="text-white/60 text-sm">Rotate left/right</p>
              </div>

              {/* Bounce Slow */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                <img src="/src/assets/images/santa-character.png" alt="Santa" className="w-32 h-32 mx-auto mb-4 animate-bounce-slow" />
                <p className="text-white font-bold">Bounce Slow</p>
                <p className="text-white/60 text-sm">Bouncy up/down</p>
              </div>

              {/* Pulse Slow */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                <img src="/src/assets/images/santa-character.png" alt="Santa" className="w-32 h-32 mx-auto mb-4 animate-pulse-slow" />
                <p className="text-white font-bold">Pulse Slow</p>
                <p className="text-white/60 text-sm">Fade in/out</p>
              </div>

              {/* Float + Wiggle */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                <div className="animate-float mx-auto mb-4" style={{width: '128px', height: '128px'}}>
                  <img src="/src/assets/images/santa-character.png" alt="Santa" className="w-32 h-32 animate-wiggle" />
                </div>
                <p className="text-white font-bold">Float + Wiggle</p>
                <p className="text-white/60 text-sm">Float & rotate</p>
              </div>

              {/* Float + Pulse */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                <div className="animate-float mx-auto mb-4" style={{width: '128px', height: '128px'}}>
                  <img src="/src/assets/images/santa-character.png" alt="Santa" className="w-32 h-32 animate-pulse-slow" />
                </div>
                <p className="text-white font-bold">Float + Pulse</p>
                <p className="text-white/60 text-sm">Float & fade</p>
              </div>

              {/* Bounce */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                <img src="/src/assets/images/santa-character.png" alt="Santa" className="w-32 h-32 mx-auto mb-4 animate-bounce" />
                <p className="text-white font-bold">Bounce</p>
                <p className="text-white/60 text-sm">Fast bounce</p>
              </div>

              {/* Circle + Wiggle */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                <div className="animate-circle mx-auto mb-4" style={{width: '128px', height: '128px'}}>
                  <img src="/src/assets/images/santa-character.png" alt="Santa" className="w-32 h-32 animate-wiggle" />
                </div>
                <p className="text-white font-bold">Circle + Wiggle</p>
                <p className="text-white/60 text-sm">Circle & rotate</p>
              </div>
            </div>
            <p className="text-white/60 text-center mt-12 text-sm">Visit /preview/santa-animations to see this</p>
          </div>
        );

      case 'LOBBY':
        return (
          <div
            className="fixed inset-0 w-screen h-screen overflow-hidden"
            style={{
              backgroundImage: 'url(/src/assets/images/home-background.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30 pointer-events-none"></div>
            <div className="relative z-10 h-full w-full flex flex-col justify-center items-center px-8 md:px-12 lg:px-16 py-[2vh] overflow-y-auto">
              <div className="w-full max-w-7xl flex flex-col" style={{maxHeight: '96vh', gap: 'clamp(0.5rem, 1vh, 1rem)'}}>
                {/* Header with logo and room code */}
                <div className="text-center flex-shrink-0">
                  <img
                    src="/src/assets/images/game-logo.png"
                    alt="iParty Logo"
                    className="mx-auto drop-shadow-2xl object-contain"
                    style={{width: 'clamp(12rem, 25vw, 28rem)', marginBottom: 'clamp(0.5rem, 1vh, 0.75rem)'}}
                  />
                  <div className="flex flex-col md:flex-row items-center justify-center" style={{gap: 'clamp(1rem, 2vh, 1.5rem)'}}>
                    <div className="bg-white rounded-2xl shadow-2xl border-4 border-blue-500" style={{padding: 'clamp(0.75rem, 1.5vh, 1rem)'}}>
                      <div className="bg-gray-200 flex items-center justify-center text-xs text-gray-500" style={{width: 'clamp(6rem, 12vh, 8rem)', height: 'clamp(6rem, 12vh, 8rem)'}}>QR Code</div>
                      <p className="text-xs font-bold text-gray-600" style={{marginTop: 'clamp(0.25rem, 0.5vh, 0.5rem)'}}>Scan to Join</p>
                    </div>
                    <div className="bg-white rounded-2xl shadow-2xl border-4 border-yellow-400" style={{padding: 'clamp(0.75rem, 2vh, 1.25rem) clamp(1.5rem, 4vh, 2.5rem)'}}>
                      <p className="font-bold text-gray-700" style={{fontSize: 'clamp(0.875rem, 1.5vh, 1.5rem)', marginBottom: 'clamp(0.125rem, 0.25vh, 0.25rem)'}}>Join at iparty.com</p>
                      <p className="font-semibold text-gray-600" style={{fontSize: 'clamp(0.75rem, 1.25vh, 1.25rem)', marginBottom: 'clamp(0.125rem, 0.25vh, 0.25rem)'}}>Room Code:</p>
                      <p className="font-black text-red-600 tracking-widest font-mono" style={{fontSize: 'clamp(2rem, 5vh, 4.5rem)'}}>
                        {roomCode}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Players grid - grows to fill space */}
                <div className="w-full flex-1 min-h-0 flex flex-col">
                  <div className="bg-white bg-opacity-90 rounded-2xl shadow-2xl border-4 border-white h-full flex flex-col" style={{padding: 'clamp(1rem, 2vh, 1.5rem)'}}>
                    <h2 className="font-black text-gray-800 text-center flex-shrink-0" style={{fontSize: 'clamp(1.25rem, 3vh, 2.5rem)', marginBottom: 'clamp(0.5rem, 1.5vh, 1rem)'}}>
                      Players Ready: {mockPlayers.length}
                    </h2>
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 overflow-auto flex-1" style={{gap: 'clamp(0.5rem, 1vh, 0.75rem)'}}>
                      {mockPlayers.map((player) => (
                        <div
                          key={player.id}
                          className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-xl border-2 border-white flex flex-col items-center justify-center"
                          style={{padding: 'clamp(0.5rem, 1vh, 0.75rem)'}}
                        >
                          <div className="text-center" style={{fontSize: 'clamp(2rem, 4vh, 4rem)', marginBottom: 'clamp(0.25rem, 0.5vh, 0.5rem)'}}>🎮</div>
                          <div className="text-center">
                            <div className="font-bold text-white drop-shadow-lg truncate" style={{fontSize: 'clamp(0.875rem, 1.5vh, 1.25rem)', marginBottom: 'clamp(0.125rem, 0.25vh, 0.25rem)'}}>
                              {player.name}
                            </div>
                            <div className="text-white text-opacity-90" style={{fontSize: 'clamp(0.75rem, 1.25vh, 0.875rem)'}}>
                              Age {player.age}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Start button */}
                <div className="text-center flex-shrink-0">
                  <button className="bg-gradient-to-r from-green-600 to-green-700 text-white font-black rounded-full shadow-2xl border-4 border-white"
                    style={{fontSize: 'clamp(1.25rem, 3vh, 2.5rem)', padding: 'clamp(1rem, 2vh, 1.25rem) clamp(2.5rem, 8vh, 4rem)'}}>
                    🚀 START ADVENTURE!
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'INTRODUCTION':
        // VERSION 3: Modern Bold with Gradient Border
        return (
          <div
            className="fixed inset-0 w-screen h-screen overflow-hidden"
            style={{
              backgroundImage: 'url(/src/assets/images/home-background.png)',
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
                {/* Santa Character */}
                <div className="animate-circle mx-auto flex-shrink-0" style={{width: 'clamp(6rem, 15vh, 16rem)', height: 'clamp(6rem, 15vh, 16rem)'}}>
                  <img
                    src="/src/assets/images/santa-character.png"
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
                      <div style={{marginTop: 'clamp(1.5rem, 3vh, 3.5rem)'}}>
                        <button className="relative w-full bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 hover:from-yellow-500 hover:via-red-600 hover:to-pink-600 rounded-full shadow-2xl border-4 border-white transition-all hover:scale-105 active:scale-95 overflow-hidden"
                          style={{padding: 'clamp(1.25rem, 3vh, 2.25rem) clamp(1.5rem, 4vh, 3rem)'}}>
                          <div className="absolute inset-0 bg-white opacity-0 hover:opacity-20 transition-opacity"></div>
                          <div className="font-black text-white drop-shadow-xl" style={{fontSize: 'clamp(1.25rem, 3.5vh, 4rem)'}}>
                            🚀 LET'S GO! 🚀
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'SECTION_INTRO':
        // VERSION: Bold Modern with Glassmorphism
        return (
          <div
            className="fixed inset-0 w-screen h-screen overflow-hidden"
            style={{
              backgroundImage: 'url(/src/assets/images/bg-toy-machine.png)',
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
                    src="/src/assets/images/elf-character.png"
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
                  {sectionData.emoji} {sectionData.name}
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
                        {sectionData.storyIntro.title}
                      </h2>
                      {sectionData.storyIntro.narrative.map((line, i) => (
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
            </div>
          </div>
        );

      case 'CHALLENGE_ACTIVE':
        // VERSION: Bold Modern with Glassmorphism
        return (
          <div
            className="fixed inset-0 w-screen h-screen overflow-hidden flex flex-col"
            style={{
              backgroundImage: 'url(/src/assets/images/bg-toy-machine.png)',
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
                        {sectionData.emoji} {sectionData.name} • Round {currentRound}
                      </div>
                      <div className="font-black text-white drop-shadow-lg" style={{fontSize: 'clamp(0.875rem, 2vh, 2rem)'}}>
                        Section {currentSection}/5
                      </div>
                    </div>
                  </div>
                </div>

                {/* Challenge Area with Glassmorphism - flex-1 */}
                <div className="relative flex-1 min-h-0">
                  <div className="relative bg-white/30 backdrop-blur-xl rounded-3xl h-full flex flex-col justify-center overflow-y-auto border border-white/40"
                       style={{
                         padding: 'clamp(1rem, 3vh, 4rem)',
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
                      <div style={{fontSize: 'clamp(2rem, 8vh, 6rem)', marginBottom: 'clamp(0.5rem, 1vh, 2rem)'}}>{mockChallenge.emoji}</div>
                      <h2 className="font-black text-gray-900 leading-tight px-2"
                          style={{
                            fontSize: 'clamp(1.25rem, 4vh, 4rem)',
                            marginBottom: 'clamp(1rem, 2vh, 3rem)',
                            textShadow: '0 2px 4px rgba(255,255,255,0.9)'
                          }}>
                        {mockChallenge.question}
                      </h2>
                      <div className="grid grid-cols-2 max-w-5xl mx-auto" style={{gap: 'clamp(0.5rem, 1vh, 1.5rem)'}}>
                        {mockChallenge.options.map((option, i) => {
                          const gradients = [
                            'from-red-500 via-red-600 to-red-700',
                            'from-blue-500 via-blue-600 to-blue-700',
                            'from-green-500 via-green-600 to-green-700',
                            'from-yellow-400 via-yellow-500 to-yellow-600'
                          ];
                          return (
                            <div
                              key={i}
                              className={`bg-gradient-to-br ${gradients[i]} rounded-2xl border-white shadow-2xl hover:scale-110 transition-transform`}
                              style={{
                                padding: 'clamp(0.75rem, 2vh, 2rem)',
                                borderWidth: 'clamp(2px, 0.5vh, 6px)'
                              }}
                            >
                              <div className="font-black text-white drop-shadow-xl" style={{fontSize: 'clamp(1.25rem, 3vh, 3rem)'}}>{option}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Player Submissions - Compact - flex-shrink-0 */}
                <div className="bg-gray-900 bg-opacity-90 rounded-2xl shadow-xl border-yellow-400 flex-shrink-0" style={{padding: 'clamp(0.5rem, 1.5vh, 1.5rem)', borderWidth: 'clamp(2px, 0.5vh, 6px)'}}>
                  <div className="grid grid-cols-4 md:grid-cols-6" style={{gap: 'clamp(0.25rem, 0.5vh, 0.75rem)'}}>
                    {mockPlayers.map((player, idx) => {
                      const hasSubmitted = idx < 3;
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

      case 'CHALLENGE_RESULTS':
        // VERSION: Bold Modern
        return (
          <div
            className="fixed inset-0 w-screen h-screen overflow-hidden flex flex-col"
            style={{
              backgroundImage: 'url(/src/assets/images/bg-toy-machine.png)',
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
                        {mockResults.map((result) => (
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
                                <div className="font-black text-white drop-shadow-xl" style={{fontSize: 'clamp(1rem, 2.5vh, 2.5rem)'}}>{result.playerName}</div>
                                <div className="text-white font-bold opacity-90" style={{fontSize: 'clamp(0.875rem, 1.75vh, 1.5rem)'}}>"{result.answer}"</div>
                              </div>
                            </div>
                            <div className="font-black text-white drop-shadow-xl" style={{fontSize: 'clamp(1.5rem, 4vh, 5rem)'}}>
                              +{result.points}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Divider */}
                      <div className="border-t-2 border-white/40"></div>

                      {/* Top Scores */}
                      <div>
                        <h2 className="font-black text-yellow-300 text-center drop-shadow-xl" style={{fontSize: 'clamp(1.25rem, 3vh, 3rem)', marginBottom: 'clamp(1rem, 2vh, 2rem)', textShadow: '2px 2px 4px rgba(0,0,0,0.5)'}}>
                          🏆 TOP SCORES 🏆
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4" style={{gap: 'clamp(0.75rem, 1.5vh, 1.5rem)'}}>
                          {[...mockPlayers]
                            .sort((a, b) => (mockScores[b.id] || 0) - (mockScores[a.id] || 0))
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
                                  {mockScores[player.id] || 0}
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
          </div>
        );

      case 'SECTION_COMPLETE':
        // VERSION: Bold Modern with Glassmorphism
        return (
          <div className="fixed inset-0 w-screen h-screen overflow-hidden"
            style={{backgroundImage: 'url(/src/assets/images/bg-toy-machine.png)', backgroundSize: 'cover', backgroundPosition: 'center'}}>
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
            `}</style>
            <div className="absolute inset-0 bg-black bg-opacity-50 pointer-events-none"></div>
            <div className="relative z-10 h-full w-full flex flex-col justify-center items-center px-8 md:px-12 lg:px-16 py-[2vh] overflow-y-auto">
              <div className="w-full max-w-7xl text-center flex flex-col items-center" style={{maxHeight: '96vh', gap: 'clamp(0.5rem, 1.5vh, 1.5rem)'}}>
                {/* Celebration burst with scale, fade, rotate animation */}
                <div className="mx-auto flex-shrink-0" style={{width: 'clamp(6rem, 15vh, 16rem)', height: 'clamp(6rem, 15vh, 16rem)'}}>
                  <img src="/src/assets/images/celebration-burst.png" alt="Celebration"
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

                <div className="flex justify-center items-center flex-shrink-0" style={{gap: 'clamp(0.5rem, 2vh, 1.5rem)'}}>
                  <span className="animate-bounce text-yellow-300" style={{fontSize: 'clamp(2rem, 6vh, 6rem)', animationDelay: '0s'}}>⭐</span>
                  <span className="animate-bounce text-green-300" style={{fontSize: 'clamp(2rem, 6vh, 6rem)', animationDelay: '0.1s'}}>⭐</span>
                  <span className="animate-bounce text-blue-300" style={{fontSize: 'clamp(2rem, 6vh, 6rem)', animationDelay: '0.2s'}}>⭐</span>
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
                      <h2 className="font-black text-green-600" style={{fontSize: 'clamp(1.25rem, 3vh, 3rem)', marginBottom: 'clamp(1rem, 2vh, 2rem)', textShadow: '0 2px 4px rgba(255,255,255,0.9)'}}>
                        {sectionData.successMessage.title}
                      </h2>
                      {sectionData.successMessage.narrative.map((line, i) => (
                        <p key={i} className="text-gray-900 font-black leading-relaxed" style={{fontSize: 'clamp(1rem, 2.5vh, 2rem)', marginBottom: 'clamp(0.75rem, 2vh, 1.75rem)', textShadow: '0 2px 4px rgba(255,255,255,0.9)'}}>
                          {line}
                        </p>
                      ))}
                      <div style={{marginTop: 'clamp(1.5rem, 3vh, 3.5rem)'}}>
                        <div className="bg-gradient-to-r from-orange-400 via-pink-500 to-blue-500 rounded-full inline-block shadow-xl mx-auto"
                             style={{padding: 'clamp(0.75rem, 2vh, 2rem) clamp(1.5rem, 4vh, 4rem)', border: '4px solid white'}}>
                          <div className="font-black text-white drop-shadow-lg" style={{fontSize: 'clamp(1rem, 2.5vh, 2.5rem)'}}>
                            NEXT SECTION LOADING... 🚀
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'MAP_TRANSITION':
        // VERSION: Bold Modern with Glassmorphism
        return (
          <div className="fixed inset-0 w-screen h-screen overflow-hidden"
            style={{backgroundImage: 'url(/src/assets/images/home-background.png)', backgroundSize: 'cover', backgroundPosition: 'center'}}>
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
                      <img src="/src/assets/images/village-map.png" alt="Village Map"
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
            </div>
          </div>
        );

      case 'VICTORY':
        // VERSION: Bold Modern with Glassmorphism
        return (
          <div className="fixed inset-0 w-screen h-screen overflow-hidden"
            style={{backgroundImage: 'url(/src/assets/images/victory-scene.png)', backgroundSize: 'cover', backgroundPosition: 'center'}}>
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
                    <img src="/src/assets/images/santa-character.png" alt="Santa"
                      className="object-contain animate-wiggle drop-shadow-2xl"
                      style={{width: '100%', height: '100%'}} />
                  </div>
                  <div className="animate-circle" style={{width: 'clamp(4rem, 10vh, 12rem)', height: 'clamp(4rem, 10vh, 12rem)', animationDelay: '0.2s'}}>
                    <img src="/src/assets/images/elf-character.png" alt="Elf"
                      className="object-contain animate-wiggle drop-shadow-2xl"
                      style={{width: '100%', height: '100%'}} />
                  </div>
                  <div className="animate-circle" style={{width: 'clamp(4rem, 10vh, 12rem)', height: 'clamp(4rem, 10vh, 12rem)', animationDelay: '0.4s'}}>
                    <img src="/src/assets/images/reindeer-character.png" alt="Reindeer"
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
                        {[...mockPlayers].sort((a, b) => (mockScores[b.id] || 0) - (mockScores[a.id] || 0)).map((player, index) => (
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
                              {mockScores[player.id] || 0}
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

      default:
        return <div>Unknown screen</div>;
    }
  };

  return renderScreen();
}

export default ScreenPreview;
