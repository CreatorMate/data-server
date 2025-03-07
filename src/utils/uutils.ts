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
