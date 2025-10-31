/**
 * Internationalization for Electron App
 */

import Store from 'electron-store';

export type Language = 'en' | 'ar';

interface ElectronTranslations {
  tray: {
    hideWindow: string;
    showWindow: string;
    dashboard: string;
    pos: string;
    notifications: string;
    showAllNotifications: string;
    enableNotifications: string;
    about: string;
    quit: string;
  };
}

const translations: Record<Language, ElectronTranslations> = {
  en: {
    tray: {
      hideWindow: 'Hide Window',
      showWindow: 'Show Window',
      dashboard: 'Dashboard',
      pos: 'POS',
      notifications: 'Notifications',
      showAllNotifications: 'Show All Notifications',
      enableNotifications: 'Enable Notifications',
      about: 'About',
      quit: 'Quit',
    },
  },
  ar: {
    tray: {
      hideWindow: 'إخفاء النافذة',
      showWindow: 'إظهار النافذة',
      dashboard: 'لوحة القيادة',
      pos: 'نقطة البيع',
      notifications: 'الإشعارات',
      showAllNotifications: 'إظهار جميع الإشعارات',
      enableNotifications: 'تمكين الإشعارات',
      about: 'حول',
      quit: 'إنهاء',
    },
  },
};

// Get language from local storage or default to English
let currentLanguage: Language = 'en';
let store: Store | null = null;

/**
 * Set the current language
 */
export function setLanguage(lang: Language): void {
  currentLanguage = lang;
  if (store) {
    store.set('language', lang);
  }
}

/**
 * Get the current language
 */
export function getCurrentLanguage(): Language {
  return currentLanguage;
}

/**
 * Get translation function
 */
export function getTranslations(): ElectronTranslations {
  return translations[currentLanguage];
}

/**
 * Initialize i18n from stored preference
 */
export function initializeI18n(): void {
  try {
    store = new Store();
    const savedLanguage = store.get('language', 'en') as Language;
    if (savedLanguage === 'en' || savedLanguage === 'ar') {
      currentLanguage = savedLanguage;
    } else {
      currentLanguage = 'en';
    }
    console.log(`📝 Language initialized: ${currentLanguage}`);
  } catch (error) {
    console.error('❌ Error initializing i18n:', error);
    currentLanguage = 'en';
  }
}