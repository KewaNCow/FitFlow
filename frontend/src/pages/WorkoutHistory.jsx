import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { workoutLogAPI } from '../services/api';
import { 
  Calendar,
  Dumbbell,
  Clock,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Activity
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useTranslation } from 'react-i18next';

const WorkoutHistory = () => {
  const { t } = useTranslation();
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [logsRes, statsRes] = await Promise.all([
        workoutLogAPI.getAll(),
        workoutLogAPI.getStats()
      ]);
      console.log('Logs response:', logsRes.data);
      console.log('Stats response:', statsRes.data);
      setLogs(logsRes.data.data?.logs || logsRes.data.data || []);
      setStats(statsRes.data.data);
    } catch (error) {
      console.error('Error fetching workout history:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    return { daysInMonth, startingDay, year, month };
  };

  const getLogsForDate = (year, month, day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return Array.isArray(logs) ? logs.filter(log => {
      const logDate = log.completed_at || log.date;
      return logDate?.startsWith(dateStr);
    }) : [];
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const previousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));
  };

  const { daysInMonth, startingDay, year, month } = getDaysInMonth(currentMonth);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="page-container max-w-6xl">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">{t('history.title')}</h1>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="card p-3 sm:p-4 text-center">
            <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600 mx-auto mb-1 sm:mb-2" />
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total_workouts || 0}</p>
            <p className="text-xs sm:text-sm text-gray-500">{t('history.workouts')}</p>
          </div>
          <div className="card p-3 sm:p-4 text-center">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mx-auto mb-1 sm:mb-2" />
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{formatDuration(stats.total_minutes)}</p>
            <p className="text-xs sm:text-sm text-gray-500">{t('history.totalTime')}</p>
          </div>
          <div className="card p-3 sm:p-4 text-center">
            <Dumbbell className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mx-auto mb-1 sm:mb-2" />
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total_exercises || 0}</p>
            <p className="text-xs sm:text-sm text-gray-500">{t('common.exercises')}</p>
          </div>
          <div className="card p-3 sm:p-4 text-center">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 mx-auto mb-1 sm:mb-2" />
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total_sets || 0}</p>
            <p className="text-xs sm:text-sm text-gray-500">{t('history.totalSets')}</p>
          </div>
          <div className="card p-3 sm:p-4 text-center">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 mx-auto mb-1 sm:mb-2" />
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.currentStreak || 0}</p>
            <p className="text-xs sm:text-sm text-gray-500">{t('dashboard.dayStreak')}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Calendar */}
        <div className="card p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="overflow-x-auto -mx-2 px-2">
            <div className="min-w-[520px]">
              {/* Days of week header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: startingDay }, (_, i) => (
                  <div key={`empty-${i}`} className="h-10" />
                ))}

                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1;
                  const dayLogs = getLogsForDate(year, month, day);
                  const hasWorkout = dayLogs.length > 0;
                  const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

                  return (
                    <div
                      key={day}
                      className={`
                        h-10 flex items-center justify-center rounded-lg text-sm
                        ${hasWorkout ? 'bg-primary-100 text-primary-700 font-medium' : ''}
                        ${isToday ? 'ring-2 ring-primary-500' : ''}
                      `}
                    >
                      {day}
                      {hasWorkout && (
                        <span className="ml-1">
                          <Dumbbell className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Workouts List */}
        <div className="card p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">{t('history.recent')}</h2>
          
          {!Array.isArray(logs) || logs.length === 0 ? (
            <div className="text-center py-8">
              <Dumbbell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('history.noLogs')}</h3>
              <p className="text-gray-500 mb-4">{t('history.startLogging')}</p>
              <Link to="/my-workouts" className="btn-primary">
                {t('history.goToWorkouts')}
              </Link>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {logs.slice(0, 20).map((log) => (
                <div key={log.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Dumbbell className="w-5 h-5 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      {log.workout_id ? (
                        <Link 
                          to={`/my-workouts/${log.workout_id}`}
                          className="font-medium text-gray-900 hover:text-primary-600 truncate block"
                        >
                          {log.workout_name || 'Unknown Workout'}
                        </Link>
                      ) : (
                        <p className="font-medium text-gray-900 truncate">
                          {log.workout_name || 'Quick Workout'}
                        </p>
                      )}
                      <p className="text-sm text-gray-500">
                        {formatDate(log.completed_at || log.date)}
                      </p>
                      {log.exercises_completed > 0 && (
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
                          <span className="flex items-center gap-1">
                            <Activity className="w-3 h-3" />
                            {log.exercises_completed} {log.exercises_completed === 1 ? 'exercise' : 'exercises'}
                          </span>
                          {log.total_sets > 0 && (
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              {log.total_sets} {log.total_sets === 1 ? 'set' : 'sets'}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-medium text-gray-900">
                        {formatDuration(log.duration_minutes)}
                      </p>
                      {log.notes && log.notes.includes('Completed') && (
                        <p className="text-xs text-gray-500 mt-1">
                          {log.notes.split('exercises')[0]}exercises
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkoutHistory;
