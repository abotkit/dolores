import React, { useState, useEffect, useCallback, useContext, useRef } from 'react';
import { notification, Breadcrumb, Collapse, Button, Modal, Input, Select, Spin, Row, Col, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, CopyOutlined } from '@ant-design/icons';
import { useParams, useHistory } from 'react-router-dom';
import { axios } from '../utils';
import Axios from 'axios';
import { createUseStyles } from 'react-jss';
import { useTranslation } from "react-i18next";
import useCommonStyles from '../styles/commons';
import { Pages, getBreadcrumbs } from '../components/Breadcrumbs';
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
  const sharedClasses = useCommonStyles();

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

  const breadcrumbs = getBreadcrumbs(Pages.INTEGRATIONS, t, sharedClasses, settings.collapsed && bot)

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

  const postUrlChange = async (integration) => {
    const newUrl = document.getElementById(`integration_url_input_${integration.uuid}`).value;
    if (newUrl === '') {
      showNotification('Couldn\'t modify integration', 'The new integration url should not be empty.');
      return;
    }

    try {
      await axios.post(`${settings.botkit.host}:${settings.botkit.port}/bot/${bot}/integration/${integration.uuid}`, { name: integration.name, type: integration.type, config: (integration.type === 'html') ? { url: newUrl, link: integration.config.link } : {} });
    } catch (error) {
      showNotification('Couldn\'t modify integration url', error.message);
      return;
    }

    fetchIntegrations();
  }

  const postNameChange = async (integration) => {
    const newName = document.getElementById(`integration_name_input_${integration.uuid}`).value;
    if (newName === '') {
      showNotification('Couldn\'t modify integration', 'The new integration name should not be empty.');
      return;
    }

    try {
      await axios.post(`${settings.botkit.host}:${settings.botkit.port}/bot/${bot}/integration/${integration.uuid}`, { name: newName, type: integration.type, config: (integration.type === 'html') ? { url: integration.config.url, link: integration.config.link } : {} });
    } catch (error) {
      showNotification('Couldn\'t modify integration name', error.message);
      return;
    }

    fetchIntegrations();
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
      await axios.put(`${settings.botkit.host}:${settings.botkit.port}/bot/${bot}/integration`, { name: integrationName, type: selectedIntegrationType, config: (selectedIntegrationType === 'html') ? { url: integrationUrl } : {} });
    } catch (error) {
      showNotification('Couldn\'t add integration', error.message);
      return;
    }

    closeModal();
    fetchIntegrations();
  }

  const deleteIntegration = async (uuid) => {
    try {
      await axios.delete(`${settings.botkit.host}:${settings.botkit.port}/bot/${bot}/integration?uuid=${uuid}`);
    } catch (error) {
      showNotification('Couldn\'t delete integration', error.message);
    }

    fetchIntegrations();
  }

  const copyIntegrationLink = async (uuid) => {
    const selection = document.getSelection();
    const range = document.createRange();
    range.selectNode(document.getElementById(`integration_input_${uuid}`));
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand('copy');
    showNotification(t('integrations.notifications.linkToClipboard'));
  }

  let content = <><Button onClick={() => setVisible(true)} type="primary" shape="round" icon={<PlusOutlined />}>{t('integrations.add')}</Button>
    { integrations.length > 0 ? <Collapse style={{ marginTop: 16 }} defaultActiveKey={['0']}>
      {integrations.map((integration, key) =>
        <Panel header={<span>{integration.name}</span>} key={key}>
          <>
            <Row>
              <Col span="24">
                <span className={`${classes.label}`}>{t('integrations.add-dialog.type')}:</span>
              </Col>
            </Row>
            <Row>
              <Col span="24">
                <Input value={integration.type} disabled />
              </Col>
            </Row>
            <Row>
              <Col span="24">
                <span className={`${classes.label}`}>{t('integrations.add-dialog.name')}:</span>
              </Col>
            </Row>
            <Row>
              <Col span="23">
                <Input defaultValue={integration.name} id={`integration_name_input_${integration.uuid}`} />
              </Col>
              <Col span="1">
                <Button className={classes.button} onClick={() => postNameChange(integration)} type="primary" shape="circle" icon={<EditOutlined />} />
              </Col>
            </Row>
            <Row>
              <Col span="24">
                <span className={`${classes.label}`}>{t('integrations.add-dialog.url')}:</span>
              </Col>
            </Row>
            <Row>
              <Col span="23">
                <Input defaultValue={integration.config.url} id={`integration_url_input_${integration.uuid}`} />
              </Col>
              <Col span="1">
                <Button className={classes.button} onClick={() => postUrlChange(integration)} type="primary" shape="circle" icon={<EditOutlined />} />
              </Col>
            </Row>
            <Row>
              <Col span="24">
                <span className={`${classes.label}`}>{t('integrations.add-dialog.integration-snippet')}:</span>
              </Col>
            </Row>
            <Row>
              <Col span="23">
                <textarea rows="3" value={integration.config.link} disabled id={`integration_input_${integration.uuid}`} />
              </Col>
              <Col span="1">
                <Button className={classes.button} onClick={() => copyIntegrationLink(`${integration.uuid}`)} type="primary" shape="circle" icon={<CopyOutlined />} />
              </Col>
            </Row>
            <Row>
              <Col span="24">
                <Popconfirm
                  title={t('integrations.delete-confirmation')}
                  onConfirm={() => deleteIntegration(`${integration.uuid}`)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button className={classes.button} type="primary">{t('integrations.delete')}</Button>
                </Popconfirm>
              </Col>
            </Row>
          </>
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
        <Select className={classes.select} value={selectedIntegrationType} onChange={value => setSelectedIntegrationType(value)} style={{ marginBottom: 12, minWidth: 200 }}>
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
    <div className={sharedClasses.page}>
      { breadcrumbs}
      <h1>{t('integrations.headline')}</h1>
      { content}
    </div>
  );
}

export default Integrations;