import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import CreateInvoiceScreen from '../screens/CreateInvoiceScreen';
import PricingScreen from '../screens/PricingScreen';
import { Plan } from '../types';

export type AuthStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: { selectedPlan?: Plan };
  Pricing: undefined;
  CreateInvoice: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator 
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right'
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Pricing" component={PricingScreen} />
      <Stack.Screen 
        name="CreateInvoice" 
        component={CreateInvoiceScreen}
        options={{
          headerShown: true,
          title: 'Create Invoice',
          headerStyle: {
            backgroundColor: '#2dc4b6',
          },
          headerTintColor: '#fff',
        }}
      />
    </Stack.Navigator>
  );
}