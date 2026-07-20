import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Reusable cn (classnames) helper utility.
 * Combines clsx (conditional classes resolution) and tailwind-merge (merging Tailwind classes
 * without styling override conflicts) to handle runtime CSS string resolution.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
