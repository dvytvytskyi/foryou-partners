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

  const [lang, setLang] = useState(dict.hardcoded.russian);
  const [purpose, setPurpose] = useState(dict.hardcoded.investment);
  const [readiness, setReadiness] = useState(dict.hardcoded['1_3_months']);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [budget, setBudget] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [city, setCity] = useState('');
  const [direction, setDirection] = useState(dict.hardcoded.dubai);
  const [contactMethod, setContactMethod] = useState(dict.hardcoded.directly);
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
      setError(err.response?.data?.message || dict.hardcoded.failed_to_transfer_client_chec);
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
    setDirection(dict.hardcoded.dubai);
    setContactMethod(dict.hardcoded.directly);
    setComment('');
    setAgreement(false);
    setSuccessLeadId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!firstName || !phone || !agreement) {
      setError(dict.hardcoded.fill_out_the_required_fields_a);
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
              <label className={styles.label}>{dict.hardcoded.name}</label>
              <input type="text" className={styles.input} placeholder="Ahmed" value={firstName} onChange={e => setFirstName(e.target.value)} required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>{dict.hardcoded.last_name}</label>
              <input type="text" className={styles.input} placeholder="Khalifa" value={lastName} onChange={e => setLastName(e.target.value)} />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>{dict.hardcoded.hc_25}</label>
              <input type="tel" className={styles.input} placeholder="+971 50 123 4567" value={phone} onChange={e => setPhone(e.target.value)} required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Email</label>
              <input type="email" className={styles.input} placeholder="ahmed@example.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
          </div>

          <div className={styles.field} style={{ marginBottom: '48px' }}>
            <label className={styles.label}>{dict.hardcoded.preferred_communication_langua}</label>
            <div className={styles.toggleGroup}>
              {[dict.hardcoded.russian, 'English', 'العربية'].map(l => (
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
          <h3 className={styles.sectionTitle}>{dict.hardcoded.request_parameters}</h3>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>{dict.hardcoded.budget_aed}</label>
              <input type="text" className={styles.input} placeholder="3,500,000" value={budget} onChange={e => setBudget(e.target.value)} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>{dict.hardcoded.direction}</label>
              <select className={styles.input} value={direction} onChange={e => setDirection(e.target.value)} style={{ paddingRight: '32px' }}>
                <option value={dict.hardcoded.dubai}>{dict.hardcoded.dubai}</option>
                <option value={dict.hardcoded.abu_dhabi}>{dict.hardcoded.abu_dhabi}</option>
                <option value={dict.hardcoded.rak}>{dict.hardcoded.rak}</option>
                <option value={dict.hardcoded.oman}>{dict.hardcoded.oman}</option>
              </select>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>{dict.hardcoded.how_to_contact}</label>
              <select className={styles.input} value={contactMethod} onChange={e => setContactMethod(e.target.value)} style={{ paddingRight: '32px' }}>
                <option value={dict.hardcoded.directly}>{dict.hardcoded.directly}</option>
                <option value={dict.hardcoded.only_through_me}>{dict.hardcoded.only_through_me}</option>
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>{dict.hardcoded.hc_28}</label>
              <input type="text" className={styles.input} placeholder={dict.hardcoded.apartment} value={propertyType} onChange={e => setPropertyType(e.target.value)} />
            </div>
          </div>

          <div className={styles.field} style={{ marginBottom: '24px' }}>
            <label className={styles.label}>{dict.hardcoded.location_area}</label>
            <input type="text" className={styles.input} value={city} onChange={e => setCity(e.target.value)} />
          </div>

          <div className={styles.row} style={{ marginBottom: '48px' }}>
            <div className={styles.field}>
              <label className={styles.label}>{dict.hardcoded.goal}</label>
              <div className={styles.toggleGroup}>
                {[dict.hardcoded.for_living, dict.hardcoded.investment, dict.hardcoded.resale].map(p => (
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
              <label className={styles.label}>{dict.hardcoded.readiness}</label>
              <div className={styles.toggleGroup}>
                {[dict.hardcoded.now, dict.hardcoded['1_3_months'], dict.hardcoded['3_6_months']].map(r => (
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
          <h3 className={styles.sectionTitle}>{dict.hardcoded.additional_information}</h3>

          <div className={styles.field}>
            <label className={styles.label}>{dict.hardcoded.comment}</label>
            <textarea className={styles.textarea} placeholder="" value={comment} onChange={e => setComment(e.target.value)} maxLength={200}></textarea>
            <div style={{ textAlign: 'right', fontSize: '12px', color: '#a1a1aa', marginTop: '4px' }}>{comment.length}/200</div>
          </div>

          <div className={styles.checkboxRow}>
            <input type="checkbox" id="agreement" checked={agreement} onChange={e => setAgreement(e.target.checked)} />
            <label htmlFor="agreement" className={styles.checkboxLabel}>
              {dict.hardcoded.i_confirm_that_the_client_has}
                                      </label>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={mutation.isPending}>
            {mutation.isPending ? dict.hardcoded.transferring : dict.hardcoded.transfer_client}
          </button>
        </form>
      </div>

      {/* Right Column - Info Sidebar */}
      <div className={styles.infoSidebar}>
        <div className={styles.infoCardMain}>
          <div className={styles.infoCardStep}>{dict.hardcoded.stages}</div>
          <div className={styles.infoCardTitle}>{dict.hardcoded.what_will_happen_next}</div>
          <div className={styles.infoCardText}>
            {dict.hardcoded.hc_4}
                                </div>
        </div>

        <div className={styles.infoCard} data-step="01">
          <div className={styles.infoCardStep}>01</div>
          <div className={styles.infoCardTitle}>{dict.hardcoded.checking_duplicates_in_databas}</div>
        </div>

        <div className={styles.infoCard} data-step="02">
          <div className={styles.infoCardStep}>02</div>
          <div className={styles.infoCardTitle}>{dict.hardcoded.creating_a_deal_in_the_partner}</div>
        </div>

        <div className={styles.infoCard} data-step="03">
          <div className={styles.infoCardStep}>03</div>
          <div className={styles.infoCardTitle}>{dict.hardcoded.broker_assignment}</div>
        </div>

        <div className={styles.infoCard} data-step="04">
          <div className={styles.infoCardStep}>04</div>
          <div className={styles.infoCardTitle}>{dict.hardcoded.notification_of_work_start}</div>
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
            <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#0f172a', marginBottom: '12px' }}>{dict.hardcoded.client_successfully_transferre}</h2>
            <p style={{ color: '#64748b', marginBottom: '24px', lineHeight: 1.5 }}>
              {dict.hardcoded.the_deal_has_been_created_in_t}
                                      </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                onClick={() => router.push(`/${currentLocale}/deals/${successLeadId}`)}
                style={{
                  width: '100%', padding: '12px', backgroundColor: '#003077', color: '#fff',
                  border: 'none', borderRadius: '8px', fontWeight: 500, cursor: 'pointer'
                }}
              >
                {dict.hardcoded.go_to_deal}
                                            </button>
              <button 
                onClick={resetForm}
                style={{
                  width: '100%', padding: '12px', backgroundColor: '#f1f5f9', color: '#475569',
                  border: 'none', borderRadius: '8px', fontWeight: 500, cursor: 'pointer'
                }}
              >
                {dict.hardcoded.transfer_another_one}
                                            </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
