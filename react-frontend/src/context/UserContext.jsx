import { createContext, useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

const UserContext = createContext();
export default UserContext;

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMe() {
      try {
        const token = localStorage.getItem("token");
        const headers = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await fetch(`${API_URL}/auth/me`, {
          credentials: "include",
          headers: headers,
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user ?? data);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    fetchMe();
  }, []);

  async function login(username, password) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Login failed");
    }
    
    // Save the token for cross-domain auth
    if (data.token) {
      localStorage.setItem("token", data.token);
    }
    
    setUser(data.user);
    return data.user;
  }

  async function logout() {
    const token = localStorage.getItem("token");
    const headers = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: headers,
    });
    
    localStorage.removeItem("token");
    setUser(null);
  }

  return (
    <UserContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}