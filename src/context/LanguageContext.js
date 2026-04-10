import React, { createContext, useState, useContext } from 'react';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('hi'); // 'hi' or 'en'

  const toggleLang = () => setLang(prev => prev === 'hi' ? 'en' : 'hi');

  const t = (hiText, enText) => lang === 'hi' ? hiText : enText;

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);
