'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { LeadDetail, LeadHistoryItem } from '@/types/lead';
import styles from './LeadDrawer.module.css';

interface LeadDrawerProps {
  leadId: string | null;
  onClose: () => void;
}

export function LeadDrawer({ leadId, onClose }: LeadDrawerProps) {
  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<LeadHistoryItem[]>([]);

  useEffect(() => {
    if (leadId) {
      fetchLeadDetails();
    } else {
      setLead(null);
    }
  }, [leadId]);

  const fetchLeadDetails = async () => {
    setLoading(true);
    try {
      const [{ data: leadData }, { data: historyData }] = await Promise.all([
        api.get(`/leads/${leadId}`),
        api.get(`/leads/${leadId}/history`)
      ]);
      setLead(leadData);
      setHistory(Array.isArray(historyData?.items) ? historyData.items : []);
    } catch (error) {
      console.error('Failed to fetch lead details', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${styles.overlay} ${leadId ? styles.overlayVisible : ''}`} onClick={onClose}>
      <div className={`${styles.drawer} ${leadId ? styles.drawerOpen : ''}`} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Lead Details</h2>
          <button className={styles.closeButton} onClick={onClose}>&times;</button>
        </div>

        <div className={styles.content}>
          {loading ? (
            <p>Loading details...</p>
          ) : lead ? (
            <>
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>General Information</h3>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Title</span>
                  <span className={styles.detailValue}>{lead.title}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Budget</span>
                  <span className={styles.detailValue} style={{ color: 'var(--primary-color)', fontWeight: '700' }}>
                    {lead.budget !== null
                      ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(lead.budget)
                      : 'N/A'}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Status</span>
                  <span className={styles.detailValue}>{lead.status}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>City</span>
                  <span className={styles.detailValue}>{lead.city || 'Not specified'}</span>
                </div>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Responsible Broker</h3>
                <div className={styles.brokerCard}>
                  <div className={styles.brokerAvatar}>
                    {lead.broker?.name?.charAt(0) || 'B'}
                  </div>
                  <div className={styles.brokerInfo}>
                    <span className={styles.brokerName}>{lead.broker?.name || 'Assigned soon'}</span>
                    <span className={styles.brokerPhone}>{lead.broker?.phone || 'Contact for details'}</span>
                  </div>
                </div>
                {lead.broker?.phone && (
                  <button className={styles.ctaButton} onClick={() => window.location.href = `tel:${lead.broker.phone}`}>
                    Call Broker
                  </button>
                )}
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Status History</h3>
                <div className="flex flex-col gap-4">
                  {history.length > 0 ? history.map((h, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="w-2 h-2 rounded-full bg-primary-color mt-1.5" style={{ backgroundColor: 'var(--primary-color)' }} />
                      <div className="flex flex-col">
                        <span style={{ fontSize: '13px', fontWeight: '500' }}>{h.to_status}</span>
                        <span style={{ fontSize: '11px', color: 'var(--grey-400)' }}>
                          {new Date(h.changed_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )) : (
                    <p style={{ fontSize: '12px', color: 'var(--grey-400)' }}>No history available</p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <p>Lead not found</p>
          )}
        </div>
      </div>
    </div>
  );
}
