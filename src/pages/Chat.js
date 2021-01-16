import React, { useState, useRef, useEffect, useContext, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useParams, useHistory } from 'react-router-dom';
import { Input, Button } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import Smartphone from '../components/Chat/Smartphone';
import { axios } from '../utils';
import { useTranslation } from "react-i18next";
import moment from 'moment';
import { SettingsContext } from '../SettingsContext';
import 'moment/locale/de';
import 'moment/locale/en-gb';
import useCommonStyles from '../styles/commons';
import { createUseStyles } from 'react-jss';
import { Pages, getBreadcrumbs } from '../components/Breadcrumbs';
import TypingIndicator from '../components/TypingIndicator';

const useStyle = createUseStyles({
    display: {
        display: 'flex',
        flexDirection: 'column',
        backgroundImage: 'url("/assets/teal-ocean.jpg")',
        backgroundSize: 'cover'
    },
    messages: {
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        color: '#303030',
        overflowY: 'scroll',
        //Firefox
        scrollbarWidth: 'thin',
        scrollbarColor: '#acacac transparent',
        //Google Chrome
        '&::-webkit-scrollbar': {
            background: 'tranparent',
            width: '0.3rem'
        },
        '&::-webkit-scrollbar-thumb': {
            background: '#acacac',
            borderRadius: '10rem'
        }
    },
    message: {
        display: 'flex',
        flexDirection: 'column',
        margin: 12,
        padding: '0 12px',
        width: 'fit-content',
        position: 'relative',
        borderRadius: 6,
        '& p': {
            margin: 0,
            paddingTop: 6
        },
        '& span': {
            fontSize: '0.65rem',
            textAlign: 'end'
        }
    },
    human: {
        background: 'white',
        borderTopLeftRadius: 0,
        '&:after': {
            content: '""',
            position: 'absolute',
            left: 0,
            top: 0,
            width: 0,
            height: 0,
            border: '8px solid transparent',
            borderLeft: 0,
            borderTop: 0,
            borderRightColor: 'white',
            marginLeft: -8
        }
    },
    bot: {
        alignSelf: 'flex-end',
        borderTopRightRadius: 0,
        background: 'rgba(255,255,255,0.8)',
        '&:after': {
            content: '""',
            position: 'absolute',
            right: 0,
            top: 0,
            width: 0,
            height: 0,
            border: '8px solid transparent',
            borderRight: 0,
            borderTop: 0,
            borderLeftColor: 'rgba(255,255,255,0.8)',
            marginRight: -8
        }
    },
    input: {
        borderRadius: 12,
        margin: 12,
        borderColor: 'unset !important',
        outline: '0 !important',
        boxShadow: 'unset !important',
        border: 'none',
        width: 'calc(100% - 24px)'
    }
});

const Chat = () => {
    const { t, i18n } = useTranslation();
    const { languages } = i18n;
    const [text, setText] = useState('');
    const { bot } = useParams();
    const history = useHistory();
    const [firstVisit, setFirstVisit] = useState(true);
    const [, updateState] = useState();
    const forceUpdate = useCallback(() => updateState({}), []);
    const messages = useRef([]);
    const [settings] = useContext(SettingsContext);
    const { botkit: {url} } = settings;
    const [chatIdentifier] = useState(uuidv4());
    const [isTyping, setIsTyping] = useState(false);

    const classes = useStyle();
    const sharedClasses = useCommonStyles();
    const messagebox = useRef();

    const isMobileDevice = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        return width < 700 || height < 600;
    }

    const [displaySmartphone, setDisplaySmartphone] = useState(!isMobileDevice());
    const handleWindowSizeChange = useCallback(() => {
        setDisplaySmartphone(!isMobileDevice())
    }, []);

    const answer = useCallback(async data => {
        const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

        for (const message of data) {
            await sleep(800);
            setIsTyping(false);
            await sleep(200);
            messages.current = [...messages.current, {
                text: message.text,
                issuer: bot,
                type: 'text',
                time: moment().locale(languages[0]).format("YYYY-MM-DD HH:mm:ss"),
            }];

            if (typeof message.buttons !== 'undefined' && message.buttons !== null) {
                messages.current = [...messages.current, {
                    buttons: message.buttons,
                    type: 'buttons'
                }];
            }
            forceUpdate();
            messagebox.current.scrollTop = messagebox.current.scrollHeight;
        }
    }, [bot, forceUpdate, languages]);

    useEffect(() => {
        window.addEventListener('resize', handleWindowSizeChange);
        return () => {
            window.removeEventListener('resize', handleWindowSizeChange);
        }
    }, [handleWindowSizeChange]);

    useEffect(() => {
        if (firstVisit) {
            axios.get(`${url}/bot/${bot}/status`).then(async () => {
                setIsTyping(true);
                try {
                    const response = await axios.post(`${url}/handle`, { query: 'What can you do for me?', bot: bot, identifier: chatIdentifier });
                    await answer(response.data);
                } catch (error) {
                    console.warn('abotkit rest api is not available', error);
                    answer([{ text: t('chat.state.offline') }]);                
                } finally {
                    setIsTyping(false);
                }
            }).catch(error => {
                if (typeof error.response !== 'undefined' && error.response.status === 404) {
                    history.push('/not-found');
                } else {
                    console.warn('abotkit rest api is not available', error);
                }
            });
            setFirstVisit(false);
        }
    }, [history, bot, url, answer, chatIdentifier, t, firstVisit]);

    const sendMessage = async () => {
        if (!text) {
            return;
        }
        messages.current = [...messages.current.filter(message => message.type !== 'buttons'), { text: text, issuer: t('chat.issuer.human'), type: 'text', time: moment().locale(languages[0]).format('YYYY-MM-DD HH:mm:ss') }];
        messagebox.current.scrollTop = messagebox.current.scrollHeight;
        setText('');
        setTimeout(async () => {
            setIsTyping(true);
            try {
                const response = await axios.post(`${settings.botkit.url}/handle`, { query: text, bot: bot, identifier: chatIdentifier });
                answer(response.data);
            } catch (error) {
                console.warn('abotkit rest api is not available', error);
                answer([{ text: t('chat.state.offline') }]);
            }
            messagebox.current.scrollTop = messagebox.current.scrollHeight;
        }, 1000);
    }

    const sendPredefinedMessage = async (title, message) => {
        messages.current = [...messages.current.filter(message => message.type !== 'buttons'), { text: title, issuer: t('chat.issuer.human'), type: 'text', time: moment().locale(languages[0]).format('YYYY-MM-DD HH:mm:ss') }];
        try {
            const response = await axios.post(`${settings.botkit.url}/handle`, { query: message, bot: bot, identifier: chatIdentifier });
            answer(response.data);
        } catch (error) {
            console.warn('abotkit rest api is not available', error);
            answer([{ text: t('chat.state.offline') }]);
        }
        messagebox.current.scrollTop = messagebox.current.scrollHeight;
    }

    const content = (<div className={classes.display} style={{height: displaySmartphone ? '100%' : 'calc(100vh - 60px - 48px)'}}> {/* 100% - header - footer */}
        <div ref={messagebox} className={classes.messages}>
            {messages.current.map((message, i) => {
                if (message.type === 'text') {
                    return <div key={i} className={`${classes.message} ${message.issuer === bot ? classes.bot : classes.human}`}>
                        <p>{message.text}</p>
                        <span>{moment().locale(languages[0]).format('HH:mm')}</span>
                    </div>
                } else if (message.type === 'buttons') {
                    return <div key={i} className={classes.message} style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                        {
                            message.buttons.map(button => <Button style={{ marginRight: 6, marginBottom: 6 }} shape="round" type="primary" ghost onClick={() => sendPredefinedMessage(button.title, button.payload)} >{button.title}</Button>)
                        }
                    </div>
                } else {
                    return null
                }
            })}
            <TypingIndicator visible={isTyping} />
        </div>
        <Input
            className={classes.input}
            value={text}
            onPressEnter={sendMessage}
            onChange={e => setText(e.target.value)}
            placeholder={t("chat.input.placeholder")}
            suffix={<MessageOutlined onClick={sendMessage} />} />
    </div>)

    const breadcrumbs = getBreadcrumbs(Pages.CHAT, t, sharedClasses, settings.collapsed && bot, { marginLeft: displaySmartphone ? 0 : 16, marginRight: displaySmartphone ? 0 : 16 });

    return (
        <div className={displaySmartphone ? sharedClasses.page : {}}>
            { breadcrumbs }
            { displaySmartphone ? <Smartphone>{ content }</Smartphone> : content }
        </div>
    );
};

export default Chat;
