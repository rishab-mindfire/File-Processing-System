import { useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import styles from './Login.module.css';
import type { Errors } from '../../models/Types';
import { initialLoginState, loginReducer } from '../../reducers/loginReducer';
import { loginApi } from '../../services/loginService';

export default function Login() {
  const [formState, dispatch] = useReducer(loginReducer, initialLoginState);
  const { login } = useAuth();
  const navigate = useNavigate();

  // handle submit form
  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const newErrors: Errors = {};

    // Validation Logic
    if (!formState.email) {
      newErrors.email = 'Email is required';
    }
    if (!formState.password) {
      newErrors.password = 'Password is required';
    } else if (formState.password.length < 5) {
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
        email: formState.email,
        password: formState.password,
      });
      login(token);
      navigate('/projects');
    } catch (error: unknown) {
      dispatch({
        type: 'SET_ERRORS',
        payload: { general: `Login faile ${error}` },
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  return (
    <div className={styles.loginContainer}>
      <form onSubmit={handleSubmit} className={styles.loginForm} aria-labelledby="login-title">
        <h2 id="login-title" className={styles.title}>
          Login
        </h2>

        <div className={styles.inputGroup}>
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            placeholder="Email"
            value={formState.email}
            className={`${styles.input} ${formState.errors.email ? styles.inputError : ''}`}
            aria-invalid={!!formState.errors.email}
            aria-describedby={formState.errors.email ? 'email-error' : undefined}
            onChange={(e) =>
              dispatch({
                type: 'SET_FIELD',
                field: 'email',
                value: e.target.value,
              })
            }
          />
          {formState.errors.email && (
            <span className={styles.fieldError}>{formState.errors.email}</span>
          )}
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            placeholder="Password"
            value={formState.password}
            className={`${styles.input} ${formState.errors.password ? styles.inputError : ''}`}
            aria-invalid={!!formState.errors.password}
            aria-describedby={formState.errors.password ? 'password-error' : undefined}
            onChange={(e) =>
              dispatch({
                type: 'SET_FIELD',
                field: 'password',
                value: e.target.value,
              })
            }
          />
          {formState.errors.password && (
            <span className={styles.fieldError}>{formState.errors.password}</span>
          )}
        </div>

        {formState.errors.general && (
          <p className={styles.error} role="alert">
            {formState.errors.general}
          </p>
        )}

        <button disabled={formState.loading} className={styles.button}>
          {formState.loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
