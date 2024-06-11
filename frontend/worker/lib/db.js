import { sw } from "../worker.js";

/**
 * @callback OnUpgradeNeeded
 * @param {IDBDatabase} db Database
 * @param {number} oldVersion Old DB version
 * @param {number} newVersion New DB version
 */

/**
 * Asynchronous wrapper around IndexedDB with simplified API.
 */
class AsyncDB {
    /** @type {string} */
    #name;

    /** @type {number} */
    #version;

    /** @type {OnUpgradeNeeded} */
    #onUpgradeNeeded;

    /** @type {IDBDatabase | null} */
    #db;

    /**
     * Creates a new closed database.
     * @param {string} name Database name
     * @param {number} version Database version
     * @param {OnUpgradeNeeded} onUpgradeNeeded Callback for upgrading the database
     */
    constructor(name, version, onUpgradeNeeded) {
        this.#name = name;
        this.#version = version;
        this.#onUpgradeNeeded = onUpgradeNeeded;
        this.#db = null;
    }

    /**
     * Opens the database and upgrades it if necessary.
     * Opening the database is needed before any other operations.
     * @returns {Promise<AsyncDB>} This database
     */
    async open() {
        if (this.#db) {
            return this;
        }

        const request = sw.indexedDB.open(this.#name, this.#version);
        return new Promise((resolve, reject) => {
            request.onupgradeneeded = (event) => {
                console.log(
                    `Upgrading database "${this.#name}" from ${
                        event.oldVersion
                    } to ${event.newVersion}`
                );
                // @ts-ignore
                const db = event.target.result;
                const old = event.oldVersion;
                const next = event.newVersion;
                this.#onUpgradeNeeded(db, old, next);
            };

            request.onsuccess = (event) => {
                console.log(`Opened database "${this.#name}"`);
                // @ts-ignore
                this.#db = event.target.result;
                resolve(this);
            };

            request.onerror = (event) => {
                console.error(`Failed to open database "${this.#name}"`, event);
                // @ts-ignore
                reject(event.target.error);
            };
        });
    }

    /**
     * Inserts a new row into the table.
     * @param {string} table Table name
     * @param {any} row Row to insert
     * @returns {Promise<any>} Key of the inserted row
     */
    async insert(table, row) {
        return new Promise((resolve, reject) => {
            const transaction = this.#db.transaction(table, "readwrite");
            const store = transaction.objectStore(table);
            const request = store.add(row);

            request.onsuccess = (event) => {
                // @ts-ignore
                resolve(event.target.result);
            };

            request.onerror = (event) => {
                // @ts-ignore
                reject(event.target.error);
            };
        });
    }

    /**
     * Updates an existing row in the table.
     * @param {string} table Table name
     * @param {any} row Row to update
     * @returns {Promise<any>} Key of the updated row
     */
    async update(table, row) {
        return new Promise((resolve, reject) => {
            const transaction = this.#db.transaction(table, "readwrite");
            const store = transaction.objectStore(table);
            const request = store.put(row);

            request.onsuccess = (event) => {
                // @ts-ignore
                resolve(event.target.result);
            };

            request.onerror = (event) => {
                // @ts-ignore
                reject(event.target.error);
            };
        });
    }

    /**
     * Removes a row from the table.
     * @param {string} table Table name
     * @param {any} key Key of the row to remove
     * @returns {Promise<any>} Key of the removed row
     */
    async remove(table, key) {
        return new Promise((resolve, reject) => {
            const transaction = this.#db.transaction(table, "readwrite");
            const store = transaction.objectStore(table);
            const request = store.delete(key);

            request.onsuccess = (event) => {
                // @ts-ignore
                resolve(event.target.result);
            };

            request.onerror = (event) => {
                // @ts-ignore
                reject(event.target.error);
            };
        });
    }

    /**
     * Retrieves all rows from the table.
     * @param {string} table Table name
     * @returns {Promise<any[]>} All rows in the table
     */
    async getAll(table) {
        return new Promise((resolve, reject) => {
            const transaction = this.#db.transaction(table, "readonly");
            const store = transaction.objectStore(table);
            const request = store.getAll();

            request.onsuccess = (event) => {
                // @ts-ignore
                resolve(event.target.result);
            };

            request.onerror = (event) => {
                // @ts-ignore
                reject(event.target.error);
            };
        });
    }

    /**
     * Retrieves a row from the table by key.
     * @param {string} table Table name
     * @param {any} key Key of the row to retrieve
     * @returns {Promise<any>} Row with the given key
     */
    async get(table, key) {
        return new Promise((resolve, reject) => {
            const transaction = this.#db.transaction(table, "readonly");
            const store = transaction.objectStore(table);
            const request = store.get(key);

            request.onsuccess = (event) => {
                // @ts-ignore
                resolve(event.target.result);
            };

            request.onerror = (event) => {
                // @ts-ignore
                reject(event.target.error);
            };
        });
    }
}

export default AsyncDB;
