import React from 'react';
import Header from './Header';
import styles from '../../styles/Layout.module.css';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className={styles.layoutContainer}>
      <Header />
      <main className={styles.content}>{children}</main>
    </div>
  );
};

export default Layout;
