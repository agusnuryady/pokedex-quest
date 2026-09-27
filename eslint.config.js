// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  // "._name" files are macOS metadata created on exFAT drives, not source code.
  { ignores: ['dist/*', 'coverage/*', '**/._*'] },
]);
