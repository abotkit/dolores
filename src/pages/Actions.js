import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Breadcrumb, Card } from 'antd';
import { axios } from '../utils';
import Axios from 'axios';
import { useTranslation } from 'react-i18next';
import { SettingsContext } from '../SettingsContext';

const Actions = () => {
  const { bot } = useParams();
  const [actions, setActions] = useState([]);
  const history = useHistory();
  const { t } = useTranslation();
  const [settings] = useContext(SettingsContext);

  const CancelToken = useRef(Axios.CancelToken);
  const source = useRef(CancelToken.current.source());

  useEffect(() => {
    const axiosSource = source.current;
    axios.get(`${settings.botkit.url}/bot/${bot}/status`, {
      cancelToken: axiosSource.token
    }).then(() => {
      axios.get(`${settings.botkit.url}/bot/${bot}/actions`, {
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
  }, [bot, history, settings]);

  const breadcrumbs = (
    <Breadcrumb style={{ margin: '16px 0' }}>
      <Breadcrumb.Item>{ t('actions.breadcrumbs.home') }</Breadcrumb.Item>
      <Breadcrumb.Item>{ t('actions.breadcrumbs.actions') }</Breadcrumb.Item>
    </Breadcrumb>
  )

  if (settings.keycloak.enabled && !settings.keycloak.instance.authenticated) {
    return (
      <>
        { breadcrumbs }
        <h3>{`Sorry, but you need to login to see the actions page of ${bot}`}</h3>
      </>
    );
  }

  return (
    <>
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
    </>
  );
}

export default Actions;