import React, { useState, useContext } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Alert,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Card, Button, TextInput as PaperInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import InvoicePreviewModal from '../components/InvoicePreviewModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
}

export default function CreateInvoiceScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const isGuest = !user;

  const [invoice, setInvoice] = useState({
    business_name: '',
    business_email: '',
    business_address: '',
    invoice_number: `INV-${Date.now()}`,
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    client_name: '',
    client_email: '',
    client_address: '',
    items: [{ description: '', quantity: 1, rate: 0 }] as InvoiceItem[],
    notes: '',
  });

  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChange = (field: string, value: string) => {
    setInvoice(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string) => {
    const newItems = [...invoice.items];
    if (field === 'quantity' || field === 'rate') {
      newItems[index][field] = Number(value) || 0;
    } else {
      newItems[index][field] = value;
    }
    setInvoice(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setInvoice(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, rate: 0 }]
    }));
  };

  const removeItem = (index: number) => {
    if (invoice.items.length > 1) {
      const newItems = invoice.items.filter((_, i) => i !== index);
      setInvoice(prev => ({ ...prev, items: newItems }));
    }
  };

  const calculateTotal = () => {
    return invoice.items.reduce(
      (sum, item) => sum + (item.quantity || 0) * (item.rate || 0),
      0
    );
  };

  const saveDraft = async () => {
    try {
      setSaving(true);
      // TODO: Implement API call to save draft
      // For now, we'll just show a success message
      Alert.alert('Success', 'Invoice saved as draft!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save invoice. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = async () => {
    // Basic validation
    if (!invoice.business_name || !invoice.client_name) {
      Alert.alert('Error', 'Please fill in required fields (Business Name and Client Name)');
      return;
    }

    if (invoice.items.some(item => !item.description || item.rate <= 0)) {
      Alert.alert('Error', 'Please fill all item fields with valid values');
      return;
    }

    await saveDraft();
    setShowPreview(true);
  };

  const total = calculateTotal();

  const saveGuestInvoice = async (invoiceData: any) => {
    try {
      const response = await api.post('/guest-invoices', invoiceData);
      const guestToken = response.data.guest_token;
      await AsyncStorage.setItem('guest_token', guestToken);
      return response.data;
    } catch (error) {
      console.error('Failed to save guest invoice:', error);
      throw error;
    }
  };
  
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.subtitle}>Generate professional invoices in minutes</Text>
        </View>

        {/* Guest Mode Alert */}
        {isGuest && (
          <Card style={styles.guestAlert}>
            <Card.Content>
              <Text style={styles.guestTitle}>You're in Guest Mode</Text>
              <Text style={styles.guestText}>
                Some features are restricted. Sign up to unlock full access including:
              </Text>
              <View style={styles.featureList}>
                <Text style={styles.featureItem}>• Save invoices permanently</Text>
                <Text style={styles.featureItem}>• Track payments & overdue</Text>
                <Text style={styles.featureItem}>• Manage multiple clients</Text>
                <Text style={styles.featureItem}>• Send invoices by email</Text>
                <Text style={styles.featureItem}>• Remove PDF watermarks</Text>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Business Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Business Information</Text>
            
            <PaperInput
              label="Business Name *"
              value={invoice.business_name}
              onChangeText={(value) => handleChange('business_name', value)}
              style={styles.input}
              mode="outlined"
            />
            
            <PaperInput
              label="Business Email"
              value={invoice.business_email}
              onChangeText={(value) => handleChange('business_email', value)}
              style={styles.input}
              mode="outlined"
              keyboardType="email-address"
            />
            
            <PaperInput
              label="Business Address"
              value={invoice.business_address}
              onChangeText={(value) => handleChange('business_address', value)}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={2}
            />
          </Card.Content>
        </Card>

        {/* Invoice Details */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Invoice Details</Text>
            
            <View style={styles.row}>
              <PaperInput
                label="Invoice Number"
                value={invoice.invoice_number}
                onChangeText={(value) => handleChange('invoice_number', value)}
                style={[styles.input, styles.halfInput]}
                mode="outlined"
                editable={false}
              />
              
              <PaperInput
                label="Invoice Date"
                value={invoice.invoice_date}
                onChangeText={(value) => handleChange('invoice_date', value)}
                style={[styles.input, styles.halfInput]}
                mode="outlined"
              />
            </View>
            
            <PaperInput
              label="Due Date"
              value={invoice.due_date}
              onChangeText={(value) => handleChange('due_date', value)}
              style={styles.input}
              mode="outlined"
            />
          </Card.Content>
        </Card>

        {/* Client Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Client Information</Text>
            
            <PaperInput
              label="Client Name *"
              value={invoice.client_name}
              onChangeText={(value) => handleChange('client_name', value)}
              style={styles.input}
              mode="outlined"
            />
            
            <PaperInput
              label="Client Email"
              value={invoice.client_email}
              onChangeText={(value) => handleChange('client_email', value)}
              style={styles.input}
              mode="outlined"
              keyboardType="email-address"
            />
            
            <PaperInput
              label="Client Address"
              value={invoice.client_address}
              onChangeText={(value) => handleChange('client_address', value)}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={2}
            />
          </Card.Content>
        </Card>

        {/* Invoice Items */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Invoice Items</Text>
              <Button mode="outlined" onPress={addItem} compact>
                + Add Item
              </Button>
            </View>

            {invoice.items.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <PaperInput
                  label="Description"
                  value={item.description}
                  onChangeText={(value) => handleItemChange(index, 'description', value)}
                  style={[styles.input, styles.itemDescription]}
                  mode="outlined"
                />
                
                <View style={styles.itemDetails}>
                  <PaperInput
                    label="Qty"
                    value={item.quantity.toString()}
                    onChangeText={(value) => handleItemChange(index, 'quantity', value)}
                    style={[styles.input, styles.itemQty]}
                    mode="outlined"
                    keyboardType="numeric"
                  />
                  
                  <PaperInput
                    label="Rate ($)"
                    value={item.rate.toString()}
                    onChangeText={(value) => handleItemChange(index, 'rate', value)}
                    style={[styles.input, styles.itemRate]}
                    mode="outlined"
                    keyboardType="numeric"
                  />
                  
                  {invoice.items.length > 1 && (
                    <Button
                      mode="outlined"
                      onPress={() => removeItem(index)}
                      style={styles.removeButton}
                      compact
                    >
                      ×
                    </Button>
                  )}
                </View>
                
                <Text style={styles.itemTotal}>
                  ${(item.quantity * item.rate).toFixed(2)}
                </Text>
              </View>
            ))}

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalAmount}>${total.toFixed(2)}</Text>
            </View>
          </Card.Content>
        </Card>

        {/* Notes */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Additional Notes</Text>
            <PaperInput
              label="Payment terms, additional info"
              value={invoice.notes}
              onChangeText={(value) => handleChange('notes', value)}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={3}
            />
          </Card.Content>
        </Card>

        {/* Preview Button */}
        <Button
          mode="contained"
          onPress={handlePreview}
          disabled={saving}
          style={styles.previewButton}
          loading={saving}
        >
          {saving ? 'Saving...' : 'Preview Invoice'}
        </Button>
      </ScrollView>

      {/* Preview Modal */}
      <InvoicePreviewModal
        invoice={invoice}
        onClose={() => setShowPreview(false)}
        onDownload={() => {
          // TODO: Implement PDF download
          Alert.alert('Download', 'PDF download functionality coming soon!');
        }}
        isGuest={isGuest}
        visible={showPreview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2dc4b6',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  guestAlert: {
    backgroundColor: 'rgba(45, 196, 182, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#2dc4b6',
    marginBottom: 16,
  },
  guestTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2dc4b6',
    marginBottom: 8,
  },
  guestText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  featureList: {
    marginLeft: 8,
  },
  featureItem: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2dc4b6',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
  },
  halfInput: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  itemRow: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemDescription: {
    marginBottom: 8,
  },
  itemDetails: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  itemQty: {
    flex: 1,
  },
  itemRate: {
    flex: 2,
  },
  removeButton: {
    minWidth: 40,
  },
  itemTotal: {
    textAlign: 'right',
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  totalAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2dc4b6',
  },
  previewButton: {
    marginTop: 8,
    marginBottom: 24,
    paddingVertical: 8,
    borderRadius:10
  },
});