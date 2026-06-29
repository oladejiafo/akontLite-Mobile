import React from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  SafeAreaView,
  StatusBar,
  Image
} from 'react-native';
import { Card, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type AuthStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  CreateInvoice: undefined;
  Pricing: undefined;
};

type HomeScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const features = [
    {
      title: 'Quick Invoice Creation',
      description: 'Create professional invoices in under 2 minutes with our intuitive form builder.',
      icon: '📝',
    },
    {
      title: 'PDF Export',
      description: 'Download ready-to-send PDF invoices instantly.',
      icon: '📄',
    },
    {
      title: 'Payment Links',
      description: 'Add secure payment links via Stripe, PayStack, or Flutterwave for instant payments.',
      icon: '🔗',
    },
    {
      title: 'No Signup Mode',
      description: 'Send one-off invoices without creating an account.',
      icon: '👤',
    },
    {
      title: 'Automated Payment Chaser',
      description: 'Automatically remind clients when payments are overdue.',
      icon: '⚡',
    },
    {
      title: 'Pro Features',
      description: 'Client management, recurring invoices, and automated follow-ups.',
      icon: '🚀',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      
      {/* Header with Logo */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
            <Image 
                source={require('../../assets/logo.png')} 
                style={styles.logoImage}
                resizeMode="contain"
            />
          <Text style={styles.logoText}>AkɔntLite</Text>
          <Text style={styles.tagline}>Professional Invoicing</Text>
        </View>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>⚡ No signup required for basic use</Text>
          </View> 
          
          <Text style={styles.heroTitle}>
            Professional Invoices & Payments
            {'\n'}
            <Text style={styles.heroTitlePrimary}>In Minutes</Text>
          </Text>

          <Text style={styles.heroDescription}>
            A lean invoicing and payments app for freelancers and micro-SMEs. 
            Issue invoices, accept payments, and automatically chase late payers.
          </Text>

          <View style={styles.heroButtons}>
            <Button 
              mode="contained" 
              onPress={() => navigation.navigate('CreateInvoice')}
              style={styles.primaryButton}
              labelStyle={styles.buttonLabel}
            >
              Start Creating Invoice
            </Button>
            <Button 
              mode="outlined" 
              onPress={() => Linking.openURL('https://example.com/demo')}
              style={styles.secondaryButton}
              labelStyle={styles.secondaryButtonLabel}
            >
              Watch Demo
            </Button>
          </View>
        </View>

        {/* Features Grid */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Everything You Need</Text>
          <Text style={styles.sectionSubtitle}>
            Powerful features for invoicing and payment management
          </Text>

          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <Card key={index} style={styles.featureCard}>
                <Card.Content style={styles.featureContent}>
                  <Text style={styles.featureIcon}>{feature.icon}</Text>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </Card.Content>
              </Card>
            ))}
          </View>
        </View>

        {/* CTA Section */}
        <Card style={styles.ctaCard}>
          <Card.Content style={styles.ctaContent}>
            <Text style={styles.ctaTitle}>Ready to Get Paid Faster?</Text>
            <Text style={styles.ctaDescription}>
              Join freelancers and micro-SMEs using AkɔntLite to streamline invoicing and payment collection.
            </Text>
            <Button 
              mode="contained" 
              onPress={() => navigation.navigate('CreateInvoice')}
              style={styles.ctaButton}
              labelStyle={styles.ctaButtonLabel}
            >
              Create Your First Invoice Now
            </Button>
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

            <Text style={[styles.navButtonText, styles.activeNavButton]}>Home</Text>
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
    paddingTop: 32,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  badge: {
    backgroundColor: 'rgba(255, 143, 0, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
  },
  badgeText: {
    color: '#ff8f00',
    fontSize: 12,
    fontWeight: '500',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 34,
    color: '#333',
  },
  heroTitlePrimary: {
    color: '#2dc4b6',
  },
  heroDescription: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    lineHeight: 24,
    marginBottom: 32,
    maxWidth: 400,
  },
  heroButtons: {
    width: '100%',
    maxWidth: 300,
    gap: 12,
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#2dc4b6',
    paddingVertical: 8,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 143, 0, 0.1)',
    borderColor: '#ff8f00'
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButtonLabel: {
    color: '#ff8f00',
    fontSize: 14,
    fontWeight: '600',
  },
  featuresSection: {
    padding: 24,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  sectionSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginBottom: 32,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    marginBottom: 16,
    elevation: 2,
    backgroundColor: '#fff',
  },
  featureContent: {
    alignItems: 'center',
    padding: 16,
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  featureDescription: {
    fontSize: 12,
    textAlign: 'center',
    color: '#666',
    lineHeight: 16,
  },
  ctaCard: {
    margin: 24,
    backgroundColor: '#f8f9fa',
    borderWidth: 0,
    elevation: 2,
  },
  ctaContent: {
    alignItems: 'center',
    padding: 32,
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
  },
  ctaDescription: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginBottom: 24,
    lineHeight: 24,
  },
  ctaButton: {
    backgroundColor: '#2dc4b6',
    paddingHorizontal: 28,
    paddingVertical: 8,
  },
  ctaButtonLabel: {
    fontSize: 14,
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
  footerText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 16,
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
    paddingBottom: 8, // Extra padding for phone home indicator
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