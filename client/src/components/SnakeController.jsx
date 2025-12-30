import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Snake Controller Component (Mobile)
 * Provides swipe and D-pad controls for snake movement
 */
function SnakeController({
  onDirectionChange,
  playerScore,
  playerColor,
  colorName,
  isAlive,
  respawnCountdown,
  isInvincible,
}) {
  const [controlMode] = useState('swipe'); // 'dpad' or 'swipe' - currently locked to swipe
  const touchStartRef = useRef(null);
  const containerRef = useRef(null);

  // Handle direction input
  const handleDirection = useCallback(
    (direction) => {
      if (!isAlive) return;
      onDirectionChange(direction);
    },
    [isAlive, onDirectionChange]
  );

  // Swipe gesture handling
  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchEnd = useCallback(
    (e) => {
      if (!touchStartRef.current || controlMode !== 'swipe') return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const minSwipeDistance = 30;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > minSwipeDistance) {
          handleDirection(deltaX > 0 ? 'right' : 'left');
        }
      } else {
        // Vertical swipe
        if (Math.abs(deltaY) > minSwipeDistance) {
          handleDirection(deltaY > 0 ? 'down' : 'up');
        }
      }

      touchStartRef.current = null;
    },
    [controlMode, handleDirection]
  );

  // Keyboard controls (for testing)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const keyMap = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
        w: 'up',
        s: 'down',
        a: 'left',
        d: 'right',
      };
      const direction = keyMap[e.key];
      if (direction) {
        e.preventDefault();
        handleDirection(direction);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDirection]);

  // D-pad button component
  const DpadButton = ({ direction, icon, className = '' }) => (
    <button
      onTouchStart={(e) => {
        e.preventDefault();
        handleDirection(direction);
      }}
      onClick={() => handleDirection(direction)}
      disabled={!isAlive}
      className={`
        flex items-center justify-center
        rounded-xl font-bold text-white
        transition-all duration-100 active:scale-95
        disabled:opacity-30 disabled:cursor-not-allowed
        ${className}
      `}
      style={{
        width: 'clamp(4rem, 20vw, 6rem)',
        height: 'clamp(4rem, 20vw, 6rem)',
        fontSize: 'clamp(1.5rem, 8vw, 2.5rem)',
        background: `linear-gradient(135deg, ${playerColor}dd, ${playerColor}99)`,
        boxShadow: `0 4px 15px ${playerColor}40, inset 0 2px 4px rgba(255,255,255,0.2)`,
        border: '2px solid rgba(255,255,255,0.3)',
      }}
    >
      {icon}
    </button>
  );

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center h-full select-none"
      onTouchStart={controlMode === 'swipe' ? handleTouchStart : undefined}
      onTouchEnd={controlMode === 'swipe' ? handleTouchEnd : undefined}
      style={{ touchAction: 'none' }}
    >
      {/* Player status header */}
      <div
        className="w-full text-center mb-4 px-4"
        style={{ paddingTop: 'env(safe-area-inset-top, 1rem)' }}
      >
        {/* Score display */}
        <div className="flex items-center justify-center gap-3 mb-2">
          <div
            className="rounded-full"
            style={{
              width: 'clamp(1rem, 4vw, 1.5rem)',
              height: 'clamp(1rem, 4vw, 1.5rem)',
              backgroundColor: playerColor,
              boxShadow: `0 0 10px ${playerColor}`,
            }}
          />
          <span
            className="font-bold text-white/80"
            style={{ fontSize: 'clamp(0.875rem, 4vw, 1.25rem)' }}
          >
            {colorName}
          </span>
        </div>

        <div
          className="font-black text-white"
          style={{
            fontSize: 'clamp(2.5rem, 12vw, 4rem)',
            textShadow: `0 0 20px ${playerColor}`,
          }}
        >
          {playerScore}
          <span
            className="font-normal text-white/60 ml-2"
            style={{ fontSize: 'clamp(1rem, 5vw, 1.5rem)' }}
          >
            pts
          </span>
        </div>

        {/* Death/respawn message */}
        {!isAlive && (
          <div
            className="mt-2 py-2 px-4 rounded-lg bg-red-500/20 border border-red-500/40"
            style={{ fontSize: 'clamp(1rem, 5vw, 1.5rem)' }}
          >
            <span className="text-red-400 font-bold">
              Respawning in {Math.ceil(respawnCountdown / 1000)}...
            </span>
          </div>
        )}

        {/* Invincibility indicator */}
        {isAlive && isInvincible && (
          <div
            className="mt-2 py-2 px-4 rounded-lg bg-yellow-500/20 border border-yellow-500/40 animate-pulse"
            style={{ fontSize: 'clamp(0.875rem, 4vw, 1.25rem)' }}
          >
            <span className="text-yellow-400 font-bold">INVINCIBLE!</span>
          </div>
        )}
      </div>

      {/* Controls area */}
      <div className="flex-1 flex flex-col items-center justify-center w-full px-4">
        {controlMode === 'dpad' ? (
          /* D-Pad Controls */
          <div className="flex flex-col items-center gap-2">
            <DpadButton direction="up" icon="▲" />
            <div className="flex gap-2">
              <DpadButton direction="left" icon="◀" />
              <div
                style={{
                  width: 'clamp(4rem, 20vw, 6rem)',
                  height: 'clamp(4rem, 20vw, 6rem)',
                }}
              />
              <DpadButton direction="right" icon="▶" />
            </div>
            <DpadButton direction="down" icon="▼" />
          </div>
        ) : (
          /* Swipe Area */
          <div
            className="flex flex-col items-center justify-center rounded-3xl"
            style={{
              width: 'clamp(16rem, 80vw, 24rem)',
              height: 'clamp(16rem, 50vh, 24rem)',
              background: `linear-gradient(135deg, ${playerColor}20, ${playerColor}10)`,
              border: `3px dashed ${playerColor}60`,
            }}
          >
            <div
              className="text-white/60 font-bold text-center"
              style={{ fontSize: 'clamp(1rem, 5vw, 1.5rem)' }}
            >
              SWIPE TO STEER
            </div>
            <div
              className="text-white/40 mt-2"
              style={{ fontSize: 'clamp(2rem, 10vw, 4rem)' }}
            >
              ↑↓←→
            </div>
          </div>
        )}
      </div>

      {/* Control mode toggle - hidden for now, swipe-only mode */}
      {/* To re-enable: uncomment and add setControlMode back to useState */}
      {/*
      <div
        className="w-full px-4 pb-4"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 1rem), 1rem)' }}
      >
        <button
          onClick={() => setControlMode(controlMode === 'dpad' ? 'swipe' : 'dpad')}
          className="w-full py-3 rounded-xl font-bold text-white/80 transition-all"
          style={{
            fontSize: 'clamp(0.875rem, 4vw, 1.125rem)',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          {controlMode === 'dpad' ? 'Switch to Swipe 👆' : 'Switch to D-Pad ⬇️'}
        </button>
      </div>
      */}
    </div>
  );
}

export default SnakeController;
