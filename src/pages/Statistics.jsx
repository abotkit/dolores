import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Table, Space, Modal, Input, Select, Tooltip, Popconfirm } from 'antd';
import { FormOutlined, DeleteOutlined } from '@ant-design/icons';
import { Pages, getBreadcrumbs } from '../components/Breadcrumbs';
import { axios } from '../utils';
import Axios from 'axios';
import { useTranslation } from 'react-i18next';
import { SettingsContext } from '../SettingsContext';
import useCommonStyles from '../styles/commons';
import moment from 'moment';
import 'moment/locale/de';
import 'moment/locale/en-gb';
const { Option } = Select;

const Statistics = () => {
  const { bot } = useParams();
  const [botHistory, setBotHistory] = useState([]);
  const history = useHistory();
  const { t, i18n } = useTranslation();
  const [settings] = useContext(SettingsContext);
  const sharedClasses = useCommonStyles();
  const CancelToken = useRef(Axios.CancelToken);
  const source = useRef(CancelToken.current.source());
  const { languages } = i18n;
  const [filter, setFilter] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [intents, setIntents] = useState([]);
  const [selectedExample, setSelectedExample] = useState('');
  const [suggestedIntent, setSuggestedIntent] = useState('');

  useEffect(() => {
    setFilter(botHistory.map(entry => entry.intent).reduce((x, y) => x.includes(y) ? x : [...x, y], []).filter(intent => intent !== 'welcome') || [])
  }, [botHistory]);

  const columns = [{
      title: t('statistics.table.header.query'),
      dataIndex: 'query',
      key: 'query',
      width: '30%'
    },{
      title: t('statistics.table.header.intent'),
      dataIndex: 'intent',
      key: 'intent',
      width: '20%',
      filters: botHistory.map(entry => entry.intent).reduce((x, y) => x.includes(y) ? x : [...x, y], []).map(entry => ({
        text: entry,
        value: entry
      })),
      onFilter: (value, record) => record.intent.indexOf(value) === 0,
      filteredValue: filter 
    },{
      title: t('statistics.table.header.match'),
      dataIndex: 'confidence',
      key: 'confidence',
      width: '10%',
      render: (text, record, index) => <span>{Math.round(Number(text)*10000)/100.0}%</span>,
      sorter: (a, b) => a.confidence - b.confidence,
    },{
      title: t('statistics.table.header.time'),
      dataIndex: 'created',
      key: 'created',
      render: (text, record, index) => (<p>{moment.utc(text, 'YYYY-MM-DD HH:mm:ss').locale(languages[0]).fromNow()}</p>),
      defaultSortOrder: 'descend',
      sorter: (a, b) => (new Date(a.created).getTime()) - (new Date(b.created).getTime()),
      sortDirections: ['descend', 'ascend'],
    },{
      title: t('statistics.table.header.action'),
      key: 'action',
      fixed: 'right',
      width: 100,
      align: 'center',
      render: (text, record) => (
        <Space size="middle">
          <Tooltip title={t('statistics.table.tooltip')}>
            <FormOutlined onClick={() => {
              setSelectedExample(record.query);
              setIsVisible(true);
              setSuggestedIntent(record.intent);
            }} />
          </Tooltip>
          <Popconfirm placement="topRight" title={t('statistics.table.popconfirm.question')} onConfirm={() => console.log('Clicked on Yes.')} okText={t('statistics.table.popconfirm.yes')} cancelText={t('statistics.table.popconfirm.no')}>
            <DeleteOutlined  />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleChange = (pagination, filters, sorter) => {
    setFilter(filters.intent);
  };

  useEffect(() => {
    const axiosSource = source.current;
    axios.get(`${settings.botkit.url}/bot/${bot}/status`, {
      cancelToken: axiosSource.token
    }).then(() => {
      axios.get(`${settings.botkit.url}/bot/${bot}/history`, {
        cancelToken: axiosSource.token
      }).then(response => {
        setBotHistory(response.data.map((row, i)  => ({ ...row, key: i })));
        axios.get(`${settings.botkit.url}/bot/${bot}/intents`, {
          cancelToken: axiosSource.token
        }).then(response => {
          setIntents(response.data.map(intent => intent.name));
        }).catch(error => {
          if (!Axios.isCancel(error)) {
            console.warn('abotkit rest api is not available', error);
          }
        })
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

  const breadcrumbs = getBreadcrumbs(Pages.STATISTICS, t, sharedClasses, settings.collapsed && bot)

  if (settings.keycloak.enabled && !settings.keycloak.instance.authenticated) {
    return (
      <>
        { breadcrumbs }
        <h3>{`Sorry, but you need to login to see the actions page of ${bot}`}</h3>
      </>
    );
  }

  return (
    <div className={sharedClasses.page}>
      { breadcrumbs }
      <h1>{ t('statistics.headline') }</h1>
      <Table dataSource={botHistory} columns={columns} onChange={handleChange} scroll={{ x: 1000 }} />

      <Modal
        title="Beispiel hinzufügen"
        visible={isVisible}
        onOk={() => setIsVisible(false)}
        okText="Hinzufügen"
        onCancel={() => setIsVisible(false)}
      >
        <Input defaultValue={ selectedExample } style={{ marginBottom: 8}} />
        <Select defaultValue={ suggestedIntent}>
          {intents.map(intent => <Option value={intent} key={intent}>{intent}</Option>)}
        </Select>
      </Modal>

    </div>
  );
}

export default Statistics;