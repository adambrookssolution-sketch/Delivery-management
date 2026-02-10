import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { shipmentAPI } from '../services/api';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  PENDING: {
    label: 'Pendiente',
    bg: 'rgba(234, 179, 8, 0.15)',
    border: 'rgba(234, 179, 8, 0.3)',
    color: '#facc15'
  },
  PICKED_UP: {
    label: 'Recogido',
    bg: 'rgba(59, 130, 246, 0.15)',
    border: 'rgba(59, 130, 246, 0.3)',
    color: '#60a5fa'
  },
  IN_TRANSIT: {
    label: 'En Tránsito',
    bg: 'rgba(168, 85, 247, 0.15)',
    border: 'rgba(168, 85, 247, 0.3)',
    color: '#c084fc'
  },
  OUT_FOR_DELIVERY: {
    label: 'En Camino',
    bg: 'rgba(99, 102, 241, 0.15)',
    border: 'rgba(99, 102, 241, 0.3)',
    color: '#818cf8'
  },
  DELIVERED: {
    label: 'Entregado',
    bg: 'rgba(34, 197, 94, 0.15)',
    border: 'rgba(34, 197, 94, 0.3)',
    color: '#4ade80'
  },
  FAILED: {
    label: 'Fallido',
    bg: 'rgba(239, 68, 68, 0.15)',
    border: 'rgba(239, 68, 68, 0.3)',
    color: '#f87171'
  },
  RETURNED: {
    label: 'Devuelto',
    bg: 'rgba(107, 114, 128, 0.15)',
    border: 'rgba(107, 114, 128, 0.3)',
    color: '#9ca3af'
  },
};

const ShipmentList = () => {
  const [shipments, setShipments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [filters, setFilters] = useState({ status: '', search: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShipments();
  }, [pagination.page, filters]);

  const fetchShipments = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.status && { status: filters.status }),
        ...(filters.search && { search: filters.search }),
      };

      const response = await shipmentAPI.getAll(params);
      setShipments(response.data.data);
      setPagination(prev => ({ ...prev, ...response.data.pagination }));
    } catch (error) {
      toast.error('Error al cargar envíos');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchShipments();
  };

  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.04)',
    backdropFilter: 'blur(24px)',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.08)'
  };

  const inputStyle = {
    padding: '14px 18px',
    background: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    color: '#f1f5f9',
    fontSize: '14px',
    outline: 'none'
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#f1f5f9', marginBottom: '8px' }}>
            Envíos
          </h1>
          <p style={{ color: 'rgba(148, 163, 184, 0.7)', fontSize: '15px' }}>
            Administrar todos los envíos
          </p>
        </div>
        <Link
          to="/shipments/new"
          style={{
            padding: '14px 24px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            borderRadius: '12px',
            color: '#fff',
            fontSize: '14px',
            fontWeight: '600',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)'
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Envío
        </Link>
      </div>

      {/* Filters */}
      <div style={{ ...cardStyle, padding: '24px', marginBottom: '24px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <div style={{ position: 'relative' }}>
              <svg
                className="w-5 h-5"
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'rgba(148, 163, 184, 0.5)'
                }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Buscar por rastreo, remitente o destinatario..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                style={{ ...inputStyle, width: '100%', paddingLeft: '48px' }}
              />
            </div>
          </div>
          <select
            value={filters.status}
            onChange={(e) => {
              setFilters(prev => ({ ...prev, status: e.target.value }));
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            style={{ ...inputStyle, minWidth: '180px', cursor: 'pointer' }}
          >
            <option value="">Todos los Estados</option>
            {Object.entries(STATUS_CONFIG).map(([key, value]) => (
              <option key={key} value={key}>{value.label}</option>
            ))}
          </select>
          <button
            type="submit"
            style={{
              padding: '14px 28px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              color: '#f1f5f9',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Buscar
          </button>
        </form>
      </div>

      {/* Table */}
      <div style={cardStyle}>
        {loading ? (
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
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    {['Rastreo', 'Remitente', 'Destinatario', 'Estado', 'Conductor', 'Fecha', 'Acciones'].map((header) => (
                      <th
                        key={header}
                        style={{
                          padding: '16px 20px',
                          textAlign: 'left',
                          fontSize: '11px',
                          fontWeight: '600',
                          color: 'rgba(148, 163, 184, 0.7)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em'
                        }}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {shipments.map((shipment, index) => (
                    <tr
                      key={shipment.id}
                      style={{
                        borderBottom: index < shipments.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                        transition: 'background 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '18px 20px' }}>
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#60a5fa',
                            background: 'rgba(59, 130, 246, 0.1)',
                            padding: '6px 10px',
                            borderRadius: '6px'
                          }}
                        >
                          {shipment.trackingNumber}
                        </span>
                      </td>
                      <td style={{ padding: '18px 20px' }}>
                        <p style={{ fontSize: '14px', fontWeight: '500', color: '#f1f5f9' }}>
                          {shipment.senderName}
                        </p>
                      </td>
                      <td style={{ padding: '18px 20px' }}>
                        <div>
                          <p style={{ fontSize: '14px', fontWeight: '500', color: '#f1f5f9', marginBottom: '4px' }}>
                            {shipment.recipientName}
                          </p>
                          <p
                            style={{
                              fontSize: '12px',
                              color: 'rgba(148, 163, 184, 0.6)',
                              maxWidth: '200px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {shipment.recipientAddress}
                          </p>
                        </div>
                      </td>
                      <td style={{ padding: '18px 20px' }}>
                        <span
                          style={{
                            padding: '6px 12px',
                            fontSize: '12px',
                            fontWeight: '500',
                            borderRadius: '20px',
                            background: STATUS_CONFIG[shipment.status]?.bg,
                            border: `1px solid ${STATUS_CONFIG[shipment.status]?.border}`,
                            color: STATUS_CONFIG[shipment.status]?.color
                          }}
                        >
                          {STATUS_CONFIG[shipment.status]?.label}
                        </span>
                      </td>
                      <td style={{ padding: '18px 20px', fontSize: '14px', color: 'rgba(148, 163, 184, 0.8)' }}>
                        {shipment.driver?.name || (
                          <span style={{ color: 'rgba(148, 163, 184, 0.4)' }}>Sin asignar</span>
                        )}
                      </td>
                      <td style={{ padding: '18px 20px', fontSize: '13px', color: 'rgba(148, 163, 184, 0.7)' }}>
                        {new Date(shipment.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '18px 20px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Link
                            to={`/shipments/${shipment.id}`}
                            style={{
                              padding: '8px 14px',
                              background: 'rgba(59, 130, 246, 0.1)',
                              border: '1px solid rgba(59, 130, 246, 0.2)',
                              borderRadius: '8px',
                              color: '#60a5fa',
                              fontSize: '12px',
                              fontWeight: '500',
                              textDecoration: 'none',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            Ver
                          </Link>
                          <Link
                            to={`/shipments/${shipment.id}/label`}
                            style={{
                              padding: '8px 14px',
                              background: 'rgba(34, 197, 94, 0.1)',
                              border: '1px solid rgba(34, 197, 94, 0.2)',
                              borderRadius: '8px',
                              color: '#4ade80',
                              fontSize: '12px',
                              fontWeight: '500',
                              textDecoration: 'none',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            Etiqueta
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {shipments.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px'
                  }}
                >
                  <svg className="w-8 h-8" style={{ color: 'rgba(148, 163, 184, 0.4)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <p style={{ color: 'rgba(148, 163, 184, 0.6)', fontSize: '15px' }}>No se encontraron envíos</p>
              </div>
            )}

            {/* Pagination */}
            {pagination.total > pagination.limit && (
              <div
                style={{
                  padding: '20px 24px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <p style={{ fontSize: '13px', color: 'rgba(148, 163, 184, 0.7)' }}>
                  Mostrando {(pagination.page - 1) * pagination.limit + 1} -{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
                  {pagination.total}
                </p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    style={{
                      padding: '10px 20px',
                      background: pagination.page === 1 ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      color: pagination.page === 1 ? 'rgba(148, 163, 184, 0.4)' : 'rgba(226, 232, 240, 0.9)',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: pagination.page === 1 ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page * pagination.limit >= pagination.total}
                    style={{
                      padding: '10px 20px',
                      background: pagination.page * pagination.limit >= pagination.total ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      color: pagination.page * pagination.limit >= pagination.total ? 'rgba(148, 163, 184, 0.4)' : 'rgba(226, 232, 240, 0.9)',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: pagination.page * pagination.limit >= pagination.total ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        input::placeholder {
          color: rgba(148, 163, 184, 0.5);
        }
        input:focus, select:focus {
          border-color: rgba(59, 130, 246, 0.5) !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        select option {
          background: #1e293b;
          color: #f1f5f9;
        }
      `}</style>
    </div>
  );
};

export default ShipmentList;
