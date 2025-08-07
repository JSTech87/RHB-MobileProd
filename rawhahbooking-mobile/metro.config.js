const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Alias react-dom to react-native to satisfy Clerk's web dependency
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  'react-dom': path.resolve(__dirname, 'node_modules', 'react-native'),
};

module.exports = config; 