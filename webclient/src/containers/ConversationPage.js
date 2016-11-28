import React, {Component, PropTypes} from 'react';
import ClearFix from 'material-ui/internal/ClearFix';
import withWidth, {SMALL, LARGE} from 'material-ui/utils/withWidth';
import ConversationHeader from '../components/ConversationHeader';
import MessageList from '../components/MessageList';
import ChatInputBox from '../components/ChatInputBox';


class ConversationPage extends Component {
  static propTypes = {
    style: PropTypes.object,
    width: PropTypes.number.isRequired
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
      <ClearFix
        style={Object.assign(
          styles.root,
          style)}
      >
        <ConversationHeader title="Test" />
        <MessageList />
        <ChatInputBox />
      </ClearFix>
    );
  }
}

export default withWidth()(ConversationPage);
