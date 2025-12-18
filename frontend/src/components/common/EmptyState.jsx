import React from 'react';
import { useNavigate } from 'react-router-dom';
import './EmptyState.css';

export default function EmptyState({ variant, searchQuery, onCreateRecipe }) {
  const navigate = useNavigate();

  const configs = {
    'no-recipes': {
      icon: '📝',
      heading: "You haven't created any recipes yet",
      message: "Start building your recipe collection by creating your first recipe!",
      buttonText: "Create Your First Recipe",
      onButtonClick: onCreateRecipe || (() => navigate('/recipes/new'))
    },
    'no-results': {
      icon: '🔍',
      heading: searchQuery ? `No recipes found for "${searchQuery}"` : "No recipes match these filters",
      message: "Try adjusting your search or filter settings to find what you're looking for.",
      buttonText: null,
      onButtonClick: null
    },
    'error': {
      icon: '⚠️',
      heading: "Something went wrong",
      message: "We couldn't load your recipes. Please try again.",
      buttonText: "Try Again",
      onButtonClick: () => window.location.reload()
    }
  };

  const config = configs[variant] || configs['no-recipes'];

  return (
    <div className="empty-state">
      <div className="empty-state__icon">{config.icon}</div>
      <h2 className="empty-state__heading">{config.heading}</h2>
      <p className="empty-state__message">{config.message}</p>
      {config.buttonText && (
        <button 
          className="empty-state__button"
          onClick={config.onButtonClick}
          type="button"
        >
          {config.buttonText}
        </button>
      )}
    </div>
  );
}
