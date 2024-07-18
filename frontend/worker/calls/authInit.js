import { openCache } from "../cache.js";
import { call } from "../lib/calls.js";

async function onAuthInit({ token }) {
    const cache = await openCache();
    if (!token) {
        cache.delete("/api/bikes");
        return {};
    }

    const response = await fetch("/api/bikes", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    cache.put("/api/bikes", response);
    return {};
}

export const authInitCall = call("authInit", onAuthInit);
