'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/stores/auth.store';
import { MarkdownRenderer } from '@/components/knowledge/MarkdownRenderer';
import styles from './ArticleDetail.module.css';

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const locale = params.locale as string;
  
  const user = useAuthStore((state) => state.user);

  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchArticle = async () => {
      try {
        const { data } = await api.get(`/knowledge/${id}`);
        setArticle(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [id]);

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading...</div>;
  }

  if (!article) {
    return <div style={{ padding: '2rem' }}>Article not found</div>;
  }

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const title = locale === 'ru' ? article.titleRu : article.titleEn;
  const desc = locale === 'ru' ? article.descriptionRu : article.descriptionEn;
  const links = locale === 'ru' ? article.linksRu : article.linksEn;

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    try {
      await api.delete(`/knowledge/${id}`);
      router.push(`/${locale}/knowledge`);
    } catch (e) {
      console.error(e);
      alert('Failed to delete article');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <Link href={`/${locale}/knowledge`} className={styles.backLink}>
          ← Back to Knowledge Base
        </Link>
        {user?.role === 'admin' && (
          <button className={styles.deleteBtn} onClick={handleDelete}>
            Delete Article
          </button>
        )}
      </div>
      
      <div className={styles.card}>
        <h1 className={styles.title}>{title}</h1>
        
        <div className={styles.meta}>
          <span className={styles.author}>{article.author?.name || 'Admin'}</span>
          <span className={styles.date}>{formatDate(article.createdAt)}</span>
        </div>
        
        <div className={styles.content}>
          <MarkdownRenderer content={desc} />
        </div>

        {links && links.length > 0 && (
          <div className={styles.linksSection}>
            <h3 className={styles.linksTitle}>Useful Links</h3>
            <ul className={styles.linksList}>
              {links.map((link: any, idx: number) => (
                <li key={idx}>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className={styles.link}>
                    {link.title || link.url}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
