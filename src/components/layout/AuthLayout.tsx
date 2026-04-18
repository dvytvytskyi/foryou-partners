import React from 'react';
import styles from './AuthLayout.module.css';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className={styles.pageWrapper}>
      {/* Left Side: Light Gradient & Info */}
      <div className={styles.infoSide}>
        <div className={styles.logoSideWrapper}>
          <img 
            src="https://res.cloudinary.com/dgv0rxd60/image/upload/f_auto,q_auto,w_400/v1768389720/new_logo_blue.png" 
            alt="For You Real Estate" 
            className={styles.logoInfo}
          />
        </div>
        <div className={styles.infoContent}>
          <h2 className={styles.infoTitle}>Work effectively <br /> with For You</h2>
          <p className={styles.infoSubtitle}>Your personal partner portal for real-time lead management</p>
          
          <div className={styles.steps}>
            <div className={`${styles.stepCard} ${styles.accent}`}>
              <div className={styles.stepNumber}>1</div>
              <p>Instant access to all your leads in real time</p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>2</div>
              <p>Transparent status history and broker comments</p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>3</div>
              <p>Easy tracking of every deal's progress</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Auth Form */}
      <div className={styles.formSide}>
        <div className={styles.formContent}>
          <div className={styles.header}>
            {title && <h1>{title}</h1>}
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>

          <div className={styles.childrenWrapper}>
            {children}
          </div>
          
          <div className={styles.footer}>
            <p></p>
          </div>
        </div>
      </div>
    </div>
  );
}
