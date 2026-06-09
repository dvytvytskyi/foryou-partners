'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import styles from './StatCard.module.css';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    isPositive: boolean;
  };
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
}

export function StatCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  iconColor = '#003077', 
  iconBg = '#f0f7ff' 
}: StatCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div 
          className={styles.iconWrapper} 
          style={{ backgroundColor: iconBg, color: iconColor }}
        >
          <Icon size={18} />
        </div>
        {change && (
          <div className={`${styles.change} ${change.isPositive ? styles.positive : styles.negative}`}>
            {change.isPositive ? '↑' : '↓'} {Math.abs(change.value)}%
          </div>
        )}
      </div>
      
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.value}>{value}</div>
      </div>
      
      <div className={styles.footer}>
        <span className={styles.period}>From last month</span>
      </div>
    </div>
  );
}
