'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Send } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/stores/auth.store';
import styles from './TicketDetail.module.css';

import dictRu from '@/i18n/dictionaries/ru.json';
import dictEn from '@/i18n/dictionaries/en.json';
const dict = typeof window !== 'undefined' && window.location.pathname.startsWith('/en') ? dictEn : dictRu;

interface Message {
  id: string;
  senderId: string;
  message: string;
  createdAt: string;
  sender: {
    id: string;
    email: string;
    role: string;
  };
}

interface Ticket {
  id: string;
  subject: string;
  status: string;
  partner: {
    name: string;
  };
  messages: Message[];
}

export default function TicketDetailPage() {
  const params = useParams();
  const ticketId = params.id as string;
  const user = useAuthStore((state) => state.user);
  
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchTicket = async () => {
    try {
      const { data } = await api.get(`/support/tickets/${ticketId}`);
      setTicket(data);
    } catch (error) {
      console.error('Failed to fetch ticket', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [ticketId]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket?.messages]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || ticket?.status === 'CLOSED') return;

    setSending(true);
    try {
      await api.post(`/support/tickets/${ticketId}/messages`, { message: replyText });
      setReplyText('');
      await fetchTicket();
    } catch (error) {
      console.error('Failed to send reply', error);
      alert(dict.hardcoded.failed_to_send_message);
    } finally {
      setSending(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!confirm(dict.hardcoded.are_you_sure_you_want_to_close)) return;
    try {
      await api.patch(`/support/tickets/${ticketId}/close`);
      await fetchTicket();
    } catch (error) {
      console.error('Failed to close ticket', error);
      alert(dict.hardcoded.failed_to_close_ticket);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'OPEN': return dict.hardcoded.open;
      case 'IN_PROGRESS': return dict.hardcoded.in_progress;
      case 'RESOLVED': return dict.hardcoded.resolved;
      case 'CLOSED': return dict.hardcoded.closed;
      default: return status;
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>{dict.hardcoded.loading}</div>;
  if (!ticket) return <div style={{ padding: '2rem', textAlign: 'center' }}>{dict.hardcoded.ticket_not_found}</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleContainer}>
          <Link href={`/${params.locale || 'ru'}/support`} className={styles.backBtn}>
            <ArrowLeft size={20} />
          </Link>
          <h1 className={styles.title}>{ticket.subject}</h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {user?.role === 'admin' ? (
            <select
              value={ticket.status}
              onChange={async (e) => {
                const newStatus = e.target.value;
                try {
                  await api.patch(`/support/tickets/${ticketId}/status`, { status: newStatus });
                  await fetchTicket();
                } catch (error) {
                  console.error('Failed to update status', error);
                  alert('Failed to update status');
                }
              }}
              className={`${styles.statusBadge} ${styles[`status${ticket.status}`]}`}
              style={{ 
                cursor: 'pointer', 
                appearance: 'none', 
                outline: 'none', 
                border: 'none', 
                paddingRight: '2rem', 
                fontFamily: 'inherit', 
                fontWeight: 'inherit', 
                fontSize: 'inherit',
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.5rem center',
                backgroundSize: '1em'
              }}
            >
              <option value="OPEN" style={{ background: 'white', color: '#18181b' }}>{dict.hardcoded.open}</option>
              <option value="IN_PROGRESS" style={{ background: 'white', color: '#18181b' }}>{dict.hardcoded.in_progress}</option>
              <option value="RESOLVED" style={{ background: 'white', color: '#18181b' }}>{dict.hardcoded.resolved}</option>
              <option value="CLOSED" style={{ background: 'white', color: '#18181b' }}>{dict.hardcoded.closed}</option>
            </select>
          ) : (
            <span className={`${styles.statusBadge} ${styles[`status${ticket.status}`]}`}>
              {getStatusLabel(ticket.status)}
            </span>
          )}
        </div>
      </div>

      <div className={styles.chatContainer}>
        <div className={styles.messagesList}>
          {ticket.messages.map((msg) => {
            const isOwn = msg.senderId === user?.id;
            let senderName = '';
            if (isOwn) {
              senderName = dict.hardcoded.you;
            } else {
              senderName = msg.sender.role === 'admin' ? dict.hardcoded.support_service : ticket.partner?.name || dict.hardcoded.partner;
            }

            return (
              <div key={msg.id} className={`${styles.messageWrapper} ${isOwn ? styles.own : styles.other}`}>
                <div className={styles.senderName}>{senderName}</div>
                <div className={styles.messageBubble}>
                  {msg.message}
                  <div className={styles.messageTime}>
                    {new Date(msg.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className={styles.replyContainer}>
          <form onSubmit={handleReply} className={styles.replyForm}>
            <div className={styles.replyInputWrapper}>
              <textarea
                className={styles.replyInput}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={ticket.status === 'CLOSED' ? dict.hardcoded.ticket_closed : dict.hardcoded.type_your_message}
                disabled={sending || ticket.status === 'CLOSED'}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleReply(e);
                  }
                }}
              />
              <button 
                type="submit" 
                className={styles.sendBtn}
                disabled={sending || !replyText.trim() || ticket.status === 'CLOSED'}
              >
                <Send size={16} />
                <span>{sending ? dict.hardcoded.sending : dict.hardcoded.send}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
