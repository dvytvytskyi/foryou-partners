'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { leadsApi } from '@/lib/api-leads';
import { DealHistory } from '@/components/deals/DealHistory';
import { BrokerSidebar } from '@/components/deals/BrokerCard';
import { BriefModal } from '@/components/deals/BriefModal';
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
  
  const resolveStatusName = (rawStatus: string | null) => {
    if (!rawStatus) return dict.unknown || 'Неизвестно';
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
    return `${dict.status || 'Статус'} ${statusId}`;
  };

  if (isLoading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>{dict.loading || 'Загрузка деталей...'}</div>;
  }

  if (isError || !lead) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#dc2626' }}>{dict.not_found || 'Сделка не найдена'}</div>;
  }

  const statusName = resolveStatusName(lead.status);

  // Time ago calculation
  const getRelativeTime = (dateStr: string | null) => {
    if (!dateStr) return '';
    const diffDays = Math.round((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    try {
      const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
      return rtf.format(diffDays, 'day').replace('назад', '').trim(); // Remove "назад" because we'll add it if needed or the string handles it
    } catch (e) {
      return '';
    }
  };

  const diffDays = lead.createdAtSource ? Math.round((Date.now() - new Date(lead.createdAtSource).getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const timeStr = new Intl.RelativeTimeFormat(locale === 'ru' ? 'ru-RU' : 'en-US', { numeric: 'always' }).format(-diffDays, 'day');
  const passedText = locale === 'ru' ? `Передан ${timeStr.replace('назад', '').trim()} назад` : `Passed ${timeStr}`;

  // Extract type
  const getCustomField = (name: string) => {
    if (!lead.customFields || !Array.isArray(lead.customFields)) return null;
    const field = lead.customFields.find((f: any) => 
      f.field_name?.toLowerCase() === name.toLowerCase() || 
      f.name?.toLowerCase() === name.toLowerCase()
    );
    if (!field || !field.values || field.values.length === 0) return null;
    return field.values[0].value;
  };

  const propertyType = getCustomField('Тип') || getCustomField('Тип недвижимости') || 'Не указано';
  const formatBudget = (budget: number | null) => {
    if (!budget) return 'Не указано';
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
            <ArrowLeftIcon /> {dict.back || 'Назад к сделкам'}
          </a>
          
          <div className={styles.titleRow}>
            <h1 className={styles.title}>
              {lead.title}
            </h1>
            <button 
              className={styles.btnBrief}
              onClick={() => setIsBriefModalOpen(true)}
            >
              {dict.brief || 'Бриф клиента'}
            </button>
          </div>

          <div className={styles.metaRow}>
            <span style={{ fontWeight: 500 }}>{passedText}</span>
            <span style={{ color: '#71717a' }}> · ID-{lead.externalLeadId || lead.id}</span>
          </div>

          <div className={styles.infoCardsGrid}>
            <div className={styles.infoCard}>
              <span className={styles.infoCardLabel}>{dict.type || 'Тип'}</span>
              <span className={styles.infoCardValue}>{propertyType}</span>
            </div>
            <div className={styles.infoCard}>
              <span className={styles.infoCardLabel}>{dict.budget || 'Бюджет'}</span>
              <span className={styles.infoCardValue}>{formatBudget(lead.budget)}</span>
            </div>
          </div>

          <button className={styles.btnFinance}>
            <LockIcon />
            {dict.finances_locked || 'Финансы появятся после закрытия'}
          </button>
        </div>

        <div className={styles.actionsDesktopOnly}>
          <button 
            className={styles.btnAsk}
            onClick={() => {
              window.dispatchEvent(new CustomEvent('open-ticket-modal', { 
                detail: { subject: `${dict.question_subject || 'Вопрос по сделке:'} ${lead.title}` } 
              }));
            }}
          >
            <ChatIcon /> {dict.ask_question || 'Задать вопрос'}
          </button>
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
    </div>
  );
}
