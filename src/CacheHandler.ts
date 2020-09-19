import { NotFoundError, ExpiredError } from "./CacheErrors";
import { CachedObject } from "./CachedObject";

/**
 * Handles the caching of objects as a CRUD handler
 */
export class CacheHandler {
    // contains the cached objects
    private cache: Map<string, unknown> = new Map();

    // contains the cache times for the cached objects
    // for when they are set without a cache timer
    private keyCacheTime: Map<string, number> = new Map();

    /**
     * Puts a new item in the cache for a given time or for forever
     *
     * @param key the unique key to which the object is to be stored
     * @param value the value that is to be stored
     * @param cacheForMs if you want the cached object to expire you can set the cache for ms
     */
    public put<T>(key: string, value: T, cacheForMs?: number): void {
        let cacheTime = cacheForMs;
        const inKeyCacheTime = this.keyCacheTime.has(key);

        if (!cacheTime && inKeyCacheTime) {
            cacheTime = this.keyCacheTime.get(key);
        } else if (cacheTime && !inKeyCacheTime) {
            this.keyCacheTime.set(key, cacheTime);
        }

        const obj = new CachedObject<T>(value, cacheTime);
        this.cache.set(key, obj);
    }

    /**
     * Checks if a cached item exists in the cache without checking if it's
     * expired or not
     *
     * @param key the key to check if it exists
     */
    public hasUnSafe(key: string): boolean {
        return this.cache.has(key);
    }

    /**
     * Checks if a cached item exists and if it has expired removing expired items
     * in the progress
     *
     * @param key the key to check if it exists and hasn't expired
     */
    public has(key: string): boolean {
        if (!this.cache.has(key)) {
            return false;
        }

        const obj = this.cache.get(key) as CachedObject<unknown>;

        if (obj.hasExpired()) {
            this.cache.delete(key);
            return false;
        }

        return true;
    }

    /**
     * Removes an object from the cache if it exists
     *
     * @param key the key to be removed
     */
    public remove(key: string): void {
        if (this.has(key)) {
            this.cache.delete(key);
        }
    }

    /**
     * Gets an object from the cache if it's in there and hasn't expired
     *
     * @param key the key to get the CachedObject for
     * @throws NotFoundError when the object wasn't found
     * @throws ExpiredError when the obejct was found but expired
     */
    public get<T>(key: string): CachedObject<T> {
        if (!this.hasUnSafe(key)) {
            throw new NotFoundError(key);
        }

        const obj = this.cache.get(key) as CachedObject<T>;
        if (obj.hasExpired()) {
            this.cache.delete(key);
            throw new ExpiredError(key);
        }

        return obj;
    }

    /**
     * When you cached a key and value with a expiration the time is cached
     * you can remove this with this method.
     *
     * @param key the key to reset the cacheTime for
     */
    public removeTimeInCache(key: string): void {
        if (this.keyCacheTime.has(key)) this.keyCacheTime.delete(key);
    }

    /**
     * Clears the cache
     */
    public flush(): void {
        this.keyCacheTime.clear();
        this.cache.clear();
    }
}
