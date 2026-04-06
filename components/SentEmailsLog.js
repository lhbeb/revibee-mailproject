'use client';

import React, { useState, useEffect, useCallback } from 'react';

const TYPE_CONFIG = {
  'Shipping Confirmation':     { color: 'bg-blue-100 text-blue-700',   icon: '📦' },
  'Order Confirmation':        { color: 'bg-green-100 text-green-700', icon: '✅' },
  'Local Pickup':              { color: 'bg-teal-100 text-teal-700',   icon: '🏪' },
  'Refund Email':              { color: 'bg-amber-100 text-amber-700', icon: '💰' },
  'Recovery — Urgent':         { color: 'bg-purple-100 text-purple-700', icon: '🛒' },
  'Recovery — Friendly':       { color: 'bg-purple-100 text-purple-700', icon: '💚' },
  'Recovery — Last Chance':    { color: 'bg-purple-100 text-purple-700', icon: '⏰' },
  'About DeelDepot':           { color: 'bg-teal-100 text-teal-700',   icon: '🏪' },
};

export default function SentEmailsDashboard() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState('All');
  const [filterSender, setFilterSender] = useState('All');
  const [search, setSearch] = useState('');
  const [expandedRowId, setExpandedRowId] = useState(null);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/get-sent-emails?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const allSenders = ['All', ...new Set(logs.map(l => l.senderEmail).filter(Boolean))];
  const allTypes   = ['All', ...new Set([
    ...Object.keys(TYPE_CONFIG), 
    ...logs.map(l => l.templateName).filter(Boolean)
  ])];

  const filtered = logs.filter(log => {
    const matchType   = filterType === 'All' || log.templateName === filterType;
    const matchSender = filterSender === 'All' || log.senderEmail === filterSender;
    const matchSearch = !search || 
      log.recipientEmail?.toLowerCase().includes(search.toLowerCase()) ||
      log.recipientName?.toLowerCase().includes(search.toLowerCase()) ||
      log.productName?.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSender && matchSearch;
  });

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // Stats
  const total = logs.length;
  const todayCount = logs.filter(l => {
    const logDate = new Date(l.timestamp).toDateString();
    return logDate === new Date().toDateString();
  }).length;
  const typeCounts = Object.keys(TYPE_CONFIG).reduce((acc, t) => {
    acc[t] = logs.filter(l => l.templateName === t).length;
    return acc;
  }, {});

  return (
    <div className="space-y-6">

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#090A28] text-white rounded-xl p-4 flex flex-col gap-1">
          <span className="text-3xl font-black">{total}</span>
          <span className="text-xs text-white/60 uppercase tracking-wider">Total Sent</span>
        </div>
        <div className="bg-[#F5970C] text-[#090A28] rounded-xl p-4 flex flex-col gap-1">
          <span className="text-3xl font-black">{todayCount}</span>
          <span className="text-xs text-[#090A28]/70 uppercase tracking-wider">Today</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-1">
          <span className="text-3xl font-black text-[#090A28]">{
            (typeCounts['Recovery — Urgent'] || 0) + 
            (typeCounts['Recovery — Friendly'] || 0) + 
            (typeCounts['Recovery — Last Chance'] || 0)
          }</span>
          <span className="text-xs text-slate-500 uppercase tracking-wider">Recovery</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-1">
          <span className="text-3xl font-black text-[#090A28]">{
            (typeCounts['Shipping Confirmation'] || 0) + 
            (typeCounts['Order Confirmation'] || 0) +
            (typeCounts['Local Pickup'] || 0)
          }</span>
          <span className="text-xs text-slate-500 uppercase tracking-wider">Transactional</span>
        </div>
      </div>

      {/* Filters + Search */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="flex-1 min-w-[180px] relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input
            type="text"
            placeholder="Search recipient or product..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F5970C]"
          />
        </div>

        {/* Type Filter */}
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F5970C]"
        >
          {allTypes.map(t => <option key={t}>{t}</option>)}
        </select>

        {/* Sender Filter */}
        <select
          value={filterSender}
          onChange={e => setFilterSender(e.target.value)}
          className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F5970C] max-w-[200px] truncate"
        >
          {allSenders.map(s => <option key={s}>{s}</option>)}
        </select>

        {/* Refresh */}
        <button
          onClick={fetchLogs}
          disabled={isLoading}
          className="px-4 py-2 bg-[#090A28] text-white rounded-lg text-sm font-medium hover:bg-[#1a1c4a] transition-colors disabled:opacity-50"
        >
          {isLoading ? '⏳' : '↻'} Refresh
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48 text-slate-400">
            <div className="text-center">
              <div className="animate-spin text-3xl mb-3">⏳</div>
              <p className="text-sm">Loading emails...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-3">
            <span className="text-4xl">📭</span>
            <p className="text-sm font-medium">No emails match your filters</p>
            <button onClick={() => { setSearch(''); setFilterType('All'); setFilterSender('All'); }} className="text-xs text-[#F5970C] hover:underline">Clear filters</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="px-5 py-3 text-left font-semibold">Time</th>
                  <th className="px-5 py-3 text-left font-semibold">Recipient</th>
                  <th className="px-5 py-3 text-left font-semibold">Type</th>
                  <th className="px-5 py-3 text-left font-semibold">Product</th>
                  <th className="px-5 py-3 text-left font-semibold">Sent From</th>
                  <th className="px-5 py-3 text-right font-semibold">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((log) => {
                  const cfg = TYPE_CONFIG[log.templateName] || { color: 'bg-slate-100 text-slate-600', icon: '📧' };
                  const isExpanded = expandedRowId === log.id;
                  
                  return (
                    <React.Fragment key={log.id}>
                      <tr className={`hover:bg-slate-50 transition-colors ${isExpanded ? 'bg-slate-50' : ''}`}>
                        <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">{formatDate(log.timestamp)}</td>
                        <td className="px-5 py-3.5">
                          <p className="font-semibold text-[#090A28]">{log.recipientName || '—'}</p>
                          <p className="text-slate-400 text-xs">{log.recipientEmail}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.color}`}>
                            {cfg.icon} {log.templateName}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-600 max-w-[200px] truncate" title={log.productName}>
                          {log.productName || '—'}
                        </td>
                        <td className="px-5 py-3.5 text-slate-400 text-xs whitespace-nowrap">{log.senderEmail}</td>
                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          <button
                            onClick={() => setExpandedRowId(isExpanded ? null : log.id)}
                            className="text-slate-400 hover:text-[#F5970C] p-2 rounded transition-colors"
                            title="View full payload details"
                          >
                            {isExpanded ? '▼ Close' : '▶ Expand'}
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-slate-50 border-t-0">
                          <td colSpan="6" className="px-5 pb-4 pt-1">
                            <div className="bg-white border text-left border-slate-200 rounded-lg p-5 shadow-sm relative overflow-hidden">
                              <div className="absolute top-0 left-0 w-1 h-full bg-[#F5970C]"></div>
                              <h4 className="font-bold text-[#090A28] mb-4 text-sm flex items-center gap-2">
                                <span>📄</span> Request Payload Details
                              </h4>
                              {log.payload ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-5 gap-x-6">
                                  {Object.entries(log.payload).map(([key, value]) => {
                                    if (value == null || value === '' || typeof value === 'object') return null;
                                    // Skip redundant fields displayed in main row
                                    if (['senderEmail', 'customerName', 'customerEmail', 'productName', 'message'].includes(key)) return null;
                                    
                                    return (
                                      <div key={key}>
                                        <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                        <span className="block text-sm text-slate-700 font-mono break-all">{value.toString()}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="text-slate-400 text-sm italic py-2">No extended payload data was saved for this email.</div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-400">
              Showing {filtered.length} of {total} emails
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
