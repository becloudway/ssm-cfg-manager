module.exports = {
    env: { node: true },
    extends: ["eslint:recommended", 'plugin:@typescript-eslint/recommended'],
    plugins: ["prettier"],
    overrides: [],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: "latest",
        project: "./tsconfig-eslint.json",
    },
    rules: {
        "prettier/prettier": ["error"],
    },
};