import React from 'react';
import {connect} from 'react-redux';

export const LoginPage = () => {
  return (
      <div className="row">
        <div className="col-lg-12">
          <form id="signin-form" className="form-signin" role="form" method="post">
            <h2 className="form-signin-heading">Please sign in</h2>
            <label htmlFor="inputUsername" className="sr-only">Username</label>
            <input name="username" type="test" id="inputUsername" className="form-control"
                   placeholder="Username" autoCorrect="off" required autoFocus=""/>
              <label htmlFor="inputPassword" className="sr-only">Password</label>
              <input name="password" type="password" id="inputPassword" className="form-control" placeholder="Password" required/>

                <button className="btn btn-lg btn-primary btn-block" type="submit">Sign in</button>

                <input type="hidden" name="timezone"/>
          </form>
        </div>
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
