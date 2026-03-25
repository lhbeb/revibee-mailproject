'use client';

import { useState, useEffect } from 'react';

export default function RecoveryEmail2Form() {
  const [formData, setFormData] = useState({
    senderEmail: ''
  });
  const [rawData, setRawData] = useState('');
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });

  // Fetch available email accounts on mount
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetch('/api/get-accounts');
        if (response.ok) {
          const data = await response.json();
          setAccounts(data.accounts || []);
        }
      } catch (error) {
        console.error('Failed to fetch email accounts:', error);
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
      const lines = rawData.split('\n').map(line => line.trim()).filter(line => line);
      const productLine = lines[0] || '';
      const email = lines[1] || '';
      const name = lines[2] || '';
      const link = lines[4] || '';

      const payload = {
        customerEmail: email,
        customerName: name,
        productName: productLine,
        checkoutUrl: link,
        productLink: link,
        ...formData
      };

      const response = await fetch('/api/send-recovery-email-2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', content: 'Recovery email 2 sent successfully! 💚' });
        setRawData('');
        setFormData({ senderEmail: formData.senderEmail });
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
        <p className="text-gray-600">Abandoned Cart Recovery (Friendly)</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sender Email Selection */}
        <div>
          <label htmlFor="senderEmail" className="block text-sm font-medium text-gray-700 mb-2">
            Send From (Optional)
          </label>
          <select
            id="senderEmail"
            name="senderEmail"
            value={formData.senderEmail}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent transition duration-200 ease-in-out text-gray-900 bg-white"
            disabled={isLoading}
          >
            <option value="">Random (Auto-Rotate)</option>
            {accounts.map((account, index) => (
              <option key={index} value={account.user}>
                {account.user}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">Leave as "Random" to let the system choose.</p>
        </div>

        {/* Order Details Paste Block */}
        <div>
          <div className="flex justify-between mb-2">
            <label htmlFor="rawData" className="block text-sm font-medium text-gray-700">
              Order Details (Paste Block) *
            </label>
            <span className="text-xs text-gray-400">Line 1: Product | Line 2: Email | Line 5: Link</span>
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
          disabled={isLoading}
          className={`w-full py-3 px-4 rounded-lg font-medium text-white transition duration-200 ease-in-out ${isLoading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
            }`}
        >
          {isLoading ? 'Sending...' : '💚 Send Recovery Email 2'}
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
