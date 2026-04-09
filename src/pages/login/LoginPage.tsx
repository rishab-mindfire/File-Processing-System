import { useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import styles from './Login.module.css';
import type { Errors, State } from '../../models/Types';

// Actions for login
type Action =
  | { type: 'SET_FIELD'; field: string; value: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERRORS'; payload: Errors }
  | { type: 'RESET' };

const initialState: State = {
  email: 'rishab@gmail.com',
  password: '12345',
  loading: false,
  errors: {},
};

// reducer function for login state control
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        [action.field]: action.value,
        errors: { ...state.errors, [action.field]: '' },
      };

    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERRORS':
      return { ...state, errors: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export default function Login() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { login } = useAuth();
  const navigate = useNavigate();

  // handle submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Errors = {};

    // 1. Validation Logic
    if (!state.email) {
      newErrors.email = 'Email is required';
    }
    if (!state.password) {
      newErrors.password = 'Password is required';
    } else if (state.password.length < 5) {
      newErrors.password = 'Password must be at least 5 characters';
    }

    // If there are errors, stop and display them
    if (Object.keys(newErrors).length > 0) {
      dispatch({ type: 'SET_ERRORS', payload: newErrors });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });

    // Mock API Call
    setTimeout(() => {
      //fack login
      if (state.email === 'rishab@gmail.com' && state.password === '12345') {
        login('file-processing-system@jwttoken');
        navigate('/projects');
      } else {
        dispatch({
          type: 'SET_ERRORS',
          payload: { general: 'Invalid credentials' },
        });
      }
      dispatch({ type: 'SET_LOADING', payload: false });
    }, 1000);
  };

  return (
    <div className={styles.loginContainer}>
      <form
        onSubmit={handleSubmit}
        className={styles.loginForm}
        aria-labelledby="login-title">
        <h2 id="login-title" className={styles.title}>
          Login
        </h2>

        <div className={styles.inputGroup}>
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            placeholder="Email"
            value={state.email}
            className={`${styles.input} ${state.errors.email ? styles.inputError : ''}`}
            aria-invalid={!!state.errors.email}
            aria-describedby={state.errors.email ? 'email-error' : undefined}
            onChange={(e) =>
              dispatch({
                type: 'SET_FIELD',
                field: 'email',
                value: e.target.value,
              })
            }
          />
          {state.errors.email && (
            <span className={styles.fieldError}>{state.errors.email}</span>
          )}
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            placeholder="Password"
            value={state.password}
            className={`${styles.input} ${state.errors.password ? styles.inputError : ''}`}
            aria-invalid={!!state.errors.password}
            aria-describedby={
              state.errors.password ? 'password-error' : undefined
            }
            onChange={(e) =>
              dispatch({
                type: 'SET_FIELD',
                field: 'password',
                value: e.target.value,
              })
            }
          />
          {state.errors.password && (
            <span className={styles.fieldError}>{state.errors.password}</span>
          )}
        </div>

        {state.errors.general && (
          <p className={styles.error} role="alert">
            {state.errors.general}
          </p>
        )}

        <button disabled={state.loading} className={styles.button}>
          {state.loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
