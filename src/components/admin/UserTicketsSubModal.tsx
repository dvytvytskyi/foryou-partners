'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import styles from './UserTicketsSubModal.module.css';

interface Ticket {
  id: string;
  subject: string;
  status: string;
  updatedAt: string;
}

interface UserTicketsSubModalProps {
  user: { partnerId?: string; name: string; email: string };
  onClose: () => void;
  dict?: any;
}

export function UserTicketsSubModal({ user, onClose, dict }: UserTicketsSubModalProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user.partnerId) {
      fetchTickets();
    } else {
      setLoading(false);
    }
  }, [user.partnerId]);

  const fetchTickets = async () => {
    try {
      const { data } = await api.get(`/support/tickets?partner_id=${user.partnerId}`);
      setTickets(data);
    } catch (error) {
      console.error('Failed to fetch tickets', error);
    } finally {
      setLoading(false);
    }
  };

  const openTicket = (id: string) => {
    window.open(`/support/${id}`, '_blank');
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>{dict.hardcoded.hc_27} {user.name || user.email}</h3>
          <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        </div>
        <div className={styles.body}>
          {loading ? (
            <div className={styles.loading}>{dict.hardcoded.loading_tickets}</div>
          ) : !user.partnerId ? (
            <div className={styles.empty}>{dict.hardcoded.user_is_not_a_partner}</div>
          ) : tickets.length === 0 ? (
            <div className={styles.empty}>{dict.hardcoded.this_user_has_no_tickets_yet}</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{dict.hardcoded.subject}</th>
                  <th>{dict.hardcoded.status}</th>
                  <th>{dict.hardcoded.last_update}</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(ticket => (
                  <tr 
                    key={ticket.id} 
                    className={styles.clickableTr}
                    onClick={() => openTicket(ticket.id)}
                  >
                    <td>{ticket.subject}</td>
                    <td>{ticket.status}</td>
                    <td>{formatDate(ticket.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
