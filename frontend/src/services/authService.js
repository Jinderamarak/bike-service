import { useApiClient } from "./AuthContext.jsx";

/**
 * @typedef SessionModel
 * @type {object}
 * @property {string} id
 * @property {string} token
 * @property {number} userId
 * @property {string} userAgent
 * @property {string} createdAt
 * @property {string} lastUsedAt
 * @property {?string} revokedAt
 */

function useAuthService() {
    const client = useApiClient();

    /**
     * @param {import("./userService.js").UserLogin} data
     * @returns {Promise<SessionModel>}
     */
    function login(data) {
        return client.post("/api/auth", data);
    }

    /**
     * @returns {Promise<[any, SessionModel]>}
     */
    function whoami() {
        return client.get("/api/auth");
    }

    /**
     * @returns {Promise<void>}
     */
    function logout() {
        return client.delete("/api/auth");
    }

    /**
     * @param {string} sessionId
     * @returns {Promise<void>}
     */
    function revoke(sessionId) {
        return client.delete(`/api/auth/${sessionId}`);
    }

    return { login, whoami, logout, revoke };
}

export default useAuthService;
