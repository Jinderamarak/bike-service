import { call } from "../lib/calls.js";
import { WORKER_VERSION } from "../worker.js";

async function onVersion(_payload) {
    return { version: WORKER_VERSION };
}

export const versionCall = call("version", onVersion);
