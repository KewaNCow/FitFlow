import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute, { AdminRoute } from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ExerciseLibrary from './pages/ExerciseLibrary';
import ExerciseDetail from './pages/ExerciseDetail';
import ExerciseBuilder from './pages/ExerciseBuilder';
import EquipmentLibrary from './pages/EquipmentLibrary';
import MyWorkouts from './pages/MyWorkouts';
import WorkoutBuilder from './pages/WorkoutBuilder';
import WorkoutDetail from './pages/WorkoutDetail';
import ActiveWorkout from './pages/ActiveWorkout';
import MyPrograms from './pages/MyPrograms';
import ProgramBuilder from './pages/ProgramBuilder';
import ProgramDetail from './pages/ProgramDetail';
import WorkoutHistory from './pages/WorkoutHistory';
import RoutePlanner from './pages/RoutePlanner';
import Statistics from './pages/Statistics';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          {/* Skip link for keyboard navigation - accessibility */}
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          <Navbar />
          <main id="main-content" className="flex-grow" role="main">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/exercises" element={<ExerciseLibrary />} />
              <Route path="/exercises/:id" element={<ExerciseDetail />} />
              <Route path="/equipment" element={<EquipmentLibrary />} />

              {/* Protected routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/exercises/new" element={
                <ProtectedRoute>
                  <ExerciseBuilder />
                </ProtectedRoute>
              } />
              <Route path="/exercises/:id/edit" element={
                <ProtectedRoute>
                  <ExerciseBuilder />
                </ProtectedRoute>
              } />
              <Route path="/my-workouts" element={
                <ProtectedRoute>
                  <MyWorkouts />
                </ProtectedRoute>
              } />
              <Route path="/my-workouts/new" element={
                <ProtectedRoute>
                  <WorkoutBuilder />
                </ProtectedRoute>
              } />
              <Route path="/my-workouts/:id" element={
                <ProtectedRoute>
                  <WorkoutDetail />
                </ProtectedRoute>
              } />
              <Route path="/my-workouts/:id/start" element={
                <ProtectedRoute>
                  <ActiveWorkout />
                </ProtectedRoute>
              } />
              <Route path="/my-workouts/:id/edit" element={
                <ProtectedRoute>
                  <WorkoutBuilder />
                </ProtectedRoute>
              } />
              <Route path="/my-programs" element={
                <ProtectedRoute>
                  <MyPrograms />
                </ProtectedRoute>
              } />
              <Route path="/my-programs/new" element={
                <ProtectedRoute>
                  <ProgramBuilder />
                </ProtectedRoute>
              } />
              <Route path="/my-programs/:id" element={
                <ProtectedRoute>
                  <ProgramDetail />
                </ProtectedRoute>
              } />
              <Route path="/my-programs/:id/edit" element={
                <ProtectedRoute>
                  <ProgramBuilder />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/history" element={
                <ProtectedRoute>
                  <WorkoutHistory />
                </ProtectedRoute>
              } />
              <Route path="/routes" element={
                <ProtectedRoute>
                  <RoutePlanner />
                </ProtectedRoute>
              } />
              <Route path="/statistics" element={
                <ProtectedRoute>
                  <Statistics />
                </ProtectedRoute>
              } />

              {/* Admin routes */}
              <Route path="/admin" element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
