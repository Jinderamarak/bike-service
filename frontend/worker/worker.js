/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { cacheResources } from "./cache";
import { getMultiFetcher } from "./lib/fetching";
import ridesDb from "./routes/rides/db";
import handleRequest from "./routes";
import syncRides from "./routes/rides/sync";
import AsyncMutex from "./lib/lock";
import { onVersionMessage } from "./messages";
import { onCheckHostsMessage } from "./messages";
import { onStatusMessage } from "./messages";
import { onSyncMessage } from "./messages";

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
                "/index.html",
                "/favicon.svg",
                "/worker.js",
                "/assets/index.css",
                "/assets/index.js",
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
