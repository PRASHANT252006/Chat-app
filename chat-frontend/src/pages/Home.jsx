import { useEffect, useState } from "react";
import Avatar from "../components/Avatar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import { useAuth } from "../AuthContext.jsx";
import { createConversationRequest, getConversationsRequest } from "../api.js";

const Home = () => {
  const { user, clearUser } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

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

  const openUser = async (other) => {
    setError("");
    try {
      const conversation = await createConversationRequest(other._id);
      setConversations((prev) =>
        prev.some((c) => c._id === conversation._id) ? prev : [conversation, ...prev]
      );
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
        onOpenChat={setActiveId}
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
            <div className="home-empty">
              <h2>Messages are coming next</h2>
              <p>This chat is ready. Sending and reading messages comes in Phase 3.</p>
            </div>
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
