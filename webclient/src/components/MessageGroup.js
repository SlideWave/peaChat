import React, {Component, PropTypes} from 'react';
import {ListItem, Avatar} from 'material-ui';
import ClearFix from 'material-ui/internal/ClearFix';


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
      leftBox: {
        float: "left",
        width: 96,
        height: "100%"
      },

      contentBox: {
        float: "left"
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
      <ListItem>
        <ClearFix>
        <div style={styles.leftBox}>
          <Avatar>A</Avatar>
        </div>
        <div style={styles.contentBox}>
          kjadshhj hk dsh dashksda hkhadsk hk dsakh adskh sdakh dsakhds a kh adskhsd akh dsahk khdsahk sdakh sda
          dsisuysdfaiuslyk ljfsdahfd ksaysyflkusdfi luasdf dsfuia tsdftiuastfaiusdf tiuads tiusfaiuogfd iugto
        </div>
        </ClearFix>
      </ListItem>
    );
  }
}

export default MessageGroup;
