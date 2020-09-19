/**
 * Object that wraps a cached item to append metadata and cache timeout logic
 */
export class CachedObject<T> {
    private createdAt = Date.now();
    private cacheForMs?: number;

    private isTimed = false;
    private _object: T;

    /**
     * Creates a new CachedObject
     *
     * @param data the data to be wrapped and cached
     * @param cacheForMs the time for which this obj should remain in the cache
     */
    public constructor(data: T, cacheForMs: number = undefined) {
        this._object = data;
        this.cacheForMs = cacheForMs;

        if (cacheForMs) {
            this.isTimed = true;
        }
    }

    /**
     * Returns the cached content that is part of the CachedObject
     */
    public get object(): T {
        return this._object;
    }

    /**
     * Checks if the cached object has expired
     */
    public hasExpired(): boolean {
        if (!this.isTimed) {
            return false;
        }
        return Date.now() > this.createdAt + this.cacheForMs;
    }
}
