import React from 'react';
import './SkeletonCards.css';

export default function SkeletonCards({ count = 5 }) {
  return (
    <div className="skeleton-cards">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="skeleton-card">
          <div className="skeleton-card__title skeleton-shimmer"></div>
          <div className="skeleton-card__meta">
            <div className="skeleton-card__badge skeleton-shimmer"></div>
            <div className="skeleton-card__time skeleton-shimmer"></div>
          </div>
          <div className="skeleton-card__categories">
            <div className="skeleton-card__category skeleton-shimmer"></div>
            <div className="skeleton-card__category skeleton-shimmer"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
