import React from 'react';
import './LoadingSkeleton.css';

function LoadingSkeleton() {
  return (
    <div className="loading-skeleton" aria-label="Loading recipe">
      <div className="skeleton skeleton-title"></div>
      <div className="skeleton-metadata">
        <div className="skeleton skeleton-badge"></div>
        <div className="skeleton skeleton-time"></div>
      </div>
      <div className="skeleton-categories">
        <div className="skeleton skeleton-chip"></div>
        <div className="skeleton skeleton-chip"></div>
        <div className="skeleton skeleton-chip"></div>
      </div>
      
      <div className="skeleton-section">
        <div className="skeleton skeleton-heading"></div>
        <div className="skeleton skeleton-line"></div>
        <div className="skeleton skeleton-line"></div>
        <div className="skeleton skeleton-line"></div>
        <div className="skeleton skeleton-line"></div>
        <div className="skeleton skeleton-line short"></div>
      </div>
      
      <div className="skeleton-section">
        <div className="skeleton skeleton-heading"></div>
        <div className="skeleton skeleton-line"></div>
        <div className="skeleton skeleton-line"></div>
        <div className="skeleton skeleton-line"></div>
      </div>
    </div>
  );
}

export default LoadingSkeleton;
