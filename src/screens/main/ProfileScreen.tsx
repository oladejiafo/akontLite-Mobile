import React, { useState, useEffect, useContext } from "react";
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Alert,
  Switch,
} from "react-native";
import {
  Card,
  Button,
  TextInput as PaperInput,
  Divider,
  List,
} from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useAuth } from "../../context/AuthContext";
import { companyAPI } from "../../services/api";
import { profileAPI } from "../../services/api";
import BillingScreen from "../BillingScreen";

export type RootStackParamList = {
  Pricing: undefined;
  Billing: undefined;
};

export default function ProfileScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { user, logout, subscription } = useAuth();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: ""
  });

  // Company form state
  const [companyForm, setCompanyForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "",
    postal_code: "",
    website: "",
    tax_id: "",
    currency: "USD",
    tax_enabled: false,
    tax_rate: 0,
    tax_name: "VAT",
    tax_inclusive: false,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch user profile
      if (user) {
        setProfileForm({
          name: user.name || "",
          email: user.email || "",
        });
      }

      // Fetch company data
      const companyResponse = await companyAPI.getCompany();
      const companyData = companyResponse.data;
      setCompany(companyData);
      
      setCompanyForm({
        name: companyData.name || "",
        email: companyData.email || "",
        phone: companyData.phone || "",
        address: companyData.address || "",
        city: companyData.city || "",
        state: companyData.state || "",
        country: companyData.country || "",
        postal_code: companyData.postal_code || "",
        website: companyData.website || "",
        tax_id: companyData.tax_id || "",
        currency: companyData.currency || "USD",
        tax_enabled: companyData.tax_enabled || false,
        tax_rate: companyData.tax_rate || 0,
        tax_name: companyData.tax_name || "VAT",
        tax_inclusive: companyData.tax_inclusive || false,
      });
    } catch (error) {
      console.error("Failed to fetch data:", error);
      Alert.alert("Error", "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      setSaving(true);
      await profileAPI.updateProfile(profileForm); // Use profileAPI here
      Alert.alert("Success", "Profile updated successfully");
    } catch (error) {
      console.error("Failed to update profile:", error);
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };


  const handlePasswordChange = async () => {
    try {
      setSaving(true);
      // Note: You'll need to add changePassword to profileAPI or use a different endpoint
      await profileAPI.updateProfile({ 
        ...profileForm, 
        ...passwordForm 
      }); // Adjust based on your API
      Alert.alert("Success", "Password updated successfully");
      setPasswordForm({
        current_password: "",
        new_password: "",
        new_password_confirmation: ""
      });
    } catch (error) {
      console.error("Failed to change password:", error);
      Alert.alert("Error", "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  const handleCompanyUpdate = async () => {
    try {
      setSaving(true);
      await companyAPI.updateCompany(companyForm);
      Alert.alert("Success", "Company information updated successfully");
      fetchData();
    } catch (error) {
      console.error("Failed to update company:", error);
      Alert.alert("Error", "Failed to update company information");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await profileAPI.deleteAccount(); // Use profileAPI here
              logout();
            } catch (error) {
              Alert.alert("Error", "Failed to delete account");
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: logout },
    ]);
  };

  const getPlanName = () => {
    if (!subscription) return "Free Plan";
    return subscription.plan?.name || "Free Plan";
  };

  const getPlanPrice = () => {
    if (!subscription || !subscription.plan) return "Free";
    return subscription.plan.price === 0 ? "Free" : `$${subscription.plan.price}/month`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile & Settings</Text>
          <Text style={styles.subtitle}>Manage your account and company information</Text>
        </View>

        {/* Tabs */}
        <Card style={styles.tabsCard}>
          <Card.Content>
            <View style={styles.tabsContainer}>
              <Button
                mode={activeTab === "profile" ? "contained" : "outlined"}
                onPress={() => setActiveTab("profile")}
                style={styles.tabButton}
                compact
              >
                Profile
              </Button>
              <Button
                mode={activeTab === "company" ? "contained" : "outlined"}
                onPress={() => setActiveTab("company")}
                style={styles.tabButton}
                compact
              >
                Company
              </Button>
              <Button
                mode={activeTab === "billing" ? "contained" : "outlined"}
                onPress={() => setActiveTab("billing")}
                style={styles.tabButton}
                compact
              >
                Billing
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <Card style={styles.contentCard}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Personal Information</Text>

              <View style={styles.userInfo}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {user?.name?.split(" ").map(n => n[0]).join("").toUpperCase()}
                  </Text>
                </View>
                <View style={styles.userDetails}>
                  <Text style={styles.userName}>{user?.name}</Text>
                  <Text style={styles.userEmail}>{user?.email}</Text>
                  <Text style={styles.userPlan}>{getPlanName()} • {getPlanPrice()}</Text>
                </View>
              </View>

              <Divider style={styles.divider} />

              {/* Profile Form */}
              <PaperInput
                label="Full Name"
                value={profileForm.name}
                onChangeText={(value) => setProfileForm({ ...profileForm, name: value })}
                style={styles.input}
                mode="outlined"
              />

              <PaperInput
                label="Email"
                value={profileForm.email}
                onChangeText={(value) => setProfileForm({ ...profileForm, email: value })}
                style={styles.input}
                mode="outlined"
                keyboardType="email-address"
              />

              <Button
                mode="contained"
                onPress={handleProfileUpdate}
                loading={saving}
                style={styles.saveButton}
              >
                Update Profile
              </Button>

              <Divider style={styles.divider} />

              {/* Change Password */}
              <Text style={styles.sectionSubtitle}>Change Password</Text>

              <PaperInput
                label="Current Password"
                value={passwordForm.current_password}
                onChangeText={(value) => setPasswordForm({ ...passwordForm, current_password: value })}
                style={styles.input}
                mode="outlined"
                secureTextEntry
              />

              <PaperInput
                label="New Password"
                value={passwordForm.new_password}
                onChangeText={(value) => setPasswordForm({ ...passwordForm, new_password: value })}
                style={styles.input}
                mode="outlined"
                secureTextEntry
              />

              <PaperInput
                label="Confirm New Password"
                value={passwordForm.new_password_confirmation}
                onChangeText={(value) => setPasswordForm({ ...passwordForm, new_password_confirmation: value })}
                style={styles.input}
                mode="outlined"
                secureTextEntry
              />

              <Button
                mode="outlined"
                onPress={handlePasswordChange}
                loading={saving}
                style={styles.passwordButton}
              >
                Change Password
              </Button>

              <Divider style={styles.divider} />

              {/* Account Actions */}
              <Button
                mode="outlined"
                onPress={handleLogout}
                style={styles.logoutButton}
                textColor="#dc3545"
                icon="logout"
              >
                Logout
              </Button>

              <Button
                mode="outlined"
                onPress={handleDeleteAccount}
                style={styles.dangerButton}
                textColor="#dc3545"
                icon="delete"
              >
                Delete Account
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* COMPANY TAB */}
        {activeTab === "company" && (
          <Card style={styles.contentCard}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Company Information</Text>

              <PaperInput
                label="Company Name"
                value={companyForm.name}
                onChangeText={(value) => setCompanyForm({ ...companyForm, name: value })}
                style={styles.input}
                mode="outlined"
              />

              <PaperInput
                label="Email"
                value={companyForm.email}
                onChangeText={(value) => setCompanyForm({ ...companyForm, email: value })}
                style={styles.input}
                mode="outlined"
                keyboardType="email-address"
              />

              <PaperInput
                label="Phone"
                value={companyForm.phone}
                onChangeText={(value) => setCompanyForm({ ...companyForm, phone: value })}
                style={styles.input}
                mode="outlined"
                keyboardType="phone-pad"
              />

              <PaperInput
                label="Address"
                value={companyForm.address}
                onChangeText={(value) => setCompanyForm({ ...companyForm, address: value })}
                style={styles.input}
                mode="outlined"
                multiline
              />

              <PaperInput
                label="City"
                value={companyForm.city}
                onChangeText={(value) => setCompanyForm({ ...companyForm, city: value })}
                style={styles.input}
                mode="outlined"
              />

              <PaperInput
                label="State/Province"
                value={companyForm.state}
                onChangeText={(value) => setCompanyForm({ ...companyForm, state: value })}
                style={styles.input}
                mode="outlined"
              />

              <PaperInput
                label="Country"
                value={companyForm.country}
                onChangeText={(value) => setCompanyForm({ ...companyForm, country: value })}
                style={styles.input}
                mode="outlined"
              />

              <PaperInput
                label="Postal Code"
                value={companyForm.postal_code}
                onChangeText={(value) => setCompanyForm({ ...companyForm, postal_code: value })}
                style={styles.input}
                mode="outlined"
              />

              <PaperInput
                label="Website"
                value={companyForm.website}
                onChangeText={(value) => setCompanyForm({ ...companyForm, website: value })}
                style={styles.input}
                mode="outlined"
                keyboardType="url"
              />

              <PaperInput
                label="Tax ID"
                value={companyForm.tax_id}
                onChangeText={(value) => setCompanyForm({ ...companyForm, tax_id: value })}
                style={styles.input}
                mode="outlined"
              />

              <PaperInput
                label="Currency"
                value={companyForm.currency}
                onChangeText={(value) => setCompanyForm({ ...companyForm, currency: value })}
                style={styles.input}
                mode="outlined"
              />

              <Divider style={styles.divider} />

              {/* Tax Settings */}
              <Text style={styles.sectionSubtitle}>Tax Settings</Text>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Enable Tax</Text>
                <Switch
                  value={companyForm.tax_enabled}
                  onValueChange={(value) => setCompanyForm({ ...companyForm, tax_enabled: value })}
                />
              </View>

              {companyForm.tax_enabled && (
                <>
                  <PaperInput
                    label="Tax Name"
                    value={companyForm.tax_name}
                    onChangeText={(value) => setCompanyForm({ ...companyForm, tax_name: value })}
                    style={styles.input}
                    mode="outlined"
                  />

                  <PaperInput
                    label="Tax Rate (%)"
                    value={companyForm.tax_rate.toString()}
                    onChangeText={(value) => setCompanyForm({ ...companyForm, tax_rate: Number(value) || 0 })}
                    style={styles.input}
                    mode="outlined"
                    keyboardType="numeric"
                  />

                  <View style={styles.switchRow}>
                    <Text style={styles.switchLabel}>Tax Inclusive Pricing</Text>
                    <Switch
                      value={companyForm.tax_inclusive}
                      onValueChange={(value) => setCompanyForm({ ...companyForm, tax_inclusive: value })}
                    />
                  </View>
                </>
              )}

              <Button
                mode="contained"
                onPress={handleCompanyUpdate}
                loading={saving}
                style={styles.saveButton}
              >
                Save Company Settings
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* BILLING TAB - Keep your existing billing tab content */}
        {activeTab === "billing" && (
          <BillingScreen />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2dc4b6",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  tabsCard: {
    marginBottom: 16,
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  tabButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  contentCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2dc4b6",
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#2dc4b6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  userPlan: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  input: {
    marginBottom: 12,
  },
  divider: {
    marginVertical: 16,
  },
  saveButton: {
    marginTop: 8,
  },
  passwordButton: {
    marginTop: 8,
  },
  logoutButton: {
    marginTop: 8,
    borderColor: "#dc3545",
  },
  dangerButton: {
    marginTop: 8,
    borderColor: "#dc3545",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: "#333",
  },
  placeholderText: {
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
    marginVertical: 20,
  },
});
// Your styles remain the same...
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f5f5f5",
//   },
//   scrollView: {
//     flex: 1,
//     padding: 16,
//   },
//   header: {
//     alignItems: "center",
//     marginBottom: 24,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "#2dc4b6",
//     marginBottom: 8,
//   },
//   subtitle: {
//     fontSize: 16,
//     color: "#666",
//     textAlign: "center",
//   },
//   tabsCard: {
//     marginBottom: 16,
//   },
//   tabsContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },
//   tabButton: {
//     flex: 1,
//     marginHorizontal: 4,
//   },
//   contentCard: {
//     marginBottom: 16,
//     elevation: 2,
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: "#2dc4b6",
//     marginBottom: 16,
//   },
//   sectionSubtitle: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#333",
//     marginBottom: 12,
//   },
//   userInfo: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 16,
//   },
//   avatar: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     backgroundColor: "#2dc4b6",
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 16,
//   },
//   avatarText: {
//     color: "#fff",
//     fontWeight: "bold",
//     fontSize: 18,
//   },
//   userDetails: {
//     flex: 1,
//   },
//   userName: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#333",
//     marginBottom: 4,
//   },
//   userEmail: {
//     fontSize: 14,
//     color: "#666",
//     marginBottom: 4,
//   },
//   userPlan: {
//     fontSize: 12,
//     color: "#888",
//   },
//   divider: {
//     marginVertical: 16,
//   },
//   logoutButton: {
//     marginTop: 16,
//     borderColor: "#dc3545",
//   },
//   input: {
//     marginBottom: 12,
//   },
//   switchRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 16,
//     paddingVertical: 8,
//   },
//   switchLabel: {
//     fontSize: 16,
//     color: "#333",
//   },
//   taxHelpText: {
//     fontSize: 12,
//     color: "#666",
//     fontStyle: "italic",
//     marginBottom: 16,
//   },
//   saveButton: {
//     marginTop: 8,
//   },
//   planCard: {
//     backgroundColor: "#f8f9fa",
//     borderColor: "#e9ecef",
//     borderWidth: 1,
//     marginBottom: 16,
//   },
//   planHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   planName: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#333",
//   },
//   planPrice: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#2dc4b6",
//   },
//   planDetails: {
//     marginBottom: 12,
//   },
//   planDetail: {
//     fontSize: 14,
//     color: "#666",
//     marginBottom: 4,
//   },
//   planStatus: {
//     fontWeight: "bold",
//     color: "#28a745",
//     textTransform: "capitalize",
//   },
//   changePlanButton: {
//     marginTop: 8,
//   },
//   upgradeButton: {
//     marginTop: 16,
//   },
//   placeholderText: {
//     textAlign: "center",
//     color: "#666",
//     fontStyle: "italic",
//     marginVertical: 20,
//   },
// });
