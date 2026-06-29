import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Card, Button } from "react-native-paper";
import { useAuth } from "../../context/AuthContext";
import { dashboardAPI, invoiceAPI, companyAPI } from "../../services/api"; // Import correct APIs
import { DashboardStats, Invoice } from "../../types";
import StatCard from "../../components/StatCard";
// import InvoiceCard from '../../components/InvoiceCard';

export default function DashboardScreen() {
  const { user, subscription } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, invoicesRes, companyRes] = await Promise.all([
        dashboardAPI.getStats(),
        invoiceAPI.getInvoices({ limit: 5 }), // Use invoiceAPI instead of dashboardAPI
        companyAPI.getCompany(), // Use companyAPI instead of dashboardAPI
      ]);

      setStats(statsRes.data);
      setRecentInvoices(invoicesRes.data.data || []);
      setCompany(companyRes.data);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      Alert.alert("Error", "Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const getCurrencySymbol = (currency: string) => {
    const symbols: { [key: string]: string } = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      NGN: "₦",
      GHS: "GH₵",
      KES: "KSh",
      ZAR: "R",
      AED: "AED",
      SAR: "ر.س",
    };
    return symbols[currency?.toUpperCase()] || "$";
  };

  const formatCurrency = (amount: number) => {
    const currency = company?.currency || "USD";
    const symbol = getCurrencySymbol(currency);
    return `${symbol}${amount?.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Temporary InvoiceCard component since it's commented out
  const InvoiceCard = ({ invoice }: { invoice: Invoice }) => (
    <Card style={styles.invoiceCard}>
      <Card.Content>
        <View style={styles.invoiceHeader}>
          <Text style={styles.invoiceNumber}>{invoice.invoice_no}</Text>
          <Text style={styles.invoiceAmount}>
            {formatCurrency(invoice.total || 0)}
          </Text>
        </View>
        <Text style={styles.clientName}>{invoice.client?.name || "N/A"}</Text>
        <View style={styles.invoiceFooter}>
          <Text style={styles.dueDate}>
            Due: {new Date(invoice.due_date).toLocaleDateString()}
          </Text>
          <View
            style={[
              styles.statusBadge,
              invoice.status === "paid" && styles.statusPaid,
              invoice.status === "overdue" && styles.statusOverdue,
              invoice.status === "sent" && styles.statusSent,
            ]}
          >
            <Text style={styles.statusText}>
              {invoice.status === "paid"
                ? "Paid"
                : invoice.status === "overdue"
                ? "Overdue"
                : invoice.status === "sent"
                ? "Outstanding"
                : "Draft"}
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2dc4b6" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Welcome Header */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back, {user?.name}!</Text>
        <Text style={styles.subtitle}>
          Here's your business overview
          {company?.currency &&
            ` • Currency: ${getCurrencySymbol(company.currency)} ${
              company.currency
            }`}
        </Text>
        {subscription && (
          <View style={styles.subscriptionBadge}>
            <Text style={styles.subscriptionText}>
              {subscription.plan?.name || "Free"} Plan
            </Text>
          </View>
        )}
      </View>

      {/* Key Metrics */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.metricsScroll}
      >
        <View style={styles.metricsContainer}>
          <StatCard
            title="Total Invoices"
            value={stats?.totalInvoices?.toString() || "0"}
            color="#2dc4b6"
            icon="document-text"
          />
          <StatCard
            title="Total Paid"
            value={formatCurrency(stats?.paid || 0)}
            color="#28a745"
            icon="card"
          />
          <StatCard
            title="Outstanding"
            value={formatCurrency(stats?.outstanding || 0)}
            color="#ffc107"
            icon="time"
          />
          <StatCard
            title="Overdue"
            value={formatCurrency(stats?.overdue || 0)}
            color="#dc3545"
            icon="warning"
          />
        </View>
      </ScrollView>

      {/* Additional Stats */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Business Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Clients</Text>
              <Text style={styles.statValue}>{stats?.totalClients || 0}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Draft Invoices</Text>
              <Text style={styles.statValue}>{stats?.draftInvoices || 0}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Avg. Days Late</Text>
              <Text
                style={[
                  styles.statValue,
                  (stats?.averageDaysLate || 0) > 7
                    ? styles.dangerText
                    : styles.warningText,
                ]}
              >
                {stats?.averageDaysLate || 0} days
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Recovery Rate</Text>
              <Text style={[styles.statValue, styles.primaryText]}>
                {stats?.recoveryRate || 0}%
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Quick Actions */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          <View style={styles.actionsContainer}>
            <Button
              mode="contained"
              onPress={() => {}}
              style={styles.primaryButton}
              //   contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
              icon="plus"
            >
              Create Invoice
            </Button>
            <Button
              mode="outlined"
              onPress={() => {}}
              style={styles.secondaryButton}
              //   contentStyle={styles.buttonContent}
              labelStyle={styles.secondaryButtonLabel}
              icon="account-multiple"
            >
              Manage Clients
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Recent Invoices */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Text style={styles.cardTitle}>Recent Invoices</Text>
            <Button
              mode="text"
              onPress={() => {}}
              style={styles.textButton}
              labelStyle={styles.textButtonLabel}
            >
              View All
            </Button>
          </View>

          {recentInvoices.length > 0 ? (
            recentInvoices.map((invoice) => (
              <InvoiceCard key={invoice.id} invoice={invoice} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No invoices yet</Text>
              <Button mode="contained" onPress={() => {}}>
                Create Your First Invoice
              </Button>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Performance Tips */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Performance Tips</Text>

          {stats?.outstanding && stats.outstanding > 0 && (
            <View style={[styles.tip, styles.warningTip]}>
              <View style={styles.tipHeader}>
                <Text style={styles.tipTitle}>
                  💰 Collect Outstanding Payments
                </Text>
              </View>

              <Text style={styles.tipText}>
                You have <Text>{formatCurrency(stats.outstanding)}</Text> in
                outstanding invoices. Consider sending payment reminders.
              </Text>
            </View>
          )}

          {stats?.overdue && stats.overdue > 0 && (
            <View style={[styles.tip, styles.dangerTip]}>
              <View style={styles.tipHeader}>
                <Text style={styles.tipTitle}>⚠️ Overdue Invoices</Text>
              </View>

              <Text style={styles.tipText}>
                You have {formatCurrency(stats.overdue)} in overdue payments. Follow up with clients immediately.
              </Text>

            </View>
          )}

          {(!stats?.totalClients || stats.totalClients === 0) && (
            <View style={[styles.tip, styles.infoTip]}>
              <View style={styles.tipHeader}>
                <Text style={styles.tipTitle}>👥 Add Your First Client</Text>
              </View>

              <Text style={styles.tipText}>
                Start by adding clients to create invoices and track payments.
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2dc4b6",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  subscriptionBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#ff8f00",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  subscriptionText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  metricsScroll: {
    marginVertical: 8,
  },
  metricsContainer: {
    flexDirection: "row",
    paddingHorizontal: 8,
  },
  card: {
    margin: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2dc4b6",
    marginBottom: 12,
  },
  tipHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 8, // Space between emoji and text
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statItem: {
    width: "48%",
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "bold",
  },
  primaryText: {
    color: "#2dc4b6",
  },
  warningText: {
    color: "#ffc107",
  },
  dangerText: {
    color: "#dc3545",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  // Button Styles
  primaryButton: {
    backgroundColor: "#2dc4b6", // Your primary teal color
    borderColor: "#2dc4b6",
    borderRadius: 10,
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderColor: "#2dc4b6", // Teal border for outlined button
    borderRadius: 10,
    borderWidth: 1,
  },
  textButton: {
    backgroundColor: "transparent",
  },
  buttonContent: {
    paddingVertical: 8,
    height: 44,
  },
  buttonLabel: {
    color: "#ffffff", // White text for contained button
    fontSize: 14,
    fontWeight: "600",
  },
  secondaryButtonLabel: {
    color: "#2dc4b6", // Teal text for outlined button
    fontSize: 14,
    fontWeight: "600",
  },
  textButtonLabel: {
    color: "#2dc4b6", // Teal text for text button
    fontSize: 14,
    fontWeight: "600",
  },

  // Update actions container for better spacing
  actionsContainer: {
    flexDirection: "column",
    gap: 12, // Increased gap for better spacing
  },
  actionButton: {
    width: "100%",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 20,
  },
  emptyText: {
    color: "#666",
    marginBottom: 12,
  },
  tip: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  warningTip: {
    backgroundColor: "#fff3cd",
    borderLeftWidth: 4,
    borderLeftColor: "#ffc107",
  },
  dangerTip: {
    backgroundColor: "#f8d7da",
    borderLeftWidth: 4,
    borderLeftColor: "#dc3545",
  },
  infoTip: {
    backgroundColor: "#d1ecf1",
    borderLeftWidth: 4,
    borderLeftColor: "#17a2b8",
  },
  tipTitle: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  tipText: {
    fontSize: 12,
    lineHeight: 16,
  },
  // Temporary InvoiceCard styles
  invoiceCard: {
    marginBottom: 8,
    elevation: 1,
  },
  invoiceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  invoiceNumber: {
    fontWeight: "bold",
    fontSize: 12,
    color: "#333",
  },
  invoiceAmount: {
    fontWeight: "bold",
    fontSize: 12,
    color: "#2dc4b6",
  },
  clientName: {
    color: "#666",
    marginBottom: 8,
  },
  invoiceFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dueDate: {
    fontSize: 12,
    color: "#666",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: "#6c757d",
  },
  statusPaid: {
    backgroundColor: "#28a745",
  },
  statusOverdue: {
    backgroundColor: "#dc3545",
  },
  statusSent: {
    backgroundColor: "#ffc107",
  },
  statusText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
});
