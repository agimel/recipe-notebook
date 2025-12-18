import React, { useState, useEffect } from 'react';
import './WelcomeBanner.css';

function WelcomeBanner({ recipeId }) {
  const storageKey = `recipe-${recipeId}-banner-dismissed`;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem(storageKey);
    setIsVisible(!isDismissed);
  }, [storageKey]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(storageKey, 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="welcome-banner" role="alert" aria-live="polite">
      <div className="welcome-banner-content">
        <svg 
          className="welcome-banner-icon" 
          viewBox="0 0 24 24" 
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        <p className="welcome-banner-text">
          Welcome to Recipe Notebook! This is a sample recipe to help you get started. 
          Feel free to edit or delete it.
        </p>
      </div>
      <button
        onClick={handleDismiss}
        className="welcome-banner-dismiss"
        aria-label="Dismiss welcome message"
        type="button"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      </button>
    </div>
  );
}

export default WelcomeBanner;
