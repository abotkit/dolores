import React from 'react';
import { Breadcrumb } from 'antd';
import { Link } from 'react-router-dom';

const Pages = Object.freeze({
  CHAT: 'ABOTKIT.PAGE.CHAT',
  INTENTS: 'ABOTKIT.PAGE.INTENTS',
  ACTIONS: 'ABOTKIT.PAGE.ACTIONS',
  SETTINGS: 'ABOTKIT.PAGE.SETTINGS',
  STATISTICS: 'ABOTKIT.PAGE.STATISTICS'
})

const getBreadcrumbs = (page, t, sharedClasses, bot, style={}) => {
  let currentPage = null;
  let botname = null
  
  if (page === Pages.CHAT) {
    currentPage = <Breadcrumb.Item>{ t('breadcrumbs.chat') }</Breadcrumb.Item>
  } else if (page === Pages.INTENTS) {
    currentPage = <Breadcrumb.Item>{ t('breadcrumbs.intents') }</Breadcrumb.Item>
  } else if (page === Pages.ACTIONS) {
    currentPage = <Breadcrumb.Item>{ t('breadcrumbs.actions') }</Breadcrumb.Item>
  } else if (page === Pages.SETTINGS) {
    currentPage = <Breadcrumb.Item>{ t('breadcrumbs.settings') }</Breadcrumb.Item>
  } else if (page === Pages.STATISTICS) {
    currentPage = <Breadcrumb.Item>{ t('breadcrumbs.statistics') }</Breadcrumb.Item>
  } 

  if (bot) {
    botname = <Breadcrumb.Item>{ bot }</Breadcrumb.Item>
  }

  return (
    <Breadcrumb className={ sharedClasses.breadcrumbs } style={style}>
      <Breadcrumb.Item>
          <Link to="/">{ t('breadcrumbs.home') }</Link>
      </Breadcrumb.Item>
      { botname }
      { currentPage }
    </Breadcrumb>
  )
}

export { Pages, getBreadcrumbs };