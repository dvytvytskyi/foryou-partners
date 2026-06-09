import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import styles from './NotificationDropdown.module.css';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export function NotificationDropdown({ dict, currentLocale }: { dict: any, currentLocale: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get('/notifications?limit=20');
      return res.data as { data: Notification[], unreadCount: number };
    },
    refetchInterval: 30000, // Poll every 30s
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await api.patch(`/notifications/read-all`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
    setIsOpen(false);
    
    if (notification.link) {
      // If the link is relative, ensure it uses the current locale if it doesn't already
      const link = notification.link.startsWith('/') 
        ? `/${currentLocale}${notification.link}` 
        : notification.link;
      router.push(link);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(currentLocale === 'en' ? 'en-US' : 'ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className={styles.container} ref={dropdownRef}>
      <button className={styles.notificationBtn} onClick={() => setIsOpen(!isOpen)}>
        <img src="/icons/BellSimple.png" alt="Notifications" className={styles.notificationIcon} />
        {data?.unreadCount && data.unreadCount > 0 ? (
          <span className={styles.badge}>{data.unreadCount > 99 ? '99+' : data.unreadCount}</span>
        ) : null}
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.header}>
            <span className={styles.title}>{dict.notification_dropdown?.notifications || 'Уведомления'}</span>
            {data?.unreadCount && data.unreadCount > 0 ? (
              <button 
                className={styles.markAllBtn} 
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
              >
                {dict.notification_dropdown?.mark_all_read || 'Пометить всё как прочитанное'}
              </button>
            ) : null}
          </div>

          <div className={styles.list}>
            {isLoading ? (
              <div className={styles.empty}>{dict.notification_dropdown?.loading || 'Загрузка...'}</div>
            ) : data?.data && data.data.length > 0 ? (
              data.data.map((notification) => {
                const titleStr = dict.notification_dropdown?.types?.[notification.type] || notification.title || dict.notification_dropdown?.types?.DEFAULT_TITLE;
                return (
                  <button
                    key={notification.id} 
                    className={`${styles.item} ${!notification.isRead ? styles.itemUnread : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className={styles.itemContent}>
                      <span className={styles.itemTitle}>{titleStr}</span>
                      <span className={styles.itemMessage}>{notification.message}</span>
                      <span className={styles.itemTime}>{formatDate(notification.createdAt)}</span>
                    </div>
                    {!notification.isRead && <div className={styles.unreadDot} />}
                  </button>
                );
              })
            ) : (
              <div className={styles.empty}>{dict.notification_dropdown?.no_notifications || 'Нет новых уведомлений'}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
