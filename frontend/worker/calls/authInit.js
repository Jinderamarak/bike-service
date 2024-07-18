import { openCache } from "../cache.js";
import { call } from "../lib/calls.js";
import { multiFetch } from "../lib/fetching.js";

async function onAuthInit({ token }) {
    const cache = await openCache();

    await Promise.all([
        await cacheBikes(cache, token),
        await cacheUser(cache, token),
    ]);

    return {};
}

async function cacheBikes(cache, token) {
    if (!token) {
        cache.delete("/api/bikes");
        return;
    }

    const request = new Request("/api/bikes", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const response = await multiFetch(request);
    cache.put(request, response);
}

async function cacheUser(cache, token) {
    if (!token) {
        cache.delete("/api/users");
        return;
    }

    const request = new Request("/api/users", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const response = await multiFetch(request);
    cache.put(request, response);
}

export const authInitCall = call("authInit", onAuthInit);
