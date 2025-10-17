/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/__tests__/controllers/**/*.test.js',
    '**/__tests__/models/**/*.test.js'
  ],
  moduleFileExtensions: ['js', 'json'],
  collectCoverageFrom: [
    'controllers/**/*.js',
    'models/**/*.js',
    '!models/superadmin.json',
    // paymentController is ESM; excluded to keep coverage tooling simple
    '!controllers/paymentController.js'
  ],
  coverageDirectory: 'coverage',
  setupFiles: ['<rootDir>/test/setupEnv.js']
};
