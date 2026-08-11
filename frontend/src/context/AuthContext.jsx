import { createContext, useContext, useState } from 'react';

// Create the AuthContext
const AuthContext = createContext();

// Provide Auth state to the app
export const AuthProvider = ({ children }) => {
  // Store user and token in memory only for now (as requested for Phase 6a)
  // This means a page refresh will log the user out.
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  // Login function called after successful API response
  const login = (newToken, userData) => {
    setToken(newToken);
    setUser(userData);
  };

  // Logout function to clear memory
  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use AuthContext easily in components
export const useAuth = () => {
  return useContext(AuthContext);
};
