'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { leadsApi } from '@/lib/api-leads';
import { DealHistory } from '@/components/deals/DealHistory';
import { BrokerSidebar } from '@/components/deals/BrokerCard';
import { BriefModal } from '@/components/deals/BriefModal';
import { RequestPayoutModal } from '@/components/payouts/RequestPayoutModal';
import styles from './DealDetailClient.module.css';

const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

const ChatIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
  </svg>
);

export function DealDetailClient({ id, locale, dict }: { id: string; locale: string; dict: any }) {
  const router = useRouter();
  const [isBriefModalOpen, setIsBriefModalOpen] = React.useState(false);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = React.useState(false);
  const [payoutRequested, setPayoutRequested] = React.useState(false);

  const { data: lead, isLoading, isError } = useQuery({
    queryKey: ['lead', id],
    queryFn: () => leadsApi.getLeadById(id),
    enabled: !!id,
  });

  const { data: pipelinesData } = useQuery({
    queryKey: ['pipelines'],
    queryFn: () => leadsApi.getPipelines(),
    staleTime: 5 * 60 * 1000,
  });

  const pipelines = pipelinesData?.items || [];
  
  React.useEffect(() => {
    if (lead?.id) {
      setPayoutRequested(localStorage.getItem(`payout_requested_${lead.id}`) === 'true');
    }
  }, [lead?.id]);

  const resolveStatusName = (rawStatus: string | null) => {
    if (!rawStatus) return dict.unknown || dict.hardcoded.unknown;
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
    return `${dict.status || dict.hardcoded.status} ${statusId}`;
  };

  if (isLoading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>{dict.loading || dict.hardcoded.loading_details}</div>;
  }

  if (isError || !lead) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#dc2626' }}>{dict.not_found || dict.hardcoded.deal_not_found}</div>;
  }

  const handlePayoutSuccess = () => {
    setIsPayoutModalOpen(false);
    setPayoutRequested(true);
    if (lead?.id) {
      localStorage.setItem(`payout_requested_${lead.id}`, 'true');
    }
  };

  const statusName = resolveStatusName(lead.status);

  // Time ago calculation
  const getRelativeTime = (dateStr: string | null) => {
    if (!dateStr) return '';
    const diffDays = Math.round((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    try {
      const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
      return rtf.format(diffDays, 'day').replace(dict.hardcoded.back, '').trim(); // Remove "назад" because we'll add it if needed or the string handles it
    } catch (e) {
      return '';
    }
  };

  const diffDays = lead.created_at ? Math.round((Date.now() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const timeStr = new Intl.RelativeTimeFormat(locale === 'ru' ? 'ru-RU' : 'en-US', { numeric: 'always' }).format(-diffDays, 'day');
  const passedText = locale === 'ru' ? `Передан ${timeStr.replace(dict.hardcoded.back, '').trim()} назад` : `Passed ${timeStr}`;

  // Extract type
  const getCustomField = (name: string) => {
    if (!lead.custom_fields || !Array.isArray(lead.custom_fields)) return null;
    const field = lead.custom_fields.find((f: any) => 
      f.field_name?.toLowerCase() === name.toLowerCase() || 
      f.name?.toLowerCase() === name.toLowerCase()
    );
    if (!field || !field.values || field.values.length === 0) return null;
    return field.values[0].value;
  };

  const propertyType = getCustomField(dict.hardcoded.type) || getCustomField(dict.hardcoded.property_type) || dict.hardcoded.hc_18;
  const formatBudget = (budget: number | null) => {
    if (!budget) return dict.hardcoded.hc_18;
    if (budget >= 1000000) return `${(budget / 1000000).toFixed(1).replace('.0', '')}M AED`;
    if (budget >= 1000) return `${(budget / 1000).toFixed(0)}K AED`;
    return `${budget.toLocaleString()} AED`;
  };

  const LockIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <a 
            href={`/${locale}/deals`}
            onClick={(e) => {
              e.preventDefault();
              if (window.history.length > 2) {
                router.back();
              } else {
                router.push(`/${locale}/deals`);
              }
            }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#1B4FA6', textDecoration: 'none', fontSize: '15px', fontWeight: 500, fontFamily: 'var(--font-inter)', cursor: 'pointer' }}
          >
            <ArrowLeftIcon /> {dict.back || dict.hardcoded.back_to_deals}
          </a>
          
          <div className={styles.titleRow}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <h1 className={styles.title}>
                {lead.title}
              </h1>
              <span style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '6px', 
                padding: '4px 12px', 
                borderRadius: '20px', 
                background: '#ecfdf5', 
                color: '#10b981', 
                fontSize: '13px', 
                fontWeight: 500 
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></span>
                {statusName}
              </span>
            </div>

            <div className={styles.actionsDesktopOnly}>
              <button 
                className={styles.btnAsk}
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('open-ticket-modal', { 
                    detail: { subject: `${dict.question_subject || dict.hardcoded.question_about_deal} ${lead.title}` } 
                  }));
                }}
              >
                <ChatIcon /> {dict.ask_question || dict.hardcoded.ask_a_question}
              </button>
            </div>

            <button 
              className={styles.btnBrief}
              onClick={() => setIsBriefModalOpen(true)}
            >
              {dict.brief || dict.hardcoded.client_brief}
            </button>
          </div>

          <div className={styles.metaRow}>
            <span style={{ fontWeight: 500 }}>{passedText}</span>
            <span style={{ color: '#71717a' }}> · ID-{lead.id}</span>
          </div>

          <div className={styles.infoCardsGrid}>
            <div className={styles.infoCard}>
              <span className={styles.infoCardLabel}>{dict.type || dict.hardcoded.type}</span>
              <span className={styles.infoCardValue}>{propertyType}</span>
            </div>
            <div className={styles.infoCard}>
              <span className={styles.infoCardLabel}>{dict.budget || dict.hardcoded.budget}</span>
              <span className={styles.infoCardValue}>{formatBudget(lead.budget)}</span>
            </div>
            {payoutRequested ? (
              <button className={`${styles.btnFinance} ${styles.financeGridItem}`} style={{ background: '#10b981', color: 'white', border: 'none', cursor: 'default' }}>
                <LockIcon />
                {dict.payout_requested || 'Выплата запрошена'}
              </button>
            ) : (
              <button 
                className={`${styles.btnFinance} ${styles.financeGridItem}`}
                style={{ background: '#1B4FA6', color: '#fff', border: 'none', cursor: 'pointer' }}
                onClick={() => setIsPayoutModalOpen(true)}
              >
                💰 {dict.request_payout || 'Запросить выплату'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className={styles.contentGrid}>
        <DealHistory lead={lead} dict={dict.history || {}} />
        <div className={styles.sidebarWrapper}>
          <BrokerSidebar lead={lead} dict={dict.broker || {}} />
        </div>
      </div>

      <BriefModal 
        isOpen={isBriefModalOpen} 
        onClose={() => setIsBriefModalOpen(false)} 
        lead={lead} 
        dict={dict.broker || {}} 
      />

      {isPayoutModalOpen && (
        <RequestPayoutModal
          onClose={() => setIsPayoutModalOpen(false)}
          onSuccess={handlePayoutSuccess}
          defaultDetails={`Сделка: ${lead.title} (ID: ${lead.id})`}
          dict={dict.payouts || { hardcoded: dict.hardcoded }}
        />
      )}
    </div>
  );
}
