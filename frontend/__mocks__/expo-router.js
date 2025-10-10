const React = require('react');

const noop = () => {};
const mk = () => (globalThis?.jest?.fn ? globalThis.jest.fn() : noop);

const router = {
  push: mk(),
  replace: mk(),
  back: mk(),
  setParams: mk(),
};

const usePathname = () => '/';
const useLocalSearchParams = () => ({});
const Link = ({ children }) => React.createElement(React.Fragment, null, children);
const Stack = { Screen: () => null };

module.exports = { router, usePathname, useLocalSearchParams, Link, Stack };
