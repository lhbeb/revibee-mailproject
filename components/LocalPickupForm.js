'use client';

import { useState } from 'react';
import SenderEmailButtons from './SenderEmailButtons';
import { useWebsiteAccounts } from '../src/lib/useWebsiteAccounts';

export default function LocalPickupForm({ activeWebsite = 'casoodo' }) {
  const { accounts, selectedEmail, setSelectedEmail, isLoadingAccounts } = useWebsiteAccounts(activeWebsite);

  const [rawData, setRawData] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', content: '' });

    try {
      const lines = rawData.split('\n').map(line => line.trim()).filter(line => line);
      const productLine = lines[0] || '';
      const email = lines[1] || '';
      const name = lines[2] || '';
      const link = lines[4] || '';

      const payload = {
        customerEmail: email,
        customerName: name,
        productName: productLine,
        productLink: link,
        senderEmail: selectedEmail,
        website: activeWebsite,
      };

      const response = await fetch('/api/send-local-pickup-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', content: `Local Pickup email sent successfully via ${activeWebsite.toUpperCase()}! 🏪` });
        setRawData('');
      } else {
        setMessage({
          type: 'error',
          content: result.error || 'Failed to send email.'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        content: 'Network error. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isBricoc = activeWebsite === 'bricoc';

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <p className="text-gray-600 font-medium">
          Local Pickup Dashboard — Sending as <span className="font-bold text-[#003099] uppercase">{activeWebsite}</span>
        </p>
      </div>

      {/* Pickup Location Details Banner */}
      <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
        <div className="flex items-start gap-3">
          <span className="text-xl">📍</span>
          <div>
            <p className="text-sm font-bold text-slate-800">
              {isBricoc ? 'Bricoc Pickup Location (Bronx, NY)' : 'Casoodo Warehouse (Modesto, CA)'}
            </p>
            <p className="text-xs text-slate-600 mt-1">
              {isBricoc
                ? '1731 Matthews Ave APT 4A, Bronx, New York 10462 • Mon - Fri: 9am - 5pm EST (Appointment required)'
                : '415 Codoni Ave, Modesto, CA 95357 • Mon - Fri: 9am - 5pm EST'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <SenderEmailButtons
          accounts={accounts}
          selectedEmail={selectedEmail}
          onSelect={setSelectedEmail}
          disabled={isLoading || isLoadingAccounts}
        />

        <div>
          <div className="flex justify-between mb-2">
            <label htmlFor="rawData" className="block text-sm font-medium text-gray-700">
              Order Details (Paste Block) *
            </label>
            <span className="text-xs text-gray-400">Line 1: Product | Line 2: Email | Line 3: Name | Line 5: Link</span>
          </div>
          <textarea
            id="rawData"
            name="rawData"
            value={rawData}
            onChange={(e) => setRawData(e.target.value)}
            required
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFFBB6] focus:border-transparent transition duration-200 ease-in-out text-gray-900 bg-white resize-y font-mono text-sm leading-relaxed"
            placeholder={`Product Name : $Price\ncustomer@example.com\nJohn Doe\n123 Address St, City, ST 12345\nhttps://${activeWebsite}.com/product/...`}
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || isLoadingAccounts || !selectedEmail}
          className={`w-full py-3 px-4 rounded-lg font-bold text-[#003099] transition duration-200 ease-in-out ${isLoading || !selectedEmail
            ? 'bg-gray-400 cursor-not-allowed text-white'
            : 'bg-[#FFFBB6] hover:bg-[#f3ee8f] focus:ring-2 focus:ring-[#FFFBB6] focus:ring-offset-2'
            }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending Email...
            </div>
          ) : (
            `📧 Send Local Pickup Email (${activeWebsite.toUpperCase()})`
          )}
        </button>
      </form>

      {message.content && (
        <div className={`mt-6 p-4 rounded-lg ${message.type === 'success'
          ? 'bg-green-50 border border-green-200 text-green-800'
          : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
          <span className="font-medium">{message.content}</span>
        </div>
      )}
    </div>
  );
}
