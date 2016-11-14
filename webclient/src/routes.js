import React from 'react';
import { Route, IndexRoute } from 'react-router';

import Master from './containers/Master';
import LoginPage from './containers/LoginPage';

export default (
  <Route path="/" component={Master}>
    <IndexRoute component={LoginPage}/>
  </Route>
);
