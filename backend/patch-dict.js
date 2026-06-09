const fs = require('fs');

const en = JSON.parse(fs.readFileSync('src/i18n/dictionaries/en.json', 'utf8'));
const ru = JSON.parse(fs.readFileSync('src/i18n/dictionaries/ru.json', 'utf8'));

en.deal_detail = {
  back: "Back to deals",
  status: "Status",
  unknown: "Unknown",
  loading: "Loading details...",
  not_found: "Deal not found",
  ask_question: "Ask a question",
  question_subject: "Question about deal:",
  history: {
    created: "Created",
    source: "Source",
    not_specified: "Not specified",
    budget: "Budget",
    finances_locked: "Finances will appear<br/>after closing",
    loading_history: "Loading history...",
    deal_created: "Deal created and assigned to broker",
    system: "System",
    status_change: "Status changed:",
    type_message: "Type a message..."
  },
  broker: {
    not_assigned: "Not assigned",
    broker: "Broker",
    assigned: "Assigned",
    broker_desc: "The broker leads the deal via AmoCRM. All actions and comments are broadcasted to your cabinet.",
    call: "Call",
    client_data: "Client Data",
    client_name: "Client Name",
    client_phone: "Client Phone",
    city: "City",
    budget: "Budget",
    comment: "Comment",
    no_comments: "No comments"
  }
};

ru.deal_detail = {
  back: "Вернуться к сделкам",
  status: "Статус",
  unknown: "Неизвестно",
  loading: "Загрузка деталей...",
  not_found: "Сделка не найдена",
  ask_question: "Задать вопрос",
  question_subject: "Вопрос по сделке:",
  history: {
    created: "Создано",
    source: "Источник",
    not_specified: "Не указано",
    budget: "Бюджет",
    finances_locked: "Финансы появятся<br/>после закрытия",
    loading_history: "Загрузка истории...",
    deal_created: "Сделка создана и передана брокеру",
    system: "Система",
    status_change: "Изменение статуса:",
    type_message: "Написать сообщение..."
  },
  broker: {
    not_assigned: "Не назначено",
    broker: "Брокер",
    assigned: "Назначен",
    broker_desc: "Брокер ведет сделку через AmoCRM. Все его действия и комментарии транслируются в ваш кабинет.",
    call: "Позвонить",
    client_data: "Данные клиента",
    client_name: "Имя клиента",
    client_phone: "Телефон клиента",
    city: "Город",
    budget: "Бюджет",
    comment: "Комментарий",
    no_comments: "Нет комментариев"
  }
};

fs.writeFileSync('src/i18n/dictionaries/en.json', JSON.stringify(en, null, 2));
fs.writeFileSync('src/i18n/dictionaries/ru.json', JSON.stringify(ru, null, 2));
console.log('Dictionaries patched');
