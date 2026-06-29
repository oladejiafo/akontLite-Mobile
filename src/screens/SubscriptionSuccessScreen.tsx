import React, { useEffect, useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Card, ActivityIndicator } from 'react-native-paper';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';

type RootStackParamList = {
  SubscriptionSuccess: undefined;
  Dashboard: undefined;
  Billing: undefined;
};

export default function SubscriptionSuccessScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  const { refreshSubscription } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleSuccess = async () => {
      try {
        // Simulate subscription activation
        await refreshSubscription();
        
        setTimeout(() => {
          navigation.navigate('Dashboard');
        }, 2000);
      } catch (err) {
        console.error('Subscription success handling failed:', err);
        setError('Failed to activate subscription. Please contact support.');
        setTimeout(() => {
          navigation.navigate('Billing');
        }, 5000);
      } finally {
        setLoading(false);
      }
    };

    handleSuccess();
  }, [navigation, refreshSubscription]);

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={styles.content}>
          {loading ? (
            <>
              <ActivityIndicator size="large" color="#2dc4b6" />
              <Text style={styles.title}>Activating your subscription...</Text>
              <Text style={styles.subtitle}>
                Please wait while we set up your account.
              </Text>
            </>
          ) : error ? (
            <>
              <Text style={styles.errorIcon}>❌</Text>
              <Text style={styles.errorTitle}>Something went wrong</Text>
              <Text style={styles.errorText}>{error}</Text>
            </>
          ) : (
            <>
              <Text style={styles.successIcon}>✅</Text>
              <Text style={styles.title}>Subscription Activated Successfully!</Text>
              <Text style={styles.subtitle}>
                Your subscription has been activated. Redirecting to dashboard...
              </Text>
            </>
          )}
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    elevation: 4,
  },
  content: {
    alignItems: 'center',
    padding: 32,
  },
  successIcon: {
    fontSize: 64,
    marginBottom: 16,
    color: '#28a745',
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
    color: '#dc3545',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#dc3545',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 16,
    lineHeight: 22,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    lineHeight: 22,
  },
});