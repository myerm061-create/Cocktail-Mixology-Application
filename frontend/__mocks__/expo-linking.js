const noop = () => {};
const mk = () => (globalThis?.jest?.fn ? globalThis.jest.fn() : noop);

module.exports = {
  createURL: (p) => p || '/',
  parse: () => ({ path: '/', queryParams: {} }),
  openURL: mk(), 
};
