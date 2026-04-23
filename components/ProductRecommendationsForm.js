'use client';

import { useState, useEffect } from 'react';
import SenderEmailButtons from './SenderEmailButtons';

export default function ProductRecommendationsForm() {
  const [formData, setFormData] = useState({
    senderEmail: '',
  });
  // Paste block: Line 1 = customer email, Line 2 = customer name (optional)
  const [customerRaw, setCustomerRaw] = useState('');
  // One product link per line
  const [productLinksRaw, setProductLinksRaw] = useState('');
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });

  // Count non-empty product links for preview badge
  const productCount = productLinksRaw
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.startsWith('http')).length;

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetch('/api/get-accounts');
        if (response.ok) {
          const data = await response.json();
          const nextAccounts = data.accounts || [];
          setAccounts(nextAccounts);
          if (nextAccounts.length) {
            setFormData(prev => ({
              ...prev,
              senderEmail: prev.senderEmail || nextAccounts[0].user,
            }));
          }
        }
      } catch (error) {
        console.error('Failed to fetch email accounts:', error);
      }
    };
    fetchAccounts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', content: '' });

    try {
      // Parse customer block
      const customerLines = customerRaw.split('\n').map(l => l.trim()).filter(l => l);
      const customerEmail = customerLines[0] || '';
      const customerName  = customerLines[1] || '';

      // Parse product links (one per line, must start with http)
      const productLinks = productLinksRaw
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.startsWith('http'));

      if (!customerEmail) {
        setMessage({ type: 'error', content: 'Customer email is required (Line 1 of customer block).' });
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
        productLinks,
        senderEmail: formData.senderEmail,
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
          content: `✨ Recommendations email sent with ${productLinks.length} product${productLinks.length !== 1 ? 's' : ''}!`,
        });
        setCustomerRaw('');
        setProductLinksRaw('');
        setFormData(prev => ({ senderEmail: prev.senderEmail }));
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
      <div className="text-center mb-8">
        <p className="text-gray-600">Send a personalised "You might also like" product grid</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Sender Selection */}
        <SenderEmailButtons
          accounts={accounts}
          selectedEmail={formData.senderEmail}
          onSelect={(email) => setFormData(prev => ({ ...prev, senderEmail: email }))}
          disabled={isLoading}
        />

        {/* Customer Block */}
        <div>
          <div className="flex justify-between mb-2">
            <label htmlFor="customerRaw" className="block text-sm font-medium text-gray-700">
              Customer Info *
            </label>
            <span className="text-xs text-gray-400">Line 1: Email | Line 2: Name (optional)</span>
          </div>
          <textarea
            id="customerRaw"
            value={customerRaw}
            onChange={(e) => setCustomerRaw(e.target.value)}
            required
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F5970C] focus:border-transparent transition duration-200 ease-in-out text-gray-900 bg-white resize-y font-mono text-sm leading-relaxed"
            placeholder={"customer@example.com\nJohn Doe"}
            disabled={isLoading}
          />
        </div>

        {/* Product Links */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="productLinksRaw" className="block text-sm font-medium text-gray-700">
              Product Links *
              <span className="ml-2 text-[10px] font-bold bg-[#090A28] text-white px-2 py-0.5 rounded-full">
                {productCount} product{productCount !== 1 ? 's' : ''}
              </span>
            </label>
            <span className="text-xs text-gray-400">One URL per line — images auto-fetched</span>
          </div>
          <textarea
            id="productLinksRaw"
            value={productLinksRaw}
            onChange={(e) => setProductLinksRaw(e.target.value)}
            required
            rows={8}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F5970C] focus:border-transparent transition duration-200 ease-in-out text-gray-900 bg-white resize-y font-mono text-sm leading-relaxed"
            placeholder={"https://deeldepot.com/products/item-one\nhttps://deeldepot.com/products/item-two\nhttps://deeldepot.com/products/item-three\nhttps://deeldepot.com/products/item-four\nhttps://deeldepot.com/products/item-five\nhttps://deeldepot.com/products/item-six"}
            disabled={isLoading}
          />
          <p className="mt-1 text-xs text-gray-500">
            Paste as many links as you want — the email grid adapts automatically. Product images and names are scraped from each page.
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading || productCount === 0}
          className={`w-full py-3 px-4 rounded-lg font-bold transition duration-200 ease-in-out ${
            isLoading || productCount === 0
              ? 'bg-gray-400 cursor-not-allowed text-white'
              : 'bg-[#F5970C] hover:bg-[#e08800] text-[#090A28] focus:ring-2 focus:ring-[#F5970C] focus:ring-offset-2'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Fetching images &amp; sending…
            </div>
          ) : `✨ Send ${productCount > 0 ? productCount : ''} Product Recommendation${productCount !== 1 ? 's' : ''}`}
        </button>
      </form>

      {/* Feedback */}
      {message.content && (
        <div className={`mt-6 p-4 rounded-lg flex items-start gap-3 ${
          message.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <span className="text-lg">{message.type === 'success' ? '✅' : '⚠️'}</span>
          <span className="font-medium text-sm">{message.content}</span>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <h3 className="text-sm font-semibold text-amber-800 mb-2">✨ How it works</h3>
        <ul className="text-sm text-amber-700 space-y-1">
          <li>• Enter the customer&apos;s email (and optional name) in the top block</li>
          <li>• Paste one product URL per line — minimum 1, no maximum</li>
          <li>• The system scrapes the product image &amp; title from each link automatically</li>
          <li>• A dynamic grid email is sent with a <strong>Get Deal</strong> button per product</li>
          <li>• Great for: abandoned-cart follow-ups, upsells, or curated picks</li>
        </ul>
      </div>
    </div>
  );
}
