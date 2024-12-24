export function formatDate(date: Date): string {
    const yyyy = date.getFullYear(); // Full year
    const mm = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-based
    const dd = date.getDate().toString().padStart(2, '0'); // Day

    return `${yyyy}-${mm}-${dd}`;
}