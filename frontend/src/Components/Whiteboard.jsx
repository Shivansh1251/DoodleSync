// src/components/Whiteboard.jsx
import React, { useEffect, useRef, useState } from "react";
import { Tldraw, TldrawEditor } from "tldraw"; // slight abstraction: check docs for exact import
import { io } from "socket.io-client";

const SERVER = "http://localhost:4000";

export default function Whiteboard({ roomId = "default", user = { id: "u1", name: "Shivansh" } }) {
  const socketRef = useRef(null);
  const editorRef = useRef(null); // will hold tldraw instance
  const [connected, setConnected] = useState(false);

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

    // join the room
    s.emit("join-room", roomId, user);

    return () => {
      s.disconnect();
    };
  }, [roomId, user]);

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
      <div className="flex-1 bg-white">
        {/* TODO: Replace with the actual Tldraw component API.
            - You must grab an editor instance or pass onChange props.
            - Example (pseudocode): <Tldraw onMount={(app) => (editorRef.current = app)} onChange={onEditorChange} />
         */}
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

      {/* Right-side chat */}
      <div className="w-80 border-l p-4">
        <ChatPanel socketRef={socketRef} roomId={roomId} user={user} />
      </div>
    </div>
  );
}

// Simple chat panel component
function ChatPanel({ socketRef, roomId, user }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    const s = socketRef.current;
    if (!s) return;
    const handler = (msg) => setMessages((m) => [...m, msg]);
    s.on("chat-message", handler);
    return () => s.off("chat-message", handler);
  }, [socketRef]);

  const send = () => {
    if (!text.trim()) return;
    const msg = { author: user, text: text.trim(), ts: Date.now() };
    socketRef.current.emit("chat-message", roomId, msg);
    setMessages((m) => [...m, msg]);
    setText("");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto space-y-2">
        {messages.map((m, i) => (
          <div key={i}>
            <strong>{m.author.name}</strong>: {m.text}
            <div className="text-xs text-gray-400">{new Date(m.ts).toLocaleTimeString()}</div>
          </div>
        ))}
      </div>

      <div className="mt-2 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 p-2 border rounded"
          placeholder="Send a message..."
        />
        <button onClick={send} className="px-3 py-2 bg-purple-600 text-white rounded">
          Send
        </button>
      </div>
    </div>
  );
}
