import { CacheHandler } from "./CacheHandler";
import { SSMHandler } from "./SSMHandler";

export class StaticSSMHandler {
    private static cache = new CacheHandler();

    public static getInstance(region?: string): SSMHandler {
        if (this.cache.has(region)) {
            return this.cache.get<SSMHandler>(region).object;
        }

        const handler = new SSMHandler(region);
        this.cache.put(region, handler);

        return handler;
    }
}
