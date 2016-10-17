//unfortunately this class can not yet be used because react doesnt support
//returning multiple components for render :(

import React, {PropTypes} from 'react';
import NavElement from './NavElement';

class NavSection extends React.Component {
  render() {
    let self = this;
    return ([
        self.props.hasDivider ? <li className="nav-divider"/> : null,
        self.props.items.map(function(item){
        return <NavElement key={self.props.name + '-' + item.title} title={item.title} icon={item.icon} href={item.href}/>;
        })
    ]);
  }
}

NavSection.propTypes = {
  name: PropTypes.string.isRequired,
  hasDivider: PropTypes.bool.isRequired,
  items: PropTypes.array.isRequired
};

export default NavSection;
