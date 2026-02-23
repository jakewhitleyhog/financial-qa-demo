/**
 * AnimatedNumber Component
 * Animates number changes with a smooth transition
 */

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export function AnimatedNumber({ value, className }) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (prevValueRef.current !== value) {
      setIsAnimating(true);
      setDisplayValue(value);

      const timeout = setTimeout(() => {
        setIsAnimating(false);
      }, 300);

      prevValueRef.current = value;

      return () => clearTimeout(timeout);
    }
  }, [value]);

  return (
    <span
      className={cn(
        'inline-block transition-all duration-300',
        isAnimating && 'scale-125 text-primary',
        className
      )}
    >
      {displayValue}
    </span>
  );
}

export default AnimatedNumber;
