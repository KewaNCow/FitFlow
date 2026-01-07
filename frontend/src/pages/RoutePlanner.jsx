import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Polyline, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { routeAPI, workoutAPI } from '../services/api';
import {
  MapPin,
  Route,
  Bike,
  PersonStanding,
  Mountain,
  Save,
  Trash2,
  RotateCcw,
  Play,
  Heart,
  Clock,
  ArrowLeft,
  Plus,
  X,
  Navigation,
  AlertCircle,
  GripVertical,
  Circle,
  Flag,
  MapPinned,
  Settings,
  ChevronDown,
  ChevronUp,
  Ban,
  CheckCircle2,
  Dumbbell
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import 'leaflet/dist/leaflet.css';

// Route options configuration
// ORS valid avoid_features per profile:
// - foot-walking/foot-hiking: steps, fords, ferries
// - cycling-*: steps, fords, ferries
// - driving-car: highways, tollways, ferries, fords
const ROUTE_OPTIONS = {
  running: {
    profiles: [
      { id: 'foot-walking', label: 'Walking paths', description: 'Prefer sidewalks and walking paths' },
      { id: 'foot-hiking', label: 'Hiking trails', description: 'Include trails and unpaved paths' }
    ],
    avoidOptions: [
      { id: 'steps', label: 'Avoid stairs', description: 'Better for strollers or accessibility' },
      { id: 'fords', label: 'Avoid water crossings', description: 'Skip river fords' },
      { id: 'ferries', label: 'Avoid ferries', description: 'Skip ferry crossings' }
    ]
  },
  walking: {
    profiles: [
      { id: 'foot-walking', label: 'Walking paths', description: 'Prefer sidewalks and walking paths' },
      { id: 'foot-hiking', label: 'Nature trails', description: 'Include trails and parks' }
    ],
    avoidOptions: [
      { id: 'steps', label: 'Avoid stairs', description: 'Better for strollers or accessibility' },
      { id: 'fords', label: 'Avoid water crossings', description: 'Skip river fords' },
      { id: 'ferries', label: 'Avoid ferries', description: 'Skip ferry crossings' }
    ]
  },
  hiking: {
    profiles: [
      { id: 'foot-hiking', label: 'Hiking trails', description: 'Prefer trails and nature paths' },
      { id: 'foot-walking', label: 'Paved paths', description: 'Stick to paved routes' }
    ],
    avoidOptions: [
      { id: 'steps', label: 'Avoid stairs', description: 'Easier terrain' },
      { id: 'fords', label: 'Avoid water crossings', description: 'Skip river fords' },
      { id: 'ferries', label: 'Avoid ferries', description: 'Skip ferry crossings' }
    ]
  },
  biking: {
    profiles: [
      { id: 'cycling-regular', label: 'Regular cycling', description: 'Mix of roads and bike paths' },
      { id: 'cycling-road', label: 'Road cycling', description: 'Prefer paved roads' },
      { id: 'cycling-safe', label: 'Safe cycling', description: 'Prefer bike lanes and paths' },
      { id: 'cycling-mountain', label: 'Mountain biking', description: 'Include trails and off-road' }
    ],
    avoidOptions: [
      { id: 'steps', label: 'Avoid stairs', description: 'No carrying the bike' },
      { id: 'fords', label: 'Avoid water crossings', description: 'Skip river fords' },
      { id: 'ferries', label: 'Avoid ferries', description: 'Skip ferry crossings' }
    ]
  }
};

// Backend API URL for routing proxy
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// OpenRouteService API helper with filtering options (uses backend proxy to avoid CORS)
const getRouteFromORS = async (waypoints, activityType, routeOptions = {}) => {
  if (waypoints.length < 2) return null;
  
  const { profile = null, avoidFeatures = [] } = routeOptions;
  
  // Map activity type and profile to ORS profile
  const profileMapping = {
    'foot-walking': 'foot-walking',
    'foot-hiking': 'foot-hiking',
    'cycling-regular': 'cycling-regular',
    'cycling-road': 'cycling-road',
    'cycling-safe': 'cycling-safe',
    'cycling-mountain': 'cycling-mountain'
  };
  
  const defaultProfiles = {
    running: 'foot-walking',
    walking: 'foot-walking',
    hiking: 'foot-hiking',
    biking: 'cycling-regular'
  };
  
  const orsProfile = profileMapping[profile] || defaultProfiles[activityType] || 'foot-walking';
  
  // Build coordinates array for ORS
  const coordinates = waypoints.map(wp => [wp.lng, wp.lat]);
  
  try {
    const requestBody = {
      coordinates: coordinates
    };
    
    // Map our feature IDs to ORS avoid_features
    // ORS valid values: highways, tollways, ferries, fords, steps
    if (avoidFeatures.length > 0) {
      requestBody.options = {
        avoid_features: avoidFeatures.map(f => {
          // Map to correct ORS feature names
          const mapping = {
            'highways': 'highways',
            'tollways': 'tollways', 
            'steps': 'steps',
            'fords': 'fords',
            'ferries': 'ferries'
          };
          return mapping[f] || f;
        })
      };
    }
    
    console.log('ORS Request via proxy:', orsProfile, requestBody);
    
    // Use backend proxy to avoid CORS issues
    const response = await fetch(
      `${API_URL}/routing/directions/${orsProfile}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('ORS request failed, status:', response.status, errorText);
      return null;
    }
    
    const data = await response.json();
    
    if (!data.features || data.features.length === 0) {
      return null;
    }
    
    const route = data.features[0];
    const routeCoordinates = route.geometry.coordinates.map(coord => ({
      lat: coord[1],
      lng: coord[0]
    }));
    
    return {
      coordinates: routeCoordinates,
      distance: route.properties.summary.distance / 1000,
      duration: Math.round(route.properties.summary.duration / 60),
      source: 'ors' // Mark which API was used
    };
  } catch (error) {
    console.error('ORS routing error:', error);
    return null;
  }
};

// OSRM API helper for road-following routing (fallback - no filtering support)
const getRouteFromOSRM = async (waypoints, activityType = 'foot') => {
  if (waypoints.length < 2) return null;
  
  // Map activity type to OSRM profile
  const profileMap = {
    running: 'foot',
    walking: 'foot',
    hiking: 'foot',
    biking: 'bike'
  };
  
  const osrmProfile = profileMap[activityType] || 'foot';
  
  // Build coordinates string: lng,lat;lng,lat;...
  const coordinates = waypoints.map(wp => `${wp.lng},${wp.lat}`).join(';');
  
  try {
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/${osrmProfile}/${coordinates}?overview=full&geometries=geojson`
    );
    
    if (!response.ok) throw new Error('OSRM request failed');
    
    const data = await response.json();
    
    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      throw new Error('No route found');
    }
    
    const route = data.routes[0];
    
    // Convert GeoJSON coordinates [lng, lat] to Leaflet format [lat, lng]
    const routeCoordinates = route.geometry.coordinates.map(coord => ({
      lat: coord[1],
      lng: coord[0]
    }));
    
    return {
      coordinates: routeCoordinates,
      distance: route.distance / 1000, // Convert meters to km
      duration: Math.round(route.duration / 60), // Convert seconds to minutes
      source: 'osrm' // Mark which API was used
    };
  } catch (error) {
    console.error('OSRM routing error:', error);
    return null;
  }
};

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const startIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const endIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Map click handler component
const MapClickHandler = ({ onMapClick, isDrawing }) => {
  useMapEvents({
    click: (e) => {
      if (isDrawing) {
        onMapClick(e.latlng);
      }
    },
  });
  return null;
};

// Component to center map on user location
const LocationFinder = ({ onLocationFound }) => {
  const map = useMap();
  
  useEffect(() => {
    map.locate({ setView: true, maxZoom: 14 });
    map.on('locationfound', (e) => {
      onLocationFound(e.latlng);
    });
  }, [map, onLocationFound]);
  
  return null;
};

const RoutePlanner = () => {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userLocation, setUserLocation] = useState([59.3293, 18.0686]); // Default: Stockholm
  
  // Road-following route state
  const [routedPath, setRoutedPath] = useState([]); // Actual road-following path
  const [routeDistance, setRouteDistance] = useState(0); // Distance from OSRM
  const [routeDuration, setRouteDuration] = useState(0); // Duration from OSRM
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [routeError, setRouteError] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    activity_type: 'running',
    waypoints: []
  });

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // Route filtering options
  const [showRouteOptions, setShowRouteOptions] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [avoidFeatures, setAvoidFeatures] = useState([]);

  // Get available options for current activity type
  const currentRouteOptions = ROUTE_OPTIONS[formData.activity_type] || ROUTE_OPTIONS.running;

  // State to track which routing service is being used
  const [routeSource, setRouteSource] = useState(null);

  // Reset route options when activity type changes
  useEffect(() => {
    setSelectedProfile(null);
    setAvoidFeatures([]);
  }, [formData.activity_type]);

  useEffect(() => {
    fetchRoutes();
  }, []);

  // Calculate road-following route when waypoints, activity type, or route options change
  useEffect(() => {
    const calculateRoute = async () => {
      if (formData.waypoints.length < 2) {
        setRoutedPath([]);
        setRouteDistance(0);
        setRouteDuration(0);
        setRouteError(null);
        setRouteSource(null);
        return;
      }

      setIsCalculatingRoute(true);
      setRouteError(null);

      const routeOptions = {
        profile: selectedProfile,
        avoidFeatures: avoidFeatures
      };
      
      let result = null;
      
      // Always try ORS first (we have a valid API key)
      result = await getRouteFromORS(formData.waypoints, formData.activity_type, routeOptions);
      
      // If ORS failed, try OSRM as fallback
      if (!result) {
        result = await getRouteFromOSRM(formData.waypoints, formData.activity_type);
        
        // Show warning if user had options set but we fell back to OSRM
        if (result && (selectedProfile || avoidFeatures.length > 0)) {
          setRouteError('Route options could not be applied. Using basic routing.');
        }
      }

      if (result) {
        setRoutedPath(result.coordinates);
        setRouteDistance(result.distance);
        setRouteDuration(result.duration);
        setRouteSource(result.source);
      } else {
        // Fallback to straight lines if all routing fails
        setRoutedPath(formData.waypoints);
        setRouteDistance(calculateStraightDistance(formData.waypoints));
        setRouteDuration(estimateDuration(calculateStraightDistance(formData.waypoints), formData.activity_type));
        setRouteError('Could not calculate road route. Showing straight line.');
        setRouteSource(null);
      }

      setIsCalculatingRoute(false);
    };

    // Debounce route calculation to avoid too many API calls
    const timeoutId = setTimeout(calculateRoute, 300);
    return () => clearTimeout(timeoutId);
  }, [formData.waypoints, formData.activity_type, selectedProfile, avoidFeatures]);

  const fetchRoutes = async () => {
    try {
      const response = await routeAPI.getAll();
      setRoutes(response.data.data);
    } catch (error) {
      console.error('Error fetching routes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMapClick = useCallback((latlng) => {
    setFormData(prev => ({
      ...prev,
      waypoints: [...prev.waypoints, { lat: latlng.lat, lng: latlng.lng }]
    }));
  }, []);

  const handleLocationFound = useCallback((latlng) => {
    setUserLocation([latlng.lat, latlng.lng]);
  }, []);

  // Straight-line distance calculation (fallback)
  const calculateStraightDistance = (waypoints) => {
    if (waypoints.length < 2) return 0;
    
    let distance = 0;
    for (let i = 1; i < waypoints.length; i++) {
      const lat1 = waypoints[i - 1].lat;
      const lon1 = waypoints[i - 1].lng;
      const lat2 = waypoints[i].lat;
      const lon2 = waypoints[i].lng;
      
      // Haversine formula
      const R = 6371; // Earth's radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      distance += R * c;
    }
    
    return distance;
  };

  const estimateDuration = (distance, activityType) => {
    // Average speeds in km/h
    const speeds = {
      running: 10,
      biking: 20,
      walking: 5,
      hiking: 4
    };
    return Math.round((distance / speeds[activityType]) * 60);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('Please enter a route name');
      return;
    }
    if (formData.waypoints.length < 2) {
      alert('Please add at least 2 points to your route');
      return;
    }

    setSaving(true);
    try {
      const routeData = {
        ...formData,
        distance_km: routeDistance.toFixed(2),
        estimated_duration: routeDuration,
        // Store the full routed path for display later
        routed_path: routedPath
      };

      if (selectedRoute) {
        await routeAPI.update(selectedRoute.id, routeData);
      } else {
        await routeAPI.create(routeData);
      }

      await fetchRoutes();
      resetForm();
    } catch (error) {
      console.error('Error saving route:', error);
      alert('Failed to save route');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this route?')) return;
    
    try {
      await routeAPI.delete(id);
      await fetchRoutes();
      if (selectedRoute?.id === id) {
        resetForm();
      }
    } catch (error) {
      console.error('Error deleting route:', error);
    }
  };

  const handleToggleFavorite = async (id) => {
    try {
      await routeAPI.toggleFavorite(id);
      await fetchRoutes();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const createWorkoutFromRoute = async (route) => {
    try {
      // Map activity type to workout type
      const workoutTypeMap = {
        running: 'cardio',
        biking: 'cardio',
        walking: 'cardio',
        hiking: 'cardio'
      };
      
      const workoutData = {
        name: `${route.name} Workout`,
        description: `Workout linked to route: ${route.name} (${parseFloat(route.distance_km).toFixed(1)} km, ${route.estimated_duration} min)`,
        workout_type: workoutTypeMap[route.activity_type] || 'cardio',
        route_id: route.id,
        exercises: []
      };

      const response = await workoutAPI.create(workoutData);
      
      // Navigate to edit the new workout
      if (response.data?.data?.id) {
        navigate(`/workout-builder/${response.data.data.id}`);
      } else {
        navigate('/my-workouts');
      }
    } catch (error) {
      console.error('Error creating workout from route:', error);
      alert('Failed to create workout from route');
    }
  };

  const selectRoute = (route) => {
    setSelectedRoute(route);
    setFormData({
      name: route.name,
      description: route.description || '',
      activity_type: route.activity_type,
      waypoints: route.waypoints || []
    });
    // If route has stored routed path, use it; otherwise it will be recalculated
    if (route.routed_path && route.routed_path.length > 0) {
      setRoutedPath(route.routed_path);
      setRouteDistance(parseFloat(route.distance_km) || 0);
      setRouteDuration(route.estimated_duration || 0);
    }
    setIsCreating(true);
    setIsDrawing(false);
  };

  const resetForm = () => {
    setSelectedRoute(null);
    setIsCreating(false);
    setIsDrawing(false);
    setFormData({
      name: '',
      description: '',
      activity_type: 'running',
      waypoints: []
    });
    setRoutedPath([]);
    setRouteDistance(0);
    setRouteDuration(0);
    setRouteError(null);
    setShowRouteOptions(false);
    setSelectedProfile(null);
    setAvoidFeatures([]);
  };

  const undoLastPoint = () => {
    setFormData(prev => ({
      ...prev,
      waypoints: prev.waypoints.slice(0, -1)
    }));
  };

  const clearRoute = () => {
    setFormData(prev => ({
      ...prev,
      waypoints: []
    }));
  };

  // Toggle avoid feature
  const toggleAvoidFeature = (featureId) => {
    setAvoidFeatures(prev => 
      prev.includes(featureId)
        ? prev.filter(f => f !== featureId)
        : [...prev, featureId]
    );
  };

  // Waypoint management functions
  const removeWaypoint = (index) => {
    setFormData(prev => ({
      ...prev,
      waypoints: prev.waypoints.filter((_, i) => i !== index)
    }));
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newWaypoints = [...formData.waypoints];
    const [draggedItem] = newWaypoints.splice(draggedIndex, 1);
    newWaypoints.splice(dropIndex, 0, draggedItem);

    setFormData(prev => ({
      ...prev,
      waypoints: newWaypoints
    }));

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const getWaypointLabel = (index, total) => {
    if (index === 0) return 'Start';
    if (index === total - 1) return 'End';
    return `Stop ${index}`;
  };

  const getWaypointIcon = (index, total) => {
    if (index === 0) return <Circle className="w-4 h-4 text-green-500 fill-green-500" />;
    if (index === total - 1) return <Flag className="w-4 h-4 text-red-500" />;
    return <MapPinned className="w-4 h-4 text-blue-500" />;
  };

  const formatCoordinate = (coord) => {
    return coord.toFixed(5);
  };

  // Handle marker drag on map
  const handleMarkerDrag = (index, newPosition) => {
    setFormData(prev => {
      const newWaypoints = [...prev.waypoints];
      newWaypoints[index] = { lat: newPosition.lat, lng: newPosition.lng };
      return { ...prev, waypoints: newWaypoints };
    });
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'biking': return <Bike className="w-4 h-4" />;
      case 'walking': return <PersonStanding className="w-4 h-4" />;
      case 'hiking': return <Mountain className="w-4 h-4" />;
      default: return <PersonStanding className="w-4 h-4" />;
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
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col lg:flex-row lg:h-[calc(100vh-64px)] w-full">
        {/* Sidebar */}
        <div className="w-full lg:w-80 bg-white border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col lg:overflow-y-auto min-w-0">
          <div className="p-3 sm:p-4 border-b">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">Route Planner</h1>
              {!isCreating && (
                <button
                  onClick={() => setIsCreating(true)}
                  className="btn-primary py-2 px-3 text-sm gap-1"
                >
                  <Plus className="w-4 h-4" />
                  New
                </button>
              )}
            </div>

            {isCreating && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {selectedRoute ? 'Edit Route' : 'New Route'}
                  </span>
                  <button
                    onClick={resetForm}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="Route name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="input text-sm"
                />

                <select
                  value={formData.activity_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, activity_type: e.target.value }))}
                  className="input text-sm"
                >
                  <option value="running">🏃 Running</option>
                  <option value="biking">🚴 Biking</option>
                  <option value="walking">🚶 Walking</option>
                  <option value="hiking">🥾 Hiking</option>
                </select>

                {/* Route Options Panel */}
                <div className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setShowRouteOptions(!showRouteOptions)}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Settings className="w-4 h-4" />
                      Route Options
                      {(selectedProfile || avoidFeatures.length > 0) && (
                        <span className="bg-primary-100 text-primary-700 text-xs px-2 py-0.5 rounded-full">
                          {(selectedProfile ? 1 : 0) + avoidFeatures.length} active
                        </span>
                      )}
                    </span>
                    {showRouteOptions ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                  
                  {showRouteOptions && (
                    <div className="p-3 space-y-4 border-t bg-white">
                      {/* Route Profile Selection */}
                      <div>
                        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Route Type</h4>
                        <div className="space-y-1">
                          {currentRouteOptions.profiles.map((profile) => (
                            <button
                              key={profile.id}
                              onClick={() => setSelectedProfile(selectedProfile === profile.id ? null : profile.id)}
                              className={`w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-colors ${
                                selectedProfile === profile.id
                                  ? 'bg-primary-50 border border-primary-200 text-primary-700'
                                  : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                              }`}
                            >
                              {selectedProfile === profile.id ? (
                                <CheckCircle2 className="w-4 h-4 text-primary-600 flex-shrink-0" />
                              ) : (
                                <Circle className="w-4 h-4 text-gray-300 flex-shrink-0" />
                              )}
                              <div>
                                <p className="font-medium">{profile.label}</p>
                                <p className="text-xs text-gray-500">{profile.description}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Avoid Features */}
                      <div>
                        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Avoid</h4>
                        <div className="space-y-1">
                          {currentRouteOptions.avoidOptions.map((option) => (
                            <button
                              key={option.id}
                              onClick={() => toggleAvoidFeature(option.id)}
                              className={`w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-colors ${
                                avoidFeatures.includes(option.id)
                                  ? 'bg-red-50 border border-red-200 text-red-700'
                                  : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                              }`}
                            >
                              {avoidFeatures.includes(option.id) ? (
                                <Ban className="w-4 h-4 text-red-500 flex-shrink-0" />
                              ) : (
                                <Circle className="w-4 h-4 text-gray-300 flex-shrink-0" />
                              )}
                              <div>
                                <p className="font-medium">{option.label}</p>
                                <p className="text-xs text-gray-500">{option.description}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Clear options button */}
                      {(selectedProfile || avoidFeatures.length > 0) && (
                        <button
                          onClick={() => {
                            setSelectedProfile(null);
                            setAvoidFeatures([]);
                          }}
                          className="w-full text-xs text-gray-500 hover:text-gray-700 py-1"
                        >
                          Reset to defaults
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <textarea
                  placeholder="Description (optional)"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="input text-sm resize-none h-20"
                />

                {/* Route stats */}
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-gray-50 rounded-lg p-2">
                    {isCalculatingRoute ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <p className="text-lg font-bold text-primary-600">{routeDistance.toFixed(2)} km</p>
                    )}
                    <p className="text-xs text-gray-500">Distance</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    {isCalculatingRoute ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <p className="text-lg font-bold text-green-600">{routeDuration} min</p>
                    )}
                    <p className="text-xs text-gray-500">Est. Time</p>
                  </div>
                </div>

                {/* Route error message */}
                {routeError && (
                  <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{routeError}</span>
                  </div>
                )}

                {/* Drawing controls */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsDrawing(!isDrawing)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                      isDrawing 
                        ? 'bg-primary-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Navigation className="w-4 h-4" />
                    {isDrawing ? 'Drawing...' : 'Draw Route'}
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={undoLastPoint}
                    disabled={formData.waypoints.length === 0}
                    className="flex-1 btn-secondary py-2 text-sm gap-1"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Undo
                  </button>
                  <button
                    onClick={clearRoute}
                    disabled={formData.waypoints.length === 0}
                    className="flex-1 btn-secondary py-2 text-sm gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear
                  </button>
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving || formData.waypoints.length < 2}
                  className="w-full btn-primary py-2 gap-2"
                >
                  {saving ? <LoadingSpinner size="sm" /> : <Save className="w-4 h-4" />}
                  Save Route
                </button>

                {/* Waypoints List - Google Maps style */}
                {formData.waypoints.length > 0 && (
                  <div className="mt-4 border-t pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Waypoints ({formData.waypoints.length})
                      </h3>
                    </div>
                    <p className="text-xs text-gray-400 mb-3">Drag to reorder • Click × to remove</p>
                    
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {formData.waypoints.map((waypoint, index) => (
                        <div
                          key={`wp-list-${index}`}
                          draggable
                          onDragStart={(e) => handleDragStart(e, index)}
                          onDragOver={(e) => handleDragOver(e, index)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, index)}
                          onDragEnd={handleDragEnd}
                          className={`flex items-center gap-2 p-2 rounded-lg border transition-all cursor-grab active:cursor-grabbing ${
                            draggedIndex === index 
                              ? 'opacity-50 border-primary-300 bg-primary-50' 
                              : dragOverIndex === index
                                ? 'border-primary-500 bg-primary-50 shadow-sm'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          
                          {getWaypointIcon(index, formData.waypoints.length)}
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-700">
                              {getWaypointLabel(index, formData.waypoints.length)}
                            </p>
                            <p className="text-[10px] text-gray-400 truncate">
                              {formatCoordinate(waypoint.lat)}, {formatCoordinate(waypoint.lng)}
                            </p>
                          </div>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeWaypoint(index);
                            }}
                            className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                            title="Remove waypoint"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Visual connection line between waypoints */}
                    <div className="mt-3 flex items-center justify-center">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Circle className="w-3 h-3 text-green-500 fill-green-500" />
                        <div className="w-8 h-0.5 bg-gradient-to-r from-green-400 via-blue-400 to-red-400 rounded" />
                        <Flag className="w-3 h-3 text-red-500" />
                        <span className="ml-1">Route direction</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Routes list */}
          <div className="p-4">
            <h2 className="text-sm font-medium text-gray-500 mb-3">My Routes</h2>
            {routes.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">
                No routes yet. Create your first route!
              </p>
            ) : (
              <div className="space-y-2">
                {routes.map((route) => (
                  <div
                    key={route.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedRoute?.id === route.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                    onClick={() => selectRoute(route)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getActivityIcon(route.activity_type)}
                        <span className="font-medium text-gray-900 text-sm">{route.name}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(route.id);
                        }}
                        className={`${route.is_favorite ? 'text-red-500' : 'text-gray-300 hover:text-red-400'}`}
                      >
                        <Heart className={`w-4 h-4 ${route.is_favorite ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Route className="w-3 h-3" />
                        {parseFloat(route.distance_km).toFixed(1)} km
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {route.estimated_duration} min
                      </span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          createWorkoutFromRoute(route);
                        }}
                        className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
                      >
                        <Dumbbell className="w-3 h-3" />
                        Create Workout
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(route.id);
                        }}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="w-full lg:flex-1 relative h-[500px] lg:h-auto lg:min-h-0">
          <MapContainer
            center={userLocation}
            zoom={13}
            className="w-full h-full"
            style={{ height: '100%', width: '100%', zIndex: 0 }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationFinder onLocationFound={handleLocationFound} />
            <MapClickHandler onMapClick={handleMapClick} isDrawing={isDrawing} />
            
            {/* Route polyline - uses road-following path from OSRM */}
            {routedPath.length > 1 && (
              <Polyline
                positions={routedPath.map(wp => [wp.lat, wp.lng])}
                color="#3b82f6"
                weight={4}
                opacity={0.8}
              />
            )}

            {/* Show waypoint markers (clickable points) - ALL are draggable */}
            {formData.waypoints.map((wp, index) => {
              // Intermediate waypoints as small circles
              if (index > 0 && index < formData.waypoints.length - 1) {
                return (
                  <Marker
                    key={`waypoint-${index}`}
                    position={[wp.lat, wp.lng]}
                    draggable={true}
                    eventHandlers={{
                      dragend: (e) => {
                        const marker = e.target;
                        const position = marker.getLatLng();
                        handleMarkerDrag(index, position);
                      }
                    }}
                    icon={new L.DivIcon({
                      className: 'waypoint-marker',
                      html: `<div style="width: 16px; height: 16px; background: #3b82f6; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.3); cursor: grab;"><span style="position: absolute; top: -18px; left: 50%; transform: translateX(-50%); font-size: 10px; font-weight: bold; color: #3b82f6; background: white; padding: 1px 4px; border-radius: 4px; white-space: nowrap;">${index}</span></div>`,
                      iconSize: [16, 16],
                      iconAnchor: [8, 8]
                    })}
                  />
                );
              }
              return null;
            })}
            
            {/* Start marker - draggable */}
            {formData.waypoints.length > 0 && (
              <Marker 
                position={[formData.waypoints[0].lat, formData.waypoints[0].lng]}
                icon={startIcon}
                draggable={true}
                eventHandlers={{
                  dragend: (e) => {
                    const marker = e.target;
                    const position = marker.getLatLng();
                    handleMarkerDrag(0, position);
                  }
                }}
              />
            )}
            
            {/* End marker - draggable */}
            {formData.waypoints.length > 1 && (
              <Marker 
                position={[
                  formData.waypoints[formData.waypoints.length - 1].lat,
                  formData.waypoints[formData.waypoints.length - 1].lng
                ]}
                icon={endIcon}
                draggable={true}
                eventHandlers={{
                  dragend: (e) => {
                    const marker = e.target;
                    const position = marker.getLatLng();
                    handleMarkerDrag(formData.waypoints.length - 1, position);
                  }
                }}
              />
            )}
          </MapContainer>

          {/* Drawing mode indicator */}
          {isDrawing && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-primary-600 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              Click on the map to add waypoints
            </div>
          )}

          {/* Route calculating indicator */}
          {isCalculatingRoute && (
            <div className="absolute top-4 right-4 bg-white text-gray-700 px-4 py-2 rounded-full shadow-lg text-sm font-medium flex items-center gap-2">
              <LoadingSpinner size="sm" />
              Calculating route...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoutePlanner;
