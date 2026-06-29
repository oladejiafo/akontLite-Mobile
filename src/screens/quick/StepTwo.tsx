import React, { useRef } from 'react';
import {
  View, Text, TextInput, StyleSheet,
  TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { QuickCreateState } from './QuickCreateScreen';
import { InvoiceItem } from '../../types';
import { calcTotals, calcItemTotal } from '../../utils/invoice';
import { formatCurrency } from '../../utils/currency';

interface Props {
  state:  QuickCreateState;
  update: (p: Partial<QuickCreateState>) => void;
  onNext: () => void;
  onBack: () => void;
}

const EMPTY_ITEM = (): Partial<InvoiceItem> => ({
  description: '', quantity: 1, unit_price: 0, tax_rate: 0,
});

export default function StepTwo({ state, update, onNext, onBack }: Props) {
  const scrollRef = useRef<ScrollView>(null);

  const updateItem = (index: number, field: keyof InvoiceItem, value: string) => {
    const items = [...state.items];
    const item  = { ...items[index] };

    if (field === 'description') {
      (item as any)[field] = value;
    } else {
      (item as any)[field] = parseFloat(value) || 0;
    }

    items[index] = item;
    update({ items });
  };

  const addItem = () => {
    update({ items: [...state.items, EMPTY_ITEM()] });
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const removeItem = (index: number) => {
    if (state.items.length === 1) {
      Alert.alert('Cannot remove', 'You need at least one item.');
      return;
    }
    update({ items: state.items.filter((_, i) => i !== index) });
  };

  const duplicateItem = (index: number) => {
    const items = [...state.items];
    items.splice(index + 1, 0, { ...items[index] });
    update({ items });
  };

  const totals   = calcTotals(state.items, state.discount);
  const canProceed = state.items.every(
    i => i.description && i.description.trim().length > 0
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {state.items.map((item, index) => (
          <View key={index} style={styles.itemCard}>
            {/* Item header */}
            <View style={styles.itemHeader}>
              <Text style={styles.itemNumber}>Item {index + 1}</Text>
              <View style={styles.itemActions}>
                <TouchableOpacity
                  onPress={() => duplicateItem(index)}
                  style={styles.itemActionBtn}
                >
                  <Text style={styles.itemActionText}>⧉</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => removeItem(index)}
                  style={styles.itemActionBtn}
                >
                  <Text style={[styles.itemActionText, { color: '#ef4444' }]}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Description */}
            <TextInput
              style={styles.descInput}
              placeholder="Item description"
              placeholderTextColor="#aaa"
              value={item.description}
              onChangeText={v => updateItem(index, 'description', v)}
            />

            {/* Qty / Price / Tax row */}
            <View style={styles.numRow}>
              <View style={styles.numField}>
                <Text style={styles.numLabel}>Qty</Text>
                <TextInput
                  style={styles.numInput}
                  value={String(item.quantity ?? 1)}
                  onChangeText={v => updateItem(index, 'quantity', v)}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={[styles.numField, { flex: 2 }]}>
                <Text style={styles.numLabel}>
                  Unit Price ({state.currency})
                </Text>
                <TextInput
                  style={styles.numInput}
                  value={String(item.unit_price ?? 0)}
                  onChangeText={v => updateItem(index, 'unit_price', v)}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.numField}>
                <Text style={styles.numLabel}>Tax %</Text>
                <TextInput
                  style={styles.numInput}
                  value={String(item.tax_rate ?? 0)}
                  onChangeText={v => updateItem(index, 'tax_rate', v)}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            {/* Line total */}
            <View style={styles.lineTotalRow}>
              <Text style={styles.lineTotalLabel}>Line total</Text>
              <Text style={styles.lineTotalValue}>
                {formatCurrency(calcItemTotal(item), state.currency)}
              </Text>
            </View>
          </View>
        ))}

        {/* Add item button */}
        <TouchableOpacity style={styles.addItemBtn} onPress={addItem}>
          <Text style={styles.addItemText}>+ Add Item</Text>
        </TouchableOpacity>

        {/* Discount */}
        <View style={styles.discountRow}>
          <Text style={styles.discountLabel}>Discount</Text>
          <TextInput
            style={styles.discountInput}
            value={String(state.discount)}
            onChangeText={v => update({ discount: parseFloat(v) || 0 })}
            keyboardType="decimal-pad"
          />
        </View>

        {/* Totals summary */}
        <View style={styles.totalsCard}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(totals.subtotal, state.currency)}
            </Text>
          </View>
          {totals.taxAmount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(totals.taxAmount, state.currency)}
              </Text>
            </View>
          )}
          {totals.discount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Discount</Text>
              <Text style={[styles.totalValue, { color: '#16a34a' }]}>
                -{formatCurrency(totals.discount, state.currency)}
              </Text>
            </View>
          )}
          <View style={[styles.totalRow, styles.grandTotalRow]}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>
              {formatCurrency(totals.total, state.currency)}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.nextBtn, !canProceed && styles.nextBtnDisabled]}
          onPress={onNext}
          disabled={!canProceed}
        >
          <Text style={styles.nextBtnText}>Preview →</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll:  { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },

  itemCard: {
    backgroundColor: '#fafafa', borderRadius: 12,
    borderWidth: 1, borderColor: '#e5e7eb',
    padding: 14, marginBottom: 12,
  },
  itemHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 10,
  },
  itemNumber:    { fontSize: 12, fontWeight: '600', color: '#888' },
  itemActions:   { flexDirection: 'row', gap: 8 },
  itemActionBtn: { padding: 4 },
  itemActionText: { fontSize: 16, color: '#888' },

  descInput: {
    borderWidth: 1, borderColor: '#e5e7eb',
    borderRadius: 8, paddingHorizontal: 12,
    paddingVertical: 10, fontSize: 15,
    color: '#111', backgroundColor: '#fff',
    marginBottom: 10,
  },

  numRow:   { flexDirection: 'row', gap: 8, marginBottom: 10 },
  numField: { flex: 1 },
  numLabel: { fontSize: 11, color: '#888', marginBottom: 4, fontWeight: '500' },
  numInput: {
    borderWidth: 1, borderColor: '#e5e7eb',
    borderRadius: 8, paddingHorizontal: 10,
    paddingVertical: 9, fontSize: 14,
    color: '#111', backgroundColor: '#fff',
    textAlign: 'center',
  },

  lineTotalRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingTop: 6,
    borderTopWidth: 1, borderTopColor: '#f0f0f0',
  },
  lineTotalLabel: { fontSize: 12, color: '#888' },
  lineTotalValue: { fontSize: 14, fontWeight: '700', color: '#2563EB' },

  addItemBtn: {
    borderWidth: 1.5, borderColor: '#2563EB',
    borderStyle: 'dashed', borderRadius: 10,
    paddingVertical: 14, alignItems: 'center',
    marginBottom: 16,
  },
  addItemText: { color: '#2563EB', fontWeight: '600', fontSize: 15 },

  discountRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  discountLabel: { fontSize: 14, color: '#555', fontWeight: '500' },
  discountInput: {
    borderWidth: 1, borderColor: '#e5e7eb',
    borderRadius: 8, paddingHorizontal: 12,
    paddingVertical: 8, width: 100,
    textAlign: 'right', fontSize: 14, color: '#111',
  },

  totalsCard: {
    backgroundColor: '#f8fafc', borderRadius: 12,
    padding: 16, borderWidth: 1, borderColor: '#e5e7eb',
  },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 5,
  },
  totalLabel: { fontSize: 14, color: '#666' },
  totalValue: { fontSize: 14, color: '#333', fontWeight: '500' },
  grandTotalRow: {
    marginTop: 8, paddingTop: 10,
    borderTopWidth: 1, borderTopColor: '#e5e7eb',
  },
  grandTotalLabel: { fontSize: 16, fontWeight: '700', color: '#111' },
  grandTotalValue: { fontSize: 18, fontWeight: '800', color: '#2563EB' },

  footer: {
    flexDirection: 'row', gap: 10,
    padding: 16, borderTopWidth: 1,
    borderTopColor: '#f0f0f0', backgroundColor: '#fff',
  },
  backBtn: {
    flex: 1, borderWidth: 1.5, borderColor: '#e5e7eb',
    borderRadius: 12, paddingVertical: 14, alignItems: 'center',
  },
  backBtnText: { color: '#555', fontSize: 15, fontWeight: '600' },
  nextBtn: {
    flex: 2, backgroundColor: '#2563EB',
    borderRadius: 12, paddingVertical: 14, alignItems: 'center',
  },
  nextBtnDisabled: { backgroundColor: '#93c5fd' },
  nextBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});