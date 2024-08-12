import { useApiClient } from "../components/AuthContext.jsx";

/**
 * @typedef StravaLink
 * @type {object}
 * @property {number} userId
 * @property {number} stravaId
 * @property {string} stravaName
 */

/**
 * @typedef SummaryGear
 * @type {object}
 * @property {string} id
 * @property {string} name
 */

export default function useStravaService() {
    const client = useApiClient();

    /**
     * @returns {Promise<{ url: string }>}
     */
    function getOAuthRedirect() {
        return client.get("/api/strava/link");
    }

    /**
     * @returns {Promise<void>}
     */
    function unlink() {
        return client.delete("/api/strava/link");
    }

    /**
     * @returns {Promise<StravaLink>}
     */
    function getLink() {
        return client.get("/api/strava", true);
    }

    /**
     * @returns {Promise<SummaryGear[]>}
     */
    function getBikes() {
        return client.get("/api/strava/bikes");
    }

    /**
     * @returns {Promise<void>}
     */
    function sync() {
        return client.post("/api/strava", {});
    }

    return { getOAuthRedirect, unlink, getLink, getBikes, sync };
}
