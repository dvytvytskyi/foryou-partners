const fs = require('fs');

const enPath = 'src/i18n/dictionaries/en.json';
const ruPath = 'src/i18n/dictionaries/ru.json';

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const ru = JSON.parse(fs.readFileSync(ruPath, 'utf8'));

en.profile_page.settings = {
  status_change: "Deal Status Change",
  status_change_desc: "Receive notifications when a deal moves to a new stage.",
  broker_change: "Broker Assignment",
  broker_change_desc: "Get notified when a new broker is assigned to your deal.",
  weekly_report: "Weekly Report",
  weekly_report_desc: "Weekly summary of your deals and conversion statistics.",
  current_password: "Current Password",
  new_password: "New Password",
  confirm_password: "Confirm Password",
  update_password: "Update Password",
  updating: "Updating...",
  password_mismatch: "New passwords do not match",
  password_length: "Password must be at least 6 characters",
  password_success: "Password updated successfully",
  password_error: "Failed to update password"
};

ru.profile_page.settings = {
  status_change: "Изменение статуса сделки",
  status_change_desc: "Получайте уведомления, когда сделка переходит на новый этап.",
  broker_change: "Назначение брокера",
  broker_change_desc: "Получайте оповещения, когда за вашей сделкой закрепляется новый брокер.",
  weekly_report: "Еженедельный отчет",
  weekly_report_desc: "Еженедельная сводка по вашим сделкам и статистике конверсии.",
  current_password: "Текущий пароль",
  new_password: "Новый пароль",
  confirm_password: "Подтвердите пароль",
  update_password: "Обновить пароль",
  updating: "Обновление...",
  password_mismatch: "Новые пароли не совпадают",
  password_length: "Пароль должен содержать минимум 6 символов",
  password_success: "Пароль успешно обновлен",
  password_error: "Не удалось обновить пароль"
};

fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
fs.writeFileSync(ruPath, JSON.stringify(ru, null, 2));
console.log('Profile Dictionaries patched');
