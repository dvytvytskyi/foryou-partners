'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { BoardResponse } from '@/types/lead';
import styles from './LeadsBoard.module.css';
import { LeadDrawer } from './LeadDrawer';

export function LeadsBoard() {
  const [board, setBoard] = useState<BoardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [adminPartnerId, setAdminPartnerId] = useState<string | null>(null);
  
  // Filters
  const [search, setSearch] = useState('');

  useEffect(() => {
    void fetchBoard();
  }, []);

  const fetchBoard = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search.trim()) params.search = search.trim();

      const userRaw = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      if (userRaw) {
        try {
          const user = JSON.parse(userRaw) as { role?: string; partner_id?: string | null };
          if (user.role === 'admin') {
            let partnerId = adminPartnerId;
            if (!partnerId) {
              const { data: partnersData } = await api.get('/admin/partners');
              partnerId = partnersData?.items?.[0]?.id ?? null;
              if (partnerId) setAdminPartnerId(partnerId);
            }
            if (partnerId) params.partner_id = partnerId;
          }
        } catch {
          // ignore invalid user localStorage payload
        }
      }

      const { data } = await api.get('/leads/board', {
        params,
      });
      setBoard(data);
    } catch (error) {
      console.error('Failed to fetch board', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      fetchBoard();
    }
  };

  return (
    <div className={styles.boardContainer}>
      {/* Board Filters */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-4">
          <input 
            type="text" 
            placeholder="Search leads..." 
            className="input"
            style={{ width: '300px' }}
            value={search}
            onChange={handleSearchChange}
            onKeyPress={handleSearchKeyPress}
          />
          <button className="button button-primary" style={{ width: 'auto' }} onClick={fetchBoard}>
            Filter
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-20">
          <p>Loading board data...</p>
        </div>
      ) : board && board.pipelines.map((pipeline) => (
        <div key={pipeline.id} className={styles.pipeline}>
          <h2 className={styles.pipelineTitle}>{pipeline.name}</h2>
          <div className={styles.columnsWrapper}>
            {pipeline.columns.map((column) => (
              <div key={column.id} className={styles.column}>
                <div className={styles.columnHeader}>
                  <div className={styles.columnName}>
                    <div className={styles.statusDot} style={{ backgroundColor: column.color || 'var(--grey-300)' }} />
                    {column.name}
                  </div>
                  <span className={styles.leadCount}>{column.count ?? column.items?.length ?? column.leads?.length ?? 0}</span>
                </div>
                <div className={styles.leadsList}>
                  {(column.items ?? column.leads ?? []).map((lead) => (
                    <div 
                      key={lead.id} 
                      className={styles.leadCard}
                      onClick={() => setSelectedLeadId(lead.id)}
                    >
                      <h3 className={styles.leadTitle}>{lead.title}</h3>
                      <p className={styles.leadBudget}>
                        {lead.budget !== null
                          ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(lead.budget)
                          : 'N/A'}
                      </p>
                      <div className={styles.leadMeta}>
                        <span className={styles.metaBadge}>{lead.city || 'No city'}</span>
                        <span className={styles.metaBadge}>{lead.broker_name || 'No broker'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <LeadDrawer 
        leadId={selectedLeadId} 
        onClose={() => setSelectedLeadId(null)} 
      />
    </div>
  );
}
