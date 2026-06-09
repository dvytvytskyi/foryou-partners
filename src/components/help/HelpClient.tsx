'use client';

import React from 'react';
import { 
  Search, 
  BookOpen, 
  Zap, 
  ShieldCheck, 
  MessageCircle, 
  Mail, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import styles from './Help.module.css';

export function HelpClient({ dict }: { dict: any }) {
  const CATEGORIES = [
    {
      title: dict.categories[0].title,
      desc: dict.categories[0].desc,
      icon: <BookOpen size={24} />
    },
    {
      title: dict.categories[1].title,
      desc: dict.categories[1].desc,
      icon: <Zap size={24} />
    },
    {
      title: dict.categories[2].title,
      desc: dict.categories[2].desc,
      icon: <ShieldCheck size={24} />
    }
  ];

  const FAQS = [
    {
      q: dict.faqs[0].q,
      a: dict.faqs[0].a
    },
    {
      q: dict.faqs[1].q,
      a: dict.faqs[1].a
    },
    {
      q: dict.faqs[2].q,
      a: dict.faqs[2].a
    }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {CATEGORIES.map((cat, idx) => (
          <div key={idx} className={styles.categoryCard}>
            <div className={styles.iconWrapper}>
              {cat.icon}
            </div>
            <h3 className={styles.catTitle}>{cat.title}</h3>
            <p className={styles.catDesc}>{cat.desc}</p>
          </div>
        ))}
        
        <div className={styles.supportCard}>
          <div className={styles.supportIconWrapper}>
            <Mail size={24} />
          </div>
          <div className={styles.supportInfo}>
            <h3 className={styles.catTitle} style={{ color: 'white' }}>{dict.direct_support}</h3>
            <p className={styles.catDesc} style={{ color: '#bfdbfe' }}>{dict.hours}</p>
          </div>
          <button className={styles.supportBtn}>
            <Mail size={14} />
            {dict.email_support}
          </button>
        </div>
      </div>

      <div className={styles.faqSection}>
        <h2 className={styles.faqTitle}>{dict.faq_title}</h2>
        <div className={styles.faqList}>
          {FAQS.map((faq, idx) => (
            <div key={idx} className={styles.faqItem}>
              <h4 className={styles.faqQuestion}>{faq.q}</h4>
              <p className={styles.faqAnswer}>{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '3rem', paddingBottom: '2rem' }}>
        <p style={{ fontSize: '13px', color: '#94a3b8' }}>
          {dict.footer} <a href="#" style={{ color: '#003077', fontWeight: '500' }}>{dict.terms}</a>
        </p>
      </div>
    </div>
  );
}
