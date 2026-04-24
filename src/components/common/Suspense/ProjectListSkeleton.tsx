import styles from './Skeleton.module.css';

const ProjectListSkeleton = () => {
  return (
    <div className={styles.skeletonContainer}>
      {/* header part rendering */}
      <div className={styles.topHeader}>
        <div className={`${styles.skeleton} ${styles.skeletonTitle}`}></div>
        <div className={`${styles.skeleton} ${styles.skeletonButton}`}></div>
      </div>
      {/* table header */}
      <div className={styles.skeletonHeader}>
        <div className={`${styles.skeleton} ${styles.cell}`}></div>
        <div className={`${styles.skeleton} ${styles.cell}`}></div>
        <div className={`${styles.skeleton} ${styles.cell}`}></div>
      </div>
      {/* table body */}
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
