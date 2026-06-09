'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsApi } from '@/lib/api-leads';

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);

import { usePathname } from 'next/navigation';

export function LeadChat({ leadId, isOpen, onClose }: { leadId: string, isOpen: boolean, onClose: () => void }) {
  const pathname = usePathname();
  const currentLocale = pathname.split('/')[1] === 'en' ? 'en-GB' : 'ru-RU';
  
  const [message, setMessage] = useState('');
  const queryClient = useQueryClient();

  const { data: notes, isLoading } = useQuery({
    queryKey: ['lead-notes', leadId],
    queryFn: () => leadsApi.getLeadNotes(leadId),
    enabled: isOpen,
    refetchInterval: isOpen ? 10000 : false, // Poll every 10s if open
  });

  const mutation = useMutation({
    mutationFn: (text: string) => leadsApi.addLeadNote(leadId, text),
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['lead-notes', leadId] });
    }
  });

  const handleSend = () => {
    if (!message.trim()) return;
    mutation.mutate(message);
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.4)',
          zIndex: 40,
          backdropFilter: 'blur(2px)'
        }}
        onClick={onClose}
      />
      <div 
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '400px',
          backgroundColor: '#fff',
          zIndex: 50,
          boxShadow: '-4px 0 24px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'var(--font-inter)'
        }}
      >
        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', margin: 0 }}>Комментарийі / Чат</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <CloseIcon />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', background: '#f8fafc' }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', color: '#64748b' }}>Загрузка...</div>
          ) : notes?.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#64748b', fontSize: '14px', marginTop: '2rem' }}>Нет сообщений. Напишите брокеру.</div>
          ) : (
            notes?.map((n: any) => {
              const isPartner = n.text.includes('[От партнера');
              const text = isPartner ? n.text.split(']:\n')[1] : n.text;
              return (
                <div key={n.id} style={{ 
                  alignSelf: isPartner ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  backgroundColor: isPartner ? '#003077' : '#fff',
                  color: isPartner ? '#fff' : '#0f172a',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  borderBottomRightRadius: isPartner ? '4px' : '12px',
                  borderBottomLeftRadius: isPartner ? '12px' : '4px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  border: isPartner ? 'none' : '1px solid #e2e8f0'
                }}>
                  <div style={{ fontSize: '14px', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{text}</div>
                  <div style={{ fontSize: '11px', color: isPartner ? 'rgba(255,255,255,0.7)' : '#94a3b8', marginTop: '6px', textAlign: 'right' }}>
                    {new Date(n.createdAt).toLocaleDateString(currentLocale, { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div style={{ padding: '20px', borderTop: '1px solid #e2e8f0', backgroundColor: '#fff', display: 'flex', gap: '12px' }}>
          <textarea 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Напишите комментарий..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            style={{
              flex: 1,
              resize: 'none',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontFamily: 'var(--font-inter)',
              fontSize: '14px',
              minHeight: '44px',
              maxHeight: '120px'
            }}
            rows={1}
          />
          <button 
            onClick={handleSend}
            disabled={mutation.isPending || !message.trim()}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '8px',
              backgroundColor: '#003077',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: (mutation.isPending || !message.trim()) ? 0.5 : 1
            }}
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </>
  );
}
