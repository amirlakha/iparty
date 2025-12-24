import { useEffect, useState } from 'react';

function ProgressBar({ duration, color = 'blue' }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(0);
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / (duration * 1000)) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        clearInterval(interval);
      }
    }, 50); // Update every 50ms for smooth animation

    return () => clearInterval(interval);
  }, [duration]);

  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    yellow: 'bg-yellow-500'
  };

  return (
    <div className="w-full bg-white/20 rounded-full overflow-hidden" style={{ height: 'clamp(4px, 0.5vh, 8px)' }}>
      <div
        className={`h-full ${colorClasses[color]} transition-all duration-100 ease-linear`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export default ProgressBar;
