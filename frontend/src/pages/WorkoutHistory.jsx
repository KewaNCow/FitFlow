import { useState, useEffect } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { workoutLogAPI } from '../services/api';
import { 
  Calendar,
  Dumbbell,
  Clock,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Activity,
  Flame,
  MapPin,
  Trophy,
  X,
  Weight,
  Target,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useTranslation } from 'react-i18next';

const WorkoutHistory = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showSummary, setShowSummary] = useState(false);
  const [workoutSummary, setWorkoutSummary] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDateLogs, setSelectedDateLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [logDetails, setLogDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [expandedExercises, setExpandedExercises] = useState({});

  useEffect(() => {
    fetchData();
    
    // Check if we have a workout summary from navigation
    if (location.state?.summary) {
      setWorkoutSummary(location.state.summary);
      setShowSummary(true);
      // Clear the state to prevent showing again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Handle URL parameter for opening specific log
  useEffect(() => {
    const logId = searchParams.get('log');
    if (logId && logs.length > 0) {
      const log = logs.find(l => l.id === parseInt(logId));
      if (log) {
        handleViewLogDetails(log);
        // Clear the URL parameter
        setSearchParams({});
      }
    }
  }, [searchParams, logs]);

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

  const handleDateClick = (year, month, day) => {
    const dayLogs = getLogsForDate(year, month, day);
    if (dayLogs.length > 0) {
      setSelectedDate(new Date(year, month, day));
      setSelectedDateLogs(dayLogs);
    }
  };

  const handleViewLogDetails = async (log) => {
    setSelectedLog(log);
    setLoadingDetails(true);
    try {
      const response = await workoutLogAPI.getById(log.id);
      setLogDetails(response.data.data);
    } catch (error) {
      console.error('Error fetching log details:', error);
      setLogDetails(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  const toggleExerciseExpanded = (exerciseId) => {
    setExpandedExercises(prev => ({
      ...prev,
      [exerciseId]: !prev[exerciseId]
    }));
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
      {/* Workout Summary Modal */}
      {showSummary && workoutSummary && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{t('history.workoutComplete')}</h2>
                  <p className="text-sm text-gray-500">{workoutSummary.workoutName}</p>
                </div>
              </div>
              <button
                onClick={() => setShowSummary(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{workoutSummary.duration || 0}m</p>
                <p className="text-xs text-gray-500">{t('history.duration')}</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 text-center">
                <Dumbbell className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{workoutSummary.exercisesCompleted || 0}</p>
                <p className="text-xs text-gray-500">{t('common.exercises')}</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-4 text-center">
                <TrendingUp className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{workoutSummary.setsCompleted || 0}</p>
                <p className="text-xs text-gray-500">{t('history.sets')}</p>
              </div>
              {workoutSummary.caloriesBurned > 0 ? (
                <div className="bg-red-50 rounded-xl p-4 text-center">
                  <Flame className="w-6 h-6 text-red-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{workoutSummary.caloriesBurned}</p>
                  <p className="text-xs text-gray-500">{t('statistics.overview.calories')}</p>
                </div>
              ) : (
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <Activity className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">✓</p>
                  <p className="text-xs text-gray-500">{t('history.completed')}</p>
                </div>
              )}
            </div>
            
            {workoutSummary.distanceCovered > 0 && (
              <div className="bg-cyan-50 rounded-xl p-4 mb-6 flex items-center justify-center gap-3">
                <MapPin className="w-6 h-6 text-cyan-600" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{workoutSummary.distanceCovered.toFixed(2)} km</p>
                  <p className="text-xs text-gray-500">{t('statistics.overview.distance')}</p>
                </div>
              </div>
            )}
            
            <button
              onClick={() => setShowSummary(false)}
              className="w-full btn-primary"
            >
              {t('common.continue')}
            </button>
          </div>
        </div>
      )}

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

          {/* Calendar - fully responsive, no scroll needed */}
          <div>
            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-2">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                <div key={idx} className="text-center text-xs font-medium text-gray-500 py-1 sm:py-2">
                  <span className="hidden sm:inline">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][idx]}</span>
                  <span className="sm:hidden">{day}</span>
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
              {Array.from({ length: startingDay }, (_, i) => (
                <div key={`empty-${i}`} className="aspect-square sm:h-10" />
              ))}

              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const dayLogs = getLogsForDate(year, month, day);
                const hasWorkout = dayLogs.length > 0;
                const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => hasWorkout && handleDateClick(year, month, day)}
                    className={`
                      aspect-square sm:h-10 flex items-center justify-center rounded-lg text-xs sm:text-sm transition-colors
                      ${hasWorkout ? 'bg-primary-100 text-primary-700 font-medium hover:bg-primary-200 cursor-pointer' : 'cursor-default'}
                      ${isToday ? 'ring-2 ring-primary-500' : ''}
                    `}
                    disabled={!hasWorkout}
                  >
                    {day}
                    {hasWorkout && (
                      <span className="ml-0.5 sm:ml-1 hidden xs:inline">
                        <Dumbbell className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      </span>
                    )}
                  </button>
                );
              })}
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
                <button
                  key={log.id}
                  type="button"
                  onClick={() => handleViewLogDetails(log)}
                  className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Dumbbell className="w-5 h-5 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 hover:text-primary-600 truncate">
                        {log.workout_name || t('history.quickWorkout')}
                      </p>
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
                      <p className="text-xs text-primary-600 mt-1">
                        {t('history.viewDetails')}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Date Modal - Show workouts for selected date */}
      {selectedDate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h3>
              <button
                onClick={() => setSelectedDate(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
              {selectedDateLogs.map((log) => (
                <button
                  key={log.id}
                  type="button"
                  onClick={() => {
                    setSelectedDate(null);
                    handleViewLogDetails(log);
                  }}
                  className="w-full text-left p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                      <Dumbbell className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{log.workout_name || t('history.quickWorkout')}</p>
                      <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDuration(log.duration_minutes)}
                        </span>
                        {log.exercises_completed > 0 && (
                          <span className="flex items-center gap-1">
                            <Activity className="w-3 h-3" />
                            {log.exercises_completed} {t('common.exercises').toLowerCase()}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Workout Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedLog.workout_name || t('history.quickWorkout')}
                </h3>
                <p className="text-sm text-gray-500">
                  {formatDate(selectedLog.completed_at || selectedLog.date)}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedLog(null);
                  setLogDetails(null);
                  setExpandedExercises({});
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {loadingDetails ? (
              <div className="p-8 flex items-center justify-center">
                <LoadingSpinner size="md" />
              </div>
            ) : logDetails ? (
              <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
                {/* Workout Summary Stats */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <Clock className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-gray-900">{logDetails.duration_minutes || 0}m</p>
                    <p className="text-xs text-gray-500">{t('history.duration')}</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-3 text-center">
                    <Dumbbell className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-gray-900">{logDetails.exercises?.length || 0}</p>
                    <p className="text-xs text-gray-500">{t('common.exercises')}</p>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-3 text-center">
                    <TrendingUp className="w-5 h-5 text-orange-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-gray-900">
                      {logDetails.exercises?.reduce((sum, ex) => sum + (ex.sets_completed || 0), 0) || 0}
                    </p>
                    <p className="text-xs text-gray-500">{t('history.sets')}</p>
                  </div>
                </div>

                {/* Exercises List */}
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary-500" />
                  {t('history.exerciseDetails')}
                </h4>
                
                {logDetails.exercises && logDetails.exercises.length > 0 ? (
                  <div className="space-y-2">
                    {logDetails.exercises.map((exercise) => (
                      <div key={exercise.id} className="bg-gray-50 rounded-xl overflow-hidden">
                        <button
                          type="button"
                          onClick={() => toggleExerciseExpanded(exercise.id)}
                          className="w-full p-3 flex items-center justify-between hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                              <Dumbbell className="w-4 h-4 text-primary-600" />
                            </div>
                            <div className="text-left">
                              <p className="font-medium text-gray-900 text-sm">{exercise.exercise_name}</p>
                              <p className="text-xs text-gray-500">
                                {exercise.sets_completed || 0} {t('history.sets').toLowerCase()} • {exercise.total_reps || 0} {t('history.reps').toLowerCase()}
                              </p>
                            </div>
                          </div>
                          {expandedExercises[exercise.id] ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                        
                        {expandedExercises[exercise.id] && (
                          <div className="px-3 pb-3 border-t bg-white">
                            {exercise.weight_per_set && exercise.weight_per_set.length > 0 ? (
                              <div className="mt-3 space-y-2">
                                <p className="text-xs font-medium text-gray-500 uppercase">{t('history.setBySet')}</p>
                                {exercise.weight_per_set.map((weight, idx) => (
                                  <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                    <span className="text-sm text-gray-600">{t('history.set')} {idx + 1}</span>
                                    <div className="flex items-center gap-4">
                                      <span className="text-sm font-medium text-gray-900">
                                        {weight > 0 ? `${weight} kg` : '-'}
                                      </span>
                                      <span className="text-sm text-gray-500">
                                        × {exercise.reps_per_set?.[idx] || 0} {t('history.reps').toLowerCase()}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                                {exercise.max_weight > 0 && (
                                  <div className="mt-2 pt-2 border-t flex items-center justify-between">
                                    <span className="text-xs text-gray-500">{t('history.maxWeight')}</span>
                                    <span className="text-sm font-bold text-primary-600">{exercise.max_weight} kg</span>
                                  </div>
                                )}
                                {exercise.total_volume > 0 && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500">{t('history.totalVolume')}</span>
                                    <span className="text-sm font-bold text-primary-600">{exercise.total_volume.toLocaleString()} kg</span>
                                  </div>
                                )}
                              </div>
                            ) : exercise.duration ? (
                              <div className="mt-3 space-y-2">
                                <div className="flex items-center justify-between py-2">
                                  <span className="text-sm text-gray-600">{t('history.duration')}</span>
                                  <span className="text-sm font-medium text-gray-900">{exercise.duration} min</span>
                                </div>
                                {exercise.distance && (
                                  <div className="flex items-center justify-between py-2 border-t">
                                    <span className="text-sm text-gray-600">{t('statistics.overview.distance')}</span>
                                    <span className="text-sm font-medium text-gray-900">{exercise.distance} km</span>
                                  </div>
                                )}
                                {exercise.calories && (
                                  <div className="flex items-center justify-between py-2 border-t">
                                    <span className="text-sm text-gray-600">{t('statistics.overview.calories')}</span>
                                    <span className="text-sm font-medium text-gray-900">{exercise.calories} kcal</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <p className="mt-3 text-sm text-gray-500">{t('history.noDetailedData')}</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">{t('history.noExerciseData')}</p>
                )}

                {/* Notes */}
                {logDetails.notes && (
                  <div className="mt-4 p-3 bg-yellow-50 rounded-xl">
                    <p className="text-xs font-medium text-gray-500 mb-1">{t('history.notes')}</p>
                    <p className="text-sm text-gray-700">{logDetails.notes}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                {t('history.errorLoadingDetails')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutHistory;
