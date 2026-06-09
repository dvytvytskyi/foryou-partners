import React, { useState } from 'react';
import { api } from '@/lib/api';
import styles from './RequestPayoutModal.module.css';

interface RequestPayoutModalProps {
  onClose: () => void;
  onSuccess: () => void;
  maxAmount?: number;
}

export function RequestPayoutModal({ onClose, onSuccess, maxAmount }: RequestPayoutModalProps) {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('BANK_TRANSFER');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsedAmount = parseFloat(amount);
    
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Введите корректную сумму больше 0');
      return;
    }
    
    if (maxAmount !== undefined && parsedAmount > maxAmount) {
      setError(`Сумма не может превышать ваш доступный баланс (${maxAmount} AED)`);
      return;
    }

    if (type !== 'CASH' && !details.trim()) {
      setError('Пожалуйста, укажите реквизиты для выплаты');
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
      setError(err.response?.data?.message || 'Не удалось создать запрос на выплату');
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Запросить выплату</h2>
          <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}
          
          <div className={styles.field}>
            <label>Сумма (AED)</label>
            <input 
              type="number" 
              step="0.01" 
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
            {maxAmount !== undefined && (
              <span className={styles.hint}>Доступно: {maxAmount.toLocaleString()} AED</span>
            )}
          </div>
          
          <div className={styles.field}>
            <label>Способ выплаты</label>
            <select value={type} onChange={e => setType(e.target.value)}>
              <option value="BANK_TRANSFER">Банковский перевод</option>
              <option value="USDT">Криптовалюта (USDT)</option>
              <option value="CASH">Наличные</option>
            </select>
          </div>
          
          {type !== 'CASH' && (
            <div className={styles.field}>
              <label>{type === 'USDT' ? 'Адрес кошелька (TRC20/ERC20)' : 'Банковские реквизиты (IBAN, Swift и т.д.)'}</label>
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
              Отмена
            </button>
            <button type="submit" className={styles.btnPrimary} disabled={isSubmitting}>
              {isSubmitting ? 'Отправка...' : 'Подтвердить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
