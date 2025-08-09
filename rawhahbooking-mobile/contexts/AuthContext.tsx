import React, { createContext, useContext, useMemo } from 'react';

type AuthContextType = {
  user: { id: string; name?: string } | null;
  loading: boolean;
  signIn: (email?: string, password?: string) => Promise<void>;
  signUp: (email?: string, password?: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState< { id: string; name?: string } | null >(null); // ← start signed-out

  const value = React.useMemo<AuthContextType>(
    () => ({
      user,
      loading: false,
      signIn: async () => setUser({ id: 'demo' }), // fake sign-in
      signUp: async () => setUser({ id: 'demo' }), // fake sign-up
      signOut: async () => setUser(null),
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 