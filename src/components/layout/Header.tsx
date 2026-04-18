'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import styles from './Header.module.css';

export function Header() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <header className={styles.header}>
      <div className={styles.searchArea}>
        <input 
          type="text" 
          placeholder="Search leads..." 
          className={styles.searchInput}
        />
      </div>

      <div className={styles.actions}>
        <button className={styles.iconButton} title="Notifications">
          🔔
        </button>
        <button className={styles.iconButton} title="Help">
          ❓
        </button>
        <button 
          className={styles.logoutButton}
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </header>
  );
}
