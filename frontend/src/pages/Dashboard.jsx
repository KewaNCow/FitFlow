import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { workoutAPI, workoutLogAPI } from '../services/api';
import { 
  Dumbbell, 
  Plus, 
  Calendar, 
  TrendingUp, 
  Clock,
  ChevronRight,
  Flame,
  Target
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [workoutsRes, statsRes] = await Promise.all([
        workoutAPI.getAll(),
        workoutLogAPI.getStats({ period: 'month' })
      ]);
      setWorkouts(workoutsRes.data.data.slice(0, 3));
      setStats(statsRes.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLog = async (workoutId) => {
    try {
      await workoutLogAPI.create({ workoutId, durationMinutes: 45 });
      fetchDashboardData();
    } catch (error) {
      console.error('Error logging workout:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Welcome Section */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Welcome back, {user?.firstName}! 👋
        </h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">
          Ready to crush your workout today?
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="card p-4 sm:p-5">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats?.totalWorkouts || 0}</p>
              <p className="text-xs sm:text-sm text-gray-500 truncate">Workouts This Month</p>
            </div>
          </div>
        </div>

        <div className="card p-4 sm:p-5">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats?.currentStreak || 0}</p>
              <p className="text-xs sm:text-sm text-gray-500 truncate">Day Streak</p>
            </div>
          </div>
        </div>

        <div className="card p-4 sm:p-5">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats?.totalMinutes || 0}</p>
              <p className="text-xs sm:text-sm text-gray-500 truncate">Minutes Active</p>
            </div>
          </div>
        </div>

        <div className="card p-4 sm:p-5">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{workouts.length}</p>
              <p className="text-xs sm:text-sm text-gray-500 truncate">My Workouts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Workouts */}
      <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/my-workouts/new"
              className="card-hover p-4 flex items-center gap-4 group"
            >
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                <Plus className="w-6 h-6 text-primary-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Create Workout</p>
                <p className="text-sm text-gray-500">Build a new custom workout</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600" />
            </Link>

            <Link
              to="/exercises"
              className="card-hover p-4 flex items-center gap-4 group"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Dumbbell className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Browse Exercises</p>
                <p className="text-sm text-gray-500">Explore the exercise library</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
            </Link>

            <Link
              to="/my-programs"
              className="card-hover p-4 flex items-center gap-4 group"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">My Programs</p>
                <p className="text-sm text-gray-500">View training programs</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600" />
            </Link>
          </div>
        </div>

        {/* Recent Workouts */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">My Workouts</h2>
            <Link to="/my-workouts" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View all
            </Link>
          </div>

          {workouts.length === 0 ? (
            <div className="card p-6 sm:p-8 text-center">
              <Dumbbell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No workouts yet</h3>
              <p className="text-gray-500 mb-4">Create your first workout to get started!</p>
              <Link to="/my-workouts/new" className="btn-primary">
                Create Workout
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {workouts.map((workout) => (
                <div key={workout.id} className="card p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Dumbbell className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link 
                      to={`/my-workouts/${workout.id}`}
                      className="font-medium text-gray-900 hover:text-primary-600 text-sm sm:text-base"
                    >
                      {workout.name}
                    </Link>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">
                      {workout.exercise_count || 0} exercises
                    </p>
                  </div>
                  <button
                    onClick={() => handleQuickLog(workout.id)}
                    className="btn-primary btn-sm whitespace-nowrap text-xs sm:text-sm"
                  >
                    Log
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
