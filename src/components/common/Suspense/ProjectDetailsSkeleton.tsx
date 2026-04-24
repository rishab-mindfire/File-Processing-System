import styles from './Skeleton.module.css';

const ProjectDetailsSkeleton = () => {
  return (
    <div className={styles.detailsContainer}>
      {/* header part */}
      <div className={styles.topHeader}>
        <div className={`${styles.skeleton} ${styles.skeletonBtnSmall}`}></div>
        <div className={`${styles.skeleton} ${styles.skeletonMainTitle}`}></div>
        <div></div>
      </div>

      <div className={styles.detailsGrid}>
        <div className={styles.leftCol}>
          <div className={`${styles.skeleton} ${styles.skeletonDropzone}`}></div>
          {/* file upload table part */}
          <div className={styles.cardSkeleton}>
            <div className={styles.cardHeader}>
              <div className={`${styles.skeleton} ${styles.skeletonTitleSmall}`}></div>
              <div className={`${styles.skeleton} ${styles.skeletonBtnMedium}`}></div>
            </div>
            {[...Array(4)].map((_, i) => (
              <div key={i} className={styles.skeletonRow}>
                <div className={`${styles.skeleton} ${styles.circle}`}></div>
                <div className={`${styles.skeleton} ${styles.cell}`}></div>
                <div className={`${styles.skeleton} ${styles.cellSmall}`}></div>
                <div className={`${styles.skeleton} ${styles.circle}`}></div>
              </div>
            ))}
          </div>
        </div>

        {/*job upload part */}
        <div className={styles.rightCol}>
          <div className={styles.cardSkeleton}>
            <div
              className={`${styles.skeleton} ${styles.skeletonTitleSmall}`}
              style={{ marginBottom: '20px' }}
            ></div>
            {[...Array(2)].map((_, i) => (
              <div key={i} className={styles.jobCard}>
                <div
                  className={`${styles.skeleton} ${styles.cell}`}
                  style={{ width: '100%' }}
                ></div>
                <div className={`${styles.skeleton} ${styles.progressBar}`}></div>
                <div className={styles.cardHeader}>
                  <div className={`${styles.skeleton} ${styles.skeletonBtnSmall}`}></div>
                  <div className={`${styles.skeleton} ${styles.cellSmall}`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsSkeleton;
