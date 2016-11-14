import {connect} from 'react-redux';
import React, {Component, PropTypes} from 'react';
import {darkWhite, lightWhite, grey900} from 'material-ui/styles/colors';
import injectTapEventPlugin from 'react-tap-event-plugin';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Master from '../components/Master';

injectTapEventPlugin();

const App = (props) => {
  return (
    <MuiThemeProvider>
      <Master width={1000} location={{"pathName": "s"} }/>
    </MuiThemeProvider>
  );
}

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
