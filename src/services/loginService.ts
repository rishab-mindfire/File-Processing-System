import type { LoginState } from '../models/Types';

export const loginApi = async (
  credentials: Pick<LoginState, 'email' | 'password'>,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (
        credentials.email === 'user@gmail.com' &&
        credentials.password === '12345'
      ) {
        resolve('file-processing-system@jwttoken');
      } else {
        reject(new Error('Invalid credentials'));
      }
    }, 1000);
  });
};
