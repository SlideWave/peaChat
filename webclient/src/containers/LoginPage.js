import React from 'react';
import {connect} from 'react-redux';

const LoginPage = () => {
  return null;
};

function mapStateToProps(state) {
  return {
    fuelSavings: state.fuelSavings
  };
}

export default connect(
  mapStateToProps
)(LoginPage);
