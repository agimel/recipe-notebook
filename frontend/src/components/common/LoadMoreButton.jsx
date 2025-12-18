import React from 'react';
import './LoadMoreButton.css';

export default function LoadMoreButton({ onClick, hasMore, loading }) {
  if (!hasMore) {
    return null;
  }

  return (
    <div className="load-more-container">
      <button
        className="load-more-button"
        onClick={onClick}
        disabled={loading}
        type="button"
      >
        {loading ? (
          <>
            <span className="load-more-button__spinner"></span>
            Loading...
          </>
        ) : (
          'Load More Recipes'
        )}
      </button>
    </div>
  );
}
