import client from './client';
import { SummaryReport, VATReport } from '../types';

export const reportApi = {
  summary: () =>
    client.get<SummaryReport>('/reports/summary'),

  vat: (from: string, to: string) =>
    client.get<VATReport>('/reports/vat', { params: { from, to } }),
};