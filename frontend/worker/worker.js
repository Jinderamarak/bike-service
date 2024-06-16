/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { cacheResources } from "./cache";
import { getMultiFetcher } from "./lib/fetching";
import ridesDb from "./routes/rides/db";
import handleRequest from "./routes";
import syncRides from "./routes/rides/sync";
import AsyncMutex from "./lib/lock";

export const sw = /** @type {ServiceWorkerGlobalScope & typeof globalThis} */ (
    globalThis
);

// @ts-ignore
const WORKER_VERSION = APP_VERSION;

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
        event.source.postMessage({ type: "version", version: WORKER_VERSION });
    }
    if (event.data.type === "checkHosts") {
        event.waitUntil(
            (async () => {
                const fetcher = await getMultiFetcher();
                const tests = await fetcher.testHosts();
                const results = tests.map((t) => ({
                    host: t.host.origin,
                    available: t.available,
                }));
                event.source.postMessage({ type: "checkHosts", results });
            })()
        );
    }
    if (event.data.type === "sync") {
        event.waitUntil(
            (async () => {
                if (syncLock.isLocked()) {
                    return;
                }

                await syncLock.run(async () => {
                    const fetcher = await getMultiFetcher();
                    const online = await fetcher.selectHost();
                    if (!online) {
                        return;
                    }

                    await syncRides();
                });
            })()
        );
    }
}

sw.oninstall = onInstall;
sw.onfetch = onFetch;
sw.onmessage = onMessage;
