'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth.store';
import styles from './Sidebar.module.css';

// Using simple names that we handle with Icon helper
const MENU_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: 'LayoutGrid' },
  { label: 'Leads', href: '/leads', icon: 'Calendar' },
  { label: 'Profile', href: '/profile', icon: 'Users' },
];

const ADMIN_ITEMS = [
  { label: 'Partners', href: '/admin/partners', icon: 'Folder' },
];

const BOTTOM_MENU = [
  { label: 'Feedback', icon: 'MessageSquare' },
  { label: 'Settings', icon: 'Settings' },
  { label: 'Help Center', icon: 'HelpCircle' },
];

const Icon = ({ name }: { name: string }) => {
  const strokeColor = "currentColor";
  const strokeWidth = "1.5";
  
  switch (name) {
    case 'LayoutGrid': return <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={strokeWidth}><rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect></svg>;
    case 'Calendar': return <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={strokeWidth}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
    case 'Users': return <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={strokeWidth}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
    case 'Folder': return <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={strokeWidth}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>;
    case 'Settings': return <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={strokeWidth}><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;
    case 'MessageSquare': return <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={strokeWidth}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;
    case 'HelpCircle': return <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth={strokeWidth}><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>;
    default: return <span>•</span>;
  }
};

export function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore(state => state.user);

  const [search, setSearch] = React.useState('');

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <div className={styles.profileCard}>
          <div className={styles.avatarSquare}>
            {user?.email?.substring(0, 2).toUpperCase() || 'AU'}
          </div>
          <div className={styles.profileInfo}>
            <span className={styles.profileName}>{user?.email?.split('@')[0] || 'Admin User'}</span>
            <span className={styles.profileRole}>
              {user?.role === 'admin' ? 'Administrator' : 'Partner'}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.searchBox}>
        <svg className={styles.searchIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input 
          type="text" 
          placeholder="Search Anything..." 
          className={styles.searchInput}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search ? (
          <span 
            className={styles.searchShortcut} 
            style={{ cursor: 'pointer' }}
            onClick={() => setSearch('')}
          >
            ×
          </span>
        ) : (
          <span className={styles.searchShortcut}>⌘K</span>
        )}
      </div>

      <nav className={styles.navSection}>
        {MENU_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link 
              key={item.label} 
              href={item.href}
              className={`${styles.navItem} ${active ? styles.navItemActive : ''}`}
            >
              <div className={styles.navItemLeft}>
                <Icon name={item.icon} />
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}

        {user?.role === 'admin' && ADMIN_ITEMS.map((item) => (
          <Link 
            key={item.label} 
            href={item.href}
            className={`${styles.navItem} ${pathname === item.href ? styles.navItemActive : ''}`}
          >
            <div className={styles.navItemLeft}>
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </div>
          </Link>
        ))}
      </nav>

      <div className={styles.upgradeCard}>
        <span className={styles.upgradeClose}>×</span>
        <div className={styles.upgradeTitle}>
          <span>📅</span>
          <span>5 Days left !</span>
        </div>
        <div className={styles.progressBar}>
          <div className={styles.progressFill}></div>
        </div>
        <p className={styles.upgradeDesc}>
          Select best plan now and unlock all special features
        </p>
        <div className={styles.upgradeCta}>
          <span>Select plan</span>
          <span>➜</span>
        </div>
      </div>

      <div className={styles.bottomNav}>
        {BOTTOM_MENU.map((item) => (
          <div key={item.label} className={styles.navItem}>
            <div className={styles.navItemLeft}>
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
