// components/ProfileForm.jsx
import React, { useState, useEffect } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import VibeMoodSelector from './VibeMoodSelector';
import LoadingSpinner from './LoadingSpinner'; // Assuming you'll create this

/**
 * ProfileForm component allows users to create or update their profile.
 * It collects name, short bio, selected vibes, and selected moods.
 * Data is saved to Firestore under a 'profiles' collection.
 * @param {Object} props - Component props.
 * @param {string} props.userId - The Firebase User ID of the current user.
 * @param {function(): void} props.onProfileCreated - Callback function after profile is successfully saved.
 */
const ProfileForm = ({ userId, onProfileCreated }) => {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [selectedVibes, setSelectedVibes] = useState([]);
  const [selectedMoods, setSelectedMoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Predefined lists for vibes and moods based on the reference image
  const vibeOptions = [
    'Chill', 'Energetic', 'Creative', 'Analytical', 'Adventurous', 'Calm',
    'Passionate', 'Curious', 'Spontaneous', 'Thoughtful', 'Optimistic',
    'Playful', 'Grounded', 'Dreamy', 'Focused'
  ];

  const moodOptions = [
    'Happy', 'Relaxed', 'Excited', 'Reflective', 'Motivated', 'Peaceful',
    'Inspired', 'Content', 'Joyful', 'Calm', 'Hopeful', 'Amused',
    'Enthusiastic', 'Serene', 'Vibrant'
  ];

  // Fetch existing profile data when the component mounts or userId changes
  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      try {
        // Construct the Firestore document path for private user data
        // Using __app_id for multi-tenancy and user-specific data
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        const profileDocRef = doc(db, `artifacts/${appId}/users/${userId}/profiles`, 'myProfile');
        const docSnap = await getDoc(profileDocRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name || '');
          setBio(data.bio || '');
          setSelectedVibes(data.vibes || []);
          setSelectedMoods(data.moods || []);
          setMessage('Profile loaded successfully!');
        } else {
          setMessage('Welcome! Please create your profile.');
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  /**
   * Handles the form submission to save profile data to Firestore.
   * @param {Event} e - The form submission event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    if (!userId) {
      setError("User not authenticated. Please log in.");
      setLoading(false);
      return;
    }

    try {
      // Construct the Firestore document path for private user data
      const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
      const profileDocRef = doc(db, `artifacts/${appId}/users/${userId}/profiles`, 'myProfile');

      // Save the profile data
      await setDoc(profileDocRef, {
        name,
        bio,
        vibes: selectedVibes,
        moods: selectedMoods,
        userId: userId, // Store userId for easier querying if needed
        createdAt: new Date(),
        updatedAt: new Date(),
      }, { merge: true }); // Use merge: true to update existing fields without overwriting the entire document

      setMessage('Profile saved successfully!');
      onProfileCreated(); // Notify parent component that profile is created/updated
    } catch (err) {
      console.error("Error saving profile:", err);
      setError("Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    // Main container background updated to Beige
    <div className="bg-[#F5F5DC] p-8 rounded-xl shadow-lg w-full max-w-2xl mx-auto">
      {/* Heading text color updated to dark burgundy/brown */}
      <h2 className="text-3xl font-bold text-center text-[#4A0404] mb-8">Create Your VibeTribe Profile</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Input */}
        <div>
          {/* Label text color updated to dark burgundy/brown */}
          <label htmlFor="name" className="block text-[#4A0404] text-lg font-semibold mb-2">
            Your Name:
          </label>
          <input
            type="text"
            id="name"
            // Input border and focus ring colors updated to Burgundy
            className="w-full px-4 py-3 border border-[#800020] rounded-lg focus:ring-2 focus:ring-[#800020] focus:border-transparent transition duration-200 text-lg"
            placeholder="harshit"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Short Bio Input */}
        <div>
          {/* Label text color updated to dark burgundy/brown */}
          <label htmlFor="bio" className="block text-[#4A0404] text-lg font-semibold mb-2">
            Short Bio:
          </label>
          <textarea
            id="bio"
            rows="4"
            // Textarea border and focus ring colors updated to Burgundy
            className="w-full px-4 py-3 border border-[#800020] rounded-lg focus:ring-2 focus:ring-[#800020] focus:border-transparent transition duration-200 text-lg resize-y"
            placeholder="hello fam"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          ></textarea>
        </div>

        {/* Vibe Selection - Assuming VibeMoodSelector will also be styled to match */}
        <VibeMoodSelector
          title="Select Your Vibes"
          options={vibeOptions}
          selectedOptions={selectedVibes}
          onSelectionChange={setSelectedVibes}
        />

        {/* Mood Selection - Assuming VibeMoodSelector will also be styled to match */}
        <VibeMoodSelector
          title="Select Your Moods"
          options={moodOptions}
          selectedOptions={selectedMoods}
          onSelectionChange={setSelectedMoods}
        />

        <button
          type="submit"
          // Button background and hover colors updated to Burgundy
          className="w-full bg-[#800020] text-white py-4 rounded-lg font-semibold text-xl hover:bg-[#6A001A] transition duration-300 shadow-md"
        >
          Save Profile
        </button>
      </form>

      {/* Message and error text colors remain distinct for clear feedback */}
      {message && <p className="text-green-600 text-center mt-6 text-lg">{message}</p>}
      {error && <p className="text-red-600 text-center mt-6 text-lg">{error}</p>}
    </div>
  );
};

export default ProfileForm;