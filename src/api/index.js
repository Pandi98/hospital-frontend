import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ── Request interceptor: attach JWT ─────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hms_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: handle auth errors ────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('hms_token');
      localStorage.removeItem('hms_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// ── Auth endpoints ───────────────────────────────────────────────
export const authAPI = {
  login:    (data) => api.post('/auth/login',    data),
  register: (data) => api.post('/auth/register', data),
};

// ── Admin endpoints ──────────────────────────────────────────────
export const adminAPI = {
  // Doctors
  addDoctor:    (data)     => api.post('/admin/doctors',         data),
  updateDoctor: (id, data) => api.put(`/admin/doctors/${id}`,    data),
  deleteDoctor: (id)       => api.delete(`/admin/doctors/${id}`),
  getAllDoctors: ()         => api.get('/admin/doctors'),
  getDoctorById:(id)       => api.get(`/admin/doctors/${id}`),
  
  // Patients
  getAllPatients:   ()     => api.get('/admin/patients'),
  getPatientById:  (id)   => api.get(`/admin/patients/${id}`),
  // Appointments
  getAllAppointments:     ()     => api.get('/admin/appointments'),
  getAppointmentById:    (id)   => api.get(`/admin/appointments/${id}`),
  getAppointmentsByDoc:  (id)   => api.get(`/admin/appointments/doctor/${id}`),
  getAppointmentsByPat:  (id)   => api.get(`/admin/appointments/patient/${id}`),

  // Receptionists
  addReceptionist: (data) => api.post('/admin/receptionists', data),

  updateReceptionist: (id, data) => api.put(`/admin/receptionists/${id}`, data),

  deleteReceptionist: (id) => api.delete(`/admin/receptionists/${id}`),

  getAllReceptionists: () => api.get('/admin/receptionists'),

  getReceptionistById: (id) =>  api.get(`/admin/receptionists/${id}`),



};

// ── Receptionist endpoints ───────────────────────────────────────
export const receptionistAPI = {
  // Patients
  registerPatient: (data)     => api.post('/receptionist/patients',       data),
  updatePatient:   (id, data) => api.put(`/receptionist/patients/${id}`,  data),
  getAllPatients:   (search)   => api.get('/receptionist/patients',  { params: search ? { search } : {} }),
  getPatientById:  (id)       => api.get(`/receptionist/patients/${id}`),
  // Appointments
  bookAppointment:  (data)          => api.post('/receptionist/appointments',                    data),
  assignDoctor:     (apptId, docId) => api.put(`/receptionist/appointments/${apptId}/assign-doctor/${docId}`),
  cancelAppointment:(id)            => api.put(`/receptionist/appointments/${id}/cancel`),
  getAllAppointments: ()             => api.get('/receptionist/appointments'),
  // Doctors
  getAllDoctors:      ()    => api.get('/receptionist/doctors'),
  getAvailableDoctors: ()  => api.get('/receptionist/doctors/available'),
};

// ── Doctor endpoints ─────────────────────────────────────────────
export const doctorAPI = {
  getProfile: () =>   api.get('/doctor/profile'),
  getMyAppointments:    ()     => api.get('/doctor/appointments'),
  getAppointmentById:   (id)   => api.get(`/doctor/appointments/${id}`),
  completeAppointment:  (id)   => api.put(`/doctor/appointments/${id}/complete`),
  addPrescription:      (data) => api.post('/doctor/prescriptions',            data),
  getMyPrescriptions:   ()     => api.get('/doctor/prescriptions'),
  getPrescriptionById:  (id)   => api.get(`/doctor/prescriptions/${id}`),
  getPatient:           (id)   => api.get(`/doctor/patients/${id}`),
  getPatientAppointments: (id) => api.get(`/doctor/patients/${id}/appointments`),
  getPatientPrescriptions:(id) => api.get(`/doctor/patients/${id}/prescriptions`),
};
