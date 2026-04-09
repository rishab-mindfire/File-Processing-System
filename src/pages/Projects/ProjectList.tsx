import React, { useReducer, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectReducer, initialState } from './ProjectReducer';
import { projectService } from '../../services/projectService';
import Modal from '../../components/modal/Modal';
import styles from './ProjectList.module.css';
import type { Project } from '../../models/Types';

export default function ProjectList() {
  const [state, dispatch] = useReducer(projectReducer, initialState);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [newProjectName, setNewProjectName] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      dispatch({ type: 'FETCH_START' });
      try {
        const data = await projectService.getAllProjects();
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_ERROR', payload: 'Failed to load projects' });
        console.log(err);
      }
    };
    loadData();
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Create the dummy project object
    const newProject: Project = {
      id: Math.random().toString(36).substr(2, 9), // Random ID
      name: newProjectName, // This is a STRING (Safe to render)
      description: 'New project description',
      filesCount: 0,
      jobsCount: 0,
      createdAt: new Date().toISOString(),
    };

    // 2. Update the local state
    dispatch({ type: 'ADD_PROJECT', payload: newProject });

    // 3. Reset UI
    setIsCreateOpen(false);
    setNewProjectName('');
  };

  const confirmDelete = () => {
    if (projectToDelete) {
      dispatch({ type: 'DELETE_PROJECT', payload: projectToDelete });
      setProjectToDelete(null);
    }
  };

  if (state.loading) return <div className={styles.spinner}>Loading...</div>;

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

      {/* Manual Modal for Creating */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Project">
        <form onSubmit={handleCreate} className={styles.form}>
          <input
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="Enter Project Name"
            required
          />
          <button type="submit" className={styles.btnPrimary}>
            Create
          </button>
        </form>
      </Modal>

      {/* Manual Modal for Deletion */}
      <Modal
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        title="Confirm Delete">
        <p>Are you sure you want to delete this project?</p>
        <div className={styles.modalActions}>
          <button onClick={() => setProjectToDelete(null)}>Cancel</button>
          <button onClick={confirmDelete} className={styles.btnDanger}>
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}
