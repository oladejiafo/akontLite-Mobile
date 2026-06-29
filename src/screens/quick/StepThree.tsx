import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert, Share,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { QuickCreateState } from './QuickCreateScreen';
import { invoiceApi } from '../../api/invoices';
import { receiptApi } from '../../api/receipts';
import { useSessionStore } from '../../store/sessionStore';
import { calcTotals } from '../../utils/invoice';
import { formatCurrency, formatDate } from '../../utils/currency';
import { Invoice, Receipt } from '../../types';

interface Props {
  state:      QuickCreateState;
  saving:     boolean;
  setSaving:  (v: boolean) => void;
}

export default function StepThree({ state, saving, setSaving }: Props) {
  const navigation   = useNavigation();
  const ensureGuest  = useSessionStore(s => s.ensureGuest);
  const isAuth       = useSessionStore(s => s.isAuthenticated);
  const totals       = calcTotals(state.items, state.discount);
  const [saved, setSaved]     = useState<Invoice | Receipt | null>(null);
  const [error, setError]     = useState<string | null>(null);

    const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
        if (!isAuth) await ensureGuest();

        const payload = {
        client_name: state.clientName || undefined,
        client_email: state.clientEmail || undefined,
        currency: state.currency,
        notes: state.notes || undefined,
        due_date: state.dueDate || undefined,
        discount_amount: state.discount,
        items: state.items.map((i, index) => ({
            description: i.description ?? '',
            quantity: i.quantity ?? 1,
            unit_price: i.unit_price ?? 0,
            tax_rate: i.tax_rate ?? 0,
            tax_amount: ((i.unit_price ?? 0) * (i.quantity ?? 1) * (i.tax_rate ?? 0)) / 100,
            total: (i.unit_price ?? 0) * (i.quantity ?? 1),
            sort_order: index,
        })),
        };

        let result;

        if (state.docType === 'receipt') {
        const res = await receiptApi.create({
            ...payload,
            type: 'outgoing',
            vendor_name: state.clientName,
            customer_name: state.clientName,
            receipt_date: new Date().toISOString().split('T')[0],
            total_amount: totals.total,
            subtotal: totals.subtotal,
            tax_amount: totals.taxAmount,
        });
        result = res.data.data;
        } else {
        const res = await invoiceApi.create(payload);
        result = res.data.data;
        }

        setSaved(result);
    } catch (e: any) {
        setError(e?.response?.data?.message ?? 'Something went wrong. Try again.');
    } finally {
        setSaving(false);
    }
    };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${state.docType.toUpperCase()}\n\n` +
          `From: AkɔntLite\n` +
          (state.clientName ? `To: ${state.clientName}\n` : '') +
          `\nItems:\n` +
          state.items.map(i =>
            `• ${i.description} x${i.quantity} @ ${formatCurrency(i.unit_price ?? 0, state.currency)}`
          ).join('\n') +
          `\n\nTotal: ${formatCurrency(totals.total, state.currency)}`,
      });
    } catch {}
  };

  const handleNew = () => {
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>

      {/* Document preview card */}
      <View style={styles.previewCard}>

        {/* Doc type badge */}
        <View style={styles.docBadge}>
          <Text style={styles.docBadgeText}>
            {state.docType.toUpperCase()}
          </Text>
        </View>

        {/* Header info */}
        <View style={styles.previewHeader}>
          <View>
            <Text style={styles.previewCompany}>AkɔntLite</Text>
            {state.clientName ? (
              <Text style={styles.previewClient}>To: {state.clientName}</Text>
            ) : null}
            {state.clientEmail ? (
              <Text style={styles.previewEmail}>{state.clientEmail}</Text>
            ) : null}
          </View>
          <View style={styles.previewMeta}>
            <Text style={styles.previewDate}>
              {new Date().toLocaleDateString('en-GB', {
                day: '2-digit', month: 'short', year: 'numeric',
              })}
            </Text>
            {state.dueDate ? (
              <Text style={styles.previewDue}>Due: {formatDate(state.dueDate)}</Text>
            ) : null}
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Items */}
        <View style={styles.itemsSection}>
          <View style={styles.itemsHeader}>
            <Text style={[styles.itemsCol, { flex: 3 }]}>Description</Text>
            <Text style={[styles.itemsCol, { flex: 1, textAlign: 'center' }]}>Qty</Text>
            <Text style={[styles.itemsCol, { flex: 2, textAlign: 'right' }]}>Amount</Text>
          </View>

          {state.items.map((item, i) => (
            <View key={i} style={styles.itemRow}>
              <Text style={[styles.itemCell, { flex: 3 }]} numberOfLines={2}>
                {item.description}
              </Text>
              <Text style={[styles.itemCell, { flex: 1, textAlign: 'center' }]}>
                {item.quantity}
              </Text>
              <Text style={[styles.itemCell, { flex: 2, textAlign: 'right' }]}>
                {formatCurrency((item.unit_price ?? 0) * (item.quantity ?? 1), state.currency)}
              </Text>
            </View>
          ))}
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalLine}>
            <Text style={styles.totalLbl}>Subtotal</Text>
            <Text style={styles.totalVal}>
              {formatCurrency(totals.subtotal, state.currency)}
            </Text>
          </View>
          {totals.taxAmount > 0 && (
            <View style={styles.totalLine}>
              <Text style={styles.totalLbl}>Tax</Text>
              <Text style={styles.totalVal}>
                {formatCurrency(totals.taxAmount, state.currency)}
              </Text>
            </View>
          )}
          {totals.discount > 0 && (
            <View style={styles.totalLine}>
              <Text style={styles.totalLbl}>Discount</Text>
              <Text style={[styles.totalVal, { color: '#16a34a' }]}>
                -{formatCurrency(totals.discount, state.currency)}
              </Text>
            </View>
          )}
          <View style={[styles.totalLine, styles.grandLine]}>
            <Text style={styles.grandLbl}>TOTAL</Text>
            <Text style={styles.grandVal}>
              {formatCurrency(totals.total, state.currency)}
            </Text>
          </View>
        </View>

        {state.notes ? (
          <Text style={styles.notesText}>Notes: {state.notes}</Text>
        ) : null}
      </View>

      {/* Error */}
      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* Saved confirmation */}
      {saved ? (
        <View style={styles.savedBox}>
          <Text style={styles.savedText}>
            ✓ Saved successfully
          </Text>
        </View>
      ) : null}

      {/* Actions */}
      <View style={styles.actions}>
        {!saved ? (
          <TouchableOpacity
            style={[styles.actionBtn, styles.saveBtn, saving && styles.btnDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.actionBtnText}>
                💾 Save {state.docType}
              </Text>
            )}
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={[styles.actionBtn, styles.shareBtn]}
          onPress={handleShare}
        >
          <Text style={[styles.actionBtnText, { color: '#2563EB' }]}>
            ↑ Share
          </Text>
        </TouchableOpacity>

        {saved && (
          <TouchableOpacity
            style={[styles.actionBtn, styles.newBtn]}
            onPress={handleNew}
          >
            <Text style={styles.actionBtnText}>+ New Document</Text>
          </TouchableOpacity>
        )}
      </View>

      {!isAuth && (
        <Text style={styles.guestNote}>
          💡 Sign up to save records, add your logo, and generate reports.
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll:  { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16, paddingBottom: 40 },

  previewCard: {
    backgroundColor: '#fff', borderRadius: 16,
    padding: 20, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },

  docBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#eff6ff', borderRadius: 6,
    paddingHorizontal: 10, paddingVertical: 4,
    marginBottom: 12,
  },
  docBadgeText: { color: '#2563EB', fontSize: 11, fontWeight: '700', letterSpacing: 1 },

  previewHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 16,
  },
  previewCompany: { fontSize: 18, fontWeight: '800', color: '#111', marginBottom: 4 },
  previewClient:  { fontSize: 14, color: '#555' },
  previewEmail:   { fontSize: 12, color: '#888' },
  previewMeta:    { alignItems: 'flex-end' },
  previewDate:    { fontSize: 13, color: '#555', fontWeight: '500' },
  previewDue:     { fontSize: 12, color: '#ef4444', marginTop: 2 },

  divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 14 },

  itemsSection: {},
  itemsHeader:  {
    flexDirection: 'row', marginBottom: 8,
    paddingBottom: 6, borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemsCol: { fontSize: 11, fontWeight: '600', color: '#888', textTransform: 'uppercase' },
  itemRow:  { flexDirection: 'row', paddingVertical: 6 },
  itemCell: { fontSize: 13, color: '#333' },

  totalsSection: { gap: 6 },
  totalLine:  { flexDirection: 'row', justifyContent: 'space-between' },
  totalLbl:   { fontSize: 13, color: '#666' },
  totalVal:   { fontSize: 13, color: '#333', fontWeight: '500' },
  grandLine:  { marginTop: 8, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  grandLbl:   { fontSize: 16, fontWeight: '800', color: '#111' },
  grandVal:   { fontSize: 18, fontWeight: '800', color: '#2563EB' },

  notesText: { fontSize: 12, color: '#888', marginTop: 12, fontStyle: 'italic' },

  errorBox: {
    backgroundColor: '#fef2f2', borderRadius: 10,
    padding: 12, marginBottom: 12,
    borderWidth: 1, borderColor: '#fecaca',
  },
  errorText: { color: '#dc2626', fontSize: 13 },

  savedBox: {
    backgroundColor: '#f0fdf4', borderRadius: 10,
    padding: 12, marginBottom: 12,
    borderWidth: 1, borderColor: '#bbf7d0',
    alignItems: 'center',
  },
  savedText: { color: '#16a34a', fontSize: 14, fontWeight: '600' },

  actions: { gap: 10 },
  actionBtn: {
    borderRadius: 12, paddingVertical: 15,
    alignItems: 'center',
  },
  saveBtn:    { backgroundColor: '#2563EB' },
  shareBtn:   { backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#2563EB' },
  newBtn:     { backgroundColor: '#16a34a' },
  btnDisabled: { opacity: 0.6 },
  actionBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  guestNote: {
    textAlign: 'center', fontSize: 13,
    color: '#888', marginTop: 20, lineHeight: 20,
  },
});