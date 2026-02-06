import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { shipmentAPI, userAPI } from '../services/api';
import toast from 'react-hot-toast';

const CreateShipment = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [createdShipment, setCreatedShipment] = useState(null);
  const [qrCode, setQrCode] = useState(null);

  const [formData, setFormData] = useState({
    // Sender
    senderName: '',
    senderPhone: '',
    senderAddress: '',
    // Recipient
    recipientName: '',
    recipientPhone: '',
    recipientAddress: '',
    recipientLat: '',
    recipientLng: '',
    // Package
    packageWeight: '',
    packageSize: 'MEDIUM',
    description: '',
    // Assignment
    driverId: '',
    generateDeliveryCode: true,
  });

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const response = await userAPI.getDrivers();
      setDrivers(response.data.data);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare data - only include fields with values
      const data = {
        senderName: formData.senderName,
        senderPhone: formData.senderPhone,
        senderAddress: formData.senderAddress,
        recipientName: formData.recipientName,
        recipientPhone: formData.recipientPhone,
        recipientAddress: formData.recipientAddress,
        generateDeliveryCode: formData.generateDeliveryCode,
      };

      // Only add optional fields if they have values
      if (formData.recipientLat) data.recipientLat = parseFloat(formData.recipientLat);
      if (formData.recipientLng) data.recipientLng = parseFloat(formData.recipientLng);
      if (formData.packageWeight) data.packageWeight = parseFloat(formData.packageWeight);
      if (formData.packageSize) data.packageSize = formData.packageSize;
      if (formData.description) data.description = formData.description;
      if (formData.driverId) data.driverId = formData.driverId;

      const response = await shipmentAPI.create(data);
      const shipment = response.data.data;

      // Get QR code
      const qrResponse = await shipmentAPI.getQRCode(shipment.id);
      setQrCode(qrResponse.data.data.qrCode);
      setCreatedShipment(shipment);

      toast.success('Shipment created successfully!');
    } catch (error) {
      const message = error.response?.data?.message || 'Error creating shipment';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '14px 18px',
    background: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    color: '#f1f5f9',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s ease'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: '500',
    color: 'rgba(226, 232, 240, 0.9)',
    marginBottom: '8px'
  };

  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.04)',
    backdropFilter: 'blur(24px)',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    padding: '28px'
  };

  // Show success view with QR code
  if (createdShipment) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div
          style={{
            ...cardStyle,
            textAlign: 'center',
            padding: '48px 40px'
          }}
        >
          {/* Success Icon */}
          <div
            style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              border: '1px solid rgba(34, 197, 94, 0.3)'
            }}
          >
            <svg className="w-10 h-10" style={{ color: '#22c55e' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#f1f5f9', marginBottom: '8px' }}>
            Shipment Created!
          </h1>
          <p style={{ color: 'rgba(148, 163, 184, 0.8)', fontSize: '15px', marginBottom: '32px' }}>
            The shipment has been registered successfully
          </p>

          {/* Tracking Number */}
          <div
            style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px'
            }}
          >
            <p style={{ color: 'rgba(148, 163, 184, 0.7)', fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Tracking Number
            </p>
            <p style={{ fontSize: '24px', fontFamily: 'monospace', fontWeight: '700', color: '#60a5fa' }}>
              {createdShipment.trackingNumber}
            </p>
          </div>

          {/* QR Code */}
          {qrCode && (
            <div style={{ marginBottom: '24px' }}>
              <p style={{ color: 'rgba(148, 163, 184, 0.7)', fontSize: '13px', marginBottom: '16px' }}>
                QR Code
              </p>
              <div
                style={{
                  background: '#ffffff',
                  padding: '16px',
                  borderRadius: '16px',
                  display: 'inline-block'
                }}
              >
                <img
                  src={qrCode}
                  alt="QR Code"
                  style={{ width: '180px', height: '180px', display: 'block' }}
                />
              </div>
            </div>
          )}

          {/* Delivery Code */}
          {createdShipment.deliveryCode && (
            <div
              style={{
                background: 'rgba(234, 179, 8, 0.1)',
                border: '1px solid rgba(234, 179, 8, 0.2)',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '32px'
              }}
            >
              <p style={{ color: 'rgba(148, 163, 184, 0.7)', fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Delivery Code
              </p>
              <p style={{ fontSize: '28px', fontFamily: 'monospace', fontWeight: '700', color: '#facc15', letterSpacing: '0.2em' }}>
                {createdShipment.deliveryCode}
              </p>
              <p style={{ color: 'rgba(148, 163, 184, 0.6)', fontSize: '12px', marginTop: '12px' }}>
                The recipient must provide this code to receive the package
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate(`/shipments/${createdShipment.id}/label`)}
              style={{
                padding: '14px 24px',
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Label
            </button>
            <button
              onClick={() => {
                setCreatedShipment(null);
                setQrCode(null);
                setFormData({
                  senderName: '',
                  senderPhone: '',
                  senderAddress: '',
                  recipientName: '',
                  recipientPhone: '',
                  recipientAddress: '',
                  recipientLat: '',
                  recipientLng: '',
                  packageWeight: '',
                  packageSize: 'MEDIUM',
                  description: '',
                  driverId: '',
                  generateDeliveryCode: true,
                });
              }}
              style={{
                padding: '14px 24px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Create Another
            </button>
            <button
              onClick={() => navigate('/shipments')}
              style={{
                padding: '14px 24px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                color: 'rgba(226, 232, 240, 0.9)',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              View All Shipments
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#f1f5f9', marginBottom: '8px' }}>
          New Shipment
        </h1>
        <p style={{ color: 'rgba(148, 163, 184, 0.7)', fontSize: '15px' }}>
          Fill in the details to create a new shipment
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
          {/* Sender Information */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(34, 211, 238, 0.1) 100%)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(59, 130, 246, 0.2)'
                }}
              >
                <svg className="w-5 h-5" style={{ color: '#60a5fa' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </div>
              <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#f1f5f9' }}>
                Sender Information
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={labelStyle}>Name *</label>
                <input
                  type="text"
                  name="senderName"
                  value={formData.senderName}
                  onChange={handleChange}
                  required
                  placeholder="Full name or company"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Phone *</label>
                <input
                  type="tel"
                  name="senderPhone"
                  value={formData.senderPhone}
                  onChange={handleChange}
                  required
                  placeholder="+1 234 567 8900"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Address *</label>
                <textarea
                  name="senderAddress"
                  value={formData.senderAddress}
                  onChange={handleChange}
                  required
                  rows={3}
                  placeholder="Full address"
                  style={{ ...inputStyle, resize: 'none', minHeight: '90px' }}
                />
              </div>
            </div>
          </div>

          {/* Recipient Information */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(34, 197, 94, 0.2)'
                }}
              >
                <svg className="w-5 h-5" style={{ color: '#4ade80' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
              <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#f1f5f9' }}>
                Recipient Information
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={labelStyle}>Name *</label>
                <input
                  type="text"
                  name="recipientName"
                  value={formData.recipientName}
                  onChange={handleChange}
                  required
                  placeholder="Full name"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Phone *</label>
                <input
                  type="tel"
                  name="recipientPhone"
                  value={formData.recipientPhone}
                  onChange={handleChange}
                  required
                  placeholder="+1 234 567 8900"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Address *</label>
                <textarea
                  name="recipientAddress"
                  value={formData.recipientAddress}
                  onChange={handleChange}
                  required
                  rows={3}
                  placeholder="Full delivery address"
                  style={{ ...inputStyle, resize: 'none', minHeight: '90px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Latitude</label>
                  <input
                    type="number"
                    name="recipientLat"
                    value={formData.recipientLat}
                    onChange={handleChange}
                    step="any"
                    placeholder="40.7128"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Longitude</label>
                  <input
                    type="number"
                    name="recipientLng"
                    value={formData.recipientLng}
                    onChange={handleChange}
                    step="any"
                    placeholder="-74.0060"
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Package Information */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(168, 85, 247, 0.2)'
                }}
              >
                <svg className="w-5 h-5" style={{ color: '#c084fc' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#f1f5f9' }}>
                Package Information
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Weight (kg)</label>
                  <input
                    type="number"
                    name="packageWeight"
                    value={formData.packageWeight}
                    onChange={handleChange}
                    step="0.1"
                    min="0"
                    placeholder="0.0"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Size</label>
                  <select
                    name="packageSize"
                    value={formData.packageSize}
                    onChange={handleChange}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    <option value="SMALL">Small</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LARGE">Large</option>
                    <option value="EXTRA_LARGE">Extra Large</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Content Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Description of package contents"
                  style={{ ...inputStyle, resize: 'none', minHeight: '70px' }}
                />
              </div>
            </div>
          </div>

          {/* Shipping Options */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.2) 0%, rgba(245, 158, 11, 0.1) 100%)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(234, 179, 8, 0.2)'
                }}
              >
                <svg className="w-5 h-5" style={{ color: '#fbbf24' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#f1f5f9' }}>
                Shipping Options
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={labelStyle}>Assign Driver</label>
                <select
                  name="driverId"
                  value={formData.driverId}
                  onChange={handleChange}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  <option value="">Not assigned</option>
                  {drivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name} ({driver._count?.assignedShipments || 0} active shipments)
                    </option>
                  ))}
                </select>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '16px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}
              >
                <input
                  type="checkbox"
                  id="generateDeliveryCode"
                  name="generateDeliveryCode"
                  checked={formData.generateDeliveryCode}
                  onChange={handleChange}
                  style={{
                    width: '20px',
                    height: '20px',
                    marginTop: '2px',
                    accentColor: '#3b82f6',
                    cursor: 'pointer'
                  }}
                />
                <div>
                  <label
                    htmlFor="generateDeliveryCode"
                    style={{ fontSize: '14px', color: 'rgba(226, 232, 240, 0.9)', cursor: 'pointer', fontWeight: '500' }}
                  >
                    Generate delivery verification code
                  </label>
                  <p style={{ fontSize: '12px', color: 'rgba(148, 163, 184, 0.6)', marginTop: '6px' }}>
                    If enabled, the recipient must provide a 6-digit code to receive the package
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
          <button
            type="button"
            onClick={() => navigate('/shipments')}
            style={{
              padding: '14px 28px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              color: 'rgba(226, 232, 240, 0.9)',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '14px 32px',
              background: loading ? 'rgba(59, 130, 246, 0.5)' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              border: 'none',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: loading ? 'none' : '0 8px 24px rgba(59, 130, 246, 0.3)',
              transition: 'all 0.2s ease'
            }}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Create Shipment
              </>
            )}
          </button>
        </div>
      </form>

      <style>{`
        input::placeholder, textarea::placeholder {
          color: rgba(148, 163, 184, 0.5);
        }
        input:focus, textarea:focus, select:focus {
          border-color: rgba(59, 130, 246, 0.5) !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        select option {
          background: #1e293b;
          color: #f1f5f9;
        }
        @media (max-width: 768px) {
          form > div:first-of-type {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CreateShipment;
