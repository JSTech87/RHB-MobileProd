import React, { createContext, useContext, useEffect, useState } from 'react';
import { ClerkProvider, useAuth as useClerkAuth, useUser, useSignIn, useSignUp } from '@clerk/clerk-expo';

interface AuthContextType {
  user: any;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProviderInner: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoaded, signOut: clerkSignOut } = useClerkAuth();
  const { user } = useUser();
  const { signIn: clerkSignIn, isLoaded: signInLoaded } = useSignIn();
  const { signUp: clerkSignUp, isLoaded: signUpLoaded } = useSignUp();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && signInLoaded && signUpLoaded) {
      setLoading(false);
    }
  }, [isLoaded, signInLoaded, signUpLoaded]);

  const signIn = async (email: string, password: string) => {
    try {
      if (!clerkSignIn || !signInLoaded) {
        return { error: { message: 'Sign in not ready' } };
      }

      const result = await clerkSignIn.create({
        identifier: email,
        password,
      });

      if (result.status === 'complete') {
        return { error: null };
      } else {
        return { error: { message: 'Sign in incomplete' } };
      }
    } catch (error: any) {
      return { error };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      if (!clerkSignUp || !signUpLoaded) {
        return { error: { message: 'Sign up not ready' } };
      }

      const result = await clerkSignUp.create({
        emailAddress: email,
        password,
      });

      if (result.status === 'complete') {
        return { error: null };
      } else if (result.status === 'missing_requirements') {
        // Handle email verification if required
        return { error: { message: 'Please check your email to verify your account' } };
      } else {
        return { error: { message: 'Sign up incomplete' } };
      }
    } catch (error: any) {
      return { error };
    }
  };

  const signOut = async () => {
    await clerkSignOut();
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

  if (!publishableKey) {
    throw new Error('Missing Clerk Publishable Key. Please add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY to your .env file');
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <AuthProviderInner>{children}</AuthProviderInner>
    </ClerkProvider>
  );
}; 