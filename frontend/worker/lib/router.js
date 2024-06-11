/**
 * Individual function responsible for handling given request and returning
 * a response or null in case the request is unhandled.
 * @callback RouteHandler
 * @param {Request} request HTTP Request
 * @param {string[]} params Captured groups from the path
 * @returns {Promise<Response | null>} Response or null if the request is unhandled
 */

/**
 * Tests the given path against a regexp of the route path and calls a handler
 * if the method matches and the path matches the regexp.
 * @callback Route
 * @param {string} path HTTP Request path
 * @param {Request} request HTTP Request
 * @returns {Promise<Response | null>} Response or null if the request is unhandled
 */

/**
 * Tests the given request against given routes (see {@link Route}) and returns
 * the response of the first matching route or null if no route matches.
 * @callback Router
 * @param {Request} request HTTP Request
 * @returns {Promise<Response | null>} Response or null if the request is unhandled
 */

/**
 * Creates a route (see {@link Route}) for a given HTTP method and path regexp.
 * @param {string} method HTTP Method
 * @param {RegExp} regexp Global RegExp for the path with capture groups for parameters
 * @param {RouteHandler} handler Route handler
 * @returns {Route} New route
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
            return await handler(
                request,
                matches[0].slice(1).map((s) => String(s))
            );
        }
        return null;
    };
}

/**
 * Creates a HTTP GET route.
 * @param {RegExp} regexp Global RegExp for the path with capture groups for parameters
 * @param {RouteHandler} handler Route handler
 * @returns {Route} New route
 */
export function get(regexp, handler) {
    return anyRoute("GET", regexp, handler);
}

/**
 * Creates a HTTP POST route.
 * @param {RegExp} regexp Global RegExp for the path with capture groups for parameters
 * @param {RouteHandler} handler Route handler
 * @returns {Route} New route
 */
export function post(regexp, handler) {
    return anyRoute("POST", regexp, handler);
}

/**
 * Creates a HTTP PUT route.
 * @param {RegExp} regexp Global RegExp for the path with capture groups for parameters
 * @param {RouteHandler} handler Route handler
 * @returns {Route} New route
 */
export function put(regexp, handler) {
    return anyRoute("PUT", regexp, handler);
}

/**
 * Creates a HTTP DELETE route.
 * @param {RegExp} regexp Global RegExp for the path with capture groups for parameters
 * @param {RouteHandler} handler Route handler
 * @returns {Route} New route
 */
export function del(regexp, handler) {
    return anyRoute("DELETE", regexp, handler);
}

/**
 * Creates a router (see {@link Router}) for given routes (see {@link Route}).
 * @param {Route[]} routes List of routes
 * @returns {Router} New router
 */
export function Router(routes) {
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
