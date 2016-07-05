/*
 * Copyright (C) Pootle contributors.
 *
 * This file is a part of the Pootle project. It is distributed under the GPL3
 * or later license. See the LICENSE file for a copy of the license and the
 * AUTHORS file for copyright and authorship information.
 */

import { nt } from './i18n';


/* Start taken from moment.js */
function absFloor (number) {
  if (number < 0) {
    // -0 -> 0
    console.log(Math.ceil(number))
    return Math.ceil(number * -1);
  }
  return Math.floor(number);
}

/* End taken from moment.js */


export function timeDelta(isoDateTime) {
  const providedTime = isoDateTime && Date.parse(isoDateTime);
  if (!providedTime || isNaN(providedTime)) {
    return {
      isDeltaPositive: null,
      seconds: null,
      minutes: null,
      hours: null,
      days: null,
      months: null,
      years: null,
    };
  }

  const now = (new Date()).valueOf();
  const delta = providedTime - now;

  const isDeltaPositive = delta > 0;

  const seconds = absFloor(delta / 1000);
  const minutes = absFloor(seconds / 60);
  const hours = absFloor(minutes / 60);
  const days = absFloor(hours / 24);
  const months = absFloor(days / 30);  // naive: assuming 30 days per month
  const years = absFloor(days / 365);

  return {
    isDeltaPositive,
    seconds,
    minutes,
    hours,
    days,
    months,
    years,
  };

}


export function dueTime(isoDateTime) {
  const {
    isDeltaPositive, seconds, minutes, hours, days, months, years,
  } = timeDelta(isoDateTime);

  if (isDeltaPositive === null) {
    return '';
  }

  if (isDeltaPositive) {
    return dueTimeMessage({ seconds, minutes, hours, days, months, years });
  }

  return overdueTimeMessage({ seconds, minutes, hours, days, months, years });
}


export function dueTimeMessage({
  seconds, minutes, hours, days, months, years,
}) {
  if (years > 0) {
    return nt('Due in %(count)s year', 'Due in %(count)s years',
              years, { count: years });
  } else if (months > 0) {
    return nt('Due in %(count)s month', 'Due in %(count)s months',
              months, { count: months });
  } else if (days > 0) {
    return nt('Due in %(count)s day', 'Due in %(count)s days',
              days, { count: days });
  } else if (hours > 1) {
    return nt('Due in %(count)s hour', 'Due in %(count)s hours',
              hours, { count: hours });
  }

  return gettext('Due right now');
}


export function overdueTimeMessage({
  seconds, minutes, hours, days, months, years,
}) {
  if (years > 0) {
    return nt('Overdue by %(count)s year', 'Overdue by %(count)s years',
              years, { count: years });
  } else if (months > 0) {
    return nt('Overdue by %(count)s month', 'Overdue by %(count)s months',
              months, { count: months });
  } else if (days > 0) {
    return nt('Overdue by %(count)s day', 'Overdue by %(count)s days',
              days, { count: days });
  } else if (hours > 1) {
    return nt('Overdue by %(count)s hour', 'Overdue by %(count)s hours',
              hours, { count: hours });
  }

  return gettext('Overdue right now');
}
