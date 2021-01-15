import React, { useEffect, useState, useContext, useRef } from 'react';
import { Layout, Button, Select } from 'antd';
import { RocketOutlined } from '@ant-design/icons';
import { createUseStyles } from 'react-jss';
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { axios } from '../utils';
import Axios from 'axios';
import { SettingsContext } from '../SettingsContext';
const { Header, Content, Footer } = Layout;
const { Option } = Select;

const useStyles = createUseStyles({
  title: {
    color: 'white',
    display: 'flex',
    justifyContent: 'center'
  },
  headline: {
    margin: '1.5em 0'
  },
  input: {
    display: 'flex',
    maxWidth: 600
  },
  content: {
    padding: '0 10vw',
    '& > p': {
      textAlign: 'justify'
    }
  },
  logo: {
    display: 'flex',
    justifyContent: 'center',
    '& > div': {
      height: 48,
      width: 48,
      backgroundSize: '75%',
      backgroundPosition: 'center',
      marginTop: 8,
      marginRight: 4,
      backgroundRepeat: 'no-repeat'
    }
  }
})

const About = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [botname, setBotname] = useState('');
  const history = useHistory();
  const [settings] = useContext(SettingsContext);
  const [bots, setBots] = useState([]);
  const CancelToken = useRef(Axios.CancelToken);
  const source = useRef(CancelToken.current.source());

  const { botkit: {url} } = settings;

  useEffect(() => {
    const axiosSource = source.current;
    axios.get(`${url}/bots`, { cancelToken: axiosSource.token }).then(response => {
      setBots(response.data);
    }).catch(error => {
      if (!Axios.isCancel(error)) {
        console.warn('abotkit rest api is not available', error);
      }
    });   

    return () => {
      axiosSource.cancel();
    }
  }, [url]);

  const visit = bot => {
    history.push(`/${bot}/chat`);
  }

  return(
    <>
      <Header>
        <div className={classes.logo}><div style={{ backgroundImage: 'url(/logo.svg)' }} /><h3 className={ classes.title }>Abotkit</h3></div>
      </Header>
      <Content className={classes.content}>
        <h3 className={ classes.headline }>{ t('about.start.headline') }</h3>
        <p>{ t('about.start.text') }</p>
        <div className={ classes.input }>
          <Select
            style={{ width: '100%' }}
            showSearch
            placeholder={ t('about.start.placeholder') }
            optionFilterProp="children"
            onChange={value => setBotname(value)}
          >
            { bots.map(bot => <Option key={bot.name} value={ bot.name }>{ bot.name}</Option>) }
          </Select>
          <Button onClick={() => visit(botname)} type="primary" icon={<RocketOutlined />}>{ t('about.start.button') }</Button>
        </div>
        <h3 className={ classes.headline }>{ t('about.project.headline') }</h3>
        <p>{t('about.project.text')}</p>
        <h3 className={ classes.headline }>{ t('about.contribute.headline') }</h3>
        <p>{ t('about.contribute.text') } <a href="https://github.com/abotkit/abotkit">{ t('about.contribute.link') }</a></p>
      </Content>
      <Footer style={{ textAlign: 'center' }}>abotkit ©2021</Footer>
    </>
  );
}

export default About;