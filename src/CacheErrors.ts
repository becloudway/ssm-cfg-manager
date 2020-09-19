export enum ErrorTypes {
    EXPIRED,
    NOT_FOUND,
}

/**
 * Thrown when an item expires and is requsted
 */
export class ExpiredError extends Error {
    public type: ErrorTypes.EXPIRED;

    public constructor(key: string) {
        super(`Key ${key} has expired`);
    }
}

/**
 * Throws when an item isn't found
 */
export class NotFoundError extends Error {
    public type: ErrorTypes.NOT_FOUND;

    public constructor(key: string) {
        super(`Key ${key} not in cache`);
    }
}
