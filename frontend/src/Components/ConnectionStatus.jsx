import { useEffect, useState } from 'react';
import ApiService from '../utils/ApiService';

export default function ConnectionStatus({ socket }) {
  const [socketConnected, setSocketConnected] = useState(false);
  const [serverHealth, setServerHealth] = useState(false);
  const [lastCheck, setLastCheck] = useState(null);

  useEffect(() => {
    // Monitor socket connection
    const s = socket?.current;
    if (s) {
      const handleConnect = () => setSocketConnected(true);
      const handleDisconnect = () => setSocketConnected(false);
      
      s.on('connect', handleConnect);
      s.on('disconnect', handleDisconnect);
      
      setSocketConnected(s.connected);
      
      return () => {
        s.off('connect', handleConnect);
        s.off('disconnect', handleDisconnect);
      };
    }
  }, [socket]);

  useEffect(() => {
    // Check server health periodically
    const checkHealth = async () => {
      const healthy = await ApiService.checkServerHealth();
      setServerHealth(healthy);
      setLastCheck(new Date());
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    if (socketConnected && serverHealth) return 'bg-green-500';
    if (socketConnected || serverHealth) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusText = () => {
    if (socketConnected && serverHealth) return 'Connected';
    if (!socketConnected && !serverHealth) return 'Disconnected';
    if (socketConnected) return 'Socket OK';
    if (serverHealth) return 'API OK';
    return 'Unknown';
  };

  return (
    <div className="flex items-center gap-2 text-xs">
      <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}></div>
      <span className="text-gray-600 dark:text-gray-300 transition-colors duration-300">{getStatusText()}</span>
      {lastCheck && (
        <span className="text-gray-400 dark:text-gray-500 transition-colors duration-300">
          • Last check: {lastCheck.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}