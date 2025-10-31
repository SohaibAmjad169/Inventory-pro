/// <reference types="vite/client" />

interface ElectronAPI {
  // Secure storage
  storeSecureData: (key: string, value: any) => Promise<{ success: boolean }>;
  getSecureData: (key: string) => Promise<any>;
  deleteSecureData: (key: string) => Promise<{ success: boolean }>;
  clearAllData: () => Promise<{ success: boolean }>;

  // App info
  getAppVersion: () => Promise<string>;
  getAppInfo: () => Promise<any>;
  getAppPath: () => Promise<string>;
  checkBackendHealth: () => Promise<{ isHealthy: boolean; statusCode?: number; error?: string }>;
  getConnectionStatus: () => Promise<any>;
  onBackendStatus: (callback: (status: any) => void) => void;
  quitApp: () => Promise<void>;
  minimizeWindow: () => Promise<void>;
  toggleMaximizeWindow: () => Promise<void>;
  showError: (title: string, message: string) => Promise<{ success: boolean }>;
  showMessage: (options: any) => Promise<any>;
  logMessage: (message: string, level: 'info' | 'warn' | 'error') => Promise<{ success: boolean }>;

  // Phase 3: Native Features
  showNotification: (options: any) => Promise<{ success: boolean; error?: string }>;
  showLowStockAlert: (productName: string, current: number, min: number) => Promise<{ success: boolean; error?: string }>;
  showOutOfStockAlert: (productName: string) => Promise<{ success: boolean; error?: string }>;
  showNewOrderNotification: (orderNumber: string, amount: number) => Promise<{ success: boolean; error?: string }>;
  showPaymentReceivedNotification: (amount: number, customer: string) => Promise<{ success: boolean; error?: string }>;
  showBackupCompleteNotification: (size: string) => Promise<{ success: boolean; error?: string }>;
  showErrorNotification: (title: string, error: string) => Promise<{ success: boolean; error?: string }>;
  showSuccessNotification: (title: string, message: string) => Promise<{ success: boolean; error?: string }>;
  areNotificationsSupported: () => Promise<boolean>;
  printWindow: (options?: any) => Promise<{ success: boolean; error?: string }>;
  printReceipt: (receiptHtml: string, printerName?: string) => Promise<{ success: boolean; error?: string }>;
  printToPDF: (outputPath: string, options?: any) => Promise<{ success: boolean; path?: string; error?: string }>;
  getAvailablePrinters: () => Promise<any[]>;
  getDefaultPrinter: () => Promise<any | null>;
  printInvoice: (invoiceHtml: string, options?: any) => Promise<{ success: boolean; error?: string }>;
  printReport: (reportHtml: string, options?: any) => Promise<{ success: boolean; error?: string }>;
  checkForUpdates: () => Promise<void>;
  onNavigate: (callback: (route: string) => void) => void;
  onTriggerSearch: (callback: () => void) => void;
  onTriggerPrint: (callback: () => void) => void;
  onNewTransaction: (callback: () => void) => void;
  onEscapePressed: (callback: () => void) => void;

  // Language synchronization
  setLanguage: (language: 'en' | 'ar') => Promise<boolean>;
  getLanguage: () => Promise<'en' | 'ar'>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}


