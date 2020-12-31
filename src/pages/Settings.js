import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Tag, notification } from 'antd';
import { Select } from 'antd';
import { Pages, getBreadcrumbs } from '../components/Breadcrumbs';
import { useTranslation } from "react-i18next";
import { createUseStyles } from 'react-jss';
import { SettingsContext } from '../SettingsContext';
import { axios } from '../utils';
import useCommonStyles from '../styles/commons';
import Axios from 'axios';

const useStyles = createUseStyles({
  headline: {
    paddingBottom: 8
  }
});

const { Option } = Select;

const Settings = () => {
  const { bot } = useParams();
  const history = useHistory();
  const [botAlive, setbotAlive] = useState(false);
  const [host, setHost] = useState('');
  const [botType, setBotType] = useState('');
  const [botLangauge, setBotLanguage] = useState('');
  const [port, setPort] = useState('');
  const { t, i18n } = useTranslation();
  const classes = useStyles();
  const sharedClasses = useCommonStyles();
  const [settings] = useContext(SettingsContext);
  const { botkit: {url} } = settings;

  const [language, setLanguage] = useState(i18n.languages[0].substring(0,2).toLocaleLowerCase());
  
  const CancelToken = useRef(Axios.CancelToken);
  const source = useRef(CancelToken.current.source());

  const changeLanguage = value => {
    setLanguage(value);
    i18n.changeLanguage(value);
  }

  const showNotification = (headline, message='', type='warning') => {
    notification[type]({
      message: headline,
      description: message,
    });
  };

  const changeBotLanguage = async value => {
    try {
      await axios.post(`${settings.botkit.url}/language`, { bot: bot, country_code: value });
      setBotLanguage(value);
    } catch (error) {
      showNotification(t('settings.translation.error.title'), t('settings.translation.error.message', { bot: bot }));
    }
  }

  useEffect(() => {
    const axiosSource = source.current;
    axios.get(`${url}/bot/${bot}/status`, {
      cancelToken: axiosSource.token
    }).then(response => {
      setbotAlive(true);
      axios.get(`${url}/bot/${bot}/settings`, {
        cancelToken: axiosSource.token
      }).then(response => {
        const { host, port, type, language } = response.data;
        setHost(host);
        setPort(port);
        setBotLanguage(language);
        setBotType(type);
      }).catch(error => {
        if (!Axios.isCancel(error)) {
          console.warn('unable to fetch bot settings', error);
        }
      });
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

  const breadcrumbs = getBreadcrumbs(Pages.SETTINGS, t, sharedClasses, settings.collapsed && bot);

  let languageOptions = (
    <>
      <p>{bot} {t('settings.language.current')}</p>
      <Select
        value={botLangauge}
        style={{ width: 200 }}
        onChange={changeBotLanguage}
      >
        <Option value="en">English</Option>
        <Option value="de">Deutsch</Option>
      </Select>
    </>
  );
  
  if (settings.keycloak.enabled && !settings.keycloak.instance.authenticated) {
    languageOptions = <p>{bot} {t('settings.language.current')} {t(`settings.language.${botLangauge}`)}</p>
  }

  return (
    <div className={sharedClasses.page}>
      { breadcrumbs }
      <div style={{ background: '#fff', padding: 24, minHeight: 280 }}>
        <h3 className={classes.headline}>{ t('settings.general.headline') }</h3>
        <Select
          showSearch
          value={language}
          style={{ width: 200 }}
          onChange={changeLanguage}
        >
          <Option value="en">English</Option>
          <Option value="de">Deutsch</Option>
        </Select>
        <h3 className={classes.headline} style={{ paddingTop: 16 }}>{ t('settings.bot.headline') }</h3>
        <p>{ t('settings.bot.state') }: { botAlive ? <Tag color="green">{ t('settings.bot.online') }</Tag> : <Tag color="red">{ t('settings.bot.offline') }</Tag> }</p>
        { host !== '' ? <p>{t('settings.bot.title')} { t('settings.bot.running') } {host}:{port}</p> : null}
        { botAlive && botType !== '' ? <p>{bot} {t('settings.bot.using')} <b>{botType === 'robert' ? 'abotkit-core' : 'rasa'}</b> {t('settings.bot.chatting')}</p> : null}
        { botAlive ? <>
          {languageOptions}</> 
        : null }
      </div>
    </div>
  );
}

export default Settings;
