import { formatDistanceToNow } from 'date-fns';

export function timeAgo(date) {
  if (!date) return 'Unknown';
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch (err) {
    return 'Unknown';
  }
}

export function initialsFromName(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0]?.toUpperCase())
    .slice(0, 2)
    .join('');
}
