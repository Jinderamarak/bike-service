import { sw } from "./worker.js";

class AsyncDB {
    constructor(name, version, onUpgradeNeeded) {
        this.name = name;
        this.version = version;
        this.onUpgradeNeeded = onUpgradeNeeded;
        this.db = null;
    }

    async open() {
        const request = sw.indexedDB.open(this.name, this.version);
        return new Promise((resolve, reject) => {
            request.onupgradeneeded = (event) => {
                // @ts-ignore
                const db = event.target.result;
                const old = event.oldVersion;
                const next = event.newVersion;
                this.onUpgradeNeeded(db, old, next);
            };

            request.onsuccess = (event) => {
                // @ts-ignore
                this.db = event.target.result;
                resolve(this);
            };

            request.onerror = (event) => {
                // @ts-ignore
                reject(event.target.error);
            };
        });
    }

    async insert(table, row) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(table, "readwrite");
            const store = transaction.objectStore(table);
            const request = store.add(row);

            request.onsuccess = (event) => {
                resolve(event.target.result);
            };

            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }

    async update(table, row) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(table, "readwrite");
            const store = transaction.objectStore(table);
            const request = store.put(row);

            request.onsuccess = (event) => {
                resolve(event.target.result);
            };

            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }

    async remove(table, key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(table, "readwrite");
            const store = transaction.objectStore(table);
            const request = store.delete(key);

            request.onsuccess = (event) => {
                resolve(event.target.result);
            };

            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }

    async getAll(table) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(table, "readonly");
            const store = transaction.objectStore(table);
            const request = store.getAll();

            request.onsuccess = (event) => {
                resolve(event.target.result);
            };

            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }

    async get(table, key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(table, "readonly");
            const store = transaction.objectStore(table);
            const request = store.get(key);

            request.onsuccess = (event) => {
                resolve(event.target.result);
            };

            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }
}

export default AsyncDB;
