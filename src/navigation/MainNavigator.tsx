import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import DashboardScreen from "../screens/main/DashboardScreen";
import InvoicesScreen from "../screens/main/InvoicesScreen";
import ClientsScreen from "../screens/main/ClientsScreen";
import ClientDetailsScreen from "../screens/main/ClientDetailsScreen";
import PaymentsScreen from "../screens/main/PaymentsScreen";
import ProfileScreen from "../screens/main/ProfileScreen";
import CreateInvoiceScreen from "../screens/CreateInvoiceScreen";
import PricingScreen from "../screens/PricingScreen";
import InvoiceDetailsScreen from "../screens/main/InvoiceDetailsScreen";
import EditInvoiceScreen from "../screens/EditInvoiceScreen";
import BillingScreen from "../screens/BillingScreen";
import RemindersScreen from "../screens/RemindersScreen";
import SubscriptionSuccessScreen from "../screens/SubscriptionSuccessScreen";
import SubscriptionCancelScreen from "../screens/SubscriptionCancelScreen";

import AppHeader from "./AppHeader";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Dashboard Stack Navigator
function DashboardStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="DashboardMain"
        component={DashboardScreen}
        options={{
          title: "Dashboard",
          headerStyle: {
            backgroundColor: "#2dc4b6",
          },
          headerTitleStyle: {
            fontSize: 16,
            fontWeight: "600",
          },
          headerTintColor: "#fff",
        }}
      />

    </Stack.Navigator>
  );
}

// Invoices Stack Navigator
function InvoicesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="InvoicesList"
        component={InvoicesScreen}
        options={{
          title: "Invoices",
          headerStyle: {
            backgroundColor: "#2dc4b6",
          },
          headerTitleStyle: {
            fontSize: 16,
            fontWeight: "600",
          },
          headerTintColor: "#fff",
        }}
      />
      <Stack.Screen
        name="CreateInvoice"
        component={CreateInvoiceScreen}
        options={{
          title: "Create Invoice",
          headerStyle: {
            backgroundColor: "#2dc4b6",
          },
          headerTitleStyle: {
            fontSize: 16,
            fontWeight: "600",
          },
          headerTintColor: "#fff",
        }}
      />
      <Stack.Screen
        name="EditInvoice"
        component={EditInvoiceScreen}
        options={{ 
            title: "Edit Invoice",
            headerStyle: {
                backgroundColor: '#2dc4b6',
              },
              headerTitleStyle: {
                fontSize: 16,  
                fontWeight: '600',
              },
              headerTintColor: '#fff',
        }}
      />
      <Stack.Screen
        name="InvoiceDetails"
        component={InvoiceDetailsScreen} // You need to create this component
        options={{
          title: "Invoice Details",
          headerStyle: {
            backgroundColor: '#2dc4b6',
          },
          headerTitleStyle: {
            fontSize: 16,  
            fontWeight: '600',
          },
          headerTintColor: '#fff',
        }}
      />
    </Stack.Navigator>
  );
}

// Clients Stack Navigator
function ClientsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ClientsList"
        component={ClientsScreen}
        options={{
          title: "Clients",
          headerStyle: {
            backgroundColor: '#2dc4b6',
          },
          headerTitleStyle: {
            fontSize: 16,  
            fontWeight: '600',
          },
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen
        name="ClientDetails"
        component={ClientDetailsScreen}
        options={{
          title: "Client Details",
          headerStyle: {
            backgroundColor: '#2dc4b6',
          },
          headerTitleStyle: {
            fontSize: 16,  
            fontWeight: '600',
          },
          headerTintColor: '#fff',
        }}
      />
    </Stack.Navigator>
  );
}

// Payments Stack Navigator
function PaymentsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="PaymentsMain"
        component={PaymentsScreen}
        options={{
          title: "Payments",
          headerStyle: {
            backgroundColor: '#2dc4b6',
          },
          headerTitleStyle: {
            fontSize: 16,  
            fontWeight: '600',
          },
          headerTintColor: '#fff',
        }}
      />
    </Stack.Navigator>
  );
}

// Profile Stack Navigator (includes Pricing)
function ProfileStack() {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name="ProfileMain"
          component={ProfileScreen}
          options={{
            title: "Profile & Settings",
            headerStyle: {
              backgroundColor: '#2dc4b6',
            },
            headerTitleStyle: {
              fontSize: 16,  
              fontWeight: '600',
            },
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen
          name="Billing"
          component={BillingScreen}
          options={{ 
              title: "Billing & Subscription",
              headerStyle: {
                  backgroundColor: '#2dc4b6',
                },
                headerTitleStyle: {
                  fontSize: 16,  
                  fontWeight: '600',
                },
                headerTintColor: '#fff',
          }}
        />
        <Stack.Screen
          name="Pricing"
          component={PricingScreen}
          options={{
            title: "Upgrade Plan",
            headerStyle: {
              backgroundColor: '#2dc4b6',
            },
            headerTitleStyle: {
              fontSize: 16,  
              fontWeight: '600',
            },
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen
          name="Reminders"
          component={RemindersScreen}
          options={{ 
              title: "Auto Reminders",
              headerStyle: {
                  backgroundColor: '#2dc4b6',
                },
                headerTitleStyle: {
                  fontSize: 16,  
                  fontWeight: '600',
                },
                headerTintColor: '#fff',
          }}
        />
        <Stack.Screen
          name="SubscriptionCancel"
          component={SubscriptionCancelScreen}
          options={{ 
              title: "Subscription Cancelled",
              headerStyle: {
                  backgroundColor: '#2dc4b6',
                },
                headerTitleStyle: {
                  fontSize: 16,  
                  fontWeight: '600',
                },
                headerTintColor: '#fff',
          }}
        />
        <Stack.Screen
          name="SubscriptionSuccess"
          component={SubscriptionSuccessScreen}
          options={{ 
              title: "Subscription Success",
              headerStyle: {
                  backgroundColor: '#2dc4b6',
                },
                headerTitleStyle: {
                  fontSize: 16,  
                  fontWeight: '600',
                },
                headerTintColor: '#fff',
          }}
        />
      </Stack.Navigator>
    );
  }
  
  // Reminders Stack Navigator
  function RemindersStack() {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name="RemindersMain"
          component={RemindersScreen}
          options={{
            title: "Reminders",
            headerStyle: {
              backgroundColor: '#2dc4b6',
            },
            headerTitleStyle: {
              fontSize: 16,  
              fontWeight: '600',
            },
            headerTintColor: '#fff',
          }}
        />
      </Stack.Navigator>
    );
  }

export default function MainNavigator() {
  return (
    <>
      {/* Add your custom app header at the top */}
      <AppHeader />

      {/* Keep your existing tab navigator unchanged */}
      <Tab.Navigator
        screenOptions={({ route }) => ({
            
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            if (route.name === "Dashboard") {
              iconName = focused ? "speedometer" : "speedometer-outline";
            } else if (route.name === "Invoices") {
              iconName = focused ? "document-text" : "document-text-outline";
            } else if (route.name === "Clients") {
              iconName = focused ? "people" : "people-outline";
            } else if (route.name === "Payments") {
              iconName = focused ? "card" : "card-outline";
            } else if (route.name === "Profile") {
              iconName = focused ? "person" : "person-outline";
            } else if (route.name === "Reminder") {
                iconName = focused ? "notifications" : "notifications-outline";
            } else {
              iconName = "help-outline";
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "#2dc4b6",
          tabBarInactiveTintColor: "gray",
          tabBarStyle: {
            backgroundColor: "#fff",
            borderTopWidth: 1,
            borderTopColor: "#f0f0f0",
            paddingBottom: 24, 
            
            paddingTop: 8,
            height: 120, 
          },
          tabBarLabelStyle: {
            fontSize: 7, 
            fontWeight: '500',
          },
          headerShown: false, 
        })}
      >
        <Tab.Screen
          name="Dashboard"
          component={DashboardStack}
          options={{ title: "Dashboard" }}
        />
        <Tab.Screen
          name="Invoices"
          component={InvoicesStack}
          options={{ title: "Invoices" }}
        />
        <Tab.Screen
          name="Clients"
          component={ClientsStack}
          options={{ title: "Clients" }}
        />
        <Tab.Screen
          name="Payments"
          component={PaymentsStack}
          options={{ title: "Payments" }}
        />
        <Tab.Screen
          name="Reminders"
          component={RemindersStack}
          options={{ title: "Reminders" }}
        />

      </Tab.Navigator>
    </>
  );
}
