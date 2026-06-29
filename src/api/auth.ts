import client from './client';
import { User } from '../types';

export const authApi = {
  login: (email: string, password: string) =>
    client.post<{ token: string; user: User }>('/login', { email, password }),

  register: (name: string, email: string, password: string, passwordConfirm: string) =>
    client.post<{ token: string; user: User }>('/register', {
      name,
      email,
      password,
      password_confirmation: passwordConfirm,
    }),

  me: () =>
    client.get<User>('/user'),

  logout: () =>
    client.post('/logout'),

  migrateGuest: (guestToken: string) =>
    client.post('/guest/migrate', { guest_token: guestToken }),
};