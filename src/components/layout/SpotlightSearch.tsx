'use client';

import React, { useEffect, useState, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Search, X, Briefcase, Settings, ArrowRight, Home, CreditCard, Users, HelpCircle, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { leadsApi } from '@/lib/api-leads';
import { useDebounce } from '@/hooks/use-debounce';
import styles from './SpotlightSearch.module.css';

import dictRu from '@/i18n/dictionaries/ru.json';
import dictEn from '@/i18n/dictionaries/en.json';
const dict = typeof window !== 'undefined' && window.location.pathname.startsWith('/en') ? dictEn : dictRu;

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
    { id: 'All', label: locale === 'en' ? 'All' : dict.hardcoded.all },
    { id: 'Deals', label: locale === 'en' ? 'Deals' : dict.hardcoded.deals },
    { id: 'Navigation', label: locale === 'en' ? 'Navigation' : dict.hardcoded.navigation }
  ] as const;

  const NAVIGATION_ITEMS = [
    { id: 'nav-1', type: 'Navigation', title: locale === 'en' ? 'Dashboard' : dict.hardcoded.dashboard, subtitle: locale === 'en' ? 'Home page' : dict.hardcoded.home_page, icon: Home, path: `/${locale}/` },
    { id: 'nav-2', type: 'Navigation', title: locale === 'en' ? 'Deals' : dict.hardcoded.deals, subtitle: locale === 'en' ? 'Manage your deals' : dict.hardcoded.deal_management, icon: Briefcase, path: `/${locale}/deals` },
    { id: 'nav-3', type: 'Navigation', title: locale === 'en' ? 'Payouts' : dict.hardcoded.payouts, subtitle: locale === 'en' ? 'Finances and payouts' : dict.hardcoded.finance_payouts, icon: CreditCard, path: `/${locale}/payouts` },
    { id: 'nav-4', type: 'Navigation', title: locale === 'en' ? 'Referrals' : dict.hardcoded.referrals, subtitle: locale === 'en' ? 'Referral program' : dict.hardcoded.referral_program, icon: Users, path: `/${locale}/referrals` },
    { id: 'nav-5', type: 'Navigation', title: locale === 'en' ? 'Support' : dict.hardcoded.support_service, subtitle: locale === 'en' ? 'Help and tickets' : dict.hardcoded.help_tickets, icon: HelpCircle, path: `/${locale}/support` },
    { id: 'nav-6', type: 'Navigation', title: locale === 'en' ? 'Profile' : dict.hardcoded.profile, subtitle: locale === 'en' ? 'Account settings' : dict.hardcoded.account_settings, icon: Settings, path: `/${locale}/profile` },
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
          subtitle: `${deal.city || (locale === 'en' ? 'Unknown city' : dict.hardcoded.city_not_specified)} • ${deal.budget ? '$'+deal.budget.toLocaleString() : (locale === 'en' ? 'No budget' : dict.hardcoded.no_budget)}`,
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
            placeholder={locale === 'en' ? "Search deals or pages..." : dict.hardcoded.search_deals_or_pages}
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
              {locale === 'en' ? "Loading..." : dict.hardcoded.loading}
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
            <span>{locale === 'en' ? "to navigate" : dict.hardcoded.hc_42}</span>
            <div className={styles.key} style={{ marginLeft: '12px' }}>Enter</div>
            <span>{locale === 'en' ? "to select" : dict.hardcoded.select}</span>
            <div className={styles.key} style={{ marginLeft: '12px' }}>Esc</div>
            <span>{locale === 'en' ? "to close" : dict.hardcoded.hc_38}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
