import { multiFetch } from "../../lib/fetching";
import {
    postSyncCompleted,
    postSyncFailed,
    postSyncStarted,
} from "../../messages";
import ridesDb from "./db";

async function syncRides() {
    console.log("SYNC", "Checking syncing rides");
    const rides = await ridesDb.getAllRides();
    if (rides.length === 0) {
        return true;
    }

    console.log("SYNC", "Syncing rides", rides.length);
    await postSyncStarted("rides", rides.length);
    const tasks = rides.map(syncRide);

    const results = await Promise.all(tasks);
    const failed = results.filter((success) => !success);

    if (failed.length > 0) {
        await postSyncFailed(
            "rides",
            rides.length - failed.length,
            failed.length
        );
        return false;
    }

    await postSyncCompleted("rides", rides.length);
    return true;
}

async function syncRide(ride) {
    if (ride.id >= 0) {
        return syncForeignRide(ride);
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
        headers: { "Content-Type": "application/json" },
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

async function syncForeignRide(ride) {
    console.log("SYNC", "Syncing foreign ride", ride);
    if (ride.deletedAt) {
        return syncDeleteForeignRide(ride);
    }

    return syncUpdateForeignRide(ride);
}

async function syncUpdateForeignRide(ride) {
    const body = { ...ride };
    delete body.id;
    delete body.bikeId;
    delete body.deletedAt;

    console.log("SYNC", "Updating existing ride", body);
    const request = new Request(`/api/bikes/${ride.bikeId}/rides/${ride.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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

async function syncDeleteForeignRide(ride) {
    console.log("SYNC", "Deleting existing ride", ride);
    const request = new Request(`/api/bikes/${ride.bikeId}/rides/${ride.id}`, {
        method: "DELETE",
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
