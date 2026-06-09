'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { leadsApi } from '@/lib/api-leads';
import styles from './DealsTable.module.css';

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
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="7 15 12 20 17 15"></polyline>
    <polyline points="7 9 12 4 17 9"></polyline>
  </svg>
);

const MessageCircleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
  </svg>
);

function getStatusBadgeType(statusName: string) {
  const lower = statusName.toLowerCase();
  if (lower.includes('успешно') || lower.includes('успешно')) return 'green';
  if (lower.includes('отказ') || lower.includes('отказ') || lower.includes('архив')) return 'red';
  if (lower.includes('контакт') || lower.includes('переговор') || lower.includes('презентац')) return 'blue';
  return 'orange';
}

import { usePathname } from 'next/navigation';

export function DealsTable({ dict }: { dict: any }) {
  const pathname = usePathname();
  const currentLocale = pathname.split('/')[1] === 'en' ? 'en-GB' : 'ru-RU';
  
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Basic debounce for search
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // reset to page 1 on search
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['leads', { page, search: debouncedSearch, sortDir }],
    queryFn: () => leadsApi.getLeads({
      page,
      page_size: 20,
      search: debouncedSearch || undefined,
      sort_dir: sortDir,
    }),
  });

  const toggleSort = () => {
    setSortDir(prev => prev === 'desc' ? 'asc' : 'desc');
    setPage(1);
  };

  const { data: pipelinesData } = useQuery({
    queryKey: ['pipelines'],
    queryFn: () => leadsApi.getPipelines(),
    staleTime: 5 * 60 * 1000,
  });

  const pipelines = pipelinesData?.items || [];
  
  // Helper to resolve status name from pipelines
  const resolveStatusName = (rawStatus: string) => {
    if (!rawStatus) return dict.unknown;
    if (!rawStatus.includes(':')) {
      for (const p of pipelines) {
        const status = p.statuses?.find((s: any) => s.id.toString() === rawStatus);
        if (status) return status.name;
      }
      return rawStatus;
    }
    const [pipelineId, statusId] = rawStatus.split(':');
    const pipeline = pipelines.find((p: any) => p.id.toString() === pipelineId);
    if (pipeline) {
      const status = pipeline.statuses?.find((s: any) => s.id.toString() === statusId);
      if (status) return status.name;
    }
    return `${dict.table.status} ${statusId}`;
  };

  const leads = data?.items || [];
  const pagination = data?.pagination;

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <SearchIcon />
          <input 
            type="text" 
            placeholder={dict.search_client}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.list}>
        <div className={styles.headerRow}>
          <div className={styles.headerCell}>{dict.table.client}</div>
          <div className={styles.headerCell}>{dict.table.broker}</div>
          <div className={styles.headerCell}>{dict.table.city_budget}</div>
          <div className={styles.headerCell}>{dict.table.status}</div>
          <div 
            className={styles.headerCell} 
            style={{ cursor: 'pointer' }}
            onClick={toggleSort}
          >
            {dict.table.updated} <SortIcon />
          </div>
        </div>

        {isLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>{dict.loading_table}</div>
        ) : isError ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#dc2626' }}>{dict.error_table}</div>
        ) : leads.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>{dict.empty_table}</div>
        ) : (
          leads.map((deal) => {
            const statusLabel = resolveStatusName(deal.status);
            const badgeType = getStatusBadgeType(statusLabel);

            return (
              <Link href={`/${pathname.split('/')[1]}/deals/${deal.id}`} key={deal.id} className={styles.row}>
                <div className={styles.cell}>
                  <span className={styles.clientName}>{deal.title}</span>
                  {deal.contact_name && (
                    <span className={styles.comments} style={{ marginTop: 4, display: 'block', color: '#64748b', fontSize: 12 }}>
                      {deal.contact_name}
                    </span>
                  )}
                </div>
                <div className={styles.cell}>
                  <span className={styles.format}>{deal.broker_name || dict.unassigned}</span>
                </div>
                <div className={styles.cell}>
                  <div className={styles.executor}>
                    {deal.city ? `${deal.city} ` : ''}
                    {deal.budget ? `$${deal.budget.toLocaleString()}` : ''}
                    {!deal.city && !deal.budget && '—'}
                  </div>
                </div>
                <div className={styles.cell}>
                  <div className={`${styles.badge} ${styles[`badge${badgeType.charAt(0).toUpperCase() + badgeType.slice(1)}`]}`}>
                    <span className={styles.badgeDot}></span>
                    {statusLabel}
                  </div>
                </div>
                <div className={styles.cell}>
                  <span className={styles.date}>
                    {new Date(deal.updated_at).toLocaleDateString(currentLocale, { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </Link>
            );
          })
        )}
      </div>

      {pagination && pagination.total > pagination.page_size && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem', padding: '1rem' }}>
          <button 
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            style={{ padding: '0.5rem 1rem', borderRadius: 4, border: '1px solid #e2e8f0', background: page === 1 ? '#f8fafc' : 'white', cursor: page === 1 ? 'not-allowed' : 'pointer' }}
          >
            {dict.pagination.prev}
          </button>
          <span style={{ padding: '0.5rem', color: '#64748b' }}>
            {dict.pagination.page} {page} {dict.pagination.of} {Math.ceil(pagination.total / pagination.page_size)}
          </span>
          <button 
            disabled={page >= Math.ceil(pagination.total / pagination.page_size)}
            onClick={() => setPage(p => p + 1)}
            style={{ padding: '0.5rem 1rem', borderRadius: 4, border: '1px solid #e2e8f0', background: page >= Math.ceil(pagination.total / pagination.page_size) ? '#f8fafc' : 'white', cursor: page >= Math.ceil(pagination.total / pagination.page_size) ? 'not-allowed' : 'pointer' }}
          >
            {dict.pagination.next}
          </button>
        </div>
      )}
    </div>
  );
}
