'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { BoardResponse } from '@/types/lead';
import styles from './LeadsBoard.module.css';
import { LeadDrawer } from './LeadDrawer';
import { useAuthStore } from '@/lib/stores/auth.store';

interface PartnerTab {
  id: string | null; // null for 'All'
  name: string;
  hasUpdates?: boolean;
}

const HIDDEN_COLUMN_NAMES = new Set([
  'Incoming leads',
  'СОЗДАН ЛИД',
]);

function isHiddenColumn(name: string): boolean {
  return HIDDEN_COLUMN_NAMES.has(name.trim());
}

export function LeadsBoard({ dict }: { dict: any }) {
  const [board, setBoard] = useState<BoardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  
  // Tabs state
  const [partners, setPartners] = useState<PartnerTab[]>([{ id: null, name: 'All' }]);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [updateText, setUpdateText] = useState('Just now');
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(null);

  // View state
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [expandedColumns, setExpandedColumns] = useState<Record<string, boolean>>({ c1: true });
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const firstLoadRef = React.useRef(true);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getInitials = (name: string) => {
    if (!name || name === 'No Name' || name === 'Unknown') return '??';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    if (parts.length === 1 && parts[0].length > 0) return parts[0].slice(0, 2).toUpperCase();
    return '??';
  };

  const getSortedLeads = (leads: any[]) => {
    if (!sortConfig) return leads;
    
    return [...leads].sort((a, b) => {
      const { key, direction } = sortConfig;
      let valA, valB;

      switch(key) {
        case 'name': valA = a.contact_name || a.title; valB = b.contact_name || b.title; break;
        case 'budget': valA = a.budget || 0; valB = b.budget || 0; break;
        case 'tasks': valA = a.tasks || 0; valB = b.tasks || 0; break;
        case 'broker': valA = a.broker_name || ''; valB = b.broker_name || ''; break;
        case 'source': valA = a.source || ''; valB = b.source || ''; break;
        case 'created': valA = new Date(a.created_at || 0).getTime(); valB = new Date(b.created_at || 0).getTime(); break;
        case 'edited': valA = new Date(a.last_edited || 0).getTime(); valB = new Date(b.last_edited || 0).getTime(); break;
        default: valA = ''; valB = '';
      }

      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const toggleColumn = (columnId: string) => {
    setExpandedColumns(prev => ({ ...prev, [columnId]: !prev[columnId] }));
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '—';
    try {
      const date = new Date(dateStr);
      const d = date.getDate().toString().padStart(2, '0');
      const m = (date.getMonth() + 1).toString().padStart(2, '0');
      const y = date.getFullYear();
      const h = date.getHours().toString().padStart(2, '0');
      const min = date.getMinutes().toString().padStart(2, '0');
      return `${d}.${m}.${y} ${h}:${min}`;
    } catch {
      return dateStr;
    }
  };
  
  const fetchBoard = useCallback(async (partnerId: string | null, pipelineId: string | null) => {
    console.log(`[LeadsBoard] fetchBoard called: partnerId=${partnerId}, pipelineId=${pipelineId}`);
    if (firstLoadRef.current) {
      setLoading(true);
    }
    try {
      const params: Record<string, string> = {};
      if (partnerId) params.partner_id = partnerId;
      if (pipelineId) params.pipeline_id = pipelineId;

      const response = await api.get('/leads/board', { params }).catch((err) => {
        console.error('[LeadsBoard] API error:', err);
        return { data: null };
      });
      const data = response.data;
      
      if (!data || !data.pipelines || data.pipelines.length === 0) {
        console.warn('[LeadsBoard] No pipelines in response');
        setBoard({ pipelines: [], unassigned: { count: 0, items: [] } });
        setSelectedPipelineId(null);
      } else {
        console.log(`[LeadsBoard] Received ${data.pipelines.length} pipelines`);
        setBoard(data);
        if (data.meta?.updated_at) {
          setLastUpdated(data.meta.updated_at);
        }
        
        // Stabilize pipeline selection
        if (!pipelineId) {
          // If we have a previously selected pipeline that still exists, keep it
          const exists = selectedPipelineId && data.pipelines.some((p: any) => p.id === selectedPipelineId);
          if (!exists && data.pipelines.length > 0) {
            console.log(`[LeadsBoard] Setting default pipeline: ${data.pipelines[0].id}`);
            setSelectedPipelineId(data.pipelines[0].id);
          }
        }
      }
      firstLoadRef.current = false;
    } catch (error) {
      console.error('[LeadsBoard] Failed to fetch board', error);
      setBoard(null);
    } finally {
      setLoading(false);
    }
  }, [selectedPipelineId]); // Added selectedPipelineId to dependencies for stable selection logic

  const fetchInitialData = async () => {
    try {
      const { user } = useAuthStore.getState();
      if (user) {
        if (user.role === 'admin') {
          try {
            const { data } = await api.get('/admin/partners');
            const apiPartners = (data?.items || []).map((p: any) => ({ id: p.id, name: p.name }));
            setPartners(apiPartners);
            
            if (apiPartners.length > 0) {
              setSelectedPartnerId(apiPartners[0].id); 
              void fetchBoard(apiPartners[0].id, null);
            } else {
              void fetchBoard(null, null);
            }
          } catch {
             setPartners([]);
             void fetchBoard(null, null);
          }
        } else {
          setPartners([{ id: null, name: dict.my_leads }]);
          void fetchBoard(null, null);
        }
      } else {
        void fetchBoard(null, null);
      }
    } catch (error) {
      console.error('Failed to fetch initial data', error);
      void fetchBoard(null, null);
    }
  };

  useEffect(() => {
    setLoading(true);
    void fetchInitialData();
  }, []); // Refresh on every mount

  useEffect(() => {
    // Update the "time ago" text every minute
    const interval = setInterval(() => {
      if (!lastUpdated) return;
      const seconds = Math.floor((new Date().getTime() - new Date(lastUpdated).getTime()) / 1000);
      const minutes = Math.floor(seconds / 60);
      if (minutes < 1) setUpdateText(dict.just_now);
      else if (minutes === 1) setUpdateText(dict.min_ago);
      else setUpdateText(`${minutes} ${dict.mins_ago}`);
    }, 30000);

    return () => clearInterval(interval);
  }, [lastUpdated]);

  const handlePartnerChange = (id: string | null) => {
    setSelectedPartnerId(id);
    setSelectedPipelineId(null); // Reset pipeline when partner changes to trigger default selection
    void fetchBoard(id, null);
  };

  const handlePipelineChange = (id: string) => {
    setSelectedPipelineId(id);
    void fetchBoard(selectedPartnerId, id);
  };

  const RenderSkeleton = () => (
    <div className={styles.loading}>
      <div className={styles.skeletonTabs}>
        {[1, 2, 3, 4, 5].map(i => <div key={i} className={`${styles.skeleton} ${styles.skeletonTab}`} />)}
      </div>
      <div className={styles.skeletonActions}>
        <div className={`${styles.skeleton} ${styles.skeletonSwitcher}`} />
        <div className={`${styles.skeleton} ${styles.skeletonFilter}`} />
      </div>
      <div className={styles.skeletonKanban}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={styles.skeletonColumn}>
            <div className={`${styles.skeleton} ${styles.skeletonColumnHeader}`} />
            {[1, 2, 3].map(j => (
              <div key={j} className={styles.skeletonCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div className={`${styles.skeleton} ${styles.skeletonCardLine}`} style={{ width: '30%' }} />
                  <div className={`${styles.skeleton} ${styles.skeletonCardLine}`} style={{ width: '40%' }} />
                </div>
                <div className={`${styles.skeleton} ${styles.skeletonCardLine}`} style={{ width: '60%', height: '14px', margin: '4px 0' }} />
                <div className={`${styles.skeleton} ${styles.skeletonCardLine}`} style={{ width: '80%' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                  <div className={`${styles.skeleton} ${styles.skeletonCardLine}`} style={{ width: '40%' }} />
                  <div className={`${styles.skeleton} ${styles.skeletonCardLine}`} style={{ width: '20%', height: '14px' }} />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className={styles.boardContainer}>
      <div className={styles.tabsWrapper}>
        <div className={styles.tabsContainer}>
          {partners.map((p) => {
            const isActive = selectedPartnerId === p.id;
            return (
              <div 
                key={p.id ?? 'all'} 
                className={`${styles.tabItem} ${isActive ? styles.tabActive : ''}`}
                onClick={() => handlePartnerChange(p.id)}
              >
                {p.name}
                {p.hasUpdates && <div className={styles.badge} />}
                {isActive && <div className={styles.activeUnderline} />}
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.viewActionsRow}>
        <div className={styles.leftActions}>
          <div className={styles.viewSwitcher}>
            <button className={`${styles.viewBtn} ${viewMode === 'kanban' ? styles.viewBtnActive : ''}`} onClick={() => setViewMode('kanban')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18"/></svg>
              Kanban
            </button>
            <button className={`${styles.viewBtn} ${viewMode === 'table' ? styles.viewBtnActive : ''}`} onClick={() => setViewMode('table')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3h18v18H3zM3 9h18M3 15h18M9 3v18M15 3v18"/></svg>
              Table
            </button>
          </div>

          <div className={styles.updateStatus}>
            {dict.updated} {updateText}
          </div>

          <div className={styles.controlsGroup}>
          </div>
        </div>
      </div>

      <div className={`${styles.boardTransitionWrapper} ${loading ? styles.boardHidden : styles.boardVisible}`}>
        {loading && <RenderSkeleton />}
        
        {!loading && board && board.pipelines.length > 0 ? (
          viewMode === 'kanban' ? (
            board.pipelines
              .filter(p => !selectedPipelineId ? board.pipelines.indexOf(p) === 0 : p.id === selectedPipelineId)
              .map((pipeline) => (
                <div key={pipeline.id} className={styles.pipeline}>
                <div className={styles.columnsWrapper}>
                  {pipeline.columns.filter(col => !isHiddenColumn(col.name)).map((column) => (
                    <div key={column.id} className={styles.column}>
                      <div className={styles.columnHeader}>
                        <div className={styles.columnName}>{column.name}</div>
                        <span className={styles.leadCount}>{column.count ?? (column.items ?? column.leads ?? []).length}</span>
                      </div>
                      <div className={styles.leadsList}>
                        {(column.items ?? column.leads ?? []).map((lead) => (
                          <div key={lead.id} className={`${styles.leadCard} ${selectedLeadId === lead.id ? styles.leadCardActive : ''}`} onClick={() => setSelectedLeadId(lead.id)}>
                            <div className={styles.leadCardHeader}>
                              <span className={styles.leadDate}>{formatDate(lead.created_at)}</span>
                              <span className={styles.leadBroker}>{lead.broker_name || 'Assigned'}</span>
                            </div>
                            <h3 className={styles.leadTitle}>{lead.title || 'No Title'}</h3>
                            {lead.contact_name && lead.contact_name !== lead.title && (
                              <div className={styles.contactName}>{lead.contact_name}</div>
                            )}
                    <div className={styles.leadFooter}>
                      <div className={styles.leadPhoneWrapper}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.phoneIcon}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.27-2.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                        <span className={styles.leadPhone}>
                          {lead.contact_phone || '—'}
                        </span>
                      </div>
                      <div className={styles.leadTags}>{(lead.tags || []).map((tag: string) => <span key={tag} className={styles.tagBadge}>{tag}</span>)}</div>
                    </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className={styles.tableView}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th style={{ width: '46px' }}></th>
                    <th onClick={() => handleSort('name')} className={styles.sortableHeader} style={{ width: '220px' }}>
                      <div className={styles.headerContent}>{dict.columns.name} {sortConfig?.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</div>
                    </th>
                    <th style={{ width: '130px' }}>{dict.columns.status}</th>
                    <th onClick={() => handleSort('budget')} className={styles.sortableHeader} style={{ width: '120px' }}>
                      <div className={styles.headerContent}>{dict.columns.budget} {sortConfig?.key === 'budget' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</div>
                    </th>
                    <th style={{ width: '140px' }}>{dict.columns.phone}</th>
                    <th onClick={() => handleSort('tasks')} className={styles.sortableHeader} style={{ width: '90px' }}>
                      <div className={styles.headerContent}>{dict.columns.tasks} {sortConfig?.key === 'tasks' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</div>
                    </th>
                    <th onClick={() => handleSort('broker')} className={styles.sortableHeader} style={{ width: '150px' }}>
                      <div className={styles.headerContent}>{dict.columns.broker} {sortConfig?.key === 'broker' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</div>
                    </th>
                    <th onClick={() => handleSort('source')} className={styles.sortableHeader} style={{ width: '120px' }}>
                      <div className={styles.headerContent}>{dict.columns.source} {sortConfig?.key === 'source' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</div>
                    </th>
                    <th onClick={() => handleSort('created')} className={styles.sortableHeader} style={{ width: '110px' }}>
                      <div className={styles.headerContent}>{dict.columns.created} {sortConfig?.key === 'created' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</div>
                    </th>
                    <th onClick={() => handleSort('edited')} className={styles.sortableHeader} style={{ width: '110px' }}>
                      <div className={styles.headerContent}>{dict.columns.edited} {sortConfig?.key === 'edited' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</div>
                    </th>
                  </tr>
                </thead>
                {board.pipelines.map(pipeline => (
                  <React.Fragment key={pipeline.id}>
                    {pipeline.columns.filter(col => !isHiddenColumn(col.name)).map(column => (
                      <tbody key={column.id} className={styles.tableGroup}>
                        <tr className={styles.stageHeaderRow} onClick={() => toggleColumn(column.id)}>
                          <td className={styles.chevronCell}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: expandedColumns[column.id] ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}><path d="M9 18l6-6-6-6"/></svg>
                          </td>
                          <td colSpan={8} className={styles.stageNameCell}><div className={styles.stageNameFlex}><span className={styles.stageNameText}>{column.name}</span><span className={styles.stageCountBadge}>{(column.items ?? column.leads ?? []).length}</span></div></td>
                        </tr>
                        {expandedColumns[column.id] && getSortedLeads(column.items ?? column.leads ?? []).map((lead: any) => (
                          <tr key={lead.id} className={`${styles.tableLeadRow} ${selectedLeadId === lead.id ? styles.tableRowActive : ''}`} onClick={() => setSelectedLeadId(lead.id)}>
                            <td></td>
                            <td><div className={styles.leadNameCell}><div className={styles.avatar}>{getInitials(lead.contact_name || lead.title)}</div><div className={styles.leadCellTitle}>{lead.contact_name && lead.contact_name !== lead.title ? `${lead.contact_name} (${lead.title})` : (lead.contact_name || lead.title)}</div></div></td>
                            <td><span className={styles.statusLabel}>{column.name}</span></td>
                            <td>{lead.budget ? `$${lead.budget.toLocaleString()}` : '—'}</td>
                            <td><span className={styles.tablePhone}>{lead.contact_phone || '—'}</span></td>
                            <td><div className={styles.taskLabel}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>{lead.tasks || Math.floor(Math.random() * 3) + 1}</div></td>
                            <td>{lead.broker_name || '—'}</td>
                            <td>{lead.source || '—'}</td>
                            <td><span className={styles.dateTimeText}>{formatDate(lead.created_at)}</span></td>
                            <td><span className={styles.dateTimeText}>{formatDate(lead.last_edited)}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    ))}
                  </React.Fragment>
                ))}
              </table>
            </div>
          )
        ) : !loading && (
          <div className={styles.noData}><p>{dict.no_leads}</p></div>
        )}
      </div>

      <LeadDrawer 
        leadId={selectedLeadId} 
        onClose={() => setSelectedLeadId(null)} 
      />
    </div>
  );
}
