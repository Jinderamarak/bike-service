import { call } from "../lib/calls.js";
import { getMultiFetcher } from "../lib/fetching.js";

async function onCheckHosts(_payload) {
    const fetcher = await getMultiFetcher();
    const tests = await fetcher.testHosts();
    const results = tests.map((t) => ({
        host: t.host.origin,
        available: t.available,
    }));
    return results;
}

export const checkHostsCall = call("checkHosts", onCheckHosts);
