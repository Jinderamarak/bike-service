import { call } from "../lib/calls.js";
import { getMultiFetcher } from "../lib/fetching.js";

async function onStatus(_payload) {
    const fetcher = await getMultiFetcher();
    const isOnline = await fetcher.selectHost();
    return { isOnline };
}

export const statusCall = call("status", onStatus);
