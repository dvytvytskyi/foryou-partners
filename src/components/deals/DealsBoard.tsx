'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { leadsApi } from '@/lib/api-leads';
import styles from './DealsBoard.module.css';

const MessageCircleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
  </svg>
);

import { usePathname } from 'next/navigation';

export function DealsBoard({ search = '', dict }: { search?: string, dict: any }) {
  const pathname = usePathname();
  const currentLocale = pathname.split('/')[1] === 'en' ? 'en-GB' : 'ru-RU';
  
  const { data, isLoading, isError } = useQuery({
    queryKey: ['leads-board', { search }],
    queryFn: () => leadsApi.getLeadsBoard({ search: search || undefined }),
  });

  if (isLoading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>{dict.loading_board}</div>;
  }

  if (isError) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#dc2626' }}>{dict.error_board}</div>;
  }

  // Use the first pipeline for display, or empty array
  const pipeline = data?.pipelines?.[0];
  const columns = pipeline?.columns || [];

  return (
    <div className={styles.boardContainer}>
      {columns.map((col) => (
        <div key={col.id} className={styles.column}>
          <div className={styles.columnHeader}>
            <h3 className={styles.columnTitle}>{col.name}</h3>
            <span className={styles.columnCount}>{col.count}</span>
          </div>
          <div className={styles.columnList}>
            {col.items.map((deal) => (
              <Link href={`/${pathname.split('/')[1]}/deals/${deal.id}`} key={deal.id} className={styles.card}>
                <div className={styles.cardTitle}>{deal.title}</div>
                
                {deal.contact_name && (
                  <div className={styles.cardContact}>{deal.contact_name}</div>
                )}
                
                <div className={styles.cardFooter}>
                  <div className={styles.cardPrice}>
                    {deal.budget ? `$${deal.budget.toLocaleString()}` : ''}
                  </div>
                  <div className={styles.cardDate}>
                    {new Date(deal.updated_at).toLocaleDateString(currentLocale, { day: '2-digit', month: 'short' })}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
