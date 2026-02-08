import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

// Simple debug component to test chat functionality
export default function ChatDebug({ roomId = 'test-room' }) {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    addLog('Creating socket connection...');
    const s = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:4000', { transports: ['websocket'] });
    setSocket(s);

    s.on('connect', () => {
      setConnected(true);
      addLog('Socket connected! ID: ' + s.id);
      s.emit('join-room', roomId, { id: s.id, name: 'DebugUser' });
      addLog('Joined room: ' + roomId);
    });

    s.on('disconnect', () => {
      setConnected(false);
      addLog('Socket disconnected');
    });

    s.on('chat-message', (message) => {
      addLog('Received chat message: ' + JSON.stringify(message));
      setMessages(prev => [...prev, message]);
    });

    s.on('chat-history', (history) => {
      addLog('Received chat history: ' + history.length + ' messages');
      setMessages(history || []);
    });

    return () => {
      addLog('Cleaning up socket connection...');
      s.disconnect();
    };
  }, [roomId]);

  const sendMessage = () => {
    if (!input.trim() || !socket || !connected) return;
    
    const message = {
      id: Date.now().toString(),
      author: { id: 'debug-user', name: 'DebugUser' },
      text: input.trim(),
      timestamp: new Date()
    };
    
    addLog('Sending message: ' + input.trim());
    socket.emit('chat-message', roomId, message);
    setInput('');
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4 text-gray-900 dark:text-white transition-colors duration-300">
      <h2 className="text-xl font-bold">Chat Debug Console</h2>
      
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span>Status: {connected ? 'Connected' : 'Disconnected'}</span>
        <span className="text-gray-500 dark:text-gray-400 transition-colors duration-300">Room: {roomId}</span>
      </div>

      {/* Messages */}
      <div className="border dark:border-gray-700 rounded-lg p-4 h-40 overflow-y-auto bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
        <div className="text-sm font-semibold mb-2">Chat Messages:</div>
        {messages.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400 text-sm transition-colors duration-300">No messages</div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className="text-sm mb-1">
              <strong>{msg.author?.name}:</strong> {msg.text}
            </div>
          ))
        )}
      </div>

      {/* Send Message */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 border dark:border-gray-600 rounded px-3 py-2 dark:bg-gray-900 dark:text-white transition-colors duration-300"
        />
        <button
          onClick={sendMessage}
          disabled={!connected}
          className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded disabled:bg-gray-400 dark:disabled:bg-gray-600 transition-colors duration-300"
        >
          Send
        </button>
      </div>

      {/* Debug Logs */}
      <div className="border dark:border-gray-700 rounded-lg p-4 h-40 overflow-y-auto bg-gray-900 dark:bg-black text-green-400 dark:text-green-300 text-xs font-mono transition-colors duration-300">
        <div className="text-sm font-semibold mb-2 text-white">Debug Logs:</div>
        {logs.map((log, i) => (
          <div key={i}>{log}</div>
        ))}
      </div>
    </div>
  );
}