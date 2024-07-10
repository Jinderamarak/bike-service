import ridesDb from "./db.js";
import { del, get, pot, put } from "../../lib/router.js";

async function getRides(_, [bikeId]) {
    const rides = ridesDb.getRides(bikeId);
    return new Response(JSON.stringify(rides), {
        headers: { "Content-Type": "application/json" },
    });
}

async function createRide(request, [bikeId]) {
    const ride = await request.json();
    ride.bikeId = bikeId;
    ride.deletedAt = null;

    const id = await ridesDb.addRide(ride);
    ride.id = id;

    return new Response(JSON.stringify(ride), {
        status: 201,
        headers: { "Content-Type": "application/json" },
    });
}

async function activeYears(_, [bikeId]) {
    const rides = await ridesDb.getRides(bikeId);

    const years = new Set();
    rides.forEach((ride) => {
        const year = new Date(ride.date).getFullYear();
        years.add(year);
    });

    return new Response(JSON.stringify([...years]), {
        headers: { "Content-Type": "application/json" },
    });
}

async function ridesMonth(_, [bikeId, year, month]) {
    const rides = await ridesDb.getRides(bikeId);

    const monthRides = rides.filter((ride) => {
        const date = new Date(ride.date);
        return date.getFullYear() === year && date.getMonth() + 1 === month;
    });

    const totalDistance = monthRides.reduce(
        (acc, ride) => acc + ride.distance,
        0
    );

    const result = {
        year,
        month,
        totalDistance,
        rides: monthRides,
    };

    return new Response(JSON.stringify(result), {
        headers: { "Content-Type": "application/json" },
    });
}

async function updateRide(request, [bikeId, rideId]) {
    const ride = await request.json();
    ride.id = rideId;
    ride.bikeId = bikeId;

    const updatedId = await ridesDb.updateRide(ride);
    if (updatedId >= 0) {
        console.warn("Updated foreign ride", updatedId);
    }

    return new Response(JSON.stringify(ride), {
        headers: { "Content-Type": "application/json" },
    });
}

async function deleteRide(_, [bikeId, rideId]) {
    const deletedId = await ridesDb.deleteRide(bikeId, rideId);
    if (deletedId >= 0) {
        console.warn("Deleted foreign ride", deletedId);
    }

    return new Response(null, { status: 204 });
}

export const rideRoutes = [
    get(/^\/api\/bikes\/(\d+)\/rides$/g, getRides),
    pot(/^\/api\/bikes\/(\d+)\/rides$/g, createRide),
    get(/^\/api\/bikes\/(\d+)\/rides\/years$/g, activeYears),
    get(/^\/api\/bikes\/(\d+)\/rides\/(\d+)\/(\d+)$/g, ridesMonth),
    put(/^\/api\/bikes\/(\d+)\/rides\/(-?\d+)$/g, updateRide),
    del(/^\/api\/bikes\/(\d+)\/rides\/(-?\d+)$/g, deleteRide),
];
