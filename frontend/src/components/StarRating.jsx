import React, { useState } from 'react'
import { Star } from 'lucide-react'

export const StarRating = ({ rating, interactive = false, onChange, size = 20 }) => {
  const [hoverRating, setHoverRating] = useState(null)

  const handleMouseEnter = (index) => {
    if (interactive) setHoverRating(index)
  }

  const handleMouseLeave = () => {
    if (interactive) setHoverRating(null)
  }

  const handleClick = (index) => {
    if (interactive && onChange) {
      onChange(index)
    }
  }

  const currentDisplayRating = hoverRating !== null ? hoverRating : rating

  return (
    <div className="flex items-center space-x-1" onMouseLeave={handleMouseLeave}>
      {[1, 2, 3, 4, 5].map((index) => {
        const isFilled = index <= currentDisplayRating
        return (
          <button
            key={index}
            type="button"
            className={`${
              interactive ? 'cursor-pointer focus:outline-none transition-transform hover:scale-110' : 'cursor-default'
            }`}
            onMouseEnter={() => handleMouseEnter(index)}
            onClick={() => handleClick(index)}
            disabled={!interactive}
          >
            <Star
              size={size}
              className={`${
                isFilled
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-slate-600 fill-transparent'
              } transition-colors duration-150`}
            />
          </button>
        )
      })}
    </div>
  )
}
