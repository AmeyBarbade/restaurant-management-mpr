import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const DEMO_STORAGE_KEY = 'restodash_demo_db';
const DEMO_SESSION_KEY = 'restodash_demo_user';
const DEMO_BROADCAST_CHANNEL = 'restodash_demo_channel';

const clone = (value) => JSON.parse(JSON.stringify(value));

const defaultDemoState = () => ({
  tables: [
    { id: 'T-01', status: 'free', capacity: 2, currentorder: null },
    { id: 'T-02', status: 'free', capacity: 4, currentorder: null },
    { id: 'T-03', status: 'free', capacity: 4, currentorder: null },
    { id: 'T-04', status: 'free', capacity: 6, currentorder: null },
    { id: 'T-05', status: 'free', capacity: 2, currentorder: null },
    { id: 'T-06', status: 'free', capacity: 4, currentorder: null },
    { id: 'T-07', status: 'free', capacity: 8, currentorder: null },
    { id: 'T-08', status: 'free', capacity: 2, currentorder: null },
  ],
  orders: [],
  messages: [],
  authUser: null,
});

const loadDemoState = () => {
  try {
    const saved = localStorage.getItem(DEMO_STORAGE_KEY);
    return saved ? { ...defaultDemoState(), ...JSON.parse(saved) } : defaultDemoState();
  } catch {
    return defaultDemoState();
  }
};

const saveDemoState = (state) => {
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(state));

  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    const channel = new BroadcastChannel(DEMO_BROADCAST_CHANNEL);
    channel.postMessage({ type: 'demo-state-updated' });
    channel.close();
  }
};

const parseTableFilters = (filters = []) => filters.filter((entry) => entry?.column);

const applyFilters = (rows, filters) => {
  return parseTableFilters(filters).reduce((filteredRows, filter) => {
    if (filter.op === 'eq') {
      return filteredRows.filter((row) => row[filter.column] === filter.value);
    }
    return filteredRows;
  }, rows);
};

const sortRows = (rows, sortState) => {
  if (!sortState?.column) return rows;
  const sorted = [...rows];
  sorted.sort((left, right) => {
    const leftValue = left?.[sortState.column];
    const rightValue = right?.[sortState.column];
    if (leftValue === rightValue) return 0;
    if (leftValue == null) return sortState.ascending ? 1 : -1;
    if (rightValue == null) return sortState.ascending ? -1 : 1;
    if (leftValue < rightValue) return sortState.ascending ? -1 : 1;
    return sortState.ascending ? 1 : -1;
  });
  return sorted;
};

const createQuery = (tableName, state) => {
  const queryState = {
    filters: [],
    sort: null,
    operation: 'select',
    values: null,
    payload: null,
  };

  const runRead = () => {
    const rows = clone(state[tableName] || []);
    const filtered = applyFilters(rows, queryState.filters);
    return sortRows(filtered, queryState.sort);
  };

  const runMutation = () => {
    const rows = state[tableName] || [];
    const matches = (row) => applyFilters([row], queryState.filters).length > 0;

    if (queryState.operation === 'insert') {
      const records = Array.isArray(queryState.payload) ? queryState.payload : [queryState.payload];
      const inserted = records.map((record) => ({ ...record }));
      state[tableName] = [...rows, ...inserted];
      saveDemoState(state);
      return inserted;
    }

    if (queryState.operation === 'update') {
      const updatedRows = rows.map((row) => (matches(row) ? { ...row, ...queryState.values } : row));
      state[tableName] = updatedRows;
      saveDemoState(state);
      return updatedRows.filter(matches);
    }

    if (queryState.operation === 'delete') {
      const deleted = rows.filter(matches);
      state[tableName] = rows.filter((row) => !matches(row));
      saveDemoState(state);
      return deleted;
    }

    return runRead();
  };

  const query = {
    select() {
      queryState.operation = 'select';
      return query;
    },
    order(column, options = {}) {
      queryState.sort = { column, ascending: options.ascending !== false };
      return query;
    },
    eq(column, value) {
      queryState.filters.push({ op: 'eq', column, value });
      return query;
    },
    insert(rows) {
      queryState.operation = 'insert';
      queryState.payload = rows;
      return query;
    },
    update(values) {
      queryState.operation = 'update';
      queryState.values = values;
      return query;
    },
    delete() {
      queryState.operation = 'delete';
      return query;
    },
    then(resolve) {
      const data = runMutation();
      return Promise.resolve({ data: clone(data), error: null }).then(resolve);
    },
  };

  return query;
};

const createDemoClient = () => {
  const state = loadDemoState();

  return {
    auth: {
      async getSession() {
        const user = state.authUser || null;
        return { data: { session: user ? { user } : null }, error: null };
      },
      onAuthStateChange(callback) {
        queueMicrotask(() => callback('INITIAL_SESSION', state.authUser ? { user: state.authUser } : null));
        return { data: { subscription: { unsubscribe() {} } } };
      },
      async signInWithPassword({ email }) {
        const user = { id: 'demo-user', email };
        state.authUser = user;
        saveDemoState(state);
        localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(user));
        return { data: { user, session: { user } }, error: null };
      },
      async signUp({ email }) {
        const user = { id: 'demo-user', email };
        state.authUser = user;
        saveDemoState(state);
        localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(user));
        return { data: { user, session: { user } }, error: null };
      },
      async signOut() {
        state.authUser = null;
        saveDemoState(state);
        localStorage.removeItem(DEMO_SESSION_KEY);
        return { data: {}, error: null };
      },
      async resetPasswordForEmail() {
        return { data: {}, error: null };
      },
    },
    from(tableName) {
      return createQuery(tableName, state);
    },
    channel() {
      return {
        on() {
          return this;
        },
        subscribe() {
          return this;
        },
      };
    },
    removeChannel() {},
  };
};

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase env vars are missing. Running in local demo mode.');
}

export const isDemoMode = !supabaseUrl || !supabaseAnonKey;
export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : createDemoClient();
export const demoBroadcastChannel = DEMO_BROADCAST_CHANNEL;
