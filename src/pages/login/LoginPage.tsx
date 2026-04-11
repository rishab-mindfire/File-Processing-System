import { useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import styles from './Login.module.css';
import type { Errors } from '../../models/Types';
import { initialLoginState, loginReducer } from '../../reducers/loginReducer';
import { loginApi } from '../../services/loginService';

export default function Login() {
  const [state, dispatch] = useReducer(loginReducer, initialLoginState);
  const { login } = useAuth();
  const navigate = useNavigate();

  // handle submit form
  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const newErrors: Errors = {};

    // Validation Logic
    if (!state.email) {
      newErrors.email = 'Email is required';
    }
    if (!state.password) {
      newErrors.password = 'Password is required';
    } else if (state.password.length < 5) {
      newErrors.password = 'Password must be at least 5 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      dispatch({ type: 'SET_ERRORS', payload: newErrors });
      return;
    }

    // API Call will be here for login
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const token = await loginApi({
        email: state.email,
        password: state.password,
      });
      login(token);
      navigate('/projects');
    } catch (error: unknown) {
      dispatch({
        type: 'SET_ERRORS',
        payload: { general: 'Login failed' },
      });
      console.log(error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
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
