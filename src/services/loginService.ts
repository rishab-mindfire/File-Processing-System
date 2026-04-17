import type { LoginState } from '../models/Types';
import { api } from './apiInterceptor';

export const loginApi = async (
  credentials: Pick<LoginState, 'userEmail' | 'userPassword'>,
): Promise<string> => {
  const response = await api.post('/user/login', credentials);
  const authHeader = response.headers['authorization'];

  if (!authHeader) {
    throw new Error('Authorization header missing');
  }
  const token = authHeader.split(' ')[1];

  if (!token) {
    throw new Error('Token not found in header');
  }

  localStorage.setItem('File-System', token);

  return token;
};
