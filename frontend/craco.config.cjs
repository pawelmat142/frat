const path = require('path');

module.exports = {
  webpack: {
    alias: {
      '@shared': path.resolve(__dirname, '../shared'),
    },
    configure: (webpackConfig) => {
      // Remove react-refresh plugin in production
      if (process.env.NODE_ENV === 'production') {
        // Remove react-refresh from babel-loader options
        webpackConfig.module.rules.forEach((rule) => {
          if (rule.oneOf) {
            rule.oneOf.forEach((oneOfRule) => {
              if (oneOfRule.loader && oneOfRule.loader.includes('babel-loader')) {
                if (oneOfRule.options && oneOfRule.options.plugins) {
                  oneOfRule.options.plugins = oneOfRule.options.plugins.filter((plugin) => {
                    const pluginPath = Array.isArray(plugin) ? plugin[0] : plugin;
                    return !pluginPath || !pluginPath.toString().includes('react-refresh');
                  });
                }
              }
            });
          }
        });
      }

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
  // devServer: {
  //   proxy: {
  //     '/api': {
  //       target: 'https://frat.com.pl',
  //       changeOrigin: true,
  //       secure: true,
  //     },
  //     '/socket.io': {
  //       target: 'https://frat.com.pl',
  //       changeOrigin: true,
  //       secure: true,
  //       ws: true,
  //     },
  //   },
  // },
  jest: {
    configure: {
      moduleNameMapping: {
        '^@shared/(.*)$': '<rootDir>/../shared/$1',
      },
    },
  },
};