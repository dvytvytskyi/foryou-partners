'use client';

import React, { useState } from 'react';
import { 
  MessageSquare, 
  Bug, 
  Lightbulb, 
  ThumbsUp, 
  Upload, 
  Clock, 
  CheckCircle2, 
  Calendar,
  Send,
  AlertCircle
} from 'lucide-react';
import styles from './Feedback.module.css';

export function FeedbackClient({ dict }: { dict: any }) {
  const CATEGORIES = [
    { 
      id: 'bug', 
      label: dict.categories[0].label, 
      desc: dict.categories[0].desc, 
      icon: <Bug size={18} />, 
      color: '#fee2e2', 
      iconColor: '#dc2626' 
    },
    { 
      id: 'feature', 
      label: dict.categories[1].label, 
      desc: dict.categories[1].desc, 
      icon: <Lightbulb size={18} />, 
      color: '#f0f7ff', 
      iconColor: '#003077' 
    },
    { 
      id: 'other', 
      label: dict.categories[2].label, 
      desc: dict.categories[2].desc, 
      icon: <MessageSquare size={18} />, 
      color: '#f0fdf4', 
      iconColor: '#16a34a' 
    },
  ];

  const ROADMAP = [
    { title: 'Mobile App Beta', status: 'In Progress', color: '#f59e0b' },
    { title: 'PDF Report Export', status: 'Planned', color: '#003077' },
    { title: 'AI Lead Scoring', status: 'Researching', color: '#8b5cf6' },
    { title: 'Multi-Currency Support', status: 'Completed', color: '#10b981' },
  ];


  const [category, setCategory] = useState('feature');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
    setSubject('');
    setMessage('');
  };

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {/* Left Col: Form */}
        <div className={styles.leftCol}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <MessageSquare size={18} color="#003077" />
              {dict.title}
            </h2>

            <div className={styles.categoryGrid}>
              {CATEGORIES.map(cat => (
                <div 
                  key={cat.id}
                  className={`${styles.categoryCard} ${category === cat.id ? styles.categoryActive : ''}`}
                  onClick={() => setCategory(cat.id)}
                >
                  <div className={styles.categoryIcon} style={{ backgroundColor: cat.color, color: cat.iconColor }}>
                    {cat.icon}
                  </div>
                  <span className={styles.categoryLabel}>{cat.label}</span>
                  <span className={styles.categoryDesc}>{cat.desc}</span>
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.label}>{dict.form.subject}</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  placeholder={dict.form.subject_placeholder}
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>{dict.form.desc}</label>
                <textarea 
                  className={`${styles.input} ${styles.textarea}`} 
                  placeholder={dict.form.desc_placeholder}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>{dict.form.attachments}</label>
                <div className={styles.uploadArea}>
                  <Upload size={20} color="#94a3b8" />
                  <p className={styles.uploadText}>
                    {dict.form.upload_text}<br />
                    <span>{dict.form.upload_hint}</span>
                  </p>
                </div>
              </div>

              <button type="submit" className={styles.submitBtn} disabled={isSubmitted}>
                {isSubmitted ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={16} /> {dict.form.success}
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Send size={16} /> {dict.form.submit}
                  </span>
                )}
              </button>
            </form>
          </div>

          <div className={styles.historyTable}>
            <h3 className={styles.cardTitle}>{dict.history.title}</h3>
            <div className={styles.historyRow}>
              <div className={styles.historyInfo}>
                <span className={styles.historyTitle}>Add Dark Mode support</span>
                <span className={styles.historyMeta}>Submitted on 12 April 2026 • Feature Request</span>
              </div>
              <span className={styles.statusBadge} style={{ background: '#f0f9ff', color: '#0369a1' }}>Under Review</span>
            </div>
            <div className={styles.historyRow}>
              <div className={styles.historyInfo}>
                <span className={styles.historyTitle}>Table sorting bug in Leads</span>
                <span className={styles.historyMeta}>Submitted on 05 April 2026 • Bug Report</span>
              </div>
              <span className={styles.statusBadge} style={{ background: '#ecfdf5', color: '#047857' }}>Resolved</span>
            </div>
          </div>
        </div>

        {/* Right Col: Roadmap */}
        <div className={styles.rightCol}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <Calendar size={18} color="#003077" />
              {dict.roadmap.title}
            </h3>
            <p className={styles.categoryDesc} style={{ marginBottom: '1.25rem' }}>
              {dict.roadmap.desc}
            </p>

            <div className={styles.roadmapList}>
              {ROADMAP.map((item, idx) => (
                <div key={idx} className={styles.roadmapItem}>
                  <div className={styles.statusDot} style={{ backgroundColor: item.color }} />
                  <div className={styles.itemContent}>
                    <span className={styles.itemTitle}>{item.title}</span>
                    <span className={styles.itemStatus} style={{ color: item.color }}>{item.status}</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <ThumbsUp size={14} color="#003077" />
                <span style={{ fontSize: '12px', fontWeight: '600' }}>{dict.roadmap.upvote}</span>
              </div>
              <p style={{ fontSize: '11px', color: '#64748b' }}>
                {dict.roadmap.upvote_desc}
              </p>
            </div>
          </div>

          <div className={styles.card} style={{ marginTop: '1rem', background: 'linear-gradient(135deg, #003077 0%, #001a4d 100%)', color: 'white', border: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <AlertCircle size={18} color="#93c5fd" />
              <span style={{ fontSize: '14px', fontWeight: '600' }}>{dict.roadmap.urgent_title}</span>
            </div>
            <p style={{ fontSize: '12px', color: '#bfdbfe', lineHeight: '1.5' }}>
              {dict.roadmap.urgent_desc}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
