'use client';

import React, { useState, useEffect, useCallback } from 'react';

const TYPE_CONFIG = {
  'Shipping Confirmation':     { color: 'bg-[#F0F6FF] text-[#003099]', icon: '📦' },
  'Order Confirmation':        { color: 'bg-[#FFFBB6] text-[#003099]', icon: '✅' },
  'Local Pickup':              { color: 'bg-[#F0F6FF] text-[#070B17]', icon: '🏪' },
  'Refund Email':              { color: 'bg-[#FFFBB6] text-[#070B17]', icon: '💰' },
  'Text Email':                { color: 'bg-[#F0F6FF] text-[#070B17]', icon: '✉️' },
  'Recovery — Urgent':         { color: 'bg-[#003099] text-[#F0F6FF]', icon: '🛒' },
  'Recovery — Friendly':       { color: 'bg-[#F0F6FF] text-[#003099]', icon: '💚' },
  'Recovery — Last Chance':    { color: 'bg-[#070B17] text-[#F0F6FF]', icon: '⏰' },
  'About Casoodo':             { color: 'bg-[#003099] text-[#F0F6FF]', icon: '🏪' },
  'About Bricoc':              { color: 'bg-[#233F31] text-[#FAF6EB]', icon: '🏪' },
  'Product Recommendations':   { color: 'bg-[#FFFBB6] text-[#003099]', icon: '✨' },
};

function resolveWebsite(log) {
  if (log.payload?.website) return log.payload.website.toLowerCase();
  const sender = (log.senderEmail || '').toLowerCase();
  if (sender.includes('bricoc') || sender.includes('arvarado')) return 'bricoc';
  return 'casoodo';
}

export default function SentEmailsDashboard({ activeWebsite = 'all' }) {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterWebsite, setFilterWebsite] = useState('All');
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
    const logSite = resolveWebsite(log);
    const matchSite = filterWebsite === 'All' || logSite === filterWebsite.toLowerCase();
    const matchType = filterType === 'All' || log.templateName === filterType;
    const matchSender = filterSender === 'All' || log.senderEmail === filterSender;
    const matchSearch = !search || 
      log.recipientEmail?.toLowerCase().includes(search.toLowerCase()) ||
      log.recipientName?.toLowerCase().includes(search.toLowerCase()) ||
      log.productName?.toLowerCase().includes(search.toLowerCase());
    return matchSite && matchType && matchSender && matchSearch;
  });

  return (
    <div className="w-full space-y-4">
      {/* Controls row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Website Filter Tabs */}
          <div className="flex items-center rounded-lg bg-slate-100 p-1 border border-slate-200">
            {['All', 'Casoodo', 'Bricoc'].map((site) => (
              <button
                key={site}
                type="button"
                onClick={() => setFilterWebsite(site)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  filterWebsite === site
                    ? site === 'Bricoc'
                      ? 'bg-[#233F31] text-white shadow-sm'
                      : site === 'Casoodo'
                        ? 'bg-[#003099] text-white shadow-sm'
                        : 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {site}
              </button>
            ))}
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 font-medium"
          >
            {allTypes.map(t => <option key={t} value={t}>{t === 'All' ? 'All Templates' : t}</option>)}
          </select>

          {/* Sender Filter */}
          <select
            value={filterSender}
            onChange={e => setFilterSender(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 font-medium"
          >
            {allSenders.map(s => <option key={s} value={s}>{s === 'All' ? 'All Senders' : s}</option>)}
          </select>

          {/* Search */}
          <input
            type="text"
            placeholder="Search email, name, product..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 w-52 placeholder-slate-400"
          />
        </div>

        <button
          onClick={fetchLogs}
          disabled={isLoading}
          className="text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-2 rounded-lg hover:bg-slate-50 transition"
        >
          {isLoading ? 'Refreshing...' : '🔄 Refresh'}
        </button>
      </div>

      {/* Logs Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
            <tr>
              <th className="px-4 py-3">Site</th>
              <th className="px-4 py-3">Template</th>
              <th className="px-4 py-3">Recipient</th>
              <th className="px-4 py-3">Product / Info</th>
              <th className="px-4 py-3">Sender</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-slate-400">
                  {isLoading ? 'Loading logs...' : 'No sent emails match your filter criteria.'}
                </td>
              </tr>
            ) : (
              filtered.map((log) => {
                const site = resolveWebsite(log);
                const isBricoc = site === 'bricoc';
                const typeCfg = TYPE_CONFIG[log.templateName] || { color: 'bg-slate-100 text-slate-700', icon: '✉️' };

                return (
                  <React.Fragment key={log.id}>
                    <tr
                      onClick={() => setExpandedRowId(expandedRowId === log.id ? null : log.id)}
                      className="hover:bg-slate-50/70 transition cursor-pointer"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          isBricoc ? 'bg-[#233F31] text-[#FAF6EB]' : 'bg-[#003099] text-[#FFFBB6]'
                        }`}>
                          {site}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${typeCfg.color}`}>
                          <span>{typeCfg.icon}</span>
                          <span>{log.templateName}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800">{log.recipientEmail}</div>
                        {log.recipientName && <div className="text-slate-400 text-[11px]">{log.recipientName}</div>}
                      </td>
                      <td className="px-4 py-3 max-w-[240px] truncate text-slate-700 font-medium">
                        {log.productName || '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                        {log.senderEmail}
                      </td>
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                        {log.timestamp ? new Date(log.timestamp).toLocaleString() : '—'}
                      </td>
                    </tr>
                    {expandedRowId === log.id && log.payload && (
                      <tr className="bg-slate-50">
                        <td colSpan={6} className="px-6 py-4">
                          <p className="text-[11px] font-bold text-slate-500 uppercase mb-2">Request Payload</p>
                          <pre className="text-[11px] bg-slate-900 text-slate-100 p-3 rounded-lg overflow-x-auto font-mono">
                            {JSON.stringify(log.payload, null, 2)}
                          </pre>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
