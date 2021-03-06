module.exports = {
  preset: "ts-jest",
  testMatch: ["**/__tests__/**/*.spec.[jt]s?(x)"],
  verbose: true,
  testEnvironment: "node",
  transform: {
    "node_modules/variables/.+\\.(j|t)sx?$": "ts-jest",
  },
  transformIgnorePatterns: ["node_modules/(?!variables/.*)"],
};
