import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const NotFound = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center px-4">
        <h1 className="text-9xl font-bold text-primary-600 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('notFound.title')}</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          {t('notFound.description')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/" className="btn-primary gap-2">
            <Home className="w-4 h-4" />
            {t('notFound.goHome')}
          </Link>
          <button 
            onClick={() => window.history.back()} 
            className="btn-secondary gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('notFound.goBack')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
