export * from './db/types';

export interface AuthState {
  user: import('./db/types').User | null;
  token: string | null;
  isLoading: boolean;
}
