import React, { useState } from 'react';
import styles from '../../styles/Header.module.css';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <header className={styles.navbar}>
      <div className={styles.logo}>File Processing System</div>

      {/* Hamburger Toggle */}
      <button className={styles.menuBtn} onClick={toggleMenu}>
        <div className={styles.line}></div>
        <div className={styles.line}></div>
        <div className={styles.line}></div>
      </button>

      {/* sidebar=navigations */}
      <nav
        className={`${styles.navContainer} ${isOpen ? styles.navActive : ''}`}>
        <ul className={styles.navLinks}>
          <li>
            <Link to="/projects">Projects</Link>
          </li>
          <li className={styles.mobileLogout}>
            <button className={styles.btnLogout}>Logout</button>
          </li>
        </ul>
      </nav>

      {/* Logout button for smalll screen */}
      <div className={styles.desktopActions}>
        <button className={styles.btnLogout}>Logout</button>
      </div>
    </header>
  );
};

export default Header;
