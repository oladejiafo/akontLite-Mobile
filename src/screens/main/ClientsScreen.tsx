import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Card, Button, Modal, Portal, TextInput as PaperInput } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { clientAPI } from '../../services/api';
import { Client } from '../../types';

export default function ClientsScreen({ navigation }: any) {

// export default function ClientsScreen() {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    terms: '',
  });

  useEffect(() => {
    fetchClients();
  }, [searchQuery]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await clientAPI.getClients();
      setClients(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
      Alert.alert('Error', 'Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClient = async () => {
    try {
      await clientAPI.createClient(newClient);
      setShowCreateModal(false);
      setNewClient({ name: '', email: '', phone: '', address: '', terms: '' });
      fetchClients();
      Alert.alert('Success', 'Client created successfully');
    } catch (error) {
      console.error('Failed to create client:', error);
      Alert.alert('Error', 'Failed to create client');
    }
  };

  const handleDeleteClient = async (clientId: number) => {
    Alert.alert(
      'Delete Client',
      'Are you sure you want to delete this client?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await clientAPI.deleteClient(clientId);
              fetchClients();
              Alert.alert('Success', 'Client deleted successfully');
            } catch (error) {
              console.error('Failed to delete client:', error);
              Alert.alert('Error', 'Failed to delete client');
            }
          },
        },
      ]
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const filteredClients = clients.filter(client =>
    client.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone?.includes(searchQuery)
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>

          <Text style={styles.subtitle}>Manage your client database</Text>
        </View>

        {/* Search Bar */}
        <Card style={styles.searchCard}>
          <Card.Content>
            <PaperInput
              label="Search clients..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              mode="outlined"
              left={<PaperInput.Icon icon="magnify" />}
            />
          </Card.Content>
        </Card>

        {/* Add Client Button */}
        <Button
          mode="contained"
          onPress={() => setShowCreateModal(true)}
          style={styles.addButton}
          icon="account-plus"
        >
          Add Client
        </Button>

        {/* Clients List */}
        {filteredClients.length > 0 ? (
          filteredClients.map(client => (
            <Card key={client.id} style={styles.clientCard}>
              <Card.Content>
                <View style={styles.clientHeader}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {getInitials(client.name || '?')}
                    </Text>
                  </View>
                  <View style={styles.clientInfo}>
                    <Text style={styles.clientName}>{client.name}</Text>
                    {client.email && (
                      <Text style={styles.clientDetail}>{client.email}</Text>
                    )}
                    {client.phone && (
                      <Text style={styles.clientDetail}>{client.phone}</Text>
                    )}
                    {client.terms && (
                      <Text style={styles.terms}>
                        Terms: {client.terms} days
                      </Text>
                    )}
                  </View>
                </View>

                <View style={styles.clientActions}>
                  <Button
                    mode="outlined"
                    onPress={() => navigation.navigate('ClientDetails', { clientId: client.id })}
                    style={styles.actionButton}
                    compact
                  >
                    View
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={() => navigation.navigate('Invoices', {
                        screen: 'CreateInvoice',
                        params: { clientId: client.id },
                      })}
                    style={styles.actionButton}
                    compact
                  >
                    Create Invoice
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={() => handleDeleteClient(client.id)}
                    style={styles.actionButton}
                    compact
                    textColor="#dc3545"
                  >
                    Delete
                  </Button>
                </View>
              </Card.Content>
            </Card>
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Text style={styles.emptyIcon}>👥</Text>
              <Text style={styles.emptyTitle}>No clients found</Text>
              <Text style={styles.emptyText}>
                {searchQuery ? 'Try adjusting your search' : 'Get started by adding your first client'}
              </Text>
              {!searchQuery && (
                <Button
                  mode="contained"
                  onPress={() => setShowCreateModal(true)}
                  style={styles.emptyButton}
                >
                  Add Your First Client
                </Button>
              )}
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      {/* Create Client Modal */}
      <Portal>
        <Modal
          visible={showCreateModal}
          onDismiss={() => setShowCreateModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={styles.modalTitle}>Add New Client</Text>
          
          <PaperInput
            label="Client Name *"
            value={newClient.name}
            onChangeText={(value) => setNewClient({ ...newClient, name: value })}
            style={styles.modalInput}
            mode="outlined"
          />
          
          <PaperInput
            label="Email"
            value={newClient.email}
            onChangeText={(value) => setNewClient({ ...newClient, email: value })}
            style={styles.modalInput}
            mode="outlined"
            keyboardType="email-address"
          />
          
          <PaperInput
            label="Phone"
            value={newClient.phone}
            onChangeText={(value) => setNewClient({ ...newClient, phone: value })}
            style={styles.modalInput}
            mode="outlined"
            keyboardType="phone-pad"
          />
          
          <PaperInput
            label="Payment Terms (days)"
            value={newClient.terms}
            onChangeText={(value) => setNewClient({ ...newClient, terms: value })}
            style={styles.modalInput}
            mode="outlined"
            keyboardType="numeric"
          />
          
          <PaperInput
            label="Address"
            value={newClient.address}
            onChangeText={(value) => setNewClient({ ...newClient, address: value })}
            style={styles.modalInput}
            mode="outlined"
            multiline
            numberOfLines={3}
          />

          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => setShowCreateModal(false)}
              style={styles.modalButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleCreateClient}
              style={styles.modalButton}
              disabled={!newClient.name}
            >
              Create Client
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2dc4b6',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  searchCard: {
    marginBottom: 16,
  },
  addButton: {
    marginBottom: 16,
    borderRadius: 10
  },
  clientCard: {
    marginBottom: 12,
    elevation: 2,
  },
  clientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 25,
    backgroundColor: '#2dc4b6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  clientDetail: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  terms: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  clientActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 10
  },
  emptyCard: {
    marginTop: 40,
    alignItems: 'center',
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyButton: {
    marginTop: 8,
  },
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2dc4b6',
  },
  modalInput: {
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});