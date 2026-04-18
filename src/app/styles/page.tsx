import styles from './styles.module.css';

export default function StylesPage() {
  return (
    <main className="container p-6">
      <header className="mb-6 border-b pb-4">
        <h1>Дизайн-система (UI Kit)</h1>
        <p>Для Partner Portal — For You Real Estate</p>
      </header>

      <section className="flex flex-col gap-6">
        {/* Typography */}
        <div className="card">
          <h2 className="mb-4">Типографіка (Всі тексти 14px)</h2>
          <div className="flex flex-col gap-2">
            <h1>Заголовок H1 (14px + Uppercase)</h1>
            <h2>Заголовок H2 (14px)</h2>
            <p>Основний текст (14px) — Inter Regular. Він використовується всюди.</p>
            <div className="flex gap-2">
               <span className="badge">Caption (12px)</span>
            </div>
          </div>
        </div>

        {/* Colors */}
        <div className="card">
          <h2 className="mb-4">Кольори</h2>
          <div className="flex gap-4">
            <div className="flex flex-col items-center gap-2">
              <div style={{ width: 60, height: 60, background: 'var(--primary-color)', borderRadius: 'var(--border-radius)' }} />
              <span className="badge">Primary: #003077</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div style={{ width: 60, height: 60, background: 'var(--grey-100)', borderRadius: 'var(--border-radius)' }} />
              <span className="badge">Grey 100</span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="card">
          <h2 className="mb-4">Кнопки (Текст 14px)</h2>
          <div className="flex gap-4">
            <button className="button button-primary">Основна кнопка</button>
            <button className="button button-secondary">Другорядна</button>
            <button className="button button-ghost">Привид (Ghost)</button>
          </div>
        </div>

        {/* Forms */}
        <div className="card">
          <h2 className="mb-4">Форми (Приховано автозаповнення)</h2>
          <div className="flex flex-col gap-4" style={{ maxWidth: 400 }}>
            <div className="flex flex-col gap-1">
              <label style={{ fontSize: '14px', fontWeight: 'var(--font-weight-medium)' }}>Електронна пошта</label>
              <input 
                type="email" 
                className="input" 
                placeholder="example@gmail.com" 
                autoComplete="off"
                name="email_not_standard"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label style={{ fontSize: '14px', fontWeight: 'var(--font-weight-medium)' }}>Пароль</label>
              <input 
                type="password" 
                className="input" 
                placeholder="••••••••" 
                autoComplete="new-password"
                name="pass_not_standard"
              />
            </div>
          </div>
        </div>

        {/* Table Preview */}
        <div className="card">
          <h2 className="mb-4">Приклад таблиці лідів</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '12px 10px', fontSize: '14px', color: 'var(--grey-500)', fontWeight: 500 }}>Клієнт</th>
                  <th style={{ padding: '12px 10px', fontSize: '14px', color: 'var(--grey-500)', fontWeight: 500 }}>Статус</th>
                  <th style={{ padding: '12px 10px', fontSize: '14px', color: 'var(--grey-500)', fontWeight: 500 }}>Брокер</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--grey-100)' }}>
                  <td style={{ padding: '12px 10px', fontSize: '14px' }}>Олександр В.</td>
                  <td style={{ padding: '12px 10px' }}><span className="badge badge-success">В роботі</span></td>
                  <td style={{ padding: '12px 10px', fontSize: '14px' }}>Дмитро Марков</td>
                </tr>
                <tr>
                  <td style={{ padding: '12px 10px', fontSize: '14px' }}>Марія К.</td>
                  <td style={{ padding: '12px 10px' }}><span className="badge">Новий</span></td>
                  <td style={{ padding: '12px 10px', fontSize: '14px' }}>Олена Ситник</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
