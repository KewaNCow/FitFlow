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
  Target,
  History,
  Play,
  Filter,
  X
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAllLogs, setShowAllLogs] = useState(false);
  const [filterWorkoutId, setFilterWorkoutId] = useState(null);
  
  // Number of quick action items (dynamic)
  const QUICK_ACTION_COUNT = 4;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [workoutsRes, statsRes, logsRes] = await Promise.all([
        workoutAPI.getAll(),
        workoutLogAPI.getStats({ period: 'month' }),
        workoutLogAPI.getAll({ limit: 20 })
      ]);
      setWorkouts(workoutsRes.data.data);
      setStats(statsRes.data.data);
      setRecentLogs(logsRes.data.data?.logs || logsRes.data.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get the latest log for a specific workout
  const getLatestLogForWorkout = (workoutId) => {
    return recentLogs.find(log => log.workout_id === workoutId);
  };

  const formatTimeAgo = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return t('dashboard.minutesAgo', { count: diffMins });
    if (diffHours < 24) return t('dashboard.hoursAgo', { count: diffHours });
    if (diffDays === 1) return t('dashboard.yesterday');
    if (diffDays < 7) return t('dashboard.daysAgo', { count: diffDays });
    return date.toLocaleDateString();
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
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
          {t('dashboard.welcomeBack', { name: user?.firstName })} 👋
        </h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">
          {t('dashboard.readyToWorkout')}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="card p-4 sm:p-5">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats?.totalWorkouts || 0}</p>
              <p className="text-xs sm:text-sm text-gray-500 truncate">{t('dashboard.workoutsThisMonth')}</p>
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
              <p className="text-xs sm:text-sm text-gray-500 truncate">{t('dashboard.dayStreak')}</p>
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
              <p className="text-xs sm:text-sm text-gray-500 truncate">{t('dashboard.minutesActive')}</p>
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
              <p className="text-xs sm:text-sm text-gray-500 truncate">{t('dashboard.myWorkouts')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Workouts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">{t('dashboard.quickActions')}</h2>
          <div className="space-y-3">
            <Link
              to="/my-workouts/new"
              className="card-hover p-4 flex items-center gap-4 group"
            >
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                <Plus className="w-6 h-6 text-primary-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{t('dashboard.createWorkout')}</p>
                <p className="text-sm text-gray-500">{t('dashboard.buildNewWorkout')}</p>
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
                <p className="font-medium text-gray-900">{t('dashboard.browseExercises')}</p>
                <p className="text-sm text-gray-500">{t('dashboard.exploreLibrary')}</p>
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
                <p className="font-medium text-gray-900">{t('dashboard.myPrograms')}</p>
                <p className="text-sm text-gray-500">{t('dashboard.viewPrograms')}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600" />
            </Link>

            <Link
              to="/history"
              className="card-hover p-4 flex items-center gap-4 group bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
            >
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <History className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{t('dashboard.workoutHistory')}</p>
                <p className="text-sm text-gray-500">{t('dashboard.viewPastWorkouts')}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-600" />
            </Link>
          </div>
        </div>

        {/* Recent Workouts */}
        <div className="lg:col-span-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">{t('dashboard.myWorkouts')}</h2>
            <Link to="/my-workouts" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              {t('common.viewAll')}
            </Link>
          </div>

          {workouts.length === 0 ? (
            <div className="card p-6 sm:p-8 text-center">
              <Dumbbell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('dashboard.noWorkoutsYet')}</h3>
              <p className="text-gray-500 mb-4">{t('dashboard.createFirstWorkout')}</p>
              <Link to="/my-workouts/new" className="btn-primary">
                {t('dashboard.createWorkout')}
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {workouts.slice(0, QUICK_ACTION_COUNT).map((workout) => {
                const latestLog = getLatestLogForWorkout(workout.id);
                return (
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
                        {workout.exercise_count || 0} {t('common.exercises')}
                      </p>
                    </div>
                    {latestLog ? (
                      <button
                        onClick={() => {
                          setFilterWorkoutId(filterWorkoutId === workout.id ? null : workout.id);
                          setShowAllLogs(true);
                        }}
                        className={`flex flex-col items-end text-right px-2 py-1 rounded-lg transition-colors ${
                          filterWorkoutId === workout.id 
                            ? 'bg-primary-100 ring-2 ring-primary-500' 
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Filter className="w-3 h-3" />
                          {t('dashboard.lastActivity')}
                        </span>
                        <span className="text-xs sm:text-sm font-medium text-primary-600">
                          {formatTimeAgo(latestLog.completed_at || latestLog.created_at)}
                        </span>
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">{t('dashboard.noActivity')}</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Workout History */}
      <div className="mt-6 sm:mt-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
            <History className="w-5 h-5 text-gray-500" />
            {t('dashboard.recentActivity')}
            {filterWorkoutId && (
              <span className="ml-2 inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                <Filter className="w-3 h-3" />
                {workouts.find(w => w.id === filterWorkoutId)?.name}
                <button
                  onClick={() => setFilterWorkoutId(null)}
                  className="ml-1 hover:bg-primary-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </h2>
          <div className="flex items-center gap-2">
            {filterWorkoutId && (
              <button
                onClick={() => setFilterWorkoutId(null)}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                {t('common.clearFilter')}
              </button>
            )}
            {(filterWorkoutId ? recentLogs.filter(log => log.workout_id === filterWorkoutId) : recentLogs).length > 5 && (
              <button
                onClick={() => setShowAllLogs(!showAllLogs)}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                {showAllLogs ? t('common.showLess') : t('common.viewAll')} ({(filterWorkoutId ? recentLogs.filter(log => log.workout_id === filterWorkoutId) : recentLogs).length})
              </button>
            )}
          </div>
        </div>

        {(() => {
          const filteredLogs = filterWorkoutId 
            ? recentLogs.filter(log => log.workout_id === filterWorkoutId)
            : recentLogs;
          const displayLogs = showAllLogs ? filteredLogs : filteredLogs.slice(0, 5);
          
          if (filteredLogs.length === 0) {
            return (
              <div className="card p-6 text-center">
                <History className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">
                  {filterWorkoutId ? t('dashboard.noLogsForWorkout') : t('dashboard.noRecentActivity')}
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  {filterWorkoutId 
                    ? t('dashboard.tryDifferentWorkout')
                    : t('dashboard.completeWorkoutToSee')
                  }
                </p>
                {filterWorkoutId && (
                  <button
                    onClick={() => setFilterWorkoutId(null)}
                    className="mt-3 text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    {t('common.clearFilter')}
                  </button>
                )}
              </div>
            );
          }
          
          return (
            <div className="card divide-y divide-gray-100">
              {displayLogs.map((log) => (
                <Link
                key={log.id}
                to={`/history?log=${log.id}`}
                className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4 hover:bg-gray-50 transition-colors block"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Play className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                    {log.workout_name || t('dashboard.workout')}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDuration(log.duration_minutes)}
                    </span>
                    {log.exercises_completed > 0 && (
                      <span className="flex items-center gap-1">
                        <Dumbbell className="w-3 h-3" />
                        {log.exercises_completed} {t('common.exercises')}
                      </span>
                    )}
                    {log.calories_burned > 0 && (
                      <span className="flex items-center gap-1">
                        <Flame className="w-3 h-3 text-orange-500" />
                        {log.calories_burned} kcal
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs sm:text-sm text-gray-400">{formatTimeAgo(log.completed_at)}</p>
                  <p className="text-xs text-primary-600 mt-1">{t('dashboard.viewDetails')}</p>
                </div>
              </Link>
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default Dashboard;
