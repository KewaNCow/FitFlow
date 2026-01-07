import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { exerciseAPI } from '../services/api';
import {
  ArrowLeft,
  Save,
  Image,
  Video,
  Dumbbell,
  ListOrdered,
  X
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const CATEGORIES = [
  { value: 'strength', label: 'Strength' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'flexibility', label: 'Flexibility' },
  { value: 'bodyweight', label: 'Bodyweight' },
  { value: 'machine', label: 'Machine' }
];

const MUSCLE_GROUPS = [
  'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Forearms',
  'Core', 'Quadriceps', 'Hamstrings', 'Glutes', 'Calves', 'Full Body'
];

const EQUIPMENT = [
  'None', 'Barbell', 'Dumbbells', 'Kettlebell', 'Resistance Band',
  'Cable Machine', 'Pull-up Bar', 'Bench', 'Smith Machine', 'TRX'
];

const DIFFICULTIES = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' }
];

const ExerciseBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isEditing = Boolean(id);
  
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'strength',
    muscleGroup: '',
    equipment: 'None',
    difficulty: 'beginner',
    instructions: '',
    imageUrl: '',
    videoUrl: ''
  });

  const [instructionsList, setInstructionsList] = useState(['']);

  useEffect(() => {
    if (isEditing) {
      fetchExercise();
    }
  }, [id]);

  const fetchExercise = async () => {
    try {
      const response = await exerciseAPI.getById(id);
      const exercise = response.data.data;
      
      setFormData({
        name: exercise.name || '',
        description: exercise.description || '',
        category: exercise.category || 'strength',
        muscleGroup: exercise.muscle_group || '',
        equipment: exercise.equipment || 'None',
        difficulty: exercise.difficulty || 'beginner',
        instructions: exercise.instructions || '',
        imageUrl: exercise.image_url || '',
        videoUrl: exercise.video_url || ''
      });

      // Parse instructions into list
      if (exercise.instructions) {
        const steps = exercise.instructions.split('\n').filter(s => s.trim());
        setInstructionsList(steps.length > 0 ? steps : ['']);
      }
    } catch (error) {
      console.error('Error fetching exercise:', error);
      navigate('/exercises');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleInstructionChange = (index, value) => {
    const newInstructions = [...instructionsList];
    newInstructions[index] = value;
    setInstructionsList(newInstructions);
  };

  const addInstruction = () => {
    setInstructionsList([...instructionsList, '']);
  };

  const removeInstruction = (index) => {
    if (instructionsList.length > 1) {
      setInstructionsList(instructionsList.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Exercise name is required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      // Combine instructions into string
      const instructions = instructionsList
        .filter(i => i.trim())
        .join('\n');

      const exerciseData = {
        ...formData,
        instructions
      };

      if (isEditing) {
        await exerciseAPI.update(id, exerciseData);
      } else {
        await exerciseAPI.create(exerciseData);
      }

      navigate('/exercises?tab=custom');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save exercise');
    } finally {
      setSaving(false);
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
    <div className="page-container max-w-3xl">
      {/* Back button */}
      <Link
        to="/exercises"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-4 sm:mb-6 text-sm sm:text-base"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('exerciseBuilder.backToExercises')}
      </Link>

      <div className="card p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-lg flex items-center justify-center">
            <Dumbbell className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {isEditing ? t('exerciseBuilder.editExercise') : t('exerciseBuilder.createExercise')}
            </h1>
            <p className="text-gray-500 text-sm sm:text-base">{t('exerciseBuilder.description')}</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm sm:text-base">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Basic Info */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('exerciseBuilder.exerciseName')} *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input"
                placeholder={t('exerciseBuilder.exerciseNamePlaceholder')}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('exerciseBuilder.category')} *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('exerciseBuilder.difficulty')}
              </label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                className="input"
              >
                {DIFFICULTIES.map(diff => (
                  <option key={diff.value} value={diff.value}>{diff.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('exerciseBuilder.muscleGroup')}
              </label>
              <select
                name="muscleGroup"
                value={formData.muscleGroup}
                onChange={handleChange}
                className="input"
              >
                <option value="">{t('exerciseBuilder.muscleGroupPlaceholder')}</option>
                {MUSCLE_GROUPS.map(muscle => (
                  <option key={muscle} value={muscle}>{muscle}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('exerciseBuilder.equipment')}
              </label>
              <select
                name="equipment"
                value={formData.equipment}
                onChange={handleChange}
                className="input"
              >
                {EQUIPMENT.map(eq => (
                  <option key={eq} value={eq}>{eq}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('exerciseBuilder.description')}
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input resize-none h-24"
              placeholder={t('exerciseBuilder.descriptionPlaceholder')}
            />
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <ListOrdered className="w-4 h-4 inline mr-1" />
              {t('exerciseBuilder.instructions')}
            </label>
            <div className="space-y-2">
              {instructionsList.map((instruction, index) => (
                <div key={index} className="flex gap-2">
                  <span className="flex-shrink-0 w-6 h-10 flex items-center justify-center text-sm font-medium text-gray-400">
                    {index + 1}.
                  </span>
                  <input
                    type="text"
                    value={instruction}
                    onChange={(e) => handleInstructionChange(index, e.target.value)}
                    className="input flex-1"
                    placeholder={`Step ${index + 1}`}
                  />
                  {instructionsList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeInstruction(index)}
                      className="p-2 text-gray-400 hover:text-red-500"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addInstruction}
              className="mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              + Add Step
            </button>
          </div>

          {/* Media */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Image className="w-4 h-4 inline mr-1" />
                {t('exerciseBuilder.imageUrl')}
              </label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                className="input"
                placeholder={t('exerciseBuilder.imageUrlPlaceholder')}
              />
              {formData.imageUrl && (
                <div className="mt-2 relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={formData.imageUrl}
                    alt="Exercise preview"
                    className="w-full h-full object-cover"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Video className="w-4 h-4 inline mr-1" />
                {t('exerciseBuilder.videoUrl')}
              </label>
              <input
                type="url"
                name="videoUrl"
                value={formData.videoUrl}
                onChange={handleChange}
                className="input"
                placeholder={t('exerciseBuilder.videoUrlPlaceholder')}
              />
              <p className="text-xs text-gray-500 mt-1">
                YouTube or direct video link
              </p>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/exercises')}
              className="btn-secondary flex-1"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex-1 gap-2"
            >
              {saving ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {isEditing ? 'Update Exercise' : 'Create Exercise'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExerciseBuilder;
