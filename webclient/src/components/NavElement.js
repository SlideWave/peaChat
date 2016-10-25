import React, {PropTypes} from 'react';

class NavElement extends React.Component {
  render() {
    return (
      <a href={this.props.href}><i className={"fa " + this.props.icon + " fa-fw"}/>{this.props.title}</a>
    );
  }
}

NavElement.propTypes = {
  href: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired
};

export default NavElement;
