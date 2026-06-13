import React, { useState } from 'react';
import { api } from '@/lib/api';
import styles from './RequestPayoutModal.module.css';

interface RequestPayoutModalProps {
  onClose: () => void;
  onSuccess: () => void;
  maxAmount?: number;
  dict?: any;
  defaultDetails?: string;
}

export function RequestPayoutModal({ onClose, onSuccess, maxAmount, dict, defaultDetails }: RequestPayoutModalProps) {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('BANK_TRANSFER');
  const [details, setDetails] = useState(defaultDetails || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsedAmount = parseFloat(amount);
    
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError(dict.hardcoded.enter_a_valid_amount_greater_t);
      return;
    }
    
    if (maxAmount !== undefined && parsedAmount > maxAmount) {
      setError(dict?.hardcoded?.amount_exceeds_balance ? `${dict.hardcoded.amount_exceeds_balance} (${maxAmount} AED)` : `Сумма не может превышать ваш доступный баланс (${maxAmount} AED)`);
      return;
    }

    if (type !== 'CASH' && !details.trim()) {
      setError(dict.hardcoded.please_provide_payment_details);
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/payouts/request', {
        amount: parsedAmount,
        type,
        details: details.trim() || undefined,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || dict.hardcoded.failed_to_create_payout_reques);
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>{dict.hardcoded.request_payout}</h2>
          <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}
          
          <div className={styles.field}>
            <label>{dict.hardcoded.amount_aed}</label>
            <input 
              type="number" 
              step="0.01" 
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
            {maxAmount !== undefined && (
              <span className={styles.hint}>{dict.hardcoded.available} {maxAmount.toLocaleString()} AED</span>
            )}
          </div>
          
          <div className={styles.field}>
            <label>{dict.hardcoded.payment_method}</label>
            <select value={type} onChange={e => setType(e.target.value)}>
              <option value="BANK_TRANSFER">{dict.hardcoded.bank_transfer}</option>
              <option value="USDT">{dict.hardcoded.cryptocurrency_usdt}</option>
              <option value="CASH">{dict.hardcoded.cash}</option>
            </select>
          </div>
          
          {type !== 'CASH' && (
            <div className={styles.field}>
              <label>{type === 'USDT' ? dict.hardcoded.wallet_address_trc20_erc20 : dict.hardcoded.bank_details_iban_swift_etc}</label>
              <textarea 
                value={details}
                onChange={e => setDetails(e.target.value)}
                placeholder={type === 'USDT' ? 'T...' : 'IBAN...'}
                rows={3}
                required
              />
            </div>
          )}
          
          <div className={styles.actions}>
            <button type="button" className={styles.btnSecondary} onClick={onClose} disabled={isSubmitting}>
              {dict.hardcoded.cancel}
                                      </button>
            <button type="submit" className={styles.btnPrimary} disabled={isSubmitting}>
              {isSubmitting ? dict.hardcoded.sending : dict.hardcoded.confirm}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
