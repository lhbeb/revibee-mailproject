'use client';

import { useState, useMemo } from 'react';
import SenderEmailButtons from './SenderEmailButtons';
import { useWebsiteAccounts } from '../src/lib/useWebsiteAccounts';

export default function AboutHappyDeelForm({ activeWebsite = 'casoodo' }) {
    const { accounts, selectedEmail, setSelectedEmail, isLoadingAccounts } = useWebsiteAccounts(activeWebsite);

    const [emailList, setEmailList] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [progress, setProgress] = useState({ sent: 0, total: 0, current: '' });
    const [errors, setErrors] = useState([]);

    const parsedEmails = useMemo(() => {
        return emailList
            .split('\n')
            .map(email => email.trim())
            .filter(email => email.length > 0)
            .filter(email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
    }, [emailList]);

    const emailCount = parsedEmails.length;
    const isOverLimit = emailCount > 5000;

    const randomDelay = () => {
        const min = 2000;
        const max = 5000;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const sendSingleEmail = async (email) => {
        const response = await fetch('/api/send-about-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                customerEmail: email,
                senderEmail: selectedEmail,
                website: activeWebsite,
            }),
        });

        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.error || 'Failed to send email');
        }

        return response.json();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (emailCount === 0) {
            setMessage('Please enter at least one valid email address');
            setMessageType('error');
            return;
        }

        if (isOverLimit) {
            setMessage('Maximum limit is 5000 emails per batch');
            setMessageType('error');
            return;
        }

        setIsLoading(true);
        setMessage('');
        setErrors([]);
        setProgress({ sent: 0, total: emailCount, current: '' });

        let successCount = 0;
        const failedEmails = [];

        for (let i = 0; i < parsedEmails.length; i++) {
            const currentEmail = parsedEmails[i];
            setProgress({ sent: successCount, total: emailCount, current: currentEmail });

            try {
                await sendSingleEmail(currentEmail);
                successCount++;
                setProgress({ sent: successCount, total: emailCount, current: currentEmail });
            } catch (error) {
                console.error(`Failed to send to ${currentEmail}:`, error);
                failedEmails.push({ email: currentEmail, error: error.message });
                setErrors([...failedEmails]);
            }

            if (i < parsedEmails.length - 1) {
                const delay = randomDelay();
                await sleep(delay);
            }
        }

        setIsLoading(false);
        setProgress({ sent: successCount, total: emailCount, current: '' });

        if (failedEmails.length === 0) {
            setMessage(`All ${successCount} emails sent successfully via ${activeWebsite.toUpperCase()}! 🎉`);
            setMessageType('success');
            setEmailList('');
        } else if (successCount > 0) {
            setMessage(`Sent ${successCount} emails. ${failedEmails.length} failed.`);
            setMessageType('warning');
        } else {
            setMessage('Failed to send any emails. Please check the errors below.');
            setMessageType('error');
        }
    };

    return (
        <div className="w-full">
            <div className="text-center mb-6">
                <p className="text-gray-600 font-medium">
                    Brand Story Campaign — Sending as <span className="font-bold text-[#003099] uppercase">{activeWebsite}</span>
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
                    <div className="flex justify-between items-center mb-2">
                        <label htmlFor="emailList" className="block text-sm font-medium text-gray-700">
                            Recipient Email Addresses *
                        </label>
                        <span className={`text-xs ${isOverLimit ? 'text-red-600 font-bold' : 'text-gray-400'}`}>
                            {emailCount} / 5000 emails
                        </span>
                    </div>
                    <textarea
                        id="emailList"
                        value={emailList}
                        onChange={(e) => setEmailList(e.target.value)}
                        required
                        disabled={isLoading}
                        rows={8}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition duration-200 ease-in-out text-gray-900 bg-white resize-y font-mono text-sm leading-relaxed ${
                            isOverLimit
                                ? 'border-red-500 focus:ring-red-200'
                                : 'border-gray-300 focus:ring-[#FFFBB6]'
                        }`}
                        placeholder="customer1@example.com&#10;customer2@example.com&#10;customer3@example.com"
                    />
                </div>

                {isLoading && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex justify-between text-sm text-blue-800 mb-2 font-semibold">
                            <span>Sending Campaign...</span>
                            <span>{progress.sent} / {progress.total}</span>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-3 overflow-hidden">
                            <div
                                className="bg-[#003099] h-3 rounded-full transition-all duration-300 ease-out"
                                style={{ width: `${(progress.sent / progress.total) * 100}%` }}
                            />
                        </div>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading || isLoadingAccounts || isOverLimit || emailCount === 0 || !selectedEmail}
                    className={`w-full py-3 px-4 rounded-lg font-bold text-[#003099] transition duration-200 ease-in-out ${
                        isLoading || isOverLimit || emailCount === 0 || !selectedEmail
                            ? 'bg-gray-400 cursor-not-allowed text-white'
                            : 'bg-[#FFFBB6] hover:bg-[#f3ee8f] focus:ring-2 focus:ring-[#FFFBB6] focus:ring-offset-2'
                    }`}
                >
                    {isLoading ? 'Sending Campaign...' : `🚀 Send About ${activeWebsite.toUpperCase()} Campaign (${emailCount})`}
                </button>
            </form>

            {message && (
                <div className={`mt-6 p-4 rounded-lg ${
                    messageType === 'success'
                        ? 'bg-green-50 border border-green-200 text-green-800'
                        : messageType === 'warning'
                            ? 'bg-yellow-50 border border-yellow-200 text-yellow-800'
                            : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                    <span className="font-medium">{message}</span>
                </div>
            )}
        </div>
    );
}
