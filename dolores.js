const express = require('express');
const path = require('path');
const app = express();
const { createProxyMiddleware } = require('http-proxy-middleware')

const { 
  ABOTKIT_DOLORES_PORT, ABOTKIT_DOLORES_URL, ABOTKIT_DOLORES_USE_KEYCLOAK, 
  ABOTKIT_DOLORES_KEYCLOAK_URL, ABOTKIT_DOLORES_KEYCLOAK_CLIENT_ID, 
  ABOTKIT_DOLORES_KEYCLOAK_REALM, ABOTKIT_MAEVE_URL,
  ABOTKIT_DOLORES_PROXY_MAEVE, ABOTKIT_DOLORES_PROXY_KEYCLOAK, ABOTKIT_DOLORES_OVERRIDE_PORT } = process.env;

const url = ABOTKIT_DOLORES_URL || 'http://localhost'
const port = ABOTKIT_DOLORES_PORT || 21520;

app.set('views', path.join(__dirname, 'build'));
app.engine('html', require('ejs').renderFile);

let maeve_url = ABOTKIT_MAEVE_URL || 'http://localhost:3000';

if (ABOTKIT_DOLORES_PROXY_MAEVE) {
  const maeve = createProxyMiddleware('/api', {
    target: `${maeve_url}/`,
    secure: false,
    pathRewrite: {
      '^/api': '/'
    }
  });
  app.use(maeve);
  if (ABOTKIT_DOLORES_OVERRIDE_PORT) {
    maeve_url = `${url}:${port}/api`;
  } else {
    maeve_url = `${url}/api`;
  }
}

let keycloak_url = ABOTKIT_DOLORES_KEYCLOAK_URL || 'http://localhost:8080';

if (ABOTKIT_DOLORES_PROXY_KEYCLOAK && ABOTKIT_DOLORES_USE_KEYCLOAK) {
  const keycloak = createProxyMiddleware('/auth', {
    target: `${keycloak_url}`, 
    secure: false
  });
  app.use(keycloak);
  if (ABOTKIT_DOLORES_OVERRIDE_PORT) {
    keycloak_url = `${url}:${port}`;
  } else {
    keycloak_url = url;
  }
}

app.use('/static', express.static(path.join(__dirname, 'build/static')));
app.get('*', (req, res) => { res.render('index.html', { 
  ABOTKIT_DOLORES_USE_KEYCLOAK, ABOTKIT_DOLORES_KEYCLOAK_URL: keycloak_url, 
  ABOTKIT_MAEVE_URL: maeve_url, 
  ABOTKIT_DOLORES_KEYCLOAK_CLIENT_ID, ABOTKIT_DOLORES_KEYCLOAK_REALM 
})});

app.listen(port, () => console.log(`Dolores listening on port ${port}!`));