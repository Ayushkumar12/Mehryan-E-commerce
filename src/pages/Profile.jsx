import React, { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import authService from '../services/authService';

const Profile = () => {
  const { isAuthenticated, user, updateProfile } = useUser();
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [profileMeta, setProfileMeta] = useState({
    createdAt: '',
    updatedAt: ''
  });
  const [status, setStatus] = useState({
    type: '',
    message: ''
  });
  const [fetching, setFetching] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }
    setProfileData(prev => ({
      ...prev,
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
      city: user.city || '',
      state: user.state || '',
      pincode: user.pincode || ''
    }));
    setProfileMeta({
      createdAt: user.createdAt || '',
      updatedAt: user.updatedAt || ''
    });
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    let active = true;
    const load = async () => {
      setFetching(true);
      try {
        const response = await authService.getCurrentUser();
        const currentUser = response?.user;
        if (!active || !currentUser) {
          return;
        }
        setProfileData(prev => ({
          ...prev,
          name: currentUser.name || '',
          email: currentUser.email || '',
          phone: currentUser.phone || '',
          address: currentUser.address || '',
          city: currentUser.city || '',
          state: currentUser.state || '',
          pincode: currentUser.pincode || ''
        }));
        setProfileMeta({
          createdAt: currentUser.createdAt || '',
          updatedAt: currentUser.updatedAt || ''
        });
        setStatus({ type: '', message: '' });
      } catch {
        if (active) {
          setStatus({ type: 'error', message: 'Failed to load profile. Please try again.' });
        }
      } finally {
        if (active) {
          setFetching(false);
        }
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
    if (status.type) {
      setStatus({ type: '', message: '' });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus({ type: '', message: '' });
    try {
      await updateProfile({
        name: profileData.name,
        phone: profileData.phone,
        address: profileData.address,
        city: profileData.city,
        state: profileData.state,
        pincode: profileData.pincode
      });
      setStatus({ type: 'success', message: 'Profile updated successfully.' });
    } catch (error) {
      const message = error.response?.data?.message || 'Unable to update profile. Please try again.';
      setStatus({ type: 'error', message });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <p style={{ fontSize: '18px', color: '#666' }}>Please login to manage your profile.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '960px', margin: '40px auto', padding: '0 20px' }}>
      <section style={{
        background: 'blue',
        color: 'white',
        borderRadius: '16px',
        padding: '40px',
        marginBottom: '30px',
        boxShadow: '0 18px 40px rgba(0,0,0,0.15)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ margin: '0 0 10px 0', fontSize: '32px' }}>Hello, {profileData.name || 'Guest'}</h1>
            <p style={{ margin: 0, opacity: 0.9 }}>{profileData.email || 'No email on file'}</p>
          </div>
          <div style={{ textAlign: 'right', minWidth: '180px' }}>
            <p style={{ margin: '0 0 6px 0', fontSize: '13px', opacity: 0.85 }}>
              Member since: {profileMeta.createdAt ? new Date(profileMeta.createdAt).toLocaleDateString() : '—'}
            </p>
            <p style={{ margin: 0, fontSize: '13px', opacity: 0.85 }}>
              Last updated: {profileMeta.updatedAt ? new Date(profileMeta.updatedAt).toLocaleDateString() : '—'}
            </p>
          </div>
        </div>
      </section>

      <section style={{
        background: 'white',
        borderRadius: '12px',
        border: '1px solid var(--border)',
        padding: '30px',
        marginBottom: '30px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
      }}>
        <h2 style={{ margin: '0 0 20px 0', color: 'var(--maroon)', fontSize: '24px' }}>Profile Overview</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px'
        }}>
          <DetailCard label="Phone" value={profileData.phone || 'Not added'} icon="📱" />
          <DetailCard label="City" value={profileData.city || 'Not added'} icon="🏙️" />
          <DetailCard label="State" value={profileData.state || 'Not added'} icon="🗺️" />
          <DetailCard label="Pincode" value={profileData.pincode || 'Not added'} icon="📮" />
        </div>
        <div style={{ marginTop: '20px', padding: '20px', background: '#fafafa', borderRadius: '10px', border: '1px dashed var(--border)' }}>
          <p style={{ margin: '0 0 6px 0', fontWeight: 600, color: '#444' }}>Primary Address</p>
          <p style={{ margin: 0, color: '#666', lineHeight: 1.5 }}>
            {profileData.address ? profileData.address : 'No address saved yet.'}
          </p>
        </div>
      </section>

      <section style={{
        background: 'white',
        borderRadius: '12px',
        border: '1px solid var(--border)',
        padding: '30px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
      }}>
        <h2 style={{ margin: '0 0 20px 0', color: 'var(--maroon)', fontSize: '24px' }}>Edit Profile</h2>
        {status.message && (
          <div style={{
            marginBottom: '20px',
            padding: '14px 18px',
            borderRadius: '8px',
            border: status.type === 'error' ? '1px solid #f5b7b1' : '1px solid #b2d8b2',
            background: status.type === 'error' ? '#fdecea' : '#edf7ed',
            color: status.type === 'error' ? '#b03a2e' : '#1e7e34',
            fontSize: '14px'
          }}>
            {status.type === 'error' ? '❌ ' : '✅ '}{status.message}
          </div>
        )}
        {fetching && (
          <div style={{
            marginBottom: '20px',
            padding: '14px 18px',
            borderRadius: '8px',
            border: '1px solid #d4e6f1',
            background: '#ebf5fb',
            color: '#1b4f72',
            fontSize: '14px'
          }}>
            Loading your latest profile details…
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px'
          }}>
            <InputField
              label="Full Name"
              name="name"
              value={profileData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
            <InputField
              label="Email"
              name="email"
              value={profileData.email}
              placeholder="Email"
              disabled
              type="email"
            />
            <InputField
              label="Phone Number"
              name="phone"
              value={profileData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              type="tel"
            />
            <InputField
              label="City"
              name="city"
              value={profileData.city}
              onChange={handleChange}
              placeholder="City"
            />
            <InputField
              label="State"
              name="state"
              value={profileData.state}
              onChange={handleChange}
              placeholder="State"
            />
            <InputField
              label="Pincode"
              name="pincode"
              value={profileData.pincode}
              onChange={handleChange}
              placeholder="Pincode"
            />
          </div>
          <div style={{ marginTop: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>Address</label>
            <textarea
              name="address"
              value={profileData.address}
              onChange={handleChange}
              placeholder="Enter your address"
              rows={4}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                fontSize: '14px',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            style={{
              marginTop: '30px',
              padding: '14px 28px',
              background: 'blue',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: submitting ? 'not-allowed' : 'pointer',
              boxShadow: '0 12px 24px rgba(139,0,0,0.25)',
              transition: 'background 0.3s ease'
            }}
          >
            {submitting ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </section>
    </div>
  );
};

const InputField = ({ label, name, value, onChange = () => {}, placeholder, required = false, disabled = false, type = 'text' }) => (
  <div>
    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={disabled ? undefined : onChange}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      style={{
        width: '100%',
        padding: '12px',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        fontSize: '14px',
        fontFamily: 'inherit',
        background: disabled ? '#f4f4f4' : 'white',
        color: disabled ? '#666' : '#333'
      }}
    />
  </div>
);

const DetailCard = ({ label, value, icon }) => (
  <div style={{
    padding: '20px',
    borderRadius: '10px',
    border: '1px solid var(--border)',
    background: '#fafafa',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  }}>
    <div style={{ fontSize: '24px' }}>{icon}</div>
    <span style={{ fontSize: '12px', letterSpacing: '0.5px', textTransform: 'uppercase', color: '#666' }}>{label}</span>
    <span style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}>{value}</span>
  </div>
);

export default Profile;
