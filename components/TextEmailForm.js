'use client';

import { useState, useEffect } from 'react';
import SenderEmailButtons from './SenderEmailButtons';

export default function TextEmailForm() {
  const [formData, setFormData] = useState({
    senderEmail: '',
    recipients: '',
    subject: '',
    body: '',
  });
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', content: '' });

    try {
      const response = await fetch('/api/send-text-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', content: 'Text email sent successfully!' });
        setFormData(prev => ({
          ...prev,
          recipients: '',
          subject: '',
          body: '',
        }));
      } else {
        setMessage({ type: 'error', content: result.error || 'Failed to send text email.' });
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
        <p className="text-gray-600">Send a plain custom email without a template</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <SenderEmailButtons
          accounts={accounts}
          selectedEmail={formData.senderEmail}
          onSelect={(email) => setFormData(prev => ({ ...prev, senderEmail: email }))}
          disabled={isLoading}
        />

        <div>
          <label htmlFor="recipients" className="block text-sm font-medium text-gray-700 mb-2">
            Recipients *
          </label>
          <input
            id="recipients"
            name="recipients"
            type="text"
            value={formData.recipients}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F5970C] focus:border-transparent transition duration-200 ease-in-out text-gray-900 bg-white"
            placeholder="customer@example.com, manager@example.com"
            disabled={isLoading}
          />
          <p className="mt-1 text-xs text-gray-500">Separate multiple email addresses with commas. The first address is used as `To` and the rest are sent as `CC`.</p>
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
            Subject *
          </label>
          <input
            id="subject"
            name="subject"
            type="text"
            value={formData.subject}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F5970C] focus:border-transparent transition duration-200 ease-in-out text-gray-900 bg-white"
            placeholder="Your custom subject"
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-2">
            Body *
          </label>
          <textarea
            id="body"
            name="body"
            value={formData.body}
            onChange={handleInputChange}
            required
            rows={12}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F5970C] focus:border-transparent transition duration-200 ease-in-out text-gray-900 bg-white resize-y font-mono text-sm leading-relaxed"
            placeholder={"Hello,\n\nThis is a plain text email.\n\nBest regards,"}
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 px-4 rounded-lg font-bold transition duration-200 ease-in-out ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed text-white'
              : 'bg-[#F5970C] hover:bg-[#e08800] text-[#090A28] focus:ring-2 focus:ring-[#F5970C] focus:ring-offset-2'
          }`}
        >
          {isLoading ? 'Sending…' : '✉️ Send Text Email'}
        </button>
      </form>

      {message.content && (
        <div className={`mt-6 p-4 rounded-lg ${
          message.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <span className="font-medium">{message.content}</span>
        </div>
      )}
    </div>
  );
}
