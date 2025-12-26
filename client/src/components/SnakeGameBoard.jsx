import { useMemo } from 'react';

/**
 * Snake Game Board Component (TV Display)
 * Renders the shared game board with all snakes and food
 */
function SnakeGameBoard({ snakes, food, board, timeRemaining }) {
  const { width, height } = board;

  // Calculate cell size based on available space
  const cellSize = useMemo(() => {
    // Target a reasonable board size that fits on TV
    return `clamp(0.8rem, ${60 / height}vh, 2rem)`;
  }, [height]);

  // Create grid cells
  const grid = useMemo(() => {
    const cells = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        cells.push({ x, y, key: `${x}-${y}` });
      }
    }
    return cells;
  }, [width, height]);

  // Build lookup maps for efficient rendering
  const snakePositions = useMemo(() => {
    const positions = new Map();
    Object.values(snakes).forEach(snake => {
      if (!snake.isAlive && !snake.segments) return;
      snake.segments.forEach((seg, index) => {
        const key = `${seg.x},${seg.y}`;
        positions.set(key, {
          snakeId: snake.id,
          color: snake.color,
          isHead: index === 0,
          isInvincible: snake.isInvincible,
          direction: snake.direction,
        });
      });
    });
    return positions;
  }, [snakes]);

  const foodPositions = useMemo(() => {
    const positions = new Map();
    food.forEach(f => {
      positions.set(`${f.x},${f.y}`, f);
    });
    return positions;
  }, [food]);

  // Format time remaining
  const formatTime = (ms) => {
    const seconds = Math.ceil(ms / 1000);
    return seconds;
  };

  // Get time color
  const getTimeColor = () => {
    const seconds = timeRemaining / 1000;
    if (seconds > 20) return 'text-green-400';
    if (seconds > 10) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Render direction arrow for head
  const getHeadContent = (direction) => {
    const arrows = {
      up: '▲',
      down: '▼',
      left: '◀',
      right: '▶',
    };
    return arrows[direction] || '●';
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Header with timer */}
      <div className="flex items-center justify-between w-full px-4">
        <h2
          className="font-black text-white drop-shadow-lg"
          style={{ fontSize: 'clamp(1.5rem, 3vh, 2.5rem)' }}
        >
          SNAKE ARENA
        </h2>
        <div
          className={`font-black drop-shadow-lg ${getTimeColor()} ${
            timeRemaining / 1000 <= 10 ? 'animate-pulse' : ''
          }`}
          style={{ fontSize: 'clamp(2rem, 4vh, 3rem)' }}
        >
          {formatTime(timeRemaining)}
        </div>
      </div>

      {/* Game Board */}
      <div
        className="relative rounded-xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
          boxShadow: `
            inset 0 2px 4px rgba(255, 255, 255, 0.1),
            0 10px 40px rgba(0, 0, 0, 0.5),
            0 0 60px rgba(139, 92, 246, 0.2)
          `,
          border: '3px solid rgba(139, 92, 246, 0.4)',
        }}
      >
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${width}, ${cellSize})`,
            gridTemplateRows: `repeat(${height}, ${cellSize})`,
            gap: '1px',
            padding: 'clamp(0.25rem, 0.5vh, 0.5rem)',
          }}
        >
          {grid.map(({ x, y, key }) => {
            const snakeData = snakePositions.get(`${x},${y}`);
            const foodData = foodPositions.get(`${x},${y}`);

            return (
              <div
                key={key}
                className="rounded-sm flex items-center justify-center transition-all duration-75"
                style={{
                  width: cellSize,
                  height: cellSize,
                  backgroundColor: snakeData
                    ? snakeData.color
                    : foodData
                    ? 'transparent'
                    : 'rgba(255, 255, 255, 0.03)',
                  boxShadow: snakeData
                    ? `0 0 ${snakeData.isHead ? '8px' : '4px'} ${snakeData.color}80`
                    : 'none',
                  opacity: snakeData?.isInvincible ? 0.6 : 1,
                  animation: snakeData?.isInvincible ? 'pulse 0.3s infinite' : 'none',
                }}
              >
                {/* Snake head arrow */}
                {snakeData?.isHead && (
                  <span
                    className="text-white font-bold drop-shadow-md"
                    style={{ fontSize: `calc(${cellSize} * 0.6)` }}
                  >
                    {getHeadContent(snakeData.direction)}
                  </span>
                )}

                {/* Food */}
                {foodData && (
                  <span
                    className="animate-bounce"
                    style={{ fontSize: `calc(${cellSize} * 0.8)` }}
                  >
                    {foodData.type === 'bonus' ? '⭐' : '🍎'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Scoreboard */}
      <div
        className="flex flex-wrap justify-center gap-3"
        style={{ maxWidth: '90vw' }}
      >
        {Object.values(snakes)
          .sort((a, b) => b.score - a.score)
          .map((snake, index) => (
            <div
              key={snake.id}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                !snake.isAlive ? 'opacity-50' : ''
              }`}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: `2px solid ${snake.color}`,
                boxShadow: index === 0 ? `0 0 12px ${snake.color}60` : 'none',
              }}
            >
              {/* Placement badge */}
              <span
                className="font-bold text-white"
                style={{
                  fontSize: 'clamp(0.75rem, 1.5vh, 1rem)',
                  opacity: 0.7,
                }}
              >
                #{index + 1}
              </span>

              {/* Color indicator */}
              <div
                className="rounded-full"
                style={{
                  width: 'clamp(0.75rem, 1.5vh, 1rem)',
                  height: 'clamp(0.75rem, 1.5vh, 1rem)',
                  backgroundColor: snake.color,
                  boxShadow: `0 0 6px ${snake.color}`,
                }}
              />

              {/* Name */}
              <span
                className="font-bold text-white truncate"
                style={{
                  fontSize: 'clamp(0.875rem, 1.75vh, 1.25rem)',
                  maxWidth: '8rem',
                }}
              >
                {snake.name}
              </span>

              {/* Score */}
              <span
                className="font-black"
                style={{
                  fontSize: 'clamp(1rem, 2vh, 1.5rem)',
                  color: snake.color,
                }}
              >
                {snake.score}
              </span>

              {/* Death indicator */}
              {!snake.isAlive && (
                <span style={{ fontSize: 'clamp(0.875rem, 1.5vh, 1.25rem)' }}>
                  💀
                </span>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}

export default SnakeGameBoard;
