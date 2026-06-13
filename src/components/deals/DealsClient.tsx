'use client';

import React, { useState } from 'react';
import { DealsTable } from '@/components/deals/DealsTable';
import { DealsBoard } from '@/components/deals/DealsBoard';
import { AddLeadModal } from '@/components/deals/AddLeadModal';
import { Plus } from 'lucide-react';
import styles from './DealsClient.module.css';

const ListIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"></line>
    <line x1="8" y1="12" x2="21" y2="12"></line>
    <line x1="8" y1="18" x2="21" y2="18"></line>
    <line x1="3" y1="6" x2="3.01" y2="6"></line>
    <line x1="3" y1="12" x2="3.01" y2="12"></line>
    <line x1="3" y1="18" x2="3.01" y2="18"></line>
  </svg>
);

const BoardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="9"></rect>
    <rect x="14" y="3" width="7" height="5"></rect>
    <rect x="14" y="12" width="7" height="9"></rect>
    <rect x="3" y="16" width="7" height="5"></rect>
  </svg>
);

export function DealsClient({ dict }: { dict: any }) {
  const [view, setView] = useState<'list' | 'board'>(() => {
    if (typeof window !== 'undefined') {
      return (sessionStorage.getItem('deals_view') as 'list' | 'board') || 'list';
    }
    return 'list';
  });
  
  React.useEffect(() => {
    sessionStorage.setItem('deals_view', view);
  }, [view]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    // Incrementing this key will force the table/board to refetch their data
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className={styles.container}>


      {/* Passing refreshKey to force re-render/fetch if needed, though they manage their own fetch state.
          We can wrap them in a simple key prop to force unmount/remount. */}
      <div key={refreshKey}>
        {view === 'list' ? <DealsTable dict={dict} /> : <DealsBoard dict={dict} />}
      </div>

      <AddLeadModal dict={dict} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handleSuccess} 
      />
    </div>
  );
}
