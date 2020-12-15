import React, { useContext } from 'react';
import { Link, withRouter, useParams, useRouteMatch, useHistory } from 'react-router-dom';
import { Menu } from 'antd';
import { useTranslation } from 'react-i18next';
import { SettingsContext } from '../SettingsContext';
import { ApiOutlined, UserOutlined, MessageOutlined, LineChartOutlined, BulbOutlined, ThunderboltOutlined, KeyOutlined, ToolOutlined } from '@ant-design/icons';

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
    <Menu.Item key={`${url}/chat`} icon={<MessageOutlined />}>
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
        <Menu.Item key={`${url}/intents`} icon={<BulbOutlined />}>
        <Link to={`${url}/intents`}>{ t('menu.intents') }</Link>
        </Menu.Item>,
        <Menu.Item key={`${url}/actions`} icon={<ThunderboltOutlined />}>
          <Link to={`${url}/actions`}>{ t('menu.actions') }</Link>
        </Menu.Item>,
        <Menu.Item key={`${url}/statistics`} icon={<LineChartOutlined />}>
          <Link to={`${url}/statistics`}>{ t('menu.statistics') }</Link>
        </Menu.Item>,
        <Menu.Item key={`${url}/integrations`} icon={<ApiOutlined />}>
          <Link to={`${url}/integrations`}>{t('menu.integrations')}</Link>
        </Menu.Item>,
        <Menu.Item key={`${url}/settings`} icon={<ToolOutlined />}>
          <Link to={`${url}/settings`}>{ t('menu.settings') }</Link>
        </Menu.Item>,
        <SubMenu key="sub-menu-user" style={{ float: "right" }} icon={<UserOutlined />} title={keycloak.idTokenParsed.preferred_username}>
          <Menu.Item key="sub-menu-user-logut" onClick={logout}>Logout</Menu.Item>
        </SubMenu>
      )
    } else {
      items.push(
        <Menu.Item key={`${url}/settings`} icon={<ToolOutlined />}>
          <Link to={`${url}/settings`}>{ t('menu.settings') }</Link>
        </Menu.Item>,
        <Menu.Item icon={<KeyOutlined />} key="menu-login" onClick={login} style={{ float: "right"}}>Login</Menu.Item>
      );
    }
  } else {
    items.push(
      <Menu.Item key={`${url}/intents`}  icon={<BulbOutlined />}>
      <Link to={`${url}/intents`}>{ t('menu.intents') }</Link>
      </Menu.Item>,
      <Menu.Item key={`${url}/actions`} icon={<ThunderboltOutlined />}>
        <Link to={`${url}/actions`}>{ t('menu.actions') }</Link>
      </Menu.Item>,
      <Menu.Item key={`${url}/statistics`} icon={<LineChartOutlined />}>
        <Link to={`${url}/statistics`}>{ t('menu.statistics') }</Link>
      </Menu.Item>,
      <Menu.Item key={`${url}/integrations`} icon={<ApiOutlined />}>
        <Link to={`${url}/integrations`}>{t('menu.integrations')}</Link>
      </Menu.Item>,
      <Menu.Item key={`${url}/settings`} icon={<ToolOutlined />}>
        <Link to={`${url}/settings`}>{ t('menu.settings') }</Link>
      </Menu.Item>
    );
  }

  return (
    <Menu 
      theme="dark"
      style={{ lineHeight: '64px' }}
      selectedKeys={[location.pathname]}>
      {items}
    </Menu>
  );
});

export default AbotkitMenu;
