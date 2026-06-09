'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import styles from './UserModal.module.css';

interface UserItem {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string | null;
  partnerId?: string;
}

interface UserModalProps {
  user: UserItem;
  onClose: () => void;
  onStatusChange: () => void;
}

interface Lead {
  id: string;
  title: string;
  status: string;
  budget: number | null;
  syncedAt: string;
}

interface Ticket {
  id: string;
  subject: string;
  status: string;
  updatedAt: string;
}

const EmailIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);

const PhoneIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
    <line x1="12" y1="18" x2="12.01" y2="18"></line>
  </svg>
);

const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const ChatIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
  </svg>
);

export function UserModal({ user, onClose, onStatusChange }: UserModalProps) {
  const [activeTab, setActiveTab] = useState<'deals' | 'tickets'>('deals');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    if (user.partnerId) {
      fetchData();
    } else {
      setLoading(false); // No partnerId, no leads/tickets
    }
  }, [user.partnerId]);

  const fetchData = async () => {
    try {
      const [leadsRes, ticketsRes] = await Promise.all([
        api.get(`/leads?partner_id=${user.partnerId}&page_size=50`),
        api.get(`/support/tickets?partner_id=${user.partnerId}`)
      ]);
      setLeads(leadsRes.data.items || []);
      setTickets(ticketsRes.data || []);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    setIsToggling(true);
    try {
      await api.put(`/admin/partners/users/${user.id}/status`, { isActive: !user.isActive });
      onStatusChange();
    } catch (error) {
      console.error('Failed to toggle status', error);
    } finally {
      setIsToggling(false);
    }
  };

  const handleAccept = async () => {
    setIsToggling(true);
    try {
      await api.put(`/admin/partners/users/${user.id}/status`, { isActive: true });
      onStatusChange();
      onClose();
    } catch (error) {
      console.error('Failed to accept user', error);
      setIsToggling(false);
    }
  };

  const handleReject = async () => {
    if (!confirm('Вы уверены, что хотите удалить эту заявку?')) return;
    setIsToggling(true);
    try {
      await api.delete(`/admin/partners/users/${user.id}`);
      onStatusChange();
      onClose();
    } catch (error) {
      console.error('Failed to reject user', error);
      setIsToggling(false);
    }
  };

  const isNewUser = !user.isActive && !user.lastLogin;

  const openDeal = (id: string) => {
    window.open(`/deals/${id}`, '_blank');
  };

  const openTicket = (id: string) => {
    window.open(`/support/${id}`, '_blank');
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.substring(0, 1).toUpperCase();
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatusStyle = (status: string) => {
    if (!status) return { background: '#e0f2fe', color: '#075985' };
    const s = status.toLowerCase();
    
    // 1. Success -> Green
    if (s.includes('успешно') || (s.includes('реализовано') && !s.includes('не реализовано')) || s === 'resolved') {
      return { background: '#dcfce7', color: '#166534' };
    }
    
    // 2. Failed / Closed -> Red
    if (s.includes('закрыт') || s.includes('отказ') || s.includes('отмен') || s.includes('не реализовано') || s.includes('архив') || s === 'closed') {
      return { background: '#fee2e2', color: '#991b1b' };
    }
    
    // 3. In Progress / New -> Light Blue
    return { background: '#f0f9ff', color: '#0369a1' };
  };

  return (
    <>
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={e => e.stopPropagation()}>
          <div className={styles.header}>
            <div className={styles.userInfo}>
              <div className={styles.avatar}>
                {getInitials(user.name || user.email)}
              </div>
              <div className={styles.details}>
                <h2>{user.name || 'Пользователь'}</h2>
                <p><EmailIcon /> {user.email}</p>
                <p><PhoneIcon /> {user.phone || 'Не указано'}</p>
                <p><CalendarIcon /> Дата регистрации: {formatDate(user.createdAt)}</p>
              </div>
            </div>
            
            <div className={styles.actions}>
              {isNewUser ? (
                <>
                  <button 
                    className={`${styles.btn} ${styles.btnSuccess}`}
                    onClick={handleAccept}
                    disabled={isToggling}
                  >
                    Одобрить
                  </button>
                  <button 
                    className={`${styles.btn} ${styles.btnDanger}`}
                    onClick={handleReject}
                    disabled={isToggling}
                  >
                    Отклонить
                  </button>
                </>
              ) : (
                <button 
                  className={`${styles.btn} ${user.isActive ? styles.btnDanger : styles.btnSuccess}`}
                  onClick={handleToggleStatus}
                  disabled={isToggling}
                >
                  {user.isActive ? 'Прекратить доступ' : 'Восстановить доступ'}
                </button>
              )}
              <button 
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={() => alert('Статистика в разработке')}
              >
                Статистика
              </button>
              <button className={styles.closeBtn} onClick={onClose}>&times;</button>
            </div>
          </div>

          <div className={styles.body}>
            <div className={styles.tabs}>
              <button 
                className={`${styles.tab} ${activeTab === 'deals' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('deals')}
              >
                Сделки
              </button>
              <button 
                className={`${styles.tab} ${activeTab === 'tickets' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('tickets')}
              >
                Тикеты
              </button>
            </div>

            {loading ? (
              <div className={styles.loading}>Загрузка...</div>
            ) : !user.partnerId ? (
              <div className={styles.empty}>Пользователь не является партнером</div>
            ) : activeTab === 'deals' ? (
              leads.length === 0 ? (
                <div className={styles.empty}>Нет сделок для отображения</div>
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Название</th>
                      <th>Статус</th>
                      <th>Бюджет</th>
                      <th>Дата создания</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map(lead => (
                      <tr 
                        key={lead.id} 
                        className={styles.clickableTr}
                        onClick={() => openDeal(lead.id)}
                      >
                        <td>{lead.title}</td>
                        <td>
                          <span className={styles.statusBadge} style={getStatusStyle(lead.status)}>
                            {lead.status}
                          </span>
                        </td>
                        <td>{lead.budget ? `${lead.budget.toLocaleString()} $` : '—'}</td>
                        <td>{formatDate(lead.syncedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            ) : (
              tickets.length === 0 ? (
                <div className={styles.empty}>У этого пользователя еще нет тикетов</div>
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Тема</th>
                      <th>Статус</th>
                      <th>Последнее обновление</th>
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
                        <td>
                          <span className={styles.statusBadge} style={getStatusStyle(ticket.status)}>
                            {ticket.status}
                          </span>
                        </td>
                        <td>{formatDateTime(ticket.updatedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            )}
          </div>
        </div>
      </div>
    </>
  );
}
