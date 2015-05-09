/*
 * Copyright (C) Pootle contributors.
 *
 * This file is a part of the Pootle project. It is distributed under the GPL3
 * or later license. See the LICENSE file for a copy of the license and the
 * AUTHORS file for copyright and authorship information.
 */

'use strict';

import $ from 'jquery';


let StatsAPI = {

  apiRoot: '/xhr/stats/overview/',

  fetch(pootlePath) {
    let url = `${this.apiRoot}?path=${pootlePath}`;

    return Promise.resolve(
      $.ajax(url, {
        dataType: 'json',
      })
    );
  },

};


export default StatsAPI;
