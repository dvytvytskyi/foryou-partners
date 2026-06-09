'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/stores/auth.store';
import styles from './Sidebar.module.css';



export function Sidebar({ dict }: { dict: any }) {
  const pathname = usePathname();
  const currentLocale = pathname.split('/')[1] || 'ru';
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
    { label: dict.transfer, href: '/transfer', icon: 'Plus.png' },
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
    <aside className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <img src="/new-side.png" alt="For You Partners" className={styles.logo} />
      </div>

      <nav className={styles.navSection}>
        <div className={styles.navGroup}>
          {MAIN_ITEMS.map((item) => (
            <Link 
              key={item.href} 
              href={`/${currentLocale}${item.href}`}
              className={`${styles.navItem} ${pathname.includes(item.href) ? styles.navItemActive : ''}`}
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
            >
              <img src={`/icons/${item.icon}`} alt={item.label} className={styles.icon} />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      )}
    </aside>
  );
}
