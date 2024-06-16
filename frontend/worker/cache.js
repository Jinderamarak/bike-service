const CACHE_NAME = "v1";

/**
 * @returns {Promise<Cache>}
 */
export async function openCache() {
    return await caches.open(CACHE_NAME);
}

/**
 * @param {string[]} paths
 * @returns {Promise<void>}
 */
export async function cacheResources(paths) {
    const cache = await openCache();
    await cache.addAll(paths);
}
