import React, {PropTypes} from 'react';
import NavElement from './NavElement';

const styles = {
  sidebar: {
    width: 256,
    height: '100%',
  },
  sidebarLink: {
    display: 'block',
    padding: '16px 0px',
    color: '#757575',
    textDecoration: 'none',
  },
  divider: {
    margin: '8px 0',
    height: 1,
    backgroundColor: '#757575',
  },
  content: {
    padding: '16px',
    height: '100%',
    backgroundColor: 'white',
  },
};

class NavSection extends React.Component {
  render() {
    let self = this;
    return (
      <div>
        {self.props.hasDivider ? <div style={styles.divider}/> : null}
        {
          self.props.items.map(function (item) {
            return <NavElement key={self.props.name + '-' + item.title} title={item.title} icon={item.icon}
                               href={item.href}/>
          })
        }
      </div>
    );
  }
}

NavSection.propTypes = {
  name: PropTypes.string.isRequired,
  hasDivider: PropTypes.bool.isRequired,
  items: PropTypes.array.isRequired
};

export default NavSection;
