import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { shipmentAPI } from '../services/api';
import toast from 'react-hot-toast';

const ShipmentLabel = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [labelData, setLabelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef();

  useEffect(() => {
    fetchLabelData();
  }, [id]);

  const fetchLabelData = async () => {
    try {
      const response = await shipmentAPI.getLabelData(id);
      setLabelData(response.data.data);
    } catch (error) {
      toast.error('Error loading label data');
      navigate('/shipments');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
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

  if (!labelData) return null;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Controls - Hidden during print */}
      <div className="print-hidden" style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <button
            onClick={() => navigate(`/shipments/${id}`)}
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
            Volver a detalles
          </button>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#f1f5f9' }}>
            Etiqueta de Envío 4x6
          </h1>
        </div>
        <button
          onClick={handlePrint}
          style={{
            padding: '14px 24px',
            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            border: 'none',
            borderRadius: '12px',
            color: '#fff',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 8px 24px rgba(34, 197, 94, 0.3)'
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Imprimir Etiqueta
        </button>
      </div>

      {/* Label Preview & Print Area */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div
          ref={printRef}
          className="print-area"
          style={{
            width: '4in',
            height: '6in',
            fontFamily: 'Arial, sans-serif',
            background: '#ffffff',
            border: '2px solid #d1d5db',
            padding: '16px',
            boxSizing: 'border-box'
          }}
        >
          {/* Header with QR */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #000', paddingBottom: '8px', marginBottom: '8px' }}>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#000', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                QuetzalEnvios
              </h1>
              <p style={{ fontSize: '11px', color: '#666', margin: '2px 0 0 0' }}>Sistema de Gestión de Envíos</p>
            </div>
            <div>
              <img
                src={labelData.qrCode}
                alt="QR"
                style={{ width: '80px', height: '80px' }}
              />
            </div>
          </div>

          {/* Tracking Number - Large */}
          <div style={{ background: '#000', color: '#fff', textAlign: 'center', padding: '8px', marginBottom: '12px' }}>
            <p style={{ fontSize: '10px', margin: 0, letterSpacing: '0.1em' }}>NÚMERO DE RASTREO</p>
            <p style={{ fontSize: '16px', fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: '0.1em', margin: '4px 0 0 0' }}>
              {labelData.trackingNumber}
            </p>
          </div>

          {/* From Section */}
          <div style={{ marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #d1d5db' }}>
            <p style={{ fontSize: '10px', fontWeight: 'bold', color: '#666', marginBottom: '4px' }}>DE:</p>
            <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#000', margin: '0 0 2px 0' }}>{labelData.sender.name}</p>
            <p style={{ fontSize: '11px', color: '#000', margin: '0 0 2px 0' }}>{labelData.sender.phone}</p>
            <p style={{ fontSize: '11px', color: '#000', margin: 0, lineHeight: '1.3' }}>{labelData.sender.address}</p>
          </div>

          {/* To Section - Larger */}
          <div style={{ marginBottom: '12px', paddingBottom: '8px', borderBottom: '2px solid #000' }}>
            <p style={{ fontSize: '10px', fontWeight: 'bold', color: '#666', marginBottom: '4px' }}>PARA:</p>
            <p style={{ fontSize: '15px', fontWeight: 'bold', color: '#000', margin: '0 0 2px 0' }}>{labelData.recipient.name}</p>
            <p style={{ fontSize: '13px', fontWeight: '600', color: '#000', margin: '0 0 2px 0' }}>{labelData.recipient.phone}</p>
            <p style={{ fontSize: '13px', fontWeight: '500', color: '#000', margin: 0, lineHeight: '1.3' }}>{labelData.recipient.address}</p>
          </div>

          {/* Package Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '12px', textAlign: 'center' }}>
            <div style={{ border: '1px solid #d1d5db', padding: '6px' }}>
              <p style={{ fontSize: '9px', color: '#666', margin: 0 }}>PESO</p>
              <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#000', margin: '2px 0 0 0' }}>
                {labelData.package.weight ? `${labelData.package.weight} kg` : '-'}
              </p>
            </div>
            <div style={{ border: '1px solid #d1d5db', padding: '6px' }}>
              <p style={{ fontSize: '9px', color: '#666', margin: 0 }}>TAMAÑO</p>
              <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#000', margin: '2px 0 0 0' }}>{labelData.package.size || '-'}</p>
            </div>
            <div style={{ border: '1px solid #d1d5db', padding: '6px' }}>
              <p style={{ fontSize: '9px', color: '#666', margin: 0 }}>FECHA</p>
              <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#000', margin: '2px 0 0 0' }}>
                {new Date(labelData.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Description */}
          {labelData.package.description && (
            <div style={{ marginBottom: '12px', padding: '8px', background: '#f3f4f6', borderRadius: '4px' }}>
              <p style={{ fontSize: '9px', color: '#666', margin: '0 0 2px 0' }}>CONTENIDO:</p>
              <p style={{ fontSize: '11px', color: '#000', margin: 0 }}>{labelData.package.description}</p>
            </div>
          )}

          {/* Barcode area */}
          <div style={{ borderTop: '2px solid #000', paddingTop: '8px', marginTop: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1px', marginBottom: '4px' }}>
                  {labelData.trackingNumber.split('').map((char, i) => (
                    <div
                      key={i}
                      style={{
                        width: i % 3 === 0 ? '3px' : '1px',
                        height: '40px',
                        background: '#000'
                      }}
                    />
                  ))}
                </div>
                <p style={{ fontFamily: 'monospace', fontSize: '12px', letterSpacing: '0.15em', margin: 0, color: '#000' }}>
                  {labelData.trackingNumber}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ textAlign: 'center', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #d1d5db' }}>
            <p style={{ fontSize: '10px', color: '#666', margin: 0 }}>
              Rastree su envío en: tracking.quetzalenvios.com
            </p>
          </div>
        </div>
      </div>

      {/* Print Instructions */}
      <div
        className="print-hidden"
        style={{
          marginTop: '32px',
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: '16px',
          padding: '24px',
          maxWidth: '500px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}
      >
        <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#60a5fa', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Instrucciones de Impresión
        </h3>
        <ul style={{ fontSize: '13px', color: 'rgba(148, 163, 184, 0.9)', margin: 0, paddingLeft: '20px' }}>
          <li style={{ marginBottom: '8px' }}>Use papel de etiqueta 4x6 pulgadas (102 x 152 mm)</li>
          <li style={{ marginBottom: '8px' }}>Configure la impresora para imprimir sin márgenes</li>
          <li style={{ marginBottom: '8px' }}>Verifique que el código QR y el código de barras sean legibles</li>
          <li>Pegue la etiqueta en un área visible del paquete</li>
        </ul>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: 4in 6in;
            margin: 0;
          }

          body {
            margin: 0;
            padding: 0;
            background: white !important;
          }

          .print-area {
            width: 4in !important;
            height: 6in !important;
            margin: 0 !important;
            padding: 0.25in !important;
            border: none !important;
            box-shadow: none !important;
          }

          .print-hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ShipmentLabel;
