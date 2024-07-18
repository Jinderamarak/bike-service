/**
 * Individual function responsible for handling given request and returning
 * a response or null in case the request is unhandled.
 * @callback HttpRouteHandler
 * @param {Request} request HTTP Request
 * @param {(string | number)[]} params Captured groups from the path
 * @returns {Promise<Response | null>} Response or null if the request is unhandled
 */

/**
 * Tests the given path against a regexp of the route path and calls a handler
 * if the method matches and the path matches the regexp.
 * @callback HttpRoute
 * @param {string} path HTTP Request path
 * @param {Request} request HTTP Request
 * @returns {Promise<Response | null>} Response or null if the request is unhandled
 */

/**
 * Tests the given request against given routes (see {@link HttpRoute}) and returns
 * the response of the first matching route or null if no route matches.
 * @callback HttpRouter
 * @param {Request} request HTTP Request
 * @returns {Promise<Response | null>} Response or null if the request is unhandled
 */

/**
 * Creates a route (see {@link HttpRoute}) for a given HTTP method and path regexp.
 * @param {string} method HTTP Method
 * @param {RegExp} regexp Global RegExp for the path with capture groups for parameters
 * @param {HttpRouteHandler} handler Route handler
 * @returns {HttpRoute} New route
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
            const params = matches[0].slice(1).map(String).map(transformParam);
            const response = await handler(request, params);
            return response;
        }
        return null;
    };
}

/**
 * @param {string} param
 * @returns {string | number}
 */
function transformParam(param) {
    const asInt = parseInt(param);
    if (param === asInt.toString()) {
        return asInt;
    }

    return param;
}

/**
 * Creates a HTTP GET route.
 * @param {RegExp} regexp Global RegExp for the path with capture groups for parameters
 * @param {HttpRouteHandler} handler Route handler
 * @returns {HttpRoute} New route
 */
export function get(regexp, handler) {
    return anyRoute("GET", regexp, handler);
}

/**
 * Creates a HTTP POST route.
 * @param {RegExp} regexp Global RegExp for the path with capture groups for parameters
 * @param {HttpRouteHandler} handler Route handler
 * @returns {HttpRoute} New route
 */
export function pot(regexp, handler) {
    return anyRoute("POST", regexp, handler);
}

/**
 * Creates a HTTP PUT route.
 * @param {RegExp} regexp Global RegExp for the path with capture groups for parameters
 * @param {HttpRouteHandler} handler Route handler
 * @returns {HttpRoute} New route
 */
export function put(regexp, handler) {
    return anyRoute("PUT", regexp, handler);
}

/**
 * Creates a HTTP DELETE route.
 * @param {RegExp} regexp Global RegExp for the path with capture groups for parameters
 * @param {HttpRouteHandler} handler Route handler
 * @returns {HttpRoute} New route
 */
export function del(regexp, handler) {
    return anyRoute("DELETE", regexp, handler);
}

/**
 * Creates a router (see {@link HttpRouter}) for given routes (see {@link HttpRoute}).
 * @param {HttpRoute[]} routes List of routes
 * @returns {HttpRouter} New router
 */
export function httpRouter(routes) {
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
