import { createDrawerNavigator } from '@react-navigation/drawer';
import ProfileScreen from '../screens/main/ProfileScreen';
import BillingScreen from '../screens/BillingScreen';
import MainTabNavigator from './MainNavigator'; // renamed Tab navigator

const Drawer = createDrawerNavigator();

export default function AppDrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        drawerActiveTintColor: '#2dc4b6',
        drawerLabelStyle: { fontSize: 16 },
      }}
    >
      {/* Main app tabs */}
      <Drawer.Screen
        name="HomeTabs"
        component={MainTabNavigator}
        options={{ headerShown: false, title: 'Home' }}
      />

      {/* Drawer-only screens */}
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile & Settings' }}
      />
      <Drawer.Screen
        name="Billing"
        component={BillingScreen}
        options={{ title: 'Billing & Subscription' }}
      />
      {/* Add a Logout screen if needed */}
    </Drawer.Navigator>
  );
}
