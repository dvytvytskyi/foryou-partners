'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsApi } from '@/lib/api-leads';
import styles from './TransferForm.module.css';

export function TransferForm({ dict }: { dict: any }) {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = pathname.split('/')[1] || 'ru';
  const queryClient = useQueryClient();

  const [lang, setLang] = useState('Русский');
  const [purpose, setPurpose] = useState('Инвестиция');
  const [readiness, setReadiness] = useState('1-3 мес.');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [budget, setBudget] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [city, setCity] = useState('');
  const [direction, setDirection] = useState('Дубай');
  const [contactMethod, setContactMethod] = useState('Напрямую');
  const [comment, setComment] = useState('');
  const [agreement, setAgreement] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successLeadId, setSuccessLeadId] = useState<number | null>(null);

  const mutation = useMutation({
    mutationFn: (data: any) => leadsApi.createLead(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead-board'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setSuccessLeadId(data.externalLeadId);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Не удалось передать клиента. Проверьте данные.');
    }
  });

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setPhone('');
    setEmail('');
    setBudget('');
    setPropertyType('');
    setCity('');
    setDirection('Дубай');
    setContactMethod('Напрямую');
    setComment('');
    setAgreement(false);
    setSuccessLeadId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!firstName || !phone || !agreement) {
      setError('Заполните обязательные поля и подтвердите согласие');
      return;
    }

    const fullComment = `
Язык: ${lang}
Цель: ${purpose}
Готовность: ${readiness}
Тип объекта: ${propertyType}
${comment ? `\nДополнительно:\n${comment}` : ''}
    `.trim();

    const parsedBudget = budget ? parseInt(budget.replace(/\D/g, ''), 10) : undefined;

    const payload = {
      name: lastName ? `${firstName} ${lastName}` : firstName,
      phone: phone,
      email: email || undefined,
      budget: Number.isNaN(parsedBudget) ? undefined : parsedBudget,
      city: city || undefined,
      direction: direction,
      contactMethod: contactMethod,
      comment: fullComment,
    };

    mutation.mutate(payload);
  };

  return (
    <div className={styles.container}>
      {/* Left Column - Form */}
      <div className={styles.formSection}>
        <form onSubmit={handleSubmit}>
          {error && <div style={{ color: '#ef4444', marginBottom: '16px', padding: '12px', background: '#fef2f2', borderRadius: '6px' }}>{error}</div>}
          
          {/* Step 01 */}
          <h3 className={styles.sectionTitle}>{dict.title}</h3>
          
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Имя*</label>
              <input type="text" className={styles.input} placeholder="Ahmed" value={firstName} onChange={e => setFirstName(e.target.value)} required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Фамилия</label>
              <input type="text" className={styles.input} placeholder="Khalifa" value={lastName} onChange={e => setLastName(e.target.value)} />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Телефон*</label>
              <input type="tel" className={styles.input} placeholder="+971 50 123 4567" value={phone} onChange={e => setPhone(e.target.value)} required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Email</label>
              <input type="email" className={styles.input} placeholder="ahmed@example.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
          </div>

          <div className={styles.field} style={{ marginBottom: '48px' }}>
            <label className={styles.label}>Предпочитаемый язык общения</label>
            <div className={styles.toggleGroup}>
              {['Русский', 'English', 'العربية'].map(l => (
                <button 
                  key={l}
                  type="button"
                  className={`${styles.toggleBtn} ${lang === l ? styles.toggleBtnActive : ''}`}
                  onClick={() => setLang(l)}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Step 02 */}
          <div className={styles.stepTitle}>02</div>
          <h3 className={styles.sectionTitle}>Параметры запроса</h3>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Бюджет, AED</label>
              <input type="text" className={styles.input} placeholder="3,500,000" value={budget} onChange={e => setBudget(e.target.value)} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Направление</label>
              <select className={styles.input} value={direction} onChange={e => setDirection(e.target.value)} style={{ paddingRight: '32px' }}>
                <option value="Дубай">Дубай</option>
                <option value="Абу-Даби">Абу-Даби</option>
                <option value="РАК">РАК</option>
                <option value="Оман">Оман</option>
              </select>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Как связаться</label>
              <select className={styles.input} value={contactMethod} onChange={e => setContactMethod(e.target.value)} style={{ paddingRight: '32px' }}>
                <option value="Напрямую">Напрямую</option>
                <option value="Только через меня">Только через меня</option>
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Тип объекта</label>
              <input type="text" className={styles.input} placeholder="Квартира" value={propertyType} onChange={e => setPropertyType(e.target.value)} />
            </div>
          </div>

          <div className={styles.field} style={{ marginBottom: '24px' }}>
            <label className={styles.label}>Локация / район</label>
            <input type="text" className={styles.input} value={city} onChange={e => setCity(e.target.value)} />
          </div>

          <div className={styles.row} style={{ marginBottom: '48px' }}>
            <div className={styles.field}>
              <label className={styles.label}>Цель</label>
              <div className={styles.toggleGroup}>
                {['Для жизни', 'Инвестиция', 'Перепродажа'].map(p => (
                  <button 
                    key={p}
                    type="button"
                    className={`${styles.toggleBtn} ${purpose === p ? styles.toggleBtnActive : ''}`}
                    onClick={() => setPurpose(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Готовность</label>
              <div className={styles.toggleGroup}>
                {['Сейчас', '1-3 мес.', '3-6 мес.'].map(r => (
                  <button 
                    key={r}
                    type="button"
                    className={`${styles.toggleBtn} ${readiness === r ? styles.toggleBtnActive : ''}`}
                    onClick={() => setReadiness(r)}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Step 03 */}
          <div className={styles.stepTitle}>03</div>
          <h3 className={styles.sectionTitle}>Дополнительная информация</h3>

          <div className={styles.field}>
            <label className={styles.label}>Комментарий</label>
            <textarea className={styles.textarea} placeholder="" value={comment} onChange={e => setComment(e.target.value)} maxLength={200}></textarea>
            <div style={{ textAlign: 'right', fontSize: '12px', color: '#a1a1aa', marginTop: '4px' }}>{comment.length}/200</div>
          </div>

          <div className={styles.checkboxRow}>
            <input type="checkbox" id="agreement" checked={agreement} onChange={e => setAgreement(e.target.checked)} />
            <label htmlFor="agreement" className={styles.checkboxLabel}>
              Я подтверждаю, что клиент дал согласие на передачу его контакта в FOR YOU REAL ESTATE.*
            </label>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={mutation.isPending}>
            {mutation.isPending ? 'Передача...' : 'Передать клиента'}
          </button>
        </form>
      </div>

      {/* Right Column - Info Sidebar */}
      <div className={styles.infoSidebar}>
        <div className={styles.infoCardMain}>
          <div className={styles.infoCardStep}>Этапы</div>
          <div className={styles.infoCardTitle}>Что произойдёт дальше</div>
          <div className={styles.infoCardText}>
            Брокер ведёт сделку через AmoCRM. Все его действия и комментарии транслируются в ваш кабинет.
          </div>
        </div>

        <div className={styles.infoCard} data-step="01">
          <div className={styles.infoCardStep}>01</div>
          <div className={styles.infoCardTitle}>Проверка дубля по базе</div>
        </div>

        <div className={styles.infoCard} data-step="02">
          <div className={styles.infoCardStep}>02</div>
          <div className={styles.infoCardTitle}>Создание сделки в воронке «Партнёрские лиды»</div>
        </div>

        <div className={styles.infoCard} data-step="03">
          <div className={styles.infoCardStep}>03</div>
          <div className={styles.infoCardTitle}>Назначение брокера</div>
        </div>

        <div className={styles.infoCard} data-step="04">
          <div className={styles.infoCardStep}>04</div>
          <div className={styles.infoCardTitle}>Уведомление вам о начале работы</div>
        </div>
      </div>

      {successLeadId && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(2px)'
        }}>
          <div style={{
            backgroundColor: '#fff', borderRadius: '12px', padding: '32px',
            maxWidth: '480px', width: '90%', textAlign: 'center',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
          }}>
            <div style={{ width: '64px', height: '64px', backgroundColor: '#eef2ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#0f172a', marginBottom: '12px' }}>Клиент успешно передан!</h2>
            <p style={{ color: '#64748b', marginBottom: '24px', lineHeight: 1.5 }}>
              Сделка создана в воронке и ожидает назначения брокера. Мы уведомим вас, как только брокер возьмет клиента в работу.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                onClick={() => router.push(`/${currentLocale}/deals/${successLeadId}`)}
                style={{
                  width: '100%', padding: '12px', backgroundColor: '#003077', color: '#fff',
                  border: 'none', borderRadius: '8px', fontWeight: 500, cursor: 'pointer'
                }}
              >
                Перейти к сделке
              </button>
              <button 
                onClick={resetForm}
                style={{
                  width: '100%', padding: '12px', backgroundColor: '#f1f5f9', color: '#475569',
                  border: 'none', borderRadius: '8px', fontWeight: 500, cursor: 'pointer'
                }}
              >
                Передать еще одного
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
