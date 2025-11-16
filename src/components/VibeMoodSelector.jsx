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
    <div className="bg-[var(--muted-1)] p-6 rounded-xl shadow-md mb-6">
      <h3 className="text-xl font-semibold text-[var(--text-strong)] mb-4">{title}</h3>
      <div className="flex flex-wrap gap-3">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => toggleSelection(option)}
            className={`
              px-5 py-2 rounded-full text-sm font-medium transition duration-300 ease-in-out
              ${selectedOptions.includes(option)
                ? 'bg-[var(--accent)] text-white shadow-md'
                : 'bg-[var(--muted-1)] text-[var(--text-strong)] hover:bg-[var(--muted-2)]'
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
