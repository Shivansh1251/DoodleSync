// src/components/Whiteboard.jsx
import React, { useEffect, useRef, useState } from "react";
import { Tldraw, TldrawEditor } from "tldraw"; // slight abstraction: check docs for exact import
import { io } from "socket.io-client";

const SERVER = import.meta.env.VITE_SERVER_URL || "http://localhost:4000";

// Generate consistent color from user ID
const getUserColor = (userId) => {
  const colors = [
    '#ef4444', // red
    '#f59e0b', // amber
    '#10b981', // emerald
    '#3b82f6', // blue
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#14b8a6', // teal
    '#f97316', // orange
  ];
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export default function Whiteboard({ roomId = "default", user = { id: "u1", name: "Shivansh" } }) {
  const socketRef = useRef(null);
  const editorRef = useRef(null); // will hold tldraw instance
  const [connected, setConnected] = useState(false);
  const [remoteCursors, setRemoteCursors] = useState({}); // Store other users' cursors
  const cursorThrottleRef = useRef(null);
  const userColorRef = useRef(getUserColor(user.id));

  useEffect(() => {
    socketRef.current = io(SERVER, { transports: ["websocket"] });

    const s = socketRef.current;
    s.on("connect", () => setConnected(true));
    s.on("disconnect", () => setConnected(false));

    // when server sends initial doc
    s.on("doc-init", (doc) => {
      if (!editorRef.current) return;
      // Use tldraw API to load the doc
      // Replace this with the correct tldraw method, e.g. editorRef.current.loadDocument(doc)
      if (doc) {
        // PSEUDOCODE: next line depends on tldraw API:
        editorRef.current.loadDocument?.(doc) ?? editorRef.current?.load?.(doc);
      }
    });

    // when other client sends doc update
    s.on("doc-update", (docDelta) => {
      if (!editorRef.current) return;
      // Apply update to local editor:
      // If using full-doc replacement:
      editorRef.current.loadDocument?.(docDelta) ?? editorRef.current?.load?.(docDelta);

      // If using incremental patch, use editorRef.current.applyPatch or similar (see tldraw docs)
    });

    // chat messages
    s.on("chat-message", (msg) => {
      // handle in chat UI (not shown here)
      console.log("chat", msg);
    });

    // NEW: handle chat history from MongoDB
    s.on("chat-history", (messages) => {
      console.log("chat history loaded:", messages.length, "messages");
      // Pass to ChatPanel component
    });

    // Handle cursor updates from other users
    s.on("cursor-update", (cursorData) => {
      setRemoteCursors(prev => ({
        ...prev,
        [cursorData.userId]: {
          ...cursorData,
          lastUpdate: Date.now()
        }
      }));
    });

    // Clean up stale cursors every 3 seconds
    const cursorCleanup = setInterval(() => {
      const now = Date.now();
      setRemoteCursors(prev => {
        const updated = {};
        Object.entries(prev).forEach(([userId, cursor]) => {
          // Keep cursor if updated within last 3 seconds
          if (now - cursor.lastUpdate < 3000) {
            updated[userId] = cursor;
          }
        });
        return updated;
      });
    }, 1000);

    // join the room
    s.emit("join-room", roomId, user);

    return () => {
      if (cursorThrottleRef.current) {
        clearTimeout(cursorThrottleRef.current);
      }
      clearInterval(cursorCleanup);
      s.disconnect();
    };
  }, [roomId, user]);

  // Handle mouse movement for cursor tracking
  const handleMouseMove = (e) => {
    if (!socketRef.current || !socketRef.current.connected) return;

    // Get canvas bounds
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Throttle cursor updates to 50ms
    if (!cursorThrottleRef.current) {
      cursorThrottleRef.current = setTimeout(() => {
        socketRef.current.emit("cursor-move", roomId, {
          x,
          y,
          color: userColorRef.current
        });
        cursorThrottleRef.current = null;
      }, 50);
    }
  };

  // This function is called by Tldraw editor whenever the doc changes.
  // You need to wire this via tldraw's onChange or onDocumentChange hook.
  const onEditorChange = (newDoc) => {
    // throttle/debounce is recommended
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("doc-update", roomId, newDoc);
    }
  };

  return (
    <div className="flex h-screen">
      <div 
        className="flex-1 bg-white dark:bg-gray-900 transition-colors duration-300 relative"
        onMouseMove={handleMouseMove}
      >
        {/* Tldraw Canvas */}
        <div className="absolute inset-0">
          <Tldraw
            onMount={(app) => {
              // store instance to ref
              editorRef.current = app;
              // optionally load local doc or request server doc
            }}
            onChange={(state) => {
              // state is the serialized document from tldraw (depends on tldraw APIs)
              onEditorChange(state);
            }}
          />
        </div>

        {/* Remote cursors overlay - must be after Tldraw to appear on top */}
        <div className="absolute inset-0 pointer-events-none z-50">
          {Object.entries(remoteCursors).map(([userId, cursor]) => (
            <RemoteCursor
              key={userId}
              x={cursor.x}
              y={cursor.y}
              name={cursor.userName}
              color={cursor.color}
              avatar={cursor.userAvatar}
            />
          ))}
        </div>
      </div>

      {/* Right-side chat */}
      <div className="w-80 border-l dark:border-gray-700 p-4 bg-white dark:bg-gray-800 transition-colors duration-300">
        <ChatPanel socketRef={socketRef} roomId={roomId} user={user} />
      </div>
    </div>
  );
}

// Remote cursor component
function RemoteCursor({ x, y, name, color, avatar }) {
  return (
    <div
      className="absolute pointer-events-none z-50 transition-all duration-75"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)'
      }}
    >
      {/* Cursor pointer */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
      >
        <path
          d="M5.5 3.5L19.5 12L12 14L9 21.5L5.5 3.5Z"
          fill={color}
          stroke="white"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>

      {/* User name label */}
      <div
        className="absolute left-6 top-0 px-2 py-1 rounded text-white text-xs font-medium whitespace-nowrap shadow-lg"
        style={{
          backgroundColor: color,
          border: '2px solid white'
        }}
      >
        {avatar ? (
          <div className="flex items-center gap-1">
            <img src={avatar} alt={name} className="w-4 h-4 rounded-full" />
            <span>{name}</span>
          </div>
        ) : (
          name
        )}
      </div>
    </div>
  );
}

// Simple chat panel component
function ChatPanel({ socketRef, roomId, user }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const s = socketRef.current;
    if (!s) return;
    
    // Handle new chat messages
    const handleMessage = (msg) => {
      setMessages((m) => [...m, msg]);
    };
    
    // Handle chat history from MongoDB
    const handleHistory = (history) => {
      setMessages(history || []);
      setIsLoading(false);
    };
    
    s.on("chat-message", handleMessage);
    s.on("chat-history", handleHistory);
    
    return () => {
      s.off("chat-message", handleMessage);
      s.off("chat-history", handleHistory);
    };
  }, [socketRef]);

  const send = () => {
    if (!text.trim()) return;
    const msg = { 
      author: user, 
      text: text.trim(), 
      timestamp: new Date(),
      id: Date.now().toString()
    };
    socketRef.current.emit("chat-message", roomId, msg);
    // Don't add to local messages - wait for server confirmation
    setText("");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-2 text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
        Chat {isLoading ? "(Loading...)" : `(${messages.length} messages)`}
      </div>
      <div className="flex-1 overflow-auto space-y-2">
        {isLoading ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-4 transition-colors duration-300">Loading chat history...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-4 transition-colors duration-300">No messages yet. Start the conversation!</div>
        ) : (
          messages.map((m, i) => (
            <div key={m.id || i} className="text-gray-900 dark:text-gray-200 transition-colors duration-300">
              <strong>{m.author?.name || 'Anonymous'}</strong>: {m.text}
              <div className="text-xs text-gray-400 dark:text-gray-500 transition-colors duration-300">
                {new Date(m.timestamp || m.ts).toLocaleTimeString()}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-2 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 p-2 border dark:border-gray-600 rounded dark:bg-gray-900 dark:text-white transition-colors duration-300"
          placeholder="Send a message..."
        />
        <button onClick={send} className="px-3 py-2 bg-purple-600 dark:bg-purple-500 text-white rounded transition-colors duration-300">
          Send
        </button>
      </div>
    </div>
  );
}
