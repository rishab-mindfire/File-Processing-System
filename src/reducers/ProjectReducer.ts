import type { ProjectAction, ProjectState } from '../models/Types';

/**
 * Initial state for project management
 */
export const initialState: ProjectState = {
  projects: [],
  loading: false,
  error: null,
};

/**
 * projectReducer
 *
 * Handles:
 * - Fetching project list
 * - Adding new project
 * - Deleting project
 * - Error & loading state management
 *
 * @param state - Current project state
 * @param action - Action describing state update
 */
export function projectReducer(state: ProjectState, action: ProjectAction): ProjectState {
  switch (action.type) {
    // Start fetching projects
    case 'FETCH_START':
      return {
        ...state,
        loading: true,
        error: null,
      };

    // Fetch success → update project list
    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        projects: action.payload,
        error: null,
      };

    // Fetch failure → store error
    case 'FETCH_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // Add new project to top of list
    case 'ADD_PROJECT':
      return {
        ...state,
        projects: [action.payload, ...state.projects],
        error: null,
      };

    // Delete project by ID
    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter((p) => p._id !== action.payload),
        error: null,
      };

    default:
      return state;
  }
}
