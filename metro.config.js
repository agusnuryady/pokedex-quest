// https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

/**
 * macOS writes hidden "._name" companion files on exFAT and other non-Apple drives.
 * They are binary junk, but Expo Router would try to load "._index.tsx" as a route
 * and fail the build. Keep Expo's defaults and add them to the block list.
 */
const APPLE_DOUBLE_FILES = /(^|[\\/])\._[^\\/]*$/;
const defaults = config.resolver.blockList;
config.resolver.blockList = [
  ...(Array.isArray(defaults) ? defaults : defaults ? [defaults] : []),
  APPLE_DOUBLE_FILES,
];

module.exports = config;
