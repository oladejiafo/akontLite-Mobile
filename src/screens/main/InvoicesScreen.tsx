import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Alert,
  ActionSheetIOS,
} from "react-native";
import {
  Card,
  Button,
  TextInput as PaperInput,
  Menu,
  Chip,
} from "react-native-paper";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { invoiceAPI } from "../../services/api";
import { Invoice } from "../../types";

export default function InvoicesScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuVisibleId, setMenuVisibleId] = useState<number | null>(null);

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter, searchQuery]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter !== "all") params.status = statusFilter;
      if (searchQuery) params.search = searchQuery;

      const response = await invoiceAPI.getInvoices(params);
      setInvoices(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
      Alert.alert("Error", "Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvoice = async (invoiceId: number, channel: string) => {
    try {
      await invoiceAPI.sendInvoice(invoiceId, { channel });
      Alert.alert("Success", `Invoice sent via ${channel} successfully!`);
      fetchInvoices();
    } catch (error) {
      console.error("Failed to send invoice:", error);
      Alert.alert("Error", "Failed to send invoice");
    }
  };

  const handleMarkAsPaid = async (invoiceId: number) => {
    try {
      await invoiceAPI.markAsPaid(invoiceId);
      Alert.alert("Success", "Invoice marked as paid!");
      fetchInvoices();
    } catch (error) {
      console.error("Failed to mark as paid:", error);
      Alert.alert("Error", "Failed to mark as paid");
    }
  };

  const handleDownloadPDF = async (invoiceId: number) => {
    try {
      const response = await invoiceAPI.downloadPDF(invoiceId);
      // Handle PDF download - you might need to use a different approach for mobile
      Alert.alert("Success", "PDF download started");
    } catch (error) {
      console.error("Failed to download PDF:", error);
      Alert.alert("Error", "Failed to download PDF");
    }
  };

  const getStatusBadge = (status: string, dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);

    let statusColor = "#6c757d";
    let statusText = "Draft";

    if (status === "paid") {
      statusColor = "#28a745";
      statusText = "Paid";
    } else if (status === "overdue") {
      statusColor = "#dc3545";
      statusText = "Overdue";
    } else if (due < today && status !== "paid") {
      statusColor = "#dc3545";
      statusText = "Overdue";
    } else if (status === "sent") {
      statusColor = "#ffc107";
      statusText = "Outstanding";
    }

    return (
      <Chip
        style={[styles.statusBadge, { backgroundColor: statusColor }]}
        textStyle={styles.statusBadgeText}
      >
        {statusText}
      </Chip>
    );
  };

  const formatCurrency = (amount: number) => {
    return `$${(amount || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.invoice_no?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.client?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.subtitle}>Manage and track your invoices</Text>
        </View>

        {/* Search and Filters */}
        <Card style={styles.filtersCard}>
          <Card.Content>
            <PaperInput
              label="Search invoices..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              mode="outlined"
              left={<PaperInput.Icon icon="magnify" />}
              style={styles.searchInput}
            />

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filtersScroll}
            >
              <View style={styles.filtersContainer}>
                {["all", "draft", "sent", "overdue", "paid"].map((status) => (
                  <Chip
                    key={status}
                    selected={statusFilter === status}
                    onPress={() => setStatusFilter(status)}
                    // style={styles.filterChip}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor:
                          statusFilter === status ? "#2dc4b6" : "#f8f9fa",
                      },
                    ]}
                    textStyle={{
                      color: statusFilter === status ? "#fff" : "#2dc4b6",
                      fontSize: 12,
                    }}
                    mode={statusFilter === status ? "flat" : "outlined"}
                  >
                    {status === "all"
                      ? "All"
                      : status === "sent"
                      ? "Outstanding"
                      : status.charAt(0).toUpperCase() + status.slice(1)}
                  </Chip>
                ))}
              </View>
            </ScrollView>
          </Card.Content>
        </Card>

        {/* Add Invoice Button */}
        <Button
          mode="contained"
          onPress={() => navigation.navigate("CreateInvoice")}
          style={styles.addButton}
          icon="plus"
        >
          New Invoice
        </Button>

        {/* Invoices List */}
        {filteredInvoices.length > 0 ? (
          filteredInvoices.map((invoice) => (
            <Card key={invoice.id} style={styles.invoiceCard}>
              <Card.Content>
                <View style={styles.invoiceHeader}>
                  <View style={styles.invoiceInfo}>
                    <Text style={styles.invoiceNumber}>
                      {invoice.invoice_no}
                    </Text>
                    <Text style={styles.clientName}>
                      {invoice.client?.name || "N/A"}
                    </Text>
                  </View>
                  <Text style={styles.invoiceAmount}>
                    {formatCurrency(invoice.total)}
                  </Text>
                </View>

                <View style={styles.invoiceDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Issue Date:</Text>
                    <Text style={styles.detailValue}>
                      {formatDate(invoice.issue_date)}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Due Date:</Text>
                    <Text style={styles.detailValue}>
                      {formatDate(invoice.due_date)}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Status:</Text>
                    {getStatusBadge(invoice.status, invoice.due_date)}
                  </View>
                </View>

                <View style={styles.invoiceActions}>
                  <Button
                    mode="outlined"
                    onPress={() =>
                      navigation.navigate("InvoiceDetails", {
                        invoiceId: invoice.id,
                      })
                    }
                    style={styles.actionButton}
                    labelStyle={styles.actionButtonLabel}
                    compact
                    icon="eye"
                  >
                    View
                  </Button>

                  <Menu
                    visible={menuVisibleId === invoice.id}
                    onDismiss={() => setMenuVisibleId(null)}
                    anchor={
                      <Button
                        mode="outlined"
                        onPress={() => setMenuVisibleId(invoice.id)}
                        style={styles.actionButton}
                        labelStyle={styles.actionButtonLabel}
                        compact
                        icon="dots-vertical"
                      >
                        More
                      </Button>
                    }
                  >
                    <Menu.Item
                      onPress={() => {
                        setMenuVisibleId(null);
                        handleDownloadPDF(invoice.id);
                      }}
                      title="Download PDF"
                      leadingIcon="download"
                    />
                    <Menu.Item
                      onPress={() => {
                        setMenuVisibleId(null);
                        handleSendInvoice(invoice.id, "email");
                      }}
                      title="Send Email"
                      leadingIcon="email"
                    />
                    <Menu.Item
                      onPress={() => {
                        setMenuVisibleId(null);
                        handleSendInvoice(invoice.id, "whatsapp");
                      }}
                      title="Send WhatsApp"
                      leadingIcon="chat"
                    />
                    {invoice.status !== "paid" && (
                      <Menu.Item
                        onPress={() => {
                          setMenuVisibleId(null);
                          handleMarkAsPaid(invoice.id);
                        }}
                        title="Mark as Paid"
                        leadingIcon="check"
                        titleStyle={{ color: "#28a745" }}
                      />
                    )}
                  </Menu>
                </View>
              </Card.Content>
            </Card>
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Text style={styles.emptyIcon}>📄</Text>
              <Text style={styles.emptyTitle}>No invoices found</Text>
              <Text style={styles.emptyText}>
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Get started by creating your first invoice"}
              </Text>
              {!searchQuery && statusFilter === "all" && (
                <Button
                  mode="contained"
                  onPress={() => navigation.navigate("CreateInvoice")}
                  style={styles.emptyButton}
                >
                  Create Your First Invoice
                </Button>
              )}
            </Card.Content>
          </Card>
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
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2dc4b6",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  filtersCard: {
    marginBottom: 16,
  },
  searchInput: {
    marginBottom: 12,
  },
  filtersScroll: {
    marginHorizontal: -8,
  },
  filtersContainer: {
    flexDirection: "row",
    paddingHorizontal: 8,
    gap: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  addButton: {
    marginBottom: 16,
    borderRadius: 10,
  },
  invoiceCard: {
    marginBottom: 12,
    elevation: 2,
  },
  invoiceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  invoiceInfo: {
    flex: 1,
  },
  invoiceNumber: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  clientName: {
    fontSize: 14,
    color: "#666",
  },
  invoiceAmount: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2dc4b6",
  },
  invoiceDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },

  detailLabel: {
    fontSize: 12,
    color: "#666",
  },
  detailValue: {
    fontSize: 12,
    color: "#333",
    fontWeight: "500",
  },
  statusBadge: {
    height: 42,
  },
  statusBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  invoiceActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    borderRadius: 10,
  },
  actionButtonLabel: {
    fontSize: 12,
  },
  emptyCard: {
    marginTop: 40,
    alignItems: "center",
  },
  emptyContent: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 12,
    color: "#888",
    textAlign: "center",
    marginBottom: 16,
  },
  emptyButton: {
    marginTop: 8,
  },
});
