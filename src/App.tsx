import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/authentication-1';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import CreateEventPage from './pages/CreateEventPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/create-event" element={
          <ProtectedRoute>
            <CreateEventPage />
          </ProtectedRoute>
        } />
        <Route path="/" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;