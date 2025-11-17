import React, { useState, useEffect } from 'react';
import { getAuth, signOut, deleteUser } from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  setDoc, 
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import LoadingSpinner from '../components/LoadingSpinner';
import ProfileForm from '../components/ProfileForm';
import { fetchMatches, calculateDistance } from '../utils/MatchinLogic'; 

/**
 * DashboardPage component displays the user's dashboard, including their profile
 * and a list of potential matches. It also handles navigation within the dashboard
 * and user logout.
 * @param {Object} props - Component props.
 * @param {Object} props.user - The current authenticated user object.
 * @param {function(): void} props.onLogout - Callback function to handle user logout.
 * @param {string} [props.initialView='dashboard'] - The initial view to display on the dashboard.
 */
const DashboardPage = ({ user, onLogout, initialView = 'dashboard' }) => { // Accept initialView prop
  const [profile, setProfile] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState(initialView); // Initialize view with initialView prop
  console.log('Current view:', view); // Keep this for debugging
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [filterTrigger, setFilterTrigger] = useState(0); // New state to trigger filtering
  
  // State for chat functionality
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState(''); // Corrected: useState initialization

  // Constants for age range
  const MIN_AGE_LIMIT = 18;
  const MAX_AGE_LIMIT = 60;

  // State for settings and filters
  const [settings, setSettings] = useState({
    minAge: 18,
    maxAge: 35,
    gender: 'All', // 'All' means no filter for gender
    maxDistance: 50, // in km
    minVibeScore: 50,
    schedule: 'All', // 'All' means no filter for schedule
    petFriendly: false, // false means no filter for petFriendly, true means only petFriendly
  });

  /**
   * Handles requesting the user's current geolocation and saving it to Firestore.
   */
  const handleGetLocation = () => {
    setError(''); // Clear previous errors
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          
          try {
            const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
            const profileDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/profiles`, 'myProfile');
            await setDoc(profileDocRef, { location: newLocation }, { merge: true });
            setProfile(prevProfile => ({ ...prevProfile, location: newLocation })); // Update local state
            setError('Location saved successfully!'); // Use error state for success message
            setTimeout(() => setError(''), 3000); // Clear message after 3 seconds
          } catch (err) {
            console.error("Error saving location:", err);
            setError("Failed to save location. Please try again.");
          }
        },
        (err) => {
          setError(`Location access denied. Please enable location services for this site to use this feature.`);
          console.error("Geolocation error:", err);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  };

  /**
   * Handles stopping location sharing by removing location data from Firestore.
   */
  const handleStopSharingLocation = async () => {
    setError('');
    try {
      const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
      const profileDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/profiles`, 'myProfile');
      // Set location to null to remove it from the document
      await setDoc(profileDocRef, { location: null }, { merge: true });
      setProfile(prevProfile => ({ ...prevProfile, location: null })); // Update local state
      setError('Location sharing stopped successfully!');
      setTimeout(() => setError(''), 3000); // Clear message after 3 seconds
    } catch (err) {
      console.error("Error stopping location sharing:", err);
      setError("Failed to stop location sharing. Please try again.");
    }
  };

  /**
   * Handles deactivating the user's account.
   * This is a soft deletion that only marks the profile as inactive.
   */
  const handleDeactivateAccount = async () => {
    setError('');
    // IMPORTANT: Replaced window.confirm with a custom modal/message box in a real app
    const confirmation = window.confirm("Are you sure you want to deactivate your account? This will hide your profile from all VibeMates.");
    if (!confirmation) return;

    try {
      const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
      const profileDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/profiles`, 'myProfile');
      // Set isDeactivated flag to true instead of deleting the profile
      await setDoc(profileDocRef, { isDeactivated: true }, { merge: true });
      // After deactivating, log out the user and return to landing page
      onLogout();
      setError('Account deactivated successfully.');
      setTimeout(() => setError(''), 3000); // Clear message after 3 seconds
    } catch (err) {
      console.error("Error deactivating account:", err);
      setError("Failed to deactivate account. Please try again.");
    }
  };

  /**
   * Handles permanently deleting the user's account.
   * This removes both the Firebase auth account and all associated data.
   */
  const handleDeleteAccount = async () => {
    setError('');
    // IMPORTANT: Replaced window.confirm with a custom modal/message box in a real app
    const confirmation = window.confirm("WARNING: Are you absolutely sure you want to permanently delete your account? This action cannot be undone.");
    if (!confirmation) return;

    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
      const profileDocRef = doc(db, `artifacts/${appId}/users/${currentUser.uid}/profiles`, 'myProfile');

      // Delete the profile data first
      await deleteDoc(profileDocRef);
      
      // Then delete the user's authentication account
      await deleteUser(currentUser);

      // After deleting, log out the user and return to landing page
      onLogout();
      setError('Account and all associated data permanently deleted.');
      setTimeout(() => setError(''), 3000); // Clear message after 3 seconds
    } catch (err) {
      console.error("Error deleting account:", err);
      setError("Failed to delete account. Please try again.");
    }
  };


  /**
   * Fetches the current user's profile and all potential matches from Firestore.
   * Applies filters based on current settings.
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

      // Determine the filters to use for fetching matches
      // This will be the saved filterSettings from Firestore, or the default state if not present
      const filtersToApply = {
        minAge: userProfileData.filterSettings?.minAge !== undefined ? userProfileData.filterSettings.minAge : settings.minAge,
        maxAge: userProfileData.filterSettings?.maxAge !== undefined ? userProfileData.filterSettings.maxAge : settings.maxAge,
        gender: userProfileData.filterSettings?.gender || settings.gender,
        maxDistance: userProfileData.filterSettings?.maxDistance !== undefined ? userProfileData.filterSettings.maxDistance : settings.maxDistance,
        minVibeScore: userProfileData.filterSettings?.minVibeScore !== undefined ? userProfileData.filterSettings.minVibeScore : settings.minVibeScore,
        schedule: userProfileData.filterSettings?.schedule || settings.schedule,
        petFriendly: userProfileData.filterSettings?.petFriendly !== undefined ? userProfileData.filterSettings.petFriendly : settings.petFriendly,
      };

      // Update the component's settings state with the fetched or default filters
      setSettings(filtersToApply);

      let matchedProfiles = await fetchMatches(user, userProfileData.vibes || [], filtersToApply);
      
      // Post-fetch filtering for distance, as Firestore doesn't support geospatial queries directly
      if (userProfileData.location && filtersToApply.maxDistance > 0) {
        matchedProfiles = matchedProfiles.filter(match => {
          if (match.location) {
            const distance = calculateDistance(
              userProfileData.location.latitude,
              userProfileData.location.longitude,
              match.location.latitude,
              match.location.longitude
            );
            return distance <= filtersToApply.maxDistance;
          }
          // Changed to return true: Keep profiles that don't have location data
          return true; 
        });
      }

      // Calculate distance for each matched profile if current user has location
      const profilesWithDistance = matchedProfiles.map(match => {
        if (userProfileData.location && match.location) {
          const distance = calculateDistance(
            userProfileData.location.latitude,
            userProfileData.location.longitude,
            match.location.latitude,
            match.location.longitude
          );
          return { ...match, distance: distance.toFixed(1) }; // Round to 1 decimal place
        }
        return match;
      });
      setMatches(profilesWithDistance);

    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // New function to handle selecting a match
  const handleMatchClick = (match) => {
    console.log('handleMatchClick called with match:', match); // Debugging log
    setSelectedMatch(match);
    setMessages([]); // Clear messages when switching matches
    setNewMessage(''); // Clear new message input
    console.log('Setting view to vibemate'); // Debugging log
    setView('vibemate');
  };
  
  // New function to switch to chat view
  const handleChatClick = () => {
    setView('vibemate'); // This is already the correct view for the combined list/chat
  };
  // New function to switch to profile view
  const handleProfileViewClick = () => {
    setView('profile_view');
  }

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
    // Fetch profiles initially and whenever settings change
    fetchUserProfileAndMatches();
  }, [user, filterTrigger]); 

  // Function to manually trigger filtering
  const handleApplyFilters = async () => {
    // Save current settings to user profile in Firestore
    try {
      const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
      const profileDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/profiles`, 'myProfile');
      await setDoc(profileDocRef, { filterSettings: settings }, { merge: true });
      // Update the local profile state immediately after saving
      setProfile(prevProfile => ({ ...prevProfile, filterSettings: settings }));
      setError('Filters saved and applied successfully!');
      setTimeout(() => setError(''), 3000); // Clear success message after 3 seconds
    } catch (err) {
      console.error("Error saving filter settings:", err);
      setError("Failed to save filters. Please try again.");
    }
    setFilterTrigger(prev => prev + 1); // Trigger re-fetch with current settings
  };

  const handleLogout = () => {
    onLogout(); // This calls the handleLogout function defined in App.jsx
  };

  // New function to handle going back to the dashboard from edit profile
  const handleGoBackToDashboard = () => {
    setView('my-profile'); // Set view back to 'my-profile' or 'dashboard' as needed
    fetchUserProfileAndMatches(); // Re-fetch data to ensure it's up-to-date
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
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-page)]">
        <LoadingSpinner />
      </div>
    );
  }

  const userDisplayName = profile?.name || user?.displayName || user?.email;
  const userAvatarUrl = profile?.imageUrl || `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'%3E%3Crect width='100%25' height='100%25' fill='%23A970FF'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='80' fill='%23FFFFFF'%3E${(userDisplayName ? userDisplayName.charAt(0).toUpperCase() : 'V')}%3C/text%3E%3C/svg%3E`;

  const renderContent = () => {
    console.log('renderContent called. Current view state:', view); // Debugging log
    // Calculate derived min/max age for display in settings
    const displayedMinAge = settings.minAge;
    const displayedMaxAge = settings.maxAge;

    if (view === 'edit-profile') {
      return (
        <div className="p-8 bg-[var(--bg-page)]">
          <ProfileForm userId={user.uid} onProfileCreated={handleProfileUpdate} onGoBackToLanding={handleGoBackToDashboard} />
        </div>
      );
    }

    if (view === 'my-profile') {
      return (
        <div className="p-8">
          <div className="bg-[var(--panel)] p-8 rounded-xl shadow-lg w-full max-w-2xl mx-auto text-[var(--text-strong)]">
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
                          <span key={index} className="bg-[var(--accent)] text-white px-3 py-1 rounded-full text-sm shadow">
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
                          <span key={index} className="bg-[var(--accent)] text-white px-3 py-1 rounded-full text-sm shadow">
                            {mood}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-500">No moods selected.</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xl font-bold mb-2">Basic Info</h4>
                    <p className="text-gray-700">Age: {profile.age || 'N/A'}</p>
                    <p className="text-700">Gender: {profile.gender || 'N/A'}</p>
                    <p className="text-gray-700">City: {profile.city || 'N/A'}</p> 
                    <p className="text-gray-700">Schedule: {profile.schedule || 'N/A'}</p>
                    <p className="text-gray-700">Pet Friendly: {profile.petFriendly ? 'Yes' : 'No'}</p>
                  </div>

                </div>

                <button
                  onClick={() => setView('edit-profile')}
                  className="w-full mt-8 bg-[var(--accent-2)] text-white py-3 rounded-lg font-semibold hover:bg-[#6A39B1] transition duration-300 shadow-md"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => setView('dashboard')}
                  className="w-full mt-4 bg-[var(--muted-2)] text-[var(--text-strong)] py-3 rounded-lg font-semibold hover:bg-[var(--soft-lilac)] transition duration-300"
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
      const matchProfile = selectedMatch;
      const matchAvatarUrl = matchProfile?.imageUrl || `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'%3E%3Crect width='100%25' height='100%25' fill='%23A970FF'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='80' fill='%23FFFFFF'%3E${(matchProfile?.name ? matchProfile.name.charAt(0).toUpperCase() : 'V')}%3C/text%3E%3C/svg%3E`;

      return (
        <div className="flex flex-1 p-8">
          {/* Left panel: Match List */}
          <div className="flex flex-col w-1/3 bg-[var(--panel)] rounded-l-xl shadow-lg border-r border-[var(--muted-2)] p-4 space-y-4">
            <h3 className="text-2xl font-bold text-[var(--text-strong)] mb-4">VibeMates</h3>
            {matches.length > 0 ? (
              matches.map((match) => (
                <button
                  key={match.id}
                  onClick={() => handleMatchClick(match)}
                  className={`
                    flex items-center space-x-4 p-3 rounded-lg transition-colors duration-200
                    ${selectedMatch?.id === match.id ? 'bg-[var(--muted-1)] text-[var(--text-strong)] font-semibold' : 'hover:bg-[var(--muted-2)]'}
                  `}
                >
                  <img
                    src={match.imageUrl}
                    alt={match.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1 text-left">
                    <p className="font-semibold">{match.name}</p>
                    <span className="text-sm text-gray-500">
                      {match.distance ? `${match.distance} km away` : 'Start a chat...'}
                    </span>
                  </div>
                </button>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center">No VibeMates found.</p>
            )}
          </div>

          {/* Right panel: Profile Details and Chat Interface */}
          <div className="flex-1 bg-[var(--panel)] rounded-r-xl shadow-lg p-6 flex flex-col">
            {selectedMatch ? (
              <>
                <div className="flex-grow overflow-y-auto space-y-4">
                  <div className="flex items-center space-x-4 border-b border-[var(--muted-2)] pb-4 mb-4">
                    <img
                      src={matchAvatarUrl}
                      alt={selectedMatch.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <h3 className="text-2xl font-bold">{selectedMatch.name}</h3>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-4">
                    {messages.length > 0 ? (
                      messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.senderId === user.uid ? 'justify-end' : 'justify-start'}`}>
                          <div className={`p-3 rounded-lg max-w-[70%] ${msg.senderId === user.uid ? 'bg-[var(--accent)] text-white' : 'bg-[var(--muted-2)] text-[var(--text-strong)]'}`}>
                            {msg.text}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-500">Say hello!</p>
                    )}
                  </div>
                </div>

                <form onSubmit={handleSendMessage} className="flex items-center mt-4 pt-4 border-t border-[var(--muted-2)]">
                  <input
                    type="text"
                    placeholder={`Message ${selectedMatch.name}...`}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-full bg-[var(--muted-2)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  />
                  <button type="submit" className="ml-4 bg-[var(--accent)] text-white p-3 rounded-full hover:bg-[var(--accent-2)] transition-colors duration-200">
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
        <div className="flex flex-1 items-center justify-center p-8 text-[var(--text-strong)]">
          <div className="bg-[var(--panel)] p-8 rounded-xl shadow-lg w-full max-w-2xl mx-auto space-y-6">
            <h2 className="text-4xl font-bold text-center text-[var(--text-strong)] mb-4">
              Personalize Your Vibe ⚙️
            </h2>
            {/* Display error/success messages here */}
            {error && (
              <p className={`text-center text-lg font-semibold ${error.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
                {error}
              </p>
            )}
            {/* Age Range Setting - Single Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-lg font-semibold text-[var(--text-strong)]">Age Range 🎂</label>
                <span className="text-gray-500">{settings.minAge} - {settings.maxAge}</span>
              </div>
              <div className="relative h-2 bg-gray-200 rounded-lg">
                <input
                  type="range"
                  min={MIN_AGE_LIMIT}
                  max={MAX_AGE_LIMIT}
                  value={settings.minAge}
                  onChange={(e) => {
                    const newMinAge = Number(e.target.value);
                    setSettings(prevSettings => ({
                      ...prevSettings,
                      minAge: Math.min(newMinAge, prevSettings.maxAge - 1), // Ensure min is always less than max
                    }));
                  }}
                  className="absolute w-full appearance-none h-2 bg-transparent rounded-lg outline-none slider-thumb-purple z-20"
                  style={{
                    background: 'none',
                    pointerEvents: 'auto',
                  }}
                />
                <input
                  type="range"
                  min={MIN_AGE_LIMIT}
                  max={MAX_AGE_LIMIT}
                  value={settings.maxAge}
                  onChange={(e) => {
                    const newMaxAge = Number(e.target.value);
                    setSettings(prevSettings => ({
                      ...prevSettings,
                      maxAge: Math.max(newMaxAge, prevSettings.minAge + 1), // Ensure max is always greater than min
                    }));
                  }}
                  className="absolute w-full appearance-none h-2 bg-transparent rounded-lg outline-none slider-thumb-purple z-20"
                  style={{
                    background: 'none',
                    pointerEvents: 'auto',
                  }}
                />
                <div
                  className="absolute h-full rounded-lg z-10"
                  style={{
                    backgroundColor: 'var(--accent)',
                    left: `${((settings.minAge - MIN_AGE_LIMIT) / (MAX_AGE_LIMIT - MIN_AGE_LIMIT)) * 100}%`,
                    width: `${((settings.maxAge - settings.minAge) / (MAX_AGE_LIMIT - MIN_AGE_LIMIT)) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Gender Preference Setting */}
            <div>
              <label className="block text-lg font-semibold text-[var(--text-strong)] mb-2">Gender Preference 🤔</label>
              <div className="flex flex-wrap gap-3">
                {['Male', 'Female', 'Non-binary', 'All'].map((gender) => (
                  <button
                    key={gender}
                    onClick={() => setSettings({ ...settings, gender })}
                    className={`
                      px-5 py-2 rounded-full text-sm font-medium transition duration-300 ease-in-out
                      ${settings.gender === gender
                        ? 'bg-[var(--accent)] text-white shadow-md'
                        : 'bg-[var(--muted-1)] text-[var(--text-strong)] hover:bg-[var(--muted-2)]'
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
                <label className="text-lg font-semibold text-[var(--text-strong)]">Max Distance 📍</label>
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
                <label className="text-lg font-semibold text-[var(--text-strong)]">Min Vibe Match Score ✨</label>
                <span className="text-500">{settings.minVibeScore}%</span>
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
              <label className="block text-lg font-semibold text-[var(--text-strong)] mb-2">Your Schedule ⏰</label>
              <div className="flex flex-wrap gap-3">
                {['Night Owl', 'Early Bird', 'All'].map((schedule) => (
                  <button
                    key={schedule}
                    onClick={() => setSettings({ ...settings, schedule })}
                    className={`
                      px-5 py-2 rounded-full text-sm font-medium transition duration-300 ease-in-out
                      ${settings.schedule === schedule
                        ? 'bg-[var(--accent)] text-white shadow-md'
                        : 'bg-[var(--muted-1)] text-[var(--text-strong)] hover:bg-[var(--muted-2)]'
                      }
                    `}
                  >
                    {schedule === 'All' ? 'All Time' : schedule}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Pet Friendly Setting */}
            <div className="flex items-center justify-between">
              <label className="text-lg font-semibold text-[var(--text-strong)]">Pet Friendly 🐾</label>
              <button
                onClick={() => setSettings({ ...settings, petFriendly: !settings.petFriendly })}
                className={`
                  relative w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300
                  ${settings.petFriendly ? 'bg-[var(--accent)]' : 'bg-gray-300'}
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

            {/* Location Sharing Controls */}
            <div className="space-y-4">
              <h4 className="text-xl font-bold text-[var(--text-strong)] mb-2">Location Sharing</h4>
              {profile?.location ? (
                <>
                  <p className="text-sm text-gray-500">
                    Location sharing is ON. Matches can see your approximate distance.
                  </p>
                  <p className="text-sm text-gray-500">
                    Your current coordinates: Latitude {profile.location.latitude.toFixed(4)}, Longitude {profile.location.longitude.toFixed(4)}
                  </p>
                  <button
                    onClick={handleStopSharingLocation}
                    className="w-full bg-[var(--muted-2)] text-[var(--text-strong)] py-3 rounded-lg font-semibold hover:bg-[var(--soft-lilac)] transition duration-300"
                  >
                    Stop Sharing Location
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-500">
                    Location sharing is OFF. Enable it to see the distance to your matches.
                  </p>
                  <button
                    onClick={handleGetLocation}
                    className="w-full bg-[var(--accent)] text-white py-3 rounded-lg font-semibold hover:bg-[var(--accent-2)] transition duration-300 shadow-md"
                  >
                    Turn On Location Sharing
                  </button>
                </>
              )}
            </div>

            {/* Account Management Options */}
            <div className="space-y-3 pt-6 mt-6 border-t border-[var(--muted-2)]">
              <h4 className="text-lg font-bold text-[var(--text-strong)] mb-3">Account Actions</h4>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-2">
                <p className="text-xs text-yellow-700">
                  Deactivating your account will hide your profile from all other users.
                </p>
              </div>
              <button
                onClick={handleDeactivateAccount}
                className="w-full bg-yellow-400 text-yellow-900 py-2 px-4 rounded-lg font-medium hover:bg-yellow-500 transition duration-300 text-sm"
              >
                Deactivate Account
              </button>

              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3 mb-2">
                <p className="text-xs text-red-700">
                  Deleting your account is permanent and cannot be undone.
                </p>
              </div>
              <button
                onClick={handleDeleteAccount}
                className="w-full bg-red-400 text-red-900 py-2 px-4 rounded-lg font-medium hover:bg-red-500 transition duration-300 text-sm"
              >
                Permanently Delete Account
              </button>
            </div>

            {/* Save Button */}
            <button
              onClick={handleApplyFilters}
              className="w-full mt-8 bg-[var(--accent)] text-white py-2 px-4 rounded-lg font-medium hover:bg-[var(--accent-2)] transition duration-300 text-sm"
            >
              Save Settings
            </button>
          </div>
        </div>
      );
    }

    // New: Profile View for selected match
    if (view === 'profile_view') {
        if (!selectedMatch) {
            return (
                <div className="p-8 text-center text-xl text-gray-500">
                    No profile selected.
                </div>
            );
        }
        const matchAvatarUrl = selectedMatch?.imageUrl || `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'%3E%3Crect width='100%25' height='100%25' fill='%23A970FF'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='80' fill='%23FFFFFF'%3E${(selectedMatch.name ? selectedMatch.name.charAt(0).toUpperCase() : 'V')}%3C/text%3E%3C/svg%3E`;

        return (
            <div className="p-8">
                <div className="bg-[var(--panel)] p-8 rounded-xl shadow-lg w-full max-w-2xl mx-auto text-[var(--text-strong)]">
                    <h2 className="text-4xl font-bold mb-4 text-center">{selectedMatch.name}'s Profile</h2>
                    {/* Replaced Fragment with a div */}
                    <div> 
                        <div className="flex flex-col items-center mb-6">
                            <div className="w-24 h-24 bg-gray-300 rounded-full mb-4">
                                <img src={matchAvatarUrl} alt="Match Avatar" className="w-full h-full object-cover rounded-full" />
                            </div>
                            <h3 className="text-2xl font-semibold">{selectedMatch.name || 'Anonymous User'}</h3>
                            <p className="text-gray-500">{selectedMatch.bio || 'No bio provided.'}</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h4 className="text-xl font-bold mb-2">Vibes</h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedMatch.vibes && selectedMatch.vibes.length > 0 ? (
                                        selectedMatch.vibes.map((vibe, index) => (
                                            <span key={index} className="bg-[var(--accent)] text-white px-3 py-1 rounded-full text-sm shadow">
                                                {vibe}
                                            </span>
                                        ))
                                    ) : (
                                        <p className="text-gray-500">No vibes selected.</p>
                                    )}
                                </div>
                            </div>
                            
                            <div>
                                <h4 className="text-xl font-bold mb-2">Moods</h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedMatch.moods && selectedMatch.moods.length > 0 ? (
                                        selectedMatch.moods.map((mood, index) => (
                                            <span key={index} className="bg-[var(--accent)] text-white px-3 py-1 rounded-full text-sm shadow">
                                                {mood}
                                            </span>
                                        ))
                                    ) : (
                                        <p className="text-gray-500">No moods selected.</p>
                                    )}
                                </div>
                            </div>
                            
                            <div>
                                <h4 className="text-xl font-bold mb-2">Basic Info</h4>
                                <p className="text-gray-700">Age: {selectedMatch.age || 'N/A'}</p>
                                <p className="text-700">Gender: {selectedMatch.gender || 'N/A'}</p>
                                <p className="text-gray-700">City: {selectedMatch.city || 'N/A'}</p> 
                                <p className="text-gray-700">Schedule: {selectedMatch.schedule || 'N/A'}</p>
                                <p className="text-gray-700">Pet Friendly: {selectedMatch.petFriendly ? 'Yes' : 'No'}</p>
                                {selectedMatch.distance && (
                                    <p className="text-gray-700">Distance: {selectedMatch.distance} km away</p>
                                )}
                            </div>
                        </div>

                        {/* New "Start Chat" button */}
                        <button
                          onClick={() => handleMatchClick(selectedMatch)}
                          className="w-full mt-8 bg-[var(--accent)] text-white py-3 rounded-lg font-semibold hover:bg-[var(--accent-2)] transition duration-300 shadow-md"
                        >
                          Start Chat
                        </button>

                        <button
                          onClick={() => setView('dashboard')}
                          className="w-full mt-4 bg-[var(--muted-2)] text-[var(--text-strong)] py-3 rounded-lg font-semibold hover:bg-[var(--soft-lilac)] transition duration-300"
                        >
                          Back to Dashboard
                        </button>
                    </div> {/* Closing div for the content previously in Fragment */}
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
            {/* Removed search input */}
            <button onClick={() => setView('settings')} className="px-4 py-2 bg-[var(--muted-1)] rounded-lg text-[var(--text-strong)] hover:bg-[var(--muted-2)] transition-colors duration-200">
              Filters
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {matches.length > 0 ? (
            matches.map((match) => (
              <div
                key={match.id}
                className={`
                  relative rounded-xl overflow-hidden shadow-md group text-left cursor-pointer transition-transform duration-300 hover:scale-[1.02]
                `}
              >
                <img
                  src={match.imageUrl}
                  alt={match.name}
                  className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex flex-col justify-end">
                  <h3 className="text-xl font-bold text-white mb-1">{match.name}</h3>
                  {match.distance && (
                    <span className="text-sm text-gray-300">{match.distance} km away</span>
                  )}
                </div>
                {/* The "Visit Profile" button now correctly handles the navigation */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent the parent div's onClick from firing
                    setSelectedMatch(match);
                    setView('profile_view'); // Change view to 'profile_view'
                  }}
                  className="absolute bottom-4 right-4 text-white bg-[var(--accent)] px-4 py-2 rounded-full font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  Visit Profile
                </button>
              </div>
            ))
          ) : (
            <p className="text-center text-xl text-gray-500 col-span-full">
              No matches found. Adjust your filters in settings!
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-[var(--bg-page)] text-[var(--text-strong)]">
      <style>
        {`
          .slider-thumb-purple::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 16px;
            height: 16px;
            background-color: var(--accent);
            border-radius: 50%;
            cursor: pointer;
            border: none;
            margin-top: -6px;
            box-shadow: 0 0 0 4px rgba(169, 112, 255, 0.3);
          }
          .slider-thumb-purple::-moz-range-thumb {
            width: 16px;
            height: 16px;
            background-color: var(--accent);
            border-radius: 50%;
            cursor: pointer;
            border: none;
            box-shadow: 0 0 0 4px rgba(169, 112, 255, 0.3);
          }
          .slider-thumb-purple::-webkit-slider-runnable-track {
            height: 4px;
            background: var(--muted-2);
            border-radius: 4px;
          }
          .slider-thumb-purple::-moz-range-track {
            height: 4px;
            background: var(--muted-2);
            border-radius: 4px;
          }
        `}
      </style>
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-[var(--soft-lilac)] to-[var(--muted-2)] text-[var(--text-strong)] p-6 shadow-xl flex flex-col justify-between">
        <div>
          <button
            onClick={() => setView('dashboard')}
            className="w-full flex items-center space-x-2 mb-8 text-left"
          >
            <div className="w-10 h-10 bg-[var(--accent)] rounded-full flex items-center justify-center text-white font-bold text-xl">V</div>
            <h1 className="text-2xl font-bold">VibeTribe</h1>
          </button>
          <button
            onClick={() => setView('my-profile')}
            className="w-full flex items-center space-x-4 mb-8 text-left p-2 rounded-lg hover:bg-[var(--accent)] hover:text-white transition-colors duration-200"
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
            <button onClick={() => setView('dashboard')} className="w-full flex items-center p-3 rounded-lg hover:bg-[var(--accent)] hover:text-white transition-colors duration-200 text-left">
              <span className="mr-3">���</span> Discover
            </button>
            <button onClick={() => setView('vibemate')} className="w-full flex items-center p-3 rounded-lg hover:bg-[var(--accent)] hover:text-white transition-colors duration-200 text-left">
              <span className="mr-3">✉️</span> VibeMate
            </button>
            <button onClick={() => setView('settings')} className="w-full flex items-center p-3 rounded-lg hover:bg-[var(--accent)] hover:text-white transition-colors duration-200 text-left">
              <span className="mr-3">⚙️</span> Settings
            </button>
          </nav>
        </div>
        <button
          onClick={handleLogout}
          className="w-full bg-[var(--accent)] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[var(--accent-2)] transition duration-300 shadow-md"
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
