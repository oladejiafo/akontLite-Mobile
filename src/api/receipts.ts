import client from './client';
import { Receipt } from '../types';

export const receiptApi = {
  list: (type?: 'incoming' | 'outgoing') =>
    client.get<{ data: { data: Receipt[] } }>('/receipts', {
      params: type ? { type } : {},
    }),

  get: (id: number) =>
    client.get<{ data: Receipt }>(`/receipts/${id}`),

  create: (payload: Partial<Receipt>) =>
    client.post<{ success: boolean; data: Receipt; guest_token?: string }>(
      '/receipts', payload
    ),

  update: (id: number, payload: Partial<Receipt>) =>
    client.put<{ data: Receipt }>(`/receipts/${id}`, payload),

  remove: (id: number) =>
    client.delete(`/receipts/${id}`),
};