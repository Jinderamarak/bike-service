export function isWorkerAvailable() {
    return navigator.serviceWorker?.controller !== null;
}

/**
 * @param {string} variant
 * @param {object} payload
 * @param {number} timeout
 * @returns {Promise<object | null>}
 */
export async function workerCall(variant, payload = {}, timeout = 5000) {
    if (!isWorkerAvailable()) {
        return null;
    }

    const id = Math.random().toString(36).substring(2);
    return new Promise((resolve, reject) => {
        function messageHandler(event) {
            if (event.data.variant !== variant) {
                return;
            }
            if (event.data.id !== id) {
                return;
            }

            if (event.data.error) {
                console.log(`Call ${variant}/${id} error:`, event.data.error);
                reject(new Error(event.data.error));
            }
            if (event.data.item) {
                console.log(`Call ${variant}/${id} item:`, event.data.item);
                reject(new Error("Expected call but got stream"));
            }
            if (event.data.payload) {
                console.log(
                    `Call ${variant}/${id} payload:`,
                    event.data.payload
                );
                resolve(event.data.payload);
            }
        }

        navigator.serviceWorker.addEventListener("message", messageHandler);
        function cleanup() {
            navigator.serviceWorker.removeEventListener(
                "message",
                messageHandler
            );
        }

        console.log(`Call ${variant}/${id} start`);
        navigator.serviceWorker.controller.postMessage({
            id,
            variant,
            payload,
        });
        setTimeout(() => {
            cleanup();
            reject(new Error("Timeout"));
        }, timeout);
    });
}

/**
 * @param {string} variant
 * @param {object} payload
 * @param {(object) => void} onNext
 * @param {() => void} onFinished
 * @param {(Error) => void} onError
 * @param {number} timeout
 * @returns {() => void}
 */
export function workerStream(
    variant,
    payload,
    onNext,
    onFinished,
    onError,
    timeout = 5000
) {
    if (!isWorkerAvailable()) {
        return () => {};
    }

    let cleanup = () => {};
    let timeId = setTimeout(() => {
        cleanup();
        onError(new Error("Timeout"));
    }, timeout);

    function updateTimeout() {
        clearTimeout(timeId);
        timeId = setTimeout(() => {
            cleanup();
            onError(new Error("Timeout"));
        }, timeout);
    }

    const id = Math.random().toString(36).substring(2);
    function messageHandler(event) {
        if (event.data.variant !== variant) {
            return;
        }
        if (event.data.id !== id) {
            return;
        }

        if (event.data.error) {
            console.log(`Stream ${variant}/${id} error:`, event.data.error);
            onError(new Error(event.data.error));
            cleanup();
        }

        if (event.data.item) {
            console.log(`Stream ${variant}/${id} item:`, event.data.item);
            onNext(event.data.item);
            updateTimeout();
        }

        if (event.data.payload) {
            console.log(`Stream ${variant}/${id} payload:`, event.data.payload);
            if ("done" in event.data.payload) {
                onFinished();
                cleanup();
            } else {
                throw new Error("Expected stream but got call");
            }
        }
    }

    navigator.serviceWorker.addEventListener("message", messageHandler);
    cleanup = () => {
        navigator.serviceWorker.removeEventListener("message", messageHandler);
        clearTimeout(timeId);
    };

    console.log(`Stream ${variant}/${id} start`);
    navigator.serviceWorker.controller.postMessage({
        id,
        variant,
        payload,
    });

    return cleanup;
}
