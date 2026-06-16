import { createContext, useState, useEffect, useContext } from 'react';
import { demoBroadcastChannel, isDemoMode, supabase } from '../lib/supabase';

const RestaurantContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useRestaurant = () => useContext(RestaurantContext);

const generateId = () => '#' + Math.floor(1000 + Math.random() * 9000);

export function RestaurantProvider({ children }) {
  const [userRole, setUserRole] = useState(() => localStorage.getItem('restodash_role'));
  const [authUser, setAuthUser] = useState(null);
  const [tables, setTables] = useState([]);
  const [orders, setOrders] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDemoSnapshot = () => {
    try {
      const snapshot = localStorage.getItem('restodash_demo_db');
      return snapshot ? JSON.parse(snapshot) : null;
    } catch {
      return null;
    }
  };

  const syncFromDemoSnapshot = () => {
    const snapshot = loadDemoSnapshot();
    if (!snapshot) return;

    if (snapshot.tables) {
      setTables(snapshot.tables.map(table => ({ ...table, currentOrder: table.currentorder })));
    }
    if (snapshot.orders) {
      setOrders(snapshot.orders.map(order => ({ ...order, tableId: order.tableid })));
    }
    if (snapshot.messages) {
      setMessages(snapshot.messages);
    }
    if (snapshot.authUser) {
      setAuthUser(snapshot.authUser);
    }
  };

  const syncDemoTable = (tableId, updates) => {
    setTables(prev => prev.map(table => (table.id === tableId ? { ...table, ...updates } : table)));
  };

  const syncDemoOrder = (orderId, updates) => {
    setOrders(prev => prev.map(order => (order.id === orderId ? { ...order, ...updates } : order)));
  };

  const removeDemoOrder = (orderId) => {
    setOrders(prev => prev.filter(order => order.id !== orderId));
  };

  const removeDemoTable = (tableId) => {
    setTables(prev => prev.filter(table => table.id !== tableId));
  };

  const addDemoMessage = (message) => {
    setMessages(prev => [...prev, message]);
  };

  const handleTableChange = (payload) => {
    const formattedTable = { ...payload.new, currentOrder: payload.new.currentorder };
    if (payload.eventType === 'INSERT') {
      setTables(prev => [...prev, formattedTable]);
    } else if (payload.eventType === 'UPDATE') {
      setTables(prev => prev.map(t => t.id === formattedTable.id ? formattedTable : t));
    } else if (payload.eventType === 'DELETE') {
      setTables(prev => prev.filter(t => t.id !== payload.old.id));
    }
  };

  const handleOrderChange = (payload) => {
    const formattedOrder = { ...payload.new, tableId: payload.new.tableid };
    if (payload.eventType === 'INSERT') {
      // Avoid duplicate if optimistic update already added it
      setOrders(prev => prev.some(o => o.id === formattedOrder.id) ? prev.map(o => o.id === formattedOrder.id ? formattedOrder : o) : [formattedOrder, ...prev]);
    } else if (payload.eventType === 'UPDATE') {
      setOrders(prev => prev.map(o => o.id === formattedOrder.id ? formattedOrder : o));
    } else if (payload.eventType === 'DELETE') {
      setOrders(prev => prev.filter(o => o.id !== payload.old.id));
    }
  };

  // BUG FIX 3: Wrapped in try/finally so setLoading(false) is ALWAYS called,
  // even if a fetch throws. Previously a throw would leave the app stuck on
  // "Loading..." forever.
  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const { data: tablesData } = await supabase.from('tables').select('*');
      if (tablesData) {
        setTables(tablesData.map(t => ({ ...t, currentOrder: t.currentorder })));
      }

      const { data: ordersData } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (ordersData) {
        setOrders(ordersData.map(o => ({ ...o, tableId: o.tableid })));
      }

      const { data: messagesData } = await supabase.from('messages').select('*').order('created_at', { ascending: true });
      if (messagesData) setMessages(messagesData);
    } catch (err) {
      console.error('Error fetching initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('restodash_user');
    if (savedUser) setAuthUser(JSON.parse(savedUser));

    const savedRole = localStorage.getItem('restodash_role');
    if (savedRole) setUserRole(savedRole);

    const syncAuthSession = async () => {
      const { data } = await supabase.auth.getSession();
      const sessionUser = data?.session?.user ?? null;

      if (sessionUser) {
        localStorage.setItem('restodash_user', JSON.stringify(sessionUser));
        setAuthUser(sessionUser);
      } else {
        localStorage.removeItem('restodash_user');
        setAuthUser(null);
      }
    };

    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchInitialData();
    syncAuthSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        localStorage.setItem('restodash_user', JSON.stringify(session.user));
        setAuthUser(session.user);
      } else {
        localStorage.removeItem('restodash_user');
        localStorage.removeItem('restodash_role');
        setAuthUser(null);
        setUserRole(null);
      }
    });

    const handleStorageChange = (event) => {
      if (event.key === 'restodash_demo_db' && isDemoMode) {
        syncFromDemoSnapshot();
      }
      if (event.key === 'restodash_demo_user' && isDemoMode) {
        syncFromDemoSnapshot();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    let demoChannel = null;
    const handleDemoBroadcast = (event) => {
      if (event.data?.type === 'demo-state-updated') {
        syncFromDemoSnapshot();
      }
    };

    if (isDemoMode && typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      demoChannel = new BroadcastChannel(demoBroadcastChannel);
      demoChannel.addEventListener('message', handleDemoBroadcast);
    }

    const tablesSubscription = supabase
      .channel('tables-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tables' }, (payload) => {
        handleTableChange(payload);
      })
      .subscribe();

    const ordersSubscription = supabase
      .channel('orders-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        handleOrderChange(payload);
      })
      .subscribe();

    const messagesSubscription = supabase
      .channel('messages-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(tablesSubscription);
      supabase.removeChannel(ordersSubscription);
      supabase.removeChannel(messagesSubscription);
      authListener.subscription.unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
      if (demoChannel) {
        demoChannel.removeEventListener('message', handleDemoBroadcast);
        demoChannel.close();
      }
    };
  }, []);

  const getMenuItems = () => [
    { id: 1, category: 'Mains', name: 'Paneer Tikka', price: 350.00 },
    { id: 2, category: 'Mains', name: 'Butter Chicken', price: 450.00 },
    { id: 3, category: 'Mains', name: 'Mutton Biryani', price: 550.00 },
    { id: 4, category: 'Mains', name: 'Dal Makhani', price: 280.00 },
    { id: 5, category: 'Mains', name: 'Palak Paneer', price: 320.00 },
    { id: 6, category: 'Sides', name: 'Garlic Naan', price: 80.00 },
    { id: 7, category: 'Sides', name: 'Tandoori Roti', price: 40.00 },
    { id: 8, category: 'Sides', name: 'Lachha Paratha', price: 60.00 },
    { id: 9, category: 'Sides', name: 'Aloo Paratha', price: 90.00 },
    { id: 10, category: 'Sides', name: 'Masala Papad', price: 60.00 },
    { id: 11, category: 'Drinks', name: 'Masala Chai', price: 50.00 },
    { id: 12, category: 'Drinks', name: 'Sweet Lassi', price: 120.00 },
    { id: 13, category: 'Drinks', name: 'Cold Coffee', price: 150.00 },
  ];

  // BUG FIX 1 (root cause): Removed the `if (isDemoMode)` gate.
  // Previously, setOrders / syncDemoTable were ONLY called in demo mode,
  // so in real-Supabase mode the KDS never saw the order unless Realtime
  // happened to be working.  Now we always update local React state first
  // (optimistic update), then persist to Supabase / demo storage.
  const placeOrder = async (tableId, items) => {
    const total = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const newOrderId = generateId();

    const newOrder = {
      id: newOrderId,
      tableid: tableId,
      status: 'buffer',
      buffer_ends_at: Date.now() + 10000, // 10-second buffer window
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      items,
      total
    };

    // Immediately update local React state — KDS sees the order right away
    setOrders(prev => [{ ...newOrder, tableId }, ...prev]);
    syncDemoTable(tableId, { status: 'ordered', currentOrder: newOrderId });

    // Persist to Supabase (real) or demo localStorage
    const { error: orderError } = await supabase.from('orders').insert([newOrder]);
    if (orderError) console.error('Error placing order:', orderError);

    await supabase.from('tables').update({ status: 'ordered', currentorder: newOrderId }).eq('id', tableId);
  };

  const placeExternalOrder = async (orderType, items) => {
    const total = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const newOrderId = generateId();

    const newOrder = {
      id: newOrderId,
      tableid: orderType,
      status: 'buffer',
      buffer_ends_at: Date.now() + 10000,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      items,
      total
    };

    // BUG FIX 1 (same pattern): always update local state first
    setTables(prev => [...prev, { id: orderType, capacity: 1, status: 'ordered', currentOrder: newOrderId }]);
    setOrders(prev => [{ ...newOrder, tableId: orderType }, ...prev]);

    await supabase.from('tables').insert([{ id: orderType, capacity: 1, status: 'ordered', currentorder: newOrderId }]);

    const { error: orderError } = await supabase.from('orders').insert([newOrder]);
    if (orderError) console.error('Error placing external order:', orderError);
  };

  // BUG FIX 1 (same pattern): syncDemoOrder is now called unconditionally
  const updateOrderStatus = async (orderId, newStatus, extra = {}) => {
    // Immediately update local state
    syncDemoOrder(orderId, { status: newStatus, ...extra });

    // Persist
    const { error } = await supabase.from('orders').update({ status: newStatus, ...extra }).eq('id', orderId);
    if (error) console.error('Error updating order:', error);

    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    if (newStatus === 'cooking') {
      updateTableStatus(order.tableId, 'cooking');
    } else if (newStatus === 'served') {
      updateTableStatus(order.tableId, 'paying');
    } else if (newStatus === 'paid') {
      if (order.tableId?.startsWith('Takeaway') || order.tableId?.startsWith('Online')) {
        removeDemoTable(order.tableId);
        if (!isDemoMode) supabase.from('tables').delete().eq('id', order.tableId).then();
      } else {
        updateTableStatus(order.tableId, 'free', null);
      }
    }
  };

  // BUG FIX 1 (same pattern): syncDemoTable is now called unconditionally
  const updateTableStatus = async (tableId, status, currentOrder = undefined) => {
    const updates = { status };
    if (currentOrder !== undefined) updates.currentorder = currentOrder;

    // Immediately update local state
    syncDemoTable(tableId, currentOrder !== undefined ? { status, currentOrder } : { status });

    // Persist
    const { error } = await supabase.from('tables').update(updates).eq('id', tableId);
    if (error) console.error('Error updating table:', error);
  };

  const calculateTableBill = (tableId) => {
    const tableOrders = orders.filter(o => o.tableId === tableId && (o.status !== 'paid' && o.status !== 'cancelled'));
    return tableOrders.reduce((sum, order) => sum + order.total, 0);
  };

  // BUG FIX 1 (same pattern): syncDemoOrder is now called unconditionally
  const cancelOrder = async (orderId) => {
    // Immediately update local state
    syncDemoOrder(orderId, { status: 'cancelled' });

    // Persist
    const { error } = await supabase.from('orders').update({ status: 'cancelled' }).eq('id', orderId);
    if (error) console.error('Error cancelling order:', error);

    const order = orders.find(o => o.id === orderId);
    if (order) {
      if (order.tableId?.startsWith('Takeaway') || order.tableId?.startsWith('Online')) {
        removeDemoTable(order.tableId);
        if (!isDemoMode) supabase.from('tables').delete().eq('id', order.tableId).then();
      } else {
        updateTableStatus(order.tableId, 'free', null);
      }
    }
  };

  // BUG FIX 1 (same pattern): syncDemoOrder is now called unconditionally
  const updateOrderItems = async (orderId, newItems) => {
    const total = newItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const updates = { items: newItems, total, status: 'buffer', buffer_ends_at: Date.now() + 10000 };

    // Immediately update local state
    syncDemoOrder(orderId, updates);

    // Persist
    const { error } = await supabase.from('orders').update(updates).eq('id', orderId);
    if (error) console.error('Error updating order items:', error);

    const order = orders.find(o => o.id === orderId);
    if (order) updateTableStatus(order.tableId, 'ordered', order.id);
  };

  // BUG FIX 4: addDemoMessage is now called unconditionally so the sender
  // always sees their own message immediately, regardless of Supabase Realtime.
  const sendMessage = async (sender, content) => {
    // Immediately show the message to the sender
    const tempMessage = {
      id: `local-${Date.now()}`,
      sender,
      content,
      created_at: new Date().toISOString(),
    };
    addDemoMessage(tempMessage);

    // Persist (Supabase Realtime will distribute to other clients)
    const { error } = await supabase.from('messages').insert([{ sender, content }]);
    if (error) console.error('Error sending message:', error);
  };

  const login = (role) => {
    setUserRole(role);
    localStorage.setItem('restodash_role', role);
  };

  const logout = () => {
    setUserRole(null);
    localStorage.removeItem('restodash_role');
  };

  const loginWithEmail = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const user = data?.user ?? data?.session?.user;
    if (user) {
      localStorage.setItem('restodash_user', JSON.stringify(user));
      setAuthUser(user);
    }
    return user;
  };

  const signUpWithEmail = async (email, password, displayName = '') => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: displayName ? { display_name: displayName } : undefined,
      },
    });
    if (error) throw error;

    const user = data?.user ?? data?.session?.user;
    if (user) {
      localStorage.setItem('restodash_user', JSON.stringify(user));
      setAuthUser(user);
    }
    return data;
  };

  const requestPasswordReset = async (email) => {
    const redirectTo = `${window.location.origin}${import.meta.env.BASE_URL}login`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) throw error;
  };

  const logoutAuth = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('restodash_user');
    localStorage.removeItem('restodash_role');
    setAuthUser(null);
    setUserRole(null);
  };

  const value = {
    userRole,
    authUser,
    login,
    logout,
    loginWithEmail,
    signUpWithEmail,
    requestPasswordReset,
    logoutAuth,
    tables,
    orders,
    messages,
    loading,
    getMenuItems,
    placeOrder,
    placeExternalOrder,
    updateOrderStatus,
    updateTableStatus,
    calculateTableBill,
    cancelOrder,
    updateOrderItems,
    sendMessage
  };

  return (
    <RestaurantContext.Provider value={value}>
      {children}
    </RestaurantContext.Provider>
  );
}
