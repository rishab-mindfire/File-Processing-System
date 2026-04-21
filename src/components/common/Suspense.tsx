import React from 'react';
import styles from './Suspense.module.css';
import type { SuspenseProps } from '../../models/Types';

const Suspense: React.FC<SuspenseProps> = ({ lines = 3, height = '120px', showAvatar = false }) => {
  return (
    <div role="status" aria-live="polite" className={styles.wrapper} style={{ height }}>
      {showAvatar && <div className={`${styles.skeleton} ${styles.avatar}`} />}

      <div className={styles.content}>
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className={styles.skeletonLine} style={{ width: `${100 - i * 15}%` }} />
        ))}
      </div>
    </div>
  );
};

export default Suspense;
