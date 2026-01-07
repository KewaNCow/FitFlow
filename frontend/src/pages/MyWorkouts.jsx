import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { workoutAPI } from '../services/api';
import { 
  Plus, 
  Dumbbell, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Copy,
  Search,
  Users,
  Filter,
  X as CloseIcon
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useTranslation } from 'react-i18next';

const MyWorkouts = () => {
  const { t } = useTranslation();
  const [workouts, setWorkouts] = useState([]);
  const [predefinedWorkouts, setPredefinedWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeMenu, setActiveMenu] = useState(null);
  const [activeTab, setActiveTab] = useState('my');
  const [filterType, setFilterType] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      const [myRes, predefinedRes] = await Promise.all([
        workoutAPI.getAll({ type: 'my' }),
        workoutAPI.getAll({ type: 'predefined' })
      ]);
      setWorkouts(myRes.data.data);
      setPredefinedWorkouts(predefinedRes.data.data);
    } catch (error) {
      console.error('Error fetching workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this workout?')) return;
    
    try {
      await workoutAPI.delete(id);
      setWorkouts(prev => prev.filter(w => w.id !== id));
    } catch (error) {
      console.error('Error deleting workout:', error);
    }
    setActiveMenu(null);
  };

  const handleDuplicate = async (id) => {
    try {
      const response = await workoutAPI.duplicate(id);
      setWorkouts(prev => [response.data.data, ...prev]);
    } catch (error) {
      console.error('Error duplicating workout:', error);
    }
    setActiveMenu(null);
  };

  const handleCopy = async (id) => {
    try {
      const response = await workoutAPI.copy(id);
      setWorkouts(prev => [response.data.data, ...prev]);
      setActiveTab('my');
    } catch (error) {
      console.error('Error copying workout:', error);
    }
    setActiveMenu(null);
  };

  const handleCopyAndEdit = async (id) => {
    try {
      const response = await workoutAPI.copy(id);
      navigate(`/my-workouts/${response.data.data.id}/edit`);
    } catch (error) {
      console.error('Error copying workout:', error);
    }
    setActiveMenu(null);
  };

  const getWorkoutTypeColor = (type) => {
    const colors = {
      strength: 'bg-red-100 text-red-700',
      cardio: 'bg-blue-100 text-blue-700',
      mixed: 'bg-purple-100 text-purple-700',
      flexibility: 'bg-green-100 text-green-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  const currentWorkouts = activeTab === 'my' ? workouts : predefinedWorkouts;
  const filteredWorkouts = currentWorkouts.filter(workout => {
    const matchesSearch = workout.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'all' || workout.workout_type === filterType;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('workouts.title')}</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            {t('workouts.subtitle')}
          </p>
        </div>
        <Link to="/my-workouts/new" className="btn-primary gap-2 w-full sm:w-auto justify-center">
          <Plus className="w-5 h-5" />
          {t('workouts.create')}
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('my')}
          className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap text-sm sm:text-base ${
            activeTab === 'my'
              ? 'bg-primary-100 text-primary-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          {t('workouts.myWorkouts')} ({workouts.length})
        </button>
        <button
          onClick={() => setActiveTab('predefined')}
          className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap text-sm sm:text-base ${
            activeTab === 'predefined'
              ? 'bg-primary-100 text-primary-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <span className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            {t('workouts.predefined')} ({predefinedWorkouts.length})
          </span>
        </button>
      </div>

      {/* Search and Filter */}
      {currentWorkouts.length > 0 && (
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('workouts.search')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary gap-2 ${showFilters ? 'bg-primary-100 text-primary-700' : ''}`}
            >
              <Filter className="w-5 h-5" />
              <span className="hidden sm:inline">{t('common.filter')}</span>
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('workouts.workoutType')}</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFilterType('all')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      filterType === 'all'
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {t('workouts.filterAll')}
                  </button>
                  <button
                    onClick={() => setFilterType('strength')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      filterType === 'strength'
                        ? 'bg-red-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {t('workouts.filterStrength')}
                  </button>
                  <button
                    onClick={() => setFilterType('cardio')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      filterType === 'cardio'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {t('workouts.filterCardio')}
                  </button>
                  <button
                    onClick={() => setFilterType('mixed')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      filterType === 'mixed'
                        ? 'bg-purple-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {t('workouts.filterMixed')}
                  </button>
                  <button
                    onClick={() => setFilterType('flexibility')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      filterType === 'flexibility'
                        ? 'bg-green-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {t('workouts.filterFlexibility')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Workouts Grid */}
      {currentWorkouts.length === 0 ? (
        <div className="text-center py-12">
          <Dumbbell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {activeTab === 'my' ? t('workouts.noWorkouts') : t('workouts.noPredefined')}
          </h3>
          <p className="text-gray-500 mb-4">
            {activeTab === 'my' 
              ? t('workouts.createFirst') 
              : t('workouts.predefinedWillAppear')}
          </p>
          {activeTab === 'my' && (
            <Link to="/my-workouts/new" className="btn-primary gap-2">
              <Plus className="w-5 h-5" />
              {t('workouts.create')}
            </Link>
          )}
        </div>
      ) : filteredWorkouts.length === 0 ? (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('workouts.noWorkoutsFound')}</h3>
          <p className="text-gray-500">{t('workouts.tryDifferentSearch')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorkouts.map((workout) => (
            <div key={workout.id} className={`card-hover relative ${activeMenu === workout.id ? 'z-[100] !overflow-visible' : ''}`}>
              <Link to={`/my-workouts/${workout.id}`} className="block p-4 sm:p-5">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Dumbbell className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0 pr-8">
                    <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base">{workout.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      {workout.exercise_count || 0} {t('common.exercises')}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {!!workout.workout_type && (
                        <span className={`badge text-xs ${getWorkoutTypeColor(workout.workout_type)}`}>
                          {t(`common.categories.${workout.workout_type}`)}
                        </span>
                      )}
                      {!!workout.is_predefined && (
                        <span className="badge bg-blue-100 text-blue-700 text-xs">
                          {t('workouts.predefined')}
                        </span>
                      )}
                    </div>
                    {workout.description && (
                      <p className="text-xs sm:text-sm text-gray-400 mt-2 line-clamp-2">
                        {workout.description}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
              
              {/* Menu button */}
              <div className="absolute top-4 right-4">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveMenu(activeMenu === workout.id ? null : workout.id);
                  }}
                  className="p-1 rounded-lg hover:bg-gray-100"
                >
                  <MoreVertical className="w-5 h-5 text-gray-400" />
                </button>
                
                {activeMenu === workout.id && (
                  <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-lg border py-1 z-10 animate-fade-in">
                    {!workout.is_predefined && (
                      <>
                        <Link
                          to={`/my-workouts/${workout.id}/edit`}
                          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                        >
                          <Edit className="w-4 h-4" />
                          {t('common.edit')}
                        </Link>
                        <button
                          onClick={() => handleDuplicate(workout.id)}
                          className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                        >
                          <Copy className="w-4 h-4" />
                          {t('workouts.duplicate')}
                        </button>
                        <button
                          onClick={() => handleDelete(workout.id)}
                          className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          {t('common.delete')}
                        </button>
                      </>
                    )}
                    {!!workout.is_predefined && (
                      <>
                        <button
                          onClick={() => handleCopyAndEdit(workout.id)}
                          className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                        >
                          <Edit className="w-4 h-4" />
                          {t('workouts.editAsMyWorkout')}
                        </button>
                        <button
                          onClick={() => handleCopy(workout.id)}
                          className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                        >
                          <Copy className="w-4 h-4" />
                          {t('workouts.copyToMyWorkouts')}
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyWorkouts;
