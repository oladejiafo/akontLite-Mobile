import client from './client';
import { CreateInvoicePayload, Invoice } from '../types';

export const invoiceApi = {
  list: () =>
    client.get<{ data: { data: Invoice[] } }>('/invoices'),

  get: (id: number) =>
    client.get<{ data: Invoice }>(`/invoices/${id}`),

  create: (payload: CreateInvoicePayload) =>
    client.post<{ success: boolean; data: Invoice; guest_token?: string }>(
      '/invoices', payload
    ),

  update: (id: number, payload: Partial<Invoice>) =>
    client.put<{ data: Invoice }>(`/invoices/${id}`, payload),

  remove: (id: number) =>
    client.delete(`/invoices/${id}`),
};