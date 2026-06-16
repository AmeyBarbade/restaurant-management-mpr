import React, { useState, useEffect } from 'react';
import { Users, Coffee, ChevronRight, Plus, X, Pencil, Ban, MessageSquare } from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';

// BUG FIX 2: same helper as KDSPage — normalise timestamp to Unix-ms so
// comparisons work whether the value is a number (demo) or ISO string (Supabase).
const tsToMs = (ts) => {
  if (!ts) return 0;
  return typeof ts === 'number' ? ts : new Date(ts).getTime();
};

export default function WaiterPage({ embedded = false }) {
  const { tables, orders, messages, getMenuItems, placeOrder, calculateTableBill, cancelOrder, updateOrderItems, updateOrderStatus } = useRestaurant();
  const [activeTableId, setActiveTableId] = useState(null);
  const [cart, setCart] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const prevMessagesLength = React.useRef(messages.length);

  useEffect(() => {
    if (messages.length > prevMessagesLength.current) {
      if (!showMessages) {
        setUnreadCount(prev => prev + (messages.length - prevMessagesLength.current));
      }
    }
    prevMessagesLength.current = messages.length;
  }, [messages, showMessages]);

  const menuItems = getMenuItems();

  const getStatusStyle = (status) => {
    switch (status) {
      case 'free':     return 'bg-white/80 backdrop-blur-md border-white/50 hover:border-teal-500 shadow-sm';
      case 'occupied': return 'bg-amber-50/80 backdrop-blur-md border-amber-300 shadow-sm';
      case 'cooking':  return 'bg-violet-50/80 backdrop-blur-md border-violet-300 shadow-sm';
      case 'ordered':  return 'bg-indigo-50/80 backdrop-blur-md border-indigo-300 shadow-sm';
      case 'paying':   return 'bg-emerald-50/80 backdrop-blur-md border-emerald-300 shadow-sm';
      default:         return 'bg-white/80 backdrop-blur-md border-white/50';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'free':     return 'Available';
      case 'occupied': return 'Seated';
      case 'buffer':   return 'Grace Period';
      case 'pending':  return 'Sent to Kitchen';
      case 'ordered':  return 'Waiting for Food';
      case 'cooking':  return 'Food is Cooking';
      case 'ready':    return 'Ready to Serve';
      case 'served':   return 'Served - Eating';
      case 'paying':   return 'Bill Requested / Paying';
      default:         return status;
    }
  };

  // BUG FIX 2: uses tsToMs so countdown works with both number and string timestamps
  const formatTimeRemaining = (targetTimestamp) => {
    const targetMs = tsToMs(targetTimestamp);
    if (!targetMs || targetMs <= currentTime) return '00:00';
    const diff = Math.floor((targetMs - currentTime) / 1000);
    const m = Math.floor(diff / 60);
    const s = diff % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleTableClick = (id) => {
    setActiveTableId(id);
    setIsEditing(false);
    setCart([]);
  };

  const activeTable = tables.find(t => t.id === activeTableId);
  const activeOrder = activeTable?.currentOrder ? orders.find(o => o.id === activeTable.currentOrder) : null;

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...item, qty: 1, notes: '' }];
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const updateItemNote = (id, note) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, notes: note } : i));
  };

  const handlePlaceOrder = () => {
    if (cart.length > 0 && activeTableId) {
      placeOrder(activeTableId, cart);
      setCart([]);
    }
  };

  const handleEditClick = () => {
    setCart(activeOrder.items);
    setIsEditing(true);
  };

  const handleUpdateOrder = () => {
    if (cart.length > 0 && activeOrder) {
      updateOrderItems(activeOrder.id, cart);
      setIsEditing(false);
      setCart([]);
    }
  };

  const handleCancelOrder = () => {
    if (activeOrder) {
      cancelOrder(activeOrder.id);
      setIsEditing(false);
      setCart([]);
    }
  };

  const handleConfirmServed = () => {
    if (activeOrder) {
      updateOrderStatus(activeOrder.id, 'served');
    }
  };

  return (
    <div className={`p-8 max-w-[1400px] mx-auto flex gap-8 ${embedded ? 'h-full' : 'h-screen'}`}>
      <div className="flex-1 flex flex-col relative z-50">
        <div className="w-full bg-white/80 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/50 shadow-sm flex items-center justify-between mb-8 relative z-[60]">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">Floor Plan</h1>
            <p className="text-slate-500 font-medium text-sm mt-0.5">Manage tables and take orders.</p>
          </div>

          <div className="flex items-center gap-4 relative">
            <button
              onClick={() => {
                setShowMessages(!showMessages);
                if (!showMessages) setUnreadCount(0);
              }}
              className="relative flex items-center justify-center w-10 h-10 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
            >
              <MessageSquare className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>

            {showMessages && (
              <div className="absolute top-12 left-0 md:left-auto md:right-0 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 z-[100] overflow-hidden">
                <div className="flex items-center justify-between p-3 border-b border-slate-200 bg-slate-50">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-teal-600" />
                    Kitchen Messages
                  </h3>
                  <button onClick={() => setShowMessages(false)} className="text-slate-400 hover:text-slate-600 bg-white rounded-md p-1 border border-slate-200">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto p-3 space-y-3">
                  {messages.length === 0 ? (
                    <p className="text-center text-slate-500 text-sm py-4">No messages yet</p>
                  ) : (
                    messages.map((msg) => (
                      <div key={msg.id} className="bg-teal-50/50 p-3 rounded-lg border border-teal-100/50">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-teal-700">{msg.sender}</span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700">{msg.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-800">All Tables</h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 flex-1 overflow-y-auto pb-4 pr-2">
          {tables.filter(t => t.id.startsWith('T-')).map(table => (
            <button
              key={table.id}
              onClick={() => handleTableClick(table.id)}
              className={`p-4 rounded-xl border text-left flex flex-col justify-between h-40 transition-all active:scale-[0.98] relative ${getStatusStyle(table.status)} ${
                activeTableId === table.id ? 'ring-2 ring-inset ring-teal-500 border-transparent shadow-md' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <span className={`font-bold text-xl ${table.status !== 'free' ? 'text-slate-900' : 'text-slate-700'}`}>
                  {table.id}
                </span>
                <span className="flex items-center gap-1 text-slate-500 text-sm font-medium bg-white/50 px-2 py-0.5 rounded-full">
                  <Users className="w-3.5 h-3.5" />
                  {table.capacity}
                </span>
              </div>

              <div>
                {table.status !== 'free' && calculateTableBill(table.id) > 0 && (
                  <div className="font-bold text-slate-900 text-xl mb-1">
                    ₹{calculateTableBill(table.id).toFixed(2)}
                  </div>
                )}
                <div className={`text-xs font-bold uppercase tracking-wider mt-1 ${
                  table.status === 'free'     ? 'text-slate-400' :
                  table.status === 'occupied' ? 'text-amber-600' :
                  table.status === 'cooking'  ? 'text-violet-600' :
                  table.status === 'ordered'  ? 'text-indigo-600' : 'text-emerald-600'
                }`}>
                  {getStatusText(table.status)}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Sidebar - Action Panel */}
      <div className="relative z-10 w-96 bg-white/80 backdrop-blur-md border border-white/50 rounded-2xl shadow-sm flex flex-col h-[calc(100vh-4rem)] overflow-hidden flex-shrink-0">
        {!activeTable ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400 bg-white/40">
            <Coffee className="w-16 h-16 mb-4 text-slate-200" />
            <p className="font-medium text-slate-600 text-lg">No table selected</p>
            <p className="text-sm mt-2 max-w-[200px]">Tap a table on the floor plan to view details and start an order</p>
          </div>
        ) : (
          <>
            <div className="p-5 border-b border-white/50 bg-white/60 flex items-center justify-between shrink-0">
              <div>
                <h2 className="font-bold text-xl text-slate-900">Table {activeTable.id.replace('T-', '')}</h2>
                <span className={`text-xs font-bold uppercase tracking-wider mt-1 ${
                  activeTable.status === 'free' ? 'text-slate-500' : 'text-teal-600'
                }`}>
                  {getStatusText(activeTable.status)}
                </span>
              </div>
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-200">
                <Users className="w-5 h-5 text-slate-500" />
              </div>
            </div>

            {!activeOrder || isEditing ? (
              <>
                <div className="flex-1 overflow-y-auto bg-slate-50/30 p-4 space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">
                      {isEditing ? 'Add Items to Order' : 'Quick Menu'}
                    </h3>
                    <div className="space-y-2">
                      {menuItems.map(item => (
                        <button
                          key={item.id}
                          onClick={() => addToCart(item)}
                          className="w-full text-left bg-white p-3 rounded-lg border border-slate-200 hover:border-teal-500 hover:shadow-sm transition-all flex items-center justify-between group"
                        >
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{item.name}</p>
                            <p className="text-xs text-slate-500">₹{item.price.toFixed(2)}</p>
                          </div>
                          <Plus className="w-4 h-4 text-slate-300 group-hover:text-teal-500 transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Current Order Summary */}
                <div className="p-4 border-t border-white/50 bg-white/60 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] shrink-0 flex flex-col max-h-[50vh]">
                  <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between shrink-0">
                    <span>{isEditing ? 'Editing Order' : 'New Order'} ({cart.length})</span>
                    {cart.length > 0 && <span className="text-teal-600">₹{cart.reduce((s, i) => s + (i.price * i.qty), 0).toFixed(2)}</span>}
                  </h3>

                  {cart.length === 0 ? (
                    <div className="text-sm text-center text-slate-500 py-4 bg-slate-50 rounded-lg border border-dashed border-slate-200 shrink-0">
                      Tap items above to add to order
                    </div>
                  ) : (
                    <div className="flex-1 overflow-y-auto mb-4 space-y-3 pr-1 min-h-[100px]">
                      {cart.map(item => (
                        <div key={item.id} className="flex flex-col gap-2 p-2.5 bg-white border border-slate-100 rounded-lg shadow-sm">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 bg-slate-100 px-1.5 rounded">{item.qty}x</span>
                              <span className="text-slate-700 font-bold">{item.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-900">₹{(item.price * item.qty).toFixed(2)}</span>
                              <button onClick={() => removeFromCart(item.id)} className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-1 rounded transition-colors">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Add special request... (e.g. less spicy)"
                              className="flex-1 text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-colors"
                              value={item.notes || ''}
                              onChange={(e) => updateItemNote(item.id, e.target.value)}
                            />
                          </div>
                          <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
                            {['Less Spicy', 'Extra Cheese', 'No Onions', 'Extra Spicy'].map(quickNote => (
                              <button
                                key={quickNote}
                                onClick={() => updateItemNote(item.id, item.notes ? `${item.notes}, ${quickNote}` : quickNote)}
                                className="shrink-0 text-[10px] font-bold px-2 py-1 bg-white border border-slate-200 text-slate-500 rounded-full hover:border-teal-400 hover:text-teal-600 transition-colors whitespace-nowrap"
                              >
                                + {quickNote}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {isEditing ? (
                    <div className="flex gap-2 shrink-0 pt-2 border-t border-slate-200">
                      <button
                        onClick={() => { setIsEditing(false); setCart([]); }}
                        className="py-3.5 px-4 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUpdateOrder}
                        disabled={cart.length === 0}
                        className={`flex-1 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                          cart.length > 0
                            ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-md shadow-teal-600/20'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        Update & Send <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handlePlaceOrder}
                      disabled={cart.length === 0}
                      className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shrink-0 mt-2 ${
                        cart.length > 0
                          ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-md shadow-teal-600/20'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      Send to Kitchen <ChevronRight className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Active Order View */}
                <div className="flex-1 overflow-y-auto bg-slate-50/30 p-5">
                  <div className="mb-4 flex items-center justify-between shrink-0">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Order {activeOrder.id}</h3>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                        activeOrder.status === 'buffer'  ? 'bg-slate-200 text-slate-600' :
                        activeOrder.status === 'pending' ? 'bg-rose-100 text-rose-700' :
                        activeOrder.status === 'cooking' ? 'bg-violet-100 text-violet-700' :
                        activeOrder.status === 'ready'   ? 'bg-emerald-100 text-emerald-700' :
                        activeOrder.status === 'served'  ? 'bg-teal-100 text-teal-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {getStatusText(activeOrder.status).toUpperCase()}
                      </span>

                      {activeOrder.status === 'buffer' && (
                        <span className="text-xs font-bold text-slate-500">
                          ⏳ Grace Time: {formatTimeRemaining(activeOrder.buffer_ends_at)}
                        </span>
                      )}

                      {/* BUG FIX 2: use tsToMs for cooking_ends_at comparison */}
                      {activeOrder.status === 'cooking' && (
                        <span className={`text-xs font-bold ${
                          tsToMs(activeOrder.cooking_ends_at) <= currentTime ? 'text-rose-500 animate-pulse' : 'text-violet-600'
                        }`}>
                          Prep Timer: {formatTimeRemaining(activeOrder.cooking_ends_at)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* BUG FIX 2: use tsToMs for the "almost done" banner */}
                  {activeOrder.status === 'cooking' && tsToMs(activeOrder.cooking_ends_at) <= currentTime && (
                    <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg shadow-sm animate-pulse">
                      <p className="text-sm font-bold text-amber-700 text-center">
                        Almost done! Final confirmation pending from Kitchen.
                      </p>
                    </div>
                  )}

                  <div className="space-y-3 mb-6">
                    {(activeOrder.items || []).map((item, idx) => (
                      <div key={idx} className="flex flex-col p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-lg">{item.qty}x</span>
                            <div>
                              <p className="font-bold text-slate-900 leading-tight">{item.name}</p>
                              <p className="text-xs text-slate-500 mt-0.5">₹{item.price.toFixed(2)} each</p>
                            </div>
                          </div>
                          <div className="font-black text-slate-900 text-lg">
                            ₹{(item.price * item.qty).toFixed(2)}
                          </div>
                        </div>
                        {item.notes && (
                          <div className="mt-2 text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded disabled inline-block self-start border border-amber-100">
                            Note: {item.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center p-4 bg-white rounded-xl border border-slate-200 mb-6 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] shrink-0">
                    <span className="font-bold text-slate-700">Total Amount</span>
                    <span className="text-2xl font-black text-teal-600">₹{activeOrder.total.toFixed(2)}</span>
                  </div>

                  {(activeOrder.status === 'buffer' || activeOrder.status === 'pending' || activeOrder.status === 'cooking') && (
                    <div className="grid grid-cols-2 gap-3 mt-auto shrink-0">
                      <button
                        onClick={handleEditClick}
                        className="flex items-center justify-center gap-2 py-3.5 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-bold rounded-xl transition-colors shadow-sm"
                      >
                        <Pencil className="w-4 h-4" /> Edit Order
                      </button>
                      <button
                        onClick={handleCancelOrder}
                        className="flex items-center justify-center gap-2 py-3.5 bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-600 font-bold rounded-xl transition-colors shadow-sm"
                      >
                        <Ban className="w-4 h-4" /> Cancel Order
                      </button>
                    </div>
                  )}

                  {activeOrder.status === 'ready' && (
                    <button
                      onClick={handleConfirmServed}
                      className="w-full mt-auto flex items-center justify-center gap-2 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all shadow-md shadow-emerald-500/20 ring-4 ring-emerald-500/30"
                    >
                      <ChevronRight className="w-5 h-5" /> Confirm Served to Table
                    </button>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
