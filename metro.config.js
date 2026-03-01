const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Поддержка WASM для expo-sqlite на web
config.resolver.assetExts.push('wasm');

// COEP/COOP для SharedArrayBuffer (требуется для SQLite на web)
if (config.server && !config.server.enhanceMiddleware) {
  config.server.enhanceMiddleware = (middleware) => {
    return (req, res, next) => {
      res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
      middleware(req, res, next);
    };
  };
}

module.exports = config;
