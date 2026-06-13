// Universal stub for the SDK's native/desktop-only modules.
// The browser uses the SDK's pure-JS path, so none of these are needed.
// A Proxy makes ANY named import resolve to a harmless no-op function,
// so we never have to enumerate them.

const noop = () => null;

const handler: ProxyHandler<Record<string, unknown>> = {
  get: (_target, prop) => {
    if (prop === "__esModule") return true;
    if (prop === "default") return {};
    return noop;
  },
};

const stub = new Proxy({}, handler);

export default stub;
export const getNativeBinding = noop;
export const isNativeAvailable = () => false;