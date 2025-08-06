// src/App.jsx
import React, { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import ProfileCreationPage from './pages/ProfileCreationPage';
import DashboardPage from './pages/DashboardPage';
import LoadingSpinner from './components/LoadingSpinner';
import { useAuth } from './hooks/useAuth';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from './firebase/firebaseConfig';
import { signOut } from 'firebase/auth';

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
  const [initialDashboardView, setInitialDashboardView] = useState('dashboard');

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
      // Removed setLoading(true) here as 'checkingProfile' handles this state
      const profileDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/profiles`, 'myProfile');
      const docSnap = await getDoc(profileDocRef);
      setHasProfile(docSnap.exists());
      // If profile exists, ensure the dashboard starts on the default view
      if (docSnap.exists()) {
        setInitialDashboardView('dashboard');
      }
    } catch (error) {
      console.error("Error checking user profile:", error);
      setHasProfile(false);
    } finally {
      // Removed setLoading(false) here as 'checkingProfile' handles this state
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
    // Set initial dashboard view to 'my-profile' after profile creation
    setInitialDashboardView('my-profile');
  };

  /**
   * Handles logging out the user from Firebase and resetting app state.
   * This will redirect the user back to the LandingPage.
   */
  const handleLogout = async () => {
    try {
      await signOut(auth); // Sign out the user from Firebase
      setHasProfile(false); // Reset profile state
      setCheckingProfile(true); // Trigger re-check of auth state
      setInitialDashboardView('dashboard'); // Reset initial view for next login
    } catch (err) {
      console.error("Error logging out:", err);
      // Optionally, set an error state to display to the user
    }
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
    // Pass handleLogout to ProfileCreationPage so it can be used to go back to LandingPage
    return <ProfileCreationPage userId={user.uid} onProfileComplete={handleProfileComplete} onGoBackToLanding={handleLogout} />;
  } else {
    // Pass the initialDashboardView to DashboardPage
    return <DashboardPage user={user} onLogout={handleLogout} initialView={initialDashboardView} />;
  }
};

export default App;
