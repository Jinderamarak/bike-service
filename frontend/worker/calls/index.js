import { callRouter } from "../lib/calls.js";
import { authInitCall } from "./authInit.js";
import { checkHostsCall } from "./checkHosts.js";
import { statusCall } from "./status.js";
import { syncCall } from "./sync.js";
import { updateCall } from "./update.js";
import { versionCall } from "./version.js";

const router = callRouter([
    authInitCall,
    checkHostsCall,
    statusCall,
    syncCall,
    updateCall,
    versionCall,
]);

export default router;
