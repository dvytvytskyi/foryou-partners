'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { LeadDetail } from '@/types/lead';
import styles from './LeadDrawer.module.css';

import dictRu from '@/i18n/dictionaries/ru.json';
import dictEn from '@/i18n/dictionaries/en.json';
const dict = typeof window !== 'undefined' && window.location.pathname.startsWith('/en') ? dictEn : dictRu;

interface Message {
  id: string;
  sender: 'system' | 'broker' | 'partner' | 'client';
  senderName: string;
  text: string;
  timestamp: string;
}

interface LeadDrawerProps {
  leadId: string | null;
  isOpen?: boolean;
  onClose: () => void;
  dict?: any;
}

export function LeadDrawer({ leadId, isOpen, onClose, dict }: LeadDrawerProps) {
  const [lead, setLead] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (leadId) {
      void fetchLeadDetails();
    } else {
      setLead(null);
    }
  }, [leadId]);

  const fetchLeadDetails = async () => {
    setLoading(true);
    try {
      const [leadRes, historyRes] = await Promise.allSettled([
        api.get<any>(`/leads/${leadId}`),
        api.get<any>(`/leads/${leadId}/history`),
      ]);

      if (leadRes.status === 'fulfilled' && leadRes.value.data) {
        setLead({
          ...leadRes.value.data,
          custom_fields: leadRes.value.data.custom_fields || [],
        });
      } else {
        setLead(null);
      }

      if (historyRes.status === 'fulfilled' && historyRes.value.data?.items?.length > 0) {
        const realMessages: Message[] = historyRes.value.data.items.map((h: any, idx: number) => {
          const fromName = h.from_status_name ?? h.from_status ?? '—';
          const toName = h.to_status_name ?? h.to_status ?? '—';
          const text = fromName ? `${fromName} → ${toName}` : (dict?.hardcoded?.status_set ? `${dict.hardcoded.status_set} ${toName}` : `Status set to: ${toName}`);
          return {
            id: String(idx),
            sender: 'system' as const,
            senderName: 'System',
            text,
            timestamp: h.changed_at,
          };
        });
        setMessages(realMessages);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to fetch lead details', error);
    } finally {
      setLoading(false);
    }
  };

  const getCustomFieldValue = (fieldName: string) => {
    if (!lead?.custom_fields) return '—';
    const field = lead.custom_fields.find((f: any) => f.field_name === fieldName);
    if (!field || !field.values || field.values.length === 0) return '—';
    return field.values[0].value;
  };

  const content = (
    <div 
      className={`${styles.drawer} ${leadId ? styles.drawerOpen : ''}`} 
      onClick={e => e.stopPropagation()}
    >
      <div className={styles.header}>
        <div className={styles.headerTitleGroup}>
          <h2 className={styles.title}>{lead?.title || 'Lead Details'}</h2>
          <span className={styles.idBadge}>ID: {leadId}</span>
        </div>
        <button className={styles.closeButton} onClick={onClose}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <div className={styles.content}>
        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <p>Loading details...</p>
          </div>
        ) : lead ? (
          <>
            {/* Main Info Section */}
            <div className={styles.sectionHeader}>
              <Icon name="User" />
              <h3>Contact Information</h3>
            </div>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <label>Contact Name</label>
                <div className={styles.value}>{lead.contact?.name || '—'}</div>
              </div>
              <div className={styles.infoItem}>
                <label>Phone Number</label>
                <div className={styles.value} style={{ color: '#003077', fontWeight: '600' }}>{lead.contact?.phone || '—'}</div>
              </div>
              <div className={styles.infoItem}>
                <label>Email Address</label>
                <div className={styles.value}>{lead.contact?.email || '—'}</div>
              </div>
              <div className={styles.infoItem}>
                <label>City / Location</label>
                <div className={styles.value}>{lead.city || '—'}</div>
              </div>
            </div>

            <div className={styles.divider} />

            <div className={styles.sectionHeader}>
              <Icon name="Briefcase" />
              <h3>Deal Details</h3>
            </div>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <label>Stage</label>
                <div className={styles.value}>
                  <span className={styles.statusBadge}>{lead.status}</span>
                </div>
              </div>
              <div className={styles.infoItem}>
                <label>Responsible Broker</label>
                <div className={styles.agentValue}>
                  <div className={styles.tinyAvatar}>{lead.broker?.name?.charAt(0) || 'B'}</div>
                  {lead.broker?.name || 'Unassigned'}
                </div>
              </div>
              <div className={styles.infoItem}>
                <label>Budget (USD)</label>
                <div className={styles.value} style={{ color: '#059669', fontWeight: '700' }}>
                  {lead.budget ? `$${lead.budget.toLocaleString()}` : '—'}
                </div>
              </div>
              <div className={styles.infoItem}>
                <label>Property Value (AED)</label>
                <div className={styles.value}>{getCustomFieldValue(dict.hardcoded.property_value_in_dirhams)}</div>
              </div>
              <div className={styles.infoItem}>
                <label>Source</label>
                <div className={styles.value}>{lead.source || getCustomFieldValue(dict.hardcoded.source)}</div>
              </div>
              <div className={styles.infoItem}>
                <label>Client Type</label>
                <div className={styles.value}>{getCustomFieldValue(dict.hardcoded.client_type)}</div>
              </div>
            </div>

            <div className={styles.divider} />

            <div className={styles.sectionHeader}>
              <Icon name="PlusCircle" />
              <h3>Additional Information</h3>
            </div>
            <div className={styles.customFieldsGrid}>
              <div className={styles.fieldRow}>
                <span className={styles.fieldLabel}>Goal:</span>
                <span className={styles.fieldValue}>{getCustomFieldValue(dict.hardcoded.purpose_of_purchase)}</span>
              </div>
              <div className={styles.fieldRow}>
                <span className={styles.fieldLabel}>Timeline:</span>
                <span className={styles.fieldValue}>{getCustomFieldValue(dict.hardcoded.when_do_you_plan_to_purchase_p)}</span>
              </div>
              <div className={styles.fieldRow}>
                <span className={styles.fieldLabel}>Warmth:</span>
                <span className={styles.fieldValue}>{getCustomFieldValue(dict.hardcoded.warmth)}</span>
              </div>
              <div className={styles.fieldRow}>
                <span className={styles.fieldLabel}>Commission (%):</span>
                <span className={styles.fieldValue}>{getCustomFieldValue(dict.hardcoded._commission)}</span>
              </div>
              <div className={styles.fieldRow}>
                <span className={styles.fieldLabel}>Commission (AED):</span>
                <span className={styles.fieldValue}>{getCustomFieldValue(dict.hardcoded.commission_amount_in_dirhams)}</span>
              </div>
              <div className={styles.fieldRow}>
                <span className={styles.fieldLabel}>Comments:</span>
                <span className={styles.fieldValue}>{lead.comment || '—'}</span>
              </div>
            </div>

            <div className={styles.divider} />

            {/* Chat Section */}
            <div className={styles.chatSection}>
              <h3 className={styles.chatTitle}>Internal Notes & History</h3>
              <div className={styles.messagesList}>
                {messages.length === 0 ? (
                  <p className={styles.emptyHistory}>{dict.hardcoded.no_entries_in_the_change_log}</p>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className={`${styles.messageWrapper} ${styles[`msg-${msg.sender}`]}`}>
                      {msg.sender !== 'system' && (
                        <div className={styles.msgAvatar}>{msg.senderName.charAt(0)}</div>
                      )}
                      <div className={styles.msgContent}>
                        <div className={styles.messageMeta}>
                          <span className={styles.senderName}>{msg.senderName}</span>
                          <span className={styles.msgTime}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className={styles.messageBubble}>{msg.text}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        ) : (
          <div className={styles.noData}><p>Lead details not found.</p></div>
        )}
      </div>
    </div>
  );

  return (
    <div className={`${styles.overlay} ${leadId ? styles.overlayVisible : ''}`} onClick={onClose}>
      {content}
    </div>
  );
}

function Icon({ name }: { name: string }) {
  switch (name) {
    case 'User': return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
    case 'Briefcase': return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>;
    case 'PlusCircle': return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>;
    default: return null;
  }
}
