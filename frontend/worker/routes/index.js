import { openCache } from "../cache.js";
import { multiFetch } from "../lib/fetching.js";
import { Router } from "../lib/router.js";
import { OfflineResponse, sw } from "../worker.js";
import { rideRoutes } from "./rides/routes.js";

const ApiRouter = Router([...rideRoutes]);

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

    return await caches.match("/index.html");
}

async function handleApiRequest(request) {
    const fetched = await multiFetch(request);
    if (fetched) {
        return fetched;
    }

    const response = await ApiRouter(request);
    if (response) {
        return response;
    }

    const cache = await openCache();
    const cached = await cache.match(request);
    if (cached) {
        return cached;
    }

    console.warn("Falling back to offline response:", request.url);
    return OfflineResponse.clone();
}

/**
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function handleRequest(request) {
    try {
        const url = new URL(request.url);

        if (url.pathname.startsWith("/api")) {
            return await handleApiRequest(request);
        } else {
            return await handleSpaRequest(request);
        }
    } catch (e) {
        console.error(e);
        return new Response("Internal Service Worker Error", { status: 500 });
    }
}

export default handleRequest;
