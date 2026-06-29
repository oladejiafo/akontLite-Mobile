import React, { createContext, useState, useEffect, useContext } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { setAuthToken, subscriptionAPI } from './../services/api';

// Define types
interface User {
  id: number;
  name: string;
  email: string;
  company_id: number;
  created_at: string;
}

interface Plan {
  id: number;
  name: string;
  price: number;
  invoice_limit: number;
  reminder_limit: number;
  branded_emails?: boolean;
  payment_links?: boolean;
  analytics?: boolean;
}

interface Subscription {
  id: number;
  plan_id: number;
  status: string;
  current_period_start: string;
  current_period_end: string;
  plan?: Plan;

  company_id?: number;
  payment_provider?: string;
  created_at?: string;
  updated_at?: string;
}

interface Usage {
  invoices_used: number;
  reminders_used: number;

  clients_used?: number;
  invoice_limit?: number;
  reminder_limit?: number;
}

interface AuthContextData {
  user: User | null;
  subscription: Subscription | null;
  usage: Usage | null;
  loading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  refreshSubscription: () => Promise<void>;
}

// Create context
export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// Auth Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        setAuthToken(token);
        const response = await api.get('/user');
        setUser(response.data);
        await loadSubscriptionData();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      await AsyncStorage.removeItem('auth_token');
      setAuthToken(null);
      setUser(null);
      setSubscription(null);
      setUsage(null);
    } finally {
      setLoading(false);
    }
  };

  const loadSubscriptionData = async () => {
    try {
      // Only load subscription data - remove the usage call since endpoint doesn't exist
      const subscriptionResponse = await subscriptionAPI.getCurrentSubscription();
      
      // Set subscription data - access the correct property from response
      setSubscription(subscriptionResponse.data.subscription || subscriptionResponse.data);
      
      // Set default usage values since the usage endpoint doesn't exist
      setUsage({ invoices_used: 0, reminders_used: 0 });
      
    } catch (error) {
      console.error('Failed to load subscription data:', error);
      // Set default values if API fails
      setSubscription(null);
      setUsage({ invoices_used: 0, reminders_used: 0 });
    }
  };

  const login = async (token: string, userData: User) => {
    await AsyncStorage.setItem('auth_token', token);
    setAuthToken(token);
    setUser(userData);
    await loadSubscriptionData();
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      await AsyncStorage.removeItem('auth_token');
      setAuthToken(null);
      setUser(null);
      setSubscription(null);
      setUsage(null);
    }
  };

  const refreshSubscription = async () => {
    await loadSubscriptionData();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      subscription,
      usage,
      login, 
      logout, 
      loading,
      refreshSubscription 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};