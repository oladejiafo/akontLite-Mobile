import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Card, Button } from 'react-native-paper';
import { useNavigation, NavigationProp } from '@react-navigation/native';

type RootStackParamList = {
  SubscriptionCancel: undefined;
  Billing: undefined;
  Dashboard: undefined;
};

export default function SubscriptionCancelScreen() {
  const navigation = useNavigation<NavigationProp<any>>();

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={styles.content}>
          <Text style={styles.icon}>⚠️</Text>
          <Text style={styles.title}>Subscription Cancelled</Text>
          <Text style={styles.subtitle}>
            Your subscription process was cancelled. No charges were made.
          </Text>
          
          <View style={styles.buttons}>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('Billing')}
              style={styles.button}
            >
              Back to Billing
            </Button>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('Dashboard')}
              style={styles.button}
            >
              Go to Dashboard
            </Button>
          </View>
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
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 32,
    lineHeight: 22,
  },
  buttons: {
    width: '100%',
    gap: 12,
  },
  button: {
    width: '100%',
  },
});