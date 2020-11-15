import React from 'react';

const maveUrl = process.env.NODE_ENV === 'development' ? process.env.REACT_APP_ABOTKIT_MAEVE_URL : window.ABOTKIT_MAEVE_URL;
const mavePort = process.env.NODE_ENV === 'development' ? process.env.REACT_APP_ABOTKIT_MAEVE_PORT : window.ABOTKIT_MAEVE_PORT;
const keycloakEnabled = process.env.NODE_ENV === 'development' ? process.env.REACT_APP_ABOTKIT_DOLORES_USE_KEYCLOAK : window.ABOTKIT_DOLORES_USE_KEYCLOAK;
const keycloakUrl = process.env.NODE_ENV === 'development' ? process.env.REACT_APP_ABOTKIT_DOLORES_KEYCLOAK_URL : window.ABOTKIT_DOLORES_KEYCLOAK_URL;
const keycloakPort = process.env.NODE_ENV === 'development' ? process.env.REACT_APP_ABOTKIT_DOLORES_KEYCLOAK_PORT : window.ABOTKIT_DOLORES_KEYCLOAK_PORT;

const keycloakClientId = process.env.NODE_ENV === 'development' ? process.env.REACT_APP_ABOTKIT_DOLORES_KEYCLOAK_CLIENT_ID : window.ABOTKIT_DOLORES_KEYCLOAK_CLIENT_ID;
const keycloakRealm = process.env.NODE_ENV === 'development' ? process.env.REACT_APP_ABOTKIT_DOLORES_KEYCLOAK_REALM : window.ABOTKIT_DOLORES_KEYCLOAK_REALM;


const settings = {
  botkit: {
    host: maveUrl || 'http://localhost',
    port: mavePort || 3000,
  },
  keycloak: {
    enabled: typeof keycloakEnabled !== 'undefined' && keycloakEnabled.toLowerCase() === 'true',
    url: keycloakUrl,
    port: keycloakPort,
    realm: keycloakRealm,
    clientId: keycloakClientId,
    instance: null,
    loading: typeof keycloakEnabled !== 'undefined' && keycloakEnabled.toLowerCase() === 'true'
  },
  colors: {
    primary: '#002F53',
    secondary: '#2D999F',
    accent: '#F25D50'
  } 
}

const SettingsContext = React.createContext([settings, () => {}]);

export { SettingsContext, settings as defaultSettings }