import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsApi } from '@/lib/api-leads';
import type { LeadDetail } from '@/lib/api-leads';
import styles from './DealHistory.module.css';

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);

const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

const PaperclipIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
  </svg>
);

import { usePathname } from 'next/navigation';

export function DealHistory({ lead, dict }: { lead?: LeadDetail; dict?: any }) {
  const pathname = usePathname();
  const currentLocale = pathname.split('/')[1] === 'en' ? 'en-GB' : 'ru-RU';
  
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = React.useState('');

  const { data: historyData, isLoading } = useQuery({
    queryKey: ['lead-history', lead?.id],
    queryFn: () => leadsApi.getLeadHistory(lead!.id),
    enabled: !!lead?.id,
  });

  const { data: pipelinesData } = useQuery({
    queryKey: ['pipelines'],
    queryFn: () => leadsApi.getPipelines(),
    staleTime: 5 * 60 * 1000,
  });

  const pipelines = pipelinesData?.items || [];
  
  const resolveStatusName = (rawStatus: string | null) => {
    if (!rawStatus) return dict?.unknown || 'Неизвестно';
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
    return `${dict?.status || 'Статус'} ${statusId}`;
  };

  const { data: notes, isLoading: isNotesLoading } = useQuery({
    queryKey: ['lead-notes', lead?.id],
    queryFn: () => leadsApi.getLeadNotes(lead!.id),
    enabled: !!lead?.id,
    refetchInterval: 10000,
  });

  const mutation = useMutation({
    mutationFn: (text: string) => leadsApi.addLeadNote(lead!.id, text),
    onSuccess: () => {
      setCommentText('');
      queryClient.invalidateQueries({ queryKey: ['lead-notes', lead?.id] });
    }
  });

  const handleSend = () => {
    if (!commentText.trim() || mutation.isPending) return;
    mutation.mutate(commentText);
  };

  const combinedEvents = React.useMemo(() => {
    const events: Array<{ type: 'status' | 'note', date: Date, data: any }> = [];
    
    if (historyData?.items) {
      historyData.items.forEach(item => {
        events.push({
          type: 'status',
          date: new Date(item.changed_at),
          data: item
        });
      });
    }

    if (notes) {
      notes.forEach((n: any) => {
        events.push({
          type: 'note',
          date: new Date(n.createdAt),
          data: n
        });
      });
    }

    return events.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [historyData, notes]);

  if (!lead) return null;

  return (
    <div className={styles.mainContent} style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flexShrink: 0 }}>
        <div className={styles.meta} style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '6px', 
          fontFamily: 'var(--font-inter)', 
          fontWeight: 500, 
          fontSize: '16px', 
          lineHeight: '100%', 
          letterSpacing: '0%' 
        }}>
          <span style={{ color: '#003077' }}>ID-{lead.id}</span>
          <span style={{ color: '#727272' }}>· {dict?.created || 'Создано'} {new Date(lead.created_at).toLocaleDateString(currentLocale)}</span>
        </div>

        <div className={styles.infoRow}>
          <div className={styles.infoCard}>
            <div className={styles.infoLabel}>{dict?.source || 'Источник'}</div>
            <div className={styles.infoValue}>{lead.source || dict?.not_specified || 'Не указано'}</div>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.infoLabel}>{dict?.budget || 'Бюджет'}</div>
            <div className={styles.infoValue}>{lead.budget ? `$${lead.budget.toLocaleString()}` : '—'}</div>
          </div>
          <div className={styles.infoCardBlue}>
            <LockIcon />
            <span dangerouslySetInnerHTML={{ __html: dict?.finances_locked || 'Финансы появятся<br/>после закрытия' }} />
          </div>
        </div>
      </div>

      <div style={{ 
        flex: 1, 
        minHeight: 0, 
        display: 'flex', 
        flexDirection: 'column', 
        border: '1px solid #e2e8f0', 
        borderRadius: '8px', 
        overflow: 'hidden', 
        background: '#f9fafb',
        marginTop: '20px'
      }}>
        <div className={styles.feed} style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column' }}>
          
          {(isLoading || isNotesLoading) ? (
            <div style={{ textAlign: 'center', color: '#64748b', marginTop: '1rem' }}>{dict?.loading_history || 'Загрузка истории...'}</div>
          ) : combinedEvents.length === 0 ? (
            <div className={`${styles.event} ${styles.systemEvent}`} style={{ marginBottom: '8px' }}>
              <div className={styles.sysAvatar}>FY</div>
              <div className={styles.eventBody}>
                <div className={styles.eventHeader}>
                  <span className={styles.actionText}>
                    {dict?.deal_created || 'Сделка создана и передана брокеру'}
                    <span style={{ color: '#a1a1aa', marginLeft: '8px' }}>({new Date(lead.created_at).toLocaleString(currentLocale)})</span>
                  </span>
                </div>
              </div>
            </div>
          ) : (
            combinedEvents.map((event, idx) => {
              if (event.type === 'status') {
                const item = event.data;
                return (
                  <div key={`status-${idx}`} className={`${styles.event} ${styles.systemEvent}`} style={{ marginBottom: '8px' }}>
                    <div className={styles.sysAvatar}>FY</div>
                    <div className={styles.eventBody}>
                      <div className={styles.eventHeader}>
                        <span className={styles.authorName}>{item.changed_by || dict?.system || 'Система'}</span>
                        <span className={styles.actionText}>
                          {dict?.status_change || 'Изменение статуса:'} <span style={{ fontWeight: 600 }}>{item.from_status === 'Создано' ? (dict?.created || 'Создано') : (resolveStatusName(item.from_status) || (dict?.created || 'Создано'))}</span> &rarr; <span style={{ fontWeight: 600 }}>{resolveStatusName(item.to_status)}</span>
                          <span style={{ color: '#a1a1aa', marginLeft: '8px' }}>({event.date.toLocaleString(currentLocale)})</span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              } else {
                const n = event.data;
                const isPartner = n.text.includes('[От партнера') || n.text.includes('[Від партнера');
                const text = isPartner ? n.text.replace(/\[(От|Від) партнера.*?\]:\n?/, '') : n.text;
                
                return (
                  <div key={`note-${n.id}`} style={{ 
                    alignSelf: isPartner ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    backgroundColor: isPartner ? '#003077' : '#fff',
                    color: isPartner ? '#fff' : '#0f172a',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    borderBottomRightRadius: isPartner ? '4px' : '12px',
                    borderBottomLeftRadius: isPartner ? '12px' : '4px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    border: isPartner ? 'none' : '1px solid #e2e8f0',
                    marginBottom: '8px',
                    fontFamily: 'var(--font-inter)'
                  }}>
                    <div style={{ fontSize: '14px', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{text}</div>
                    <div style={{ fontSize: '11px', color: isPartner ? 'rgba(255,255,255,0.7)' : '#94a3b8', marginTop: '6px', textAlign: 'right' }}>
                      {event.date.toLocaleDateString(currentLocale, { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                );
              }
            })
          )}
          
        </div>

        <div className={styles.commentBox} style={{ margin: 0, borderRadius: 0, border: 'none', borderTop: '1px solid #e2e8f0', padding: '8px 16px', background: '#ffffff', gap: '12px' }}>
          <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#a1a1aa' }}>
            <PaperclipIcon />
            <input type="file" style={{ display: 'none' }} />
          </label>
          <input 
            type="text" 
            placeholder={dict?.type_message || "Написать сообщение..."} 
            className={styles.commentInput} 
            style={{ background: 'transparent', flex: 1 }} 
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button 
            className={`${styles.sendBtn} ${commentText.trim().length > 0 ? styles.sendBtnActive : ''}`}
            onClick={handleSend}
            disabled={mutation.isPending || !commentText.trim()}
            style={{ opacity: mutation.isPending ? 0.5 : 1 }}
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
