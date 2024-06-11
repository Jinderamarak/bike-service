/**
 * Releases the lock.
 * @callback LockRelease
 * @returns {void}
 */

/**
 * Waits for the lock to be released.
 * @callback Waiter
 * @param {LockRelease} release Release callback
 * @returns {void}
 */

/**
 * Asynchronous mutually exclusive lock with FIFO wake-up order.
 * Safe to use in single-threaded event loop environments.
 */
class AsyncMutex {
    /** @type {boolean} */
    #locked;

    /** @type {Waiter[]} */
    #waiters;

    /**
     * Creates a new unlocked mutex.
     */
    constructor() {
        this.#waiters = [];
        this.#locked = false;
    }

    /**
     * Checks if the lock is currently held.
     * @returns {boolean} True if the lock is held
     */
    isLocked() {
        return this.#locked;
    }

    /**
     * Waits for the lock to be released and then acquires it.
     * @returns {Promise<LockRelease>} A function that releases the lock
     */
    async acquire() {
        if (!this.#locked) {
            this.#locked = true;
            return () => this.#release();
        }

        return new Promise((resolve) => {
            this.#waiters.push(resolve);
        });
    }

    /**
     * Releases the lock and wakes up next waiter.
     */
    #release() {
        if (this.#waiters.length > 0) {
            const resolve = this.#waiters.shift();
            resolve(() => this.#release());
        } else {
            this.locked = false;
        }
    }

    /**
     * Runs a function inside the lock.
     * @template T
     * @param {() => Promise<T>} fn Function to run
     * @returns {Promise<T>} Result of the function
     */
    async run(fn) {
        const release = await this.acquire();
        let err = null;
        try {
            return await fn();
        } catch (e) {
            err = e;
            console.error("Error inside lock:", e);
        } finally {
            release();
        }

        throw err;
    }

    /**
     * Wraps a function to run inside the lock.
     * @template T
     * @param {(...args: any[]) => Promise<T>} fn Function to wrap
     * @returns {(...args: any[]) => Promise<T>} Wrapped function
     */
    wrap(fn) {
        return async (...args) => {
            return await this.run(() => fn(...args));
        };
    }
}

export default AsyncMutex;
