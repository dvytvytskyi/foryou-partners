'use client';

import React from 'react';
import styles from './RecentEvents.module.css';

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const FilterIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
  </svg>
);

const DotsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="5" r="1"></circle>
    <circle cx="12" cy="12" r="1"></circle>
    <circle cx="12" cy="19" r="1"></circle>
  </svg>
);

const SortIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="7 15 12 20 17 15"></polyline>
    <polyline points="7 9 12 4 17 9"></polyline>
  </svg>
);

import { useRouter, usePathname } from 'next/navigation';

export function RecentEvents({ events = [], dict }: { events?: any[], dict: any }) {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = pathname.split('/')[1] === 'en' ? 'en-US' : 'ru-RU';
  const isEn = currentLocale === 'en-US';
  
  const mapText = (text: string) => {
    if (!text || !isEn) return text;
    const lower = text.toLowerCase();
    if (lower === dict.hardcoded.hc_41) return 'Manager';
    if (lower === dict.hardcoded.hc_39) return 'Change';
    if (lower === dict.hardcoded.hc_49) return 'Deal moved to a new status';
    if (lower === dict.hardcoded.hc_40) return 'Client';
    if (lower === dict.hardcoded.hc_51) return 'Success';
    if (lower === dict.hardcoded.hc_48) return 'Deal closed successfully';
    
    // Status fallbacks
    const fallbacks: Record<string, string> = {
      '142': isEn ? 'Successfully realized' : dict.hardcoded.hc_30,
      '143': isEn ? 'Closed and not realized' : dict.hardcoded.hc_11,
      '74717798': isEn ? 'Initial contact' : dict.hardcoded.hc_21,
      '74717802': isEn ? 'Negotiations' : dict.hardcoded.hc_22,
      '74717806': isEn ? 'Making decision' : dict.hardcoded.hc_23,
      '74717810': isEn ? 'Contract approval' : dict.hardcoded.contract_agreement,
      '84853590': isEn ? 'Qualification' : dict.hardcoded.qualification,
      '84853926': isEn ? 'Meeting scheduled' : dict.hardcoded.hc_8
    };
    
    // Check if the text matches a raw status ID or "Статус ID"
    const match = text.match(/(?:Статус\s*)?(\d{3,})/i);
    if (match && fallbacks[match[1]]) {
      return fallbacks[match[1]];
    }

    return text;
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString(currentLocale, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>{dict.title}</h2>
        <div className={styles.actions}>
          <div className={styles.searchWrapper}>
            <SearchIcon />
            <input type="text" placeholder={dict.search_placeholder} className={styles.searchInput} />
          </div>
        </div>
      </div>

      <div className={styles.list}>
        <div className={styles.listHeader}>
          <span>{dict.date} <SortIcon /></span>
          <span>{dict.user}</span>
          <span>{dict.type}</span>
          <span>{dict.event}</span>
          <span>{dict.client}</span>
          <span>{dict.action}</span>
        </div>

        <div className={styles.itemsWrapper}>
          {events.length === 0 && (
            <div style={{ padding: '24px', color: '#71717a', fontSize: '0.875rem' }}>{dict.empty}</div>
          )}
          {events.slice(0, 12).map(event => (
            <div key={event.id} className={`${styles.row} ${event.highlight ? styles.rowHighlight : ''}`}>
              <div className={styles.cellDate}>{formatDate(event.date)}</div>
              
              <div className={styles.cellUser}>
                {event.user.isSystem ? (
                  <div className={styles.avatarSystem}></div>
                ) : (
                  <div className={styles.avatarUser}></div>
                )}
                <span>{mapText(event.user.name)}</span>
              </div>
              
              <div className={styles.cellTag}>
                <span className={`${styles.badge} ${styles[`badge_${event.tag.type}`]}`}>
                  {mapText(event.tag.label)}
                </span>
              </div>
              
              <div className={styles.cellText}>{mapText(event.text)}</div>
              
              <div className={styles.cellTarget}>{mapText(event.target)}</div>
              
              <div className={styles.cellActions}>
                <button className={styles.openBtn} onClick={() => router.push(`/${pathname.split('/')[1]}/deals/${event.id}`)}>{dict.open}</button>
                <button className={styles.dotsBtn}>
                  <DotsIcon />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
