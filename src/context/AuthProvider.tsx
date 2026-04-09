import type { ReactNode } from 'react';
import { useReducer } from 'react';
import { AuthContext, type AuthState } from './AuthContext';

type Action = { type: 'LOGIN'; payload: string } | { type: 'LOGOUT' };

const token = localStorage.getItem('token');

const initialState: AuthState = {
  token,
  isAuthenticated: !!token,
};

function reducer(state: AuthState, action: Action): AuthState {
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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

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
