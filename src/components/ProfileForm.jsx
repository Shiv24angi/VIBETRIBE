import React, { useState, useEffect } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import VibeMoodSelector from './VibeMoodSelector';
import LoadingSpinner from './LoadingSpinner';

const ProfileForm = ({ userId, onProfileCreated }) => {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [selectedVibes, setSelectedVibes] = useState([]);
  const [selectedMoods, setSelectedMoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

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

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      try {
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
      const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
      const profileDocRef = doc(db, `artifacts/${appId}/users/${userId}/profiles`, 'myProfile');

      await setDoc(profileDocRef, {
        name,
        bio,
        vibes: selectedVibes,
        moods: selectedMoods,
        userId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, { merge: true });

      setMessage('Profile saved successfully!');
      onProfileCreated();
    } catch (err) {
      console.error("Error saving profile:", err);
      setError("Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="bg-[#FFF3F6] p-8 rounded-xl shadow-lg w-full max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-center text-[#2A1E5C] mb-8">
        Create Your VibeTribe Profile
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-[#2A1E5C] text-lg font-semibold mb-2">
            Your Name:
          </label>
          <input
            type="text"
            id="name"
            className="w-full px-4 py-3 border border-[#A970FF] rounded-lg focus:ring-2 focus:ring-[#A970FF] focus:border-transparent transition duration-200 text-lg"
            placeholder="harshit"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="bio" className="block text-[#2A1E5C] text-lg font-semibold mb-2">
            Short Bio:
          </label>
          <textarea
            id="bio"
            rows="4"
            className="w-full px-4 py-3 border border-[#A970FF] rounded-lg focus:ring-2 focus:ring-[#A970FF] focus:border-transparent transition duration-200 text-lg resize-y"
            placeholder="hello fam"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          ></textarea>
        </div>

        <VibeMoodSelector
          title="Select Your Vibes"
          options={vibeOptions}
          selectedOptions={selectedVibes}
          onSelectionChange={setSelectedVibes}
        />

        <VibeMoodSelector
          title="Select Your Moods"
          options={moodOptions}
          selectedOptions={selectedMoods}
          onSelectionChange={setSelectedMoods}
        />

        <button
          type="submit"
          className="w-full bg-[#A970FF] text-white py-4 rounded-lg font-semibold text-xl hover:bg-[#8B4DEB] transition duration-300 shadow-md"
        >
          Save Profile
        </button>
      </form>

      {message && <p className="text-green-600 text-center mt-6 text-lg">{message}</p>}
      {error && <p className="text-red-600 text-center mt-6 text-lg">{error}</p>}
    </div>
  );
};

export default ProfileForm;
