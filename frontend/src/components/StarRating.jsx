import { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ 
  rating = 0, 
  maxRating = 5, 
  onRate, 
  size = 'md', 
  readonly = false,
  showCount = false,
  count = 0,
  showAverage = false
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const handleClick = (value) => {
    if (!readonly && onRate) {
      // If clicking the same rating, remove it
      onRate(value === rating ? 0 : value);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {[...Array(maxRating)].map((_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= displayRating;
          const isHalf = !isFilled && starValue - 0.5 <= displayRating;

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleClick(starValue)}
              onMouseEnter={() => !readonly && setHoverRating(starValue)}
              onMouseLeave={() => !readonly && setHoverRating(0)}
              className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform focus:outline-none`}
              disabled={readonly}
              aria-label={`Rate ${starValue} stars`}
            >
              <Star
                className={`${sizeClasses[size]} transition-colors ${
                  isFilled 
                    ? 'fill-yellow-400 text-yellow-400' 
                    : 'fill-transparent text-gray-300'
                }`}
              />
            </button>
          );
        })}
      </div>
      {showAverage && rating > 0 && (
        <span className="text-sm font-medium text-gray-700">
          {rating.toFixed(1)}
        </span>
      )}
      {showCount && count > 0 && (
        <span className="text-sm text-gray-500">
          ({count})
        </span>
      )}
    </div>
  );
};

export default StarRating;
