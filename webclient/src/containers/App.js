import React, { PropTypes } from 'react';
import {connect} from 'react-redux';
//import { Link, IndexLink } from 'react-router';
import NavBar from '../components/NavBar';

import '../styles/bootstrap.min.css';
import '../styles/metisMenu.min.css';
import '../styles/bootstrap-datetimepicker.min.css';
import '../styles/sb-admin-2.css';

const App = (props) => {
  return (
    <div id="wrapper">
      <NavBar brand="" sections={props.navSections}/>

      <div id="page-wrapper">
        <div className="row">
          <div className="col-lg-12">
            <h2 className="page-header">Test Header</h2>
          </div>
          {props.children}
          </div>
      </div>
    </div>
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
