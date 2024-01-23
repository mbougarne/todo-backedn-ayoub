module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testPathIgnorePatterns: [
    "/node_modules/",
    "/build/",
    "/src/bin/",
    "/.husky/",
  ],
  collectCoverageFrom: ["./src/tests/**"],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
    },
  },
};
