'use client';

import { useState } from 'react';
import SenderEmailButtons from './SenderEmailButtons';
import { useWebsiteAccounts } from '../src/lib/useWebsiteAccounts';

export default function ProductRecommendationsForm({ activeWebsite = 'casoodo' }) {
  const { accounts, selectedEmail, setSelectedEmail, isLoadingAccounts } = useWebsiteAccounts(activeWebsite);

  const [customerRaw, setCustomerRaw] = useState('');
  const [productLinksRaw, setProductLinksRaw] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });

  const productCount = productLinksRaw
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.startsWith('http')).length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', content: '' });

    try {
      const customerLines = customerRaw.split('\n').map(l => l.trim()).filter(l => l);
      const firstLine = customerLines[0] || '';
      const isLightweightMode = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(firstLine);

      const customerEmail = isLightweightMode ? (customerLines[0] || '') : (customerLines[1] || '');
      const customerName = isLightweightMode ? (customerLines[1] || '') : (customerLines[2] || '');
      const sourceProductName = isLightweightMode ? '' : (customerLines[0] || '');
      const customerAddress = isLightweightMode ? '' : (customerLines[3] || '');
      const sourceProductLink = isLightweightMode ? '' : (customerLines[4] || '');
      const orderNumber = isLightweightMode ? '' : (customerLines[5] || '');

      const productLinks = productLinksRaw
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.startsWith('http'));

      if (!customerEmail) {
        setMessage({ type: 'error', content: 'Customer email is required.' });
        setIsLoading(false);
        return;
      }
      if (productLinks.length === 0) {
        setMessage({ type: 'error', content: 'Paste at least one product link (one per line).' });
        setIsLoading(false);
        return;
      }

      const payload = {
        customerEmail,
        customerName,
        sourceProductName,
        customerAddress,
        sourceProductLink,
        orderNumber,
        productLinks,
        senderEmail: selectedEmail,
        website: activeWebsite,
      };

      const response = await fetch('/api/send-product-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          content: `✨ Recommendations email sent via ${activeWebsite.toUpperCase()} with ${productLinks.length} product${productLinks.length !== 1 ? 's' : ''}!`,
        });
        setCustomerRaw('');
        setProductLinksRaw('');
      } else {
        setMessage({ type: 'error', content: result.error || 'Failed to send email.' });
      }
    } catch (error) {
      setMessage({ type: 'error', content: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <p className="text-gray-600 font-medium">
          Product Recommendations Dashboard — Sending as <span className="font-bold text-[#003099] uppercase">{activeWebsite}</span>
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
            <label htmlFor="customerRaw" className="block text-sm font-medium text-gray-700">
              Customer Details *
            </label>
            <span className="text-xs text-gray-400">Line 1: Product | Line 2: Email | Line 3: Name</span>
          </div>
          <textarea
            id="customerRaw"
            value={customerRaw}
            onChange={(e) => setCustomerRaw(e.target.value)}
            required
            rows={5}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFFBB6] focus:border-transparent transition duration-200 ease-in-out text-gray-900 bg-white resize-y font-mono text-sm leading-relaxed"
            placeholder={`Product Name : $Price\ncustomer@example.com\nJohn Doe`}
            disabled={isLoading}
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="productLinksRaw" className="block text-sm font-medium text-gray-700">
              Recommended Products (One URL per line) *
            </label>
            <span className="text-xs text-gray-400">
              {productCount} link{productCount !== 1 ? 's' : ''} detected
            </span>
          </div>
          <textarea
            id="productLinksRaw"
            value={productLinksRaw}
            onChange={(e) => setProductLinksRaw(e.target.value)}
            required
            rows={5}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFFBB6] focus:border-transparent transition duration-200 ease-in-out text-gray-900 bg-white resize-y font-mono text-sm leading-relaxed"
            placeholder={`https://${activeWebsite}.com/product/item-one\nhttps://${activeWebsite}.com/product/item-two`}
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || isLoadingAccounts || !selectedEmail || productCount === 0}
          className={`w-full py-3 px-4 rounded-lg font-bold text-[#003099] transition duration-200 ease-in-out ${
            isLoading || !selectedEmail || productCount === 0
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
              Scraping previews &amp; sending...
            </div>
          ) : (
            `✨ Send Recommendations (${productCount} item${productCount !== 1 ? 's' : ''})`
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
