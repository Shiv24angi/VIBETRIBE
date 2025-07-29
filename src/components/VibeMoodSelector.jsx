// components/VibeMoodSelector.jsx
import React from 'react';

/**
 * VibeMoodSelector component allows users to select multiple vibes and moods
 * from predefined lists using interactive buttons.
 * The color scheme is updated to match the application's theme (Burgundy and Beige).
 * @param {Object} props - Component props.
 * @param {string} props.title - The title for the selection section (e.g., "Select Your Vibes").
 * @param {string[]} props.options - An array of strings representing the available options.
 * @param {string[]} props.selectedOptions - An array of strings representing the currently selected options.
 * @param {function(string[]): void} props.onSelectionChange - Callback function when selections change.
 */
const VibeMoodSelector = ({ title, options, selectedOptions, onSelectionChange }) => {
  /**
   * Toggles the selection of an option. If the option is already selected, it removes it;
   * otherwise, it adds it to the selected options.
   * @param {string} option - The option to toggle.
   */
  const toggleSelection = (option) => {
    const newSelection = selectedOptions.includes(option)
      ? selectedOptions.filter((item) => item !== option)
      : [...selectedOptions, option];
    onSelectionChange(newSelection);
  };

  return (
    // Background updated to Beige for consistency with the main theme
    <div className="bg-[#F5F5DC] p-6 rounded-xl shadow-md mb-6">
      {/* Title text color updated to dark burgundy/brown */}
      <h3 className="text-xl font-semibold text-[#4A0404] mb-4">{title}</h3>
      <div className="flex flex-wrap gap-3">
        {options.map((option) => (
          <button
            key={option}
            type="button" // Important for buttons inside forms to prevent accidental submission
            onClick={() => toggleSelection(option)}
            className={`
              px-5 py-2 rounded-full text-sm font-medium transition duration-300 ease-in-out
              ${selectedOptions.includes(option)
                // Selected button: background is Burgundy, text is white
                ? 'bg-[#800020] text-white shadow-lg'
                // Unselected button: background is light gray (or a soft beige if preferred), text is dark burgundy/brown
                : 'bg-gray-200 text-[#4A0404] hover:bg-gray-300'
              }
            `}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export default VibeMoodSelector;