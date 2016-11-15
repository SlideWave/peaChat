import React from 'react';
import Title from 'react-title-component';
import {connect} from 'react-redux';

const LoginPage = () => {
  return (
    <div>
      <Title render={(previousTitle) => 'Blam'} />
      saddsads
    </div>
  );
};

function mapStateToProps(state) {
  return {
    fuelSavings: state.fuelSavings
  };
}

export default connect(
  mapStateToProps
)(LoginPage);
