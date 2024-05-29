import { openCache } from "./cache";
import { get } from "./router";
import { OfflineResponse, sw } from "./worker";

async function getBikes(request) {
    if (sw.navigator.onLine) {
        try {
            const response = await fetch(request);
            const cache = await openCache();
            await cache.put(request, response.clone());
            return response;
        } catch (e) {
            console.error(e);
        }
    }

    const cache = await openCache();
    const cached = await cache.match(request);
    if (cached) {
        return cached;
    }

    return OfflineResponse;
}

export const bikeRoutes = [get(/^\/api\/bikes$/g, getBikes)];
