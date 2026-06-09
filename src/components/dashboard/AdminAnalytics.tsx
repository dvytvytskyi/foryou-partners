'use client';

import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import styles from './AdminAnalytics.module.css';

interface AdminAnalyticsProps {
  data?: {
    barChart: any[];
    areaChart: any[];
    revenueTotal?: number;
  };
}

export function AdminAnalytics({ data }: AdminAnalyticsProps) {
  const barData = data?.barChart || [];
  const areaData = data?.areaChart || [];
  const revenueTotal = data?.revenueTotal || 0;
  return (
    <div className={styles.container}>
      <div className={styles.barChartCard}>
        <div className={styles.cardHeader}>
          <div className={styles.headerInfo}>
            <h3 className={styles.cardTitle}>Total Leads Distribution</h3>
          </div>
        </div>
        <div className={styles.chartWrapper}>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#a1a1aa' }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#a1a1aa' }}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                cursor={{ fill: '#f8fafc' }}
              />
              <Bar 
                dataKey="leads" 
                fill="#003077" 
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={styles.lineChartCard}>
        <div className={styles.cardHeader}>
          <div className={styles.headerInfo}>
            <h3 className={styles.cardTitle}>Revenue Trend (Won Deals)</h3>
            <div className={styles.cardValue}>${revenueTotal.toLocaleString()}</div>
          </div>
        </div>
        <div className={styles.chartWrapper}>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={areaData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#003077" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#003077" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
              />
              <Area 
                type="monotone" 
                dataKey="wonValue" 
                stroke="#003077" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorRev)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
