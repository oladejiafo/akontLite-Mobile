import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { Card, Button, Modal, Portal, TextInput as PaperInput } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { clientAPI, invoiceAPI } from '../../services/api';
import { Client, Invoice } from '../../types';

interface RouteParams {
  clientId: string;
}

export default function ClientDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { clientId } = route.params as RouteParams;
  
  const [client, setClient] = useState<Client | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editClient, setEditClient] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    terms: '',
    billing_address: '',
  });

  useEffect(() => {
    fetchClientData();
  }, [clientId]);

  const fetchClientData = async () => {
    try {
      setLoading(true);
      const [clientRes, invoicesRes] = await Promise.all([
        clientAPI.getClient(parseInt(clientId)),
        invoiceAPI.getInvoices({ client_id: clientId })
      ]);

      setClient(clientRes.data.data || clientRes.data);
      setEditClient(clientRes.data.data || clientRes.data);
      setInvoices(invoicesRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch client data:', error);
      Alert.alert('Error', 'Failed to load client data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClient = async () => {
    try {
      await clientAPI.updateClient(parseInt(clientId), editClient);
      setShowEditModal(false);
      fetchClientData();
      Alert.alert('Success', 'Client updated successfully');
    } catch (error) {
      console.error('Failed to update client:', error);
      Alert.alert('Error', 'Failed to update client');
    }
  };

  const getInvoiceStats = () => {
    const total = invoices.length;
    const paid = invoices.filter(inv => inv.status === 'paid').length;
    const outstanding = invoices.filter(inv => inv.status === 'sent').length;
    const overdue = invoices.filter(inv => inv.status === 'overdue').length;
  
    const totalAmount = invoices.reduce((sum, inv) => sum + Number(inv.total || 0), 0);
    const paidAmount = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + Number(inv.total || 0), 0);
    const outstandingAmount = invoices
      .filter(inv => inv.status === 'sent' || inv.status === 'overdue')
      .reduce((sum, inv) => sum + Number(inv.total || 0), 0);
  
    return {
      total,
      paid,
      outstanding,
      overdue,
      totalAmount: totalAmount || 0,
      paidAmount: paidAmount || 0,
      outstandingAmount: outstandingAmount || 0,
    };
  };
  

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const stats = getInvoiceStats();

  if (loading || !client) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            icon="arrow-left"
          >
            Back
          </Button>
          <Text style={styles.title}>{client.name}</Text>
        </View>

        {/* Client Information */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.clientHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {getInitials(client.name || '?')}
                </Text>
              </View>
              <View style={styles.clientMainInfo}>
                <Text style={styles.clientName}>{client.name}</Text>
                {client.terms && (
                  <Text style={styles.terms}>Payment Terms: {client.terms} days</Text>
                )}
              </View>
            </View>

            <View style={styles.clientDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Email:</Text>
                <Text style={styles.detailValue}>{client.email || 'Not provided'}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Phone:</Text>
                <Text style={styles.detailValue}>{client.phone || 'Not provided'}</Text>
              </View>
              
              {(client.address || client.billing_address) && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Address:</Text>
                  <Text style={styles.detailValue}>
                    {client.address || client.billing_address}
                  </Text>
                </View>
              )}
            </View>
          </Card.Content>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            mode="contained"
            onPress={() => {/* Navigate to create invoice */}}
            style={styles.actionButton}
            icon="plus"
          >
            Create Invoice
          </Button>
          <Button
            mode="outlined"
            onPress={() => setShowEditModal(true)}
            style={styles.actionButton}
            icon="pencil"
          >
            Edit Client
          </Button>
        </View>

        {/* Invoice Stats */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Invoice Summary</Text>
            
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.total}</Text>
                <Text style={styles.statLabel}>Total Invoices</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, styles.paidStat]}>{stats.paid}</Text>
                <Text style={styles.statLabel}>Paid</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, styles.outstandingStat]}>{stats.outstanding}</Text>
                <Text style={styles.statLabel}>Outstanding</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, styles.overdueStat]}>{stats.overdue}</Text>
                <Text style={styles.statLabel}>Overdue</Text>
              </View>
            </View>

            <View style={styles.amountStats}>
              <View style={styles.amountRow}>
                <Text style={styles.amountLabel}>Total Amount:</Text>
                <Text style={styles.amountValue}>
                    ${Number(stats.totalAmount || 0).toFixed(2)}
                </Text>
              </View>
              
              
              <View style={styles.amountRow}>
                <Text style={styles.amountLabel}>Paid Amount:</Text>
                <Text style={[styles.amountValue, styles.paidAmount]}>
                  {/* ${stats.paidAmount.toFixed(2)} */}
                  ${Number(stats.paidAmount || 0).toFixed(2)}
                </Text>
              </View>
              
              <View style={styles.amountRow}>
                <Text style={styles.amountLabel}>Outstanding:</Text>
                <Text style={[styles.amountValue, styles.outstandingAmount]}>
                  {/* ${stats.outstandingAmount.toFixed(2)} */}
                  ${Number(stats.outstandingAmount || 0).toFixed(2)}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Recent Invoices */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Recent Invoices</Text>
            
            {invoices.length > 0 ? (
              invoices.slice(0, 5).map(invoice => (
                <View key={invoice.id} style={styles.invoiceItem}>
                  <View style={styles.invoiceInfo}>
                    <Text style={styles.invoiceNumber}>
                      {invoice.invoice_no || `INV-${invoice.id}`}
                    </Text>
                    <Text style={styles.invoiceAmount}>
                      {/* ${invoice.total?.toFixed(2)} */}
                      ${Number(invoice.total || 0).toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.invoiceMeta}>
                    <Text style={styles.invoiceDate}>
                      Due: {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}
                    </Text>
                    <Text style={[
                      styles.invoiceStatus,
                      invoice.status === 'paid' && styles.statusPaid,
                      invoice.status === 'overdue' && styles.statusOverdue,
                      invoice.status === 'sent' && styles.statusSent,
                    ]}>
                      {invoice.status || 'draft'}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.noInvoices}>
                <Text style={styles.noInvoicesText}>No invoices for this client yet</Text>
                <Button
                  mode="outlined"
                  onPress={() => {/* Navigate to create invoice */}}
                  style={styles.createInvoiceButton}
                >
                  Create First Invoice
                </Button>
              </View>
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Edit Client Modal */}
      <Portal>
        <Modal
          visible={showEditModal}
          onDismiss={() => setShowEditModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={styles.modalTitle}>Edit Client</Text>
          
          <PaperInput
            label="Client Name *"
            value={editClient.name}
            onChangeText={(value) => setEditClient({ ...editClient, name: value })}
            style={styles.modalInput}
            mode="outlined"
          />
          
          <PaperInput
            label="Email"
            value={editClient.email || ''}
            onChangeText={(value) => setEditClient({ ...editClient, email: value })}
            style={styles.modalInput}
            mode="outlined"
            keyboardType="email-address"
          />
          
          <PaperInput
            label="Phone"
            value={editClient.phone || ''}
            onChangeText={(value) => setEditClient({ ...editClient, phone: value })}
            style={styles.modalInput}
            mode="outlined"
            keyboardType="phone-pad"
          />
          
          <PaperInput
            label="Payment Terms (days)"
            value={editClient.terms || ''}
            onChangeText={(value) => setEditClient({ ...editClient, terms: value })}
            style={styles.modalInput}
            mode="outlined"
            keyboardType="numeric"
          />
          
          <PaperInput
            label="Address"
            value={editClient.address || editClient.billing_address || ''}
            onChangeText={(value) => setEditClient({ ...editClient, address: value })}
            style={styles.modalInput}
            mode="outlined"
            multiline
            numberOfLines={3}
          />

          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => setShowEditModal(false)}
              style={styles.modalButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleUpdateClient}
              style={styles.modalButton}
              disabled={!editClient.name}
            >
              Update Client
            </Button>
          </View>
        </Modal>
      </Portal>
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
  },
  header: {
    marginBottom: 24,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2dc4b6',
    textAlign: 'center',
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  clientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2dc4b6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  clientMainInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  terms: {
    fontSize: 14,
    color: '#666',
  },
  clientDetails: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  detailValue: {
    color: '#666',
    flex: 2,
    textAlign: 'right',
  },
  actionButtons: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2dc4b6',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  paidStat: {
    color: '#28a745',
  },
  outstandingStat: {
    color: '#ffc107',
  },
  overdueStat: {
    color: '#dc3545',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  amountStats: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 16,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  amountLabel: {
    color: '#333',
    fontWeight: '500',
  },
  amountValue: {
    fontWeight: 'bold',
    color: '#333',
  },
  paidAmount: {
    color: '#28a745',
  },
  outstandingAmount: {
    color: '#ffc107',
  },
  invoiceItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  invoiceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  invoiceNumber: {
    fontWeight: 'bold',
    color: '#333',
  },
  invoiceAmount: {
    fontWeight: 'bold',
    color: '#2dc4b6',
  },
  invoiceMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  invoiceDate: {
    fontSize: 12,
    color: '#666',
  },
  invoiceStatus: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  statusPaid: {
    color: '#28a745',
  },
  statusOverdue: {
    color: '#dc3545',
  },
  statusSent: {
    color: '#ffc107',
  },
  noInvoices: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noInvoicesText: {
    color: '#666',
    marginBottom: 12,
  },
  createInvoiceButton: {
    marginTop: 8,
  },
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2dc4b6',
  },
  modalInput: {
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});