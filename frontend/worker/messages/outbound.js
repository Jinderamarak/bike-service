import { sw } from "../worker.js";

async function postMessage(message, client = undefined) {
    if (client) {
        client.postMessage(message);
        return;
    }

    const clients = await sw.clients.matchAll();
    clients.forEach((client) => {
        client.postMessage(message);
    });
}

/**
 * @param {boolean} isOnline
 * @param {URL | null} host Current host or null if offline
 * @param {Client | undefined} client
 * @returns {Promise<void>}
 */
export async function postNetworkChanged(isOnline, host, client = undefined) {
    return postMessage(
        { type: "networkChanged", isOnline, host: host?.origin },
        client
    );
}

/**
 * @param {"rides"} category
 * @param {number} itemCount
 * @param {Client | undefined} client
 * @returns {Promise<void>}
 */
export async function postSyncStarted(category, itemCount, client = undefined) {
    return postMessage({ type: "syncStarted", category, itemCount }, client);
}

/**
 * @param {"rides"} category
 * @param {number} itemCount
 * @param {Client | undefined} client
 * @returns {Promise<void>}
 */
export async function postSyncCompleted(
    category,
    itemCount,
    client = undefined
) {
    return postMessage({ type: "syncCompleted", category, itemCount }, client);
}

/**
 * @param {string} category
 * @param {number} succeeded
 * @param {number} failed
 * @param {Client | undefined} client
 * @returns {Promise<void>}
 */
export async function postSyncFailed(
    category,
    succeeded,
    failed,
    client = undefined
) {
    return postMessage(
        { type: "syncFailed", category, succeeded, failed },
        client
    );
}

/**
 * @param {string} version
 * @param {Client | undefined} client
 * @returns {Promise<void>}
 */
export async function postVersion(version, client = undefined) {
    return postMessage({ type: "version", version }, client);
}

/**
 * @param {boolean} isOnline
 * @param {Client | undefined} client
 * @returns {Promise<void>}
 */
export async function postStatus(isOnline, client = undefined) {
    return postMessage({ type: "status", isOnline }, client);
}

/**
 * @param {Array<{ host: string, available: boolean }>} results
 * @param {Client | undefined} client
 * @returns {Promise<void>}
 */
export async function postCheckHosts(results, client = undefined) {
    return postMessage({ type: "checkHosts", results }, client);
}

/**
 * @param {Client | undefined} client
 * @returns {Promise<void>}
 */
export async function postUpdate(client = undefined) {
    return postMessage({ type: "update" }, client);
}
