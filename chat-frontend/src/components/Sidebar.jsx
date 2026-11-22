import { useEffect, useState } from "react";
import Avatar from "./Avatar.jsx";
import { getUsersRequest } from "../api.js";

const Sidebar = ({
  me,
  items,
  activeId,
  loading,
  onlineIds,
  onOpenChat,
  onOpenUser,
  onLogout,
  onError,
}) => {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const term = search.trim();

  useEffect(() => {
    if (!term) {
      setResults([]);
      setSearching(false);
      return undefined;
    }
    let ignore = false;
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const data = await getUsersRequest(term);
        if (!ignore) setResults(data);
      } catch (err) {
        if (!ignore) onError(err);
      } finally {
        if (!ignore) setSearching(false);
      }
    }, 300);
    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [term]);

  const openUser = (u) => {
    setSearch("");
    onOpenUser(u);
  };

  const renderList = () => {
    if (term) {
      if (searching) return <p className="side-note">Searching...</p>;
      if (results.length === 0) return <p className="side-note">No people found</p>;
      return results.map((u) => (
        <button key={u._id} className="row" onClick={() => openUser(u)}>
          <Avatar
            src={u.avatar}
            name={u.username}
            size={40}
            online={onlineIds.has(String(u._id))}
          />
          <div className="row-text">
            <strong>{u.username}</strong>
            <span>Start a chat</span>
          </div>
        </button>
      ));
    }
    if (loading) return <p className="side-note">Loading chats...</p>;
    if (items.length === 0) {
      return <p className="side-note">No chats yet. Search a username to start one.</p>;
    }
    return items.map((item) => (
      <button
        key={item.id}
        className={item.id === activeId ? "row active" : "row"}
        onClick={() => onOpenChat(item.id)}
      >
        <Avatar
          src={item.other.avatar}
          name={item.other.username}
          size={40}
          online={item.online}
        />
        <div className="row-text">
          <strong>{item.other.username}</strong>
          {item.typing ? (
            <span className="typing-text">typing...</span>
          ) : (
            <span>{item.lastText}</span>
          )}
        </div>
        {item.unread > 0 && (
          <span className="badge">{item.unread > 99 ? "99+" : item.unread}</span>
        )}
      </button>
    ));
  };

  return (
    <aside className="side">
      <div className="side-top">
        <div className="who">
          <Avatar src={me.avatar} name={me.username} size={40} />
          <strong>{me.username}</strong>
        </div>
        <button className="ghost" onClick={onLogout}>
          Log out
        </button>
      </div>
      <div className="side-search">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search people by username"
          aria-label="Search people by username"
        />
      </div>
      <div className="side-list">{renderList()}</div>
    </aside>
  );
};

export default Sidebar;
