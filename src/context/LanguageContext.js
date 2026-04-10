import React, { createContext, useState, useContext } from 'react';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('hi'); // 'hi', 'en', 'mr'

  const toggleLang = () => {
    if (lang === 'hi') setLang('en');
    else if (lang === 'en') setLang('mr');
    else setLang('hi');
  };

  const setLanguage = (l) => setLang(l);

  const t = (hiText, enText, mrText) => {
    if (lang === 'hi') return hiText;
    if (lang === 'mr') return mrText || hiText; // Fallback to Hindi if Marathi missing
    return enText;
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);
