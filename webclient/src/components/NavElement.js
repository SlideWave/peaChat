import React, {PropTypes} from 'react';
import { Link } from 'react-router';

class NavElement extends React.Component {
  render() {
    return (
      <li>
        <Link to={this.props.href}>
          <i className={"fa " + this.props.icon + " fa-fw"}/> {this.props.title}
        </Link>
      </li>
    );
  }
}

NavElement.propTypes = {
  href: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired
};

export default NavElement;
