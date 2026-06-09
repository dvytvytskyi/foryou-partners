'use client';

import React, { useState, useEffect } from 'react';
import { User, Bell, Shield, LogOut, Mail, Building, Clock, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import styles from './Profile.module.css';
import { api } from '@/lib/api';

export function ProfileClient({ dict }: { dict: any }) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/profile');
      setProfile(data);
    } catch (err) {
      console.error('Failed to fetch profile', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key: string) => {
    if (!profile) return;
    
    const newNotifications = { 
      ...profile.notifications, 
      [key]: !profile.notifications[key] 
    };

    // Optimistic update
    setProfile({ ...profile, notifications: newNotifications });

    try {
      await api.put('/profile/notifications', newNotifications);
    } catch (err) {
      console.error('Failed to update notifications', err);
      // Revert on error
      fetchProfile();
    }
  };

  const handleUpdatePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordStatus({ type: 'error', message: dict.settings?.password_mismatch || 'Новые пароли не совпадают' });
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setPasswordStatus({ type: 'error', message: dict.settings?.password_length || 'Пароль должен содержать минимум 6 символов' });
      return;
    }

    setUpdatingPassword(true);
    setPasswordStatus(null);

    try {
      await api.put('/profile/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setPasswordStatus({ type: 'success', message: dict.settings?.password_success || 'Пароль успешно обновлен' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      console.error('Failed to update password', err);
      setPasswordStatus({ 
        type: 'error', 
        message: err.response?.data?.message || dict.settings?.password_error || 'Не удалось обновить пароль' 
      });
    } finally {
      setUpdatingPassword(false);
    }
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!profile) return <div className="p-8 text-center text-red-500">Не удалось загрузить данные профиля</div>;

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {/* Left Column: Profile Card */}
        <div className={styles.leftCol}>
          <div className={styles.card}>
            <div className={styles.profileInfo}>
              <div className={styles.avatar}>
                {getInitials(profile.email)}
              </div>
              <h2 className={styles.userName}>{profile.partner?.name || dict.admin}</h2>
              <p className={styles.userEmail}>{profile.email}</p>
              <span className={styles.roleBadge}>{profile.role.replace('_', ' ')}</span>

              <div className={styles.infoList}>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>
                    <Building size={14} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                    {dict.role}
                  </div>
                  <div className={styles.infoValue}>{profile.partner?.name || 'For You Real Estate'}</div>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>
                    <Clock size={14} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                    {dict.since}
                  </div>
                  <div className={styles.infoValue}>{formatDate(profile.createdAt)}</div>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>
                    <Mail size={14} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                    {dict.email_verified}
                  </div>
                  <div className={styles.infoValue} style={{ color: '#10b981' }}>{dict.yes}</div>
                </div>
              </div>
            </div>
            
            <button className={`${styles.button} ${styles.dangerBtn}`} onClick={() => {
              localStorage.clear();
              window.location.href = '/login';
            }}>
              <LogOut size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              {dict.logout}
            </button>
          </div>
        </div>

        {/* Right Column: Settings */}
        <div className={styles.rightCol}>
          <div className={styles.settingsSection}>
            {/* Notifications Card */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>
                <Bell size={18} color="#003077" />
                {dict.notifications}
              </h3>
              
              <div className={styles.settingItem}>
                <div className={styles.settingText}>
                  <span className={styles.settingLabel}>{dict.settings?.status_change || 'Изменение статуса сделки'}</span>
                  <span className={styles.settingDesc}>{dict.settings?.status_change_desc || 'Получайте уведомления, когда сделка переходит на новый этап.'}</span>
                </div>
                <label className={styles.toggle}>
                  <input 
                    type="checkbox" 
                    checked={profile.notifications.statusChange} 
                    onChange={() => handleToggle('statusChange')}
                  />
                  <span className={styles.slider}></span>
                </label>
              </div>

              <div className={styles.settingItem}>
                <div className={styles.settingText}>
                  <span className={styles.settingLabel}>{dict.settings?.broker_change || 'Назначение брокера'}</span>
                  <span className={styles.settingDesc}>{dict.settings?.broker_change_desc || 'Получайте оповещения, когда за вашей сделкой закрепляется новый брокер.'}</span>
                </div>
                <label className={styles.toggle}>
                  <input 
                    type="checkbox" 
                    checked={profile.notifications.brokerChange} 
                    onChange={() => handleToggle('brokerChange')}
                  />
                  <span className={styles.slider}></span>
                </label>
              </div>

              <div className={styles.settingItem}>
                <div className={styles.settingText}>
                  <span className={styles.settingLabel}>{dict.settings?.weekly_report || 'Еженедельный отчет'}</span>
                  <span className={styles.settingDesc}>{dict.settings?.weekly_report_desc || 'Еженедельная сводка по вашим сделкам и статистике конверсии.'}</span>
                </div>
                <label className={styles.toggle}>
                  <input 
                    type="checkbox" 
                    checked={profile.notifications.weeklySummary} 
                    onChange={() => handleToggle('weeklySummary')}
                  />
                  <span className={styles.slider}></span>
                </label>
              </div>
            </div>

            {/* Security Card */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>
                <Shield size={18} color="#003077" />
                {dict.security}
              </h3>

              {passwordStatus && (
                <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm ${
                  passwordStatus.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {passwordStatus.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                  {passwordStatus.message}
                </div>
              )}

              <div className={styles.formGroup}>
                <label className={styles.inputLabel}>{dict.settings?.current_password || 'Текущий пароль'}</label>
                <input 
                  type="password" 
                  className={styles.input} 
                  placeholder="••••••••" 
                  value={passwordData.currentPassword}
                  onChange={e => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className={styles.formGroup}>
                  <label className={styles.inputLabel}>{dict.settings?.new_password || 'Новый пароль'}</label>
                  <input 
                    type="password" 
                    className={styles.input} 
                    value={passwordData.newPassword}
                    onChange={e => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.inputLabel}>{dict.settings?.confirm_password || 'Подтвердите пароль'}</label>
                  <input 
                    type="password" 
                    className={styles.input} 
                    value={passwordData.confirmPassword}
                    onChange={e => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  />
                </div>
              </div>

              <button 
                className={styles.button} 
                onClick={handleUpdatePassword}
                disabled={updatingPassword || !passwordData.currentPassword || !passwordData.newPassword}
              >
                {updatingPassword ? (dict.settings?.updating || 'Обновление...') : (dict.settings?.update_password || 'Обновить пароль')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
