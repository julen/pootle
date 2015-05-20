/*
 * Copyright (C) Pootle contributors.
 *
 * This file is a part of the Pootle project. It is distributed under the GPL3
 * or later license. See the LICENSE file for a copy of the license and the
 * AUTHORS file for copyright and authorship information.
 */

'use strict';

import React from 'react';
import { BrowserHistory, Route, Router } from 'react-router';

import BrowserController from './components/BrowserController';


const mountNodeSelector = '.js-browser-table';


module.exports = {

  init(props) {
    function wrapComponent(Component, props) {
      return React.createClass({
        render() {
          return <Component {...this.props} {...props} />;
        }
      });
    }

    let app = (
      <Router history={BrowserHistory}>
        <Route path={l('/')} component={wrapComponent(BrowserController, props)}>
          <Route path="*" name="browse" component={BrowserController} />
        </Route>
      </Router>
    );

    React.render(app, document.querySelector(mountNodeSelector));
  },

};
