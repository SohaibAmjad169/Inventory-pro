import { useTranslation } from '../i18n/i18nContext';

export const LanguageSwitcher = () => {
  const { language, setLanguage } = useTranslation();

  const handleLanguageChange = (newLanguage: 'en' | 'ar') => {
    // Update the i18n context
    setLanguage(newLanguage);
    
    // Update document attributes for SmartText components
    document.documentElement.lang = newLanguage;
    document.documentElement.dir = newLanguage === 'ar' ? 'rtl' : 'ltr';
    
    // Trigger a custom event to notify SmartText components
    window.dispatchEvent(new CustomEvent('languageChanged', { 
      detail: { language: newLanguage } 
    }));
  };

  return (
    <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm p-1">
      <button
        onClick={() => handleLanguageChange('en')}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          language === 'en'
            ? 'bg-blue-600 text-white'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        English
      </button>
      <button
        onClick={() => handleLanguageChange('ar')}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          language === 'ar'
            ? 'bg-blue-600 text-white'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        العربية
      </button>
    </div>
  );
};





