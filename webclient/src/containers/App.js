import React, { PropTypes } from 'react';
import {connect} from 'react-redux';
//import { Link, IndexLink } from 'react-router';
import NavBar from '../components/NavBar';


const App = (props) => {
  return (
    <NavBar brand="peaChat" sections={props.navSections}>
      {props.children}
    </NavBar>
  );
};

App.propTypes = {
  children: PropTypes.element,
  navSections: PropTypes.array.isRequired
};

function mapStateToProps(state) {
  return {
    navSections: state.chat.navSections
  };
}

export default connect(
  mapStateToProps
)(App);
