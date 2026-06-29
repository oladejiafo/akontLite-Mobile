import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { Card, Button, Badge, Chip } from 'react-native-paper';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { paymentsAPI } from '../../services/api';
import { Payment } from '../../types';

export default function PaymentsScreen() {
    const navigation = useNavigation<NavigationProp<any>>();
  const [activeTab, setActiveTab] = useState('overview');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentStats, setPaymentStats] = useState({
    totalReceived: 0,
    pendingPayments: 0,
    failedPayments: 0,
    conversionRate: 0,
  });

  useEffect(() => {
    fetchPaymentsData();
  }, []);

  const fetchPaymentsData = async () => {
    try {
      setLoading(true);
      const [paymentsRes, statsRes] = await Promise.all([
        paymentsAPI.getPayments(),
        paymentsAPI.getPaymentStats()
      ]);

      setPayments(paymentsRes.data.data || []);
      setPaymentStats(statsRes.data);
    } catch (error) {
      console.error('Failed to fetch payments data:', error);
      Alert.alert('Error', 'Failed to load payments data');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async (paymentId: number) => {
    try {
      await paymentsAPI.markPaymentComplete(paymentId);
      Alert.alert('Success', 'Payment marked as complete!');
      fetchPaymentsData();
    } catch (error) {
      console.error('Failed to mark as paid:', error);
      Alert.alert('Error', 'Failed to mark payment as complete');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: string } = {
      completed: '#28a745',
      pending: '#ffc107',
      failed: '#dc3545',
      refunded: '#6c757d',
      processing: '#17a2b8',
    };

    return (
      <Badge style={[styles.statusBadge, { backgroundColor: statusColors[status] || '#6c757d' }]}>
        {status}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return `$${(amount || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Payments</Text>
          <Text style={styles.subtitle}>Track and manage invoice payments</Text>
        </View>

        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Text style={[styles.statNumber, styles.statReceived]}>
                {formatCurrency(paymentStats.totalReceived)}
              </Text>
              <Text style={styles.statLabel}>Total Received</Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Text style={[styles.statNumber, styles.statPending]}>
                {paymentStats.pendingPayments}
              </Text>
              <Text style={styles.statLabel}>Pending</Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Text style={[styles.statNumber, styles.statFailed]}>
                {paymentStats.failedPayments}
              </Text>
              <Text style={styles.statLabel}>Failed</Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Text style={[styles.statNumber, styles.statConversion]}>
                {paymentStats.conversionRate}%
              </Text>
              <Text style={styles.statLabel}>Conversion</Text>
            </Card.Content>
          </Card>
        </View>

        {/* Coming Soon Notice */}
        <Card style={styles.noticeCard}>
          <Card.Content>
            <Text style={styles.noticeTitle}>Online Payments Coming Soon!</Text>
            <Text style={styles.noticeText}>
              For now, you can track offline payments and mark invoices as paid manually. 
              Online payment gateway integration will be available in the next update.
            </Text>
          </Card.Content>
        </Card>

        {/* Tabs */}
        <View style={styles.tabContainer}>
            <Chip
            selected={activeTab === 'overview'}
            onPress={() => setActiveTab('overview')}
            style={styles.tabChip}
            mode={activeTab === 'overview' ? 'flat' : 'outlined'}
            >
            All Payments
            </Chip>
            <Chip
            selected={activeTab === 'methods'}
            onPress={() => setActiveTab('methods')}
            style={styles.tabChip}
            mode={activeTab === 'methods' ? 'flat' : 'outlined'}
            >
            Payment Methods
            </Chip>
        </View>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <Card style={styles.tabCard}>
            <Card.Content>
              {payments.length > 0 ? (
                payments.map(payment => (
                  <View key={payment.id} style={styles.paymentItem}>
                    <View style={styles.paymentHeader}>
                      <Text style={styles.paymentId}>PMT-{payment.id}</Text>
                      {getStatusBadge(payment.status)}
                    </View>
                    
                    <View style={styles.paymentDetails}>
                      <View style={styles.paymentInfo}>
                        <Text style={styles.invoiceLabel}>Invoice:</Text>
                        <Text style={styles.invoiceNumber}>
                          {payment.invoice?.invoice_no}
                        </Text>
                      </View>
                      
                      <View style={styles.paymentInfo}>
                        <Text style={styles.amountLabel}>Amount:</Text>
                        <Text style={styles.amountValue}>
                          {formatCurrency(payment.amount)}
                        </Text>
                      </View>
                      
                      <View style={styles.paymentInfo}>
                        <Text style={styles.methodLabel}>Method:</Text>
                        <Badge style={styles.methodBadge}>
                          {payment.payment_method || 'manual'}
                        </Badge>
                      </View>
                      
                      <View style={styles.paymentInfo}>
                        <Text style={styles.dateLabel}>Paid At:</Text>
                        <Text style={styles.dateValue}>
                          {payment.paid_at 
                            ? new Date(payment.paid_at).toLocaleDateString()
                            : '-'
                          }
                        </Text>
                      </View>
                    </View>

                    {payment.status === 'pending' && (
                      <Button
                        mode="outlined"
                        onPress={() => handleMarkAsPaid(payment.id)}
                        style={styles.markPaidButton}
                        compact
                      >
                        Mark Paid
                      </Button>
                    )}
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>💳</Text>
                  <Text style={styles.emptyTitle}>No payments yet</Text>
                  <Text style={styles.emptyText}>
                    Payments will appear here when you mark invoices as paid
                  </Text>
                  <Button
                    mode="contained"
                    onPress={() => navigation.navigate('Invoices')}
                    style={styles.emptyButton}
                  >
                    View Invoices
                  </Button>
                </View>
              )}
            </Card.Content>
          </Card>
        )}

        {activeTab === 'methods' && (
          <Card style={styles.tabCard}>
            <Card.Content style={styles.methodsContent}>
              <Text style={styles.methodsTitle}>Online Payments Coming Soon</Text>
              <Text style={styles.methodsText}>
                We're working on integrating secure online payment methods to make it easier for your clients to pay invoices.
              </Text>
              
              <View style={styles.methodsGrid}>
                <Card style={styles.methodCard}>
                  <Card.Content style={styles.methodCardContent}>
                    <Text style={styles.methodIcon}>💳</Text>
                    <Text style={styles.methodName}>Stripe</Text>
                    <Text style={styles.methodDescription}>
                      Credit cards & global payments
                    </Text>
                  </Card.Content>
                </Card>

                <Card style={styles.methodCard}>
                  <Card.Content style={styles.methodCardContent}>
                    <Text style={styles.methodIcon}>🏦</Text>
                    <Text style={styles.methodName}>Bank Transfer</Text>
                    <Text style={styles.methodDescription}>
                      Direct bank payments
                    </Text>
                  </Card.Content>
                </Card>
              </View>

              <Card style={styles.currentProcessCard}>
                <Card.Content>
                  <Text style={styles.currentProcessTitle}>Current Process:</Text>
                  <Text style={styles.currentProcessText}>
                    Send invoices to clients and mark them as paid manually when payment is received.
                  </Text>
                </Card.Content>
              </Card>
            </Card.Content>
          </Card>
        )}
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
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2dc4b6',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  statCard: {
    width: '48%',
    elevation: 2,
  },
  statContent: {
    alignItems: 'center',
    padding: 12,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statReceived: {
    color: '#28a745',
  },
  statPending: {
    color: '#ffc107',
  },
  statFailed: {
    color: '#dc3545',
  },
  statConversion: {
    color: '#17a2b8',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  noticeCard: {
    backgroundColor: '#d1ecf1',
    borderColor: '#bee5eb',
    borderWidth: 1,
    marginBottom: 16,
    display: 'none'
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0c5460',
    marginBottom: 8,
  },
  noticeText: {
    fontSize: 14,
    color: '#0c5460',
    lineHeight: 20,
  },
  tabs: {
    marginBottom: 16,
  },
  tabCard: {
    elevation: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  tabChip: {
    flex: 1,
    justifyContent: 'center',
  },
  paymentItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentId: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: 14,
  },
  statusBadge: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  paymentDetails: {
    gap: 6,
  },
  paymentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  invoiceLabel: {
    fontSize: 12,
    color: '#666',
  },
  invoiceNumber: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  amountLabel: {
    fontSize: 12,
    color: '#666',
  },
  amountValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2dc4b6',
  },
  methodLabel: {
    fontSize: 12,
    color: '#666',
  },
  methodBadge: {
    backgroundColor: '#6c757d',
    color: '#fff',
    fontSize: 10,
  },
  dateLabel: {
    fontSize: 12,
    color: '#666',
  },
  dateValue: {
    fontSize: 12,
    color: '#333',
  },
  markPaidButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  emptyButton: {
    marginTop: 8,
  },
  methodsContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  methodsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  methodsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  methodsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
    gap: 12,
  },
  methodCard: {
    flex: 1,
    elevation: 2,
  },
  methodCardContent: {
    alignItems: 'center',
    padding: 16,
  },
  methodIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  methodName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  currentProcessCard: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeaa7',
    borderWidth: 1,
    width: '100%',
  },
  currentProcessTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 4,
  },
  currentProcessText: {
    fontSize: 12,
    color: '#856404',
    lineHeight: 16,
  },
});