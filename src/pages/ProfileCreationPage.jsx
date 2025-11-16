import React from 'react';
import ProfileForm from '../components/ProfileForm';

/**
 * ProfileCreationPage component is where users create or update their profile
 * after successfully logging in.
 * The background is updated to match the dreamy gradient theme.
 * * @param {Object} props - Component props.
 * @param {string} props.userId - The Firebase User ID of the current user.
 * @param {function(): void} props.onProfileComplete - Callback function after profile is successfully saved.
 * @param {function(): void} props.onGoBackToLanding - Callback function to navigate back to the LandingPage.
 */
const ProfileCreationPage = ({ userId, onProfileComplete, onGoBackToLanding }) => {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 font-inter"
      style={{
        background: 'linear-gradient(135deg, #E0B8F0 0%, #D6CCF1 25%, #A970FF 50%, #8B4DEB 75%, #6A39B1 100%)',
      }}
    >
      {/* Pass onGoBackToLanding to ProfileForm */}
      <ProfileForm userId={userId} onProfileCreated={onProfileComplete} onGoBackToLanding={onGoBackToLanding} />
    </div>
  );
};

export default ProfileCreationPage;
