'use client';

import React, { useEffect, useState, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Search, X, Briefcase, Settings, ArrowRight, Home, CreditCard, Users, HelpCircle, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { leadsApi } from '@/lib/api-leads';
import { useDebounce } from '@/hooks/use-debounce';
import styles from './SpotlightSearch.module.css';

interface SpotlightSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SpotlightSearch({ isOpen, onClose }: SpotlightSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] === 'en' ? 'en' : 'ru';

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState<'All' | 'Deals' | 'Navigation'>('All');
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: dealsData, isLoading: isLoadingDeals } = useQuery({
    queryKey: ['leads-search', debouncedQuery],
    queryFn: () => leadsApi.getLeads({ search: debouncedQuery, page_size: 5 }),
    enabled: isOpen && (activeCategory === 'All' || activeCategory === 'Deals'),
  });

  const CATEGORIES = [
    { id: 'All', label: locale === 'en' ? 'All' : 'Все' },
    { id: 'Deals', label: locale === 'en' ? 'Deals' : 'Сделки' },
    { id: 'Navigation', label: locale === 'en' ? 'Navigation' : 'Навигация' }
  ] as const;

  const NAVIGATION_ITEMS = [
    { id: 'nav-1', type: 'Navigation', title: locale === 'en' ? 'Dashboard' : 'Дашборд', subtitle: locale === 'en' ? 'Home page' : 'Главная страница', icon: Home, path: `/${locale}/` },
    { id: 'nav-2', type: 'Navigation', title: locale === 'en' ? 'Deals' : 'Сделки', subtitle: locale === 'en' ? 'Manage your deals' : 'Управление сделками', icon: Briefcase, path: `/${locale}/deals` },
    { id: 'nav-3', type: 'Navigation', title: locale === 'en' ? 'Payouts' : 'Выплаты', subtitle: locale === 'en' ? 'Finances and payouts' : 'Финансы и выплаты', icon: CreditCard, path: `/${locale}/payouts` },
    { id: 'nav-4', type: 'Navigation', title: locale === 'en' ? 'Referrals' : 'Рефералы', subtitle: locale === 'en' ? 'Referral program' : 'Реферальная программа', icon: Users, path: `/${locale}/referrals` },
    { id: 'nav-5', type: 'Navigation', title: locale === 'en' ? 'Support' : 'Служба поддержки', subtitle: locale === 'en' ? 'Help and tickets' : 'Помощь и тикеты', icon: HelpCircle, path: `/${locale}/support` },
    { id: 'nav-6', type: 'Navigation', title: locale === 'en' ? 'Profile' : 'Профиль', subtitle: locale === 'en' ? 'Account settings' : 'Настройки аккаунта', icon: Settings, path: `/${locale}/profile` },
  ];

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const searchResults = React.useMemo(() => {
    const results: any[] = [];
    
    // Filter navigation
    if (activeCategory === 'All' || activeCategory === 'Navigation') {
      const q = debouncedQuery.toLowerCase();
      results.push(...NAVIGATION_ITEMS.filter(item => 
        !q || item.title.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q)
      ));
    }

    // Add deals
    if (activeCategory === 'All' || activeCategory === 'Deals') {
      if (dealsData?.items) {
        results.push(...dealsData.items.map(deal => ({
          id: `deal-${deal.id}`,
          type: 'Deals',
          title: deal.title,
          subtitle: `${deal.city || (locale === 'en' ? 'Unknown city' : 'Город не указан')} • ${deal.budget ? '$'+deal.budget.toLocaleString() : (locale === 'en' ? 'No budget' : 'Без бюджета')}`,
          icon: User,
          path: `/${locale}/deals/${deal.id}`
        })));
      }
    }

    return results;
  }, [debouncedQuery, dealsData, activeCategory, locale]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchResults.length, activeCategory]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < searchResults.length - 1 ? prev + 1 : prev));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (searchResults[selectedIndex]) {
          router.push(searchResults[selectedIndex].path);
          onClose();
        }
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, searchResults, selectedIndex, router, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.searchRow}>
          <Search className={styles.searchIcon} size={20} />
          <input
            ref={inputRef}
            type="text"
            className={styles.input}
            placeholder={locale === 'en' ? "Search deals or pages..." : "Поиск сделок или страниц..."}
            value={query}
            onChange={e => {
              setQuery(e.target.value);
            }}
          />
          <div className={styles.closeBtn} onClick={onClose}>
            <X size={18} />
          </div>
        </div>

        <div className={styles.categoriesRow}>
          {CATEGORIES.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`${styles.categoryBtn} ${activeCategory === cat.id ? styles.categoryBtnActive : ''}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        
        <div className={styles.results}>
          {isLoadingDeals ? (
            <div className={styles.noResults}>
              {locale === 'en' ? "Loading..." : "Загрузка..."}
            </div>
          ) : searchResults.length > 0 ? (
            <div className={styles.resultsList}>
              {searchResults.map((result, index) => {
                const Icon = result.icon;
                return (
                  <div 
                    key={result.id}
                    className={`${styles.resultItem} ${index === selectedIndex ? styles.resultItemActive : ''}`}
                    onMouseEnter={() => setSelectedIndex(index)}
                    onClick={() => {
                      router.push(result.path);
                      onClose();
                    }}
                  >
                    <div className={`${styles.resultIcon} ${styles[result.type.toLowerCase()]} ${result.type === 'Navigation' ? styles.action : styles.lead}`}>
                      <Icon size={16} />
                    </div>
                    <div className={styles.resultInfo}>
                      <div className={styles.resultTitle}>{result.title}</div>
                      <div className={styles.resultSubtitle}>{result.subtitle}</div>
                    </div>
                    {index === selectedIndex && (
                      <div className={styles.enterHint}>
                        <span>Enter</span>
                        <ArrowRight size={12} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={styles.noResults}>
              {locale === 'en' ? `No results found for "${query}"` : `Ничего не найдено по запросу "${query}"`}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <div className={styles.footerLeft}>
            <div className={styles.key}>↑↓</div>
            <span>{locale === 'en' ? "to navigate" : "навигация"}</span>
            <div className={styles.key} style={{ marginLeft: '12px' }}>Enter</div>
            <span>{locale === 'en' ? "to select" : "выбрать"}</span>
            <div className={styles.key} style={{ marginLeft: '12px' }}>Esc</div>
            <span>{locale === 'en' ? "to close" : "закрыть"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
