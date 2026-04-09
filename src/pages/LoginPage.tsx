// pages/Login.tsx
import { useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

type State = {
  email: string;
  password: string;
  loading: boolean;
  error: string;
};

type Action =
  | { type: 'SET_FIELD'; field: string; value: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'RESET' };

const initialState: State = {
  email: '',
  password: '',
  loading: false,
  error: '',
};

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!state.email || !state.password) {
      dispatch({ type: 'SET_ERROR', payload: 'All fields required' });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: '' });

    setTimeout(() => {
      if (state.email === 'rishab@gmail.com' && state.password === '1234') {
        login('rishab@token');
        navigate('/projects');
      } else {
        dispatch({
          type: 'SET_ERROR',
          payload: 'Invalid credentials',
        });
      }

      dispatch({ type: 'SET_LOADING', payload: false });
    }, 3000);
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Login</h2>

        <input
          type="email"
          placeholder="Email"
          value={state.email}
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
          onChange={(e) =>
            dispatch({
              type: 'SET_FIELD',
              field: 'password',
              value: e.target.value,
            })
          }
        />

        {state.error && <p className="error">{state.error}</p>}

        <button disabled={state.loading}>
          {state.loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
