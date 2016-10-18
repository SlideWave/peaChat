import React, {PropTypes} from 'react';
import NavElement from './NavElement';
import { Navbar, Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap';

class NavBar extends React.Component {
  render() {
    return (
      <Navbar>
        <Navbar.Header>
          <Navbar.Brand>
            {this.props.brand}
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
          <Nav>
            {this.props.sections.map(function(section){
              let ret = [];

              if (section.hasDivider) {
                ret.add(<NavItem divider/>);
              }

              return ret.concat(section.items.map(function (item) {
                return <NavElement key={section.name + '-' + item.title} href={item.href} icon={item.icon} title={item.title}/>
              }));
            })}
            </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}

NavBar.propTypes = {
  brand: PropTypes.string.isRequired,
  sections: PropTypes.array.isRequired
};

export default NavBar;
