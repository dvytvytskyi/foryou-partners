'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import styles from './UsersTable.module.css';

interface UserItem {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLogin: string | null;
  referralsCount: number;
  partnerId?: string;
}

import { UserModal } from './UserModal';

export function UsersTable({ dict }: { dict: any }) {
  const [activeTab, setActiveTab] = useState<'partner_user' | 'admin'>('partner_user');
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

  const fetchUsers = async (currentTab: string, currentPage: number) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/partners/users?role=${currentTab}&page=${currentPage}&limit=10`);
      setUsers(data.items);
      setTotalPages(data.totalPages);
      setTotalItems(data.total);
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(activeTab, page);
  }, [activeTab, page]);

  const handleTabChange = (tab: 'partner_user' | 'admin') => {
    setActiveTab(tab);
    setPage(1); // Reset page on tab change
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'partner_user' ? styles.activeTab : ''}`}
          onClick={() => handleTabChange('partner_user')}
        >
          {dict.tabs.partner}
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'admin' ? styles.activeTab : ''}`}
          onClick={() => handleTabChange('admin')}
        >
          {dict.tabs.admin}
        </button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{dict.table.reg_date}</th>
              <th>{dict.table.name}</th>
              <th>{dict.table.email}</th>
              <th>{dict.table.phone}</th>
              <th>{dict.table.status}</th>
              {activeTab === 'partner_user' && <th>{dict.table.referrals}</th>}
              <th>{dict.table.last_login}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={activeTab === 'partner_user' ? 7 : 6} className={styles.loading}>
                  {dict.loading}
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={activeTab === 'partner_user' ? 7 : 6} className={styles.empty}>
                  {dict.empty}
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr 
                  key={user.id} 
                  onClick={() => setSelectedUser(user)}
                  className={`${styles.clickableRow} ${!user.isActive && !user.lastLogin ? styles.newRow : ''}`}
                >
                  <td data-label={dict.table.reg_date}>{formatDate(user.createdAt)}</td>
                  <td data-label={dict.table.name} className={styles.primaryCell}>{user.name || '—'}</td>
                  <td data-label={dict.table.email}>{user.email}</td>
                  <td data-label={dict.table.phone}>{user.phone || '—'}</td>
                  <td data-label={dict.table.status}>
                    <span className={`${styles.statusBadge} ${!user.isActive && !user.lastLogin ? styles.statusBlocked : user.isActive ? styles.statusActive : styles.statusBlocked}`}>
                      {!user.isActive && !user.lastLogin ? dict.status.new : user.isActive ? dict.status.active : dict.status.blocked}
                    </span>
                  </td>
                  {activeTab === 'partner_user' && <td data-label={dict.table.referrals}>{user.referralsCount}</td>}
                  <td data-label={dict.table.last_login}>{formatDate(user.lastLogin)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {totalItems > 0 && (
          <div className={styles.pagination}>
            <div className={styles.pageInfo}>
              {dict.page} {page} {dict.of} {totalPages} ({dict.total}: {totalItems})
            </div>
            <div className={styles.pageControls}>
              <button
                className={styles.pageBtn}
                disabled={page <= 1 || loading}
                onClick={() => setPage(p => p - 1)}
              >
                {dict.prev}
              </button>
              <button
                className={styles.pageBtn}
                disabled={page >= totalPages || loading}
                onClick={() => setPage(p => p + 1)}
              >
                {dict.next}
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedUser && (
        <UserModal 
          user={selectedUser} 
          onClose={() => setSelectedUser(null)} 
          onStatusChange={() => {
            fetchUsers(activeTab, page);
            setSelectedUser(prev => prev ? { ...prev, isActive: !prev.isActive } : null);
          }}
        />
      )}
    </div>
  );
}
