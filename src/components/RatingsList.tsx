import React from 'react';
import type { Rating } from '../types';

interface RatingsListProps {
  ratings: Rating[];
  onEditRating: (ratingId: string, newValue: number) => void;
  onDeleteRating: (ratingId: string) => void;
  average: number;
}

const RatingsList: React.FC<RatingsListProps> = ({ 
  ratings, 
  onEditRating, 
  onDeleteRating,
  average
}) => {
  if (ratings.length === 0) {
    return (
      <div className="ratings-list">
        <p className="no-ratings">No ratings yet for this image</p>
      </div>
    );
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const renderStars = (value: number, ratingId: string) => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      return (
        <button
          key={starValue}
          className={`star-display ${starValue <= value ? 'filled' : ''}`}
          onClick={() => onEditRating(ratingId, starValue)}
          type="button"
          aria-label={`Change to ${starValue} star${starValue !== 1 ? 's' : ''}`}
        >
          ★
        </button>
      );
    });
  };

  const renderAverageStars = (average: number) => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isFilled = starValue <= Math.round(average);
      return (
        <span
          key={starValue}
          className={`average-star ${isFilled ? 'filled' : ''}`}
        >
          ★
        </span>
      );
    });
  };

  return (
    <div className="ratings-list">
      <h3>Submitted Ratings ({ratings.length})</h3>
      {ratings.length > 0 && (
        <div className="average-rating">
          <div className="average-label">Average Rating:</div>
          <div className="average-display">
            <div className="average-stars">
              {renderAverageStars(average)}
            </div>
            <span className="average-number">{average.toFixed(1)}</span>
          </div>
        </div>
      )}
      <div className="ratings-container">
        {ratings.map((rating) => (
          <div key={rating.id} className="rating-item">
            <div className="rating-stars">
              {renderStars(rating.value, rating.id)}
            </div>
            <div className="rating-info">
              <span className="rating-time">{formatTimestamp(rating.timestamp)}</span>
              <button
                className="delete-button"
                onClick={() => onDeleteRating(rating.id)}
                type="button"
                aria-label="Delete rating"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RatingsList;
