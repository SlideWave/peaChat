import { combineReducers } from 'redux';
import chat from './chatReducer';
import {routerReducer} from 'react-router-redux';

const rootReducer = combineReducers({
  chat,
  routing: routerReducer
});

export default rootReducer;
