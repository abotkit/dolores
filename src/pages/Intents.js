import React, { useState, useEffect, useCallback, useContext, useRef } from 'react';
import { notification, Collapse, Button, Modal, Input, Select, Tag, Divider, Spin } from 'antd';
import { PlusOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Pages, getBreadcrumbs } from '../components/Breadcrumbs';
import { useParams, useHistory } from 'react-router-dom';
import Axios from 'axios';
import { axios } from '../utils';
import { createUseStyles } from 'react-jss';
import { useTranslation } from "react-i18next";
import { SettingsContext } from '../SettingsContext';
import useCommonStyles from '../styles/commons';

const { Panel } = Collapse;
const { Option } = Select;

const useStyles = createUseStyles({
  input: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 12
  },
  label: {
    flex: '0 0 16%',
  },
  required: {
    '&:before': {
      display: 'inline-block',
      marginRight: 4,
      color: '#ff4d4f',
      fontSize: 14,
      fontFamily: 'SimSun, sans-serif',
      lineHeight: 1,
      content: '"*"'
    }
  },
  button: {
    marginLeft: 6
  },
  example: {
    padding: 6,
    display: 'flex',
    alignItems: 'center',
    '& > span:last-child': {
      marginLeft: 6
    }
  }
});

const showNotification = (headline, message='', type='warning') => {
  notification[type]({
    message: headline,
    description: message,
  });
};

const Intents = () => {  
  const classes = useStyles();
  const { bot } = useParams();
  const history = useHistory();
  const { t } = useTranslation();
  const [settings] = useContext(SettingsContext);
  const { botkit: {url} } = settings;

  const [intents, setIntents] = useState([]);
  const [intentName, setIntentName] = useState('');
  const [visible, setVisible] = useState(false);
  const [examples, setExamples] = useState([]);
  const [exampleText, setExampleText] = useState('');
  const [phrases, setPhrases] = useState([]);
  const [phraseText, setPhraseText] = useState('');
  const [actions, setActions] = useState([]);
  const [selectedActions, setSelectedActions] = useState([]);
  const [selectedNewAction, setSelectedNewAction] = useState('');
  const [newExampleTexts, setNewExampleTexts] = useState([]);
  const [intentPhrases, setIntentPhrases] = useState({});
  const [newPhrases, setNewPhrases] = useState([]);
  const [loading, setLoading] = useState(false);
  const sharedClasses = useCommonStyles();

  const CancelToken = useRef(Axios.CancelToken);
  const source = useRef(CancelToken.current.source());

  const fetchIntents = useCallback(async (useLoadingAnimation=false) => {
    if (useLoadingAnimation) {
      setLoading(true);
    }
    try {
      const intents = (await axios.get(`${url}/bot/${bot}/intents`, {
        cancelToken: source.current.token
      })).data;
      const phrases = (await axios.get(`${url}/bot/${bot}/phrases`, {
        cancelToken: source.current.token
      })).data;
      for (const intent of intents) {
        intent.examples = (await axios.get(`${url}/intent/${encodeURIComponent(intent.name)}/bot/${bot}/examples`,{
          cancelToken: source.current.token
        })).data;
      }
      
      setIntents(intents);
      setIntentPhrases(phrases);
      setSelectedActions(intents.map(intent => intent.action));
      setNewExampleTexts([...Array(intents.length).keys()].map(() => ''))
      setNewPhrases([...Array(intents.length).keys()].map(() => ''))
    } catch (error) {
      if (!Axios.isCancel(error)) {
        console.warn('abotkit rest api is not available', error);
      }
    } finally {
      setLoading(false);
    }
  }, [bot, url]);

  const selectAction = (intent, action) => {
    const updates = [...selectedActions];
    updates[intent] = action;
    setSelectedActions(updates);
    // TODO: SEND UPDATE TO SERVER
  }

  useEffect(() => {
    const axiosSource = source.current;
    axios.get(`${url}/bot/${bot}/actions`, {
      cancelToken: axiosSource.token
    }).then(response => {
      const availableActions = response.data;
    
      setActions(availableActions);
      if (availableActions.length > 0) {
        setSelectedNewAction(availableActions[0].name)
      }
    }).catch(error => {
      if (!Axios.isCancel(error)) {
        console.warn('abotkit rest api is not available', error);
      }
    });

    return () => {
      axiosSource.cancel();
    }
  }, [bot, url]);

  useEffect(() => {
    const axiosSource = source.current;
    axios.get(`${url}/bot/${bot}/status`, {
      cancelToken: axiosSource.token
    }).then(() => {
      fetchIntents(true);
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
  }, [fetchIntents, history, bot, url]);

  const breadcrumbs = getBreadcrumbs(Pages.INTENTS, t, sharedClasses, settings.collapsed && bot)

  if (settings.keycloak.enabled && !settings.keycloak.instance.authenticated) {
    return (
      <div className={sharedClasses.page}>
        { breadcrumbs }
        <h3>{t('login.info.pre')}<span onClick={() => settings.keycloak.instance.login()} className={sharedClasses.link}>{t('login.info.link')}</span>{t('login.info.post', {bot: bot, page: t('breadcrumbs.intents')})}</h3>
      </div>
    );
  }

  const removeExample = (event, text) => {
    event.preventDefault();
    setExamples(examples.filter(example => example !== text));
  }

  const addExample = () => {
    if (exampleText === '') {
      showNotification('Couldn\'t add example', 'The example text should not be empty.');
      return;
    }

    if (examples.includes(exampleText)) {
      showNotification('Couldn\'t add example', 'This example is already included in the example list.');
      return;
    }

    setExamples([...examples, exampleText]);
    setExampleText('');
  }

  const updateNewExampleTexts = (intent, example) => {
    const updates = [...newExampleTexts];
    updates[intent] = example;
    setNewExampleTexts(updates);
  }

  const addNewExample = async intent => {
    try {
      await axios.post(`${settings.botkit.url}/example`, { bot: bot, intent: intents[intent].name, example: newExampleTexts[intent] });
    } catch (error) {
      showNotification('Couldn\'t add example', error.message);
      return;
    }
    
    fetchIntents();
  }

  const removeExampleFromIntent = async (example, intent) => {
    await axios.delete(`${settings.botkit.url}/example`, { data: {bot: bot, example: example, intent: intent } });
    fetchIntents();
  }

  const removePhrase = (event, text) => {
    event.preventDefault();
    setPhrases(phrases.filter(phrase => phrase !== text));
  }

  const addPhrase = () => {
    if (phraseText === '') {
      showNotification('Couldn\'t add phrase', 'The phrase text should not be empty.');
      return;
    }

    if (phrases.includes(phraseText)) {
      showNotification('Couldn\'t add phrase', 'This phrase is already included in the phrase list.');
      return;
    }

    setPhrases([...phrases, phraseText]);
    setPhraseText('');
  }

  const closeModal = () => {
    setVisible(false);
    setPhrases([]);
    setPhraseText('');
    setExamples([]);
    setExampleText('');
    setIntentName('');
  }

  const setNewPhrase = (intent, phrase) => {
    const updates = [...newPhrases];
    updates[intent] = phrase;
    setNewPhrases(updates);
  }

  const addNewPhrase = async intent => {
    try {
      await axios.post(`${settings.botkit.url}/phrases`, { bot: bot, phrases: [{ intent: intents[intent].name, text: newPhrases[intent] }]});
    } catch (error) {
      showNotification('Couldn\'t add phrase', error.message);
      return;
    }
    
    fetchIntents();
  }

  const removeIntentPhrase = async (event, intent, phrase) => {
    event.preventDefault();
    try {
      await axios.delete(`${settings.botkit.url}/phrase`, { data: { bot: bot, intent: intent.name, phrase: phrase }});
    } catch (error) {
      showNotification('Couldn\'t add phrase', error.message);
      return;
    }
    
    fetchIntents();    
  }

  const addIntent = async () => {
    if (intentName === '') {
      showNotification('Couldn\'t add intent', 'The intent name should not be empty.');
      return;      
    }

    if (examples.length < 2) {
      showNotification('Couldn\'t add intent', 'You need to provide at least 2 examples.');
      return;       
    }

    try {
      await axios.post(`${settings.botkit.url}/intent`, { action: selectedNewAction, bot: bot, intent: intentName, examples: examples });
    } catch (error) {
      showNotification('Couldn\'t add intent', error.message);
      return;
    }

    if ( selectedNewAction === 'Talk' ) {
      await axios.post(`${settings.botkit.url}/phrases`, { bot: bot, phrases: phrases.map(phrase => ({ intent: intentName, text: phrase })) });
    }
    closeModal();
    fetchIntents();
  }

  let content = <><Button onClick={() => setVisible(true)} type="primary" shape="round" icon={<PlusOutlined />}>{ t('intents.add') }</Button>
    { intents.length > 0 ? <Collapse style={{ marginTop: 16 }} defaultActiveKey={['0']}>
      { intents.map((intent, key) =>
        <Panel header={ intent.name } key={ key }>
          <h3>{ t('intents.collapse.action') }</h3>
          <Select value={selectedActions[key]} onChange={value => selectAction(key, value)} style={{ marginBottom: 12, minWidth: 200 }}>
            { actions.map((action, key) => <Option key={ action.name } value={ action.id }>{ action.name }</Option>) }
          </Select>
          { typeof selectedActions[key] !== 'undefined' && selectedActions[key] === 'Talk' ? <>
            <div className={classes.input}>
              <span className={classes.label}>{ t('intents.collapse.answer') }:</span><Input value={newPhrases[key]} onChange={({ target: { value } }) => setNewPhrase(key, value)} placeholder={ t('intents.collapse.answer-placeholder') } />
              <Button className={classes.button} onClick={() => addNewPhrase(key)} type="primary" shape="circle" icon={<PlusOutlined />} />
            </div>
            <div>
              { typeof intentPhrases[intent.name] === 'undefined' ? null : intentPhrases[intent.name].map((phrase, index) => <Tag key={index} closable onClose={event => removeIntentPhrase(event, intent, phrase)}>{ phrase }</Tag>)}
            </div>
      </> : null}
          <h3>{ t('intents.collapse.examples') }</h3>
          <div className={classes.input}>
            <Input value={newExampleTexts[key]} onPressEnter={() => addNewExample(key)} onChange={({ target: { value } }) => updateNewExampleTexts(key, value)} placeholder={ t('intents.collapse.example-placeholder') } />
            <Button className={classes.button} onClick={() => addNewExample(key)} type="primary" shape="circle" icon={<PlusOutlined />} />
          </div>

          { typeof intent.examples !== 'undefined' && intent.examples.map((example, key) => <div key={ key } className={classes.example}><CloseCircleOutlined onClick={() => removeExampleFromIntent(example, intent.name)} /><span>{ example }</span></div>) }
        </Panel>
      )}
    </Collapse> : null }
    <Modal
      title={ t('intents.add-dialog.headline') }
      visible={visible}
      onOk={() => addIntent()}
      onCancel={closeModal}
    >
      <div className={classes.input}>
        <span className={`${classes.required} ${classes.label}`}>{ t('intents.add-dialog.name') }:</span><Input value={intentName} onChange={({ target: { value } }) => setIntentName(value)} placeholder={ t('intents.add-dialog.name-placeholder') } />
      </div>
      <div className={classes.input}>
        <span className={`${classes.required} ${classes.label}`}>{ t('intents.add-dialog.example') }:</span><Input value={exampleText} onChange={({ target: { value } }) => setExampleText(value)} placeholder={ t('intents.add-dialog.example-placeholder') } />
        <Button className={classes.button} onClick={addExample} type="primary" shape="circle" icon={<PlusOutlined />} />
      </div>
      <div>
        { examples.map((example, index) => <Tag key={index} closable onClose={event => removeExample(event, example)}>{ example }</Tag>) }
      </div>
      <Divider orientation="left">{ t('intents.add-dialog.action') }</Divider>
      <Select value={selectedNewAction} onChange={ value => setSelectedNewAction(value)} style={{ marginBottom: 12, minWidth: 200 }}>
        { actions.map((action, key) => <Option key={ key } value={ action.name }>{ action.name }</Option>) }
      </Select>
      
      { selectedNewAction === 'Talk' ? <>
        <div className={classes.input}>
          <span className={`${classes.required} ${classes.label}`}>{ t('intents.add-dialog.answer') }:</span><Input value={phraseText} onChange={({ target: { value } }) => setPhraseText(value)} placeholder={ t('intents.add-dialog.answer-placeholder') } />
          <Button className={classes.button} onClick={addPhrase} type="primary" shape="circle" icon={<PlusOutlined />} />
        </div>
        <div>
          { phrases.map((phrase, index) => <Tag key={index} closable onClose={event => removePhrase(event, phrase)}>{ phrase }</Tag>) }
        </div>
      </> : null }
    </Modal>
  </>

  if (loading) {
    content = <Spin tip={ t('intents.loading.tip') } />
  }

  return (
    <div className={sharedClasses.page}>
      { breadcrumbs }
      <h1>{ t('intents.headline') }</h1>
      { content }
    </div>
  );
}

export default Intents;