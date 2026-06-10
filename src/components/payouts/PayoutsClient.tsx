'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import styles from './Payouts.module.css';
import { api } from '@/lib/api';
import { RequestPayoutModal } from '@/components/payouts/RequestPayoutModal';

const ChatIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
  </svg>
);

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="1.5">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const FilterIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
  </svg>
);

const SortIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: '4px', opacity: 0.5 }}>
    <polyline points="7 15 12 20 17 15"></polyline>
    <polyline points="7 9 12 4 17 9"></polyline>
  </svg>
);

export function PayoutsClient({ dict }: { dict: any }) {
  const pathname = usePathname();
  const currentLocale = pathname.split('/')[1] === 'en' ? 'en-US' : 'ru-RU';
  const isEn = currentLocale === 'en-US';

  const mapText = (text: string) => {
    if (!text || !isEn) return text;
    const lower = text.toLowerCase();
    if (lower === 'выплачено') return 'Paid';
    if (lower === 'ожидает') return 'Pending';
    if (lower === 'отклонено') return 'Rejected';
    if (lower === 'вы') return 'You';
    if (lower === 'банковский перевод') return 'Bank Transfer';
    return text;
  };

  const [data, setData] = useState<{
    stats: { totalEarned: number, pendingPayouts: number, totalPaid: number, availableToRequest: number },
    history: any[]
  }>({
    stats: { totalEarned: 0, pendingPayouts: 0, totalPaid: 0, availableToRequest: 0 },
    history: []
  });
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = () => {
    setLoading(true);
    api.get('/payouts').then(res => {
      setData(res.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchData();

    const handleOpenModal = () => setIsModalOpen(true);
    window.addEventListener('open-payout-modal', handleOpenModal);
    return () => window.removeEventListener('open-payout-modal', handleOpenModal);
  }, []);

  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedHistory = data ? [...data.history].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    
    let aVal = a[key as keyof typeof a];
    let bVal = b[key as keyof typeof b];

    if (key === 'amount') {
      aVal = parseInt((aVal as string).replace(/[^0-9]/g, ''), 10);
      bVal = parseInt((bVal as string).replace(/[^0-9]/g, ''), 10);
    }
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  }) : [];

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString(currentLocale, { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
  };

  if (loading && !data) return <div style={{ padding: '2rem' }}>Загрузка...</div>;
  if (!data) return <div style={{ padding: '2rem' }}>Ошибка загрузки данных</div>;

  return (
    <div className={styles.pageContainer}>
      {isModalOpen && (
        <RequestPayoutModal 
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchData();
          }}
          maxAmount={data.stats.availableToRequest}
        />
      )}


      <div className={styles.cardsGrid}>
        <div className={styles.card}>
          <div className={styles.cardLabel}>{dict.total_earned} (AED)</div>
          <div className={styles.cardValueBlue}>{data.stats.totalEarned.toLocaleString()}</div>
          <div className={styles.cardSub}>
            <span>AED</span>
          </div>
        </div>
        <div className={`${styles.card} ${styles.cardPrimary}`}>
          <div className={styles.cardLabelLight}>{dict.available} (AED)</div>
          <div className={styles.cardValueWhite}>{data.stats.availableToRequest.toLocaleString()}</div>
          <div className={styles.cardSubLight}>
            <span>AED</span>
          </div>
          <button className={styles.btnWhite} onClick={() => setIsModalOpen(true)}>
            {dict.request_btn || 'Запросить выплату'}
          </button>
        </div>
        <div className={styles.card}>
          <div className={styles.cardLabel}>{dict.total_paid} (AED)</div>
          <div className={styles.cardValueBlue}>{data.stats.totalPaid.toLocaleString()}</div>
          <div className={styles.cardSub}>
            <span>AED</span>
          </div>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <h2 className={styles.tableTitle}>{dict.history}</h2>
          <div className={styles.tableControls}>
          </div>
        </div>

        <div className={styles.list}>
          <div className={styles.headerRow}>
            <div className={styles.headerCell} onClick={() => requestSort('date')} style={{ cursor: 'pointer' }}>{dict.table.date} <SortIcon /></div>
            <div className={styles.headerCell} onClick={() => requestSort('status')} style={{ cursor: 'pointer' }}>{dict.table.status} <SortIcon /></div>
            <div className={styles.headerCell} onClick={() => requestSort('user')} style={{ cursor: 'pointer' }}>{dict.table.user} <SortIcon /></div>
            <div className={styles.headerCell} onClick={() => requestSort('amount')} style={{ cursor: 'pointer' }}>{dict.table.amount} <SortIcon /></div>
            <div className={styles.headerCell} onClick={() => requestSort('type')} style={{ cursor: 'pointer' }}>{dict.table.type} <SortIcon /></div>
          </div>
          {sortedHistory.map(item => (
            <div key={item.id} className={styles.row}>
              <div className={styles.cell}>{formatDate(item.date)}</div>
              <div className={styles.cell}>
                <span className={`${styles.badge} ${styles[`badge_${item.statusType}`]}`}>{mapText(item.status)}</span>
              </div>
              <div className={styles.cell}>{mapText(item.user)}</div>
              <div className={styles.cellAmount}>{item.amount}</div>
              <div className={styles.cell}>{mapText(item.type)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.footerNote}>
        {dict.footer}
      </div>
    </div>
  );
}
