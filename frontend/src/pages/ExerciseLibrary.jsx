import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { exerciseAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { 
  Search, 
  Filter, 
  Dumbbell, 
  ChevronRight,
  X,
  Plus,
  Edit,
  Trash2,
  User
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const ExerciseLibrary = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [exercises, setExercises] = useState([]);
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 18,
    total: 0,
    pages: 1
  });

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    muscleGroup: searchParams.get('muscleGroup') || '',
    difficulty: searchParams.get('difficulty') || '',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // Reset to page 1 when filters or tab change
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchExercises(1, true);
  }, [filters, activeTab]);

  const fetchCategories = async () => {
    try {
      const response = await exerciseAPI.getCategories();
      setCategories(response.data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchExercises = async (page = 1, reset = false) => {
    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    
    try {
      const params = {
        page,
        limit: pagination.limit
      };
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.muscleGroup) params.muscleGroup = filters.muscleGroup;
      if (filters.difficulty) params.difficulty = filters.difficulty;
      if (activeTab === 'custom') params.customOnly = 'true';

      const response = await exerciseAPI.getAll(params);
      const newExercises = response.data.data.exercises;
      const paginationData = response.data.data.pagination;
      
      if (reset) {
        setExercises(newExercises);
      } else {
        setExercises(prev => [...prev, ...newExercises]);
      }
      
      setPagination(paginationData);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    fetchExercises(pagination.page + 1, false);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    searchParams.set('tab', tab);
    setSearchParams(searchParams);
  };

  const handleDeleteExercise = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!window.confirm(t('exercises.deleteConfirm'))) return;
    
    try {
      await exerciseAPI.delete(id);
      fetchExercises(1, true);
    } catch (error) {
      console.error('Error deleting exercise:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    if (value) {
      searchParams.set(key, value);
    } else {
      searchParams.delete(key);
    }
    setSearchParams(searchParams);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      muscleGroup: '',
      difficulty: ''
    });
    setSearchParams({});
  };

  const hasActiveFilters = filters.category || filters.muscleGroup || filters.difficulty;

  const getCategoryColor = (category) => {
    const colors = {
      strength: 'bg-red-100 text-red-700',
      cardio: 'bg-blue-100 text-blue-700',
      flexibility: 'bg-purple-100 text-purple-700',
      bodyweight: 'bg-green-100 text-green-700',
      machine: 'bg-orange-100 text-orange-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: 'bg-green-100 text-green-700',
      intermediate: 'bg-yellow-100 text-yellow-700',
      advanced: 'bg-red-100 text-red-700',
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{t('exercises.library')}</h1>
          <p className="text-sm sm:text-base text-gray-600">
            {t('exercises.browseCollection')}
          </p>
        </div>
        {user && (
          <Link to="/exercises/new" className="btn-primary gap-2 w-full sm:w-auto justify-center sm:justify-start">
            <Plus className="w-4 h-4" />
            {t('exercises.createExercise')}
          </Link>
        )}
      </div>

      {/* Tabs */}
      {user && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar">
          <button
            onClick={() => handleTabChange('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t('exercises.allExercises')}
          </button>
          <button
            onClick={() => handleTabChange('custom')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'custom'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <User className="w-4 h-4" />
            {t('exercises.myExercises')}
          </button>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={t('exercises.searchPlaceholder')}
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="input pl-10"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn ${showFilters || hasActiveFilters ? 'btn-primary' : 'btn-secondary'} gap-2`}
        >
          <Filter className="w-4 h-4" />
          {t('exercises.filters')}
          {hasActiveFilters && (
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
              {[filters.category, filters.muscleGroup, filters.difficulty].filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="card p-4 mb-6 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">{t('exercises.filterExercises')}</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                {t('exercises.clearAll')}
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label">{t('exercises.category')}</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="input"
              >
                <option value="">{t('exercises.allCategories')}</option>
                {categories.categories?.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">{t('exercises.muscleGroup')}</label>
              <select
                value={filters.muscleGroup}
                onChange={(e) => handleFilterChange('muscleGroup', e.target.value)}
                className="input"
              >
                <option value="">{t('exercises.allMuscleGroups')}</option>
                {categories.muscleGroups?.map((mg) => (
                  <option key={mg} value={mg}>{mg}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">{t('exercises.difficulty')}</label>
              <select
                value={filters.difficulty}
                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                className="input"
              >
                <option value="">{t('exercises.allDifficulties')}</option>
                {categories.difficulties?.map((diff) => (
                  <option key={diff} value={diff}>
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : exercises.length === 0 ? (
        <div className="text-center py-12">
          <Dumbbell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('exercises.noExercisesFound')}</h3>
          <p className="text-gray-500 mb-4">{t('exercises.tryAdjusting')}</p>
          <button onClick={clearFilters} className="btn-primary">
            {t('exercises.clearFilters')}
          </button>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">
            {t('exercises.showing')} {exercises.length} {t('exercises.of')} {pagination.total} {t('exercises.exercise')}{pagination.total !== 1 ? 's' : ''}
          </p>
          
          {/* Exercise Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {exercises.map((exercise) => (
              <Link
                key={exercise.id}
                to={`/exercises/${exercise.id}`}
                className="card-hover overflow-hidden group"
              >
                <div className="aspect-video bg-gray-100 relative overflow-hidden">
                  {exercise.image_url ? (
                    <img
                      src={exercise.image_url}
                      alt={exercise.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Dumbbell className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2 flex gap-2">
                    <span className={`badge text-xs ${getCategoryColor(exercise.category)}`}>
                      {t(`common.categories.${exercise.category}`)}
                    </span>
                    {!!exercise.is_custom && (
                      <span className="badge bg-purple-100 text-purple-700">
                        {t('exercises.custom')}
                      </span>
                    )}
                  </div>
                  {!!exercise.is_custom && exercise.user_id === user?.id && (
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Link
                        to={`/exercises/${exercise.id}/edit`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 bg-white/90 rounded-lg hover:bg-white shadow-sm"
                        aria-label={`Edit ${exercise.name}`}
                      >
                        <Edit className="w-4 h-4 text-gray-600" aria-hidden="true" />
                      </Link>
                      <button
                        onClick={(e) => handleDeleteExercise(exercise.id, e)}
                        className="p-1.5 bg-white/90 rounded-lg hover:bg-white shadow-sm"
                        aria-label={`Delete ${exercise.name}`}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" aria-hidden="true" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                        {exercise.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {exercise.muscle_group}
                        {exercise.equipment && ` • ${exercise.equipment}`}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 flex-shrink-0" />
                  </div>
                  {exercise.difficulty && (
                    <span className={`badge ${getDifficultyColor(exercise.difficulty)} mt-3`}>
                      {t(`exercises.${exercise.difficulty}`)}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
          
          {/* Load More Button */}
          {pagination.page < pagination.pages && (
            <div className="flex justify-center mt-8">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="btn-primary w-full sm:w-auto px-8 py-3 flex items-center justify-center gap-2"
              >
                {loadingMore ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {t('exercises.loading')}
                  </>
                ) : (
                  <>
                    {t('exercises.loadMore')}
                    <span className="text-sm opacity-75">
                      ({pagination.total - exercises.length} {t('exercises.remaining')})
                    </span>
                  </>
                )}
              </button>
            </div>
          )}
          
          {/* Page info */}
          {pagination.pages > 1 && (
            <p className="text-center text-sm text-gray-500 mt-4">
              {t('exercises.page')} {pagination.page} {t('exercises.of')} {pagination.pages}
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default ExerciseLibrary;
