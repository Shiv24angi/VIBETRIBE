// App.jsx
import React, { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import ProfileCreationPage from './pages/ProfileCreationPage';
import DashboardPage from './pages/DashboardPage';
import LoadingSpinner from './components/LoadingSpinner';
import { useAuth } from './hooks/useAuth'; // Importing the updated useAuth hook
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase/firebaseConfig';

/**
 * The main App component for VibeTribe.
 * It manages the overall application flow, handling authentication state
 * and directing users to the appropriate page (Landing, Profile Creation, or Dashboard).
 * The global loading spinner background is updated to match the application's theme.
 */
const App = () => {
  // Destructure the new 'isAnonymousUser' state from useAuth
  const { user, loading, isAuthReady, isAnonymousUser } = useAuth();
  const [hasProfile, setHasProfile] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);

  // Determine the app ID for Firestore path
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

  /**
   * Checks if the current user has an existing profile in Firestore.
   * This is crucial for directing users to the correct page after login.
   * Only checks for profiles of non-anonymous users.
   */
  const checkUserProfile = async () => {
    // If there's no user, or the user is anonymous, or no UID, then no profile to check for this session.
    if (!user || isAnonymousUser || !user.uid) {
      setHasProfile(false);
      setCheckingProfile(false);
      return;
    }

    try {
      // Construct the Firestore document path for private user data
      const profileDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/profiles`, 'myProfile');
      const docSnap = await getDoc(profileDocRef);
      setHasProfile(docSnap.exists());
    } catch (error) {
      console.error("Error checking user profile:", error);
      setHasProfile(false); // Assume no profile on error
    } finally {
      setCheckingProfile(false);
    }
  };

  // Effect to check user profile whenever auth state changes and is ready
  useEffect(() => {
    if (isAuthReady) {
      setCheckingProfile(true); // Reset checking state
      checkUserProfile();
    }
  }, [user, isAuthReady, isAnonymousUser]); // Re-run when user object, auth readiness, or anonymous status changes

  /**
   * Callback function for successful authentication.
   * Forces a re-check of the user's profile to redirect them.
   */
  const handleAuthSuccess = () => {
    // When auth is successful (and is now a non-anonymous user), re-check profile to navigate correctly
    setCheckingProfile(true);
    checkUserProfile();
  };

  /**
   * Callback function when profile creation/update is complete.
   * Forces a re-check of the user's profile to navigate to the dashboard.
   */
  const handleProfileComplete = () => {
    setHasProfile(true); // Directly set hasProfile to true as it's now complete
  };

  /**
   * Callback function for user logout.
   * Resets the profile state and re-checks authentication.
   */
  const handleLogout = () => {
    setHasProfile(false);
    setCheckingProfile(true);
    // The useAuth hook's onAuthStateChanged will handle setting user to null
    // and potentially signing in anonymously, triggering a re-render.
  };

  // Show a global loading spinner while authentication or profile check is in progress
  if (loading || checkingProfile) {
    return (
      // Background updated to the light pink/purple from the image for global loading state
      <div className="min-h-screen flex items-center justify-center bg-[#EFE0E5]">
        <LoadingSpinner />
      </div>
    );
  }

  // Render different pages based on authentication and profile status
  // Show LandingPage if no user OR if the user is an anonymous user.
  if (!user || isAnonymousUser) {
    return <LandingPage onAuthSuccess={handleAuthSuccess} />;
  } else if (user && !isAnonymousUser && !hasProfile) {
    // User is logged in (non-anonymous) but has no profile yet
    return <ProfileCreationPage userId={user.uid} onProfileComplete={handleProfileComplete} />;
  } else {
    // User is logged in (non-anonymous) and has a profile
    return <DashboardPage user={user} onLogout={handleLogout} />;
  }
};

export default App;
