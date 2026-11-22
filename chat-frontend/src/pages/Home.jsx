import { useEffect, useRef, useState } from "react";
import Avatar from "../components/Avatar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import ChatWindow from "../components/ChatWindow.jsx";
import { useAuth } from "../AuthContext.jsx";
import {
  createConversationRequest,
  getConversationsRequest,
  markMessagesReadRequest,
  refreshAccessRequest,
} from "../api.js";
import { socket } from "../socket.js";

const Home = () => {
  const { user, clearUser } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [incoming, setIncoming] = useState(null);
  const [onlineIds, setOnlineIds] = useState(new Set());
  const [typingMap, setTypingMap] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const conversationsRef = useRef([]);
  const activeIdRef = useRef(null);
  const typingTimers = useRef({});
  conversationsRef.current = conversations;
  activeIdRef.current = activeId;

  const handleError = (err) => {
    if (err.status === 401) {
      clearUser();
      return;
    }
    setError(err.message);
  };

  useEffect(() => {
    let ignore = false;
    getConversationsRequest()
      .then((data) => {
        if (!ignore) setConversations(data);
      })
      .catch((err) => {
        if (!ignore) handleError(err);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  const moveToTop = (conversationId, message) => {
    setConversations((prev) => {
      const target = prev.find((c) => c._id === conversationId);
      if (!target) return prev;
      const updated = { ...target, lastMessage: message };
      return [updated, ...prev.filter((c) => c._id !== conversationId)];
    });
  };

  const markRead = (conversationId) => {
    setConversations((prev) =>
      prev.map((c) => (c._id === conversationId ? { ...c, unreadCount: 0 } : c))
    );
    markMessagesReadRequest(conversationId).catch(() => {});
  };

  useEffect(() => {
    let retried = false;
    const timers = typingTimers.current;

    const onConnect = () => {
      retried = false;
    };

    const onDisconnect = () => {
      setOnlineIds(new Set());
    };

    const onConnectError = async (err) => {
      if (!/token/i.test(err.message)) return;
      if (retried) {
        clearUser();
        return;
      }
      retried = true;
      const refreshed = await refreshAccessRequest();
      if (refreshed) {
        socket.connect();
      } else {
        clearUser();
      }
    };

    const onPresenceList = (ids) => {
      setOnlineIds(new Set((ids || []).map(String)));
    };

    const onPresenceUpdate = ({ userId, online }) => {
      setOnlineIds((prev) => {
        const next = new Set(prev);
        if (online) next.add(String(userId));
        else next.delete(String(userId));
        return next;
      });
    };

    const onTypingUpdate = ({ conversationId, typing }) => {
      const id = String(conversationId);
      clearTimeout(timers[id]);
      setTypingMap((prev) => ({ ...prev, [id]: Boolean(typing) }));
      if (typing) {
        timers[id] = setTimeout(() => {
          setTypingMap((prev) => ({ ...prev, [id]: false }));
        }, 5000);
      }
    };

    const onNewMessage = (message) => {
      const conversationId = String(message.conversation);
      const known = conversationsRef.current.some((c) => c._id === conversationId);
      const isActive = activeIdRef.current === conversationId;
      if (known) {
        setConversations((prev) => {
          const target = prev.find((c) => c._id === conversationId);
          if (!target) return prev;
          const unread = isActive ? 0 : (target.unreadCount || 0) + 1;
          const updated = { ...target, lastMessage: message, unreadCount: unread };
          return [updated, ...prev.filter((c) => c._id !== conversationId)];
        });
      } else {
        getConversationsRequest()
          .then(setConversations)
          .catch(handleError);
      }
      if (isActive) markMessagesReadRequest(conversationId).catch(() => {});
      clearTimeout(timers[conversationId]);
      setTypingMap((prev) => ({ ...prev, [conversationId]: false }));
      setIncoming(message);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("presence:list", onPresenceList);
    socket.on("presence:update", onPresenceUpdate);
    socket.on("typing:update", onTypingUpdate);
    socket.on("message:new", onNewMessage);
    socket.connect();

    return () => {
      Object.values(timers).forEach(clearTimeout);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("presence:list", onPresenceList);
      socket.off("presence:update", onPresenceUpdate);
      socket.off("typing:update", onTypingUpdate);
      socket.off("message:new", onNewMessage);
      socket.disconnect();
    };
  }, []);

  const selectChat = (id) => {
    setError("");
    setActiveId(id);
    const target = conversationsRef.current.find((c) => c._id === id);
    if (target && target.unreadCount > 0) markRead(id);
  };

  const openUser = async (other) => {
    setError("");
    try {
      const conversation = await createConversationRequest(other._id);
      const list = await getConversationsRequest();
      setConversations(list);
      setActiveId(conversation._id);
      const target = list.find((c) => c._id === conversation._id);
      if (target && target.unreadCount > 0) markRead(conversation._id);
    } catch (err) {
      handleError(err);
    }
  };

  const items = conversations
    .map((c) => {
      const other = c.participants.find((p) => p._id !== user._id);
      return {
        id: c._id,
        other,
        lastText: c.lastMessage?.text || "No messages yet",
        unread: c.unreadCount || 0,
        online: other ? onlineIds.has(String(other._id)) : false,
        typing: Boolean(typingMap[c._id]),
      };
    })
    .filter((item) => item.other);

  const active = items.find((item) => item.id === activeId);

  return (
    <div className="chat-shell">
      <Sidebar
        me={user}
        items={items}
        activeId={activeId}
        loading={loading}
        onlineIds={onlineIds}
        onOpenChat={selectChat}
        onOpenUser={openUser}
        onLogout={clearUser}
        onError={handleError}
      />
      <section className="chat-main">
        {error && <p className="error chat-error">{error}</p>}
        {active ? (
          <>
            <header className="chat-head">
              <Avatar
                src={active.other.avatar}
                name={active.other.username}
                size={40}
                online={active.online}
              />
              <div className="chat-head-text">
                <strong>{active.other.username}</strong>
                <span className={active.typing ? "chat-status typing-text" : "chat-status"}>
                  {active.typing ? "typing..." : active.online ? "Online" : "Offline"}
                </span>
              </div>
            </header>
            <ChatWindow
              conversationId={active.id}
              meId={user._id}
              incoming={incoming}
              onSent={moveToTop}
              onError={handleError}
            />
          </>
        ) : (
          <div className="home-empty">
            <h2>Select a chat</h2>
            <p>Pick a conversation, or search a username to start a new one.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
