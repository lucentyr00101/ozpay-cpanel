// https://umijs.org/config/
import { defineConfig } from 'umi';

export default defineConfig({
  define: {
    //API_URL: 'https://opayant-api.mir708090.com/api/',
    API_URL: 'https://ozpay-api-alibaba.mir708090.com/api/',
  },
  plugins: [
    // https://github.com/zthxxx/react-dev-inspector
    'react-dev-inspector/plugins/umi/react-inspector',
  ],
  // https://github.com/zthxxx/react-dev-inspector#inspector-loader-props
  inspectorConfig: {
    exclude: [],
    babelPlugins: [],
    babelOptions: {},
  },
});
