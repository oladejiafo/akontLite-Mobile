import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// // Use the EXACT same URL that works in browser
// const API_BASE_URL = "https://akontlite.akontforge.com/api";

const api = axios.create({
    baseURL: 'https://akontlite.akontforge.com/api',
    withCredentials: false, // ← MUST be false like App A
    timeout: 15000,
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    
  });

export const setAuthToken = (token: string | null) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  };

// // Initialize auth
// export const initializeAuth = async () => {
//   const token = await AsyncStorage.getItem('auth_token');
//   if (token) {
//     setAuthToken(token);
//   }
// };
// initializeAuth();

export const subscriptionAPI = {
    getPlans: () => api.get('/plans', { headers: { 'Accept': 'application/json' } }),

    // getPlans: () => api.get('/plans'), // ← Simple call, no manual headers
    registerWithPlan: (data: any) => api.post('/register-with-plan', data),
    getCurrentSubscription: () => api.get('/subscription/current'),
    createCheckoutSession: (planId: number) => api.post('/subscription/checkout', { plan_id: planId }),
    updateSubscription: (planId: number) => api.post('/subscription/update', { plan_id: planId }),
    cancelSubscription: () => api.post('/subscription/cancel'),
  };

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get("/dashboard/stats"),
  getRecoveryAnalytics: () => api.get("/dashboard/recovery-analytics"),
  getChronicPayers: () => api.get("/dashboard/chronic-payers"),
  getRecoveryMetrics: () => api.get("/analytics/recovery-metrics"),
};

// Invoice API
export const invoiceAPI = {
  getInvoices: (params?: any) => api.get("/invoices", { params }),
  getInvoice: (id: number) => api.get(`/invoices/${id}`),
  createInvoice: (data: any) => api.post("/invoices", data),
  updateInvoice: (id: number, data: any) => api.put(`/invoices/${id}`, data),
  deleteInvoice: (id: number) => api.delete(`/invoices/${id}`),
  sendInvoice: (id: number, data?: any) =>
    api.post(`/invoices/${id}/send`, data),
  markAsPaid: (id: number) => api.post(`/invoices/${id}/mark-paid`),
  downloadPDF: (id: number) =>
    api.get(`/invoices/${id}/download`, {
      responseType: "blob",
    }),
  getClients: () => api.get('/clients'),
  pauseReminders: (id: number) => api.post(`/invoices/${id}/pause-reminders`),
  resumeReminders: (id: number) => api.post(`/invoices/${id}/resume-reminders`),
  
};

// Client API
export const clientAPI = {
  getClients: (params?: any) => api.get("/clients", { params }),
  getClient: (id: number) => api.get(`/clients/${id}`),
  createClient: (data: any) => api.post("/clients", data),
  updateClient: (id: number, data: any) => api.put(`/clients/${id}`, data),
  deleteClient: (id: number) => api.delete(`/clients/${id}`),
  updateCommunicationPreferences: (id: number, data: any) =>
    api.put(`/clients/${id}/communication-preferences`, data),
  getPaymentBehavior: (id: number) =>
    api.get(`/clients/${id}/payment-behavior`),
};

// Company API
export const companyAPI = {
  getCompany: () => api.get("/company"),
  updateCompany: (data: any) => api.put("/company", data),
  storeCompany: (data: any) => api.post("/company", data),
  uploadLogo: (formData: FormData) =>
    api.post("/company/logo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  removeLogo: () => api.delete("/company/logo"),
  updateTaxSettings: (data: any) => api.put("/company/tax-settings", data),
};

// Profile API
export const profileAPI = {
  getProfile: () => api.get("/profile"),
  updateProfile: (data: any) => api.put("/profile", data),
  deleteAccount: () => api.delete("/profile"),
  showCompany: () => api.get("/company"),
  storeCompany: (data: any) => api.post("/company", data),
  updateCompany: (data: any) => api.put("/company", data),
  uploadLogo: (formData: FormData) =>
    api.post("/company/logo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  removeLogo: () => api.delete("/company/logo"),
  updateTaxSettings: (data: any) => api.put("/company/tax-settings", data),
};

// Payments API
export const paymentsAPI = {
    getPayments: (params?: any) => api.get("/payments", { params }),
    getPaymentStats: () => api.get("/payments/stats"),
    markPaymentComplete: (id: number) => api.post(`/payments/${id}/mark-complete`),

  refundPayment: (id: number) => api.post(`/payments/${id}/refund`),
};

export const userAPI = {
    updateProfile: (data: any) => api.put('/profile', data),
    changePassword: (data: any) => api.put('/profile/password', data),
    deleteAccount: () => api.delete('/profile'),
  };

export const remindersAPI = {
    // Templates
    getTemplates: () => api.get('/reminder-templates'),
    createTemplate: (data: any) => api.post('/reminder-templates', data),
    updateTemplate: (id: number, data: any) => api.put(`/reminder-templates/${id}`, data),
    
    // Escalation Rules
    getEscalationRules: () => api.get('/escalation-rules'),
    createEscalationRule: (data: any) => api.post('/escalation-rules', data),
    updateEscalationRule: (id: number, data: any) => api.put(`/escalation-rules/${id}`, data),
    
    // Scheduled & Sent Reminders
    getScheduledReminders: () => api.get('/reminders/scheduled'),
    getSentReminders: () => api.get('/reminders/sent'),
    
    // Manual Reminder Trigger
    sendManualReminder: (invoiceId: number) => api.post(`/invoices/${invoiceId}/reminders/trigger`),
  };

export default api;
