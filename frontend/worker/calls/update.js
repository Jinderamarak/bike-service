import { FRONTEND_RESOURCES } from "../../src/constants.js";
import { cacheResources } from "../cache.js";
import { call } from "../lib/calls.js";

async function onUpdate(_payload) {
    await cacheResources(FRONTEND_RESOURCES);
    return {};
}

export const updateCall = call("update", onUpdate);
