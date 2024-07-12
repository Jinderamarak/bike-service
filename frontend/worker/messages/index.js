import { getMultiFetcher } from "../lib/fetching.js";
import AsyncMutex from "../lib/lock.js";
import { postVersion, postStatus, postCheckHosts } from "./outbound.js";
import syncRides from "../routes/rides/sync.js";
import { WORKER_VERSION } from "../worker.js";

export async function onVersionMessage(event) {
    postVersion(WORKER_VERSION, event.source);
}

export async function onCheckHostsMessage(event) {
    const fetcher = await getMultiFetcher();
    const tests = await fetcher.testHosts();
    const results = tests.map((t) => ({
        host: t.host.origin,
        available: t.available,
    }));
    postCheckHosts(results, event.source);
}

export async function onStatusMessage(event) {
    const fetcher = await getMultiFetcher();
    const isOnline = !fetcher.isOffline();
    postStatus(isOnline, event.source);
}

const syncLock = new AsyncMutex();
export async function onSyncMessage(_) {
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
}
