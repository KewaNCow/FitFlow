import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { statisticsAPI, exerciseAPI } from '../services/api';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import {
  TrendingUp,
  Calendar,
  Dumbbell,
  Clock,
  Target,
  Flame,
  Award,
  ChevronDown
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

const Statistics = () => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');
  const [overview, setOverview] = useState(null);
  const [volume, setVolume] = useState(null);
  const [muscleGroups, setMuscleGroups] = useState([]);
  const [exercisesProgress, setExercisesProgress] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [exerciseProgress, setExerciseProgress] = useState(null);
  const [workoutTypes, setWorkoutTypes] = useState([]);
  const [timeDistribution, setTimeDistribution] = useState([]);
  const [records, setRecords] = useState(null);

  useEffect(() => {
    fetchAllStats();
  }, [period]);

  const fetchAllStats = async () => {
    setLoading(true);
    try {
      const [
        overviewRes, 
        volumeRes, 
        muscleRes, 
        exercisesRes,
        typesRes,
        timeRes,
        recordsRes
      ] = await Promise.all([
        statisticsAPI.getOverview({ period }),
        statisticsAPI.getVolume({ period }),
        statisticsAPI.getMuscleGroups({ period }),
        statisticsAPI.getExercisesProgress({ period }),
        statisticsAPI.getWorkoutTypes({ period }),
        statisticsAPI.getTimeDistribution({ period }),
        statisticsAPI.getRecords()
      ]);

      setOverview(overviewRes.data.data);
      setVolume(volumeRes.data.data);
      
      // Parse muscle groups data - convert string numbers to integers
      const parsedMuscleGroups = (muscleRes.data.data || []).map(group => ({
        ...group,
        total_sets: parseInt(group.total_sets) || 0,
        exercise_count: parseInt(group.exercise_count) || 0
      }));
      setMuscleGroups(parsedMuscleGroups);
      console.log('Muscle groups data:', parsedMuscleGroups);
      
      setExercisesProgress(exercisesRes.data.data);
      setWorkoutTypes(typesRes.data.data);
      setTimeDistribution(timeRes.data.data);
      setRecords(recordsRes.data.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExerciseProgress = async (exerciseId) => {
    try {
      const response = await statisticsAPI.getExerciseProgress(exerciseId, { period: '90' });
      setExerciseProgress(response.data.data);
      setSelectedExercise(exerciseId);
    } catch (error) {
      console.error('Error fetching exercise progress:', error);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatVolume = (value) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="page-container max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Statistics</h1>
          <p className="text-gray-600 text-sm sm:text-base">Track your progress and analyze your workouts</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="input w-full sm:w-40"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="card p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {overview?.overview?.total_workouts || 0}
              </p>
              <p className="text-xs sm:text-sm text-gray-500">Workouts</p>
            </div>
          </div>
        </div>

        <div className="card p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {Math.round(overview?.overview?.total_duration / 60) || 0}h
              </p>
              <p className="text-xs sm:text-sm text-gray-500">Total Time</p>
            </div>
          </div>
        </div>

        <div className="card p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {overview?.current_streak || 0}
              </p>
              <p className="text-xs sm:text-sm text-gray-500">Day Streak</p>
            </div>
          </div>
        </div>

        <div className="card p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {Math.round(overview?.overview?.avg_duration) || 0}m
              </p>
              <p className="text-xs sm:text-sm text-gray-500">Avg Duration</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Workouts Over Time */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Workouts Over Time</h2>
          {overview?.daily_workouts?.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={overview.daily_workouts}>
                <defs>
                  <linearGradient id="colorWorkouts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip 
                  labelFormatter={formatDate}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorWorkouts)"
                  name="Workouts"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              No workout data for this period
            </div>
          )}
        </div>

        {/* Workouts by Day of Week */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Workouts by Day</h2>
          {overview?.by_day_of_week?.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={overview.by_day_of_week}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="day" 
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                  tickFormatter={(value) => value.substring(0, 3)}
                />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
                <Bar 
                  dataKey="count" 
                  fill="#3b82f6" 
                  radius={[4, 4, 0, 0]}
                  name="Workouts"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              No workout data for this period
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Volume Over Time */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            <TrendingUp className="w-5 h-5 inline mr-2 text-green-600" />
            Weekly Volume (Total Weight Lifted)
          </h2>
          {volume?.weekly?.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={volume.weekly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="week_start" 
                  tickFormatter={formatDate}
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                />
                <YAxis 
                  tick={{ fontSize: 12 }} 
                  stroke="#9ca3af"
                  tickFormatter={formatVolume}
                />
                <Tooltip 
                  labelFormatter={formatDate}
                  formatter={(value) => [`${formatVolume(value)} kg`, 'Volume']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
                <Line
                  type="monotone"
                  dataKey="total_volume"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981', strokeWidth: 2 }}
                  name="Volume"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              No volume data for this period
            </div>
          )}
        </div>

        {/* Muscle Group Distribution */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Muscle Group Distribution</h2>
          {muscleGroups?.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={muscleGroups}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="total_sets"
                  nameKey="muscle_group"
                  label={({ muscle_group, percent }) => 
                    `${muscle_group} (${(percent * 100).toFixed(0)}%)`
                  }
                  labelLine={false}
                >
                  {muscleGroups.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [`${value} sets`, name]}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              No muscle group data for this period
            </div>
          )}
        </div>
      </div>

      {/* New Charts Row */}
      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Workout Types Distribution */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Workout Types</h2>
          {workoutTypes?.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={workoutTypes} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis 
                  dataKey="workout_type" 
                  type="category" 
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                  width={100}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
                <Bar 
                  dataKey="count" 
                  fill="#3b82f6" 
                  radius={[0, 4, 4, 0]}
                  name="Workouts"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              No workout type data
            </div>
          )}
        </div>

        {/* Time of Day Distribution */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Workout Times</h2>
          {timeDistribution?.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={timeDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="time_of_day"
                  label={({ time_of_day, percent }) => 
                    `${time_of_day} (${(percent * 100).toFixed(0)}%)`
                  }
                >
                  {timeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value} workouts`]}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              No workout time data
            </div>
          )}
        </div>
      </div>

      {/* Personal Records Section */}
      {records && (
        <div className="card p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-600" />
            Personal Records
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <Dumbbell className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-900">Total Volume</span>
              </div>
              <p className="text-2xl font-bold text-yellow-900">
                {formatVolume(records.total_volume || 0)} kg
              </p>
              <p className="text-xs text-yellow-700 mt-1">All time</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Longest Workout</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">
                {records.longest_workout?.duration_minutes || 0}m
              </p>
              <p className="text-xs text-blue-700 mt-1 truncate">
                {records.longest_workout?.workout_name || 'N/A'}
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-900">Heaviest Lift</span>
              </div>
              <p className="text-2xl font-bold text-green-900">
                {records.heaviest_lifts?.[0]?.max_weight || 0} kg
              </p>
              <p className="text-xs text-green-700 mt-1 truncate">
                {records.heaviest_lifts?.[0]?.exercise_name || 'N/A'}
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Most Reps</span>
              </div>
              <p className="text-2xl font-bold text-purple-900">
                {records.most_reps?.[0]?.max_reps || 0}
              </p>
              <p className="text-xs text-purple-700 mt-1 truncate">
                {records.most_reps?.[0]?.exercise_name || 'N/A'}
              </p>
            </div>
          </div>

          {/* Top Lifts Table */}
          {records.heaviest_lifts?.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Top 5 Heaviest Lifts</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 font-medium text-gray-600">Exercise</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-600">Muscle</th>
                      <th className="text-right py-2 px-3 font-medium text-gray-600">Weight</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.heaviest_lifts.slice(0, 5).map((record, idx) => (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-2 px-3 text-gray-900">{record.exercise_name}</td>
                        <td className="py-2 px-3 text-gray-600">{record.muscle_group || 'N/A'}</td>
                        <td className="py-2 px-3 text-right font-semibold text-gray-900">
                          {record.max_weight} kg
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Exercise Progress */}
      <div className="card p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          <Award className="w-5 h-5 inline mr-2 text-yellow-600" />
          Top Exercises
        </h2>
        
        {exercisesProgress?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Exercise</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Category</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Times Performed</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Max Weight</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Avg Weight</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Progress</th>
                </tr>
              </thead>
              <tbody>
                {exercisesProgress.slice(0, 10).map((exercise, index) => (
                  <tr 
                    key={exercise.id} 
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                    onClick={() => fetchExerciseProgress(exercise.id)}
                  >
                    <td className="py-3 px-4">
                      <span className="font-medium text-gray-900">{exercise.name}</span>
                      {exercise.muscle_group && (
                        <span className="text-sm text-gray-500 block">{exercise.muscle_group}</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="badge bg-gray-100 text-gray-700">{exercise.category}</span>
                    </td>
                    <td className="py-3 px-4 text-center font-medium">{exercise.times_performed}</td>
                    <td className="py-3 px-4 text-center">
                      {exercise.max_weight ? `${exercise.max_weight} kg` : '-'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {exercise.avg_weight ? `${Math.round(exercise.avg_weight)} kg` : '-'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-gray-400">
            <Dumbbell className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No exercise data for this period</p>
            <p className="text-sm mt-2">Start logging your workouts to see progress</p>
          </div>
        )}
      </div>

      {/* Individual Exercise Progress Modal/Section */}
      {selectedExercise && exerciseProgress && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {exerciseProgress.exercise?.name} Progress
            </h2>
            <button
              onClick={() => {
                setSelectedExercise(null);
                setExerciseProgress(null);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {/* Personal Records */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-yellow-50 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-yellow-700">
                {exerciseProgress.personal_records?.max_weight || 0} kg
              </p>
              <p className="text-xs text-yellow-600">Max Weight</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-blue-700">
                {exerciseProgress.personal_records?.max_reps || 0}
              </p>
              <p className="text-xs text-blue-600">Max Reps</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-green-700">
                {formatVolume(exerciseProgress.personal_records?.max_volume || 0)}
              </p>
              <p className="text-xs text-green-600">Max Volume</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-purple-700">
                {exerciseProgress.personal_records?.total_sessions || 0}
              </p>
              <p className="text-xs text-purple-600">Sessions</p>
            </div>
          </div>

          {/* Weight Progress Chart */}
          {exerciseProgress.progress?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={exerciseProgress.progress}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip 
                  labelFormatter={formatDate}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                  name="Weight (kg)"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400">
              No progress data available
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Statistics;
