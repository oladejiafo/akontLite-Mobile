import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Alert,
  Linking,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image
} from 'react-native';
import { Card, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useAuth } from '../context/AuthContext';
import { Plan } from '../types';
import api, { subscriptionAPI } from '../services/api'; // Import directly
import axios from 'axios';

type AuthStackParamList = {
  Home: undefined;
  Register: { selectedPlan?: Plan };
  Pricing: undefined;
  Login: undefined;
  CreateInvoice: undefined;
};

type PricingScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Pricing'>;

export default function PricingScreen() {
  const navigation = useNavigation<PricingScreenNavigationProp>();
  const { user, subscription } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [paymentProvider, setPaymentProvider] = useState('stripe');

  useEffect(() => {
    loadPlans();
  }, []);

const loadPlans = async () => {
    try {
      const response = await axios.get('https://akontlite.akontforge.com/api/plans', {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://akontlite.akontforge.com/',
          'Origin': 'https://akontlite.akontforge.com',
        },
        withCredentials: false,
      });
      setPlans(response.data.plans);
    } catch (error) {
      console.error('Failed:', error);
    }
  };

  const handlePlanSelect = async (plan: Plan) => {
    if (user) {
      // Logged in user - handle subscription directly
      if (plan.price === 0) {
        // Free plan - downgrade directly
        try {
          setLoading(true);
          await subscriptionAPI.updateSubscription(plan.id);
          Alert.alert('Success', 'Plan updated successfully');
          // Refresh plans to show current plan
          loadPlans();
        } catch (error) {
          console.error('Failed to update subscription:', error);
          Alert.alert('Error', 'Failed to update subscription. Please try again.');
        } finally {
          setLoading(false);
        }
      } else {
        // Paid plan - start checkout process
        try {
          setLoading(true);
          const response = await subscriptionAPI.createCheckoutSession(plan.id);
          
          if (response.data.checkout_url) {
            // Open payment gateway (Flutterwave/Stripe)
            Linking.openURL(response.data.checkout_url);
          } else {
            throw new Error('No checkout URL received');
          }
        } catch (error: any) {
          console.error('Checkout failed:', error);
          Alert.alert('Error', error.response?.data?.error || 'Failed to start checkout process. Please try again.');
        } finally {
          setLoading(false);
        }
      }
    } else {
      // Guest user - redirect to registration with plan
      navigation.navigate('Register', { 
        selectedPlan: plan
      });
    }
  };

  const getPlanFeatures = (plan: Plan) => {
    const features = [];
    
    if (plan.invoice_limit === 0) {
      features.push('Unlimited invoices');
    } else {
      features.push(`${plan.invoice_limit} invoices/month`);
    }
    
    if (plan.reminder_limit === 0) {
      features.push('Unlimited auto-reminders');
    } else {
      features.push(`${plan.reminder_limit} reminders/month`);
    }
    
    if (plan.branded_emails) features.push('Branded emails');
    if (plan.payment_links) features.push('Payment links');
    if (plan.escalation_rules) features.push('Escalation rules');
    if (plan.analytics) features.push('Advanced analytics');
    
    return features;
  };

  const isCurrentPlan = (plan: Plan): boolean => {
    return !!(subscription && subscription.plan_id === plan.id);
  };

  const isRecommendedPlan = (plan: Plan): boolean => {
    return plan.slug === 'pro' || plan.name.toLowerCase().includes('pro');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      
      {/* Header with Logo */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.logoContainer}
          onPress={() => navigation.navigate('Home')}
        >
          <Image 
            source={require('../../assets/logo.png')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.logoText}>AkɔntLite</Text>
          <Text style={styles.tagline}>Professional Invoicing</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Choose Your Plan</Text>
          <Text style={styles.heroSubtitle}>
            Start free, upgrade anytime. All plans include core invoicing features.
          </Text>
          {user && (
            <Text style={styles.userNotice}>
              You are currently logged in. Upgrading will apply to your account immediately.
            </Text>
          )}
          <Text style={styles.paymentInfo}>
            Payments processed via {paymentProvider === 'flutterwave' ? 'Flutterwave' : 'Stripe'}
          </Text>
        </View>

        {/* Pricing Plans */}
        <View style={styles.plansContainer}>
          {plans.map((plan) => {
            const isRecommended = isRecommendedPlan(plan);
            const isCurrent = isCurrentPlan(plan);
            
            return (
              <Card 
                key={plan.id} 
                style={[
                  styles.planCard,
                  isRecommended && styles.recommendedCard
                ]}
              >
                {isRecommended && (
                  <View style={styles.recommendedBadge}>
                    <Text style={styles.recommendedText}>RECOMMENDED</Text>
                  </View>
                )}
                
                <Card.Content style={styles.planContent}>
                  <Text style={styles.planName}>{plan.name}</Text>
                  <Text style={styles.planPrice}>
                    {plan.price === 0 ? 'Free' : `$${plan.price}`}
                    {plan.price > 0 && <Text style={styles.planPeriod}>/month</Text>}
                  </Text>
                  
                  <View style={styles.featuresList}>
                    {getPlanFeatures(plan).map((feature, index) => (
                      <View key={index} style={styles.featureItem}>
                        <Text style={styles.featureIcon}>✓</Text>
                        <Text style={styles.featureText}>{feature}</Text>
                      </View>
                    ))}
                  </View>
                  
                  <Button
                    mode={
                      isCurrent ? 'outlined' :
                      plan.price === 0 ? 'outlined' : 
                      isRecommended ? 'contained' : 'contained'
                    }
                    onPress={() => handlePlanSelect(plan)}
                    disabled={loading || isCurrent}
                    loading={loading}
                    style={styles.planButton}
                    labelStyle={styles.planButtonLabel}
                  >
                    {loading ? 'Processing...' : 
                     isCurrent ? 'Current Plan' :
                     user ? (
                      plan.price === 0 ? 'Downgrade to Free' : 'Upgrade Now'
                    ) : (
                      plan.price === 0 ? 'Get Started Free' : 'Start Free Trial'
                    )}
                  </Button>
                  
                  {plan.price > 0 && !isCurrent && (
                    <Text style={styles.trialText}>
                      {user ? 'Upgrade instantly' : '7-day free trial available'}
                    </Text>
                  )}
                </Card.Content>
              </Card>
            );
          })}
        </View>

        {/* Features Comparison */}
        <Card style={styles.featuresCard}>
          <Card.Content>
            <Text style={styles.featuresTitle}>All plans include:</Text>
            
            <View style={styles.allFeaturesGrid}>
              <View style={styles.featureColumn}>
                <View style={styles.allFeatureItem}>
                  <Text style={styles.allFeatureIcon}>📝</Text>
                  <Text style={styles.allFeatureTitle}>Create & Send Invoices</Text>
                  <Text style={styles.allFeatureDesc}>Professional invoices in minutes</Text>
                </View>
                
                <View style={styles.allFeatureItem}>
                  <Text style={styles.allFeatureIcon}>👥</Text>
                  <Text style={styles.allFeatureTitle}>Client Management</Text>
                  <Text style={styles.allFeatureDesc}>Organize all your clients</Text>
                </View>
              </View>
              
              <View style={styles.featureColumn}>
                <View style={styles.allFeatureItem}>
                  <Text style={styles.allFeatureIcon}>📊</Text>
                  <Text style={styles.allFeatureTitle}>Basic Dashboard</Text>
                  <Text style={styles.allFeatureDesc}>Track outstanding payments</Text>
                </View>
                
                <View style={styles.allFeatureItem}>
                  <Text style={styles.allFeatureIcon}>📄</Text>
                  <Text style={styles.allFeatureTitle}>PDF Export</Text>
                  <Text style={styles.allFeatureDesc}>Download professional PDFs</Text>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerLinks}>
            <TouchableOpacity onPress={() => Linking.openURL('https://example.com/terms')}>
              <Text style={styles.footerLink}>Terms</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Linking.openURL('https://example.com/policy')}>
              <Text style={styles.footerLink}>Privacy</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Linking.openURL('https://example.com/support')}>
              <Text style={styles.footerLink}>Support</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <SafeAreaView style={styles.bottomSafeArea}>
        <View style={styles.bottomNav}>
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.navIcon}>🏠</Text>
            <Text style={styles.navButtonText}>Home</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.navIcon}>🔐</Text>
            <Text style={styles.navButtonText}>Sign In</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => navigation.navigate('Register', {})}
          >
            <Text style={styles.navIcon}>👤</Text>
            <Text style={styles.navButtonText}>Sign Up</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => navigation.navigate('Pricing')}
          >
            <Text style={styles.navIcon}>💰</Text>
            <Text style={[styles.navButtonText, styles.activeNavButton]}>Pricing</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    width: '100%',
  },
  logoImage: {
    height: 40, 
    width: 40, 
    marginBottom: 4,
    alignSelf: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2dc4b6',
  },
  tagline: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  container: {
    flex: 1,
  },
  heroSection: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2dc4b6',
    marginBottom: 12,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 20,
  },
  userNotice: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  paymentInfo: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  plansContainer: {
    padding: 16,
    gap: 16,
  },
  planCard: {
    elevation: 3,
    position: 'relative',
    backgroundColor: '#fff',
  },
  recommendedCard: {
    borderWidth: 2,
    borderColor: '#ff8f00',
  },
  recommendedBadge: {
    position: 'absolute',
    top: -10,
    left: '50%',
    transform: [{ translateX: -60 }],
    backgroundColor: '#ff8f00',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  recommendedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  planContent: {
    alignItems: 'center',
    paddingTop: 24,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2dc4b6',
    marginBottom: 16,
  },
  planPeriod: {
    fontSize: 14,
    color: '#666',
  },
  featuresList: {
    width: '100%',
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  featureIcon: {
    color: '#28a745',
    fontWeight: 'bold',
    marginRight: 12,
    fontSize: 14,
  },
  featureText: {
    fontSize: 12,
    color: '#333',
    flex: 1,
  },
  planButton: {
    width: '100%',
    marginBottom: 8,
  },
  planButtonLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  trialText: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  featuresCard: {
    margin: 16,
    elevation: 2,
    backgroundColor: '#fff',
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2dc4b6',
    textAlign: 'center',
    marginBottom: 16,
  },
  allFeaturesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  featureColumn: {
    flex: 1,
    gap: 16,
  },
  allFeatureItem: {
    alignItems: 'center',
    padding: 12,
  },
  allFeatureIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  allFeatureTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  allFeatureDesc: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    lineHeight: 14,
  },
  footer: {
    padding: 24,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
  },
  footerLinks: {
    flexDirection: 'row',
    gap: 24,
  },
  footerLink: {
    fontSize: 12,
    color: '#666',
  },
  bottomSafeArea: {
    backgroundColor: '#fff',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 8,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navButtonText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#2dc4b6',
  },
  activeNavButton: {
    color: '#ff8f00',
    fontWeight: '700',
  },
  navIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
});