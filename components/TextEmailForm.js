'use client';

import { useState } from 'react';
import SenderEmailButtons from './SenderEmailButtons';
import { useWebsiteAccounts } from '../src/lib/useWebsiteAccounts';

export default function TextEmailForm({ activeWebsite = 'casoodo' }) {
  const { accounts, selectedEmail, setSelectedEmail, isLoadingAccounts } = useWebsiteAccounts(activeWebsite);

  const [formData, setFormData] = useState({
    recipients: '',
    subject: '',
    body: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });

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
        body: JSON.stringify({
          ...formData,
          senderEmail: selectedEmail,
          website: activeWebsite,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', content: `Text email sent successfully via ${activeWebsite.toUpperCase()}! ✉️` });
        setFormData(prev => ({
          ...prev,
          subject: '',
          body: '',
        }));
      } else {
        setMessage({
          type: 'error',
          content: result.error || 'Failed to send text email.',
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        content: 'Network error. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <p className="text-gray-600 font-medium">
          Plain Custom Email — Sending as <span className="font-bold text-[#003099] uppercase">{activeWebsite}</span>
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
          <label htmlFor="recipients" className="block text-sm font-medium text-gray-700 mb-2">
            Recipient Emails (Comma, semicolon, or newline separated) *
          </label>
          <textarea
            id="recipients"
            name="recipients"
            value={formData.recipients}
            onChange={handleInputChange}
            required
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFFBB6] focus:border-transparent transition duration-200 ease-in-out text-gray-900 bg-white"
            placeholder="customer1@example.com, customer2@example.com"
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
            Subject *
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFFBB6] focus:border-transparent transition duration-200 ease-in-out text-gray-900 bg-white"
            placeholder="Important update about your account"
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-2">
            Message Body *
          </label>
          <textarea
            id="body"
            name="body"
            value={formData.body}
            onChange={handleInputChange}
            required
            rows={8}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFFBB6] focus:border-transparent transition duration-200 ease-in-out text-gray-900 bg-white leading-relaxed"
            placeholder="Write your email message here..."
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || isLoadingAccounts || !selectedEmail}
          className={`w-full py-3 px-4 rounded-lg font-bold text-[#003099] transition duration-200 ease-in-out ${
            isLoading || !selectedEmail
              ? 'bg-gray-400 cursor-not-allowed text-white'
              : 'bg-[#FFFBB6] hover:bg-[#f3ee8f] focus:ring-2 focus:ring-[#FFFBB6] focus:ring-offset-2'
          }`}
        >
          {isLoading ? 'Sending...' : `✉️ Send Text Email (${activeWebsite.toUpperCase()})`}
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
