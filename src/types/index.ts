export type UserRole = 'owner' | 'accountant' | 'staff' | 'viewer';

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export type ReceiptType = 'incoming' | 'outgoing';

export type ReceiptStatus = 'draft' | 'confirmed' | 'exported';

export type EInvoiceStandard = 'ZATCA' | 'FIRS' | 'none';

export type CountryStandard = 'UAE' | 'Nigeria' | 'Other';

export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface Company {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  vat_number?: string;
  tax_number?: string;
  registration_number?: string;
  logo_path?: string;
  currency: string;
  timezone: string;
  country_standard: CountryStandard;
  settings?: Record<string, any>;
}

export interface InvoiceItem {
  id?: number;
  description: string;
  quantity: number;
  unit_price: number;
  rate?: number;                // legacy alias for unit_price
  tax_rate: number;
  tax_amount: number;
  total: number;
  sort_order?: number;
}

export interface Invoice {
  id: number;
  company_id?: number;
  user_id?: number;
  guest_token?: string;
  invoice_number: string;
  invoice_no?: string;          // legacy alias
  sequential_number?: number;
  client_name?: string;
  client_email?: string;
  client_id?: number;           // legacy
  client?: Client;              // legacy relation
  currency: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  total?: number;               // legacy alias
  due_date?: string;
  issue_date?: string;          // legacy alias
  terms?: string;               // legacy
  notes?: string;
  status: InvoiceStatus;
  einvoice_qr?: string;
  einvoice_xml?: string;
  einvoice_standard: EInvoiceStandard;
  items: InvoiceItem[];
  created_at: string;
}

export interface ReceiptItem {
  id?: number;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  sort_order: number;
}

export interface Receipt {
  id: number;
  company_id?: number;
  user_id?: number;
  guest_token?: string;
  type: ReceiptType;
  receipt_number?: string;
  vendor_name?: string;
  customer_name?: string;
  receipt_date: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  tax_rate: number;
  image_path?: string;
  ocr_confidence?: number;
  category?: string;
  notes?: string;
  status: ReceiptStatus;
  einvoice_qr?: string;
  items: ReceiptItem[];
  created_at: string;
}

export interface GuestSession {
  token: string;
  expires_at: string;
}

export interface OCRResult {
  vendor_name?: string;
  receipt_number?: string;
  receipt_date: string;
  subtotal: number;
  tax_amount: number;
  tax_rate: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  items: Partial<ReceiptItem>[];
  confidence: number;
  notes?: string;
  error?: string;
}

export interface CreateInvoicePayload {
  client_name?: string;
  client_email?: string;
  currency: string;
  items: Partial<InvoiceItem>[];
  due_date?: string;
  notes?: string;
  discount_amount?: number;
}

export interface VATReport {
  period: { from: string; to: string };
  output_vat: number;
  input_vat: number;
  vat_payable: number;
  currency: string;
}

export interface SummaryReport {
  invoices: {
    total: number;
    draft: number;
    sent: number;
    paid: number;
    overdue: number;
    total_value: number;
    paid_value: number;
  };
  receipts: {
    incoming_count: number;
    outgoing_count: number;
    total_expenses: number;
  };
}
  // ─── Legacy / existing screen types ───────────────────

export interface Client {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  billing_address?: string;
  terms?: number;
  created_at?: string;
}

export interface Payment {
  id: number;
  invoice_id: number;
  invoice?: Partial<Invoice>;
  amount: number;
  payment_date: string;
  paid_at?: string;
  method?: string;
  payment_method?: string;
  reference?: string;
  status?: string;
  notes?: string;
  created_at?: string;
}

export interface Plan {
  id: string | number;
  slug?: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  invoice_limit?: number;
  reminder_limit?: number;
  branded_emails?: boolean;
  payment_links?: boolean;
  escalation_rules?: boolean;
  analytics?: boolean;
}

export interface Subscription {
  id: number;
  plan_id: string | number;
  status: 'active' | 'cancelled' | 'expired';
  starts_at: string;
  ends_at: string;
}

export interface Usage {
  invoices_count: number;
  invoices_limit: number;
  scans_count: number;
  scans_limit: number;
}

export interface DashboardStats {
  total_invoices: number;
  totalInvoices?: number;
  total_paid: number;
  paid?: number;
  total_outstanding: number;
  outstanding?: number;
  total_overdue: number;
  overdue?: number;
  totalClients?: number;
  draftInvoices?: number;
  averageDaysLate?: number;
  recoveryRate?: number;
  recent_invoices: Invoice[];
}

export interface ReminderTemplate {
  id: number;
  name: string;
  subject: string;
  body: string;
  type?: string;
  trigger_days?: number;
  days_before_due: number;
}

export interface EscalationRule {
  id: number;
  name: string;
  is_active?: boolean;
  steps: EscalationStep[];
  steps_json?: EscalationStep[];
}

export interface EscalationStep {
  day: number;
  action: string;
  message?: string;
  trigger_days?: number;
  template_id?: string | number;
  channel?: 'email' | 'whatsapp' | 'sms';
}

export interface ScheduledReminder {
  id: number;
  invoice_id: number;
  send_at: string;
  status: 'pending' | 'sent' | 'failed';
}

export interface SentReminder {
  id: number;
  invoice_id: number;
  sent_at: string;
  method: string;
  status: 'delivered' | 'failed';
}
