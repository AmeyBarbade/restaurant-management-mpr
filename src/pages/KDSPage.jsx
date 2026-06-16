import React, { useState, useEffect } from 'react';
import { ChefHat, Clock, Send, X, Play } from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';

// BUG FIX 2: Normalise a timestamp to Unix-ms regardless of whether it was
// stored as a plain number (demo mode) or as an ISO-8601 string (real Supabase).
// The old code did `ticket.buffer_ends_at > currentTime` which silently broke
// (returned false / NaN) whenever Supabase returned an ISO string.
const tsToMs = (ts) => {
  if (!ts) return 0;
  return typeof ts === 'number' ? ts : new Date(ts).getTime();
};

export default function KDSPage({ embedded = false }) {
  const { orders, updateOrderStatus, sendMessage } = useRestaurant();
  const [messageText, setMessageText] = useState('');

  // Real-time ticking
  const [currentTime, setCurrentTime] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [showPrepModal, setShowPrepModal] = useState(null);
  const [prepMins, setPrepMins] = useState(15);
  const [prepSecs, setPrepSecs] = useState(0);

  const activeOrders = orders.filter(o => o.status === 'buffer' || o.status === 'pending' || o.status === 'cooking');
  const bufferCount  = activeOrders.filter(t => t.status === 'buffer').length;
  const pendingCount = activeOrders.filter(t => t.status === 'pending').length;
  const cookingCount = activeOrders.filter(t => t.status === 'cooking').length;

  const calculateWaitTime = () => 'New';

  // BUG FIX 2: uses tsToMs so the countdown works with both number and string timestamps
  const formatTimeRemaining = (targetTimestamp) => {
    const targetMs = tsToMs(targetTimestamp);
    if (!targetMs || targetMs <= currentTime) return '00:00';
    const diff = Math.floor((targetMs - currentTime) / 1000);
    const m = Math.floor(diff / 60);
    const s = diff % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStartCooking = () => {
    if (!showPrepModal) return;
    const totalMs = (parseInt(prepMins || 0) * 60 + parseInt(prepSecs || 0)) * 1000;
    updateOrderStatus(showPrepModal, 'cooking', { cooking_ends_at: Date.now() + totalMs });
    setShowPrepModal(null);
    setPrepMins(15);
    setPrepSecs(0);
  };

  return (
    <div className={`p-8 flex flex-col max-w-[1600px] mx-auto ${embedded ? 'h-full' : 'h-screen'}`}>
      <div className="w-full bg-white/80 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/50 shadow-sm flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">Kitchen Display System</h1>
          <p className="text-slate-500 font-medium text-sm mt-0.5">Manage active orders and tickets from the Waiter app.</p>
        </div>

        {/* Messaging Section */}
        <div className="flex-1 max-w-lg mx-8 flex gap-2">
          <input
            type="text"
            placeholder="Broadcast message to admins & waiters..."
            className="flex-1 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && messageText.trim()) {
                sendMessage('Kitchen', messageText.trim());
                setMessageText('');
              }
            }}
          />
          <button
            onClick={() => {
              if (messageText.trim()) {
                sendMessage('Kitchen', messageText.trim());
                setMessageText('');
              }
            }}
            className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-4">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
            Buffer ({bufferCount})
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            Pending ({pendingCount})
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-500"></span>
            Cooking ({cookingCount})
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-4 pr-2">
        <div className="flex flex-wrap gap-6 items-start h-full content-start">
          {activeOrders.length === 0 && (
            <div className="flex items-center justify-center w-full h-64 text-slate-400 font-medium text-xl">
              No active orders right now.
            </div>
          )}
          {activeOrders.map((ticket) => {
            // BUG FIX 2: both comparisons now use tsToMs() to handle ISO strings from Supabase
            const isBufferActive   = ticket.status === 'buffer'  && tsToMs(ticket.buffer_ends_at)   > currentTime;
            const isCookingFinished = ticket.status === 'cooking' && tsToMs(ticket.cooking_ends_at) <= currentTime;

            return (
              <div
                key={ticket.id}
                className={`w-80 flex flex-col bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border-t-4 border-x border-b border-white/50 shrink-0 transition-opacity ${
                  isBufferActive ? 'opacity-75 grayscale-[0.3] border-t-slate-400' :
                  ticket.status === 'pending' || ticket.status === 'buffer' ? 'border-t-rose-500' : 'border-t-violet-500'
                }`}
              >
                {/* Ticket Header */}
                <div className="p-5 border-b border-white/50 flex flex-col gap-2 bg-white/40 rounded-t-xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900">{ticket.tableId}</h2>
                      <p className="text-sm font-medium text-slate-500">{ticket.id} • {ticket.time}</p>
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-bold ${
                      ticket.status === 'pending' || ticket.status === 'buffer' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      <Clock className="w-4 h-4" />
                      {calculateWaitTime(ticket.time)}
                    </div>
                  </div>

                  {ticket.status === 'buffer' && (
                    <div className={`text-sm font-bold px-2.5 py-1 rounded inline-flex self-start ${
                      isBufferActive ? 'bg-slate-100 text-slate-600' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {isBufferActive
                        ? `⏳ Buffer window: ${formatTimeRemaining(ticket.buffer_ends_at)}`
                        : 'Wait time complete'}
                    </div>
                  )}

                  {ticket.status === 'cooking' && ticket.cooking_ends_at && (
                    <div className={`text-sm font-bold px-3 py-1.5 rounded-lg flex items-center justify-between ${
                      isCookingFinished ? 'bg-amber-100 text-amber-700 animate-pulse' : 'bg-violet-100 text-violet-700'
                    }`}>
                      <span>Prep Time:</span>
                      <span className="font-mono text-base">{formatTimeRemaining(ticket.cooking_ends_at)}</span>
                    </div>
                  )}
                </div>

                {/* Order Items */}
                <div className="p-5 flex-1 space-y-4">
                  {(ticket.items || []).map((item, idx) => (
                    <div key={idx} className="flex gap-4 relative">
                      <span className="font-black text-xl text-slate-300 w-6">{item.qty}x</span>
                      <div className="flex-1">
                        <p className="font-bold text-slate-900 text-lg leading-tight">{item.name}</p>
                        {item.notes && (
                          <p className="text-sm text-amber-600 font-medium mt-1 bg-amber-50 px-2.5 py-1 rounded-md inline-block">
                            Note: {item.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="p-5 border-t border-white/50 mt-auto bg-white/40 rounded-b-xl">
                  {ticket.status === 'buffer' || ticket.status === 'pending' ? (
                    <button
                      disabled={isBufferActive}
                      onClick={() => setShowPrepModal(ticket.id)}
                      className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                        isBufferActive
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          : 'bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/20'
                      }`}
                    >
                      <ChefHat className="w-5 h-5" />
                      {isBufferActive ? 'Waiting for Waiter' : 'Start Cooking'}
                    </button>
                  ) : (
                    <button
                      onClick={() => updateOrderStatus(ticket.id, 'ready')}
                      className={`w-full py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                        isCookingFinished
                          ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20 ring-4 ring-emerald-500/30'
                          : 'bg-slate-100 text-emerald-600 hover:bg-emerald-50 border border-emerald-200'
                      }`}
                    >
                      <Play className="w-5 h-5" />
                      Ready to Serve
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showPrepModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="font-bold text-xl text-slate-900">Set Prep Time</h2>
              <button onClick={() => setShowPrepModal(null)} className="text-slate-400 hover:text-slate-600 bg-white rounded-md p-1 border border-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-500 mb-6 text-center font-medium">How long will this order take to prepare?</p>

              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="flex flex-col items-center">
                  <input
                    type="number"
                    min="0" max="120"
                    className="w-20 text-center text-3xl font-black bg-slate-50 border border-slate-200 rounded-xl py-3 focus:ring-2 focus:ring-violet-500 outline-none"
                    value={prepMins}
                    onChange={(e) => setPrepMins(e.target.value)}
                  />
                  <span className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">MINS</span>
                </div>
                <span className="text-4xl text-slate-300 font-light mb-6">:</span>
                <div className="flex flex-col items-center">
                  <input
                    type="number"
                    min="0" max="59" step="15"
                    className="w-20 text-center text-3xl font-black bg-slate-50 border border-slate-200 rounded-xl py-3 focus:ring-2 focus:ring-violet-500 outline-none"
                    value={prepSecs}
                    onChange={(e) => setPrepSecs(e.target.value)}
                  />
                  <span className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">SECS</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-8">
                {[5, 10, 15, 20, 30, 45].map(v => (
                  <button
                    key={v}
                    onClick={() => { setPrepMins(v); setPrepSecs(0); }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2 rounded-lg text-sm transition-colors"
                  >
                    {v} min
                  </button>
                ))}
              </div>

              <button
                onClick={handleStartCooking}
                className="w-full py-4 rounded-xl font-bold text-white bg-violet-600 hover:bg-violet-700 shadow-md shadow-violet-600/20 transition-colors"
              >
                Confirm & Start Kitchen Timer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
