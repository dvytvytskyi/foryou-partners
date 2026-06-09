const fs = require('fs');

const enPath = 'src/i18n/dictionaries/en.json';
const ruPath = 'src/i18n/dictionaries/ru.json';

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const ru = JSON.parse(fs.readFileSync(ruPath, 'utf8'));

en.notification_dropdown = {
  notifications: "Notifications",
  mark_all_read: "Mark all as read",
  loading: "Loading...",
  no_notifications: "No new notifications",
  types: {
    NEW_PARTNER: "New Partner",
    SYSTEM_ALERT: "System Alert",
    SUPPORT_TICKET: "Support Ticket Reply",
    DEFAULT_TITLE: "Notification",
    PAYOUT_STATUS_CHANGED: "Payout Status Changed"
  }
};

ru.notification_dropdown = {
  notifications: "Уведомления",
  mark_all_read: "Пометить всё как прочитанное",
  loading: "Загрузка...",
  no_notifications: "Нет новых уведомлений",
  types: {
    NEW_PARTNER: "Новый партнер",
    SYSTEM_ALERT: "Системное оповещение",
    SUPPORT_TICKET: "Ответ в тикете",
    DEFAULT_TITLE: "Уведомление",
    PAYOUT_STATUS_CHANGED: "Статус выплаты изменен"
  }
};

fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
fs.writeFileSync(ruPath, JSON.stringify(ru, null, 2));
console.log('Notification Dropdown Dictionaries patched');
