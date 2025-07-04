/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'node',
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      useESM: true
    }
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@/config/(.*)$': '<rootDir>/config/$1',
    '^@/utils/(.*)$': '<rootDir>/utils/$1',
    '^@/modules/(.*)$': '<rootDir>/modules/$1'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(.*\.mjs$))'
  ],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'controller/**/*.js',
    'controller/**/*.ts',
    'controller/**/*.tsx',
    'services/**/*.js',
    'services/**/*.ts',
    'services/**/*.tsx',
    'utils/**/*.js',
    'utils/**/*.ts',
    'utils/**/*.tsx',
    'modules/**/*.js',
    'modules/**/*.ts',
    'modules/**/*.tsx',
    '!**/*.test.js',
    '!**/*.test.ts',
    '!**/*.test.tsx',
    '!**/node_modules/**'
  ],
  testMatch: [
    '**/__tests__/**/*.js',
    '**/__tests__/**/*.ts',
    '**/__tests__/**/*.tsx',
    '**/?(*.)+(spec|test).[jt]s',
    '**/?(*.)+(spec|test).[jt]sx'
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
};

export default config;