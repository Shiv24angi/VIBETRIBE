// hooks/useAuth.js
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth'; // Removed signInAnonymously
import { auth } from '../firebase/firebaseConfig';

/**
 * Custom hook to manage Firebase authentication state.
 * It provides the current user and their anonymous status without
 * automatically signing in anonymously.
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isAnonymousUser, setIsAnonymousUser] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAnonymousUser(currentUser ? currentUser.isAnonymous : false);
      setLoading(false);
      setIsAuthReady(true);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return { user, loading, isAuthReady, isAnonymousUser };
};