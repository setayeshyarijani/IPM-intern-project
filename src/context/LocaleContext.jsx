import { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfigProvider, theme as antdTheme } from 'antd';
import faIR from 'antd/locale/fa_IR';
import enUS from 'antd/locale/en_US';
import { useThemeMode } from './ThemeModeContext';

const LocaleContext = createContext(null);

export function LocaleProvider({ children }) {
  const { i18n } = useTranslation();
  const { mode } = useThemeMode();
  const [lang, setLangState] = useState(i18n.language || 'fa');

  const dir = lang === 'fa' ? 'rtl' : 'ltr';
  const antdLocale = lang === 'fa' ? faIR : enUS;

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [dir, lang]);

  function setLang(next) {
    i18n.changeLanguage(next);
    localStorage.setItem('lang', next);
    setLangState(next);
  }

  return (
    <LocaleContext.Provider value={{ lang, setLang, dir }}>
      <ConfigProvider
        direction={dir}
        locale={antdLocale}
        theme={{
          algorithm: mode === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
          token: {
            colorPrimary: '#1677ff',
            borderRadius: 8,
            fontFamily: "'Vazirmatn', 'Segoe UI', Tahoma, sans-serif",
          },
        }}
      >
        {children}
      </ConfigProvider>
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}
