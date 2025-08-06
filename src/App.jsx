// src/App.jsx
import React, { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import ProfileCreationPage from './pages/ProfileCreationPage';
import DashboardPage from './pages/DashboardPage';
import LoadingSpinner from './components/LoadingSpinner';
import { useAuth } from './hooks/useAuth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase/firebaseConfig';

/**
 * The main App component for VibeTribe.
 * It manages the overall application flow, handling authentication state
 * and directing users to the appropriate page (Landing, Profile Creation, or Dashboard).
 * The global loading spinner background is updated to match the application's theme.
 */
const App = () => {
  const { user, loading, isAuthReady, isAnonymousUser } = useAuth();
  const [hasProfile, setHasProfile] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);

  // Determine the app ID for Firestore path
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

  /**
   * Checks if the current user has an existing profile in Firestore.
   * This is crucial for directing users to the correct page after login.
   * Checks for profiles of all users, including anonymous.
   */
  const checkUserProfile = async () => {
    if (!user || !user.uid) {
      setHasProfile(false);
      setCheckingProfile(false);
      return;
    }

    try {
      const profileDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/profiles`, 'myProfile');
      const docSnap = await getDoc(profileDocRef);
      setHasProfile(docSnap.exists());
    } catch (error) {
      console.error("Error checking user profile:", error);
      setHasProfile(false);
    } finally {
      setCheckingProfile(false);
    }
  };

  useEffect(() => {
    if (isAuthReady) {
      setCheckingProfile(true);
      checkUserProfile();
    }
  }, [user, isAuthReady]);

  const handleAuthSuccess = () => {
    setCheckingProfile(true);
    checkUserProfile();
  };

  const handleProfileComplete = () => {
    setHasProfile(true);
  };

  const handleLogout = () => {
    setHasProfile(false);
    setCheckingProfile(true);
  };

  if (loading || checkingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EFE0E5]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return <LandingPage onAuthSuccess={handleAuthSuccess} />;
  } else if (!hasProfile) {
    return <ProfileCreationPage userId={user.uid} onProfileComplete={handleProfileComplete} />;
  } else {
    return <DashboardPage user={user} onLogout={handleLogout} />;
  }
};

export default App;