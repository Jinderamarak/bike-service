import { openCache } from "../cache.js";
import { sw } from "../worker.js";
import AsyncMutex from "./lock.js";

const TIMEOUT_TIME = 5000;

/**
 * @param {URL} host
 * @returns {Promise<{host: URL, available: boolean}>}
 */
async function testHost(host) {
    const url = `${host.origin}/api/status`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_TIME);

    try {
        const response = await fetch(url, {
            method: "HEAD",
            signal: controller.signal,
        });
        return { host, available: response.ok };
    } catch (e) {
        // ignore error, probably timed out
    } finally {
        clearTimeout(timeout);
    }

    return { host, available: false };
}

class MultiFetcher {
    /** @type {URL[]} */
    #hosts;

    /** @type {URL | null} */
    #current;

    /** @type {boolean} */
    #initialized;

    /** @type {AsyncMutex} */
    #initLock;

    /**
     * @param {URL[]} hosts
     */
    constructor(hosts) {
        this.#hosts = hosts;
        this.#current = null;
        this.#initialized = false;
        this.#initLock = new AsyncMutex();
    }

    /**
     * Uses the cached response from `/api/status` to create a MultiFetcher instance.
     * @returns {Promise<MultiFetcher>} MultiFetcher instance
     */
    static async fromCache() {
        const cache = await openCache();
        const response = await cache.match("/api/status");
        const body = await response.json();
        const hosts = body.hostnames.map((h) => new URL(h));

        if (hosts.length === 0) {
            hosts.push(new URL(sw.location.origin));
        }

        return new MultiFetcher(hosts);
    }

    /**
     * Initializes the MultiFetcher instance by selecting the fastest host.
     * @returns {Promise<void>}
     */
    async initialize() {
        if (this.#initialized) {
            return;
        }

        await this.#initLock.run(async () => {
            if (this.#initialized) {
                return;
            }

            await this.selectHost();
            this.#initialized = true;
        });
    }

    /**
     * Tests all hosts.
     * @returns {Promise<{host: URL, available: boolean}[]>}
     */
    async testHosts() {
        this.initialize();
        const tests = this.#hosts.map(testHost);
        return Promise.all(tests);
    }

    /**
     * Selects the fastest host or keeps the current one if it is available.
     * @returns {Promise<boolean>} True if any host is available
     */
    async selectHost() {
        this.initialize();
        const currentTest = this.#current
            ? testHost(this.#current)
            : new Promise((r) => r(null));
        const tests = this.#hosts.map(testHost);
        const fastestTest = Promise.race(tests);

        const [current, fastest] = await Promise.all([
            currentTest,
            fastestTest,
        ]);

        if (current && current.available) {
            return true;
        }

        if (!fastest.available) {
            if (this.#current) {
                this.#current = null;
                //await postNetworkChanged(false, null);
            }
            return false;
        }

        if (fastest.host === this.#current) {
            return true;
        }

        this.#current = fastest.host;
        //await postNetworkChanged(true, this.#current);
        return true;
    }

    /**
     * Fetches the given request from the selected host.
     * @param {Request} request HTTP Request
     * @returns {Promise<Response | null>} Response or null if no host is available
     */
    async fetch(request) {
        this.initialize();
        if (this.#current === null) {
            return null;
        }

        const path = new URL(request.url).pathname;
        const url = `${this.#current.origin}${path}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), TIMEOUT_TIME);

        const req = request.clone();
        const method = req.method;
        const headers = req.headers;

        let body = undefined;
        if (method !== "GET" && method !== "HEAD") {
            body = await req.text();
        }

        try {
            return await fetch(url, {
                signal: controller.signal,
                headers,
                method,
                body,
            });
        } catch (e) {
            if (e.name === "AbortError") {
                // timeouted
                return null;
            }
            if (
                e.name === "TypeError" &&
                e.message.startsWith("NetworkError")
            ) {
                // offline
                return null;
            }

            throw e;
        } finally {
            clearTimeout(timeout);
        }
    }

    /**
     * Checks if any host is selected.
     * @returns {boolean} True if no host is selected
     */
    isOffline() {
        return this.#current === null;
    }
}

export default MultiFetcher;

let multiFetcherInstance = null;
let multiFetcherCreateLock = new AsyncMutex();

/**
 * Fetches the given request from the available hosts.
 * @param {Request} request HTTP Request
 * @returns {Promise<Response | null>} Response or null if no host is available
 */
export async function multiFetch(request) {
    const fetcher = await getMultiFetcher();
    return fetcher.fetch(request);
}

/**
 * Singleton MultiFetcher instance.
 * @returns {Promise<MultiFetcher>}
 */
export async function getMultiFetcher() {
    if (!multiFetcherInstance) {
        await multiFetcherCreateLock.run(async () => {
            if (!multiFetcherInstance) {
                multiFetcherInstance = await MultiFetcher.fromCache();
            }
        });
    }

    return multiFetcherInstance;
}
