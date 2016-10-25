import React, {PropTypes} from 'react';
import Sidebar from 'react-sidebar';
import NavSection from './NavSection';
import MaterialTitlePanel from './MaterialTitlePanel';

const styles = {
  contentHeaderMenuLink: {
    textDecoration: 'none',
    color: 'white',
    padding: 8,
  },
  content: {
    padding: '16px',
  },
};

class NavBar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {docked: true, open: false};
  }

  render() {
    const sidebar =
      <MaterialTitlePanel title={this.props.brand}>
        <div>
        {this.props.sections.map(function (section) {
          return <NavSection key={'ns-' + section.name} name={section.name} hasDivider={section.hasDivider} items={section.items}/>
        })}
          </div>
      </MaterialTitlePanel>
    ;

    const contentHeader = (
      <span>
        {!this.state.docked &&
        <a onClick={this.menuButtonClick} href="#" style={styles.contentHeaderMenuLink}>=</a>}
        <span> React Sidebar</span>
      </span>);

    const sidebarProps = {
      sidebar: sidebar,
      docked: this.state.docked,
      sidebarClassName: 'custom-sidebar-class',
      open: this.state.open,
      touch: this.state.touch,
      shadow: this.state.shadow,
      pullRight: this.state.pullRight,
      touchHandleWidth: this.state.touchHandleWidth,
      dragToggleDistance: this.state.dragToggleDistance,
      transitions: this.state.transitions,
      onSetOpen: this.onSetOpen,
    };

    return (
      <Sidebar {...sidebarProps}>
        {this.props.children}
      </Sidebar>
    );
  }
}

NavBar.propTypes = {
  brand: PropTypes.string.isRequired,
  sections: PropTypes.array.isRequired
};

export default NavBar;
