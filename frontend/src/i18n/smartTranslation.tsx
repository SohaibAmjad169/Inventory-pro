import { useState, useEffect } from 'react';
import { autoTranslator } from './autoTranslator';

interface UseSmartTranslationOptions {
  enableAutoTranslate?: boolean;
  fallbackLang?: 'en' | 'ar';
}

export function useSmartTranslation(options: UseSmartTranslationOptions = {}) {
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'ar'>('en');
  const [isTranslating, setIsTranslating] = useState(false);

  const t = async (text: string): Promise<string> => {
    if (currentLanguage === 'en') {
      return text;
    }

    if (!options.enableAutoTranslate) {
      return text;
    }

    setIsTranslating(true);
    try {
      const translated = await autoTranslator.translate(text, currentLanguage);
      return translated;
    } finally {
      setIsTranslating(false);
    }
  };

  const tSync = (text: string): string => {
    if (currentLanguage === 'en') {
      return text;
    }
    return text;
  };

  const switchLanguage = (lang: 'en' | 'ar') => {
    setCurrentLanguage(lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  return {
    t,
    tSync,
    currentLanguage,
    switchLanguage,
    isTranslating
  };
}

// Smart Translation Component - Wrap any text!
interface SmartTextProps {
  children: string;
  className?: string;
  tag?: keyof JSX.IntrinsicElements;
  [key: string]: any; // Allow any HTML attributes
}

export function SmartText({ children, className, tag: Tag = 'span', ...props }: SmartTextProps) {
  const [translatedText, setTranslatedText] = useState(children);

  useEffect(() => {
    const language = document.documentElement.lang as 'en' | 'ar';

    if (language === 'ar') {
      autoTranslator.translate(children, 'ar').then(setTranslatedText);
    } else {
      setTranslatedText(children);
    }
  }, [children]);

  // Listen for language changes
  useEffect(() => {
    const handleLanguageChange = () => {
      const newLang = document.documentElement.lang as 'en' | 'ar';
      
      if (newLang === 'ar') {
        autoTranslator.translate(children, 'ar').then(setTranslatedText);
      } else {
        setTranslatedText(children);
      }
    };

    // Listen for custom language change events
    const handleCustomLanguageChange = (event: CustomEvent) => {
      const newLang = event.detail.language as 'en' | 'ar';
      
      if (newLang === 'ar') {
        autoTranslator.translate(children, 'ar').then(setTranslatedText);
      } else {
        setTranslatedText(children);
      }
    };

    // Use MutationObserver to watch for lang attribute changes
    const observer = new MutationObserver(() => {
      handleLanguageChange();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['lang']
    });

    // Listen for custom language change events
    window.addEventListener('languageChanged', handleCustomLanguageChange as EventListener);

    return () => {
      observer.disconnect();
      window.removeEventListener('languageChanged', handleCustomLanguageChange as EventListener);
    };
  }, [children]);

  return <Tag className={className} {...props}>{translatedText}</Tag>;
}

// Helper function for translating placeholder text (returns string, not JSX)
export function useSmartPlaceholder(text: string): string {
  const [translatedText, setTranslatedText] = useState(text);

  useEffect(() => {
    const language = document.documentElement.lang as 'en' | 'ar';

    if (language === 'ar') {
      autoTranslator.translate(text, 'ar').then(setTranslatedText);
    } else {
      setTranslatedText(text);
    }
  }, [text]);

  // Listen for language changes
  useEffect(() => {
    const handleCustomLanguageChange = (event: CustomEvent) => {
      const newLang = event.detail.language as 'en' | 'ar';
      
      if (newLang === 'ar') {
        autoTranslator.translate(text, 'ar').then(setTranslatedText);
      } else {
        setTranslatedText(text);
      }
    };

    window.addEventListener('languageChanged', handleCustomLanguageChange as EventListener);

    return () => {
      window.removeEventListener('languageChanged', handleCustomLanguageChange as EventListener);
    };
  }, [text]);

  return translatedText;
}