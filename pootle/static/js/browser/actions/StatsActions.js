/*
 * Copyright (C) Pootle contributors.
 *
 * This file is a part of the Pootle project. It is distributed under the GPL3
 * or later license. See the LICENSE file for a copy of the license and the
 * AUTHORS file for copyright and authorship information.
 */

'use strict';

import { Actions } from 'flummox';

import StatsAPI from '../utils/StatsAPI';


export default class StatsActions extends Actions {

  loadInitial(initialStats) {
    return initialStats;
  }

  gotoPath(pootlePath) {
    return StatsAPI.fetch(pootlePath)
                  .then(
                    (value) => Promise.resolve(value),
                    (reason) => Promise.reject(reason.responseJSON.errors)
                  );
  }

}
