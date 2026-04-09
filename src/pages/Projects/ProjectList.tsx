import React, { useReducer, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectReducer, initialState } from './ProjectReducer';
import { projectService } from '../../services/projectService';
import Modal from '../../components/modal/Modal';
import styles from './ProjectList.module.css';
import type { Project } from '../../models/Types';
import Loader from '../../components/common/Loader';

export default function ProjectList() {
  const [state, dispatch] = useReducer(projectReducer, initialState);
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
      createdAt: new Date().toISOString(),
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

  if (state.loading)
    return (
      <div className={styles.spinner}>
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

      {state.projects.length === 0 ? (
        <div className={styles.empty}>No projects found.</div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Files</th>
              <th>Jobs</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {state.projects.map((project) => (
              <tr key={project.id}>
                <td className={styles.bold}>{project.name}</td>
                <td>{project.filesCount}</td>
                <td>{project.jobsCount}</td>
                <td>
                  <button onClick={() => navigate(`/projects/${project.id}`)}>
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
          <button type="submit" className={styles.btnPrimary}>
            Create Project
          </button>
        </form>
      </Modal>

      {/* Deletion of project based on id */}
      <Modal
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        title="Confirm Delete">
        <p>
          Are you sure you want to delete this project? This action cannot be
          undone.
        </p>
        <div className={styles.modalActions}>
          <button
            onClick={() => setProjectToDelete(null)}
            className={styles.btnSecondary}>
            Cancel
          </button>
          <button onClick={confirmDelete} className={styles.btnDanger}>
            Confirm Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}
