import React, {PropTypes} from 'react';
import NavElement from './NavElement';

class NavBar extends React.Component {
  render() {
    return (
      <nav className="navbar navbar-default navbar-static-top" role="navigation">
        <div className="navbar-header">
          <button type="button" className="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
            <span className="sr-only">Toggle navigation</span>
            <span className="icon-bar"/>
            <span className="icon-bar"/>
            <span className="icon-bar"/>
          </button>
          <a className="navbar-brand" href="/">
            {this.props.brand}
          </a>
        </div>

        <div className="navbar-default sidebar" role="navigation">
          <div className="sidebar-nav navbar-collapse">
            <ul className="nav" id="side-menu">
              {this.props.sections.map(function(section){
                let ret = [];

                if (section.hasDivider) {
                  ret.add(<li className="nav-divider"/>);
                }

                return ret.concat(section.items.map(function (item) {
                  return <NavElement key={section.name + '-' + item.title} href={item.href} icon={item.icon} title={item.title}/>
                }));
              })}
              </ul>
            </div>
          </div>
        </nav>
    );
  }
}

NavBar.propTypes = {
  brand: PropTypes.string.isRequired,
  sections: PropTypes.array.isRequired
};

export default NavBar;
