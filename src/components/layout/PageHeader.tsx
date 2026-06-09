'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth.store';
import styles from './PageHeader.module.css';

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const ChatIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
  </svg>
);

export function PageHeader({ dict }: { dict: any }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const currentLocale = pathname.split('/')[1] || 'ru';
  const currentPage = pathname.split('/').filter(Boolean).pop() || 'Дашборд';
  
  // Basic route translation for UI
  const formattedPage = currentPage === 'dashboard' ? dict.titles.dashboard : 
                        currentPage === 'transfer' ? dict.titles.transfer :
                        currentPage === 'deals' ? dict.titles.deals :
                        (currentPage === 'payments' || currentPage === 'payouts') ? dict.titles.payouts :
                        currentPage === 'referrals' ? dict.titles.referrals :
                        currentPage === 'support' ? dict.titles.support :
                        currentPage === 'knowledge' ? dict.titles.knowledge :
                        currentPage === 'settings' ? dict.titles.settings :
                        currentPage.charAt(0).toUpperCase() + currentPage.slice(1);

  if (pathname.includes('/deals') || pathname.includes('/support')) {
    if (pathname.endsWith('/deals') || pathname.endsWith('/support')) {
      // allow
    } else {
      return null;
    }
  }

  if (pathname.includes('/referrals') || pathname.includes('/knowledge')) {
    return null;
  }

  const isTransferPage = pathname.includes('/transfer');
  const isPayoutsPage = pathname.includes('/payouts') || pathname.includes('/payments');
  const isAdmin = user?.role === 'admin';

  let primaryButtonText = dict.titles.transfer;
  if (isPayoutsPage) {
    primaryButtonText = dict.request_payout;
  }

  return (
    <div className={styles.pageHeader}>
      <div>
        <h1 className={styles.title}>{formattedPage}</h1>
        {isTransferPage && (
          <p style={{ color: '#71717a', fontSize: '14px', margin: '4px 0 0 0', fontFamily: 'var(--font-inter)' }}>
            {dict.transfer_desc}
          </p>
        )}
      </div>
      <div className={styles.actions}>
        {!isTransferPage && !isAdmin && (
          <button 
            className={styles.primaryButton}
            onClick={() => {
              if (!isPayoutsPage) {
                router.push(`/${currentLocale}/transfer`);
              } else {
                window.dispatchEvent(new Event('open-payout-modal'));
              }
            }}
          >
            {isPayoutsPage ? null : <PlusIcon />}
            <span>{primaryButtonText}</span>
          </button>
        )}
        {!isAdmin && (
          <button 
            className={styles.secondaryButton}
            onClick={() => {
              if (pathname.includes('/deals/')) {
                // Determine prefill subject if we are on a deal page
                // But we don't have the deal name easily accessible here without state or context.
                // It will be handled inside the deal page itself.
                window.dispatchEvent(new CustomEvent('open-ticket-modal'));
              } else {
                window.dispatchEvent(new CustomEvent('open-ticket-modal'));
              }
            }}
          >
            <ChatIcon />
            <span>{dict.ask_question}</span>
          </button>
        )}
      </div>
    </div>
  );
}
