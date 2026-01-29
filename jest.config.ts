/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type { Config } from "jest";

import nextJest from "next/jest.js";

const config: Config = {
  // All imported modules in your tests should be mocked automatically
  // automock: false,

  // Stop running tests after `n` failures
  // bail: 0,

  // The directory where Jest should store its cached dependency information
  // cacheDirectory: "/private/var/folders/c8/ck2mwr5905b_86bk9_yjfy_80000gp/T/jest_dy",

  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // An array of glob patterns indicating a set of files for which coverage information should be collected
  // collectCoverageFrom: undefined,

  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",

  coverageProvider: "v8",
  testEnvironment: "./FixJSDOMEnvironment.ts",

  transformIgnorePatterns: ["/node_modules/(?!(rbush|quickselect)/)"],
  preset: "ts-jest",
  transform: {
    "^.+\\.(ts|tsx)?$": "ts-jest",
    "^.+\\.(js|jsx)$": [
      "babel-jest",
      { configFile: "./babel.config.jest.cjs" },
    ],
  },
};

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});

/* https://github.com/vercel/next.js/issues/83397 */
const exportedConfig = async () => {
  const newConfig = await createJestConfig(config)();
  newConfig.transformIgnorePatterns = [
    "/node_modules/(?!(quickselect|rbush|lineclip)/)",
  ];
  return newConfig;
};

export default exportedConfig;
