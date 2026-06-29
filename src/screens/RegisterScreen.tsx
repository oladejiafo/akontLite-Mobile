import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  SafeAreaView,
  StatusBar,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import { Card } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Plan } from '../types';
import { useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type AuthStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: { selectedPlan?: Plan };
  Pricing: undefined;
  CreateInvoice: undefined;
  MainTabs: undefined;
};

type Props = {
  route: RouteProp<AuthStackParamList, 'Register'>;
};

export default function RegisterScreen({ route }: Props) {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { login, user } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedPlan = route?.params?.selectedPlan;

  useEffect(() => {
    if (user) {
      navigation.replace('MainTabs');
    }
  }, [user, navigation]);

  const mergeGuestInvoiceAfterAuth = async () => {
    try {
      const guestToken = await AsyncStorage.getItem('guest_token');
      if (!guestToken) {
        console.log('No guest invoice to merge');
        return;
      }

      console.log('Merging guest invoice with token:', guestToken);
      
      try {
        await api.post(`/guest-invoices/${guestToken}/merge`);
        console.log('Guest invoice merged successfully');
        await AsyncStorage.removeItem('guest_token');
      } catch (mergeError) {
        console.error('Failed to merge guest invoice:', mergeError);
      }
    } catch (err) {
      console.error('Error accessing guest token:', err);
    }
  };

  const handleRegister = async () => {
    if (!name || !email || !password || !passwordConfirm) {
      setError('Please fill in all fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== passwordConfirm) {
      setError('Passwords do not match');
      return;
    }

    if (!agreeToTerms) {
      setError('Please agree to the Terms & Conditions');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let registerData: any = {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        password_confirmation: passwordConfirm,
        company_name: `${name.trim()}'s Company`
      };

      if (selectedPlan) {
        registerData.plan_id = selectedPlan.id;
      }

      console.log('Attempting registration...');
      
      const registerResponse = await api.post('/register', registerData);
      
      console.log('Registration successful, attempting login...');
      
      const loginResponse = await api.post('/login', { 
        email: email.toLowerCase().trim(), 
        password 
      });
      
      login(loginResponse.data.token, loginResponse.data.user);
      
      await mergeGuestInvoiceAfterAuth();
      
      console.log('Navigation to MainTabs...');
      navigation.replace('MainTabs');

    } catch (err: any) {
      console.error('Registration error:', err);
      
      if (err.code === 'NETWORK_ERROR' || err.message === 'Network Error') {
        setError('Network error. Please check your internet connection and try again.');
      } else if (err.response?.status === 422) {
        const errors = err.response.data.errors;
        if (errors.email) {
          setError(errors.email[0]);
        } else if (errors.password) {
          setError(errors.password[0]);
        } else {
          setError('Please check your input and try again.');
        }
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    Alert.alert(
      'Google Sign Up',
      'Google OAuth is currently available on our web platform. For mobile app, please use email and password registration for now.',
      [
        { 
          text: 'Visit Web App', 
          onPress: () => Linking.openURL('https://your-akontlite-website.com') 
        },
        { 
          text: 'Use Email', 
          style: 'default' 
        }
      ]
    );
  };

  const handleTermsPress = () => {
    Alert.alert(
      'Terms & Conditions',
      'Would you like to view our Terms & Conditions?',
      [
        { 
          text: 'View Online', 
          onPress: () => Linking.openURL('https://your-akontlite-website.com/terms') 
        },
        { 
          text: 'Cancel', 
          style: 'cancel' 
        }
      ]
    );
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

      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Back Button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.navigate('Home')}
              disabled={loading}
            >
              <Text style={styles.backButtonText}>← Back to Home</Text>
            </TouchableOpacity>

            <Card style={styles.card}>
              <Card.Content style={styles.cardContent}>
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Start your professional invoicing journey</Text>

                {/* Selected Plan Info */}
                {selectedPlan && (
                  <View style={styles.planInfo}>
                    <Text style={styles.planLabel}>Selected Plan:</Text>
                    <Text style={styles.planName}>{selectedPlan.name}</Text>
                    <Text style={styles.planPrice}>
                      {selectedPlan.price === 0 ? 'Free' : `$${selectedPlan.price}/month`}
                    </Text>
                  </View>
                )}

                {/* Error Message */}
                {error ? (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}

                {/* Google Auth Button */}
                <TouchableOpacity
                  style={styles.googleButton}
                  onPress={handleGoogleAuth}
                  disabled={loading}
                >
                  <Text style={styles.googleButtonText}>Sign Up with Google</Text>
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Form Inputs */}
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  placeholderTextColor="#999"
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    setError('');
                  }}
                  autoCapitalize="words"
                  editable={!loading}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Email Address"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setError('');
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                  editable={!loading}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Password (min. 6 characters)"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setError('');
                  }}
                  secureTextEntry
                  autoComplete="password"
                  editable={!loading}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
                  placeholderTextColor="#999"
                  value={passwordConfirm}
                  onChangeText={(text) => {
                    setPasswordConfirm(text);
                    setError('');
                  }}
                  secureTextEntry
                  autoComplete="password"
                  editable={!loading}
                />

                {/* Terms Checkbox */}
                <View style={styles.termsContainer}>
                  <TouchableOpacity
                    style={[
                      styles.checkbox,
                      agreeToTerms && styles.checkboxChecked
                    ]}
                    onPress={() => setAgreeToTerms(!agreeToTerms)}
                    disabled={loading}
                  >
                    {agreeToTerms && (
                      <Text style={styles.checkboxText}>✓</Text>
                    )}
                  </TouchableOpacity>
                  <Text style={styles.termsText}>
                    I agree to the{' '}
                    <Text 
                      style={styles.termsLink}
                      onPress={handleTermsPress}
                    >
                      Terms & Conditions
                    </Text>
                  </Text>
                </View>

                {/* Register Button */}
                <TouchableOpacity
                  style={[
                    styles.registerButton,
                    (loading || !agreeToTerms) && styles.registerButtonDisabled
                  ]}
                  onPress={handleRegister}
                  disabled={loading || !agreeToTerms}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.registerButtonText}>Create Account</Text>
                  )}
                </TouchableOpacity>

                {/* Login Link */}
                <View style={styles.loginLinkContainer}>
                  <Text style={styles.loginText}>
                    Already have an account?
                  </Text>
                  <TouchableOpacity 
                    onPress={() => navigation.navigate('Login')}
                    disabled={loading}
                  >
                    <Text style={styles.loginLinkText}>Sign In</Text>
                  </TouchableOpacity>
                </View>
              </Card.Content>
            </Card>
          </View>

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
      </KeyboardAvoidingView>

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
            <Text style={[styles.navButtonText, styles.activeNavButton]}>Sign Up</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => navigation.navigate('Pricing')}
          >
            <Text style={styles.navIcon}>💰</Text>
            <Text style={styles.navButtonText}>Pricing</Text>
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
    paddingTop: 20,
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
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  backButtonText: {
    color: '#2dc4b6',
    fontWeight: '600',
    fontSize: 14,
  },
  card: {
    elevation: 4,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  cardContent: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginBottom: 24,
  },
  planInfo: {
    backgroundColor: 'rgba(45, 196, 182, 0.1)',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#2dc4b6',
  },
  planLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  planName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2dc4b6',
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    backgroundColor: 'rgba(220, 53, 69, 0.1)',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#dc3545',
  },
  errorText: {
    color: '#721c24',
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 20,
  },
  googleButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#2dc4b6',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  googleButtonText: {
    color: '#2dc4b6',
    fontWeight: '600',
    fontSize: 12,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    color: '#666',
    fontSize: 14,
    marginHorizontal: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#fff',
    fontSize: 14,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: 'transparent',
    borderRadius: 4,
    marginRight: 12,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2dc4b6',
    borderColor: '#2dc4b6',
  },
  checkboxText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  termsText: {
    color: '#666',
    fontSize: 12,
    flex: 1,
    lineHeight: 20,
  },
  termsLink: {
    color: '#2dc4b6',
    fontWeight: '600',
  },
  registerButton: {
    backgroundColor: '#2dc4b6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  registerButtonDisabled: {
    backgroundColor: '#ccc',
  },
  registerButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  loginLinkContainer: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  loginText: {
    color: '#666',
    fontSize: 12,
    marginBottom: 8,
  },
  loginLinkText: {
    color: '#2dc4b6',
    fontWeight: '600',
    fontSize: 14,
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
    paddingVertical: 10,
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
    marginBottom: 4, // Space between icon and text
  },
});