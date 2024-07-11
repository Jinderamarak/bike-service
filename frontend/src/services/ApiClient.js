import { notifications } from "@mantine/notifications";

const DEFAULT_TIMEOUT = 6000;

export class ApiError extends Error {
    /** @type {Response} */
    response;

    /**
     * @param {string} message
     * @param {Response} response
     */
    constructor(message, response) {
        super(message);
        this.name = "ApiError";
        this.response = response;
    }
}

class ApiClient {
    /** @type {string | null} */
    authToken = null;

    /** @type {(() => void)[]} */
    #eventListeners = [];

    constructor(authToken) {
        this.authToken = authToken;
    }

    /**
     * @param {() => void} callback
     */
    onUnauthorized(callback) {
        this.#eventListeners.push(callback);
    }

    #applyAuth(options) {
        if (this.authToken) {
            options.headers = {
                ...options.headers,
                Authorization: `Bearer ${this.authToken}`,
            };
        }
    }

    /**
     * @param {string} resource
     * @param {*} options
     * @param {number} timeout
     * @returns
     */
    async #request(resource, options, timeout) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        this.#applyAuth(options);
        try {
            const response = await fetch(resource, {
                ...options,
                signal: controller.signal,
            });

            if (response.status === 401) {
                this.#eventListeners.forEach((cb) => cb());
            }

            if (response.status === 204) {
                return;
            }

            if (response.ok) {
                return await response.json();
            }

            const text = await response.text();
            notifications.show({
                title: "API Request Failed",
                message: text,
                color: "red",
                withBorder: true,
            });

            throw new ApiError(text, response);
        } catch (e) {
            console.error(e);
            throw e;
        } finally {
            clearTimeout(timeoutId);
        }
    }

    async get(resource, timeout = DEFAULT_TIMEOUT) {
        return this.#request(resource, { method: "GET" }, timeout);
    }

    async post(resource, body, timeout = DEFAULT_TIMEOUT) {
        return this.#request(
            resource,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            },
            timeout
        );
    }

    async put(resource, body, timeout = DEFAULT_TIMEOUT) {
        return this.#request(
            resource,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            },
            timeout
        );
    }

    async delete(resource, timeout = DEFAULT_TIMEOUT) {
        return this.#request(resource, { method: "DELETE" }, timeout);
    }

    async head(resource, timeout = DEFAULT_TIMEOUT) {
        return this.#request(resource, { method: "HEAD" }, timeout);
    }
}

export default ApiClient;
