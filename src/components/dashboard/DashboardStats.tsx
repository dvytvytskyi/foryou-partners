'use client';

import React, { useState } from 'react';
import styles from './DashboardStats.module.css';

const UserAddIcon = () => (
  <img src="/icons/UserPlus.png" alt="User Plus" width={24} height={24} />
);

const BriefcaseIcon = () => (
  <img src="/icons/Briefcase.png" alt="Briefcase" width={24} height={24} />
);

const CheckBadgeIcon = () => (
  <img src="/icons/CircleWavyCheck.png" alt="Check Badge" width={24} height={24} />
);

const LightningIcon = () => (
  <img src="/icons/Lightning.png" alt="Lightning" width={24} height={24} />
);

const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

const TrendUpIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
    <polyline points="17 6 23 6 23 12"></polyline>
  </svg>
);

export function DashboardStats({ 
  stats, 
  period, 
  onPeriodChange,
  dict
}: { 
  stats?: any, 
  period: string, 
  onPeriodChange: (p: string) => void,
  dict: any
}) {
  const periods = [
    { key: '7d', label: dict.periods['7d'] },
    { key: '30d', label: dict.periods['30d'] },
    { key: '90d', label: dict.periods['90d'] },
    { key: '1y', label: dict.periods['1y'] }
  ];

  const totalLeads = stats?.totalLeads || 0;
  const wonDeals = stats?.wonDeals || 0;
  const activeLeads = Math.max(0, totalLeads - wonDeals);
  const totalEarned = stats?.totalEarned || 0;

  return (
    <div className={styles.container}>
      <div className={styles.periodSelector}>
        {periods.map(p => (
          <button 
            key={p.key}
            className={`${styles.periodBtn} ${period === p.key ? styles.periodBtnActive : ''}`}
            onClick={() => onPeriodChange(p.key)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className={styles.cardsGrid}>
        {/* Card 1 */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.iconWrapper}>
              <UserAddIcon />
            </div>
            <button className={styles.arrowBtn}><ChevronRight /></button>
          </div>
          <div className={styles.cardValue}>{totalLeads}</div>
          <div className={styles.cardLabel}>{dict.leads_transferred}</div>
          <div className={styles.badgeGreen}>
            <TrendUpIcon />
            <span>{dict.new}</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.iconWrapper}>
              <BriefcaseIcon />
            </div>
            <button className={styles.arrowBtn}><ChevronRight /></button>
          </div>
          <div className={styles.cardValue}>{activeLeads}</div>
          <div className={styles.cardLabel}>{dict.in_progress}</div>
          <div className={styles.badgeBlue}>
            <span>{dict.active}</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.iconWrapper}>
              <CheckBadgeIcon />
            </div>
            <button className={styles.arrowBtn}><ChevronRight /></button>
          </div>
          <div className={styles.cardValue}>{wonDeals}</div>
          <div className={styles.cardLabel}>{dict.closed_successfully}</div>
          <div className={styles.badgeGreen}>
            <span>{dict.conversion} {totalLeads ? Math.round((wonDeals / totalLeads) * 100) : 0}%</span>
          </div>
        </div>

        {/* Card 4 - Primary */}
        <div className={`${styles.card} ${styles.cardPrimary}`}>
          <div className={styles.cardHeader}>
            <div className={styles.iconWrapper}>
              <LightningIcon />
            </div>
            <button className={styles.arrowBtn}><ChevronRight /></button>
          </div>
          <div className={styles.cardValue}>{totalEarned.toLocaleString()}</div>
          <div className={styles.cardLabel}>{dict.total_earned}</div>
          <div className={styles.primarySubtext}>
            {dict.commission}
          </div>
        </div>
      </div>
    </div>
  );
}
