// components/LoadingSpinner.jsx
import React from 'react';

/**
 * A simple loading spinner component.
 * Displays a spinning circle to indicate ongoing processes.
 * Now themed with Magic Purple and its darker shade.
 */
const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center h-full">
      {/* Spinner uses magic purple and darker violet for visual depth */}
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[var(--accent)] border-b-[var(--accent-2)]"></div>
    </div>
  );
};

export default LoadingSpinner;
