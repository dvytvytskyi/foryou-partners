'use client';

import React, { useState, useEffect } from 'react';
import styles from './Referrals.module.css';
import { api } from '@/lib/api';

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const UserPlusIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="8.5" cy="7" r="4"></circle>
    <line x1="20" y1="8" x2="20" y2="14"></line>
    <line x1="23" y1="11" x2="17" y2="11"></line>
  </svg>
);

const BriefcaseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
  </svg>
);

const SortIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="7 15 12 20 17 15"></polyline>
    <polyline points="7 9 12 4 17 9"></polyline>
  </svg>
);

export function ReferralsClient({ dict }: { dict: any }) {
  const [data, setData] = useState<{
    stats: { totalEarned: number, activePartners: number, totalClosedDeals: number },
    partners: any[],
    deals: any[],
    referralLink?: string
  }>({
    stats: { totalEarned: 0, activePartners: 0, totalClosedDeals: 0 },
    partners: [],
    deals: []
  });
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.get('/referrals').then(res => {
      console.log('Referrals API response:', res.data);
      setData(res.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const handleInvite = async () => {
    if (data.referralLink) {
      try {
        await navigator.clipboard.writeText(data.referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        prompt(dict.copy_prompt, data.referralLink);
      }
    } else {
      alert(dict.copy_error);
    }
  };

  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedDeals = [...data.deals].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    
    let aVal = a[key as keyof typeof a];
    let bVal = b[key as keyof typeof b];

    if (key === 'amount') {
      aVal = parseInt((aVal as string).replace(/[^0-9]/g, ''), 10) as any;
      bVal = parseInt((bVal as string).replace(/[^0-9]/g, ''), 10) as any;
    }
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading) return <div style={{ padding: '2rem' }}>{dict.loading}</div>;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerTop}>
        <div className={styles.header}>
          <h1 className={styles.title}>{dict.title}</h1>
          <p className={styles.subtitle}>
            {dict.subtitle_1}<br/>{dict.subtitle_2}
          </p>
        </div>
        <div className={styles.referralLinkContainer}>
          <input 
            type="text" 
            readOnly 
            value={data.referralLink || dict.link_generating} 
            className={styles.referralInput}
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <button 
            className={styles.copyBtn} 
            onClick={handleInvite}
            disabled={!data.referralLink}
            title={dict.copy_title}
          >
            {copied ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className={styles.cardsGrid}>
        <div className={`${styles.card} ${styles.cardPrimary}`}>
          <div className={styles.cardLabelLight}>{dict.stats.earned}</div>
          <div className={styles.cardValueWhite}>{data.stats.totalEarned.toLocaleString()}</div>
          <div className={styles.cardSubLight}>{dict.stats.currency}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon}><UserPlusIcon /></div>
          <div className={styles.cardValueBlue}>{data.stats.activePartners}</div>
          <div className={styles.cardLabel}>{dict.stats.active_partners}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon}><BriefcaseIcon /></div>
          <div className={styles.cardValueBlue}>{data.stats.totalClosedDeals}</div>
          <div className={styles.cardLabel}>{dict.stats.closed_deals}</div>
        </div>
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.box}>
          <h2 className={styles.boxTitle}>{dict.partners.title}</h2>
          <div className={styles.partnersList}>
            {data.partners.map((p, idx) => (
              <div key={idx} className={styles.partnerItem}>
                <span className={styles.partnerName}>{p.name}</span>
                <span className={styles.partnerMeta}>{dict.partners.from} {formatDate(p.joined)} · {p.deals} {dict.partners.closed}</span>
                <span className={p.status === 'Активен' || p.status === 'Active' ? styles.badgeActive : styles.badgePending}>
                  {p.status}
                </span>
              </div>
            ))}
            {data.partners.length === 0 && (
              <div style={{ color: '#71717a', fontSize: '0.875rem' }}>{dict.partners.empty}</div>
            )}
          </div>
        </div>

        <div className={`${styles.box} ${styles.boxSpan2}`}>
          <h2 className={styles.boxTitle}>{dict.deals.title}</h2>
          <div className={styles.tableList}>
            <div className={styles.tableHeaderRow}>
              <div className={styles.tableHeaderCell} onClick={() => requestSort('partner')} style={{ cursor: 'pointer' }}>{dict.deals.partner} <SortIcon /></div>
              <div className={styles.tableHeaderCell} onClick={() => requestSort('status')} style={{ cursor: 'pointer' }}>{dict.deals.status} <SortIcon /></div>
              <div className={styles.tableHeaderCell} onClick={() => requestSort('date')} style={{ cursor: 'pointer' }}>{dict.deals.date} <SortIcon /></div>
              <div className={styles.tableHeaderCell} onClick={() => requestSort('amount')} style={{ cursor: 'pointer' }}>{dict.deals.your_percent} <SortIcon /></div>
            </div>
            {sortedDeals.map((d, idx) => (
              <div key={idx} className={styles.tableRow}>
                <div className={styles.tableCell}>{d.partner}</div>
                <div className={styles.tableCell}>
                  <span className={d.statusType === 'blue' ? styles.statusBlue : styles.statusGreen}>
                    <span className={styles.statusDot} style={{ background: d.statusType === 'blue' ? '#3b82f6' : '#10b981' }}></span>
                    {d.status}
                  </span>
                </div>
                <div className={styles.tableCell}>{formatDate(d.date)}</div>
                <div className={`${styles.tableCell} ${styles.amount}`}>{d.amount}</div>
              </div>
            ))}
            {sortedDeals.length === 0 && (
              <div style={{ padding: '16px', color: '#71717a', fontSize: '0.875rem' }}>{dict.deals.empty}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
