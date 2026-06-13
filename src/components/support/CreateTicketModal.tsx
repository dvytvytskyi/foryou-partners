import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import styles from './CreateTicketModal.module.css';

interface CreateTicketModalProps {
  onClose: () => void;
  onSuccess: () => void;
  initialSubject?: string;
  dict?: any;
}

export function CreateTicketModal({ onClose, onSuccess, initialSubject = '', dict }: CreateTicketModalProps) {
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
      setError(dict.hardcoded.enter_the_question_subject);
      return;
    }

    if (!message.trim()) {
      setError(dict.hardcoded.describe_your_question_in_deta);
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
      setError(err.response?.data?.message || dict.hardcoded.failed_to_create_ticket_please);
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>{dict.hardcoded.ask_a_question}</h2>
          <button className={styles.closeBtn} onClick={onClose} type="button" aria-label={dict.hardcoded.close}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}
          
          <div className={styles.field}>
            <label htmlFor="ticket-subject">{dict.hardcoded.question_subject}</label>
            <input 
              id="ticket-subject"
              type="text" 
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder={dict.hardcoded.e_g_deal_questions_or_payouts}
              maxLength={255}
              required
            />
          </div>
          
          <div className={styles.field}>
            <label htmlFor="ticket-message">{dict.hardcoded.detailed_description}</label>
            <textarea 
              id="ticket-message"
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder={dict.hardcoded.describe_your_question_or_prob}
              rows={5}
              maxLength={2000}
              required
            />
          </div>
          
          <div className={styles.actions}>
            <button type="button" className={styles.btnSecondary} onClick={onClose} disabled={isSubmitting}>
              {dict.hardcoded.cancel}
                                      </button>
            <button type="submit" className={styles.btnPrimary} disabled={isSubmitting}>
              {isSubmitting ? dict.hardcoded.sending : dict.hardcoded.send}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
