import { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const STATUS_LABELS = {
  PENDING: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
  PICKED_UP: { label: 'Recogido', color: 'bg-blue-100 text-blue-800', icon: '📦' },
  IN_TRANSIT: { label: 'En Tránsito', color: 'bg-purple-100 text-purple-800', icon: '🚚' },
  OUT_FOR_DELIVERY: { label: 'En Camino', color: 'bg-indigo-100 text-indigo-800', icon: '🛵' },
  DELIVERED: { label: 'Entregado', color: 'bg-green-100 text-green-800', icon: '✅' },
  FAILED: { label: 'Fallido', color: 'bg-red-100 text-red-800', icon: '❌' },
  RETURNED: { label: 'Devuelto', color: 'bg-gray-100 text-gray-800', icon: '↩️' },
};

function App() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!trackingNumber.trim()) {
      setError('Por favor ingrese un número de rastreo');
      return;
    }

    setLoading(true);
    setError('');
    setShipment(null);

    try {
      const response = await axios.get(`${API_URL}/shipments/track/${trackingNumber.trim()}`);
      setShipment(response.data.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('No se encontró ningún envío con ese número de rastreo');
      } else {
        setError('Error al buscar el envío. Intente nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">📦 QuetzalEnvios</h1>
          <p className="text-white/80">Rastrea tu envío en tiempo real</p>
        </div>

        {/* Search Box */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <form onSubmit={handleSearch}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de Rastreo
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                placeholder="Ej: PKG-20260204-A1B2C"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-lg font-mono"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  '🔍 Buscar'
                )}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Results */}
        {shipment && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Status Header */}
            <div className={`p-6 ${shipment.status === 'DELIVERED' ? 'bg-green-500' : 'bg-purple-600'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Número de Rastreo</p>
                  <p className="text-white text-xl font-mono font-bold">{shipment.trackingNumber}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${STATUS_LABELS[shipment.status]?.color}`}>
                    <span className="mr-2">{STATUS_LABELS[shipment.status]?.icon}</span>
                    {STATUS_LABELS[shipment.status]?.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Shipment Info */}
            <div className="p-6 border-b">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Remitente</p>
                  <p className="font-medium text-gray-900">{shipment.senderName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Destinatario</p>
                  <p className="font-medium text-gray-900">{shipment.recipientName}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Dirección de Entrega</p>
                  <p className="font-medium text-gray-900">{shipment.recipientAddress}</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Historial del Envío
              </h3>
              <div className="space-y-4">
                {shipment.statusHistory?.map((history, index) => (
                  <div key={index} className="flex">
                    <div className="flex flex-col items-center mr-4">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        index === 0 ? 'bg-purple-500' : 'bg-gray-300'
                      }`}>
                        {index === 0 && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      {index < shipment.statusHistory.length - 1 && (
                        <div className="w-0.5 flex-1 bg-gray-200 mt-1"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${STATUS_LABELS[history.status]?.color}`}>
                          {STATUS_LABELS[history.status]?.icon} {STATUS_LABELS[history.status]?.label}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(history.createdAt).toLocaleString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      {history.note && (
                        <p className="text-sm text-gray-600">{history.note}</p>
                      )}
                      {history.location && (
                        <p className="text-xs text-gray-500">📍 {history.location}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Info */}
            {shipment.status === 'DELIVERED' && shipment.deliveredAt && (
              <div className="p-6 bg-green-50 border-t border-green-100">
                <div className="flex items-center">
                  <span className="text-3xl mr-4">✅</span>
                  <div>
                    <p className="font-semibold text-green-800">¡Paquete Entregado!</p>
                    <p className="text-sm text-green-700">
                      Entregado el {new Date(shipment.deliveredAt).toLocaleString('es-ES', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-white/60 text-sm">
            © 2024 QuetzalEnvios - Sistema de Gestión de Envíos
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
