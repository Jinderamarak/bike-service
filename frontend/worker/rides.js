import AsyncDB from "./db";
import AsyncMutex from "./lock";
import { del, get, post, put } from "./router";

export const ridesDb = new AsyncDB("rides", 1, initializeDb);
const lock = new AsyncMutex();

function initializeDb(db, prev, next) {
    const store = db.createObjectStore("rides", {
        keyPath: "id",
        autoIncrement: true,
    });
    store.createIndex("bikeId_index", "bikeId", { unique: false });
}

async function tryFetch(request, refetch = false) {
    return await lock.run(async () => {
        try {
            let response = await fetch(request.clone());
            console.log("Response fetched");

            if ((await trySync()) && refetch) {
                console.log("Retrying fetch after sync");
                response = await fetch(request.clone());
            }

            return response;
        } catch (e) {
            console.error(request.url, e);
        }

        return null;
    });
}

async function trySync() {
    console.log("Syncing rides");

    const rides = await ridesDb.getAll("rides");
    if (rides.length === 0) {
        console.log("No rides to sync");
        return false;
    }

    for (const ride of rides) {
        if (ride.deletedAt) {
            await ridesDb.remove("rides", ride.id);
        } else {
            const request = new Request(`/api/bikes/${ride.bikeId}/rides`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    date: ride.date,
                    distance: ride.distance,
                    description: ride.description,
                }),
            });

            try {
                await fetch(request);
                await ridesDb.remove("rides", ride.id);
            } catch (e) {
                console.error(e);
            }
        }
    }

    console.log("Rides fully synced");
    return true;
}

async function getRides(request, [bikeIdStr]) {
    const response = await tryFetch(request, true);
    if (response) {
        return response;
    }

    const bikeId = parseInt(bikeIdStr, 10);
    const rides = await ridesDb.getAll("rides");
    const bikeRides = rides.filter((ride) => ride.bikeId === bikeId);

    return new Response(JSON.stringify(bikeRides), {
        headers: { "Content-Type": "application/json" },
    });
}

async function createRide(request, [bikeIdStr]) {
    const response = await tryFetch(request, false);
    if (response) {
        return response;
    }

    const bikeId = parseInt(bikeIdStr, 10);
    const ride = await request.json();
    ride.bikeId = bikeId;
    ride.deletedAt = null;

    const id = await ridesDb.insert("rides", ride);
    ride.id = id;

    return new Response(JSON.stringify(ride), {
        status: 201,
        headers: { "Content-Type": "application/json" },
    });
}

async function activeYears(request, [bikeIdStr]) {
    const response = await tryFetch(request, true);
    if (response) {
        return response;
    }

    const bikeId = parseInt(bikeIdStr, 10);
    const rides = await ridesDb.getAll("rides");
    const bikeRides = rides.filter((ride) => ride.bikeId === bikeId);

    const years = new Set();
    for (const ride of bikeRides) {
        const date = new Date(ride.date);
        years.add(date.getFullYear());
    }

    return new Response(JSON.stringify([...years]), {
        headers: { "Content-Type": "application/json" },
    });
}

async function monthlyRides(request, [bikeIdStr, yearStr]) {
    const response = await tryFetch(request, true);
    if (response) {
        return response;
    }

    const bikeId = parseInt(bikeIdStr, 10);
    const year = parseInt(yearStr, 10);

    const rides = await ridesDb.getAll("rides");
    const bikeRides = rides.filter((ride) => ride.bikeId === bikeId);

    const monthlyRides = [];
    for (let month = 1; month <= 12; month++) {
        const monthRides = bikeRides.filter((ride) => {
            const date = new Date(ride.date);
            return date.getFullYear() === year && date.getMonth() + 1 === month;
        });

        const totalDistance = monthRides.reduce(
            (acc, ride) => acc + ride.distance,
            0
        );

        monthlyRides.push({
            year,
            month,
            totalDistance,
            rides: monthRides,
        });
    }

    return new Response(JSON.stringify(monthlyRides.reverse()), {
        headers: { "Content-Type": "application/json" },
    });
}

async function updateRide(request, [rideIdStr]) {
    const response = await tryFetch(request, false);
    if (response) {
        return response;
    }

    const rideId = parseInt(rideIdStr, 10);
    const ride = await request.json();
    const oldRide = await ridesDb.get("rides", rideId);

    const updateRide = { ...oldRide, ...ride };
    await ridesDb.update("rides", updateRide);

    return new Response(JSON.stringify(updateRide), {
        headers: { "Content-Type": "application/json" },
    });
}

async function deleteRide(request, [rideIdStr]) {
    const response = await tryFetch(request, false);
    if (response) {
        return response;
    }

    const rideId = parseInt(rideIdStr, 10);
    await ridesDb.remove("rides", rideId);

    return new Response(null, { status: 204 });
}

export const rideRoutes = [
    get(/^\/api\/bikes\/(\d+)\/rides$/g, getRides),
    post(/^\/api\/bikes\/(\d+)\/rides$/g, createRide),
    get(/^\/api\/bikes\/(\d+)\/rides\/years$/g, activeYears),
    get(/^\/api\/bikes\/(\d+)\/rides\/monthly\/(\d+)$/g, monthlyRides),
    put(/^\/api\/rides\/(\d+)$/g, updateRide),
    del(/^\/api\/rides\/(\d+)$/g, deleteRide),
];
