'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus, MessageSquare } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/stores/auth.store';
import styles from './Support.module.css';

interface Ticket {
  id: string;
  subject: string;
  status: string;
  updatedAt: string;
  partner?: { name: string };
  messages: Array<{ createdAt: string }>;
}

export function SupportClient({ dict }: { dict: any }) {
  const user = useAuthStore((state) => state.user);
  const pathname = usePathname();
  const currentLocale = pathname.split('/')[1] === 'en' ? 'en-US' : 'ru-RU';
  
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    try {
      const { data } = await api.get('/support/tickets');
      setTickets(data);
    } catch (error) {
      console.error('Failed to fetch tickets', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    
    const handleTicketCreated = () => {
      fetchTickets();
    };
    window.addEventListener('ticket-created', handleTicketCreated);
    return () => window.removeEventListener('ticket-created', handleTicketCreated);
  }, []);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'OPEN': return dict.status.open;
      case 'IN_PROGRESS': return dict.status.in_progress;
      case 'RESOLVED': return dict.status.resolved;
      case 'CLOSED': return dict.status.closed;
      default: return status;
    }
  };

  const formatAuthorName = (name?: string) => {
    if (!name) return '';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0];
    const lastName = parts[0];
    const firstName = parts[1];
    return `${lastName} ${firstName[0].toUpperCase()}.`;
  };

  return (
    <div className={styles.container}>
      {loading ? (
        <div>{dict.loading}</div>
      ) : tickets.length === 0 ? (
        <div className={styles.emptyState}>
          <MessageSquare size={48} className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>
            {user?.role === 'admin' ? dict.empty_admin : dict.empty_user}
          </h3>
          {user?.role !== 'admin' && (
            <>
              <p className={styles.emptyDesc}>
                {dict.empty_desc}
              </p>
              <button 
                className={styles.createBtn} 
                onClick={() => window.dispatchEvent(new CustomEvent('open-ticket-modal'))}
              >
                <Plus size={18} />
                {dict.create_btn}
              </button>
            </>
          )}
        </div>
      ) : (
        <>
          <div className={styles.controls}>
            <div className={styles.searchBox}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input type="text" placeholder={dict.search} />
            </div>
          </div>

          <div className={styles.list}>
            <div className={styles.headerRow}>
              <div className={styles.headerCell}>{dict.table.subject}</div>
              <div className={styles.headerCell}>{dict.table.status}</div>
              <div className={styles.headerCell}>
                {dict.table.updated_at}
                <svg style={{marginLeft: 4}} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="7 15 12 20 17 15"></polyline>
                  <polyline points="7 9 12 4 17 9"></polyline>
                </svg>
              </div>
            </div>
            {tickets.map((ticket) => {
              const statusName = getStatusLabel(ticket.status);
              let badgeType = 'badgeOrange';
              if (ticket.status === 'RESOLVED') badgeType = 'badgeGreen';
              if (ticket.status === 'CLOSED') badgeType = 'badgeBlue';

              return (
                <Link key={ticket.id} href={`/${pathname.split('/')[1]}/support/${ticket.id}`} className={styles.row}>
                  <div className={styles.cell}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span className={styles.ticketSubject}>{ticket.subject}</span>
                      {user?.role === 'admin' && ticket.partner?.name && (
                        <span style={{ fontSize: '13px', color: '#71717a' }}>
                          {formatAuthorName(ticket.partner.name)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={styles.cell}>
                    <div className={`${styles.badge} ${styles[badgeType]}`}>
                      <span className={styles.badgeDot}></span>
                      {statusName}
                    </div>
                  </div>
                  <div className={styles.cell}>
                    <span className={styles.date}>
                      {new Date(ticket.updatedAt).toLocaleDateString(currentLocale, { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
