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

      // Add ../shared to ts-loader include
      webpackConfig.module.rules.forEach((rule) => {
        if (rule.oneOf) {
          rule.oneOf.forEach((oneOfRule) => {
            if (
              oneOfRule.test &&
              oneOfRule.test.toString().includes('tsx') &&
              oneOfRule.include
            ) {
              if (Array.isArray(oneOfRule.include)) {
                oneOfRule.include.push(path.resolve(__dirname, '../shared'));
              } else {
                oneOfRule.include = [oneOfRule.include, path.resolve(__dirname, '../shared')];
              }
            }
          });
        }
      });

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