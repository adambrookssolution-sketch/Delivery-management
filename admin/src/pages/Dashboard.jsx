import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { shipmentAPI } from '../services/api';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  PENDING: { label: 'Pending', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
  PICKED_UP: { label: 'Picked Up', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' },
  IN_TRANSIT: { label: 'In Transit', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.15)' },
  DELIVERED: { label: 'Delivered', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
  FAILED: { label: 'Failed', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' },
  RETURNED: { label: 'Returned', color: '#6b7280', bg: 'rgba(107, 114, 128, 0.15)' },
};

const Dashboard = () => {
  const [shipments, setShipments] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inTransit: 0,
    delivered: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Get recent shipments for the table
      const response = await shipmentAPI.getAll({ limit: 10 });
      const data = response.data.data;
      setShipments(data);

      // Get counts by status using separate API calls with filters
      const [pendingRes, inTransitRes, deliveredRes] = await Promise.all([
        shipmentAPI.getAll({ limit: 1, status: 'PENDING' }),
        shipmentAPI.getAll({ limit: 1, status: 'IN_TRANSIT' }),
        shipmentAPI.getAll({ limit: 1, status: 'DELIVERED' }),
      ]);

      // Also get picked up and out for delivery for "in transit" count
      const [pickedUpRes, outForDeliveryRes] = await Promise.all([
        shipmentAPI.getAll({ limit: 1, status: 'PICKED_UP' }),
        shipmentAPI.getAll({ limit: 1, status: 'OUT_FOR_DELIVERY' }),
      ]);

      setStats({
        total: response.data.pagination.total,
        pending: pendingRes.data.pagination.total,
        inTransit: inTransitRes.data.pagination.total + pickedUpRes.data.pagination.total + outForDeliveryRes.data.pagination.total,
        delivered: deliveredRes.data.pagination.total,
      });
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: '60vh' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            border: '3px solid rgba(59, 130, 246, 0.2)',
            borderTopColor: '#3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Shipments',
      value: stats.total,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
        </svg>
      ),
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #22d3ee 100%)',
      shadowColor: 'rgba(59, 130, 246, 0.4)'
    },
    {
      label: 'Pending',
      value: stats.pending,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      ),
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
      shadowColor: 'rgba(245, 158, 11, 0.4)'
    },
    {
      label: 'In Transit',
      value: stats.inTransit,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
        </svg>
      ),
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
      shadowColor: 'rgba(139, 92, 246, 0.4)'
    },
    {
      label: 'Delivered',
      value: stats.delivered,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      ),
      gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
      shadowColor: 'rgba(16, 185, 129, 0.4)'
    },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 className="text-white font-bold" style={{ fontSize: '28px', marginBottom: '8px' }}>
          Dashboard
        </h1>
        <p style={{ color: 'rgba(148, 163, 184, 0.8)', fontSize: '15px' }}>
          Welcome back! Here's your delivery overview.
        </p>
      </div>

      {/* Stats Cards */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}
      >
        {statCards.map((card, index) => (
          <div
            key={index}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '20px',
              padding: '28px'
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p style={{ color: 'rgba(148, 163, 184, 0.8)', fontSize: '14px', marginBottom: '8px' }}>
                  {card.label}
                </p>
                <p className="text-white font-bold" style={{ fontSize: '36px' }}>
                  {card.value}
                </p>
              </div>
              <div
                className="flex items-center justify-center"
                style={{
                  width: '56px',
                  height: '56px',
                  background: card.gradient,
                  borderRadius: '16px',
                  boxShadow: `0 8px 24px ${card.shadowColor}`,
                  color: 'white'
                }}
              >
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Shipments */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '20px',
          overflow: 'hidden'
        }}
      >
        {/* Table Header */}
        <div
          className="flex items-center justify-between"
          style={{
            padding: '24px 28px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <div>
            <h2 className="text-white font-semibold" style={{ fontSize: '18px' }}>
              Recent Shipments
            </h2>
            <p style={{ color: 'rgba(148, 163, 184, 0.6)', fontSize: '13px', marginTop: '4px' }}>
              Latest delivery activities
            </p>
          </div>
          <Link
            to="/shipments/new"
            className="flex items-center transition-all duration-300"
            style={{
              padding: '12px 20px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #22d3ee 100%)',
              borderRadius: '12px',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              gap: '8px',
              boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)'
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
            </svg>
            New Shipment
          </Link>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <th
                  style={{
                    padding: '16px 28px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: 'rgba(148, 163, 184, 0.8)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  Tracking
                </th>
                <th
                  style={{
                    padding: '16px 28px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: 'rgba(148, 163, 184, 0.8)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  Recipient
                </th>
                <th
                  style={{
                    padding: '16px 28px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: 'rgba(148, 163, 184, 0.8)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  Status
                </th>
                <th
                  style={{
                    padding: '16px 28px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: 'rgba(148, 163, 184, 0.8)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  Date
                </th>
                <th
                  style={{
                    padding: '16px 28px',
                    textAlign: 'right',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: 'rgba(148, 163, 184, 0.8)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((shipment, index) => (
                <tr
                  key={shipment.id}
                  style={{
                    borderBottom: index < shipments.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none'
                  }}
                >
                  <td style={{ padding: '20px 28px' }}>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#60a5fa'
                      }}
                    >
                      {shipment.trackingNumber}
                    </span>
                  </td>
                  <td style={{ padding: '20px 28px' }}>
                    <div>
                      <p className="text-white font-medium" style={{ fontSize: '14px' }}>
                        {shipment.recipientName}
                      </p>
                      <p
                        style={{
                          color: 'rgba(148, 163, 184, 0.6)',
                          fontSize: '13px',
                          marginTop: '4px',
                          maxWidth: '250px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {shipment.recipientAddress}
                      </p>
                    </div>
                  </td>
                  <td style={{ padding: '20px 28px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background: STATUS_CONFIG[shipment.status]?.bg,
                        color: STATUS_CONFIG[shipment.status]?.color
                      }}
                    >
                      {STATUS_CONFIG[shipment.status]?.label}
                    </span>
                  </td>
                  <td style={{ padding: '20px 28px' }}>
                    <span style={{ color: 'rgba(148, 163, 184, 0.8)', fontSize: '14px' }}>
                      {new Date(shipment.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td style={{ padding: '20px 28px', textAlign: 'right' }}>
                    <Link
                      to={`/shipments/${shipment.id}`}
                      className="inline-flex items-center transition-all duration-200"
                      style={{
                        padding: '8px 16px',
                        background: 'rgba(59, 130, 246, 0.15)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '8px',
                        color: '#60a5fa',
                        fontSize: '13px',
                        fontWeight: '500',
                        gap: '6px'
                      }}
                    >
                      View
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                      </svg>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {shipments.length === 0 && (
          <div className="text-center" style={{ padding: '64px 28px' }}>
            <div
              className="inline-flex items-center justify-center"
              style={{
                width: '64px',
                height: '64px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '16px',
                marginBottom: '20px'
              }}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'rgba(148, 163, 184, 0.5)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
            </div>
            <p style={{ color: 'rgba(148, 163, 184, 0.8)', fontSize: '15px', marginBottom: '20px' }}>
              No shipments yet
            </p>
            <Link
              to="/shipments/new"
              className="inline-flex items-center transition-all duration-300"
              style={{
                padding: '14px 24px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #22d3ee 100%)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                gap: '8px'
              }}
            >
              Create First Shipment
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
