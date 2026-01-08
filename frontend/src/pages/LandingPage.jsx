import { Link } from 'react-router-dom';
import { 
  Dumbbell, 
  Target, 
  BarChart3, 
  Calendar,
  ChevronRight,
  CheckCircle2,
  Users,
  Smartphone,
  Zap,
  MapPin,
  Timer,
  Flame
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const LandingPage = () => {
  const { t } = useTranslation();
  
  const features = [
    {
      icon: Dumbbell,
      title: t('landing.features.exercise.title'),
      description: t('landing.features.exercise.description')
    },
    {
      icon: Target,
      title: t('landing.features.workout.title'),
      description: t('landing.features.workout.description')
    },
    {
      icon: MapPin,
      title: t('landing.features.routes.title'),
      description: t('landing.features.routes.description')
    },
    {
      icon: Calendar,
      title: t('landing.features.program.title'),
      description: t('landing.features.program.description')
    },
    {
      icon: Timer,
      title: t('landing.features.cardio.title'),
      description: t('landing.features.cardio.description')
    },
    {
      icon: BarChart3,
      title: t('landing.features.tracking.title'),
      description: t('landing.features.tracking.description')
    }
  ];

  const benefits = [
    t('landing.benefits.0'),
    t('landing.benefits.1'),
    t('landing.benefits.2'),
    t('landing.benefits.3'),
    t('landing.benefits.4'),
    t('landing.benefits.5'),
    t('landing.benefits.6'),
    t('landing.benefits.7')
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden"
        aria-labelledby="hero-heading"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMmM1NWUiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" aria-hidden="true"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 id="hero-heading" className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 sm:mb-6">
                {t('landing.hero.title')}
                <span className="block text-primary-400">{t('landing.hero.subtitle')}</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-8 max-w-xl mx-auto lg:mx-0">
                {t('landing.hero.description')}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <Link to="/signup" className="btn-primary btn-lg gap-2">
                  {t('landing.cta.getStarted')}
                  <ChevronRight className="w-5 h-5" />
                </Link>
                <Link to="/exercises" className="btn bg-white/10 text-white hover:bg-white/20 btn-lg">
                  {t('landing.cta.browseExercises')}
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute -inset-4 bg-primary-500/20 rounded-3xl blur-3xl"></div>
                <div className="relative bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 shadow-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center">
                      <Dumbbell className="w-6 h-6 text-primary-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{t('landing.preview.strength.title')}</h3>
                      <p className="text-sm text-gray-400">{t('landing.preview.strength.subtitle')}</p>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    {[t('landing.preview.strength.ex1'), t('landing.preview.strength.ex2'), t('landing.preview.strength.ex3')].map((exercise, i) => (
                      <div key={i} className="flex items-center gap-3 p-2 bg-gray-700/50 rounded-lg">
                        <div className="w-6 h-6 bg-primary-500/20 rounded flex items-center justify-center text-xs font-medium text-primary-400">
                          {i + 1}
                        </div>
                        <span className="text-sm">{exercise}</span>
                        <span className="ml-auto text-xs text-gray-400">4x12</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-700 pt-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                        <Timer className="w-6 h-6 text-orange-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{t('landing.preview.cardio.title')}</h3>
                        <p className="text-sm text-gray-400">{t('landing.preview.cardio.subtitle')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-orange-400" />
                        <span>5.2 km</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Flame className="w-4 h-4 text-orange-400" />
                        <span>~320 kcal</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              {t('landing.features.title')}
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              {t('landing.features.subtitle')}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="p-4 sm:p-6 bg-gray-50 rounded-2xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                  <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm sm:text-base text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                {t('landing.why.title')}
              </h2>
              <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8">
                {t('landing.why.description')}
              </p>
              <div className="space-y-3 sm:space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary-500 flex-shrink-0" />
                    <span className="text-sm sm:text-base text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <Users className="w-10 h-10 text-primary-500 mb-3" />
                <div className="text-3xl font-bold text-gray-900">500+</div>
                <div className="text-gray-600">{t('landing.stats.users')}</div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <Dumbbell className="w-10 h-10 text-primary-500 mb-3" />
                <div className="text-3xl font-bold text-gray-900">50+</div>
                <div className="text-gray-600">{t('landing.stats.exercises')}</div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <Smartphone className="w-10 h-10 text-primary-500 mb-3" />
                <div className="text-3xl font-bold text-gray-900">100%</div>
                <div className="text-gray-600">{t('landing.stats.responsive')}</div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <Zap className="w-10 h-10 text-primary-500 mb-3" />
                <div className="text-3xl font-bold text-gray-900">{t('landing.stats.free')}</div>
                <div className="text-gray-600">{t('landing.stats.toUse')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            {t('landing.cta.ready')}
          </h2>
          <p className="text-lg text-primary-100 mb-8 max-w-2xl mx-auto">
            {t('landing.cta.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="btn bg-white text-primary-600 hover:bg-gray-100 btn-lg gap-2">
              {t('landing.cta.createAccount')}
              <ChevronRight className="w-5 h-5" />
            </Link>
            <Link to="/login" className="btn bg-primary-700 text-white hover:bg-primary-800 btn-lg">
              {t('landing.cta.haveAccount')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
