import React from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Card, Button } from 'react-native-paper';
import { Invoice, Company, Client } from '../types';

interface InvoicePreviewModalProps {
  invoice: any;
  onClose: () => void;
  onSend?: (channel: string) => void;
  onDownload?: () => void;
  isGuest?: boolean;
  visible: boolean;
}

export default function InvoicePreviewModal({
  invoice,
  onClose,
  onSend,
  onDownload,
  isGuest = false,
  visible,
}: InvoicePreviewModalProps) {
  const getCurrencySymbol = (currency: string) => {
    const symbols: { [key: string]: string } = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      NGN: '₦',
      GHS: 'GH₵',
      KES: 'KSh',
      ZAR: 'R',
      AED: 'AED',
      SAR: 'ر.س',
    };
    return symbols[currency?.toUpperCase()] || '$';
  };

  const formatCurrency = (amount: number, currency: string) => {
    const symbol = getCurrencySymbol(currency);
    return `${symbol}${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const calculateTotals = () => {
    const items = invoice.items || [];
    const subtotal = items.reduce(
      (sum: number, item: any) => sum + (Number(item.quantity) || 0) * (Number(item.rate) || 0),
      0
    );

    // For mobile, we'll handle tax calculation similarly to web
    let taxAmount = 0;
    let total = subtotal;

    if (invoice.taxEnabled || invoice.tax_rate > 0) {
      const taxRate = invoice.taxRate || invoice.tax_rate || 0;
      const taxInclusive = invoice.taxInclusive || invoice.tax_inclusive || false;

      if (taxRate > 0) {
        if (taxInclusive) {
          taxAmount = subtotal - (subtotal / (1 + (taxRate / 100)));
          total = subtotal;
        } else {
          taxAmount = subtotal * (taxRate / 100);
          total = subtotal + taxAmount;
        }
      }
    }

    return {
      subtotal,
      taxAmount,
      total,
      taxRate: invoice.taxRate || invoice.tax_rate || 0,
      taxName: invoice.taxName || invoice.tax_name || 'Tax',
      taxInclusive: invoice.taxInclusive || invoice.tax_inclusive || false,
      taxEnabled: invoice.taxEnabled || invoice.tax_rate > 0,
    };
  };

  const totals = calculateTotals();
  const currency = invoice.currency || invoice.company?.currency || 'USD';

  const getDisplayValues = () => {
    if (isGuest) {
      return {
        businessName: invoice.business_name || "Your business name",
        businessEmail: invoice.business_email,
        businessAddress: invoice.business_address,
        clientName: invoice.client_name || "-",
        clientEmail: invoice.client_email,
        clientAddress: invoice.client_address,
        invoiceNumber: invoice.invoice_number,
        invoiceDate: invoice.invoice_date,
        dueDate: invoice.due_date,
        notes: invoice.notes,
        terms: invoice.terms,
      };
    } else {
      return {
        businessName: invoice.company?.name || "Your business name",
        businessEmail: invoice.company?.email,
        businessAddress: invoice.company?.address,
        clientName: invoice.client?.name || "-",
        clientEmail: invoice.client?.email,
        clientAddress: invoice.client?.address,
        invoiceNumber: invoice.invoice_no || invoice.invoice_number,
        invoiceDate: invoice.issue_date || invoice.invoice_date,
        dueDate: invoice.due_date,
        notes: invoice.notes,
        terms: invoice.terms,
      };
    }
  };

  const display = getDisplayValues();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Invoice Preview</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Business Info */}
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.businessHeader}>
                <View style={styles.businessInfo}>
                  <Text style={styles.businessName}>{display.businessName}</Text>
                  {display.businessEmail && (
                    <Text style={styles.businessDetail}>{display.businessEmail}</Text>
                  )}
                  {display.businessAddress && (
                    <Text style={styles.businessDetail}>{display.businessAddress}</Text>
                  )}
                  <Text style={styles.currencyInfo}>
                    Currency: {getCurrencySymbol(currency)} {currency}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Invoice & Client Details */}
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.detailsRow}>
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Bill To</Text>
                  <Text style={styles.clientName}>{display.clientName}</Text>
                  {display.clientEmail && (
                    <Text style={styles.clientDetail}>{display.clientEmail}</Text>
                  )}
                  {display.clientAddress && (
                    <Text style={styles.clientDetail}>{display.clientAddress}</Text>
                  )}
                </View>
                
                <View style={styles.detailSection}>
                  <Text style={styles.invoiceNumber}>#{display.invoiceNumber}</Text>
                  <Text style={styles.dateText}>Date: {display.invoiceDate}</Text>
                  <Text style={styles.dateText}>Due: {display.dueDate}</Text>
                  {totals.taxEnabled && (
                    <Text style={styles.taxInfo}>
                      {totals.taxName} {totals.taxRate}% ({totals.taxInclusive ? 'Inclusive' : 'Exclusive'})
                    </Text>
                  )}
                  {isGuest && (
                    <Text style={styles.guestInfo}>Generated in Guest Mode</Text>
                  )}
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Items Table */}
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Items</Text>
              
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <Text style={[styles.tableCell, styles.tableHeaderText, { flex: 3 }]}>Description</Text>
                <Text style={[styles.tableCell, styles.tableHeaderText, { flex: 1 }]}>Qty</Text>
                <Text style={[styles.tableCell, styles.tableHeaderText, { flex: 2 }]}>Rate</Text>
                <Text style={[styles.tableCell, styles.tableHeaderText, { flex: 2 }]}>Amount</Text>
              </View>

              {/* Table Rows */}
              {(invoice.items || []).map((item: any, index: number) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 3 }]} numberOfLines={2}>
                    {item.description || "-"}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>
                    {item.quantity}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 2, textAlign: 'right' }]}>
                    {formatCurrency(item.rate || 0, currency)}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 2, textAlign: 'right' }]}>
                    {formatCurrency((item.quantity || 0) * (item.rate || 0), currency)}
                  </Text>
                </View>
              ))}

              {/* Totals */}
              <View style={styles.totalsSection}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Subtotal:</Text>
                  <Text style={styles.totalValue}>
                    {formatCurrency(totals.subtotal, currency)}
                  </Text>
                </View>
                
                {totals.taxEnabled && totals.taxRate > 0 && (
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>
                      {totals.taxName} ({totals.taxRate}%):
                    </Text>
                    <Text style={styles.totalValue}>
                      {formatCurrency(totals.taxAmount, currency)}
                    </Text>
                  </View>
                )}
                
                <View style={[styles.totalRow, styles.grandTotal]}>
                  <Text style={styles.grandTotalLabel}>Total:</Text>
                  <Text style={styles.grandTotalValue}>
                    {formatCurrency(totals.total, currency)}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Notes & Terms */}
          {display.notes && (
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.sectionTitle}>Notes</Text>
                <Text style={styles.notesText}>{display.notes}</Text>
              </Card.Content>
            </Card>
          )}

          {display.terms && (
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.sectionTitle}>Payment Terms</Text>
                <Text style={styles.notesText}>{display.terms}</Text>
              </Card.Content>
            </Card>
          )}
        </ScrollView>

        {/* Actions Footer */}
        <View style={styles.footer}>
          <Button mode="outlined" onPress={onClose} style={styles.footerButton}>
            Close
          </Button>
          
          {!isGuest && onSend && (
            <>
              <Button 
                mode="outlined" 
                onPress={() => onSend('email')}
                style={styles.footerButton}
              >
                Send Email
              </Button>
              <Button 
                mode="outlined" 
                onPress={() => onSend('whatsapp')}
                style={styles.footerButton}
              >
                Send WhatsApp
              </Button>
            </>
          )}
          
          <Button 
            mode="contained" 
            onPress={onDownload}
            style={styles.footerButton}
          >
            Download PDF
          </Button>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  businessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  businessDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  currencyInfo: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  clientName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  clientDetail: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  invoiceNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
    textAlign: 'right',
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
    textAlign: 'right',
  },
  taxInfo: {
    fontSize: 10,
    color: '#888',
    marginTop: 4,
    textAlign: 'right',
  },
  guestInfo: {
    fontSize: 10,
    color: '#ff8f00',
    marginTop: 4,
    textAlign: 'right',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 8,
    marginBottom: 8,
  },
  tableHeaderText: {
    fontWeight: 'bold',
    color: '#333',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tableCell: {
    fontSize: 12,
    color: '#333',
    paddingHorizontal: 4,
  },
  totalsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  grandTotal: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  grandTotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2dc4b6',
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 8,
  },
  footerButton: {
    flex: 1,
  },
});