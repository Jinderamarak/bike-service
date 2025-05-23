/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { cacheResources } from "./cache.js";
import ridesDb from "./routes/rides/db.js";
import handleRequest from "./routes/index.js";
import { FRONTEND_RESOURCES } from "../src/constants.js";
import CallRouter from "./calls/index.js";

export const sw = /** @type {ServiceWorkerGlobalScope & typeof globalThis} */ (
    globalThis
);

/** @type {string} */
// @ts-ignore
export const WORKER_VERSION = APP_VERSION;

export const OfflineResponse = new Response("Offline", { status: 408 });

/**
 * @param {ExtendableEvent} event
 */
function onInstall(event) {
    event.waitUntil(
        (async () => {
            // Open the database to upgrade it
            await ridesDb.initialize();
            await cacheResources([...FRONTEND_RESOURCES, "/api/status"]);
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
    CallRouter(event);
}

sw.oninstall = onInstall;
sw.onfetch = onFetch;
sw.onmessage = onMessage;
