'use client';

import { useState, useEffect } from 'react';

export function useWebsiteAccounts(activeWebsite = 'casoodo') {
  const [accounts, setAccounts] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState('');
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchAccounts = async () => {
      setIsLoadingAccounts(true);
      try {
        const res = await fetch(`/api/get-accounts?website=${encodeURIComponent(activeWebsite || '')}`);
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) {
            const nextAccounts = data.accounts || [];
            setAccounts(nextAccounts);
            setSelectedEmail(nextAccounts[0]?.user || '');
          }
        }
      } catch (err) {
        console.error('Failed to fetch website accounts:', err);
      } finally {
        if (!cancelled) setIsLoadingAccounts(false);
      }
    };

    fetchAccounts();
    return () => {
      cancelled = true;
    };
  }, [activeWebsite]);

  return {
    accounts,
    selectedEmail,
    setSelectedEmail,
    isLoadingAccounts,
  };
}
