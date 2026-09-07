'use client';

import { useState } from 'react';
import SenderEmailButtons from './SenderEmailButtons';
import { useWebsiteAccounts } from '../src/lib/useWebsiteAccounts';

export default function RefundEmailForm({ activeWebsite = 'casoodo' }) {
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
      
      let email = '';
      let name = '';
      let amount = '';

      const line2 = lines[1] || '';
      if (line2.startsWith('$') || !isNaN(parseFloat(line2.replace('$', '')))) {
        amount = line2.replace('$', '').trim();
        email = lines[2] || '';
        name = lines[3] || '';
      } else {
        email = lines[1] || '';
        name = lines[2] || '';
        const priceMatch = productLine.match(/\$\s*([\d,]+(?:\.\d{2})?)/);
        if (priceMatch) {
          amount = priceMatch[1].replace(',', '');
        } else {
          amount = '0.00';
        }
      }

      const payload = {
        customerEmail: email,
        customerName: name,
        productName: productLine,
        refundAmount: parseFloat(amount) || 0,
        senderEmail: selectedEmail,
        website: activeWebsite,
      };

      const response = await fetch('/api/send-refund-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', content: `Refund confirmation sent successfully via ${activeWebsite.toUpperCase()}! 💰` });
        setRawData('');
      } else {
        setMessage({
          type: 'error',
          content: result.error || 'Failed to send refund email.'
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

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <p className="text-gray-600 font-medium">
          Refund Notification Dashboard — Sending as <span className="font-bold text-[#003099] uppercase">{activeWebsite}</span>
        </p>
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
              Order / Refund Details (Paste Block) *
            </label>
            <span className="text-xs text-gray-400">Line 1: Product : $Price | Line 2: Email | Line 3: Name</span>
          </div>
          <textarea
            id="rawData"
            name="rawData"
            value={rawData}
            onChange={(e) => setRawData(e.target.value)}
            required
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFFBB6] focus:border-transparent transition duration-200 ease-in-out text-gray-900 bg-white resize-y font-mono text-sm leading-relaxed"
            placeholder={`Product Name : $150.00\ncustomer@example.com\nJohn Doe`}
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
            `📧 Send Refund Email (${activeWebsite.toUpperCase()})`
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
