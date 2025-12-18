import React from 'react';
import './DifficultyFilter.css';

export default function DifficultyFilter({ selectedDifficulty, onChange }) {
  const difficulties = [
    { value: null, label: 'All', color: '#666' },
    { value: 'EASY', label: 'Easy', color: '#4CAF50' },
    { value: 'MEDIUM', label: 'Medium', color: '#FF9800' },
    { value: 'HARD', label: 'Hard', color: '#F44336' }
  ];

  return (
    <div className="difficulty-filter">
      <label className="difficulty-filter__label">Difficulty</label>
      <div className="difficulty-filter__options">
        {difficulties.map(diff => (
          <button
            key={diff.value || 'all'}
            className={`difficulty-filter__option ${
              selectedDifficulty === diff.value ? 'difficulty-filter__option--selected' : ''
            }`}
            style={selectedDifficulty === diff.value ? { 
              borderColor: diff.color,
              color: diff.color 
            } : {}}
            onClick={() => onChange(diff.value)}
            type="button"
          >
            {diff.label}
          </button>
        ))}
      </div>
    </div>
  );
}
