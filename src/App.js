import React, { useContext, useEffect, useState } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom'
import { Layout, Spin } from 'antd';
import Menu from './components/Menu';
import { Settings, Chat, Actions, Intents, About, Integrations, Statistics, BotNotFound } from './pages';
import './App.css';
import { SettingsContext, defaultSettings } from './SettingsContext';
import Keycloak from 'keycloak-js';

const { Content, Footer, Sider } = Layout;

const Main = () => {
  const { path } = useRouteMatch();
  const [settings, updateSettings] = useContext(SettingsContext);
  
  return (
    <>
      <Sider
        collapsible
        collapsed={settings.collapsed}
        breakpoint="md"
        collapsedWidth="80"
        onCollapse={(isCollapsed, type) => {
          updateSettings(prevSettings => ({...prevSettings, collapsed: isCollapsed }));
        }}>
        <div className="logo" style={{
          justifyContent: settings.collapsed ? 'center' : 'flex-start'
        }}><span />{ !settings.collapsed && "robert" }</div>
        <Menu />
      </Sider>
      <Layout>
        <Content>
          { settings.keycloak.loading ? <div style={{ display: "flex", height: '50vh', alignItems: "center", justifyContent: "center" }}><Spin /></div> : <Switch>
            <Route path={`${path}`} exact component={Chat} />
            <Route path={`${path}/chat`} component={Chat} />
            <Route path={`${path}/actions`} component={Actions} />
            <Route path={`${path}/intents`} component={Intents} />
            <Route path={`${path}/settings`} component={Settings} />
            <Route path={`${path}/integrations`} component={Integrations} />
            <Route path={`${path}/statistics`} component={Statistics} />
          </Switch> }
        </Content>
        <Footer style={{ textAlign: 'center' }}>abotkit ©2020</Footer>
      </Layout>
    </>
  );
};

const App = () => {
  const [settings, updateSettings] = useState(defaultSettings);

  useEffect(() => {
    if (settings.keycloak.enabled) {
      if (settings.keycloak.instance === null) {
        const keycloak = Keycloak({
          url: `${settings.keycloak.url}/auth`,
          realm: settings.keycloak.realm,
          clientId: settings.keycloak.clientId,
        });

        keycloak.init().then(authenticated => {
          const restoredToken = sessionStorage.getItem('maeve-keycloak-token');
          const restoredTokenAge = sessionStorage.getItem('maeve-keycloak-token-age');
          const now = new Date().getTime();

          if (!authenticated) {
            if (typeof restoredToken !== 'undefined' && typeof restoredTokenAge !== 'undefined' && now < restoredTokenAge + (15 * 1000 * 60)) {
              console.log('Found access token in session storage which is already ok. start login');
              keycloak.login();
            } else {
              console.log('There was no session token in session store or its time was up');
              sessionStorage.setItem('maeve-keycloak-token', undefined);
              sessionStorage.setItem('maeve-keycloak-token-age', undefined);            
            }
          }

          updateSettings(prevSettings => ({...prevSettings, keycloak: {...prevSettings.keycloak, instance: keycloak}}));
        }).catch(error => {
          console.warn(error);
        }).finally(() => {
          if (settings.keycloak.loading) {
            updateSettings(prevSettings => ({...prevSettings, keycloak: {...prevSettings.keycloak, loading: false}}));
          }
        });

        keycloak.onReady = () => {
          if (keycloak.authenticated) {
            window.authorizationToken = keycloak.token;
          } else {
            window.authorizationToken = undefined;
          }
        }

        keycloak.onAuthSuccess = () => {
          if (keycloak.authenticated) {
            window.authorizationToken = keycloak.token;
            sessionStorage.setItem('maeve-keycloak-token', keycloak.token);
            sessionStorage.setItem('maeve-keycloak-token-age', new Date().getTime());
          } else {
            window.authorizationToken = undefined;
          }
        }

        keycloak.onTokenExpired = () => {
          keycloak.updateToken(5).then(() => {
            console.log('keycloak token refreshed');
            sessionStorage.setItem('maeve-keycloak-token', keycloak.token);
            sessionStorage.setItem('maeve-keycloak-token-age', new Date().getTime());
          })
        }
      } 
    }
  }, [settings]);

  return (
    <SettingsContext.Provider value={[settings, updateSettings]}>
      <div className="app">
        <Layout className="layout">
          <Switch>
            <Route path="/" exact component={About} />
            <Route path="/not-found" exact component={BotNotFound} />
            <Route path="/:bot" component={Main} />
          </Switch> 
        </Layout>
      </div>
    </SettingsContext.Provider>
  );
}

export default App;
