import React, { PropTypes } from 'react';
//import { Link, IndexLink } from 'react-router';
import '../styles/bootstrap.min.css';
import '../styles/bootstrap-datetimepicker.min.css';
import '../styles/sb-admin-2.css';

const App = (props) => {
  return (
    <div id="wrapper">
      <nav className="navbar navbar-default navbar-static-top" role="navigation">
        <div className="navbar-header">
          <button type="button" className="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
            <span className="sr-only">Toggle navigation</span>
            <span className="icon-bar"/>
            <span className="icon-bar"/>
            <span className="icon-bar"/>
          </button>
          <a className="navbar-brand" href="/">
            Test
          </a>
        </div>
        </nav>

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
  children: PropTypes.element
};

export default App;
