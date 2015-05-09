/*
 * Copyright (C) Pootle contributors.
 *
 * This file is a part of the Pootle project. It is distributed under the GPL3
 * or later license. See the LICENSE file for a copy of the license and the
 * AUTHORS file for copyright and authorship information.
 */

'use strict';

import { Flummox } from 'flummox';

import StatsActions from './actions/StatsActions';
import StatsStore from './stores/StatsStore';


export default class Flux extends Flummox {

  constructor() {
    super();

    this.createActions('stats', StatsActions);
    this.createStore('stats', StatsStore, this);

    this.addListener('dispatch', payload => {
      console.log('Dispatch: ', payload);
    });
  }

}
