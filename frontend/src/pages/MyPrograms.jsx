import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { programAPI } from '../services/api';
import { 
  Plus, 
  Calendar, 
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

const MyPrograms = () => {
  const [programs, setPrograms] = useState([]);
  const [predefinedPrograms, setPredefinedPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeMenu, setActiveMenu] = useState(null);
  const [activeTab, setActiveTab] = useState('my');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const [myRes, predefinedRes] = await Promise.all([
        programAPI.getAll({ type: 'my' }),
        programAPI.getAll({ type: 'predefined' })
      ]);
      setPrograms(myRes.data.data);
      setPredefinedPrograms(predefinedRes.data.data);
    } catch (error) {
      console.error('Error fetching programs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this program?')) return;
    
    try {
      await programAPI.delete(id);
      setPrograms(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting program:', error);
    }
    setActiveMenu(null);
  };

  const handleCopy = async (id) => {
    try {
      const response = await programAPI.copy(id);
      setPrograms(prev => [response.data.data, ...prev]);
      setActiveTab('my');
    } catch (error) {
      console.error('Error copying program:', error);
    }
    setActiveMenu(null);
  };

  const handleCopyAndEdit = async (id) => {
    try {
      const response = await programAPI.copy(id);
      navigate(`/my-programs/${response.data.data.id}/edit`);
    } catch (error) {
      console.error('Error copying program:', error);
    }
    setActiveMenu(null);
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: 'bg-green-100 text-green-700',
      intermediate: 'bg-yellow-100 text-yellow-700',
      advanced: 'bg-red-100 text-red-700',
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-700';
  };

  const currentPrograms = activeTab === 'my' ? programs : predefinedPrograms;
  const filteredPrograms = currentPrograms.filter(program => {
    const matchesSearch = program.name.toLowerCase().includes(search.toLowerCase());
    const matchesDifficulty = filterDifficulty === 'all' || program.difficulty === filterDifficulty;
    return matchesSearch && matchesDifficulty;
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Training Programs</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Structured workout plans for your goals
          </p>
        </div>
        <Link to="/my-programs/new" className="btn-primary gap-2 w-full sm:w-auto justify-center">
          <Plus className="w-5 h-5" />
          Create Program
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
          My Programs ({programs.length})
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
            Predefined ({predefinedPrograms.length})
          </span>
        </button>
      </div>

      {/* Search and Filter */}
      {currentPrograms.length > 0 && (
        <div className="mb-6 space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search programs..."
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
              <span className="hidden sm:inline">Filter</span>
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFilterDifficulty('all')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      filterDifficulty === 'all'
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilterDifficulty('beginner')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      filterDifficulty === 'beginner'
                        ? 'bg-green-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Beginner
                  </button>
                  <button
                    onClick={() => setFilterDifficulty('intermediate')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      filterDifficulty === 'intermediate'
                        ? 'bg-yellow-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Intermediate
                  </button>
                  <button
                    onClick={() => setFilterDifficulty('advanced')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      filterDifficulty === 'advanced'
                        ? 'bg-red-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Advanced
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Programs Grid */}
      {currentPrograms.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {activeTab === 'my' ? 'No programs yet' : 'No predefined programs'}
          </h3>
          <p className="text-gray-500 mb-4">
            {activeTab === 'my' 
              ? 'Create your first program to get started!' 
              : 'Check back later for predefined programs'}
          </p>
          {activeTab === 'my' && (
            <Link to="/my-programs/new" className="btn-primary gap-2">
              <Plus className="w-5 h-5" />
              Create Program
            </Link>
          )}
        </div>
      ) : filteredPrograms.length === 0 ? (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No programs found</h3>
          <p className="text-gray-500">Try a different search term</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPrograms.map((program) => (
            <div key={program.id} className="card-hover relative">
              <Link to={`/my-programs/${program.id}`} className="block p-4 sm:p-5">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0 pr-8">
                    <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base">{program.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      {program.duration_weeks} weeks • {program.workout_count || 0} workouts
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {program.difficulty && (
                        <span className={`badge text-xs ${getDifficultyColor(program.difficulty)}`}>
                          {program.difficulty}
                        </span>
                      )}
                      {program.is_predefined && (
                        <span className="badge bg-blue-100 text-blue-700 text-xs">
                          Predefined
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
              
              {/* Menu button */}
              <div className="absolute top-4 right-4">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveMenu(activeMenu === program.id ? null : program.id);
                  }}
                  className="p-1 rounded-lg hover:bg-gray-100"
                >
                  <MoreVertical className="w-5 h-5 text-gray-400" />
                </button>
                
                {activeMenu === program.id && (
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border py-1 z-10 animate-fade-in">
                    {!program.is_predefined && (
                      <Link
                        to={`/my-programs/${program.id}/edit`}
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </Link>
                    )}
                    {program.is_predefined && (
                      <button
                        onClick={() => handleCopy(program.id)}
                        className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        <Copy className="w-4 h-4" />
                        Try This Program
                      </button>
                    )}
                    {!program.is_predefined && (
                      <button
                        onClick={() => handleDelete(program.id)}
                        className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
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

export default MyPrograms;
