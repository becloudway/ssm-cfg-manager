# ssm-cfg-manager

[![npm version](https://badge.fury.io/js/ssm-cfg-manager.svg)](https://badge.fury.io/js/ssm-cfg-manager)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/sirmomster/ssm-cfg-manager/issues)
[![Known Vulnerabilities](https://snyk.io//test/github/SirMomster/ssm-cfg-manager/badge.svg?targetFile=package.json)](https://snyk.io//test/github/SirMomster/ssm-cfg-manager?targetFile=package.json)
![dependencies](https://david-dm.org/sirmomster/ssm-cfg-manager.svg)


Simple library to store SSM parameters in memory with multi-region, automatic renewal, expiration and parsing support.

> @aws-sdk/client-ssm is a peer dependency, make sure that you provide it yourself if needed

> :warning: aws-sdk v2 is no longer supported upward of ssm-cfg-manager Version 2.0.0


## Documentation

Use it wisely! :tada:

### Get an instance of SSMHandler

To get an instance of a SSMHandler which is a singleton with caching build in.
You need to call the `getInstance` method on the `StaticSSMHandler` class.

This will return a singleton instance of SSMHandler with caching.
So for each region you can create an instance and caching will be bound to it.
For when you have the same keys stored in multiple regions.

```ts
const ssmHandler: SSMHandler = StaticSSMHandler.getInstance(region: string = "eu-west-1");
```

### Get uncached data using getUnCachedText or getUnCachedJSon

When you want to retrieve data from SSM but not cache the value use the `unCached` methods.

```ts
// return a JSON object of generic type T
const parsed: T = await this.getUnCachedJson<T>(key);

// returns a string
const text: string = await this.getUnCachedText(key);
```

### Get cached data using getText and getJson 

When you want to cache data you can use the `getText` and `getJson` method from the
SSMHandler instance.

__Cache for limited time__

If you specify a timeout, the library will expire the cached entry. When an entry has expired, the library will attempt to fetch it again from the AWS Parameter Store.

This is done on demand and not proactively.

```ts
// return a JSON object of generic type T and cache it for 5 seconds
const parsed: T = await ssmHandler.getJson<T>(key, 5000);

// returns a string and cache it for 5 seconds
const text: string = await ssmHandler.getText(key, 5000);
```

When you cached something ones with a timer, there is no need to specify it in other
calls.

```ts
// cache it for 5 seconds
const parsed: T = await ssmHandler.getJson<T>(key, 5000);

// cache it for 5 seconds as it remembers the time from the first call
const text: string = await ssmHandler.getText(key);
```

__Cache without expiration__

If you specify no timeout the object will never expire and live in memory
until the application stops or you remove the entry manually from the cache.

```ts
// return a JSON object of generic type T and cache it permanently
const parsed: T = await ssmHandler.getJson<T>(key);

// returns a string and cache it permanently
const text: string = await ssmHandler.getText(key);
```

__Clearing the cache__

When you need to wipe the cash for some reason you can use the `clearCache` method on
the SSMHandler or the `flush` method on the `CacheHandler`.

```ts
ssmHandler.clearCache();

// or

ssmHandler.cacheHandler.flush();

```

__Acting on the cache__

To interact with the cache, use the `CacheHandler` instance from the `SSMHandler`.
This however isn't necessary for using the library.

```ts
/* 
 * Safely checks if an key exists in cache.
 * this will remove the object if it has expired/
 */
ssmHandler.cacheHandler.has(key: string): boolean;

/* 
 * Check if a key exists without removing it when it expired.
 */
ssmHandler.cacheHandler.hasUnsafe(key: string): boolean;

/*
 * Put an item in the cache for the given time or no time at all
 * when a time has been set before it will remember it based on the key.
 */
public put<T>(key: string, value: T, cacheForMs?: number): void;

/*
 * Remove the given item from the cache
 */
public remove(key: string): void

/*
 * Gets an obejct from the cache
 * Will throw NotFoundError when the object does not exist on cache
 * Will throw ExpiredError when the object exists but has been expired
 */
public get<T>(key: string): CachedObject<T>
```

## Contributing

Feel free to open a PR, writing unit tests is required.
If you have any questions or issues feel free to open up an issue and I will get back to you asap.

This project is not prone to change as it's just a simple implementation to make using SSM parameters a bit easier.

If it does change, SemVer applies.