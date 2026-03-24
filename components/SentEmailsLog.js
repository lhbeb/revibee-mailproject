'use client';

import { useState, useEffect, useCallback } from 'react';

export default function SentEmailsLog({ senderEmail, refreshTrigger }) {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const url = senderEmail 
        ? `/api/get-sent-emails?senderEmail=${encodeURIComponent(senderEmail)}`
        : '/api/get-sent-emails';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setIsLoading(false);
    }
  }, [senderEmail]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs, refreshTrigger]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="mt-12 bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
        <h3 className="text-lg font-bold text-[#090A28]">Sent Emails History</h3>
        <button 
          onClick={fetchLogs}
          className="text-sm font-medium text-[#F5970C] hover:text-[#e08800] transition-colors"
          disabled={isLoading}
        >
          {isLoading ? 'Refreshing...' : '↻ Refresh'}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-600 text-xs font-bold uppercase tracking-wider">
              <th className="px-6 py-3 border-b border-slate-200">Time</th>
              <th className="px-6 py-3 border-b border-slate-200">Recipient</th>
              <th className="px-6 py-3 border-b border-slate-200">Type</th>
              <th className="px-6 py-3 border-b border-slate-200">Details</th>
              <th className="px-6 py-3 border-b border-slate-200">From</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-10 text-center text-slate-500 italic">
                  No sent emails found for this sender.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                    {formatDate(log.timestamp)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-[#090A28]">{log.recipientName || 'No Name'}</div>
                    <div className="text-xs text-slate-500">{log.recipientEmail}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                      log.type === 'Shipping' ? 'bg-blue-100 text-blue-700' :
                      log.type === 'Confirmation' ? 'bg-green-100 text-green-700' :
                      log.type === 'Refund' ? 'bg-amber-100 text-amber-700' :
                      log.type === 'Recovery' ? 'bg-purple-100 text-purple-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {log.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    <div className="truncate max-w-[200px]" title={log.productName}>
                      {log.productName || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                    {log.senderEmail}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
