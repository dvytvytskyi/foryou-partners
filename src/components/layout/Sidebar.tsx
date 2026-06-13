'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/stores/auth.store';
import styles from './Sidebar.module.css';

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#003077" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);



export function Sidebar({ dict, isOpen, onClose }: { dict: any; isOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = pathname.split('/')[1] || 'ru';
  
  const changeLanguage = (lang: string) => {
    const newLocale = lang.toLowerCase();
    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/'));
  };

  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'admin';

  const { data: notificationsData } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get('/notifications?limit=20');
      return res.data;
    },
    refetchInterval: 30000,
  });

  const unreadTicketsCount = notificationsData?.data?.filter((n: any) => n.type === 'SUPPORT_TICKET' && !n.isRead).length || 0;

  const MAIN_ITEMS = [
    { label: dict.dashboard, href: '/dashboard', icon: 'ChartPie.png' },
    { label: dict.deals, href: '/deals', icon: 'Table.png' },
    { label: dict.payouts, href: '/payouts', icon: 'ChartLineUp.png' },
    { label: dict.referrals, href: '/referrals', icon: 'UsersThree.png' },
  ];

  const SUPPORT_ITEMS = [
    { label: dict.knowledge, href: '/knowledge', icon: 'FolderOpen.png' },
    { label: dict.support, href: '/support', icon: 'Chats.png' },
  ];

  const BOTTOM_ITEMS = [
    { label: dict.settings, href: '/settings', icon: 'Gear.png' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className={`${styles.mobileBackdrop} ${isOpen ? styles.backdropOpen : ''}`} 
        onClick={onClose} 
      />
      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
      <div className={styles.desktopLogoContainer}>
        <img src="/new-side.png" alt="For You Partners" className={styles.logo} />
      </div>

      <nav className={styles.navSection}>
        <div className={styles.navGroup}>
          <Link 
            href={`/${currentLocale}/transfer`}
            className={`${styles.navItem} ${pathname.includes('/transfer') ? styles.navItemActive : ''} ${styles.desktopOnlyNavItem}`}
            onClick={onClose}
          >
            <img src="/icons/Plus.png" alt={dict.transfer} className={styles.icon} />
            <span>{dict.transfer}</span>
          </Link>
          {MAIN_ITEMS.map((item) => (
            <Link 
              key={item.href} 
              href={`/${currentLocale}${item.href}`}
              className={`${styles.navItem} ${pathname.includes(item.href) ? styles.navItemActive : ''}`}
              onClick={onClose}
            >
              <img src={`/icons/${item.icon}`} alt={item.label} className={styles.icon} />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        <div className={styles.divider} />

        <div className={styles.navGroup}>
          {SUPPORT_ITEMS.map((item) => {
            const label = item.href === '/support' && isAdmin ? dict.tickets : item.label;
            
            return (
              <Link 
                key={item.href} 
                href={`/${currentLocale}${item.href}`}
                className={`${styles.navItem} ${pathname.includes(item.href) ? styles.navItemActive : ''}`}
                style={{ position: 'relative' }}
                onClick={onClose}
              >
                <img src={`/icons/${item.icon}`} alt={label} className={styles.icon} />
                <span>{label}</span>
                {item.href === '/support' && unreadTicketsCount > 0 && (
                  <span className={styles.badge}>
                    {unreadTicketsCount > 9 ? '9+' : unreadTicketsCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        <div className={styles.divider} />
      </nav>

      {isAdmin && (
        <div className={styles.bottomNav}>
          {BOTTOM_ITEMS.map((item) => (
            <Link 
              key={item.href} 
              href={`/${currentLocale}${item.href}`}
              className={`${styles.navItem} ${pathname.includes(item.href) ? styles.navItemActive : ''}`}
              onClick={onClose}
            >
              <img src={`/icons/${item.icon}`} alt={item.label} className={styles.icon} />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      )}
      
      <div className={styles.mobileTransferWrapper}>
        <button 
          className={styles.mobileTransferBtn}
          onClick={() => {
            router.push(`/${currentLocale}/transfer`);
            if (onClose) onClose();
          }}
        >
          + {dict.transfer}
        </button>

        <div className={styles.mobileLangSwitch}>
          <span 
            className={currentLocale !== 'en' ? styles.langActive : styles.langInactive}
            onClick={() => { changeLanguage('RU'); if (onClose) onClose(); }}
          >
            RU
          </span>
          <span 
            className={currentLocale === 'en' ? styles.langActive : styles.langInactive}
            onClick={() => { changeLanguage('EN'); if (onClose) onClose(); }}
          >
            EN
          </span>
        </div>
      </div>
    </aside>
    </>
  );
}
