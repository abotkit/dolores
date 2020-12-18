/* eslint no-eval: 0 */
import React, { useContext, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import { Input, Button, message, Form, Tooltip, Space } from 'antd';
import { CopyOutlined, MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { axios } from '../utils';
import { SettingsContext } from '../SettingsContext';
import { createUseStyles } from 'react-jss';

const useStyle = createUseStyles({
  copyableInput: {
    '& .ant-input-suffix': {
      fontSize: '1.2rem',
      padding: 6
    },
    '& .ant-input': {
      fontSize: '0.7rem'
    }
  },
  space: {
    width: '100%',
    '& .ant-space-item': {
      width: '100%'
    }
  }
}) 

const IntegrationSettings = props => {
  const { components, name } = props;
  const [settings] = useContext(SettingsContext);
  const { t, i18n } = useTranslation();
  const { languages } = i18n;
  const { bot } = useParams();
  const classes = useStyle();

  let initialValues = useMemo(() => {
    if (typeof components !== 'undefined') {
      let initialValues = {};
      let key = 0;
      for (const component of components) {
        if (component.type === 'input') {
          initialValues = { ...initialValues, [component.name || key]: component.value || '' }
        } else if (component.type === 'dynamic-list') {
          initialValues = { ...initialValues, [component.name || key]: component.entries || [] }
        }
        key += 1;
      }
      return initialValues;
    } else {
      return {};
    }
  }, [components]);

  const [inputValues, setInputValues] = useState(initialValues);

  if (typeof components === 'undefined') {
    return null;
  }

  const language = languages[0].split('-')[0];
  
  return <Form 
    style={{ borderRadius: 2, margin: '12px 0', padding: '24px 0', backgroundColor: 'white' }}
    labelCol={{ span: 7 }}
    wrapperCol={{ span: 15 }}
    layout="horizontal"
    onValuesChange={(changedValues, allValues) => setInputValues(allValues)}
    initialValues={initialValues}>
    {components.map((component, key) => {
      if (component.type === 'input') {
        let readonly = false;
        let copyable = false;

        if (typeof component.attributes !== 'undefined') {
          readonly = component.attributes.includes('readonly');
          copyable = component.attributes.includes('copyable');
        }

        return <Form.Item key={key} 
            wrapperCol={ copyable ? { span: 24 } : null } 
            label={ copyable ? null : (component.placeholder[language] || "")} 
            name={ component.name || key}>
            <Input 
              readOnly={readonly}
              className={ copyable ? classes.copyableInput : null }
              value={inputValues[key]}
              onChange={event => setInputValues({...inputValues, [component.name || key]: event.target.value})} 
              suffix={ copyable ?
                <Tooltip placement="topRight" title={t('integrations.input.copy')}>
                  <CopyOutlined onClick={() => {
                    navigator.clipboard.writeText(inputValues[key]);
                    message.success(t('integrations.input.copied', { message: inputValues[key] }));
                  }} />
                </Tooltip> : null
              }
              placeholder={ component.placeholder[language] || "" } />
          </Form.Item>;
      } else if (component.type === 'button') {
        return <Form.Item key={key} label=" " colon={ false } ><Button onClick={async () => {
          if (typeof component.action !== 'undefined') {
            if (component.action === 'execute') {
              const response = await axios.post(`${settings.botkit.url}/integration/execute`, {
                bot: bot,
                name: name
              });
              if (typeof component.postAction !== 'undefined') {
                eval(component.postAction)(response);
              }
            } else if (component.action === 'submit') {
              try {
                await axios.post(`${settings.botkit.url}/integration/settings`, {
                  bot: bot,
                  name: name,
                  data: inputValues
                });

                if(typeof component.postActionSnackbar !== 'undefined') {
                  message.success(component.postActionSnackbar[language]);
                }
              } catch (error) {
                message.error(t('integration.request.failed'))
              } 
            } else {
              eval(component.action)();
            }
          } 
        }}>{ component.text[language] }</Button></Form.Item>;
      } else if (component.type === 'dynamic-list') {
        const headline = component.headline ? <h1>{component.headline[language]}</h1> : null

        return <div key={key}>{ headline }<Form.List name={component.name}>
        {(fields, { add, remove }) => (
          <>
            {fields.map(field => (
              <Space key={field.key} align="baseline" className={classes.space} >
                <Form.Item
                  {...field}
                  name={field.name}
                  style={{ width: '100%' }}
                  wrapperCol={{ span: 24 }}               
                >
                  <Input placeholder={component.placeholder[language]}/>
                </Form.Item>
                <MinusCircleOutlined onClick={() => remove(field.name)} />
              </Space>
            ))}
            <Form.Item>
              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                Add field
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List></div>

      } else {
        console.warn(`Component type ${component.type} is not supported.`)
        return null;
      }
    })}
  </Form>
}

export default IntegrationSettings;