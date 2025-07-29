import React, { useState, useEffect } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import LoadingSpinner from '../components/LoadingSpinner';

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
      onLogout();
    } catch (err) {
      console.error("Error logging out:", err);
      setError("Failed to log out. Please try again.");
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-[#A970FF] flex flex-col items-center justify-center p-4 font-inter text-white">
      <div className="bg-[#FFF3F6] p-8 rounded-xl shadow-lg w-full max-w-2xl text-[#2A1E5C] text-center">
        <h2 className="text-4xl font-bold mb-4">Welcome to VibeTribe!</h2>
        {profile ? (
          <>
            <p className="text-xl mb-2">Hello, <span className="font-semibold">{profile.name || user.displayName || user.email}</span>!</p>
            <p className="text-lg mb-4">{profile.bio || 'No bio provided.'}</p>

            <div className="mb-4">
              <h3 className="text-xl font-semibold mb-2">Your Vibes:</h3>
              <div className="flex flex-wrap justify-center gap-2">
                {profile.vibes && profile.vibes.length > 0 ? (
                  profile.vibes.map((vibe, index) => (
                    <span key={index} className="bg-[#A970FF] text-white px-3 py-1 rounded-full text-sm shadow">
                      {vibe}
                    </span>
                  ))
                ) : (
                  <span>No vibes selected.</span>
                )}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Your Moods:</h3>
              <div className="flex flex-wrap justify-center gap-2">
                {profile.moods && profile.moods.length > 0 ? (
                  profile.moods.map((mood, index) => (
                    <span key={index} className="bg-[#A970FF] text-white px-3 py-1 rounded-full text-sm shadow">
                      {mood}
                    </span>
                  ))
                ) : (
                  <span>No moods selected.</span>
                )}
              </div>
            </div>

            <p className="text-sm mb-4">
              <strong>Your User ID:</strong> <span className="font-mono break-all">{user.uid}</span>
            </p>
            <p className="text-sm mb-6">
              This is your dashboard. In the future, you'll see your matches here!
            </p>
          </>
        ) : (
          <p className="text-lg text-red-600">{error || "Loading profile..."}</p>
        )}

        <button
          onClick={handleLogout}
          className="mt-6 bg-[#A970FF] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#8B4DEB] transition duration-300 shadow-md"
        >
          Log Out
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;
