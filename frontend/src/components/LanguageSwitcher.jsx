import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'sv' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
      title={i18n.language === 'en' ? 'Switch to Swedish' : 'Byt till engelska'}
    >
      <Globe className="w-4 h-4" />
      <span className="text-sm font-medium uppercase">
        {i18n.language === 'en' ? 'EN' : 'SV'}
      </span>
    </button>
  );
};

export default LanguageSwitcher;
