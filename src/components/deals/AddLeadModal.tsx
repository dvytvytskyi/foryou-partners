import React, { useState } from 'react';
import { X, UserPlus, FileText, Phone, Mail, MapPin, DollarSign } from 'lucide-react';
import styles from './AddLeadModal.module.css';
import { api } from '@/lib/api';

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddLeadModal({ isOpen, onClose, onSuccess }: AddLeadModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    budget: '',
    city: '',
    comment: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!formData.name) {
      setError('Ім\'я клієнта є обов\'язковим');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await api.post('/leads', {
        name: formData.name,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        budget: formData.budget ? Number(formData.budget) : undefined,
        city: formData.city || undefined,
        comment: formData.comment || undefined,
      });
      onSuccess();
      onClose();
      setFormData({ name: '', phone: '', email: '', budget: '', city: '', comment: '' });
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Ошибка при создании лида. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.titleWrapper}>
            <UserPlus size={20} className={styles.titleIcon} />
            <h2 className={styles.title}>Передать клиента</h2>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.content}>
          <p className={styles.description}>
            Введите данные вашего клиента. Мы автоматически создадим сделку в CRM системе, и она появится в вашем списке.
          </p>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <UserPlus size={14} /> ФИО клиента *
            </label>
            <input 
              type="text" 
              placeholder="Иван Иванов" 
              className={styles.input}
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <Phone size={14} /> Телефон
              </label>
              <input 
                type="tel" 
                placeholder="+380..." 
                className={styles.input}
                value={formData.phone}
                onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <Mail size={14} /> Email
              </label>
              <input 
                type="email" 
                placeholder="client@gmail.com" 
                className={styles.input}
                value={formData.email}
                onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <MapPin size={14} /> Город
              </label>
              <input 
                type="text" 
                placeholder="Киев, Дубай..." 
                className={styles.input}
                value={formData.city}
                onChange={e => setFormData(prev => ({ ...prev, city: e.target.value }))}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <DollarSign size={14} /> Бюджет ($)
              </label>
              <input 
                type="number" 
                placeholder="Напр. 150000" 
                className={styles.input}
                value={formData.budget}
                onChange={e => setFormData(prev => ({ ...prev, budget: e.target.value }))}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <FileText size={14} /> Комментарий (запит)
            </label>
            <textarea 
              placeholder="Что именно ищет клиент? Какие пожелания?" 
              className={styles.textarea}
              value={formData.comment}
              onChange={e => setFormData(prev => ({ ...prev, comment: e.target.value }))}
              rows={3}
            />
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose} disabled={loading}>Отменить</button>
          <button className={styles.submitBtn} onClick={handleSubmit} disabled={loading}>
            {loading ? 'Отправка...' : 'Передать клиента'}
          </button>
        </div>
      </div>
    </div>
  );
}
