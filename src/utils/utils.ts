export async function processInBatches<T, R>(
    items: T[],
    batchSize: number,
    asyncCallback: (item: T) => Promise<R>
): Promise<R[]> {
    const results: R[] = [];

    for (let i = 0; i < items.length; i += batchSize) {
        // Get the next batch of items
        const batch = items.slice(i, i + batchSize);

        // Execute all promises in the batch
        const batchResults = await Promise.all(batch.map(asyncCallback));

        // Store results
        results.push(...batchResults);
    }

    return results;
}

export function isExpirationWithinDays(expirationDate: string, days: number): boolean {
    const today = new Date();
    const targetDate = new Date(expirationDate);

    // Calculate the difference in days
    const diffInTime = targetDate.getTime() - today.getTime();
    const diffInDays = Math.ceil(diffInTime / (1000 * 60 * 60 * 24));

    // Check if the expiration date is within the next 'days' range
    return diffInDays >= 0 && diffInDays <= days;
}
