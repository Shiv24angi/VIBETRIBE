// pages/ProfileCreationPage.jsx
import React from 'react';
import ProfileForm from '../components/ProfileForm';

/**
 * ProfileCreationPage component is where users create or update their profile
 * after successfully logging in.
 * The color scheme is updated to match the application's theme.
 * @param {Object} props - Component props.
 * @param {string} props.userId - The Firebase User ID of the current user.
 * @param {function(): void} props.onProfileComplete - Callback function after profile is successfully saved.
 */
const ProfileCreationPage = ({ userId, onProfileComplete }) => {
  return (
    // Main background updated to Burgundy
    <div className="min-h-screen bg-[#800020] flex flex-col items-center justify-center p-4 font-inter">
      <ProfileForm userId={userId} onProfileCreated={onProfileComplete} />
    </div>
  );
};

export default ProfileCreationPage;