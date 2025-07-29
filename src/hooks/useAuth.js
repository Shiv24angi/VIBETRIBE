// hooks/useAuth.js
import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithCustomToken, signInAnonymously } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';

/**
 * Custom hook to manage Firebase authentication state.
 * It initializes authentication using a custom token if available,
 * or signs in anonymously otherwise. It also provides the current user
 * and their anonymous status.
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isAnonymousUser, setIsAnonymousUser] = useState(false); // New state to track anonymous status

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      let finalUser = currentUser;
      let anonymousStatus = false;

      if (!currentUser) {
        // If no user is currently signed in, attempt to sign in
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          // Try custom token first if available (for Canvas environment)
          try {
            const userCredential = await signInWithCustomToken(auth, __initial_auth_token);
            finalUser = userCredential.user;
            console.log("Signed in with custom token.");
          } catch (error) {
            console.error("Error signing in with custom token:", error);
            // Fallback to anonymous sign-in if custom token fails
            const userCredential = await signInAnonymously(auth);
            finalUser = userCredential.user;
            anonymousStatus = true;
            console.log("Signed in anonymously after custom token failure.");
          }
        } else {
          // If no custom token, sign in anonymously
          try {
            const userCredential = await signInAnonymously(auth);
            finalUser = userCredential.user;
            anonymousStatus = true;
            console.log("Signed in anonymously.");
          } catch (error) {
            console.error("Error signing in anonymously:", error);
          }
        }
      } else {
        // If a user is already signed in, check their anonymous status
        anonymousStatus = currentUser.isAnonymous;
      }

      setUser(finalUser);
      setIsAnonymousUser(anonymousStatus); // Set the new anonymous status
      setLoading(false);
      setIsAuthReady(true);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Return the new isAnonymousUser state along with existing states
  return { user, loading, isAuthReady, isAnonymousUser };
};
