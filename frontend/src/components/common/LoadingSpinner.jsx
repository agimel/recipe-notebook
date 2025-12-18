import React from 'react';
import './LoadingSpinner.css';

export default function LoadingSpinner({ message = 'Loading recipes...' }) {
  return (
    <div className="loading-spinner">
      <div className="loading-spinner__circle"></div>
      {message && <p className="loading-spinner__message">{message}</p>}
    </div>
  );
}
