/**
 * @callback routeHandler
 * @param {Request} request
 * @param {string[]} params
 */

/**
 * @callback route
 * @param {string} path
 * @param {Request} request
 * @returns {Promise<Response | null>}
 */

/**
 * @callback router
 * @param {Request} request
 * @returns {Promise<Response | null>}
 */

/**
 * @param {string} method
 * @param {RegExp} regexp
 * @param {routeHandler} handler
 * @returns {route}
 */
function anyRoute(method, regexp, handler) {
    if (!regexp.global) {
        console.error("RegExp must be global: ", regexp);
        throw new Error("RegExp must be global");
    }

    return async (path, request) => {
        if (request.method !== method) {
            return null;
        }

        const match = path.matchAll(regexp);
        const matches = [...match];

        if (matches.length > 0) {
            console.log("Matched route: ", method, regexp);
            return await handler(
                request,
                matches[0].slice(1).map((s) => String(s))
            );
        }
        return null;
    };
}

/**
 * @param {RegExp} regexp
 * @param {routeHandler} handler
 * @returns {route}
 */
export function get(regexp, handler) {
    return anyRoute("GET", regexp, handler);
}

/**
 * @param {RegExp} regexp
 * @param {routeHandler} handler
 * @returns {route}
 */
export function post(regexp, handler) {
    return anyRoute("POST", regexp, handler);
}

/**
 * @param {RegExp} regexp
 * @param {routeHandler} handler
 * @returns {route}
 */
export function put(regexp, handler) {
    return anyRoute("PUT", regexp, handler);
}

/**
 * @param {RegExp} regexp
 * @param {routeHandler} handler
 * @returns {route}
 */
export function del(regexp, handler) {
    return anyRoute("DELETE", regexp, handler);
}

/**
 * @param {route[]} routes
 * @returns {router}
 */
export function router(routes) {
    return async (request) => {
        const url = new URL(request.url);
        const path = url.pathname;

        for (const route of routes) {
            const response = await route(path, request);
            if (response) {
                return response;
            }
        }

        return null;
    };
}
