import React from 'react';

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: '600', color: 'var(--foreground)', marginBottom: '0.5rem' }}>
          Welcome back!
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--grey-500)' }}>
          Here's what's happening with your leads today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Simple stat cards placeholder */}
        <div className="card">
          <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--grey-400)', textTransform: 'uppercase' }}>Total Leads</span>
          <h2 style={{ fontSize: '32px', fontWeight: '700', color: 'var(--primary-color)', marginTop: '0.5rem' }}>1,248</h2>
        </div>
        <div className="card">
          <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--grey-400)', textTransform: 'uppercase' }}>Active Deals</span>
          <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#10b981', marginTop: '0.5rem' }}>84</h2>
        </div>
        <div className="card">
          <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--grey-400)', textTransform: 'uppercase' }}>Pending Status</span>
          <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#f59e0b', marginTop: '0.5rem' }}>12</h2>
        </div>
      </div>
      
      <div className="card" style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed' }}>
        <p style={{ color: 'var(--grey-400)' }}>Analytics charts and activity feed will be here</p>
      </div>
    </div>
  );
}
