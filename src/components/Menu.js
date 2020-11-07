import React, { useContext } from 'react';
import { Link, withRouter, useParams, useRouteMatch } from 'react-router-dom';
import { Menu } from 'antd';
import { useTranslation } from 'react-i18next';
import { useKeycloak } from '@react-keycloak/web';
import SettingsContext from '../SettingsContext';

const AbotkitMenu = withRouter(props => {
  const settings = useContext(SettingsContext);
  const { location } = props;
  const { t } = useTranslation();
  const { bot } = useParams();
  const { url } = useRouteMatch();

  if (typeof bot === 'undefined') {
    return null;
  }

  const items = [
    <Menu.Item key={`${url}/chat`}>
      <Link to={`${url}/chat`}>{ t('menu.chat') }</Link>
    </Menu.Item>,
    <Menu.Item key={`${url}/intents`}>
      <Link to={`${url}/intents`}>{ t('menu.intents') }</Link>
    </Menu.Item>,
    <Menu.Item key={`${url}/actions`}>
      <Link to={`${url}/actions`}>{ t('menu.actions') }</Link>
    </Menu.Item>,
    <Menu.Item key={`${url}/settings`}>
      <Link to={`${url}/settings`}>{ t('menu.settings') }</Link>
    </Menu.Item>
  ]

  if (settings.botkit.keycloak.enabled) {
    const { keycloak } = useKeycloak();
    const login = () => {
      keycloak.login();
    }
  
    const logout = () => {
      keycloak.logout();
    }
  
    if (keycloak.authenticated) {
      items.push(<Menu.Item key="auth" onClick={logout} style={{ float: "right"}}>Logout</Menu.Item>) 
    } else {
      items.push(<Menu.Item key="auth" onClick={login} style={{ float: "right"}}>Login</Menu.Item>)
    }
  }

  return (
    <Menu 
    theme="dark"
    mode="horizontal"
    style={{ lineHeight: '64px' }}
    selectedKeys={[location.pathname]}>
      {items}
    </Menu>
  );
});

export default AbotkitMenu;
