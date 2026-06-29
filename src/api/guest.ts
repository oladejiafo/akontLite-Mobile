import client from './client';
import { GuestSession } from '../types';

export const guestApi = {
  createSession: () =>
    client.post<GuestSession>('/guest/session'),
};