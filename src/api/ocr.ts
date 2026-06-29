import client from './client';
import { OCRResult, Receipt } from '../types';

export const ocrApi = {
  extract: (imageUri: string, mimeType = 'image/jpeg') => {
    const form = new FormData();
    form.append('image', {
      uri: imageUri,
      name: 'receipt.jpg',
      type: mimeType,
    } as any);

    return client.post<{ success: boolean; data: OCRResult }>(
      '/ocr/extract', form,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  },

  scanAndSave: (imageUri: string, extras?: {
    currency?: string;
    category?: string;
    notes?: string;
  }) => {
    const form = new FormData();
    form.append('image', {
      uri: imageUri,
      name: 'receipt.jpg',
      type: 'image/jpeg',
    } as any);

    if (extras?.currency) form.append('currency', extras.currency);
    if (extras?.category) form.append('category', extras.category);
    if (extras?.notes)    form.append('notes', extras.notes);

    return client.post<{ success: boolean; data: Receipt; confidence: number }>(
      '/ocr/scan-and-save', form,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  },
};