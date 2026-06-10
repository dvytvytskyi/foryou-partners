import React from 'react';
import Link from 'next/link';
import styles from './Knowledge.module.css';
import { getDictionary, Locale } from '@/i18n/getDictionary';

export default async function KnowledgePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  const articles = [
    {
      badge: dict.knowledge_page.articles[0].badge,
      badgeClass: 'badgeBlue',
      title: dict.knowledge_page.articles[0].title,
      desc: dict.knowledge_page.articles[0].desc,
      author: 'Floyd Miles',
      authorImg: 'https://i.pravatar.cc/100?img=12',
      date: 'Mar 5 04:25',
    },
    {
      badge: dict.knowledge_page.articles[1].badge,
      badgeClass: 'badgeBlue',
      title: dict.knowledge_page.articles[1].title,
      desc: dict.knowledge_page.articles[1].desc,
      author: 'Albert Flores',
      authorImg: 'https://i.pravatar.cc/100?img=33',
      date: 'Oct 4 15:49',
    },
    {
      badge: dict.knowledge_page.articles[2].badge,
      badgeClass: 'badgePurple',
      title: dict.knowledge_page.articles[2].title,
      desc: dict.knowledge_page.articles[2].desc,
      author: 'Albert Flores',
      authorImg: 'https://i.pravatar.cc/100?img=33',
      date: 'Oct 4 15:49',
    },
    {
      badge: dict.knowledge_page.articles[3].badge,
      badgeClass: 'badgeYellow',
      title: dict.knowledge_page.articles[3].title,
      desc: dict.knowledge_page.articles[3].desc,
      hasImage: true,
      author: 'Albert Flores',
      authorImg: 'https://i.pravatar.cc/100?img=33',
      date: 'Oct 4 15:49',
    },
  ];

  return (
    <div className={styles.pageContainer}>

      <div className={styles.grid}>
        {articles.map((item, idx) => (
          <Link href="#" key={idx} className={styles.card}>
            <span className={`${styles.badge} ${styles[item.badgeClass]}`}>
              {item.badge}
            </span>
            <h3 className={styles.cardTitle}>{item.title}</h3>
            <p className={styles.cardDesc}>{item.desc}</p>
            
            {item.hasImage && (
              <img src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&q=80" alt="Article cover" className={styles.imagePlaceholder} />
            )}

            <div className={styles.footer}>
              <div className={styles.author}>
                <img src={item.authorImg} alt={item.author} className={styles.avatar} />
                {item.author}
              </div>
              <div className={styles.date}>{item.date}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
