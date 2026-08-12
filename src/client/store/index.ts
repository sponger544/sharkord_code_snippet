import type { TPluginStore, TPluginStoreState } from "@sharkord/plugin-sdk";

const store: TPluginStore = window.__SHARKORD_STORE__;

function useStoreSelector<T>(selector: (state: TPluginStoreState) => T): T {
  const React = window.__SHARKORD_REACT__ as typeof import("react");
  const [state, setState] = React.useState(store.getState());
  const value = selector(state);

  React.useEffect(() => {
    const unsubscribe = store.subscribe(() => setState(store.getState()));
    return unsubscribe;
  }, []);

  return value;
}

export { store, useStoreSelector };
