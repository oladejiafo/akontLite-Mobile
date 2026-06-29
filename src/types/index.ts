// User types
export interface User {
    id: number;
    name: string;
    email: string;
    company_id: number;
  }
  
  export interface Company {
    id: number;
    name: string;
    currency: string;
    tax_settings?: any;
  }
  
  // Invoice Item type
  export interface InvoiceItem {
    id?: number;
    description: string;
    quantity: number;
    rate: number;
    amount?: number;
  }
  
  // Extended Invoice type with items
  export interface Invoice {
    id: number;
    invoice_no: string;
    client_id: number;
    client?: Client;
    total: number;
    subtotal?: number;
    tax_amount?: number;
    tax_rate?: number;
    tax_name?: string;
    tax_enabled?: boolean;
    tax_inclusive?: boolean;
    due_date: string;
    issue_date: string;
    status: 'draft' | 'sent' | 'paid' | 'overdue';
    created_at: string;
    items: InvoiceItem[];
    notes?: string;
    terms?: string;
    currency?: string;
  }

  
  export interface Client {
    id: number;
    name: string;
    email: string;
    phone?: string;
    terms?: string;
    billing_address?: string;
    address: string;
  }
  
  // Subscription types
  export interface Plan {
    id: number;
    name: string;
    price: number;
    slug: string;
    invoice_limit: number;
    reminder_limit: number;
    branded_emails?: boolean;
    payment_links?: boolean; 
    escalation_rules?: boolean; 
    analytics?: boolean; 
    description?: string;
  }
  
  export interface Subscription {
    id: number;
    plan_id: number;
    status: string;
    current_period_start: string;
    current_period_end: string;
    plan?: Plan;
  }
  
  export interface Usage {
    invoices_used: number;
    reminders_used: number;
  }
  
  // Dashboard stats
  export interface DashboardStats {
    totalInvoices: number;
    outstanding: number;
    overdue: number;
    paid: number;
    averageDaysLate: number;
    recoveryRate: number;
    revenueSaved: number;
    chronicPayers: number;
    totalClients: number;
    draftInvoices: number;
  }

  export interface Payment {
    id: number;
    invoice_id: number;
    invoice?: Invoice;
    amount: number;
    status: 'pending' | 'completed' | 'failed' | 'refunded' | 'processing';
    payment_method?: string;
    paid_at?: string;
    created_at: string;
  }

  // Reminder types
export interface ReminderTemplate {
    id: number;
    name: string;
    subject: string;
    body: string;
    type: 'email' | 'whatsapp' | 'sms';
    trigger_days: number;
    created_at: string;
  }
  
  export interface EscalationRule {
    id: number;
    name: string;
    is_active: boolean;
    template_id: string;
    steps: EscalationStep[];
    steps_json?: EscalationStep[];
    created_at: string;
  }
  
  export interface EscalationStep {
    trigger_days: number;
    template_id: number | string;
    channel: 'email' | 'whatsapp' | 'sms';
    template?: ReminderTemplate;
  }
  
  export interface ScheduledReminder {
    id: number;
    invoice_id: number;
    invoice?: Invoice;
    scheduled_for: string;
    channel: 'email' | 'whatsapp' | 'sms';
    level: number;
    created_at: string;
  }
  
  export interface SentReminder {
    id: number;
    invoice_id: number;
    invoice?: Invoice;
    sent_at: string;
    channel: 'email' | 'whatsapp' | 'sms';
    type: 'auto' | 'manual';
    created_at: string;
  }