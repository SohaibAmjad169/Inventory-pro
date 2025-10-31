interface TranslationCache {
  [key: string]: {
    [lang: string]: string;
  };
}

class AutoTranslator {
  private cache: TranslationCache = {};
  private isOnline = navigator.onLine;

  constructor() {
    this.loadCache();
    
    window.addEventListener('online', () => this.isOnline = true);
    window.addEventListener('offline', () => this.isOnline = false);
  }

  private loadCache() {
    const cached = localStorage.getItem('translation_cache');
    if (cached) {
      this.cache = JSON.parse(cached);
    }
  }

  private saveCache() {
    localStorage.setItem('translation_cache', JSON.stringify(this.cache));
  }

  async translate(text: string, targetLang: 'ar' | 'en'): Promise<string> {
    if (targetLang === 'en') return text;

    const cacheKey = text.toLowerCase().trim();
    if (this.cache[cacheKey]?.[targetLang]) {
      return this.cache[cacheKey][targetLang];
    }

    if (!this.isOnline) {
      return text;
    }

    try {
      let translatedText = text;

      translatedText = await this.tryGoogleTranslate(text, targetLang) ||
                     await this.tryMicrosoftTranslate(text, targetLang) ||
                     await this.tryLibreTranslate(text, targetLang) ||
                     text;

      if (!this.cache[cacheKey]) {
        this.cache[cacheKey] = {};
      }
      this.cache[cacheKey][targetLang] = translatedText;
      this.saveCache();

      return translatedText;
    } catch (error) {
      console.warn('Translation failed:', error);
      return text; 
    }
  }

  private async tryGoogleTranslate(text: string, targetLang: string): Promise<string | null> {
    try {
      const response = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
      );
      const data = await response.json();
      return data[0]?.[0]?.[0] || null;
    } catch {
      return null;
    }
  }

  private async tryMicrosoftTranslate(_text: string, _targetLang: string): Promise<string | null> {
    return null;
  }

  private async tryLibreTranslate(text: string, targetLang: string): Promise<string | null> {
    try {
      const response = await fetch('https://libretranslate.de/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: 'en',
          target: targetLang,
          format: 'text'
        })
      });
      const data = await response.json();
      return data.translatedText || null;
    } catch {
      return null;
    }
  }

  clearCache() {
    this.cache = {};
    localStorage.removeItem('translation_cache');
  }
}

export const autoTranslator = new AutoTranslator();