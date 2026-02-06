import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { shipmentAPI, userAPI } from '../services/api';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  PENDING: {
    label: 'Pending',
    bg: 'rgba(234, 179, 8, 0.15)',
    border: 'rgba(234, 179, 8, 0.3)',
    color: '#facc15'
  },
  PICKED_UP: {
    label: 'Picked Up',
    bg: 'rgba(59, 130, 246, 0.15)',
    border: 'rgba(59, 130, 246, 0.3)',
    color: '#60a5fa'
  },
  IN_TRANSIT: {
    label: 'In Transit',
    bg: 'rgba(168, 85, 247, 0.15)',
    border: 'rgba(168, 85, 247, 0.3)',
    color: '#c084fc'
  },
  OUT_FOR_DELIVERY: {
    label: 'Out for Delivery',
    bg: 'rgba(99, 102, 241, 0.15)',
    border: 'rgba(99, 102, 241, 0.3)',
    color: '#818cf8'
  },
  DELIVERED: {
    label: 'Delivered',
    bg: 'rgba(34, 197, 94, 0.15)',
    border: 'rgba(34, 197, 94, 0.3)',
    color: '#4ade80'
  },
  FAILED: {
    label: 'Failed',
    bg: 'rgba(239, 68, 68, 0.15)',
    border: 'rgba(239, 68, 68, 0.3)',
    color: '#f87171'
  },
  RETURNED: {
    label: 'Returned',
    bg: 'rgba(107, 114, 128, 0.15)',
    border: 'rgba(107, 114, 128, 0.3)',
    color: '#9ca3af'
  },
};

const ShipmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shipment, setShipment] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [drivers, setDrivers] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');

  useEffect(() => {
    fetchShipment();
    fetchDrivers();
  }, [id]);

  const fetchShipment = async () => {
    try {
      const [shipmentRes, qrRes] = await Promise.all([
        shipmentAPI.getById(id),
        shipmentAPI.getQRCode(id),
      ]);
      setShipment(shipmentRes.data.data);
      setQrCode(qrRes.data.data.qrCode);
    } catch (error) {
      toast.error('Error loading shipment');
      navigate('/shipments');
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await userAPI.getDrivers();
      setDrivers(response.data.data);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const handleAssignDriver = async () => {
    if (!selectedDriver) {
      toast.error('Please select a driver');
      return;
    }

    try {
      await shipmentAPI.assignDriver(id, selectedDriver);
      toast.success('Driver assigned');
      setShowAssignModal(false);
      fetchShipment();
    } catch (error) {
      toast.error('Error assigning driver');
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedStatus) {
      toast.error('Please select a status');
      return;
    }

    try {
      await shipmentAPI.updateStatus(id, {
        status: selectedStatus,
        note: statusNote,
      });
      toast.success('Status updated');
      setShowStatusModal(false);
      setSelectedStatus('');
      setStatusNote('');
      fetchShipment();
    } catch (error) {
      toast.error('Error updating status');
    }
  };

  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.04)',
    backdropFilter: 'blur(24px)',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    padding: '24px'
  };

  const inputStyle = {
    width: '100%',
    padding: '14px 18px',
    background: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    color: '#f1f5f9',
    fontSize: '14px',
    outline: 'none'
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            border: '3px solid rgba(59, 130, 246, 0.2)',
            borderTop: '3px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}
        />
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!shipment) return null;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <button
            onClick={() => navigate('/shipments')}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(148, 163, 184, 0.8)',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '12px',
              padding: 0
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to list
          </button>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#f1f5f9', marginBottom: '12px' }}>
            Shipment {shipment.trackingNumber}
          </h1>
          <span
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: '500',
              borderRadius: '20px',
              background: STATUS_CONFIG[shipment.status]?.bg,
              border: `1px solid ${STATUS_CONFIG[shipment.status]?.border}`,
              color: STATUS_CONFIG[shipment.status]?.color
            }}
          >
            {STATUS_CONFIG[shipment.status]?.label}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowStatusModal(true)}
            style={{
              padding: '12px 20px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              border: 'none',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Change Status
          </button>
          <button
            onClick={() => setShowAssignModal(true)}
            style={{
              padding: '12px 20px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              border: 'none',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Assign Driver
          </button>
          <Link
            to={`/shipments/${id}/label`}
            style={{
              padding: '12px 20px',
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              border: 'none',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none'
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Label
          </Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '24px' }}>
        {/* Main Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Sender & Recipient */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Sender */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
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
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#f1f5f9' }}>Sender</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <p style={{ fontSize: '15px', fontWeight: '500', color: '#f1f5f9' }}>{shipment.senderName}</p>
                <p style={{ fontSize: '14px', color: 'rgba(148, 163, 184, 0.8)' }}>{shipment.senderPhone}</p>
                <p style={{ fontSize: '14px', color: 'rgba(148, 163, 184, 0.7)' }}>{shipment.senderAddress}</p>
              </div>
            </div>

            {/* Recipient */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
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
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#f1f5f9' }}>Recipient</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <p style={{ fontSize: '15px', fontWeight: '500', color: '#f1f5f9' }}>{shipment.recipientName}</p>
                <p style={{ fontSize: '14px', color: 'rgba(148, 163, 184, 0.8)' }}>{shipment.recipientPhone}</p>
                <p style={{ fontSize: '14px', color: 'rgba(148, 163, 184, 0.7)' }}>{shipment.recipientAddress}</p>
                {shipment.recipientLat && shipment.recipientLng && (
                  <a
                    href={`https://www.google.com/maps?q=${shipment.recipientLat},${shipment.recipientLng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '13px',
                      color: '#60a5fa',
                      textDecoration: 'none'
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    View on Google Maps
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Package Info */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
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
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#f1f5f9' }}>Package Information</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
              <div>
                <p style={{ fontSize: '12px', color: 'rgba(148, 163, 184, 0.6)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Weight</p>
                <p style={{ fontSize: '15px', fontWeight: '500', color: '#f1f5f9' }}>{shipment.packageWeight ? `${shipment.packageWeight} kg` : '-'}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: 'rgba(148, 163, 184, 0.6)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Size</p>
                <p style={{ fontSize: '15px', fontWeight: '500', color: '#f1f5f9' }}>{shipment.packageSize || '-'}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: 'rgba(148, 163, 184, 0.6)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Driver</p>
                <p style={{ fontSize: '15px', fontWeight: '500', color: shipment.driver?.name ? '#f1f5f9' : 'rgba(148, 163, 184, 0.5)' }}>{shipment.driver?.name || 'Not assigned'}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: 'rgba(148, 163, 184, 0.6)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Delivery Code</p>
                <p style={{ fontSize: '15px', fontWeight: '600', fontFamily: 'monospace', color: '#facc15' }}>{shipment.deliveryCode || '-'}</p>
              </div>
            </div>
            {shipment.description && (
              <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <p style={{ fontSize: '12px', color: 'rgba(148, 163, 184, 0.6)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</p>
                <p style={{ fontSize: '14px', color: 'rgba(226, 232, 240, 0.9)' }}>{shipment.description}</p>
              </div>
            )}
          </div>

          {/* Status History */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#f1f5f9' }}>Status History</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {shipment.statusHistory?.map((history, index) => (
                <div key={history.id} style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: index === 0 ? '#3b82f6' : 'rgba(148, 163, 184, 0.3)',
                        boxShadow: index === 0 ? '0 0 12px rgba(59, 130, 246, 0.5)' : 'none'
                      }}
                    />
                    {index < shipment.statusHistory.length - 1 && (
                      <div style={{ width: '2px', flex: 1, background: 'rgba(255, 255, 255, 0.1)', marginTop: '4px' }} />
                    )}
                  </div>
                  <div style={{ flex: 1, paddingBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span
                        style={{
                          padding: '4px 10px',
                          fontSize: '11px',
                          fontWeight: '500',
                          borderRadius: '12px',
                          background: STATUS_CONFIG[history.status]?.bg,
                          border: `1px solid ${STATUS_CONFIG[history.status]?.border}`,
                          color: STATUS_CONFIG[history.status]?.color
                        }}
                      >
                        {STATUS_CONFIG[history.status]?.label}
                      </span>
                      <span style={{ fontSize: '12px', color: 'rgba(148, 163, 184, 0.6)' }}>
                        {new Date(history.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {history.note && (
                      <p style={{ fontSize: '13px', color: 'rgba(148, 163, 184, 0.8)', marginTop: '4px' }}>{history.note}</p>
                    )}
                    {history.location && (
                      <p style={{ fontSize: '12px', color: 'rgba(148, 163, 184, 0.5)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {history.location}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar - QR Code & Evidence */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* QR Code */}
          <div style={{ ...cardStyle, textAlign: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#f1f5f9', marginBottom: '20px' }}>QR Code</h3>
            {qrCode && (
              <div
                style={{
                  background: '#ffffff',
                  padding: '16px',
                  borderRadius: '16px',
                  display: 'inline-block',
                  marginBottom: '16px'
                }}
              >
                <img
                  src={qrCode}
                  alt="QR Code"
                  style={{ width: '180px', height: '180px', display: 'block' }}
                />
              </div>
            )}
            <p
              style={{
                fontFamily: 'monospace',
                fontSize: '18px',
                fontWeight: '700',
                color: '#60a5fa',
                background: 'rgba(59, 130, 246, 0.1)',
                padding: '12px 16px',
                borderRadius: '10px',
                border: '1px solid rgba(59, 130, 246, 0.2)'
              }}
            >
              {shipment.trackingNumber}
            </p>
          </div>

          {/* Delivery Evidence */}
          {shipment.status === 'DELIVERED' && (
            <div style={cardStyle}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#f1f5f9', marginBottom: '20px' }}>Delivery Evidence</h3>
              {shipment.photoUrl && (
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontSize: '12px', color: 'rgba(148, 163, 184, 0.6)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Photo</p>
                  <img
                    src={shipment.photoUrl}
                    alt="Delivery photo"
                    style={{ width: '100%', borderRadius: '12px' }}
                  />
                </div>
              )}
              {shipment.signatureUrl && (
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontSize: '12px', color: 'rgba(148, 163, 184, 0.6)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Signature</p>
                  <img
                    src={shipment.signatureUrl}
                    alt="Signature"
                    style={{ width: '100%', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.05)' }}
                  />
                </div>
              )}
              {shipment.deliveredAt && (
                <p style={{ fontSize: '13px', color: 'rgba(148, 163, 184, 0.7)' }}>
                  Delivered on: {new Date(shipment.deliveredAt).toLocaleString()}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Assign Driver Modal */}
      {showAssignModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              padding: '28px',
              width: '100%',
              maxWidth: '400px'
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#f1f5f9', marginBottom: '20px' }}>Assign Driver</h3>
            <select
              value={selectedDriver}
              onChange={(e) => setSelectedDriver(e.target.value)}
              style={{ ...inputStyle, marginBottom: '20px', cursor: 'pointer' }}
            >
              <option value="">Select a driver</option>
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.name}
                </option>
              ))}
            </select>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setShowAssignModal(false)}
                style={{
                  padding: '12px 20px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  color: 'rgba(226, 232, 240, 0.9)',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAssignDriver}
                style={{
                  padding: '12px 20px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {showStatusModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              padding: '28px',
              width: '100%',
              maxWidth: '400px'
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#f1f5f9', marginBottom: '20px' }}>Change Status</h3>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{ ...inputStyle, marginBottom: '16px', cursor: 'pointer' }}
            >
              <option value="">Select a status</option>
              {Object.entries(STATUS_CONFIG).map(([key, value]) => (
                <option key={key} value={key}>{value.label}</option>
              ))}
            </select>
            <textarea
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              placeholder="Note (optional)"
              rows={3}
              style={{ ...inputStyle, marginBottom: '20px', resize: 'none', minHeight: '80px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setShowStatusModal(false)}
                style={{
                  padding: '12px 20px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  color: 'rgba(226, 232, 240, 0.9)',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                style={{
                  padding: '12px 20px',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        select option {
          background: #1e293b;
          color: #f1f5f9;
        }
        input:focus, select:focus, textarea:focus {
          border-color: rgba(59, 130, 246, 0.5) !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        textarea::placeholder {
          color: rgba(148, 163, 184, 0.5);
        }
        @media (max-width: 1024px) {
          div[style*="gridTemplateColumns: '1fr 360px'"] {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns: '1fr 1fr'"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="gridTemplateColumns: 'repeat(4, 1fr)'"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ShipmentDetail;
