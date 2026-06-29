import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { User, Company } from '../types';
import { authApi } from '../api/auth';
import { guestApi } from '../api/guest';

interface SessionState {
  // auth
  user:       User | null;
  authToken:  string | null;
  company:    Company | null;

  // guest
  guestToken: string | null;

  // status
  isLoading:      boolean;
  isAuthenticated: boolean;

  // actions
  initSession:    () => Promise<void>;
  login:          (email: string, password: string) => Promise<void>;
  register:       (name: string, email: string, password: string, confirm: string) => Promise<void>;
  logout:         () => Promise<void>;
  ensureGuest:    () => Promise<string>;
  setCompany:     (company: Company) => void;
  migrateGuest:   () => Promise<void>;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  user:            null,
  authToken:       null,
  company:         null,
  guestToken:      null,
  isLoading:       true,
  isAuthenticated: false,

  initSession: async () => {
    set({ isLoading: true });

    // ensure device ID exists
    let deviceId = await SecureStore.getItemAsync('device_id');
    if (!deviceId) {
    deviceId = Crypto.randomUUID();
    await SecureStore.setItemAsync('device_id', deviceId);
    }

    const authToken  = await SecureStore.getItemAsync('auth_token');
    const guestToken = await SecureStore.getItemAsync('guest_token');

    if (authToken) {
      try {
        const res  = await authApi.me();
        set({
          user:            res.data,
          authToken,
          isAuthenticated: true,
          isLoading:       false,
        });
        return;
      } catch {
        await SecureStore.deleteItemAsync('auth_token');
      }
    }

    set({ guestToken, isLoading: false });
  },

  login: async (email, password) => {
    const res = await authApi.login(email, password);
    const { token, user } = res.data;

    await SecureStore.setItemAsync('auth_token', token);
    set({ authToken: token, user, isAuthenticated: true });

    // migrate guest data after login
    await get().migrateGuest();
  },

  register: async (name, email, password, confirm) => {
    const res = await authApi.register(name, email, password, confirm);
    const { token, user } = res.data;

    await SecureStore.setItemAsync('auth_token', token);
    set({ authToken: token, user, isAuthenticated: true });

    await get().migrateGuest();
  },

  logout: async () => {
    try { await authApi.logout(); } catch {}
    await SecureStore.deleteItemAsync('auth_token');
    set({ user: null, authToken: null, isAuthenticated: false, company: null });
  },

  ensureGuest: async () => {
    const existing = get().guestToken
      ?? await SecureStore.getItemAsync('guest_token');

    if (existing) {
      set({ guestToken: existing });
      return existing;
    }

    const res   = await guestApi.createSession();
    const token = res.data.token;

    await SecureStore.setItemAsync('guest_token', token);
    set({ guestToken: token });
    return token;
  },

  setCompany: (company) => set({ company }),

  migrateGuest: async () => {
    const guestToken = get().guestToken
      ?? await SecureStore.getItemAsync('guest_token');

    if (!guestToken) return;

    try {
      await authApi.migrateGuest(guestToken);
      await SecureStore.deleteItemAsync('guest_token');
      set({ guestToken: null });
    } catch (e) {
      // migration is best-effort, don't block login
    }
  },
}));