import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Card } from 'antd';
import { Pages, getBreadcrumbs } from '../components/Breadcrumbs';
import { axios } from '../utils';
import Axios from 'axios';
import { useTranslation } from 'react-i18next';
import { SettingsContext } from '../SettingsContext';
import useCommonStyles from '../styles/commons';

const Actions = () => {
  const { bot } = useParams();
  const [actions, setActions] = useState([]);
  const history = useHistory();
  const { t } = useTranslation();
  const [settings] = useContext(SettingsContext);
  const { botkit: {url} } = settings;
  const sharedClasses = useCommonStyles();
  const CancelToken = useRef(Axios.CancelToken);
  const source = useRef(CancelToken.current.source());

  useEffect(() => {
    const axiosSource = source.current;
    axios.get(`${url}/bot/${bot}/status`, {
      cancelToken: axiosSource.token
    }).then(() => {
      axios.get(`${url}/bot/${bot}/actions`, {
        cancelToken: axiosSource.token
      }).then(response => {
        setActions(response.data);
      }).catch(error => {
        if (!Axios.isCancel(error)) {
          console.warn('abotkit rest api is not available', error);
        }
      })
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
  }, [bot, history, url]);

  const breadcrumbs = getBreadcrumbs(Pages.ACTIONS, t, sharedClasses, settings.collapsed && bot)

  if (settings.keycloak.enabled && !settings.keycloak.instance.authenticated) {
    return (
      <div className={sharedClasses.page}>
        { breadcrumbs }
        <h3>{t('login.info.pre')}<span onClick={() => settings.keycloak.instance.login()} className={sharedClasses.link}>{t('login.info.link')}</span>{t('login.info.post', {bot: bot, page: t('breadcrumbs.actions')})}</h3>
      </div>
    );
  }

  return (
    <div className={sharedClasses.page}>
      { breadcrumbs }
      <h1>{ t('actions.headline') }</h1>
      { actions.map((action, i) => {
        let title = <div>{action.name}</div>
        return(
          <Card 
            title={title} 
            key={i} 
            style={{ width: '100%', marginBottom: 15 }}>
            <p>{action.description}</p>
          </Card>
        )
      })}
    </div>
  );
}

export default Actions;