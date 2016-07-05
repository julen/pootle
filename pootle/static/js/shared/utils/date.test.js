/*
 * Copyright (C) Pootle contributors.
 *
 * This file is a part of the Pootle project. It is distributed under the GPL3
 * or later license. See the LICENSE file for a copy of the license and the
 * AUTHORS file for copyright and authorship information.
 */

import expect from 'expect';
import lolex from 'lolex';
import { describe, it } from 'mocha';

import { dueTime, dueTimeMessage, overdueTimeMessage, timeDelta } from './date';


describe('timeDelta', () => {

  it('returns an empty structure for invalid datetimes', () => {
    const undefinedDelta = {
      isDeltaPositive: null,
      seconds: null,
      minutes: null,
      hours: null,
      days: null,
      months: null,
      years: null,
    };
    expect(timeDelta('')).toEqual(undefinedDelta);
    expect(timeDelta(null)).toEqual(undefinedDelta);
    expect(timeDelta(undefined)).toEqual(undefinedDelta);
    expect(timeDelta('Invalid')).toEqual(undefinedDelta);
    expect(timeDelta('2016-14-12')).toEqual(undefinedDelta);
    expect(timeDelta('2016-12-12 25:02:11')).toEqual(undefinedDelta);
  });

  describe('positive duration', () => {

    const tests = [
      {
        unit: 'seconds',
        now: '2016-07-07T00:00:00+00:00',
        args: ['2016-07-07T00:00:44+00:00'],
        expected: {
          isDeltaPositive: true,
          seconds: 44,
          minutes: 0,
          hours: 0,
          days: 0,
          months: 0,
          years: 0,
        },
      },
      {
        unit: 'seconds (TZ-aware)',
        now: '2016-07-07T00:00:00+02:00',
        args: ['2016-07-06T22:00:44+00:00'],
        expected: {
          isDeltaPositive: true,
          seconds: 44,
          minutes: 0,
          hours: 0,
          days: 0,
          months: 0,
          years: 0,
        },
      },
      {
        unit: 'minutes',
        now: '2016-07-07T00:00:00+00:00',
        args: ['2016-07-07T00:59:00+00:00'],
        expected: {
          isDeltaPositive: true,
          seconds: 3540,
          minutes: 59,
          hours: 0,
          days: 0,
          months: 0,
          years: 0,
        },
      },
      {
        unit: 'minutes (TZ-aware)',
        now: '2016-07-07T00:00:00+02:00',
        args: ['2016-07-06T22:59:00+00:00'],
        expected: {
          isDeltaPositive: true,
          seconds: 3540,
          minutes: 59,
          hours: 0,
          days: 0,
          months: 0,
          years: 0,
        },
      },
      {
        unit: 'minutes',
        now: '2016-07-07T00:00:00+00:00',
        args: ['2016-07-07T00:02:00+00:00'],
        expected: {
          isDeltaPositive: true,
          seconds: 120,
          minutes: 2,
          hours: 0,
          days: 0,
          months: 0,
          years: 0,
        },
      },
      {
        unit: 'minutes (TZ-aware)',
        now: '2016-07-07T00:00:00+02:00',
        args: ['2016-07-06T22:02:00+00:00'],
        expected: {
          isDeltaPositive: true,
          seconds: 120,
          minutes: 2,
          hours: 0,
          days: 0,
          months: 0,
          years: 0,
        },
      },
      {
        unit: 'hours',
        now: '2016-07-07T00:00:00+00:00',
        args: ['2016-07-07T23:00:44+00:00'],
        expected: {
          isDeltaPositive: true,
          seconds: 82844,
          minutes: 1380,
          hours: 23,
          days: 0,
          months: 0,
          years: 0,
        },
      },
      {
        unit: 'hours (TZ-aware)',
        now: '2016-07-07T00:00:00+02:00',
        args: ['2016-07-07T21:00:44+00:00'],
        expected: {
          isDeltaPositive: true,
          seconds: 82844,
          minutes: 1380,
          hours: 23,
          days: 0,
          months: 0,
          years: 0,
        },
      },
      {
        unit: 'days',
        now: '2016-07-07T00:00:00+00:00',
        args: ['2016-07-13T23:59:59+00:00'],
        expected: {
          isDeltaPositive: true,
          seconds: 604799,
          minutes: 10079,
          hours: 167,
          days: 6,
          months: 0,
          years: 0,
        },
      },
      {
        unit: 'days (TZ-aware)',
        now: '2016-07-07T00:00:00+02:00',
        args: ['2016-07-13T21:59:59+00:00'],
        expected: {
          isDeltaPositive: true,
          seconds: 604799,
          minutes: 10079,
          hours: 167,
          days: 6,
          months: 0,
          years: 0,
        },
      },
      {
        unit: 'months',
        now: '2016-07-07T00:00:00+00:00',
        args: ['2016-10-07T23:59:59+00:00'],
        expected: {
          isDeltaPositive: true,
          seconds: 8035199,
          minutes: 133919,
          hours: 2231,
          days: 92,
          months: 3, // 1 month ~30 days
          years: 0,
        },
      },
      {
        unit: 'months (TZ-aware)',
        now: '2016-07-07T00:00:00+02:00',
        args: ['2016-10-07T21:59:59+00:00'],
        expected: {
          isDeltaPositive: true,
          seconds: 8035199,
          minutes: 133919,
          hours: 2231,
          days: 92,
          months: 3, // 1 month ~30 days
          years: 0,
        },
      },
      {
        unit: 'years',
        now: '2016-07-07T00:00:00+00:00',
        args: ['2017-07-07T00:00:59+00:00'],
        expected: {
          isDeltaPositive: true,
          seconds: 31536059,
          minutes: 525600,
          hours: 8760,
          days: 365,
          months: 12,
          years: 1,
        },
      },
      {
        unit: 'years (TZ-aware)',
        now: '2016-07-07T00:00:00+00:00',
        args: ['2017-07-07T00:00:59+00:00'],
        expected: {
          isDeltaPositive: true,
          seconds: 31536059,
          minutes: 525600,
          hours: 8760,
          days: 365,
          months: 12,
          years: 1,
        },
      },
    ];

    tests.forEach((test) => {
      const fn = test.skip ? it.skip : it;
      fn(`calculates ${test.unit} of difference`, () => {
        lolex.install(Date.parse(test.now));
        expect(timeDelta(...test.args)).toEqual(test.expected);
      });
    });

  });

  describe('negative duration (times in the future)', () => {
    const tests = [
      {
        unit: 'seconds',
        now: '2016-07-07T00:00:44+00:00',
        args: ['2016-07-07T00:00:00+00:00'],
        expected: {
          isDeltaPositive: false,
          seconds: 44,
          minutes: 0,
          hours: 0,
          days: 0,
          months: 0,
          years: 0,
        },
      },
    ];

    tests.forEach((test) => {
      const fn = test.skip ? it.skip : it;
      fn(`calculates ${test.unit} of difference`, () => {
        lolex.install(Date.parse(test.now));
        expect(timeDelta(...test.args)).toEqual(test.expected);
      });
    });

  });

});


describe('dueTime', () => {

  it('returns an empty string for undefined time deltas', () => {
    expect(dueTime('')).toEqual('');
    expect(dueTime(null)).toEqual('');
    expect(dueTime(undefined)).toEqual('');
    expect(dueTime('Invalid')).toEqual('');
    expect(dueTime('2016-14-12')).toEqual('');
    expect(dueTime('2016-12-12 25:02:11')).toEqual('');
  });

});


describe('dueTimeMessage', () => {

  it('immediately due times', () => {
    const delta = {
      isDeltaPositive: true,
      seconds: 0,
      minutes: 0,
      hours: 0,
      days: 0,
      months: 0,
      years: 0,
    };
    const dueMessage = 'Due right now';

    expect(dueTimeMessage(delta)).toEqual(dueMessage);
  });

});


describe('overDueTimeMessage', () => {

  it('immediately overdue times', () => {
    const delta = {
      isDeltaPositive: false,
      seconds: 0,
      minutes: 0,
      hours: 0,
      days: 0,
      months: 0,
      years: 0,
    };
    const overdueMessage = 'Overdue right now';

    expect(overdueTimeMessage(delta)).toBe(overdueMessage);
  });

});
