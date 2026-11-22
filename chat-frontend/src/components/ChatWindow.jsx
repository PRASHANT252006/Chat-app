import { useEffect, useRef, useState } from "react";
import { getMessagesRequest, sendMessageRequest } from "../api.js";
import { socket } from "../socket.js";

const formatTime = (value) =>
  new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const ChatWindow = ({ conversationId, meId, incoming, onSent, onError }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const lastStartRef = useRef(0);
  const stopTimerRef = useRef(null);
  const typingActiveRef = useRef(false);

  const stopTyping = () => {
    clearTimeout(stopTimerRef.current);
    if (typingActiveRef.current && socket.connected) {
      socket.emit("typing:stop", { conversationId });
    }
    typingActiveRef.current = false;
    lastStartRef.current = 0;
  };

  useEffect(() => {
    let ignore = false;
    setMessages([]);
    setText("");
    setLoading(true);
    getMessagesRequest(conversationId)
      .then((data) => {
        if (!ignore) setMessages(data);
      })
      .catch((err) => {
        if (!ignore) onError(err);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [conversationId]);

  useEffect(() => () => stopTyping(), [conversationId]);

  useEffect(() => {
    if (!incoming) return;
    if (String(incoming.conversation) !== String(conversationId)) return;
    setMessages((prev) =>
      prev.some((m) => m._id === incoming._id) ? prev : [...prev, incoming]
    );
  }, [incoming]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  const handleChange = (e) => {
    const value = e.target.value;
    setText(value);
    if (!value.trim()) {
      stopTyping();
      return;
    }
    const now = Date.now();
    if (now - lastStartRef.current > 2000 && socket.connected) {
      socket.emit("typing:start", { conversationId });
      lastStartRef.current = now;
      typingActiveRef.current = true;
    }
    clearTimeout(stopTimerRef.current);
    stopTimerRef.current = setTimeout(stopTyping, 2000);
  };

  const send = async () => {
    const value = text.trim();
    if (!value || sending) return;
    setSending(true);
    stopTyping();
    try {
      const created = await sendMessageRequest(conversationId, value);
      setMessages((prev) =>
        prev.some((m) => m._id === created._id) ? prev : [...prev, created]
      );
      setText("");
      onSent(conversationId, created);
    } catch (err) {
      onError(err);
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    send();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      <div className="chat-body">
        {loading && <p className="side-note">Loading messages...</p>}
        {!loading && messages.length === 0 && (
          <p className="side-note">No messages yet. Say hello.</p>
        )}
        {messages.map((m) => (
          <div
            key={m._id}
            className={m.sender?._id === meId ? "msg mine" : "msg"}
          >
            <span className="msg-text">{m.text}</span>
            <span className="msg-time">{formatTime(m.createdAt)}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form className="composer" onSubmit={handleSubmit}>
        <textarea
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message"
          aria-label="Type a message"
          rows={1}
          maxLength={2000}
        />
        <button type="submit" disabled={sending || !text.trim()}>
          Send
        </button>
      </form>
    </>
  );
};

export default ChatWindow;
