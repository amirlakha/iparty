import { useEffect, useState } from 'react';

function CircularTimer({ duration, onComplete, size = 'medium' }) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    setTimeLeft(duration);
    setIsRunning(true);
  }, [duration]);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) {
      if (timeLeft === 0 && onComplete) {
        onComplete();
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const next = prev - 1;
        if (next <= 0) {
          setIsRunning(false);
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, timeLeft, onComplete]);

  // Calculate progress percentage
  const percentage = (timeLeft / duration) * 100;

  // Determine color based on time remaining
  const getColor = () => {
    if (timeLeft > 20) return '#10b981'; // green
    if (timeLeft > 10) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  // Size configurations using clamp
  const sizeConfig = {
    small: {
      containerSize: 'clamp(2.5rem, 5vh, 4rem)',
      strokeWidth: 4,
      fontSize: 'clamp(0.875rem, 1.5vh, 1.25rem)'
    },
    medium: {
      containerSize: 'clamp(3.5rem, 7vh, 6rem)',
      strokeWidth: 6,
      fontSize: 'clamp(1.25rem, 2.5vh, 2rem)'
    },
    large: {
      containerSize: 'clamp(5rem, 10vh, 8rem)',
      strokeWidth: 8,
      fontSize: 'clamp(2rem, 4vh, 3rem)'
    }
  };

  const config = sizeConfig[size];
  const radius = 45; // SVG viewBox radius
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: config.containerSize, height: config.containerSize }}
    >
      {/* SVG Circle Progress */}
      <svg
        className="transform -rotate-90 absolute inset-0"
        viewBox="0 0 100 100"
        style={{ width: '100%', height: '100%' }}
      >
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth={config.strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke={getColor()}
          strokeWidth={config.strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease',
            filter: timeLeft <= 10 ? 'drop-shadow(0 0 8px currentColor)' : 'none'
          }}
          className={timeLeft <= 10 ? 'animate-pulse' : ''}
        />
      </svg>

      {/* Time display */}
      <div
        className="font-black text-white drop-shadow-xl z-10"
        style={{ fontSize: config.fontSize }}
      >
        {timeLeft}
      </div>
    </div>
  );
}

export default CircularTimer;
