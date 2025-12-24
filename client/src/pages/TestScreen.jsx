import { useLocation } from 'react-router-dom';

function TestScreen() {
  const location = useLocation();
  const { roomCode, coordinatorName } = location.state || {};

  return (
    <div className="min-h-screen bg-red-600 flex items-center justify-center">
      <div className="text-white text-4xl">
        <h1>TEST SCREEN WORKS!</h1>
        <p>Room: {roomCode || 'NO ROOM CODE'}</p>
        <p>Name: {coordinatorName || 'NO NAME'}</p>
      </div>
    </div>
  );
}

export default TestScreen;
