import type { LoginAction, LoginState } from '../models/Types';

export const initialLoginState: LoginState = {
  userEmail: 'user@gmail.com',
  userPassword: '12345',
  loading: false,
  errors: {},
};

export function loginReducer(state: LoginState, action: LoginAction): LoginState {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        [action.field]: action.value,
        errors: { ...state.errors, [action.field]: '' },
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERRORS':
      return { ...state, errors: action.payload };
    case 'RESET':
      return initialLoginState;
    default:
      return state;
  }
}
