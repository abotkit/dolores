import React, { useContext, useEffect, useState } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom'
import { Layout, Spin } from 'antd';
import Menu from './components/Menu';
import { Settings, Chat, Actions, Intents, About, BotNotFound } from './pages';
import './App.css';
import { ReactKeycloakProvider, useKeycloak } from '@react-keycloak/web';
import SettingsContext from './SettingsContext';
import Keycloak from 'keycloak-js';

const { Header, Content, Footer } = Layout;

const Main = () => {
  const { path } = useRouteMatch();
  const [loading, setLoading] = useState(true);
  const { keycloak } = useKeycloak();

  useEffect(() => {
    keycloak.onReady = () => {
      setLoading(false);
      if (keycloak.authenticated) {
        window.authorizationToken = keycloak.token;
      } else {
        window.authorizationToken = undefined;
      }
    }
  }, [keycloak.onReady]);

  return (
    <>
      <Header>
        <div className="logo" />
        <Menu />
      </Header>
      <Content style={{ padding: '0 50px' }}>
        { loading ? <div style={{ display: "flex", height: '50vh', alignItems: "center", justifyContent: "center" }}><Spin /></div> : <Switch>
          <Route path={`${path}`} exact component={Chat} />
          <Route path={`${path}/chat`} component={Chat} />
          <Route path={`${path}/actions`} component={Actions} />
          <Route path={`${path}/intents`} component={Intents} />
          <Route path={`${path}/settings`} component={Settings} />
        </Switch> }
      </Content>
      <Footer style={{ textAlign: 'center' }}>abotkit ©2020</Footer>
    </>
  );
};


const App = () => {
  const settings = useContext(SettingsContext);
  const main = <div className="app">
    <Layout className="layout">
      <Switch>
        <Route path="/" exact component={About} />
        <Route path="/not-found" exact component={BotNotFound} />
        <Route path="/:bot" component={Main} />
      </Switch> 
    </Layout>
  </div>

  if (settings.botkit.keycloak.enabled) {
    const keycloak = Keycloak({
      url: `${settings.botkit.keycloak.url}:${settings.botkit.keycloak.port}/auth`,
      realm: settings.botkit.keycloak.realm,
      clientId: settings.botkit.keycloak.clientId,
    });

    return <ReactKeycloakProvider authClient={keycloak}>{ main }</ReactKeycloakProvider>;
  } else {
    return main;
  }
}

export default App;
