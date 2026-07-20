import { useState, useEffect } from 'react';

/**
 * Reusable hook to debounce a value change.
 * Useful to prevent rapid API requests during active search keystrokes.
 */
export default function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Start timeout timer to update state
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clear timeout if value or delay changes before timeout fires
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
