import React, { useState, useEffect, useCallback, useContext, useRef } from 'react';
import { notification, Breadcrumb, Collapse, Button, Modal, Input, Select, Tag, Divider, Spin } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, CopyOutlined } from '@ant-design/icons';
import { useParams, useHistory } from 'react-router-dom';
import { axios } from '../utils';
import Axios from 'axios';
import { createUseStyles } from 'react-jss';
import { useTranslation } from "react-i18next";
import { SettingsContext } from '../SettingsContext';

const { Panel } = Collapse;
const { Option } = Select;

const useStyles = createUseStyles({
  input: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 12
  },
  select: {
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

const showNotification = (headline, message = '', type = 'warning') => {
  notification[type]({
    message: headline,
    description: message,
  });
};

const Integrations = () => {
  const classes = useStyles();
  const { bot } = useParams();
  const history = useHistory();
  const { t } = useTranslation();
  const [settings] = useContext(SettingsContext);
  const integrationTypes = [{ name: 'html' }];

  const [integrations, setIntegrations] = useState([]);
  const [integrationName, setIntegrationName] = useState('');
  const [selectedIntegrationType, setSelectedIntegrationType] = useState('');
  const [integrationUrl, setIntegrationUrl] = useState('');
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const CancelToken = useRef(Axios.CancelToken);
  const source = useRef(CancelToken.current.source());

  const fetchIntegrations = useCallback(async () => {
    setLoading(true);
    try {
      const integrations = (await axios.get(`${settings.botkit.host}:${settings.botkit.port}/bot/${bot}/integrations`, {
        cancelToken: source.current.token
      })).data;

      setIntegrations(integrations);
    } catch (error) {
      if (!Axios.isCancel(error)) {
        console.warn('abotkit rest api is not available', error);
      }
    } finally {
      setLoading(false);
    }
  }, [bot, settings]);

  useEffect(() => {
    const axiosSource = source.current;
    axios.get(`${settings.botkit.host}:${settings.botkit.port}/bot/${bot}/status`, {
      cancelToken: axiosSource.token
    }).then(() => {
      fetchIntegrations();
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
  }, [fetchIntegrations, history, bot, settings]);

  const breadcrumbs = (
    <Breadcrumb style={{ margin: '16px 0' }}>
      <Breadcrumb.Item>{t('integrations.breadcrumbs.home')}</Breadcrumb.Item>
      <Breadcrumb.Item>{t('integrations.breadcrumbs.integrations')}</Breadcrumb.Item>
    </Breadcrumb>
  );

  if (settings.keycloak.enabled && !settings.keycloak.instance.authenticated) {
    return (
      <>
        { breadcrumbs}
        <h3>{`Sorry, but you need to login to see the integrations page of ${bot}`}</h3>
      </>
    );
  }

  const closeModal = () => {
    setVisible(false);
    setIntegrationUrl('');
    setSelectedIntegrationType('');
    setIntegrationName('');
  }

  const addIntegration = async () => {
    if (integrationName === '') {
      showNotification('Couldn\'t add integration', 'The integration name should not be empty.');
      return;
    }

    if (selectedIntegrationType === '') {
      showNotification('Couldn\'t add integration', 'The integration type should not be empty.');
      return;
    }

    if (selectedIntegrationType === 'html' && integrationUrl === '') {
      showNotification('Couldn\'t add integration', 'The integration url should not be empty if type is html.');
      return;
    }

    try {
      await axios.post(`${settings.botkit.host}:${settings.botkit.port}/bot/${bot}/integration`, { name: integrationName, type: selectedIntegrationType, config: (selectedIntegrationType === 'html') ? { url: integrationUrl } : {} });
    } catch (error) {
      showNotification('Couldn\'t add integration', error.message);
      return;
    }

    closeModal();
    fetchIntegrations();
  }

  const deleteIntegration = async () => {

  }

  const editIntegrationUrl = async () => {

  }

  const copyIntegrationLink = async () => {
    const copyText = document.getElementById("integration_input_88016c54-2e05-48cb-8de8-548de18dba9a");
    const selection = document.getSelection();
    const range = document.createRange();
    range.selectNode(copyText);
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand('copy');
    showNotification(t('integrations.notifications.linkToClipboard'));
  }

  let content = <><Button onClick={() => setVisible(true)} type="primary" shape="round" icon={<PlusOutlined />}>{t('integrations.add')}</Button>
    { integrations.length > 0 ? <Collapse style={{ marginTop: 16 }} defaultActiveKey={['0']}>
      {integrations.map((integration, key) =>
        <Panel header={integration.name} key={key}>
          <span className={`${classes.label}`}>{t('integrations.add-dialog.type')}:</span><span>{integration.type}</span>
          <span className={`${classes.label}`}>{t('integrations.add-dialog.url')}:</span><span>{integration.config.url}</span>
          <Button className={classes.button} onClick={editIntegrationUrl} type="primary" shape="circle" icon={<EditOutlined />} />
          <Input value={integration.config.link} disabled id={`integration_input_${integration.uuid}`}/>
          <Button className={classes.button} onClick={copyIntegrationLink} type="primary" shape="circle" icon={<CopyOutlined />} />
          <Button className={classes.button} onClick={deleteIntegration} type="primary" shape="circle" icon={<DeleteOutlined />} />
        </Panel>
      )}
    </Collapse> : null}
    <Modal
      title={t('integrations.add-dialog.headline')}
      visible={visible}
      onOk={() => addIntegration()}
      onCancel={closeModal}
    >
      <div className={classes.input}>
        <span className={`${classes.required} ${classes.label}`}>{t('integrations.add-dialog.name')}:</span><Input value={integrationName} onChange={({ target: { value } }) => setIntegrationName(value)} placeholder={t('integrations.add-dialog.name-placeholder')} />
      </div>
      <div>
        <span className={`${classes.required} ${classes.label}`}>{t('integrations.add-dialog.type')}:</span>
        <Select value={selectedIntegrationType} onChange={value => setSelectedIntegrationType(value)} style={{ marginBottom: 12, minWidth: 200 }}>
          {integrationTypes.map((integrationType, key) => <Option key={key} value={integrationType.name}>{integrationType.name}</Option>)}
        </Select>
      </div>
      {selectedIntegrationType === 'html' ? <>
        <div className={classes.input}>
          <span className={`${classes.required} ${classes.label}`}>{t('integrations.add-dialog.url')}:</span><Input value={integrationUrl} onChange={({ target: { value } }) => setIntegrationUrl(value)} placeholder={t('integrations.add-dialog.url-placeholder')} />
        </div>
      </> : null}
    </Modal>
  </>

  if (loading) {
    content = <Spin tip={t('integrations.loading.tip')} />
  }

  return (
    <>
      { breadcrumbs}
      <h1>{t('integrations.headline')}</h1>
      { content}
    </>
  );
}

export default Integrations;