import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../locales/translations';

const LanguageContext = createContext();

export const useLanguageContext = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguageContext must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(
    () => localStorage.getItem('lang') || 'vi'
  );

  const t = (key) => {
    return translations[currentLanguage][key] || key;
  };

  const changeLanguage = (lang) => {
    setCurrentLanguage(lang);
    localStorage.setItem('lang', lang);
  };

  useEffect(() => {
    // Cập nhật ngôn ngữ khi component mount
    const savedLang = localStorage.getItem('lang');
    if (savedLang && savedLang !== currentLanguage) {
      setCurrentLanguage(savedLang);
    }
  }, [currentLanguage]);

  const value = {
    currentLanguage,
    changeLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
