import React from 'react';
import { Route, IndexRoute } from 'react-router';

import App from './components/App';
import LoginPage from './containers/LoginPage';

export default (
  <Route path="/" component={App}>
    <IndexRoute component={LoginPage}/>
  </Route>
);
