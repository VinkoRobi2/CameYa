// src/dashboards/common/components/RatingStars.tsx
import type { UserRatingSummary } from "../types";

interface RatingStarsProps {
  rating: UserRatingSummary;
  size?: "sm" | "md";
}

export const RatingStars = ({ rating, size = "md" }: RatingStarsProps) => {
  const { average, totalRatings } = rating;
  const rounded = Math.round(average * 2) / 2;

  const starSize = size === "sm" ? "text-xs" : "text-sm";
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <div className="inline-flex items-center gap-1">
      <div className={`flex ${starSize}`}>
        {Array.from({ length: 5 }).map((_, idx) => {
          const starIndex = idx + 1;
          const isFull = starIndex <= Math.floor(rounded);
          const isHalf =
            starIndex === Math.ceil(rounded) && !Number.isInteger(rounded);

          return (
            <span key={idx} className="leading-none">
              {isFull ? "★" : isHalf ? "☆" : "☆"}
            </span>
          );
        })}
      </div>
      <span className={`${textSize} text-slate-400`}>
        {average.toFixed(1)} · {totalRatings} valoraciones
      </span>
    </div>
  );
};
