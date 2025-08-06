// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import LoadingSpinner from '../components/LoadingSpinner';
import ProfileForm from '../components/ProfileForm';
import { fetchMatches } from '../utils/MatchinLogic';

/**
 * DashboardPage component displays the user's dashboard, including their profile
 * and a list of potential matches. It also handles navigation within the dashboard
 * and user logout.
 * @param {Object} props - Component props.
 * @param {Object} props.user - The current authenticated user object.
 * @param {function(): void} props.onLogout - Callback function to handle user logout.
 */
const DashboardPage = ({ user, onLogout }) => {
  const [profile, setProfile] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState('dashboard');
  const [selectedMatch, setSelectedMatch] = useState(null);
  
  // New state for chat functionality
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // State for the new settings functionality
  const [settings, setSettings] = useState({
    minAge: 18,
    maxAge: 35,
    gender: 'All',
    maxDistance: 50,
    minVibeScore: 50,
    schedule: 'Night Owl',
    petFriendly: false,
  });

  /**
   * Fetches the current user's profile and all potential matches from Firestore.
   */
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

      // 2. Fetch matches using the new efficient logic
      const userVibes = userProfileData.vibes || [];
      const matchedProfiles = await fetchMatches(user, userVibes);
      setMatches(matchedProfiles);

    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

   useEffect(() => {
    if (!selectedMatch || !user) return;

    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const chatId = [user.uid, selectedMatch.id].sort().join('_');
    
    // Use the same path as the message sending function
    const messagesCollectionRef = collection(db, `artifacts/${appId}/chats/${chatId}/messages`);
    const q = query(messagesCollectionRef, orderBy('timestamp'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(msgs);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [selectedMatch, user]);

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

  // New function to handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !selectedMatch || !user) return;

    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const chatId = [user.uid, selectedMatch.id].sort().join('_');
    const messagesCollectionRef = collection(db, `artifacts/${appId}/chats/${chatId}/messages`);

    try {
      await addDoc(messagesCollectionRef, {
        text: newMessage,
        senderId: user.uid,
        timestamp: serverTimestamp(),
      });
      setNewMessage('');
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EFE0E5]">
        <LoadingSpinner />
      </div>
    );
  }

  const userDisplayName = profile?.name || user?.displayName || user?.email;
  const userAvatarUrl = profile?.imageUrl || `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'%3E%3Crect width='100%25' height='100%25' fill='%23A970FF'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='80' fill='%23FFFFFF'%3E${(userDisplayName ? userDisplayName.charAt(0).toUpperCase() : 'V')}%3C/text%3E%3C/svg%3E`;

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
                    <img src={userAvatarUrl} alt="User Avatar" className="w-full h-full object-cover rounded-full" />
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

    if (view === 'vibemate') {
      return (
        <div className="flex flex-1 p-8">
          <div className="flex flex-col w-1/3 bg-white rounded-l-xl shadow-lg border-r border-gray-200 p-4 space-y-4">
            <h3 className="text-2xl font-bold text-[#2A1E5C] mb-4">VibeMates</h3>
            {matches.length > 0 ? (
              matches.map((match) => (
                <button
                  key={match.id}
                  onClick={() => setSelectedMatch(match)}
                  className={`
                    flex items-center space-x-4 p-3 rounded-lg transition-colors duration-200
                    ${selectedMatch?.id === match.id ? 'bg-[#E8E3F5] text-[#2A1E5C] font-semibold' : 'hover:bg-gray-100'}
                  `}
                >
                  <img
                    src={match.imageUrl}
                    alt={match.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1 text-left">
                    <p className="font-semibold">{match.name}</p>
                    <span className="text-sm text-gray-500">Start a chat...</span>
                  </div>
                </button>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center">No VibeMates found.</p>
            )}
          </div>
          <div className="flex-1 bg-white rounded-r-xl shadow-lg p-6 flex flex-col">
            {selectedMatch ? (
              <>
                <div className="flex items-center space-x-4 border-b border-gray-200 pb-4 mb-4">
                  <img
                    src={selectedMatch.imageUrl}
                    alt={selectedMatch.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <h3 className="text-2xl font-bold">{selectedMatch.name}</h3>
                </div>
                {/* Chat messages will be displayed here */}
                <div className="flex-1 overflow-y-auto space-y-4">
                  {messages.length > 0 ? (
                    messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.senderId === user.uid ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-3 rounded-lg max-w-[70%] ${msg.senderId === user.uid ? 'bg-[#A970FF] text-white' : 'bg-gray-200 text-gray-800'}`}>
                          {msg.text}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500">Say hello!</p>
                  )}
                </div>
                <form onSubmit={handleSendMessage} className="flex items-center mt-4 pt-4 border-t border-gray-200">
                  <input
                    type="text"
                    placeholder={`Message ${selectedMatch.name}...`}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#A970FF]"
                  />
                  <button type="submit" className="ml-4 bg-[#A970FF] text-white p-3 rounded-full hover:bg-[#8B4DEB] transition-colors duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </form>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center text-center text-gray-500">
                <p className="text-xl">Select a VibeMate to start a conversation!</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (view === 'settings') {
      return (
        <div className="flex flex-1 items-center justify-center p-8 text-[#2A1E5C]">
          <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl mx-auto space-y-6">
            <h2 className="text-4xl font-bold text-center text-[#2A1E5C] mb-4">
              Personalize Your Vibe ⚙️
            </h2>
            <p className="text-center text-gray-600 mb-6">Adjust your preferences to find the best VibeMates for you!</p>

            {/* Age Range Setting */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-lg font-semibold text-[#2A1E5C]">Age Range 🎂</label>
                <span className="text-gray-500">{settings.minAge} - {settings.maxAge}</span>
              </div>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="18"
                  max="60"
                  value={settings.minAge}
                  onChange={(e) => setSettings({ ...settings, minAge: Number(e.target.value) })}
                  className="w-1/2 appearance-none h-2 bg-gray-200 rounded-lg outline-none slider-thumb-purple"
                />
                <input
                  type="range"
                  min="18"
                  max="60"
                  value={settings.maxAge}
                  onChange={(e) => setSettings({ ...settings, maxAge: Number(e.target.value) })}
                  className="w-1/2 appearance-none h-2 bg-gray-200 rounded-lg outline-none slider-thumb-purple"
                />
              </div>
            </div>

            {/* Gender Preference Setting */}
            <div>
              <label className="block text-lg font-semibold text-[#2A1E5C] mb-2">Gender Preference 🤔</label>
              <div className="flex flex-wrap gap-3">
                {['Male', 'Female', 'Non-binary', 'All'].map((gender) => (
                  <button
                    key={gender}
                    onClick={() => setSettings({ ...settings, gender })}
                    className={`
                      px-5 py-2 rounded-full text-sm font-medium transition duration-300 ease-in-out
                      ${settings.gender === gender
                        ? 'bg-[#A970FF] text-white shadow-md'
                        : 'bg-[#E8E3F5] text-[#2A1E5C] hover:bg-[#D6CCF1]'
                      }
                    `}
                  >
                    {gender}
                  </button>
                ))}
              </div>
            </div>

            {/* Distance Setting */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-lg font-semibold text-[#2A1E5C]">Max Distance 📍</label>
                <span className="text-gray-500">{settings.maxDistance} km</span>
              </div>
              <input
                type="range"
                min="1"
                max="200"
                value={settings.maxDistance}
                onChange={(e) => setSettings({ ...settings, maxDistance: Number(e.target.value) })}
                className="w-full appearance-none h-2 bg-gray-200 rounded-lg outline-none slider-thumb-purple"
              />
            </div>
            
            {/* Vibe Match Score Setting */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-lg font-semibold text-[#2A1E5C]">Min Vibe Match Score ✨</label>
                <span className="text-gray-500">{settings.minVibeScore}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={settings.minVibeScore}
                onChange={(e) => setSettings({ ...settings, minVibeScore: Number(e.target.value) })}
                className="w-full appearance-none h-2 bg-gray-200 rounded-lg outline-none slider-thumb-purple"
              />
            </div>
            
            {/* Schedule Preference Setting */}
            <div>
              <label className="block text-lg font-semibold text-[#2A1E5C] mb-2">Your Schedule ⏰</label>
              <div className="flex flex-wrap gap-3">
                {['Night Owl', 'Early Bird'].map((schedule) => (
                  <button
                    key={schedule}
                    onClick={() => setSettings({ ...settings, schedule })}
                    className={`
                      px-5 py-2 rounded-full text-sm font-medium transition duration-300 ease-in-out
                      ${settings.schedule === schedule
                        ? 'bg-[#A970FF] text-white shadow-md'
                        : 'bg-[#E8E3F5] text-[#2A1E5C] hover:bg-[#D6CCF1]'
                      }
                    `}
                  >
                    {schedule}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Pet Friendly Setting */}
            <div className="flex items-center justify-between">
              <label className="text-lg font-semibold text-[#2A1E5C]">Pet Friendly 🐾</label>
              <button
                onClick={() => setSettings({ ...settings, petFriendly: !settings.petFriendly })}
                className={`
                  relative w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300
                  ${settings.petFriendly ? 'bg-[#A970FF]' : 'bg-gray-300'}
                `}
              >
                <span
                  className={`
                    block w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300
                    ${settings.petFriendly ? 'translate-x-6' : 'translate-x-0'}
                  `}
                />
              </button>
            </div>

            {/* Save Button */}
            <button
              onClick={() => console.log('Saving settings:', settings)}
              className="w-full mt-8 bg-[#A970FF] text-white py-3 rounded-lg font-semibold hover:bg-[#8B4DEB] transition duration-300 shadow-md"
            >
              Save Settings
            </button>
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
              <button
                key={match.id}
                onClick={() => {
                  setView('vibemate');
                  setSelectedMatch(match);
                }}
                className="relative rounded-xl overflow-hidden shadow-md group text-left cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
              >
                <img
                  src={match.imageUrl}
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
              </button>
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
          <button
            onClick={() => setView('dashboard')}
            className="w-full flex items-center space-x-2 mb-8 text-left"
          >
            <div className="w-10 h-10 bg-[#A970FF] rounded-full flex items-center justify-center text-white font-bold text-xl">V</div>
            <h1 className="text-2xl font-bold">VibeTribe</h1>
          </button>
          <button
            onClick={() => setView('my-profile')}
            className="w-full flex items-center space-x-4 mb-8 text-left p-2 rounded-lg hover:bg-gray-700 transition-colors duration-200"
          >
            <div className="w-12 h-12 bg-gray-400 rounded-full overflow-hidden">
              <img src={userAvatarUrl} alt="User" className="w-full h-full object-cover" />
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
            <button onClick={() => setView('vibemate')} className="w-full flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors duration-200 text-left">
              <span className="mr-3">✉️</span> VibeMate
            </button>
            <button onClick={() => setView('settings')} className="w-full flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors duration-200 text-left">
              <span className="mr-3">⚙️</span> Settings
            </button>
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