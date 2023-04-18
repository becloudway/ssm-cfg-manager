module.exports = {
    displayName: "SSM Credentials Manager",
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