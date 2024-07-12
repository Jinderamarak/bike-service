import { useApiClient } from "../components/AuthContext.jsx";

/**
 * @typedef StatusModel
 * @type {object}
 * @property {number} version
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
