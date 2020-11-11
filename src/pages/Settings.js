import React, { useState, useEffect, useContext } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Breadcrumb, Tag, notification } from 'antd';
import { Select } from 'antd';
import { useTranslation } from "react-i18next";
import { createUseStyles } from 'react-jss';
import SettingsContext from '../SettingsContext';
import { useKeycloak } from '@react-keycloak/web';
import { axios } from '../utils';

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
  const settings = useContext(SettingsContext);
  const { keycloak } = useKeycloak();

  const [language, setLanguage] = useState(i18n.languages[0].substring(0,2).toLocaleLowerCase());
  
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
      await axios.post(`${settings.botkit.host}:${settings.botkit.port}/language`, { bot: bot, country_code: value });
      setBotLanguage(value);
    } catch (error) {
      showNotification(t('settings.translation.error.title'), t('settings.translation.error.message', { bot: bot }));
    }
  }

  useEffect(() => {
    axios.get(`${settings.botkit.host}:${settings.botkit.port}/bot/${bot}/status`).then(response => {
      setbotAlive(true);
      axios.get(`${settings.botkit.host}:${settings.botkit.port}/bot/${bot}/settings`).then(response => {
        const { host, port, type, language } = response.data;
        setHost(host);
        setPort(port);
        setBotLanguage(language);
        setBotType(type);
      }).catch(error => {
        console.warn('unable to fetch bot settings', error);
      });
    }).catch(error => {
      if (typeof error.response !== 'undefined' && error.response.status === 404) {
        history.push('/not-found');
      } else {
        console.warn('abotkit rest api is not available', error);
      }
    })      
  }, [bot, history, settings]);

  const breadcrumbs = (
    <Breadcrumb style={{ margin: '16px 0' }}>
      <Breadcrumb.Item>{ t('settings.breadcrumbs.home') }</Breadcrumb.Item>
      <Breadcrumb.Item>{ t('settings.breadcrumbs.settings')}</Breadcrumb.Item>
    </Breadcrumb>
  );

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
  
  if (!keycloak.authenticated && settings.botkit.keycloak.enabled) {
    languageOptions = <p>{bot} {t('settings.language.current')} {t(`settings.language.${botLangauge}`)}</p>
  }

  return (
    <>
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
    </>
  );
}

export default Settings;
