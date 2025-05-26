const { getDefaultConfig } = require("@expo/metro-config");

const config = getDefaultConfig(__dirname);

// Enable bundle splitting for better performance
config.transformer.minifierConfig = {
  mangle: {
    keep_fnames: true,
  },
  output: {
    ascii_only: true,
    quote_keys: true,
    wrap_iife: true,
  },
  sourceMap: {
    includeSources: false,
  },
  toplevel: false,
  warnings: false,
};

// Optimize asset loading
config.resolver.platforms = ["ios", "android", "web"];
config.resolver.sourceExts.push("cjs");

module.exports = config;
