import { before } from 'mocha';

before(() => {
  global.gettext = s => s;
  global.ngettext = (s, n, c) => s;
  global.interpolate = (s, args) => s;
});
