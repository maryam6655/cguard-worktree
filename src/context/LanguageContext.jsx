import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { isSupportedLanguage, translations } from '../i18n/translations';

const LANGUAGE_STORAGE_KEY = 'cguard-language';

const LanguageContext = createContext(null);

const readStoredLanguage = () => {
  if (typeof window === 'undefined') return 'en';
  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return isSupportedLanguage(stored) ? stored : 'en';
  } catch {
    return 'en';
  }
};

/**
 * `suppressRtl` is kept in the props signature for backwards compatibility
 * with App.jsx, but the provider no longer flips `document.documentElement.dir`.
 * The whole site stays LTR at all times — only individual Urdu text blocks
 * opt-in to RTL via the global `.urdu-text` utility class (defined in App.css)
 * or `urdu-text` class wherever Urdu content actually renders.
 */
// eslint-disable-next-line no-unused-vars
export function LanguageProvider({ children, suppressRtl = false }) {
  const [language, setLanguageState] = useState(readStoredLanguage);

  const setLanguage = useCallback((next) => {
    if (!isSupportedLanguage(next)) return;
    setLanguageState(next);
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
    } catch {
      /* localStorage unavailable — preference will only last for this session */
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((current) => {
      const next = current === 'ur' ? 'en' : 'ur';
      try {
        window.localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
      } catch { /* ignore */ }
      return next;
    });
  }, []);

  /** Translator. Falls back through: requested language → English → key. */
  const t = useCallback(
    (key, fallback) => {
      const dict = translations[language] ?? translations.en;
      if (dict && Object.prototype.hasOwnProperty.call(dict, key)) return dict[key];
      const enDict = translations.en;
      if (enDict && Object.prototype.hasOwnProperty.call(enDict, key)) return enDict[key];
      return fallback ?? key;
    },
    [language]
  );

  // The provider intentionally does NOT touch `document.documentElement.dir`.
  // Flipping the whole document to RTL was breaking the navbar, hero, and other
  // public layouts. Urdu is now applied per-element via the `.urdu-text` class
  // (see App.css). Authority pages are unaffected for the same reason.

  const value = useMemo(
    () => ({ language, setLanguage, toggleLanguage, t }),
    [language, setLanguage, toggleLanguage, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

/**
 * Hook used by public components. Returns a safe English fallback if used
 * outside the provider, so a stray render can never crash.
 */
export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (ctx) return ctx;
  return {
    language: 'en',
    setLanguage: () => {},
    toggleLanguage: () => {},
    t: (key, fallback) => {
      const en = translations.en;
      if (en && Object.prototype.hasOwnProperty.call(en, key)) return en[key];
      return fallback ?? key;
    },
  };
}
