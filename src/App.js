import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, RoleRoute, GuestRoute } from './routes/ProtectedRoute';

// Auth
import LoginPage    from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Admin
import AdminDashboard    from './pages/admin/AdminDashboard';
import AdminDoctors      from './pages/admin/AdminDoctors';
import AdminPatients     from './pages/admin/AdminPatients';
import AdminAppointments from './pages/admin/AdminAppointments';
import AdminReceptionists from './pages/admin/AdminReceptionists';

// Receptionist
import ReceptionistDashboard    from './pages/receptionist/ReceptionistDashboard';
import ReceptionistPatients     from './pages/receptionist/ReceptionistPatients';
import ReceptionistAppointments from './pages/receptionist/ReceptionistAppointments';

// Doctor
import DoctorDashboard     from './pages/doctor/DoctorDashboard';
import DoctorProfile from './pages/doctor/DoctorProfile';
import DoctorAppointments  from './pages/doctor/DoctorAppointments';
import DoctorPrescriptions from './pages/doctor/DoctorPrescriptions';
import DoctorPatientHistory from './pages/doctor/DoctorPatientHistory';

// Misc
import UnauthorizedPage from './pages/UnauthorizedPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Public (guest only) */}
          <Route element={<GuestRoute />}>
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Misc */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* ── ADMIN routes ── */}
          <Route element={<RoleRoute roles={['ADMIN']} />}>
            <Route path="/admin"              element={<AdminDashboard />} />
            <Route path="/admin/doctors"      element={<AdminDoctors />} />
            <Route path="/admin/patients"     element={<AdminPatients />} />
            <Route path="/admin/appointments" element={<AdminAppointments />} />

            <Route path="/admin/receptionists" element={<AdminReceptionists />} />

          </Route>

                    {/* ── DOCTOR routes ── */}
          <Route element={<RoleRoute roles={['ADMIN', 'DOCTOR']} />}>
            <Route path="/doctor"                 element={<DoctorDashboard />} />
            <Route path="/doctor/appointments"    element={<DoctorAppointments />} />
            <Route path="/doctor/prescriptions"   element={<DoctorPrescriptions />} />
            <Route path="/doctor/history/:patientId" element={<DoctorPatientHistory />}/> 
           <Route
  path="/doctor/profile"
  element={<DoctorProfile />}/>   
         </Route>


          {/* ── RECEPTIONIST routes ── */}
          <Route element={<RoleRoute roles={['ADMIN', 'RECEPTIONIST']} />}>
            <Route path="/receptionist"              element={<ReceptionistDashboard />} />
            <Route path="/receptionist/patients"     element={<ReceptionistPatients />} />
            <Route path="/receptionist/appointments" element={<ReceptionistAppointments />} />
          </Route>



          {/* 404 fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
