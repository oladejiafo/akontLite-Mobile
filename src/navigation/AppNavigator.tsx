import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import ProfileScreen from '../screens/main/ProfileScreen';
import BillingScreen from '../screens/BillingScreen';
import QuickCreateScreen from '../screens/quick/QuickCreateScreen';
import ScanReceiptScreen from '../screens/scan/ScanReceiptScreen';
import { ActivityIndicator, View } from 'react-native';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2dc4b6" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>

        {user ? (
          <Stack.Screen name="MainTabs" component={MainNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}

        {/* Global screens - accessible regardless of auth state */}
        <Stack.Screen
          name="QuickCreate"
          component={QuickCreateScreen}
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="ScanReceipt"
          component={ScanReceiptScreen}
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Billing" component={BillingScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}