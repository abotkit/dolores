import axios from 'axios';

const instance = axios.create();

instance.interceptors.request.use(config => {
  if (window.authorizationToken) {
    config.headers = { 'Authorization': 'Bearer '+ window.authorizationToken };
  }
  return config;
}, error => Promise.reject(error));

export { instance as axios };