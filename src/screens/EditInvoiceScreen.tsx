import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Alert,
  TextInput as RNTextInput,
} from 'react-native';
import { 
  Card, 
  Button, 
  TextInput as PaperInput, 
  Menu, 
  Chip,
  Divider,
  ActivityIndicator,
} from 'react-native-paper';
import { useNavigation, useRoute, NavigationProp, RouteProp } from '@react-navigation/native';
import { invoiceAPI } from '../services/api';
import { Invoice, Client, InvoiceItem } from '../types';

type RootStackParamList = {
  EditInvoice: { invoiceId: number };
  InvoiceDetails: { invoiceId: number };
};

const getCurrencySymbol = (currency: string) => {
  const symbols: { [key: string]: string } = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'NGN': '₦',
    'GHS': 'GH₵',
    'KES': 'KSh',
    'ZAR': 'R',
    'AED': 'AED',
    'SAR': 'ر.س',
  };
  
  const normalizedCurrency = currency ? currency.toUpperCase().trim() : 'USD';
  return symbols[normalizedCurrency] || '$';
};

export default function EditInvoiceScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  const route = useRoute<RouteProp<RootStackParamList, 'EditInvoice'>>();
  const { invoiceId } = route.params;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInvoiceAndClients();
  }, [invoiceId]);

  const fetchInvoiceAndClients = async () => {
    try {
      setLoading(true);
      const [invoiceRes, clientsRes] = await Promise.all([
        invoiceAPI.getInvoice(invoiceId),
        invoiceAPI.getClients()
      ]);
      
      const invoiceData = invoiceRes.data.data || invoiceRes.data;
      
      setInvoice({
        ...invoiceData,
        items: invoiceData.items || invoiceData.items_json || [],
      });
      setClients(clientsRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('Failed to load invoice data.');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    if (!invoice) return { subtotal: 0, taxAmount: 0, total: 0 };

    const subtotal = invoice.items.reduce(
      (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.rate) || 0),
      0
    );

    const taxAmount = invoice.tax_amount || 0;
    const total = subtotal + taxAmount;

    return { subtotal, taxAmount, total };
  };

  const totals = calculateTotals();
  const currency = invoice?.currency || 'USD';

  const formatCurrency = (amount: number) => {
    const symbol = getCurrencySymbol(currency);
    return `${symbol}${(amount || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const handleChange = (field: string, value: any) => {
    if (!invoice) return;
    setInvoice({ ...invoice, [field]: value });
  };

  const handleItemChange = (idx: number, field: keyof InvoiceItem, value: any) => {
    if (!invoice) return;
    
    const newItems: InvoiceItem[] = [...invoice.items];
    
    if (field === 'quantity' || field === 'rate') {
      // For numeric fields, convert to number
      newItems[idx] = {
        ...newItems[idx],
        [field]: Number(value) || 0
      };
    } else {
      // For string fields, assign directly
      newItems[idx] = {
        ...newItems[idx],
        [field]: value
      };
    }
    
    setInvoice({ ...invoice, items: newItems });
  };

  const addItem = () => {
    if (!invoice) return;
    setInvoice({ 
      ...invoice, 
      items: [...invoice.items, { description: '', quantity: 1, rate: 0, unit_price: 0, tax_rate: 0, tax_amount: 0, total: 0 }]
    });
  };

  const removeItem = (idx: number) => {
    if (!invoice || invoice.items.length <= 1) return;
    const newItems = invoice.items.filter((_, i) => i !== idx);
    setInvoice({ ...invoice, items: newItems });
  };

  const validateInvoice = () => {
    if (!invoice) return false;
    if (!invoice.client_id) {
      setError('Please select a client');
      return false;
    }
    if (invoice.items.some(item => !item.description || item.quantity <= 0 || (item.rate ?? 0) < 0)) {
      setError('Please fill all item fields with valid values');
      return false;
    }
    if (totals.total <= 0) {
      setError('Invoice total must be greater than 0');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!invoice || !validateInvoice()) return;

    try {
      setSaving(true);
      await invoiceAPI.updateInvoice(invoiceId, {
        ...invoice,
        total: totals.total,
        subtotal: totals.subtotal,
        tax_amount: totals.taxAmount,
      });
      Alert.alert('Success', 'Invoice updated successfully!');
      navigation.navigate('InvoiceDetails', { invoiceId });
    } catch (error) {
      console.error('Failed to update invoice:', error);
      setError('Failed to update invoice. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2dc4b6" />
        <Text style={styles.loadingText}>Loading invoice...</Text>
      </View>
    );
  }

  if (!invoice) {
    return (
      <View style={styles.container}>
        <Card style={styles.errorCard}>
          <Card.Content>
            <Text style={styles.errorText}>Invoice not found.</Text>
            <Button mode="contained" onPress={() => navigation.navigate('Invoices')}>
              Back to Invoices
            </Button>
          </Card.Content>
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>

          <Text style={styles.subtitle}>
            Editing: {invoice.invoice_no} • Currency: {getCurrencySymbol(currency)}
          </Text>
        </View>

        {error ? (
          <Card style={styles.errorCard}>
            <Card.Content>
              <Text style={styles.errorText}>{error}</Text>
            </Card.Content>
          </Card>
        ) : null}

        {/* Client Selection */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Client Information</Text>
            <PaperInput
              label="Select Client *"
              value={clients.find(c => c.id === invoice.client_id)?.name || ''}
              mode="outlined"
              render={props => (
                <RNTextInput
                  {...props}
                  onFocus={() => {
                    // You can implement a client selection modal here
                    Alert.alert('Info', 'Client selection will be implemented');
                  }}
                />
              )}
            />
          </Card.Content>
        </Card>

        {/* Invoice Details */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Invoice Details</Text>
            <PaperInput
              label="Invoice Number"
              value={invoice.invoice_no}
              onChangeText={(value) => handleChange('invoice_no', value)}
              mode="outlined"
              style={styles.input}
            />
            
            <View style={styles.row}>
              <PaperInput
                label="Issue Date"
                value={invoice.issue_date}
                onChangeText={(value) => handleChange('issue_date', value)}
                mode="outlined"
                style={[styles.input, styles.halfInput]}
                placeholder="YYYY-MM-DD"
              />
              <PaperInput
                label="Due Date"
                value={invoice.due_date}
                onChangeText={(value) => handleChange('due_date', value)}
                mode="outlined"
                style={[styles.input, styles.halfInput]}
                placeholder="YYYY-MM-DD"
              />
            </View>

            <PaperInput
              label="Status"
              value={invoice.status}
              onChangeText={(value) => handleChange('status', value)}
              mode="outlined"
              style={styles.input}
            />
          </Card.Content>
        </Card>

        {/* Invoice Items */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.itemsHeader}>
              <Text style={styles.cardTitle}>Invoice Items</Text>
              <Button mode="outlined" onPress={addItem} compact>
                + Add Item
              </Button>
            </View>

            {invoice.items.map((item, idx) => (
              <View key={idx} style={styles.itemRow}>
                <PaperInput
                  label="Description"
                  value={item.description}
                  onChangeText={(value) => handleItemChange(idx, 'description', value)}
                  mode="outlined"
                  style={styles.itemInput}
                />
                
                <View style={styles.itemDetails}>
                  <PaperInput
                    label="Qty"
                    value={item.quantity.toString()}
                    onChangeText={(value) => handleItemChange(idx, 'quantity', value)}
                    mode="outlined"
                    keyboardType="numeric"
                    style={[styles.itemInput, styles.smallInput]}
                  />
                  <PaperInput
                    label="Rate"
                    value={(item.rate ?? 0).toString()}
                    onChangeText={(value) => handleItemChange(idx, 'rate', value)}
                    mode="outlined"
                    keyboardType="numeric"
                    style={[styles.itemInput, styles.smallInput]}
                  />
                  <View style={styles.amountContainer}>
                    <Text style={styles.amountText}>
                      {formatCurrency(item.quantity * (item.rate ?? 0))}
                    </Text>
                  </View>
                  {invoice.items.length > 1 && (
                    <Button
                      mode="outlined"
                      onPress={() => removeItem(idx)}
                      style={styles.removeButton}
                      compact
                    >
                      ×
                    </Button>
                  )}
                </View>
                <Divider style={styles.divider} />
              </View>
            ))}

            {/* Totals */}
            <View style={styles.totalsContainer}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal:</Text>
                <Text style={styles.totalValue}>{formatCurrency(totals.subtotal)}</Text>
              </View>
              {totals.taxAmount > 0 && (
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Tax:</Text>
                  <Text style={styles.totalValue}>{formatCurrency(totals.taxAmount)}</Text>
                </View>
              )}
              <View style={[styles.totalRow, styles.grandTotal]}>
                <Text style={styles.grandTotalLabel}>Total:</Text>
                <Text style={styles.grandTotalValue}>{formatCurrency(totals.total)}</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Notes & Terms */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Notes & Terms</Text>
            <PaperInput
              label="Notes to Client"
              value={invoice.notes || ''}
              onChangeText={(value) => handleChange('notes', value)}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
            />
            <PaperInput
              label="Payment Terms"
              value={invoice.terms || ''}
              onChangeText={(value) => handleChange('terms', value)}
              mode="outlined"
              multiline
              numberOfLines={2}
              style={styles.input}
            />
          </Card.Content>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.actionButton}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={saving}
            disabled={saving}
            style={styles.actionButton}
          >
            {saving ? 'Saving...' : 'Update Invoice'}
          </Button>
        </View>
      </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
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
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  errorCard: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
    marginBottom: 16,
  },
  errorText: {
    color: '#721c24',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  input: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  itemRow: {
    marginBottom: 16,
  },
  itemInput: {
    marginBottom: 8,
  },
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  smallInput: {
    flex: 1,
  },
  amountContainer: {
    flex: 1,
    alignItems: 'flex-end',
    paddingHorizontal: 8,
  },
  amountText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  removeButton: {
    minWidth: 40,
  },
  divider: {
    marginTop: 8,
  },
  totalsContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 12,
    color: '#666',
  },
  totalValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  grandTotal: {
    borderTopWidth: 1,
    borderTopColor: '#dee2e6',
    paddingTop: 8,
    marginTop: 8,
  },
  grandTotalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2dc4b6',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    borderRadius:10
  },
});