import { formatDistanceToNow } from 'date-fns';

export function formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString();
}

export function formatRelativeDate(date: string | Date): string {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
}
