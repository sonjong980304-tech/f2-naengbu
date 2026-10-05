const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: '.',
  testMatch: ['logic/**/*.spec.js', 'smoke/**/*.spec.js'],
  reporter: 'list',
  use: { browserName: 'chromium' },
});
