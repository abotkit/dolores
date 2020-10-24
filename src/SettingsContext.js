import React from 'react';

const maveUrl = process.env.NODE_ENV === 'development' ? process.env.REACT_APP_ABOTKIT_MAEVE_URL : window.ABOTKIT_MAEVE_URL;
const mavePort = process.env.NODE_ENV === 'development' ? process.env.REACT_APP_ABOTKIT_MAEVE_PORT : window.ABOTKIT_MAEVE_PORT;

const settings = {
  botkit: {
    host: maveUrl || 'http://localhost',
    port: mavePort || 3000
  },
  colors: {
    primary: '#002F53',
    secondary: '#2D999F',
    accent: '#F25D50'
  }
}

const settingsContext = React.createContext(settings);

export default settingsContext;