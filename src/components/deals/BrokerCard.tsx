import React from 'react';
import styles from './BrokerCard.module.css';
import type { LeadDetail } from '@/lib/api-leads';

const MailIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);

const EnvelopeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);

const PhoneIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
  </svg>
);

export function BrokerSidebar({ lead, dict, isModal = false }: { lead?: LeadDetail; dict?: any; isModal?: boolean }) {
  if (!lead) return null;

  // Extract common custom fields if they exist
  const getCustomField = (name: string) => {
    if (!lead.customFields || !Array.isArray(lead.customFields)) return null;
    const field = lead.customFields.find((f: any) => 
      f.field_name?.toLowerCase() === name.toLowerCase() || 
      f.name?.toLowerCase() === name.toLowerCase()
    );
    if (!field || !field.values || field.values.length === 0) return null;
    return field.values[0].value;
  };

  const purpose = getCustomField('Цель') || getCustomField('Цель покупки');
  const readiness = getCustomField('Готовность');
  const location = getCustomField('Локация') || lead.city;
  const language = getCustomField('Язык общения') || getCustomField('Язык');

  return (
    <div className={isModal ? styles.sidebarModal : styles.sidebar}>
      {/* Broker Card */}
      <div className={isModal ? styles.cardModal : styles.card}>
        <div className={styles.brokerHeader}>
          <div className={styles.avatar} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e2e8f0', color: '#64748b', fontSize: '20px', fontWeight: 'bold' }}>
            {lead.broker?.name ? lead.broker.name.charAt(0).toUpperCase() : '?'}
          </div>
          <div className={styles.brokerInfo}>
            <span className={styles.brokerName}>{lead.broker?.name || dict?.not_assigned || 'Не назначено'}</span>
            <span className={styles.brokerRole}>{dict?.broker || 'Брокер'}</span>
          </div>
        </div>

        {lead.broker?.name && <span className={styles.statusBadge}>{dict?.assigned || 'Назначен'}</span>}

        <p className={styles.description}>
          {dict?.broker_desc || 'Брокер ведет сделку через AmoCRM. Все его действия и комментарии транслируются в ваш кабинет.'}
        </p>

        <div className={styles.contacts}>
          {lead.broker?.email && (
            <div className={styles.contactRow}>
              <span className={styles.contactIcon}><MailIcon /></span>
              {lead.broker.email}
            </div>
          )}
          {lead.broker?.phone && (
            <div className={styles.contactRow}>
              <span className={styles.contactIcon}><PhoneIcon /></span>
              {lead.broker.phone}
            </div>
          )}
        </div>

        {(lead.broker?.phone || lead.broker?.email) && (
          <div className={styles.actions}>
            {lead.broker?.phone && (
              <button className={styles.actionBtn}>
                <PhoneIcon /> {dict?.call || 'Позвонить'}
              </button>
            )}
            <button className={styles.actionBtn}>
              <EnvelopeIcon /> {dict?.write || 'Написать'}
            </button>
          </div>
        )}
      </div>

      {isModal && <div className={styles.divider} />}

      {/* Brief Card */}
      <div className={isModal ? styles.cardModal : styles.card}>
        <h3 className={styles.briefTitle}>{dict?.client_brief || 'Бриф клиента'}</h3>
        
        <div className={styles.briefList}>
          {purpose && (
            <div className={styles.briefField}>
              <div className={styles.briefLabel}>{'Цель'}</div>
              <div className={styles.briefValue}>{purpose}</div>
            </div>
          )}

          {readiness && (
            <div className={styles.briefField}>
              <div className={styles.briefLabel}>{'Готовность'}</div>
              <div className={styles.briefValue}>{readiness}</div>
            </div>
          )}

          <div className={styles.briefField}>
            <div className={styles.briefLabel}>{dict?.city || 'Локация'}</div>
            <div className={styles.briefValue}>{location || dict?.not_specified || 'Не указано'}</div>
          </div>

          {language && (
            <div className={styles.briefField}>
              <div className={styles.briefLabel}>{'Язык общения'}</div>
              <div className={styles.briefValue}>{language}</div>
            </div>
          )}

          {!purpose && !readiness && !language && (
            <>
              <div className={styles.briefField}>
                <div className={styles.briefLabel}>{dict?.client_name || 'Имя клиента'}</div>
                <div className={styles.briefValue}>{lead.contact?.name || dict?.not_specified || 'Не указано'}</div>
              </div>
              
              <div className={styles.briefField}>
                <div className={styles.briefLabel}>{dict?.client_phone || 'Телефон клиента'}</div>
                <div className={styles.briefValue}>{lead.contact?.phone || dict?.not_specified || 'Не указано'}</div>
              </div>

              <div className={styles.briefField}>
                <div className={styles.briefLabel}>{dict?.budget || 'Бюджет'}</div>
                <div className={styles.briefValue}>{lead.budget ? `$${lead.budget.toLocaleString()}` : (dict?.not_specified || 'Не указано')}</div>
              </div>
            </>
          )}
          
          <div className={styles.briefField}>
            <div className={styles.briefLabel}>{dict?.comment || 'Комментарий'}</div>
            <div className={styles.briefValue}>{lead.comment || dict?.no_comments || 'Нет комментариев'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

