// components/ProfileForm.jsx
import React, { useState, useEffect } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, storage } from '../firebase/firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import VibeMoodSelector from './VibeMoodSelector';
import LoadingSpinner from './LoadingSpinner';

const ProfileForm = ({ userId, onProfileCreated, onGoBackToLanding }) => { // Added onGoBackToLanding prop
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [selectedVibes, setSelectedVibes] = useState([]);
  const [selectedMoods, setSelectedMoods] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  // Removed location state from here as it's handled in DashboardPage now

  // New states for additional profile details
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [city, setCity] = useState(''); // New state for city
  const [schedule, setSchedule] = useState('');
  const [petFriendly, setPetFriendly] = useState(false);

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

  const genderOptions = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];
  const scheduleOptions = ['Early Bird', 'Night Owl', 'Flexible'];


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
          setCurrentImageUrl(data.imageUrl || null);
          // Load new profile fields
          setAge(data.age || '');
          setGender(data.gender || '');
          setCity(data.city || ''); // Load existing city
          setSchedule(data.schedule || '');
          setPetFriendly(data.petFriendly || false);
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
      
      let imageUrl = currentImageUrl;
      if (imageFile) {
        const storageRef = ref(storage, `profiles/${userId}/${imageFile.name}`);
        await uploadBytes(storageRef, imageFile); 
        imageUrl = await getDownloadURL(storageRef);
      }

      const profileData = {
        name,
        bio,
        vibes: selectedVibes,
        moods: selectedMoods,
        userId: userId,
        imageUrl: imageUrl,
        // Add new profile fields to data saved to Firestore
        age: Number(age), // Ensure age is stored as a number
        gender,
        city, // Save city data
        schedule,
        petFriendly,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(profileDocRef, profileData, { merge: true });

      setMessage('Profile saved successfully!');
      onProfileCreated(); // Call onProfileCreated to navigate to Dashboard
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

        <div>
          <label htmlFor="image" className="block text-[#2A1E5C] text-lg font-semibold mb-2">
            Profile Picture:
          </label>
          <input
            type="file"
            id="image"
            accept="image/*"
            className="w-full text-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#E8E3F5] file:text-[#2A1E5C] hover:file:bg-[#D6CCF1]"
            onChange={(e) => setImageFile(e.target.files[0])}
          />
        </div>

        {/* New: Age Input */}
        <div>
          <label htmlFor="age" className="block text-[#2A1E5C] text-lg font-semibold mb-2">
            Your Age:
          </label>
          <input
            type="number"
            id="age"
            className="w-full px-4 py-3 border border-[#A970FF] rounded-lg focus:ring-2 focus:ring-[#A970FF] focus:border-transparent transition duration-200 text-lg"
            placeholder="e.g., 25"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            min="18" // Assuming minimum age for dating app
            max="99"
            required
          />
        </div>

        {/* New: Gender Selection */}
        <div>
          <label htmlFor="gender" className="block text-[#2A1E5C] text-lg font-semibold mb-2">
            Your Gender:
          </label>
          <select
            id="gender"
            className="w-full px-4 py-3 border border-[#A970FF] rounded-lg focus:ring-2 focus:ring-[#A970FF] focus:border-transparent transition duration-200 text-lg bg-white"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            required
          >
            <option value="">Select Gender</option>
            {genderOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        {/* New: City Input */}
        <div>
          <label htmlFor="city" className="block text-[#2A1E5C] text-lg font-semibold mb-2">
            Your City:
          </label>
          <input
            type="text"
            id="city"
            className="w-full px-4 py-3 border border-[#A970FF] rounded-lg focus:ring-2 focus:ring-[#A970FF] focus:border-transparent transition duration-200 text-lg"
            placeholder="e.g., New York"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
          />
        </div>

        {/* New: Schedule Selection */}
        <div>
          <label htmlFor="schedule" className="block text-[#2A1E5C] text-lg font-semibold mb-2">
            Your Typical Schedule:
          </label>
          <select
            id="schedule"
            className="w-full px-4 py-3 border border-[#A970FF] rounded-lg focus:ring-2 focus:ring-[#A970FF] focus:border-transparent transition duration-200 text-lg bg-white"
            value={schedule}
            onChange={(e) => setSchedule(e.target.value)}
          >
            <option value="">Select Schedule</option>
            {scheduleOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        {/* New: Pet Friendly Toggle */}
        <div className="flex items-center justify-between">
          <label htmlFor="petFriendly" className="text-lg font-semibold text-[#2A1E5C]">
            Pet Friendly? 🐾
          </label>
          <button
            type="button"
            onClick={() => setPetFriendly(!petFriendly)}
            className={`
              relative w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300
              ${petFriendly ? 'bg-[#A970FF]' : 'bg-gray-300'}
            `}
          >
            <span
              className={`
                block w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300
                ${petFriendly ? 'translate-x-6' : 'translate-x-0'}
              `}
            />
          </button>
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

      {/* Changed to "Back to Home" and calls onGoBackToLanding */}
      <button
        onClick={onGoBackToLanding} // This will trigger navigation back to the LandingPage
        className="w-full mt-4 bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-400 transition duration-300"
      >
        Back to Home
      </button>
    </div>
  );
};

export default ProfileForm;
