import Avatar from "../components/Avatar.jsx";
import { useAuth } from "../AuthContext.jsx";

const Home = () => {
  const { user, clearUser } = useAuth();

  return (
    <div className="home">
      <header className="home-bar">
        <div className="who">
          <Avatar src={user.avatar} name={user.username} />
          <div>
            <strong>{user.username}</strong>
            <span>{user.email}</span>
          </div>
        </div>
        <button className="ghost" onClick={clearUser}>
          Log out
        </button>
      </header>
      <main className="home-empty">
        <h2>No conversations yet</h2>
        <p>Chat rooms and messages will appear here once the chat backend is ready.</p>
      </main>
    </div>
  );
};

export default Home;
