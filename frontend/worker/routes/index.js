import { openCache } from "../cache.js";
import { multiFetch } from "../lib/fetching.js";
import { httpRouter } from "../lib/router.js";
import { OfflineResponse } from "../worker.js";
import { rideRoutes } from "./rides/routes.js";

const ApiRouter = httpRouter([...rideRoutes]);

async function handleSpaRequest(request) {
    const cache = await openCache();
    const cached = await cache.match(request);
    if (cached) {
        return cached;
    }

    const response = await fetch(request);
    if (response) {
        if (response.ok) {
            cache.put(request, response.clone());
        }

        return response;
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
