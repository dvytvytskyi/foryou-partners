'use client';

import React from 'react';
import { 
  Users, 
  Target, 
  Zap, 
  BarChart3, 
  Calendar,
  Filter
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { RecentEvents } from '@/components/dashboard/RecentEvents';
import { ReferralSystem } from '@/components/dashboard/ReferralSystem';
import { KnowledgeBase } from '@/components/dashboard/KnowledgeBase';

import styles from './DashboardClient.module.css';

import { api } from '@/lib/api';

export function DashboardClient({ dict }: { dict: any }) {
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [period, setPeriod] = React.useState('30d');

  // Fetch dashboard data
  const fetchData = async () => {
    setLoading(true);
    try {
      let days = 30;
      if (period === '7d') days = 7;
      if (period === '90d') days = 90;
      if (period === '1y') days = 365;

      const start = new Date();
      start.setDate(start.getDate() - days);
      const end = new Date();
      
      const { data: dashboardData } = await api.get('/analytics/dashboard', {
        params: { date_from: start.toISOString(), date_to: end.toISOString() }
      });
      setData(dashboardData);
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, [period]);

  if (loading && !data) {
    return <div style={{ padding: '2rem' }}>{dict.loading}</div>;
  }

  return (
    <div className={styles.container}>
      {/* Dashboard Stats */}
      <DashboardStats 
        stats={data?.stats} 
        period={period} 
        onPeriodChange={setPeriod} 
        dict={dict.stats}
      />

      {/* Recent Events */}
      <RecentEvents events={data?.recentEvents || []} dict={dict.recent_events} />

      {/* Referral System */}
      <ReferralSystem dict={dict.referrals} />

      {/* Knowledge Base */}
      <KnowledgeBase dict={dict.knowledge_base} />
    </div>
  );
}
