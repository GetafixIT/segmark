module.exports = {
  verbose: true,
  clearMocks: true,
  testEnvironment: 'jsdom',
  coverageDirectory: 'coverage',
  transform: {
    '^.+\\.(t|j)sx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: ['src/**/*.ts'],
  coveragePathIgnorePatterns: ['node_modules/', 'coverage/'],
  coverageThreshold: {
    global: {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    },
  },
  coverageReporters: ['html', 'text', 'json-summary'],
};
