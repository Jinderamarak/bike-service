/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { bikeRoutes } from "./bikes";
import { cacheResources } from "./cache";
import { rideRoutes, ridesDb } from "./rides";
import { router } from "./router";

export const sw = /** @type {ServiceWorkerGlobalScope & typeof globalThis} */ (
    globalThis
);

export const OfflineResponse = new Response("Offline", { status: 408 });

/**
 * @param {ExtendableEvent} event
 */
function onInstall(event) {
    event.waitUntil(
        (async () => {
            // Open the database to upgrade it
            await ridesDb.open();
            await cacheResources([
                "/index.html",
                "/favicon.svg",
                "/worker.js",
                "/assets/index.css",
                "/assets/index.js",
                "/api/bikes",
            ]);
        })()
    );
}

/**
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function handleSpaRequest(request) {
    if (sw.navigator.onLine) {
        try {
            return await fetch(request);
        } catch (e) {
            console.error(e);
        }
    }

    const cached = await caches.match(request);
    if (cached) {
        return cached;
    }

    console.log("Cache missed, falling back to index.html");
    return await caches.match("/index.html");
}

const apiRouter = router([...bikeRoutes, ...rideRoutes]);

/**
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function handleApiRequest(request) {
    const response = await apiRouter(request);
    if (response) {
        return response;
    }

    console.log("Request not handled in router:", request.url);
    try {
        return await fetch(request);
    } catch (e) {
        console.error(e);
    }

    console.log("Falling back to offline response:", request.url);
    return OfflineResponse;
}

/**
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function handleRequest(request) {
    console.log(request.url);

    try {
        const url = new URL(request.url);
        if (url.pathname.startsWith("/api")) {
            console.log("Routing to API");
            return await handleApiRequest(request);
        } else {
            console.log("Routing to SPA");
            return await handleSpaRequest(request);
        }
    } catch (e) {
        console.error("Top Level Error", e);
        return await fetch(request);
    }
}

/**
 * @param {FetchEvent} event
 */
function onFetch(event) {
    event.respondWith(handleRequest(event.request));
}

sw.oninstall = onInstall;
sw.onfetch = onFetch;
