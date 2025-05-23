import { useApiClient } from "../components/AuthContext.jsx";

/**
 * @typedef RideModel
 * @type {object}
 * @property {number} id
 * @property {number} bikeId
 * @property {string} date
 * @property {number} distance
 * @property {?string} description
 * @property {?string} deletedAt
 * @property {?number} stravaRide
 */

/**
 * @typedef RidePartial
 * @type {object}
 * @property {string} date
 * @property {number} distance
 * @property {?string} description
 * @property {?number} stravaRide
 */

/**
 * @typedef RideMonth
 * @type {object}
 * @property {number} year
 * @property {number} month
 * @property {number} totalDistance
 * @property {RideModel[]} rides
 */

/**
 * @param {number} bikeId
 */
export default function useRideService(bikeId) {
    const client = useApiClient();

    /**
     * @returns Promise<RideModel[]>
     */
    function getAll() {
        return client.get(`/api/bikes/${bikeId}/rides`);
    }

    /**
     * @param {RidePartial} data
     * @returns Promise<RideModel>
     */
    function create(data) {
        return client.post(`/api/bikes/${bikeId}/rides`, data);
    }

    /**
     * @returns Promise<number[]>
     */
    function getActiveYears() {
        return client.get(`/api/bikes/${bikeId}/rides/years`).then((data) => {
            data.sort((a, b) => b - a);
            return data;
        });
    }

    /**
     * @param {number} year
     * @returns {Promise<RideMonth[]>}
     */
    function getMonthlyRides(year) {
        return client.get(`/api/bikes/${bikeId}/rides/monthly/${year}`);
    }

    /**
     * @param {number} year
     * @param {number} month
     * @returns {Promise<RideMonth>}
     */
    function getMonth(year, month) {
        return client.get(`/api/bikes/${bikeId}/rides/${year}/${month}`);
    }

    /**
     * @param {number} rideId
     * @returns {Promise<RideModel>}
     */
    function get(rideId) {
        return client.get(`/api/bikes/${bikeId}/rides/${rideId}`);
    }

    /**
     * @param {number} rideId
     * @param {RidePartial} data
     * @returns {Promise<RideModel>}
     */
    function update(rideId, data) {
        return client.put(`/api/bikes/${bikeId}/rides/${rideId}`, data);
    }

    /**
     * @param {number} rideId
     * @returns {Promise<void>}
     */
    function deleteRide(rideId) {
        return client.delete(`/api/bikes/${bikeId}/rides/${rideId}`);
    }

    /**
     * @param {number} year
     * @returns {Promise<number>}
     */
    function totalDistance(year) {
        return client.get(`/api/bikes/${bikeId}/rides/total/${year}`);
    }

    return {
        getAll,
        create,
        delete: deleteRide,
        get,
        getActiveYears,
        getMonthlyRides,
        getMonth,
        update,
        totalDistance,
    };
}
