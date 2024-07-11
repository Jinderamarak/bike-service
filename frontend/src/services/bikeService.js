import { useApiClient } from "./AuthContext.jsx";

/**
 * @typedef BikeModel
 * @type {object}
 * @property {number} id
 * @property {number} ownerId
 * @property {string} name
 * @property {?string} description
 * @property {?string} color
 * @property {?string} deletedAt
 */

/**
 * @typedef BikePartial
 * @type {object}
 * @property {string} name
 * @property {?string} description
 * @property {?string} color
 */

function useBikeService() {
    const client = useApiClient();

    /**
     * @returns {Promise<BikeModel[]>}
     */
    function getAll() {
        return client.get("/api/bikes");
    }

    /**
     * @param {BikePartial} data
     * @returns {Promise<BikeModel>}
     */
    function create(data) {
        return client.post("/api/bikes", data);
    }

    /**
     * @param {number} bikeId
     * @returns {Promise<BikeModel>}
     */
    function get(bikeId) {
        return client.get(`/api/bikes/${bikeId}`);
    }

    /**
     * @param {number} bikeId
     * @param {BikePartial} data
     * @returns {Promise<BikeModel>}
     */
    function update(bikeId, data) {
        return client.put(`/api/bikes/${bikeId}`, data);
    }

    /**
     * @param {number} bikeId
     * @returns {Promise<void>}
     */
    function deleteBike(bikeId) {
        return client.delete(`/api/bikes/${bikeId}`);
    }

    return { getAll, create, delete: deleteBike, get, update };
}

export default useBikeService;
