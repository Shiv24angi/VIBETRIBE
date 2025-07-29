// pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import LoadingSpinner from '../components/LoadingSpinner';

/**
 * DashboardPage component serves as the main page after a user has logged in
 * and created their profile. It displays a welcome message and user's basic info.
 * In the future, this page will display matched users.
 * @param {Object} props - Component props.
 * @param {Object} props.user - The Firebase User object.
 * @param {function(): void} props.onLogout - Callback function for logging out.
 */
const DashboardPage = ({ user, onLogout }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user || !user.uid) {
        setLoading(false);
        return;
      }
      try {
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        const profileDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/profiles`, 'myProfile');
        const docSnap = await getDoc(profileDocRef);

        if (docSnap.exists()) {
          setProfile(docSnap.data());
        } else {
          setError("Profile not found. Please create your profile.");
        }
      } catch (err) {
        console.error("Error fetching profile for dashboard:", err);
        setError("Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleLogout = async () => {
    const authInstance = getAuth();
    try {
      await signOut(authInstance);
      onLogout(); // Notify parent component to redirect to landing page
    } catch (err) {
      console.error("Error logging out:", err);
      setError("Failed to log out. Please try again.");
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    // Main background updated to Burgundy
    <div className="min-h-screen bg-[#800020] flex flex-col items-center justify-center p-4 font-inter text-white">
      {/* Inner card background updated to Beige */}
      <div className="bg-[#F5F5DC] p-8 rounded-xl shadow-lg w-full max-w-2xl text-[#4A0404] text-center">
        {/* Heading text color updated to dark burgundy/brown */}
        <h2 className="text-4xl font-bold mb-4">Welcome to VibeTribe!</h2>
        {profile ? (
          <>
            {/* Text colors updated to dark burgundy/brown */}
            <p className="text-xl mb-2">Hello, <span className="font-semibold">{profile.name || user.displayName || user.email}</span>!</p>
            <p className="text-lg mb-4">{profile.bio || 'No bio provided.'}</p>
            <div className="mb-4">
              <h3 className="text-xl font-semibold mb-2">Your Vibes:</h3>
              <div className="flex flex-wrap justify-center gap-2">
                {profile.vibes && profile.vibes.length > 0 ? (
                  profile.vibes.map((vibe, index) => (
                    // Vibe tags updated to Burgundy background with white text
                    <span key={index} className="bg-[#800020] text-white px-3 py-1 rounded-full text-sm">
                      {vibe}
                    </span>
                  ))
                ) : (
                  <span className="text-[#4A0404]">No vibes selected.</span>
                )}
              </div>
            </div>
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Your Moods:</h3>
              <div className="flex flex-wrap justify-center gap-2">
                {profile.moods && profile.moods.length > 0 ? (
                  profile.moods.map((mood, index) => (
                    // Mood tags updated to Burgundy background with white text
                    <span key={index} className="bg-[#800020] text-white px-3 py-1 rounded-full text-sm">
                      {mood}
                    </span>
                  ))
                ) : (
                  <span className="text-[#4A0404]">No moods selected.</span>
                )}
              </div>
            </div>
            {/* User ID text color updated to dark burgundy/brown */}
            <p className="text-[#4A0404] text-sm mb-4">Your User ID: <span className="font-mono break-all">{user.uid}</span></p>
            <p className="text-[#4A0404] text-sm mb-6">
              This is your dashboard. In the future, you'll see your matches here!
            </p>
          </>
        ) : (
          <p className="text-lg text-red-600">{error || "Loading profile..."}</p>
        )}

        <button
          onClick={handleLogout}
          // Logout button updated to Burgundy background with a darker hover state
          className="mt-6 bg-[#800020] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#6A001A] transition duration-300 shadow-md"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;