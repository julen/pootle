/*
 * Copyright (C) Pootle contributors.
 *
 * This file is a part of the Pootle project. It is distributed under the GPL3
 * or later license. See the LICENSE file for a copy of the license and the
 * AUTHORS file for copyright and authorship information.
 */

'use strict';

import FluxComponent from 'flummox/component';
import React from 'react';

import BrowserController from './components/BrowserController';
import Flux from './flux';


const mountNodeSelector = '.js-browser-table';


module.exports = {

  init(props) {
    let flux = new Flux();

    let BrowserApp = (
      <FluxComponent flux={flux} connectToStores={['stats']}>
        <BrowserController {...props} />
      </FluxComponent>
    );

    React.render(BrowserApp, document.querySelector(mountNodeSelector));
  },

};
