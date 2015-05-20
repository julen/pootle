/*
 * Copyright (C) Pootle contributors.
 *
 * This file is a part of the Pootle project. It is distributed under the GPL3
 * or later license. See the LICENSE file for a copy of the license and the
 * AUTHORS file for copyright and authorship information.
 */

'use strict';

import React from 'react';
import FluxComponent from 'flummox/component';

import StatsTable from './StatsTable';
import Flux from '../flux';


let flux = new Flux();


let BrowserController = React.createClass({

  propTypes: {
    // Optionally overrides state
    initialPootlePath: React.PropTypes.string,
    initialData: React.PropTypes.object,
  },


  /* Lifecycle */

  componentWillMount() {
    console.log(this.props);
    if (this.props.initialData) {
      let statActions = flux.getActions('stats');
      statActions.loadInitial(this.props.initialData);
    }
  },


  /* Layout */

  render() {
    // `StatsTable` currently looks like a copy of the controller but we
    // might end up having multiple table instances rendering different
    // views over the same data (with vfolders, for instance).
    return (
      <FluxComponent flux={flux} connectToStores={['stats']}>
        <StatsTable {...this.props} />
      </FluxComponent>
    );
  }

});


export default BrowserController;
