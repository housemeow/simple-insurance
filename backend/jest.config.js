/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  moduleNameMapper: {
    '@/(.*)': '<rootDir>/src/$1',
  },
  transform: {
    "^.+.tsx?$": ["ts-jest",{}],
  },
  globalSetup: './jest.setup.js',
  globalTeardown: './jest.teardown.js',
};
