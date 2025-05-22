import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useTheme } from './context/ThemeContext';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Dashboards
import PrincipalDashboard from './pages/principal/PrincipalDashboard';
import HODDashboard from './pages/hod/HODDashboard';
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import ClassAdvisorDashboard from './pages/classadvisor/ClassAdvisorDashboard';

// Principal Pages
import CreateHOD from './pages/principal/CreateHOD';
import CreateDirectory from './pages/principal/CreateDirectory';
import ViewDirectory from './pages/principal/ViewDirectory';
import HODsList from './pages/principal/HODsList';

// HOD Pages
import CreateClassAdvisor from './pages/hod/CreateClassAdvisor';
import CreateFaculty from './pages/hod/CreateFaculty';
import ApproveSyllabus from './pages/hod/ApproveSyllabus';

// Faculty Pages
import CreateSyllabus from './pages/faculty/CreateSyllabus';
// import ViewSubmissions from './pages/faculty/ViewSubmissions';

// Class Advisor Pages
// import ViewSubjects from './pages/classadvisor/ViewSubjects';
import SyllabusSummary from './pages/classadvisor/SyllabusSummary';

// Auth
import { useAuthStore } from './store/authStore';

function App() {
  const { theme } = useTheme();
  const { isAuthenticated, userRole } = useAuthStore();

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  const getDashboardRoute = () => {
    switch (userRole) {
      case 'principal':
        return '/principal';
      case 'hod':
        return '/hod';
      case 'faculty':
        return '/faculty';
      case 'classadvisor':
        return '/classadvisor';
      default:
        return '/login';
    }
  };

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      {/* Redirect to role-specific dashboard if authenticated */}
      <Route path="/" element={
        isAuthenticated 
          ? <Navigate to={getDashboardRoute()} /> 
          : <Navigate to="/login" />
      } />

      {/* Principal Routes */}
      <Route path="/principal" element={
        <ProtectedRoute allowedRoles={['principal']}>
          <PrincipalDashboard />
        </ProtectedRoute>
      }>
        <Route index element={<CreateHOD />} />
        <Route path="create-hod" element={<CreateHOD />} />
        <Route path="create-directory" element={<CreateDirectory />} />
        <Route path="view-directory" element={<ViewDirectory />} />
        <Route path="hods-list" element={<HODsList />} />
      </Route>

      {/* HOD Routes */}
      <Route path="/hod" element={
        <ProtectedRoute allowedRoles={['hod']}>
          <HODDashboard />
        </ProtectedRoute>
      }>
        <Route index element={<CreateClassAdvisor />} />
        <Route path="create-class-advisor" element={<CreateClassAdvisor />} />
        <Route path="create-faculty" element={<CreateFaculty />} />
        <Route path="approve-syllabus" element={<ApproveSyllabus />} />
      </Route>

      {/* Faculty Routes */}
      <Route path="/faculty" element={
        <ProtectedRoute allowedRoles={['faculty']}>
          <FacultyDashboard />
        </ProtectedRoute>
      }>
        <Route index element={<CreateSyllabus />} />
        <Route path="create-syllabus" element={<CreateSyllabus />} />
        {/* <Route path="view-submissions" element={<ViewSubmissions />} /> */}
      </Route>

      {/* Class Advisor Routes */}
      <Route path="/classadvisor" element={
        <ProtectedRoute allowedRoles={['classadvisor']}>
          <ClassAdvisorDashboard />
        </ProtectedRoute>
      }>
        {/* <Route index element={<ViewSubjects />} /> */}
        {/* <Route path="view-subjects" element={<ViewSubjects />} /> */}
        <Route path="syllabus-summary" element={<SyllabusSummary />} />
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;