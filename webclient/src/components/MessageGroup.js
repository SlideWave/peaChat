import React, {Component, PropTypes} from 'react';
import {List, ListItem, Avatar} from 'material-ui';


class MessageGroup extends Component {
  static propTypes = {
    style: PropTypes.object,
    avatar: PropTypes.object.isRequired,

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
      <div></div>
    );
  }
}

export default MessageGroup;
