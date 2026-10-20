import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { doctorAPI } from '../../api';

export default function DoctorProfile() {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await doctorAPI.getProfile();
      setDoctor(res.data?.data);
    } catch (err) {
      console.error(err);
      alert('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="My Profile">
        <p>Loading...</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Doctor Profile">

      <div className="card">
        <div className="card-header">
          <h4>My Profile</h4>
        </div>

        <div style={{ padding: '20px' }}>

          <div className="row">

            <div className="col-md-6">
              <p><strong>Name:</strong> {doctor?.fullName}</p>
              <p><strong>Email:</strong> {doctor?.email}</p>
              <p><strong>Phone:</strong> {doctor?.phone}</p>
              <p><strong>Department:</strong> {doctor?.department}</p>
            </div>

            <div className="col-md-6">
              <p><strong>Specialization:</strong> {doctor?.specialization}</p>
              <p><strong>Qualification:</strong> {doctor?.qualification}</p>
              <p><strong>Experience:</strong> {doctor?.experienceYears} Years</p>
              <p><strong>License Number:</strong> {doctor?.licenseNumber}</p>
              <p><strong>Consultation Fee:</strong> ₹{doctor?.consultationFee}</p>
            </div>

          </div>

        </div>
      </div>

    </DashboardLayout>
  );
}