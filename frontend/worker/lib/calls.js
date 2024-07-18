/**
 * @callback CallRouteHandler
 * @param {object} payload
 * @returns {Promise<object | null>}
 */

/**
 * @callback StreamRouteHandler
 * @param {object} payload
 * @param {(object) => Promise<void>} next
 * @returns {Promise<boolean | null>}
 */

/**
 * @callback CallRoute
 * @param {string} id
 * @param {string} variant
 * @param {object} payload
 * @param {MessageEvent & ExtendableMessageEvent} event
 * @returns {Promise<object | null>}
 */

/**
 * @callback CallRouter
 * @param {MessageEvent & ExtendableMessageEvent} event
 */

/**
 * @param {string} variant
 * @param {CallRouteHandler} handler
 * @returns {CallRoute}
 */
export function call(variant, handler) {
    return async (_id, v, payload, _event) => {
        if (variant !== v) {
            return null;
        }

        return handler(payload);
    };
}

/**
 * @param {string} variant
 * @param {StreamRouteHandler} handler
 * @returns {CallRoute}
 */
export function stream(variant, handler) {
    return async (id, v, payload, event) => {
        if (variant !== v) {
            return null;
        }

        async function next(item) {
            event.source.postMessage({ id, variant, item });
        }

        const done = await handler(payload, next);
        if (done === null) {
            return null;
        }

        return { done };
    };
}

/**
 * @param {CallRoute[]} routes
 * @returns {CallRouter}
 */
export function callRouter(routes) {
    return (event) => {
        if (!isCall(event.data)) {
            return;
        }

        event.waitUntil(innerRouter(event, routes));
    };
}

function isCall(data) {
    return "id" in data && "variant" in data && "payload" in data;
}

/**
 * @param {MessageEvent & ExtendableMessageEvent} event
 * @param {CallRoute[]} routes
 * @returns {Promise<void>}
 */
async function innerRouter(event, routes) {
    const { id, variant, payload } = event.data;
    for (const route of routes) {
        try {
            const response = await route(id, variant, payload, event);
            if (response !== null) {
                event.source.postMessage({ id, variant, payload: response });
                return;
            }
        } catch (error) {
            event.source.postMessage({ id, variant, error: error.message });
            return;
        }
    }

    event.source.postMessage({ id, variant, error: "Call unhandled" });
}
