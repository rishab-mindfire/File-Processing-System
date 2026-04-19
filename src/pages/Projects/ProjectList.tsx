import React, { useReducer, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { initialState, projectReducer } from '../../reducers/ProjectReducer';
import { projectService } from '../../services/projectService';
import Modal from '../../components/modal/Modal';
import styles from './ProjectList.module.css';
import type { CreateNewProject, Project } from '../../models/Types';
import Loader from '../../components/common/Loader';
import { usePagination } from '../../hooks/usePagination';
import { formatDate } from '../../hooks/customeHooks';

export default function ProjectList() {
  const [projectState, dispatch] = useReducer(projectReducer, initialState);
  const { currentData, currentPage, totalPages, nextPage, prevPage, hasPrevPage, hasNextPage } =
    usePagination(projectState.projects, 10);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        if (err) {
          dispatch({ type: 'FETCH_ERROR', payload: 'Failed to load projects' });
        }
      }
    };
    loadData();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    projectState.error = '';
    //  Clear previous errors
    dispatch({ type: 'FETCH_SUCCESS', payload: projectState.projects });
    setIsSubmitting(true);

    try {
      const projectPayload: CreateNewProject = {
        projectName: formData.name,
        projectDescription: formData.description,
      };

      const newProject = await projectService.createProject(projectPayload);
      const populatedProject = {
        ...newProject,
        totalFiles: 0,
        totalZips: 0,
      };
      dispatch({ type: 'ADD_PROJECT', payload: populatedProject });
      setIsCreateOpen(false);
      setFormData({ name: '', description: '' });
    } catch (error: unknown) {
      let errorMessage = 'An unexpected error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      dispatch({
        type: 'FETCH_ERROR',
        payload: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
    setFormData({ name: '', description: '' });
  };

  const confirmDelete = async () => {
    if (!projectToDelete) {
      return;
    }
    setIsSubmitting(true);

    try {
      await projectService.deleteProject(projectToDelete._id);
      dispatch({ type: 'DELETE_PROJECT', payload: projectToDelete._id });
      setProjectToDelete(null);
    } catch (err: unknown) {
      const error = err as Error & { response?: { data?: { message?: string } } };
      const errorMessage = error.response?.data?.message || error.message || 'Delete failed';

      dispatch({
        type: 'FETCH_ERROR',
        payload: errorMessage,
      });
    }
    setIsSubmitting(false);
  };

  if (projectState.loading) {
    return (
      <div className={styles.spinner} data-testid="loader">
        <Loader />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Projects</h1>
        <button className={styles.newProject} onClick={() => setIsCreateOpen(true)}>
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
                <th className={styles.actionsCell}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((project) => (
                <tr key={project._id}>
                  <td data-label="Name" className={styles.projectName}>
                    {project.projectName}
                  </td>
                  <td data-label="Files">{project.totalFiles}</td>
                  <td data-label="Jobs">{project.totalZips}</td>
                  <td data-label="CreatedAt">{formatDate(project.createdAt)}</td>
                  <td data-label="Actions" className={styles.actionsCell}>
                    <button
                      className={styles.open}
                      onClick={() => navigate(`/projects/${project._id}`)}
                    >
                      Open
                    </button>
                    <button
                      className={styles.btnDanger}
                      onClick={() => setProjectToDelete({ ...project })}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/*  Pagination Controls */}
          {projectState.projects.length > 10 && (
            <div className={styles.pagination}>
              <button className={styles.pageBtn} onClick={prevPage} disabled={!hasPrevPage}>
                &larr; Previous
              </button>
              <span className={styles.pageInfo}>
                Page <strong>{currentPage}</strong> of {totalPages}
              </span>
              <button className={styles.pageBtn} onClick={nextPage} disabled={!hasNextPage}>
                Next &rarr;
              </button>
            </div>
          )}
        </div>
      )}

      {/* Creating new project Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          dispatch({ type: 'FETCH_SUCCESS', payload: projectState.projects });
          projectState.error = '';
        }}
        title="Create New Project"
      >
        <form onSubmit={handleCreateProject} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Project Name</label>
            <input
              className={styles.modelInputField}
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter Project Name"
              required
            />
            {/* Display Validation Error */}
            {projectState.error && <div className={styles.errorMessage}>{projectState.error}</div>}
          </div>

          <div className={styles.formGroup}>
            <label>Description</label>
            <textarea
              className={styles.modelAeraField}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What is this project about?"
              rows={3}
            />
          </div>

          <div className="center">
            <button type="submit" className={styles.createProject} disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Deletion of project based on id */}
      <Modal
        isOpen={!!projectToDelete}
        onClose={() => {
          setProjectToDelete(null);
          projectState.error = '';
        }}
        title="Confirm Delete"
      >
        <div className={styles.form}>
          <p>
            Are you sure you want to delete <strong>{projectToDelete?.projectName}</strong> from
            project list ?
          </p>

          {/* Show error message if deletion fails */}
          {projectState.error && <div className={styles.errorMessage}>{projectState.error}</div>}

          <div className={styles.modalActions}>
            <button onClick={() => setProjectToDelete(null)} className={styles.createProject}>
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className={styles.confirmDltBtn}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Deleting...' : 'Confirm Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
