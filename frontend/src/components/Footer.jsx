import { Link } from 'react-router-dom';
import { Dumbbell, Github, Mail, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">FitFlow</span>
            </Link>
            <p className="text-gray-400 max-w-md">
              {t('footer.tagline')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/exercises" className="hover:text-primary-400 transition-colors">
                  {t('footer.exerciseLibrary')}
                </Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-primary-400 transition-colors">
                  {t('footer.getStarted')}
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-primary-400 transition-colors">
                  {t('footer.logIn')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('footer.contact')}</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="mailto:kevin@fitflow.com" 
                  className="flex items-center gap-2 hover:text-primary-400 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  kevin@fitflow.com
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com/KewaNCow" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-primary-400 transition-colors"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} FitFlow. All rights reserved.
          </p>
          <p className="text-gray-400 text-sm flex items-center gap-1">
            {t('footer.madeWith')} <Heart className="w-4 h-4 text-red-500" /> {t('footer.by')} Kevin Robertsson
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
