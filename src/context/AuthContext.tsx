import { createContext } from 'react';
import type { AuthContextType } from '../models/Types';

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);
