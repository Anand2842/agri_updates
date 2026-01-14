import { formatDistanceToNow } from 'date-fns';

export function formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString();
}

export function formatRelativeDate(date: string | Date): string {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
}

/**
 * Safely format a date, returning fallback if date is invalid or corrupted.
 * Handles malformed dates like "+058008-03-14" that can crash rendering.
 */
export function safeDateFormat(date: string | Date | null | undefined, fallback = 'Unknown date'): string {
    if (!date) return fallback;

    try {
        const parsed = new Date(date);
        // Check if date is valid and within reasonable range (years 1900-2100)
        if (isNaN(parsed.getTime()) || parsed.getFullYear() < 1900 || parsed.getFullYear() > 2100) {
            return fallback;
        }
        return parsed.toLocaleDateString();
    } catch {
        return fallback;
    }
}
