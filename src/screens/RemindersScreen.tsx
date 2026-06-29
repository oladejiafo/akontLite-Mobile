import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  Divider,
  ActivityIndicator,
  Modal,
  TextInput as PaperInput,
  Portal,
  Dialog,
  Paragraph,
} from 'react-native-paper';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { remindersAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import {
  ReminderTemplate,
  EscalationRule,
  ScheduledReminder,
  SentReminder,
  EscalationStep,
} from '../types';

type RootStackParamList = {
  Reminders: undefined;
  InvoiceDetails: { invoiceId: number };
};

type TabType = 'templates' | 'rules' | 'scheduled' | 'sent';

// Helper function to convert steps for form (number to string)
const convertStepsForForm = (steps: EscalationStep[]) => {
  return steps.map(step => ({
    ...step,
    template_id: step.template_id.toString(), // Convert number to string
  }));
};

// Helper function to convert steps for API (string to number)
const convertStepsForAPI = (steps: any[]) => {
  return steps.map(step => ({
    ...step,
    template_id: step.template_id ? parseInt(step.template_id) : 0, // Convert string to number
  }));
};

export default function RemindersScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  const { user } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState<TabType>('templates');
  const [templates, setTemplates] = useState<ReminderTemplate[]>([]);
  const [escalationRules, setEscalationRules] = useState<EscalationRule[]>([]);
  const [scheduledReminders, setScheduledReminders] = useState<ScheduledReminder[]>([]);
  const [sentReminders, setSentReminders] = useState<SentReminder[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Selected items
  const [selectedTemplate, setSelectedTemplate] = useState<ReminderTemplate | null>(null);
  const [selectedRule, setSelectedRule] = useState<EscalationRule | null>(null);
  const [previewContent, setPreviewContent] = useState('');

  // Forms - FIXED: template_id is now string in form state
  const [templateForm, setTemplateForm] = useState({
    name: '',
    subject: '',
    body: '',
    type: 'email' as 'email' | 'whatsapp' | 'sms',
    trigger_days: 0,
  });

  const [ruleForm, setRuleForm] = useState({
    name: '',
    is_active: true,
    steps: [
      { trigger_days: 3, template_id: '', channel: 'email' as 'email' | 'whatsapp' | 'sms' },
      { trigger_days: 7, template_id: '', channel: 'email' as 'email' | 'whatsapp' | 'sms' },
      { trigger_days: 14, template_id: '', channel: 'whatsapp' as 'email' | 'whatsapp' | 'sms' },
    ],
  });

  useEffect(() => {
    fetchRemindersData();
  }, []);

  const fetchRemindersData = async () => {
    try {
      setLoading(true);
      const [templatesRes, rulesRes, scheduledRes, sentRes] = await Promise.all([
        remindersAPI.getTemplates(),
        remindersAPI.getEscalationRules(),
        remindersAPI.getScheduledReminders(),
        remindersAPI.getSentReminders(),
      ]);

      setTemplates(templatesRes.data.data || []);
      setEscalationRules(rulesRes.data.data || []);
      setScheduledReminders(scheduledRes.data.data || []);
      setSentReminders(sentRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch reminders data:', error);
      Alert.alert('Error', 'Failed to load reminders data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    try {
      if (selectedTemplate) {
        await remindersAPI.updateTemplate(selectedTemplate.id, templateForm);
      } else {
        await remindersAPI.createTemplate(templateForm);
      }
      setShowTemplateModal(false);
      setTemplateForm({ name: '', subject: '', body: '', type: 'email', trigger_days: 0 });
      setSelectedTemplate(null);
      fetchRemindersData();
      Alert.alert('Success', 'Template saved successfully!');
    } catch (error) {
      console.error('Failed to save template:', error);
      Alert.alert('Error', 'Failed to save template');
    }
  };

  const handleSaveRule = async () => {
    try {
      // Convert template_id from string to number for API
      const apiData = {
        ...ruleForm,
        steps: convertStepsForAPI(ruleForm.steps),
      };

      if (selectedRule) {
        await remindersAPI.updateEscalationRule(selectedRule.id, apiData);
      } else {
        await remindersAPI.createEscalationRule(apiData);
      }
      setShowRuleModal(false);
      setRuleForm({
        name: '',
        is_active: true,
        steps: [
          { trigger_days: 3, template_id: '', channel: 'email' },
          { trigger_days: 7, template_id: '', channel: 'email' },
          { trigger_days: 14, template_id: '', channel: 'whatsapp' },
        ],
      });
      setSelectedRule(null);
      fetchRemindersData();
      Alert.alert('Success', 'Escalation rule saved successfully!');
    } catch (error) {
      console.error('Failed to save rule:', error);
      Alert.alert('Error', 'Failed to save escalation rule');
    }
  };

  const handleEditTemplate = (template: ReminderTemplate) => {
    setSelectedTemplate(template);
    setTemplateForm({
      name: template.name,
      subject: template.subject,
      body: template.body,
      type: template.type,
      trigger_days: template.trigger_days,
    });
    setShowTemplateModal(true);
  };

  const handleEditRule = (rule: EscalationRule) => {
    setSelectedRule(rule);
    
    // Convert steps for form (number to string)
    const steps = convertStepsForForm(rule.steps_json || rule.steps);
    
    setRuleForm({
      name: rule.name,
      is_active: rule.is_active,
      steps: steps,
    });
    setShowRuleModal(true);
  };

  const handleSendManualReminder = async (invoiceId: number) => {
    try {
      await remindersAPI.sendManualReminder(invoiceId);
      Alert.alert('Success', 'Manual reminder sent successfully!');
      fetchRemindersData();
    } catch (error) {
      console.error('Failed to send manual reminder:', error);
      Alert.alert('Error', 'Failed to send reminder');
    }
  };

  const handleToggleRule = async (rule: EscalationRule) => {
    try {
      await remindersAPI.updateEscalationRule(rule.id, {
        ...rule,
        is_active: !rule.is_active,
      });
      fetchRemindersData();
    } catch (error) {
      console.error('Failed to toggle rule:', error);
      Alert.alert('Error', 'Failed to update rule');
    }
  };

  const getTriggerText = (days: number) => {
    if (days === 0) return 'On due date';
    if (days > 0) return `${days} days after due`;
    return `${Math.abs(days)} days before due`;
  };

  const getChannelBadge = (channel: string) => {
    const colors = {
      email: '#007bff',
      whatsapp: '#28a745',
      sms: '#17a2b8',
    };
    return (
      <Chip
        style={[styles.chip, { backgroundColor: colors[channel as keyof typeof colors] || '#6c757d' }]}
        textStyle={styles.chipText}
      >
        {channel.toUpperCase()}
      </Chip>
    );
  };

  const previewTemplate = (template: ReminderTemplate) => {
    const preview = template.body
      .replace(/{client_name}/g, 'John Doe')
      .replace(/{invoice_no}/g, 'INV-001')
      .replace(/{amount}/g, '$100.00')
      .replace(/{due_date}/g, '2024-01-15')
      .replace(/{pay_link}/g, 'https://pay.example.com/inv-001');
    
    setPreviewContent(preview);
    setShowPreviewModal(true);
  };

  // Update step in rule form
  const updateRuleStep = (index: number, field: string, value: any) => {
    const newSteps = [...ruleForm.steps];
    newSteps[index] = {
      ...newSteps[index],
      [field]: value,
    };
    setRuleForm({
      ...ruleForm,
      steps: newSteps,
    });
  };

  // Add this function to render the rule modal
  const renderRuleModal = () => (
    <Portal>
      <Modal
        visible={showRuleModal}
        onDismiss={() => setShowRuleModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Text style={styles.modalTitle}>
          {selectedRule ? 'Edit Escalation Rule' : 'Create Escalation Rule'}
        </Text>
        
        <ScrollView style={styles.modalContent}>
          <PaperInput
            label="Rule Name"
            value={ruleForm.name}
            onChangeText={(value) => setRuleForm({...ruleForm, name: value})}
            mode="outlined"
            style={styles.modalInput}
          />
          
          {ruleForm.steps.map((step, index) => (
            <Card key={index} style={styles.stepCard}>
              <Card.Content>
                <Text style={styles.stepTitle}>Step {index + 1}</Text>
                
                <PaperInput
                  label="Trigger Days"
                  value={step.trigger_days.toString()}
                  onChangeText={(value) => updateRuleStep(index, 'trigger_days', parseInt(value) || 0)}
                  mode="outlined"
                  keyboardType="numeric"
                  style={styles.modalInput}
                />
                <Text style={styles.helperText}>
                  {getTriggerText(step.trigger_days)}
                </Text>

                <PaperInput
                  label="Channel"
                  value={step.channel}
                  onChangeText={(value) => updateRuleStep(index, 'channel', value)}
                  mode="outlined"
                  style={styles.modalInput}
                />

                <Text style={styles.selectLabel}>Template</Text>
                <View style={styles.templateOptions}>
                  {templates
                    .filter(t => t.type === step.channel)
                    .map(template => (
                      <Chip
                        key={template.id}
                        selected={step.template_id === template.id.toString()}
                        onPress={() => updateRuleStep(index, 'template_id', template.id.toString())}
                        style={styles.templateChip}
                        mode={step.template_id === template.id.toString() ? 'flat' : 'outlined'}
                      >
                        {template.name}
                      </Chip>
                    ))
                  }
                </View>
                {templates.filter(t => t.type === step.channel).length === 0 && (
                  <Text style={styles.noTemplatesText}>
                    No {step.channel} templates available. Create one first.
                  </Text>
                )}
              </Card.Content>
            </Card>
          ))}
        </ScrollView>

        <View style={styles.modalActions}>
          <Button
            mode="outlined"
            onPress={() => setShowRuleModal(false)}
            style={styles.modalButton}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleSaveRule}
            style={styles.modalButton}
          >
            {selectedRule ? 'Update' : 'Create'} Rule
          </Button>
        </View>
      </Modal>
    </Portal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2dc4b6" />
        <Text style={styles.loadingText}>Loading reminders...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Auto Reminders</Text>
          <Text style={styles.subtitle}>Automatically chase late payments</Text>
        </View>

        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Text style={[styles.statNumber, { color: '#007bff' }]}>{templates.length}</Text>
              <Text style={styles.statLabel}>Templates</Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Text style={[styles.statNumber, { color: '#ffc107' }]}>{scheduledReminders.length}</Text>
              <Text style={styles.statLabel}>Scheduled</Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Text style={[styles.statNumber, { color: '#28a745' }]}>{sentReminders.length}</Text>
              <Text style={styles.statLabel}>Sent Today</Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Text style={[styles.statNumber, { color: '#17a2b8' }]}>{escalationRules.filter(r => r.is_active).length}</Text>
              <Text style={styles.statLabel}>Active Rules</Text>
            </Card.Content>
          </Card>
        </View>

        {/* Tab Navigation */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
          <View style={styles.tabs}>
            {(['templates', 'rules', 'scheduled', 'sent'] as TabType[]).map(tab => (
              <Chip
                key={tab}
                selected={activeTab === tab}
                onPress={() => setActiveTab(tab)}
                style={styles.tabChip}
                mode={activeTab === tab ? 'flat' : 'outlined'}
              >
                {tab === 'templates' ? 'Templates' :
                 tab === 'rules' ? 'Rules' :
                 tab === 'scheduled' ? 'Scheduled' : 'Sent'}
                {tab === 'scheduled' && scheduledReminders.length > 0 && (
                  <Text style={styles.badge}> {scheduledReminders.length}</Text>
                )}
                {tab === 'sent' && sentReminders.length > 0 && (
                  <Text style={styles.badge}> {sentReminders.length}</Text>
                )}
              </Chip>
            ))}
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            mode="outlined"
            onPress={() => {
              setSelectedTemplate(null);
              setTemplateForm({ name: '', subject: '', body: '', type: 'email', trigger_days: 0 });
              setShowTemplateModal(true);
            }}
            style={styles.actionButton}
            icon="email-plus"
          >
            Template
          </Button>
          <Button
            mode="contained"
            onPress={() => {
              setSelectedRule(null);
              setRuleForm({
                name: '',
                is_active: true,
                steps: [
                  { trigger_days: 3, template_id: '', channel: 'email' },
                  { trigger_days: 7, template_id: '', channel: 'email' },
                  { trigger_days: 14, template_id: '', channel: 'whatsapp' },
                ],
              });
              setShowRuleModal(true);
            }}
            style={styles.actionButton}
            icon="chart-timeline"
          >
            Rule
          </Button>
        </View>

        {/* Tab Content - Same as before */}
        {activeTab === 'templates' && (
          <Card style={styles.tabCard}>
            <Card.Content>
              <Text style={styles.cardTitle}>Message Templates</Text>
              {templates.length > 0 ? (
                templates.map(template => (
                  <View key={template.id} style={styles.templateItem}>
                    <View style={styles.templateHeader}>
                      <Text style={styles.templateName}>{template.name}</Text>
                      {getChannelBadge(template.type)}
                    </View>
                    <Text style={styles.templateSubject}>{template.subject}</Text>
                    <Text style={styles.templateTrigger}>
                      {getTriggerText(template.trigger_days)}
                    </Text>
                    <View style={styles.templateActions}>
                      <Button
                        mode="outlined"
                        onPress={() => handleEditTemplate(template)}
                        style={styles.smallButton}
                        compact
                        icon="pencil"
                      >
                        Edit
                      </Button>
                      <Button
                        mode="outlined"
                        onPress={() => previewTemplate(template)}
                        style={styles.smallButton}
                        compact
                        icon="eye"
                      >
                        Preview
                      </Button>
                    </View>
                    <Divider style={styles.divider} />
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>📧</Text>
                  <Text style={styles.emptyTitle}>No templates yet</Text>
                  <Text style={styles.emptyText}>
                    Create your first template to start automating reminders
                  </Text>
                </View>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Other tabs remain the same... */}
        {activeTab === 'rules' && (
          <Card style={styles.tabCard}>
            <Card.Content>
              <Text style={styles.cardTitle}>Escalation Rules</Text>
              {escalationRules.length > 0 ? (
                escalationRules.map(rule => (
                  <View key={rule.id} style={styles.ruleItem}>
                    <View style={styles.ruleHeader}>
                      <Text style={styles.ruleName}>{rule.name}</Text>
                      <Chip
                        mode={rule.is_active ? 'flat' : 'outlined'}
                        style={[
                          styles.statusChip,
                          rule.is_active ? styles.activeChip : styles.inactiveChip
                        ]}
                      >
                        {rule.is_active ? 'Active' : 'Inactive'}
                      </Chip>
                    </View>
                    
                    <View style={styles.ruleSteps}>
                      {(rule.steps_json || rule.steps).map((step, idx) => (
                        <View key={idx} style={styles.stepItem}>
                          <Text style={styles.stepText}>
                            Step {idx + 1}: {getTriggerText(step.trigger_days)} via {step.channel}
                          </Text>
                        </View>
                      ))}
                    </View>

                    <View style={styles.ruleActions}>
                      <Button
                        mode="outlined"
                        onPress={() => handleEditRule(rule)}
                        style={styles.smallButton}
                        compact
                        icon="pencil"
                      >
                        Edit
                      </Button>
                      <Button
                        mode="outlined"
                        onPress={() => handleToggleRule(rule)}
                        style={styles.smallButton}
                        compact
                        icon={rule.is_active ? 'pause' : 'play'}
                      >
                        {rule.is_active ? 'Pause' : 'Activate'}
                      </Button>
                    </View>
                    <Divider style={styles.divider} />
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>📈</Text>
                  <Text style={styles.emptyTitle}>No escalation rules yet</Text>
                  <Text style={styles.emptyText}>
                    Create your first rule to automate payment reminders
                  </Text>
                </View>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Scheduled and Sent tabs remain the same... */}
      </ScrollView>

      {/* Template Modal */}
      <Portal>
        <Modal
          visible={showTemplateModal}
          onDismiss={() => setShowTemplateModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={styles.modalTitle}>
            {selectedTemplate ? 'Edit Template' : 'Create Template'}
          </Text>
          
          <ScrollView style={styles.modalContent}>
            <PaperInput
              label="Template Name"
              value={templateForm.name}
              onChangeText={(value) => setTemplateForm({...templateForm, name: value})}
              mode="outlined"
              style={styles.modalInput}
            />
            
            <PaperInput
              label="Channel"
              value={templateForm.type}
              onChangeText={(value) => setTemplateForm({...templateForm, type: value as any})}
              mode="outlined"
              style={styles.modalInput}
            />
            
            <PaperInput
              label="Trigger Days"
              value={templateForm.trigger_days.toString()}
              onChangeText={(value) => setTemplateForm({...templateForm, trigger_days: parseInt(value) || 0})}
              mode="outlined"
              keyboardType="numeric"
              style={styles.modalInput}
            />
            <Text style={styles.helperText}>
              {getTriggerText(templateForm.trigger_days)}
            </Text>

            {templateForm.type === 'email' && (
              <PaperInput
                label="Subject"
                value={templateForm.subject}
                onChangeText={(value) => setTemplateForm({...templateForm, subject: value})}
                mode="outlined"
                style={styles.modalInput}
              />
            )}

            <PaperInput
              label="Message Body"
              value={templateForm.body}
              onChangeText={(value) => setTemplateForm({...templateForm, body: value})}
              mode="outlined"
              multiline
              numberOfLines={4}
              style={styles.modalInput}
            />
            <Text style={styles.helperText}>
              Available variables: {'{client_name}'}, {'{invoice_no}'}, {'{amount}'}, {'{due_date}'}, {'{pay_link}'}
            </Text>
          </ScrollView>

          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => setShowTemplateModal(false)}
              style={styles.modalButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSaveTemplate}
              style={styles.modalButton}
            >
              {selectedTemplate ? 'Update' : 'Create'}
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* Rule Modal */}
      {renderRuleModal()}

      {/* Preview Modal */}
      <Portal>
        <Dialog visible={showPreviewModal} onDismiss={() => setShowPreviewModal(false)}>
          <Dialog.Title>Template Preview</Dialog.Title>
          <Dialog.Content>
            <Paragraph>{previewContent}</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowPreviewModal(false)}>Close</Button>
          </Dialog.Actions>
        </Dialog>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2dc4b6',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  statCard: {
    width: '48%',
    elevation: 2,
  },
  statContent: {
    alignItems: 'center',
    padding: 12,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  tabsContainer: {
    marginBottom: 16,
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
  },
  tabChip: {
    marginRight: 8,
  },
  badge: {
    color: '#fff',
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
  },
  tabCard: {
    elevation: 2,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  templateItem: {
    marginBottom: 16,
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  templateName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  templateSubject: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  templateTrigger: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  templateActions: {
    flexDirection: 'row',
    gap: 8,
  },
  ruleItem: {
    marginBottom: 16,
  },
  ruleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ruleName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusChip: {
    marginLeft: 8,
  },
  activeChip: {
    backgroundColor: '#28a745',
  },
  inactiveChip: {
    borderColor: '#6c757d',
  },
  ruleSteps: {
    marginBottom: 12,
  },
  stepCard: {
    marginBottom: 16,
    elevation: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  selectLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#666',
  },
  templateOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  templateChip: {
    marginBottom: 4,
  },
  noTemplatesText: {
    fontSize: 12,
    color: '#dc3545',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  stepItem: {
    marginBottom: 4,
  },
  stepText: {
    fontSize: 12,
    color: '#666',
  },
  ruleActions: {
    flexDirection: 'row',
    gap: 8,
  },
  reminderItem: {
    marginBottom: 16,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  invoiceNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  clientName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  scheduleDate: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  sentDate: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  reminderLevel: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 8,
  },
  typeChip: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  manualChip: {
    borderColor: '#ffc107',
  },
  autoChip: {
    borderColor: '#28a745',
  },
  sendButton: {
    alignSelf: 'flex-start',
  },
  chip: {
    height: 24,
  },
  chipText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  smallButton: {
    flex: 1,
  },
  divider: {
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  modalContent: {
    maxHeight: 400,
  },
  modalInput: {
    marginBottom: 12,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
  },
});