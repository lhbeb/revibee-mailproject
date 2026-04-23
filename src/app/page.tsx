'use client';

import { useState, useEffect } from 'react';
import ShippingEmailForm from '../../components/ShippingEmailForm';
import OrderConfirmationForm from '../../components/OrderConfirmationForm';
import LocalPickupForm from '../../components/LocalPickupForm';
import RefundEmailForm from '../../components/RefundEmailForm';
import RecoveryEmail1Form from '../../components/RecoveryEmail1Form';
import RecoveryEmail2Form from '../../components/RecoveryEmail2Form';
import RecoveryEmail3Form from '../../components/RecoveryEmail3Form';
import AboutHappyDeelForm from '../../components/AboutHappyDeelForm';
import ProductRecommendationsForm from '../../components/ProductRecommendationsForm';
import SentEmailsLog from '../../components/SentEmailsLog';
import LoginForm from '../../components/LoginForm';

const NAV_GROUPS = [
  {
    label: 'Transactional',
    items: [
      { id: 'tracking',     icon: '📦', label: 'Shipping Confirmation',    sub: 'Send tracking details' },
      { id: 'confirmation', icon: '✅', label: 'Order Confirmation',        sub: 'Confirm order placement' },
      { id: 'pickup',       icon: '🏪', label: 'Local Pickup',              sub: 'Ready for warehouse pickup' },
      { id: 'refund',       icon: '💰', label: 'Refund Email',              sub: 'Notify about refunds' },
    ],
  },
  {
    label: 'Recovery',
    items: [
      { id: 'recovery1', icon: '🛒', label: 'Recovery — Urgent',     sub: 'Scarcity-driven nudge' },
      { id: 'recovery2', icon: '💚', label: 'Recovery — Friendly',   sub: 'Gentle reminder' },
      { id: 'recovery3', icon: '⏰', label: 'Recovery — Last Chance', sub: 'Final push email' },
    ],
  },
  {
    label: 'Marketing',
    items: [
      { id: 'about',        icon: '🏪', label: 'About DeelDepot',          sub: 'Brand story email' },
      { id: 'recommend',   icon: '✨', label: 'Product Recommendations',  sub: 'You might also like' },
    ],
  },
];

const ALL_ITEMS = NAV_GROUPS.flatMap(g => g.items);

const FORM_MAP: Record<string, React.ReactNode> = {
  tracking:     <ShippingEmailForm />,
  confirmation: <OrderConfirmationForm />,
  pickup:       <LocalPickupForm />,
  refund:       <RefundEmailForm />,
  recovery1:    <RecoveryEmail1Form />,
  recovery2:    <RecoveryEmail2Form />,
  recovery3:    <RecoveryEmail3Form />,
  about:        <AboutHappyDeelForm />,
  recommend:    <ProductRecommendationsForm />,
};

export default function Home() {
  const [activeTab, setActiveTab] = useState('tracking');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => { checkAuthStatus(); }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth-check');
      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(true);
        setUser(data.user);
      } else {
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    setIsAuthenticated(false);
    setUser(null);
  };

  const activeItem = ALL_ITEMS.find(i => i.id === activeTab)!;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#090A28] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-[#F5970C] border-t-transparent mx-auto" />
          <p className="mt-4 text-white/60 text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#090A28] flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-white tracking-tight">MailProject</h1>
            <p className="text-white/40 text-sm mt-1">Admin Dashboard</p>
          </div>
          <LoginForm onLoginSuccess={(u: any) => { setIsAuthenticated(true); setUser(u); }} />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 flex flex-col">

      {/* ── Top Header ── */}
      <header className="bg-[#090A28] border-b border-white/10 shrink-0">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-white font-black text-xl tracking-tight">MailProject</span>
            <div className="w-px h-5 bg-white/20" />
            <span className="text-white/50 text-xs uppercase tracking-widest font-semibold">Mail Center</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg">
              <div className="w-6 h-6 rounded-full bg-[#F5970C] flex items-center justify-center text-[#090A28] text-xs font-black">
                {(user || 'A').charAt(0).toUpperCase()}
              </div>
              <span className="text-white text-sm font-medium hidden sm:block">{user || 'Admin'}</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-white/60 hover:text-white text-sm px-3 py-1.5 rounded-lg hover:bg-white/10 transition-all"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Body ── */}
      <div className="flex-1 max-w-[1400px] mx-auto w-full px-6 py-8 flex flex-col gap-6">

        {/* ── Top Panel: Sidebar + Content ── */}
        <div className="flex gap-0 bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden" style={{ minHeight: '640px' }}>

          {/* Left Sidebar */}
          <aside className="w-64 shrink-0 bg-[#090A28] flex flex-col">
            <div className="px-5 pt-6 pb-4">
              <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.15em]">Email Templates</p>
            </div>
            <nav className="flex-1 px-3 pb-6 space-y-5 overflow-y-auto">
              {NAV_GROUPS.map(group => (
                <div key={group.label}>
                  <p className="text-white/20 text-[9px] font-bold uppercase tracking-widest px-3 mb-1.5">{group.label}</p>
                  <ul className="space-y-0.5">
                    {group.items.map(item => {
                      const isActive = activeTab === item.id;
                      return (
                        <li key={item.id}>
                          <button
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group
                              ${isActive
                                ? 'bg-[#F5970C] text-[#090A28]'
                                : 'text-white/60 hover:text-white hover:bg-white/10'
                              }`}
                          >
                            <span className="text-lg shrink-0">{item.icon}</span>
                            <div className="min-w-0">
                              <p className={`text-sm font-semibold leading-tight truncate ${isActive ? 'text-[#090A28]' : ''}`}>{item.label}</p>
                              <p className={`text-[10px] leading-tight mt-0.5 truncate ${isActive ? 'text-[#090A28]/60' : 'text-white/30'}`}>{item.sub}</p>
                            </div>
                            {isActive && (
                              <span className="ml-auto shrink-0 w-1.5 h-1.5 rounded-full bg-[#090A28]/50" />
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>
          </aside>

          {/* Right Content Panel */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Panel Header */}
            <div className="px-8 py-5 border-b border-slate-100 flex items-center gap-4 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl shrink-0">
                {activeItem.icon}
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#090A28] leading-tight">{activeItem.label}</h2>
                <p className="text-slate-400 text-xs mt-0.5">{activeItem.sub}</p>
              </div>
            </div>

            {/* Panel Body — scrollable form area */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
              {FORM_MAP[activeTab]}
            </div>
          </div>
        </div>

        {/* ── Bottom Panel: Sent Emails History ── */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-lg">📋</div>
            <div>
              <h2 className="text-base font-bold text-[#090A28]">Sent Emails History</h2>
              <p className="text-slate-400 text-xs">All emails sent across every template</p>
            </div>
          </div>
          <div className="p-6">
            <SentEmailsLog />
          </div>
        </div>

      </div>
    </main>
  );
}
