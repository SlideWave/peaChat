import React, {Component, PropTypes} from 'react';
import MessageGroup from './MessageGroup';
import {List} from 'material-ui';

class MessageList extends Component {
  static propTypes = {
    style: PropTypes.object,
    title: PropTypes.string.isRequired
  };

  static defaultProps = {
    useContent: false,
    contentType: 'div',
  };

  getStyles() {
    return {
      root: {
        padding: 0,
        boxSizing: 'border-box',
        width: '100%'
      },

      content: {
        maxWidth: 1200,
        margin: '0 auto',
      }
    };
  }

  render() {
    const {
      style,
      ...other
    } = this.props;

    const styles = this.getStyles();

    return (
      <List>
        <MessageGroup avatar="blammo"/>
      </List>
    );
  }
}

export default MessageList;
