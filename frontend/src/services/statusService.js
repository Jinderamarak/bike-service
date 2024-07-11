import { useApiClient } from "./AuthContext.jsx";

/**
 * @typedef StatusModel
 * @type {object}
 * @property {number} version
 * @property {string[]} hostnames
 */

function useStatusService() {
    const client = useApiClient();

    /**
     * @returns {Promise<StatusModel>}
     */
    function get() {
        return client.get("/api/status");
    }

    return { get };
}

export default useStatusService;
