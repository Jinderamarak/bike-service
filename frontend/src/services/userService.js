import { useApiClient } from "../components/AuthContext.jsx";

/**
 * @typedef UserModel
 * @type {object}
 * @property {number} id
 * @property {string} username
 * @property {?number} monthlyGoal
 * @property {string} createdAt
 * @property {?string} deletedAt
 */

/**
 * @typedef UserPartial
 * @type {object}
 * @property {string} username
 * @property {?number} monthlyGoal
 */

/**
 * @typedef UserLogin
 * @type {object}
 * @property {string} username
 */

export default function useUserService() {
    const client = useApiClient();

    /**
     * @param {UserPartial} data
     * @returns {Promise<UserModel>}
     */
    function create(data) {
        return client.post("/api/users", data);
    }

    /**
     * @returns {Promise<UserModel>}
     */
    function current() {
        return client.get("/api/users");
    }

    /**
     * @param {UserPartial} data
     * @returns {Promise<UserModel>}
     */
    function update(data) {
        return client.put("/api/users", data);
    }

    /**
     * @returns {Promise<void>}
     */
    function deleteUser() {
        return client.delete(`/api/users`);
    }

    return { create, current, update, delete: deleteUser };
}
