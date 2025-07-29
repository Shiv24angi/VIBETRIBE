// components/LoadingSpinner.jsx
import React from 'react';

/**
 * A simple loading spinner component.
 * Displays a spinning circle to indicate ongoing processes.
 * The color is updated to match the application's theme (Burgundy and Beige).
 */
const LoadingSpinner = () => {
  return (
    // Assuming the parent container handles the main background.
    // This div ensures the spinner is centered.
    <div className="flex justify-center items-center h-full">
      {/* The border color is changed to Burgundy (#800020) to match the theme. */}
      {/* You might want a slightly lighter or darker shade of burgundy for the border-b-4 
          to give it a more distinct spinning visual, e.g., #6A001A for a darker shade */}
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#800020]"></div>
    </div>
  );
};

export default LoadingSpinner;