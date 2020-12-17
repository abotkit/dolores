/* eslint no-eval: 0 */

import React, { useContext, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import { Input, Button, message, Form } from 'antd';
import { axios } from '../utils';
import { SettingsContext } from '../SettingsContext';

const IntegrationSettings = props => {
  const { components, name } = props;
  const [settings] = useContext(SettingsContext);
  const { t, i18n } = useTranslation();
  const { languages } = i18n;
  const { bot } = useParams();
  const [inputValues, setInputValues] = useState({});

  if (typeof components === 'undefined') {
    return null;
  }

  const language = languages[0].split('-')[0];
  
  return <Form 
    style={{ borderRadius: 2, margin: '12px 0', padding: '24px 0', backgroundColor: 'white' }}
    labelCol={{ span: 7 }}
    wrapperCol={{ span: 15 }}
    layout="horizontal">
    {components.map((component, key) => {
      if (component.type === 'input') {
        return <Form.Item key={key} label={ component.placeholder[language] || "" } name={ component.name || ""}>
            <Input value={inputValues[key]} onChange={event => setInputValues({...inputValues, [component.name || key]: event.target.value})} placeholder={ component.placeholder[language] || "" } />
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
      } else {
        console.warn(`Component type ${component.type} is not supported.`)
        return null;
      }
    })}
  </Form>
}

export default IntegrationSettings;