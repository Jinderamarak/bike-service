const CacheName = "v1";

/**
 * @returns {Promise<Cache>}
 */
export async function openCache() {
    return await caches.open(CacheName);
}

/**
 * @param {string[]} paths
 * @returns {Promise<void>}
 */
export async function cacheResources(paths) {
    const cache = await openCache();
    await cache.addAll(paths);
}
