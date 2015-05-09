/*
 * Copyright (C) Pootle contributors.
 *
 * This file is a part of the Pootle project. It is distributed under the GPL3
 * or later license. See the LICENSE file for a copy of the license and the
 * AUTHORS file for copyright and authorship information.
 */

'use strict';

import { Store } from 'flummox';
import assign from 'object-assign';


export default class StatsStore extends Store {

  constructor(flux) {
    super();

    let statsActions = flux.getActions('stats');

    this.register(statsActions.loadInitial, this.handleLoadInitial);
    this.registerAsync(statsActions.gotoPath, this.handleGotoPathBegin,
                                              this.handleGotoPathSuccess,
                                              this.handleGotoPathError);

    this.state = {
      pootlePath: '/',
      data: {},

      isLoading: false, // Should be part of some generic 'request' store?
    };
  }


  /* Loading up initial data */

  handleLoadInitial(initialStats) {
    this.setState({data: initialStats});
  }


  /* Drilling down */

  handleGotoPathBegin(reqData) {
    this.setState({isLoading: true});
  }

  handleGotoPathSuccess(newStats) {
    this.setState({
      isLoading: false,
      data: newStats,
    });
  }

  handleGotoPathError(errors) {
    this.setState({
      isLoading: false,
    });
  }

}
