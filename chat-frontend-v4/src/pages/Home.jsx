import { useEffect, useRef, useState } from "react";
import Avatar from "../components/Avatar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import ChatWindow from "../components/ChatWindow.jsx";
import { useAuth } from "../AuthContext.jsx";
import {
  createConversationRequest,
  getConversationsRequest,
  refreshAccessRequest,
} from "../api.js";
import { socket } from "../socket.js";

const Home = () => {
  const { user, clearUser } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [incoming, setIncoming] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const conversationsRef = useRef([]);
  conversationsRef.current = conversations;

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

  useEffect(() => {
    let retried = false;

    const onConnect = () => {
      retried = false;
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

    const onNewMessage = (message) => {
      const conversationId = String(message.conversation);
      const known = conversationsRef.current.some((c) => c._id === conversationId);
      if (known) {
        moveToTop(conversationId, message);
      } else {
        getConversationsRequest()
          .then(setConversations)
          .catch(handleError);
      }
      setIncoming(message);
    };

    socket.on("connect", onConnect);
    socket.on("connect_error", onConnectError);
    socket.on("message:new", onNewMessage);
    socket.connect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("connect_error", onConnectError);
      socket.off("message:new", onNewMessage);
      socket.disconnect();
    };
  }, []);

  const selectChat = (id) => {
    setError("");
    setActiveId(id);
  };

  const openUser = async (other) => {
    setError("");
    try {
      const conversation = await createConversationRequest(other._id);
      const list = await getConversationsRequest();
      setConversations(list);
      setActiveId(conversation._id);
    } catch (err) {
      handleError(err);
    }
  };

  const items = conversations
    .map((c) => ({
      id: c._id,
      other: c.participants.find((p) => p._id !== user._id),
      lastText: c.lastMessage?.text || "No messages yet",
    }))
    .filter((item) => item.other);

  const active = items.find((item) => item.id === activeId);

  return (
    <div className="chat-shell">
      <Sidebar
        me={user}
        items={items}
        activeId={activeId}
        loading={loading}
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
              <Avatar src={active.other.avatar} name={active.other.username} size={40} />
              <strong>{active.other.username}</strong>
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
