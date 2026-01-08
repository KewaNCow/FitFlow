import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { equipmentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Plus,
  Filter,
  Dumbbell,
  Bike,
  Activity,
  Target,
  Package,
  Grid3X3,
  Edit,
  Trash2,
  X,
  ImagePlus,
  ChevronDown
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const CATEGORY_CONFIG = {
  free_weights: { label: 'Free Weights', icon: Dumbbell, color: 'text-blue-600 bg-blue-100' },
  machines: { label: 'Machines', icon: Target, color: 'text-purple-600 bg-purple-100' },
  cardio: { label: 'Cardio', icon: Bike, color: 'text-green-600 bg-green-100' },
  bodyweight: { label: 'Bodyweight', icon: Activity, color: 'text-orange-600 bg-orange-100' },
  accessories: { label: 'Accessories', icon: Package, color: 'text-pink-600 bg-pink-100' },
  other: { label: 'Other', icon: Grid3X3, color: 'text-gray-600 bg-gray-100' }
};

const EquipmentLibrary = () => {
  const { user } = useAuth();
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'other',
    image_url: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEquipment();
  }, [categoryFilter, searchTerm]);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const params = {};
      if (categoryFilter) params.category = categoryFilter;
      if (searchTerm) params.search = searchTerm;
      
      const response = await equipmentAPI.getAll(params);
      setEquipment(response.data.data.equipment);
    } catch (error) {
      console.error('Error fetching equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.name.trim()) {
      setError('Equipment name is required');
      return;
    }

    setSaving(true);
    try {
      if (editingEquipment) {
        await equipmentAPI.update(editingEquipment.id, formData);
      } else {
        await equipmentAPI.create(formData);
      }
      await fetchEquipment();
      closeModal();
    } catch (error) {
      console.error('Error saving equipment:', error);
      setError('Failed to save equipment');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this equipment?')) return;
    
    try {
      await equipmentAPI.delete(id);
      await fetchEquipment();
    } catch (error) {
      console.error('Error deleting equipment:', error);
      alert('Failed to delete equipment');
    }
  };

  const openModal = (item = null) => {
    if (item) {
      setEditingEquipment(item);
      setFormData({
        name: item.name,
        description: item.description || '',
        category: item.category,
        image_url: item.image_url || ''
      });
    } else {
      setEditingEquipment(null);
      setFormData({
        name: '',
        description: '',
        category: 'other',
        image_url: ''
      });
    }
    setError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEquipment(null);
    setFormData({
      name: '',
      description: '',
      category: 'other',
      image_url: ''
    });
    setError('');
  };

  const getCategoryIcon = (category) => {
    const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.other;
    const Icon = config.icon;
    return <Icon className="w-4 h-4" />;
  };

  const getCategoryLabel = (category) => {
    return CATEGORY_CONFIG[category]?.label || 'Other';
  };

  const getCategoryColor = (category) => {
    return CATEGORY_CONFIG[category]?.color || 'text-gray-600 bg-gray-100';
  };

  // Group equipment by category
  const groupedEquipment = equipment.reduce((acc, item) => {
    const cat = item.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  if (loading && equipment.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Equipment Library</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Browse and manage gym equipment</p>
        </div>
        {user && (
          <button
            onClick={() => openModal()}
            className="btn-primary gap-2 w-full sm:w-auto justify-center"
          >
            <Plus className="w-5 h-5" />
            Add Equipment
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="card p-3 sm:p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search equipment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-outline gap-2 ${showFilters ? 'bg-gray-100' : ''}`}
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t">
            <label className="label mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCategoryFilter('')}
                className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                  categoryFilter === '' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setCategoryFilter(key)}
                  className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors flex items-center gap-1 ${
                    categoryFilter === key 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {config.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Equipment Grid */}
      {equipment.length === 0 ? (
        <div className="card p-12 text-center">
          <Dumbbell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No equipment found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || categoryFilter 
              ? 'Try adjusting your search or filters'
              : 'Add your first piece of equipment'}
          </p>
          {user && !searchTerm && !categoryFilter && (
            <button onClick={() => openModal()} className="btn-primary">
              Add Equipment
            </button>
          )}
        </div>
      ) : categoryFilter ? (
        // Show flat grid when filtering by category
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {equipment.map(item => (
            <EquipmentCard 
              key={item.id} 
              item={item} 
              user={user}
              onEdit={() => openModal(item)}
              onDelete={() => handleDelete(item.id)}
              getCategoryIcon={getCategoryIcon}
              getCategoryLabel={getCategoryLabel}
              getCategoryColor={getCategoryColor}
            />
          ))}
        </div>
      ) : (
        // Show grouped by category when no filter
        <div className="space-y-8">
          {Object.entries(CATEGORY_CONFIG).map(([category, config]) => {
            const items = groupedEquipment[category];
            if (!items || items.length === 0) return null;
            
            const Icon = config.icon;
            
            return (
              <div key={category}>
                <div className="flex items-center gap-2 mb-4">
                  <div className={`p-2 rounded-lg ${config.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">{config.label}</h2>
                  <span className="text-sm text-gray-500">({items.length})</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {items.map(item => (
                    <EquipmentCard 
                      key={item.id} 
                      item={item} 
                      user={user}
                      onEdit={() => openModal(item)}
                      onDelete={() => handleDelete(item.id)}
                      getCategoryIcon={getCategoryIcon}
                      getCategoryLabel={getCategoryLabel}
                      getCategoryColor={getCategoryColor}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingEquipment ? 'Edit Equipment' : 'Add Equipment'}
                </h2>
                <button 
                  onClick={closeModal} 
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div 
                    className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
                    role="alert"
                    aria-live="polite"
                  >
                    {error}
                  </div>
                )}

                <div>
                  <label className="label">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="input"
                    placeholder="e.g., Barbell, Treadmill"
                  />
                </div>

                <div>
                  <label className="label">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="input"
                    rows={3}
                    placeholder="Describe the equipment..."
                  />
                </div>

                <div>
                  <label className="label">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="input"
                  >
                    {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Image URL</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                      className="input flex-1"
                      placeholder="https://..."
                    />
                    <button
                      type="button"
                      className="btn-outline p-2"
                      title="Preview image"
                    >
                      <ImagePlus className="w-5 h-5" />
                    </button>
                  </div>
                  {formData.image_url && (
                    <div className="mt-2">
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg"
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="btn-outline flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary flex-1"
                  >
                    {saving ? <LoadingSpinner size="sm" /> : (editingEquipment ? 'Save Changes' : 'Add Equipment')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Equipment Card Component
const EquipmentCard = ({ item, user, onEdit, onDelete, getCategoryIcon, getCategoryLabel, getCategoryColor }) => {
  const isOwner = user && item.user_id === user.id;
  
  return (
    <div className="card overflow-hidden group">
      <div className="aspect-video bg-gray-100 relative">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Dumbbell className="w-10 h-10 text-gray-300" />
          </div>
        )}
        
        {/* Category badge */}
        <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getCategoryColor(item.category)}`}>
          {getCategoryIcon(item.category)}
          {getCategoryLabel(item.category)}
        </div>

        {/* Custom badge */}
        {item.source === 'custom' && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-primary-600 text-white rounded-full text-xs font-medium">
            Custom
          </div>
        )}

        {/* Actions overlay */}
        {isOwner && (
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              onClick={onEdit}
              className="p-2 bg-white rounded-lg hover:bg-gray-100"
              aria-label={`Edit ${item.name}`}
            >
              <Edit className="w-4 h-4 text-gray-700" aria-hidden="true" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 bg-white rounded-lg hover:bg-gray-100"
              aria-label={`Delete ${item.name}`}
            >
              <Trash2 className="w-4 h-4 text-red-500" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
      
      <div className="p-3">
        <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
        {item.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mt-1">{item.description}</p>
        )}
      </div>
    </div>
  );
};

export default EquipmentLibrary;
