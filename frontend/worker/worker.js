/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { cacheResources } from "./cache.js";
import ridesDb from "./routes/rides/db.js";
import handleRequest from "./routes/index.js";
import AsyncMutex from "./lib/lock.js";
import { onVersionMessage } from "./messages/index.js";
import { onCheckHostsMessage } from "./messages/index.js";
import { onStatusMessage } from "./messages/index.js";
import { onSyncMessage } from "./messages/index.js";
import { FRONTEND_RESOURCES } from "../src/constants.js";

export const sw = /** @type {ServiceWorkerGlobalScope & typeof globalThis} */ (
    globalThis
);

/** @type {string} */
// @ts-ignore
export const WORKER_VERSION = APP_VERSION;

export const OfflineResponse = new Response("Offline", { status: 408 });

const syncLock = new AsyncMutex();

/**
 * @param {ExtendableEvent} event
 */
function onInstall(event) {
    event.waitUntil(
        (async () => {
            // Open the database to upgrade it
            await ridesDb.initialize();
            await cacheResources([
                ...FRONTEND_RESOURCES,
                "/api/bikes",
                "/api/status",
            ]);
        })()
    );
}

/**
 * @param {FetchEvent} event
 */
function onFetch(event) {
    event.respondWith(handleRequest(event.request));
}

/**
 * @param {MessageEvent & ExtendableMessageEvent} event
 */
function onMessage(event) {
    if (event.data.type === "version") {
        event.waitUntil(onVersionMessage(event));
    }
    if (event.data.type === "checkHosts") {
        event.waitUntil(onCheckHostsMessage(event));
    }
    if (event.data.type === "status") {
        event.waitUntil(onStatusMessage(event));
    }
    if (event.data.type === "sync") {
        event.waitUntil(onSyncMessage(event));
    }
}

sw.oninstall = onInstall;
sw.onfetch = onFetch;
sw.onmessage = onMessage;
