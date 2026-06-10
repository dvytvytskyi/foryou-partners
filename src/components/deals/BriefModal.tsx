import React, { useEffect } from 'react';
import styles from './BriefModal.module.css';
import { BrokerSidebar } from './BrokerCard';

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#003077" strokeWidth="1.5">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export function BriefModal({ isOpen, onClose, lead, dict }: { isOpen: boolean; onClose: () => void; lead: any; dict: any }) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>
          <CloseIcon />
        </button>
        
        <div className={styles.content}>
          <BrokerSidebar lead={lead} dict={dict} isModal={true} />
        </div>
      </div>
    </div>
  );
}
