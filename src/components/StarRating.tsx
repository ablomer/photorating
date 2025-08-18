import React from 'react';

interface StarRatingProps {
  onRate: (rating: number) => void;
  maxStars?: number;
}

const StarRating: React.FC<StarRatingProps> = ({ onRate, maxStars = 5 }) => {
  const [hoveredStar, setHoveredStar] = React.useState<number | null>(null);

  const handleStarClick = (rating: number) => {
    onRate(rating);
  };

  const handleStarHover = (rating: number) => {
    setHoveredStar(rating);
  };

  const handleMouseLeave = () => {
    setHoveredStar(null);
  };

  return (
    <div className="star-rating" onMouseLeave={handleMouseLeave}>
      {Array.from({ length: maxStars }, (_, index) => {
        const starValue = index + 1;
        const isHighlighted = hoveredStar !== null && starValue <= hoveredStar;

        return (
          <button
            key={starValue}
            className={`star ${isHighlighted ? 'highlighted' : ''}`}
            onClick={() => handleStarClick(starValue)}
            onMouseEnter={() => handleStarHover(starValue)}
            type="button"
            aria-label={`Rate ${starValue} star${starValue !== 1 ? 's' : ''}`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
