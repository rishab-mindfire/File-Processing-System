import styles from './Skeleton.module.css';

const ProjectListSkeleton = () => {
  return (
    <div className={styles.skeletonContainer}>
      <div className={styles.topHeader}>
        <div className={`${styles.skeleton} ${styles.skeletonTitle}`}></div>
        <div className={`${styles.skeleton} ${styles.skeletonButton}`}></div>
      </div>
      <div className={styles.skeletonHeader}>
        <div className={`${styles.skeleton} ${styles.cell}`}></div>
        <div className={`${styles.skeleton} ${styles.cell}`}></div>
        <div className={`${styles.skeleton} ${styles.cell}`}></div>
      </div>
      {[...Array(5)].map((_, index) => (
        <div key={index} className={styles.skeletonRow}>
          <div className={`${styles.skeleton} ${styles.cell}`}></div>
          <div className={`${styles.skeleton} ${styles.cell} ${styles.w75}`}></div>
          <div className={`${styles.skeleton} ${styles.cell} ${styles.w50}`}></div>
        </div>
      ))}
    </div>
  );
};

export default ProjectListSkeleton;
