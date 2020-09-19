module.exports = {
    name: "@jmc/config-manager",
    displayName: "SSM Credentials Manager",
    globals: {
        "ts-jest": {
            tsConfig: "<rootDir>/tsconfig.json",
        },
    },
    transform: {
        "^.+\\.ts$": "ts-jest",
    },
    testRegex: "(/__tests__/.*.(test|spec)).(jsx?|tsx?)$",
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    collectCoverage: false,
    coveragePathIgnorePatterns: ["(tests/.*.mock).(jsx?|tsx?)$", ".*/lib/.*"],
    verbose: true,
    preset: "ts-jest",
    testEnvironment: "node",
};
