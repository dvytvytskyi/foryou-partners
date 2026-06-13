'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth.store';
import { api } from '@/lib/api';
import styles from './KnowledgeClient.module.css';
import { CreateArticleModal } from './CreateArticleModal';

export function KnowledgeClient({ dict }: any) {
  const user = useAuthStore((state) => state.user);
  const pathname = usePathname();
  const currentLocale = pathname.split('/')[1] || 'en';
  
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchArticles = async () => {
    try {
      const { data } = await api.get('/knowledge');
      setArticles(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString(currentLocale, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#1e293b', margin: 0 }}>
          {dict?.title || 'Knowledge Base'}
        </h2>
        {user?.role === 'admin' && (
          <button className={styles.addBtn} onClick={() => setIsModalOpen(true)}>
            + {dict?.add_article || 'Add Article'}
          </button>
        )}
      </div>

      {loading ? (
        <div>{dict?.loading || 'Loading...'}</div>
      ) : articles.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          {dict?.no_articles || 'No articles yet.'}
        </div>
      ) : (
        <div className={styles.grid}>
          {articles.map((item) => (
            <Link href={`/${currentLocale}/knowledge/${item.id}`} key={item.id} className={styles.card}>
              <h3 className={styles.cardTitle}>{currentLocale === 'ru' ? item.titleRu : item.titleEn}</h3>
              <p className={styles.cardDesc}>{(currentLocale === 'ru' ? item.descriptionRu : item.descriptionEn)?.replace(/\*\*/g, '').replace(/\*/g, '')}</p>
              
              <div className={styles.footer}>
                <div className={styles.author}>
                  {item.author?.name || 'Admin'}
                </div>
                <div>{formatDate(item.createdAt)}</div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {isModalOpen && (
        <CreateArticleModal 
          dict={dict} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => {
            setIsModalOpen(false);
            fetchArticles();
          }} 
        />
      )}
    </div>
  );
}
