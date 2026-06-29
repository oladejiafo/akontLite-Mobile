// components/AppHeader.tsx
import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Alert } from 'react-native';
import { Menu, Button } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

const AppHeader = () => {
    const { user, logout } = useAuth();
    const navigation = useNavigation() as any; // SIMPLE FIX - use 'any' type
    const [menuVisible, setMenuVisible] = useState(false);

    const handleLogout = () => {
        Alert.alert(
          "Logout",
          "Are you sure you want to logout?",
          [
            { text: "Cancel", style: "cancel" },
            { 
              text: "Logout", 
              style: "destructive",
              onPress: logout
            },
          ]
        );
        setMenuVisible(false);
      };
    
      const handleProfile = () => {
        navigation.navigate('Profile');
        setMenuVisible(false);
      };
    
      const handleBilling = () => {
        navigation.navigate('Billing');
        setMenuVisible(false);
      };
    
  return (
    <View style={styles.container}>
      {/* Logo and App Name */}
      <View style={styles.logoContainer}>
        <Image 
          source={require('../../assets/logo-trans.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>AkontLite</Text>
      </View>

      {/* User Menu */}
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
            <Button
            mode="text"
            onPress={() => setMenuVisible(true)}
            style={styles.userButton}
            icon="menu" // Hamburger icon
            textColor="#fff"
            contentStyle={styles.buttonContent} 
            >
            {""}
            </Button>
        }
        contentStyle={styles.menuContent}
        >
        <Menu.Item 
          onPress={handleProfile}
          title="Profile & Settings"
          leadingIcon="cog"
        />
        <Menu.Item 
          onPress={handleBilling}
          title="Billing & Subscription" 
          leadingIcon="credit-card"
        />
        <Menu.Item 
          onPress={handleLogout}
          title="Logout"
          leadingIcon="logout"
          titleStyle={{ color: '#dc3545' }}
        />
      </Menu>
    </View>
  );
};


const styles = StyleSheet.create({
    container: {
        height: 70,
        backgroundColor: '#2dc4b6',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingTop:30
      },
      logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      logo: {
        width: 40,
        height: 40,
        resizeMode: 'contain',
        marginRight: 10,
      },
      title: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
      },

      menuContent: {
        marginTop: 50,
        backgroundColor: '#fff',
      },
      userButton: {
        margin: 0,
        padding: 10, 
        paddingRight: 4,
        minWidth: 50,
        minHeight: 50, 
      },
      buttonContent: {
        paddingHorizontal: 8, 
        paddingVertical: 8, 
      },

});

export default AppHeader;

