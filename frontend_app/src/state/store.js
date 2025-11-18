import React, { createContext, useCallback, useContext, useMemo, useReducer } from "react";
import config, { isFeatureEnabled } from "../config/env";
import api from "../services/apiClient";

// Shape of our app state
const initialState = {
  currentUser: {
    id: "demo-user",
    name: "Demo User",
    // Extend with avatar, roles, etc. in future
  },
  featureFlags: { ...config.featureFlags },
  ui: {
    loading: false,
    error: null,
  },
};

const AppStateContext = createContext(undefined);
const AppDispatchContext = createContext(undefined);

function reducer(state, action) {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, ui: { ...state.ui, loading: !!action.payload } };
    case "SET_ERROR":
      return { ...state, ui: { ...state.ui, error: action.payload || null } };
    case "CLEAR_ERROR":
      return { ...state, ui: { ...state.ui, error: null } };
    case "SET_USER":
      return { ...state, currentUser: action.payload || null };
    case "SET_FLAGS":
      return { ...state, featureFlags: { ...state.featureFlags, ...(action.payload || {}) } };
    default:
      return state;
  }
}

// PUBLIC_INTERFACE
export function AppStateProvider({ children }) {
  /**
   * Provides global application state and actions via Context.
   *
   * Values:
   * - state: { currentUser, featureFlags, ui: { loading, error } }
   * - actions: { setLoading, setError, clearError, setUser, setFlags }
   */
  const [state, dispatch] = useReducer(reducer, initialState);

  const setLoading = useCallback((v) => dispatch({ type: "SET_LOADING", payload: v }), []);
  const setError = useCallback((e) => dispatch({ type: "SET_ERROR", payload: e }), []);
  const clearError = useCallback(() => dispatch({ type: "CLEAR_ERROR" }), []);
  const setUser = useCallback((user) => dispatch({ type: "SET_USER", payload: user }), []);
  const setFlags = useCallback((flags) => dispatch({ type: "SET_FLAGS", payload: flags }), []);

  const valueState = useMemo(() => state, [state]);
  const valueActions = useMemo(
    () => ({ setLoading, setError, clearError, setUser, setFlags }),
    [setLoading, setError, clearError, setUser, setFlags]
  );

  return (
    <AppStateContext.Provider value={valueState}>
      <AppDispatchContext.Provider value={valueActions}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
}

// PUBLIC_INTERFACE
export function useAppState() {
  /**
   * Hook to access app state and bound helpers.
   *
   * @returns {{
   *   state: typeof initialState,
   *   actions: {
   *     setLoading: (v:boolean)=>void,
   *     setError: (e:any)=>void,
   *     clearError: ()=>void,
   *     setUser: (user:any)=>void,
   *     setFlags: (flags:Record<string,any>)=>void
   *   },
   *   featureEnabled: (name:string, defaultValue?:boolean)=>boolean,
   *   api: { get: Function, post: Function }
   * }}
   */
  const state = useContext(AppStateContext);
  const actions = useContext(AppDispatchContext);
  if (state === undefined || actions === undefined) {
    throw new Error("useAppState must be used within AppStateProvider");
  }

  const featureEnabled = useCallback((name, def = false) => {
    if (Object.prototype.hasOwnProperty.call(state.featureFlags, name)) {
      return !!state.featureFlags[name];
    }
    return isFeatureEnabled(name, def);
  }, [state.featureFlags]);

  return {
    state,
    actions,
    featureEnabled,
    api, // convenience re-export
  };
}

// PUBLIC_INTERFACE
export function useApi() {
  /**
   * Hook that returns the API helpers from services/apiClient.
   * Provided here for pages to import from a single source of truth.
   *
   * @returns {{ get: Function, post: Function }}
   */
  return { get: api.get, post: api.post };
}

export default AppStateProvider;
