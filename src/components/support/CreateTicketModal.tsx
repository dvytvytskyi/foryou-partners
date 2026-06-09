import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import styles from './CreateTicketModal.module.css';

interface CreateTicketModalProps {
  onClose: () => void;
  onSuccess: () => void;
  initialSubject?: string;
}

export function CreateTicketModal({ onClose, onSuccess, initialSubject = '' }: CreateTicketModalProps) {
  const [subject, setSubject] = useState(initialSubject);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Focus subject input on mount
  useEffect(() => {
    const el = document.getElementById('ticket-subject');
    if (el) el.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!subject.trim()) {
      setError('Введите тему вопроса');
      return;
    }

    if (!message.trim()) {
      setError('Опишите ваш вопрос подробно');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/support/tickets', {
        subject: subject.trim(),
        message: message.trim(),
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Не удалось создать обращение. Попробуйте позже.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Задать вопрос</h2>
          <button className={styles.closeBtn} onClick={onClose} type="button" aria-label="Закрыть">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}
          
          <div className={styles.field}>
            <label htmlFor="ticket-subject">Тема вопроса</label>
            <input 
              id="ticket-subject"
              type="text" 
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Например: Питання по угоді або Виплати"
              maxLength={255}
              required
            />
          </div>
          
          <div className={styles.field}>
            <label htmlFor="ticket-message">Подробное описание</label>
            <textarea 
              id="ticket-message"
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Опишите ваш вопрос или проблему подробно..."
              rows={5}
              maxLength={2000}
              required
            />
          </div>
          
          <div className={styles.actions}>
            <button type="button" className={styles.btnSecondary} onClick={onClose} disabled={isSubmitting}>
              Отмена
            </button>
            <button type="submit" className={styles.btnPrimary} disabled={isSubmitting}>
              {isSubmitting ? 'Отправка...' : 'Отправить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
