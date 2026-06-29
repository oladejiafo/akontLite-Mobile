import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { InvoiceItem } from '../../types';
import StepOne from './StepOne';
import StepTwo from './StepTwo';
import StepThree from './StepThree';

export type DocType = 'invoice' | 'receipt' | 'quote';

export interface QuickCreateState {
  docType:       DocType;
  clientName:    string;
  clientEmail:   string;
  currency:      string;
  items:         Partial<InvoiceItem>[];
  discount:      number;
  notes:         string;
  dueDate:       string;
}

const INITIAL_STATE: QuickCreateState = {
  docType:     'invoice',
  clientName:  '',
  clientEmail: '',
  currency:    'USD',
  items:       [{ description: '', quantity: 1, unit_price: 0, tax_rate: 0 }],
  discount:    0,
  notes:       '',
  dueDate:     '',
};

const STEPS = ['Details', 'Items', 'Preview'];

export default function QuickCreateScreen() {
  const navigation = useNavigation();
  const [step, setStep]   = useState(0);
  const [state, setState] = useState<QuickCreateState>(INITIAL_STATE);
  const [saving, setSaving] = useState(false);

  const update = useCallback((partial: Partial<QuickCreateState>) => {
    setState(prev => ({ ...prev, ...partial }));
  }, []);

  const next = () => setStep(s => Math.min(s + 1, 2));
  const back = () => {
    if (step === 0) navigation.goBack();
    else setStep(s => s - 1);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={back} style={styles.backBtn}>
          <Text style={styles.backText}>
            {step === 0 ? '✕' : '←'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          New {state.docType.charAt(0).toUpperCase() + state.docType.slice(1)}
        </Text>

        <View style={styles.headerRight} />
      </View>

      {/* Step indicator */}
      <View style={styles.stepRow}>
        {STEPS.map((label, i) => (
          <View key={i} style={styles.stepItem}>
            <View style={[
              styles.stepDot,
              i < step  && styles.stepDone,
              i === step && styles.stepActive,
            ]}>
              <Text style={[
                styles.stepDotText,
                (i <= step) && styles.stepDotTextActive,
              ]}>
                {i < step ? '✓' : i + 1}
              </Text>
            </View>
            <Text style={[
              styles.stepLabel,
              i === step && styles.stepLabelActive,
            ]}>
              {label}
            </Text>
            {i < STEPS.length - 1 && (
              <View style={[styles.stepLine, i < step && styles.stepLineDone]} />
            )}
          </View>
        ))}
      </View>

      {/* Step content */}
      {step === 0 && (
        <StepOne state={state} update={update} onNext={next} />
      )}
      {step === 1 && (
        <StepTwo state={state} update={update} onNext={next} onBack={back} />
      )}
      {step === 2 && (
        <StepThree state={state} saving={saving} setSaving={setSaving} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical:   12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backBtn: {
    width: 36, height: 36,
    alignItems: 'center', justifyContent: 'center',
  },
  backText:    { fontSize: 20, color: '#333' },
  headerTitle: { fontSize: 17, fontWeight: '600', color: '#111' },
  headerRight: { width: 36 },

  stepRow: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'center',
    paddingVertical:   16,
    paddingHorizontal: 24,
  },
  stepItem: {
    alignItems:  'center',
    flexDirection: 'row',
  },
  stepDot: {
    width: 28, height: 28,
    borderRadius:    14,
    backgroundColor: '#e8e8e8',
    alignItems:      'center',
    justifyContent:  'center',
  },
  stepActive: { backgroundColor: '#2563EB' },
  stepDone:   { backgroundColor: '#16a34a' },
  stepDotText: { fontSize: 12, fontWeight: '600', color: '#999' },
  stepDotTextActive: { color: '#fff' },
  stepLabel:       { fontSize: 11, color: '#999', marginLeft: 4 },
  stepLabelActive: { color: '#2563EB', fontWeight: '600' },
  stepLine: {
    width: 32, height: 2,
    backgroundColor: '#e8e8e8',
    marginHorizontal: 4,
  },
  stepLineDone: { backgroundColor: '#16a34a' },
});