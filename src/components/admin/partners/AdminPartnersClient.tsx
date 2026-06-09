'use client';

import React, { useState, useEffect } from 'react';
import { RoleGate } from '@/components/auth/RoleGate';
import { StatCard } from '@/components/dashboard/StatCard';
import { api } from '@/lib/api';
import { Plus, Search, Edit2, Shield, Trash2, Users, CheckCircle, Tag } from 'lucide-react';
import styles from './Partners.module.css';
import { AddPartnerModal } from './AddPartnerModal';

export function AdminPartnersClient({ dict }: { dict: any }) {
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<any>(null);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/partners');
      setPartners(data?.items || []);
    } catch (err) {
      console.error('Failed to fetch partners', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (partner: any) => {
    setSelectedPartner(partner);
    setModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(dict.delete_confirm.replace('{name}', name))) {
      return;
    }

    try {
      await api.delete(`/admin/partners/${id}`);
      fetchPartners();
    } catch (err) {
      console.error('Failed to delete partner', err);
      alert('Failed to delete partner');
    }
  };

  const activeCount = partners.filter(p => p.is_active).length;
  const totalLeads = partners.reduce((sum, p) => sum + (p.leads_count || 0), 0);

  return (
    <RoleGate allowedRoles={['admin']} fallback={<div className="p-8 text-center text-red-500">{dict.access_denied}</div>}>
      <div className={styles.container}>
        <div className={styles.header} style={{ justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <button className={styles.addBtn} onClick={() => setModalOpen(true)}>
            <Plus size={16} />
            {dict.add_btn}
          </button>
        </div>

        <div className={styles.statsGrid}>
          <StatCard 
            title={dict.stats.total} 
            value={partners.length.toString()} 
            icon={Users} 
          />
          <StatCard 
            title={dict.stats.active} 
            value={activeCount.toString()} 
            icon={CheckCircle} 
          />
          <StatCard 
            title={dict.stats.leads} 
            value={totalLeads.toLocaleString()} 
            icon={Shield} 
          />
          <StatCard 
            title={dict.stats.sources} 
            value={partners.reduce((acc, p) => acc + (p.source_values?.length || 0), 0).toString()} 
            icon={Tag} 
          />
        </div>

        <div className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <h3 className={styles.tableTitle}>{dict.table.title}</h3>
            <div className={styles.searchBar}>
              <Search size={14} color="#a1a1aa" />
              <input 
                type="text" 
                placeholder={dict.table.search} 
                className={styles.searchInput}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: '220px' }}>{dict.table.name}</th>
                <th style={{ width: '120px' }}>{dict.table.status}</th>
                <th style={{ width: '100px' }}>{dict.table.leads}</th>
                <th>{dict.table.sources}</th>
                <th style={{ width: '80px' }}></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>{dict.table.loading}</td>
                </tr>
              ) : partners.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map(partner => (
                <tr key={partner.id}>
                  <td>
                    <div className={styles.partnerCell}>
                      <span className={styles.partnerName}>{partner.name}</span>
                      <span className={styles.partnerEmail}>{partner.email || dict.status.no_email}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${partner.is_active ? styles.badgeActive : styles.badgeInactive}`}>
                      {partner.is_active ? dict.status.active : dict.status.inactive}
                    </span>
                  </td>
                  <td>{partner.leads_count || 0}</td>
                  <td>
                    <div className={styles.tagList}>
                      {partner.source_values?.map((src: string) => (
                        <span key={src} className={`${styles.tag} ${styles.sourceTag}`}>{src}</span>
                      ))}
                      {(!partner.source_values || partner.source_values.length === 0) && (
                        <span style={{ color: '#a1a1aa', fontSize: '11px' }}>{dict.status.no_sources}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button 
                        className={styles.actionBtn} 
                        title="Edit Partner"
                        onClick={() => handleEdit(partner)}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        className={styles.actionBtn} 
                        title="Delete"
                        onClick={() => handleDelete(partner.id, partner.name)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && partners.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>{dict.table.empty}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddPartnerModal 
        isOpen={modalOpen} 
        partner={selectedPartner}
        onClose={() => {
          setModalOpen(false);
          setSelectedPartner(null);
          fetchPartners();
        }} 
      />
    </RoleGate>
  );
}
