import React from 'react';

/**
 * VibeMoodSelector component allows users to select multiple vibes and moods
 * from predefined lists using interactive buttons.
 * The color scheme is updated to match the dreamy aesthetic theme.
 */
const VibeMoodSelector = ({ title, options, selectedOptions, onSelectionChange }) => {
  const toggleSelection = (option) => {
    const newSelection = selectedOptions.includes(option)
      ? selectedOptions.filter((item) => item !== option)
      : [...selectedOptions, option];
    onSelectionChange(newSelection);
  };

  return (
    <div className="bg-[#FFF3F6] p-6 rounded-xl shadow-md mb-6">
      <h3 className="text-xl font-semibold text-[#2A1E5C] mb-4">{title}</h3>
      <div className="flex flex-wrap gap-3">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => toggleSelection(option)}
            className={`
              px-5 py-2 rounded-full text-sm font-medium transition duration-300 ease-in-out
              ${selectedOptions.includes(option)
                ? 'bg-[#A970FF] text-white shadow-md'
                : 'bg-[#E8E3F5] text-[#2A1E5C] hover:bg-[#D6CCF1]'
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
