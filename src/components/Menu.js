import React, { useContext } from 'react';
import { Link, withRouter, useParams, useRouteMatch, useHistory } from 'react-router-dom';
import { Menu } from 'antd';
import { useTranslation } from 'react-i18next';
import { SettingsContext } from '../SettingsContext';
import { UserOutlined } from '@ant-design/icons';

const { SubMenu } = Menu;

const AbotkitMenu = withRouter(props => {
  const [settings] = useContext(SettingsContext);
  const { location } = props;
  const { t } = useTranslation();
  const history = useHistory();
  const { bot } = useParams();
  const { url } = useRouteMatch();

  if (typeof bot === 'undefined') {
    return null;
  }

  const items = [
    <Menu.Item key={`${url}/chat`}>
      <Link to={`${url}/chat`}>{ t('menu.chat') }</Link>
    </Menu.Item>
  ]

  if (settings.keycloak.enabled) {
    const keycloak = settings.keycloak.instance;

    const login = () => {
      keycloak.login();
    }
  
    const logout = () => {
      sessionStorage.setItem('maeve-keycloak-token', undefined);
      sessionStorage.setItem('maeve-keycloak-token-age', undefined); 
      keycloak.logout();
      history.push(`/${url}/chat`);
    }

    if (keycloak && keycloak.authenticated) {
      items.push(
        <Menu.Item key={`${url}/intents`}>
        <Link to={`${url}/intents`}>{ t('menu.intents') }</Link>
        </Menu.Item>,
        <Menu.Item key={`${url}/actions`}>
          <Link to={`${url}/actions`}>{ t('menu.actions') }</Link>
        </Menu.Item>,
        <Menu.Item key={`${url}/settings`}>
          <Link to={`${url}/settings`}>{ t('menu.settings') }</Link>
        </Menu.Item>,
        <SubMenu key="sub-menu-user" style={{ float: "right"}} icon={<UserOutlined />} title={keycloak.idTokenParsed.preferred_username}>
          <Menu.Item key="sub-menu-user-logut" onClick={logout}>Logout</Menu.Item>
        </SubMenu>
      )
    } else {
      items.push(
        <Menu.Item key={`${url}/settings`}>
          <Link to={`${url}/settings`}>{ t('menu.settings') }</Link>
        </Menu.Item>,
        <Menu.Item key="menu-login" onClick={login} style={{ float: "right"}}>Login</Menu.Item>
      );
    }
  } else {
    items.push(
      <Menu.Item key={`${url}/intents`}>
      <Link to={`${url}/intents`}>{ t('menu.intents') }</Link>
      </Menu.Item>,
      <Menu.Item key={`${url}/actions`}>
        <Link to={`${url}/actions`}>{ t('menu.actions') }</Link>
      </Menu.Item>,
      <Menu.Item key={`${url}/settings`}>
        <Link to={`${url}/settings`}>{ t('menu.settings') }</Link>
      </Menu.Item>
    );
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
