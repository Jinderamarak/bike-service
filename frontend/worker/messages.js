import { sw } from "./worker";

async function postMessage(message) {
    console.log("MESSAGES", "Posting message to all clients", message);
    const clients = await sw.clients.matchAll();
    clients.forEach((client) => {
        client.postMessage(message);
    });
}

/**
 * Posts `networkChanged` message.
 * @param {boolean} isOnline
 * @param {URL | null} host Current host or null if offline
 * @returns {Promise<void>}
 */
export async function postNetworkChanged(isOnline, host) {
    postMessage({ type: "networkChanged", isOnline, host: host?.origin });
}

/**
 * Posts `syncStarted` message.
 * @param {"rides"} category
 * @param {number} itemCount
 * @returns {Promise<void>}
 */
export async function postSyncStarted(category, itemCount) {
    postMessage({ type: "syncStarted", category, itemCount });
}

/**
 * Posts `syncCompleted` message.
 * @param {"rides"} category
 * @param {number} itemCount
 * @returns {Promise<void>}
 */
export async function postSyncCompleted(category, itemCount) {
    postMessage({ type: "syncCompleted", category, itemCount });
}

/**
 * Posts `syncFailed` message.
 * @param {string} category
 * @param {number} succeeded
 * @param {number} failed
 * @returns {Promise<void>}
 */
export async function postSyncFailed(category, succeeded, failed) {
    postMessage({ type: "syncFailed", category, succeeded, failed });
}
