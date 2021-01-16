const CracoLessPlugin = require('craco-less');

module.exports = {
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: {
              'primary-color': '#00838F',
              'link-color': '#039BE5',
              'layout-trigger-background': '#0097A7',
              'layout-header-background': '#006064'
            },
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
};