import { useApiClient } from "../components/AuthContext.jsx";

/**
 * @typedef Integration
 * @type {"strava"}
 */

/**
 * @typedef StatusModel
 * @type {object}
 * @property {number} version
 * @property {Integration[]} integrations
 * @property {string[]} hostnames
 */

export default function useStatusService() {
    const client = useApiClient();

    /**
     * @returns {Promise<StatusModel>}
     */
    function get() {
        return client.get("/api/status");
    }

    return { get };
}
