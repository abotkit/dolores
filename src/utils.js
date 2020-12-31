import axios from 'axios';

const instance = axios.create();

instance.interceptors.request.use(config => {
  const authorizationToken = localStorage.getItem('dolores-keycloak-token');

  if (authorizationToken) {
    config.headers = { 'Authorization': 'Bearer '+ authorizationToken };
  }
  return config;
}, error => Promise.reject(error));

export { instance as axios };