import type { Config } from "jest";
const SpruceKitCore = require("./packages/sprucekit-core/package.json");
const SpruceKitSDK = require("./packages/sprucekit-sdk/package.json");
const SpruceKitServer = require("./packages/sprucekit-server/package.json");

export default async (): Promise<Config> => ({
  verbose: true,
  collectCoverage: true,
  bail: 0,
  preset: "ts-jest",
  clearMocks: true,
  slowTestThreshold: 3,
  coverageProvider: "v8",
  testEnvironment: "node",
  coverageDirectory: "coverage",
  coverageReporters: ["json", "lcov", "text-summary"],
  projects: [
    {
      displayName: SpruceKitCore.name,
      transform: {
        "^.+\\.(ts|tsx)?$": [
          "ts-jest",
          { tsconfig: "<rootDir>/packages/sprucekit-core/tsconfig.json" },
        ],
      },
      testMatch: [
        "<rootDir>/packages/sprucekit-core/tests/?(*.)+(spec|test).[jt]s?(x)",
      ],
    },
    {
      displayName: SpruceKitSDK.name,
      testEnvironment: "./jest-environment-jsdom.js",
      transform: {
        "^.+\\.(js|ts|tsx)?$": [
          "ts-jest",
          { tsconfig: "<rootDir>/packages/sprucekit-sdk/tsconfig.json" },
        ],
      },
      testMatch: [
        "<rootDir>/packages/sprucekit-sdk/tests/?(*.)+(spec|test).[jt]s?(x)",
        "<rootDir>/packages/sprucekit-sdk/tests/modules/?(*.)+(spec|test).[jt]s?(x)",
      ],
    },
    {
      displayName: SpruceKitServer.name,
      transform: {
        "^.+\\.(ts|tsx)?$": [
          "ts-jest",
          { tsconfig: "<rootDir>/packages/sprucekit-server/tsconfig.json" },
        ],
      },
      testMatch: [
        "<rootDir>/packages/sprucekit-server/tests/?(*.)+(spec|test).[jt]s?(x)",
      ],
    },
  ],
});
