import { useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { useAuth } from '../../hooks/useAuth';
import styles from './Login.module.css';
import type { Errors } from '../../models/Types';
import { initialLoginState, loginReducer } from '../../reducers/loginReducer';
import { loginApi } from '../../services/loginService';

export default function Login() {
  const [formState, dispatch] = useReducer(loginReducer, initialLoginState);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    const newErrors: Errors = {};

    // Validation
    if (!formState.userEmail) {
      newErrors.userEmail = 'Email is required';
    }

    if (!formState.userPassword) {
      newErrors.userPassword = 'Password is required';
    } else if (formState.userPassword.length < 5) {
      newErrors.userPassword = 'Password must be at least 5 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      dispatch({ type: 'SET_ERRORS', payload: newErrors });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const token = await loginApi({
        userEmail: formState.userEmail,
        userPassword: formState.userPassword,
      });

      login(token);
      navigate('/projects');
    } catch (error: unknown) {
      let message = 'Login failed';

      if (error instanceof AxiosError) {
        message = error.response?.data?.details || error.response?.data?.message || error.message;
      }
      dispatch({
        type: 'SET_ERRORS',
        payload: { general: message },
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  return (
    <div className={styles.loginContainer}>
      <form onSubmit={handleSubmit} className={styles.loginForm}>
        <h2 className={styles.title}>Login</h2>

        {/* EMAIL */}
        <div className={styles.inputGroup}>
          <label htmlFor="email">Email Address</label>

          <input
            id="email"
            type="email"
            placeholder="Email"
            value={formState.userEmail}
            className={`${styles.input} ${formState.errors.userEmail ? styles.inputError : ''}`}
            onChange={(e) =>
              dispatch({
                type: 'SET_FIELD',
                field: 'userEmail',
                value: e.target.value,
              })
            }
          />

          {formState.errors.userEmail && (
            <span className={styles.fieldError}>{formState.errors.userEmail}</span>
          )}
        </div>

        {/* PASSWORD */}
        <div className={styles.inputGroup}>
          <label htmlFor="password">Password</label>

          <input
            id="password"
            type="password"
            placeholder="Password"
            value={formState.userPassword}
            className={`${styles.input} ${formState.errors.userPassword ? styles.inputError : ''}`}
            onChange={(e) =>
              dispatch({
                type: 'SET_FIELD',
                field: 'userPassword',
                value: e.target.value,
              })
            }
          />

          {formState.errors.userPassword && (
            <span className={styles.fieldError}>{formState.errors.userPassword}</span>
          )}
        </div>

        {/* GENERAL ERROR */}
        {formState.errors.general && (
          <p className={styles.error} role="alert">
            {formState.errors.general}
          </p>
        )}

        {/* BUTTON */}
        <button disabled={formState.loading} className={styles.button}>
          {formState.loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
