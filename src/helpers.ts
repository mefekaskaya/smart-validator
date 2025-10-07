export const isAsyncFunction = (fn: Function) =>
  fn.constructor === (async () => {}).constructor;
