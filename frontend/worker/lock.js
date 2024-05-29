class AsyncMutex {
    constructor() {
        this.waiters = [];
        this.locked = false;
    }

    /**
     * @returns {Promise<() => void>}
     */
    async acquire() {
        if (!this.locked) {
            this.locked = true;
            return () => this.#release();
        }

        return new Promise((resolve) => {
            this.waiters.push(resolve);
        });
    }

    /** */
    #release() {
        if (this.waiters.length > 0) {
            const resolve = this.waiters.shift();
            resolve(() => this.#release());
        } else {
            this.locked = false;
        }
    }

    /**
     * @template T
     * @param {() => Promise<T>} fn
     * @returns {Promise<T>}
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
     * @template T
     * @param {(...args: any[]) => Promise<T>} fn
     * @returns {(...args: any[]) => Promise<T>}
     */
    wrap(fn) {
        return async (...args) => {
            return await this.run(() => fn(...args));
        };
    }
}

export default AsyncMutex;
