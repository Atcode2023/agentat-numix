import { boot } from 'quasar/wrappers';
import axios, { AxiosInstance } from 'axios';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
  }
}

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually

// const production = 0;
// const baseURL = production ? process.env.API_URL_PROD : process.env.API_URL;
// for each client)
// const api = axios.create({ baseURL: 'https://api.example.com' });

const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    Accept: 'application/json',
    // Authorization: "Bearer " + token,
  },
  data: {},
});

// const file_url = production ? process.env.FILE_URL_PROD : process.env.FILE_URL;
// const vue_url = production ? 'https://maxirifa.com' : 'http://localhost:9000';

export default boot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios;
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api;
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
  // app.config.globalProperties.$FILE_URL = file_url;
});

export { api };
