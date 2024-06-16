import AsyncDB from "../../lib/db";

function mapId(id) {
    return -id;
}

function mapRideId(ride) {
    return {
        ...ride,
        id: mapId(ride.id),
    };
}

function mapRideIds(rides) {
    return rides.map(mapRideId);
}

class RidesDB {
    /** @type {AsyncDB} */
    #db;

    constructor() {
        this.#db = new AsyncDB("rides", 1, this.#initializeDb);
    }

    /** @type {import("../../lib/db").OnUpgradeNeeded} */
    #initializeDb(db, prev, next) {
        const store = db.createObjectStore("rides", {
            keyPath: "id",
            autoIncrement: true,
        });
        store.createIndex("bikeId_index", "bikeId", { unique: false });
    }

    async initialize() {
        await this.#db.open();
    }

    async getAllRides() {
        await this.#db.open();
        return mapRideIds(await this.#db.getAll("rides"));
    }

    async getRides(bikeId) {
        await this.#db.open();
        return new Promise((resolve, reject) => {
            const request = this.#db.db
                .transaction("rides")
                .objectStore("rides")
                .index("bikeId_index")
                .getAll(bikeId);

            request.onsuccess = () =>
                resolve(
                    mapRideIds(request.result).filter((ride) => !ride.deletedAt)
                );
            request.onerror = () => reject(request.error);
        });
    }

    async addRide(ride) {
        await this.#db.open();
        return mapId(await this.#db.add("rides", ride));
    }

    async updateRide(ride) {
        await this.#db.open();
        return mapId(await this.#db.put("rides", mapRideId(ride)));
    }

    async clearRide(rideId) {
        await this.#db.open();
        await this.#db.delete("rides", mapId(rideId));
    }

    async deleteRide(bikeId, rideId) {
        await this.#db.open();
        const ride = await this.#db.get("rides", mapId(rideId));
        if (!ride) {
            return this.#deleteForeignRide(bikeId, rideId);
        }

        ride.deletedAt = new Date().toISOString();
        await this.#db.put("rides", ride);
        return mapId(ride.id);
    }

    async #deleteForeignRide(bikeId, rideId) {
        const ride = {
            id: mapId(rideId),
            date: "",
            distance: -1,
            description: "",
            deletedAt: new Date().toISOString(),
            bikeId,
        };
        await this.#db.put("rides", ride);
        return rideId;
    }
}

const ridesDb = new RidesDB();
export default ridesDb;
