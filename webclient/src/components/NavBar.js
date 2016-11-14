import React, {PropTypes} from 'react';
import NavSection from './NavSection';

class NavBar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {docked: true, open: false};
  }

  render() {
  }
}

NavBar.propTypes = {
  brand: PropTypes.string.isRequired,
  sections: PropTypes.array.isRequired,
  children: PropTypes.array.isRequired
};

export default NavBar;
