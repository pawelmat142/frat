const path = require('path');

module.exports = {
  webpack: {
    alias: {
      '@shared': path.resolve(__dirname, '../shared'),
    },
    configure: (webpackConfig) => {
      // Allow imports from outside src directory
      const scopePluginIndex = webpackConfig.resolve.plugins.findIndex(
        ({ constructor }) => constructor && constructor.name === 'ModuleScopePlugin'
      );
      
      if (scopePluginIndex !== -1) {
        webpackConfig.resolve.plugins.splice(scopePluginIndex, 1);
      }
      
      return webpackConfig;
    },
  },
  jest: {
    configure: {
      moduleNameMapping: {
        '^@shared/(.*)$': '<rootDir>/../shared/$1',
      },
    },
  },
};