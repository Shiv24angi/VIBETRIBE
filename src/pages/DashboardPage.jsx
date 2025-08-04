import React, { useState, useEffect } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import LoadingSpinner from '../components/LoadingSpinner';
import ProfileForm from '../components/ProfileForm';

const DashboardPage = ({ user, onLogout }) => {
  const [profile, setProfile] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState('dashboard'); // 'dashboard', 'my-profile', 'edit-profile'

  // Function to fetch the current user's profile and all potential matches
  const fetchUserProfileAndMatches = async () => {
    if (!user || !user.uid) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

      // 1. Fetch the current user's profile from the nested subcollection
      const profileDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/profiles`, 'myProfile');
      const docSnap = await getDoc(profileDocRef);

      if (!docSnap.exists()) {
        setError("Profile not found. Please create your profile.");
        setLoading(false);
        return;
      }
      
      const userProfileData = docSnap.data();
      setProfile(userProfileData);

      // 2. Fetch all user documents to get their UIDs
      const usersRef = collection(db, `artifacts/${appId}/users`);
      const usersSnapshot = await getDocs(usersRef);
      
      const allMatches = [];
      const userVibes = userProfileData.vibes || [];

      if (userVibes.length > 0) {
        for (const userDoc of usersSnapshot.docs) {
          if (userDoc.id !== user.uid) { // Exclude the current user
            // Correctly build the path to the other user's nested profile document
            const otherProfileDocRef = doc(db, `artifacts/${appId}/users/${userDoc.id}/profiles`, 'myProfile');
            const otherProfileDoc = await getDoc(otherProfileDocRef);
            
            if (otherProfileDoc.exists()) {
              const otherProfileData = otherProfileDoc.data();
              const otherUserVibes = otherProfileData.vibes || [];
              
              // Check for at least one common vibe
              const hasMatchingVibe = otherUserVibes.some(vibe => userVibes.includes(vibe));
              
              if (hasMatchingVibe) {
                allMatches.push({
                  id: userDoc.id,
                  name: otherProfileData.name,
                  imageUrl: `https://placehold.co/150x150/A970FF/FFFFFF?text=${otherProfileData.name.charAt(0)}`,
                  ...otherProfileData,
                });
              }
            }
          }
        }
      }
      setMatches(allMatches);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfileAndMatches();
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

  const handleProfileUpdate = () => {
    fetchUserProfileAndMatches(); // Re-fetch all data after profile update
    setView('my-profile');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EFE0E5]">
        <LoadingSpinner />
      </div>
    );
  }

  const userDisplayName = profile?.name || user?.displayName || user?.email;

  const renderContent = () => {
    if (view === 'edit-profile') {
      return (
        <div className="p-8">
          <ProfileForm userId={user.uid} onProfileCreated={handleProfileUpdate} />
        </div>
      );
    }

    if (view === 'my-profile') {
      return (
        <div className="p-8">
          <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl mx-auto text-[#2A1E5C]">
            <h2 className="text-4xl font-bold mb-4 text-center">My Profile</h2>
            {profile ? (
              <>
                <div className="flex flex-col items-center mb-6">
                  <div className="w-24 h-24 bg-gray-300 rounded-full mb-4">
                    <img src="https://via.placeholder.com/150" alt="User Avatar" className="w-full h-full object-cover rounded-full" />
                  </div>
                  <h3 className="text-2xl font-semibold">{profile.name || 'Anonymous User'}</h3>
                  <p className="text-gray-500">{profile.bio || 'No bio provided.'}</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-xl font-bold mb-2">My Vibes</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.vibes && profile.vibes.length > 0 ? (
                        profile.vibes.map((vibe, index) => (
                          <span key={index} className="bg-[#A970FF] text-white px-3 py-1 rounded-full text-sm shadow">
                            {vibe}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-500">No vibes selected.</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xl font-bold mb-2">My Moods</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.moods && profile.moods.length > 0 ? (
                        profile.moods.map((mood, index) => (
                          <span key={index} className="bg-[#A970FF] text-white px-3 py-1 rounded-full text-sm shadow">
                            {mood}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-500">No moods selected.</p>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setView('edit-profile')}
                  className="w-full mt-8 bg-[#8B4DEB] text-white py-3 rounded-lg font-semibold hover:bg-[#6A39B1] transition duration-300 shadow-md"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => setView('dashboard')}
                  className="w-full mt-4 bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-400 transition duration-300"
                >
                  Back to Dashboard
                </button>
              </>
            ) : (
              <p className="text-lg text-red-600 text-center">{error || "Loading profile..."}</p>
            )}
          </div>
        </div>
      );
    }

    // Default 'dashboard' view
    return (
      <div className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Who's Nearby?</h2>
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Search for a vibe..."
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#A970FF]"
            />
            <button className="px-4 py-2 bg-gray-200 rounded-lg text-gray-700 hover:bg-gray-300 transition-colors duration-200">
              Filters
            </button>
          </div>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {matches.length > 0 ? (
            matches.map((match) => (
              <div key={match.id} className="relative rounded-xl overflow-hidden shadow-md group">
                <img
                  src={match.imageUrl || `https://placehold.co/150x150/A970FF/FFFFFF?text=${match.name.charAt(0)}`}
                  alt={match.name}
                  className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex flex-col justify-end">
                  <h3 className="text-xl font-bold text-white mb-1">{match.name}</h3>
                  <span className="text-sm text-gray-300">{match.distance || 'Unknown distance'}</span>
                  <button className="mt-2 text-white bg-[#A970FF] px-4 py-2 rounded-full font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Visit Profile
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-xl text-gray-500 col-span-full">
              No matches found.
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-[#F0F2F5] text-[#2A1E5C]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#2A1E5C] text-white p-6 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center space-x-2 mb-8">
            <div className="w-10 h-10 bg-[#A970FF] rounded-full flex items-center justify-center text-white font-bold text-xl">V</div>
            <h1 className="text-2xl font-bold">VibeTribe</h1>
          </div>
          <button
            onClick={() => setView('my-profile')}
            className="w-full flex items-center space-x-4 mb-8 text-left p-2 rounded-lg hover:bg-gray-700 transition-colors duration-200"
          >
            <div className="w-12 h-12 bg-gray-400 rounded-full overflow-hidden">
              <img src="https://via.placeholder.com/150" alt="User" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold">{userDisplayName}</h2>
              <span className="text-sm text-gray-400">Online</span>
            </div>
          </button>
          <nav className="space-y-2 mb-8">
            <button onClick={() => setView('dashboard')} className="w-full flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors duration-200 text-left">
              <span className="mr-3">🏠</span> Discover
            </button>
            <a href="#" className="flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors duration-200">
              <span className="mr-3">✉️</span> Messages
            </a>
            <a href="#" className="flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors duration-200">
              <span className="mr-3">📰</span> News Feed
            </a>
            <a href="#" className="flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors duration-200">
              <span className="mr-3">⚙️</span> Settings
            </a>
          </nav>
        </div>
        <button
          onClick={handleLogout}
          className="w-full bg-[#A970FF] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#8B4DEB] transition duration-300 shadow-md"
        >
          Log Out
        </button>
      </aside>
      <main className="flex-1">
        {renderContent()}
      </main>
    </div>
  );
};

export default DashboardPage;
