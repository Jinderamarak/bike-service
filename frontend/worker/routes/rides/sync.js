import { multiFetch } from "../../lib/fetching.js";
import ridesDb from "./db.js";

/**
 * @callback SyncReporter
 * @param {"started" | "failed" | "completed"} type
 * @param {string} category
 * @param {number} itemCount
 * @returns {Promise<void>}
 */

/**
 * @param {string} token
 * @param {SyncReporter} reportSync
 * @returns {Promise<boolean>}
 */
async function syncRides(token, reportSync) {
    console.log("SYNC", "Checking syncing rides");
    const rides = await ridesDb.getAllRides();
    if (rides.length === 0) {
        return true;
    }

    console.log("SYNC", "Syncing rides", rides.length);
    await reportSync("started", "rides", rides.length);

    const tasks = rides.map((r) => syncRide(r, token));

    const results = await Promise.all(tasks);
    const failed = results.filter((success) => !success);

    if (failed.length > 0) {
        await reportSync("failed", "rides", failed.length);
        return false;
    }

    await reportSync("completed", "rides", rides.length);
    return true;
}

async function syncRide(ride, token) {
    if (ride.id >= 0) {
        return syncForeignRide(ride, token);
    }

    if (ride.deletedAt) {
        await ridesDb.clearRide(ride.id);
        return true;
    }

    const body = { ...ride };
    delete body.id;
    delete body.bikeId;
    delete body.deletedAt;

    console.log("SYNC", "Creating new ride", body);
    const request = new Request(`/api/bikes/${ride.bikeId}/rides`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
    });
    const response = await multiFetch(request);

    if (response.ok) {
        await ridesDb.clearRide(ride.id);
        return true;
    }

    console.error("SYNC: Failed to create ride", response);
    return false;
}

async function syncForeignRide(ride, token) {
    console.log("SYNC", "Syncing foreign ride", ride);
    if (ride.deletedAt) {
        return syncDeleteForeignRide(ride, token);
    }

    return syncUpdateForeignRide(ride, token);
}

async function syncUpdateForeignRide(ride, token) {
    const body = { ...ride };
    delete body.id;
    delete body.bikeId;
    delete body.deletedAt;

    console.log("SYNC", "Updating existing ride", body);
    const request = new Request(`/api/bikes/${ride.bikeId}/rides/${ride.id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
    });
    const response = await multiFetch(request);

    if (response.ok) {
        await ridesDb.clearRide(ride.id);
        return true;
    }

    console.error("SYNC", "Failed to update ride", response);
    return false;
}

async function syncDeleteForeignRide(ride, token) {
    console.log("SYNC", "Deleting existing ride", ride);
    const request = new Request(`/api/bikes/${ride.bikeId}/rides/${ride.id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    const response = await multiFetch(request);

    if (response.ok) {
        await ridesDb.clearRide(ride.id);
        return true;
    }

    console.error("SYNC", "Failed to delete ride", response);
    return false;
}

export default syncRides;
