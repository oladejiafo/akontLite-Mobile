import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native';
import { 
  Card, 
  Button, 
  ProgressBar, 
  Chip,
  ActivityIndicator,
} from 'react-native-paper';
import { AuthContext } from '../context/AuthContext';
import { subscriptionAPI } from '../services/api';
import { Plan, Subscription, Usage } from '../types';

export default function BillingScreen() {
  const { subscription, usage, refreshSubscription } = useContext(AuthContext);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const response = await subscriptionAPI.getPlans();
      console.log('Full response structure:', JSON.stringify(response.data, null, 2));
      
      // Try different possible structures
      const plansData = response.data.data || 
                       response.data.plans || 
                       response.data || 
                       [];
      
      console.log('Found plans:', plansData);
      setPlans(plansData);
      
    } catch (error) {
      console.error('Failed to load plans:', error);
      Alert.alert('Error', 'Failed to load subscription plans');
    }
  };
  
  const handleUpgrade = async (planId: number) => {
    try {
      setLoading(true);
      setMessage('');
      
      const response = await subscriptionAPI.createCheckoutSession(planId);
      
      if (response.data.checkout_url) {
        // Open the checkout URL in browser
        Linking.openURL(response.data.checkout_url).catch(err => {
          Alert.alert('Error', 'Failed to open checkout page');
        });
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      setMessage(error.response?.data?.error || 'Failed to create checkout session');
      Alert.alert('Error', 'Failed to create checkout session');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription? You will be downgraded to the free plan.',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await subscriptionAPI.cancelSubscription();
              await refreshSubscription();
              setMessage('Subscription cancelled successfully');
              Alert.alert('Success', 'Subscription cancelled successfully');
            } catch (error: any) {
              setMessage(error.response?.data?.error || 'Failed to cancel subscription');
              Alert.alert('Error', 'Failed to cancel subscription');
            } finally {
              setLoading(false);
            }
          }
        },
      ]
    );
  };

  const getCurrentPlan = () => {
    return plans.find(plan => plan.id === subscription?.plan_id);
  };

  const currentPlan = getCurrentPlan();

  const formatCurrency = (amount: number) => {
    return `$${(amount || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === 0) return 0; // Unlimited
    return Math.min((used / limit) * 100, 100);
  };

  if (!plans.length) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2dc4b6" />
        <Text style={styles.loadingText}>Loading plans...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Billing & Subscription</Text>
          <Text style={styles.subtitle}>Manage your subscription plan</Text>
        </View>

        {/* Current Subscription */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Current Plan</Text>
            
            {subscription && currentPlan ? (
              <>
                <View style={styles.planHeader}>
                  <View>
                    <Text style={styles.planName}>{currentPlan.name}</Text>
                    <Text style={styles.planPrice}>
                      {currentPlan.price === 0 ? 'Free' : `${formatCurrency(currentPlan.price)}/month`}
                    </Text>
                  </View>
                  <Chip 
                    mode={subscription.status === 'active' ? 'flat' : 'outlined'}
                    style={[
                      styles.statusChip,
                      subscription.status === 'active' ? styles.activeChip : styles.inactiveChip
                    ]}
                  >
                    {subscription.status}
                  </Chip>
                </View>

                {/* Usage Stats */}
                {usage && (
                  <View style={styles.usageContainer}>
                    <Text style={styles.usageTitle}>Usage this month:</Text>
                    
                    <View style={styles.usageItem}>
                      <Text style={styles.usageLabel}>
                        Invoices: {usage.invoices_used} / {currentPlan.invoice_limit === 0 ? 'Unlimited' : currentPlan.invoice_limit}
                      </Text>
                      {currentPlan.invoice_limit > 0 && (
                        <ProgressBar 
                          progress={getUsagePercentage(usage.invoices_used, currentPlan.invoice_limit) / 100}
                          style={styles.progressBar}
                          color="#2dc4b6"
                        />
                      )}
                    </View>

                    <View style={styles.usageItem}>
                      <Text style={styles.usageLabel}>
                        Reminders: {usage.reminders_used} / {currentPlan.reminder_limit === 0 ? 'Unlimited' : currentPlan.reminder_limit}
                      </Text>
                      {currentPlan.reminder_limit > 0 && (
                        <ProgressBar 
                          progress={getUsagePercentage(usage.reminders_used, currentPlan.reminder_limit) / 100}
                          style={styles.progressBar}
                          color="#2dc4b6"
                        />
                      )}
                    </View>
                  </View>
                )}

                {/* Plan Features */}
                <View style={styles.featuresContainer}>
                  <Text style={styles.featuresTitle}>Features:</Text>
                  {currentPlan.invoice_limit === 0 ? (
                    <Text style={styles.feature}>✅ Unlimited invoices</Text>
                  ) : (
                    <Text style={styles.feature}>✅ Up to {currentPlan.invoice_limit} invoices/month</Text>
                  )}
                  {currentPlan.reminder_limit === 0 ? (
                    <Text style={styles.feature}>✅ Unlimited reminders</Text>
                  ) : (
                    <Text style={styles.feature}>✅ {currentPlan.reminder_limit} reminders/month</Text>
                  )}
                  {currentPlan.branded_emails && <Text style={styles.feature}>✅ Branded emails</Text>}
                  {currentPlan.payment_links && <Text style={styles.feature}>✅ Payment links</Text>}
                  {currentPlan.escalation_rules && <Text style={styles.feature}>✅ Escalation rules</Text>}
                  {currentPlan.analytics && <Text style={styles.feature}>✅ Advanced analytics</Text>}
                </View>

                {/* Cancel Subscription Button */}
                {currentPlan.price > 0 && (
                  <Button
                    mode="outlined"
                    onPress={handleCancelSubscription}
                    disabled={loading}
                    style={styles.cancelButton}
                    textColor="#dc3545"
                  >
                    {loading ? 'Processing...' : 'Cancel Subscription'}
                  </Button>
                )}
              </>
            ) : (
              <Text>Loading subscription information...</Text>
            )}
          </Card.Content>
        </Card>

        {/* Available Plans */}
        <Text style={styles.sectionTitle}>Available Plans</Text>
        
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            style={[
              styles.planCard,
              plan.id === currentPlan?.id && styles.currentPlanCard
            ]}
          >
            <Card.Content>
              <View style={styles.planCardHeader}>
                <Text style={styles.planCardName}>{plan.name}</Text>
                <Text style={styles.planCardPrice}>
                  {plan.price === 0 ? 'Free' : `${formatCurrency(plan.price)}`}
                  {plan.price > 0 && <Text style={styles.perMonth}>/month</Text>}
                </Text>
              </View>

              <View style={styles.planFeatures}>
                {plan.invoice_limit === 0 ? (
                  <Text style={styles.planFeature}>✅ Unlimited invoices</Text>
                ) : (
                  <Text style={styles.planFeature}>✅ {plan.invoice_limit} invoices/month</Text>
                )}
                {plan.reminder_limit === 0 ? (
                  <Text style={styles.planFeature}>✅ Unlimited reminders</Text>
                ) : (
                  <Text style={styles.planFeature}>✅ {plan.reminder_limit} reminders/month</Text>
                )}
                {plan.branded_emails && <Text style={styles.planFeature}>✅ Branded emails</Text>}
                {plan.payment_links && <Text style={styles.planFeature}>✅ Payment links</Text>}
                {plan.escalation_rules && <Text style={styles.planFeature}>✅ Escalation rules</Text>}
                {plan.analytics && <Text style={styles.planFeature}>✅ Advanced analytics</Text>}
              </View>

              {plan.id === currentPlan?.id ? (
                <Button mode="outlined" disabled style={styles.planButton}>
                  Current Plan
                </Button>
              ) : (
                <Button
                  mode={plan.price > (currentPlan?.price || 0) ? "contained" : "outlined"}
                  onPress={() => handleUpgrade(plan.id)}
                  disabled={loading}
                  style={styles.planButton}
                >
                  {loading ? 'Processing...' : 
                   plan.price > (currentPlan?.price || 0) ? 'Upgrade' : 
                   plan.price < (currentPlan?.price || 0) ? 'Downgrade' : 'Select'}
                </Button>
              )}
            </Card.Content>
          </Card>
        ))}
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
  card: {
    marginBottom: 24,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2dc4b6',
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 16,
    color: '#666',
  },
  statusChip: {
    marginLeft: 8,
  },
  activeChip: {
    backgroundColor: '#28a745',
  },
  inactiveChip: {
    borderColor: '#ffc107',
  },
  usageContainer: {
    marginBottom: 16,
  },
  usageTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  usageItem: {
    marginBottom: 12,
  },
  usageLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  featuresContainer: {
    marginBottom: 16,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  feature: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  cancelButton: {
    borderColor: '#dc3545',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  planCard: {
    marginBottom: 16,
    elevation: 2,
  },
  currentPlanCard: {
    borderColor: '#2dc4b6',
    borderWidth: 2,
  },
  planCardHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  planCardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  planCardPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2dc4b6',
  },
  perMonth: {
    fontSize: 14,
    color: '#666',
  },
  planFeatures: {
    marginBottom: 16,
  },
  planFeature: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  planButton: {
    marginTop: 8,
  },
});