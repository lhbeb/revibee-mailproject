'use client';

import { useState, useEffect } from 'react';
import SenderEmailButtons from './SenderEmailButtons';

export default function RecoveryEmail1Form() {
  const [formData, setFormData] = useState({
    senderEmail: '',
    actualCheckoutLink: ''
  });
  const [rawData, setRawData] = useState('');
  const [accounts, setAccounts] = useState([]);
  const [accountsError, setAccountsError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });

  // Fetch available email accounts on mount
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetch('/api/get-accounts');
        if (!response.ok) {
          throw new Error(`Failed to load sender accounts (${response.status})`);
        }

        const data = await response.json();
        const nextAccounts = data.accounts || [];
        setAccounts(nextAccounts);
        setAccountsError('');

        if (nextAccounts.length) {
          setFormData(prev => ({
            ...prev,
            senderEmail: prev.senderEmail || nextAccounts[0].user
          }));
        } else {
          setAccountsError('No sender email accounts are configured.');
        }
      } catch (error) {
        console.error('Failed to fetch email accounts:', error);
        setAccounts([]);
        setAccountsError('Could not load sender accounts. Make sure the app server is running, then refresh.');
      }
    };
    fetchAccounts();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', content: '' });

    try {
      if (!accounts.length) {
        setMessage({
          type: 'error',
          content: accountsError || 'No sender accounts are available right now.'
        });
        return;
      }

      const lines = rawData.split('\n').map(line => line.trim()).filter(line => line);
      const productLine = lines[0] || '';
      const email = lines[1] || '';
      const name = lines[2] || '';
      const customerAddress = lines[3] || '';
      const productLink = lines[4] || '';
      const actualCheckoutLink = formData.actualCheckoutLink.trim();

      const payload = {
        customerEmail: email,
        customerName: name,
        customerAddress,
        productName: productLine,
        checkoutUrl: actualCheckoutLink || productLink,
        productLink,
        actualCheckoutLink,
        ...formData
      };

      const response = await fetch('/api/send-abandoned-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', content: 'Recovery email 1 sent successfully! 🛒' });
        setRawData('');
        setFormData({
          senderEmail: formData.senderEmail,
          actualCheckoutLink: ''
        });
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

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <p className="text-gray-600">Abandoned Cart Recovery (Urgent)</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sender Email Selection */}
        <SenderEmailButtons
          accounts={accounts}
          selectedEmail={formData.senderEmail}
          onSelect={(email) => setFormData(prev => ({ ...prev, senderEmail: email }))}
          disabled={isLoading}
        />
        {accountsError && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {accountsError}
          </div>
        )}

        <div>
          <label htmlFor="actualCheckoutLink" className="block text-sm font-medium text-gray-700 mb-2">
            External Checkout Link (Optional)
          </label>
          <input
            id="actualCheckoutLink"
            name="actualCheckoutLink"
            type="url"
            value={formData.actualCheckoutLink}
            onChange={handleInputChange}
            placeholder="https://checkout.example.com/..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent transition duration-200 ease-in-out text-gray-900 bg-white"
            disabled={isLoading}
          />
          <p className="mt-1 text-xs text-gray-500">If blank, the product link from the pasted block will be used as the checkout link.</p>
        </div>

        {/* Order Details Paste Block */}
        <div>
          <div className="flex justify-between mb-2">
            <label htmlFor="rawData" className="block text-sm font-medium text-gray-700">
              Order Details (Paste Block) *
            </label>
            <span className="text-xs text-gray-400">Line 1: Product | Line 2: Email | Line 3: Name | Line 4: Address | Line 5: Link</span>
          </div>
          <textarea
            id="rawData"
            name="rawData"
            value={rawData}
            onChange={(e) => setRawData(e.target.value)}
            required
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent transition duration-200 ease-in-out text-gray-900 bg-white resize-y font-mono text-sm leading-relaxed"
            placeholder="Product Name : $Price&#10;customer@example.com&#10;John Doe&#10;123 Address St, City, ST 12345&#10;https://deeldepot.com/product/..."
            disabled={isLoading}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !accounts.length}
          className={`w-full py-3 px-4 rounded-lg font-medium text-white transition duration-200 ease-in-out ${isLoading
            ? 'bg-gray-400 cursor-not-allowed'
            : !accounts.length
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-orange-600 hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2'
            }`}
        >
          {isLoading ? 'Sending...' : '🛒 Send Recovery Email 1'}
        </button>
      </form>

      {/* Success/Error Messages */}
      {message.content && (
        <div className={`mt-6 p-4 rounded-lg ${message.type === 'success'
          ? 'bg-green-50 border border-green-200 text-green-800'
          : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
          {message.content}
        </div>
      )}
    </div>
  );
}
