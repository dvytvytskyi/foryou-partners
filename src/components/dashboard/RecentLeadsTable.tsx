'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import styles from './RecentLeadsTable.module.css';

interface RecentLeadsTableProps {
  data?: any[];
}

export function RecentLeadsTable({ data }: RecentLeadsTableProps) {
  const router = useRouter();
  const leads = data || [];

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Latest leads</h2>
        <div className={styles.actions}>
          <button 
            className={styles.actionBtn}
            onClick={() => router.push('/leads')}
          >
            View all
          </button>

        </div>
      </div>

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${styles.tabActive}`}>
          All leads
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: '220px' }}>Client Name</th>
              <th style={{ width: '120px' }}>Date</th>
              <th style={{ width: '120px' }}>Price</th>
              <th style={{ width: '140px' }}>Category</th>
              <th>Product</th>
              <th style={{ width: '120px' }}>City</th>
              <th style={{ width: '140px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((item: any) => (
              <tr key={item.id}>
                <td>
                  <div className={styles.clientCell}>
                    {item.clientName}
                  </div>
                </td>
                <td>{formatDate(item.date)}</td>
                <td className={styles.priceCell}>
                  {item.price ? `$${Number(item.price).toLocaleString()}` : '-'}
                </td>
                <td>{item.category}</td>
                <td>{item.product}</td>
                <td>{item.city}</td>
                <td>
                  <span className={`${styles.status} ${styles[item.status.toLowerCase().replace(/\s+/g, '')] || ''}`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#71717a' }}>
                  No leads found in this category
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
