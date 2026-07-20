/**
 * Formats a Date object or ISO string into a human-readable format.
 * Defaults to: "Mon DD, YYYY" (e.g., "Jul 17, 2026").
 */
export function formatDate(date: string | Date | null | undefined, locale = 'en-US'): string {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Truncates a string to a specified character limit and appends an ellipsis.
 */
export function truncateText(text: string | null | undefined, maxLength = 150): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Extracts initials from a user's full name.
 * e.g., "Ananya Sharma" -> "AS", "Nirbhay" -> "N"
 */
export function getInitials(fullName: string | null | undefined): string {
  if (!fullName) return '';
  
  const parts = fullName.trim().split(/\s+/);
  const firstInitial = parts[0]?.[0] || '';
  const lastInitial = parts.length > 1 ? parts[parts.length - 1]?.[0] || '' : '';
  
  return (firstInitial + lastInitial).toUpperCase();
}

/**
 * Capitalizes the first letter of a string.
 * e.g., "software engineer" -> "Software engineer"
 */
export function capitalize(text: string | null | undefined): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Generates a deterministic tailwind background color utility class based on a user's name hash.
 * This guarantees that a user's avatar fallback color remains identical and visually balanced.
 */
export function generateAvatarColor(fullName: string | null | undefined): string {
  if (!fullName) return 'bg-slate-500 text-white';

  const colors = [
    'bg-red-500 text-white',
    'bg-orange-500 text-white',
    'bg-amber-500 text-white',
    'bg-emerald-500 text-white',
    'bg-teal-500 text-white',
    'bg-blue-500 text-white',
    'bg-indigo-500 text-white',
    'bg-violet-500 text-white',
    'bg-fuchsia-500 text-white',
    'bg-rose-500 text-white',
  ];

  // Hash the name string to generate a deterministic index
  let hash = 0;
  for (let i = 0; i < fullName.length; i++) {
    hash = fullName.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % colors.length;
  return colors[index] || 'bg-slate-500 text-white';
}
