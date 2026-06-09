'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { PageHeader } from './PageHeader';
import { useAuthStore } from '@/lib/stores/auth.store';
import { usePathname } from 'next/navigation';
import styles from './DashboardLayout.module.css';
import { CreateTicketModal } from '../support/CreateTicketModal';

interface DashboardLayoutProps {
  children: React.ReactNode;
  dict: any;
}

export function DashboardLayout({ children, dict }: DashboardLayoutProps) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');

  useEffect(() => {
    const handleOpenTicketModal = (e: Event) => {
      const customEvent = e as CustomEvent;
      setTicketSubject(customEvent.detail?.subject || '');
      setIsTicketModalOpen(true);
    };

    window.addEventListener('open-ticket-modal', handleOpenTicketModal);
    return () => window.removeEventListener('open-ticket-modal', handleOpenTicketModal);
  }, []);

  return (
    <div className={styles.layoutWrapper}>
      <Sidebar dict={dict.sidebar} />
      <div className={styles.mainContent}>
        <Header dict={dict.header} />
        <PageHeader dict={dict.page_header} />
        <main className={styles.pageBody}>
          {children}
        </main>
      </div>

      {isTicketModalOpen && (
        <CreateTicketModal 
          initialSubject={ticketSubject}
          onClose={() => setIsTicketModalOpen(false)}
          onSuccess={() => {
            setIsTicketModalOpen(false);
            window.dispatchEvent(new Event('ticket-created'));
          }}
        />
      )}
    </div>
  );
}
