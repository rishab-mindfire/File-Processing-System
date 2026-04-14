import React, { useReducer, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { initialState, projectReducer } from '../../reducers/ProjectReducer';
import { projectService } from '../../services/projectService';
import Modal from '../../components/modal/Modal';
import styles from './ProjectList.module.css';
import type { Project } from '../../models/Types';
import Loader from '../../components/common/Loader';
import { usePagination } from '../../hooks/usePagination';

export default function ProjectList() {
  const [projectState, dispatch] = useReducer(projectReducer, initialState);
  const {
    currentData,
    currentPage,
    totalPages,
    nextPage,
    prevPage,
    hasPrevPage,
    hasNextPage,
  } = usePagination(projectState.projects, 10);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  // Track form inputs as strings
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      dispatch({ type: 'FETCH_START' });
      try {
        const data = await projectService.getAllProjects();
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_ERROR', payload: 'Failed to load projects' });
        console.error(err);
      }
    };
    loadData();
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();

    // Turn simple form strings into a full Project interface object
    const newProject: Project = {
      id: crypto.randomUUID(),
      name: formData.name,
      description: formData.description || 'No description provided',
      filesCount: 0,
      jobsCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };

    dispatch({ type: 'ADD_PROJECT', payload: newProject });

    // Reset UI
    setIsCreateOpen(false);
    setFormData({ name: '', description: '' });
  };

  const confirmDelete = () => {
    if (projectToDelete) {
      dispatch({ type: 'DELETE_PROJECT', payload: projectToDelete });
      setProjectToDelete(null);
    }
  };

  if (projectState.loading)
    return (
      <div className={styles.spinner} data-testid="loader">
        <Loader />
      </div>
    );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Projects</h1>
        <button
          className={styles.btnPrimary}
          onClick={() => setIsCreateOpen(true)}>
          + New Project
        </button>
      </header>

      {projectState.projects.length === 0 ? (
        <div className={styles.noProjectFound}>No projects found.</div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeader}>
                <th>Name</th>
                <th>Files</th>
                <th>Jobs</th>
                <th>Created Date</th>
                <th className={styles.action}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((project) => (
                <tr key={project.id}>
                  <td data-label="Name" className={styles.projectName}>
                    {project.name}
                  </td>
                  <td data-label="Files">{project.filesCount}</td>
                  <td data-label="Jobs">{project.jobsCount}</td>
                  <td data-label="CreatedAt">{project.createdAt}</td>
                  <td data-label="Actions" className={styles.actionsCell}>
                    <button
                      className={styles.open}
                      onClick={() => navigate(`/projects/${project.id}`)}>
                      Open
                    </button>
                    <button
                      className={styles.btnDanger}
                      onClick={() => setProjectToDelete(project.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/*  Pagination Controls */}
          {currentData.length > 10 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                onClick={prevPage}
                disabled={!hasPrevPage}>
                &larr; Previous
              </button>
              <span className={styles.pageInfo}>
                Page <strong>{currentPage}</strong> of {totalPages}
              </span>
              <button
                className={styles.pageBtn}
                onClick={nextPage}
                disabled={!hasNextPage}>
                Next &rarr;
              </button>
            </div>
          )}
        </div>
      )}

      {/* Creating new project Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Project">
        <form onSubmit={handleCreate} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Project Name</label>
            <input
              className={styles.modelInputField}
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter Project Name"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Description</label>
            <textarea
              className={styles.modelAeraField}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="What is this project about?"
              rows={3}
            />
          </div>
          <div className="center">
            <button type="submit" className={styles.createProject}>
              Create Project
            </button>
          </div>
        </form>
      </Modal>

      {/* Deletion of project based on id */}
      <Modal
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        title="Confirm Delete">
        <div className={styles.form}>
          <p>Are you sure you want to delete this project ?</p>
          <div className={styles.modalActions}>
            <button
              onClick={() => setProjectToDelete(null)}
              className={styles.createProject}>
              Cancel
            </button>
            <button onClick={confirmDelete} className={styles.confirmDltBtn}>
              Confirm Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
