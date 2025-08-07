module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Temporarily disable NativeWind to fix Babel issue
    // plugins: ['nativewind/babel'],
  };
}; 