import { CacheHandler } from "./CacheHandler";
import { SSM } from "aws-sdk";

const REGION = process.env.AWS_REGION || "eu-west-1";

/**
 * Wrapper around SSM adding the CacheHandler for caching and
 * making usage a bit easier.
 */
export class SSMHandler {
    private _cacheHandler = new CacheHandler();
    private ssm: SSM;

    public constructor(region: string = REGION) {
        this.ssm = new SSM({ region });
    }

    /**
     * Returns a cached object if it's found
     *
     * @param key the key to get from the cache
     */
    private getCached<T>(key: string): T {
        try {
            const obj = this._cacheHandler.get(key);
            return obj.object as T;
        } catch (ex) {
            return undefined;
        }
    }

    /**
     * Gets a parameter from AWS Parameter Store
     *
     * @param key the key/path of the parameter to be obtained
     */
    private async get(key: string): Promise<string> {
        const result = await this.ssm
            .getParameter({
                Name: key,
                WithDecryption: true,
            })
            .promise();

        const value = result?.Parameter?.Value;

        return value;
    }

    /**
     * Gets a parameter from AWS Parameter Store, parses it as a JSON object
     * and caches it for as long as the program runs or until the cache time expires
     *
     * @param key the key/path of the parameter to be obtained
     * @param cacheForMs for how long the item is to be in the cache, undefined means keep it without expiration
     */
    public async getJson<T>(key: string, cacheForMs?: number): Promise<T> {
        const cached = this.getCached(key);
        if (cached) return cached as T;

        const parsed = await this.getUnCachedJson<T>(key);

        this._cacheHandler.put(key, parsed, cacheForMs);
        return parsed;
    }

    /**
     * Gets a parameter from AWS Parameter Store, parses it to JSON but doesn't cache it
     *
     * @param key the key/path of the parameter to be obtained
     */
    public async getUnCachedJson<T>(key: string): Promise<T> {
        const value = await this.get(key);

        let parsed;
        try {
            parsed = JSON.parse(value);
        } catch (ex) {
            throw new Error(`Falied to parse ${key} error: ${ex.message}`);
        }

        return parsed;
    }

    /**
     * Gets a parameter from AWS Parameter Store, and stores it as text
     * and caches it for as long as the programm runs or until the cache time expires
     *
     * @param key the key/path of the parameter to be obtained
     * @param cacheForMs for how long the item is to be in the cache, undefined means keep it without expiration
     */
    public async getText(key: string, cacheForMs?: number): Promise<string> {
        const cached = this.getCached(key);
        if (cached) return cached as string;

        const value = await this.getUncachedText(key);

        this._cacheHandler.put(key, value, cacheForMs);
        return value;
    }

    /**
     * Gets a parameter from AWS Parameter Store, and returns it as text but doesn't cache it
     *
     * @param key the key/path of the parameter to be obtained
     */
    public async getUncachedText(key: string): Promise<string> {
        return await this.get(key);
    }

    /**
     * Clear the cache
     */
    public clearCache(): void {
        this._cacheHandler.flush();
    }

    /**
     * Get the cache handler used for caching
     */
    public get cacheHandler(): CacheHandler {
        return this._cacheHandler;
    }
}
