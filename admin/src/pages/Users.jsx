import { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import toast from 'react-hot-toast';

const ROLE_CONFIG = {
  ADMIN: { label: 'Admin', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)', border: 'rgba(139, 92, 246, 0.3)' },
  DRIVER: { label: 'Conductor', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.3)' },
  DISPATCHER: { label: 'Despachador', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)' },
};

const STATUS_CONFIG = {
  active: { label: 'Activo', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)' },
  inactive: { label: 'Inactivo', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)' },
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [filters, setFilters] = useState({ search: '', role: '', isActive: '' });
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'DRIVER',
    isActive: true,
  });

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (filters.search) params.search = filters.search;
      if (filters.role) params.role = filters.role;
      if (filters.isActive !== '') params.isActive = filters.isActive === 'true';

      const response = await userAPI.getAll(params);
      setUsers(response.data.data);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination.total,
        totalPages: response.data.pagination.totalPages,
      }));
    } catch (error) {
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      role: 'DRIVER',
      isActive: true,
    });
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      phone: user.phone || '',
      role: user.role,
      isActive: user.isActive,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const updateData = { ...formData };
        if (!updateData.password) delete updateData.password;
        await userAPI.update(editingUser.id, updateData);
        toast.success('Usuario actualizado exitosamente');
      } else {
        await userAPI.create(formData);
        toast.success('Usuario creado exitosamente');
      }
      setShowModal(false);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operación fallida');
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Está seguro que desea desactivar "${user.name}"?`)) return;
    try {
      await userAPI.delete(user.id);
      toast.success('Usuario desactivado');
      fetchUsers();
    } catch (error) {
      toast.error('Error al desactivar usuario');
    }
  };

  if (loading && users.length === 0) {
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

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: '32px' }}>
        <div>
          <h1 className="text-white font-bold" style={{ fontSize: '28px', marginBottom: '8px' }}>
            Usuarios
          </h1>
          <p style={{ color: 'rgba(148, 163, 184, 0.8)', fontSize: '15px' }}>
            Administrar usuarios y conductores
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center transition-all duration-300"
          style={{
            padding: '14px 24px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #22d3ee 100%)',
            borderRadius: '12px',
            border: 'none',
            color: 'white',
            fontSize: '15px',
            fontWeight: '600',
            gap: '10px',
            boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)',
            cursor: 'pointer'
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
          </svg>
          Agregar Usuario
        </button>
      </div>

      {/* Filters */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.04)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '24px'
        }}
      >
        <div className="flex flex-wrap items-center" style={{ gap: '16px' }}>
          {/* Search */}
          <div className="flex-1" style={{ minWidth: '200px' }}>
            <div className="relative">
              <svg
                className="w-5 h-5 absolute"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(148, 163, 184, 0.6)' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input
                type="text"
                placeholder="Buscar por nombre o correo..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 44px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  color: '#f1f5f9',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Role Filter */}
          <div style={{ minWidth: '150px' }}>
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                color: '#f1f5f9',
                fontSize: '14px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="">Todos los Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="DRIVER">Conductor</option>
              <option value="DISPATCHER">Despachador</option>
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ minWidth: '150px' }}>
            <select
              value={filters.isActive}
              onChange={(e) => handleFilterChange('isActive', e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                color: '#f1f5f9',
                fontSize: '14px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="">Todos los Estados</option>
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
          </div>

          {/* Clear Filters */}
          {(filters.search || filters.role || filters.isActive !== '') && (
            <button
              onClick={() => setFilters({ search: '', role: '', isActive: '' })}
              style={{
                padding: '12px 16px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '10px',
                color: '#f87171',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.04)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '20px',
          overflow: 'hidden'
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                {['Usuario', 'Correo', 'Teléfono', 'Rol', 'Estado', 'Creado', 'Acciones'].map((header) => (
                  <th
                    key={header}
                    style={{
                      padding: '16px 20px',
                      textAlign: header === 'Acciones' ? 'right' : 'left',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: 'rgba(148, 163, 184, 0.8)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr
                  key={user.id}
                  style={{
                    borderBottom: index < users.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '16px 20px' }}>
                    <div className="flex items-center" style={{ gap: '12px' }}>
                      <div
                        className="flex items-center justify-center rounded-xl font-bold text-white"
                        style={{
                          width: '40px',
                          height: '40px',
                          background: `linear-gradient(135deg, ${ROLE_CONFIG[user.role]?.color || '#3b82f6'} 0%, ${ROLE_CONFIG[user.role]?.color || '#3b82f6'}88 100%)`,
                          fontSize: '14px'
                        }}
                      >
                        {user.name[0]}
                      </div>
                      <span className="text-white font-medium" style={{ fontSize: '14px' }}>
                        {user.name}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ color: 'rgba(148, 163, 184, 0.9)', fontSize: '14px' }}>
                      {user.email}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ color: 'rgba(148, 163, 184, 0.9)', fontSize: '14px' }}>
                      {user.phone || '-'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '5px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background: ROLE_CONFIG[user.role]?.bg,
                        color: ROLE_CONFIG[user.role]?.color,
                        border: `1px solid ${ROLE_CONFIG[user.role]?.border}`
                      }}
                    >
                      {ROLE_CONFIG[user.role]?.label}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '5px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background: user.isActive ? STATUS_CONFIG.active.bg : STATUS_CONFIG.inactive.bg,
                        color: user.isActive ? STATUS_CONFIG.active.color : STATUS_CONFIG.inactive.color,
                        border: `1px solid ${user.isActive ? STATUS_CONFIG.active.border : STATUS_CONFIG.inactive.border}`
                      }}
                    >
                      {user.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ color: 'rgba(148, 163, 184, 0.8)', fontSize: '14px' }}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <div className="flex items-center justify-end" style={{ gap: '8px' }}>
                      <button
                        onClick={() => openEditModal(user)}
                        style={{
                          padding: '8px 14px',
                          background: 'rgba(59, 130, 246, 0.15)',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          borderRadius: '8px',
                          color: '#60a5fa',
                          fontSize: '13px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                        Editar
                      </button>
                      {user.isActive && (
                        <button
                          onClick={() => handleDelete(user)}
                          style={{
                            padding: '8px 14px',
                            background: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '8px',
                            color: '#f87171',
                            fontSize: '13px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                          </svg>
                          Desactivar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
              </svg>
            </div>
            <p style={{ color: 'rgba(148, 163, 184, 0.8)', fontSize: '15px', marginBottom: '20px' }}>
              No se encontraron usuarios
            </p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center transition-all duration-300"
              style={{
                padding: '14px 24px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #22d3ee 100%)',
                borderRadius: '12px',
                border: 'none',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              Agregar Primer Usuario
            </button>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div
            className="flex items-center justify-between"
            style={{
              padding: '16px 20px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <p style={{ color: 'rgba(148, 163, 184, 0.7)', fontSize: '14px' }}>
              Mostrando {((pagination.page - 1) * pagination.limit) + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} usuarios
            </p>
            <div className="flex items-center" style={{ gap: '8px' }}>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                style={{
                  padding: '8px 14px',
                  background: pagination.page === 1 ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: pagination.page === 1 ? 'rgba(148, 163, 184, 0.4)' : 'rgba(148, 163, 184, 0.9)',
                  fontSize: '14px',
                  cursor: pagination.page === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                Anterior
              </button>
              <span style={{ color: 'rgba(148, 163, 184, 0.8)', fontSize: '14px', padding: '0 12px' }}>
                Página {pagination.page} de {pagination.totalPages}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
                style={{
                  padding: '8px 14px',
                  background: pagination.page === pagination.totalPages ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: pagination.page === pagination.totalPages ? 'rgba(148, 163, 184, 0.4)' : 'rgba(148, 163, 184, 0.9)',
                  fontSize: '14px',
                  cursor: pagination.page === pagination.totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '480px',
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '24px',
              padding: '32px',
              margin: '20px'
            }}
          >
            <div className="flex items-center justify-between" style={{ marginBottom: '28px' }}>
              <h2 className="text-white font-bold" style={{ fontSize: '22px' }}>
                {editingUser ? 'Editar Usuario' : 'Crear Usuario'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  width: '40px',
                  height: '40px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  color: 'rgba(148, 163, 184, 0.8)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Name */}
                <div>
                  <label style={{ display: 'block', color: 'rgba(148, 163, 184, 0.9)', fontSize: '13px', fontWeight: '500', marginBottom: '8px' }}>
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: '#f1f5f9',
                      fontSize: '15px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Ingrese nombre completo"
                  />
                </div>

                {/* Email */}
                <div>
                  <label style={{ display: 'block', color: 'rgba(148, 163, 184, 0.9)', fontSize: '13px', fontWeight: '500', marginBottom: '8px' }}>
                    Correo *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: '#f1f5f9',
                      fontSize: '15px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    placeholder="email@example.com"
                  />
                </div>

                {/* Password */}
                <div>
                  <label style={{ display: 'block', color: 'rgba(148, 163, 184, 0.9)', fontSize: '13px', fontWeight: '500', marginBottom: '8px' }}>
                    Contraseña {editingUser ? '(deje en blanco para mantener actual)' : '*'}
                  </label>
                  <input
                    type="password"
                    required={!editingUser}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: '#f1f5f9',
                      fontSize: '15px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    placeholder={editingUser ? '••••••••' : 'Ingrese contraseña'}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label style={{ display: 'block', color: 'rgba(148, 163, 184, 0.9)', fontSize: '13px', fontWeight: '500', marginBottom: '8px' }}>
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: '#f1f5f9',
                      fontSize: '15px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Número de teléfono"
                  />
                </div>

                {/* Role & Status Row */}
                <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', color: 'rgba(148, 163, 184, 0.9)', fontSize: '13px', fontWeight: '500', marginBottom: '8px' }}>
                      Rol *
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        color: '#f1f5f9',
                        fontSize: '15px',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="DRIVER">Conductor</option>
                      <option value="DISPATCHER">Despachador</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', color: 'rgba(148, 163, 184, 0.9)', fontSize: '13px', fontWeight: '500', marginBottom: '8px' }}>
                      Estado
                    </label>
                    <select
                      value={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        color: '#f1f5f9',
                        fontSize: '15px',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="true">Activo</option>
                      <option value="false">Inactivo</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end" style={{ marginTop: '32px', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '14px 24px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: 'rgba(148, 163, 184, 0.9)',
                    fontSize: '15px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '14px 28px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #22d3ee 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)'
                  }}
                >
                  {editingUser ? 'Actualizar Usuario' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
