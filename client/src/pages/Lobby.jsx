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
      navigate('/play', { state: { player, roomCode } });
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
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="card max-w-2xl w-full">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4 animate-pulse">⏳</div>
          <h1 className="text-4xl font-black text-gray-800 mb-2">Waiting to Start</h1>
          <p className="text-xl text-gray-600 mb-4">
            Room Code: <span className="font-black text-3xl text-primary">{roomCode}</span>
          </p>
          <p className="text-lg text-gray-500">
            Waiting for the host to start the game...
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>👥</span> Players ({game.players?.length || 0})
          </h2>

          <div className="space-y-3">
            {game.players?.map((p) => (
              <div
                key={p.id}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  p.id === player.id
                    ? 'bg-yellow-200 border-4 border-yellow-400'
                    : 'bg-white border-2 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-3xl">
                    {p.id === player.id ? '⭐' : '👤'}
                  </div>
                  <div>
                    <div className="font-bold text-lg text-gray-800">
                      {p.name} {p.id === player.id && '(You)'}
                    </div>
                    <div className="text-sm text-gray-600">
                      Age: {p.age}
                      {p.team !== null && ` • ${getTeamName(p.team)}`}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center text-gray-500">
          <div className="animate-bounce text-4xl mb-2">⬇️</div>
          <p>Get ready for an awesome party game!</p>
        </div>
      </div>
    </div>
  );
}

export default Lobby;
