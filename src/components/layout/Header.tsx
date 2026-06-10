'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SpotlightSearch } from './SpotlightSearch';
import { NotificationDropdown } from './NotificationDropdown';
import { useAuthStore } from '@/lib/stores/auth.store';
import { api } from '@/lib/api';
import styles from './Header.module.css';

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#003077" strokeWidth="1.5">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);



const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1E293B" strokeWidth="2">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

import { usePathname } from 'next/navigation';

const HamburgerIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#003077" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#003077" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export function Header({ dict, onMenuClick, isSidebarOpen }: { dict: any; onMenuClick?: () => void; isSidebarOpen?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = pathname.split('/')[1] === 'en' ? 'en' : 'ru';
  const isEn = currentLocale === 'en';

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const user = useAuthStore((state) => state.user);

  const changeLanguage = (lang: string) => {
    const newLocale = lang.toLowerCase();
    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/'));
  };

  const handleLogout = async () => {
    try {
      const refreshToken = useAuthStore.getState().refreshToken;
      if (refreshToken) {
        await api.post('/auth/logout', { refresh_token: refreshToken });
      }
    } catch (err) {
      console.error('Logout failed on backend', err);
    } finally {
      useAuthStore.getState().clearAuth();
      router.push(`/${currentLocale}/login`);
    }
  };

  return (
    <header className={styles.header}>
      <SpotlightSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      
      {/* Mobile: Hamburger/Close Menu */}
      <button className={styles.hamburgerBtn} onClick={onMenuClick}>
        {isSidebarOpen ? <CloseIcon /> : <HamburgerIcon />}
      </button>

      {/* Mobile: Logo */}
      <div className={styles.mobileLogoContainer}>
        <img src="/new-side.png" alt="For You" className={styles.mobileLogo} />
      </div>

      {/* Left: Search Bar (Desktop) */}
      <div className={styles.leftSection}>
        <div className={styles.searchBar} onClick={() => setIsSearchOpen(true)}>
          <SearchIcon />
          <span className={styles.searchText}>{dict.search}</span>
        </div>
      </div>

      {/* Right: Actions and Profile */}
      <div className={styles.rightSection}>
        <div className={styles.languageSwitch}>
          <span 
            className={!isEn ? styles.langActive : styles.langInactive}
            onClick={() => changeLanguage('RU')}
          >
            RU
          </span>
          <span className={styles.langSeparator}> / </span>
          <span 
            className={isEn ? styles.langActive : styles.langInactive}
            onClick={() => changeLanguage('EN')}
          >
            EN
          </span>
        </div>

        <div className={styles.notificationWrapper}>
          <NotificationDropdown dict={dict} currentLocale={currentLocale} />
        </div>

        <div className={styles.profileSection} onClick={() => setMenuOpen(!menuOpen)}>
          <div className={styles.avatar}>
            {user?.email ? user.email.charAt(0).toUpperCase() : 'И'}
          </div>
          <span className={styles.profileName}>{user?.email ? user.email.split('@')[0] : 'Ирина К.'}</span>

          {menuOpen && (
            <div className={styles.menuDropdown}>
              <div className={styles.menuItem} onClick={() => router.push(`/${currentLocale}/profile`)}>
                {dict.profile}
              </div>
              <div className={styles.menuDivider} />
              <div className={`${styles.menuItem} ${styles.menuItemDanger}`} onClick={handleLogout}>
                {dict.logout}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
