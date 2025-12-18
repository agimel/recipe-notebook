import React from 'react';
import './DifficultyBadge.css';

export default function DifficultyBadge({ difficulty, size = 'medium' }) {
  const difficultyConfig = {
    EASY: { color: '#4CAF50', label: 'Easy' },
    MEDIUM: { color: '#FF9800', label: 'Medium' },
    HARD: { color: '#F44336', label: 'Hard' }
  };

  const config = difficultyConfig[difficulty] || difficultyConfig.EASY;

  return (
    <span 
      className={`difficulty-badge difficulty-badge--${size}`}
      style={{ backgroundColor: config.color }}
    >
      {config.label}
    </span>
  );
}
