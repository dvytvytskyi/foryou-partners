'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import styles from './ReferralSystem.module.css';

const ArrowUpRight = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="7" y1="17" x2="17" y2="7"></line>
    <polyline points="7 7 17 7 17 17"></polyline>
  </svg>
);

export function ReferralSystem({ dict }: { dict: any }) {
  const [stats, setStats] = useState({
    totalEarned: 0,
    activePartners: 0,
    totalClosedDeals: 0
  });

  useEffect(() => {
    api.get('/referrals').then(res => {
      if (res.data?.stats) {
        setStats(res.data.stats);
      }
    }).catch(err => {
      console.error('Failed to load referral stats', err);
    });
  }, []);

  return (
    <div className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>{dict.title}</h2>
          <Link href="/referrals" className={styles.link}>
            <ArrowUpRight /> {dict.more}
          </Link>
        </div>
        
        <div className={styles.cardsGrid}>
          {/* Card 1 - Primary */}
          <div className={`${styles.card} ${styles.cardPrimary}`}>
            <div className={styles.cardLabelPrimary}>{dict.total_earned}</div>
            <div className={styles.cardValuePrimary}>{stats.totalEarned.toLocaleString()}</div>
            <div className={styles.primarySubtext}>{dict.currency}</div>
          </div>

          {/* Card 2 */}
          <div className={styles.card}>
            <div className={styles.cardLabel}>{dict.active_partners}</div>
            <div className={styles.cardValue}>{stats.activePartners}</div>
          </div>

          {/* Card 3 */}
          <div className={styles.card}>
            <div className={styles.cardLabel}>{dict.closed_deals}</div>
            <div className={styles.cardValue}>{stats.totalClosedDeals}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
