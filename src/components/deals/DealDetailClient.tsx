'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { leadsApi } from '@/lib/api-leads';
import { DealHistory } from '@/components/deals/DealHistory';
import { BrokerSidebar } from '@/components/deals/BrokerCard';

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.5rem 2rem 32px 2rem', 
        background: 'linear-gradient(0deg, #f8fafc 0px, #ffffff 16px)',
        borderBottom: '1px solid #e2e8f0',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <Link href={`/${locale}/deals`} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#1B4FA6', textDecoration: 'none', fontSize: '14px', fontWeight: 500, fontFamily: 'var(--font-inter)' }}>
            <ArrowLeftIcon /> {dict.back || 'Вернуться к сделкам'}
          </Link>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 600, color: '#003077', margin: 0, lineHeight: 1, fontFamily: 'var(--font-inter)' }}>
              {lead.title}
            </h1>
            <span style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              background: 'var(--Color-Tokens-Background-Green, #EEF5F0)', 
              color: 'var(--Color-Tokens-Interaction-Green-Base, #589E67)', 
              padding: '6px 12px', 
              borderRadius: '100px',
              fontSize: '14px',
              fontWeight: 500,
              lineHeight: '150%',
              letterSpacing: '0%',
              fontFamily: 'var(--font-inter)'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--Color-Tokens-Interaction-Green-Base, #589E67)' }}></span>
              {statusName}
            </span>
          </div>
        </div>

        <button 
          onClick={() => {
            window.dispatchEvent(new CustomEvent('open-ticket-modal', { 
              detail: { subject: `${dict.question_subject || 'Вопрос по сделке:'} ${lead.title}` } 
            }));
          }}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            backgroundColor: '#f8fafc', 
            color: '#003077', 
            border: '1px solid #e2e8f0',
            padding: '10px 20px', 
            borderRadius: '6px', 
            fontWeight: 500,
            fontSize: '14px',
            fontFamily: 'var(--font-inter)',
            cursor: 'pointer'
          }}
        >
          <ChatIcon /> {dict.ask_question || 'Задать вопрос'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', padding: '2rem', flex: 1, minHeight: 0 }}>
        <DealHistory lead={lead} dict={dict.history || {}} />
        <div style={{ overflowY: 'auto', paddingRight: '4px', height: '100%' }}>
          <BrokerSidebar lead={lead} dict={dict.broker || {}} />
        </div>
      </div>
    </div>
  );
}
