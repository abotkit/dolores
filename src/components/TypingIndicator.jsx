import React from 'react';
import { createUseStyles } from 'react-jss';

const useStyle = createUseStyles({
  '@keyframes blink': {
    '50%': { opacity: 1 }
  },
  message: {
    display: 'flex',
    margin: 12,
    padding: 12,
    width: 'fit-content',
    position: 'relative',
    borderRadius: 6,
    '& span': {
      height: 12,
      width: 12,
      margin: '0 1px',
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'block',
      borderRadius: '50%',
      opacity: 0.2
    },
    '& span:nth-of-type(1)': {
      animation: '1s $blink infinite 0s'
    },
    '& span:nth-of-type(2)': {
      animation: '1s $blink infinite 0.25s'
    },
    '& span:nth-of-type(3)': {
      animation: '1s $blink infinite 0.5s'
    }
  },
  bot: {
    alignSelf: 'flex-end',
    borderTopRightRadius: 0,
    background: '#d6eef3',
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
        borderLeftColor: '#d6eef3',
        marginRight: -8
    }
  }
});

const TypingIndicator = props => {
  const classes = useStyle();

  return (
    <div style={{ visibility: props.visible ? 'visible' : 'hidden' }} className={`${classes.message} ${classes.bot}`}>
      <span></span>
      <span></span>
      <span></span>
    </div>
  );
}

TypingIndicator.defaultProps = {
  visible: false
}

export default TypingIndicator;