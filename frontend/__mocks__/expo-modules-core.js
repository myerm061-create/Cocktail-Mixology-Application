module.exports = {
  CodedError: class CodedError extends Error {
    constructor(code, msg) {
      super(msg);
      this.code = code;
    }
  },
  NativeModulesProxy: {},
  Platform: { OS: 'test' },
  requireOptionalNativeModule: () => undefined,
  requireNativeModule: () => ({}),
};
