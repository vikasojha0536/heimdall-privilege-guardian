
import React, { createContext, useState, useContext, useEffect } from "react";

type Language = "en" | "de" | "el" | "hu";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

// Translation keys
const translations: Translations = {
  "welcome": {
    en: "Welcome to Heimdall",
    de: "Willkommen bei Heimdall",
    el: "Καλωσήρθατε στο Heimdall",
    hu: "Üdvözöljük a Heimdall-ban"
  },
  "dashboard": {
    en: "Dashboard",
    de: "Instrumententafel",
    el: "Πίνακας ελέγχου",
    hu: "Irányítópult"
  },
  "privileges": {
    en: "Privileges",
    de: "Privilegien",
    el: "Προνόμια",
    hu: "Kiváltságok"
  },
  "accessRequests": {
    en: "Access Requests",
    de: "Zugriffsanfragen",
    el: "Αιτήματα πρόσβασης",
    hu: "Hozzáférési kérelmek"
  },
  "platformDescription": {
    en: "Deutsche Telekom Privilege Management Platform",
    de: "Deutsche Telekom Plattform für Privilegienverwaltung",
    el: "Πλατφόρμα Διαχείρισης Προνομίων Deutsche Telekom",
    hu: "Deutsche Telekom Jogosultság Kezelő Platform"
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const getInitialLanguage = (): Language => {
    if (typeof window !== "undefined" && window.localStorage) {
      const storedLang = window.localStorage.getItem("language") as Language;
      if (storedLang && ["en", "de", "el", "hu"].includes(storedLang)) {
        return storedLang;
      }
    }
    return "en"; // Default to English
  };
  
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);
  
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };
  
  const t = (key: string): string => {
    if (!translations[key]) {
      console.warn(`Translation key "${key}" not found`);
      return key;
    }
    return translations[key][language] || translations[key].en || key;
  };
  
  const value = {
    language,
    setLanguage,
    t
  };
  
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
