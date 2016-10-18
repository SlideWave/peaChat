import React, {PropTypes} from 'react';
import { NavItem } from 'react-bootstrap';

class NavElement extends React.Component {
  render() {
    return (
      <NavItem href={this.props.href}><i className={"fa " + this.props.icon + " fa-fw"}/>{this.props.title}</NavItem>
    );
  }
}

NavElement.propTypes = {
  href: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired
};

export default NavElement;
