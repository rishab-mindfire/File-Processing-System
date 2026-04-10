import { Link } from 'react-router-dom';
import styles from './PageNotFound.module.css';

const PageNotFound = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.errorCode}>404</h1>
      <h2 className={styles.message}>Oops! Page Not Found</h2>

      <Link to="/projects" className={styles.backLink}>
        Back to projects
      </Link>
    </div>
  );
};

export default PageNotFound;
