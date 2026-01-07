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

const WorkoutHistory = () => {
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
      setLogs(logsRes.data.data);
      setStats(statsRes.data.data);
    } catch (error) {
      console.error('Error fetching workout history:', error);
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
    return Array.isArray(logs) ? logs.filter(log => log.date?.startsWith(dateStr)) : [];
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
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">Workout History</h1>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="card p-3 sm:p-4 text-center">
            <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600 mx-auto mb-1 sm:mb-2" />
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total_workouts || 0}</p>
            <p className="text-xs sm:text-sm text-gray-500">Total Workouts</p>
          </div>
          <div className="card p-3 sm:p-4 text-center">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mx-auto mb-1 sm:mb-2" />
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.this_week || 0}</p>
            <p className="text-xs sm:text-sm text-gray-500">This Week</p>
          </div>
          <div className="card p-3 sm:p-4 text-center">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mx-auto mb-1 sm:mb-2" />
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{formatDuration(stats.total_duration)}</p>
            <p className="text-xs sm:text-sm text-gray-500">Total Time</p>
          </div>
          <div className="card p-3 sm:p-4 text-center">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 mx-auto mb-1 sm:mb-2" />
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.current_streak || 0}</p>
            <p className="text-xs sm:text-sm text-gray-500">Day Streak</p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
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
            {/* Empty cells for days before the 1st */}
            {Array.from({ length: startingDay }, (_, i) => (
              <div key={`empty-${i}`} className="h-10" />
            ))}

            {/* Days of the month */}
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

        {/* Recent Workouts List */}
        <div className="card p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Recent Workouts</h2>
          
          {!Array.isArray(logs) || logs.length === 0 ? (
            <div className="text-center py-8">
              <Dumbbell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No workouts logged yet</h3>
              <p className="text-gray-500 mb-4">Start logging your workouts to track your progress!</p>
              <Link to="/my-workouts" className="btn-primary">
                Go to Workouts
              </Link>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {logs.slice(0, 20).map((log) => (
                <div key={log.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Dumbbell className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link 
                      to={`/my-workouts/${log.workout_id}`}
                      className="font-medium text-gray-900 hover:text-primary-600 truncate block"
                    >
                      {log.workout_name}
                    </Link>
                    <p className="text-sm text-gray-500">
                      {formatDate(log.date)}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-medium text-gray-900">
                      {formatDuration(log.duration_minutes)}
                    </p>
                    {log.exercises_completed > 0 && (
                      <p className="text-xs text-gray-500">
                        {log.exercises_completed} exercises
                      </p>
                    )}
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
