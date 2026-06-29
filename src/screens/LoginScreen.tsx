import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Linking,
  Alert,
  Image
} from 'react-native';
import api,  { setAuthToken } from '../services/api';
import { TextInput, Button, Card } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  Pricing: undefined;
  CreateInvoice: undefined;
};

export default function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

//   const handleLogin = () => {
//     setLoading(true);
//     setTimeout(() => setLoading(false), 1000);
//   };

const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }
  
    setLoading(true);
    
    try {
      console.log('🔄 Attempting login...');
      
      const response = await api.post('/login', {
        email: email.trim(),
        password: password
      });
  
      console.log('✅ Login response:', response.data);
      
      const token = response.data.token;
      await AsyncStorage.setItem('auth_token', token);
      
      // Set auth token in axios
      setAuthToken(token);
      
      // Use the login method from context
      login(token, response.data.user);
      
      navigation.navigate('Home');
      
      Alert.alert('Success', 'Logged in successfully!');
      
    } catch (error: any) {
      console.error('❌ Login failed:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Login failed. Please check your credentials.';
      
      Alert.alert('Login Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    Alert.alert(
      'Google Sign In',
      'Google OAuth is currently available on our web platform. For mobile app, please use email and password login for now.',
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
        <View style={styles.content}>
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>

              <Text style={styles.title}>Sign In</Text>
              <Text style={styles.subtitle}>Access your account</Text>

              {/* Google Auth Button */}
              <TouchableOpacity
                style={styles.googleButton}
                onPress={handleGoogleAuth}
                disabled={loading}
              >
                <Text style={styles.googleIcon}>🔗</Text>
                <Text style={styles.googleButtonText}>Sign In with Google</Text>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>
              
              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                style={styles.input}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              
              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                style={styles.input}
                secureTextEntry
              />
              
              <Button 
                mode="contained" 
                onPress={handleLogin}
                loading={loading}
                style={styles.loginButton}
                labelStyle={styles.buttonLabel}
              >
                Sign In
              </Button>
              
              <TouchableOpacity 
                style={styles.registerLink}
                onPress={() => navigation.navigate('Register')}
              >
                <Text style={styles.registerText}>
                  Don't have an account? <Text style={styles.registerLinkText}>Sign up</Text>
                </Text>
              </TouchableOpacity>
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
            <Text style={[styles.navButtonText, styles.activeNavButton]}>Sign In</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.navIcon}>👤</Text>
            <Text style={styles.navButtonText}>Sign Up</Text>
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
    paddingTop: 18,
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
    paddingTop: 40,
    justifyContent: 'center',
  },
  card: {
    elevation: 4,
    backgroundColor: '#fff',
  },
  cardContent: {
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'center',
    color: '#666',
    marginBottom: 24,
  },
  googleButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#2dc4b6',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  googleButtonText: {
    color: '#2dc4b6',
    fontWeight: '600',
    fontSize: 14,
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
    fontSize: 12,
    marginHorizontal: 10,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  loginButton: {
    backgroundColor: '#2dc4b6',
    paddingVertical: 6,
    marginTop: 8,
    marginBottom: 24,
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  registerLink: {
    alignItems: 'center',
  },
  registerText: {
    fontSize: 12,
    color: '#666',
  },
  registerLinkText: {
    color: '#2dc4b6',
    fontWeight: '600',
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