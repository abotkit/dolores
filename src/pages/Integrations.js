import React, { useState, useEffect, useContext, useRef } from 'react';
import { Result, Select, Spin } from 'antd';
import { useParams, useHistory } from 'react-router-dom';
import { axios } from '../utils';
import Axios from 'axios';
import { useTranslation } from "react-i18next";
import useCommonStyles from '../styles/commons';
import { Pages, getBreadcrumbs } from '../components/Breadcrumbs';
import { SettingsContext } from '../SettingsContext';
import IntegrationSettings from '../components/IntegrationSettings';

const { Option } = Select;

const Integrations = () => {
  const { bot } = useParams();
  const history = useHistory();
  const { t } = useTranslation();
  const [settings] = useContext(SettingsContext);
  const { botkit: {url} } = settings;
  const [integrations, setIntegrations] = useState([]);
  const [selectedIntegration, setSelectedIntegration] = useState(0);
  const [loading, setLoading] = useState(false);

  const CancelToken = useRef(Axios.CancelToken);
  const source = useRef(CancelToken.current.source());
  const sharedClasses = useCommonStyles();

  useEffect(() => {
    const axiosSource = source.current;
    axios.get(`${url}/bot/${bot}/status`, {
      cancelToken: axiosSource.token
    }).then(async () => {
      setLoading(true);
      try {
        const integrations = (await axios.get(`${url}/integrations`, {
          cancelToken: source.current.token,
          params: {
            bot: bot
          }
        })).data;
  
        setIntegrations(integrations);
      } catch (error) {
        if (!Axios.isCancel(error)) {
          console.warn('abotkit rest api is not available', error);
        }
      } finally {
        setLoading(false);
      }
    }).catch(error => {
      if (typeof error.response !== 'undefined' && error.response.status === 404) {
        history.push('/not-found');
      } else if (!Axios.isCancel(error)) {
        console.warn('abotkit rest api is not available', error);
      }
    });

    return () => {
      axiosSource.cancel();
    }
  }, [history, bot, url]);

  const breadcrumbs = getBreadcrumbs(Pages.INTEGRATIONS, t, sharedClasses, settings.collapsed && bot)

  if (settings.keycloak.enabled && !settings.keycloak.instance.authenticated) {
    return (
      <div className={sharedClasses.page}>
        { breadcrumbs}
        <h3>{t('login.info.pre')}<span onClick={() => settings.keycloak.instance.login()} className={sharedClasses.link}>{t('login.info.link')}</span>{t('login.info.post', {bot: bot, page: t('breadcrumbs.integrations')})}</h3>
      </div>
    );
  }

  let content = (<>
    { integrations.length > 0 ? <><Select onChange={value => setSelectedIntegration(value)} defaultValue={0}>
      { integrations.map((integration, key) => 
        <Option value={ key } key={ key }>{ integration.name }</Option>
      )}
      </Select><IntegrationSettings name={integrations[selectedIntegration].name} components={integrations[selectedIntegration].settings} /></>
    : <Result title={t('integrations.unavailable')} /> }
  </>);

  if (loading) {
    content = <Spin tip={t('integrations.loading.tip')} />
  }

  return (
    <div className={sharedClasses.page}>
      { breadcrumbs}
      <div style={{ background: '#fff', padding: 24, minHeight: 280 }}>
        <h1>{t('integrations.headline')}</h1>
        { content}
      </div>
    </div>
  );
}

export default Integrations;