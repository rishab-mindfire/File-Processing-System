import React, { useState } from 'react';
import styles from '../../styles/Header.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const navigate = useNavigate();
  const { logout } = useAuth();

  // log-out
  const handleLogout = () => {
    localStorage.removeItem('file-processing-system');
    logout();
    navigate('/login');
  };

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
            <button className={styles.btnLogout} onClick={handleLogout}>
              Logout
            </button>
          </li>
        </ul>
      </nav>

      {/* Logout button for smalll screen */}
      <div className={styles.desktopActions}>
        <button className={styles.btnLogout} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
