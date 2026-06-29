import React from 'react';
import {
  View, Text, TextInput, StyleSheet,
  TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { QuickCreateState, DocType } from './QuickCreateScreen';
import { CURRENCIES } from '../../utils/currency';

interface Props {
  state:   QuickCreateState;
  update:  (p: Partial<QuickCreateState>) => void;
  onNext:  () => void;
}

const DOC_TYPES: { type: DocType; label: string; icon: string; desc: string }[] = [
  { type: 'invoice', label: 'Invoice',  icon: '📄', desc: 'Bill your client' },
  { type: 'receipt', label: 'Receipt',  icon: '🧾', desc: 'Confirm a payment' },
  { type: 'quote',   label: 'Quote',    icon: '💬', desc: 'Send an estimate' },
];

export default function StepOne({ state, update, onNext }: Props) {
  const canProceed = state.currency.length === 3;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Document type */}
        <Text style={styles.sectionLabel}>Document Type</Text>
        <View style={styles.typeRow}>
          {DOC_TYPES.map(({ type, label, icon, desc }) => (
            <TouchableOpacity
              key={type}
              style={[styles.typeCard, state.docType === type && styles.typeCardActive]}
              onPress={() => update({ docType: type })}
            >
              <Text style={styles.typeIcon}>{icon}</Text>
              <Text style={[styles.typeLabel, state.docType === type && styles.typeLabelActive]}>
                {label}
              </Text>
              <Text style={styles.typeDesc}>{desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Currency */}
        <Text style={styles.sectionLabel}>Currency</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.currencyRow}
        >
          {CURRENCIES.map(c => (
            <TouchableOpacity
              key={c.code}
              style={[styles.currencyChip, state.currency === c.code && styles.currencyChipActive]}
              onPress={() => update({ currency: c.code })}
            >
              <Text style={[
                styles.currencyText,
                state.currency === c.code && styles.currencyTextActive,
              ]}>
                {c.symbol} {c.code}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Recipient (optional) */}
        <Text style={styles.sectionLabel}>
          Recipient <Text style={styles.optional}>(optional)</Text>
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Client or company name"
          placeholderTextColor="#aaa"
          value={state.clientName}
          onChangeText={v => update({ clientName: v })}
          autoCapitalize="words"
        />

        <TextInput
          style={styles.input}
          placeholder="Email address"
          placeholderTextColor="#aaa"
          value={state.clientEmail}
          onChangeText={v => update({ clientEmail: v })}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Due date for invoices */}
        {state.docType === 'invoice' && (
          <>
            <Text style={styles.sectionLabel}>
              Due Date <Text style={styles.optional}>(optional)</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#aaa"
              value={state.dueDate}
              onChangeText={v => update({ dueDate: v })}
            />
          </>
        )}

        {/* Notes */}
        <Text style={styles.sectionLabel}>
          Notes <Text style={styles.optional}>(optional)</Text>
        </Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Payment terms, instructions..."
          placeholderTextColor="#aaa"
          value={state.notes}
          onChangeText={v => update({ notes: v })}
          multiline
          numberOfLines={3}
        />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextBtn, !canProceed && styles.nextBtnDisabled]}
          onPress={onNext}
          disabled={!canProceed}
        >
          <Text style={styles.nextBtnText}>Add Items →</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll:  { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },

  sectionLabel: {
    fontSize: 13, fontWeight: '600',
    color: '#555', marginBottom: 8, marginTop: 20,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  optional: { fontWeight: '400', color: '#aaa', textTransform: 'none' },

  typeRow: { flexDirection: 'row', gap: 10 },
  typeCard: {
    flex: 1, padding: 12,
    borderRadius: 10, borderWidth: 1.5,
    borderColor: '#e5e7eb', backgroundColor: '#fafafa',
    alignItems: 'center',
  },
  typeCardActive: {
    borderColor: '#2563EB', backgroundColor: '#eff6ff',
  },
  typeIcon:  { fontSize: 22, marginBottom: 4 },
  typeLabel: { fontSize: 13, fontWeight: '600', color: '#444' },
  typeLabelActive: { color: '#2563EB' },
  typeDesc:  { fontSize: 10, color: '#999', marginTop: 2, textAlign: 'center' },

  currencyRow: { marginBottom: 4 },
  currencyChip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1.5,
    borderColor: '#e5e7eb', marginRight: 8,
    backgroundColor: '#fafafa',
  },
  currencyChipActive: { borderColor: '#2563EB', backgroundColor: '#eff6ff' },
  currencyText:       { fontSize: 13, color: '#555', fontWeight: '500' },
  currencyTextActive: { color: '#2563EB', fontWeight: '700' },

  input: {
    borderWidth: 1, borderColor: '#e5e7eb',
    borderRadius: 10, paddingHorizontal: 14,
    paddingVertical: 12, fontSize: 15,
    color: '#111', backgroundColor: '#fafafa',
    marginBottom: 10,
  },
  textArea: { height: 80, textAlignVertical: 'top' },

  footer: {
    padding: 16, borderTopWidth: 1,
    borderTopColor: '#f0f0f0', backgroundColor: '#fff',
  },
  nextBtn: {
    backgroundColor: '#2563EB', borderRadius: 12,
    paddingVertical: 15, alignItems: 'center',
  },
  nextBtnDisabled: { backgroundColor: '#93c5fd' },
  nextBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});