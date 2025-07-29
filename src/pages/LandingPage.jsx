// pages/LandingPage.jsx
import React from 'react';
import AuthForm from '../components/AuthForm';

/**
 * LandingPage component serves as the entry point for the VibeTribe app.
 * It introduces the app concept and provides the AuthForm for login/signup.
 * The color scheme is updated to match the application's theme.
 * @param {Object} props - Component props.
 * @param {function(): void} props.onAuthSuccess - Callback function when authentication is successful.
 */
const LandingPage = ({ onAuthSuccess }) => {
  return (
    // Main background updated to Burgundy
    <div className="min-h-screen bg-[#800020] flex flex-col items-center justify-center p-4 font-inter">
      <div className="text-center text-white mb-12"> {/* Text color updated to white for contrast */}
        <h1 className="text-6xl font-extrabold leading-tight mb-4 drop-shadow-lg">
          VibeTribe
        </h1>
        <p className="text-2xl font-light max-w-2xl mx-auto drop-shadow-md">
          Discover your tribe based on shared interests and personality vibes.
          Connect, explore, and find your community in a fun, playful way!
        </p>
      </div>

      <AuthForm onAuthSuccess={onAuthSuccess} />
    </div>
  );
};

export default LandingPage;