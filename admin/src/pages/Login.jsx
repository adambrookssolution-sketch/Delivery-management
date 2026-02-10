import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success('Bienvenido!');
      navigate('/');
    } catch (error) {
      const message = error.response?.data?.message || 'Error al iniciar sesión';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
        padding: '48px 24px'
      }}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute rounded-full blur-3xl"
          style={{
            top: '-160px',
            right: '-160px',
            width: '384px',
            height: '384px',
            background: 'rgba(59, 130, 246, 0.2)'
          }}
        />
        <div
          className="absolute rounded-full blur-3xl"
          style={{
            bottom: '-160px',
            left: '-160px',
            width: '384px',
            height: '384px',
            background: 'rgba(139, 92, 246, 0.2)'
          }}
        />
      </div>

      {/* Main card */}
      <div className="w-full relative z-10" style={{ maxWidth: '440px' }}>
        {/* Glass card effect */}
        <div
          className="rounded-3xl shadow-2xl"
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            padding: '56px 48px'
          }}
        >
          {/* Logo and title */}
          <div className="text-center" style={{ marginBottom: '48px' }}>
            <div
              className="inline-flex items-center justify-center rounded-2xl shadow-xl"
              style={{
                width: '72px',
                height: '72px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #22d3ee 100%)',
                boxShadow: '0 20px 40px rgba(59, 130, 246, 0.3)',
                marginBottom: '24px'
              }}
            >
              <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
            </div>
            <h1
              className="font-bold text-white"
              style={{ fontSize: '28px', marginBottom: '8px', letterSpacing: '-0.02em' }}
            >
              QuetzalEnvios
            </h1>
            <p style={{ color: 'rgba(191, 219, 254, 0.7)', fontSize: '14px' }}>
              Sistema de Gestión de Envíos
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Email field */}
            <div style={{ marginBottom: '24px' }}>
              <label
                className="block font-medium"
                style={{
                  color: 'rgba(219, 234, 254, 0.9)',
                  fontSize: '14px',
                  marginBottom: '12px',
                  marginLeft: '4px'
                }}
              >
                Correo Electrónico
              </label>
              <div className="relative">
                <div
                  className="absolute flex items-center pointer-events-none"
                  style={{ top: '50%', transform: 'translateY(-50%)', left: '20px' }}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ color: 'rgba(147, 197, 253, 0.4)' }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/>
                  </svg>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-white outline-none transition-all duration-300"
                  style={{
                    padding: '18px 20px 18px 56px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    fontSize: '15px'
                  }}
                  placeholder="admin@delivery.com"
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <div style={{ marginBottom: '32px' }}>
              <label
                className="block font-medium"
                style={{
                  color: 'rgba(219, 234, 254, 0.9)',
                  fontSize: '14px',
                  marginBottom: '12px',
                  marginLeft: '4px'
                }}
              >
                Contraseña
              </label>
              <div className="relative">
                <div
                  className="absolute flex items-center pointer-events-none"
                  style={{ top: '50%', transform: 'translateY(-50%)', left: '20px' }}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ color: 'rgba(147, 197, 253, 0.4)' }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-white outline-none transition-all duration-300"
                  style={{
                    padding: '18px 56px 18px 56px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    fontSize: '15px'
                  }}
                  placeholder="Ingrese su contraseña"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute transition-colors"
                  style={{
                    top: '50%',
                    transform: 'translateY(-50%)',
                    right: '20px',
                    color: 'rgba(147, 197, 253, 0.4)'
                  }}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                padding: '18px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #22d3ee 100%)',
                borderRadius: '16px',
                fontSize: '15px',
                boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)'
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Iniciando sesión...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Iniciar Sesión
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                  </svg>
                </span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative" style={{ margin: '40px 0' }}>
            <div
              className="absolute inset-0 flex items-center"
              style={{ top: '50%', transform: 'translateY(-50%)' }}
            >
              <div
                className="w-full"
                style={{ height: '1px', background: 'rgba(255, 255, 255, 0.1)' }}
              />
            </div>
            <div className="relative flex justify-center">
              <span
                style={{
                  padding: '0 16px',
                  background: 'rgba(26, 39, 68, 0.9)',
                  color: 'rgba(191, 219, 254, 0.4)',
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontWeight: '500'
                }}
              >
                Cuentas de Prueba
              </span>
            </div>
          </div>

          {/* Test credentials */}
          <div className="grid grid-cols-2" style={{ gap: '16px' }}>
            <button
              type="button"
              onClick={() => {
                setEmail('admin@delivery.com');
                setPassword('admin123');
              }}
              className="flex items-center transition-all duration-300"
              style={{
                gap: '12px',
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px'
              }}
            >
              <div
                className="flex-shrink-0 flex items-center justify-center rounded-xl"
                style={{
                  width: '44px',
                  height: '44px',
                  background: 'linear-gradient(135deg, #fbbf24 0%, #f97316 100%)',
                  boxShadow: '0 8px 20px rgba(249, 115, 22, 0.25)'
                }}
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
              </div>
              <div className="text-left min-w-0">
                <p className="text-white font-semibold" style={{ fontSize: '14px' }}>Admin</p>
                <p style={{ color: 'rgba(191, 219, 254, 0.35)', fontSize: '12px' }}>admin@...</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('dispatcher@delivery.com');
                setPassword('dispatcher123');
              }}
              className="flex items-center transition-all duration-300"
              style={{
                gap: '12px',
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px'
              }}
            >
              <div
                className="flex-shrink-0 flex items-center justify-center rounded-xl"
                style={{
                  width: '44px',
                  height: '44px',
                  background: 'linear-gradient(135deg, #34d399 0%, #14b8a6 100%)',
                  boxShadow: '0 8px 20px rgba(20, 184, 166, 0.25)'
                }}
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
              </div>
              <div className="text-left min-w-0">
                <p className="text-white font-semibold" style={{ fontSize: '14px' }}>Despachador</p>
                <p style={{ color: 'rgba(191, 219, 254, 0.35)', fontSize: '12px' }}>dispatcher@...</p>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <p
          className="text-center"
          style={{
            color: 'rgba(191, 219, 254, 0.3)',
            fontSize: '12px',
            marginTop: '32px',
            letterSpacing: '0.02em'
          }}
        >
          Plataforma segura de gestión de envíos
        </p>
      </div>
    </div>
  );
};

export default Login;
