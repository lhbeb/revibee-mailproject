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
import TextEmailForm from '../../components/TextEmailForm';
import SentEmailsLog from '../../components/SentEmailsLog';
import LoginForm from '../../components/LoginForm';

const WEBSITES_CONFIG = [
  {
    id: 'casoodo',
    name: 'Casoodo',
    domain: 'casoodo.com',
    icon: '⚡',
    themeBg: '#003099',
    accent: '#FFFBB6',
    badgeClass: 'bg-[#003099] text-[#FFFBB6]',
  },
  {
    id: 'bricoc',
    name: 'Bricoc',
    domain: 'bricoc.com',
    icon: '🛠️',
    themeBg: '#233F31',
    accent: '#F59E0B',
    badgeClass: 'bg-[#233F31] text-[#FAF6EB]',
  },
];

export default function Home() {
  const [activeWebsite, setActiveWebsite] = useState('casoodo');
  const [activeTab, setActiveTab] = useState('tracking');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('mailproject_website');
    if (saved && (saved === 'casoodo' || saved === 'bricoc')) {
      setActiveWebsite(saved);
    }
    checkAuthStatus();
  }, []);

  const handleSelectWebsite = (siteId: string) => {
    setActiveWebsite(siteId);
    localStorage.setItem('mailproject_website', siteId);
  };

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

  const currentBrand = WEBSITES_CONFIG.find(w => w.id === activeWebsite) || WEBSITES_CONFIG[0];

  const NAV_GROUPS = [
    {
      label: 'Transactional',
      items: [
        { id: 'tracking',     icon: '📦', label: 'Shipping Confirmation',    sub: `Send tracking via ${currentBrand.name}` },
        { id: 'confirmation', icon: '✅', label: 'Order Confirmation',        sub: `Confirm order on ${currentBrand.name}` },
        { id: 'pickup',       icon: '🏪', label: 'Local Pickup',              sub: `Pickup details for ${currentBrand.name}` },
        { id: 'refund',       icon: '💰', label: 'Refund Email',              sub: `Notify refund from ${currentBrand.name}` },
        { id: 'text',         icon: '✉️', label: 'Text Email',                sub: `Custom message from ${currentBrand.name}` },
      ],
    },
    {
      label: 'Recovery',
      items: [
        { id: 'recovery1', icon: '🛒', label: 'Recovery — Urgent',     sub: 'Scarcity cart nudge' },
        { id: 'recovery2', icon: '💚', label: 'Recovery — Friendly',   sub: 'Gentle cart reminder' },
        { id: 'recovery3', icon: '⏰', label: 'Recovery — Last Chance', sub: 'Expiring reservation' },
      ],
    },
    {
      label: 'Marketing',
      items: [
        { id: 'about',      icon: '🏪', label: `About ${currentBrand.name}`, sub: `${currentBrand.name} brand story` },
        { id: 'recommend',  icon: '✨', label: 'Product Recommendations',  sub: `Recommend ${currentBrand.name} items` },
      ],
    },
  ];

  const ALL_ITEMS = NAV_GROUPS.flatMap(g => g.items);
  const activeItem = ALL_ITEMS.find(i => i.id === activeTab) || ALL_ITEMS[0];

  const renderActiveForm = () => {
    switch (activeTab) {
      case 'tracking':
        return <ShippingEmailForm key={activeWebsite} activeWebsite={activeWebsite} />;
      case 'confirmation':
        return <OrderConfirmationForm key={activeWebsite} activeWebsite={activeWebsite} />;
      case 'pickup':
        return <LocalPickupForm key={activeWebsite} activeWebsite={activeWebsite} />;
      case 'refund':
        return <RefundEmailForm key={activeWebsite} activeWebsite={activeWebsite} />;
      case 'text':
        return <TextEmailForm key={activeWebsite} activeWebsite={activeWebsite} />;
      case 'recovery1':
        return <RecoveryEmail1Form key={activeWebsite} activeWebsite={activeWebsite} />;
      case 'recovery2':
        return <RecoveryEmail2Form key={activeWebsite} activeWebsite={activeWebsite} />;
      case 'recovery3':
        return <RecoveryEmail3Form key={activeWebsite} activeWebsite={activeWebsite} />;
      case 'about':
        return <AboutHappyDeelForm key={activeWebsite} activeWebsite={activeWebsite} />;
      case 'recommend':
        return <ProductRecommendationsForm key={activeWebsite} activeWebsite={activeWebsite} />;
      default:
        return <ShippingEmailForm key={activeWebsite} activeWebsite={activeWebsite} />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070B17] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-amber-300 border-t-transparent mx-auto" />
          <p className="mt-4 text-white/60 text-sm font-medium">Loading Email Hub...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-white tracking-tight">MailProject Multi-Hub</h1>
            <p className="text-white/50 text-sm mt-1">Multi-Website Email Dispatch Center</p>
          </div>
          <LoginForm onLoginSuccess={(u: any) => { setIsAuthenticated(true); setUser(u); }} />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F1F5F9] flex flex-col">

      {/* ── Top Header ── */}
      <header className="bg-[#0F172A] border-b border-slate-800 text-white shrink-0 sticky top-0 z-30 shadow-md">
        <div className="max-w-[1440px] mx-auto px-6 py-3.5 flex flex-wrap justify-between items-center gap-4">
          
          {/* Brand and Tag */}
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-black text-base shadow-sm">
              ✉️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight text-white">MailProject</span>
                <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-slate-700">Multi-Site Hub</span>
              </div>
              <p className="text-slate-400 text-xs">Dispatching for multiple e-commerce websites</p>
            </div>
          </div>

          {/* Website Switcher Component */}
          <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-700 shadow-inner">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2.5 hidden md:inline">
              Selected Store:
            </span>
            {WEBSITES_CONFIG.map((site) => {
              const isSelected = activeWebsite === site.id;
              return (
                <button
                  key={site.id}
                  onClick={() => handleSelectWebsite(site.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                    isSelected
                      ? `${site.badgeClass} shadow-md scale-100 ring-2 ring-white/20`
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span>{site.icon}</span>
                  <span>{site.name}</span>
                  <span className="text-[10px] opacity-70 font-normal">({site.domain})</span>
                </button>
              );
            })}
          </div>

          {/* User and Sign out */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
              <div className="w-6 h-6 rounded-full bg-amber-300 flex items-center justify-center text-slate-900 text-xs font-black">
                {(user || 'A').charAt(0).toUpperCase()}
              </div>
              <span className="text-white text-xs font-medium hidden sm:block">{user || 'Admin'}</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-all border border-transparent hover:border-slate-700"
            >
              Sign out
            </button>
          </div>

        </div>
      </header>

      {/* ── Main Body ── */}
      <div className="flex-1 max-w-[1440px] mx-auto w-full px-6 py-6 flex flex-col gap-6">

        {/* ── Active Website Banner ── */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${currentBrand.badgeClass}`}>
              {currentBrand.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900">
                  Currently sending as <span className="underline decoration-2 underline-offset-2">{currentBrand.name}</span>
                </h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
                  https://www.{currentBrand.domain}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                All templates, links, logos, and sender email accounts are scoped to <strong>{currentBrand.name}</strong>.
              </p>
            </div>
          </div>
          <div className="text-xs text-slate-400">
            Use the top selector to switch stores anytime.
          </div>
        </div>

        {/* ── Top Panel: Sidebar + Content ── */}
        <div className="flex gap-0 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden" style={{ minHeight: '640px' }}>

          {/* Left Sidebar */}
          <aside className="w-64 shrink-0 bg-slate-900 flex flex-col border-r border-slate-800">
            <div className="px-5 pt-6 pb-3 border-b border-slate-800/80">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.15em]">Email Workflows</p>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
              {NAV_GROUPS.map(group => (
                <div key={group.label}>
                  <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest px-3 mb-1.5">{group.label}</p>
                  <ul className="space-y-0.5">
                    {group.items.map(item => {
                      const isActive = activeTab === item.id;
                      return (
                        <li key={item.id}>
                          <button
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group
                              ${isActive
                                ? 'bg-amber-300 text-slate-900 font-bold shadow-sm'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                              }`}
                          >
                            <span className="text-lg shrink-0">{item.icon}</span>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold leading-tight truncate">{item.label}</p>
                              <p className={`text-[10px] leading-tight mt-0.5 truncate ${isActive ? 'text-slate-800/70' : 'text-slate-500'}`}>{item.sub}</p>
                            </div>
                            {isActive && (
                              <span className="ml-auto shrink-0 w-1.5 h-1.5 rounded-full bg-slate-900/60" />
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
          <div className="flex-1 flex flex-col min-w-0 bg-white">
            {/* Panel Header */}
            <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between gap-4 shrink-0 bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl shrink-0 border border-slate-200">
                  {activeItem.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900 leading-tight">{activeItem.label}</h2>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${currentBrand.badgeClass}`}>
                      {currentBrand.name}
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs mt-0.5">{activeItem.sub}</p>
                </div>
              </div>
            </div>

            {/* Panel Body */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
              {renderActiveForm()}
            </div>
          </div>
        </div>

        {/* ── Bottom Panel: Sent Emails History ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-lg border border-slate-200">📋</div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Sent Emails Log & Audit</h2>
                <p className="text-slate-400 text-xs">Tracking all outbound emails dispatched across websites</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <SentEmailsLog activeWebsite={activeWebsite} />
          </div>
        </div>

      </div>
    </main>
  );
}
