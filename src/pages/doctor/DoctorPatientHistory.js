import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { doctorAPI } from '../../api';
import { useParams } from 'react-router-dom';
export default function DoctorPatientHistory() {

  
  const {patientId} = useParams();
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadHistory = async () => {
    if (!patientId) return;

    try {
      setLoading(true);

      const [apptRes, presRes] = await Promise.all([
        doctorAPI.getPatientAppointments(patientId),
        doctorAPI.getPatientPrescriptions(patientId),
      ]);

      setAppointments(apptRes.data?.data || []);
      setPrescriptions(presRes.data?.data || []);
      console.log("Prescriptions Response:", presRes.data?.data);
    } catch (err) {
      console.error(err);
      alert('Failed to load patient history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  if (patientId) {
    loadHistory();
  }
}, [patientId]);

  return (
    <DashboardLayout title="Patient History">

      <div className="card">
        <div className="card-header">
          <h4>Patient History (ID: {patientId})</h4>
        </div>

      </div>

      {loading && <p>Loading...</p>}

      {/* Appointment History */}

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header">
          <h4>Previous Appointments</h4>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Doctor</th>
                <th>Reason</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {appointments.map((a) => (
                <tr key={a.id}>
                  <td>{a.id}</td>
                  <td>{a.appointmentDateTime}</td>
                  <td>{a.doctorName}</td>
                  <td>{a.reason}</td>
                  <td>{a.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Prescription History */}

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header">
          <h4>Previous Prescriptions</h4>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Medicine</th>
                <th>Instructions</th>
              </tr>
            </thead>

            <tbody>
                 {prescriptions.map((p) => (
                <tr key={p.id}>
                <td>{p.id}</td>

                <td>{new Date(p.createdAt).toLocaleString()}</td>

                <td>
                {p.medicines?.map((m) => (
                <div key={m.id}>
                <strong>{m.medicineName}</strong><br />
                Dosage: {m.dosage}<br />
                Frequency: {m.frequency}<br />
                Duration: {m.duration}
                </div>
                ))}
                </td>
                <td>{p.instructions || "N/A"}</td>
                </tr>
                ))}
            </tbody>
            
          </table>
        </div>
      </div>

    </DashboardLayout>
  );
}