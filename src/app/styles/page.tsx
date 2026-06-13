import styles from './styles.module.css';

import dictRu from '@/i18n/dictionaries/ru.json';
import dictEn from '@/i18n/dictionaries/en.json';
const dict = typeof window !== 'undefined' && window.location.pathname.startsWith('/en') ? dictEn : dictRu;

export default function StylesPage() {
  return (
    <main className="container p-6">
      <header className="mb-6 border-b pb-4">
        <h1>{"Style Placeholder"}</h1>
        <p>{"Style Placeholder"}</p>
      </header>

      <section className="flex flex-col gap-6">
        {/* Typography */}
        <div className="card">
          <h2 className="mb-4">{"Style Placeholder"}</h2>
          <div className="flex flex-col gap-2">
            <h1>{"Style Placeholder"}</h1>
            <h2>{"Style Placeholder"}</h2>
            <p>{"Style Placeholder"}</p>
            <div className="flex gap-2">
               <span className="badge">Caption (12px)</span>
            </div>
          </div>
        </div>

        {/* Colors */}
        <div className="card">
          <h2 className="mb-4">{"Style Placeholder"}</h2>
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
          <h2 className="mb-4">{"Style Placeholder"}</h2>
          <div className="flex gap-4">
            <button className="button button-primary">{"Style Placeholder"}</button>
            <button className="button button-secondary">{"Style Placeholder"}</button>
            <button className="button button-ghost">{"Style Placeholder"}</button>
          </div>
        </div>

        {/* Forms */}
        <div className="card">
          <h2 className="mb-4">{"Style Placeholder"}</h2>
          <div className="flex flex-col gap-4" style={{ maxWidth: 400 }}>
            <div className="flex flex-col gap-1">
              <label style={{ fontSize: '14px', fontWeight: 'var(--font-weight-medium)' }}>{"Style Placeholder"}</label>
              <input 
                type="email" 
                className="input" 
                placeholder="example@gmail.com" 
                autoComplete="off"
                name="email_not_standard"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label style={{ fontSize: '14px', fontWeight: 'var(--font-weight-medium)' }}>{"Style Placeholder"}</label>
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
          <h2 className="mb-4">{"Style Placeholder"}</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '12px 10px', fontSize: '14px', color: 'var(--grey-500)', fontWeight: 500 }}>{"Style Placeholder"}</th>
                  <th style={{ padding: '12px 10px', fontSize: '14px', color: 'var(--grey-500)', fontWeight: 500 }}>{"Style Placeholder"}</th>
                  <th style={{ padding: '12px 10px', fontSize: '14px', color: 'var(--grey-500)', fontWeight: 500 }}>{"Style Placeholder"}</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--grey-100)' }}>
                  <td style={{ padding: '12px 10px', fontSize: '14px' }}>{"Style Placeholder"}</td>
                  <td style={{ padding: '12px 10px' }}><span className="badge badge-success">{"Style Placeholder"}</span></td>
                  <td style={{ padding: '12px 10px', fontSize: '14px' }}>{"Style Placeholder"}</td>
                </tr>
                <tr>
                  <td style={{ padding: '12px 10px', fontSize: '14px' }}>{"Style Placeholder"}</td>
                  <td style={{ padding: '12px 10px' }}><span className="badge">{"Style Placeholder"}</span></td>
                  <td style={{ padding: '12px 10px', fontSize: '14px' }}>{"Style Placeholder"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
