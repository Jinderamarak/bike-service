import { stream } from "../lib/calls.js";
import { getMultiFetcher } from "../lib/fetching.js";
import AsyncMutex from "../lib/lock.js";
import syncRides from "../routes/rides/sync.js";

const syncLock = new AsyncMutex();
async function onSync({ token }, onNext) {
    if (syncLock.isLocked()) {
        return true;
    }

    await syncLock.run(async () => {
        const fetcher = await getMultiFetcher();
        const online = await fetcher.selectHost();
        if (!online) {
            return true;
        }

        async function reportSync(type, category, itemCount) {
            await onNext({ type, category, itemCount });
        }

        await syncRides(token, reportSync);
    });

    return true;
}

export const syncCall = stream("sync", onSync);
