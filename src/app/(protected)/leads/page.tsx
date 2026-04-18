import React from 'react';
import { LeadsBoard } from '@/components/leads/LeadsBoard';

export default function LeadsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '600', color: 'var(--foreground)', marginBottom: '0.5rem' }}>
            Leads Management
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--grey-500)' }}>
            Track and manage your leads through the sales pipeline.
          </p>
        </div>
      </div>

      <LeadsBoard />
    </div>
  );
}
