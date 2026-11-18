import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);
const KEY = "chat_user";

const readStoredUser = () => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readStoredUser);

  const saveUser = (u) => {
    localStorage.setItem(KEY, JSON.stringify(u));
    setUser(u);
  };

  const clearUser = () => {
    localStorage.removeItem(KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, saveUser, clearUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
