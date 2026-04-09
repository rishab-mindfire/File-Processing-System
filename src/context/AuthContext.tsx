import { createContext } from 'react';

export type AuthState = {
  token: string | null;
  isAuthenticated: boolean;
};

export type AuthContextType = {
  state: AuthState;
  login: (token: string) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);
