import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

function Lobby() {
  const location = useLocation();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [game, setGame] = useState(location.state?.game);
  const [player, setPlayer] = useState(location.state?.player);
  const roomCode = location.state?.roomCode;

  useEffect(() => {
    if (!socket || !roomCode) {
      navigate('/');
      return;
    }

    socket.on('player-joined', ({ player, players }) => {
      setGame(prev => ({ ...prev, players }));
    });

    socket.on('player-left', ({ players }) => {
      setGame(prev => ({ ...prev, players }));
    });

    socket.on('teams-assigned', ({ players }) => {
      setGame(prev => ({ ...prev, players }));
    });

    socket.on('game-started', () => {
      navigate('/play', { state: {
        playerName: player.name,
        playerAge: player.age,
        roomCode
      } });
    });

    socket.on('coordinator-disconnected', () => {
      alert('Coordinator disconnected. Game ended.');
      navigate('/');
    });

    socket.on('host-disconnected', () => {
      alert('Host disconnected. Game ended.');
      navigate('/');
    });

    return () => {
      socket.off('player-joined');
      socket.off('player-left');
      socket.off('teams-assigned');
      socket.off('game-started');
      socket.off('coordinator-disconnected');
      socket.off('host-disconnected');
    };
  }, [socket, navigate, roomCode, player]);

  if (!game) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const getTeamName = (teamIndex) => {
    const teams = ['🔴 Red Team', '🔵 Blue Team', '🟢 Green Team', '🟡 Yellow Team'];
    return teams[teamIndex] || `Team ${teamIndex + 1}`;
  };

  return (
    <div
      className="min-h-screen flex flex-col p-4"
      style={{
        backgroundImage: 'url(/src/assets/images/home-background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-30"></div>

      {/* Header */}
      <div className="relative z-10 bg-white bg-opacity-95 backdrop-blur rounded-2xl p-4 mb-4 shadow-xl border-4 border-blue-500">
        <div className="flex justify-between items-center">
          <div className="text-xl font-bold text-gray-800">{player?.name}</div>
          <div className="text-lg text-gray-600">⭐ 0</div>
        </div>
      </div>

      {/* Watch TV message */}
      <div className="relative z-10 flex-1 flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="text-7xl md:text-8xl mb-6 animate-pulse">📺</div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-8 drop-shadow-2xl">
            Watch the TV!
          </h2>

          <div className="bg-white bg-opacity-95 rounded-2xl p-6 shadow-2xl border-4 border-green-500">
            <div className="text-5xl mb-3">⏳</div>
            <p className="text-2xl font-bold text-gray-800 mb-2">Waiting in Lobby</p>
            <p className="text-lg text-gray-600 mb-4">Room: {roomCode}</p>
            <p className="text-base text-gray-600">The host will start the game soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Lobby;
