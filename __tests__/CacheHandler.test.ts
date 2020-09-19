import { CacheHandler } from "../src";

const cont: {
    cacheHandler: CacheHandler;
} = { cacheHandler: undefined };

describe("CacheHandler", () => {
    beforeEach(() => {
        cont.cacheHandler = new CacheHandler();
    });
    it("should cache objects properly", () => {
        cont.cacheHandler.put("test", { test: "test" });

        expect(cont.cacheHandler.get("test").object).toEqual({ test: "test" });
    });

    it("should remove objects from the cache", () => {
        cont.cacheHandler.put("test", "test");
        expect(cont.cacheHandler.has("test")).toEqual(true);
        cont.cacheHandler.remove("test");
        expect(cont.cacheHandler.has("test")).toEqual(false);
    });

    it("should expire objects after a given time", async () => {
        cont.cacheHandler.put("test", { test: "test" }, 500);
        await new Promise((resolve) => setTimeout(resolve, 600));
        expect(() => cont.cacheHandler.get("test")).toThrowError("Key test has expired");
    });

    it("should use the cached key time", async () => {
        cont.cacheHandler.put("test", { test: "test" }, 500);
        cont.cacheHandler.put("test", { test: "test" });
        await new Promise((resolve) => setTimeout(resolve, 600));
        expect(() => cont.cacheHandler.get("test")).toThrowError("Key test has expired");
    });

    it("should not use the cached key time when it has been reset", async () => {
        cont.cacheHandler.put("test", { test: "test" }, 500);
        cont.cacheHandler.removeTimeInCache("test");
        cont.cacheHandler.put("test", { test: "test" });
        await new Promise((resolve) => setTimeout(resolve, 600));
        expect(cont.cacheHandler.get("test").object).toEqual({ test: "test" });
    });

    it("should throw an error when the key does not exist in the cache", () => {
        expect(() => cont.cacheHandler.get("test")).toThrowError("Key test not in cache");
    });

    it("should do nothing when removing an item that does not exist", () => {
        expect(cont.cacheHandler.remove("test")).toBeUndefined();
    });
});
