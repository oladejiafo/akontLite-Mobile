import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native';
import { Card, Button, Chip } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { invoiceAPI } from '../../services/api';
import { Invoice } from '../../types';

export default function InvoiceDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { invoiceId } = route.params as { invoiceId: number };
  
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoice();
  }, [invoiceId]);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const response = await invoiceAPI.getInvoice(invoiceId);
      setInvoice(response.data.data || response.data);
    } catch (error) {
      console.error('Failed to fetch invoice:', error);
      Alert.alert('Error', 'Failed to load invoice details');
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvoice = async (channel: string) => {
    try {
      await invoiceAPI.sendInvoice(invoiceId, { channel });
      Alert.alert('Success', `Invoice sent via ${channel} successfully!`);
    } catch (error) {
      console.error('Failed to send invoice:', error);
      Alert.alert('Error', 'Failed to send invoice');
    }
  };

  const handleMarkAsPaid = async () => {
    try {
      await invoiceAPI.markAsPaid(invoiceId);
      Alert.alert('Success', 'Invoice marked as paid!');
      fetchInvoice(); // Refresh
    } catch (error) {
      console.error('Failed to mark as paid:', error);
      Alert.alert('Error', 'Failed to mark as paid');
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${(amount || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!invoice) {
    return (
      <View style={styles.container}>
        <Text>Invoice not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.headerCard}>
        <Card.Content>
          <Text style={styles.invoiceNumber}>Invoice {invoice.invoice_no}</Text>
          <Text style={styles.clientName}>{invoice.client?.name || 'N/A'}</Text>
          <Text style={styles.amount}>{formatCurrency(invoice.total ?? invoice.total_amount)}</Text>
        </Card.Content>
      </Card>

      <Card style={styles.detailsCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Issue Date:</Text>
            <Text style={styles.detailValue}>{formatDate(invoice.issue_date ?? '')}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Due Date:</Text>
            <Text style={styles.detailValue}>{formatDate(invoice.due_date ?? '')}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status:</Text>
            <Chip>{invoice.status}</Chip>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.actionsCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Actions</Text>
          <Button 
            mode="outlined" 
            onPress={() => handleSendInvoice('email')}
            style={styles.actionButton}
          >
            Send Email
          </Button>
          <Button 
            mode="outlined" 
            onPress={() => handleSendInvoice('whatsapp')}
            style={styles.actionButton}
          >
            Send WhatsApp
          </Button>
          {invoice.status !== 'paid' && (
            <Button 
              mode="contained" 
              onPress={handleMarkAsPaid}
              style={styles.actionButton}
            >
              Mark as Paid
            </Button>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  headerCard: {
    marginBottom: 16,
  },
  invoiceNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2dc4b6',
  },
  clientName: {
    fontSize: 14,
    color: '#666',
    marginVertical: 4,
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  detailsCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
  },
  detailValue: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  actionsCard: {
    marginBottom: 16,
  },
  actionButton: {
    marginBottom: 8,
    borderRadius:10
  },
});