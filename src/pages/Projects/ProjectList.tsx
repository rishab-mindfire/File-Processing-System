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
import deleteBtn from '../../assets/delete.png';

/**
 * ProjectList Page
 *
 * Responsibilities:
 * - Fetch and display all projects
 * - Create new project
 * - Delete existing project
 * - Handle pagination
 *
 * Uses:
 * - useReducer for centralized state management
 * - usePagination for client-side pagination
 *
 * @component
 */
export default function ProjectList() {
  const [projectState, dispatch] = useReducer(projectReducer, initialState);

  // Pagination hook for project list
  const { currentData, currentPage, totalPages, nextPage, prevPage, hasPrevPage, hasNextPage } =
    usePagination(projectState.projects, 10);

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // UI states
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Controlled form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const navigate = useNavigate();

  // Fetch all projects on mount
  useEffect(() => {
    const loadData = async () => {
      dispatch({ type: 'FETCH_START' });

      try {
        const data = await projectService.getAllProjects();
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (error) {
        if (error) {
          dispatch({
            type: 'FETCH_ERROR',
            payload: 'Failed to load projects',
          });
        }
      }
    };
    loadData();
  }, []);

  // Handle project creation
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      const projectPayload: CreateNewProject = {
        projectName: formData.name,
        projectDescription: formData.description,
      };

      const newProject = await projectService.createProject(projectPayload);

      // Enrich with UI-required fields
      const populatedProject: Project = {
        ...newProject,
        totalFiles: 0,
        totalZips: 0,
      };

      dispatch({ type: 'ADD_PROJECT', payload: populatedProject });

      // Reset form & close modal
      setFormData({ name: '', description: '' });
      setIsCreateOpen(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create project';

      dispatch({
        type: 'FETCH_ERROR',
        payload: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm and delete selected project
  const confirmDelete = async () => {
    if (!projectToDelete) {
      return;
    }

    setIsSubmitting(true);

    try {
      await projectService.deleteProject(projectToDelete._id);

      dispatch({
        type: 'DELETE_PROJECT',
        payload: projectToDelete._id,
      });

      setProjectToDelete(null);
    } catch (err: unknown) {
      const error = err as Error & {
        response?: { data?: { message?: string } };
      };

      const message = error.response?.data?.message || error.message || 'Delete failed';

      dispatch({
        type: 'FETCH_ERROR',
        payload: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (projectState.loading) {
    return (
      <div className={styles.spinner} data-testid="loader">
        <Loader />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <h1>Projects</h1>

        <button className={styles.newProject} onClick={() => setIsCreateOpen(true)}>
          + New Project
        </button>
      </header>
      {/* Projects Table with Empty State & Pagination */}
      {projectState.projects.length === 0 ? (
        <div className={styles.noProjectFound}>No projects found.</div>
      ) : (
        <div className={styles.tableContainer}>
          {/* Project Table */}
          <table className={styles.table} role="table" aria-label="Projects table">
            <thead>
              <tr className={styles.tableHeader}>
                <th scope="col" className={styles.projectName}>
                  Name
                </th>
                <th scope="col">Files</th>
                <th scope="col">Jobs</th>
                <th scope="col">Created Date</th>
                <th scope="col" className={styles.actionsCell}>
                  <div>Actions</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(currentData) && currentData.length > 0 ? (
                currentData.map((project) => (
                  <tr key={project._id} role="row">
                    <td data-label="Name" className={styles.projectName}>
                      {project.projectName}
                    </td>
                    <td data-label="Files">{project.totalFiles || 0}</td>
                    <td data-label="Jobs">{project.totalZips || 0}</td>
                    <td data-label="Created Date">{formatDate(project.createdAt)}</td>
                    <td className={styles.actions}>
                      <button
                        className={styles.open}
                        onClick={() => navigate(`/projects/${project._id}`)}
                        aria-label={`Open project ${project.projectName}`}
                      >
                        Open
                      </button>
                      <button
                        className={styles.iconButton}
                        onClick={() => setProjectToDelete(project)}
                        aria-label={`Delete project ${project.projectName}`}
                        title="Delete project"
                      >
                        <img src={deleteBtn} alt="Delete project" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className={styles.noData} role="status">
                    No projects available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination - Only show if needed */}
          {currentData.length > 9 && (
            <div className={styles.pagination} role="navigation" aria-label="Pagination">
              <button
                className={styles.pageBtn}
                onClick={prevPage}
                disabled={!hasPrevPage}
                aria-label="Previous page"
              >
                ← Previous
              </button>
              <span className={styles.pageInfo} aria-live="polite">
                Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
              </span>
              <button
                className={styles.pageBtn}
                onClick={nextPage}
                disabled={!hasNextPage}
                aria-label="Next page"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}
      {/* Create Project Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setFormData({ name: '', description: '' });
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
              required
            />

            {projectState.error && <div className={styles.errorMessage}>{projectState.error}</div>}
          </div>

          <div className={styles.formGroup}>
            <label>Description</label>

            <textarea
              className={styles.modelAeraField}
              value={formData.description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value,
                })
              }
              rows={3}
            />
          </div>

          <div className="center">
            <button
              type="submit"
              role="button"
              className={styles.createProject}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        title="Confirm Delete"
      >
        <div className={styles.form}>
          <p>
            Are you sure you want to delete <strong>{projectToDelete?.projectName}</strong>?
          </p>

          {projectState.error && <div className={styles.errorMessage}>{projectState.error}</div>}

          <div className={styles.modalActions}>
            <button onClick={() => setProjectToDelete(null)} className={styles.cancelBtn}>
              Cancel
            </button>

            <button
              onClick={confirmDelete}
              className={styles.confirmDltBtn}
              disabled={isSubmitting}
              role="button"
            >
              {isSubmitting ? 'Deleting...' : 'Confirm Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
