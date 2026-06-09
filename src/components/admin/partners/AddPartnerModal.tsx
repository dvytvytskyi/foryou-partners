'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Copy, RefreshCw, Globe, Tag as TagIcon, Hash, AlertCircle } from 'lucide-react';
import styles from './AddPartnerModal.module.css';
import { api } from '@/lib/api';

interface AddPartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  partner?: any; // Added for editing
}

const DEFAULT_LABELS = ['Facebook', 'Instagram', 'Google Ads', 'Direct', 'TikTok', 'Referral'];

export function AddPartnerModal({ isOpen, onClose, partner }: AddPartnerModalProps) {
  const isEditing = !!partner;
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    sourceLabels: [] as string[],
    amocrmSources: [] as string[],
    amocrmTags: [] as number[],
    country: '',
    direction: '',
    partnerType: '',
  });

  const [availableAmoSources, setAvailableAmoSources] = useState<string[]>([]);
  const [availableAmoTags, setAvailableAmoTags] = useState<{ id: number, name: string }[]>([]);
  const [loadingSources, setLoadingSources] = useState(false);
  const [loadingTags, setLoadingTags] = useState(false);
  const [errorSources, setErrorSources] = useState<string | null>(null);
  const [errorTags, setErrorTags] = useState<string | null>(null);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAmoSources();
      fetchAmoTags();
      document.body.style.overflow = 'hidden';

      if (partner) {
        setFormData({
          name: partner.name || '',
          email: partner.email || '',
          password: '', // Don't show existing password
          sourceLabels: partner.labels || [],
          amocrmSources: partner.source_values || [],
          amocrmTags: partner.tag_ids || [],
          country: partner.country || '',
          direction: partner.direction || '',
          partnerType: partner.partnerType || '',
        });
      } else {
        generatePassword();
      }
    } else {
      document.body.style.overflow = '';
      setErrorSources(null);
      setErrorTags(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        sourceLabels: [],
        amocrmSources: [],
        amocrmTags: [],
        country: '',
        direction: '',
        partnerType: '',
      });
    }
  }, [isOpen, partner]);

  const fetchAmoSources = async () => {
    setLoadingSources(true);
    setErrorSources(null);
    try {
      const { data } = await api.get('/amo-crm/sources');
      if (data?.items?.length) {
        setAvailableAmoSources(data.items);
      } else {
        setErrorSources('No sources found in amoCRM.');
      }
    } catch (err: any) {
      console.error('Failed to fetch amoCRM sources', err);
      setErrorSources(err.response?.data?.message || 'Failed to connect to amoCRM API');
    } finally {
      setLoadingSources(false);
    }
  };

  const fetchAmoTags = async () => {
    setLoadingTags(true);
    setErrorTags(null);
    try {
      const { data } = await api.get('/amo-crm/tags');
      if (data?.items?.length) {
        setAvailableAmoTags(data.items);
      } else {
        setErrorTags('No tags found in amoCRM.');
      }
    } catch (err: any) {
      console.error('Failed to fetch amoCRM tags', err);
      setErrorTags(err.response?.data?.message || 'Failed to connect to amoCRM API');
    } finally {
      setLoadingTags(false);
    }
  };

  const generatePassword = () => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let retVal = "";
    for (let i = 0, n = charset.length; i < 12; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    setFormData(prev => ({ ...prev, password: retVal }));
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(formData.password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleItem = (list: 'sourceLabels' | 'amocrmSources', item: string) => {
    setFormData(prev => {
      const current = prev[list];
      const next = current.includes(item) 
        ? current.filter(i => i !== item) 
        : [...current, item];
      return { ...prev, [list]: next };
    });
  };

  const toggleTag = (id: number) => {
    setFormData(prev => {
      const current = prev.amocrmTags;
      const next = current.includes(id) 
        ? current.filter(i => i !== id) 
        : [...current, id];
      return { ...prev, amocrmTags: next };
    });
  };

  const handleSubmit = async () => {
    if (!formData.name || (!isEditing && !formData.email)) {
      alert('Please fill in Name and Email');
      return;
    }

    try {
      if (isEditing) {
        await api.put(`/admin/partners/${partner.id}`, {
          name: formData.name,
          source_values: formData.amocrmSources,
          labels: formData.sourceLabels,
          tag_ids: formData.amocrmTags,
          is_active: partner.is_active, // preserve status
          country: formData.country,
          direction: formData.direction,
          partnerType: formData.partnerType,
        });
      } else {
        await api.post('/admin/partners', {
          name: formData.name,
          tag_ids: formData.amocrmTags,
          source_values: formData.amocrmSources,
          labels: formData.sourceLabels,
          country: formData.country,
          direction: formData.direction,
          partnerType: formData.partnerType,
          user: {
            email: formData.email,
            temp_password: formData.password
          }
        });
      }
      onClose();
    } catch (error) {
      console.error('Failed to save partner', error);
      alert('Error saving partner account');
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{isEditing ? 'Edit Partner' : 'Add New Partner'}</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Partner Name</label>
              <input 
                type="text" 
                placeholder="e.g. Real Estate Hub" 
                className={styles.input}
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            {!isEditing && (
              <div className={styles.formGroup}>
                <label className={styles.label}>Admin Email</label>
                <input 
                  type="email" 
                  placeholder="contact@agency.com" 
                  className={styles.input}
                  value={formData.email}
                  onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
            )}
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Country</label>
              <input 
                type="text" 
                placeholder="e.g. UAE" 
                className={styles.input}
                value={formData.country}
                onChange={e => setFormData(prev => ({ ...prev, country: e.target.value }))}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Direction</label>
              <input 
                type="text" 
                placeholder="e.g. Dubai Marina" 
                className={styles.input}
                value={formData.direction}
                onChange={e => setFormData(prev => ({ ...prev, direction: e.target.value }))}
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Partner Type</label>
              <input 
                type="text" 
                placeholder="e.g. Freelance Broker" 
                className={styles.input}
                value={formData.partnerType}
                onChange={e => setFormData(prev => ({ ...prev, partnerType: e.target.value }))}
              />
            </div>
          </div>

          {!isEditing && (
            <div className={styles.formGroup}>
              <label className={styles.label}>Generated Password</label>
              <div className={styles.passwordRow}>
                <input type="text" readOnly className={styles.input} value={formData.password} />
                <button className={styles.iconBtn} onClick={generatePassword} title="Regenerate">
                  <RefreshCw size={14} />
                </button>
                <button className={styles.iconBtn} onClick={copyPassword} title="Copy">
                  {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                </button>
              </div>
              <p className={styles.hint}>Make sure to copy and send this to the partner.</p>
            </div>
          )}

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <Globe size={14} />
              Partner Source Labels (Display)
            </div>
            <div className={styles.chipGrid}>
              {DEFAULT_LABELS.map(label => (
                <button 
                  key={label}
                  className={`${styles.chip} ${formData.sourceLabels.includes(label) ? styles.chipActive : ''}`}
                  onClick={() => toggleItem('sourceLabels', label)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <TagIcon size={14} />
              amoCRM Technical Sources (Filtering)
            </div>
            <div className={styles.sourceSelectorWrapper}>
              {loadingSources ? (
                <div className={styles.loadingSmall}>Fetching sources from amoCRM...</div>
              ) : errorSources ? (
                <div className={styles.errorBox}>
                  <AlertCircle size={14} />
                  <span>{errorSources}</span>
                  <button className={styles.retryBtn} onClick={fetchAmoSources}>
                    <RefreshCw size={12} /> Retry
                  </button>
                </div>
              ) : (
                <div className={styles.chipGrid}>
                  {availableAmoSources.map(source => (
                    <button 
                      key={source}
                      className={`${styles.chip} ${formData.amocrmSources.includes(source) ? styles.chipActive : ''}`}
                      onClick={() => toggleItem('amocrmSources', source)}
                    >
                      {source}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <Hash size={14} />
              amoCRM Technical Tags (Filtering)
            </div>
            <div className={styles.sourceSelectorWrapper}>
              {loadingTags ? (
                <div className={styles.loadingSmall}>Fetching tags from amoCRM...</div>
              ) : errorTags ? (
                <div className={styles.errorBox}>
                  <AlertCircle size={14} />
                  <span>{errorTags}</span>
                  <button className={styles.retryBtn} onClick={fetchAmoTags}>
                    <RefreshCw size={12} /> Retry
                  </button>
                </div>
              ) : (
                <div className={styles.chipGrid}>
                  {availableAmoTags.map(tag => (
                    <button 
                      key={tag.id}
                      className={`${styles.chip} ${formData.amocrmTags.includes(tag.id) ? styles.chipActive : ''}`}
                      onClick={() => toggleTag(tag.id)}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button className={styles.submitBtn} onClick={handleSubmit}>
            {isEditing ? 'Update Partner Profile' : 'Create Partner Account'}
          </button>
        </div>
      </div>
    </div>
  );
}
