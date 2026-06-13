'use client';

import React from 'react';
import Link from 'next/link';
import styles from './KnowledgeBase.module.css';

const ArrowUpRight = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="7" y1="17" x2="17" y2="7"></line>
    <polyline points="7 7 17 7 17 17"></polyline>
  </svg>
);

export function KnowledgeBase({ dict }: { dict: any }) {
  const articles = [
    {
      id: 1,
      tag: { label: dict.hardcoded.presentation, type: 'blue' },
      title: dict.hardcoded.co_exclusive_projects,
      description: dict.hardcoded.you_can_download_the_full_pres,
      author: 'Floyd Miles',
      date: 'Mar 5 04:25',
      avatar: 'https://i.pravatar.cc/100?img=11'
    },
    {
      id: 2,
      tag: { label: dict.hardcoded.presentation, type: 'blue' },
      title: dict.hardcoded.residence_permit_and_citizensh,
      description: dict.hardcoded.new_conditions_in_december_202,
      author: 'Albert Flores',
      date: 'Oct 4 15:49',
      avatar: 'https://i.pravatar.cc/100?img=12'
    },
    {
      id: 3,
      tag: { label: 'Event', type: 'purple' },
      title: dict.hardcoded.meeting_training_on_modern_uae,
      description: dict.hardcoded.leave_a_request,
      author: 'Albert Flores',
      date: 'Oct 4 15:49',
      avatar: 'https://i.pravatar.cc/100?img=12'
    }
  ];

  return (
    <div className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>{dict.title}</h2>
          <Link href="/knowledge" className={styles.link}>
            <ArrowUpRight /> {dict.view_all}
          </Link>
        </div>
        
        <div className={styles.cardsGrid}>
          {articles.map((article) => (
            <div key={article.id} className={styles.card}>
              <div className={styles.cardContent}>
                <span className={`${styles.badge} ${styles[`badge_${article.tag.type}`]}`}>
                  {article.tag.label}
                </span>
                <h3 className={styles.cardTitle}>{article.title}</h3>
                <p className={styles.cardDesc}>{article.description}</p>
              </div>
              <div className={styles.cardFooter}>
                <div className={styles.authorInfo}>
                  <img src={article.avatar} alt={article.author} className={styles.avatar} />
                  <span className={styles.authorName}>{article.author}</span>
                </div>
                <span className={styles.date}>{article.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
