'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Send } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/stores/auth.store';
import styles from './TicketDetail.module.css';

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
      alert('Не удалось отправить сообщение');
    } finally {
      setSending(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!confirm('Вы уверены, что хотите закрыть этот тикет?')) return;
    try {
      await api.patch(`/support/tickets/${ticketId}/close`);
      await fetchTicket();
    } catch (error) {
      console.error('Failed to close ticket', error);
      alert('Не удалось закрыть тикет');
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'OPEN': return 'Открыт';
      case 'IN_PROGRESS': return 'В работе';
      case 'RESOLVED': return 'Решен';
      case 'CLOSED': return 'Закрыт';
      default: return status;
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Загрузка...</div>;
  if (!ticket) return <div style={{ padding: '2rem', textAlign: 'center' }}>Обращение не найдено</div>;

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
          <span className={`${styles.statusBadge} ${styles[`status${ticket.status}`]}`}>
            {getStatusLabel(ticket.status)}
          </span>
        </div>
      </div>

      <div className={styles.chatContainer}>
        <div className={styles.messagesList}>
          {ticket.messages.map((msg) => {
            const isOwn = msg.senderId === user?.id;
            let senderName = '';
            if (isOwn) {
              senderName = 'Вы';
            } else {
              senderName = msg.sender.role === 'admin' ? 'Служба поддержки' : ticket.partner?.name || 'Партнер';
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
                placeholder={ticket.status === 'CLOSED' ? "Тикет закрыт" : "Введите ваше сообщение..."}
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
                <span>{sending ? 'Отправка...' : 'Отправить'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
