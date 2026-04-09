import { useReducer } from 'react';
import type { ReactNode } from 'react';
import { AuthContext, type AuthState } from './AuthContext';

type Action = { type: 'LOGIN'; payload: string } | { type: 'LOGOUT' };

const initialState: AuthState = {
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
};

//reducer for authentication
function authReducer(state: AuthState, action: Action): AuthState {
  switch (action.type) {
    case 'LOGIN':
      return {
        token: action.payload,
        isAuthenticated: true,
      };
    case 'LOGOUT':
      return {
        token: null,
        isAuthenticated: false,
      };
    default:
      return state;
  }
}

// context provider wrapper of reducer state
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = (token: string) => {
    localStorage.setItem('token', token);
    dispatch({ type: 'LOGIN', payload: token });
  };

  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
