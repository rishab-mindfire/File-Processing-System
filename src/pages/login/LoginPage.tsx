import { useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import styles from './Login.module.css';

type State = {
  email: string;
  password: string;
  loading: boolean;
  error: string;
};

// Actions for login
type Action =
  | { type: 'SET_FIELD'; field: string; value: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'RESET' };

const initialState: State = {
  email: 'rishab@gmail.com',
  password: '1234',
  loading: false,
  error: '',
};

// reducer function for login state control
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
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

    if (!state.email || !state.password) {
      dispatch({ type: 'SET_ERROR', payload: 'All fields required' });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: '' });

    // API call will be here
    setTimeout(() => {
      if (state.email === 'rishab@gmail.com' && state.password === '1234') {
        login('file-processing-system@jwttoken');
        navigate('/projects');
      } else {
        dispatch({
          type: 'SET_ERROR',
          payload: 'Invalid credentials',
        });
      }

      dispatch({ type: 'SET_LOADING', payload: false });
    }, 1000);
  };

  return (
    <div className={styles.loginContainer}>
      <form onSubmit={handleSubmit} className={styles.loginForm}>
        <h2 className={styles.title}>Login</h2>

        <input
          type="email"
          placeholder="Email"
          value={state.email}
          className={styles.input}
          onChange={(e) =>
            dispatch({
              type: 'SET_FIELD',
              field: 'email',
              value: e.target.value,
            })
          }
        />

        <input
          type="password"
          placeholder="Password"
          value={state.password}
          className={styles.input}
          onChange={(e) =>
            dispatch({
              type: 'SET_FIELD',
              field: 'password',
              value: e.target.value,
            })
          }
        />

        {state.error && <p className={styles.error}>{state.error}</p>}

        <button disabled={state.loading} className={styles.button}>
          {state.loading ? (
            <span className={styles.buttonContent}>
              <span className={styles.btnLoader}></span>
              Logging in...
            </span>
          ) : (
            'Login'
          )}
        </button>
      </form>
    </div>
  );
}
