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
  Zap
} from 'lucide-react';

const LandingPage = () => {
  const features = [
    {
      icon: Dumbbell,
      title: 'Exercise Library',
      description: 'Browse hundreds of exercises with detailed instructions, images, and muscle group targeting.'
    },
    {
      icon: Target,
      title: 'Custom Workouts',
      description: 'Build personalized workouts by selecting exercises and configuring sets, reps, and rest times.'
    },
    {
      icon: Calendar,
      title: 'Training Programs',
      description: 'Combine workouts into structured weekly programs or follow our predefined plans.'
    },
    {
      icon: BarChart3,
      title: 'Track Progress',
      description: 'Log your completed workouts and monitor your consistency and improvements over time.'
    }
  ];

  const benefits = [
    'No more scattered notes or multiple apps',
    'Access your workouts anywhere, anytime',
    'Follow structured programs or create your own',
    'Track your progress and stay motivated',
    'Works on all devices - desktop, tablet, mobile',
    'Free to use with all core features'
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMmM1NWUiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 sm:mb-6">
                Your Smart
                <span className="block text-primary-400">Workout Planner</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-8 max-w-xl mx-auto lg:mx-0">
                Create custom workouts, follow structured programs, and track your fitness journey. 
                Everything you need to reach your goals, in one place.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <Link to="/signup" className="btn-primary btn-lg gap-2">
                  Get Started Free
                  <ChevronRight className="w-5 h-5" />
                </Link>
                <Link to="/exercises" className="btn bg-white/10 text-white hover:bg-white/20 btn-lg">
                  Browse Exercises
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
                      <h3 className="font-semibold">Push Day</h3>
                      <p className="text-sm text-gray-400">6 exercises • 45 min</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {['Bench Press', 'Incline Dumbbell Press', 'Overhead Press', 'Lateral Raises'].map((exercise, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
                        <div className="w-8 h-8 bg-primary-500/20 rounded-lg flex items-center justify-center text-sm font-medium text-primary-400">
                          {i + 1}
                        </div>
                        <span className="text-sm">{exercise}</span>
                        <span className="ml-auto text-xs text-gray-400">4x12</span>
                      </div>
                    ))}
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
              Everything You Need to Succeed
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              FitFlow provides all the tools you need to plan, execute, and track your fitness journey.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
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
                Why Choose FitFlow?
              </h2>
              <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8">
                Stop juggling multiple apps and scattered notes. FitFlow brings everything together 
                in one intuitive platform designed for fitness enthusiasts at every level.
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
                <div className="text-gray-600">Active Users</div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <Dumbbell className="w-10 h-10 text-primary-500 mb-3" />
                <div className="text-3xl font-bold text-gray-900">50+</div>
                <div className="text-gray-600">Exercises</div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <Smartphone className="w-10 h-10 text-primary-500 mb-3" />
                <div className="text-3xl font-bold text-gray-900">100%</div>
                <div className="text-gray-600">Responsive</div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <Zap className="w-10 h-10 text-primary-500 mb-3" />
                <div className="text-3xl font-bold text-gray-900">Free</div>
                <div className="text-gray-600">To Use</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Start Your Fitness Journey?
          </h2>
          <p className="text-lg text-primary-100 mb-8 max-w-2xl mx-auto">
            Join FitFlow today and take control of your training. Create your first workout in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="btn bg-white text-primary-600 hover:bg-gray-100 btn-lg gap-2">
              Create Free Account
              <ChevronRight className="w-5 h-5" />
            </Link>
            <Link to="/login" className="btn bg-primary-700 text-white hover:bg-primary-800 btn-lg">
              Already have an account?
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
