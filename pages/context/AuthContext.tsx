// context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  userEmail: string | null;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isAdmin: false,
  userEmail: null,
  checkAuth: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const checkAuth = async () => {
    try {
      const user = await getCurrentUser();
      const session = await fetchAuthSession();
      
      // Properly check for admin group in Cognito groups
      const groups = (session.tokens?.accessToken.payload['cognito:groups'] as string[]) || [];
      const isUserAdmin = groups.includes('admin');

      setIsAuthenticated(true);
      setIsAdmin(isUserAdmin);
      setUserEmail(user.username);
    } catch (error) {
      setIsAuthenticated(false);
      setIsAdmin(false);
      setUserEmail(null);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isAdmin, userEmail, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;