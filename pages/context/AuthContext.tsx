// context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  userEmail: string | null;
  checkAuth: () => Promise<void>;
}

interface CognitoTokenPayload {
  'cognito:groups'?: string[];
  email?: string;
  [key: string]: unknown;
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
      // 1. Get current user (primarily to confirm a user is logged in)
      await getCurrentUser();

      // 2. Fetch current session tokens
      const session = await fetchAuthSession();
      
      if (!session.tokens?.accessToken || !session.tokens?.idToken) {
        throw new Error('No valid tokens found in session');
      }

      // 3. Extract groups from access token with proper typing
      const accessTokenPayload = session.tokens.accessToken.payload as CognitoTokenPayload;
      const groups = accessTokenPayload['cognito:groups'] ?? [];
      const isUserAdmin = Array.isArray(groups) && groups.includes('admin');

      // 4. Extract email from ID token with proper typing
      const idTokenPayload = session.tokens.idToken.payload as CognitoTokenPayload;
      const email = idTokenPayload.email;

      // 5. Update state
      setIsAuthenticated(true);
      setIsAdmin(isUserAdmin);
      setUserEmail(email ?? null);
    } catch (error) {
      // Reset state on any error
      setIsAuthenticated(false);
      setIsAdmin(false);
      setUserEmail(null);
      
      // Log the error but don't throw it to prevent UI crashes
      console.error('Authentication check failed:', error);
    }
  };

  // Check auth status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const contextValue: AuthContextType = {
    isAuthenticated,
    isAdmin,
    userEmail,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;